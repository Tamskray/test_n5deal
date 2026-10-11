"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const navigationItems = [
    { href: "/all-listing", label: "All Listings" },
    { href: "/check-icons", label: "Icons" },
    { href: "/react-test", label: "Test" },
    { href: "/dashboard/buyer", label: "Buyer" },
    { href: "/dashboard/seller", label: "Seller" },
    { href: "/dashboard/manager", label: "Manager" },
  ];

  return (
    <header className="bg-transparent px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="shrink-0 px-2 text-lg font-bold tracking-tight text-slate-900">
            Test
          </Link>
          <nav className="hidden items-center gap-1 rounded-full bg-slate-50 p-1 text-sm md:flex">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const colorClass =
                item.label === "Seller"
                  ? "text-emerald-600"
                  : item.label === "Buyer"
                    ? "text-blue-600"
                    : item.label === "Manager"
                      ? "text-violet-600"
                      : "text-slate-700";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full px-3 py-2 font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : `${colorClass} hover:bg-white hover:text-slate-900`
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden text-right text-sm sm:block">
              <p className="font-medium text-slate-900">{user.name}</p>
              <p className="text-slate-500">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
