import type { Buyer, Deal, Market } from "@/types/leadflow";

export function parseMoney(value: string) {
  const cleanValue = value.replace(/[^0-9.]/g, "");
  const number = Number(cleanValue);

  return Number.isFinite(number) ? number : 0;
}

export function formatMoney(value: number) {
  if (!value) return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function clampScore(value: string) {
  const number = Number(value.replace(/[^0-9]/g, ""));

  if (!Number.isFinite(number)) return "0";
  if (number < 0) return "0";
  if (number > 100) return "100";

  return String(number);
}

export function calculateSystemScore({
  deals,
  buyers,
  markets,
  tasks,
}: {
  deals: number;
  buyers: number;
  markets: number;
  tasks: number;
}) {
  let score = 0;

  score += Math.min(deals * 8, 32);
  score += Math.min(buyers * 6, 30);
  score += Math.min(markets * 8, 24);
  score += Math.min(tasks * 4, 14);

  return Math.min(score, 100);
}

export function getDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getHighestDeal(deals: Deal[]) {
  if (deals.length === 0) return null;

  return [...deals].sort(
    (a, b) => Number(b.dealScore || 0) - Number(a.dealScore || 0)
  )[0];
}

export function getLowestDeal(deals: Deal[]) {
  if (deals.length === 0) return null;

  return [...deals].sort(
    (a, b) => Number(a.dealScore || 0) - Number(b.dealScore || 0)
  )[0];
}

export function getHighestMarket(markets: Market[], key: keyof Market) {
  if (markets.length === 0) return null;

  return [...markets].sort(
    (a, b) => Number(b[key] || 0) - Number(a[key] || 0)
  )[0];
}

export function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function scoreBuyerMatch(deal: Deal, buyer: Buyer) {
  const dealMarket = normalizeText(deal.market);
  const buyerMarkets = normalizeText(buyer.markets);
  const dealValue = parseMoney(deal.estimatedValue);
  const minPrice = parseMoney(buyer.minPrice);
  const maxPrice = parseMoney(buyer.maxPrice);

  let matchScore = 0;
  const matchReasons: string[] = [];

  const hasMarketMatch =
    dealMarket.length > 0 &&
    buyerMarkets.length > 0 &&
    (buyerMarkets.includes(dealMarket) || dealMarket.includes(buyerMarkets));

  if (hasMarketMatch) {
    matchScore += 60;
    matchReasons.push("Market match");
  } else {
    matchReasons.push("Market not confirmed");
  }

  const hasPriceRange = minPrice > 0 || maxPrice > 0;
  const fitsMin = minPrice === 0 || dealValue >= minPrice;
  const fitsMax = maxPrice === 0 || dealValue <= maxPrice;
  const fitsPrice = dealValue > 0 && hasPriceRange && fitsMin && fitsMax;

  if (fitsPrice) {
    matchScore += 30;
    matchReasons.push("Price range fit");
  } else if (dealValue > 0 && hasPriceRange) {
    matchScore += 10;
    matchReasons.push("Price range needs review");
  } else {
    matchReasons.push("Price range missing");
  }

  if (buyer.buyerType === "Cash" || buyer.buyerType === "Both") {
    matchScore += 10;
    matchReasons.push("Cash-capable buyer");
  }

  const matchLabel: "Strong Match" | "Possible Match" | "Weak Match" =
  matchScore >= 80
    ? "Strong Match"
    : matchScore >= 40
    ? "Possible Match"
    : "Weak Match";

  return {
    ...buyer,
    matchScore,
    matchLabel,
    matchReasons,
  };
}