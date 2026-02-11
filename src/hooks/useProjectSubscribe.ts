import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useProjectSubscribe() {
  const [subscribedProjects, setSubscribedProjects] = useState<Set<string>>(new Set());

  const subscribe = async (profileId: string, email: string, projectName: string) => {
    // Use raw rpc/insert since project_subscribers may not be in generated types yet
    const { error } = await supabase
      .from('project_subscribers' as any)
      .insert({ profile_id: profileId, email } as any);

    if (error) {
      if (error.code === '23505') {
        toast({ title: `You're already subscribed to ${projectName}.` });
        setSubscribedProjects(prev => new Set(prev).add(profileId));
        return true;
      }
      toast({ title: 'Subscription failed', description: error.message, variant: 'destructive' });
      return false;
    }

    toast({ title: `Subscribed! You'll be notified when ${projectName} posts updates.` });
    setSubscribedProjects(prev => new Set(prev).add(profileId));
    return true;
  };

  return { subscribe, subscribedProjects };
}
