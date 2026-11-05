"use client";

import { useRef } from "react";

export default function DecadeEssay({ decade, paragraphs }: { decade: string; paragraphs: string[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  if (!paragraphs.length) return null;
  return (
    <div className="decade-essay">
      <p>{paragraphs[0]}</p>
      {paragraphs.length > 1 && (
        <>
          <button type="button" className="button decade-read-more" onClick={() => dialog.current?.showModal()}>
            Read more <span aria-hidden="true">↗</span>
          </button>
          <dialog ref={dialog} className="decade-essay-dialog" aria-labelledby="decade-essay-title" onClick={(event) => {
            if (event.target === dialog.current) dialog.current?.close();
          }}>
            <div className="decade-dialog-top">
              <h2 id="decade-essay-title">Rap in the {decade}</h2>
              <button type="button" className="decade-dialog-close" onClick={() => dialog.current?.close()} aria-label="Close essay">×</button>
            </div>
            <div className="decade-dialog-copy">
              {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </dialog>
        </>
      )}
    </div>
  );
}
