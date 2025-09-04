import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link, AlertCircle } from 'lucide-react';
import { detectProvider, type DetectResult } from '@/lib/urlAnalyzer';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const URLInput = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [helper, setHelper] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleAnalyzeURL = () => {
    if (!url.trim()) {
      setError('Please enter a product URL');
      return;
    }

    setAnalyzing(true);
    setError(null);

    let info: DetectResult;
    try {
      info = detectProvider(url.trim());
    } catch {
      setError('Invalid URL');
      setAnalyzing(false);
      return;
    }

    const idParam = info.id ? `&id=${info.id}` : '';
    navigate(`/analyze-url?url=${encodeURIComponent(info.canonicalUrl)}&provider=${info.provider}${idParam}`);
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
            Paste a product URL from Amazon, Etsy, AliExpress, Alibaba, Walmart, Shopify, or any site to get started
          </p>

          <div className="space-y-3">
            <Input
              value={url}
              onChange={(e) => {
                const val = e.target.value;
                setUrl(val);
                try {
                  const r = detectProvider(val);
                  if (r.provider === 'generic') {
                    setHelper('We\u2019ll try to extract details from this site. You may need to provide cost/price manually.');
                  } else {
                    setHelper(`Detected ${r.provider}${r.id ? ` (ID ${r.id})` : ''}. We\u2019ll auto-extract details.`);
                  }
                  setError(null);
                } catch {
                  setHelper(null);
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder="https://amazon.com/dp/B08N5WRWNW"
              className="w-full"
            />

            {helper && !error && (
              <p className="text-xs text-muted-foreground">{helper}</p>
            )}

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
              <span className="px-2 py-1 bg-muted/20 rounded">Etsy</span>
              <span className="px-2 py-1 bg-muted/20 rounded">AliExpress</span>
              <span className="px-2 py-1 bg-muted/20 rounded">Alibaba</span>
              <span className="px-2 py-1 bg-muted/20 rounded">Walmart</span>
              <span className="px-2 py-1 bg-muted/20 rounded">Shopify</span>
              <span className="px-2 py-1 bg-muted/20 rounded">Others</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};