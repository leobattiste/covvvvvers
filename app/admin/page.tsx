import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import FetchArt from "./FetchArt";
import MoveImages from "./MoveImages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminHome() {
  const { db } = await requireAdmin("/admin");
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [published, drafts, pending, feedback, subscribers, coversOnWix, typesOnWix, noImage] = await Promise.all([
    count(db.from("covers").select("id", { count: "exact", head: true }).eq("status", "published")),
    count(db.from("covers").select("id", { count: "exact", head: true }).eq("status", "draft")),
    count(db.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending")),
    count(db.from("feedback").select("id", { count: "exact", head: true }).eq("status", "new")),
    count(db.from("subscribers").select("id", { count: "exact", head: true }).is("unsubscribed_at", null)),
    count(db.from("covers").select("id", { count: "exact", head: true }).like("image_url", "%static.wixstatic.com%")),
    count(db.from("cover_types").select("id", { count: "exact", head: true }).like("hero_image", "%static.wixstatic.com%")),
    count(db.from("covers").select("id", { count: "exact", head: true }).is("image_url", null)),
  ]);

  const [{ data: recentCovers }, { data: recentActivity }, lowRes] = await Promise.all([
    db.from("covers").select("id,title,artist,status,updated_at,image_url").order("updated_at", { ascending: false }).limit(6),
    db.from("admin_audit_log").select("id,action,entity_table,created_at").order("created_at", { ascending: false }).limit(5),
    count(db.from("covers").select("id", { count: "exact", head: true }).lt("image_width", 1200)),
  ]);

  const stats = [
    { label: "Published covers", value: published, href: "/admin/covers", detail: "Live in the collection" },
    { label: "Draft covers", value: drafts, href: "/admin/covers", detail: "Still in progress" },
    { label: "Submissions", value: pending, href: "/admin/submissions", detail: "Awaiting review" },
    { label: "New feedback", value: feedback, href: "/admin/feedback", detail: "Unread messages" },
  ];
  const shortcuts = [
    { label: "Manage covers", href: "/admin/covers", detail: "Edit the archive" },
    { label: "Artwork library", href: "/admin/media", detail: `${noImage} missing · ${lowRes} low resolution` },
    { label: "Creators", href: "/admin/creators", detail: "Credits and attribution" },
    { label: "Cover types", href: "/admin/types", detail: "Collection taxonomy" },
    { label: "Newsletter", href: "/admin/newsletter", detail: `${subscribers} subscribers` },
    { label: "Members", href: "/admin/members", detail: "Community accounts" },
  ];

  return (
    <div className="cms-overview">
      <header className="cms-overview-head">
        <div>
          <span className="cms-eyebrow">OVERVIEW / COVVVERS</span>
          <h1>Overview</h1>
          <p>Your collection at a glance. Keep the archive accurate, complete, and ready to explore.</p>
        </div>
        <Link href="/admin/covers" className="button solid">Manage covers ↗</Link>
      </header>
      <section aria-label="Archive statistics" className="cms-stats">
        {stats.map(stat=><Link href={stat.href} className="cms-stat" key={stat.label}>
          <span className="cms-stat-label">{stat.label}</span>
          <strong className="cms-stat-value">{stat.value.toLocaleString("en-US")}</strong>
          <span className="cms-stat-detail">{stat.detail} <span aria-hidden="true">↗</span></span>
        </Link>)}
      </section>
      <div className="cms-overview-columns">
        <section className="cms-section">
          <div className="cms-section-heading"><div><span className="cms-eyebrow">COLLECTION</span><h2>Recently edited</h2></div><Link href="/admin/covers">All covers ↗</Link></div>
          <ul className="cms-recent-list">
            {(recentCovers??[]).map(cover=><li key={cover.id}>
              <Link href={`/admin/covers/${cover.id}`}>
                <span className="cms-cover-thumb">{cover.image_url?<img src={cover.image_url} alt="" loading="lazy"/>:<span aria-hidden="true">♪</span>}</span>
                <span className="cms-recent-title"><strong>{cover.title}</strong><small>{cover.artist}</small></span>
                <span className={cover.status==="published"?"cms-status is-published":"cms-status"}>{cover.status==="published"?"Published":"Draft"}</span>
                <time dateTime={cover.updated_at??undefined}>{cover.updated_at?new Date(cover.updated_at).toLocaleDateString("en-US",{month:"short",day:"numeric"}):"—"}</time>
              </Link>
            </li>)}
            {!recentCovers?.length&&<li className="cms-empty">No covers have been edited yet.</li>}
          </ul>
        </section>
        <div className="cms-overview-side">
          <section className="cms-section">
            <div className="cms-section-heading"><div><span className="cms-eyebrow">WORKSPACE</span><h2>Quick access</h2></div></div>
            <div className="cms-shortcuts">{shortcuts.map(item=><Link key={item.href} href={item.href}><span><strong>{item.label}</strong><small>{item.detail}</small></span><span aria-hidden="true">↗</span></Link>)}</div>
          </section>
          <section className="cms-section">
            <div className="cms-section-heading"><div><span className="cms-eyebrow">AUDIT LOG</span><h2>Latest activity</h2></div><Link href="/admin/activity">View all ↗</Link></div>
            <ul className="cms-activity-list">{(recentActivity??[]).map(event=><li key={event.id}><span><strong>{event.action.toLowerCase()}</strong> · {event.entity_table.replaceAll("_"," ")}</span><time dateTime={event.created_at}>{new Date(event.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</time></li>)}{!recentActivity?.length&&<li>No activity recorded yet.</li>}</ul>
          </section>
        </div>
      </div>
      {(coversOnWix+typesOnWix>0||noImage>0)&&<section className="cms-section cms-maintenance">
        <div className="cms-section-heading"><div><span className="cms-eyebrow">MAINTENANCE</span><h2>Artwork health</h2></div><Link href="/admin/media">Open artwork library ↗</Link></div>
        {coversOnWix+typesOnWix>0&&<div className="cms-maintenance-row"><MoveImages remaining={coversOnWix+typesOnWix}/></div>}
        {noImage>0&&<div className="cms-maintenance-row"><FetchArt remaining={noImage}/></div>}
      </section>}
    </div>
  );
}
