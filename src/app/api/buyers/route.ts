import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const search = new URL(request.url).searchParams.get("search")?.trim().toLowerCase() ?? "";
  const buyers = await prisma.buyer.findMany({
    include: { user: { select: { id: true } } },
    orderBy: { contactName: "asc" },
  });

  const filteredBuyers = search
    ? buyers.filter((buyer) =>
        [buyer.contactName, buyer.investmentInterests, buyer.companyName]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(search)),
      )
    : buyers;

  return NextResponse.json(filteredBuyers);
}
