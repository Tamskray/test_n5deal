"use client";

import { useState } from "react";

import AssetCard, { type Asset } from "@/components/AssetCard";
import { RoleAccessNotice } from "@/components/RoleAccessNotice";
import { useAuth } from "@/context/AuthContext";
import { useApiFetch } from "@/hooks/useApiFetch";
import {
  ASSET_TYPES,
  BUSINESS_STATUSES,
  BUSINESS_TYPES,
  type AssetType,
  type BusinessStatus,
  type BusinessType,
} from "@/types/asset";

type AssetForm = {
  title: string;
  descriptionShort: string;
  country: string;
  askingPrice: string;
  currency: string;
  typeOfBusiness: BusinessType | "";
  businessStatus: BusinessStatus;
  typeOfLicense: string;
  assetType: AssetType;
  regulatory: string;
  employees: string;
  yearOfIssue: string;
};

const emptyForm: AssetForm = {
  title: "",
  descriptionShort: "",
  country: "",
  askingPrice: "",
  currency: "EUR",
  typeOfBusiness: "",
  businessStatus: "Active",
  typeOfLicense: "",
  assetType: "Active Business (Licensed)",
  regulatory: "",
  employees: "",
  yearOfIssue: "",
};

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const {
    data: assets,
    loading,
    error,
  } = useApiFetch<Asset[]>(
    `/api/assets?sellerUserId=${user?.id ?? ""}&currency=`,
    [refreshKey, user?.id],
    {
      enabled: user?.role === "SELLER",
      headers: user ? { "x-mock-user-id": user.id, "x-mock-user-role": user.role } : undefined,
    },
  );

  function openCreateModal() {
    setEditingAsset(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(asset: Asset) {
    setEditingAsset(asset);
    setForm({
      title: asset.descriptionShort,
      descriptionShort: asset.descriptionShort,
      country: asset.country,
      askingPrice: String(asset.askingPrice),
      currency: asset.currency,
      typeOfBusiness: asset.typeOfBusiness,
      businessStatus: asset.businessStatus,
      typeOfLicense: asset.typeOfLicense,
      assetType: asset.assetType,
      regulatory: asset.regulatory ?? "",
      employees: asset.employees ?? "",
      yearOfIssue: asset.yearOfIssue ?? "",
    });
    setShowModal(true);
  }

  async function saveAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || user.role !== "SELLER") return;

    const response = await fetch(editingAsset ? `/api/assets/${editingAsset.id}` : "/api/assets", {
      method: editingAsset ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        "x-mock-user-id": user.id,
        "x-mock-user-role": user.role,
      },
      body: JSON.stringify({
        ...form,
        askingPrice: Number(form.askingPrice),
        sellerUserId: user?.id,
      }),
    });

    if (!response.ok) return;
    setForm(emptyForm);
    setShowModal(false);
    setRefreshKey((value) => value + 1);
  }

  async function deleteAsset(asset: Asset) {
    if (!user || user.role !== "SELLER") return;
    if (!window.confirm(`Delete ${asset.descriptionShort}?`)) return;
    await fetch(`/api/assets/${asset.id}`, {
      method: "DELETE",
      headers: { "x-mock-user-id": user.id, "x-mock-user-role": user.role },
    });
    setRefreshKey((value) => value + 1);
  }

  if (!user || user.role !== "SELLER") return <RoleAccessNotice requiredRole="SELLER" />;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Seller Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Welcome back, {user.name}. Manage your marketplace assets.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Publish New Asset
        </button>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold text-slate-900">My Assets</h2>
        {loading ? (
          <p className="py-8 text-center text-slate-500">Loading assets...</p>
        ) : error ? (
          <p className="py-8 text-center text-rose-600">Failed to load assets.</p>
        ) : assets?.length ? (
          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.id} className="space-y-2">
                <AssetCard asset={asset} viewAssetHref={`/all-listing/${asset.id}?from=seller`} />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(asset)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAsset(asset)}
                    className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-slate-500">You have not published any assets yet.</p>
        )}
      </section>
      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-asset-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="publish-asset-title" className="text-xl font-semibold text-slate-900">
                {editingAsset ? "Edit Asset" : "Publish New Asset"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-2xl text-slate-400 hover:text-slate-700"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={saveAsset} className="mt-6 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["title", "Title"],
                  ["country", "Country"],
                  ["askingPrice", "Price"],
                  ["currency", "Currency"],
                  ["typeOfLicense", "Type of License"],
                  ["regulatory", "Regulatory"],
                  ["employees", "Employees"],
                  ["yearOfIssue", "Year of Issue"],
                ] as const
              ).map(([name, label]) => (
                <label key={name} className="text-sm font-medium text-slate-700">
                  {label}
                  <input
                    required={["title", "country", "askingPrice", "typeOfBusiness"].includes(name)}
                    type={
                      name === "askingPrice" || name === "employees" || name === "yearOfIssue"
                        ? "number"
                        : "text"
                    }
                    value={form[name]}
                    onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500"
                  />
                </label>
              ))}
              <label className="text-sm font-medium text-slate-700">
                Business Type
                <select
                  required
                  value={form.typeOfBusiness}
                  onChange={(event) =>
                    setForm({ ...form, typeOfBusiness: event.target.value as BusinessType })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select a business type
                  </option>
                  {BUSINESS_TYPES.map((businessType) => (
                    <option key={businessType} value={businessType}>
                      {businessType}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Asset Type
                <select
                  value={form.assetType}
                  onChange={(event) =>
                    setForm({ ...form, assetType: event.target.value as AssetType })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-blue-500"
                >
                  {ASSET_TYPES.map((assetType) => (
                    <option key={assetType} value={assetType}>
                      {assetType}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Business Status
                <select
                  value={form.businessStatus}
                  onChange={(event) =>
                    setForm({ ...form, businessStatus: event.target.value as BusinessStatus })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-blue-500"
                >
                  {BUSINESS_STATUSES.map((businessStatus) => (
                    <option key={businessStatus} value={businessStatus}>
                      {businessStatus}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Description
                <textarea
                  value={form.descriptionShort}
                  onChange={(event) => setForm({ ...form, descriptionShort: event.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                />
              </label>
              <div className="flex justify-end gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
                >
                  {editingAsset ? "Save Changes" : "Publish Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
