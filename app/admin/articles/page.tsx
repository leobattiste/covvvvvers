import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createArticle } from "./actions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Articles | Admin", robots: { index: false } };
export default async function AdminArticles() {
 const { db } = await requireAdmin("/admin/articles");
 const { data, error } = await db.from("articles").select("id,title,category,status,updated_at").order("updated_at",{ascending:false}).limit(200);
 return <section className="panel wide"><p className="crumb"><Link href="/admin">Admin</Link></p><h1>Articles</h1>
 <p>Publish stories, interviews, essays and news.</p>
 <form action={createArticle} className="admin-new"><input name="title" placeholder="New article title" required maxLength={180}/><button className="button solid">Create draft</button></form>
 {error && <p role="alert">Could not load articles.</p>}
 <ul className="admin-list">{(data??[]).map(a=><li key={a.id}><Link href={`/admin/articles/${a.id}`}><span className="admin-list-text"><strong>{a.title}</strong><span>{a.category} · {a.status}</span></span></Link></li>)}</ul>
 </section>;
}
