import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Trash2, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Trend {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  priority: string;
  created_at: string;
  created_by: string;
  expires_at: string | null;
}

export function AdminTrends() {
  const { user } = useAdminAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [expiresIn, setExpiresIn] = useState('never');

  const { data: trends, isLoading } = useQuery({
    queryKey: ['admin-trends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ecosystem_trends')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as Trend[];
    },
  });

  const createTrend = useMutation({
    mutationFn: async () => {
      let expires_at: string | null = null;
      if (expiresIn === '24h') expires_at = new Date(Date.now() + 86400000).toISOString();
      else if (expiresIn === '7d') expires_at = new Date(Date.now() + 604800000).toISOString();
      else if (expiresIn === '30d') expires_at = new Date(Date.now() + 2592000000).toISOString();

      const { error } = await supabase.functions.invoke('manage-trends', {
        body: {
          action: 'create',
          admin_email: user?.email,
          trend: {
            event_type: 'admin_announcement',
            title,
            description: description || null,
            priority,
            expires_at,
            created_by: user?.email || 'admin',
          },
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trends'] });
      queryClient.invalidateQueries({ queryKey: ['ecosystem-trends'] });
      setTitle('');
      setDescription('');
      setPriority('normal');
      setExpiresIn('never');
      toast.success('Trend published');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteTrend = useMutation({
    mutationFn: async (trendId: string) => {
      const { error } = await supabase.functions.invoke('manage-trends', {
        body: {
          action: 'delete',
          admin_email: user?.email,
          trend_id: trendId,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trends'] });
      queryClient.invalidateQueries({ queryKey: ['ecosystem-trends'] });
      toast.success('Trend deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const canSubmit = title.trim().length > 0 && title.length <= 120;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
          Ecosystem Trends
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Publish announcements and manage the trend feed on the Explorer page.
        </p>
      </div>

      {/* Create Announcement */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg uppercase">
            <Megaphone className="h-5 w-5 text-primary" />
            New Announcement
          </CardTitle>
          <CardDescription>This will appear in the trend ticker on the Explorer page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5 new projects joined the registry this week!"
              maxLength={120}
              className="font-mono"
            />
            <p className="text-[10px] text-muted-foreground text-right">{title.length}/120</p>
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional context..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="highlight">Highlight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expires</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => createTrend.mutate()}
            disabled={!canSubmit || createTrend.isPending}
            className="font-display uppercase tracking-wider"
          >
            {createTrend.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</>
            ) : (
              <><Plus className="mr-2 h-4 w-4" />Publish Trend</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg uppercase">Recent Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && (!trends || trends.length === 0) && (
            <p className="text-sm text-muted-foreground">No trends yet.</p>
          )}
          <div className="divide-y divide-border">
            {trends?.map((trend) => (
              <div key={trend.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{trend.title}</p>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {trend.event_type}
                    </Badge>
                    {trend.priority === 'highlight' && (
                      <Badge className="text-[10px] shrink-0 bg-primary/20 text-primary">
                        Highlight
                      </Badge>
                    )}
                  </div>
                  {trend.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{trend.description}</p>
                  )}
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">
                    {new Date(trend.created_at).toLocaleDateString()} · by {trend.created_by}
                    {trend.expires_at && ` · expires ${new Date(trend.expires_at).toLocaleDateString()}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => deleteTrend.mutate(trend.id)}
                  disabled={deleteTrend.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
