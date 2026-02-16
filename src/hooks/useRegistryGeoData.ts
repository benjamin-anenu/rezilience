import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CountryStats {
  projectCount: number;
  activeCount: number;
  staleCount: number;
  decayingCount: number;
  topCategories: string[];
  avgScore: number;
}

export interface GeoSummary {
  totalCountries: number;
  totalProjects: number;
  mostActiveRegion: string;
  mostActiveCount: number;
}

const DB_CODE_TO_ISO: Record<string, string> = { uk: 'GB' };

function normalizeCountryCode(dbCode: string): string | null {
  if (!dbCode || dbCode === 'other') return null;
  const lower = dbCode.toLowerCase();
  return DB_CODE_TO_ISO[lower] ?? lower.toUpperCase();
}

export function useRegistryGeoData() {
  const { data, isLoading } = useQuery({
    queryKey: ['registry-geo-data'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('claimed_profiles_public')
        .select('country, category, liveness_status, resilience_score');

      if (error) throw error;
      return profiles ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const countryStats = new Map<string, CountryStats>();

  if (data) {
    for (const p of data) {
      const iso = normalizeCountryCode(p.country ?? '');
      if (!iso) continue;

      let stats = countryStats.get(iso);
      if (!stats) {
        stats = { projectCount: 0, activeCount: 0, staleCount: 0, decayingCount: 0, topCategories: [], avgScore: 0 };
        countryStats.set(iso, stats);
      }
      stats.projectCount++;
      if (p.liveness_status === 'ACTIVE') stats.activeCount++;
      else if (p.liveness_status === 'STALE') stats.staleCount++;
      else if (p.liveness_status === 'DECAYING') stats.decayingCount++;

      if (p.category && !stats.topCategories.includes(p.category)) {
        stats.topCategories.push(p.category);
      }
      // running avg
      stats.avgScore = stats.avgScore + ((p.resilience_score ?? 0) - stats.avgScore) / stats.projectCount;
    }
  }

  let summary: GeoSummary = { totalCountries: 0, totalProjects: 0, mostActiveRegion: '-', mostActiveCount: 0 };
  if (countryStats.size > 0) {
    let maxCount = 0;
    let maxName = '';
    let total = 0;
    countryStats.forEach((s, code) => {
      total += s.projectCount;
      if (s.projectCount > maxCount) {
        maxCount = s.projectCount;
        maxName = code;
      }
    });
    summary = { totalCountries: countryStats.size, totalProjects: total, mostActiveRegion: maxName, mostActiveCount: maxCount };
  }

  return { data, isLoading, countryStats, summary };
}
