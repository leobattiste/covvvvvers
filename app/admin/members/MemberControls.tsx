"use client";
import { useState } from "react";
import { moderateMember } from "../member-actions";
export default function MemberControls({id,status}:{id:string;status:string}){
 const [choice,setChoice]=useState(status==="active"?"suspended":"active");
 return <form action={moderateMember} className="cms-member-controls" onSubmit={e=>{
  const verb=choice==="active"?"restore":choice==="suspended"?"suspend for 7 days":"ban";
  if(!window.confirm("Are you sure you want to "+verb+" this member? An email notification will be sent."))e.preventDefault();
 }}>
  <input type="hidden" name="id" value={id}/>
  <select name="status" aria-label="Moderation action" value={choice} onChange={e=>setChoice(e.target.value)}>
   <option value="active">✓ Restore access</option>
   <option value="suspended">◷ Suspend 7 days</option>
   <option value="banned">⊘ Ban account</option>
  </select>
  <input name="reason" aria-label="Reason for action" placeholder="Reason sent to member" maxLength={500} required={choice!=="active"}/>
  <button className={choice==="active"?"button":"button danger"} type="submit">Apply</button>
 </form>;
}
