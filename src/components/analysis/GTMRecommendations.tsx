import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, Target, Video, ShoppingBag, AlertTriangle, CheckCircle } from 'lucide-react';

interface GTMRecommendationsProps {
  verdict: 'GO' | 'CAUTION' | 'NO-GO';
  category: string;
}

export function GTMRecommendations({ verdict, category }: GTMRecommendationsProps) {
  const platformStrategies = {
    tiktok: {
      name: 'TikTok Shop',
      fees: '6-8%',
      pros: ['Viral potential', 'Young audience', 'Lower competition'],
      cons: ['Quality concerns', 'Limited customer data', 'Trend dependent'],
      strategy: 'Focus on UGC content, influencer partnerships, and trending hashtags'
    },
    amazon: {
      name: 'Amazon FBA',
      fees: '8-15%',
      pros: ['Massive reach', 'Prime shipping', 'Trust factor'],
      cons: ['High competition', 'Expensive fees', 'Limited branding'],
      strategy: 'Optimize for keywords, focus on reviews, use Amazon PPC strategically'
    },
    shopify: {
      name: 'Shopify Store',
      fees: '2.9% + 30¢',
      pros: ['Full control', 'Better margins', 'Brand building'],
      cons: ['Need traffic', 'Higher CAC', 'More work'],
      strategy: 'Build email list, focus on content marketing, use Facebook/Google ads'
    }
  };

  const getVerdictStrategy = () => {
    switch (verdict) {
      case 'GO':
        return {
          icon: CheckCircle,
          color: 'text-success',
          title: 'Full Speed Ahead Strategy',
          recommendations: [
            'Launch on multiple platforms simultaneously',
            'Invest in professional product photography',
            'Create comprehensive content strategy',
            'Set up tracking and analytics from day one'
          ]
        };
      case 'CAUTION':
        return {
          icon: AlertTriangle,
          color: 'text-warning',
          title: 'Careful Launch Strategy',
          recommendations: [
            'Start with one platform to test market response',
            'Keep initial inventory low to manage risk',
            'Focus heavily on differentiation and unique value prop',
            'Monitor competitors closely and adjust quickly'
          ]
        };
      case 'NO-GO':
        return {
          icon: AlertTriangle,
          color: 'text-destructive',
          title: 'Alternative Approach Needed',
          recommendations: [
            'Consider pivoting to a different product variation',
            'Look for unique supplier arrangements or exclusivity',
            'Focus on underserved market segments',
            'Explore private label opportunities'
          ]
        };
      default:
        return {
          icon: Target,
          color: 'text-muted-foreground',
          title: 'Standard Launch Strategy',
          recommendations: ['Follow best practices for your chosen platform']
        };
    }
  };

  const verdictStrategy = getVerdictStrategy();
  const VerdictIcon = verdictStrategy.icon;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Go-to-Market Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Verdict-Based Strategy */}
        <div className={`p-4 rounded-lg border ${verdict === 'GO' ? 'bg-success/10 border-success/20' : verdict === 'CAUTION' ? 'bg-warning/10 border-warning/20' : 'bg-destructive/10 border-destructive/20'}`}>
          <div className="flex items-start gap-3">
            <VerdictIcon className={`h-5 w-5 ${verdictStrategy.color} mt-0.5`} />
            <div>
              <h4 className={`font-semibold ${verdictStrategy.color} mb-2`}>
                {verdictStrategy.title}
              </h4>
              <ul className="text-sm space-y-1">
                {verdictStrategy.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 opacity-60"></div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Platform-Specific Strategies */}
        <Tabs defaultValue="tiktok" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tiktok">TikTok Shop</TabsTrigger>
            <TabsTrigger value="amazon">Amazon</TabsTrigger>
            <TabsTrigger value="shopify">Shopify</TabsTrigger>
          </TabsList>

          {Object.entries(platformStrategies).map(([key, platform]) => (
            <TabsContent key={key} value={key} className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">{platform.name}</h4>
                  <Badge variant="outline">Fees: {platform.fees}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-success mb-2">Advantages</h5>
                      <ul className="text-sm space-y-1">
                        {platform.pros.map((pro, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-success" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-destructive mb-2">Challenges</h5>
                      <ul className="text-sm space-y-1">
                        {platform.cons.map((con, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/10 border border-border/50">
                  <h5 className="font-medium mb-2">Recommended Strategy</h5>
                  <p className="text-sm text-muted-foreground">{platform.strategy}</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Content Strategy */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Video className="h-4 w-4" />
            Content & Marketing Strategy
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/10 border border-border/50">
              <h5 className="font-medium mb-3">Content Types to Create</h5>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Unboxing and first impressions videos</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Product demonstration and use cases</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Comparison with competitors</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>User-generated content campaigns</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-muted/10 border border-border/50">
              <h5 className="font-medium mb-3">Marketing Channels</h5>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Facebook/Instagram Ads (25% of revenue)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>TikTok organic content + ads</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Influencer partnerships (micro-influencers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Email marketing for retention</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <h4 className="font-semibold text-primary mb-3">Recommended Launch Timeline</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge>Week 1-2</Badge>
              <span className="text-sm">Source samples, validate quality, negotiate terms</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge>Week 3-4</Badge>
              <span className="text-sm">Create content, set up store/listings, build landing pages</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge>Week 5-6</Badge>
              <span className="text-sm">Order initial inventory, launch soft (friends/family)</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge>Week 7+</Badge>
              <span className="text-sm">Full launch with ads, influencer outreach, optimize based on data</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}