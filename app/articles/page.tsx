import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY,SUPABASE_URL,supabaseEnabled } from "@/lib/supabase/config";
export const revalidate = 300;
export const metadata = {title:"Articles",description:"Stories, interviews and essays about the art and people behind rap album covers."};
export default async function Articles() {
 const db=supabaseEnabled?createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:false}}):null;
 const {data, error}=db?await db.from("articles").select("id,slug,title,excerpt,category,author,cover_image,published_at").eq("status","published").order("published_at",{ascending:false}).limit(100):{data:[],error:null};
 return <section className="panel wide"><h1>Articles</h1><p>Stories, interviews and ideas behind rap album covers.</p>
 {error && <p>Articles are temporarily unavailable.</p>}
 {!error && !data?.length && <p>Our first articles are coming soon.</p>}
 <ul className="admin-list">{(data??[]).map(a=><li key={a.id}><Link href={`/articles/${a.slug}`}>
 {a.cover_image && <img src={a.cover_image} alt="" width={72} height={72} loading="lazy"/>}
 <span className="admin-list-text"><strong>{a.title}</strong><span>{a.category} · {a.author}</span><span>{a.excerpt}</span></span>
 </Link></li>)}</ul></section>;
}
