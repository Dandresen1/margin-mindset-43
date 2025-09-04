import { detectCategoryFromText, detectCategoryFromURL, CATEGORY_DEFAULTS, getPlatformFees, type ProductCategory } from './productDefaults';

type Provider = 'amazon' | 'etsy' | 'aliexpress' | 'alibaba' | 'walmart' | 'shopify' | 'generic';

interface SmartDefaults {
  avgCOGS: number;
  avgWeight: number;
  typicalPrice: number;
  conversionRate: number;
  cpc: { google: number; facebook: number; tiktok: number };
  returnRate: number;
  competitorRange: { min: number; median: number; max: number };
  confidence: 'high' | 'medium' | 'low';
  source: string;
}

const categorySmartDefaults: Partial<Record<ProductCategory, SmartDefaults>> = {
  electronics: {
    avgCOGS: 12.50,
    avgWeight: 6,
    typicalPrice: 39.99,
    conversionRate: 1.8,
    cpc: { google: 2.10, facebook: 1.65, tiktok: 0.95 },
    returnRate: 15.0,
    competitorRange: { min: 24.99, median: 39.99, max: 59.99 },
    confidence: 'high',
    source: 'Industry benchmark'
  },
  clothing: {
    avgCOGS: 8.00,
    avgWeight: 8,
    typicalPrice: 29.99,
    conversionRate: 2.2,
    cpc: { google: 1.50, facebook: 1.20, tiktok: 0.85 },
    returnRate: 30.0,
    competitorRange: { min: 19.99, median: 29.99, max: 49.99 },
    confidence: 'high',
    source: 'Industry benchmark'
  },
  beauty: {
    avgCOGS: 6.50,
    avgWeight: 4,
    typicalPrice: 24.99,
    conversionRate: 2.5,
    cpc: { google: 1.80, facebook: 1.40, tiktok: 1.10 },
    returnRate: 12.0,
    competitorRange: { min: 14.99, median: 24.99, max: 39.99 },
    confidence: 'high',
    source: 'Industry benchmark'
  },
  home: {
    avgCOGS: 15.00,
    avgWeight: 12,
    typicalPrice: 39.99,
    conversionRate: 1.5,
    cpc: { google: 1.30, facebook: 1.00, tiktok: 0.75 },
    returnRate: 8.0,
    competitorRange: { min: 29.99, median: 39.99, max: 59.99 },
    confidence: 'high',
    source: 'Industry benchmark'
  },
  jewelry: {
    avgCOGS: 4.00,
    avgWeight: 2,
    typicalPrice: 19.99,
    conversionRate: 1.2,
    cpc: { google: 2.50, facebook: 2.00, tiktok: 1.50 },
    returnRate: 20.0,
    competitorRange: { min: 12.99, median: 19.99, max: 34.99 },
    confidence: 'high',
    source: 'Industry benchmark'
  }
};

export function getSmartDefaults(productUrl: string, productName?: string): SmartDefaults {
  // Try URL-based detection first
  const urlCategory = detectCategoryFromURL(productUrl);
  let category = urlCategory.value;
  let confidence = urlCategory.confidence.level;

  // If URL detection failed or low confidence, try name-based
  if (productName && confidence === 'low') {
    const nameCategory = detectCategoryFromText(productName);
    if (nameCategory.confidence.level !== 'low') {
      category = nameCategory.value;
      confidence = nameCategory.confidence.level;
    }
  }

  // Get category-specific defaults or fallback to electronics
  const defaults = categorySmartDefaults[category] || categorySmartDefaults.electronics!;
  
  return {
    ...defaults,
    confidence: confidence === 'high' ? 'high' : confidence === 'medium' ? 'medium' : 'low',
    source: confidence === 'high' ? 'Category analysis' : 'General estimate'
  };
}

