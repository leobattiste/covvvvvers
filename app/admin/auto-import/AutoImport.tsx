"use client";
import Link from "next/link";
import { useState } from "react";
import { importMusicBrainzDrafts } from "./actions";
type Album={id:string;title:string;artist:string;year:string;type:string};
type Result={id:string;title:string;status:"created"|"skipped"|"error";detail:string;coverId?:string};
export default function AutoImport(){
 const [query,setQuery]=useState("");
 const [results,setResults]=useState<Album[]>([]);
 const [selected,setSelected]=useState<string[]>([]);
 const [report,setReport]=useState<Result[]>([]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const search=async()=>{
  setBusy(true);setError("");setResults([]);setSelected([]);setReport([]);
  try{
   const response=await fetch("/api/admin/musicbrainz?"+new URLSearchParams({action:"search",q:query}),{cache:"no-store"});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error??"Search failed.");
   setResults(data.results??[]);
  }catch(e){setError(e instanceof Error?e.message:"Search failed.");}finally{setBusy(false);}
 };
 const importSelected=async()=>{
  setBusy(true);setError("");
  try{setReport(await importMusicBrainzDrafts(selected));setSelected([]);}
  catch(e){setError(e instanceof Error?e.message:"Import failed.");}
  finally{setBusy(false);}
 };
 return <div className="cms-auto-import">
  <div className="cms-auto-steps"><span>01 Find albums</span><span>02 Select up to five</span><span>03 Create drafts</span><span>04 Review and publish</span></div>
  <section className="cms-section cms-auto-panel">
   <div className="cms-section-heading"><div><span className="cms-eyebrow">MUSICBRAINZ</span><h2>Find albums</h2><p>Search for an album or artist. Select only the releases you want in the rap cover archive.</p></div></div>
   <div className="cms-auto-search"><input aria-label="Search albums" value={query} placeholder="e.g. Illmatic Nas" onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();if(query.trim().length>=2)void search();}}}/><button className="button solid" type="button" disabled={busy||query.trim().length<2} onClick={()=>void search()}>{busy?"Working…":"Search MusicBrainz"}</button></div>
   {error&&<p className="form-error" role="alert">{error}</p>}
   {results.length>0&&<div className="cms-auto-results"><div className="cms-auto-results-head"><strong>Search results</strong><span>{selected.length}/5 selected</span></div>{results.map(album=><label key={album.id} className="cms-auto-result"><input type="checkbox" checked={selected.includes(album.id)} disabled={busy||(!selected.includes(album.id)&&selected.length>=5)} onChange={e=>setSelected(previous=>e.target.checked?[...previous,album.id]:previous.filter(id=>id!==album.id))}/><span><strong>{album.title}</strong><small>{album.artist} · {album.year||"Unknown year"} · {album.type||"Release group"}</small></span></label>)}</div>}
   {results.length>0&&<div className="cms-auto-footer"><span>Drafts are private until you publish them.</span><button type="button" className="button solid" disabled={busy||selected.length===0} onClick={()=>void importSelected()}>{busy?"Creating drafts…":"Create "+selected.length+" draft"+(selected.length===1?"":"s")}</button></div>}
  </section>
  {report.length>0&&<section className="cms-section cms-auto-panel"><div className="cms-section-heading"><div><span className="cms-eyebrow">IMPORT RESULTS</span><h2>Ready for your review</h2></div><Link href="/admin/covers">All covers ↗</Link></div><div className="cms-auto-report">{report.map(result=><div className="cms-auto-report-row" key={result.id}><span className={"cms-auto-pill is-"+result.status}>{result.status}</span><span><strong>{result.title}</strong><small>{result.detail}</small></span>{result.coverId&&<Link href={"/admin/covers/"+result.coverId}>Open cover ↗</Link>}</div>)}</div></section>}
  <section className="cms-section cms-auto-panel"><div className="cms-section-heading"><div><span className="cms-eyebrow">HOW IT WORKS</span><h2>What gets automated</h2></div></div><div className="cms-auto-explain"><p><strong>Automatic:</strong> MusicBrainz album identification, title, artist, first release year, duplicate check, and private draft creation.</p><p><strong>Review required:</strong> Edition-specific label, archived artwork, designer credits, visual classification, and researched cover essay. Open each draft to use the existing MusicBrainz release and artwork picker.</p><p><strong>Coming later:</strong> Background research queue, automated source-backed essays, and scheduled bulk processing. These are not running yet.</p></div></section>
 </div>;
}
