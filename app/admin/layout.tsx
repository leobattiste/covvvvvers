import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const groups = [
  { label: "Workspace", links: [["Overview", "/admin"], ["Activity", "/admin/activity"], ["Articles", "/admin/articles"], ["Covers", "/admin/covers"], ["Artwork", "/admin/media"], ["Creators", "/admin/creators"], ["Cover types", "/admin/types"]] },
  { label: "Website", links: [["Homepage", "/admin/site"]] },
  { label: "Community", links: [["Submissions", "/admin/submissions"], ["Feedback", "/admin/feedback"], ["Members", "/admin/members"], ["Newsletter", "/admin/newsletter"]] },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/admin");
  return (
    <div className="cms-shell">
      <aside className="cms-sidebar" aria-label="Admin navigation">
        <Link href="/admin" className="cms-brand">Covvvvvers <span>CMS</span></Link>
        {groups.map((group) => (
          <nav key={group.label} aria-label={group.label}>
            <h2>{group.label}</h2>
            {group.links.map(([title, href]) => <Link key={href} href={href}>{title}</Link>)}
          </nav>
        ))}
        <Link href="/covers" className="cms-return">View website ↗</Link>
      </aside>
      <main className="cms-main" id="admin-content">{children}</main>
    </div>
  );
}
