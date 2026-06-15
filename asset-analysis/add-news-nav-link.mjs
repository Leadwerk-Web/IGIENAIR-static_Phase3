import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const SKIP_DIRS = new Set(["leadwerk_importer", "node_modules", ".git"]);

function walkHtmlFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkHtmlFiles(path.join(dir, entry.name), files);
      continue;
    }
    if (entry.name.endsWith(".html")) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function addNewsNav(html) {
  if (/news\/index\.html">News<\/a>/.test(html)) {
    return html;
  }

  return html.replace(
    /(<a class="(nav-link|mobile-link)" href="([^"]*?)umweltschutz\/index\.html">Umweltschutz<\/a>)/g,
    (match, full, cls, prefix) =>
      `${full}\n            <a class="${cls}" href="${prefix}news/index.html">News</a>`
  );
}

const files = walkHtmlFiles(ROOT);
let updated = 0;
let skipped = 0;

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const next = addNewsNav(html);
  if (next === html) {
    skipped += 1;
    continue;
  }
  fs.writeFileSync(file, next, "utf8");
  updated += 1;
}

console.log(`Navigation aktualisiert: ${updated} Dateien`);
console.log(`Unverändert: ${skipped} Dateien`);
