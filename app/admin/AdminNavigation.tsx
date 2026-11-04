"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
const groups = [
 {label:"Workspace",links:[["Overview","/admin"],["Activity","/admin/activity"]]},
 {label:"Collection",links:[["Covers","/admin/covers"],["Add Cover","/admin/add-cover"],["Creators","/admin/creators"],["Cover types","/admin/types"]]},
 {label:"Community",links:[["Submissions","/admin/submissions"],["Feedback","/admin/feedback"],["Members","/admin/members"],["Newsletter","/admin/newsletter"]]},
 {label:"Settings",links:[["Homepage","/admin/site"]]}
] as const;
// Lucide SVG icon paths, bundled locally so navigation works without third-party image requests.
const iconPaths:Record<string,React.ReactNode>={
 "Overview":<><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
 "Activity":<><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>,
 "Covers":<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M7.5 7.5h.01"/></>,
 "Add Cover":<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></>,
 "Creators":<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
 "Cover types":<><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></>,
 "Submissions":<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 13h5l2 3h4l2-3h5"/></>,
 "Feedback":<><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></>,
 "Members":<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
 "Newsletter":<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></>,
 "Homepage":<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/></>
};
const NavIcon=({name}:{name:string})=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink:0}}>{iconPaths[name]}</svg>;
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
   <Link href="/admin" className="cms-brand" onClick={()=>setOpen(false)}>Admin</Link>
   <button type="button" className="cms-mobile-toggle" aria-expanded={open} aria-controls={menuId} aria-label={open?"Close admin menu":"Open admin menu"} onClick={()=>setOpen(!open)}>{open?"Close":"Menu"}</button>
  </div>
  <div id={menuId} className={open?"cms-nav-wrap is-open":"cms-nav-wrap"}>
   {groups.map(group=><nav key={group.label} aria-label={group.label}>
    <h2>{group.label}</h2>
    {group.links.map(([title,href])=><Link key={href} href={href} onClick={()=>setOpen(false)} aria-current={path===href||(href!=="/admin"&&path.startsWith(href+"/"))?"page":undefined}><NavIcon name={title}/>{title}</Link>)}
   </nav>)}
   <Link href="/covers" className="cms-return">← Back to website</Link>
  </div>
 </aside>;
}
