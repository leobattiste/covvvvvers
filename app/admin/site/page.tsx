import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { saveHomepage } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Homepage | Admin", robots: { index: false } };

export default async function HomepageSettings() {
 const { db } = await requireAdmin("/admin/site");
 const { data, error } = await db.from("site_settings").select("key,value").in("key", ["home_title", "home_description"]);
 const values = Object.fromEntries((data ?? []).map(x => [x.key, x.value]));
 return <section className="panel wide">
  <p className="crumb"><Link href="/admin">Admin</Link></p>
  <h1>Homepage</h1><p>Edit the homepage headline and supporting description. Leave the description empty to use the automatic cover count and date range.</p>
  {error ? <p role="alert">Unable to load homepage settings. Changes are disabled.</p> :
  <form action={saveHomepage} className="stack" style={{ maxWidth: 720, marginTop: 24 }}>
    <label>Headline<input name="home_title" defaultValue={values.home_title ?? "Every rap album cover has a story."} maxLength={120} required /></label>
    <label>Supporting description<textarea name="home_description" defaultValue={values.home_description ?? ""} maxLength={300} rows={4} placeholder="Automatic cover count and year range" /></label>
    <button className="button solid" type="submit">Save homepage</button>
  </form>}
 </section>;
}
