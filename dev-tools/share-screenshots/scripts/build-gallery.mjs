#!/usr/bin/env node
// build-gallery.mjs - build a self-contained, shareable screenshot gallery HTML
// from a manifest JSON.
//
// Usage: node build-gallery.mjs <manifest.json> <out.html>
//
// manifest: {
//   "title": "Onboarding cover art",
//   "subtitle": "iOS - iPhone 16 Pro",          // optional
//   "footer": "diem #653 - Jun 17, 2026",        // optional
//   "shots": [ { "url": "https://cdn/...png", "caption": "Cover picker", "group": "iOS" } ]
// }
// `group` is optional; when present, shots render under per-group sections.

import { readFileSync, writeFileSync } from "node:fs";

const [, , manifestPath, outPath] = process.argv;
if (!manifestPath || !outPath) {
  console.error("Usage: node build-gallery.mjs <manifest.json> <out.html>");
  process.exit(1);
}
const m = JSON.parse(readFileSync(manifestPath, "utf8"));
const shots = Array.isArray(m.shots) ? m.shots : [];
if (!shots.length) { console.error("ERROR: manifest has no `shots`"); process.exit(1); }

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Group by .group, preserving first-seen order; ungrouped shots share one section.
const order = [];
const byGroup = new Map();
for (const s of shots) {
  const g = s.group || "";
  if (!byGroup.has(g)) { byGroup.set(g, []); order.push(g); }
  byGroup.get(g).push(s);
}
const card = (s) => `<a class="shot" href="${esc(s.url)}" target="_blank" rel="noopener"><img loading="lazy" src="${esc(s.url)}" alt="${esc(s.caption || "")}">${s.caption ? `<span class="cap">${esc(s.caption)}</span>` : ""}</a>`;
const section = (g) => `${g ? `<h2 class="group">${esc(g)}</h2>` : ""}<div class="grid">${byGroup.get(g).map(card).join("")}</div>`;
const body = order.map(section).join("\n");

const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title || "Screenshots")}</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0a0a0a; color: #ededed; font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 56px 24px 96px; }
  .eyebrow { margin: 0 0 10px; font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #8a8a8a; }
  h1 { margin: 0; font-size: clamp(28px, 4vw, 44px); font-weight: 600; letter-spacing: -.03em; }
  .sub { margin: 14px 0 0; color: #a3a3a3; font-size: 17px; }
  .rule { height: 1px; background: #262626; margin: 36px 0; }
  h2.group { margin: 44px 0 18px; font-size: 20px; font-weight: 600; letter-spacing: -.02em; }
  h2.group:first-of-type { margin-top: 0; }
  .grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
  .shot { display: flex; flex-direction: column; gap: 10px; text-decoration: none; color: inherit; }
  .shot img { width: 100%; height: auto; display: block; border-radius: 12px; border: 1px solid #1f1f1f; background: #1c1c1c; }
  .shot:hover img { border-color: #3a3a3a; }
  .cap { font-size: 13px; color: #a3a3a3; }
  footer { margin-top: 64px; color: #6e6e6e; font-size: 13px; }
  footer a { color: #a3a3a3; }
</style></head>
<body><div class="wrap">
  <p class="eyebrow">Screenshots</p>
  <h1>${esc(m.title || "Screenshots")}</h1>
  ${m.subtitle ? `<p class="sub">${esc(m.subtitle)}</p>` : ""}
  <div class="rule"></div>
  ${body}
  <footer>${m.footer ? esc(m.footer) : "Shared via share-screenshots"}</footer>
</div></body></html>
`;

writeFileSync(outPath, html);
console.log(`wrote ${outPath} (${shots.length} shots, ${order.length} group(s))`);
