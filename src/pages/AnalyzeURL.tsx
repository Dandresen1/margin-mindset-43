import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { URLAnalyzer, type URLAnalysisResult } from '@/utils/urlAnalyzer';
import { UploadZone } from '@/components/UploadZone';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PricingStrategies } from '@/components/PricingStrategies';
import { Progress } from '@/components/ui/progress';
import { generateAutoFilledData, generatePricingStrategies } from '@/lib/smartDefaults';
import { detectCategoryFromURL } from '@/lib/productDefaults';

export default function AnalyzeURL() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceUrl = searchParams.get('url');
  const [urlAnalysis, setUrlAnalysis] = useState<URLAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [autoData, setAutoData] = useState<any>(null);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [showStrategies, setShowStrategies] = useState(false);

  useEffect(() => {
    if (sourceUrl) {
      const analysis = URLAnalyzer.analyzeURL(sourceUrl);
      setUrlAnalysis(analysis);
      
      if (!analysis.isValid) {
        setError(analysis.error || 'Invalid URL');
      } else {
        // Start auto-analysis
        performAutoAnalysis(analysis);
      }
    } else {
      setError('No URL provided');
    }
  }, [sourceUrl]);

  const performAutoAnalysis = async (analysis: URLAnalysisResult) => {
    setAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Stage 1: Extract product details
      setAnalysisStage('Extracting product details...');
      setAnalysisProgress(20);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Stage 2: Find supplier costs
      setAnalysisStage('Finding supplier costs...');
      setAnalysisProgress(40);
      const autoFilledData = generateAutoFilledData(
        sourceUrl!, 
        analysis.platform!, 
        analysis.productName
      );
      setAutoData(autoFilledData);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 3: Analyze competitors
      setAnalysisStage('Analyzing competitors...');
      setAnalysisProgress(60);
      // Simulate competitor price fetch
      const mockCompetitorPrices = [
        autoFilledData.estimatedPrice * 0.8,
        autoFilledData.estimatedPrice * 0.9,
        autoFilledData.estimatedPrice,
        autoFilledData.estimatedPrice * 1.1,
        autoFilledData.estimatedPrice * 1.2
      ];
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 4: Calculate strategies
      setAnalysisStage('Calculating pricing strategies...');
      setAnalysisProgress(80);
      
      const category = detectCategoryFromURL(sourceUrl!).value;
      const pricingStrategies = generatePricingStrategies(
        autoFilledData.estimatedCOGS,
        mockCompetitorPrices,
        category,
        autoFilledData.platformFees
      );
      
      setStrategies(pricingStrategies);
      await new Promise(resolve => setTimeout(resolve, 500));

      setAnalysisProgress(100);
      setAnalysisStage('Analysis complete!');
      
      // Show results after a brief delay
      setTimeout(() => {
        setShowStrategies(true);
        setAnalyzing(false);
      }, 1000);

    } catch (error) {
      console.error('Auto-analysis failed:', error);
      setError('Failed to analyze product automatically');
      setAnalyzing(false);
    }
  };

  if (error || !urlAnalysis?.isValid) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">URL Analysis</h1>
          </div>
          
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-destructive mb-4">URL Analysis Failed</h3>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <Button onClick={() => navigate('/')}>
                Try Another URL
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const platformName = URLAnalyzer.getPlatformDisplayName(urlAnalysis.platform!);

  const handleSelectStrategy = (strategy: any) => {
    // Navigate to full analysis with selected strategy
    const analysisData = {
      productName: urlAnalysis.productName || 'Product',
      platform: urlAnalysis.platform,
      strategy,
      sourceUrl,
      autoData
    };
    
    sessionStorage.setItem('selected-strategy', JSON.stringify(analysisData));
    navigate('/analysis/strategy-selected');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">AI Product Advisor</h1>
            <p className="text-muted-foreground">Instant pricing strategies from product URL</p>
          </div>
        </div>

        {/* URL Info Card */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              Analyzing Product from {platformName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urlAnalysis.productName && (
                <div>
                  <Badge variant="default" className="mr-2">{platformName}</Badge>
                  <span className="text-lg font-medium">{urlAnalysis.productName}</span>
                </div>
              )}
              
              <div className="p-3 bg-muted/20 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Source URL:</p>
                <a 
                  href={sourceUrl!} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {sourceUrl}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        {analyzing && (
          <Card className="glass-card mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="font-medium">{analysisStage}</span>
                </div>
                <Progress value={analysisProgress} className="w-full" />
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {analysisProgress > 20 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-muted rounded-full" />
                    )}
                    Extract details
                  </div>
                  <div className="flex items-center gap-2">
                    {analysisProgress > 40 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-muted rounded-full" />
                    )}
                    Find supplier costs
                  </div>
                  <div className="flex items-center gap-2">
                    {analysisProgress > 60 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-muted rounded-full" />
                    )}
                    Analyze competitors
                  </div>
                  <div className="flex items-center gap-2">
                    {analysisProgress > 80 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-muted rounded-full" />
                    )}
                    Calculate strategies
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Strategies */}
        {showStrategies && strategies.length > 0 && (
          <PricingStrategies
            strategies={strategies}
            onSelectStrategy={handleSelectStrategy}
            productName={urlAnalysis.productName || 'Product'}
          />
        )}

        {/* Fallback to manual form */}
        {!analyzing && !showStrategies && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Auto-analysis failed. Please complete the form manually for detailed analysis.
              </AlertDescription>
            </Alert>
            
            <UploadZone 
              prefilledData={{
                product_name: urlAnalysis.productName || '',
                platform: urlAnalysis.platform! as any,
                price: autoData?.estimatedPrice?.toString() || '',
                cogs: autoData?.estimatedCOGS?.toString() || '',
                weight_oz: autoData?.weight?.toString() || '',
                source_url: sourceUrl!,
                data_source: 'url'
              }}
              mode="url-analysis"
            />
          </div>
        )}
      </div>
    </div>
  );
}