"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
const groups = [
 {label:"Workspace",links:[["Overview","/admin"],["Activity","/admin/activity"]]},
 {label:"Collection",links:[["Covers","/admin/covers"],["Creators","/admin/creators"],["Cover types","/admin/types"]]},
 {label:"Community",links:[["Submissions","/admin/submissions"],["Feedback","/admin/feedback"],["Members","/admin/members"],["Newsletter","/admin/newsletter"]]},
 {label:"Settings",links:[["Homepage","/admin/site"]]}
] as const;
export default function AdminNavigation(){
 const path=usePathname();
 const [open,setOpen]=useState(false);
 const menuId=useId();
 useEffect(()=>{setOpen(false);},[path]);
 useEffect(()=>{
  if(!open)return;
  const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false);};
  window.addEventListener("keydown",onKey);
  return ()=>window.removeEventListener("keydown",onKey);
 },[open]);
 return <aside className="cms-sidebar" aria-label="Admin navigation">
  <div className="cms-sidebar-top">
   <Link href="/admin" className="cms-brand" onClick={()=>setOpen(false)}>Workspace <span>ADMIN</span></Link>
   <button type="button" className="cms-mobile-toggle" aria-expanded={open} aria-controls={menuId} aria-label={open?"Close admin menu":"Open admin menu"} onClick={()=>setOpen(!open)}>{open?"Close":"Menu"}</button>
  </div>
  <div id={menuId} className={open?"cms-nav-wrap is-open":"cms-nav-wrap"}>
   {groups.map(group=><nav key={group.label} aria-label={group.label}>
    <h2>{group.label}</h2>
    {group.links.map(([title,href])=><Link key={href} href={href} onClick={()=>setOpen(false)} aria-current={path===href||(href!=="/admin"&&path.startsWith(href+"/"))?"page":undefined}>{title}</Link>)}
   </nav>)}
   <Link href="/covers" className="cms-return">← Back to website</Link>
  </div>
 </aside>;
}
