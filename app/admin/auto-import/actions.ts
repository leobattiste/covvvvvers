"use server";
import { adminClient } from "@/lib/admin";
import { decadeOf, slugify } from "@/lib/text";
import { revalidatePath } from "next/cache";

type ImportResult={id:string;title:string;status:"created"|"skipped"|"error";detail:string;coverId?:string};
const validId=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers={"User-Agent":"Covvvers/1.0 (https://covvvers.com)","Accept":"application/json"};
const pause=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
export async function importMusicBrainzDrafts(ids:string[]):Promise<ImportResult[]>{
 const db=await adminClient();
 if(!Array.isArray(ids)||ids.length===0||ids.length>5||ids.some(id=>!validId.test(id))||new Set(ids).size!==ids.length)throw new Error("Select up to five distinct albums.");
 const results:ImportResult[]=[];
 for(const [index,id] of ids.entries()){
  if(index)await pause(1100);
  try{
   const response=await fetch("https://musicbrainz.org/ws/2/release-group/"+id+"?inc=artist-credits&fmt=json",{headers,cache:"no-store"});
   if(!response.ok)throw new Error("MusicBrainz returned "+response.status);
   const album=await response.json();
   const title=String(album.title??"").trim();
   const artist=(album["artist-credit"]??[]).map((part:{name?:string}|string)=>typeof part==="string"?part:part.name??"").join("").trim();
   const year=Number(String(album["first-release-date"]??"").slice(0,4));
   if(!title||!artist||!Number.isInteger(year)||year<1970||year>2100){
    results.push({id,title:title||"Unknown album",status:"skipped",detail:"Missing valid title, artist, or release year. Review manually."});continue;
   }
   const {data:existing,error:checkError}=await db.from("covers").select("id,title,artist").ilike("title",title.replace(/[\\%_]/g,"\\$&")).ilike("artist",artist.replace(/[\\%_]/g,"\\$&")).limit(1);
   if(checkError)throw new Error(checkError.message);
   if(existing?.length){results.push({id,title,status:"skipped",detail:"Already in Covvvers.",coverId:existing[0].id});continue;}
   const base=slugify(title);
   let slug=base;
   for(let n=2;n<=30;n++){
    const {data:match}=await db.from("covers").select("id").eq("slug",slug).maybeSingle();
    if(!match)break;
    slug=base+"-"+n;
   }
   const {data:created,error}=await db.from("covers").insert({slug,title,artist,release_year:year,decade:decadeOf(year),status:"draft",image_url:""}).select("id").single();
   if(error||!created)throw new Error(error?.message??"Could not create draft.");
   results.push({id,title,status:"created",detail:"Draft created. Artwork, design credits and essay still need review.",coverId:created.id});
  }catch(e){results.push({id,title:"MusicBrainz album",status:"error",detail:e instanceof Error?e.message:"Import failed."});}
 }
 revalidatePath("/admin/covers");
 revalidatePath("/admin/auto-import");
 return results;
}
