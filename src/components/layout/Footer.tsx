 import { Link } from 'react-router-dom';
 import { Github, Twitter, FileText } from 'lucide-react';
 
 export function Footer() {
   return (
     <footer className="border-t border-border bg-background">
       <div className="container mx-auto px-4 py-12 lg:px-8">
         <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
           {/* Logo & Tagline */}
           <div className="flex flex-col items-center gap-2 md:items-start">
             <Link to="/" className="flex items-center gap-2">
               <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary">
                 <span className="font-display text-lg font-bold text-primary-foreground">R</span>
               </div>
               <span className="font-display text-xl font-bold tracking-tight text-foreground">
                 RESILIENCE
               </span>
             </Link>
             <p className="text-sm text-muted-foreground">
               On-Chain Assurance Layer for Solana
             </p>
           </div>
 
           {/* Links */}
           <div className="flex items-center gap-6">
             <a
               href="https://docs.resilience.dev"
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
             >
               <FileText className="h-4 w-4" />
               <span>Documentation</span>
             </a>
             <a
               href="https://github.com/resilience-protocol"
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
             >
               <Github className="h-4 w-4" />
               <span>GitHub</span>
             </a>
             <a
               href="https://twitter.com/ResilienceSol"
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
             >
               <Twitter className="h-4 w-4" />
               <span>Twitter</span>
             </a>
           </div>
         </div>
 
         <div className="mt-8 border-t border-border pt-8 text-center">
           <p className="text-xs text-muted-foreground">
             © 2024 Resilience Protocol. Built on Solana.
           </p>
         </div>
       </div>
     </footer>
   );
 }