interface MarginCalculatorInput {
  price: number;
  cogs: number;
  platform: 'amazon' | 'tiktok' | 'shopify' | 'etsy';
  weight_oz: number;
  shipping_method: 'calculated' | 'flat';
  flat_shipping_cost?: number;
  packaging_cost?: number;
  return_rate?: number;
  recovery_rate?: number;
  ad_spend: {
    conversion_rate: number;
    cpc: number;
  };
}

interface AnalysisResult {
  id: string;
  product: {
    name: string;
    image: string;
    description: string;
    supplier_price: number;
    category: string;
  };
  margins: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
  costs: {
    product_cost: number;
    shipping: number;
    platform_fees: number;
    ad_spend: number;
    returns: number;
    processing: number;
  };
  competitors: Array<{
    platform: string;
    price: number;
    rating: number;
    reviews: number;
  }>;
  market: {
    saturation: number;
    trend_score: number;
    seasonality: string;
  };
  bundles: Array<{
    products: string[];
    margin_increase: number;
    confidence: number;
  }>;
  recommendation: {
    verdict: 'GO' | 'CAUTION' | 'NO-GO';
    reasoning: string;
    confidence: number;
  };
  levers: Array<{
    category: string;
    impact: string;
    suggestion: string;
    potential_savings: number;
  }>;
  breakeven_price: number;
  roas: number;
  target_cpc: number;
}

export function compute(input: MarginCalculatorInput): AnalysisResult {
  // Default values
  const packaging_cost = input.packaging_cost ?? 0.50;
  const return_rate = input.return_rate ?? 0.05;
  const recovery_rate = input.recovery_rate ?? 0;

  // Platform fees
  const platformFeeRates = {
    amazon: 0.15,
    tiktok: 0.08,
    etsy: 0.065,
    shopify: 0.0
  };
  
  const platform_fees = input.price * platformFeeRates[input.platform];

  // Payment processing: 2.9% + $0.30
  const processing_fees = input.price * 0.029 + 0.30;

  // Shipping costs based on weight tiers
  let shipping_cost: number;
  if (input.shipping_method === 'flat' && input.flat_shipping_cost) {
    shipping_cost = input.flat_shipping_cost;
  } else {
    if (input.weight_oz <= 4) {
      shipping_cost = 4.50;
    } else if (input.weight_oz <= 8) {
      shipping_cost = 5.50;
    } else if (input.weight_oz <= 16) {
      shipping_cost = 6.50;
    } else {
      shipping_cost = 9.50;
    }
  }

  // Returns allowance
  const returns_cost = return_rate * (input.cogs + shipping_cost) * (1 - recovery_rate);

  // Ad spend per order
  const ad_spend_per_order = input.ad_spend.cpc / input.ad_spend.conversion_rate;

  // Total costs
  const total_product_cost = input.cogs + packaging_cost;
  const total_costs = total_product_cost + shipping_cost + platform_fees + processing_fees + returns_cost + ad_spend_per_order;

  // Profit and margin
  const profit = input.price - total_costs;
  const margin_percent = (profit / input.price) * 100;

  // Breakeven calculations
  const breakeven_price = total_costs;
  const roas = input.price / ad_spend_per_order;
  const target_cpc = input.ad_spend.conversion_rate * profit * 0.3; // Target 30% of profit for ads

  // Generate improvement levers based on cost analysis
  const levers = generateImprovementLevers({
    product_cost: total_product_cost,
    shipping: shipping_cost,
    platform_fees,
    processing: processing_fees,
    returns: returns_cost,
    ad_spend: ad_spend_per_order,
    total_costs,
    price: input.price,
    platform: input.platform,
    weight_oz: input.weight_oz,
    return_rate,
    cpc: input.ad_spend.cpc,
    conversion_rate: input.ad_spend.conversion_rate
  });

  // Determine verdict
  let verdict: 'GO' | 'CAUTION' | 'NO-GO';
  let reasoning: string;
  let confidence: number;

  if (margin_percent >= 25) {
    verdict = 'GO';
    reasoning = `Strong margin of ${margin_percent.toFixed(1)}% provides good profitability and room for scaling.`;
    confidence = 85;
  } else if (margin_percent >= 15) {
    verdict = 'CAUTION';
    reasoning = `Moderate margin of ${margin_percent.toFixed(1)}%. Consider optimizing costs before scaling.`;
    confidence = 70;
  } else if (margin_percent >= 5) {
    verdict = 'CAUTION';
    reasoning = `Thin margin of ${margin_percent.toFixed(1)}%. High risk - optimize costs or increase price.`;
    confidence = 50;
  } else {
    verdict = 'NO-GO';
    reasoning = `Negative or very low margin (${margin_percent.toFixed(1)}%). Not viable without significant changes.`;
    confidence = 90;
  }

  return {
    id: `analysis-${Date.now()}`,
    product: {
      name: 'Product Analysis',
      image: '/placeholder.svg',
      description: 'Unit economics analysis',
      supplier_price: input.cogs,
      category: 'General'
    },
    margins: {
      conservative: Math.max(margin_percent - 5, 0),
      moderate: margin_percent,
      aggressive: margin_percent + 3
    },
    costs: {
      product_cost: total_product_cost,
      shipping: shipping_cost,
      platform_fees,
      ad_spend: ad_spend_per_order,
      returns: returns_cost,
      processing: processing_fees
    },
    competitors: [], // This would be populated by external data
    market: {
      saturation: 60,
      trend_score: 75,
      seasonality: 'Stable'
    },
    bundles: [], // This would be populated by ML analysis
    recommendation: {
      verdict,
      reasoning,
      confidence
    },
    levers,
    breakeven_price,
    roas,
    target_cpc
  };
}

