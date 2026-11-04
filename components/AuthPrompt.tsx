"use client";

import { useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE === "true";

/** One email magic-link flow for existing and new accounts. */
export default function AuthPrompt({ next, triggerLabel, triggerClassName = "button", icon }: {
  next: string; triggerLabel: string; triggerClassName?: string; icon?: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const db = getBrowserClient();
    if (!db) { setError("Sign in is currently unavailable."); return; }
    setStatus("sending"); setError("");
    const { error: issue } = await db.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo(), shouldCreateUser: true } });
    if (issue) { setError(issue.message); setStatus("idle"); }
    else setStatus("sent");
  }

  async function google() {
    const db = getBrowserClient();
    if (!db) { setError("Sign in is currently unavailable."); return; }
    const { error: issue } = await db.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (issue) setError(issue.message);
  }

  return (
    <>
      <button type="button" className={triggerClassName} aria-label={triggerLabel} title={triggerLabel} onClick={() => dialog.current?.showModal()}>
        {icon ?? triggerLabel}
      </button>
      <dialog ref={dialog} className="auth-dialog" aria-label="Sign in with email" onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}>
        <div className="auth-dialog-inner">
          <button type="button" className="auth-close" aria-label="Close" onClick={() => dialog.current?.close()}>×</button>
          <h2>Sign in</h2>
          <p>Enter your email and we’ll send you a sign-in link. New here? Your account will be created automatically.</p>
          {status === "sent" ? <p role="status">Check {email} for your sign-in link.</p> : (
            <form onSubmit={send} className="stack">
              <label><span>Email</span><input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <button type="submit" className="button solid" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Continue with email"}</button>
            </form>
          )}
          {googleEnabled && status !== "sent" && <button type="button" className="button" onClick={google}>Continue with Google</button>}
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
      </dialog>
    </>
  );
}
