import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, Target } from 'lucide-react';

interface VerdictSectionProps {
  recommendation: {
    verdict: 'GO' | 'CAUTION' | 'NO-GO';
    reasoning: string;
    confidence: number;
  };
}

export function VerdictSection({ recommendation }: VerdictSectionProps) {
  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case 'GO':
        return {
          icon: CheckCircle,
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          badgeVariant: 'default' as const,
          badgeClass: 'bg-success text-success-foreground',
          title: 'Green Light!',
          subtitle: 'This product shows strong profit potential'
        };
      case 'CAUTION':
        return {
          icon: AlertCircle,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          badgeVariant: 'secondary' as const,
          badgeClass: 'bg-warning text-warning-foreground',
          title: 'Proceed with Caution',
          subtitle: 'Moderate risk - careful execution required'
        };
      case 'NO-GO':
        return {
          icon: XCircle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/20',
          badgeVariant: 'destructive' as const,
          badgeClass: '',
          title: 'High Risk',
          subtitle: 'This product likely won\'t be profitable'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/10',
          borderColor: 'border-muted/20',
          badgeVariant: 'secondary' as const,
          badgeClass: '',
          title: 'Analysis Incomplete',
          subtitle: 'Unable to determine profitability'
        };
    }
  };

  const config = getVerdictConfig(recommendation.verdict);
  const Icon = config.icon;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Final Verdict
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-6 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
          <div className="flex items-start gap-4">
            <Icon className={`h-8 w-8 ${config.color} mt-1`} />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{config.title}</h3>
                <Badge 
                  variant={config.badgeVariant}
                  className={config.badgeClass}
                >
                  {recommendation.verdict}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{config.subtitle}</p>
              <p className="text-sm leading-relaxed">{recommendation.reasoning}</p>
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Analysis Confidence</span>
            <span className="text-sm text-muted-foreground">{recommendation.confidence}%</span>
          </div>
          <Progress value={recommendation.confidence} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Based on market data, competition analysis, and cost calculations
          </p>
        </div>

        {/* Quick Action Items */}
        <div className="mt-6 p-4 rounded-lg bg-background/50 border border-border/50">
          <h4 className="font-semibold mb-3">Next Steps:</h4>
          <ul className="space-y-2 text-sm">
            {recommendation.verdict === 'GO' && (
              <>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                  Source product samples to test quality
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                  Set up supplier relationship and MOQ negotiations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                  Create compelling product listing and content
                </li>
              </>
            )}
            {recommendation.verdict === 'CAUTION' && (
              <>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                  Research additional suppliers for better pricing
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                  Develop unique value proposition to stand out
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                  Test with small inventory before scaling
                </li>
              </>
            )}
            {recommendation.verdict === 'NO-GO' && (
              <>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div>
                  Look for alternative products in this category
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div>
                  Consider different target markets or niches
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div>
                  Analyze bundle opportunities for better margins
                </li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}