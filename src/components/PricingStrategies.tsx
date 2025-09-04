import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface PricingStrategy {
  name: 'Conservative' | 'Market' | 'Aggressive';
  sellingPrice: number;
  estimatedMargin: number;
  estimatedROAS: number;
  monthlyVolume: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  description: string;
  metrics: {
    breakEven: number;
    targetCPC: number;
    profitPerUnit: number;
    requiredConversion: number;
  };
}

interface PricingStrategiesProps {
  strategies: PricingStrategy[];
  onSelectStrategy: (strategy: PricingStrategy) => void;
  productName: string;
}

export const PricingStrategies: React.FC<PricingStrategiesProps> = ({
  strategies,
  onSelectStrategy,
  productName
}) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStrategyIcon = (name: string) => {
    switch (name) {
      case 'Conservative': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Market': return <BarChart3 className="h-5 w-5 text-blue-600" />;
      case 'Aggressive': return <TrendingUp className="h-5 w-5 text-red-600" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Recommended Pricing Strategies</h2>
        <p className="text-muted-foreground">
          Three data-driven approaches for <span className="font-medium">{productName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {strategies.map((strategy, index) => (
          <Card 
            key={strategy.name} 
            className={`
              relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer
              ${strategy.name === 'Market' ? 'ring-2 ring-primary/30 shadow-lg' : ''}
            `}
            onClick={() => onSelectStrategy(strategy)}
          >
            {strategy.name === 'Market' && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg">
                Recommended
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStrategyIcon(strategy.name)}
                  <CardTitle className="text-lg">{strategy.name}</CardTitle>
                </div>
                <Badge className={getRiskColor(strategy.riskLevel)}>
                  {strategy.riskLevel} Risk
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{strategy.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Price & Margin */}
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-primary">
                  ${strategy.sellingPrice.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Selling Price</div>
                <div className="text-lg font-semibold mt-1">
                  {strategy.estimatedMargin}% Margin
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="font-medium">ROAS Target</div>
                  <div className="text-muted-foreground">{strategy.estimatedROAS.toFixed(1)}x</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Profit/Unit</div>
                  <div className="text-muted-foreground">${strategy.metrics.profitPerUnit.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Target CPC</div>
                  <div className="text-muted-foreground">${strategy.metrics.targetCPC.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Conv. Rate</div>
                  <div className="text-muted-foreground">{strategy.metrics.requiredConversion.toFixed(1)}%</div>
                </div>
              </div>

              {/* Volume Expectation */}
              <div className="p-3 bg-muted/20 rounded-lg">
                <div className="text-xs font-medium text-muted-foreground mb-1">VOLUME EXPECTATION</div>
                <div className="text-sm">{strategy.monthlyVolume}</div>
              </div>

              {/* Select Button */}
              <Button 
                className="w-full mt-4" 
                variant={strategy.name === 'Market' ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStrategy(strategy);
                }}
              >
                Select {strategy.name} Strategy
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Click any strategy to see detailed analysis and projections
      </div>
    </div>
  );
};