function generateImprovementLevers(data: {
  product_cost: number;
  shipping: number;
  platform_fees: number;
  processing: number;
  returns: number;
  ad_spend: number;
  total_costs: number;
  price: number;
  platform: string;
  weight_oz: number;
  return_rate: number;
  cpc: number;
  conversion_rate: number;
}): Array<{
  category: string;
  impact: string;
  suggestion: string;
  potential_savings: number;
}> {
  const levers = [];

  // Analyze each cost category for improvement opportunities
  const costBreakdown = [
    { category: 'Product Cost', amount: data.product_cost, percentage: (data.product_cost / data.total_costs) * 100 },
    { category: 'Shipping', amount: data.shipping, percentage: (data.shipping / data.total_costs) * 100 },
    { category: 'Platform Fees', amount: data.platform_fees, percentage: (data.platform_fees / data.total_costs) * 100 },
    { category: 'Ad Spend', amount: data.ad_spend, percentage: (data.ad_spend / data.total_costs) * 100 },
    { category: 'Returns', amount: data.returns, percentage: (data.returns / data.total_costs) * 100 },
    { category: 'Processing', amount: data.processing, percentage: (data.processing / data.total_costs) * 100 }
  ];

  // Sort by highest cost impact
  costBreakdown.sort((a, b) => b.amount - a.amount);

  // Top 3 improvement opportunities
  const topCosts = costBreakdown.slice(0, 3);

  topCosts.forEach(cost => {
    switch (cost.category) {
      case 'Product Cost':
        if (cost.percentage > 40) {
          levers.push({
            category: 'Sourcing',
            impact: 'High',
            suggestion: 'Negotiate with suppliers or find alternative sourcing to reduce COGS by 10-15%',
            potential_savings: data.product_cost * 0.125
          });
        }
        break;
      
      case 'Ad Spend':
        if (cost.percentage > 20) {
          levers.push({
            category: 'Marketing',
            impact: 'High',
            suggestion: `Improve conversion rate from ${(data.conversion_rate * 100).toFixed(1)}% to reduce cost per acquisition`,
            potential_savings: data.ad_spend * 0.3
          });
        }
        break;
      
      case 'Shipping':
        if (data.weight_oz > 8) {
          levers.push({
            category: 'Logistics',
            impact: 'Medium',
            suggestion: 'Optimize packaging to reduce weight below 8oz and save on shipping costs',
            potential_savings: data.shipping * 0.2
          });
        }
        break;
      
      case 'Platform Fees':
        if (data.platform === 'amazon') {
          levers.push({
            category: 'Channel',
            impact: 'Medium',
            suggestion: 'Consider multi-channel approach - TikTok Shop has lower fees (8% vs 15%)',
            potential_savings: data.platform_fees * 0.47
          });
        }
        break;
      
      case 'Returns':
        if (data.return_rate > 0.08) {
          levers.push({
            category: 'Quality',
            impact: 'Medium',
            suggestion: 'Improve product quality and descriptions to reduce return rate',
            potential_savings: data.returns * 0.5
          });
        }
        break;
    }
  });

  // Price optimization lever
  const currentMargin = ((data.price - data.total_costs) / data.price) * 100;
  if (currentMargin < 20) {
    levers.push({
      category: 'Pricing',
      impact: 'High',
      suggestion: `Increase price by 10-15% to improve margin from ${currentMargin.toFixed(1)}% to 25%+`,
      potential_savings: data.price * 0.125
    });
  }

  return levers.slice(0, 3); // Return top 3 levers
}