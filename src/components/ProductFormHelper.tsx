import React from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductCategory, getCOGSRange, getSupplierLinks } from '@/lib/productDefaults';

interface ProductFormHelperProps {
  productName?: string;
  sellingPrice?: number;
  category?: ProductCategory;
  cogs?: number;
  onCOGSChange?: (value: string) => void;
}

export const ProductFormHelper: React.FC<ProductFormHelperProps> = ({
  productName = '',
  sellingPrice,
  category = 'unknown',
  cogs,
  onCOGSChange
}) => {
  const supplierLinks = getSupplierLinks(productName);
  
  const cogsRange = sellingPrice ? getCOGSRange(sellingPrice, category) : null;
  const margin = sellingPrice && cogs ? ((sellingPrice - cogs) / sellingPrice * 100) : null;

  const getMarginWarning = () => {
    if (!margin) return null;
    
    if (margin < 10) {
      return {
        type: 'warning' as const,
        message: `Low margin (${margin.toFixed(1)}%) - verify your wholesale costs`
      };
    }
    
    if (margin > 70) {
      return {
        type: 'info' as const,
        message: `High margin (${margin.toFixed(1)}%) - great if accurate! Double-check wholesale price`
      };
    }
    
    return null;
  };

  const marginWarning = getMarginWarning();

  return (
    <div className="space-y-3">
      {/* COGS Helper */}
      {cogsRange && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>Typical wholesale cost: ${cogsRange.min}-${cogsRange.max} ({cogsRange.percentage} of retail)</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto p-1">
                  <Info className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>To find wholesale prices: Search "{productName} wholesale" on Alibaba, or check 1688.com for direct factory prices. Typical margins vary by industry.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Auto-fill suggestion */}
      {cogsRange && sellingPrice && !cogs && onCOGSChange && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCOGSChange(cogsRange.min.toString())}
          className="text-xs h-7"
        >
          Use ${cogsRange.min} (Conservative estimate)
        </Button>
      )}

      {/* Margin warning */}
      {marginWarning && (
        <Alert className="py-2">
          <AlertDescription className="text-xs">
            {marginWarning.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Supplier research helper */}
      {productName && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Quick COGS Research:</p>
          <div className="flex flex-wrap gap-2">
            {supplierLinks.slice(0, 3).map((link) => (
              <Button
                key={link.platform}
                variant="outline"
                size="sm"
                asChild
                className="text-xs h-7"
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  {link.platform}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};