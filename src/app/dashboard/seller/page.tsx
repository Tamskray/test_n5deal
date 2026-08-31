"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== "SELLER") {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user || user.role !== "SELLER") {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Dashboard</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Seller Dashboard</h1>
      <p className="mt-3 text-slate-600">
        Welcome back, {user.name}. Your seller tools are available.
      </p>
    </div>
  );
}
