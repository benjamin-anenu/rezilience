import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { ChatHeader } from '@/components/gpt/ChatHeader';
import { ChatMessage } from '@/components/gpt/ChatMessage';
import { ChatInput } from '@/components/gpt/ChatInput';
import { ChatSidebar } from '@/components/gpt/ChatSidebar';
import { AlertTriangle } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string; dbId?: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-gpt`;
const HISTORY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-history`;

const historyFetch = (path: string, opts?: RequestInit) =>
  fetch(`${HISTORY_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      ...opts?.headers,
    },
  });

export default function ResilienceGPT() {
  const { user, isAuthenticated } = useAuth();
  const { trackEvent } = useAnalyticsTracker();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load from localStorage for guests
  useEffect(() => {
    if (!isAuthenticated) {
      const stored = localStorage.getItem('resilience_gpt_messages');
      if (stored) {
        try { setMessages(JSON.parse(stored)); } catch { /* ignore */ }
      }
    }
  }, [isAuthenticated]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!isAuthenticated && messages.length > 0) {
      localStorage.setItem('resilience_gpt_messages', JSON.stringify(messages));
    }
  }, [messages, isAuthenticated]);

  const saveMessageToDb = useCallback(async (convId: string, role: string, content: string): Promise<string | null> => {
    if (!isAuthenticated || !user) return null;
    try {
      const resp = await historyFetch('?action=message', {
        method: 'POST',
        body: JSON.stringify({ conversation_id: convId, user_id: user.id, role, content }),
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.id;
      }
    } catch (e) {
      console.error('Failed to save message:', e);
    }
    return null;
  }, [isAuthenticated, user]);

  const createConversation = useCallback(async (firstMessage: string): Promise<string | null> => {
    if (!isAuthenticated || !user) return null;
    const title = firstMessage.slice(0, 80) + (firstMessage.length > 80 ? '...' : '');
    try {
      const resp = await historyFetch('?action=create', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id, title }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setSidebarRefresh(p => p + 1);
        return data.id;
      }
    } catch (e) {
      console.error('Failed to create conversation:', e);
    }
    return null;
  }, [isAuthenticated, user]);

  const loadConversation = useCallback(async (convId: string) => {
    if (!user) return;
    try {
      const resp = await historyFetch(`?action=messages&conversation_id=${encodeURIComponent(convId)}&user_id=${encodeURIComponent(user.id)}`);
      if (resp.ok) {
        const data = await resp.json();
        setMessages(data.map((m: any) => ({ role: m.role, content: m.content, dbId: m.id })));
        setConversationId(convId);
      }
    } catch (e) {
      console.error('Failed to load conversation:', e);
    }
  }, [user]);

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    if (!isAuthenticated) {
      localStorage.removeItem('resilience_gpt_messages');
    }
  };

  const handleSend = async (input: string) => {
    trackEvent('feature_use', 'gpt_message_send');
    const userMsg: Msg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let convId = conversationId;
    if (!convId && isAuthenticated && user) {
      convId = await createConversation(input);
      setConversationId(convId);
    }

    if (convId) {
      const dbId = await saveMessageToDb(convId, 'user', input);
      if (dbId) userMsg.dbId = dbId;
    }

    let assistantSoFar = '';
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          conversation_id: convId,
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
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
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
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch { /* ignore */ }
        }
      }

      // Save assistant message and store dbId
      if (convId && assistantSoFar) {
        const dbId = await saveMessageToDb(convId, 'assistant', assistantSoFar);
        if (dbId) {
          setMessages(prev => prev.map((m, i) =>
            i === prev.length - 1 && m.role === 'assistant' ? { ...m, dbId } : m
          ));
        }
      }
    } catch (e: any) {
      console.error('Chat error:', e);
      const errorMsg = e.message || 'Something went wrong. Please try again.';
      setMessages(prev => [
        ...prev,
        { role: 'assistant' as const, content: `⚠️ ${errorMsg}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (index: number, feedback: 'up' | 'down') => {
    const msg = messages[index];
    if (!msg?.dbId || !isAuthenticated || !user) return;
    try {
      await historyFetch('?action=feedback', {
        method: 'POST',
        body: JSON.stringify({ message_id: msg.dbId, user_id: user.id, feedback }),
      });
    } catch (e) {
      console.error('Failed to send feedback:', e);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        activeConversationId={conversationId}
        onSelectConversation={loadConversation}
        onNewChat={handleNewChat}
        refreshTrigger={sidebarRefresh}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader onNewChat={handleNewChat} />

        {!isAuthenticated && (
          <div className="flex items-center gap-2 px-4 py-2 bg-card border-b border-border text-xs font-mono text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
            <span>Chat history is stored locally and will be lost when you close this page. Sign in to save your conversations.</span>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="h-16 w-16 rounded-sm border border-primary/20 bg-primary/5 flex items-center justify-center mb-4">
                <span className="font-display text-2xl font-bold text-primary">R</span>
              </div>
              <h2 className="font-display text-lg font-bold text-foreground mb-1">
                RezilienceGPT
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mb-8">
                Ask about the Rezilience platform, Solana program health scoring, dependency analysis, or anything in the ecosystem.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-4">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isLoading && i === messages.length - 1 && msg.role === 'assistant'}
                  onFeedback={msg.role === 'assistant' ? (fb) => handleFeedback(i, fb) : undefined}
                />
              ))}
              {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && (
                <div className="flex gap-3 px-4 py-4">
                  <div className="flex-shrink-0 h-7 w-7 rounded-sm border border-primary/30 bg-primary/10 flex items-center justify-center">
                    <span className="font-display text-xs font-bold text-primary">R</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Searching database...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          showSuggestions={messages.length === 0}
        />
      </div>
    </div>
  );
}
