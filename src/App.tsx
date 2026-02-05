 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { WalletProvider } from "@/providers/WalletProvider";
import Index from "./pages/Index";
import Explorer from "./pages/Explorer";
import ProgramDetail from "./pages/ProgramDetail";
import Staking from "./pages/Staking";
import MyBonds from "./pages/MyBonds";
import NotFound from "./pages/NotFound";
 
 const queryClient = new QueryClient();
 
 const App = () => (
   <QueryClientProvider client={queryClient}>
     <WalletProvider>
       <TooltipProvider>
         <Toaster />
         <Sonner />
         <BrowserRouter>
           <Routes>
             <Route path="/" element={<Index />} />
             <Route path="/explorer" element={<Explorer />} />
             <Route path="/program/:id" element={<ProgramDetail />} />
              <Route path="/staking" element={<Staking />} />
              <Route path="/my-bonds" element={<MyBonds />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
             <Route path="*" element={<NotFound />} />
           </Routes>
         </BrowserRouter>
       </TooltipProvider>
     </WalletProvider>
   </QueryClientProvider>
 );
 
 export default App;
