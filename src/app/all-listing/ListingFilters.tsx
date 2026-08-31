"use client";

import { useMemo, useState } from "react";

type ListingFiltersProps = {
  countries: string[];
  statuses: string[];
  minPrice: string;
  maxPrice: string;
  countryCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  onToggleCountry: (country: string) => void;
  onToggleStatus: (status: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
};

const countryOptions = [
  ["Australia", "AU"],
  ["Brazil", "BR"],
  ["Bulgaria", "BG"],
  ["Canada", "CA"],
  ["Cayman Islands", "KY"],
  ["France", "FR"],
  ["Germany", "DE"],
  ["Singapore", "SG"],
  ["Spain", "ES"],
  ["United Kingdom", "GB"],
  ["United States", "US"],
] as const;

const statusOptions = ["Active", "License Only"] as const;

export default function ListingFilters({
  countries,
  statuses,
  minPrice,
  maxPrice,
  countryCounts,
  statusCounts,
  onToggleCountry,
  onToggleStatus,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
  hasActiveFilters,
}: ListingFiltersProps) {
  const [countrySearch, setCountrySearch] = useState("");
  const visibleCountries = useMemo(
    () =>
      countryOptions.filter(([country]) =>
        country.toLowerCase().includes(countrySearch.toLowerCase()),
      ),
    [countrySearch],
  );

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
      </div>

      <div className="mt-6">
        <h3 className="text-base font-bold text-slate-900">Country</h3>
        <label className="mt-3 flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm text-slate-400">
          <span aria-hidden="true">⌕</span>
          <input
            value={countrySearch}
            onChange={(event) => setCountrySearch(event.target.value)}
            placeholder="Search country"
            className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>
        <div className="mt-3 max-h-52 space-y-1 overflow-y-auto pr-1">
          {visibleCountries.map(([country, code]) => (
            <label
              key={country}
              className="flex items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={countries.includes(country)}
                  onChange={() => onToggleCountry(country)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{country}</span>
              </span>
              <span className="text-xs font-medium text-slate-500">
                {countryCounts[country] ?? 0} {code}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <h3 className="text-base font-bold text-slate-900">Price Range</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="rounded-full border border-slate-300 px-4 py-2 text-sm">
            <span className="sr-only">Minimum price</span>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              placeholder="Min"
              className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
          <label className="rounded-full border border-slate-300 px-4 py-2 text-sm">
            <span className="sr-only">Maximum price</span>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              placeholder="Max"
              className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>
      </div>

      <div className="mt-7">
        <h3 className="text-base font-bold text-slate-900">Business Status</h3>
        <div className="mt-3 space-y-1">
          {statusOptions.map((status) => (
            <label
              key={status}
              className="flex items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={statuses.includes(status)}
                  onChange={() => onToggleStatus(status)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{status}</span>
              </span>
              <span className="text-xs font-medium text-slate-500">
                {statusCounts[status] ?? 0}
              </span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-7 w-full rounded-full border border-blue-700 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
        >
          Reset all filters
        </button>
      ) : null}
    </aside>
  );
}
