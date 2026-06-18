#!/usr/bin/env node
// upload-artifact.mjs - Upload an e2e evidence file to S3-compatible storage
// (Cloudflare R2 / AWS S3) and print its absolute public URL. Dependency-free:
// SigV4-signed PUT using only Node built-ins. No aws CLI, no SDK install.
//
// Usage:
//   node upload-artifact.mjs <file> [--key <object-key>]   # upload, print public URL
//   node upload-artifact.mjs --verify <url> [<url> ...]     # check hosted assets return 200
//
// Target + creds come from the machine's R2_* env (e.g. injected by Claude Code
// from ~/.claude/settings.json), with optional per-project overrides in
// docs/testing/e2e-config.json -> upload { endpoint, bucket, publicBase, keyPrefix }:
//   R2_ENDPOINT, R2_BUCKET, R2_PUBLIC_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
//
// Fails loudly (non-zero) on missing target/creds - never a local fallback.

import { createHash, createHmac } from "node:crypto";
import { readFileSync, existsSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import https from "node:https";

const die = (m) => { console.error("ERROR: " + m); process.exit(1); };

const CT = (f) => ({
  html: "text/html; charset=utf-8", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  webp: "image/webp", gif: "image/gif", mp4: "video/mp4", mov: "video/quicktime",
  webm: "video/webm", json: "application/json", yaml: "text/plain; charset=utf-8",
  yml: "text/plain; charset=utf-8", log: "text/plain; charset=utf-8", txt: "text/plain; charset=utf-8",
  xml: "text/plain; charset=utf-8",
}[f.split(".").pop().toLowerCase()] || "application/octet-stream");

const args = process.argv.slice(2);

// ---- Verify mode ----
if (args[0] === "--verify") {
  const urls = args.slice(1);
  if (!urls.length) die("Usage: upload-artifact.mjs --verify <url> [<url> ...]");
  let fail = 0;
  const head = (url) => new Promise((res) => {
    https.get(url, (r) => { r.resume(); res({ code: r.statusCode, ct: r.headers["content-type"] || "-" }); })
      .on("error", () => res({ code: 0, ct: "-" }));
  });
  for (const url of urls) {
    const { code, ct } = await head(url);
    if (code === 200) console.log(`OK   200  ${ct}  ${url}`);
    else { console.log(`FAIL ${code}  ${ct}  ${url}`); fail = 1; }
  }
  process.exit(fail);
}

// ---- Upload mode ----
const file = args[0];
if (!file) die("Usage: upload-artifact.mjs <file> [--key <object-key>]");
let key = "";
for (let i = 1; i < args.length; i++) {
  if (args[i] === "--key") key = args[++i] || die("--key needs a value");
  else die("Unknown argument: " + args[i]);
}
if (!existsSync(file) || !statSync(file).isFile()) die("File not found: " + file);

// Optional per-project override: docs/testing/e2e-config.json -> upload {}
function findConfig(start) {
  let dir = dirname(start);
  for (;;) {
    const a = join(dir, "docs/testing/e2e-config.json"); if (existsSync(a)) return a;
    const b = join(dir, "e2e-config.json"); if (existsSync(b)) return b;
    const parent = dirname(dir); if (parent === dir) break; dir = parent;
  }
  return existsSync("docs/testing/e2e-config.json") ? "docs/testing/e2e-config.json" : null;
}
let cfg = {};
const cfgPath = findConfig(file);
if (cfgPath) { try { cfg = (JSON.parse(readFileSync(cfgPath, "utf8")).upload) || {}; } catch { /* ignore */ } }

const endpoint = cfg.endpoint || process.env.R2_ENDPOINT;
const bucket = cfg.bucket || process.env.R2_BUCKET;
const publicBase = (cfg.publicBase || process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
const region = cfg.region || process.env.R2_REGION || "auto";
const keyPrefix = (cfg.keyPrefix != null ? cfg.keyPrefix : "qa-artifacts").replace(/^\/|\/$/g, "");
const akid = process.env.R2_ACCESS_KEY_ID;
const secret = process.env.R2_SECRET_ACCESS_KEY;

if (!endpoint) die("No R2_ENDPOINT (or upload.endpoint in e2e-config.json). Set R2_* in ~/.claude/settings.json env - see references/uploader.md.");
if (!bucket) die("No R2_BUCKET (or upload.bucket). Set R2_* in ~/.claude/settings.json env.");
if (!publicBase) die("No R2_PUBLIC_URL (or upload.publicBase). Set R2_* in ~/.claude/settings.json env.");
if (!akid || !secret) die("R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY not set in the environment. Add them to ~/.claude/settings.json env (and your Codex env) - see references/uploader.md.");

// Default key: <keyPrefix>/<feature-folder>/<basename>
if (!key) {
  const feature = basename(dirname(file));
  key = `${keyPrefix ? keyPrefix + "/" : ""}${feature}/${basename(file)}`;
}
key = key.replace(/^\/+/, "");

const body = readFileSync(file);
const contentType = CT(file);

// ---- SigV4 ----
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
const encPath = (p) => p.split("/").map(enc).join("/");
const sha256hex = (b) => createHash("sha256").update(b).digest("hex");
const hmac = (k, d) => createHmac("sha256", k).update(d).digest();

const host = new URL(endpoint).host;
const canonicalUri = "/" + encPath(bucket) + "/" + encPath(key);
const now = new Date();
const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
const dateStamp = amzDate.slice(0, 8);
const payloadHash = sha256hex(body);

const canonicalHeaders =
  `content-type:${contentType}\n` +
  `host:${host}\n` +
  `x-amz-content-sha256:${payloadHash}\n` +
  `x-amz-date:${amzDate}\n`;
const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");

const scope = `${dateStamp}/${region}/s3/aws4_request`;
const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256hex(canonicalRequest)].join("\n");
let kDate = hmac("AWS4" + secret, dateStamp);
let kRegion = hmac(kDate, region);
let kService = hmac(kRegion, "s3");
let kSigning = hmac(kService, "aws4_request");
const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");
const authorization = `AWS4-HMAC-SHA256 Credential=${akid}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

const put = () => new Promise((resolve) => {
  const req = https.request(`${endpoint.replace(/\/$/, "")}${canonicalUri}`, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Content-Length": body.length,
      "Host": host,
      "X-Amz-Date": amzDate,
      "X-Amz-Content-Sha256": payloadHash,
      "Authorization": authorization,
    },
  }, (r) => { let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => resolve({ code: r.statusCode, body: d })); });
  req.on("error", (e) => resolve({ code: 0, body: String(e) }));
  req.end(body);
});

const { code, body: resBody } = await put();
if (code !== 200 && code !== 201) die(`Upload failed (${code}) for ${file} -> ${bucket}/${key}\n${resBody.slice(0, 600)}`);
console.log(`${publicBase}/${key}`);
