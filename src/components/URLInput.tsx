import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link, AlertCircle } from 'lucide-react';
import { URLAnalyzer } from '@/utils/urlAnalyzer';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const URLInput = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleAnalyzeURL = () => {
    if (!url.trim()) {
      setError('Please enter a product URL');
      return;
    }

    setAnalyzing(true);
    setError(null);

    // Validate URL
    const analysis = URLAnalyzer.analyzeURL(url.trim());
    
    if (!analysis.isValid) {
      setError(analysis.error || 'Invalid URL');
      setAnalyzing(false);
      return;
    }

    // Navigate to URL analysis page
    navigate(`/analyze-url?url=${encodeURIComponent(url.trim())}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyzeURL();
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Link className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Analyze from URL</h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Paste a product URL from Amazon, TikTok Shop, Etsy, or Shopify to get started
          </p>

          <div className="space-y-3">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://amazon.com/dp/B08N5WRWNW"
              className="w-full"
            />
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleAnalyzeURL}
              disabled={analyzing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {analyzing ? 'Analyzing URL...' : 'Analyze from URL'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="mb-1">Supported platforms:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-muted/20 rounded">Amazon</span>
              <span className="px-2 py-1 bg-muted/20 rounded">TikTok Shop</span>
              <span className="px-2 py-1 bg-muted/20 rounded">Etsy</span>
              <span className="px-2 py-1 bg-muted/20 rounded">Shopify</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};