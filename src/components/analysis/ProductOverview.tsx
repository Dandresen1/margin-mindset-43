import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, Tag } from 'lucide-react';

interface ProductOverviewProps {
  product: {
    name: string;
    image: string;
    description: string;
    supplier_price: number;
    category: string;
  };
}

export function ProductOverview({ product }: ProductOverviewProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Product Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product Image */}
          <div className="md:col-span-1">
            <div className="aspect-square rounded-lg bg-muted/20 border-2 border-dashed border-muted flex items-center justify-center overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="text-center p-4">
                        <Package class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p class="text-sm text-muted-foreground">Product Image</p>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {product.category}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Supplier Price: ${product.supplier_price.toFixed(2)}
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="text-lg font-semibold text-success">Low Cost</div>
                <div className="text-sm text-muted-foreground">Good supplier price</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-lg font-semibold text-primary">Popular</div>
                <div className="text-sm text-muted-foreground">{product.category} trending</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}