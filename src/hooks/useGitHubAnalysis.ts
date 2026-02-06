import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GitHubAnalysisResult {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  contributors: number;
  openIssues: number;
  createdAt: string;
  pushedAt: string;
  isFork: boolean;
  topics: string[];
  commitVelocity: number;
  commitsLast30Days: number;
  releasesLast30Days: number;
  latestRelease: { tag: string; date: string } | null;
  topContributors: Array<{ login: string; contributions: number; avatar: string }>;
  recentEvents: Array<{ type: string; actor: string; date: string; message?: string }>;
  resilienceScore: number;
  livenessStatus: 'ACTIVE' | 'STALE' | 'DECAYING';
  daysSinceLastCommit: number;
}

export interface AnalysisStep {
  label: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
}

export function useGitHubAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GitHubAnalysisResult | null>(null);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { label: 'Validating Repository', status: 'pending' },
    { label: 'Fetching Metrics', status: 'pending' },
    { label: 'Counting Contributors', status: 'pending' },
    { label: 'Checking Releases', status: 'pending' },
    { label: 'Calculating Score', status: 'pending' },
  ]);

  const updateStep = (index: number, status: AnalysisStep['status']) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, status } : step))
    );
  };

  const resetSteps = () => {
    setSteps([
      { label: 'Validating Repository', status: 'pending' },
      { label: 'Fetching Metrics', status: 'pending' },
      { label: 'Counting Contributors', status: 'pending' },
      { label: 'Checking Releases', status: 'pending' },
      { label: 'Calculating Score', status: 'pending' },
    ]);
  };

  const analyzeRepository = async (githubUrl: string, profileId?: string): Promise<GitHubAnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    resetSteps();

    try {
      // Validate URL format
      if (!githubUrl.includes('github.com')) {
        throw new Error('Please enter a valid GitHub URL');
      }

      updateStep(0, 'in-progress');
      
      // Simulate step progression for UX (actual work is done in parallel on server)
      const stepInterval = setInterval(() => {
        setSteps((prev) => {
          const currentInProgress = prev.findIndex((s) => s.status === 'in-progress');
          if (currentInProgress >= 0 && currentInProgress < 4) {
            return prev.map((step, i) => {
              if (i === currentInProgress) return { ...step, status: 'complete' };
              if (i === currentInProgress + 1) return { ...step, status: 'in-progress' };
              return step;
            });
          }
          return prev;
        });
      }, 600);

      const { data, error: funcError } = await supabase.functions.invoke('analyze-github-repo', {
        body: { github_url: githubUrl, profile_id: profileId },
      });

      clearInterval(stepInterval);

      if (funcError) {
        throw new Error(funcError.message || 'Failed to analyze repository');
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Mark all steps as complete
      setSteps((prev) => prev.map((step) => ({ ...step, status: 'complete' })));
      setResult(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      setSteps((prev) =>
        prev.map((step) => ({
          ...step,
          status: step.status === 'in-progress' ? 'error' : step.status,
        }))
      );
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setIsAnalyzing(false);
    setError(null);
    setResult(null);
    resetSteps();
  };

  return {
    analyzeRepository,
    isAnalyzing,
    error,
    result,
    steps,
    reset,
  };
}

// Language to category mapping for auto-population
export const LANGUAGE_CATEGORY_MAP: Record<string, string> = {
  Rust: 'infrastructure',
  Solidity: 'defi',
  TypeScript: 'developer-tools',
  JavaScript: 'developer-tools',
  Python: 'developer-tools',
  Move: 'infrastructure',
  Go: 'infrastructure',
  C: 'infrastructure',
  'C++': 'infrastructure',
};

export function suggestCategory(language: string | null, topics: string[]): string {
  // Check topics first
  const topicLower = topics.map((t) => t.toLowerCase());
  if (topicLower.some((t) => ['defi', 'swap', 'dex', 'lending', 'amm'].includes(t))) {
    return 'defi';
  }
  if (topicLower.some((t) => ['nft', 'collectible', 'art'].includes(t))) {
    return 'nft';
  }
  if (topicLower.some((t) => ['game', 'gaming', 'gamefi'].includes(t))) {
    return 'gaming';
  }
  if (topicLower.some((t) => ['dao', 'governance', 'voting'].includes(t))) {
    return 'dao';
  }
  if (topicLower.some((t) => ['social', 'community', 'chat'].includes(t))) {
    return 'social';
  }
  if (topicLower.some((t) => ['payment', 'payments', 'transfer'].includes(t))) {
    return 'payments';
  }

  // Fall back to language mapping
  if (language && LANGUAGE_CATEGORY_MAP[language]) {
    return LANGUAGE_CATEGORY_MAP[language];
  }

  return 'other';
}
