import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { ConfidenceBadge as ConfidenceBadgeType } from '@/lib/productDefaults';

interface ConfidenceBadgeProps {
  confidence: ConfidenceBadgeType;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const getVariant = () => {
    switch (confidence.level) {
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getIcon = () => {
    switch (confidence.level) {
      case 'high':
        return <CheckCircle className="h-3 w-3" />;
      case 'medium':
        return <AlertTriangle className="h-3 w-3" />;
      case 'low':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getColor = () => {
    switch (confidence.level) {
      case 'high':
        return 'text-success';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getVariant()} className={`gap-1 ${className}`}>
            <span className={getColor()}>{getIcon()}</span>
            {confidence.level}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <div className="font-medium">Data Source: {confidence.source.replace('_', ' ')}</div>
            <div className="text-sm">{confidence.description}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}