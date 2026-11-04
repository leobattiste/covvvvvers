"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
export default function ResetPassword() {
 const router=useRouter();
 const [ready,setReady]=useState(false);
 const [password,setPassword]=useState("");
 const [confirm,setConfirm]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 useEffect(()=>{
  const db=getBrowserClient();if(!db)return;
  db.auth.getSession().then(({data})=>setReady(Boolean(data.session)));
  const {data}=db.auth.onAuthStateChange((_event,session)=>setReady(Boolean(session)));
  return ()=>data.subscription.unsubscribe();
 },[]);
 async function submit(e:React.FormEvent){
  e.preventDefault();setError("");
  if(password.length<8||password!==confirm){setError("Passwords must match and contain at least 8 characters.");return;}
  const db=getBrowserClient();if(!db)return;
  setBusy(true);
  const {error}=await db.auth.updateUser({password});
  setBusy(false);
  if(error)setError(error.message);
  else {await db.auth.signOut();router.replace("/login");}
 }
 return <section className="panel"><h1>Set a new password</h1>
 {!ready?<p>Open the password reset link from your email to continue.</p>:
 <form className="stack" onSubmit={submit}>
 <label>New password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
 <label>Confirm password<input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
 <button className="button solid" disabled={busy}>{busy?"Saving…":"Update password"}</button>
 </form>}
 {error&&<p className="form-error" role="alert">{error}</p>}
 </section>;
}
