"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import AssetCard, { type Asset } from "@/components/AssetCard";
import { useDebounce } from "@/hooks/useDebounce";
import { useApiFetch } from "@/hooks/useApiFetch";

import { PAGE_SIZE, currencyOptions, sortOptions } from "./constants";

type SortValue = "newest" | "popular" | "priceAsc" | "priceDesc";

const businessTypeTabs = ["All", "Bank", "Fintech", "Payment", "EMI", "Crypto"] as const;

function AllListingPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [displayCurrency, setDisplayCurrency] = useState("EUR");
  const [sortBy, setSortBy] = useState<SortValue>("newest");
  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(searchInput, 350);

  const activeBusinessType = searchParams.get("tab") ?? "";
  const search = searchParams.get("search") ?? "";

  const selectedCurrency =
    currencyOptions.find((option) => option.code === displayCurrency) ?? currencyOptions[0];

  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const updateQuery = useCallback(
    (updates: { search?: string; tab?: string }) => {
      const params = new URLSearchParams();
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateQuery({ search: debouncedSearch.trim(), tab: activeBusinessType });
    }
  }, [activeBusinessType, debouncedSearch, search, updateQuery]);

  const params = useMemo(() => {
    const nextParams = new URLSearchParams({ sort: sortBy });
    if (search) nextParams.set("search", search);
    if (activeBusinessType) nextParams.set("tab", activeBusinessType);
    return nextParams;
  }, [activeBusinessType, search, sortBy]);
  const { data, loading, error } = useApiFetch<Asset[]>(`/api/assets?${params.toString()}`, [
    params.toString(),
  ]);
  const assets = data ?? [];

  const sortLabel =
    sortBy === "popular"
      ? "Most Popular"
      : (sortOptions.find((option) => option.value === sortBy)?.label ?? "Newest Listing");

  const totalPages = Math.max(1, Math.ceil(assets.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleAssets = assets.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="font-medium text-slate-700 transition hover:text-slate-900">
            N5deal
          </Link>
          <span>›</span>
          <span className="text-slate-600">All Listings</span>
        </nav>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowCurrencyMenu((value) => !value);
                setShowSortMenu(false);
              }}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm"
            >
              <span>Show prices in</span>
              <span className="font-semibold text-slate-900">{selectedCurrency.code}</span>
              <span className="text-base">⌃</span>
            </button>

            {showCurrencyMenu ? (
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                <div className="rounded-xl bg-slate-100 p-2 text-left text-base font-semibold text-slate-900">
                  Default
                </div>
                <div className="mt-2 space-y-1">
                  {currencyOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => {
                        setDisplayCurrency(option.code);
                        setShowCurrencyMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                        displayCurrency === option.code
                          ? "bg-blue-600 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{option.label}</span>
                      <span>{option.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm"
          >
            Filters
          </button>

          <button
            type="button"
            onClick={() => {
              setSortBy("popular");
              setCurrentPage(1);
              setShowSortMenu(false);
            }}
            className={`rounded-full px-4 py-2 font-medium shadow-sm ${
              sortBy === "popular"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Most Popular
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowSortMenu((value) => !value);
                setShowCurrencyMenu(false);
              }}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm"
            >
              <span>{sortLabel}</span>
              <span className="text-base">⌃</span>
            </button>

            {showSortMenu ? (
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                <div className="space-y-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value as SortValue);
                        setCurrentPage(1);
                        setShowSortMenu(false);
                      }}
                      className={`flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                        sortBy === option.value
                          ? "bg-blue-600 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-w-0 shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 shadow-sm sm:w-80">
          <span className="text-slate-400" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Find the perfect Asset..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            aria-label="Search assets"
          />
        </label>

        <nav
          aria-label="Filter by business type"
          className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1 shadow-sm"
        >
          {businessTypeTabs.map((tab) => {
            const value = tab === "All" ? "" : tab;
            const isActive = activeBusinessType === value;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  updateQuery({ search, tab: value });
                  setCurrentPage(1);
                }}
                className={`min-w-max flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={showFilters ? "grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]" : "grid gap-6"}>
        {showFilters ? (
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">Country</h2>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              {[
                ["Australia", "AU"],
                ["Brazil", "BR"],
                ["Bulgaria", "BG"],
                ["Canada", "CA"],
                ["Cayman Islands", "KY"],
              ].map(([label, code]) => (
                <label
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{label}</span>
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {code}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-slate-900">Business Status</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {["Active", "License Only"].map((status) => (
                  <label key={status} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        ) : null}

        <div className="space-y-5">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Loading assets...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center text-rose-700">
              Failed to load assets.
            </div>
          ) : assets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
              No assets found.
            </div>
          ) : (
            <>
              {visibleAssets.map((asset: Asset) => (
                <AssetCard key={asset.id} asset={asset} displayCurrency={displayCurrency} />
              ))}

              <div className="flex items-center justify-center gap-3 pt-2 text-lg text-slate-600">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition ${
                      pageNumber === safeCurrentPage
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AllListingPage() {
  return (
    <Suspense fallback={<div className="h-96 rounded-2xl bg-white" />}>
      <AllListingPageContent />
    </Suspense>
  );
}
