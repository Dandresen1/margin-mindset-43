import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, DollarSign, BarChart3 } from 'lucide-react';

interface MetricsOverviewProps {
  breakeven_price?: number;
  roas?: number;
  target_cpc?: number;
  currentMargin?: number;
  levers?: Array<{
    category: string;
    impact: string;
    suggestion: string;
    potential_savings: number;
  }>;
}

export function MetricsOverview({ 
  breakeven_price, 
  roas, 
  target_cpc, 
  currentMargin,
  levers = []
}: MetricsOverviewProps) {
  if (!breakeven_price && !roas && !target_cpc && levers.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Key Metrics & Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        {(breakeven_price || roas || target_cpc) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {breakeven_price && (
              <div className="text-center p-4 rounded-lg bg-muted/20 border">
                <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-semibold">${breakeven_price.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Breakeven Price</div>
              </div>
            )}
            
            {roas && (
              <div className="text-center p-4 rounded-lg bg-muted/20 border">
                <TrendingUp className="h-6 w-6 text-success mx-auto mb-2" />
                <div className="text-lg font-semibold">{roas.toFixed(2)}x</div>
                <div className="text-sm text-muted-foreground">ROAS</div>
              </div>
            )}
            
            {target_cpc && (
              <div className="text-center p-4 rounded-lg bg-muted/20 border">
                <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-semibold">${target_cpc.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Target CPC</div>
              </div>
            )}
          </div>
        )}

        {/* Top Improvement Levers */}
        {levers.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Top Improvement Opportunities</h4>
            <div className="space-y-3">
              {levers.slice(0, 3).map((lever, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 border">
                  <Badge variant={lever.impact === 'High' ? 'default' : 'secondary'} className="mt-0.5">
                    {lever.impact}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{lever.category}</div>
                    <div className="text-sm text-muted-foreground mt-1">{lever.suggestion}</div>
                    <div className="text-xs text-success mt-1">
                      Potential savings: ${lever.potential_savings.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}