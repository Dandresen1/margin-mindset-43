import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductOverview } from '@/components/analysis/ProductOverview';
import { MarginCalculator } from '@/components/analysis/MarginCalculator';
import { CostBreakdown } from '@/components/analysis/CostBreakdown';
import { CompetitorAnalysis } from '@/components/analysis/CompetitorAnalysis';
import { BundleOpportunities } from '@/components/analysis/BundleOpportunities';
import { GTMRecommendations } from '@/components/analysis/GTMRecommendations';
import { VerdictSection } from '@/components/analysis/VerdictSection';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Share2 } from 'lucide-react';

interface AnalysisData {
  id: string;
  product: {
    name: string;
    image: string;
    description: string;
    supplier_price: number;
    category: string;
  };
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
  competitors: Array<{
    platform: string;
    price: number;
    rating: number;
    reviews: number;
  }>;
  market: {
    saturation: number;
    trend_score: number;
    seasonality: string;
  };
  bundles: Array<{
    products: string[];
    margin_increase: number;
    confidence: number;
  }>;
  recommendation: {
    verdict: 'GO' | 'CAUTION' | 'NO-GO';
    reasoning: string;
    confidence: number;
  };
}

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading with progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate API call
    setTimeout(() => {
      setProgress(100);
      setLoading(false);
      // Mock data for now - will be replaced with actual API call
      setAnalysisData({
        id: id || '1',
        product: {
          name: 'Wireless Bluetooth Earbuds',
          image: '/placeholder.svg',
          description: 'Premium wireless earbuds with noise cancellation',
          supplier_price: 12.50,
          category: 'Electronics'
        },
        margins: {
          conservative: 15.2,
          moderate: 28.7,
          aggressive: 45.1
        },
        costs: {
          product_cost: 12.50,
          shipping: 3.20,
          platform_fees: 2.85,
          ad_spend: 8.40,
          returns: 4.20,
          processing: 1.15
        },
        competitors: [
          { platform: 'Amazon', price: 39.99, rating: 4.2, reviews: 1247 },
          { platform: 'TikTok Shop', price: 29.99, rating: 4.5, reviews: 892 },
          { platform: 'AliExpress', price: 15.99, rating: 4.0, reviews: 3421 }
        ],
        market: {
          saturation: 75,
          trend_score: 8.2,
          seasonality: 'Stable year-round'
        },
        bundles: [
          {
            products: ['Phone Case', 'Charging Cable'],
            margin_increase: 22.5,
            confidence: 87
          }
        ],
        recommendation: {
          verdict: 'CAUTION',
          reasoning: 'High market saturation but strong margins possible with proper positioning',
          confidence: 72
        }
      });
    }, 3000);

    return () => clearInterval(progressInterval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Analyzing Product...</h1>
          </div>
          
          <Card className="glass-card mb-8">
            <CardContent className="p-8 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="animate-spin h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto"></div>
                <h3 className="text-xl font-semibold">Crunching the Numbers</h3>
                <p className="text-muted-foreground">
                  Analyzing costs, competition, and market conditions...
                </p>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
              </div>
            </CardContent>
          </Card>

          {/* Loading skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-destructive mb-4">Analysis Failed</h3>
              <p className="text-muted-foreground mb-6">
                {error || 'Unable to analyze this product. Please try again.'}
              </p>
              <Button onClick={() => navigate('/')}>
                Try Another Product
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{analysisData.product.name}</h1>
              <p className="text-muted-foreground">Product Analysis Report</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <ProductOverview product={analysisData.product} />
            
            <Tabs defaultValue="calculator" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="calculator">Calculator</TabsTrigger>
                <TabsTrigger value="costs">Costs</TabsTrigger>
                <TabsTrigger value="competitors">Market</TabsTrigger>
                <TabsTrigger value="bundles">Bundles</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calculator" className="mt-6">
                <MarginCalculator 
                  margins={analysisData.margins}
                  costs={analysisData.costs}
                  product={analysisData.product}
                />
              </TabsContent>
              
              <TabsContent value="costs" className="mt-6">
                <CostBreakdown costs={analysisData.costs} />
              </TabsContent>
              
              <TabsContent value="competitors" className="mt-6">
                <CompetitorAnalysis 
                  competitors={analysisData.competitors}
                  market={analysisData.market}
                />
              </TabsContent>
              
              <TabsContent value="bundles" className="mt-6">
                <BundleOpportunities bundles={analysisData.bundles} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Recommendations & Actions */}
          <div className="space-y-6">
            <VerdictSection recommendation={analysisData.recommendation} />
            <GTMRecommendations 
              verdict={analysisData.recommendation.verdict}
              category={analysisData.product.category}
            />
          </div>
        </div>
      </div>
    </div>
  );
}