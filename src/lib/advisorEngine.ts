interface AdvisorInput {
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
  market: {
    saturation: number;
    trend_score: number;
    seasonality: string;
  };
  competitors: Array<{
    platform: string;
    price: number;
    rating: number;
    reviews: number;
  }>;
  breakeven_price: number;
  roas: number;
  target_cpc: number;
  product: {
    name: string;
    category: string;
    supplier_price: number;
  };
}

interface PricingStrategy {
  strategy: 'conservative' | 'market' | 'aggressive';
  price: number;
  margin: number;
  roas_target: number;
  volume_expectation: string;
  risk_level: 'low' | 'medium' | 'high';
  rationale: string;
}

interface Risk {
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
  impact_score: number;
}

interface SuccessMetric {
  metric: string;
  target: string;
  checkpoint: string;
  frequency: string;
}

interface AdvisorOutput {
  confidence_score: number;
  pricing_strategies: PricingStrategy[];
  top_risks: Risk[];
  success_metrics: SuccessMetric[];
  overall_recommendation: {
    verdict: 'GO' | 'CAUTION' | 'NO-GO';
    reasoning: string;
    action_plan: string[];
  };
}

export function generateAdvisory(input: AdvisorInput): AdvisorOutput {
  const competitorPrices = input.competitors.map(c => c.price).sort((a, b) => a - b);
  const p25 = percentile(competitorPrices, 0.25);
  const p50 = percentile(competitorPrices, 0.5);
  const p75 = percentile(competitorPrices, 0.75);
  
  // Calculate data quality confidence
  const confidence_score = calculateConfidenceScore(input);
  
  // Generate three pricing strategies
  const pricing_strategies: PricingStrategy[] = [
    {
      strategy: 'conservative',
      price: p75 || input.breakeven_price * 1.4,
      margin: input.margins.conservative,
      roas_target: 3.0,
      volume_expectation: 'Lower volume, higher margin per unit',
      risk_level: 'low',
      rationale: 'Premium positioning reduces competition risk, ensures healthy margins'
    },
    {
      strategy: 'market',
      price: p50 || input.breakeven_price * 1.25,
      margin: input.margins.moderate,
      roas_target: getCategoryStandardROAS(input.product.category),
      volume_expectation: 'Balanced volume and margin approach',
      risk_level: 'medium',
      rationale: 'Market-aligned pricing for competitive positioning'
    },
    {
      strategy: 'aggressive',
      price: p25 || input.breakeven_price * 1.1,
      margin: input.margins.aggressive,
      roas_target: 1.5,
      volume_expectation: 'High volume required to compensate for lower margins',
      risk_level: 'high',
      rationale: 'Volume-focused strategy requiring excellent execution'
    }
  ];

  // Identify top 3 risks
  const top_risks = generateRiskAssessment(input, pricing_strategies);
  
  // Define success metrics
  const success_metrics = generateSuccessMetrics(input);
  
  // Overall recommendation
  const overall_recommendation = generateOverallRecommendation(input, pricing_strategies, confidence_score);

  return {
    confidence_score,
    pricing_strategies,
    top_risks,
    success_metrics,
    overall_recommendation
  };
}

function percentile(arr: number[], p: number): number | null {
  if (arr.length === 0) return null;
  const index = Math.ceil(arr.length * p) - 1;
  return arr[index];
}

function calculateConfidenceScore(input: AdvisorInput): number {
  let score = 0;
  
  // Competitor data quality (40% of confidence)
  const competitorCount = input.competitors.length;
  if (competitorCount >= 10) score += 40;
  else if (competitorCount >= 5) score += 30;
  else if (competitorCount >= 3) score += 20;
  else score += 10;
  
  // Market data quality (30% of confidence)
  if (input.market.trend_score > 0) score += 15;
  if (input.market.saturation > 0) score += 15;
  
  // Financial data completeness (30% of confidence)
  if (input.roas > 0) score += 10;
  if (input.breakeven_price > 0) score += 10;
  if (input.costs.ad_spend > 0) score += 10;
  
  return Math.min(score, 100);
}

function getCategoryStandardROAS(category: string): number {
  const categoryROAS: Record<string, number> = {
    'Electronics': 2.5,
    'Clothing': 2.0,
    'Beauty': 2.8,
    'Home & Garden': 2.2,
    'Sports': 2.3,
    'Books': 1.8,
    'Health': 2.6,
    'General': 2.4
  };
  
  return categoryROAS[category] || 2.4;
}

