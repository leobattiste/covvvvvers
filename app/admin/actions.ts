"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminClient } from "@/lib/admin";
import { decadeOf, paragraphsToHtml, slugify } from "@/lib/text";

/** Approve, reject or reopen a submission. "draft" approves it and opens a new draft cover. */
export async function reviewSubmission(form: FormData) {
  const id = String(form.get("id") ?? "");
  const choice = String(form.get("status") ?? "");
  if (!id || !["approved", "rejected", "pending", "draft"].includes(choice)) return;
  const db = await adminClient();
  const status = choice === "draft" ? "approved" : choice;
  await db
    .from("submissions")
    .update({ status, reviewed_at: status === "pending" ? null : new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/submissions");

  if (choice === "draft") {
    const { data: sub } = await db.from("submissions").select("*").eq("id", id).single();
    if (!sub) return;
    const coverId = await createDraft(db, {
      title: sub.album_title,
      artist: sub.artist,
      year: sub.release_year ?? new Date().getFullYear(),
      credits: sub.cover_credit,
      note: sub.note,
    });
    redirect(`/admin/covers/${coverId}`);
  }
}

type Db = Awaited<ReturnType<typeof adminClient>>;

async function uniqueSlug(db: Db, table: "covers" | "creators", base: string, exceptId?: string) {
  let slug = slugify(base);
  for (let n = 2; n < 50; n++) {
    let q = db.from(table).select("id").eq("slug", slug);
    if (exceptId) q = q.neq("id", exceptId);
    const { data } = await q.maybeSingle();
    if (!data) return slug;
    slug = `${slugify(base)}-${n}`;
  }
  return `${slugify(base)}-${Date.now()}`;
}

async function createDraft(
  db: Db,
  d: { title: string; artist: string; year: number; credits?: string | null; note?: string | null },
) {
  const slug = await uniqueSlug(db, "covers", d.title);
  const { data, error } = await db
    .from("covers")
    .insert({
      slug,
      title: d.title,
      artist: d.artist,
      release_year: d.year,
      decade: decadeOf(d.year),
      credits_text: d.credits || null,
      description_html: d.note ? paragraphsToHtml(`Submission note: ${d.note}`) : null,
      status: "draft",
      image_url: "",
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "The draft wasn't created.");
  return data.id as string;
}

/** Starts an empty draft from the covers list. */
export async function newCover(form: FormData) {
  const db = await adminClient();
  const title = String(form.get("title") ?? "").trim() || "Untitled cover";
  const artist = String(form.get("artist") ?? "").trim() || "Unknown artist";
  const id = await createDraft(db, { title, artist, year: new Date().getFullYear() });
  redirect(`/admin/covers/${id}`);
}

export type CoverInput = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  release_year: number;
  label: string;
  country: string;
  cover_type_id: string;
  subgenres: string;
  credits_text: string;
  essay: string;
  pull_quote: string;
  color: string;
  accent_color: string;
  image_url: string;
  image_width: number | null;
  image_height: number | null;
  spotify_url: string;
  apple_music_url: string;
  youtube_url: string;
  featured: boolean;
  status: "draft" | "published";
  creators: { name: string; role: string }[];
};

export type SaveResult = { ok: boolean; message: string; slug?: string };

const hex = (v: string) => (/^#[0-9a-f]{6}$/i.test(v.trim()) ? v.trim().toUpperCase() : null);
const url = (v: string) => (/^https?:\/\//i.test(v.trim()) ? v.trim() : null);

export async function saveCover(input: CoverInput): Promise<SaveResult> {
  try {
    const db = await adminClient();
    const year = Number(input.release_year);
    if (!input.title.trim() || !input.artist.trim()) return { ok: false, message: "Add the album title and the artist." };
    if (!Number.isInteger(year) || year < 1970 || year > 2100) return { ok: false, message: "Check the release year." };
    if (input.status === "published" && !input.image_url) {
      return { ok: false, message: "Upload the cover art before publishing." };
    }
    const {data:existing,error:existingError}=await db.from("covers").select("id,status").eq("id",input.id).maybeSingle();
    if(existingError||!existing)return {ok:false,message:existingError?.message??"This cover no longer exists."};
    const slug = await uniqueSlug(db, "covers", input.slug || input.title, input.id);
    const spotifyId = input.spotify_url.match(/open\.spotify\.com\/album\/([A-Za-z0-9]+)/)?.[1] ?? null;

    const { error } = await db
      .from("covers")
      .update({
        slug,
        title: input.title.trim(),
        artist: input.artist.trim(),
        release_year: year,
        decade: decadeOf(year),
        label: input.label.trim() || null,
        country: input.country.trim() || null,
        cover_type_id: input.cover_type_id || null,
        subgenres: input.subgenres
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        credits_text: input.credits_text.trim() || null,
        description_html: input.essay.trim() ? paragraphsToHtml(input.essay) : null,
        pull_quote: input.pull_quote.trim() || null,
        color: hex(input.color),
        accent_color: hex(input.accent_color),
        image_url: input.image_url,
        image_width: input.image_width,
        image_height: input.image_height,
        spotify_url: url(input.spotify_url),
        spotify_album_id: spotifyId,
        apple_music_url: url(input.apple_music_url),
        youtube_url: url(input.youtube_url),
        featured: input.featured,
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id).select("id");
    if (error) return { ok: false, message: error.message };

    // Creators: match by name, create the ones that are new, then relink.
    const people = input.creators.map((c) => ({ name: c.name.trim(), role: c.role.trim() })).filter((c) => c.name);
    const ids: string[] = [];
    for (const p of people) {
      // Case-insensitive exact match; escape the characters ilike treats as wildcards.
      const exact = p.name.replace(/[\\%_]/g, (m) => `\\${m}`);
      const { data: found } = await db.from("creators").select("id, role").ilike("name", exact).limit(1).maybeSingle();
      if (found) {
        // A shared creator's role must not be silently rewritten while editing one cover.
        ids.push(found.id);
      } else {
        const cslug = await uniqueSlug(db, "creators", p.name);
        const { data: made, error: cErr } = await db
          .from("creators")
          .insert({ slug: cslug, name: p.name, role: p.role || null })
          .select("id")
          .single();
        if (cErr || !made) return { ok: false, message: `Couldn't add ${p.name}: ${cErr?.message}` };
        ids.push(made.id);
      }
    }
    // Add new links first so a failed insert does not erase all existing credits.
    const uniqueIds=[...new Set(ids)];
    if(uniqueIds.length){
      const {error:linkError}=await db.from("cover_creators").upsert(
        uniqueIds.map(creator_id=>({cover_id:input.id,creator_id})),
        {onConflict:"cover_id,creator_id",ignoreDuplicates:true}
      );
      if(linkError)return {ok:false,message:"Cover saved, but credits could not be linked: "+linkError.message};
    }
    const obsolete=await db.from("cover_creators").select("creator_id").eq("cover_id",input.id);
    if(obsolete.error)return {ok:false,message:"Cover saved, but credits could not be verified: "+obsolete.error.message};
    const toRemove=(obsolete.data??[]).map(x=>x.creator_id).filter(id=>!uniqueIds.includes(id));
    if(toRemove.length){
      const removed=await db.from("cover_creators").delete().eq("cover_id",input.id).in("creator_id",toRemove);
      if(removed.error)return {ok:false,message:"Cover saved, but old credits could not be removed: "+removed.error.message};
    }

    revalidatePath("/", "layout");
    return {
      ok: true,
      slug,
      message: input.status === "published" ? "Saved. The cover is live." : "Saved as a draft. Only admins can see it.",
    };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function deleteCover(form: FormData) {
  const id = String(form.get("id") ?? "");
  const db = await adminClient();
  await db.from("covers").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/covers");
}

/* Feedback ---------------------------------------------------------------- */

export async function markFeedback(form: FormData) {
  const db = await adminClient();
  const status = String(form.get("status")) === "done" ? "done" : "new";
  await db.from("feedback").update({ status }).eq("id", String(form.get("id") ?? ""));
  revalidatePath("/admin/feedback");
}

/** Applies a deliberate bulk action to selected cover records only. */
export async function bulkCoverAction(ids: string[], action: "draft" | "delete"): Promise<{ ok: boolean; message: string }> {
  const db = await adminClient();
  if (!Array.isArray(ids) || !ids.length || ids.length > 200 || !["draft", "delete"].includes(action)) return { ok: false, message: "Choose 1 to 200 covers." };
  const valid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const unique = [...new Set(ids)];
  if (unique.some(id => !valid.test(id))) return { ok: false, message: "Invalid cover selection." };
  const { data: found, error: readError } = await db.from("covers").select("id").in("id", unique);
  if (readError || found?.length !== unique.length) return { ok: false, message: "Some covers could not be found. Refresh and try again." };
  const result = action === "draft"
    ? await db.from("covers").update({ status: "draft", updated_at: new Date().toISOString() }).in("id", unique).select("id")
    : await db.from("covers").delete().in("id", unique).select("id");
  if (result.error || result.data?.length !== unique.length) return { ok: false, message: result.error?.message ?? "Some changes could not be completed. Refresh the list." };
  revalidatePath("/", "layout");
  revalidatePath("/admin/covers");
  return { ok: true, message: `${unique.length} cover${unique.length === 1 ? "" : "s"} ${action === "draft" ? "moved to drafts" : "deleted"}.` };
}

/** Resolve metadata on the server. The browser only supplies the MusicBrainz release-group ID. */
export async function addMusicBrainzCover(groupId: string): Promise<{id:string;existing:boolean}> {
 const db=await adminClient();
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId))throw new Error("Invalid MusicBrainz album.");
 const root="https://musicbrainz.org/ws/2";
 const headers={"User-Agent":"Covvvers/1.0 (https://covvvers.com)","Accept":"application/json"};
 const read=async(path:string)=>{
  const r=await fetch(root+path,{headers,next:{revalidate:86400},signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw new Error("MusicBrainz is temporarily unavailable ("+r.status+").");
  return r.json();
 };
 type ArtistPart={name?:string;joinphrase?:string}|string;
 type Edition={id:string;title:string;date?:string;country?:string;status?:string;"label-info"?:{label?:{name?:string}}[];"cover-art-archive"?:{front?:boolean}};
 const group=await read("/release-group/"+groupId+"?inc=genres+url-rels&fmt=json");
 const title=String(group.title??"").trim().slice(0,250);
 const artist=((group["artist-credit"] as ArtistPart[] | undefined) ?? []).map(x=>typeof x==="string"?x:(x.name??"")+(x.joinphrase??"")).join("").trim().slice(0,250);
 const year=Number(String(group["first-release-date"]??"").slice(0,4));
 if(!title||!artist||!Number.isInteger(year)||year<1970||year>2100)throw new Error("This album has incomplete metadata. Please verify it on MusicBrainz.");
 const {data:matching,error:lookupError}=await db.from("covers").select("id,title,artist,release_year").eq("release_year",year).ilike("artist",artist.replace(/[\\%_]/g,x=>"\\"+x)).limit(100);
 if(lookupError)throw new Error(lookupError.message);
 const norm=(x:string)=>x.normalize("NFKC").trim().toLocaleLowerCase();
 const duplicate=matching?.find(c=>norm(c.artist)===norm(artist)&&norm(c.title)===norm(title));
 if(duplicate)return {id:duplicate.id,existing:true};
 const releaseData=await read("/release/?release-group="+groupId+"&limit=100&inc=labels&fmt=json");
 const editions:Edition[]=releaseData.releases??[];
 // Prefer original, official releases with artwork over reissues and compilations.
 const ranked=editions.map(r=>({r,score:
   (r.date?.startsWith(String(year))?8:0)+
   (r.status==="Official"?4:0)+
   (r["cover-art-archive"]?.front?12:0)+
   (r.country?1:0)
 })).sort((a,b)=>b.score-a.score);
 const edition=ranked[0]?.r;
 const labels=[...new Set((edition?.["label-info"]??[]).map(x=>x.label?.name).filter((x):x is string=>Boolean(x)))];
 const genres=((group.genres as {name?:string;count?:number}[] | undefined) ?? [])
   .filter(g=>Boolean(g.name)).sort((a,b)=>(b.count??0)-(a.count??0)).slice(0,12).map(g=>g.name!.slice(0,80));
 const rels=((group.relations as {type?:string;url?:{resource?:string}}[] | undefined) ?? []).map(x=>x.url?.resource??"");
 const find=(host:string,pattern:RegExp)=>rels.find(link=>{try{const u=new URL(link);return (u.hostname===host||u.hostname.endsWith("."+host))&&pattern.test(u.pathname);}catch{return false;}})??null;
 const spotify=find("spotify.com",/^\/album\//);
 const apple=find("music.apple.com",/\/album\//);
 const youtube=find("youtube.com",/\/playlist|\/watch/)||find("youtu.be",/^\//);
 // The group endpoint is the artwork displayed in search; absent artwork must not be treated as real.
 let artwork="";
 try{
  const art=await fetch("https://coverartarchive.org/release-group/"+groupId+"/front-500",{method:"HEAD",headers:{"User-Agent":"Covvvers/1.0 (https://covvvers.com)"},signal:AbortSignal.timeout(6000),next:{revalidate:86400}});
  if(art.ok)artwork="https://coverartarchive.org/release-group/"+groupId+"/front";
 }catch{/* Missing art is optional for drafts. */}
 const slug=await uniqueSlug(db,"covers",title);
 const {data:created,error}=await db.from("covers").insert({
  slug,title,artist,release_year:year,decade:decadeOf(year),
  label:labels.join(", ").slice(0,250)||null,country:edition?.country||null,
  subgenres:genres,image_url:artwork,status:"draft",
  spotify_url:spotify,spotify_album_id:spotify?.match(/spotify\.com\/album\/([A-Za-z0-9]+)/)?.[1]??null,
  apple_music_url:apple,youtube_url:youtube
 }).select("id").single();
 if(error||!created)throw new Error(error?.message??"Couldn't create the draft.");
 revalidatePath("/admin/covers");
 return {id:created.id,existing:false};
}
