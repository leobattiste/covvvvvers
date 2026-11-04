import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Members | Admin", robots: { index: false } };

export default async function AdminMembers() {
  const { db } = await requireAdmin("/admin/members");
  const { data, error } = await db.from("profiles").select("id, display_name, username, is_admin, created_at").order("created_at", { ascending: false }).limit(200);
  return <section className="panel wide"><p className="crumb"><Link href="/admin">Admin</Link></p><h1>Members</h1>
    <p>Read-only member directory. Administrative permissions cannot be changed from this screen.</p>
    {error && <p role="alert">Could not load members.</p>}
    <ul className="admin-list">{(data ?? []).map(m => <li key={m.id}><div className="cms-list-row"><strong>{m.display_name || m.username || "Member"}</strong><span>{m.is_admin ? "Administrator" : "Member"}</span><span>{new Date(m.created_at).toLocaleDateString("en-US")}</span></div></li>)}</ul>
  </section>;
}
