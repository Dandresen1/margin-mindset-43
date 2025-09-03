interface BundleProduct {
  name: string;
  category: string;
  price: number;
  cogs: number;
  margin: number;
}

interface BundleRecommendation {
  id: string;
  title: string;
  products: BundleProduct[];
  bundle_price: number;
  individual_price: number;
  discount_percentage: number;
  margin_lift: number; // Actual profit increase, not just AOV
  feasibility_score: number; // 0-100 based on category compatibility
  inventory_complexity: number; // 1-5, higher = more complex
  confidence: number;
  reasoning: string;
  success_factors: string[];
  risks: string[];
}

interface CategoryAffinityMatrix {
  [key: string]: {
    [key: string]: {
      affinity: number; // 0-1, likelihood of co-purchase
      avg_bundle_size: number;
      margin_multiplier: number; // How bundling affects margins
    }
  }
}

// Co-purchase data based on market research and category behavior
const CATEGORY_AFFINITY: CategoryAffinityMatrix = {
  electronics: {
    electronics: { affinity: 0.7, avg_bundle_size: 2.3, margin_multiplier: 1.15 },
    automotive: { affinity: 0.4, avg_bundle_size: 2.0, margin_multiplier: 1.10 },
    home: { affinity: 0.3, avg_bundle_size: 2.1, margin_multiplier: 1.05 }
  },
  beauty: {
    beauty: { affinity: 0.8, avg_bundle_size: 3.2, margin_multiplier: 1.25 },
    health: { affinity: 0.6, avg_bundle_size: 2.5, margin_multiplier: 1.20 },
    clothing: { affinity: 0.4, avg_bundle_size: 2.0, margin_multiplier: 1.08 }
  },
  clothing: {
    clothing: { affinity: 0.9, avg_bundle_size: 2.8, margin_multiplier: 1.30 },
    jewelry: { affinity: 0.7, avg_bundle_size: 2.2, margin_multiplier: 1.18 },
    beauty: { affinity: 0.4, avg_bundle_size: 2.1, margin_multiplier: 1.10 }
  },
  home: {
    home: { affinity: 0.6, avg_bundle_size: 2.5, margin_multiplier: 1.12 },
    electronics: { affinity: 0.3, avg_bundle_size: 2.0, margin_multiplier: 1.05 }
  },
  jewelry: {
    jewelry: { affinity: 0.5, avg_bundle_size: 2.0, margin_multiplier: 1.15 },
    clothing: { affinity: 0.7, avg_bundle_size: 2.3, margin_multiplier: 1.20 },
    beauty: { affinity: 0.4, avg_bundle_size: 2.0, margin_multiplier: 1.08 }
  },
  sports: {
    sports: { affinity: 0.8, avg_bundle_size: 2.4, margin_multiplier: 1.18 },
    health: { affinity: 0.6, avg_bundle_size: 2.2, margin_multiplier: 1.15 },
    clothing: { affinity: 0.5, avg_bundle_size: 2.1, margin_multiplier: 1.10 }
  },
  health: {
    health: { affinity: 0.7, avg_bundle_size: 2.6, margin_multiplier: 1.22 },
    beauty: { affinity: 0.6, avg_bundle_size: 2.3, margin_multiplier: 1.18 },
    sports: { affinity: 0.5, avg_bundle_size: 2.0, margin_multiplier: 1.12 }
  },
  toys: {
    toys: { affinity: 0.6, avg_bundle_size: 2.4, margin_multiplier: 1.15 },
    books: { affinity: 0.4, avg_bundle_size: 2.0, margin_multiplier: 1.08 }
  },
  books: {
    books: { affinity: 0.3, avg_bundle_size: 1.8, margin_multiplier: 1.05 }
  },
  automotive: {
    automotive: { affinity: 0.7, avg_bundle_size: 2.2, margin_multiplier: 1.16 },
    electronics: { affinity: 0.4, avg_bundle_size: 2.0, margin_multiplier: 1.08 }
  }
};

