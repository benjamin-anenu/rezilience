import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DependencyNode {
  id: string;
  crate_name: string;
  current_version: string | null;
  latest_version: string | null;
  months_behind: number;
  is_critical: boolean;
  is_outdated: boolean;
  crates_io_url: string | null;
  npm_url: string | null;
  crates_io_dependents: number;
  dependency_type: 'crate' | 'npm' | 'pypi';
}

export interface DependencyGraphData {
  projectName: string;
  projectId: string;
  githubForks: number;
  dependencies: DependencyNode[];
  analyzedAt: string | null;
}

export function useDependencyGraph(profileId: string | undefined) {
  return useQuery({
    queryKey: ['dependency-graph', profileId],
    queryFn: async (): Promise<DependencyGraphData | null> => {
      if (!profileId) return null;

      // Fetch profile metadata
      const { data: profile, error: profileError } = await supabase
        .from('claimed_profiles')
        .select('project_name, github_forks, dependency_analyzed_at')
        .eq('id', profileId)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Fetch dependency graph from the new table
      const { data: deps, error: depsError } = await supabase
        .from('dependency_graph')
        .select('*')
        .eq('source_profile_id', profileId)
        .order('is_critical', { ascending: false })
        .order('months_behind', { ascending: false });

      if (depsError) {
        console.error('Error fetching dependencies:', depsError);
        return null;
      }

      return {
        projectName: profile.project_name,
        projectId: profileId,
        githubForks: profile.github_forks || 0,
        dependencies: (deps || []).map((d) => ({
          id: d.id,
          crate_name: d.crate_name,
          current_version: d.current_version,
          latest_version: d.latest_version,
          months_behind: d.months_behind || 0,
          is_critical: d.is_critical || false,
          npm_url: d.npm_url,
          dependency_type: (d.dependency_type || 'crate') as 'crate' | 'npm' | 'pypi',
          is_outdated: d.is_outdated || false,
          crates_io_url: d.crates_io_url,
          crates_io_dependents: d.crates_io_dependents || 0,
        })),
        analyzedAt: profile.dependency_analyzed_at,
      };
    },
    enabled: !!profileId,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}
