#!/usr/bin/env node
// Symmetric oklch <-> hex color converter.
// Auto-detects input format. Supports alpha in both directions.
//
// CLI:
//   node color-convert.mjs '#da702c'                  -> oklch(...)
//   node color-convert.mjs 'oklch(0.658 0.1539 49.3)' -> #...
//   node color-convert.mjs --json '#da702c'           -> JSON with hex+oklch+rgb
//   echo '#da702c' | node color-convert.mjs           -> reads stdin
//
// Module:
//   import { convert, hexToOklch, oklchToHex, parseOklch, formatOklch } from './color-convert.mjs';

import { argv, stdin } from "node:process";
import { fileURLToPath } from "node:url";

// --- sRGB <-> linear-light sRGB ---

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// --- linear-light sRGB <-> Oklab (Bjorn Ottosson's matrices) ---

function linearSrgbToOklab([r, g, b]) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}

function oklabToLinearSrgb([L, a, b]) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

// --- Oklab <-> Oklch (polar form) ---

function oklabToOklch([L, a, b]) {
  const C = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return [L, C, h];
}

function oklchToOklab([L, C, h]) {
  const rad = (h * Math.PI) / 180;
  return [L, C * Math.cos(rad), C * Math.sin(rad)];
}

// --- hex <-> rgba (normalized 0..1) ---

function hexToRgba(hex) {
  let s = hex.replace(/^#/, "").trim();
  if (s.length === 3 || s.length === 4) {
    s = [...s].map((c) => c + c).join("");
  }
  if (s.length !== 6 && s.length !== 8) {
    throw new Error(`Invalid hex: ${hex}`);
  }
  if (!/^[0-9a-fA-F]+$/.test(s)) {
    throw new Error(`Invalid hex: ${hex}`);
  }
  const r = parseInt(s.slice(0, 2), 16) / 255;
  const g = parseInt(s.slice(2, 4), 16) / 255;
  const b = parseInt(s.slice(4, 6), 16) / 255;
  const a = s.length === 8 ? parseInt(s.slice(6, 8), 16) / 255 : 1;
  return [r, g, b, a];
}

function rgbaToHex([r, g, b, a]) {
  const toHex = (c) =>
    Math.max(0, Math.min(255, Math.round(c * 255)))
      .toString(16)
      .padStart(2, "0");
  let out = "#" + toHex(r) + toHex(g) + toHex(b);
  if (a < 1) out += toHex(a);
  return out;
}

// --- top-level converters ---

export function hexToOklch(hex) {
  const [r, g, b, alpha] = hexToRgba(hex);
  const lin = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  const lab = linearSrgbToOklab(lin);
  const [L, C, h] = oklabToOklch(lab);
  return { L, C, h, alpha };
}

export function oklchToHex({ L, C, h, alpha = 1 }) {
  const lab = oklchToOklab([L, C, h]);
  const lin = oklabToLinearSrgb(lab);
  const srgb = lin.map(linearToSrgb);
  // Note: out-of-gamut values are clipped to [0,255]. For brand colors authored
  // in oklch they should already be in-gamut; this is just defensive clamping.
  return rgbaToHex([...srgb, alpha]);
}

// --- parsers ---

export function parseOklch(input) {
  const s = input.trim();
  const m = s.match(
    /^oklch\s*\(\s*([0-9.+-]+%?)\s+([0-9.+-]+%?)\s+([0-9.+-]+(?:deg)?)\s*(?:\/\s*([0-9.+-]+%?))?\s*\)\s*$/i,
  );
  if (!m) throw new Error(`Invalid oklch: ${input}`);

  let L = parseFloat(m[1]);
  if (m[1].endsWith("%")) L = L / 100;
  // Tolerant: someone wrote "65.8" meaning 65.8% L.
  else if (L > 1.5) L = L / 100;

  let C = parseFloat(m[2]);
  if (m[2].endsWith("%")) C = (C / 100) * 0.4; // Tailwind v4 maps 100% to 0.4 chroma

  const h = parseFloat(m[3]);

  let alpha = 1;
  if (m[4] !== undefined) {
    alpha = m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  }
  return { L, C, h, alpha };
}

export function formatOklch({ L, C, h, alpha = 1 }) {
  const round = (n, p) => {
    const v = Number(n.toFixed(p));
    return Number.isFinite(v) ? v : 0;
  };
  const base = `oklch(${round(L, 4)} ${round(C, 4)} ${round(h, 2)}`;
  return alpha < 1 ? `${base} / ${round(alpha, 3)})` : `${base})`;
}

// --- unified entry point ---

function detect(s) {
  const t = s.trim();
  if (t.startsWith("#")) return "hex";
  if (/^oklch\s*\(/i.test(t)) return "oklch";
  throw new Error(`Cannot detect color format: ${s}`);
}

export function convert(input) {
  const kind = detect(input);
  if (kind === "hex") {
    const o = hexToOklch(input);
    const [r, g, b] = hexToRgba(input);
    return {
      input,
      direction: "hex->oklch",
      hex: input.toLowerCase(),
      oklch: formatOklch(o),
      rgb: [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)],
      alpha: o.alpha,
    };
  } else {
    const o = parseOklch(input);
    const hex = oklchToHex(o);
    const [r, g, b] = hexToRgba(hex);
    return {
      input,
      direction: "oklch->hex",
      hex,
      oklch: formatOklch(o),
      rgb: [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)],
      alpha: o.alpha,
    };
  }
}

// --- CLI ---

async function readStdin() {
  let data = "";
  stdin.setEncoding("utf8");
  for await (const chunk of stdin) data += chunk;
  return data.trim();
}

async function main() {
  const args = argv.slice(2);
  const jsonOut = args.includes("--json");
  const help = args.includes("-h") || args.includes("--help");
  const positional = args.filter((a) => !a.startsWith("--") && !a.startsWith("-h"));

  if (help) {
    process.stdout.write(
      "Usage: color-convert.mjs <hex|oklch> [--json]\n" +
        "       echo '<color>' | color-convert.mjs\n\n" +
        "Converts between hex and oklch in either direction.\n" +
        "Examples:\n" +
        "  color-convert.mjs '#da702c'\n" +
        "  color-convert.mjs 'oklch(0.658 0.1539 49.3)'\n" +
        "  color-convert.mjs --json '#da702c80'\n",
    );
    return;
  }

  let input = positional[0];
  if (!input && !stdin.isTTY) input = await readStdin();
  if (!input) {
    process.stderr.write("error: no input. Use --help for usage.\n");
    process.exit(1);
  }

  try {
    const result = convert(input);
    if (jsonOut) {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    } else {
      process.stdout.write(
        (result.direction === "hex->oklch" ? result.oklch : result.hex) + "\n",
      );
    }
  } catch (e) {
    process.stderr.write(`error: ${e.message}\n`);
    process.exit(1);
  }
}

const isMain = argv[1] && fileURLToPath(import.meta.url) === argv[1];
if (isMain) main();
