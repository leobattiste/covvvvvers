import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Activity | Admin", robots: { index: false } };

type Audit = {
 id: number;
 created_at: string;
 actor_id: string | null;
 entity_table: string;
 entity_id: string | null;
 action: "INSERT" | "UPDATE" | "DELETE";
 before_data: { title?: string; name?: string; status?: string } | null;
 after_data: { title?: string; name?: string; status?: string } | null;
};
export default async function AdminActivity() {
 const { db } = await requireAdmin("/admin/activity");
 const { data, error } = await db.from("admin_audit_log")
   .select("id, created_at, actor_id, entity_table, entity_id, action, before_data, after_data")
   .order("created_at", { ascending: false }).limit(100);
 const events = (data ?? []) as Audit[];
 return <section className="panel wide">
   <p className="crumb"><Link href="/admin">Admin</Link></p>
   <h1>Activity log</h1>
   <p>Recent changes to covers, creators and cover types. This is a read-only history; older changes made before logging was enabled are not included.</p>
   {error && <p role="alert">Unable to load activity history.</p>}
   {!error && !events.length && <p>No recorded changes yet.</p>}
   <ul className="admin-list">{events.map(e => {
     const item = e.after_data ?? e.before_data;
     const label = item?.title ?? item?.name ?? e.entity_id ?? "Record";
     const changedStatus = e.before_data?.status !== e.after_data?.status;
     return <li key={e.id}><div className="cms-list-row">
       <strong>{e.action === "INSERT" ? "Created" : e.action === "DELETE" ? "Deleted" : "Updated"} {e.entity_table.replaceAll("_", " ")}</strong>
       <span>{label}</span>
       {e.action === "UPDATE" && changedStatus && <span>{e.before_data?.status ?? "—"} → {e.after_data?.status ?? "—"}</span>}
       <time dateTime={e.created_at}>{new Date(e.created_at).toLocaleString("en-US")}</time>
       <span title={e.actor_id ?? "No authenticated user ID"}>{e.actor_id ? "Authenticated user" : "System or unknown"}</span>
     </div></li>;
   })}</ul>
 </section>;
}
