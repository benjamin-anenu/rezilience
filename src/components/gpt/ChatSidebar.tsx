import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Trash2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  refreshTrigger: number;
}

const HISTORY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-history`;

export function ChatSidebar({ activeConversationId, onSelectConversation, onNewChat, refreshTrigger }: ChatSidebarProps) {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const resp = await fetch(`${HISTORY_URL}?action=list&user_id=${encodeURIComponent(user.id)}`, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      if (resp.ok) {
        setConversations(await resp.json());
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await fetch(`${HISTORY_URL}?action=delete&conversation_id=${encodeURIComponent(convId)}&user_id=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        onNewChat();
      }
    } catch (e) {
      console.error('Failed to delete conversation:', e);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (!isAuthenticated) return null;

  if (collapsed) {
    return (
      <div className="w-10 border-r border-border bg-background flex flex-col items-center py-3 gap-2">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="h-px w-5 bg-border" />
        <button
          onClick={onNewChat}
          className="p-1.5 rounded-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="New chat"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-background flex flex-col">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">History</span>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-5 w-5 text-muted-foreground/40 mb-2" />
            <p className="text-[11px] text-muted-foreground/60 font-mono">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={cn(
                'w-full text-left px-2.5 py-2 rounded-sm text-xs transition-colors group flex items-start gap-2',
                activeConversationId === conv.id
                  ? 'bg-primary/10 border border-primary/20 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0 opacity-50" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-body leading-tight">{conv.title}</p>
                <p className="text-[10px] font-mono opacity-50 mt-0.5">{formatDate(conv.updated_at)}</p>
              </div>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-sm text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
