"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { type AppUser, useAuth } from "@/context/AuthContext";

const demoUsers: Record<string, AppUser> = {
  buyer: {
    id: "demo-buyer",
    name: "Demo Buyer",
    role: "BUYER",
    status: "ACTIVE",
  },
  seller: {
    id: "demo-seller",
    name: "Demo Seller",
    role: "SELLER",
    status: "ACTIVE",
  },
  manager: {
    id: "demo-manager",
    name: "Demo Manager",
    role: "MANAGER",
    status: "ACTIVE",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = (role: keyof typeof demoUsers) => {
    const user = demoUsers[role];
    login(user);
    router.push(
      role === "buyer"
        ? "/dashboard/buyer"
        : role === "seller"
          ? "/dashboard/seller"
          : "/dashboard/manager",
    );
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Access</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Login</h1>
      <p className="mt-3 text-slate-600">Choose a demo account to simulate a user session.</p>

      <div className="mt-8 space-y-4">
        <button
          type="button"
          onClick={() => handleLogin("buyer")}
          className="w-full rounded-xl bg-sky-600 px-4 py-3 text-left text-base font-medium text-white transition hover:bg-sky-500"
        >
          Login as Demo Buyer
        </button>
        <button
          type="button"
          onClick={() => handleLogin("seller")}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-left text-base font-medium text-white transition hover:bg-emerald-500"
        >
          Login as Demo Seller
        </button>
        <button
          type="button"
          onClick={() => handleLogin("manager")}
          className="w-full rounded-xl bg-violet-600 px-4 py-3 text-left text-base font-medium text-white transition hover:bg-violet-500"
        >
          Login as Demo Manager
        </button>
      </div>

      <div className="mt-8 text-sm text-slate-600">
        <Link
          href="/all-listing"
          className="font-medium text-slate-900 underline underline-offset-4"
        >
          Continue as guest
        </Link>
      </div>
    </div>
  );
}
