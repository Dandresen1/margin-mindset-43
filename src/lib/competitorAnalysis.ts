interface CompetitorData {
  platform: string;
  price: number;
  rating: number;
  reviews: number;
  url?: string;
  title?: string;
  last_updated?: Date;
}

interface PriceDistribution {
  min: number;
  max: number;
  median: number;
  q1: number;
  q3: number;
  iqr: number;
  outliers: number[];
  sweet_spot?: {
    min: number;
    max: number;
    reasoning: string;
  };
}

interface CompetitiveInsight {
  category: string;
  insight: string;
  confidence: number;
  actionable: boolean;
}

interface CompetitorAnalysisResult {
  total_competitors: number;
  data_quality_score: number;
  price_distribution: PriceDistribution;
  competitive_insights: CompetitiveInsight[];
  market_positioning: {
    your_price: number;
    percentile_rank: number;
    position_type: 'budget' | 'value' | 'premium' | 'luxury';
    competitive_advantage: string;
  } | null;
  recommendations: string[];
}

// Cache for storing competitor data
const competitorCache = new Map<string, { data: CompetitorData[], timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export function analyzeCompetitors(
  competitors: CompetitorData[],
  yourPrice?: number,
  productCategory?: string
): CompetitorAnalysisResult {
  
  // Filter out invalid or suspicious data
  const validCompetitors = competitors.filter(isValidCompetitorData);
  
  // Calculate data quality score
  const data_quality_score = calculateDataQuality(validCompetitors);
  
  // Calculate price distribution statistics
  const price_distribution = calculatePriceDistribution(validCompetitors);
  
  // Generate competitive insights
  const competitive_insights = generateCompetitiveInsights(validCompetitors, productCategory);
  
  // Analyze market positioning if user price provided
  const market_positioning = yourPrice ? 
    analyzeMarketPositioning(validCompetitors, yourPrice) : null;
  
  // Generate actionable recommendations
  const recommendations = generateRecommendations(
    validCompetitors, 
    price_distribution, 
    market_positioning,
    data_quality_score
  );

  return {
    total_competitors: validCompetitors.length,
    data_quality_score,
    price_distribution,
    competitive_insights,
    market_positioning,
    recommendations
  };
}

function isValidCompetitorData(competitor: CompetitorData): boolean {
  // Basic validation rules
  if (!competitor.price || competitor.price <= 0) return false;
  if (competitor.rating && (competitor.rating < 1 || competitor.rating > 5)) return false;
  if (competitor.reviews && competitor.reviews < 0) return false;
  
  // Price reasonableness check (remove extreme outliers)
  const prices = [competitor.price];
  const median = prices[0]; // For single item, this would need actual competitor data
  if (competitor.price > median * 10 || competitor.price < median * 0.1) return false;
  
  return true;
}

function calculateDataQuality(competitors: CompetitorData[]): number {
  if (competitors.length === 0) return 0;
  
  let qualityScore = 0;
  const totalPossible = 100;
  
  // Quantity score (40% of total)
  const quantityScore = Math.min((competitors.length / 10) * 40, 40);
  qualityScore += quantityScore;
  
  // Data completeness score (30% of total)
  const completeRecords = competitors.filter(c => 
    c.price && c.rating && c.reviews && c.platform
  ).length;
  const completenessScore = (completeRecords / competitors.length) * 30;
  qualityScore += completenessScore;
  
  // Recency score (20% of total) - assume data is recent if no timestamp
  const recentRecords = competitors.filter(c => {
    if (!c.last_updated) return true; // Assume recent if not specified
    const daysSinceUpdate = (Date.now() - c.last_updated.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate <= 7;
  }).length;
  const recencyScore = (recentRecords / competitors.length) * 20;
  qualityScore += recencyScore;
  
  // Diversity score (10% of total)
  const uniquePlatforms = new Set(competitors.map(c => c.platform)).size;
  const diversityScore = Math.min((uniquePlatforms / 3) * 10, 10);
  qualityScore += diversityScore;
  
  return Math.round(qualityScore);
}

function calculatePriceDistribution(competitors: CompetitorData[]): PriceDistribution {
  const prices = competitors.map(c => c.price).sort((a, b) => a - b);
  
  if (prices.length === 0) {
    return {
      min: 0, max: 0, median: 0, q1: 0, q3: 0, iqr: 0, outliers: []
    };
  }
  
  const min = prices[0];
  const max = prices[prices.length - 1];
  const median = percentile(prices, 50);
  const q1 = percentile(prices, 25);
  const q3 = percentile(prices, 75);
  const iqr = q3 - q1;
  
  // Calculate outliers using IQR method
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = prices.filter(p => p < lowerBound || p > upperBound);
  
  // Calculate sweet spot only if we have sufficient data
  let sweet_spot: PriceDistribution['sweet_spot'];
  if (competitors.length >= 5) {
    sweet_spot = {
      min: q1,
      max: q3,
      reasoning: `Based on interquartile range from ${competitors.length} competitors. This represents the middle 50% of market pricing.`
    };
  }
  
  return {
    min, max, median, q1, q3, iqr, outliers, sweet_spot
  };
}

function generateCompetitiveInsights(
  competitors: CompetitorData[], 
  productCategory?: string
): CompetitiveInsight[] {
  const insights: CompetitiveInsight[] = [];
  
  if (competitors.length < 3) {
    insights.push({
      category: 'Data Limitation',
      insight: 'Limited competitor data available - insights may be incomplete',
      confidence: 30,
      actionable: false
    });
    return insights;
  }
  
  // Price clustering analysis
  const prices = competitors.map(c => c.price).sort((a, b) => a - b);
  const priceGaps = findPriceGaps(prices);
  
  if (priceGaps.length > 0) {
    insights.push({
      category: 'Pricing Opportunity',
      insight: `Price gaps identified at $${priceGaps[0].gap_start}-$${priceGaps[0].gap_end} range`,
      confidence: 75,
      actionable: true
    });
  }
  
  // Rating vs Price correlation
  const ratingPriceInsight = analyzeRatingPriceCorrelation(competitors);
  if (ratingPriceInsight) {
    insights.push(ratingPriceInsight);
  }
  
  // Market concentration
  const platformConcentration = analyzePlatformConcentration(competitors);
  if (platformConcentration) {
    insights.push(platformConcentration);
  }
  
  // Review volume analysis
  const reviewInsight = analyzeReviewPatterns(competitors);
  if (reviewInsight) {
    insights.push(reviewInsight);
  }
  
  return insights;
}

function findPriceGaps(sortedPrices: number[]): Array<{ gap_start: number, gap_end: number, size: number }> {
  const gaps: Array<{ gap_start: number, gap_end: number, size: number }> = [];
  
  for (let i = 1; i < sortedPrices.length; i++) {
    const gap = sortedPrices[i] - sortedPrices[i - 1];
    const avgPrice = (sortedPrices[i] + sortedPrices[i - 1]) / 2;
    
    // Consider it a significant gap if it's > 20% of average price
    if (gap > avgPrice * 0.2) {
      gaps.push({
        gap_start: sortedPrices[i - 1],
        gap_end: sortedPrices[i],
        size: gap
      });
    }
  }
  
  return gaps.sort((a, b) => b.size - a.size);
}

function analyzeRatingPriceCorrelation(competitors: CompetitorData[]): CompetitiveInsight | null {
  const withRatings = competitors.filter(c => c.rating && c.price);
  if (withRatings.length < 3) return null;
  
  // Simple correlation analysis
  const avgPrice = withRatings.reduce((sum, c) => sum + c.price, 0) / withRatings.length;
  const avgRating = withRatings.reduce((sum, c) => sum + c.rating, 0) / withRatings.length;
  
  const highPriceHighRating = withRatings.filter(c => c.price > avgPrice && c.rating > avgRating).length;
  const correlation = highPriceHighRating / withRatings.length;
  
  if (correlation > 0.7) {
    return {
      category: 'Quality Premium',
      insight: 'Strong correlation between price and ratings suggests quality-conscious market',
      confidence: 80,
      actionable: true
    };
  } else if (correlation < 0.3) {
    return {
      category: 'Value Opportunity',
      insight: 'Weak price-quality correlation suggests opportunity for value positioning',
      confidence: 70,
      actionable: true
    };
  }
  
  return null;
}

function analyzePlatformConcentration(competitors: CompetitorData[]): CompetitiveInsight | null {
  const platformCounts = competitors.reduce((acc, c) => {
    acc[c.platform] = (acc[c.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantPlatform = Object.entries(platformCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  const concentration = dominantPlatform[1] / competitors.length;
  
  if (concentration > 0.6) {
    return {
      category: 'Market Concentration',
      insight: `${dominantPlatform[0]} dominates with ${(concentration * 100).toFixed(0)}% of competitors`,
      confidence: 85,
      actionable: true
    };
  }
  
  return null;
}

function analyzeReviewPatterns(competitors: CompetitorData[]): CompetitiveInsight | null {
  const withReviews = competitors.filter(c => c.reviews && c.reviews > 0);
  if (withReviews.length < 3) return null;
  
  const avgReviews = withReviews.reduce((sum, c) => sum + c.reviews, 0) / withReviews.length;
  const highReviewProducts = withReviews.filter(c => c.reviews > avgReviews * 2).length;
  
  if (highReviewProducts > withReviews.length * 0.3) {
    return {
      category: 'Market Maturity',
      insight: 'Several established products with high review counts indicate mature market',
      confidence: 75,
      actionable: true
    };
  }
  
  return null;
}

function analyzeMarketPositioning(
  competitors: CompetitorData[], 
  yourPrice: number
): CompetitorAnalysisResult['market_positioning'] {
  const prices = competitors.map(c => c.price).sort((a, b) => a - b);
  
  // Calculate percentile rank
  const lowerCount = prices.filter(p => p < yourPrice).length;
  const percentile_rank = (lowerCount / prices.length) * 100;
  
  // Determine position type
  let position_type: 'budget' | 'value' | 'premium' | 'luxury';
  let competitive_advantage: string;
  
  if (percentile_rank <= 25) {
    position_type = 'budget';
    competitive_advantage = 'Price leader - compete on affordability and value for money';
  } else if (percentile_rank <= 50) {
    position_type = 'value';
    competitive_advantage = 'Value positioning - balance of price and quality';
  } else if (percentile_rank <= 80) {
    position_type = 'premium';
    competitive_advantage = 'Premium positioning - compete on quality, service, or brand';
  } else {
    position_type = 'luxury';
    competitive_advantage = 'Luxury positioning - emphasize exclusivity and superior experience';
  }
  
  return {
    your_price: yourPrice,
    percentile_rank,
    position_type,
    competitive_advantage
  };
}

function generateRecommendations(
  competitors: CompetitorData[],
  priceDistribution: PriceDistribution,
  positioning: CompetitorAnalysisResult['market_positioning'],
  dataQuality: number
): string[] {
  const recommendations: string[] = [];
  
  if (dataQuality < 50) {
    recommendations.push('Gather more competitor data for better insights - aim for 10+ data points');
  }
  
  if (competitors.length >= 5 && priceDistribution.sweet_spot) {
    recommendations.push(
      `Consider pricing within sweet spot: $${priceDistribution.sweet_spot.min.toFixed(2)}-$${priceDistribution.sweet_spot.max.toFixed(2)}`
    );
  }
  
  if (positioning) {
    switch (positioning.position_type) {
      case 'budget':
        recommendations.push('Focus on cost optimization and volume sales strategies');
        break;
      case 'value':
        recommendations.push('Emphasize quality-to-price ratio in marketing messages');
        break;
      case 'premium':
        recommendations.push('Invest in quality differentiation and brand building');
        break;
      case 'luxury':
        recommendations.push('Ensure product quality and service justify premium pricing');
        break;
    }
  }
  
  if (priceDistribution.outliers.length > 0) {
    const highOutliers = priceDistribution.outliers.filter(p => p > priceDistribution.q3);
    if (highOutliers.length > 0) {
      recommendations.push('Some competitors using premium pricing - investigate their value proposition');
    }
  }
  
  return recommendations;
}

function percentile(arr: number[], p: number): number {
  const index = Math.ceil((arr.length * p) / 100) - 1;
  return arr[Math.max(0, Math.min(index, arr.length - 1))];
}

// Export utility function for caching competitor data
export function cacheCompetitorData(productKey: string, data: CompetitorData[]): void {
  competitorCache.set(productKey, {
    data,
    timestamp: Date.now()
  });
}

export function getCachedCompetitorData(productKey: string): CompetitorData[] | null {
  const cached = competitorCache.get(productKey);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    competitorCache.delete(productKey);
    return null;
  }
  
  return cached.data;
}