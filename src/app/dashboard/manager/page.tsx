"use client";

import { useMemo, useState } from "react";

import { RoleAccessNotice } from "@/components/RoleAccessNotice";
import SearchInput from "@/components/SearchInput";
import { useAuth, type UserRole, type UserStatus } from "@/context/AuthContext";
import { useApiFetch } from "@/hooks/useApiFetch";

type ManagedUser = { id: string; name: string; email: string; role: UserRole; status: UserStatus };
type ManagedAsset = {
  id: string;
  descriptionShort: string;
  askingPrice: number;
  currency: string;
  company?: { name: string } | null;
};

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const authHeaders = user
    ? { "x-mock-user-id": user.id, "x-mock-user-role": user.role }
    : undefined;
  const { data: users, loading: usersLoading } = useApiFetch<ManagedUser[]>(
    "/api/users",
    [refreshKey, user?.id],
    { enabled: user?.role === "MANAGER", headers: authHeaders },
  );
  const { data: assets, loading: assetsLoading } = useApiFetch<ManagedAsset[]>(
    "/api/assets?currency=",
    [refreshKey],
  );

  const visibleUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();

    return (users ?? []).filter((managedUser) => {
      const matchesRole = roleFilter === "ALL" || managedUser.role === roleFilter;
      const matchesSearch =
        search === "" ||
        [managedUser.name, managedUser.email, managedUser.role, managedUser.status].some(
          (value) => value.toLowerCase().includes(search),
        );

      return matchesRole && matchesSearch;
    });
  }, [roleFilter, userSearch, users]);

  const visibleAssets = useMemo(() => {
    const search = assetSearch.trim().toLowerCase();

    return (assets ?? []).filter(
      (asset) =>
        search === "" ||
        [asset.descriptionShort, asset.company?.name, asset.currency].some(
          (value) => value?.toLowerCase().includes(search),
        ),
    );
  }, [assetSearch, assets]);

  async function toggleUserStatus(id: string) {
    await fetch(`/api/users/${id}`, { method: "PATCH", headers: authHeaders });
    setRefreshKey((value) => value + 1);
  }

  async function removeAsset(id: string) {
    if (!window.confirm("Remove this asset from the marketplace?")) return;
    await fetch(`/api/assets/${id}`, { method: "DELETE", headers: authHeaders });
    setRefreshKey((value) => value + 1);
  }

  if (!user || user.role !== "MANAGER") return <RoleAccessNotice requiredRole="MANAGER" />;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Platform Manager</h1>
        <p className="mt-2 text-slate-600">Manage users and marketplace inventory.</p>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
          <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search users"
              ariaLabel="Search users"
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="ALL">All roles</option>
              <option value="BUYER">Buyers</option>
              <option value="SELLER">Sellers</option>
              <option value="MANAGER">Managers</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : (
                visibleUsers.map((managedUser) => (
                  <tr key={managedUser.id}>
                    <td className="px-5 py-4 font-medium text-slate-900">{managedUser.name}</td>
                    <td className="px-5 py-4 text-slate-600">{managedUser.email}</td>
                    <td className="px-5 py-4 text-slate-600">{managedUser.role}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${managedUser.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                      >
                        {managedUser.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(managedUser.id)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {managedUser.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
          <h2 className="text-xl font-semibold text-slate-900">Marketplace Assets</h2>
          <SearchInput
            value={assetSearch}
            onChange={(event) => setAssetSearch(event.target.value)}
            placeholder="Search assets"
            ariaLabel="Search assets"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-162.5 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assetsLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                    Loading assets...
                  </td>
                </tr>
              ) : (
                visibleAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {asset.descriptionShort}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {asset.company?.name ?? "Unassigned"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: asset.currency,
                      }).format(asset.askingPrice)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => removeAsset(asset.id)}
                        className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
