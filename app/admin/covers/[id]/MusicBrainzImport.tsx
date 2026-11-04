"use client";
import { useState } from "react";
type Result={id:string;title:string;artist:string;year:string;type:string};
type Release={id:string;title:string;artist:string;date:string;country:string;label:string;artwork:string};
export type MusicBrainzSelection={title:string;artist:string;year:number|null;country:string;label:string;imageUrl?:string;releaseId:string;releaseGroupId:string};
export default function MusicBrainzImport({onImport}:{onImport:(data:MusicBrainzSelection)=>void}){
 const [q,setQ]=useState("");
 const [results,setResults]=useState<Result[]>([]);
 const [group,setGroup]=useState<Result|null>(null);
 const [releases,setReleases]=useState<Release[]>([]);
 const [selected,setSelected]=useState<Release|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [useArtwork,setUseArtwork]=useState(false);
 const [imageAvailable,setImageAvailable]=useState(false);
 const request=async(params:Record<string,string>)=>{
  const response=await fetch("/api/admin/musicbrainz?"+new URLSearchParams(params),{cache:"no-store"});
  const json=await response.json();
  if(!response.ok)throw new Error(json.error??"MusicBrainz is unavailable.");
  return json;
 };
 const search=async()=>{
  setBusy(true);setError("");setGroup(null);setSelected(null);setReleases([]);
  try{const data=await request({action:"search",q});setResults(data.results??[]);if(!data.results?.length)setError("No matching albums found.");}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 };
 const chooseGroup=async(item:Result)=>{
  setBusy(true);setError("");setGroup(item);setSelected(null);setReleases([]);setUseArtwork(false);
  try{const data=await request({action:"releases",id:item.id});setReleases(data.releases??[]);if(!data.releases?.length)setError("No release editions were found.");}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 };
 const chooseRelease=async(item:Release)=>{
  setSelected(item);setUseArtwork(false);setImageAvailable(false);
  try{
   const response=await fetch("https://coverartarchive.org/release/"+item.id,{method:"GET",headers:{"Accept":"application/json"}});
   if(!response.ok)return;
   const data=await response.json();
   const front=(data.images??[]).find((x:{front?:boolean})=>x.front);
   if(front?.image){setImageAvailable(true);setUseArtwork(true);}
  }catch{/* Artwork is optional. */}
 };
 const apply=()=>{
  if(!group||!selected)return;
  onImport({title:group.title,artist:group.artist||selected.artist,year:Number((group.year||selected.date).slice(0,4))||null,country:selected.country,label:selected.label,imageUrl:useArtwork&&imageAvailable?"https://coverartarchive.org/release/"+selected.id+"/front":undefined,releaseId:selected.id,releaseGroupId:group.id});
 };
 return <section className="cms-mb" aria-label="MusicBrainz album lookup">
  <div className="cms-mb-heading"><div><h2>♫ Import from MusicBrainz</h2><p>Find an album, choose the correct edition, and review its metadata before applying it to this cover.</p></div><a href="https://musicbrainz.org" target="_blank" rel="noreferrer">MusicBrainz ↗</a></div>
  <div className="cms-mb-search"><input aria-label="Search MusicBrainz albums" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();if(q.trim().length>=2)void search();}}} placeholder="Album or artist, e.g. Illmatic Nas"/><button type="button" className="button" disabled={busy||q.trim().length<2} onClick={()=>void search()}>{busy?"Searching…":"⌕ Search albums"}</button></div>
  {error&&<p className="form-error" role="alert">{error}</p>}
  {results.length>0&&<div className="cms-mb-results"><strong>Albums</strong><ul>{results.map(r=><li key={r.id}><button type="button" className={group?.id===r.id?"is-active":""} onClick={()=>void chooseGroup(r)}><span><strong>{r.title}</strong><small>{r.artist} · {r.year||"Year unknown"} · {r.type||"Release group"}</small></span><span>Choose →</span></button></li>)}</ul></div>}
  {group&&<div className="cms-mb-results"><strong>Choose the release edition for {group.title}</strong><p className="hint">Different editions can have different artwork, dates, and labels. Up to 50 editions are shown.</p><ul>{releases.map(r=><li key={r.id}><button type="button" className={selected?.id===r.id?"is-active":""} onClick={()=>void chooseRelease(r)}><span><strong>{r.title}</strong><small>{r.date||"Unknown date"} · {r.country||"Unknown country"} · {r.label||"Label unavailable"}</small></span><span>{selected?.id===r.id?"✓ Selected":"Select →"}</span></button></li>)}</ul></div>}
  {selected&&<div className="cms-mb-confirm">
   <strong>Review import</strong>
   <p>{group?.title} · {group?.artist} · {group?.year||selected.date.slice(0,4)||"Unknown year"}</p>
   <p className="hint">This updates the album title, artist, release year, country, and label in the editor. Your essay, cover type, and creator credits stay untouched. Nothing is saved or published until you use the editor's save button.</p>
   {imageAvailable?<label className="cms-mb-artcheck"><input type="checkbox" checked={useArtwork} onChange={e=>setUseArtwork(e.target.checked)}/> Also use this edition's archived front cover (external URL)</label>:<p className="hint">Checking artwork availability, or no front cover is archived for this edition.</p>}
   <button type="button" className="button solid" onClick={apply}>✓ Apply to editor</button>
  </div>}
  <p className="hint">Music metadata © MusicBrainz contributors. Artwork may be copyrighted. Verify the selected edition and image rights before publishing. Visual design credits must be researched separately.</p>
 </section>;
}
