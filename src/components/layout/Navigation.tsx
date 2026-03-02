import { useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, ExternalLink, X as XIcon, ChevronDown } from 'lucide-react';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo.png';

interface NavDropdownItem {
  href: string;
  label: string;
  description: string;
}

const registryItems: NavDropdownItem[] = [
  { href: '/explorer', label: 'Explorer', description: 'Browse and score Solana projects' },
  { href: '/accountability', label: 'DAO Tracker', description: 'Track milestone delivery across DAOs' },
  { href: '/bounty-board', label: 'Projects', description: 'Claim work, submit evidence, earn SOL' },
];

const toolkitItems: NavDropdownItem[] = [
  { href: '/gpt', label: 'GPT', description: 'AI-powered Solana intelligence' },
  { href: '/grants', label: 'Grants', description: 'Discover ecosystem funding sources' },
  { href: '/library', label: 'Library', description: 'Docs, blueprints, and learning paths' },
];

function NavDropdown({
  label,
  items,
  isActive,
}: {
  label: string;
  items: NavDropdownItem[];
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { trackEvent } = useAnalyticsTracker();

  const handleEnter = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className={cn(
            'flex items-center gap-1 font-display text-sm font-medium tracking-wider transition-colors hover:text-foreground',
            isActive ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {label}
          <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={12}
        className="w-64 p-1.5"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => {
              trackEvent('click', `nav_${item.label.toLowerCase()}`);
              setOpen(false);
            }}
            className="block rounded-sm px-3 py-2.5 transition-colors hover:bg-muted/50"
          >
            <span className="font-display text-sm font-semibold tracking-wide text-foreground">
              {item.label}
            </span>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export function Navigation() {
  const location = useLocation();
  const { user, isAuthenticated, signOut, signInWithX } = useAuth();
  const { trackEvent } = useAnalyticsTracker();
  const [notifOpen, setNotifOpen] = useState(false);

  const isActiveRoute = (href: string) => location.pathname === href;
  const isGroupActive = (items: NavDropdownItem[]) =>
    items.some((item) => location.pathname.startsWith(item.href));

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
            <Link
              to="/readme"
              onClick={() => trackEvent('click', 'nav_readme')}
              className={cn(
                'font-display text-sm font-medium tracking-wider transition-colors hover:text-foreground',
                isActiveRoute('/readme') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              README
            </Link>

            <NavDropdown label="REGISTRY" items={registryItems} isActive={isGroupActive(registryItems)} />
            <NavDropdown label="TOOLKIT" items={toolkitItems} isActive={isGroupActive(toolkitItems)} />

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={cn(
                  'font-display text-sm font-medium tracking-wider transition-colors hover:text-foreground',
                  isActiveRoute('/dashboard') ? 'text-primary' : 'text-muted-foreground'
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
                <NotificationBell onClick={() => setNotifOpen(true)} />
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 transition-colors hover:border-primary/50"
                >
                  <img src={user.avatarUrl} alt={user.username} className="h-6 w-6 rounded-full" />
                  <span className="font-mono text-sm text-muted-foreground">@{user.username}</span>
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

          {/* Mobile Menu */}
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden touch-feedback">
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

              {/* User Profile Section */}
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
                {/* README standalone */}
                <DrawerClose asChild>
                  <Link
                    to="/readme"
                    className={cn(
                      'flex min-h-[48px] items-center rounded-sm px-3 py-3 font-display text-sm font-medium tracking-wider transition-colors hover:bg-muted/50 touch-feedback',
                      isActiveRoute('/readme')
                        ? 'border-l-2 border-primary bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    README
                  </Link>
                </DrawerClose>

                {/* REGISTRY section */}
                <p className="mb-1 mt-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3">
                  Registry
                </p>
                <div className="space-y-1">
                  {registryItems.map((item) => (
                    <DrawerClose key={item.href} asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex min-h-[48px] items-center rounded-sm px-3 py-3 font-display text-sm font-medium tracking-wider transition-colors hover:bg-muted/50 touch-feedback',
                          isActiveRoute(item.href)
                            ? 'border-l-2 border-primary bg-primary/5 text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {item.label.toUpperCase()}
                      </Link>
                    </DrawerClose>
                  ))}
                </div>

                {/* TOOLKIT section */}
                <p className="mb-1 mt-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3">
                  Toolkit
                </p>
                <div className="space-y-1">
                  {toolkitItems.map((item) => (
                    <DrawerClose key={item.href} asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex min-h-[48px] items-center rounded-sm px-3 py-3 font-display text-sm font-medium tracking-wider transition-colors hover:bg-muted/50 touch-feedback',
                          isActiveRoute(item.href)
                            ? 'border-l-2 border-primary bg-primary/5 text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {item.label.toUpperCase()}
                      </Link>
                    </DrawerClose>
                  ))}
                </div>

                {isAuthenticated && (
                  <>
                    <p className="mb-1 mt-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3">
                      Account
                    </p>
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
                  </>
                )}
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

      {/* Notification Panel */}
      {isAuthenticated && (
        <NotificationPanel open={notifOpen} onOpenChange={setNotifOpen} />
      )}
    </nav>
  );
}