export function generateBundleRecommendations(
  primaryProduct: BundleProduct,
  availableProducts: BundleProduct[] = [],
  targetMarginLift: number = 15 // Minimum % margin lift required
): BundleRecommendation[] {
  const recommendations: BundleRecommendation[] = [];
  
  // Filter products that could work in bundles with the primary product
  const compatibleProducts = availableProducts.filter(product => 
    product.name !== primaryProduct.name &&
    getAffinityScore(primaryProduct.category, product.category) > 0.3
  );
  
  // Generate single-product bundles (primary + one other)
  compatibleProducts.forEach(secondaryProduct => {
    const bundle = createBundle([primaryProduct, secondaryProduct], targetMarginLift);
    if (bundle && bundle.margin_lift >= targetMarginLift) {
      recommendations.push(bundle);
    }
  });
  
  // Generate multi-product bundles for high-affinity categories
  if (compatibleProducts.length >= 2) {
    const topCompatible = compatibleProducts
      .sort((a, b) => getAffinityScore(primaryProduct.category, b.category) - 
                      getAffinityScore(primaryProduct.category, a.category))
      .slice(0, 3);
    
    // Try combinations of 3 products
    for (let i = 0; i < topCompatible.length - 1; i++) {
      for (let j = i + 1; j < topCompatible.length; j++) {
        const bundle = createBundle([primaryProduct, topCompatible[i], topCompatible[j]], targetMarginLift);
        if (bundle && bundle.margin_lift >= targetMarginLift) {
          recommendations.push(bundle);
        }
      }
    }
  }
  
  // Sort by feasibility score and margin lift
  return recommendations
    .sort((a, b) => (b.feasibility_score * b.margin_lift) - (a.feasibility_score * a.margin_lift))
    .slice(0, 5); // Return top 5 recommendations
}

