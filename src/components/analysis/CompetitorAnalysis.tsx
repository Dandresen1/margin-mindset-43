import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Star, Users, AlertTriangle } from 'lucide-react';

interface CompetitorAnalysisProps {
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
}

export function CompetitorAnalysis({ competitors, market }: CompetitorAnalysisProps) {
  const avgPrice = competitors.reduce((sum, comp) => sum + comp.price, 0) / competitors.length;
  const maxPrice = Math.max(...competitors.map(comp => comp.price));
  const minPrice = Math.min(...competitors.map(comp => comp.price));
  
  const getSaturationColor = (saturation: number) => {
    if (saturation < 40) return 'text-success';
    if (saturation < 70) return 'text-warning';
    return 'text-destructive';
  };

  const getSaturationLabel = (saturation: number) => {
    if (saturation < 40) return 'Low Competition';
    if (saturation < 70) return 'Moderate Competition';
    return 'High Competition';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Market & Competition Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/10 border border-border/50 text-center">
            <div className="text-2xl font-bold text-primary">{market.trend_score}/10</div>
            <div className="text-sm text-muted-foreground">Trend Score</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/10 border border-border/50 text-center">
            <div className={`text-2xl font-bold ${getSaturationColor(market.saturation)}`}>
              {market.saturation}%
            </div>
            <div className="text-sm text-muted-foreground">Market Saturation</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/10 border border-border/50 text-center">
            <div className="text-lg font-bold">{market.seasonality}</div>
            <div className="text-sm text-muted-foreground">Seasonality</div>
          </div>
        </div>

        {/* Market Saturation Warning */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Market Saturation Level</span>
            <Badge variant={market.saturation < 40 ? 'default' : market.saturation < 70 ? 'secondary' : 'destructive'}>
              {getSaturationLabel(market.saturation)}
            </Badge>
          </div>
          <Progress value={market.saturation} className="h-3" />
          {market.saturation > 70 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold text-destructive">High Competition Warning</div>
                <div className="text-muted-foreground">
                  This market is highly saturated. Success will require exceptional differentiation or better pricing.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Competitor Pricing */}
        <div>
          <h4 className="font-semibold mb-4">Competitor Pricing Analysis</h4>
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-semibold">{competitor.platform}</div>
                    <div className="text-2xl font-bold text-primary">${competitor.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{competitor.rating}</span>
                    <span className="text-muted-foreground">({competitor.reviews} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={competitor.price < avgPrice ? 'destructive' : 'secondary'}>
                    {competitor.price < avgPrice ? 'Below Avg' : 'Above Avg'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/10 border border-border/50">
            <h4 className="font-semibold mb-2">Price Range</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Lowest:</span>
                <span className="font-semibold">${minPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average:</span>
                <span className="font-semibold">${avgPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Highest:</span>
                <span className="font-semibold">${maxPrice}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">Sweet Spot</h4>
            <div className="text-2xl font-bold">${(avgPrice * 1.1).toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">
              Competitive yet profitable pricing point
            </div>
          </div>
        </div>

        {/* Market Opportunities */}
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <h4 className="font-semibold text-success mb-3">Market Opportunities</h4>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success mt-2"></div>
              <span>Price gap between ${minPrice} and ${maxPrice} allows for competitive positioning</span>
            </li>
            {market.trend_score > 7 && (
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success mt-2"></div>
                <span>Strong trend score indicates growing demand</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success mt-2"></div>
              <span>Focus on better reviews and ratings to stand out from competition</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}