import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import AutoImport from "./AutoImport";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Auto Import | Admin",robots:{index:false}};
export default async function AutoImportPage(){
 await requireAdmin("/admin/auto-import");
 return <div className="cms-overview"><header className="cms-overview-head"><div><span className="cms-eyebrow">COLLECTION / AUTOMATION</span><h1>Auto Import</h1><p>Find rap albums and create private drafts in a few clicks. Review the artwork and story before publishing.</p></div><Link href="/admin/covers" className="button">Manage covers ↗</Link></header><AutoImport/></div>;
}
