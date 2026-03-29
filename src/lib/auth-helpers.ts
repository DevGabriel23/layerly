// src/lib/auth-helpers.ts
import { supabase } from "./supabase";

export const loginWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const registerWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
};

export const loginWithDiscord = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo: `${window.location.origin}/api/auth/callback` }
  });
};