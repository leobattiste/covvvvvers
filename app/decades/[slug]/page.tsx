import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CoverGrid from "@/components/CoverGrid";
import DecadeEssay from "@/components/DecadeEssay";
import { decadeEssays } from "@/lib/decade-essays";
import { DECADES, getDecade, getDecadesWithCovers, toCard } from "@/lib/data";

export const revalidate = 3600;
type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return DECADES.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = (await params).slug;
  if (!DECADES.some((d) => d === slug)) return {};
  const intro = decadeEssays[slug]?.[0] ?? "";
  return {
    title: `Rap in the ${slug} | Album Covers`,
    description: intro.slice(0, 155),
    alternates: { canonical: `/decades/${slug}` },
  };
}

export default async function DecadePage({ params }: Params) {
  const decade = await getDecade((await params).slug);
  if (!decade) notFound();
  // Previous and next skip decades that have no covers yet.
  const filled = (await getDecadesWithCovers(0)).filter((d) => d.count > 0 || d.slug === decade.slug).map((d) => d.slug as string);
  const position = filled.indexOf(decade.slug);
  const newer = position > 0 ? filled[position - 1] : null;
  const older = position >= 0 && position < filled.length - 1 ? filled[position + 1] : null;
  return (
    <div className="decade-detail">
      <header className="page-head decade-detail-head">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Covers", href: "/covers" }, { label: "Decades", href: "/decades" }, { label: decade.title }]} />
        <h1>{decade.title}</h1>
        <DecadeEssay decade={decade.title} paragraphs={decadeEssays[decade.slug] ?? []} />
      </header>
      <section className="decade-detail-collection" aria-label={`Album covers from the ${decade.title}`}>
        <CoverGrid covers={decade.covers.map((cover) => toCard(cover))} emptyText="No album covers from this decade have been added yet." />
      </section>
      <nav className="decade-detail-nav" aria-label="Browse other decades">
        {older ? <Link href={`/decades/${older}`}><span>Previous decade</span><strong>← {older}</strong></Link> : <span />}
        {newer ? <Link href={`/decades/${newer}`}><span>Next decade</span><strong>{newer} →</strong></Link> : <span />}
      </nav>
    </div>
  );
}
