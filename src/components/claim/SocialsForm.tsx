import { Github, Lock, MessageCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReputationBar } from './ReputationBar';

interface SocialsFormProps {
  githubOrgUrl: string;
  setGithubOrgUrl: (value: string) => void;
  xHandle: string;
  discordUrl: string;
  setDiscordUrl: (value: string) => void;
  telegramUrl: string;
  setTelegramUrl: (value: string) => void;
  onGitHubConnect: () => void;
  githubConnected: boolean;
}

export const SocialsForm = ({
  githubOrgUrl,
  setGithubOrgUrl,
  xHandle,
  discordUrl,
  setDiscordUrl,
  telegramUrl,
  setTelegramUrl,
  onGitHubConnect,
  githubConnected,
}: SocialsFormProps) => {
  return (
    <div className="space-y-6">
      {/* Reputation Progress */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <ReputationBar
            githubConnected={githubConnected}
            xLinked={!!xHandle}
            discordLinked={!!discordUrl}
            telegramLinked={!!telegramUrl}
          />
        </CardContent>
      </Card>

      {/* GitHub Integration */}
      <Card className="border-primary/30 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <Github className="h-5 w-5 text-primary" />
            <span className="font-display text-lg uppercase tracking-tight">
              GitHub Integration
            </span>
            <span className="ml-auto rounded-sm bg-primary/20 px-2 py-0.5 text-[10px] font-mono uppercase text-primary">
              REQUIRED
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground">
            "IN AN OPEN-SOURCE WORLD, PRIVACY IS ROT."
          </blockquote>

          <p className="text-sm text-muted-foreground">
            This is where the <span className="font-semibold text-primary">Heartbeat</span> data 
            (Velocity/Commits) is captured. Link your GitHub Organization or Repository.
          </p>

          <div className="space-y-2">
            <Label htmlFor="githubOrg" className="font-display text-xs uppercase tracking-wider">
              GitHub Organization/Repo URL
            </Label>
            <Input
              id="githubOrg"
              placeholder="https://github.com/your-org"
              value={githubOrgUrl}
              onChange={(e) => setGithubOrgUrl(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="rounded-sm border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-4 w-4 text-primary" />
              <div className="text-sm">
                <span className="font-semibold text-foreground">Read-Only Access: </span>
                <span className="text-muted-foreground">
                  We only read commit history, releases, and contributor data. 
                  Your code remains yours.
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={onGitHubConnect}
            className="w-full font-display font-semibold uppercase tracking-wider"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            CONNECT GITHUB
          </Button>
        </CardContent>
      </Card>

      {/* Social Registry */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="font-display text-lg uppercase tracking-tight">
              Social Registry
            </span>
            <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
              OPTIONAL
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Link additional socials to increase your Reputation Score.
          </p>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-display text-xs uppercase tracking-wider">
              <span className="text-lg">𝕏</span> X Handle
            </Label>
            <Input
              value={xHandle ? `@${xHandle}` : ''}
              disabled
              className="font-mono text-primary"
              placeholder="Auto-filled from X login"
            />
            <p className="text-[10px] text-muted-foreground">
              Automatically linked from your X authentication
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discordUrl" className="flex items-center gap-2 font-display text-xs uppercase tracking-wider">
              <MessageCircle className="h-4 w-4" /> Discord Invite
            </Label>
            <Input
              id="discordUrl"
              placeholder="https://discord.gg/..."
              value={discordUrl}
              onChange={(e) => setDiscordUrl(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegramUrl" className="flex items-center gap-2 font-display text-xs uppercase tracking-wider">
              <Send className="h-4 w-4" /> Telegram Link
            </Label>
            <Input
              id="telegramUrl"
              placeholder="https://t.me/..."
              value={telegramUrl}
              onChange={(e) => setTelegramUrl(e.target.value)}
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
