import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo.png';

const navLinks = [
  { href: 'https://docs.resilience.dev', label: 'DOCS', external: true },
  { href: '/explorer', label: 'EXPLORER', external: false },
  { href: 'https://grants.resilience.dev', label: 'GRANTS', external: true },
  { href: '/staking', label: 'STAKING', external: false },
  { href: '/my-bonds', label: 'MY BONDS', external: false },
];

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Resilience" className="h-8 w-8 object-contain" />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              RESILIENCE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-sm font-medium tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={cn(
                    'font-display text-sm font-medium tracking-wider transition-colors hover:text-foreground',
                    location.pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={cn(
                  'font-display text-sm font-medium tracking-wider transition-colors hover:text-foreground',
                  location.pathname === '/dashboard'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                DASHBOARD
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 transition-colors hover:border-primary/50"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="font-mono text-sm text-muted-foreground">
                    @{user.username}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button asChild className="font-display font-semibold uppercase tracking-wider">
                <Link to="/claim-profile">
                  <User className="mr-2 h-4 w-4" />
                  JOIN THE REGISTRY
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-sm font-medium tracking-wider text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={cn(
                      'font-display text-sm font-medium tracking-wider',
                      location.pathname === link.href
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={cn(
                    'font-display text-sm font-medium tracking-wider',
                    location.pathname === '/dashboard'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  DASHBOARD
                </Link>
              )}
              <div className="pt-2">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="h-6 w-6 rounded-full"
                      />
                      <span className="font-mono text-sm text-muted-foreground">
                        @{user.username}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="font-display font-semibold uppercase tracking-wider w-full">
                    <Link to="/claim-profile" onClick={() => setMobileMenuOpen(false)}>
                      <User className="mr-2 h-4 w-4" />
                      JOIN THE REGISTRY
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
