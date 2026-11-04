import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { saveCoverType, createCoverType, deleteCoverType } from "../catalog-actions";
import DeleteTypeButton from "./DeleteTypeButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cover types | Admin", robots: { index: false } };

export default async function AdminTypes() {
  const { db } = await requireAdmin("/admin/types");
  const { data, error } = await db.from("cover_types").select("id, slug, title, description, sort_order").order("sort_order").limit(200);
  return <section className="panel wide">
    <p className="crumb"><Link href="/admin">Admin</Link></p><h1>Cover types</h1>
    <p>Edit archive classifications and their display order. Slugs remain unchanged to preserve URLs.</p>
    <form action={createCoverType} className="cms-type-create">
      <h2>＋ Add cover type</h2>
      <label>Type name<input name="title" placeholder="e.g. Collage" maxLength={120} required /></label>
      <label>Description (optional)<input name="description" maxLength={1200} placeholder="What defines this cover style?" /></label>
      <button className="button solid" type="submit">＋ Add type</button>
    </form>
    {error && <p role="alert">Could not load cover types.</p>}
    <div className="cms-edit-list">{(data ?? []).map(t => <form action={saveCoverType} className="cms-edit-row" key={t.id}>
      <input type="hidden" name="id" value={t.id} />
      <label>Title<input name="title" defaultValue={t.title} maxLength={120} required /></label>
      <label>Description<textarea name="description" defaultValue={t.description ?? ""} maxLength={1200} rows={2} /></label>
      <label>Order<input name="sort_order" type="number" min={0} max={10000} defaultValue={t.sort_order ?? 0} required /></label>
      <button className="button" type="submit">✓ Save</button>
    </form>)}
    </div>
    <div className="cms-type-deletions">{(data ?? []).map(t=><form action={deleteCoverType} key={t.id}>
      <input type="hidden" name="id" value={t.id} />
      <span>{t.title}</span>
      <DeleteTypeButton title={t.title} />
    </form>)}</div>
  </section>;
}
