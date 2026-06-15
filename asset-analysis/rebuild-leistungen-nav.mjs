// Rollt die neue 2-stufige Leistungs-Navigation (5-Cluster-Mega-Menue) in alle
// produktiven Root-HTML-Seiten aus. Ersetzt den bestehenden Leistungen-Eintrag
// (Desktop nav-item + Mobile mobile-menu__group) durch die Cluster-Struktur.
// Tiefenabhaengige relative Pfade, idempotent (matcht alte UND neue Struktur),
// ohne leadwerk_* / asset-analysis / Bildmaterial usw.
//
// Aufruf:  node asset-analysis/rebuild-leistungen-nav.mjs

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

// Cluster-Definition (root-relative Slugs, Labels mit HTML-Entities)
const CLUSTERS = [
  {
    title: "Betreiberpflicht &amp; Hygieneinspektion",
    links: [
      ["hygieneinspektion-vdi-6022/index.html", "Hygieneinspektion VDI 6022"],
      ["rlt-hygiene/index.html", "RLT-Hygiene"],
      ["leistungen/vdi-6022-pruefbericht-musterbericht/index.html", "VDI 6022 Pr&uuml;fbericht &amp; Musterbericht"],
      ["leistungen/luftkeimmessung-rlt-anlagen/index.html", "Luftkeimmessung RLT-Anlagen"],
      ["gefaehrdungsbeurteilung-vdi-2047/index.html", "Gef&auml;hrdungsbeurteilung VDI 2047-2"],
      ["leistungen/inspektionundgutachten/index.html", "Inspektion &amp; Gutachten"],
    ],
  },
  {
    title: "Reinigung &amp; Instandhaltung",
    links: [
      ["anlagen/lueftungsreinigung/index.html", "L&uuml;ftungsreinigung"],
      ["anlagen/luftkanalreinigung/index.html", "Luftkanalreinigung"],
      ["anlagen/lueftungsanlagenreinigung/index.html", "RLT-Anlagenreinigung"],
      ["leistungen/rlt-reinigung-industrie/index.html", "RLT-Reinigung Industrie"],
      ["leistungen/lueftungsreinigung-krankenhaus-klinik/index.html", "L&uuml;ftungsreinigung Krankenhaus / Klinik"],
      ["leistungen/reinigung-desinfektion/index.html", "Reinigung &amp; Desinfektion"],
    ],
  },
  {
    title: "K&uuml;hlturm &amp; Verdunstungsk&uuml;hlanlagen",
    links: [
      ["anlagen/kuehlturmreinigung/index.html", "K&uuml;hlturmreinigung"],
      ["leistungen/verdunstungskuehlanlage-vdi-2047-42-bimschv/index.html", "Verdunstungsk&uuml;hlanlage VDI 2047-2"],
      ["leistungen/kuehlturm-entkalkung-biofilm/index.html", "K&uuml;hlturm Entkalkung &amp; Biofilm"],
      ["leistungen/kuehlturm-sanierung-fuellkoerper-duesen/index.html", "K&uuml;hlturm-Sanierung"],
    ],
  },
  {
    title: "OP, Reinraum &amp; Filterpr&uuml;fung",
    links: [
      ["anlagen/op-raum-pruefung/index.html", "OP-Raum DIN 1946-4"],
      ["anlagen/reinraumqualifizierung/index.html", "Reinraum ISO 14644"],
      ["leistungen/partikelmessung-reinraum-iso-14644/index.html", "Partikelmessung Reinraum"],
      ["leistungen/dehs-leckpruefung-op-raum/index.html", "DEHS-Leckpr&uuml;fung OP-Raum"],
      ["filterintegritaetstest/index.html", "Filterintegrit&auml;tstest"],
      ["lecktest-schwebstofffilter/index.html", "Schwebstofffilter-Lecktest"],
    ],
  },
  {
    title: "Energie &amp; Sanierung",
    links: [
      ["energetische-inspektion-geg-2020/index.html", "Energetische Inspektion GEG"],
      ["leistungen/rlt-sanierung-korrosion-2k-epoxy/index.html", "RLT-Sanierung Korrosion &amp; 2K-Epoxy"],
      ["leistungen/instandsetzung-sanierung/index.html", "Instandsetzung &amp; Sanierung"],
    ],
  },
];

function prefixFor(depth) {
  return depth === 0 ? "./" : "../".repeat(depth);
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
  // Promo-Kachel als 6. Rasterzelle (3x2-Raster), modern im CD
  const promo =
    `            <div class="nav-mega__promo">\n` +
    `              <p class="nav-mega__promo-eyebrow">Technische Hygiene</p>\n` +
    `              <p class="nav-mega__promo-title">Welche Leistung brauchen Sie?</p>\n` +
    `              <p class="nav-mega__promo-text">Wir beraten Sie zu Betreiberpflicht, Normen und auditf&auml;higer Dokumentation.</p>\n` +
    `              <a class="nav-mega__cta" href="${prefix}kontakt/angebot-anfordern/index.html">Angebot anfordern</a>\n` +
    `              <a class="nav-mega__all" href="${prefix}leistungen/index.html">Alle Leistungen ansehen</a>\n` +
    `            </div>`;
  return (
    `<div class="nav-item nav-item--wide nav-item--mega">\n` +
    `          <a class="nav-trigger" href="${prefix}leistungen/index.html"${cur}>Leistungen</a>\n` +
    `          <div class="nav-dropdown nav-dropdown--mega">\n` +
    `${clusters}\n` +
    `${promo}\n` +
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
    `<div class="mobile-menu__group mobile-menu__group--mega">\n` +
    `          <a class="mobile-menu__group-title" href="${prefix}leistungen/index.html"${cur}>Leistungen</a>\n` +
    `${items}\n` +
    `          <a class="mobile-link mobile-link--cta" href="${prefix}kontakt/angebot-anfordern/index.html">Angebot anfordern</a>\n` +
    `        </div>\n        `
  );
}

// Desktop: vom Leistungen-nav-item bis zum naechsten nav-item / </nav>
const DESKTOP_RE = /<div class="nav-item[^"]*">\s*<a class="nav-trigger"[^>]*>Leistungen<\/a>[\s\S]*?(?=<div class="nav-item|<\/nav>)/;
// Mobile: von der Leistungen-Gruppe bis zur naechsten mobile-menu__group
// (klassen-tolerant, damit Re-Runs mit mobile-menu__group--mega greifen)
const MOBILE_RE = /<div class="mobile-menu__group[^"]*">\s*<a class="mobile-menu__group-title"[^>]*>Leistungen<\/a>[\s\S]*?(?=<div class="mobile-menu__group)/;

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
    const isCurrent = rel.startsWith("leistungen/");
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
    } else if (/>Leistungen<\/a>/.test(original)) {
      skipped++;
    } else {
      nomatch++;
    }
  }
  console.log(`Dateien gesamt: ${files.length}`);
  console.log(`aktualisiert:   ${changed}`);
  console.log(`unveraendert:   ${skipped}`);
  console.log(`kein Leistungen-Eintrag: ${nomatch}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
