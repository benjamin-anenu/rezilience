import { Fingerprint, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PublicGitHubMetrics } from '../PublicGitHubMetrics';
import { AnalyticsCharts } from '../AnalyticsCharts';
import { RecentEvents } from '../RecentEvents';
import type { GitHubAnalytics, Program } from '@/types';

interface DevelopmentTabContentProps {
  projectId: string;
  githubUrl?: string;
  analytics?: GitHubAnalytics;
  program: Program;
  githubIsFork?: boolean;
}

export function DevelopmentTabContent({
  projectId,
  githubUrl,
  analytics,
  program,
  githubIsFork,
}: DevelopmentTabContentProps) {
  // Get GitHub originality status
  const getGithubOriginalityInfo = () => {
    if (githubIsFork === undefined) {
      return { subtitle: 'Not Analyzed', value: 50, isPositive: false, isWarning: false };
    }
    if (githubIsFork) {
      return { subtitle: 'Forked Repository', value: 30, isPositive: false, isWarning: true };
    }
    return { subtitle: 'Original Repository', value: 100, isPositive: true, isWarning: false };
  };

  // Get bytecode originality status
  const getBytecodeOriginalityInfo = () => {
    switch (program.originalityStatus) {
      case 'verified':
        return { subtitle: 'Verified Original', value: 100, isPositive: true, isWarning: false, isNA: false };
      case 'fork':
        return { subtitle: 'Known Fork', value: 45, isPositive: false, isWarning: true, isNA: false };
      case 'not-deployed':
        return { subtitle: 'Not On-Chain', value: 0, isPositive: false, isWarning: false, isNA: true };
      default:
        return { subtitle: 'Unverified', value: 60, isPositive: false, isWarning: false, isNA: false };
    }
  };

  const githubOriginality = getGithubOriginalityInfo();
  const bytecodeOriginality = getBytecodeOriginalityInfo();

  const originalityMetrics = [
    {
      icon: Fingerprint,
      title: 'BYTECODE ORIGINALITY',
      subtitle: bytecodeOriginality.subtitle,
      value: bytecodeOriginality.value,
      description: 'Cryptographic fingerprint comparison against known program database.',
      isPositive: bytecodeOriginality.isPositive,
      isWarning: bytecodeOriginality.isWarning,
      isNA: bytecodeOriginality.isNA,
    },
    {
      icon: GitBranch,
      title: 'GITHUB ORIGINALITY',
      subtitle: githubOriginality.subtitle,
      value: githubOriginality.value,
      description: 'Source code provenance verification via GitHub metadata.',
      isPositive: githubOriginality.isPositive,
      isWarning: githubOriginality.isWarning,
      isNA: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* GitHub Metrics - Full Width */}
      <PublicGitHubMetrics analytics={analytics} githubUrl={githubUrl} />

      {/* Analytics Charts + Recent Events Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsCharts
            projectId={projectId}
            topContributors={analytics?.github_top_contributors}
            recentEvents={analytics?.github_recent_events}
          />
        </div>
        <div>
          <RecentEvents
            projectId={projectId}
            githubEvents={analytics?.github_recent_events}
          />
        </div>
      </div>

      {/* Originality Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {originalityMetrics.map((metric, index) => (
          <Card 
            key={metric.title} 
            className="card-premium card-lift border-border bg-card animate-card-enter"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display text-sm uppercase tracking-tight">
                    {metric.title}
                  </CardTitle>
                  <CardDescription
                    className={
                      metric.isNA
                        ? 'text-muted-foreground/50'
                        : metric.isWarning
                        ? 'text-amber-500'
                        : metric.isPositive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }
                  >
                    {metric.subtitle}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <Progress
                  value={metric.value}
                  className={`h-2 ${metric.isWarning ? '[&>div]:bg-amber-500' : ''}`}
                />
              </div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
