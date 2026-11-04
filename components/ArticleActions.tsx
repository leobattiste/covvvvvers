"use client";
import { useEffect,useState } from "react";
import AuthPrompt from "./AuthPrompt";
import { getBrowserClient } from "@/lib/supabase/client";

export default function ArticleActions({id,slug,title}:{id:string;slug:string;title:string}) {
 const [user,setUser]=useState<string|null>(null);
 const [ready,setReady]=useState(false);
 const [saved,setSaved]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{
  let active=true;
  const db=getBrowserClient();
  if(!db){setReady(true);return;}
  db.auth.getUser().then(async ({data})=>{
   if(!active)return;
   const uid=data.user?.id??null;setUser(uid);
   if(uid){const {data:row}=await db.from("article_bookmarks").select("article_id").eq("article_id",id).eq("user_id",uid).maybeSingle();if(active)setSaved(Boolean(row));}
   if(active)setReady(true);
  }).catch(()=>{if(active)setReady(true);});
  return ()=>{active=false;};
 },[id]);
 async function toggle(){
  const db=getBrowserClient();if(!db||!user)return;
  setBusy(true);setMessage("");
  const result=saved?await db.from("article_bookmarks").delete().eq("article_id",id).eq("user_id",user):await db.from("article_bookmarks").insert({article_id:id,user_id:user});
  if(result.error)setMessage("Could not update bookmark. Please try again.");
  else setSaved(!saved);
  setBusy(false);
 }
 async function share(){
  const url=window.location.href;
  try {
   if(navigator.share) await navigator.share({title,url});
   else {await navigator.clipboard.writeText(url);setMessage("Link copied.");}
  }catch(e){if((e as Error).name!=="AbortError")setMessage("Unable to share this link.");}
 }
 return <div className="cover-actions">
  {!ready?<span>Loading bookmark…</span>:user?
   <button className="button" type="button" disabled={busy} aria-pressed={saved} onClick={toggle}>{saved?"♥ Bookmarked":"♡ Bookmark"}</button>:
   <AuthPrompt next={`/articles/${slug}`} triggerClassName="button" triggerLabel="♡ Bookmark"/>}
  <button className="button" type="button" onClick={share}>Share article</button>
  {message && <span role="status">{message}</span>}
 </div>;
}
