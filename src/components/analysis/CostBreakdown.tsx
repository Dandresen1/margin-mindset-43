import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PieChart, Package, Truck, CreditCard, Megaphone, RotateCcw, Receipt } from 'lucide-react';

interface CostBreakdownProps {
  costs: {
    product_cost: number;
    shipping: number;
    platform_fees: number;
    ad_spend: number;
    returns: number;
    processing: number;
  };
}

export function CostBreakdown({ costs }: CostBreakdownProps) {
  const totalCosts = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  
  const costItems = [
    {
      name: 'Product Cost (COGS)',
      amount: costs.product_cost,
      icon: Package,
      color: 'bg-blue-500',
      description: 'Base cost from supplier including manufacturing'
    },
    {
      name: 'Shipping & Fulfillment',
      amount: costs.shipping,
      icon: Truck,
      color: 'bg-green-500',
      description: 'Shipping to customer, packaging, handling fees'
    },
    {
      name: 'Platform Fees',
      amount: costs.platform_fees,
      icon: CreditCard,
      color: 'bg-purple-500',
      description: 'Marketplace commission (Amazon, TikTok Shop, etc.)'
    },
    {
      name: 'Ad Spend',
      amount: costs.ad_spend,
      icon: Megaphone,
      color: 'bg-orange-500',
      description: 'Facebook, TikTok, Google ads to drive traffic'
    },
    {
      name: 'Returns & Refunds',
      amount: costs.returns,
      icon: RotateCcw,
      color: 'bg-red-500',
      description: 'Estimated 20-30% return rate for e-commerce'
    },
    {
      name: 'Payment Processing',
      amount: costs.processing,
      icon: Receipt,
      color: 'bg-gray-500',
      description: 'Stripe, PayPal, credit card processing fees'
    }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Complete Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Cost Summary */}
        <div className="p-4 rounded-lg bg-muted/10 border border-border/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">Total Cost Per Unit</span>
            <span className="text-2xl font-bold text-primary">${totalCosts.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            This includes all hidden costs that many sellers forget to calculate
          </p>
        </div>

        {/* Cost Items */}
        <div className="space-y-4">
          {costItems.map((item, index) => {
            const percentage = (item.amount / totalCosts) * 100;
            const Icon = item.icon;
            
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.color}/20`}>
                      <Icon className={`h-4 w-4 ${item.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${item.amount.toFixed(2)}</div>
                    <Badge variant="secondary" className="text-xs">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>

        {/* Cost Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <h4 className="font-semibold text-warning mb-2">Highest Cost Driver</h4>
            <p className="text-sm text-muted-foreground">
              {costItems.reduce((max, item) => item.amount > max.amount ? item : max).name} 
              represents the largest expense at ${costItems.reduce((max, item) => item.amount > max.amount ? item : max).amount.toFixed(2)}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">Optimization Tip</h4>
            <p className="text-sm text-muted-foreground">
              Focus on negotiating better shipping rates and supplier prices to improve margins
            </p>
          </div>
        </div>

        {/* Hidden Costs Warning */}
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <h4 className="font-semibold text-destructive mb-2">Don't Forget These Costs!</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Customer service time and tools</li>
            <li>• Photography and content creation</li>
            <li>• Inventory storage fees</li>
            <li>• Currency conversion fees</li>
            <li>• Tax obligations and accounting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}