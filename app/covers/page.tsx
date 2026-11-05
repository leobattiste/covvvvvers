import type { Metadata } from "next";
import CoverGrid from "@/components/CoverGrid";
import { getCovers, getTypes, toCard } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Covers",
  description: "Every rap album cover in the collection, newest first.",
};

export default async function CoversPage() {
  const [covers, types] = await Promise.all([getCovers(), getTypes()]);
  return (
    <>
      <header className="collection-hero"><h1>Covers</h1><p>A curated collection of rap album covers, featuring the stories, ideas, and people behind their creation.</p></header>
      <CoverGrid
        covers={covers.map((c) => toCard(c, { withText: true }))}
        filters
        types={types.filter((t) => t.count).map((t) => ({ slug: t.slug, title: t.title }))}
      />
    </>
  );
}
