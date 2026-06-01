import type { Buyer, Deal, Market, ProfileSettings } from "@/types/leadflow";
import { DEFAULT_PROFILE } from "@/types/leadflow";

export const STORAGE_KEYS = {
  deals: "leadflow-deals",
  buyers: "leadflow-buyers",
  markets: "leadflow-markets",
  profile: "leadflow-profile",
} as const;

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getStoredDeals(): Deal[] {
  if (typeof window === "undefined") return [];
  return safeParse<Deal[]>(localStorage.getItem(STORAGE_KEYS.deals), []);
}

export function saveStoredDeals(deals: Deal[]) {
  localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(deals));
}

export function getStoredBuyers(): Buyer[] {
  if (typeof window === "undefined") return [];
  return safeParse<Buyer[]>(localStorage.getItem(STORAGE_KEYS.buyers), []);
}

export function saveStoredBuyers(buyers: Buyer[]) {
  localStorage.setItem(STORAGE_KEYS.buyers, JSON.stringify(buyers));
}

export function getStoredMarkets(): Market[] {
  if (typeof window === "undefined") return [];
  return safeParse<Market[]>(localStorage.getItem(STORAGE_KEYS.markets), []);
}

export function saveStoredMarkets(markets: Market[]) {
  localStorage.setItem(STORAGE_KEYS.markets, JSON.stringify(markets));
}

export function getStoredProfile(): ProfileSettings {
  if (typeof window === "undefined") return DEFAULT_PROFILE;

  const savedProfile = safeParse<Partial<ProfileSettings>>(
    localStorage.getItem(STORAGE_KEYS.profile),
    {}
  );

  return {
    ...DEFAULT_PROFILE,
    ...savedProfile,
  };
}

export function saveStoredProfile(profile: ProfileSettings) {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

export function clearStorageKey(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function clearAllLeadFlowData() {
  if (typeof window === "undefined") return;

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}