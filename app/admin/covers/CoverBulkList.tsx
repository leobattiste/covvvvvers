"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { bulkCoverAction } from "../actions";
type Cover = { id:string; title:string; artist:string; release_year:number|null; image_url:string|null; color:string|null; status:string };
export default function CoverBulkList({covers}:{covers:Cover[]}){
 const [selected,setSelected]=useState<string[]>([]);
 const [busy,start]=useTransition();
 const [notice,setNotice]=useState("");
 const router=useRouter();
 const all=covers.length>0&&selected.length===covers.length;
 const toggle=(id:string)=>setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
 const apply=(action:"draft"|"delete")=>{
  if(!selected.length)return;
  const question=action==="delete"?"Permanently delete "+selected.length+" selected covers? This also removes associated saves and ratings. This cannot be undone.":"Move "+selected.length+" selected covers to drafts? They will disappear from the public archive.";
  if(!window.confirm(question))return;
  start(async()=>{try{const result=await bulkCoverAction(selected,action);setNotice(result.message);if(result.ok){setSelected([]);router.refresh();}}catch{setNotice("The bulk action failed. Please try again.");}});
 };
 return <div className="cms-bulk-list">
  <div className="cms-bulk-toolbar">
   <label className="cms-bulk-selectall"><input type="checkbox" checked={all} onChange={e=>setSelected(e.target.checked?covers.map(c=>c.id):[])} aria-label="Select all visible covers"/> Select all <span>({covers.length})</span></label>
   <span className="cms-bulk-count">{selected.length} selected</span>
   <button type="button" className="button cms-bulk-draft" disabled={!selected.length||busy} onClick={()=>apply("draft")}>◷ Move to drafts</button>
   <button type="button" className="button danger cms-bulk-delete" disabled={!selected.length||busy} onClick={()=>apply("delete")}>▤ Delete selected</button>
  </div>
  {notice&&<p role="status" className="cms-bulk-notice">{notice}</p>}
  <ul className="admin-list cms-bulk-rows">{covers.map(c=><li key={c.id} className={selected.includes(c.id)?"is-selected":""}>
   <label className="cms-bulk-check"><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>toggle(c.id)} aria-label={"Select "+c.title+" by "+c.artist}/></label>
   <Link href={"/admin/covers/"+c.id}>
    {c.image_url?<img src={c.image_url} alt="" width={48} height={48} loading="lazy"/>:<span className="admin-noimg" style={{backgroundColor:c.color??undefined}}/>}
    <span className="admin-list-text"><strong>{c.title}</strong><span>{c.artist}{c.release_year?", "+c.release_year:""}</span></span>
    <span className={c.status==="draft"?"cms-cover-state is-draft":"cms-cover-state is-live"}>{c.status==="draft"?"● Draft":"● Live"}</span>
   </Link>
  </li>)}</ul>
  {!covers.length&&<p className="cms-empty">No covers match these filters.</p>}
 </div>;
}
