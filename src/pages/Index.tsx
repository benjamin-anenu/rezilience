 import { Layout } from '@/components/layout';
 import {
   HeroSection,
   ProblemSolutionSection,
   HowItWorksSection,
   PillarsSection,
   UseCasesSection,
 } from '@/components/landing';
 
 const Index = () => {
   return (
     <Layout>
       <HeroSection />
       <ProblemSolutionSection />
       <HowItWorksSection />
       <PillarsSection />
       <UseCasesSection />
     </Layout>
   );
 };
 
 export default Index;
