import Link from "next/link";
import { hasSupabaseConfig, isDemoMode } from "@/lib/config";
import { signIn, signUp } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const demo = isDemoMode() || !hasSupabaseConfig();
  return (
    <main className="auth-page">
      <section className="auth-card panel">
        <Link href="/dashboard" className="brand-mark auth-brand"><span className="brand-glyph">G</span><span><strong>GrowthOS</strong><small>Autonomous social growth</small></span></Link>
        <span className="eyebrow accent">Workspace access</span>
        <h1>{demo ? "Demo mode is active." : "Sign in to your workspace."}</h1>
        <p>{demo ? "Authentication is bypassed until DEMO_MODE=false and Supabase credentials are configured." : "Your session is cookie-backed and verified server-side before workspace data is loaded."}</p>
        {params.error ? <div className="error-banner">{params.error}</div> : null}
        {params.message ? <div className="success-banner">{params.message}</div> : null}
        {demo ? (
          <Link className="primary-button auth-submit" href="/dashboard">Enter demo workspace</Link>
        ) : (
          <form className="auth-form">
            <label>Email<input name="email" type="email" autoComplete="email" required /></label>
            <label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
            <div className="auth-actions"><button className="primary-button" formAction={signIn}>Sign in</button><button className="secondary-button" formAction={signUp}>Create account</button></div>
          </form>
        )}
      </section>
    </main>
  );
}
