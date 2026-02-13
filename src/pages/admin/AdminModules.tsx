import { Construction } from 'lucide-react';

function AdminPlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <Construction className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground font-mono">{subtitle}</p>
      </div>
    </div>
  );
}

export function AdminEngagement() {
  return <AdminPlaceholder title="User Engagement Analytics" subtitle="TRACKING BUILDER, DEVELOPER & INVESTOR INTERACTIONS" />;
}

export function AdminAIUsage() {
  return <AdminPlaceholder title="AI Consumption Dashboard" subtitle="TOKEN USAGE • COST TRACKING • MODEL DISTRIBUTION" />;
}

export function AdminIntegrations() {
  return <AdminPlaceholder title="Integration Status Board" subtitle="THIRD-PARTY SERVICE HEALTH MONITORING" />;
}

export function AdminCosts() {
  return <AdminPlaceholder title="Maintenance Cost Board" subtitle="PLATFORM OPERATIONAL EXPENDITURE" />;
}

export function AdminRegistry() {
  return <AdminPlaceholder title="Registry Health Deep-Dive" subtitle="CLAIM FUNNEL • VERIFICATION RATES • COVERAGE" />;
}

export function AdminReporter() {
  return <AdminPlaceholder title="Grant Milestone Reporter" subtitle="SOLANA FOUNDATION REPORTING ENGINE" />;
}
