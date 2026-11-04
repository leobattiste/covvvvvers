import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ArticleActions from "@/components/ArticleActions";
import { SUPABASE_ANON_KEY,SUPABASE_URL,supabaseEnabled } from "@/lib/supabase/config";
export const revalidate=300;
type Props={params:Promise<{slug:string}>};
async function article(slug:string){
 if(!supabaseEnabled)return null;
 const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:false}});
 const {data}=await db.from("articles").select("*").eq("slug",slug).eq("status","published").maybeSingle();
 return data;
}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const a=await article((await params).slug);
 return a?{title:a.title,description:a.excerpt,alternates:{canonical:`/articles/${a.slug}`},openGraph:{images:a.cover_image?[a.cover_image]:[]}}:{title:"Article"};
}
export default async function ArticlePage({params}:Props){
 const a=await article((await params).slug);if(!a)notFound();
 return <article className="panel wide" style={{maxWidth:850,marginInline:"auto"}}>
 <p className="crumb"><Link href="/articles">Articles</Link> / {a.category}</p>
 <h1>{a.title}</h1><p>{a.excerpt}</p>
 <p>{a.author}{a.published_at?" · "+new Date(a.published_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):""}</p>
 {a.cover_image&&<img src={a.cover_image} alt="" style={{width:"100%",height:"auto",marginBlock:24}}/>}
 <ArticleActions id={a.id} slug={a.slug} title={a.title}/>
 <div className="essay">{a.body.split(/\n\s*\n/).filter(Boolean).map((p:string,i:number)=><p key={i} style={{whiteSpace:"pre-wrap"}}>{p}</p>)}</div>
 <p><Link href="/articles">All articles</Link></p>
 </article>;
}
