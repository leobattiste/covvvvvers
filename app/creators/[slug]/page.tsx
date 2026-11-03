import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import CoverGrid from "@/components/CoverGrid";
import { getCovers, getCreator, toCard } from "@/lib/data";

export const revalidate = 3600;
type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const covers = await getCovers();
  return [...new Set(covers.flatMap((cover) => cover.creators.map((c) => c.slug)))].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await getCreator((await params).slug);
  return found ? { title: found.creator.name, description: `Explore rap album covers credited to ${found.creator.name}.` } : {};
}

export default async function CreatorPage({ params }: Params) {
  const found = await getCreator((await params).slug);
  if (!found) notFound();
  const { creator, covers } = found;
  return (
    <>
      <header className="page-head">
        <p><Link href="/covers">Covers</Link> / Creators</p>
        <h1>{creator.name}</h1>
        {creator.role && <p>{creator.role}</p>}
        <p className="page-count">{covers.length} {covers.length === 1 ? "cover" : "covers"}</p>
      </header>
      <CoverGrid covers={covers.map((cover) => toCard(cover))} emptyText="No covers credited yet." />
    </>
  );
}
