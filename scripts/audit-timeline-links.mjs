/**
 * Check source URL reachability. Run: npm run audit:timeline:links
 * A 403, 429, timeout, or 5xx is inconclusive and requires manual review.
 * Only definitive 404/410 responses fail this check.
 */
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL("../" + file, import.meta.url), "utf8");
const research = read("lib/timeline-research.ts");
const core = read("lib/history.ts");
const sources = research.slice(research.indexOf("export const RESEARCH_SOURCES"));
const links = [
  ...[...sources.matchAll(/\burl:\s*["'](https?:\/\/[^"']+)["']/g)].map((m) => m[1]),
  ...[...core.matchAll(/\burl:\s*["'](https?:\/\/[^"']+)["']/g)].map((m) => m[1]),
];
const unique = [...new Set(links)];
const results = [];
let next = 0;

async function check(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    // GET is more representative than HEAD, which some publisher sites block.
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CovvvvversSourceAudit/1.0)" },
    });
    await response.body?.cancel();
    return { url, status: response.status, finalUrl: response.url };
  } catch (error) {
    return { url, status: null, reason: error?.message ?? "network error" };
  } finally {
    clearTimeout(timeout);
  }
}

async function worker() {
  while (next < unique.length) {
    const i = next++;
    results[i] = await check(unique[i]);
  }
}
await Promise.all(Array.from({ length: Math.min(5, unique.length) }, () => worker()));

const broken = results.filter((r) => r.status === 404 || r.status === 410);
const review = results.filter((r) => r.status === null || r.status === 403 || r.status === 429 || (r.status >= 500));
const redirects = results.filter((r) => r.finalUrl && r.finalUrl !== r.url);
console.log(`Checked ${unique.length} unique bibliography URLs: ${broken.length} confirmed missing, ${review.length} inconclusive, ${redirects.length} redirected.`);
for (const r of broken) console.error(`BROKEN ${r.status}: ${r.url}`);
for (const r of review) console.warn(`REVIEW ${r.status ?? r.reason}: ${r.url}`);
for (const r of redirects) console.log(`REDIRECT ${r.url} -> ${r.finalUrl}`);
if (broken.length) process.exitCode = 1;
