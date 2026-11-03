/**
 * Static integrity checks for the US-only Through the Years timeline.
 * Run: npm run audit:timeline
 * Historical claims and external URL reachability still require editorial review.
 */
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const core = read("lib/history.ts");
const research = read("lib/timeline-research.ts");
const chapters = read("lib/chapters.ts");
const issues = [];

const momentPattern = /\bid:\s*["']([^"']+)["'],\s*\n\s*when:\s*["']([^"']+)["']/g;
const coreMoments = [...core.matchAll(momentPattern)].map((m) => ({ id: m[1], when: m[2] }));
const researchBody = research.split("export const RESEARCH_SOURCES")[0];
const researched = [...researchBody.matchAll(momentPattern)].map((m) => ({ id: m[1], when: m[2] }));
const sourceBody = research.split("export const RESEARCH_SOURCES")[1] ?? "";
const sourceIds = [...sourceBody.matchAll(/\bid:\s*["']([^"']+)["']/g)].map((m) => m[1]);
const refs = [...researchBody.matchAll(/sources:\s*\[([^\]]*)\]/g)]
  .flatMap((m) => [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]));
const coreRefs = [...core.matchAll(/sources:\s*\[([^\]]*)\]/g)]
  .flatMap((m) => [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]));
const chapterIds = [...chapters.matchAll(/moments:\s*\[([^\]]*)\]/g)]
  .flatMap((m) => [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]));

function unique(label, items) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item)) issues.push(`Duplicate ${label}: ${item}`);
    seen.add(item);
  }
}
unique("milestone ID", [...coreMoments, ...researched].map((m) => m.id));
unique("research source ID", sourceIds);
unique("chapter moment reference", chapterIds);
const coreSet = new Set(coreMoments.map((m) => m.id));
const sourceSet = new Set(sourceIds);
for (const id of chapterIds) if (!coreSet.has(id)) issues.push(`Chapter refers to missing milestone: ${id}`);
for (const m of coreMoments) if (!chapterIds.includes(m.id)) issues.push(`Core milestone is not in any chapter: ${m.id}`);
for (const id of [...refs, ...coreRefs]) if (!sourceSet.has(id)) issues.push(`Missing research source: ${id}`);
for (const m of [...coreMoments, ...researched]) {
  const y = Number(m.when.match(/\d{4}/)?.[0] ?? 0);
  if (y < 1973 || y > 2026) issues.push(`Year outside 1973–2026: ${m.id} (${m.when})`);
}
const chapterRanges = [...chapters.matchAll(/from:\s*(\d+),\s*\n\s*to:\s*(\d+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
for (let i = 1; i < chapterRanges.length; i++) {
  if (chapterRanges[i - 1][1] + 1 !== chapterRanges[i][0]) issues.push("Gap or overlap between chapter year ranges");
}
console.log(`Timeline audit: ${coreMoments.length} core milestones, ${researched.length} researched milestones, ${sourceIds.length} research source IDs, ${chapterRanges.length} chapters.`);
if (issues.length) {
  for (const issue of issues) console.error("ERROR:", issue);
  process.exitCode = 1;
} else {
  console.log("PASS: IDs, chapter references, source references and year bounds are consistent.");
}
