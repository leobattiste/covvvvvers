"use client";

import { useState } from "react";

/** Share the cover page. */
export default function ShareActions({ title, artist, slug }: { title: string; artist: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    const data = { title: `${title} by ${artist}`, text: `The story behind the cover of ${title}`, url };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // Closed the share sheet; nothing to do.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="share-actions">
      <button type="button" className="share-icon-button" onClick={share} aria-label={copied ? "Link copied" : "Share cover"} title={copied ? "Link copied" : "Share cover"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 16V3m0 0L7 8m5-5 5 5" />
          <path d="M5 13v7h14v-7" />
        </svg>
      </button>
      <span className="visually-hidden" role="status">{copied ? "Link copied" : ""}</span>
    </div>
  );
}
