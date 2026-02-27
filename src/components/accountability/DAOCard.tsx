import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink, Users, Target, Activity } from 'lucide-react';
import type { DAOGroup } from '@/hooks/useAccountabilityData';

interface DAOCardProps {
  dao: DAOGroup;
}

export function DAOCard({ dao }: DAOCardProps) {
  const completionRate = dao.totalMilestones > 0
    ? Math.round((dao.completedMilestones / dao.totalMilestones) * 100)
    : 0;

  const truncatedAddress = dao.realmAddress.slice(0, 4) + '...' + dao.realmAddress.slice(-4);

  return (
    <Card className="border-border bg-card transition-colors hover:border-primary/30">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-display text-base font-bold uppercase tracking-tight text-foreground">
              {dao.realmName}
            </h3>
            <span className="font-mono text-[10px] text-muted-foreground">{truncatedAddress}</span>
          </div>
          <Badge
            className={
              dao.avgScore >= 70
                ? 'bg-primary/20 text-primary'
                : dao.avgScore >= 40
                ? 'bg-yellow-500/20 text-yellow-500'
                : 'bg-destructive/20 text-destructive'
            }
          >
            {dao.avgScore}
          </Badge>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <Users className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <p className="font-mono text-sm font-bold text-foreground">{dao.projects.length}</p>
            <p className="text-[10px] text-muted-foreground">PROJECTS</p>
          </div>
          <div className="text-center">
            <Target className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <p className="font-mono text-sm font-bold text-foreground">
              {dao.completedMilestones}/{dao.totalMilestones}
            </p>
            <p className="text-[10px] text-muted-foreground">MILESTONES</p>
          </div>
          <div className="text-center">
            <Activity className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <p className="font-mono text-sm font-bold text-foreground">{completionRate}%</p>
            <p className="text-[10px] text-muted-foreground">DELIVERY</p>
          </div>
        </div>

        {dao.lastGovernanceActivity && (
          <p className="mb-3 text-[10px] text-muted-foreground">
            Last activity:{' '}
            {new Date(dao.lastGovernanceActivity).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}

        <div className="flex gap-2">
          <Button asChild variant="default" size="sm" className="flex-1 font-display text-xs uppercase">
            <Link to={`/accountability/${dao.realmAddress}`}>
              VIEW
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="font-display text-xs uppercase"
            asChild
          >
            <a
              href={`https://app.realms.today/dao/${dao.realmAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
