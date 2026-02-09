import { Github, Globe, ExternalLink, Users, Sparkles } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ExplorerProject } from '@/hooks/useExplorerProjects';

// Custom X icon since Lucide doesn't have one
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ExpandedDetailsRowProps {
  project: ExplorerProject;
  isPrivateRepo: boolean;
  colSpan: number;
}

export function ExpandedDetailsRow({ project, isPrivateRepo, colSpan }: ExpandedDetailsRowProps) {
  return (
    <TableRow className="bg-muted/30 hover:bg-muted/30 border-border">
      <TableCell colSpan={colSpan} className="py-3">
        <div className="flex flex-wrap items-center gap-6 px-4">
          {/* GitHub Status */}
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-muted-foreground" />
            <Badge 
              variant="outline" 
              className={isPrivateRepo 
                ? 'border-amber-500/50 text-amber-500' 
                : 'border-primary/50 text-primary'
              }
            >
              {isPrivateRepo ? 'PRIVATE' : 'PUBLIC'}
            </Badge>
          </div>
          
          {/* Website */}
          {project.website_url && (
            <a 
              href={project.website_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="h-4 w-4" />
              <span className="underline">Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          
          {/* Contributors */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {project.github_contributors || '—'}
            </span>
          </div>
          
          {/* Source/Hackathon */}
          {project.discovery_source && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                {project.discovery_source}
              </Badge>
            </div>
          )}
          
          {/* X Handle */}
          {project.x_username && (
            <a 
              href={`https://x.com/${project.x_username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <XIcon className="h-4 w-4" />
              <span>@{project.x_username}</span>
            </a>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
