import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { squareImage } from "@/lib/img";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Artwork | Admin", robots: { index: false } };

export default async function AdminArtwork({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
 const { db } = await requireAdmin("/admin/media");
 const { filter = "all" } = await searchParams;
 const { data, error } = await db.from("covers")
  .select("id,title,artist,image_url,image_width,image_height,status")
  .order("created_at", { ascending: false }).limit(1000);
 const all = data ?? [];
 const missing = (c: typeof all[number]) => !c.image_url;
 const external = (c: typeof all[number]) => Boolean(c.image_url && !c.image_url.includes("/storage/v1/object/public/covers/"));
 const small = (c: typeof all[number]) => Boolean(c.image_width && c.image_height && Math.min(c.image_width,c.image_height) < 1200);
 const items = all.filter(c => filter === "missing" ? missing(c) : filter === "external" ? external(c) : filter === "small" ? small(c) : true);
 return <section className="panel wide">
  <p className="crumb"><Link href="/admin">Admin</Link></p><h1>Artwork library</h1>
  <p>Review album artwork, find missing images and replace files through each cover's editor. Files are managed through the existing Supabase upload workflow.</p>
  <nav className="intro-actions" aria-label="Artwork filters">
   <Link href="/admin/media">All ({all.length})</Link>
   <Link href="/admin/media?filter=missing">Missing ({all.filter(missing).length})</Link>
   <Link href="/admin/media?filter=external">External ({all.filter(external).length})</Link>
   <Link href="/admin/media?filter=small">Under 1200px ({all.filter(small).length})</Link>
  </nav>
  {error && <p role="alert">Unable to load artwork records.</p>}
  <ul className="admin-list">{items.map(c => <li key={c.id}>
   <Link href={`/admin/covers/${c.id}`}>
    {c.image_url ? <img src={squareImage(c.image_url,120)} alt="" width={48} height={48} loading="lazy" /> : <span className="admin-noimg" />}
    <span className="admin-list-text"><strong>{c.title}</strong><span>{c.artist} · {c.image_width && c.image_height ? `${c.image_width} × ${c.image_height}` : "Dimensions unknown"}</span></span>
    <span className="badge">{missing(c) ? "Missing" : external(c) ? "External" : small(c) ? "Small" : c.status === "draft" ? "Draft" : "Stored"}</span>
   </Link>
  </li>)}</ul>
  {!error && items.length === 0 && <p>No artwork matches this filter.</p>}
 </section>;
}