function generateRiskAssessment(input: AdvisorInput, strategies: PricingStrategy[]): Risk[] {
  const risks: Risk[] = [];
  
  // Market saturation risk
  if (input.market.saturation > 70) {
    risks.push({
      category: 'Market Competition',
      severity: 'high',
      description: `High market saturation (${input.market.saturation}%) indicates intense competition`,
      mitigation: 'Focus on unique value propositions, superior customer service, or niche targeting',
      impact_score: 8
    });
  }
  
  // Low margin risk
  const avgMargin = (input.margins.conservative + input.margins.moderate + input.margins.aggressive) / 3;
  if (avgMargin < 15) {
    risks.push({
      category: 'Profitability',
      severity: 'high',
      description: `Low average margin (${avgMargin.toFixed(1)}%) leaves little room for error`,
      mitigation: 'Negotiate better COGS, optimize shipping, or increase prices',
      impact_score: 9
    });
  }
  
  // High ad spend risk
  const adSpendRatio = input.costs.ad_spend / (input.costs.product_cost + input.costs.shipping + input.costs.platform_fees);
  if (adSpendRatio > 2) {
    risks.push({
      category: 'Customer Acquisition',
      severity: 'high',
      description: 'High advertising costs relative to other expenses',
      mitigation: 'Improve organic reach, optimize ad targeting, build brand awareness',
      impact_score: 7
    });
  }
  
  // Market trend risk
  if (input.market.trend_score < 40) {
    risks.push({
      category: 'Market Demand',
      severity: 'medium',
      description: `Declining market trend (${input.market.trend_score}% score)`,
      mitigation: 'Monitor demand closely, prepare exit strategy, diversify product line',
      impact_score: 6
    });
  }
  
  // Competitor pricing pressure
  const competitorPrices = input.competitors.map(c => c.price);
  const minCompetitorPrice = Math.min(...competitorPrices);
  if (minCompetitorPrice < input.breakeven_price * 1.1) {
    risks.push({
      category: 'Price Competition',
      severity: 'medium',
      description: 'Competitors pricing near your breakeven point',
      mitigation: 'Differentiate through quality, service, or bundling strategies',
      impact_score: 5
    });
  }
  
  // Return top 3 highest impact risks
  return risks.sort((a, b) => b.impact_score - a.impact_score).slice(0, 3);
}

function generateSuccessMetrics(input: AdvisorInput): SuccessMetric[] {
  return [
    {
      metric: 'ROAS (Return on Ad Spend)',
      target: `≥ ${getCategoryStandardROAS(input.product.category).toFixed(1)}x`,
      checkpoint: 'Review weekly, optimize monthly',
      frequency: 'Weekly'
    },
    {
      metric: 'Conversion Rate',
      target: '≥ 2.0%',
      checkpoint: 'A/B test landing pages if below target',
      frequency: 'Bi-weekly'
    },
    {
      metric: 'Customer Acquisition Cost (CAC)',
      target: `≤ $${(input.costs.ad_spend * 0.8).toFixed(2)}`,
      checkpoint: 'Optimize targeting and creative if exceeding',
      frequency: 'Weekly'
    },
    {
      metric: 'Gross Margin',
      target: '≥ 25%',
      checkpoint: 'Renegotiate costs if margin deteriorates',
      frequency: 'Monthly'
    }
  ];
}

function generateOverallRecommendation(
  input: AdvisorInput, 
  strategies: PricingStrategy[], 
  confidence: number
): { verdict: 'GO' | 'CAUTION' | 'NO-GO', reasoning: string, action_plan: string[] } {
  const avgMargin = (input.margins.conservative + input.margins.moderate + input.margins.aggressive) / 3;
  const marketHealth = input.market.trend_score + (100 - input.market.saturation);
  
  let verdict: 'GO' | 'CAUTION' | 'NO-GO';
  let reasoning: string;
  let action_plan: string[];
  
  if (avgMargin > 25 && marketHealth > 100 && input.roas > 2.0) {
    verdict = 'GO';
    reasoning = 'Strong margins, healthy market conditions, and positive ROAS indicate good opportunity';
    action_plan = [
      'Start with market pricing strategy',
      'Monitor competitor responses closely',
      'Scale ad spend gradually while maintaining ROAS targets',
      'Prepare inventory for volume growth'
    ];
  } else if (avgMargin > 10 && marketHealth > 80) {
    verdict = 'CAUTION';
    reasoning = 'Moderate opportunity with manageable risks - proceed with careful monitoring';
    action_plan = [
      'Begin with conservative pricing strategy',
      'Test market response with small inventory',
      'Optimize conversion rates before scaling',
      'Establish clear exit criteria'
    ];
  } else {
    verdict = 'NO-GO';
    reasoning = 'Low margins or challenging market conditions present high risk';
    action_plan = [
      'Improve unit economics before launch',
      'Find alternative suppliers to reduce COGS',
      'Consider different product variations',
      'Reassess market timing'
    ];
  }
  
  return { verdict, reasoning, action_plan };
}