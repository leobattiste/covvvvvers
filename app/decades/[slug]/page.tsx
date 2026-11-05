import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CoverGrid from "@/components/CoverGrid";
import DecadeEssay from "@/components/DecadeEssay";
import { decadeEssays } from "@/lib/decade-essays";
import { DECADES, getDecade, toCard } from "@/lib/data";

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
  const position = DECADES.indexOf(decade.slug as typeof DECADES[number]);
  const newer = position > 0 ? DECADES[position - 1] : null;
  const older = position < DECADES.length - 1 ? DECADES[position + 1] : null;
  const count = decade.covers.length;
  return (
    <main className="decade-detail">
      <header className="page-head decade-detail-head">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Decades", href: "/decades" }, { label: decade.title }]} />
        <div className="decade-detail-eyebrow">HIP-HOP THROUGH THE DECADES</div>
        <h1>{decade.title}</h1>
        <DecadeEssay decade={decade.title} paragraphs={decadeEssays[decade.slug] ?? []} />
      </header>
      <section className="decade-detail-collection" aria-labelledby="decade-covers-heading">
        <div className="decade-detail-collection-heading">
          <h2 id="decade-covers-heading">Album covers</h2>
          <span>{count} {count === 1 ? "cover" : "covers"}</span>
        </div>
        <CoverGrid covers={decade.covers.map((cover) => toCard(cover))} emptyText="No album covers from this decade have been added yet." />
      </section>
      <nav className="decade-detail-nav" aria-label="Browse other decades">
        {older ? <Link href={`/decades/${older}`}><span>Previous decade</span><strong>← {older}</strong></Link> : <span />}
        {newer ? <Link href={`/decades/${newer}`}><span>Next decade</span><strong>{newer} →</strong></Link> : <span />}
      </nav>
    </main>
  );
}
