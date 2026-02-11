import { Link } from 'react-router-dom';
import { MessageSquarePlus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface ChatHeaderProps {
  onNewChat: () => void;
}

export function ChatHeader({ onNewChat }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 py-3">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="h-5 w-px bg-border" />
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Resilience" className="h-6 w-6 object-contain" />
        </Link>
        <div>
          <h1 className="font-display text-sm font-bold tracking-tight text-foreground">
            ResilienceGPT
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground leading-none">
            Solana Ecosystem Assistant
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onNewChat}
        className="font-display text-xs tracking-wider gap-1.5"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" />
        NEW CHAT
      </Button>
    </header>
  );
}
