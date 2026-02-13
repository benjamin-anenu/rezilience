import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bot,
  Plug,
  DollarSign,
  Database,
  FileText,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import logoImg from '@/assets/logo.png';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/engagement', icon: Users, label: 'Engagement' },
  { to: '/admin/ai', icon: Bot, label: 'AI Usage' },
  { to: '/admin/integrations', icon: Plug, label: 'Integrations' },
  { to: '/admin/costs', icon: DollarSign, label: 'Costs' },
  { to: '/admin/registry', icon: Database, label: 'Registry' },
  { to: '/admin/reporter', icon: FileText, label: 'Grant Reporter' },
];

export function AdminSidebar() {
  const { signOut, user } = useAdminAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border/30 bg-card/20 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <img src={logoImg} alt="Rezilience" className="h-7 w-auto" />
        <div>
          <p className="font-display text-sm font-semibold text-foreground tracking-wide">
            COMMAND CENTER
          </p>
          <p className="text-[10px] font-mono text-primary tracking-wider">SUPER ADMIN</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span className="font-display tracking-wide">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-mono text-muted-foreground truncate">
            {user?.email}
          </span>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-xs font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          SIGN OUT
        </button>
      </div>
    </aside>
  );
}
