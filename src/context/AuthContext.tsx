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
    // Phase 0: Mock OAuth - go directly to callback
    // In production: redirect to X OAuth URL with proper client_id, redirect_uri, scope, etc.
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
