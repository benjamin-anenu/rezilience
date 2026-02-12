import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-gpt`;

type Msg = { role: 'user' | 'assistant'; content: string };

interface AskGptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: string;
  context?: string;
}

function buildInitialPrompt(topic: string, context?: string): string {
  return `Teach me about "${topic}"${context ? `. Context: ${context}` : ''}. Explain like I'm a complete beginner — use simple analogies and real Solana ecosystem examples (Jupiter, Marinade, Raydium, Helius, Metaplex, Phantom, etc.). Include TypeScript or Rust code snippets where helpful. Keep it brief but thorough. After your explanation, ask me ONE follow-up question to test my understanding.`;
}

export function AskGptModal({ open, onOpenChange, topic, context }: AskGptModalProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-send initial prompt when opened
  useEffect(() => {
    if (open && !hasStarted) {
      setHasStarted(true);
      const prompt = buildInitialPrompt(topic, context);
      streamMessage(prompt, []);
    }
  }, [open, hasStarted, topic, context]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInput('');
      setIsLoading(false);
      setHasStarted(false);
    }
  }, [open]);

  const streamMessage = useCallback(async (userText: string, prevMessages: Msg[]) => {
    const userMsg: Msg = { role: 'user', content: userText };
    const allMessages = [...prevMessages, userMsg];
    setMessages(allMessages);
    setIsLoading(true);

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }
      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snapshot } : m);
                }
                return [...prev, { role: 'assistant', content: snapshot }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snapshot } : m);
                }
                return [...prev, { role: 'assistant', content: snapshot }];
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${e.message || 'Something went wrong.'}` }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    streamMessage(text, messages);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 border-primary/20 bg-background">
        <DialogHeader className="px-4 py-3 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 font-display text-sm">
            <div className="h-6 w-6 rounded-sm border border-primary/30 bg-primary/10 flex items-center justify-center">
              <span className="font-display text-xs font-bold text-primary">R</span>
            </div>
            RezilienceGPT Tutor
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3">
          {/* Hide the initial user prompt, show only assistant responses and follow-ups */}
          {messages.map((msg, i) => {
            // Hide the auto-generated first user prompt
            if (i === 0 && msg.role === 'user') return null;
            return (
              <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 h-6 w-6 rounded-sm border border-primary/30 bg-primary/10 flex items-center justify-center mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className={cn(
                  'rounded-sm px-3 py-2 text-sm max-w-[85%]',
                  msg.role === 'user'
                    ? 'bg-primary/15 border border-primary/20 text-foreground'
                    : 'bg-card border border-border text-foreground'
                )}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-primary prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-xs prose-pre:bg-background prose-pre:border prose-pre:border-border prose-a:text-primary">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                  {isLoading && i === messages.length - 1 && msg.role === 'assistant' && (
                    <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator when waiting for first response */}
          {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && (
            <div className="flex gap-2">
              <div className="flex-shrink-0 h-6 w-6 rounded-sm border border-primary/30 bg-primary/10 flex items-center justify-center">
                <span className="font-display text-[10px] font-bold text-primary">R</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="flex-1 h-9 text-sm bg-background border-border"
              disabled={isLoading}
            />
            <Button type="submit" size="sm" disabled={isLoading || !input.trim()} className="h-9 px-3">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Reusable trigger button – Solana-branded purple gradient */
export function AskGptButton({ onClick, className }: { onClick: (e: React.MouseEvent) => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#9945FF] to-[#14F195] px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_0_14px_rgba(153,69,255,0.25)] transition-all hover:shadow-[0_0_22px_rgba(153,69,255,0.45)] hover:brightness-110 active:scale-[0.97]',
        className
      )}
    >
      <Sparkles className="h-3.5 w-3.5" />
      Ask GPT
    </button>
  );
}
