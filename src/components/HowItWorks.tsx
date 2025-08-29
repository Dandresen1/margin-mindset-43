import { Upload, Calculator, Target } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload or Paste",
      description: "Drop your product image or paste an AliExpress/Amazon URL. We'll extract all the details automatically.",
      number: "01"
    },
    {
      icon: Calculator,
      title: "We Calculate Everything", 
      description: "Our AI analyzes costs, competitors, market trends, and calculates your real profit margins across 3 pricing strategies.",
      number: "02"
    },
    {
      icon: Target,
      title: "Get Real Numbers",
      description: "Receive a comprehensive report with GO/NO-GO recommendations, bundle opportunities, and GTM strategies.",
      number: "03"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            From product to profit analysis in under 60 seconds
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary/50 to-primary/50"></div>
          
          {steps.map((step, index) => (
            <div 
              key={index}
              className="text-center space-y-4 animate-slide-up"
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              {/* Step number */}
              <div className="relative mx-auto w-20 h-20 glass-card rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-primary">{step.number}</span>
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse"></div>
              </div>

              {/* Icon */}
              <div className="mx-auto w-16 h-16 glass rounded-xl flex items-center justify-center group hover:bg-primary/10 transition-colors">
                <step.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};