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
              The team behind this protocol hasn't added their information yet.
              Check back later for updates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Team Members Section */}
      {hasTeamMembers && (
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
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers
              .sort((a, b) => a.order - b.order)
              .map((member) => (
                <Card
                  key={member.id}
                  className="group overflow-hidden border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  {/* Large Profile Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <span className="font-display text-5xl font-bold text-primary/60">
                          {getInitials(member.name)}
                        </span>
                      </div>
                    )}
                    
                    {/* Role Badge Overlay */}
                    <div className="absolute bottom-3 left-3">
                      <Badge 
                        variant={getRoleBadgeVariant(member.role)}
                        className="font-display text-xs uppercase tracking-wider shadow-md"
                      >
                        {getRoleLabel(member)}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Member Info */}
                  <CardContent className="p-4 space-y-3">
                    {/* Name & Nickname */}
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {member.name}
                      </h3>
                      {member.nickname && (
                        <p className="text-sm text-muted-foreground">
                          @{member.nickname}
                        </p>
                      )}
                    </div>
                    
                    {/* Job Title */}
                    <p className="text-sm text-foreground/90 font-medium">
                      {member.jobTitle}
                    </p>
                    
                    {/* Why Fit Quote */}
                    {member.whyFit && (
                      <div className="relative pt-2 border-t border-border/50">
                        <Quote className="absolute -top-1 left-0 h-4 w-4 text-primary/40" />
                        <p className="pl-5 text-sm italic text-muted-foreground leading-relaxed">
                          {member.whyFit}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Why Stake Section */}
      {hasStakingPitch && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
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
      )}
    </div>
  );
}
