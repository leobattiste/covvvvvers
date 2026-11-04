import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import AdminNavigation from "./AdminNavigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/admin");
  return (
    <div className="cms-shell">
      <AdminNavigation />
      <div className="cms-workspace">
        <div className="cms-toolbar">
          <span className="cms-toolbar-label">EDITORIAL WORKSPACE</span>
          <div className="cms-toolbar-actions">
            <Link href="/admin/covers/new" className="cms-top-action">+ New cover</Link>
            <Link href="/covers" className="cms-top-visit">View site ↗</Link>
          </div>
        </div>
        <main className="cms-main" id="admin-content">{children}</main>
      </div>
    </div>
  );
}
