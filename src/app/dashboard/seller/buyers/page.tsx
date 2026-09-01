"use client";

import { useState, type FormEvent } from "react";

import { RoleAccessNotice } from "@/components/RoleAccessNotice";
import { useAuth } from "@/context/AuthContext";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useDebounce } from "@/hooks/useDebounce";

type Buyer = {
  id: string;
  contactName: string;
  companyName: string | null;
  investmentInterests: string | null;
  user: { id: string };
};

type SellerAsset = {
  id: string;
  descriptionShort: string;
  country: string;
  typeOfLicense: string;
};

export default function SellerBuyersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [assets, setAssets] = useState<SellerAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const {
    data: buyers,
    loading: buyersLoading,
    error: buyersError,
  } = useApiFetch<Buyer[]>(
    `/api/buyers?search=${encodeURIComponent(debouncedSearch)}`,
    [debouncedSearch, user?.role],
    {
      defaultValue: [],
      enabled: user?.role === "SELLER",
    },
  );
  const buyerList = buyers ?? [];

  async function openContactModal(buyer: Buyer) {
    if (!user) return;
    setSelectedBuyer(buyer);
    setAssets([]);
    setAssetId("");
    setContent("");
    setNotice("");
    setError("");
    setAssetsLoading(true);

    try {
      const response = await fetch(
        `/api/assets?sellerUserId=${encodeURIComponent(user.id)}&currency=`,
      );
      if (!response.ok) throw new Error("Unable to load your assets.");
      setAssets(await response.json());
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load your assets.");
    } finally {
      setAssetsLoading(false);
    }
  }

  function closeContactModal() {
    if (sending) return;
    setSelectedBuyer(null);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !selectedBuyer || !content.trim()) return;

    setSending(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedBuyer.user.id,
          content: content.trim(),
          assetId: assetId || null,
        }),
      });
      if (!response.ok) throw new Error("Unable to send your message.");
      setNotice("Message sent successfully.");
      setContent("");
      setSelectedBuyer(null);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send your message.");
    } finally {
      setSending(false);
    }
  }

  if (!user || user.role !== "SELLER") return <RoleAccessNotice requiredRole="SELLER" />;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Seller workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Buyer Directory</h1>
        <p className="mt-2 text-slate-600">Find qualified buyers and start a conversation.</p>
      </header>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <label className="block max-w-xl text-sm font-semibold text-slate-700">
          Search buyers
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company or investment interest"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        {buyersLoading ? (
          <p className="py-10 text-center text-slate-500">Loading buyers...</p>
        ) : buyersError ? (
          <p className="py-10 text-center text-rose-600">Failed to load the buyer directory.</p>
        ) : buyerList.length === 0 ? (
          <p className="py-10 text-center text-slate-500">No buyers match your search.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {buyerList.map((buyer) => (
              <article
                key={buyer.id}
                className="flex flex-col rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900">{buyer.contactName}</h2>
                  <p className="mt-1 text-sm font-medium text-emerald-700">
                    {buyer.companyName ?? "Independent buyer"}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {buyer.investmentInterests ?? "No investment interests listed."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openContactModal(buyer)}
                  className="mt-5 self-start rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Contact Buyer
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {!selectedBuyer && notice ? (
        <p
          role="status"
          className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg"
        >
          {notice}
        </p>
      ) : null}

      {selectedBuyer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-buyer-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
                  New message
                </p>
                <h2 id="contact-buyer-title" className="mt-1 text-xl font-semibold text-slate-900">
                  Contact {selectedBuyer.contactName}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeContactModal}
                className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="Close contact buyer modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={sendMessage} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Attach an asset
                <select
                  value={assetId}
                  onChange={(event) => setAssetId(event.target.value)}
                  disabled={assetsLoading || assets.length === 0}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                >
                  <option value="">No specific asset</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.descriptionShort} · {asset.country} · {asset.typeOfLicense}
                    </option>
                  ))}
                </select>
                {assetsLoading ? (
                  <span className="mt-1 block text-xs text-slate-500">Loading your assets...</span>
                ) : null}
                {!assetsLoading && assets.length === 0 ? (
                  <span className="mt-1 block text-xs text-slate-500">
                    You have no published assets yet.
                  </span>
                ) : null}
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Message
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Introduce your business or share an opportunity..."
                  className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              {notice ? (
                <p role="status" className="text-sm font-medium text-emerald-700">
                  {notice}
                </p>
              ) : null}
              {error ? (
                <p role="alert" className="text-sm font-medium text-rose-700">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeContactModal}
                  disabled={sending}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send message"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
