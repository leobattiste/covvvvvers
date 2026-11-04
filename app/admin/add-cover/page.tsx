"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {addMusicBrainzCover} from "../actions";

type Album={id:string;title:string;artist:string;year:string;type:string;genres?:string[];cover?:string};
type Edition={id:string;title:string;date:string;country:string;label:string;artwork:string};
export default function AddCover(){
 const router=useRouter();
 const [q,setQ]=useState("");
 const [results,setResults]=useState<Album[]>([]);
 const [loading,setLoading]=useState(false);
 const [adding,setAdding]=useState("");
 const [error,setError]=useState("");
 const [more,setMore]=useState(false);
 async function search(){
  if(q.trim().length<2)return;
  setLoading(true);setError("");
  try{
   const response=await fetch("/api/admin/musicbrainz?action=search&q="+encodeURIComponent(q.trim()));
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"Search failed.");
   setResults(data.results||[]);
   setMore(true);
  }catch(e){setError((e as Error).message);}finally{setLoading(false);}
 }
 async function add(album:Album){
  setAdding(album.id);setError("");
  try{
   const response=await fetch("/api/admin/musicbrainz?action=releases&id="+album.id);
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"Couldn't load album editions.");
   const editions:Edition[]=data.releases||[];
   const preferred=editions.find(x=>x.date?.startsWith(album.year)&&x.country)||editions.find(x=>x.date?.startsWith(album.year))||editions[0];
   const id=await addMusicBrainzCover({
    title:album.title,artist:album.artist,year:Number(album.year)||Number(preferred?.date?.slice(0,4))||new Date().getFullYear(),
    country:preferred?.country||"",label:preferred?.label||"",
    imageUrl:preferred?.id?"https://coverartarchive.org/release/"+preferred.id+"/front":"",
    genres:album.genres||[]
   });
   router.push("/admin/covers/"+id);
  }catch(e){setError((e as Error).message);setAdding("");}
 }
 return <section className="panel wide" style={{minHeight:"75vh"}}>
  <p className="crumb">Admin / Collection</p>
  <h1>Add Cover</h1>
  <p className="hint">Search for an album, select Add Cover, then review its prefilled details before publishing. MusicBrainz does not provide reliable visual design credits or cover stories.</p>
  <form onSubmit={e=>{e.preventDefault();void search();}} style={{display:"flex",gap:12,margin:"24px 0",flexWrap:"wrap"}}>
   <input type="search" aria-label="Search albums" placeholder="Search album title or artist…" value={q} onChange={e=>setQ(e.target.value)} style={{flex:"1 1 260px",minWidth:0}}/>
   <button className="button solid" disabled={loading||q.trim().length<2}>{loading?"Searching…":"Search albums"}</button>
  </form>
  {error&&<p role="alert" className="form-error">{error}</p>}
  {more&&<p className="hint">{results.length} results. Scroll to browse albums.</p>}
  <div className="cms-add-results">
   {results.map(album=><article key={album.id} className="cms-add-album">
    <div className="cms-add-art">
     <AlbumArt id={album.id} title={album.title}/>
    </div>
    <div className="cms-add-info">
     <strong title={album.title}>{album.title}</strong>
     <span title={album.artist}>{album.artist||"Artist unavailable"}</span>
     <small>{album.year||"Year unknown"} <span aria-hidden="true">·</span> {album.genres?.length?album.genres.slice(0,3).join(", "):album.type||"Genre unavailable"}</small>
     <button type="button" className="button solid cms-add-button" aria-label={`Add ${album.title} by ${album.artist} to covers`} disabled={Boolean(adding)} onClick={()=>void add(album)}>{adding===album.id?<><span className="cms-add-button-desktop">Preparing draft…</span><span className="cms-add-button-mobile" aria-hidden="true">…</span></>:<><span className="cms-add-button-desktop">Add Cover</span><span className="cms-add-button-mobile" aria-hidden="true">+</span></>}</button>
    </div>
   </article>)}
  </div>
 </section>;
}

function AlbumArt({id,title}:{id:string;title:string}){
 const [failed,setFailed]=useState(false);
 return failed?<div className="cms-add-art-empty" aria-label="Artwork unavailable"><svg viewBox="0 0 24 24" width="35" height="35" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/></svg><span>Artwork unavailable</span></div>:<img src={"/api/admin/musicbrainz/artwork?id="+encodeURIComponent(id)} alt={"Artwork for "+title} loading="lazy" onError={()=>setFailed(true)}/>;
}
