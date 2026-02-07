import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface StickyCTAProps {
  programId: string;
  projectName?: string;
}

export function StickyCTA({ programId, projectName }: StickyCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm safe-bottom lg:hidden">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Support this project
          </span>
          <span className="font-display text-sm font-semibold text-foreground line-clamp-1">
            {projectName || 'Project'}
          </span>
        </div>
        <Button 
          asChild 
          className="gap-2 font-display font-semibold uppercase tracking-wider shadow-lg"
        >
          <Link to={`/staking?program=${programId}`}>
            <Heart className="h-4 w-4" />
            STAKE NOW
          </Link>
        </Button>
      </div>
    </div>
  );
}
