import { Github, Lock, MessageCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReputationBar } from './ReputationBar';
import { GitHubUrlAnalyzer } from './GitHubUrlAnalyzer';
import type { GitHubAnalysisResult } from '@/hooks/useGitHubAnalysis';

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
  // New props for analysis flow
  analysisResult: GitHubAnalysisResult | null;
  onAnalysisComplete: (result: GitHubAnalysisResult) => void;
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
  analysisResult,
  onAnalysisComplete,
}: SocialsFormProps) => {
  const hasGitHubData = githubConnected || !!analysisResult;

  return (
    <div className="space-y-6">
      {/* Reputation Progress */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <ReputationBar
            githubConnected={hasGitHubData}
            xLinked={!!xHandle}
            discordLinked={!!discordUrl}
            telegramLinked={!!telegramUrl}
          />
        </CardContent>
      </Card>

      {/* Primary Option: Repository URL Analysis */}
      <GitHubUrlAnalyzer
        githubOrgUrl={githubOrgUrl}
        setGithubOrgUrl={setGithubOrgUrl}
        onAnalysisComplete={onAnalysisComplete}
        analysisResult={analysisResult}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-muted-foreground">OR</span>
        </div>
      </div>

      {/* Secondary Option: GitHub OAuth */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <span className="font-display text-lg uppercase tracking-tight">
              Connect GitHub Account
            </span>
            <span className="ml-auto rounded-sm bg-muted px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
              PRIVATE REPOS
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            For <span className="font-semibold text-foreground">private repositories</span> or 
            enhanced rate limits, connect your GitHub account directly.
          </p>

          <div className="rounded-sm border border-muted bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-4 w-4 text-muted-foreground" />
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
            variant="outline"
            className="w-full font-display font-semibold uppercase tracking-wider"
            size="lg"
            disabled={githubConnected}
          >
            <Github className="mr-2 h-5 w-5" />
            {githubConnected ? 'CONNECTED' : 'CONNECT GITHUB ACCOUNT'}
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
