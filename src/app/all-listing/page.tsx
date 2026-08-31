"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import AssetCard, { type Asset } from "@/components/AssetCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchInput from "@/components/SearchInput";
import { useDebounce } from "@/hooks/useDebounce";
import { useApiFetch } from "@/hooks/useApiFetch";

import { listingBreadcrumbs, PAGE_SIZE } from "./constants";
import ListingFilters from "./ListingFilters";
import Pagination from "./Pagination";
import ListingToolbar from "./ListingToolbar";

type SortValue = "newest" | "popular" | "priceAsc" | "priceDesc";
type ListingFilterState = {
  countries: string[];
  statuses: string[];
  minPrice: string;
  maxPrice: string;
};

const initialFilters: ListingFilterState = {
  countries: [],
  statuses: [],
  minPrice: "",
  maxPrice: "",
};

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

  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ListingFilterState>(initialFilters);
  const { countries, statuses, minPrice, maxPrice } = filters;

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
  const assets = useMemo(() => data ?? [], [data]);
  const filteredAssets = useMemo(() => {
    const minimum = minPrice ? Number(minPrice) : null;
    const maximum = maxPrice ? Number(maxPrice) : null;

    return assets.filter((asset) => {
      const matchesCountry = countries.length === 0 || countries.includes(asset.country);
      const matchesStatus =
        statuses.length === 0 ||
        statuses.some((status) =>
          status === "Active"
            ? asset.businessStatus === "Operational"
            : asset.assetType.toLowerCase() === "license only",
        );
      const matchesMinimum = minimum === null || asset.askingPrice >= minimum;
      const matchesMaximum = maximum === null || asset.askingPrice <= maximum;

      return matchesCountry && matchesStatus && matchesMinimum && matchesMaximum;
    });
  }, [assets, countries, maxPrice, minPrice, statuses]);

  const countryCounts = useMemo(
    () =>
      assets.reduce<Record<string, number>>((counts, asset) => {
        counts[asset.country] = (counts[asset.country] ?? 0) + 1;
        return counts;
      }, {}),
    [assets],
  );
  const statusCounts = useMemo(
    () => ({
      Active: assets.filter((asset) => asset.businessStatus === "Operational").length,
      "License Only": assets.filter((asset) => asset.assetType.toLowerCase() === "license only")
        .length,
    }),
    [assets],
  );

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleAssets = filteredAssets.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const hasActiveFilters =
    countries.length > 0 || statuses.length > 0 || minPrice !== "" || maxPrice !== "";

  const handleToggleCountry = (country: string) => {
    setFilters((current) => ({
      ...current,
      countries: current.countries.includes(country)
        ? current.countries.filter((selected) => selected !== country)
        : [...current.countries, country],
    }));
    setCurrentPage(1);
  };

  const handleToggleStatus = (status: string) => {
    setFilters((current) => ({
      ...current,
      statuses: current.statuses.includes(status)
        ? current.statuses.filter((selected) => selected !== status)
        : [...current.statuses, status],
    }));
    setCurrentPage(1);
  };

  const handleMinPriceChange = (value: string) => {
    setFilters((current) => ({ ...current, minPrice: value }));
    setCurrentPage(1);
  };

  const handleMaxPriceChange = (value: string) => {
    setFilters((current) => ({ ...current, maxPrice: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <Breadcrumbs items={listingBreadcrumbs} />
        <ListingToolbar
          displayCurrency={displayCurrency}
          sortBy={sortBy}
          showFilters={showFilters}
          onCurrencyChange={setDisplayCurrency}
          onSortChange={(value) => {
            setSortBy(value);
            setCurrentPage(1);
          }}
          onToggleFilters={() => setShowFilters((value) => !value)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Find the perfect Asset..."
          ariaLabel="Search assets"
        />

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
          <ListingFilters
            countries={countries}
            statuses={statuses}
            minPrice={minPrice}
            maxPrice={maxPrice}
            countryCounts={countryCounts}
            statusCounts={statusCounts}
            hasActiveFilters={hasActiveFilters}
            onToggleCountry={handleToggleCountry}
            onToggleStatus={handleToggleStatus}
            onMinPriceChange={handleMinPriceChange}
            onMaxPriceChange={handleMaxPriceChange}
            onReset={handleResetFilters}
          />
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
          ) : filteredAssets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
              No assets found.
            </div>
          ) : (
            <>
              {visibleAssets.map((asset: Asset) => (
                <AssetCard key={asset.id} asset={asset} displayCurrency={displayCurrency} />
              ))}

              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
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
