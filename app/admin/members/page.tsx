import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import MemberControls from "./MemberControls";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Members | Admin", robots: { index: false } };

export default async function AdminMembers({searchParams}:{searchParams:Promise<{updated?:string}>}) {
 const { db }=await requireAdmin("/admin/members");
 const [{data,error},{data:moderation}] = await Promise.all([
  db.from("profiles").select("id,display_name,username,is_admin,created_at").order("created_at",{ascending:false}).limit(200),
  db.from("member_moderation").select("user_id,status,reason,updated_at")
 ]);
 const statuses=new Map((moderation??[]).map(m=>[m.user_id,m]));
 const {updated}=await searchParams;
 const moderationReady=Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY&&process.env.RESEND_API_KEY&&process.env.RESEND_FROM_EMAIL);
 return <section className="panel wide">
  <p className="crumb"><Link href="/admin">Admin</Link></p>
  <h1>Members</h1>
  <p>Manage member access. Suspensions last 7 days, bans block future sign-ins, and each action sends an email with the reason. Existing sessions may remain active until their access token expires.</p>
  {updated&&<p className="editor-ok" role="status">✓ Member status updated to {updated}. Notification email accepted for delivery.</p>}
  {!moderationReady&&<p role="alert" className="cms-config-warning">Member moderation requires Resend email credentials in Vercel: RESEND_API_KEY and RESEND_FROM_EMAIL. The service role key must also be configured. Actions are unavailable until configured.</p>}
  {error&&<p role="alert">Could not load members.</p>}
  <ul className="admin-list cms-member-list">{(data??[]).map(m=>{
   const state=statuses.get(m.id)?.status??"active";
   return <li key={m.id} className="cms-member-row">
    <div className="cms-member-info">
     <strong>{m.display_name||m.username||"Member"}</strong>
     <span className={m.is_admin?"cms-member-state is-admin":state==="active"?"cms-member-state is-active":"cms-member-state is-blocked"}>{m.is_admin?"◆ Administrator":state==="active"?"● Active":state==="suspended"?"◷ Suspended":"⊘ Banned"}</span>
     <small>Joined {new Date(m.created_at).toLocaleDateString("en-US")}</small>
    </div>
    {!m.is_admin&&moderationReady&&<MemberControls id={m.id} status={state}/>}
   </li>;
  })}</ul>
 </section>;
}
