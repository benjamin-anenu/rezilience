import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { StakingForm, BondSummary } from '@/components/staking';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
 
 const Staking = () => {
   const [formData, setFormData] = useState({
     programId: '',
     programName: '',
     amount: 0,
     lockupMonths: 12,
     isValid: false,
   });
 
   return (
     <Layout>
       <div className="py-8">
         <div className="container mx-auto px-4 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
                  STAKE FOR ASSURANCE
                </h1>
                <p className="text-muted-foreground">
                  Create a bond to support program resilience and earn rewards.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/my-bonds">
                  <Eye className="mr-2 h-4 w-4" />
                  VIEW MY BONDS
                </Link>
              </Button>
            </div>
 
           {/* Main content grid */}
           <div className="grid gap-8 lg:grid-cols-5">
             {/* Form - takes 3 columns */}
             <div className="lg:col-span-3">
               <StakingForm onFormChange={setFormData} />
             </div>
 
             {/* Summary - takes 2 columns */}
             <div className="lg:col-span-2">
               <div className="sticky top-24">
                 <BondSummary formData={formData} />
               </div>
             </div>
           </div>
         </div>
       </div>
     </Layout>
   );
 };
 
 export default Staking;