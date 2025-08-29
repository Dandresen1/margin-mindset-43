import { useState } from 'react';
import { UploadZone } from './UploadZone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';

export const HeroSection = () => {
  const [url, setUrl] = useState('');

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 animate-float">
          <Calculator className="w-8 h-8 text-primary/30" />
        </div>
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '2s' }}>
          <TrendingUp className="w-6 h-6 text-primary/20" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float" style={{ animationDelay: '4s' }}>
          <DollarSign className="w-10 h-10 text-primary/25" />
        </div>
        
        {/* Gradient glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 gradient-glow animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 gradient-glow animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Main headline */}
        <div className="space-y-4 animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Product Margin
            <br />
            <span className="text-primary animate-glow">Reality Checker</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Upload any product. See if you'll <span className="text-primary font-semibold">actually make money</span> or just burn cash.
          </p>
        </div>

        {/* Upload zone */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <UploadZone />
        </div>

        {/* Alternative URL input */}
        <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="glass-card rounded-2xl p-6 max-w-md mx-auto">
            <p className="text-sm text-muted-foreground mb-3">Or paste a product URL</p>
            <div className="flex gap-3">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://aliexpress.com/item/..."
                className="glass border-primary/20 focus:border-primary"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground animate-glow">
                Analyze
              </Button>
            </div>
          </div>
        </div>

        {/* CTA button */}
        <div className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 animate-glow">
            Try 3 Free Analyses
          </Button>
        </div>
      </div>
    </section>
  );
};