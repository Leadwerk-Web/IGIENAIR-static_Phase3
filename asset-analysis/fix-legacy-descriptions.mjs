import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["leadwerk_importer", "leadwerk_theme", "node_modules", "_xlsx_tmp"]);
const LEGACY_RE = /[\u1405\u2714\u2705\u271A]/;

const CUSTOM_DESCRIPTIONS = {
  "anlagen/kuehlturmreinigung/index.html":
    "Kühlturm- und Verdunstungskühlanlagen-Reinigung nach VDI 2047-2 und 42. BImSchV. Igienair reinigt normkonform, dokumentiert und deutschlandweit.",
};

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, files);
    else if (entry.name === "index.html") files.push(full);
  }
  return files;
}

function extractMeta(html, attr, name) {
  const re1 = new RegExp(`<meta\\s+${attr}="${name}"\\s+content="([^"]*)"`, "i");
  const re2 = new RegExp(`<meta\\s+content="([^"]*)"\\s+${attr}="${name}"`, "i");
  return html.match(re1)?.[1] ?? html.match(re2)?.[1] ?? null;
}

function hasLegacy(text) {
  return text ? LEGACY_RE.test(text) : false;
}

function replaceMeta(html, attr, name, newContent) {
  const re1 = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")([^"]*)(")`, "i");
  const re2 = new RegExp(`(<meta\\s+content=")([^"]*)("\\s+${attr}="${name}")`, "i");
  if (re1.test(html)) return html.replace(re1, `$1${newContent}$3`);
  if (re2.test(html)) return html.replace(re2, `$1${newContent}$3`);
  return html;
}

let updated = 0;

for (const file of walkHtml(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  let html = fs.readFileSync(file, "utf8");

  let nameDesc = extractMeta(html, "name", "description");
  let ogDesc = extractMeta(html, "property", "og:description");

  if (!hasLegacy(nameDesc) && !hasLegacy(ogDesc)) continue;

  let clean = CUSTOM_DESCRIPTIONS[rel] ?? null;

  if (!clean) {
    if (nameDesc && !hasLegacy(nameDesc)) {
      clean = nameDesc;
    } else if (ogDesc && !hasLegacy(ogDesc)) {
      clean = ogDesc;
    }
  }

  if (!clean) continue;

  let next = html;
  if (nameDesc && hasLegacy(nameDesc)) {
    next = replaceMeta(next, "name", "description", clean);
  }
  if (ogDesc && hasLegacy(ogDesc)) {
    next = replaceMeta(next, "property", "og:description", clean);
  }

  if (next !== html) {
    fs.writeFileSync(file, next, "utf8");
    updated++;
    console.log(rel);
  }
}

console.log(`\n${updated} Dateien aktualisiert.`);