export function generateAutoFilledData(url: string, provider: Provider, productName?: string) {
  const smartDefaults = getSmartDefaults(url, productName);
  const categoryDefaults = CATEGORY_DEFAULTS[detectCategoryFromURL(url).value];
  
  // Extract potential price from URL (works for some platforms)
  let estimatedPrice = smartDefaults.typicalPrice;
  
  // Platform-specific price adjustments
  switch (provider) {
    case 'aliexpress':
    case 'alibaba':
      estimatedPrice = smartDefaults.competitorRange.min; // Wholesale/cheap
      break;
    case 'amazon':
    case 'walmart':
      estimatedPrice = smartDefaults.competitorRange.median; // Market rate
      break;
    case 'etsy':
      estimatedPrice = smartDefaults.competitorRange.max; // Premium/handmade
      break;
    default:
      estimatedPrice = smartDefaults.typicalPrice;
  }

  // Calculate COGS based on price and category
  const cogsPercentage = (categoryDefaults.cogsPercentage.min + categoryDefaults.cogsPercentage.max) / 2;
  const estimatedCOGS = (estimatedPrice * cogsPercentage / 100);

  return {
    estimatedPrice,
    estimatedCOGS,
    weight: smartDefaults.avgWeight,
    conversionRate: smartDefaults.conversionRate,
    cpc: smartDefaults.cpc.facebook, // Default to Facebook CPC
    platformFees: getPlatformFees(provider, estimatedPrice).value,
    confidence: smartDefaults.confidence,
    dataSource: smartDefaults.source
  };
}

export function generatePricingStrategies(
  cogs: number, 
  competitorPrices: number[], 
  category: ProductCategory,
  platformFees: number
) {
  const sortedPrices = [...competitorPrices].sort((a, b) => a - b);
  const p25 = sortedPrices[Math.floor(sortedPrices.length * 0.25)] || cogs * 2;
  const p50 = sortedPrices[Math.floor(sortedPrices.length * 0.5)] || cogs * 2.5;
  const p75 = sortedPrices[Math.floor(sortedPrices.length * 0.75)] || cogs * 3;

  const calculateMetrics = (price: number, roas: number) => {
    const totalCosts = cogs + platformFees + (price * 0.029 + 0.30); // Platform + processing fees
    const profit = price - totalCosts;
    const margin = (profit / price) * 100;
    const breakEven = totalCosts;
    const targetCPC = profit / roas;
    const requiredConversion = (targetCPC / profit) * 100;

    return {
      breakEven,
      targetCPC: Math.max(0.1, targetCPC),
      profitPerUnit: profit,
      requiredConversion: Math.max(0.5, requiredConversion),
      margin
    };
  };

  const conservativeMetrics = calculateMetrics(Math.max(p75, cogs * 2.5), 3.2);
  const marketMetrics = calculateMetrics(Math.max(p50, cogs * 2), 2.1);
  const aggressiveMetrics = calculateMetrics(Math.max(p25, cogs * 1.5), 1.6);

  return [
    {
      name: 'Conservative' as const,
      sellingPrice: Math.max(p75, cogs * 2.5),
      estimatedROAS: 3.2,
      riskLevel: 'Low' as const,
      description: 'Premium positioning with healthy margins and lower competition risk',
      monthlyVolume: 'Lower volume (50-150 units), focus on profitability',
      estimatedMargin: conservativeMetrics.margin,
      metrics: {
        breakEven: conservativeMetrics.breakEven,
        targetCPC: conservativeMetrics.targetCPC,
        profitPerUnit: conservativeMetrics.profitPerUnit,
        requiredConversion: conservativeMetrics.requiredConversion
      }
    },
    {
      name: 'Market' as const,
      sellingPrice: Math.max(p50, cogs * 2),
      estimatedROAS: 2.1,
      riskLevel: 'Medium' as const,
      description: 'Competitive pricing aligned with market standards',
      monthlyVolume: 'Balanced volume (150-400 units), sustainable growth',
      estimatedMargin: marketMetrics.margin,
      metrics: {
        breakEven: marketMetrics.breakEven,
        targetCPC: marketMetrics.targetCPC,
        profitPerUnit: marketMetrics.profitPerUnit,
        requiredConversion: marketMetrics.requiredConversion
      }
    },
    {
      name: 'Aggressive' as const,
      sellingPrice: Math.max(p25, cogs * 1.5),
      estimatedROAS: 1.6,
      riskLevel: 'High' as const,
      description: 'Volume-focused strategy requiring excellent execution',
      monthlyVolume: 'High volume (400+ units), requires scale efficiency',
      estimatedMargin: aggressiveMetrics.margin,
      metrics: {
        breakEven: aggressiveMetrics.breakEven,
        targetCPC: aggressiveMetrics.targetCPC,
        profitPerUnit: aggressiveMetrics.profitPerUnit,
        requiredConversion: aggressiveMetrics.requiredConversion
      }
    }
  ];
}