import { Eye, TrendingDown, Package, AlertTriangle } from 'lucide-react';

export const FeaturesGrid = () => {
  const features = [
    {
      icon: Eye,
      title: "All Hidden Costs Revealed",
      description: "We calculate EVERYTHING: shipping, platform fees, ad spend, returns, UGC costs, and payment processing.",
      preview: "Platform fees: 6-15% • Returns: 20-30% • Ad spend: $500-2000/month"
    },
    {
      icon: TrendingDown,
      title: "Competitor Intelligence", 
      description: "See what others are charging, market saturation levels, and seasonal trends for your product.",
      preview: "47 sellers found • Avg price: $24.99 • Market: Highly saturated"
    },
    {
      icon: Package,
      title: "Bundle Opportunities",
      description: "Discover complementary products that multiply your profit margins through strategic bundling.",
      preview: "Bundle potential: +67% profit • 3 complementary products found"
    },
    {
      icon: AlertTriangle,
      title: "Honest Recommendations",
      description: "Get brutally honest GO/NO-GO decisions with clear reasoning. We'll save you from bad investments.",
      preview: "🔴 HIGH RISK: Oversaturated market, low margins, high return rate"
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Stop Guessing, Start <span className="text-primary">Knowing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We crunch the numbers so you don't have to. Every hidden cost, every competitor, every red flag.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card rounded-2xl p-8 hover:bg-primary/5 transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="glass rounded-xl p-3 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <div className="glass rounded-lg p-3 bg-primary/5">
                    <p className="text-sm font-mono text-primary/80">{feature.preview}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};