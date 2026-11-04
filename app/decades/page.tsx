import type { Metadata } from "next";
import Link from "next/link";
import { getDecadesWithCovers } from "@/lib/data";
import { squareImage } from "@/lib/img";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Decades",
  description: "Explore rap album cover artwork by decade, from the earliest releases to today.",
};

export default async function DecadesPage() {
  const decades = await getDecadesWithCovers();
  return (
    <ul className="collection-list">
      {decades.map((decade) => (
        <li key={decade.slug}>
          <Link href={`/decades/${decade.slug}`} className="collection-card">
            <span className="collection-stack" aria-hidden="true">
              {decade.covers.map((cover, i) => (
                <img key={cover.id} src={squareImage(cover.image_url, 360)} alt="" width={180} height={180} loading="lazy"
                  style={{ "--i": i, backgroundColor: cover.color ?? undefined } as React.CSSProperties} />
              ))}
              {Array.from({ length: Math.max(0, 4 - decade.covers.length) }, (_, k) => (
                <span key={`empty-${k}`} className="stack-empty" style={{ "--i": decade.covers.length + k } as React.CSSProperties} />
              ))}
            </span>
            <span className="collection-text">
              <span className="collection-title">{decade.title}</span>
              <span className="collection-count">{decade.count} {decade.count === 1 ? "cover" : "covers"}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
