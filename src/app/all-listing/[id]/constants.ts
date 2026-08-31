import type { BreadcrumbItem } from "@/components/Breadcrumbs";

export function getAssetBreadcrumbs(assetId: string, fromSeller: boolean): BreadcrumbItem[] {
  return [
    { label: "N5deal", href: "/" },
    {
      label: fromSeller ? "Seller Dashboard" : "All Listings",
      href: fromSeller ? "/dashboard/seller" : "/all-listing",
    },
    { label: `Asset #${assetId.slice(-4)}` },
  ];
}
