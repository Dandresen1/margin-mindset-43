import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package2, TrendingUp, Lightbulb, Plus } from 'lucide-react';

interface Bundle {
  products: string[];
  margin_increase: number;
  confidence: number;
  reasoning?: string;
}

interface BundleOpportunitiesProps {
  bundles: Bundle[];
}

export function BundleOpportunities({ bundles }: BundleOpportunitiesProps) {
  const additionalBundles = [
    {
      products: ['Wireless Charger', 'Car Mount'],
      margin_increase: 18.3,
      confidence: 79,
      reasoning: 'Popular accessories for tech products'
    },
    {
      products: ['Screen Protector', 'Cleaning Kit'],
      margin_increase: 15.7,
      confidence: 85,
      reasoning: 'Essential maintenance items'
    },
    {
      products: ['Carrying Case', 'Extra Tips'],
      margin_increase: 24.1,
      confidence: 72,
      reasoning: 'High-margin add-ons for premium feel'
    }
  ];

  const allBundles = [...bundles, ...additionalBundles];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return { variant: 'default' as const, className: 'bg-success text-success-foreground', label: 'High' };
    if (confidence >= 60) return { variant: 'secondary' as const, className: 'bg-warning text-warning-foreground', label: 'Medium' };
    return { variant: 'outline' as const, className: '', label: 'Low' };
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-primary" />
          Bundle Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bundle Strategy Overview */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-primary mb-2">Bundle Strategy Benefits</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Increase average order value (AOV) by 15-30%</li>
                <li>• Improve customer satisfaction with complete solutions</li>
                <li>• Reduce per-unit shipping costs across bundled items</li>
                <li>• Create barriers for competitors to match your offering</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bundle Recommendations */}
        <div className="space-y-4">
          <h4 className="font-semibold">Recommended Product Bundles</h4>
          {allBundles.map((bundle, index) => {
            const confidenceBadge = getConfidenceBadge(bundle.confidence);
            return (
              <div key={index} className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold">Bundle #{index + 1}</h5>
                      <Badge {...confidenceBadge}>
                        {confidenceBadge.label} Confidence
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {bundle.products.map((product, productIndex) => (
                        <div key={productIndex} className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {product}
                          </Badge>
                          {productIndex < bundle.products.length - 1 && (
                            <Plus className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                    {bundle.reasoning && (
                      <p className="text-sm text-muted-foreground">{bundle.reasoning}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-success">
                      +{bundle.margin_increase.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">margin boost</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Confidence:</span>
                    <span className={`font-semibold ${getConfidenceColor(bundle.confidence)}`}>
                      {bundle.confidence}%
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Analyze Bundle
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bundle Pricing Strategy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/10 border border-border/50">
            <h4 className="font-semibold mb-2">Pricing Strategy</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Individual items:</span>
                <span className="font-semibold">$47.97</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bundle price:</span>
                <span className="font-semibold">$39.99</span>
              </div>
              <div className="flex justify-between text-success">
                <span>Customer saves:</span>
                <span className="font-semibold">$7.98 (17%)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <h4 className="font-semibold text-success mb-2">Your Benefits</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Higher AOV:</span>
                <span className="font-semibold">+67%</span>
              </div>
              <div className="flex justify-between">
                <span>Better margins:</span>
                <span className="font-semibold">+22%</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping efficiency:</span>
                <span className="font-semibold">+35%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Tips */}
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <h4 className="font-semibold text-warning mb-3">Implementation Tips</h4>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-warning mt-0.5" />
              <span>Start with the highest confidence bundle to test market response</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-warning mt-0.5" />
              <span>Create "themed" bundles (e.g., "Complete Setup Kit", "Travel Bundle")</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-warning mt-0.5" />
              <span>Use urgency tactics like "Bundle Deal - Limited Time" to drive conversions</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-warning mt-0.5" />
              <span>A/B test different bundle combinations and pricing strategies</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}