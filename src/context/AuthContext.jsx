import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentSession, signInAdmin, signOutAdmin } from '../services/supabase.js';

// ============================================================================
// AuthContext
// ============================================================================
// Wraps the whole app (see App.jsx) so any component can ask "is someone
// logged in?" via useAuth() instead of re-querying Supabase itself.
// This is the single source of truth gating access to /admin.
// ============================================================================
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. On first load, check if a session already exists (e.g. page refresh).
    getCurrentSession()
      .then((existingSession) => setSession(existingSession))
      .catch((err) => console.error('[AuthContext] Failed to load session:', err.message))
      .finally(() => setIsLoading(false));

    // 2. Subscribe to ALL future auth changes (login, logout, token refresh)
    //    so every component re-renders automatically — no manual polling.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    // Always clean up the subscription on unmount to avoid memory leaks.
    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { session: newSession } = await signInAdmin(email, password);
    setSession(newSession);
    return newSession;
  }

  async function logout() {
    await signOutAdmin();
    setSession(null);
  }

  const value = {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Convenience hook — `const { isAuthenticated, login, logout } = useAuth();` */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth() must be used inside an <AuthProvider>.');
  }
  return ctx;
}
