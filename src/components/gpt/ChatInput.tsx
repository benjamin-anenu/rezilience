import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  showSuggestions: boolean;
}

const SUGGESTIONS = [
  'What is the Resilience Score and how is it calculated?',
  'How do I claim my project profile?',
  'What does the dependency health score measure?',
  'How does authority verification work on Solana?',
  'What are the four phases of the Resilience roadmap?',
  'How can I improve my project\'s resilience score?',
];

export function ChatInput({ onSend, isLoading, showSuggestions }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur p-4 space-y-3">
      {showSuggestions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-3xl mx-auto">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSend(s)}
              disabled={isLoading}
              className="text-left text-xs font-mono px-3 py-2.5 rounded-sm border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors truncate disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Resilience, Solana programs, scoring..."
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none bg-card border border-border rounded-sm px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50 font-body"
        />
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="h-10 w-10 flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <p className="text-center text-[10px] font-mono text-muted-foreground/60 max-w-3xl mx-auto">
        ResilienceGPT is a community tool — not official Solana Foundation support. Always DYOR.
      </p>
    </div>
  );
}
