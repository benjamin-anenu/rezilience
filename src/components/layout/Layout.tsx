 import { ReactNode } from 'react';
 import { Navigation } from './Navigation';
 import { Footer } from './Footer';
 
 interface LayoutProps {
   children: ReactNode;
   showFooter?: boolean;
 }
 
 export function Layout({ children, showFooter = true }: LayoutProps) {
   return (
     <div className="flex min-h-screen flex-col">
       <Navigation />
       <main className="flex-1 pt-16">{children}</main>
       {showFooter && <Footer />}
     </div>
   );
 }