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
  // Synchronous hydration - read from localStorage immediately on initial render
  // This prevents flash of unauthenticated state
  const [user, setUser] = useState<XUser | null>(() => {
    const storedUser = localStorage.getItem('x_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem('x_user');
      }
    }
    return null;
  });
  
  // Loading is false by default since hydration is synchronous
  const [loading, setLoading] = useState(false);

  // Cross-tab session synchronization
  // When user logs in/out in another tab, this tab updates automatically
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'x_user') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
    // Clear X auth data
    localStorage.removeItem('x_user');
    sessionStorage.removeItem('x_code_verifier');
    sessionStorage.removeItem('x_oauth_state');
    
    // FIX #4: Clear ALL onboarding-related localStorage to prevent data leakage
    localStorage.removeItem('claimFormProgress');
    localStorage.removeItem('verifiedProfileId');
    localStorage.removeItem('claimingProfile');
    localStorage.removeItem('github_oauth_state');
    localStorage.removeItem('claimingProgramId');
    localStorage.removeItem('claimingProgramDbId');
    localStorage.removeItem('claimingWalletAddress');
    localStorage.removeItem('claimingXUserId');
    localStorage.removeItem('claimingXUsername');
    
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
