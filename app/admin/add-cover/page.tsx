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
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,210px),1fr))",gap:20,maxHeight:"70vh",overflowY:"auto",padding:"8px 2px"}}>
   {results.map(album=><article key={album.id} style={{border:"1px solid var(--border, #ddd)",borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column"}}>
    <div style={{aspectRatio:"1",background:"var(--muted,#eee)",overflow:"hidden"}}>
     <img src={album.cover||"https://coverartarchive.org/release-group/"+album.id+"/front-250"} alt={album.title+" album cover"} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.currentTarget.style.display="none";}}/>
    </div>
    <div style={{padding:14,display:"flex",flexDirection:"column",gap:8,flex:1}}>
     <strong>{album.title}</strong>
     <span>{album.artist}</span>
     <small>{album.year||"Unknown year"} · {album.genres?.join(", ")||album.type||"Genre unavailable"}</small>
     <button type="button" className="button solid" style={{marginTop:"auto"}} disabled={Boolean(adding)} onClick={()=>void add(album)}>{adding===album.id?"Preparing draft…":"Add Cover"}</button>
    </div>
   </article>)}
  </div>
 </section>;
}
