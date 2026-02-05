 import { Link, useLocation } from 'react-router-dom';
 import { Menu, X, ArrowRight } from 'lucide-react';
 import { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { cn } from '@/lib/utils';
 import resilienceLogo from '@/assets/resilience-logo.png';
 
 const navLinks = [
   { href: 'https://docs.resilience.dev', label: 'Docs', external: true },
   { href: '/explorer', label: 'Explorer', external: false },
   { href: 'https://grants.resilience.dev', label: 'Grants', external: true },
 ];
 
 export function Navigation() {
   const location = useLocation();
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
   return (
     <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="flex h-16 items-center justify-between">
           {/* Logo */}
           <Link to="/" className="flex items-center gap-3">
             <img src={resilienceLogo} alt="Resilience" className="h-8 w-8" />
             <span className="font-display text-xl font-bold tracking-tight text-foreground">
               RESILIENCE
             </span>
           </Link>
 
           {/* Desktop Navigation */}
           <div className="hidden items-center gap-8 md:flex">
             {navLinks.map((link) =>
               link.external ? (
                 <a
                   key={link.label}
                   href={link.href}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                 >
                   {link.label}
                 </a>
               ) : (
                 <Link
                   key={link.label}
                   to={link.href}
                   className={cn(
                     'text-sm font-medium transition-colors hover:text-foreground',
                     location.pathname === link.href
                       ? 'text-primary'
                       : 'text-muted-foreground'
                   )}
                 >
                   {link.label}
                 </Link>
               )
             )}
           </div>
 
           {/* Launch App Button */}
           <div className="hidden md:block">
             <Button asChild className="font-medium">
               <Link to="/explorer">
                 Launch App
                 <ArrowRight className="ml-2 h-4 w-4" />
               </Link>
             </Button>
           </div>
 
           {/* Mobile Menu Button */}
           <Button
             variant="ghost"
             size="icon"
             className="md:hidden"
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
           >
             {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
           </Button>
         </div>
 
         {/* Mobile Menu */}
         {mobileMenuOpen && (
           <div className="border-t border-border py-4 md:hidden">
             <div className="flex flex-col gap-4">
               {navLinks.map((link) =>
                 link.external ? (
                   <a
                     key={link.label}
                     href={link.href}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-sm font-medium text-muted-foreground"
                     onClick={() => setMobileMenuOpen(false)}
                   >
                     {link.label}
                   </a>
                 ) : (
                   <Link
                     key={link.label}
                     to={link.href}
                     className={cn(
                       'text-sm font-medium',
                       location.pathname === link.href
                         ? 'text-primary'
                         : 'text-muted-foreground'
                     )}
                     onClick={() => setMobileMenuOpen(false)}
                   >
                     {link.label}
                   </Link>
                 )
               )}
               <div className="pt-2">
                 <Button asChild className="w-full font-medium">
                   <Link to="/explorer">
                     Launch App
                     <ArrowRight className="ml-2 h-4 w-4" />
                   </Link>
                 </Button>
               </div>
             </div>
           </div>
         )}
       </div>
     </nav>
   );
 }