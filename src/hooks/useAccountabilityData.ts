import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Phase } from '@/types';

export interface DAOGroup {
  realmAddress: string;
  realmName: string;
  projects: DAOProject[];
  avgScore: number;
  totalMilestones: number;
  completedMilestones: number;
  lastGovernanceActivity: string | null;
}

export interface DAOProject {
  id: string;
  projectName: string;
  logoUrl: string | null;
  resilienceScore: number;
  livenessStatus: string | null;
  milestones: Phase[];
  realmsDeliveryRate: number | null;
  realmsProposalsTotal: number;
  realmsProposalsCompleted: number;
  websiteUrl: string | null;
  category: string | null;
}

export function useAccountabilityDAOs() {
  return useQuery({
    queryKey: ['accountability-daos'],
    queryFn: async () => {
      // claimed_profiles table has realms_dao_address; use it directly
      // RLS allows reading claimed profiles with claimer_wallet or verified=true
      const { data, error } = await supabase
        .from('claimed_profiles' as any)
        .select('id, project_name, logo_url, resilience_score, liveness_status, milestones, realms_dao_address, realms_delivery_rate, realms_proposals_total, realms_proposals_completed, governance_last_activity, website_url, category')
        .not('realms_dao_address', 'is', null) as any;

      if (error) throw error;
      if (!data) return [];

      // Group by realms_dao_address
      const grouped = new Map<string, DAOProject[]>();
      for (const row of data) {
        const addr = row.realms_dao_address as string;
        if (!addr) continue;
        if (!grouped.has(addr)) grouped.set(addr, []);
        
        const rawMilestones = (row.milestones as unknown as Phase[]) || [];
        
        grouped.get(addr)!.push({
          id: row.id!,
          projectName: row.project_name || 'Unknown',
          logoUrl: row.logo_url,
          resilienceScore: Number(row.resilience_score) || 0,
          livenessStatus: row.liveness_status,
          milestones: rawMilestones,
          realmsDeliveryRate: row.realms_delivery_rate ? Number(row.realms_delivery_rate) : null,
          realmsProposalsTotal: Number(row.realms_proposals_total) || 0,
          realmsProposalsCompleted: Number(row.realms_proposals_completed) || 0,
          websiteUrl: row.website_url,
          category: row.category,
        });
      }

      const daos: DAOGroup[] = [];
      for (const [addr, projects] of grouped) {
        let totalMs = 0;
        let completedMs = 0;
        let scoreSum = 0;
        let lastActivity: string | null = null;

        for (const p of projects) {
          scoreSum += p.resilienceScore;
          for (const phase of p.milestones) {
            totalMs += phase.milestones?.length || 0;
            completedMs += phase.milestones?.filter((m) => m.status === 'completed' || m.status === 'dao_approved').length || 0;
          }
        }

        // Use first project's governance activity as proxy
        const govActivity = data.find((d) => d.realms_dao_address === addr)?.governance_last_activity;
        if (govActivity) lastActivity = govActivity as string;

        daos.push({
          realmAddress: addr,
          realmName: projects[0]?.projectName || addr.slice(0, 8) + '...',
          projects,
          avgScore: projects.length > 0 ? Math.round(scoreSum / projects.length) : 0,
          totalMilestones: totalMs,
          completedMilestones: completedMs,
          lastGovernanceActivity: lastActivity,
        });
      }

      return daos.sort((a, b) => b.avgScore - a.avgScore);
    },
  });
}

export function useAccountabilityDetail(realmAddress: string | undefined) {
  return useQuery({
    queryKey: ['accountability-detail', realmAddress],
    enabled: !!realmAddress,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claimed_profiles' as any)
        .select('id, project_name, logo_url, resilience_score, liveness_status, milestones, realms_dao_address, realms_delivery_rate, realms_proposals_total, realms_proposals_completed, realms_proposals_active, realms_last_proposal, website_url, category, description')
        .eq('realms_dao_address', realmAddress!) as any;

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id!,
        projectName: row.project_name || 'Unknown',
        logoUrl: row.logo_url,
        resilienceScore: Number(row.resilience_score) || 0,
        livenessStatus: row.liveness_status,
        milestones: (row.milestones as unknown as Phase[]) || [],
        realmsDeliveryRate: row.realms_delivery_rate ? Number(row.realms_delivery_rate) : null,
        realmsProposalsTotal: Number(row.realms_proposals_total) || 0,
        realmsProposalsCompleted: Number(row.realms_proposals_completed) || 0,
        realmsProposalsActive: Number(row.realms_proposals_active) || 0,
        realmsLastProposal: row.realms_last_proposal,
        websiteUrl: row.website_url,
        category: row.category,
        description: row.description,
      }));
    },
  });
}
