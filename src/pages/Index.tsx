import { Layout } from '@/components/layout';
import {
  HeroSection,
  EcosystemMapSection,
  TheGapSection,
  HowItWorksSection,
  AdaptiveScoringSection,
  UseCasesSection,
} from '@/components/landing';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <EcosystemMapSection />
      <TheGapSection />
      <HowItWorksSection />
      <AdaptiveScoringSection />
      <UseCasesSection />
    </Layout>
  );
};

export default Index;
