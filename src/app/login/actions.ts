"use server";

import { redirect } from "next/navigation";
import { appUrl, hasSupabaseConfig, isDemoMode } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

function credentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signIn(formData: FormData) {
  if (isDemoMode() || !hasSupabaseConfig()) redirect("/dashboard");
  const { email, password } = credentials(formData);
  if (!email || !password) redirect("/login?error=Email%20and%20password%20are%20required");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  if (isDemoMode() || !hasSupabaseConfig()) redirect("/dashboard");
  const { email, password } = credentials(formData);
  if (!email || password.length < 8) redirect("/login?error=Use%20a%20valid%20email%20and%20an%208%2B%20character%20password");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${appUrl()}/auth/confirm` },
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/login?message=Check%20your%20email%20to%20confirm%20your%20account");
}
