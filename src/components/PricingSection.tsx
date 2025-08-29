import { Check, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PricingSection = () => {
  const plans = [
    {
      name: "Free Trial",
      price: "$0",
      period: "3 analyses",
      description: "Perfect for testing the waters",
      icon: Zap,
      features: [
        "3 product analyses",
        "Basic margin calculator",
        "Competitor price check",
        "Platform fee breakdown",
        "PDF export"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "For serious dropshippers & sellers",
      icon: Crown,
      features: [
        "Unlimited product analyses",
        "Advanced margin calculator",
        "Deep competitor intelligence",
        "Bundle opportunity finder",
        "GTM strategy recommendations",
        "Market saturation analysis",
        "Trend & seasonality data",
        "Priority support",
        "Chrome extension access"
      ],
      cta: "Upgrade to Pro",
      popular: true
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Simple, <span className="text-primary">Honest</span> Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Stop wasting money on bad products. One analysis pays for itself.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`
                glass-card rounded-2xl p-8 relative transition-all duration-300 animate-slide-up
                ${plan.popular 
                  ? 'border-2 border-primary bg-primary/5 scale-105' 
                  : 'hover:bg-primary/5'
                }
              `}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 glass rounded-xl flex items-center justify-center mb-4">
                  <plan.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`
                  w-full py-6 text-lg font-semibold
                  ${plan.popular 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground animate-glow' 
                    : 'glass border-primary/30 hover:border-primary hover:bg-primary/10'
                  }
                `}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            🔒 Secure payments via Stripe • Cancel anytime • No hidden fees
          </p>
        </div>
      </div>
    </section>
  );
};