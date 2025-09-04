export type DataQuality = "high" | "medium" | "low";

export interface BenchmarksMetadata {
  lastUpdated: string; // YYYY-MM-DD
  qualityByCategory: Record<string, DataQuality>;
  needsBetterSources: Record<string, string[]>; // metric paths e.g. "ad.meta.cpmUSD", "platformFees.tiktokShop"
}

export const BENCHMARKS_METADATA: BenchmarksMetadata = {
  lastUpdated: "2025-09-03",
  qualityByCategory: {
    apparel: "medium",
    beauty: "high",
    electronics: "medium",
    food_and_beverage: "low",
    health_wellness: "medium",
    home: "medium",
    jewelry: "low",
    pet_supplies: "low",
    sports_outdoor: "low",
    toys_games: "low"
  },
  needsBetterSources: {
    apparel: ["ad.meta.cpmUSD", "platformFees.tiktokShop"],
    electronics: ["ad.google_search.cpcUSD", "avgConversionRate.byChannel.paid_social"],
    food_and_beverage: ["avgReturnRate.p90", "roas.aggressive"],
    jewelry: ["bundleAttachRate", "shippingHeuristics.ounceCostUSD"]
  }
};
