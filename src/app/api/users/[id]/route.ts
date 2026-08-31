import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = requireRole(request, "MANAGER");
  if (authorization.response) return authorization.response;

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status: user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" },
  });

  return NextResponse.json({ ...updatedUser, name: updatedUser.email.split("@")[0] });
}
