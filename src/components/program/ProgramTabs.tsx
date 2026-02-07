import { useSearchParams } from 'react-router-dom';
import { BookOpen, Code, Users, Map, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ProgramTabsProps {
  children: {
    about: React.ReactNode;
    development: React.ReactNode;
    community: React.ReactNode;
    roadmap: React.ReactNode;
    support: React.ReactNode;
  };
}

const tabConfig = [
  { value: 'about', label: 'About', icon: BookOpen },
  { value: 'development', label: 'Development', icon: Code },
  { value: 'community', label: 'Community', icon: Users },
  { value: 'roadmap', label: 'Roadmap', icon: Map },
  { value: 'support', label: 'Support', icon: Zap },
] as const;

export function ProgramTabs({ children }: ProgramTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'about';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      {/* Premium Tab Bar */}
      <div className="relative mb-6">
        {/* Gradient border effect */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-border bg-transparent p-0 scrollbar-none">
          {tabConfig.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 font-display text-sm uppercase tracking-wider transition-all",
                "data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                "min-w-[100px] touch-feedback"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              
              {/* Active glow effect */}
              <span 
                className={cn(
                  "absolute bottom-0 left-1/2 h-8 w-24 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/20 blur-xl opacity-0 transition-opacity",
                  "data-[state=active]:opacity-100"
                )}
                data-state={currentTab === tab.value ? 'active' : 'inactive'}
              />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Tab Content */}
      <TabsContent value="about" className="mt-0 animate-in fade-in-50 duration-300">
        {children.about}
      </TabsContent>

      <TabsContent value="development" className="mt-0 animate-in fade-in-50 duration-300">
        {children.development}
      </TabsContent>

      <TabsContent value="community" className="mt-0 animate-in fade-in-50 duration-300">
        {children.community}
      </TabsContent>

      <TabsContent value="roadmap" className="mt-0 animate-in fade-in-50 duration-300">
        {children.roadmap}
      </TabsContent>

      <TabsContent value="support" className="mt-0 animate-in fade-in-50 duration-300">
        {children.support}
      </TabsContent>
    </Tabs>
  );
}
