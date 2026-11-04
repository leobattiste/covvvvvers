import {NextRequest,NextResponse} from "next/server";
import {requireAdmin} from "@/lib/admin";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(req:NextRequest){
 await requireAdmin("/admin/add-cover");
 const id=req.nextUrl.searchParams.get("id")||"";
 if(!UUID.test(id))return new NextResponse(null,{status:400});
 try{
  const upstream=await fetch("https://coverartarchive.org/release-group/"+id+"/front-250",{headers:{"User-Agent":"Covvvers/1.0 (https://covvvers.com)","Accept":"image/*"},signal:AbortSignal.timeout(9000),next:{revalidate:86400}});
  if(!upstream.ok)return new NextResponse(null,{status:404});
  const contentType=upstream.headers.get("content-type")||"";
  if(!contentType.startsWith("image/"))return new NextResponse(null,{status:404});
  const bytes=await upstream.arrayBuffer();
  if(bytes.byteLength>4000000)return new NextResponse(null,{status:413});
  return new NextResponse(bytes,{headers:{"Content-Type":contentType,"Cache-Control":"private, max-age=3600"}});
 }catch{return new NextResponse(null,{status:404});}
}
