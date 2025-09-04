export type ROASBuckets = { conservative: number; market: number; aggressive: number };

export type AdMetrics = {
  cpmUSD?: number; // avg
  cpcUSD?: number; // avg
  ctr?: number;    // 0..1
};

export type ChannelCVR = {
  direct?: number;
  organic?: number;
  paid_social?: number;
  paid_search?: number;
  shopping?: number;
};

export type PlatformFees = {
  shopify?: number;     // % as decimal (2.9% -> 0.029)
  amazonFBA?: number;   // referral%, category avg (varies)
  stripe?: number;      // % (typ. 0.029), excludes fixed fee
  paypal?: number;      // % (typ. 0.034)
  tiktokShop?: number;  // marketplace commission
};

export type ReturnRate = { p50: number; p90: number };

export type ShippingHeuristics = {
  baseFulfillmentUSD?: number; // pick/pack + label baseline
  ounceCostUSD?: number;       // extra cost per oz
};

export type BenchmarksCategory = {
  label: string;
  aliases?: string[];
  geo?: string;                // e.g., "US"
  updatedAt?: string;          // ISO
  sources?: string[];          // URLs or notes
  notes?: string[];

  avgReturnRate: ReturnRate;
  avgConversionRate: {
    sitewide: number;          // overall site CVR
    byChannel?: ChannelCVR;
  };

  // Advertising assumptions
  roas: ROASBuckets;
  ad?: {
    meta?: AdMetrics;
    tiktok?: AdMetrics;
    google_search?: AdMetrics;
    google_shopping?: AdMetrics;
  };

  // Cost / risk knobs
  platformFees?: PlatformFees;
  processingFees?: { stripe?: number; paypal?: number }; // duplicates OK for clarity
  chargebacks?: { rate?: number; feeUSD?: number };
  bundleAttachRate?: number; // baseline prob. any bundle adopted
  shippingHeuristics?: ShippingHeuristics;
};

export type BenchmarksMap = Record<string, BenchmarksCategory>;

