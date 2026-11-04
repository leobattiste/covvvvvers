import { requireAdmin } from "@/lib/admin";
import AdminNavigation from "./AdminNavigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/admin");
  return (
    <div className="cms-shell">
      <AdminNavigation />
      <div className="cms-workspace">
        <main className="cms-main" id="admin-content">{children}</main>
      </div>
    </div>
  );
}
