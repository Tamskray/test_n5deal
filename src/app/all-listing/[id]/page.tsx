"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import AssetCard, { type Asset } from "@/components/AssetCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useApiFetch } from "@/hooks/useApiFetch";

import { getAssetBreadcrumbs } from "./constants";

function AssetDetailPageContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const fromSeller = searchParams.get("from") === "seller";
  const {
    data: asset,
    loading,
    error,
  } = useApiFetch<Asset>(`/api/assets/${id}`, [id], { enabled: Boolean(id) });

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Loading asset...
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="space-y-4">
        <Link
          href={fromSeller ? "/dashboard/seller" : "/all-listing"}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {fromSeller ? "Back to seller dashboard" : "Back to all listings"}
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center text-rose-700">
          Asset not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={getAssetBreadcrumbs(asset.id, fromSeller)} />

      <h1 className="text-2xl font-semibold text-slate-900">Asset #{asset.id.slice(-4)}</h1>

      <AssetCard asset={asset} displayCurrency={asset.currency} showShareButton />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
          <span className="text-2xl text-blue-600" aria-hidden="true">
            ▣
          </span>
          <div>
            <p className="text-sm font-medium text-slate-500">Company Information</p>
            <h2 className="text-2xl font-semibold text-slate-900">Overview</h2>
          </div>
        </div>

        {asset.company ? (
          <div className="space-y-6 text-slate-700">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{asset.company.name}</h3>
              <p className="mt-2 leading-7">{asset.company.overviewText}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Account Details
              </h3>
              <p className="mt-2 leading-7">{asset.company.accountDetails}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500">No company information is available for this asset.</p>
        )}
      </section>
    </div>
  );
}

export default function AssetDetailPage() {
  return (
    <Suspense fallback={<div className="h-96 rounded-2xl bg-white" />}>
      <AssetDetailPageContent />
    </Suspense>
  );
}
