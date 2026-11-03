"use client";

import { useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE === "true";

/** Inline sign-in/sign-up prompt for actions that require an account. */
export default function AuthPrompt({ next, triggerLabel, triggerClassName = "button", icon }: {
  next: string; triggerLabel: string; triggerClassName?: string; icon?: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const db = getBrowserClient();
    if (!db) { setError("Sign in is currently unavailable."); return; }
    setStatus("sending"); setError("");
    const { error: issue } = await db.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo(), shouldCreateUser: mode === "signup" } });
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
      <dialog ref={dialog} className="auth-dialog" aria-label="Sign in or sign up" onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}>
        <div className="auth-dialog-inner">
          <button type="button" className="auth-close" aria-label="Close" onClick={() => dialog.current?.close()}>×</button>
          <h2>{mode === "signin" ? "Sign in" : "Sign up"}</h2>
          <p>{mode === "signin" ? "Sign in to continue." : "Create an account to continue."}</p>
          <div className="auth-switch" role="group" aria-label="Account action">
            <button type="button" aria-pressed={mode === "signin"} onClick={() => { setMode("signin"); setError(""); setStatus("idle"); }}>Sign in</button>
            <button type="button" aria-pressed={mode === "signup"} onClick={() => { setMode("signup"); setError(""); setStatus("idle"); }}>Sign up</button>
          </div>
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
