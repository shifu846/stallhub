import type { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/services/supabase';

// The signed-in user's identity, available anywhere without passing props down (Brief 3.2).
type AuthValue = {
  session: Session | null;
  user: User | null;
  displayName: string;
  ready: boolean;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1. Restore the saved session from encrypted storage (this is the "stay logged in" feature).
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setReady(true));

    // 2. Follow every later change: login, logout, token refresh.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(() => {
    const user = session?.user ?? null;
    const name = user?.user_metadata?.display_name;
    return {
      session,
      user,
      displayName: typeof name === 'string' && name ? name : (user?.email ?? ''),
      ready,
    };
  }, [session, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}