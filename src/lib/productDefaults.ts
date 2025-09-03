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
  description: string;
}

export const CATEGORY_DEFAULTS: Record<ProductCategory, CategoryDefaults> = {
  electronics: {
    cogsPercentage: { min: 30, max: 40 },
    weightOz: { min: 4, max: 8 },
    conversionRate: 1.8,
    cpc: 1.20,
    description: 'Electronic devices and accessories'
  },
  clothing: {
    cogsPercentage: { min: 20, max: 30 },
    weightOz: { min: 4, max: 12 },
    conversionRate: 2.2,
    cpc: 0.80,
    description: 'Apparel and fashion items'
  },
  beauty: {
    cogsPercentage: { min: 25, max: 35 },
    weightOz: { min: 2, max: 6 },
    conversionRate: 2.5,
    cpc: 1.50,
    description: 'Cosmetics and personal care'
  },
  home: {
    cogsPercentage: { min: 35, max: 45 },
    weightOz: { min: 8, max: 16 },
    conversionRate: 1.5,
    cpc: 1.00,
    description: 'Home goods and decor'
  },
  jewelry: {
    cogsPercentage: { min: 15, max: 25 },
    weightOz: { min: 1, max: 4 },
    conversionRate: 1.2,
    cpc: 2.00,
    description: 'Jewelry and accessories'
  },
  books: {
    cogsPercentage: { min: 40, max: 60 },
    weightOz: { min: 6, max: 20 },
    conversionRate: 3.0,
    cpc: 0.50,
    description: 'Books and publications'
  },
  sports: {
    cogsPercentage: { min: 30, max: 40 },
    weightOz: { min: 8, max: 24 },
    conversionRate: 2.0,
    cpc: 1.10,
    description: 'Sports and fitness equipment'
  },
  toys: {
    cogsPercentage: { min: 25, max: 35 },
    weightOz: { min: 4, max: 16 },
    conversionRate: 2.8,
    cpc: 0.90,
    description: 'Toys and games'
  },
  automotive: {
    cogsPercentage: { min: 35, max: 50 },
    weightOz: { min: 2, max: 32 },
    conversionRate: 1.5,
    cpc: 1.80,
    description: 'Automotive parts and accessories'
  },
  health: {
    cogsPercentage: { min: 20, max: 30 },
    weightOz: { min: 2, max: 8 },
    conversionRate: 2.2,
    cpc: 1.60,
    description: 'Health and wellness products'
  },
  unknown: {
    cogsPercentage: { min: 25, max: 40 },
    weightOz: { min: 6, max: 12 },
    conversionRate: 2.0,
    cpc: 1.20,
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

export function detectCategoryFromText(text: string): ProductCategory {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matchCount > 0) {
      return category as ProductCategory;
    }
  }
  
  return 'unknown';
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