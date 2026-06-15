import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIVE_JSON = path.join(ROOT, "asset-analysis/output/seitenstruktur.json");
const OUT_XLS = path.join(ROOT, "asset-analysis/output/url-vergleich-static-live.xls");
const OUT_CSV = path.join(ROOT, "asset-analysis/output/url-vergleich-static-live.csv");

const SKIP_DIRS = new Set(["leadwerk_importer", "leadwerk_theme", "node_modules", "_xlsx_tmp"]);
const LIVE_ORIGIN = "https://igienair.de";

const pathAliases = {
  "/kontakt/": "kontakt/index.html",
  "/kunden/gesundheit/": "kunden/gesundheit/index.html",
  "/gastronomie/": "kunden/gastronomie/index.html",
  "/gemeinden/": "kunden/gemeinden/index.html",
  "/gesundheitswesen/": "kunden/gesundheit/index.html",
  "/lebensmittel/": "kunden/lebensmittel/index.html",
  "/pharma/": "kunden/pharma/index.html",
  "/inspektionundgutachten/": "leistungen/inspektionundgutachten/index.html",
  "/instandsetzung-sanierung/": "leistungen/instandsetzung-sanierung/index.html",
  "/reinigung-desinfektion/": "leistungen/reinigung-desinfektion/index.html",
};

const legacyStaticStubs = new Set([
  "gastronomie/index.html",
  "gemeinden/index.html",
  "gesundheitswesen/index.html",
  "lebensmittel/index.html",
  "pharma/index.html",
  "inspektionundgutachten/index.html",
  "instandsetzung-sanierung/index.html",
  "reinigung-desinfektion/index.html",
]);

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, files);
    else if (entry.name === "index.html") files.push(path.relative(ROOT, full).replace(/\\/g, "/"));
  }
  return files;
}

function normalizeLivePath(p) {
  if (p === "/" || p === "") return "/";
  return p.endsWith("/") ? p : `${p}/`;
}

function staticFileToUrlPath(file) {
  if (file === "index.html") return "/";
  return `/${file.replace(/\/index\.html$/, "")}/`;
}

