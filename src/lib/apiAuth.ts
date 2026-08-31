import { NextResponse } from "next/server";

export type ApiRole = "BUYER" | "SELLER" | "MANAGER";

type RequestUser = {
  id: string;
  role: ApiRole;
};

export function getRequestUser(request: Request) {
  const id = request.headers.get("x-mock-user-id");
  const role = request.headers.get("x-mock-user-role") as ApiRole | null;

  if (!id || !role || !["BUYER", "SELLER", "MANAGER"].includes(role)) {
    return null;
  }

  return { id, role } satisfies RequestUser;
}

export function requireRole(request: Request, role: ApiRole) {
  const user = getRequestUser(request);

  if (!user || user.role !== role) {
    return {
      user: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, response: null };
}
