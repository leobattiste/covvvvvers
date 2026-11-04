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
 const [{count:members},{count:newMembers},{data:signups},{count:publishedCovers},{count:pendingSubmissions}] = await Promise.all([
   db.from("profiles").select("id",{count:"exact",head:true}),
   db.from("profiles").select("id",{count:"exact",head:true}).gte("created_at",new Date(Date.now()-30*86400000).toISOString()),
   db.from("profiles").select("id,display_name,username,created_at").order("created_at",{ascending:false}).limit(15),
   db.from("covers").select("id",{count:"exact",head:true}).eq("status","published"),
   db.from("submissions").select("id",{count:"exact",head:true}).eq("status","pending")
 ]);
 return <section className="panel wide">
   <p className="crumb"><Link href="/admin">Admin</Link></p>
   <h1>Activity log</h1>
   <p>Editorial changes, member signups, and website analytics in one workspace. Historical events are available only from when their tracking began.</p>
   <div className="cms-activity-stats">
     <div><span>Members</span><strong>{members??0}</strong></div>
     <div><span>New members · 30 days</span><strong>{newMembers??0}</strong></div>
     <div><span>Published covers</span><strong>{publishedCovers??0}</strong></div>
     <div><span>Pending submissions</span><strong>{pendingSubmissions??0}</strong></div>
   </div>
   <section className="cms-traffic-panel">
     <div><h2>◉ Website traffic</h2><p>Covvvers already records page views and visitors through Vercel Web Analytics. Open the traffic dashboard for visitor trends, top pages and sources.</p></div>
     <a className="button solid" href="https://vercel.com/leobaptistea-gmailcoms-projects/covvvvvers/analytics" target="_blank" rel="noopener noreferrer">View traffic ↗</a>
   </section>
   <section className="cms-activity-signups"><h2>◉ Recent member signups</h2>
     <ul className="admin-list">{(signups??[]).map(member=><li key={member.id}><div className="cms-list-row"><strong>{member.display_name||member.username||"Member"}</strong><span>Joined</span><time dateTime={member.created_at}>{new Date(member.created_at).toLocaleString("en-US")}</time></div></li>)}</ul>
   </section>
   <h2>◉ Editorial activity</h2>
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
