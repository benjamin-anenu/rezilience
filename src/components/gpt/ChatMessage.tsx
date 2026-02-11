import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'up' | 'down' | null;
  onFeedback?: (feedback: 'up' | 'down') => void;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, feedback, onFeedback, isStreaming }: ChatMessageProps) {
  const [localFeedback, setLocalFeedback] = useState<'up' | 'down' | null>(feedback ?? null);

  const handleFeedback = (fb: 'up' | 'down') => {
    setLocalFeedback(fb);
    onFeedback?.(fb);
  };

  const isUser = role === 'user';

  return (
    <div className={cn('flex gap-3 px-4 py-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0 h-7 w-7 rounded-sm border border-primary/30 bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={cn('max-w-[75%] space-y-2', isUser && 'order-first')}>
        <div
          className={cn(
            'rounded-sm px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-primary/15 border border-primary/20 text-foreground'
              : 'bg-card border border-border text-foreground'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-primary prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-xs prose-pre:bg-background prose-pre:border prose-pre:border-border prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5" />
          )}
        </div>

        {!isUser && !isStreaming && content && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFeedback('up')}
              className={cn(
                'p-1 rounded-sm transition-colors',
                localFeedback === 'up'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleFeedback('down')}
              className={cn(
                'p-1 rounded-sm transition-colors',
                localFeedback === 'down'
                  ? 'text-destructive bg-destructive/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 h-7 w-7 rounded-sm border border-border bg-muted flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
