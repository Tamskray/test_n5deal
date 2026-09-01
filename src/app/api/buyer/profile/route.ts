import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const buyer = await prisma.buyer.findUnique({ where: { userId } });

  if (!buyer) {
    return NextResponse.json({ error: "Buyer profile not found" }, { status: 404 });
  }

  return NextResponse.json(buyer);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    userId?: string;
    contactName?: string;
    companyName?: string | null;
    investmentInterests?: string | null;
  };
  const userId = body.userId?.trim();
  const contactName = body.contactName?.trim();

  if (!userId || !contactName) {
    return NextResponse.json({ error: "userId and contactName are required" }, { status: 400 });
  }

  const buyer = await prisma.buyer.update({
    where: { userId },
    data: {
      contactName,
      companyName: body.companyName?.trim() || null,
      investmentInterests: body.investmentInterests?.trim() || null,
    },
  });

  return NextResponse.json(buyer);
}
