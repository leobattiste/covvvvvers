"use client";
import {useState} from "react";
import {migrateLegacyArtwork} from "./actions";
export default function MigrateArtwork({remaining:initial}:{remaining:number}){
 const [remaining,setRemaining]=useState(initial);
 const [running,setRunning]=useState(false);
 const [message,setMessage]=useState("");
 const migrate=async()=>{
  setRunning(true);setMessage("");
  let left=remaining;
  try{
   for(let attempt=0;attempt<Math.min(initial,100)&&left>0;attempt++){
    const result=await migrateLegacyArtwork();
    if(!result.ok)throw new Error(result.message);
    left=result.remaining;setRemaining(left);
    setMessage(left===0?"All artwork has been copied to Supabase.":left+" images remaining.");
   }
  }catch(error){setMessage(error instanceof Error?error.message:"Migration failed.");}
  finally{setRunning(false);}
 };
 if(!remaining&&!running)return <p className="hint">External artwork migration complete.</p>;
 return <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
  <button type="button" className="button" disabled={running} onClick={()=>void migrate()}>{running?"Copying artwork…":`Store ${remaining} external cover images locally`}</button>
  {message&&<span role="status" className="hint">{message}</span>}
 </div>;
}
