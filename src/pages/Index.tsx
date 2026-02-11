import { Layout } from '@/components/layout';
import {
  HeroSection,
  TheGapSection,
  HowItWorksSection,
  AdaptiveScoringSection,
  UseCasesSection,
} from '@/components/landing';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <TheGapSection />
      <HowItWorksSection />
      <AdaptiveScoringSection />
      <UseCasesSection />
    </Layout>
  );
};

export default Index;
