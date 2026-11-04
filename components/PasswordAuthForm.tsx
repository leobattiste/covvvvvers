"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "reset";
export default function PasswordAuthForm({ next = "/me" }: { next?: string }) {
 const router = useRouter();
 const [mode,setMode]=useState<Mode>("signin");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [confirm,setConfirm]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const safeNext = next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/me";
 const redirectTo = () => window.location.origin + "/auth/callback?next=" + encodeURIComponent(safeNext);
 const change = (m:Mode) => {setMode(m);setError("");setNotice("");setPassword("");setConfirm("");};
 async function submit(e:React.FormEvent) {
  e.preventDefault();setError("");setNotice("");
  const db=getBrowserClient();if(!db){setError("Sign in is currently unavailable.");return;}
  if(mode==="signup" && (password.length<8 || password!==confirm)){setError("Use at least 8 characters and make sure the passwords match.");return;}
  setBusy(true);
  try {
   if(mode==="reset") {
    const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+"/auth/callback?next="+encodeURIComponent("/auth/reset")});
    if(error)throw error;
    setNotice("If an account exists for that email, you will receive a password reset link.");
   } else if(mode==="signup") {
    const {data,error}=await db.auth.signUp({email,password,options:{emailRedirectTo:redirectTo()}});
    if(error)throw error;
    if(data.session) {
     await db.auth.signOut();
     setNotice("Your account was created. Email verification must be enabled in Supabase before registrations can be accepted. Please contact the site administrator.");
    } else setNotice("Check your email to verify your address. Then sign in with your password.");
   } else {
    const {error}=await db.auth.signInWithPassword({email,password});
    if(error)throw error;
    router.push(safeNext);router.refresh();
   }
  }catch(e){setError((e as Error).message || "Something went wrong. Please try again.");}
  finally{setBusy(false);}
 }
 return <div className="stack">
  <div className="intro-actions">
   <button type="button" className="text-button" aria-pressed={mode==="signin"} onClick={()=>change("signin")}>Sign in</button>
   <button type="button" className="text-button" aria-pressed={mode==="signup"} onClick={()=>change("signup")}>Sign up</button>
  </div>
  {notice ? <p className="notice" role="status">{notice}</p> :
  <form className="stack" onSubmit={submit}>
   <label><span>Email address</span><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
   {mode!=="reset" && <label><span>Password</span><input type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={mode==="signup"?8:undefined} value={password} onChange={e=>setPassword(e.target.value)} required/></label>}
   {mode==="signup" && <label><span>Confirm password</span><input type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} required/></label>}
   <button className="button solid" type="submit" disabled={busy}>{busy?"Please wait…":mode==="signin"?"Sign in":mode==="signup"?"Create account":"Send reset email"}</button>
  </form>}
  {mode==="signin" && <button type="button" className="text-button" onClick={()=>change("reset")}>Forgot your password?</button>}
  {mode==="reset" && <button type="button" className="text-button" onClick={()=>change("signin")}>Back to sign in</button>}
  {error && <p className="form-error" role="alert">{error}</p>}
 </div>;
}
