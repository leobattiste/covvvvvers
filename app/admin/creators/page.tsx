import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Creators | Admin", robots: { index: false } };

export default async function AdminCreators() {
  const { db } = await requireAdmin("/admin/creators");
  const { data, error } = await db.from("creators").select("id, slug, name, role").order("name").limit(500);
  return <section className="panel wide">
    <p className="crumb"><Link href="/admin">Admin</Link></p>
    <h1>Creators</h1><p>Directory of designers, photographers and other credited creatives.</p>
    {error && <p role="alert">Could not load creators.</p>}
    <ul className="admin-list">{(data ?? []).map(c => <li key={c.id}><div className="cms-list-row"><strong>{c.name}</strong><span>{c.role || "Role not specified"}</span><span>{c.slug}</span></div></li>)}</ul>
  </section>;
}
