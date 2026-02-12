import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/providers/WalletProvider";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Explorer from "./pages/Explorer";
import ProgramDetail from "./pages/ProgramDetail";
import ProfileDetail from "./pages/ProfileDetail";
import ClaimProfile from "./pages/ClaimProfile";
import GitHubCallback from "./pages/GitHubCallback";
import XCallback from "./pages/XCallback";
import Dashboard from "./pages/Dashboard";
import Staking from "./pages/Staking";
import MyBonds from "./pages/MyBonds";
import Readme from "./pages/Readme";
import DependencyTree from "./pages/DependencyTree";
import Grants from "./pages/Grants";
import Library from "./pages/Library";
import LibraryLearn from "./pages/LibraryLearn";
import LibraryDictionary from "./pages/LibraryDictionary";
import LibraryBlueprints from "./pages/LibraryBlueprints";
import LibraryBlueprintDetail from "./pages/LibraryBlueprintDetail";
import LibraryProtocols from "./pages/LibraryProtocols";
import ProtocolDetail from "./pages/ProtocolDetail";
import PitchDeck from "./pages/PitchDeck";
import ResilienceGPT from "./pages/ResilienceGPT";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/readme" element={<Readme />} />
              <Route path="/explorer" element={<Explorer />} />
              <Route path="/program/:id" element={<ProgramDetail />} />
              <Route path="/profile/:id" element={<ProfileDetail />} />
              <Route path="/claim-profile" element={<ClaimProfile />} />
              <Route path="/github-callback" element={<GitHubCallback />} />
              <Route path="/x-callback" element={<XCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/staking" element={<Staking />} />
              <Route path="/my-bonds" element={<MyBonds />} />
              <Route path="/deps/:id" element={<DependencyTree />} />
              <Route path="/grants" element={<Grants />} />
              <Route path="/library" element={<Library />} />
              <Route path="/library/learn" element={<LibraryLearn />} />
              <Route path="/library/learn/:level" element={<LibraryLearn />} />
              <Route path="/library/dictionary" element={<LibraryDictionary />} />
              <Route path="/library/blueprints" element={<LibraryBlueprints />} />
              <Route path="/library/blueprints/:slug" element={<LibraryBlueprintDetail />} />
              <Route path="/library/protocols" element={<LibraryProtocols />} />
              <Route path="/library/:slug" element={<ProtocolDetail />} />
              <Route path="/pitch" element={<PitchDeck />} />
              <Route path="/gpt" element={<ResilienceGPT />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
