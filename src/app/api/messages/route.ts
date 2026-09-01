import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const messageInclude = {
  sender: { include: { buyer: true, seller: true } },
  receiver: { include: { buyer: true, seller: true } },
  asset: {
    select: {
      id: true,
      descriptionShort: true,
      country: true,
      typeOfLicense: true,
      company: { select: { name: true } },
    },
  },
};

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: messageInclude,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    senderId?: string;
    receiverId?: string;
    content?: string;
    assetId?: string | null;
  };
  const senderId = body.senderId?.trim();
  const receiverId = body.receiverId?.trim();
  const content = body.content?.trim();

  if (!senderId || !receiverId || !content) {
    return NextResponse.json(
      { error: "senderId, receiverId, and content are required" },
      { status: 400 },
    );
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      content,
      assetId: body.assetId?.trim() || null,
    },
    include: messageInclude,
  });

  return NextResponse.json(message, { status: 201 });
}
