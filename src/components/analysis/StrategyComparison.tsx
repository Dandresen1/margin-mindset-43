import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { generateAdvisory } from '@/lib/advisorEngine';
import type { AnalysisData } from '@/hooks/useAnalysis';

interface StrategyComparisonProps {
  data: AnalysisData;
}

export function StrategyComparison({ data }: StrategyComparisonProps) {
  const advisory = React.useMemo(() => {
    if (!data.competitors || !data.market) return null;
    
    return generateAdvisory({
      margins: data.margins,
      costs: data.costs,
      market: data.market,
      competitors: data.competitors,
      breakeven_price: data.breakeven_price || 0,
      roas: data.roas || 0,
      target_cpc: data.target_cpc || 0,
      product: data.product
    });
  }, [data]);

  if (!advisory) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Strategy Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Insufficient data for strategic analysis</p>
        </CardContent>
      </Card>
    );
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'border-success/30 bg-success/5';
      case 'medium': return 'border-warning/30 bg-warning/5';
      case 'high': return 'border-destructive/30 bg-destructive/5';
      default: return 'border-border/30';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          AI Strategy Analysis
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Confidence: {advisory.confidence_score}%</Badge>
          <Badge variant={advisory.overall_recommendation.verdict === 'GO' ? 'default' : 'secondary'}>
            {advisory.overall_recommendation.verdict}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Strategies */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recommended Pricing Strategies
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {advisory.pricing_strategies.map((strategy, index) => (
              <div 
                key={strategy.strategy}
                className={`p-4 rounded-lg border ${getRiskColor(strategy.risk_level)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={index === 1 ? 'default' : 'secondary'}>
                    {strategy.strategy}
                  </Badge>
                  {getRiskIcon(strategy.risk_level)}
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">${strategy.price.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    Target ROAS: {strategy.roas_target.toFixed(1)}x
                  </div>
                  <div className="text-sm">
                    Margin: {strategy.margin.toFixed(1)}%
                  </div>
                  <div className="text-xs opacity-75">
                    {strategy.volume_expectation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div>
          <h4 className="font-semibold mb-4">Top Risk Factors</h4>
          <div className="space-y-3">
            {advisory.top_risks.map((risk, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted/10 border">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {getRiskIcon(risk.severity)}
                    <Badge variant="secondary" className="shrink-0">
                      {risk.category}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{risk.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Mitigation:</span> {risk.mitigation}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs">Impact:</span>
                      <Progress value={risk.impact_score * 10} className="h-1 flex-1 max-w-20" />
                      <span className="text-xs">{risk.impact_score}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <div>
          <h4 className="font-semibold mb-4">Success Metrics to Track</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisory.success_metrics.map((metric, index) => (
              <div key={index} className="p-3 rounded-lg border bg-muted/5">
                <div className="font-medium text-sm">{metric.metric}</div>
                <div className="text-lg font-bold text-success">{metric.target}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {metric.checkpoint}
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  Check {metric.frequency}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Recommendation */}
        <div className={`p-4 rounded-lg border ${
          advisory.overall_recommendation.verdict === 'GO' ? 'bg-success/10 border-success/20' :
          advisory.overall_recommendation.verdict === 'CAUTION' ? 'bg-warning/10 border-warning/20' :
          'bg-destructive/10 border-destructive/20'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={advisory.overall_recommendation.verdict === 'GO' ? 'default' : 'secondary'}>
              {advisory.overall_recommendation.verdict}
            </Badge>
            <span className="font-semibold">Final Recommendation</span>
          </div>
          <p className="text-sm mb-3">{advisory.overall_recommendation.reasoning}</p>
          <div className="space-y-1">
            <div className="font-medium text-sm">Action Plan:</div>
            {advisory.overall_recommendation.action_plan.map((action, index) => (
              <div key={index} className="text-sm flex items-start gap-2">
                <span className="text-primary font-bold">{index + 1}.</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}