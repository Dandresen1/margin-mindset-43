import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react';
import { URLAnalyzer, type URLAnalysisResult } from '@/utils/urlAnalyzer';
import { UploadZone } from '@/components/UploadZone';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AnalyzeURL() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceUrl = searchParams.get('url');
  const [urlAnalysis, setUrlAnalysis] = useState<URLAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sourceUrl) {
      const analysis = URLAnalyzer.analyzeURL(sourceUrl);
      setUrlAnalysis(analysis);
      
      if (!analysis.isValid) {
        setError(analysis.error || 'Invalid URL');
      }
    } else {
      setError('No URL provided');
    }
  }, [sourceUrl]);

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
  const platformDefaults = URLAnalyzer.getDefaultPlatformSettings(urlAnalysis.platform!);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analyze Product from URL</h1>
            <p className="text-muted-foreground">Complete the product details for analysis</p>
          </div>
        </div>

        {/* URL Info Card */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              Detected Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default">{platformName}</Badge>
                {urlAnalysis.productName && (
                  <span className="text-lg font-medium">{urlAnalysis.productName}</span>
                )}
              </div>
              
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

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We've detected this is from {platformName}. Please complete the product details below 
                  for an accurate margin analysis. Estimated price range: {platformDefaults.estimated_price_range}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Form */}
        <UploadZone 
          prefilledData={{
            platform: urlAnalysis.platform!,
            product_name: urlAnalysis.productName || '',
            source_url: sourceUrl!,
            data_source: 'url',
            ...platformDefaults
          }}
          mode="url-analysis"
        />
      </div>
    </div>
  );
}