import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_XLS = path.join(ROOT, "asset-analysis/output/meta-alle-seiten.xls");
const OUT_CSV = path.join(ROOT, "asset-analysis/output/meta-alle-seiten.csv");

const SKIP_DIRS = new Set(["leadwerk_importer", "leadwerk_theme", "node_modules", "_xlsx_tmp"]);

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, files);
    else if (entry.name === "index.html") files.push(full);
  }
  return files;
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&uuml;/gi, "ü")
    .replace(/&auml;/gi, "ä")
    .replace(/&ouml;/gi, "ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&szlig;/gi, "ß")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ");
}

function extractMeta(html) {
  const titleRaw = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
  const descRaw =
    html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]?.trim() ??
    html.match(/<meta\s+content="([^"]*)"\s+name="description"/i)?.[1]?.trim() ??
    "";

  const title = decodeEntities(titleRaw);
  const description = decodeEntities(descRaw);

  return {
    title,
    description,
    titleLength: title.length,
    descriptionLength: description.length,
  };
}

function urlFromPath(relPath) {
  const posix = relPath.replace(/\\/g, "/");
  if (posix === "index.html") return "/";
  return `/${posix.replace(/\/index\.html$/, "/")}`;
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function csvEscape(value) {
  const s = String(value).replace(/"/g, '""');
  return `"${s}"`;
}

const headers = [
  "URL",
  "Dateipfad",
  "Meta-Titel",
  "Titel-Länge",
  "Meta-Description",
  "Description-Länge",
  "Description fehlt",
];

const rows = [];

for (const file of walkHtml(ROOT).sort()) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const meta = extractMeta(fs.readFileSync(file, "utf8"));

  rows.push([
    urlFromPath(rel),
    rel,
    meta.title,
    meta.titleLength,
    meta.description,
    meta.descriptionLength,
    meta.description ? "Nein" : "Ja",
  ]);
}

const csvLines = [
  headers.map(csvEscape).join(";"),
  ...rows.map((row) => row.map(csvEscape).join(";")),
];
fs.writeFileSync(OUT_CSV, `\uFEFF${csvLines.join("\r\n")}`, "utf8");

const xmlRows = [
  `<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`).join("")}</Row>`,
  ...rows.map(
    (row) =>
      `<Row>${row
        .map((cell, i) => {
          const type = i === 3 || i === 5 ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${xmlEscape(cell)}</Data></Cell>`;
        })
        .join("")}</Row>`,
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E8F4FF" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Meta-Daten">
    <Table>
      ${xmlRows.join("\n      ")}
    </Table>
  </Worksheet>
</Workbook>`;

fs.writeFileSync(OUT_XLS, `\uFEFF${xml}`, "utf8");

console.log(`Exportiert: ${rows.length} Seiten`);
console.log(`Excel: ${OUT_XLS}`);
console.log(`CSV (Fallback): ${OUT_CSV}`);
