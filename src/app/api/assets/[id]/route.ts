import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getRequestUser, requireRole } from "@/lib/apiAuth";

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
  const updatedAsset = await prisma.asset.update({
    where: { id },
    data: {
      descriptionShort: String(body.descriptionShort ?? body.title ?? asset.descriptionShort),
      country: String(body.country ?? asset.country),
      askingPrice: Number(body.askingPrice ?? asset.askingPrice),
      typeOfBusiness: String(body.typeOfBusiness ?? asset.typeOfBusiness),
      businessStatus: String(body.businessStatus ?? asset.businessStatus),
      typeOfLicense: String(body.typeOfLicense ?? asset.typeOfLicense),
      assetType: String(body.assetType ?? asset.assetType),
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