export const BENCHMARKS: BenchmarksMap = {
  /**
   * Primary sources:
   * - https://nrf.com/reports/consumer-returns-in-the-retail-industry
   * - https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks
   */
  default: {
    label: "Default",
    geo: "US",
    updatedAt: "2025-09-03",
    sources: [
      "https://nrf.com/reports/consumer-returns-in-the-retail-industry",
      "https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks"
    ],
    avgReturnRate: { p50: 0.18, p90: 0.30 }, // TODO: Find source
    avgConversionRate: {
      sitewide: 0.02, // TODO: Find source
      byChannel: {
        direct: 0.025,
        organic: 0.022,
        paid_social: 0.012,
        paid_search: 0.022,
        shopping: 0.018
      } // TODO: Find source
    },
    roas: { conservative: 4.0, market: 3.0, aggressive: 2.2 }, // TODO: Find source
    ad: {
      meta: { cpmUSD: 12, cpcUSD: 0.9, ctr: 0.012 }, // TODO: Find source
      tiktok: { cpmUSD: 5, cpcUSD: 0.5, ctr: 0.015 }, // TODO: Find source
      google_search: { cpcUSD: 1.2, ctr: 0.03 }, // TODO: Find source
      google_shopping: { cpcUSD: 0.6, ctr: 0.01 } // TODO: Find source
    },
    platformFees: {
      shopify: 0.029,
      amazonFBA: 0.15,
      stripe: 0.029,
      paypal: 0.034,
      tiktokShop: 0.08
    }, // TODO: Find source
    processingFees: { stripe: 0.029, paypal: 0.034 }, // TODO: Find source
    chargebacks: { rate: 0.002, feeUSD: 15 }, // TODO: Find source
    bundleAttachRate: 0.08, // TODO: Find source
    shippingHeuristics: { baseFulfillmentUSD: 3.2, ounceCostUSD: 0.05 } // TODO: Find source
  },

  /**
   * Primary sources:
   * - https://nrf.com/reports/consumer-returns-in-the-retail-industry
   * - https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks
   */
  apparel: {
    label: "Apparel",
    aliases: ["clothes", "fashion", "apparel & accessories", "t-shirts", "hoodies"],
    geo: "US",
    updatedAt: "2025-09-03",
    sources: [
      "https://nrf.com/reports/consumer-returns-in-the-retail-industry",
      "https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks"
    ],
    avgReturnRate: { p50: 0.25, p90: 0.40 },
    avgConversionRate: {
      sitewide: 0.018, // TODO: Find source
      byChannel: {
        direct: 0.022,
        organic: 0.020,
        paid_social: 0.011,
        paid_search: 0.020,
        shopping: 0.017
      } // TODO: Find source
    },
    roas: { conservative: 4.0, market: 3.0, aggressive: 2.2 }, // TODO: Find source
    ad: {
      meta: { cpmUSD: 11, cpcUSD: 0.85, ctr: 0.012 }, // TODO: Find source
      tiktok: { cpmUSD: 4.5, cpcUSD: 0.45, ctr: 0.016 }, // TODO: Find source
      google_search: { cpcUSD: 0.9, ctr: 0.025 }, // TODO: Find source
      google_shopping: { cpcUSD: 0.45, ctr: 0.012 } // TODO: Find source
    },
    platformFees: {
      shopify: 0.029,
      amazonFBA: 0.15,
      stripe: 0.029,
      paypal: 0.034,
      tiktokShop: 0.08
    }, // TODO: Find source
    bundleAttachRate: 0.10, // TODO: Find source
    shippingHeuristics: { baseFulfillmentUSD: 2.8, ounceCostUSD: 0.035 } // TODO: Find source
  },

  /**
   * Primary sources:
   * - https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks
   * - https://www.statista.com/topics/5509/beauty-personal-care-e-commerce-in-the-us/
   */
  beauty: {
    label: "Beauty & Personal Care",
    aliases: ["cosmetics", "skincare", "makeup"],
    geo: "US",
    updatedAt: "2025-09-03",
    sources: [
      "https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks",
      "https://www.statista.com/topics/5509/beauty-personal-care-e-commerce-in-the-us/"
    ],
    avgReturnRate: { p50: 0.08, p90: 0.15 }, // TODO: Find source
    avgConversionRate: {
      sitewide: 0.022, // TODO: Find source
      byChannel: { paid_social: 0.014 } // TODO: Find source
    },
    roas: { conservative: 4.2, market: 3.2, aggressive: 2.3 }, // TODO: Find source
    ad: {
      meta: { cpmUSD: 10, cpcUSD: 0.8, ctr: 0.013 }, // TODO: Find source
      tiktok: { cpmUSD: 4.2, cpcUSD: 0.42, ctr: 0.017 } // TODO: Find source
    },
    platformFees: {
      shopify: 0.029,
      amazonFBA: 0.15,
      stripe: 0.029,
      paypal: 0.034,
      tiktokShop: 0.08
    }, // TODO: Find source
    bundleAttachRate: 0.12, // TODO: Find source
    shippingHeuristics: { baseFulfillmentUSD: 2.6, ounceCostUSD: 0.04 } // TODO: Find source
  },

  /**
   * Primary sources:
   * - https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks
   * - https://www.statista.com/topics/2454/consumer-electronics/
   */
  electronics: {
    label: "Electronics",
    aliases: ["gadgets", "consumer electronics", "audio", "headphones"],
    geo: "US",
    updatedAt: "2025-09-03",
    sources: [
      "https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks",
      "https://www.statista.com/topics/2454/consumer-electronics/"
    ],
    avgReturnRate: { p50: 0.12, p90: 0.20 },
    avgConversionRate: {
      sitewide: 0.021, // TODO: Find source
      byChannel: {
        direct: 0.026,
        organic: 0.023,
        paid_social: 0.013,
        paid_search: 0.026,
        shopping: 0.020
      } // TODO: Find source
    },
    roas: { conservative: 5.0, market: 3.5, aggressive: 2.5 }, // TODO: Find source
    ad: {
      meta: { cpmUSD: 13, cpcUSD: 1.05, ctr: 0.010 }, // TODO: Find source
      tiktok: { cpmUSD: 6, cpcUSD: 0.6, ctr: 0.013 }, // TODO: Find source
      google_search: { cpcUSD: 1.6, ctr: 0.035 }, // TODO: Find source
      google_shopping: { cpcUSD: 0.8, ctr: 0.012 } // TODO: Find source
    },
    platformFees: {
      shopify: 0.029,
      amazonFBA: 0.08,
      stripe: 0.029,
      paypal: 0.034,
      tiktokShop: 0.08
    }, // TODO: Find source
    bundleAttachRate: 0.06, // TODO: Find source
    shippingHeuristics: { baseFulfillmentUSD: 3.6, ounceCostUSD: 0.07 } // TODO: Find source
  },

  /**
   * Primary sources:
   * - https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks
   * - https://www.statista.com/topics/1261/food-retailing/
   */
  food_and_beverage: {
    label: "Food & Beverage",
    aliases: ["grocery", "food", "beverages"],
    geo: "US",
    updatedAt: "2025-09-03",
    sources: [
      "https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks",
      "https://www.statista.com/topics/1261/food-retailing/"
    ],
    avgReturnRate: { p50: 0.07, p90: 0.12 }, // TODO: Find source
    avgConversionRate: {
      sitewide: 0.025 // TODO: Find source
    },
    roas: { conservative: 4.2, market: 3.2, aggressive: 2.4 }, // TODO: Find source
    shippingHeuristics: { baseFulfillmentUSD: 3.0, ounceCostUSD: 0.04 } // TODO: Find source
  },

  /**
   * Primary sources:
   * - https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks
   * - https://www.statista.com/topics/4209/health-wellness/
   */
  health_wellness: {
    label: "Health & Wellness",
    aliases: ["health", "wellness"],
    geo: "US",
    updatedAt: "2025-09-03",
    sources: [
      "https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks",
      "https://www.statista.com/topics/4209/health-wellness/"
    ],
    avgReturnRate: { p50: 0.10, p90: 0.18 }, // TODO: Find source
    avgConversionRate: {
      sitewide: 0.021 // TODO: Find source
    },
    roas: { conservative: 4.3, market: 3.1, aggressive: 2.3 }, // TODO: Find source
    shippingHeuristics: { baseFulfillmentUSD: 2.7, ounceCostUSD: 0.05 } // TODO: Find source
  },

  /**
   * Primary sources:
   * - https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks
   * - https://www.statista.com/topics/981/home-goods/
   */
  home: {
    label: "Home & Kitchen",
    aliases: ["home goods", "kitchen", "decor"],
    geo: "US",
    updatedAt: "2025-09-03",
    sources: [
      "https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks",
      "https://www.statista.com/topics/981/home-goods/"
    ],
    avgReturnRate: { p50: 0.10, p90: 0.20 }, // TODO: Find source
    avgConversionRate: {
      sitewide: 0.020 // TODO: Find source
    },
    roas: { conservative: 4.5, market: 3.2, aggressive: 2.3 }, // TODO: Find source
    platformFees: { shopify: 0.029, amazonFBA: 0.15 }, // TODO: Find source
    shippingHeuristics: { baseFulfillmentUSD: 3.0, ounceCostUSD: 0.06 } // TODO: Find source
  },

  /**
   * Primary sources:
   * - https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks
   * - https://www.statista.com/topics/1113/jewelry/
   */
  jewelry: {
    label: "Jewelry & Accessories",
    aliases: ["accessories"],
    geo: "US",
    updatedAt: "2025-09-03",
    sources: [
      "https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks",
      "https://www.statista.com/topics/1113/jewelry/"
    ],
    avgReturnRate: { p50: 0.15, p90: 0.30 }, // TODO: Find source
    avgConversionRate: {
      sitewide: 0.019, // TODO: Find source
      byChannel: { paid_social: 0.010 } // TODO: Find source
    },
    roas: { conservative: 4.5, market: 3.0, aggressive: 2.1 }, // TODO: Find source
    shippingHeuristics: { baseFulfillmentUSD: 2.2, ounceCostUSD: 0.03 } // TODO: Find source
  },

  /**
   * Primary sources:
   * - https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks
   * - https://www.statista.com/topics/3135/pet-market-in-the-us/
   */
  pet_supplies: {
    label: "Pet Supplies",
    aliases: ["pet products", "pet food"],
    geo: "US",
    updatedAt: "2025-09-03",
    sources: [
      "https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks",
      "https://www.statista.com/topics/3135/pet-market-in-the-us/"
    ],
    avgReturnRate: { p50: 0.08, p90: 0.15 }, // TODO: Find source
    avgConversionRate: {
      sitewide: 0.021 // TODO: Find source
    },
    roas: { conservative: 4.1, market: 3.0, aggressive: 2.2 }, // TODO: Find source
    shippingHeuristics: { baseFulfillmentUSD: 3.1, ounceCostUSD: 0.05 } // TODO: Find source
  },

  /**
   * Primary sources:
   * - https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks
   * - https://www.statista.com/topics/1752/sporting-goods/
   */
  sports_outdoor: {
    label: "Sports & Outdoor",
    aliases: ["sporting goods", "outdoor"],
    geo: "US",
    updatedAt: "2025-09-03",
    sources: [
      "https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks",
      "https://www.statista.com/topics/1752/sporting-goods/"
    ],
    avgReturnRate: { p50: 0.12, p90: 0.22 }, // TODO: Find source
    avgConversionRate: {
      sitewide: 0.019 // TODO: Find source
    },
    roas: { conservative: 4.4, market: 3.2, aggressive: 2.3 }, // TODO: Find source
    shippingHeuristics: { baseFulfillmentUSD: 3.4, ounceCostUSD: 0.06 } // TODO: Find source
  },

  /**
   * Primary sources:
   * - https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks
   * - https://www.statista.com/topics/3122/toy-industry/
   */
  toys_games: {
    label: "Toys & Games",
    aliases: ["toys", "games"],
    geo: "US",
    updatedAt: "2025-09-03",
    sources: [
      "https://www.wordstream.com/blog/ws/facebook-advertising-benchmarks",
      "https://www.statista.com/topics/3122/toy-industry/"
    ],
    avgReturnRate: { p50: 0.11, p90: 0.20 }, // TODO: Find source
    avgConversionRate: {
      sitewide: 0.020 // TODO: Find source
    },
    roas: { conservative: 4.3, market: 3.1, aggressive: 2.2 }, // TODO: Find source
    shippingHeuristics: { baseFulfillmentUSD: 2.9, ounceCostUSD: 0.05 } // TODO: Find source
  }
};

