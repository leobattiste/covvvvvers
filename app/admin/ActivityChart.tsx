"use client";
import { useState } from "react";
export default function ActivityChart({points}:{points:{date:string;events:number}[]}){
 const [days,setDays]=useState(30);
 const data=points.slice(-days);
 const max=Math.max(1,...data.map(p=>p.events));
 const total=data.reduce((a,b)=>a+b.events,0);
 const coords=data.map((p,i)=>({x:25+i*750/Math.max(1,data.length-1),y:170-145*p.events/max,...p}));
 const line=coords.map((p,i)=>(i?"L":"M")+p.x+" "+p.y).join(" ");
 return <section className="cms-chart-card">
  <div className="cms-chart-header"><div><span className="cms-eyebrow">SITE ACTIVITY</span><h2>Activity overview</h2><p>Editorial changes recorded in Covvvers</p></div><div className="cms-chart-period">{[7,30].map(n=><button type="button" key={n} className={days===n?"is-active":""} aria-pressed={days===n} onClick={()=>setDays(n)}>{n} days</button>)}</div></div>
  <div className="cms-chart-summary"><strong>{total.toLocaleString("en-US")}</strong><span>events in the last {days} days</span></div>
  <svg className="cms-chart-svg" viewBox="0 0 800 200" preserveAspectRatio="none" role="img" aria-label={"Site events over "+days+" days"}>
   {[0,.25,.5,.75,1].map(f=><line key={f} x1="25" x2="775" y1={170-f*145} y2={170-f*145} stroke="currentColor" strokeOpacity=".12"/>)}
   <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
   {coords.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2.5" fill="currentColor"><title>{p.date}: {p.events} events</title></circle>)}
   {coords.filter((_,i)=>i===0||i===coords.length-1||i%7===0).map(p=><text key={p.date} x={p.x} y="194" fill="currentColor" opacity=".65" fontSize="11" textAnchor="middle">{p.date.slice(5)}</text>)}
  </svg>
  <div className="cms-chart-foot"><span>Recorded interactions, not page views</span><a href="https://vercel.com/leobaptistea-gmailcoms-projects/covvvvvers/analytics" target="_blank" rel="noreferrer">Open traffic analytics ↗</a></div>
 </section>;
}
