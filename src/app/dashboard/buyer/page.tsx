"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function BuyerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== "BUYER") {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user || user.role !== "BUYER") {
    return null;
  }

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
