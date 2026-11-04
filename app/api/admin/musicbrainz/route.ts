import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
const MB = "https://musicbrainz.org/ws/2";
const UA = "Covvvers/1.0 (https://covvvers.com)";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type MBArtist = { name?: string };
type MBLabel = { label?: { name?: string } };
type MBRelease = { id:string; title:string; date?:string; country?:string; status?:string; "artist-credit"?: (MBArtist | string)[]; "label-info"?:MBLabel[]; "release-group"?:{id:string;title:string} };
const artistName=(credits?: (MBArtist|string)[]) => (credits??[]).map(a=>typeof a==="string"?a:a.name??"").join("").trim();
async function mb(path:string) {
 const response=await fetch(MB+path,{headers:{"User-Agent":UA,"Accept":"application/json"},next:{revalidate:86400}});
 if(!response.ok)throw new Error("MusicBrainz request failed ("+response.status+"). Try again later.");
 return response.json();
}
export async function GET(request:NextRequest) {
 try {
  await requireAdmin("/admin/covers");
  const params=request.nextUrl.searchParams;
  const action=params.get("action")??"search";
  if(action==="search") {
   const q=(params.get("q")??"").trim().slice(0,120);
   if(q.length<2)return NextResponse.json({error:"Enter at least two characters."},{status:400});
   const escaped=q.replace(/[+\\():"]/g," ").trim();
   const data=await mb("/release-group/?query="+encodeURIComponent(escaped)+"&limit=12&fmt=json");
   const results=(data["release-groups"]??[]).filter((r:{id:string;primaryType?:string})=>UUID.test(r.id)).map((r:{id:string;title:string;"first-release-date"?:string;"artist-credit"?: (MBArtist|string)[];"primary-type"?:string})=>({
    id:r.id,title:r.title,artist:artistName(r["artist-credit"]),year:r["first-release-date"]?.slice(0,4)??"",type:r["primary-type"]??""
   }));
   return NextResponse.json({results});
  }
  if(action==="releases") {
   const id=params.get("id")??"";
   if(!UUID.test(id))return NextResponse.json({error:"Invalid release group."},{status:400});
   const data=await mb("/release/?release-group="+id+"&limit=50&fmt=json");
   const releases:MBRelease[]=data.releases??[];
   return NextResponse.json({releases:releases.map(r=>({id:r.id,title:r.title,artist:artistName(r["artist-credit"]),date:r.date??"",country:r.country??"",status:r.status??"",label:r["label-info"]?.map(x=>x.label?.name).filter(Boolean).join(", ")??"",artwork:"https://coverartarchive.org/release/"+r.id+"/front-250"}))});
  }
  if(action==="release") {
   const id=params.get("id")??"";
   if(!UUID.test(id))return NextResponse.json({error:"Invalid release."},{status:400});
   const r:MBRelease=await mb("/release/"+id+"?inc=artist-credits+labels+release-groups&fmt=json");
   return NextResponse.json({release:{id:r.id,title:r.title,artist:artistName(r["artist-credit"]),date:r.date??"",country:r.country??"",label:r["label-info"]?.map(x=>x.label?.name).filter(Boolean).join(", ")??"",releaseGroupId:r["release-group"]?.id??""}});
  }
  return NextResponse.json({error:"Unknown action."},{status:400});
 } catch(e) {
  const message=e instanceof Error?e.message:"MusicBrainz lookup unavailable.";
  return NextResponse.json({error:message},{status:message.includes("MusicBrainz")?502:403});
 }
}
