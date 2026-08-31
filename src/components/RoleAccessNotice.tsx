"use client";

import { useRouter } from "next/navigation";

import { type AppUser, useAuth, type UserRole } from "@/context/AuthContext";

const demoUsers: Record<UserRole, AppUser> = {
  BUYER: { id: "demo-buyer", name: "Demo Buyer", role: "BUYER", status: "ACTIVE" },
  SELLER: { id: "demo-seller", name: "Demo Seller", role: "SELLER", status: "ACTIVE" },
  MANAGER: { id: "demo-manager", name: "Demo Manager", role: "MANAGER", status: "ACTIVE" },
};

const dashboardPaths: Record<UserRole, string> = {
  BUYER: "/dashboard/buyer",
  SELLER: "/dashboard/seller",
  MANAGER: "/dashboard/manager",
};

export function RoleAccessNotice({ requiredRole }: { requiredRole: UserRole }) {
  const router = useRouter();
  const { user, login } = useAuth();

  if (user) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Access restricted
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          You do not have access to this page.
        </h1>
        <p className="mt-2 text-slate-700">
          This dashboard is available only to {requiredRole.toLowerCase()} users.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        Sign in required
      </p>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Choose a demo account</h1>
      <p className="mt-2 text-slate-600">Log in to access this dashboard.</p>
      <div className="mt-6 space-y-3">
        {(Object.keys(demoUsers) as UserRole[]).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => {
              login(demoUsers[role]);
              router.push(dashboardPaths[role]);
            }}
            className={`w-full rounded-xl px-4 py-3 text-left font-medium text-white transition ${
              role === "BUYER"
                ? "bg-sky-600 hover:bg-sky-500"
                : role === "SELLER"
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-violet-600 hover:bg-violet-500"
            }`}
          >
            Login as Demo {role.charAt(0) + role.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </section>
  );
}
