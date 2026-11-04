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
    db.from("covers").select("id,title,artist,status,updated_at").order("updated_at", { ascending: false }).limit(6),
    db.from("admin_audit_log").select("id,action,entity_table,created_at").order("created_at", { ascending: false }).limit(5),
    count(db.from("covers").select("id", { count: "exact", head: true }).lt("image_width", 1200)),
  ]);

  const tiles = [
    { href: "/admin/media", label: "Artwork", note: `${noImage} missing images, ${lowRes} under 1200px` },
    { href: "/admin/covers", label: "Covers", note: `${published} live${drafts ? `, ${drafts} drafts` : ""}` },
    { href: "/admin/submissions", label: "Submissions", note: pending ? `${pending} waiting for review` : "Nothing waiting" },
    { href: "/admin/feedback", label: "Feedback", note: feedback ? `${feedback} new` : "Nothing new" },
    { href: "/admin/creators", label: "Creators", note: "Credit directory" },
    { href: "/admin/types", label: "Cover types", note: "Archive taxonomy" },
    { href: "/admin/members", label: "Members", note: "Protected member directory" },
    { href: "/admin/newsletter", label: "Newsletter", note: `${subscribers} active subscribers` },
  ];

  return (
    <section className="panel wide">
      <h1>Admin</h1>
      <p>{subscribers} people get the weekly email.</p>
      <ul className="admin-tiles">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link href={t.href}>
              <span className="admin-tile-label">{t.label}</span>
              <span className="admin-tile-note">{t.note}</span>
            </Link>
          </li>
        ))}
      </ul>
      <section className="review-group">
        <h2>Recently edited covers</h2>
        <ul className="admin-list">
          {(recentCovers ?? []).map((cover) => <li key={cover.id}>
            <Link href={`/admin/covers/${cover.id}`}>
              <span className="admin-list-text"><strong>{cover.title}</strong><span>{cover.artist} · {cover.status === "draft" ? "Draft" : "Published"}</span></span>
              <time dateTime={cover.updated_at ?? undefined}>{cover.updated_at ? new Date(cover.updated_at).toLocaleDateString("en-US") : "No edit date"}</time>
            </Link>
          </li>)}
        </ul>
      </section>
      <section className="review-group">
        <h2>Latest activity</h2>
        <ul className="admin-list">{(recentActivity ?? []).map((event) => <li key={event.id}>
          <Link href="/admin/activity"><span>{event.action.toLowerCase()} · {event.entity_table.replaceAll("_", " ")}</span>
          <time dateTime={event.created_at}>{new Date(event.created_at).toLocaleDateString("en-US")}</time></Link>
        </li>)}</ul>
      </section>
      {coversOnWix + typesOnWix > 0 && (
        <section className="review-group">
          <h2>Cover images</h2>
          <MoveImages remaining={coversOnWix + typesOnWix} />
        </section>
      )}
      {noImage > 0 && (
        <section className="review-group">
          <h2>New covers</h2>
          <FetchArt remaining={noImage} />
        </section>
      )}
    </section>
  );
}