function livePathToStaticFile(livePath, htmlFiles) {
  const normalized = normalizeLivePath(livePath);
  if (pathAliases[normalized]) {
    return pathAliases[normalized];
  }
  if (normalized === "/") return "index.html";
  const slugPath = normalized.replace(/^\/|\/$/g, "");
  const candidates = [`${slugPath}/index.html`, `${slugPath}.html`];
  return candidates.find((c) => htmlFiles.has(c)) ?? null;
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function csvEscape(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function writeSpreadsheet(rows, headers, outXls, outCsv) {
  const csvLines = [
    headers.map(csvEscape).join(";"),
    ...rows.map((row) => row.map(csvEscape).join(";")),
  ];
  fs.writeFileSync(outCsv, `\uFEFF${csvLines.join("\r\n")}`, "utf8");

  const xmlRows = [
    `<Row>${headers.map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`).join("")}</Row>`,
    ...rows.map(
      (row) =>
        `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${xmlEscape(cell)}</Data></Cell>`).join("")}</Row>`,
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E8F4FF" ss:Pattern="Solid"/></Style>
  </Styles>
  <Worksheet ss:Name="URL-Vergleich">
    <Table>${xmlRows.join("")}</Table>
  </Worksheet>
</Workbook>`;

  fs.writeFileSync(outXls, `\uFEFF${xml}`, "utf8");
}

if (!fs.existsSync(LIVE_JSON)) {
  console.error(`Live-Daten fehlen: ${LIVE_JSON}`);
  console.error("Bitte zuerst ausführen: node asset-analysis/crawl-seitenstruktur.mjs");
  process.exit(1);
}

const liveData = JSON.parse(fs.readFileSync(LIVE_JSON, "utf8"));
const htmlFiles = new Set(walkHtml(ROOT));
const matchedStatic = new Set();
const rows = [];

for (const page of liveData.pages.sort((a, b) => a.path.localeCompare(b.path, "de"))) {
  const livePath = normalizeLivePath(page.path);
  const liveUrl = page.url.startsWith("http") ? page.url : `${LIVE_ORIGIN}${livePath}`;
  const staticFile = livePathToStaticFile(livePath, htmlFiles);
  const staticUrlPath = staticFile ? staticFileToUrlPath(staticFile) : "";

  let status;
  let hinweis = "";

  if (staticFile && htmlFiles.has(staticFile)) {
    matchedStatic.add(staticFile);
    if (legacyStaticStubs.has(staticFile)) {
      status = "Beide (Legacy-Stub)";
      hinweis = "Static-Datei ist Legacy-Weiterleitung; Live nutzt kanonischen Pfad";
    } else if (pathAliases[livePath] && pathAliases[livePath] !== staticFile) {
      status = "Beide (Alias)";
      hinweis = `Live-Pfad alias → ${pathAliases[livePath]}`;
    } else if (staticUrlPath !== livePath && !pathAliases[livePath]) {
      status = "Beide (Pfad abweichend)";
      hinweis = `Static-URL ${staticUrlPath} ≠ Live ${livePath}`;
    } else {
      status = "Beide";
    }
  } else {
    status = "Nur Live";
    hinweis = staticFile ? `Erwartet: ${staticFile}` : "Keine Static-Datei gefunden";
  }

  rows.push([
    status,
    liveUrl,
    livePath,
    staticFile ?? "",
    staticFile ? `${LIVE_ORIGIN}${staticUrlPath}` : "",
    staticUrlPath,
    hinweis,
  ]);
}

for (const file of [...htmlFiles].sort((a, b) => a.localeCompare(b, "de"))) {
  if (matchedStatic.has(file)) continue;

  const staticUrlPath = staticFileToUrlPath(file);
  let status = "Nur Static";
  let hinweis = "";

  if (file === "danke/index.html") {
    hinweis = "Danke-Seite nach Formular – ggf. nicht in Live-Sitemap";
  } else if (legacyStaticStubs.has(file)) {
    status = "Nur Static (Legacy-Stub)";
    hinweis = "Alte Root-URL; kanonische Seite unter /kunden/ oder /leistungen/";
  } else {
    hinweis = "In Static vorhanden, nicht in Live-Crawl/Sitemap";
  }

  rows.push([
    status,
    "",
    "",
    file,
    `${LIVE_ORIGIN}${staticUrlPath}`,
    staticUrlPath,
    hinweis,
  ]);
}

rows.sort((a, b) => {
  const order = { Beide: 0, "Beide (Alias)": 1, "Beide (Pfad abweichend)": 2, "Beide (Legacy-Stub)": 3, "Nur Live": 4, "Nur Static": 5, "Nur Static (Legacy-Stub)": 6 };
  const diff = (order[a[0]] ?? 9) - (order[b[0]] ?? 9);
  if (diff !== 0) return diff;
  return (a[2] || a[3]).localeCompare(b[2] || b[3], "de");
});

const headers = [
  "Status",
  "Live-URL",
  "Live-Pfad",
  "Static-Dateipfad",
  "Static-URL (abgeleitet)",
  "Static-Pfad",
  "Hinweis",
];

writeSpreadsheet(rows, headers, OUT_XLS, OUT_CSV);

const counts = rows.reduce((acc, [status]) => {
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {});

console.log(`Live-Seiten (Quelle): ${liveData.pages.length} (${liveData.generatedAt})`);
console.log(`Static-Seiten: ${htmlFiles.size}`);
console.log(`Export-Zeilen: ${rows.length}`);
console.log("Status:", counts);
console.log(`Excel: ${OUT_XLS}`);
console.log(`CSV: ${OUT_CSV}`);
