"use client";

import { useState } from "react";
import Link from "next/link";

import AssetCard, { type Asset } from "@/components/AssetCard";
import { RoleAccessNotice } from "@/components/RoleAccessNotice";
import { FormField, FormSelect, FormTextarea } from "@/components/FormFields";
import { useAuth } from "@/context/AuthContext";
import { useApiFetch } from "@/hooks/useApiFetch";
import { validateAssetForm, isFormValid, type ValidationErrors } from "@/lib/assetValidation";
import {
  ASSET_TYPES,
  BUSINESS_STATUSES,
  BUSINESS_TYPES,
  type AssetForm,
  type AssetType,
  type BusinessStatus,
  type BusinessType,
} from "@/types/asset";

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
  const [errors, setErrors] = useState<ValidationErrors>({});
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
    setErrors({});
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
    setErrors({});
    setShowModal(true);
  }

  function updateFormField<K extends keyof AssetForm>(field: K, value: AssetForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  async function saveAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || user.role !== "SELLER") return;

    // Validate form before submission
    const formErrors = validateAssetForm(form);
    if (!isFormValid(formErrors)) {
      setErrors(formErrors);
      return;
    }

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
    setErrors({});
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
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/seller/buyers"
            className="rounded-xl border border-emerald-600 px-5 py-3 font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Browse Buyers
          </Link>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Publish New Asset
          </button>
        </div>
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
              <FormField
                label="Title"
                name="title"
                value={form.title}
                onChange={(value) => updateFormField("title", value)}
                error={errors.title}
                required
                placeholder="Asset title"
              />
              <FormField
                label="Country"
                name="country"
                value={form.country}
                onChange={(value) => updateFormField("country", value)}
                error={errors.country}
                required
                placeholder="e.g., Canada, Brazil, Spain"
              />
              <FormField
                label="Price"
                name="askingPrice"
                type="number"
                value={form.askingPrice}
                onChange={(value) => updateFormField("askingPrice", value)}
                error={errors.askingPrice}
                required
                placeholder="0"
              />
              <FormField
                label="Currency"
                name="currency"
                value={form.currency}
                onChange={(value) => updateFormField("currency", value)}
                error={errors.currency}
                required
              />
              <FormSelect
                label="Business Type"
                name="typeOfBusiness"
                value={form.typeOfBusiness}
                onChange={(value) => updateFormField("typeOfBusiness", value as BusinessType)}
                options={BUSINESS_TYPES.map((type) => ({ value: type, label: type }))}
                error={errors.typeOfBusiness}
                required
              />
              <FormSelect
                label="Asset Type"
                name="assetType"
                value={form.assetType}
                onChange={(value) => updateFormField("assetType", value as AssetType)}
                options={ASSET_TYPES.map((type) => ({ value: type, label: type }))}
                error={errors.assetType}
                required
              />
              <FormSelect
                label="Business Status"
                name="businessStatus"
                value={form.businessStatus}
                onChange={(value) => updateFormField("businessStatus", value as BusinessStatus)}
                options={BUSINESS_STATUSES.map((status) => ({ value: status, label: status }))}
                error={errors.businessStatus}
                required
              />
              <FormField
                label="Type of License"
                name="typeOfLicense"
                value={form.typeOfLicense}
                onChange={(value) => updateFormField("typeOfLicense", value)}
                error={errors.typeOfLicense}
                placeholder="e.g., MSB, PI, EMI"
              />
              <FormField
                label="Regulatory"
                name="regulatory"
                value={form.regulatory}
                onChange={(value) => updateFormField("regulatory", value)}
                error={errors.regulatory}
                placeholder="e.g., FINTRAC regulated"
              />
              <FormField
                label="Employees"
                name="employees"
                type="number"
                value={form.employees}
                onChange={(value) => updateFormField("employees", value)}
                error={errors.employees}
                placeholder="0"
              />
              <FormField
                label="Year of Issue"
                name="yearOfIssue"
                type="number"
                value={form.yearOfIssue}
                onChange={(value) => updateFormField("yearOfIssue", value)}
                error={errors.yearOfIssue}
                placeholder={String(new Date().getFullYear())}
              />
              <FormTextarea
                label="Description"
                name="descriptionShort"
                value={form.descriptionShort}
                onChange={(value) => updateFormField("descriptionShort", value)}
                error={errors.descriptionShort}
                required
                placeholder="Describe the asset in detail (10-500 characters)"
                rows={3}
              />
              <div className="flex justify-end gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Object.keys(errors).length > 0}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed"
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
