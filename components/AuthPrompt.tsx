"use client";
import { useRef } from "react";
import PasswordAuthForm from "./PasswordAuthForm";
export default function AuthPrompt({next,triggerLabel,triggerClassName="button",icon}:{next:string;triggerLabel:string;triggerClassName?:string;icon?:React.ReactNode}) {
 const dialog=useRef<HTMLDialogElement>(null);
 return <>
 <button type="button" className={triggerClassName} aria-label={triggerLabel} title={triggerLabel} onClick={()=>dialog.current?.showModal()}>{icon??triggerLabel}</button>
 <dialog ref={dialog} className="auth-dialog" aria-label="Sign in or sign up" onClick={e=>{if(e.target===dialog.current)dialog.current?.close();}}>
 <div className="auth-dialog-inner">
 <button type="button" className="auth-close" aria-label="Close" onClick={()=>dialog.current?.close()}>×</button>
 <h2>Sign in / Sign up</h2><p>Use your email and password. New accounts require email verification.</p>
 <PasswordAuthForm next={next}/>
 </div></dialog></>;
}
