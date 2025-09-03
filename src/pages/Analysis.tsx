import React from 'react';
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
import { MetricsOverview } from '@/components/analysis/MetricsOverview';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { AnonymousAnalysisCTA } from '@/components/AnonymousAnalysisCTA';
import { useAuth } from '@/contexts/AuthContext';

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: analysisData, loading, error } = useAnalysis(id);
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Loading Analysis...</h1>
          </div>
          
          <Card className="glass-card mb-8">
            <CardContent className="p-8 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="animate-spin h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto"></div>
                <h3 className="text-xl font-semibold">Loading Your Results</h3>
                <p className="text-muted-foreground">
                  Retrieving your product analysis...
                </p>
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
        {/* Anonymous User CTA */}
        {!user && id?.startsWith('anonymous-') && (
          <div className="mb-6">
            <AnonymousAnalysisCTA analysisId={id} />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <ProductOverview product={analysisData.product} />
            
            <Tabs defaultValue="calculator" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="calculator">Calculator</TabsTrigger>
                <TabsTrigger value="costs">Costs</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
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

              <TabsContent value="metrics" className="mt-6">
                <MetricsOverview 
                  breakeven_price={analysisData.breakeven_price}
                  roas={analysisData.roas}
                  target_cpc={analysisData.target_cpc}
                  currentMargin={analysisData.margins.moderate}
                  levers={analysisData.levers}
                />
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