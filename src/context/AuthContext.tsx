import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/pkce';
import type { XUser } from '@/types';

interface AuthContextType {
  user: XUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithX: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// X OAuth Client ID (public, safe to expose in frontend)
const X_CLIENT_ID = 'VmVzd2xOelNXOUZ2TFNCLUZqalQ6MTpjaQ';

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

  const signInWithX = async () => {
    /**
     * X (Twitter) OAuth 2.0 with PKCE
     * 
     * 1. Generate PKCE code verifier and challenge
     * 2. Generate state for CSRF protection
     * 3. Redirect to X authorization URL
     * 4. X redirects back to /x-callback with code
     * 5. XCallback.tsx exchanges code for user data via edge function
     */

    if (!X_CLIENT_ID) {
      console.error('VITE_X_CLIENT_ID is not configured');
      throw new Error('X OAuth is not configured. Please add VITE_X_CLIENT_ID to environment.');
    }

    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store code verifier in sessionStorage (cleared on tab close, more secure)
    sessionStorage.setItem('x_code_verifier', codeVerifier);

    // Generate state for CSRF protection
    const state = generateState();
    sessionStorage.setItem('x_oauth_state', state);

    // Build authorization URL
    const redirectUri = `${window.location.origin}/x-callback`;
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: X_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'tweet.read users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    // Redirect to X authorization page
    window.location.href = `https://x.com/i/oauth2/authorize?${params.toString()}`;
  };

  const signOut = () => {
    localStorage.removeItem('x_user');
    sessionStorage.removeItem('x_code_verifier');
    sessionStorage.removeItem('x_oauth_state');
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
