"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function ManagerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== "MANAGER") {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user || user.role !== "MANAGER") {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Dashboard</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Platform Manager Dashboard</h1>
      <p className="mt-3 text-slate-600">
        Welcome back, {user.name}. You can oversee marketplace operations.
      </p>
    </div>
  );
}
