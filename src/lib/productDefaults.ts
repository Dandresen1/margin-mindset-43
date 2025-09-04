export type ProductCategory = 
  | 'electronics'
  | 'clothing'
  | 'beauty'
  | 'home'
  | 'jewelry'
  | 'books'
  | 'sports'
  | 'toys'
  | 'automotive'
  | 'health'
  | 'unknown';

export interface CategoryDefaults {
  cogsPercentage: { min: number; max: number };
  weightOz: { min: number; max: number };
  conversionRate: number;
  cpc: number;
  returnRate: number; // Return rate percentage for this category
  description: string;
}

export interface ConfidenceBadge {
  level: 'high' | 'medium' | 'low';
  source: 'scraped' | 'category_default' | 'platform_average' | 'manual';
  description: string;
}

export interface DefaultWithConfidence<T> {
  value: T;
  confidence: ConfidenceBadge;
}

// Platform-specific fee structures
export interface PlatformFees {
  referral_fee: number; // Percentage
  fulfillment_fee?: number; // Fixed fee for FBA/fulfillment
  storage_fee?: number; // Monthly storage fee per cubic foot
  closing_fee?: number; // Per-item closing fee
  payment_processing: number; // Percentage + fixed fee
  listing_fee?: number; // One-time listing fee
}

export const PLATFORM_FEE_STRUCTURES: Record<string, PlatformFees> = {
  amazon: {
    referral_fee: 15.0, // Average across categories
    fulfillment_fee: 3.50, // Average FBA fee
    storage_fee: 0.75, // Per cubic foot per month
    payment_processing: 0.0, // Included in referral fee
  },
  shopify: {
    referral_fee: 0.0,
    payment_processing: 2.9, // 2.9% + $0.30
    closing_fee: 0.30,
  },
  etsy: {
    referral_fee: 6.5,
    payment_processing: 3.0, // 3% + $0.25
    closing_fee: 0.25,
    listing_fee: 0.20,
  },
  tiktok: {
    referral_fee: 8.0,
    payment_processing: 2.9,
    closing_fee: 0.30,
  },
  aliexpress: {
    referral_fee: 5.0, // Approximate based on category
    payment_processing: 3.0,
    closing_fee: 0.00,
  },
  alibaba: {
    referral_fee: 0.0, // B2B platform, no selling fees
    payment_processing: 3.0,
    closing_fee: 0.00,
  },
  walmart: {
    referral_fee: 15.0, // Similar to Amazon
    fulfillment_fee: 3.00,
    payment_processing: 2.9,
    closing_fee: 0.30,
  },
  generic: {
    referral_fee: 12.0, // Average across platforms
    payment_processing: 2.9,
    closing_fee: 0.30,
  },
  ebay: {
    referral_fee: 12.9, // Average final value fee
    payment_processing: 2.9,
    closing_fee: 0.30,
    listing_fee: 0.35, // For auction-style listings
  }
};

export const CATEGORY_DEFAULTS: Record<ProductCategory, CategoryDefaults> = {
  electronics: {
    cogsPercentage: { min: 30, max: 40 },
    weightOz: { min: 4, max: 8 },
    conversionRate: 1.8,
    cpc: 1.20,
    returnRate: 15.0, // Electronics have higher return rates
    description: 'Electronic devices and accessories'
  },
  clothing: {
    cogsPercentage: { min: 20, max: 30 },
    weightOz: { min: 4, max: 12 },
    conversionRate: 2.2,
    cpc: 0.80,
    returnRate: 30.0, // High return rate for sizing issues
    description: 'Apparel and fashion items'
  },
  beauty: {
    cogsPercentage: { min: 25, max: 35 },
    weightOz: { min: 2, max: 6 },
    conversionRate: 2.5,
    cpc: 1.50,
    returnRate: 12.0, // Moderate returns, usually satisfaction-based
    description: 'Cosmetics and personal care'
  },
  home: {
    cogsPercentage: { min: 35, max: 45 },
    weightOz: { min: 8, max: 16 },
    conversionRate: 1.5,
    cpc: 1.00,
    returnRate: 8.0, // Lower return rate for home goods
    description: 'Home goods and decor'
  },
  jewelry: {
    cogsPercentage: { min: 15, max: 25 },
    weightOz: { min: 1, max: 4 },
    conversionRate: 1.2,
    cpc: 2.00,
    returnRate: 20.0, // Returns due to sizing and preference
    description: 'Jewelry and accessories'
  },
  books: {
    cogsPercentage: { min: 40, max: 60 },
    weightOz: { min: 6, max: 20 },
    conversionRate: 3.0,
    cpc: 0.50,
    returnRate: 5.0, // Very low return rate for books
    description: 'Books and publications'
  },
  sports: {
    cogsPercentage: { min: 30, max: 40 },
    weightOz: { min: 8, max: 24 },
    conversionRate: 2.0,
    cpc: 1.10,
    returnRate: 18.0, // Equipment sizing and quality issues
    description: 'Sports and fitness equipment'
  },
  toys: {
    cogsPercentage: { min: 25, max: 35 },
    weightOz: { min: 4, max: 16 },
    conversionRate: 2.8,
    cpc: 0.90,
    returnRate: 10.0, // Moderate returns, quality-based
    description: 'Toys and games'
  },
  automotive: {
    cogsPercentage: { min: 35, max: 50 },
    weightOz: { min: 2, max: 32 },
    conversionRate: 1.5,
    cpc: 1.80,
    returnRate: 25.0, // High returns due to compatibility issues
    description: 'Automotive parts and accessories'
  },
  health: {
    cogsPercentage: { min: 20, max: 30 },
    weightOz: { min: 2, max: 8 },
    conversionRate: 2.2,
    cpc: 1.60,
    returnRate: 14.0, // Moderate returns, effectiveness-based
    description: 'Health and wellness products'
  },
  unknown: {
    cogsPercentage: { min: 25, max: 40 },
    weightOz: { min: 6, max: 12 },
    conversionRate: 2.0,
    cpc: 1.20,
    returnRate: 15.0, // Average return rate
    description: 'General product'
  }
};

