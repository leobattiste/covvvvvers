/** Run npm run audit:timeline:images to review suspicious artwork associations. */
import { readFileSync } from "node:fs";
const load = (name) => JSON.parse(readFileSync(new URL("../" + name, import.meta.url), "utf8"));
const images = load("lib/images.json").records ?? {};
const requests = load("scripts/image-requests.json").records ?? [];
const byKey = new Map(requests.map((r) => [r.key, r]));
const flags = [];
for (const [key, image] of Object.entries(images)) {
  const r = byKey.get(key);
  if (!r) { flags.push({ key, reason: "image without matching request" }); continue; }
  const sourceUrl = image.source?.url ?? "";
  const suspicious = /(?:remix|karaoke|tribute|re-record|rerecord|sped.up|slowed|live.version)/i;
  if (suspicious.test(decodeURIComponent(sourceUrl))) {
    flags.push({ key, reason: "source URL suggests remix, tribute or alternate edition", sourceUrl });
  }
  if (!image.src || !sourceUrl) flags.push({ key, reason: "missing image or attribution URL" });
}
console.log(`Reviewed ${Object.keys(images).length} image records; ${flags.length} need editorial attention.`);
for (const f of flags) console.log(`REVIEW ${f.key}: ${f.reason}${f.sourceUrl ? " — " + f.sourceUrl : ""}`);
if (flags.length) process.exitCode = 1;
