"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";

import AssetCard, { type Asset } from "@/components/AssetCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useAuth } from "@/context/AuthContext";
import { useApiFetch } from "@/hooks/useApiFetch";

import { getAssetBreadcrumbs } from "./constants";

function AssetDetailPageContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messageNotice, setMessageNotice] = useState("");
  const [messageError, setMessageError] = useState("");
  const [hasPreviousInquiry, setHasPreviousInquiry] = useState(false);
  const [previousInquiryAssetId, setPreviousInquiryAssetId] = useState<string | null>(null);
  const fromSeller = searchParams.get("from") === "seller";
  const {
    data: asset,
    loading,
    error,
  } = useApiFetch<Asset>(`/api/assets/${id}`, [id], { enabled: Boolean(id) });

  useEffect(() => {
    if (!asset?.id || user?.role !== "BUYER") {
      return;
    }

    let active = true;

    fetch(`/api/messages?userId=${encodeURIComponent(user.id)}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((messages: Array<{ senderId: string; assetId: string | null }>) => {
        if (!active) return;
        const hasInquiry = messages.some(
          (item) => item.senderId === user.id && item.assetId === asset.id,
        );
        setHasPreviousInquiry(hasInquiry);
        setPreviousInquiryAssetId(asset.id);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [asset?.id, user?.id, user?.role]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!asset || !user || !message.trim() || !asset.seller?.user?.id) return;

    setSending(true);
    setMessageNotice("");
    setMessageError("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: asset.seller.user.id,
          assetId: asset.id,
          content: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to send your inquiry.");
      }

      setMessage("");
      setHasPreviousInquiry(true);
      setPreviousInquiryAssetId(asset.id);
      setMessageNotice("Your inquiry has been sent to the seller.");
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : "Unable to send your inquiry.");
    } finally {
      setSending(false);
    }
  }

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

      {user?.role === "BUYER" ? (
        <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
              Buyer inquiry
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Message the seller</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ask a question about this asset and continue the conversation from your buyer
              dashboard.
            </p>
          </div>
          <form onSubmit={sendMessage} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Your message
              <textarea
                required
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about licensing, client base, or the transaction process..."
                className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={sending || !asset.seller?.user?.id}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send inquiry"}
              </button>
              {messageNotice ? (
                <p role="status" className="text-sm font-medium text-emerald-700">
                  {messageNotice}
                </p>
              ) : null}
              {messageError ? (
                <p role="alert" className="text-sm font-medium text-rose-700">
                  {messageError}
                </p>
              ) : null}
            </div>
            {hasPreviousInquiry && previousInquiryAssetId === asset.id ? (
              <Link
                href="/dashboard/buyer#messages"
                className="inline-flex text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
              >
                View your messages about this asset
              </Link>
            ) : null}
          </form>
        </section>
      ) : null}
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
