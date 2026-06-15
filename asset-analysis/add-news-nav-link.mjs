import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const SKIP_DIRS = new Set(["leadwerk_importer", "node_modules", ".git", "asset-analysis"]);

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

// Fügt den News-Link direkt VOR dem Glossar-Link ein (Desktop + Mobile),
// die Einrückung des bestehenden Glossar-Links wird übernommen.
function addNewsNav(html) {
  // Fall 1: Standardseiten, deren Glossar-Link "…glossar/index.html" enthält.
  let next = html.replace(
    /([ \t]*)<a class="(nav-link|mobile-link)" href="([^"]*?)glossar\/index\.html"([^>]*)>Glossar<\/a>/g,
    (match, ws, cls, prefix, attrs) =>
      `${ws}<a class="${cls}" href="${prefix}unternehmen/news/index.html">News</a>\n` +
      `${ws}<a class="${cls}" href="${prefix}glossar/index.html"${attrs}>Glossar</a>`
  );

  if (next !== html) {
    return next;
  }

  // Fall 2: Seiten innerhalb von /glossar/ (Übersicht "./index.html",
  // Begriffsseiten "../index.html") – Glossar-Link ohne "glossar/" im Pfad.
  next = html.replace(
    /([ \t]*)<a class="(nav-link|mobile-link)" href="(\.\.?\/index\.html)"([^>]*)>Glossar<\/a>/g,
    (match, ws, cls, href, attrs) => {
      const newsPrefix = href === "./index.html" ? "../" : "../../";
      return (
        `${ws}<a class="${cls}" href="${newsPrefix}unternehmen/news/index.html">News</a>\n` +
        `${ws}<a class="${cls}" href="${href}"${attrs}>Glossar</a>`
      );
    }
  );

  return next;
}

const files = walkHtmlFiles(ROOT);
let updated = 0;
let skipped = 0;

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");

  // Seiten, die den News-Link bereits enthalten, überspringen (idempotent).
  if (/>News<\/a>/.test(html)) {
    skipped += 1;
    continue;
  }

  const next = addNewsNav(html);
  if (next === html) {
    skipped += 1;
    continue;
  }

  fs.writeFileSync(file, next, "utf8");
  updated += 1;
}

console.log(`Navigation aktualisiert: ${updated} Dateien`);
console.log(`Unveraendert/uebersprungen: ${skipped} Dateien`);
