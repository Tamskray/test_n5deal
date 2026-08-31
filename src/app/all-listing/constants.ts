import type { BreadcrumbItem } from "@/components/Breadcrumbs";

export const currencyOptions = [
  { code: "EUR", label: "EUR", symbol: "€" },
  { code: "USD", label: "USD", symbol: "$" },
  { code: "GBP", label: "GBP", symbol: "£" },
  { code: "JPY", label: "JPY", symbol: "¥" },
  { code: "CHF", label: "CHF", symbol: "CHF" },
  { code: "INR", label: "INR", symbol: "₹" },
  { code: "CAD", label: "CAD", symbol: "C$" },
] as const;

export const sortOptions = [
  { value: "newest", label: "Newest Listing" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
] as const;

export const PAGE_SIZE = 5;

export const listingBreadcrumbs: BreadcrumbItem[] = [
  { label: "N5deal", href: "/" },
  { label: "All Listings" },
];
