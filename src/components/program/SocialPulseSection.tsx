import { ExternalLink, Github, MessageCircle, Send, Hash, Globe, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SocialPulseSectionProps {
  programId?: string;
  websiteUrl?: string;
  xUsername?: string;
  discordUrl?: string;
  telegramUrl?: string;
  githubUrl?: string;
  isVerified?: boolean;
}

interface SocialLinkItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  url?: string;
  isAvailable: boolean;
  copyValue?: string;
  isHighlighted?: boolean;
}

const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
};

const truncateId = (id: string, startChars = 6, endChars = 4) => {
  if (id.length <= startChars + endChars) return id;
  return `${id.slice(0, startChars)}...${id.slice(-endChars)}`;
};

function SocialLinkItem({ icon, label, sublabel, url, isAvailable, copyValue, isHighlighted }: SocialLinkItemProps) {
  const baseClasses = "flex items-center gap-3 rounded-sm border px-4 py-3 transition-colors";
  
  const availableClasses = isHighlighted
    ? "border-primary/30 bg-primary/10 hover:bg-primary/20 cursor-pointer"
    : "border-border bg-muted/30 hover:bg-muted/50 cursor-pointer";
  
  const disabledClasses = "border-border/50 bg-muted/10 cursor-not-allowed opacity-50";

  if (!isAvailable) {
    return (
      <div className={cn(baseClasses, disabledClasses)}>
        <span className="opacity-50">{icon}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground">Not linked</span>
      </div>
    );
  }

  // Special handling for Program ID (has copy button)
  if (copyValue) {
    return (
      <div className={cn(baseClasses, "border-primary/30 bg-primary/10")}>
        {icon}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-primary">{label}</span>
          {sublabel && (
            <span className="ml-2 font-mono text-xs text-muted-foreground">{sublabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(copyValue, 'Program ID');
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4 text-primary" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(baseClasses, availableClasses)}
    >
      {icon}
      <span className={cn("text-sm", isHighlighted ? "font-medium text-primary" : "")}>
        {sublabel || label}
      </span>
      <ExternalLink className={cn("ml-auto h-4 w-4", isHighlighted ? "text-primary" : "text-muted-foreground")} />
    </a>
  );
}

export function SocialPulseSection({
  programId,
  websiteUrl,
  xUsername,
  discordUrl,
  telegramUrl,
  githubUrl,
  isVerified,
}: SocialPulseSectionProps) {
  const hasProgramId = !!programId && programId.length > 0;
  const solanaExplorerUrl = hasProgramId 
    ? `https://explorer.solana.com/address/${programId}` 
    : undefined;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
          Social Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Program ID */}
        <SocialLinkItem
          icon={<Hash className={cn("h-5 w-5", hasProgramId ? "text-primary" : "")} />}
          label="Program ID"
          sublabel={hasProgramId ? truncateId(programId) : undefined}
          url={solanaExplorerUrl}
          isAvailable={hasProgramId}
          copyValue={hasProgramId ? programId : undefined}
        />

        {/* Website */}
        <SocialLinkItem
          icon={<Globe className={cn("h-5 w-5", websiteUrl ? "text-foreground" : "")} />}
          label="Website"
          sublabel={websiteUrl ? new URL(websiteUrl).hostname : undefined}
          url={websiteUrl}
          isAvailable={!!websiteUrl}
        />

        {/* X/Twitter */}
        <SocialLinkItem
          icon={<span className={cn("text-lg font-bold", xUsername ? "" : "opacity-50")}>𝕏</span>}
          label="X (Twitter)"
          sublabel={xUsername ? `@${xUsername}` : undefined}
          url={xUsername ? `https://x.com/${xUsername}` : undefined}
          isAvailable={!!xUsername}
        />

        {/* Discord */}
        <SocialLinkItem
          icon={<MessageCircle className={cn("h-5 w-5", discordUrl ? "text-[#5865F2]" : "")} />}
          label="Discord"
          url={discordUrl}
          isAvailable={!!discordUrl}
        />

        {/* Telegram */}
        <SocialLinkItem
          icon={<Send className={cn("h-5 w-5", telegramUrl ? "text-[#0088cc]" : "")} />}
          label="Telegram"
          url={telegramUrl}
          isAvailable={!!telegramUrl}
        />

        {/* GitHub - highlighted when verified */}
        <SocialLinkItem
          icon={<Github className={cn("h-5 w-5", githubUrl ? "text-primary" : "")} />}
          label="GitHub"
          sublabel={githubUrl && isVerified ? "Connected" : undefined}
          url={githubUrl}
          isAvailable={!!githubUrl}
          isHighlighted={!!githubUrl && isVerified}
        />
      </CardContent>
    </Card>
  );
}
