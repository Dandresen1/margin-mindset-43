import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

interface MarginCalculatorProps {
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
    supplier_price: number;
  };
}

export function MarginCalculator({ margins, costs, product }: MarginCalculatorProps) {
  const [sellingPrice, setSellingPrice] = useState(35);
  const [adSpendPercent, setAdSpendPercent] = useState([25]);
  
  const totalCosts = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  const calculatedMargin = ((sellingPrice - totalCosts) / sellingPrice) * 100;
  const profitPerUnit = sellingPrice - totalCosts;
  
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

  const scenarios = [
    { name: 'Conservative', price: 29.99, margin: margins.conservative, color: 'text-warning' },
    { name: 'Moderate', price: 39.99, margin: margins.moderate, color: 'text-primary' },
    { name: 'Aggressive', price: 49.99, margin: margins.aggressive, color: 'text-success' }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Interactive Margin Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Scenarios */}
        <div>
          <h4 className="font-semibold mb-4">Recommended Pricing Scenarios</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <div 
                key={scenario.name}
                className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSellingPrice(scenario.price)}
              >
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">{scenario.name}</div>
                  <div className="text-2xl font-bold">${scenario.price}</div>
                  <div className={`text-lg font-semibold ${scenario.color}`}>
                    {scenario.margin.toFixed(1)}% margin
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Calculator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-muted/10 border border-border/50">
          <div className="space-y-4">
            <div>
              <Label htmlFor="selling-price">Your Selling Price</Label>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-bold">$</span>
                <Input
                  id="selling-price"
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="text-xl font-semibold"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label>Ad Spend: {adSpendPercent[0]}% of revenue</Label>
              <Slider
                value={adSpendPercent}
                onValueChange={setAdSpendPercent}
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
          </div>

          <div className="space-y-4">
            <div className="text-center p-4 rounded-lg bg-background/50">
              <div className="text-sm text-muted-foreground">Profit Margin</div>
              <div className={`text-3xl font-bold ${getMarginColor(calculatedMargin)}`}>
                {calculatedMargin.toFixed(1)}%
              </div>
              <Badge {...getMarginBadge(calculatedMargin)} className="mt-2">
                {getMarginBadge(calculatedMargin).label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Revenue:</span>
                <span className="font-semibold">${sellingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Costs:</span>
                <span className="font-semibold">${totalCosts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span>Profit:</span>
                <span className="font-semibold">${profitPerUnit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Break-even:</span>
                <span className="font-semibold">{Math.ceil(500 / profitPerUnit)} units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {calculatedMargin < 20 && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <div className="font-semibold text-warning">Low Margin Warning</div>
              <div className="text-sm text-muted-foreground mt-1">
                Margins below 20% leave little room for unexpected costs, returns, or market changes. 
                Consider increasing your selling price or finding a cheaper supplier.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}