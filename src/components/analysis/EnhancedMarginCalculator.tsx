import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, TrendingUp, AlertTriangle, Save, RotateCcw, Edit3 } from 'lucide-react';
import { generateAdvisory } from '@/lib/advisorEngine';
import { ConfidenceBadge } from '@/components/ui/confidence-badge';
import { 
  detectCategoryFromText, 
  getPlatformFees, 
  getReturnRate,
  type ConfidenceBadge as ConfidenceBadgeType 
} from '@/lib/productDefaults';

interface EnhancedMarginCalculatorProps {
  initialData: {
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
    product: {
      name: string;
      supplier_price: number;
      category: string;
    };
    competitors?: Array<{
      platform: string;
      price: number;
      rating: number;
      reviews: number;
    }>;
    market?: {
      saturation: number;
      trend_score: number;
      seasonality: string;
    };
    breakeven_price?: number;
    roas?: number;
    target_cpc?: number;
  };
  onDataChange?: (updatedData: any) => void;
}

interface EditableValue<T> {
  value: T;
  isEditing: boolean;
  confidence?: ConfidenceBadgeType;
  hasUserOverride: boolean;
}

export function EnhancedMarginCalculator({ initialData, onDataChange }: EnhancedMarginCalculatorProps) {
  const [loading, setLoading] = useState(false);
  const [sellingPrice, setSellingPrice] = useState<EditableValue<number>>({
    value: 35,
    isEditing: false,
    hasUserOverride: false
  });
  const [adSpendPercent, setAdSpendPercent] = useState<EditableValue<number>>({
    value: 25,
    isEditing: false,
    hasUserOverride: false
  });
  const [platformFees, setPlatformFees] = useState<EditableValue<number>>({
    value: initialData.costs.platform_fees,
    isEditing: false,
    hasUserOverride: false
  });
  
  // Auto-detected values with confidence
  const categoryDetection = useMemo(() => 
    detectCategoryFromText(initialData.product.name), 
    [initialData.product.name]
  );
  
  const returnRateDetection = useMemo(() => 
    getReturnRate(categoryDetection.value), 
    [categoryDetection.value]
  );
  
  const platformFeesDetection = useMemo(() => 
    getPlatformFees('amazon', sellingPrice.value), 
    [sellingPrice.value]
  );

  // Calculate metrics in real-time
  const calculatedMetrics = useMemo(() => {
    const totalCosts = 
      initialData.costs.product_cost + 
      initialData.costs.shipping + 
      platformFees.value + 
      (sellingPrice.value * adSpendPercent.value / 100) +
      initialData.costs.processing +
      (sellingPrice.value * returnRateDetection.value / 100 * 0.1); // Return cost estimate
    
    const calculatedMargin = ((sellingPrice.value - totalCosts) / sellingPrice.value) * 100;
    const profitPerUnit = sellingPrice.value - totalCosts;
    
    return {
      totalCosts,
      calculatedMargin,
      profitPerUnit,
      roas: profitPerUnit > 0 ? sellingPrice.value / (sellingPrice.value * adSpendPercent.value / 100) : 0
    };
  }, [sellingPrice.value, adSpendPercent.value, platformFees.value, returnRateDetection.value, initialData.costs]);

  // Generate advisory recommendations
  const advisory = useMemo(() => {
    if (!initialData.competitors || !initialData.market) return null;
    
    return generateAdvisory({
      margins: initialData.margins,
      costs: {
        ...initialData.costs,
        platform_fees: platformFees.value,
        ad_spend: sellingPrice.value * adSpendPercent.value / 100
      },
      market: initialData.market,
      competitors: initialData.competitors,
      breakeven_price: initialData.breakeven_price || 0,
      roas: calculatedMetrics.roas,
      target_cpc: initialData.target_cpc || 0,
      product: initialData.product
    });
  }, [initialData, platformFees.value, sellingPrice.value, adSpendPercent.value, calculatedMetrics.roas]);

  // Persist overrides to localStorage
  useEffect(() => {
    const overrides = {
      sellingPrice: sellingPrice.hasUserOverride ? sellingPrice.value : null,
      adSpendPercent: adSpendPercent.hasUserOverride ? adSpendPercent.value : null,
      platformFees: platformFees.hasUserOverride ? platformFees.value : null,
    };
    localStorage.setItem(`calculator-overrides-${initialData.product.name}`, JSON.stringify(overrides));
  }, [sellingPrice, adSpendPercent, platformFees, initialData.product.name]);

  // Load saved overrides
  useEffect(() => {
    const saved = localStorage.getItem(`calculator-overrides-${initialData.product.name}`);
    if (saved) {
      const overrides = JSON.parse(saved);
      if (overrides.sellingPrice) {
        setSellingPrice(prev => ({ ...prev, value: overrides.sellingPrice, hasUserOverride: true }));
      }
      if (overrides.adSpendPercent) {
        setAdSpendPercent(prev => ({ ...prev, value: overrides.adSpendPercent, hasUserOverride: true }));
      }
      if (overrides.platformFees) {
        setPlatformFees(prev => ({ ...prev, value: overrides.platformFees, hasUserOverride: true }));
      }
    }
  }, [initialData.product.name]);

  const resetValue = <T,>(setter: React.Dispatch<React.SetStateAction<EditableValue<T>>>, defaultValue: T) => {
    setter(prev => ({
      ...prev,
      value: defaultValue,
      hasUserOverride: false,
      isEditing: false
    }));
  };

  const startEditing = <T,>(setter: React.Dispatch<React.SetStateAction<EditableValue<T>>>) => {
    setter(prev => ({ ...prev, isEditing: true }));
  };

  const finishEditing = <T,>(setter: React.Dispatch<React.SetStateAction<EditableValue<T>>>) => {
    setter(prev => ({ 
      ...prev, 
      isEditing: false, 
      hasUserOverride: true 
    }));
  };

  const getMarginColor = (margin: number) => {
    if (margin < 15) return 'text-destructive';
    if (margin < 25) return 'text-warning';
    return 'text-success';
  };

  const getMarginBadge = (margin: number) => {
    if (margin < 15) return { variant: 'destructive' as const, label: 'High Risk' };
    if (margin < 25) return { variant: 'default' as const, label: 'Moderate Risk' };
    return { variant: 'default' as const, label: 'Good Margin', className: 'bg-success text-success-foreground' };
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Smart Margin Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Advisor Strategies */}
        {advisory && (
          <div>
            <h4 className="font-semibold mb-4">AI Pricing Strategies</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advisory.pricing_strategies.map((strategy, index) => (
                <div 
                  key={strategy.strategy}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    strategy.risk_level === 'low' ? 'border-success/50 hover:border-success' :
                    strategy.risk_level === 'medium' ? 'border-warning/50 hover:border-warning' :
                    'border-destructive/50 hover:border-destructive'
                  }`}
                  onClick={() => setSellingPrice(prev => ({ 
                    ...prev, 
                    value: strategy.price, 
                    hasUserOverride: true 
                  }))}
                >
                  <div className="text-center">
                    <Badge variant={strategy.risk_level === 'low' ? 'default' : 'secondary'} className="mb-2">
                      {strategy.strategy}
                    </Badge>
                    <div className="text-2xl font-bold">${strategy.price.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{strategy.volume_expectation}</div>
                    <div className="text-xs mt-2 opacity-75">{strategy.rationale}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-muted/10 border border-border/50">
          <div className="space-y-4">
            {/* Selling Price */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="selling-price">Selling Price</Label>
                {sellingPrice.hasUserOverride && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetValue(setSellingPrice, 35)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(setSellingPrice)}
                  className="h-6 w-6 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">$</span>
                {sellingPrice.isEditing ? (
                  <Input
                    type="number"
                    value={sellingPrice.value}
                    onChange={(e) => setSellingPrice(prev => ({
                      ...prev,
                      value: parseFloat(e.target.value) || 0
                    }))}
                    onBlur={() => finishEditing(setSellingPrice)}
                    onKeyDown={(e) => e.key === 'Enter' && finishEditing(setSellingPrice)}
                    className="text-xl font-semibold"
                    step="0.01"
                    min="0"
                    autoFocus
                  />
                ) : (
                  <div 
                    className="text-xl font-semibold cursor-pointer hover:bg-muted/20 px-2 py-1 rounded"
                    onClick={() => startEditing(setSellingPrice)}
                  >
                    {sellingPrice.value.toFixed(2)}
                  </div>
                )}
                {sellingPrice.hasUserOverride && (
                  <Badge variant="secondary" className="text-xs">Manual</Badge>
                )}
              </div>
            </div>

            {/* Ad Spend */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Ad Spend: {adSpendPercent.value}% of revenue</Label>
                {adSpendPercent.hasUserOverride && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetValue(setAdSpendPercent, 25)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Slider
                value={[adSpendPercent.value]}
                onValueChange={(value) => setAdSpendPercent(prev => ({
                  ...prev,
                  value: value[0],
                  hasUserOverride: true
                }))}
                max={50}
                min={5}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Platform Fees with Confidence */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Platform Fees</Label>
                <ConfidenceBadge confidence={platformFeesDetection.confidence} />
                {platformFees.hasUserOverride && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetValue(setPlatformFees, platformFeesDetection.value)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Input
                type="number"
                value={platformFees.value.toFixed(2)}
                onChange={(e) => setPlatformFees(prev => ({
                  ...prev,
                  value: parseFloat(e.target.value) || 0,
                  hasUserOverride: true
                }))}
                className="text-sm"
                step="0.01"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="text-center p-4 rounded-lg bg-background/50">
              <div className="text-sm text-muted-foreground">Profit Margin</div>
              <div className={`text-3xl font-bold ${getMarginColor(calculatedMetrics.calculatedMargin)}`}>
                {calculatedMetrics.calculatedMargin.toFixed(1)}%
              </div>
              <Badge {...getMarginBadge(calculatedMetrics.calculatedMargin)} className="mt-2">
                {getMarginBadge(calculatedMetrics.calculatedMargin).label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Revenue:</span>
                <span className="font-semibold">${sellingPrice.value.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Costs:</span>
                <span className="font-semibold">${calculatedMetrics.totalCosts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span>Profit:</span>
                <span className="font-semibold">${calculatedMetrics.profitPerUnit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>ROAS:</span>
                <span className="font-semibold">{calculatedMetrics.roas.toFixed(1)}x</span>
              </div>
            </div>

            {/* Data Provenance */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <span>Category:</span>
                <ConfidenceBadge confidence={categoryDetection.confidence} />
                <span>{categoryDetection.value}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Return Rate:</span>
                <ConfidenceBadge confidence={returnRateDetection.confidence} />
                <span>{returnRateDetection.value}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings and Recommendations */}
        {calculatedMetrics.calculatedMargin < 20 && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <div className="font-semibold text-warning">Margin Alert</div>
              <div className="text-sm text-muted-foreground mt-1">
                Current margin is below 20%. Consider the advisor recommendations above or adjust your costs.
              </div>
            </div>
          </div>
        )}

        {/* Advisory Insights */}
        {advisory && advisory.overall_recommendation && (
          <div className={`p-4 rounded-lg border ${
            advisory.overall_recommendation.verdict === 'GO' ? 'bg-success/10 border-success/20' :
            advisory.overall_recommendation.verdict === 'CAUTION' ? 'bg-warning/10 border-warning/20' :
            'bg-destructive/10 border-destructive/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={advisory.overall_recommendation.verdict === 'GO' ? 'default' : 'secondary'}>
                {advisory.overall_recommendation.verdict}
              </Badge>
              <span className="font-semibold">AI Recommendation</span>
            </div>
            <div className="text-sm mb-2">{advisory.overall_recommendation.reasoning}</div>
            <div className="text-xs space-y-1">
              {advisory.overall_recommendation.action_plan.map((action, index) => (
                <div key={index}>• {action}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}