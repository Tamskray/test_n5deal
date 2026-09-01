import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";
import { ASSET_TYPES, BUSINESS_STATUSES, BUSINESS_TYPES } from "@/types/asset";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "newest";
  const search = searchParams.get("search")?.trim() ?? "";
  const businessType = searchParams.get("tab")?.trim() ?? "";
  const currency = searchParams.get("currency") ?? "EUR";
  const sellerUserId = searchParams.get("sellerUserId")?.trim() ?? "";
  const seller = sellerUserId
    ? ((await prisma.seller.findUnique({ where: { userId: sellerUserId } })) ??
      (sellerUserId === "demo-seller"
        ? await prisma.seller.findFirst({ where: { user: { role: "SELLER" } } })
        : null))
    : null;

  const where = {
    ...(currency ? { currency } : {}),
    ...(sellerUserId ? { sellerId: seller?.id ?? "__missing_seller__" } : {}),
    ...(businessType ? { typeOfBusiness: { contains: businessType } } : {}),
    ...(search
      ? {
          OR: [
            { descriptionShort: { contains: search } },
            { country: { contains: search } },
            { typeOfBusiness: { contains: search } },
            { typeOfLicense: { contains: search } },
            { assetType: { contains: search } },
          ],
        }
      : {}),
  };

  let orderBy: Record<string, "asc" | "desc"> = {
    dateListed: "desc",
  };

  if (sort === "priceAsc") {
    orderBy = { askingPrice: "asc" };
  }

  if (sort === "priceDesc") {
    orderBy = { askingPrice: "desc" };
  }

  if (sort === "popular") {
    orderBy = { views: "desc" };
  }

  const assets = await prisma.asset.findMany({
    where,
    include: {
      benefits: true,
      company: true,
      seller: {
        include: {
          user: true,
        },
      },
    },
    orderBy,
  });

  return NextResponse.json(assets);
}

export async function POST(request: Request) {
  const authorization = requireRole(request, "SELLER");
  if (authorization.response) return authorization.response;

  const body = (await request.json()) as {
    sellerUserId?: string;
    title?: string;
    descriptionShort?: string;
    country?: string;
    askingPrice?: number | string;
    currency?: string;
    typeOfBusiness?: string;
    typeOfLicense?: string;
    businessStatus?: string;
    assetType?: string;
    regulatory?: string;
    employees?: string;
    yearOfIssue?: string;
  };

  if (!body.title || !body.country || body.askingPrice === undefined || !body.typeOfBusiness) {
    return NextResponse.json({ error: "Missing required asset fields" }, { status: 400 });
  }

  if (
    !BUSINESS_TYPES.includes(body.typeOfBusiness as (typeof BUSINESS_TYPES)[number]) ||
    !BUSINESS_STATUSES.includes(body.businessStatus as (typeof BUSINESS_STATUSES)[number]) ||
    !ASSET_TYPES.includes(body.assetType as (typeof ASSET_TYPES)[number])
  ) {
    return NextResponse.json({ error: "Invalid asset field value" }, { status: 400 });
  }

  const seller =
    (await prisma.seller.findUnique({ where: { userId: authorization.user.id } })) ??
    (authorization.user.id === "demo-seller"
      ? await prisma.seller.findFirst({ where: { user: { role: "SELLER" } } })
      : null);

  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const asset = await prisma.asset.create({
    data: {
      descriptionShort: body.descriptionShort?.trim() || body.title.trim(),
      country: body.country.trim(),
      askingPrice: Number(body.askingPrice),
      currency: body.currency?.trim() || "EUR",
      typeOfBusiness: body.typeOfBusiness.trim(),
      typeOfLicense: body.typeOfLicense?.trim() || "Pending",
      businessStatus: body.businessStatus?.trim() || "Active",
      assetType: body.assetType?.trim() || "Active Business (Licensed)",
      regulatory: body.regulatory?.trim() || null,
      employees: body.employees?.trim() || null,
      yearOfIssue: body.yearOfIssue?.trim() || null,
      sellerId: seller.id,
    },
    include: { benefits: true, company: true },
  });

  return NextResponse.json(asset, { status: 201 });
}
