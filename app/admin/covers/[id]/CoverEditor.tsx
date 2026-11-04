"use client";

import Link from "next/link";
import { useState } from "react";
import { familyOf } from "@/lib/color";
import { fullImage } from "@/lib/img";
import { getBrowserClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/text";
import { saveCover, type CoverInput } from "../../actions";

type Props = {
  initial: CoverInput;
  types: { id: string; title: string }[];
  creatorNames: string[];
};

const ROLES = ["Photographer", "Art Director", "Designer", "Illustrator", "Painter", "Artist", "Creative Director", "Typographer"];

/** Draws the image into a canvas at a given size and returns a JPEG. */
async function resize(img: HTMLImageElement, max: number, square: boolean) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  if (square) {
    const side = Math.min(w, h);
    canvas.width = canvas.height = Math.min(max, side);
    canvas.getContext("2d")!.drawImage(img, (w - side) / 2, (h - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
  } else {
    const scale = Math.min(1, max / Math.max(w, h));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
  if (!blob) throw new Error("The image couldn't be processed.");
  return { blob, width: canvas.width, height: canvas.height, canvas };
}

/** The two most common colours of an image: the main colour and an accent. */
function mainColors(canvas: HTMLCanvasElement) {
  const c = document.createElement("canvas");
  c.width = c.height = 48;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(canvas, 0, 0, 48, 48);
  const d = ctx.getImageData(0, 0, 48, 48).data;
  const buckets = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < d.length; i += 4) {
    const key = `${d[i] >> 5}${d[i + 1] >> 5}${d[i + 2] >> 5}`;
    const b = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    b.n++;
    b.r += d[i];
    b.g += d[i + 1];
    b.b += d[i + 2];
    buckets.set(key, b);
  }
  const hex = (b: { n: number; r: number; g: number; b: number }) =>
    "#" + [b.r, b.g, b.b].map((v) => Math.round(v / b.n).toString(16).padStart(2, "0")).join("").toUpperCase();
  const ranked = [...buckets.values()].sort((a, b) => b.n - a.n);
  return [hex(ranked[0]), hex(ranked[1] ?? ranked[0])];
}

export default function CoverEditor({ initial, types, creatorNames }: Props) {
  const [f, setF] = useState<CoverInput>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [imageLink,setImageLink] = useState("");

  const set = <K extends keyof CoverInput>(k: K, v: CoverInput[K]) => setF((x) => ({ ...x, [k]: v }));
  const field = (k: keyof CoverInput) => ({
    value: String(f[k] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      set(k, e.target.value as never),
  });

  const upload = async (file: File) => {
    const db = getBrowserClient();
    if (!db) return;
    setUploading("Preparing the image");
    setMsg(null);
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();
      const full = await resize(img, 2000, false);
      const thumb = await resize(img, 600, true);
      const slug = slugify(f.slug || f.title);
      const bucket = db.storage.from("covers");
      setUploading("Uploading");
      const opts = { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" };
      const a = await bucket.upload(`${slug}.jpg`, full.blob, opts);
      const b = await bucket.upload(`${slug}-600.jpg`, thumb.blob, opts);
      if (a.error || b.error) throw new Error((a.error ?? b.error)!.message);
      const publicUrl = bucket.getPublicUrl(`${slug}.jpg`).data.publicUrl;
      const [main, accent] = mainColors(full.canvas);
      setF((x) => ({
        ...x,
        slug,
        // A version number makes browsers fetch the new file, not a cached old one.
        image_url: `${publicUrl}?v=${Date.now()}`,
        image_width: full.width,
        image_height: full.height,
        color: x.color || main,
        accent_color: x.accent_color || accent,
      }));
      setMsg({ ok: true, text: "Image uploaded. Save to keep it." });
    } catch (e) {
      setMsg({ ok: false, text: `Upload failed: ${(e as Error).message}` });
    } finally {
      setUploading("");
    }
  };

  const submit = async (status: "draft" | "published") => {
    setSaving(true);
    setMsg(null);
    const res = await saveCover({ ...f, status });
    setSaving(false);
    setMsg({ ok: res.ok, text: res.message });
    if (res.ok) setF((x) => ({ ...x, status, slug: res.slug ?? x.slug }));
  };


  const checks = [
    {label:"Artwork",done:Boolean(f.image_url)},
    {label:"Album details",done:Boolean(f.title.trim()&&f.artist.trim()&&f.release_year)},
    {label:"Cover type",done:Boolean(f.cover_type_id)},
    {label:"Creator credits",done:f.creators.some(person=>person.name.trim())||Boolean(f.credits_text.trim())},
    {label:"Cover story",done:Boolean(f.essay.trim())},
  ];
  const completed=checks.filter(check=>check.done).length;
  const people = f.creators;
  const setPerson = (i: number, k: "name" | "role", v: string) =>
    set(
      "creators",
      people.map((p, j) => (j === i ? { ...p, [k]: v } : p)),
    );

  return (
    <form className="editor cms-cover-editor" onSubmit={(e) => e.preventDefault()}>
      <div className="cms-editor-intro">
        <div><span className="cms-editor-kicker">COVER EDITOR</span><h2>Cover details</h2><p>Complete the artwork, album information, story, and creative credits as they will appear on the public cover page.</p></div>
        <div className="cms-editor-progress"><strong>{completed} of {checks.length}</strong><span>Editorial details completed</span><div className="cms-editor-meter" role="progressbar" aria-label="Cover completion" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={checks.length}><span style={{width:(completed/checks.length*100)+"%"}}/></div></div>
      </div>
      <div className="cms-editor-checks" aria-label="Editorial checklist">{checks.map(check=><span key={check.label} className={check.done?"is-done":""}><span aria-hidden="true">{check.done?"✓":"○"}</span> {check.label}</span>)}</div>
      <div className="editor-grid">
        <div className="editor-art">
          <div className="cms-editor-section-heading"><span>01 / ARTWORK</span><h3>Album cover</h3><p>The image and color palette used throughout the public page.</p></div>
          <div className="editor-preview" style={{ backgroundColor: f.color || "#eee" }}>
            {f.image_url ? <img src={fullImage(f.image_url, 800)} alt="" /> : <span>No cover art yet</span>}
          </div>
          <label className="button upload">
            {uploading || (f.image_url ? "Replace the image" : "Upload the cover art")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="visually-hidden"
              disabled={Boolean(uploading)}
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
          <div className="cms-image-link">
            <label htmlFor="cover-image-link">Or use an image URL</label>
            <div className="cms-image-link-row">
              <input id="cover-image-link" type="url" value={imageLink} onChange={e=>setImageLink(e.target.value)} placeholder="https://example.com/album-cover.jpg" />
              <button type="button" className="button" disabled={Boolean(uploading)} onClick={()=>{
                try {
                  const u=new URL(imageLink);
                  if(!["https:","http:"].includes(u.protocol))throw new Error("Use an HTTPS or HTTP image link.");
                  setF(x=>({...x,image_url:u.toString(),image_width:null,image_height:null}));
                  setMsg({ok:true,text:"Image link added. Save the cover to keep it. External links can stop working."});
                }catch {setMsg({ok:false,text:"Enter a valid HTTP or HTTPS image URL."});}
              }}>Use link ↗</button>
            </div>
            <p className="hint">Use a direct public image URL. Uploading a file stores a copy in Covvvers; using a link references the external image.</p>
          </div>
          <p className="hint">A square image, at least 1500px, works best. The site makes the smaller sizes for uploads.</p>
          <div className="editor-colors">
            <label>
              <span>Main colour</span>
              <span className="color-input">
                <input type="color" value={f.color || "#000000"} onChange={(e) => set("color", e.target.value.toUpperCase())} />
                <input {...field("color")} maxLength={7} />
              </span>
            </label>
            <label>
              <span>Accent colour</span>
              <span className="color-input">
                <input
                  type="color"
                  value={f.accent_color || "#000000"}
                  onChange={(e) => set("accent_color", e.target.value.toUpperCase())}
                />
                <input {...field("accent_color")} maxLength={7} />
              </span>
            </label>
          </div>
          {f.color && <p className="hint">Shows under {familyOf(f.color) ?? "no colour"} on the Colours page.</p>}
        </div>

        <div className="editor-fields stack">
          <div className="cms-editor-section-heading"><span>02 / ALBUM</span><h3>Album information</h3><p>These details appear in the cover title and sleeve information.</p></div>
          <label>
            <span>Album title</span>
            <input {...field("title")} required />
          </label>
          <label>
            <span>Artist</span>
            <input {...field("artist")} required />
          </label>
          <div className="editor-row">
            <label>
              <span>Released (year)</span>
              <input
                type="number"
                min={1970}
                max={2100}
                value={f.release_year}
                onChange={(e) => set("release_year", Number(e.target.value))}
              />
            </label>
            <label>
              <span>Country (archive metadata)</span>
              <input {...field("country")} placeholder="United States" />
            </label>
          </div>
          <div className="editor-row">
            <label>
              <span>Label</span>
              <input {...field("label")} />
            </label>
            <label>
              <span>Cover type</span>
              <select {...field("cover_type_id")}>
                <option value="">Choose a type</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>Genres / styles (archive metadata)</span>
            <input {...field("subgenres")} placeholder="East Coast hip-hop, Boom bap" />
          </label>

          <div className="cms-editor-section-heading"><span>03 / CREDITS</span><h3>Who made the cover</h3><p>Add verified people and their roles. Individual creator profiles appear on the public page.</p></div>
          <fieldset className="editor-people">
            <legend>Cover creators</legend>
            <datalist id="creator-names">
              {creatorNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
            <datalist id="creator-roles">
              {ROLES.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
            {people.map((p, i) => (
              <div className="editor-row person" key={i}>
                <input
                  list="creator-names"
                  value={p.name}
                  placeholder="Name"
                  aria-label={`Creator ${i + 1} name`}
                  onChange={(e) => setPerson(i, "name", e.target.value)}
                />
                <input
                  list="creator-roles"
                  value={p.role}
                  placeholder="Role"
                  aria-label={`Creator ${i + 1} role`}
                  onChange={(e) => setPerson(i, "role", e.target.value)}
                />
                <button
                  type="button"
                  className="text-button"
                  onClick={() => set("creators", people.filter((_, j) => j !== i))}
                  aria-label={`Remove creator ${i + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="text-button" onClick={() => set("creators", [...people, { name: "", role: "" }])}>
              Add a person
            </button>
          </fieldset>

          <label>
            <span>Credit line (fallback when individual creators are not linked)</span>
            <input {...field("credits_text")} placeholder="Photography by Danny Clinch; design by Aimée Macauley" />
          </label>
          <div className="cms-editor-section-heading"><span>04 / EDITORIAL</span><h3>The story behind the cover</h3><p>Document the design, photography, creative process and verified backstory. Separate paragraphs with a blank line.</p></div>
          <label>
            <span>Cover story</span>
            <textarea {...field("essay")} rows={16} />
          </label>
          <label>
            <span>Pull quote (not currently displayed on the public cover page)</span>
            <textarea {...field("pull_quote")} rows={2} />
          </label>
          <div className="cms-editor-section-heading"><span>05 / LINKS</span><h3>Listen to the album</h3><p>Displayed in the public Listen row. Blank fields use search links.</p></div>
          <label>
            <span>Spotify album link</span>
            <input {...field("spotify_url")} placeholder="https://open.spotify.com/album/..." />
          </label>
          <label>
            <span>Apple Music link</span>
            <input {...field("apple_music_url")} />
          </label>
          <label>
            <span>YouTube link</span>
            <input {...field("youtube_url")} />
          </label>
          <div className="cms-editor-section-heading"><span>06 / PUBLISHING</span><h3>Publication settings</h3><p>Control the cover URL and featured status.</p></div>
          <label>
            <span>Web address</span>
            <span className="slug-input">
              /covers/
              <input {...field("slug")} />
            </span>
          </label>
          <label className="check">
            <input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} />
            <span>Feature it. When any cover is featured, cover of the week picks only from featured covers.</span>
          </label>
        </div>
      </div>

      <div className="editor-bar">
        <span className={`badge ${f.status === "draft" ? "" : "live"}`}>{f.status === "draft" ? "Draft" : "Live"}</span>
        <button type="button" className="button" disabled={saving} onClick={() => submit("draft")}>
          {f.status === "draft" ? "Save draft" : "Unpublish"}
        </button>
        <button type="button" className="button solid" disabled={saving || Boolean(uploading)} onClick={() => submit("published")}>
          {saving ? "Saving" : f.status === "draft" ? "Publish" : "Save changes"}
        </button>
        {f.status === "published" && (
          <Link href={`/covers/${f.slug}`} target="_blank">
            View the live page
          </Link>
        )}
        {msg && (
          <p className={msg.ok ? "editor-ok" : "form-error"} role={msg.ok ? "status" : "alert"}>
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}
