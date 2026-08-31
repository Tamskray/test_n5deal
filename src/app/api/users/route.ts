import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

function withDisplayName<T extends { email: string }>(user: T) {
  return { ...user, name: user.email.split("@")[0] };
}

export async function GET(request: Request) {
  const authorization = requireRole(request, "MANAGER");
  if (authorization.response) return authorization.response;

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(users.map(withDisplayName));
}