// Category detection patterns
const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  electronics: [
    'phone', 'laptop', 'tablet', 'headphone', 'speaker', 'camera', 'tv', 'monitor',
    'mouse', 'keyboard', 'charger', 'cable', 'wireless', 'bluetooth', 'smart',
    'electronic', 'digital', 'tech', 'gaming', 'computer', 'earbuds', 'watch'
  ],
  clothing: [
    'shirt', 'dress', 'pants', 'jeans', 'jacket', 'coat', 'shoes', 'boots',
    'sneakers', 'hat', 'cap', 'socks', 'underwear', 'bra', 'top', 'skirt',
    'shorts', 'hoodie', 'sweater', 'clothing', 'apparel', 'fashion', 'wear'
  ],
  beauty: [
    'makeup', 'lipstick', 'foundation', 'mascara', 'skincare', 'cream', 'serum',
    'shampoo', 'conditioner', 'perfume', 'cologne', 'nail', 'beauty', 'cosmetic',
    'moisturizer', 'cleanser', 'toner', 'sunscreen', 'lotion', 'oil', 'treatment'
  ],
  home: [
    'furniture', 'chair', 'table', 'bed', 'lamp', 'pillow', 'blanket', 'curtain',
    'rug', 'decor', 'kitchen', 'bathroom', 'bedroom', 'living', 'home', 'house',
    'storage', 'organizer', 'shelf', 'frame', 'candle', 'plant', 'vase'
  ],
  jewelry: [
    'ring', 'necklace', 'bracelet', 'earring', 'watch', 'chain', 'pendant',
    'jewelry', 'gold', 'silver', 'diamond', 'pearl', 'gem', 'jewel', 'accessory'
  ],
  books: [
    'book', 'novel', 'guide', 'manual', 'textbook', 'cookbook', 'journal',
    'diary', 'notebook', 'planner', 'magazine', 'publication', 'reading'
  ],
  sports: [
    'fitness', 'gym', 'exercise', 'workout', 'sports', 'athletic', 'running',
    'yoga', 'weights', 'dumbbell', 'treadmill', 'bike', 'ball', 'equipment'
  ],
  toys: [
    'toy', 'game', 'puzzle', 'doll', 'action', 'figure', 'lego', 'board',
    'card', 'kids', 'children', 'baby', 'plush', 'stuffed', 'play'
  ],
  automotive: [
    'car', 'auto', 'vehicle', 'tire', 'brake', 'engine', 'oil', 'filter',
    'part', 'accessory', 'automotive', 'motor', 'driving', 'racing'
  ],
  health: [
    'vitamin', 'supplement', 'protein', 'health', 'wellness', 'medical',
    'fitness', 'nutrition', 'organic', 'natural', 'herbal', 'diet'
  ],
  unknown: [
    'product', 'item', 'goods', 'merchandise', 'stuff', 'thing', 'object'
  ]
};

export function detectCategoryFromText(text: string): DefaultWithConfidence<ProductCategory> {
  const lowerText = text.toLowerCase();
  let bestMatch: { category: ProductCategory; score: number } = { category: 'unknown', score: 0 };
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length;
    const score = matchCount / keywords.length; // Normalize by keyword count
    
    if (score > bestMatch.score) {
      bestMatch = { category: category as ProductCategory, score };
    }
  }
  
  // Determine confidence level based on match strength
  let confidence: ConfidenceBadge;
  if (bestMatch.score >= 0.1) { // At least 10% of keywords matched
    confidence = {
      level: bestMatch.score >= 0.2 ? 'high' : 'medium',
      source: 'category_default',
      description: `Detected from ${Math.round(bestMatch.score * 100)}% keyword match`
    };
  } else {
    confidence = {
      level: 'low',
      source: 'category_default',
      description: 'Unable to detect category, using general defaults'
    };
  }
  
  return {
    value: bestMatch.category,
    confidence
  };
}

