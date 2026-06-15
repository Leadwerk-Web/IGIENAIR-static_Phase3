import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");

function walkHtml(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "leadwerk_importer", "leadwerk_theme"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(full, files);
    else if (e.name === "index.html") files.push(full);
  }
  return files;
}

const noQuickRail = [];
const noFaq = [];
const emptyDesc = [];
const legacyOg = [];
const legacyNameDesc = [];
const oldNav = [];

for (const file of walkHtml(ROOT)) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");

  if (!html.includes("quick-rail")) noQuickRail.push(rel);
  if (!html.includes("faq-accordion")) noFaq.push(rel);

  const desc = html.match(/<meta name="description" content="([^"]*)"/);
  if (!desc || !desc[1].trim()) emptyDesc.push(rel);

  const ogBlock = html.match(/<meta property="og:(title|description)"[^>]+>/g) || [];
  if (ogBlock.some((t) => /ᐅ|✔|✅/.test(t))) legacyOg.push(rel);

  if (desc && /ᐅ|✔|✅/.test(desc[1])) legacyNameDesc.push(rel);

  if ((html.match(/data-inert/g) || []).length >= 12) oldNav.push(rel);
}

console.log("oldNav", oldNav);
console.log("noQuickRail", noQuickRail);
console.log("emptyDesc count", emptyDesc.length, emptyDesc.slice(0, 10));
console.log("legacyOg count", legacyOg.length);
console.log("legacyNameDesc count", legacyNameDesc.length, legacyNameDesc.slice(0, 10));
console.log("noFaq count", noFaq.length);

const anlagen = noFaq.filter((p) => p.startsWith("anlagen/"));
console.log("anlagen without faq", anlagen);
