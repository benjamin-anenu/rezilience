import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { XUser } from '@/types';

interface AuthContextType {
  user: XUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithX: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<XUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check localStorage for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('x_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('x_user');
      }
    }
    setLoading(false);
  }, []);

  const signInWithX = () => {
    /**
     * PHASE 0 MOCK: X (Twitter) OAuth is simulated
     * 
     * This redirects to a mock callback that creates a fake user session.
     * Real X OAuth implementation requires:
     * 1. Register app at developer.twitter.com
     * 2. Configure OAuth 2.0 with PKCE
     * 3. Set up edge function to exchange code for tokens
     * 4. Store tokens securely in database
     * 
     * TODO Phase 2: Implement real X OAuth similar to GitHub OAuth flow
     */
    window.location.href = '/x-callback?code=mock_x_auth_code';
  };

  const signOut = () => {
    localStorage.removeItem('x_user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signInWithX,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
