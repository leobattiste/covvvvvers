import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from "@/lib/supabase/config";
import HeroRing, { type RingCover } from "@/components/HeroRing";
import { getCovers } from "@/lib/data";
import { squareImage } from "@/lib/img";

export const revalidate = 3600;

export default async function Home() {
  const covers = (await getCovers()).filter((c) => c.image_url);
  const settings = supabaseEnabled
    ? await createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
        .from("site_settings").select("key,value").in("key", ["home_title", "home_description"])
    : { data: null };
  const siteText = Object.fromEntries((settings.data ?? []).map((row) => [row.key, row.value]));
  const since = Math.min(...covers.map((c) => c.release_year));

  // 32 covers for the two rings, spread across the years and mixed so neighbours differ.
  const want = 32;
  const byYear = [...covers].sort((a, b) => a.release_year - b.release_year);
  const picked = Array.from({ length: Math.min(want, byYear.length) }, (_, i) => byYear[Math.floor((i * byYear.length) / Math.min(want, byYear.length))]);
  const mixed = picked.map((c, i) => ({ c, k: (i * 29) % picked.length })).sort((a, b) => a.k - b.k).map((x) => x.c);

  const ring: RingCover[] = mixed.map((c) => ({
    slug: c.slug,
    title: c.title,
    artist: c.artist,
    image: squareImage(c.image_url, 300),
    color: c.color && /^#[0-9a-f]{6}$/i.test(c.color) ? c.color : "#444444",
  }));

  return (
    <HeroRing
      covers={ring}
      title={siteText.home_title || "Every rap album cover has a story."}
      sub={siteText.home_description || `${covers.length} covers from ${since} to now, and the people, places and ideas behind each one.`}
    />
  );
}
