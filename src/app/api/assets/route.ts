import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "newest";
  const search = searchParams.get("search")?.trim() ?? "";
  const businessType = searchParams.get("tab")?.trim() ?? "";
  const currency = searchParams.get("currency") ?? "EUR";

  const where = {
    ...(currency ? { currency } : {}),
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
