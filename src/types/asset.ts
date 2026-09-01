export type BusinessType = "Bank" | "Fintech" | "Payment" | "EMI" | "Crypto";
export type BusinessStatus = "Active" | "Not active";
export type AssetType = "Active Business (Licensed)" | "License only";

export const BUSINESS_TYPES: BusinessType[] = ["Bank", "Fintech", "Payment", "EMI", "Crypto"];
export const BUSINESS_STATUSES: BusinessStatus[] = ["Active", "Not active"];
export const ASSET_TYPES: AssetType[] = ["Active Business (Licensed)", "License only"];
