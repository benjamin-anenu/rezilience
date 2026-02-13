import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface AdminAuth {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export function useAdminAuth(): AdminAuth {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const checkedEmailRef = useRef<string | null>(null);

  const checkAdmin = useCallback(async (currentUser: User | null) => {
    if (!currentUser?.email) {
      setIsAdmin(false);
      return;
    }
    // Prevent duplicate checks for the same email
    if (checkedEmailRef.current === currentUser.email) return;
    checkedEmailRef.current = currentUser.email;

    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', currentUser.email)
      .maybeSingle();
    setIsAdmin(!!data);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get existing session first
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        checkAdmin(s.user).then(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Then listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          // Reset check ref on new auth event so it re-checks
          checkedEmailRef.current = null;
          checkAdmin(newSession.user).then(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setIsAdmin(false);
          checkedEmailRef.current = null;
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signIn = async (email: string, password: string) => {
    checkedEmailRef.current = null; // Reset for fresh check
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + '/admin' }
        });
        if (signUpError) return { error: signUpError.message };
        return { error: 'Account created. Please check your email to verify, then sign in.' };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    checkedEmailRef.current = null;
  };

  return { session, user, isAdmin, loading, signIn, signOut };
}