export function detectCategoryFromURL(url: string): DefaultWithConfidence<ProductCategory> {
  // Extract category hints from URL structure
  const urlLower = url.toLowerCase();
  
  // Amazon category detection from URL path
  if (urlLower.includes('amazon.com')) {
    if (urlLower.includes('/electronics/') || urlLower.includes('/dp/b0')) return {
      value: 'electronics',
      confidence: { level: 'high', source: 'scraped', description: 'Detected from Amazon URL structure' }
    };
    if (urlLower.includes('/clothing/') || urlLower.includes('/fashion/')) return {
      value: 'clothing',
      confidence: { level: 'high', source: 'scraped', description: 'Detected from Amazon URL structure' }
    };
    if (urlLower.includes('/beauty/')) return {
      value: 'beauty',
      confidence: { level: 'high', source: 'scraped', description: 'Detected from Amazon URL structure' }
    };
  }
  
  // Fallback to text-based detection from URL
  return detectCategoryFromText(url);
}

export function getWeightClass(category: ProductCategory): DefaultWithConfidence<string> {
  const defaults = CATEGORY_DEFAULTS[category];
  const avgWeight = (defaults.weightOz.min + defaults.weightOz.max) / 2;
  
  let weightClass: string;
  if (avgWeight <= 4) weightClass = 'Light (≤4 oz)';
  else if (avgWeight <= 8) weightClass = 'Medium (4-8 oz)';
  else if (avgWeight <= 16) weightClass = 'Heavy (8-16 oz)';
  else weightClass = 'Very Heavy (>16 oz)';
  
  return {
    value: weightClass,
    confidence: {
      level: category === 'unknown' ? 'low' : 'medium',
      source: 'category_default',
      description: `Based on ${category} category averages`
    }
  };
}

export function getReturnRate(category: ProductCategory): DefaultWithConfidence<number> {
  const returnRate = CATEGORY_DEFAULTS[category].returnRate;
  
  return {
    value: returnRate,
    confidence: {
      level: category === 'unknown' ? 'low' : 'medium',
      source: 'category_default',
      description: `Industry average for ${category} category`
    }
  };
}

export function getPlatformFees(platform: string, price: number): DefaultWithConfidence<number> {
  const fees = PLATFORM_FEE_STRUCTURES[platform.toLowerCase()];
  if (!fees) {
    return {
      value: price * 0.15, // Default 15% if platform not found
      confidence: {
        level: 'low',
        source: 'platform_average',
        description: 'Unknown platform, using 15% average'
      }
    };
  }
  
  let totalFee = price * (fees.referral_fee / 100);
  if (fees.fulfillment_fee) totalFee += fees.fulfillment_fee;
  if (fees.closing_fee) totalFee += fees.closing_fee;
  
  return {
    value: totalFee,
    confidence: {
      level: 'high',
      source: 'platform_average',
      description: `Official ${platform} fee structure`
    }
  };
}

export function getEstimatedCOGS(sellingPrice: number, category: ProductCategory): number {
  const defaults = CATEGORY_DEFAULTS[category];
  const avgPercentage = (defaults.cogsPercentage.min + defaults.cogsPercentage.max) / 2;
  return Math.round((sellingPrice * avgPercentage / 100) * 100) / 100;
}

export function getEstimatedWeight(category: ProductCategory): number {
  const defaults = CATEGORY_DEFAULTS[category];
  return (defaults.weightOz.min + defaults.weightOz.max) / 2;
}

export function getCOGSRange(sellingPrice: number, category: ProductCategory): { min: number; max: number; percentage: string } {
  const defaults = CATEGORY_DEFAULTS[category];
  return {
    min: Math.round((sellingPrice * defaults.cogsPercentage.min / 100) * 100) / 100,
    max: Math.round((sellingPrice * defaults.cogsPercentage.max / 100) * 100) / 100,
    percentage: `${defaults.cogsPercentage.min}-${defaults.cogsPercentage.max}%`
  };
}

export function getWholesaleSearchQueries(productName: string): string[] {
  const baseProduct = productName.replace(/\b(wholesale|bulk|supplier)\b/gi, '').trim();
  
  return [
    `${baseProduct} wholesale supplier`,
    `${baseProduct} manufacturer alibaba`,
    `${baseProduct} factory direct 1688`,
    `${baseProduct} bulk buy aliexpress`,
    `${baseProduct} private label supplier`
  ];
}

export function getSupplierLinks(productName: string): { platform: string; url: string; description: string }[] {
  const searchQuery = encodeURIComponent(`${productName} wholesale`);
  const chineseQuery = encodeURIComponent(`${productName} 批发`);
  
  return [
    {
      platform: 'Alibaba',
      url: `https://www.alibaba.com/trade/search?SearchText=${searchQuery}`,
      description: 'Global wholesale marketplace'
    },
    {
      platform: '1688.com',
      url: `https://s.1688.com/selloffer/offer_search.htm?keywords=${chineseQuery}`,
      description: 'Chinese wholesale (lowest prices)'
    },
    {
      platform: 'AliExpress',
      url: `https://www.aliexpress.com/wholesale?SearchText=${searchQuery}`,
      description: 'Small quantity wholesale'
    },
    {
      platform: 'DHgate',
      url: `https://www.dhgate.com/wholesale/search.do?searchkey=${searchQuery}`,
      description: 'Dropshipping & wholesale'
    }
  ];
}