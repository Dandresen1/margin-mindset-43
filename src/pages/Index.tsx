import { HeroSection } from '@/components/HeroSection';
import { HowItWorks } from '@/components/HowItWorks';
import { FeaturesGrid } from '@/components/FeaturesGrid';
import { PricingSection } from '@/components/PricingSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <HowItWorks />
      <FeaturesGrid />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
