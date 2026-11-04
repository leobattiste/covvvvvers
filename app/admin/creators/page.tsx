import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { saveCreator } from "../catalog-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Creators | Admin", robots: { index: false } };

export default async function AdminCreators() {
  const { db } = await requireAdmin("/admin/creators");
  const { data, error } = await db.from("creators").select("id, slug, name, role").order("name").limit(500);
  return <section className="panel wide">
    <p className="crumb"><Link href="/admin">Admin</Link></p>
    <h1>Creators</h1><p>Manage credited designers, photographers and other creatives. Existing slugs stay stable to preserve links.</p>
    <h2>Add creator</h2>
    <form action={saveCreator} className="cms-edit-row">
      <label>Name<input name="name" maxLength={180} required placeholder="Creator name" /></label>
      <label>Role<input name="role" maxLength={120} placeholder="Designer, photographer..." /></label>
      <button className="button solid" type="submit">Add creator</button>
    </form>
    {error && <p role="alert">Could not load creators.</p>}
    <h2>Existing creators ({data?.length ?? 0})</h2>
    <div className="cms-edit-list">{(data ?? []).map(c => <form action={saveCreator} className="cms-edit-row" key={c.id}>
      <input type="hidden" name="id" value={c.id} />
      <label>Name<input name="name" defaultValue={c.name} maxLength={180} required /></label>
      <label>Role<input name="role" defaultValue={c.role ?? ""} maxLength={120} /></label>
      <button className="button" type="submit">Save</button>
    </form>)}</div>
  </section>;
}
