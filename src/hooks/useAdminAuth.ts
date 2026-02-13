import { useState, useEffect, useCallback } from 'react';
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

  const checkAdmin = useCallback(async (currentUser: User | null) => {
    if (!currentUser?.email) {
      setIsAdmin(false);
      return;
    }
    // Check against admin_users table
    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', currentUser.email)
      .maybeSingle();
    setIsAdmin(!!data);
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          // Defer admin check to avoid Supabase client deadlock
          setTimeout(() => checkAdmin(newSession.user), 0);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    // Then get existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        checkAdmin(existingSession.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // If user doesn't exist yet, try sign up (first-time admin setup)
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
  };

  return { session, user, isAdmin, loading, signIn, signOut };
}
