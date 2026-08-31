"use client";

import Link from "next/link";
import { useState } from "react";

type Benefit = {
  id: string;
  name: string;
};

type Seller = {
  id: string;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
};

type Company = {
  id: string;
  name: string;
  overviewText: string;
  accountDetails: string;
};

export type Asset = {
  id: string;
  descriptionShort: string;
  country: string;
  askingPrice: number;
  currency: string;
  typeOfBusiness: string;
  typeOfLicense: string;
  businessStatus: string;
  assetType: string;
  regulatory?: string | null;
  employees?: string | null;
  yearOfIssue?: string | null;
  isValidated: boolean;
  views: number;
  favorites: number;
  dateListed: string;
  seller?: Seller | null;
  company?: Company | null;
  benefits: Benefit[];
};

const currencyRates: Record<string, number> = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.85,
  JPY: 160,
  CHF: 0.96,
  INR: 90,
  CAD: 1.46,
};

function convertPrice(value: number, fromCurrency: string, toCurrency: string) {
  const from = (fromCurrency || "EUR").toUpperCase();
  const to = (toCurrency || "EUR").toUpperCase();

  if (from === to) {
    return value;
  }

  const baseRate = currencyRates[from] ?? 1;
  const targetRate = currencyRates[to] ?? 1;

  return (value / baseRate) * targetRate;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getFlagEmoji(country: string) {
  const normalized = country.toLowerCase();

  const flagMap: Record<string, string> = {
    canada: "🇨🇦",
    brazil: "🇧🇷",
    australia: "🇦🇺",
    uk: "🇬🇧",
    "united kingdom": "🇬🇧",
    england: "🇬🇧",
    germany: "🇩🇪",
    france: "🇫🇷",
    spain: "🇪🇸",
    portugal: "🇵🇹",
    mexico: "🇲🇽",
    india: "🇮🇳",
    usa: "🇺🇸",
    "united states": "🇺🇸",
  };

  return flagMap[normalized] ?? "🏳️";
}

export default function AssetCard({
  asset,
  displayCurrency = asset.currency,
  showShareButton = false,
  viewAssetHref,
}: {
  asset: Asset;
  displayCurrency?: string;
  showShareButton?: boolean;
  viewAssetHref?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const convertedPrice = convertPrice(asset.askingPrice, asset.currency, displayCurrency);

  async function copyAssetLink() {
    const assetUrl = `${window.location.origin}/all-listing/${asset.id}`;
    await navigator.clipboard.writeText(assetUrl);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1800);
  }

  return (
    <article className="rounded-xl border border-blue-100 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 sm:h-24 sm:w-36">
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100 text-5xl shadow-inner">
            {getFlagEmoji(asset.country)}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
              <span>Asset ID #{asset.id.slice(-4)}</span>
            </div>
            {asset.isValidated ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="text-sm">✓</span>
                Validated
              </span>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Country
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">{asset.country}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Type of License
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">{asset.typeOfLicense}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Type of Business
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">{asset.typeOfBusiness}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Business Status
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">{asset.businessStatus}</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/40 px-2 py-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Asking Price
              </p>
              <p className="mt-1 text-base font-semibold text-blue-600">
                {formatCurrency(convertedPrice, displayCurrency)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {asset.benefits.map((benefit) => (
              <span
                key={benefit.id}
                className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                {benefit.name}
              </span>
            ))}
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
            {asset.descriptionShort}
          </p>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
              <span>
                Date:{" "}
                {new Date(asset.dateListed).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="text-slate-300">|</span>
              <span>{asset.views} views</span>
              <span className="text-slate-300">|</span>
              <span>{asset.favorites} favorites</span>
            </div>

            <div className="flex items-center gap-2">
              {showShareButton ? (
                <button
                  type="button"
                  onClick={copyAssetLink}
                  className="rounded-full border border-blue-500 bg-white px-5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  {isCopied ? "Link Copied" : "Share"}
                </button>
              ) : (
                <Link
                  href={viewAssetHref ?? `/all-listing/${asset.id}`}
                  className="rounded-full border border-blue-500 bg-white px-5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  View Asset
                </Link>
              )}
              <button
                type="button"
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
              >
                Buy -&gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
