import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, isAdmin, session } = useAdminAuth();
  const navigate = useNavigate();

  // If already authenticated as admin, redirect
  if (session && isAdmin) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
    } else {
      // Auth state listener will update, then redirect happens
      navigate('/admin');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Radial glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <img src={logoImg} alt="Rezilience" className="h-12 w-auto" />
              <div className="absolute -right-2 -top-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            COMMAND CENTER
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono tracking-wider">
            AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-sm border border-border bg-card/80 backdrop-blur-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rezilience.io"
                required
                className="bg-background/50 border-border font-mono text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                className="bg-background/50 border-border font-mono text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full font-display font-semibold tracking-wide"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  AUTHENTICATING
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  ACCESS COMMAND CENTER
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-center text-xs text-muted-foreground font-mono">
              SESSION ENCRYPTED • AES-256 • ZERO-TRUST
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          Rezilience v1.0 — Internal Operations Dashboard
        </p>
      </motion.div>
    </div>
  );
}
