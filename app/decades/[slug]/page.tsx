import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CoverGrid from "@/components/CoverGrid";
import { getDecade, getDecadesWithCovers, toCard } from "@/lib/data";

export const revalidate = 3600;
type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getDecadesWithCovers()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const decade = await getDecade((await params).slug);
  return decade ? { title: `${decade.title} Album Covers`, description: `Explore rap album covers released in the ${decade.title}, including the artwork and stories behind them.` } : {};
}

export default async function DecadePage({ params }: Params) {
  const decade = await getDecade((await params).slug);
  if (!decade) notFound();
  return (
    <>
      <header className="page-head">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Covers", href: "/covers" }, { label: "Decades", href: "/decades" }, { label: decade.title }]} />
        <h1>{decade.title}</h1>
        <p className="page-count">{decade.covers.length} {decade.covers.length === 1 ? "cover" : "covers"}</p>
      </header>
      <CoverGrid covers={decade.covers.map(toCard)} emptyText="No covers from this decade yet." />
    </>
  );
}
