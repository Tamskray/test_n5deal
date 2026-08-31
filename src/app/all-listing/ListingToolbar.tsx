"use client";

import { useState } from "react";

import { currencyOptions, sortOptions } from "./constants";

type SortValue = "newest" | "popular" | "priceAsc" | "priceDesc";

type ListingToolbarProps = {
  displayCurrency: string;
  sortBy: SortValue;
  showFilters: boolean;
  onCurrencyChange: (currency: string) => void;
  onSortChange: (sort: SortValue) => void;
  onToggleFilters: () => void;
};

export default function ListingToolbar({
  displayCurrency,
  sortBy,
  showFilters,
  onCurrencyChange,
  onSortChange,
  onToggleFilters,
}: ListingToolbarProps) {
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const selectedCurrency =
    currencyOptions.find((option) => option.code === displayCurrency) ?? currencyOptions[0];
  const sortLabel =
    sortBy === "popular"
      ? "Most Popular"
      : (sortOptions.find((option) => option.value === sortBy)?.label ?? "Newest Listing");

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-slate-600">
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowCurrencyMenu((value) => !value);
            setShowSortMenu(false);
          }}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-900 shadow-sm"
        >
          <span className="font-normal text-slate-600">Show prices in</span>
          <span>{selectedCurrency.code}</span>
          <span
            aria-hidden="true"
            className="mb-1 h-1.5 w-1.5 rotate-45 border-b border-r border-current"
          />
        </button>
        {showCurrencyMenu ? (
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <div className="rounded-xl bg-slate-100 p-2 text-left font-semibold text-slate-900">
              Default
            </div>
            <div className="mt-2 space-y-1">
              {currencyOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    onCurrencyChange(option.code);
                    setShowCurrencyMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium ${displayCurrency === option.code ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
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
        onClick={onToggleFilters}
        aria-pressed={showFilters}
        className={`flex items-center gap-2 rounded-full border px-3 py-2 font-semibold transition ${showFilters ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"}`}
      >
        <span aria-hidden="true">☷</span> Filters
      </button>

      <button
        type="button"
        onClick={() => onSortChange("popular")}
        className={`flex items-center gap-2 rounded-full px-3 py-2 font-semibold transition ${sortBy === "popular" ? "bg-slate-900 text-white" : "text-slate-900 hover:bg-slate-100"}`}
      >
        <span aria-hidden="true">⌁</span> Most Popular
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowSortMenu((value) => !value);
            setShowCurrencyMenu(false);
          }}
          className="flex items-center gap-2 rounded-full px-3 py-2 font-semibold text-slate-900 hover:bg-slate-100"
        >
          <span>{sortLabel}</span>
          <span
            aria-hidden="true"
            className="mb-1 h-1.5 w-1.5 rotate-45 border-b border-r border-current"
          />
        </button>
        {showSortMenu ? (
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <div className="space-y-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortMenu(false);
                  }}
                  className={`flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium ${sortBy === option.value ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
