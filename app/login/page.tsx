"use client";
import { useEffect,useState } from "react";
import PasswordAuthForm from "@/components/PasswordAuthForm";
import { supabaseEnabled } from "@/lib/supabase/config";
export default function LoginPage() {
 const [next,setNext]=useState("/me");
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const n=p.get("next");if(n?.startsWith("/")&&!n.startsWith("//")&&!n.includes("\\"))setNext(n);},[]);
 return <section className="panel"><h1>Sign in / Sign up</h1>
 <p>Create an account with your email and password. Verify your email address before signing in.</p>
 {supabaseEnabled?<PasswordAuthForm next={next}/>:<p>Accounts are currently unavailable.</p>}
 </section>;
}
