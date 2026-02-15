import { Link, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, ExternalLink, X as XIcon } from 'lucide-react';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo.png';

const navLinks = [
  { href: '/readme', label: 'README', external: false },
  { href: '/explorer', label: 'EXPLORER', external: false },
  { href: '/staking', label: 'STAKING', external: false },
  { href: '/gpt', label: 'GPT', external: false },
  { href: '/grants', label: 'GRANTS', external: false },
  { href: '/library', label: 'LIBRARY', external: false },
];

export function Navigation() {
  const location = useLocation();
  const { user, isAuthenticated, signOut, signInWithX } = useAuth();
  const { trackEvent } = useAnalyticsTracker();

  const isActiveRoute = (href: string) => location.pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Rezilience" className="h-8 w-8 object-contain" />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              REZILIENCE
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
                  onClick={() => trackEvent('click', `nav_${link.label.toLowerCase()}`)}
                  className={cn(
                    'font-display text-sm font-medium tracking-wider transition-colors hover:text-foreground',
                    isActiveRoute(link.href)
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
                  isActiveRoute('/dashboard')
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                MY REGISTRY
              </Link>
            )}
          </div>

          {/* Desktop Auth Section */}
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
              <>
                <Button
                  variant="outline"
                  onClick={signInWithX}
                  className="font-display font-semibold uppercase tracking-wider bg-background border-primary text-foreground hover:bg-primary/10"
                >
                  SIGN IN
                </Button>
                <Button asChild className="font-display font-semibold uppercase tracking-wider">
                  <Link to="/claim-profile">
                    <User className="mr-2 h-4 w-4" />
                    JOIN THE REGISTRY
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu - Premium Drawer */}
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden touch-feedback"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="fixed inset-y-0 right-0 left-auto h-full w-[85vw] max-w-sm rounded-none border-l border-border bg-background safe-bottom">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <Link to="/" className="flex items-center gap-2">
                  <img src={logo} alt="Rezilience" className="h-6 w-6 object-contain" />
                  <span className="font-display text-lg font-bold tracking-tight text-foreground">
                    REZILIENCE
                  </span>
                </Link>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="touch-feedback">
                    <XIcon className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>

              {/* User Profile Section (if authenticated) */}
              {isAuthenticated && user && (
                <div className="border-b border-border p-4">
                  <div className="flex items-center gap-3 rounded-sm border border-border bg-card/50 p-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-10 w-10 rounded-full ring-2 ring-primary/20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground truncate">
                        @{user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">Connected via X</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  NAVIGATION
                </p>
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <DrawerClose key={link.label} asChild>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-[48px] items-center justify-between rounded-sm px-3 py-3 font-display text-sm font-medium tracking-wider text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground touch-feedback"
                        >
                          {link.label}
                          <ExternalLink className="h-4 w-4 opacity-50" />
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className={cn(
                            'flex min-h-[48px] items-center rounded-sm px-3 py-3 font-display text-sm font-medium tracking-wider transition-colors hover:bg-muted/50 touch-feedback',
                            isActiveRoute(link.href)
                              ? 'border-l-2 border-primary bg-primary/5 text-primary'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {link.label}
                        </Link>
                      )}
                    </DrawerClose>
                  ))}
                  {isAuthenticated && (
                    <DrawerClose asChild>
                      <Link
                        to="/dashboard"
                        className={cn(
                          'flex min-h-[48px] items-center rounded-sm px-3 py-3 font-display text-sm font-medium tracking-wider transition-colors hover:bg-muted/50 touch-feedback',
                          isActiveRoute('/dashboard')
                            ? 'border-l-2 border-primary bg-primary/5 text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        MY REGISTRY
                      </Link>
                    </DrawerClose>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="border-t border-border p-4 space-y-3">
                {isAuthenticated ? (
                  <DrawerClose asChild>
                    <Button
                      variant="outline"
                      className="w-full min-h-[48px] font-display font-semibold uppercase tracking-wider text-destructive hover:bg-destructive/10 hover:text-destructive touch-feedback"
                      onClick={signOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      SIGN OUT
                    </Button>
                  </DrawerClose>
                ) : (
                  <>
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        onClick={signInWithX}
                        className="w-full min-h-[48px] font-display font-semibold uppercase tracking-wider bg-background border-primary text-foreground hover:bg-primary/10 touch-feedback"
                      >
                        SIGN IN
                      </Button>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Button 
                        asChild 
                        className="w-full min-h-[48px] font-display font-semibold uppercase tracking-wider touch-feedback"
                      >
                        <Link to="/claim-profile">
                          <User className="mr-2 h-4 w-4" />
                          JOIN THE REGISTRY
                        </Link>
                      </Button>
                    </DrawerClose>
                  </>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
}
