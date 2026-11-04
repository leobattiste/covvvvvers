import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cover types | Admin", robots: { index: false } };

export default async function AdminTypes() {
  const { db } = await requireAdmin("/admin/types");
  const { data, error } = await db.from("cover_types").select("id, slug, title, description, sort_order").order("sort_order").limit(200);
  return <section className="panel wide"><p className="crumb"><Link href="/admin">Admin</Link></p><h1>Cover types</h1>
    <p>Existing classification vocabulary used throughout the cover archive.</p>
    {error && <p role="alert">Could not load cover types.</p>}
    <ul className="admin-list">{(data ?? []).map(t => <li key={t.id}><div className="cms-list-row"><strong>{t.title}</strong><span>{t.description || t.slug}</span></div></li>)}</ul>
  </section>;
}
