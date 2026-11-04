import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { saveArticle } from "../actions";
export const dynamic = "force-dynamic";
export default async function EditArticle({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{saved?:string}>}) {
 const {id}=await params;
 const {db}=await requireAdmin("/admin/articles/"+id);
 const {data:a}=await db.from("articles").select("*").eq("id",id).maybeSingle();
 if(!a) notFound();
 const {saved}=await searchParams;
 return <section className="panel wide"><p className="crumb"><Link href="/admin/articles">Articles</Link></p><h1>Edit article</h1>
 {saved==="1" && <p role="status">Article saved.</p>}
 <form action={saveArticle} className="stack" style={{maxWidth:850}}>
 <input type="hidden" name="id" value={a.id}/>
 <label>Title<input name="title" defaultValue={a.title} maxLength={180} required/></label>
 <label>Category<select name="category" defaultValue={a.category}>{["Story","Interview","Essay","News"].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Byline<input name="author" defaultValue={a.author} maxLength={120}/></label>
 <label>Excerpt<textarea name="excerpt" defaultValue={a.excerpt} maxLength={400} rows={3}/></label>
 <label>Cover image URL<input name="cover_image" type="url" defaultValue={a.cover_image??""} placeholder="https://..." /></label>
 <label>Article body (plain text, separate paragraphs with blank lines)<textarea name="body" defaultValue={a.body} rows={22} maxLength={100000}/></label>
 <label>Status<select name="status" defaultValue={a.status}><option value="draft">Draft</option><option value="published">Published</option></select></label>
 <button className="button solid" type="submit">Save article</button>
 {a.status==="published" && <Link href={`/articles/${a.slug}`}>View article</Link>}
 </form></section>;
}