function createBundle(products: BundleProduct[], targetMarginLift: number): BundleRecommendation | null {
  if (products.length < 2) return null;
  
  const primaryProduct = products[0];
  const secondaryProducts = products.slice(1);
  
  // Calculate pricing strategy
  const individual_price = products.reduce((sum, p) => sum + p.price, 0);
  const total_cogs = products.reduce((sum, p) => sum + p.cogs, 0);
  
  // Calculate optimal bundle discount (typically 10-25%)
  const categories = products.map(p => p.category);
  const avgAffinity = calculateAverageAffinity(categories);
  const optimalDiscount = Math.min(0.25, Math.max(0.05, avgAffinity * 0.3));
  
  const bundle_price = individual_price * (1 - optimalDiscount);
  const discount_percentage = optimalDiscount * 100;
  
  // Calculate true margin lift (not just revenue increase)
  const individualMargin = products.reduce((sum, p) => sum + (p.price - p.cogs), 0);
  const bundleMargin = bundle_price - total_cogs;
  const margin_lift = ((bundleMargin - individualMargin) / individualMargin) * 100;
  
  // Calculate feasibility score
  const feasibility_score = calculateFeasibilityScore(products, avgAffinity);
  
  // Calculate inventory complexity
  const inventory_complexity = calculateInventoryComplexity(products);
  
  // Don't recommend if margin lift is negative or feasibility is too low
  if (margin_lift < 0 || feasibility_score < 30) return null;
  
  const confidence = Math.min(95, feasibility_score + (margin_lift > targetMarginLift ? 20 : 0));
  
  return {
    id: `bundle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: generateBundleTitle(products),
    products,
    bundle_price: Math.round(bundle_price * 100) / 100,
    individual_price: Math.round(individual_price * 100) / 100,
    discount_percentage: Math.round(discount_percentage * 10) / 10,
    margin_lift: Math.round(margin_lift * 10) / 10,
    feasibility_score: Math.round(feasibility_score),
    inventory_complexity,
    confidence: Math.round(confidence),
    reasoning: generateBundleReasoning(products, margin_lift, avgAffinity),
    success_factors: generateSuccessFactors(products, avgAffinity),
    risks: generateBundleRisks(products, inventory_complexity)
  };
}

function getAffinityScore(category1: string, category2: string): number {
  const affinity1 = CATEGORY_AFFINITY[category1]?.[category2]?.affinity || 0;
  const affinity2 = CATEGORY_AFFINITY[category2]?.[category1]?.affinity || 0;
  return Math.max(affinity1, affinity2);
}

function calculateAverageAffinity(categories: string[]): number {
  let totalAffinity = 0;
  let pairCount = 0;
  
  for (let i = 0; i < categories.length - 1; i++) {
    for (let j = i + 1; j < categories.length; j++) {
      totalAffinity += getAffinityScore(categories[i], categories[j]);
      pairCount++;
    }
  }
  
  return pairCount > 0 ? totalAffinity / pairCount : 0;
}

function calculateFeasibilityScore(products: BundleProduct[], affinity: number): number {
  let score = affinity * 100; // Base score from affinity
  
  // Adjust for price compatibility (products should be somewhat similar in price range)
  const prices = products.map(p => p.price);
  const priceRange = Math.max(...prices) - Math.min(...prices);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const priceVariability = priceRange / avgPrice;
  
  if (priceVariability > 2) score -= 20; // High price variability hurts bundling
  else if (priceVariability < 0.5) score += 10; // Similar prices are good for bundling
  
  // Adjust for margin compatibility
  const margins = products.map(p => p.margin);
  const marginRange = Math.max(...margins) - Math.min(...margins);
  if (marginRange > 30) score -= 15; // Very different margins complicate bundling
  
  // Bonus for complementary products (same category often works well)
  const uniqueCategories = new Set(products.map(p => p.category)).size;
  if (uniqueCategories === 1) score += 15; // Same category bonus
  else if (uniqueCategories === products.length) score += 5; // Diverse but compatible
  
  return Math.max(0, Math.min(100, score));
}

function calculateInventoryComplexity(products: BundleProduct[]): number {
  let complexity = 1;
  
  // More products = more complexity
  complexity += (products.length - 2) * 0.5;
  
  // Different categories = more complexity
  const uniqueCategories = new Set(products.map(p => p.category)).size;
  complexity += (uniqueCategories - 1) * 0.3;
  
  // Wide price ranges = more complexity
  const prices = products.map(p => p.price);
  const priceRange = Math.max(...prices) - Math.min(...prices);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  if (priceRange / avgPrice > 1) complexity += 0.5;
  
  return Math.min(5, Math.max(1, Math.round(complexity * 10) / 10));
}

function generateBundleTitle(products: BundleProduct[]): string {
  if (products.length === 2) {
    return `${products[0].name} + ${products[1].name} Bundle`;
  } else if (products.length === 3) {
    return `${products[0].name} Complete Set (${products.length} items)`;
  } else {
    const primaryCategory = products[0].category;
    return `Ultimate ${primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1)} Bundle`;
  }
}

function generateBundleReasoning(products: BundleProduct[], marginLift: number, affinity: number): string {
  const reasons = [];
  
  if (affinity > 0.7) {
    reasons.push("High customer affinity between these product categories");
  } else if (affinity > 0.4) {
    reasons.push("Good compatibility for cross-selling opportunities");
  }
  
  if (marginLift > 20) {
    reasons.push(`Strong margin improvement of ${marginLift.toFixed(1)}%`);
  } else if (marginLift > 10) {
    reasons.push(`Solid margin lift potential`);
  }
  
  const uniqueCategories = new Set(products.map(p => p.category)).size;
  if (uniqueCategories === 1) {
    reasons.push("Same category products naturally complement each other");
  }
  
  return reasons.join(". ") + ".";
}

function generateSuccessFactors(products: BundleProduct[], affinity: number): string[] {
  const factors = [
    "Market the bundle as a complete solution",
    "Highlight the savings compared to individual purchases"
  ];
  
  if (affinity > 0.6) {
    factors.push("Leverage natural customer buying patterns");
  }
  
  if (products.length <= 3) {
    factors.push("Simple bundle structure reduces customer decision fatigue");
  }
  
  const avgMargin = products.reduce((sum, p) => sum + p.margin, 0) / products.length;
  if (avgMargin > 25) {
    factors.push("Healthy margins provide pricing flexibility");
  }
  
  return factors;
}

function generateBundleRisks(products: BundleProduct[], complexity: number): string[] {
  const risks = [];
  
  if (complexity >= 4) {
    risks.push("High inventory complexity may complicate fulfillment");
  } else if (complexity >= 3) {
    risks.push("Moderate inventory management overhead");
  }
  
  if (products.length >= 4) {
    risks.push("Multiple products increase potential return complexity");
  }
  
  const prices = products.map(p => p.price);
  const priceRange = Math.max(...prices) - Math.min(...prices);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  
  if (priceRange / avgPrice > 1.5) {
    risks.push("Significant price differences may confuse value proposition");
  }
  
  const uniqueCategories = new Set(products.map(p => p.category)).size;
  if (uniqueCategories === products.length && products.length > 2) {
    risks.push("Diverse categories may dilute marketing focus");
  }
  
  if (risks.length === 0) {
    risks.push("Low risk - well-matched product combination");
  }
  
  return risks;
}

// Utility function to create sample bundle products for testing
export function createSampleBundleProduct(
  name: string, 
  category: string, 
  price: number, 
  cogsPercentage: number = 30
): BundleProduct {
  const cogs = price * (cogsPercentage / 100);
  const margin = ((price - cogs) / price) * 100;
  
  return {
    name,
    category,
    price,
    cogs,
    margin
  };
}

export type { BundleRecommendation, BundleProduct };