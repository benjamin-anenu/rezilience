import { Layout } from '@/components/layout/Layout';
import {
  HeroSection,
  ProblemSection,
  RegistryPipelineSection,
  RealmSetupSection,
  MilestoneLockSection,
  CommunityFundingSection,
  DAOVoteReleaseSection,
  BuilderDeliversSection,
  CommitmentLockSection,
  MockDashboardSection,
  LiveAnalysisSection,
  CTASection,
} from '@/components/demo';

export default function HackathonDemo() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <HeroSection />
        <ProblemSection />
        <RegistryPipelineSection />
        <RealmSetupSection />
        <MilestoneLockSection />
        <CommunityFundingSection />
        <DAOVoteReleaseSection />
        <BuilderDeliversSection />
        <CommitmentLockSection />
        <MockDashboardSection />
        <LiveAnalysisSection />
        <CTASection />
      </div>
    </Layout>
  );
}
