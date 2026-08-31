import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "newest";
  const currency = searchParams.get("currency") ?? "EUR";

  const where = currency ? { currency } : {};

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
