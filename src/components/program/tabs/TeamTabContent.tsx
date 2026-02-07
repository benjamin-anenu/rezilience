import { Users2, BadgeCheck, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
              The team behind this protocol hasn't added their information yet.
              Check back later for updates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Members Section */}
      {hasTeamMembers && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-display text-sm uppercase tracking-wider text-muted-foreground">
              <Users2 className="h-4 w-4 text-primary" />
              Meet The Team
              {isVerified && (
                <BadgeCheck className="h-4 w-4 text-primary" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers
                .sort((a, b) => a.order - b.order)
                .map((member) => (
                  <div
                    key={member.id}
                    className="group rounded-sm border border-border bg-muted/30 p-4 transition-all hover:border-primary/30 hover:bg-muted/50"
                  >
                    {/* Avatar & Name */}
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={member.imageUrl} alt={member.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-display text-sm font-semibold text-foreground">
                          {member.name}
                        </h4>
                        {member.nickname && (
                          <p className="truncate text-xs text-muted-foreground">
                            @{member.nickname}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Role Badge */}
                    <Badge 
                      variant={getRoleBadgeVariant(member.role)}
                      className="mb-3 font-display text-xs uppercase tracking-wider"
                    >
                      {getRoleLabel(member)}
                    </Badge>

                    {/* Job Title */}
                    <p className="mb-3 text-sm text-foreground">
                      {member.jobTitle}
                    </p>

                    {/* Why Fit */}
                    {member.whyFit && (
                      <p className="text-xs italic text-muted-foreground line-clamp-3">
                        "{member.whyFit}"
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Why Stake Section */}
      {hasStakingPitch && (
        <Card className="border-border bg-gradient-to-br from-primary/5 via-card to-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-display text-sm uppercase tracking-wider text-muted-foreground">
              <Target className="h-4 w-4 text-primary" />
              Why Stake On This Project?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="border-l-2 border-primary/50 pl-4">
              <p className="text-foreground leading-relaxed">
                {stakingPitch}
              </p>
            </blockquote>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
