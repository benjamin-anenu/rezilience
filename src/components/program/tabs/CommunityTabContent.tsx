import { MessageCircle, Send, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BuildInPublicSection, BuildInPublicVideo } from '../BuildInPublicSection';
import { TwitterPulseSection, Tweet } from '../TwitterPulseSection';
import { cn } from '@/lib/utils';

interface CommunityTabContentProps {
  buildInPublicVideos?: BuildInPublicVideo[];
  xUsername?: string;
  twitterFollowers?: number;
  twitterEngagementRate?: number;
  twitterRecentTweets?: Tweet[];
  twitterLastSynced?: string;
  discordUrl?: string;
  telegramUrl?: string;
  githubUrl?: string;
  isVerified?: boolean;
}

interface SocialLinkCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  url?: string;
  brandColor?: string;
}

function SocialLinkCard({ icon, name, description, url, brandColor }: SocialLinkCardProps) {
  if (!url) {
    return (
      <div className="flex items-center gap-4 rounded-sm border border-border/50 bg-muted/10 p-4 opacity-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-muted">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-display text-sm font-medium text-muted-foreground">{name}</h4>
          <p className="text-xs text-muted-foreground/70">Not connected</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-sm border border-border bg-muted/30 p-4 card-lift transition-all hover:border-primary/20 hover:bg-muted/50"
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-sm transition-colors",
          brandColor || "bg-primary/10"
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-display text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {name}
        </h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </a>
  );
}

export function CommunityTabContent({
  buildInPublicVideos,
  xUsername,
  twitterFollowers,
  twitterEngagementRate,
  twitterRecentTweets,
  twitterLastSynced,
  discordUrl,
  telegramUrl,
  githubUrl,
  isVerified,
}: CommunityTabContentProps) {
  const hasVideos = buildInPublicVideos && buildInPublicVideos.length > 0;
  const hasTwitter = xUsername;
  const hasSocials = discordUrl || telegramUrl || githubUrl;

  return (
    <div className="space-y-6">
      {/* Build In Public Section */}
      {isVerified && hasVideos && (
        <BuildInPublicSection
          videos={buildInPublicVideos}
          xUsername={xUsername}
        />
      )}

      {/* Twitter Pulse */}
      {isVerified && hasTwitter && (
        <TwitterPulseSection
          xUsername={xUsername}
          followers={twitterFollowers}
          engagementRate={twitterEngagementRate}
          recentTweets={twitterRecentTweets}
          lastSynced={twitterLastSynced}
        />
      )}

      {/* Social Links Grid */}
      <Card className="card-premium border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Connect With The Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* X/Twitter */}
            <SocialLinkCard
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-foreground">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              }
              name="X (Twitter)"
              description={xUsername ? `@${xUsername}` : 'Follow for updates'}
              url={xUsername ? `https://x.com/${xUsername}` : undefined}
              brandColor="bg-black/80"
            />

            {/* Discord */}
            <SocialLinkCard
              icon={<MessageCircle className="h-6 w-6 text-[#5865F2]" />}
              name="Discord"
              description="Join the community"
              url={discordUrl}
              brandColor="bg-[#5865F2]/10"
            />

            {/* Telegram */}
            <SocialLinkCard
              icon={<Send className="h-6 w-6 text-[#0088cc]" />}
              name="Telegram"
              description="Chat with the team"
              url={telegramUrl}
              brandColor="bg-[#0088cc]/10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {!hasVideos && !hasTwitter && !hasSocials && (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No community links available yet.</p>
            <p className="text-sm text-muted-foreground/70">
              Connect with this project once they add their socials.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
