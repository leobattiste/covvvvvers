import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Newsletter | Admin", robots: { index: false } };

export default async function AdminNewsletter() {
  const { db } = await requireAdmin("/admin/newsletter");
  const { count, error } = await db.from("subscribers").select("id", { head: true, count: "exact" }).is("unsubscribed_at", null);
  return <section className="panel wide"><p className="crumb"><Link href="/admin">Admin</Link></p><h1>Newsletter</h1>
    <p>Active subscribers</p><h2>{error ? "Unavailable" : (count ?? 0).toLocaleString()}</h2>
    <p>Email addresses are deliberately hidden from this overview. Sending campaigns and editing Resend templates require a separate, audited workflow.</p>
  </section>;
}
