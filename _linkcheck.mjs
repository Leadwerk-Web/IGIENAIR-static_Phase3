import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXCLUDE_DIRS = new Set([
  ".git", ".playwright-mcp", "node_modules", "dist",
  "asset-analysis", "leadwerk_importer", "leadwerk_theme",
  "leadwerk-fields", "leadwerk-wpml-clone",
]);

// ---- collect html files ----
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      htmlFiles.push(path.join(dir, entry.name));
    }
  }
}
walk(ROOT);

// ---- case-sensitive existence check ----
const dirCache = new Map();
function listDir(d) {
  if (!dirCache.has(d)) {
    try { dirCache.set(d, fs.readdirSync(d)); }
    catch { dirCache.set(d, null); }
  }
  return dirCache.get(d);
}
function resolveCS(absPath) {
  const rel = path.relative(ROOT, absPath);
  if (rel.startsWith("..")) return { exists: fs.existsSync(absPath), caseMatch: true, outside: true };
  const parts = rel.split(path.sep).filter(Boolean);
  let cur = ROOT;
  for (const part of parts) {
    const entries = listDir(cur);
    if (!entries) return { exists: false, caseMatch: false };
    if (entries.includes(part)) {
      cur = path.join(cur, part);
    } else {
      const ci = entries.find((e) => e.toLowerCase() === part.toLowerCase());
      if (ci) return { exists: true, caseMatch: false, requested: part, actual: ci };
      return { exists: false, caseMatch: false };
    }
  }
  return { exists: true, caseMatch: true };
}

// ---- collect ids per file (for anchor checks) ----
const idCache = new Map();
function idsOf(absFile) {
  if (idCache.has(absFile)) return idCache.get(absFile);
  let ids = new Set();
  try {
    const html = fs.readFileSync(absFile, "utf8");
    for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
    for (const m of html.matchAll(/\sname="([^"]+)"/g)) ids.add(m[1]);
  } catch {}
  idCache.set(absFile, ids);
  return ids;
}

const ATTR_RE = /(?:href|src|poster)\s*=\s*"([^"]*)"/g;
const SRCSET_RE = /srcset\s*=\s*"([^"]*)"/g;

const issues = { missing: [], caseMismatch: [], deadAnchor: [], emptyHref: [] };

function isExternal(u) {
  return /^(https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(u);
}

function checkRef(rawUrl, fromFile) {
  let url = rawUrl.trim();
  if (!url) return;
  if (isExternal(url)) return;
  if (url.startsWith("#")) {
    // same-page anchor
    const id = decodeURIComponent(url.slice(1));
    if (!id) return;
    if (!idsOf(fromFile).has(id)) issues.deadAnchor.push({ from: fromFile, url });
    return;
  }
  // split hash + query
  let hash = "";
  const hi = url.indexOf("#");
  if (hi >= 0) { hash = url.slice(hi + 1); url = url.slice(0, hi); }
  const qi = url.indexOf("?");
  if (qi >= 0) url = url.slice(0, qi);
  if (!url) return;

  let target = path.resolve(path.dirname(fromFile), url);
  // directory link -> index.html
  let checkPath = target;
  const endsSlash = url.endsWith("/");
  const res0 = resolveCS(checkPath);
  if (endsSlash || (res0.exists && safeIsDir(checkPath))) {
    checkPath = path.join(checkPath, "index.html");
  }
  const res = resolveCS(checkPath);
  if (!res.exists) {
    issues.missing.push({ from: fromFile, url: rawUrl, resolved: rel(checkPath) });
    return;
  }
  if (!res.caseMatch && !res.outside) {
    issues.caseMismatch.push({ from: fromFile, url: rawUrl, requested: res.requested, actual: res.actual });
  }
  // anchor target check (only for html targets within scope)
  if (hash && checkPath.toLowerCase().endsWith(".html")) {
    const ids = idsOf(checkPath);
    if (ids.size && !ids.has(decodeURIComponent(hash))) {
      issues.deadAnchor.push({ from: fromFile, url: rawUrl, target: rel(checkPath) });
    }
  }
}
function safeIsDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }
function rel(p) { return path.relative(ROOT, p).replace(/\\/g, "/"); }

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const m of html.matchAll(ATTR_RE)) checkRef(m[1], file);
  for (const m of html.matchAll(SRCSET_RE)) {
    for (const cand of m[1].split(",")) {
      const u = cand.trim().split(/\s+/)[0];
      if (u) checkRef(u, file);
    }
  }
}

// ---- check CSS url() refs (relative to styles.css at root) ----
const cssFile = path.join(ROOT, "styles.css");
if (fs.existsSync(cssFile)) {
  const css = fs.readFileSync(cssFile, "utf8");
  for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    let u = m[1].trim();
    if (isExternal(u) || u.startsWith("data:") || u.startsWith("#")) continue;
    const target = path.resolve(path.dirname(cssFile), u.split("?")[0].split("#")[0]);
    const res = resolveCS(target);
    if (!res.exists) issues.missing.push({ from: cssFile, url: u, resolved: rel(target) });
    else if (!res.caseMatch && !res.outside) issues.caseMismatch.push({ from: cssFile, url: u, requested: res.requested, actual: res.actual });
  }
}

// ---- report ----
console.log("Scanned HTML files:", htmlFiles.length);
console.log("");
function dump(title, arr, fmt) {
  console.log(`=== ${title}: ${arr.length} ===`);
  const seen = new Set();
  for (const it of arr) {
    const line = fmt(it);
    if (seen.has(line)) continue;
    seen.add(line);
    console.log("  " + line);
  }
  console.log("");
}
dump("MISSING (Datei existiert nicht -> 404)", issues.missing,
  (i) => `${rel(i.from)}  ->  ${i.url}   [resolved: ${i.resolved}]`);
dump("CASE MISMATCH (bricht auf GitHub/Linux!)", issues.caseMismatch,
  (i) => `${rel(i.from)}  ->  ${i.url}   (angefragt '${i.requested}' != real '${i.actual}')`);
dump("DEAD ANCHOR (#id nicht gefunden)", issues.deadAnchor,
  (i) => `${rel(i.from)}  ->  ${i.url}` + (i.target ? `   [in ${i.target}]` : ""));

console.log("SUMMARY  missing:", new Set(issues.missing.map(i=>rel(i.from)+i.url)).size,
  "| caseMismatch:", new Set(issues.caseMismatch.map(i=>rel(i.from)+i.url)).size,
  "| deadAnchor:", new Set(issues.deadAnchor.map(i=>rel(i.from)+i.url)).size);
