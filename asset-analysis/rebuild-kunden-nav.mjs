// Rollt die 2-stufige Kunden-Navigation (Branchen + Referenzen Mega-Menue) in alle
// produktiven Root-HTML-Seiten aus. Ersetzt den bestehenden Kunden-Eintrag
// (Desktop nav-item + Mobile mobile-menu__group) durch die Cluster-Struktur.
//
// Aufruf:  node asset-analysis/rebuild-kunden-nav.mjs

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const EXCLUDE_DIRS = new Set([
  "asset-analysis",
  "leadwerk_importer",
  "leadwerk_theme",
  "leadwerk-fields",
  "leadwerk-wpml-clone",
  ".playwright-mcp",
  "node_modules",
  ".git",
  "docs",
  "Bildmaterial_final",
  "assets",
]);

const CLUSTERS = [
  {
    title: "Branchenl&ouml;sungen",
    links: [
      ["branchen/index.html", "Branchen &amp; &Uuml;bersicht"],
      ["kunden/gesundheit/index.html", "Gesundheitswesen"],
      ["kunden/pharma/index.html", "Pharma"],
      ["kunden/lebensmittel/index.html", "Lebensmittel"],
      ["industrie/index.html", "Industrie"],
      ["kunden/gastronomie/index.html", "Gastronomie"],
      ["kunden/gemeinden/index.html", "Kommunen &amp; Gemeinden"],
    ],
  },
  {
    title: "Referenzen S&uuml;d &amp; West",
    links: [
      ["kunden/referenzen/baden-wuerttemberg/index.html", "Baden-W&uuml;rttemberg"],
      ["kunden/referenzen/bayern/index.html", "Bayern"],
      ["kunden/referenzen/hessen/index.html", "Hessen"],
      ["kunden/referenzen/rheinland-pfalz/index.html", "Rheinland-Pfalz"],
      ["kunden/referenzen/saarland/index.html", "Saarland"],
      ["kunden/referenzen/region-bodensee/index.html", "Region Bodensee"],
    ],
  },
  {
    title: "Referenzen Nord &amp; Ost",
    links: [
      ["kunden/referenzen/nrw/index.html", "Nordrhein-Westfalen"],
      ["kunden/referenzen/hamburg/index.html", "Gro&szlig;raum Hamburg"],
      ["kunden/referenzen/berlin/index.html", "Gro&szlig;raum Berlin"],
      ["kunden/referenzen/index.html", "Alle Referenzen"],
    ],
  },
];

function prefixFor(depth) {
  return depth === 0 ? "./" : "../".repeat(depth);
}

function isKundenSection(rel) {
  return (
    rel.startsWith("kunden/") ||
    rel.startsWith("branchen/") ||
    rel === "industrie/index.html"
  );
}

function buildDesktop(prefix, current) {
  const cur = current ? ' aria-current="page"' : "";
  const clusters = CLUSTERS.map((c) => {
    const links = c.links
      .map(
        ([href, label]) =>
          `              <a class="nav-link" href="${prefix}${href}"><span>${label}</span></a>`
      )
      .join("\n");
    return `            <div class="nav-cluster">\n              <p class="nav-cluster__title">${c.title}</p>\n${links}\n            </div>`;
  }).join("\n");

  return (
    `<div class="nav-item nav-item--wide nav-item--mega nav-item--mega-kunden">\n` +
    `          <a class="nav-trigger" href="${prefix}kunden/index.html"${cur}>Kunden</a>\n` +
    `          <div class="nav-dropdown nav-dropdown--mega nav-dropdown--mega-kunden">\n` +
    `${clusters}\n` +
    `          </div>\n` +
    `        </div>\n        `
  );
}

function buildMobile(prefix, current) {
  const cur = current ? ' aria-current="page"' : "";
  const items = CLUSTERS.map((c) => {
    const links = c.links
      .map(([href, label]) => `          <a class="mobile-link" href="${prefix}${href}">${label}</a>`)
      .join("\n");
    return `          <p class="mobile-menu__subtitle">${c.title}</p>\n${links}`;
  }).join("\n");

  return (
    `<div class="mobile-menu__group mobile-menu__group--mega mobile-menu__group--mega-kunden">\n` +
    `          <a class="mobile-menu__group-title" href="${prefix}kunden/index.html"${cur}>Kunden</a>\n` +
    `${items}\n` +
    `          <button type="button" class="mobile-link" data-inert>Extranet</button>\n` +
    `          <a class="mobile-link mobile-link--cta" href="${prefix}kontakt/angebot-anfordern/index.html">Angebot anfordern</a>\n` +
    `        </div>\n        `
  );
}

const DESKTOP_RE =
  /<div class="nav-item[^"]*">\s*<a class="nav-trigger"[^>]*>Kunden<\/a>[\s\S]*?(?=<div class="nav-item|<\/nav>)/;
const MOBILE_RE =
  /<div class="mobile-menu__group[^"]*">\s*<a class="mobile-menu__group-title"[^>]*>Kunden<\/a>[\s\S]*?(?=<div class="mobile-menu__group)/;

async function walk(dir, acc) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      await walk(path.join(dir, entry.name), acc);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      acc.push(path.join(dir, entry.name));
    }
  }
  return acc;
}

async function main() {
  const files = await walk(ROOT, []);
  let changed = 0;
  let skipped = 0;
  let nomatch = 0;

  for (const file of files) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    const depth = rel.split("/").length - 1;
    const prefix = prefixFor(depth);
    const isCurrent = isKundenSection(rel);
    let html = await fs.readFile(file, "utf8");
    const original = html;

    if (DESKTOP_RE.test(html)) {
      html = html.replace(DESKTOP_RE, buildDesktop(prefix, isCurrent));
    }
    if (MOBILE_RE.test(html)) {
      html = html.replace(MOBILE_RE, buildMobile(prefix, isCurrent));
    }

    if (html !== original) {
      await fs.writeFile(file, html, "utf8");
      changed++;
    } else if (/>Kunden<\/a>/.test(original)) {
      skipped++;
    } else {
      nomatch++;
    }
  }

  console.log(`Dateien gesamt: ${files.length}`);
  console.log(`aktualisiert:   ${changed}`);
  console.log(`unveraendert:   ${skipped}`);
  console.log(`kein Kunden-Eintrag: ${nomatch}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
