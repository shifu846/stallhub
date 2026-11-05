import { useSaved } from '@/store/saved';
import { clearCache } from './cache';
import { supabase } from './supabase';

// Passwords are only ever handed to the Supabase SDK. They are never stored, logged or kept in state.
export async function register(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { display_name: displayName.trim() } },
  });
  if (error) throw error;
  return { needsEmailConfirmation: data.session === null };
}

export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw error;
}

export async function logout() {
  // scope: 'local' works even with no network, so signing out never gets stuck.
  await supabase.auth.signOut({ scope: 'local' });
  useSaved.getState().clear();
  await clearCache();
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
  if (error) throw error;
}