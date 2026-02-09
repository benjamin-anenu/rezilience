import { Users2, BadgeCheck, Target, Quote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TeamMember } from '@/types';

interface TeamTabContentProps {
  teamMembers?: TeamMember[];
  stakingPitch?: string;
  isVerified?: boolean;
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'founder':
      return 'default';
    case 'developer':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getRoleLabel = (member: TeamMember) => {
  if (member.role === 'other' && member.customRole) {
    return member.customRole;
  }
  return member.role.charAt(0).toUpperCase() + member.role.slice(1);
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function TeamTabContent({ teamMembers, stakingPitch, isVerified }: TeamTabContentProps) {
  const hasTeamMembers = teamMembers && teamMembers.length > 0;
  const hasStakingPitch = stakingPitch && stakingPitch.trim().length > 0;

  // Empty state
  if (!hasTeamMembers && !hasStakingPitch) {
    return (
      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              Team Coming Soon
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              The team behind this project hasn't added their information yet.
              Check back later for updates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left Column - Why Stake (1/3 width on desktop) */}
      {hasStakingPitch && (
        <div className="lg:col-span-1">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card lg:sticky lg:top-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 font-display text-sm uppercase tracking-wider text-muted-foreground">
                <Target className="h-4 w-4 text-primary" />
                Why Stake On This Project?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-2 border-primary/50 pl-4">
                <p className="text-foreground leading-relaxed text-lg">
                  {stakingPitch}
                </p>
              </blockquote>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Right Column - Meet The Team (2/3 width on desktop, or full width if no staking pitch) */}
      {hasTeamMembers && (
        <div className={hasStakingPitch ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground uppercase tracking-wider">
                Meet The Team
              </h2>
              {isVerified && (
                <BadgeCheck className="h-5 w-5 text-primary" />
              )}
            </div>
            
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              {teamMembers
                .sort((a, b) => a.order - b.order)
                .map((member) => (
                  <Card
                    key={member.id}
                    className="group overflow-hidden border-border bg-card transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    {/* Compact Profile Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <span className="font-display text-3xl font-bold text-primary/60">
                            {getInitials(member.name)}
                          </span>
                        </div>
                      )}
                      
                      {/* Role Badge Overlay */}
                      <div className="absolute bottom-2 left-2">
                        <Badge 
                          variant={getRoleBadgeVariant(member.role)}
                          className="font-display text-xs uppercase tracking-wider shadow-md"
                        >
                          {getRoleLabel(member)}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Member Info - Compact */}
                    <CardContent className="p-3 space-y-2">
                      {/* Name & Nickname */}
                      <div>
                        <h3 className="font-display text-base font-semibold text-foreground">
                          {member.name}
                        </h3>
                        {member.nickname && (
                          <p className="text-xs text-muted-foreground">
                            @{member.nickname}
                          </p>
                        )}
                      </div>
                      
                      {/* Job Title */}
                      <p className="text-sm text-foreground/90 font-medium">
                        {member.jobTitle}
                      </p>
                      
                      {/* Why Fit Quote with Label */}
                      {member.whyFit && (
                        <div className="relative pt-2 border-t border-border/50">
                          <p className="text-xs font-medium text-primary/70 uppercase tracking-wider mb-0.5">
                            I am best fit for this project
                          </p>
                          <div className="flex items-start gap-1">
                            <Quote className="h-3 w-3 text-primary/40 flex-shrink-0 mt-0.5" />
                            <p className="text-xs italic text-muted-foreground leading-relaxed line-clamp-2">
                              {member.whyFit}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Handle case: only staking pitch, no team members */}
      {hasStakingPitch && !hasTeamMembers && (
        <div className="lg:col-span-2">
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Team Coming Soon
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                The team behind this project hasn't added their information yet.
                Check back later for updates.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
