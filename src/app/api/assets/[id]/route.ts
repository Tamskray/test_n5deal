import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getRequestUser, requireRole } from "@/lib/apiAuth";
import { ASSET_TYPES, BUSINESS_STATUSES, BUSINESS_TYPES } from "@/types/asset";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      benefits: true,
      company: true,
      seller: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  return NextResponse.json(asset);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = requireRole(request, "SELLER");
  if (authorization.response) return authorization.response;

  const { id } = await params;
  const asset = await prisma.asset.findUnique({ where: { id } });

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const seller =
    (await prisma.seller.findUnique({ where: { userId: authorization.user.id } })) ??
    (authorization.user.id === "demo-seller"
      ? await prisma.seller.findFirst({ where: { user: { role: "SELLER" } } })
      : null);

  if (!seller || asset.sellerId !== seller.id) {
    return NextResponse.json({ error: "You can only edit your own assets" }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, string | number | undefined>;
  const nextBusinessType = String(body.typeOfBusiness ?? asset.typeOfBusiness);
  const nextBusinessStatus = String(body.businessStatus ?? asset.businessStatus);
  const nextAssetType = String(body.assetType ?? asset.assetType);

  if (
    !BUSINESS_TYPES.includes(nextBusinessType as (typeof BUSINESS_TYPES)[number]) ||
    !BUSINESS_STATUSES.includes(nextBusinessStatus as (typeof BUSINESS_STATUSES)[number]) ||
    !ASSET_TYPES.includes(nextAssetType as (typeof ASSET_TYPES)[number])
  ) {
    return NextResponse.json({ error: "Invalid asset field value" }, { status: 400 });
  }

  const updatedAsset = await prisma.asset.update({
    where: { id },
    data: {
      descriptionShort: String(body.descriptionShort ?? body.title ?? asset.descriptionShort),
      country: String(body.country ?? asset.country),
      askingPrice: Number(body.askingPrice ?? asset.askingPrice),
      currency: String(body.currency ?? asset.currency),
      typeOfBusiness: nextBusinessType,
      businessStatus: nextBusinessStatus,
      typeOfLicense: String(body.typeOfLicense ?? asset.typeOfLicense),
      assetType: nextAssetType,
      regulatory:
        body.regulatory === undefined ? asset.regulatory : String(body.regulatory) || null,
      employees: body.employees === undefined ? asset.employees : String(body.employees) || null,
      yearOfIssue:
        body.yearOfIssue === undefined ? asset.yearOfIssue : String(body.yearOfIssue) || null,
    },
    include: { benefits: true, company: true },
  });

  return NextResponse.json(updatedAsset);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestUser = getRequestUser(request);
  if (!requestUser || !["SELLER", "MANAGER"].includes(requestUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const asset = await prisma.asset.findUnique({ where: { id } });

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  if (requestUser.role === "SELLER") {
    const seller =
      (await prisma.seller.findUnique({ where: { userId: requestUser.id } })) ??
      (requestUser.id === "demo-seller"
        ? await prisma.seller.findFirst({ where: { user: { role: "SELLER" } } })
        : null);

    if (!seller || asset.sellerId !== seller.id) {
      return NextResponse.json({ error: "You can only delete your own assets" }, { status: 403 });
    }
  }

  await prisma.asset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
