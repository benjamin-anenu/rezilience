import { Github, MessageCircle, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ReputationBarProps {
  githubConnected: boolean;
  xLinked: boolean;
  discordLinked: boolean;
  telegramLinked: boolean;
  className?: string;
}

export const ReputationBar = ({
  githubConnected,
  xLinked,
  discordLinked,
  telegramLinked,
  className,
}: ReputationBarProps) => {
  // Calculate reputation score
  let score = 0;
  if (githubConnected) score += 40; // GitHub is most important
  if (xLinked) score += 20;
  if (discordLinked) score += 20;
  if (telegramLinked) score += 20;

  const socials = [
    { key: 'github', icon: Github, label: 'GitHub', connected: githubConnected, required: true },
    { key: 'x', icon: () => <span className="text-sm">𝕏</span>, label: 'X', connected: xLinked, required: false },
    { key: 'discord', icon: MessageCircle, label: 'Discord', connected: discordLinked, required: false },
    { key: 'telegram', icon: Send, label: 'Telegram', connected: telegramLinked, required: false },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-display uppercase tracking-wider text-muted-foreground">
          Reputation Score
        </span>
        <span className="font-mono font-bold text-primary">{score}%</span>
      </div>
      
      <Progress value={score} className="h-2" />
      
      <div className="flex justify-between gap-2">
        {socials.map((social) => {
          const Icon = social.icon;
          return (
            <div
              key={social.key}
              className={cn(
                'flex flex-col items-center gap-1 text-center',
                social.connected ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  social.connected
                    ? 'bg-primary/20'
                    : 'bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px]">
                {social.label}
                {social.required && <span className="text-destructive">*</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
