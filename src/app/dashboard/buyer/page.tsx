"use client";

import { RoleAccessNotice } from "@/components/RoleAccessNotice";
import { useAuth } from "@/context/AuthContext";

export default function BuyerDashboardPage() {
  const { user } = useAuth();

  if (!user || user.role !== "BUYER") return <RoleAccessNotice requiredRole="BUYER" />;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Dashboard</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Buyer Dashboard</h1>
      <p className="mt-3 text-slate-600">
        Welcome back, {user.name}. Your buyer workspace is ready.
      </p>
    </div>
  );
}
