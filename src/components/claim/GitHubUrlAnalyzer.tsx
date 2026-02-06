import { useState } from 'react';
import { Github, ExternalLink, CheckCircle, AlertCircle, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGitHubAnalysis, GitHubAnalysisResult } from '@/hooks/useGitHubAnalysis';
import { GitHubAnalysisResultCard } from './GitHubAnalysisResult';

interface GitHubUrlAnalyzerProps {
  githubOrgUrl: string;
  setGithubOrgUrl: (value: string) => void;
  onAnalysisComplete: (result: GitHubAnalysisResult) => void;
  analysisResult: GitHubAnalysisResult | null;
}

export const GitHubUrlAnalyzer = ({
  githubOrgUrl,
  setGithubOrgUrl,
  onAnalysisComplete,
  analysisResult,
}: GitHubUrlAnalyzerProps) => {
  const { analyzeRepository, isAnalyzing, error, steps } = useGitHubAnalysis();
  const [inputValue, setInputValue] = useState(githubOrgUrl);

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return;
    
    setGithubOrgUrl(inputValue);
    const result = await analyzeRepository(inputValue);
    if (result) {
      onAnalysisComplete(result);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnalyzing && inputValue.trim()) {
      handleAnalyze();
    }
  };

  const completedSteps = steps.filter((s) => s.status === 'complete').length;
  const progressValue = (completedSteps / steps.length) * 100;

  return (
    <Card className="border-primary/30 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <Github className="h-5 w-5 text-primary" />
          <span className="font-display text-lg uppercase tracking-tight">
            Repository Analysis
          </span>
          <span className="ml-auto rounded-sm bg-primary/20 px-2 py-0.5 text-[10px] font-mono uppercase text-primary">
            RECOMMENDED
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground">
          "IN AN OPEN-SOURCE WORLD, TRANSPARENCY IS STRENGTH."
        </blockquote>

        <p className="text-sm text-muted-foreground">
          Paste your GitHub repository URL and we'll automatically analyze your
          project's <span className="font-semibold text-primary">Heartbeat</span> metrics
          (commits, contributors, releases) to calculate your Resilience Score.
        </p>

        {!analysisResult ? (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="https://github.com/your-org/your-repo"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 font-mono"
                  disabled={isAnalyzing}
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputValue.trim()}
                className="font-display font-semibold uppercase tracking-wider"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ANALYZING
                  </>
                ) : (
                  'ANALYZE'
                )}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-3 rounded-sm border border-border bg-muted/30 p-4">
                <Progress value={progressValue} className="h-2" />
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-sm ${
                        step.status === 'complete'
                          ? 'text-primary'
                          : step.status === 'in-progress'
                          ? 'text-foreground'
                          : step.status === 'error'
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {step.status === 'complete' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : step.status === 'in-progress' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : step.status === 'error' ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                      )}
                      <span className="font-mono text-xs">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-sm border border-destructive/50 bg-destructive/10 p-3 text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <GitHubAnalysisResultCard result={analysisResult} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInputValue('');
                setGithubOrgUrl('');
                onAnalysisComplete(null as any);
              }}
              className="font-display text-xs uppercase tracking-wider"
            >
              Analyze Different Repository
            </Button>
          </div>
        )}

        <div className="rounded-sm border border-muted bg-muted/30 p-3">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold">Note:</span> We only read public repository
            data. For private repositories, use the "Connect GitHub" option below.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
