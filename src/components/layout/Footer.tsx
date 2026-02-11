import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, FileText, Shield, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
 
 export function Footer() {
   return (
     <footer className="border-t border-border bg-background">
       <div className="container mx-auto px-4 py-12 lg:px-8">
         <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
           {/* Logo & Tagline */}
           <div className="flex flex-col items-center gap-2 md:items-start">
             <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Rezilience" className="h-8 w-8 object-contain" />
                <span className="font-display text-xl font-bold tracking-tight text-foreground">
                  REZILIENCE
                </span>
             </Link>
              <p className="text-sm text-muted-foreground">
                On-Chain Assurance Layer for Solana
              </p>
            </div>
 
           {/* Links */}
           <div className="flex items-center gap-6">
             <a
               href="https://docs.rezilience.dev"
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
             >
               <FileText className="h-4 w-4" />
               <span>Documentation</span>
             </a>
             <a
               href="https://github.com/rezilience-protocol"
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
             >
               <Github className="h-4 w-4" />
               <span>GitHub</span>
             </a>
             <a
               href="https://twitter.com/RezilienceSol"
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
             >
               <Twitter className="h-4 w-4" />
               <span>Twitter</span>
             </a>
           </div>
         </div>
 
        {/* Data Provenance Section */}
        <div className="mt-8 border-t border-border pt-8">
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs uppercase text-primary">
                DATA PROVENANCE: PHASE 0 (INITIAL REGISTRY AUDIT)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Stats are derived from our curated Phase 0 Index. Transparency is our only product; 
              we do not use placeholder data.
            </p>
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors group">
                <span>View methodology</span>
                <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2 text-xs text-muted-foreground">
                <p><strong className="text-foreground">Registry Population:</strong> The initial index of 2,847 protocols is a curated cohort of active Solana programs identified via on-chain history and public GitHub repositories.</p>
                <p><strong className="text-foreground">Activity Metrics:</strong> "Weekly Heartbeats" are calculated as a rolling 30-day average from a verified sample of the top 50 protocols in our registry.</p>
                <p><strong className="text-foreground">Rezilience Score:</strong> The current 73.4 Benchmark represents the mean average of our internal "Phase 0" audit across the initial registry cohort.</p>
                <p><strong className="text-foreground">Beta Restrictions:</strong> Real-time GitHub API telemetry and on-chain bytecode verification are currently active for Verified Builders and Enterprise Partners only.</p>
                <div className="pt-2">
                  <Button size="sm" className="font-display font-semibold uppercase tracking-wider text-xs">
                    Claim Your Profile
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 Rezilience Protocol. Built on Solana.
          </p>
        </div>
      </div>
    </footer>
  );
}