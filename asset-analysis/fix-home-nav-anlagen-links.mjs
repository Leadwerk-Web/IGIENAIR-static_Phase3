import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");

const TARGETS = [
  { file: "index.html", anlagen: "./anlagen/", filter: "./filterintegritaetstest/" },
  { file: "unternehmen/index.html", anlagen: "../anlagen/", filter: "../filterintegritaetstest/" },
  { file: "unternehmen/qualitaet/index.html", anlagen: "../../anlagen/", filter: "../../filterintegritaetstest/" },
  { file: "unternehmen/zertifizierungen/index.html", anlagen: "../../anlagen/", filter: "../../filterintegritaetstest/" },
];

function link(cls, href, label) {
  return `<a class="${cls}" href="${href}">${label}</a>`;
}

function patch(html, anlagen, filter) {
  const pairs = [
    [
      /<button type="button" class="(nav-link|mobile-link)" data-inert>Zu- &amp; Abluftkanäle<\/button>/g,
      (_, cls) => link(cls, `${anlagen}luftkanalreinigung/index.html`, "Zu- &amp; Abluftkan&auml;le"),
    ],
    [
      /<button type="button" class="(nav-link|mobile-link)" data-inert>Reinräume<\/button>/g,
      (_, cls) => link(cls, `${anlagen}reinraumqualifizierung/index.html`, "Reinr&auml;ume"),
    ],
    [
      /<button type="button" class="(nav-link|mobile-link)" data-inert>OP-Räume<\/button>/g,
      (_, cls) => link(cls, `${anlagen}op-raum-pruefung/index.html`, "OP-R&auml;ume"),
    ],
    [
      /<button type="button" class="(nav-link|mobile-link)" data-inert>Kühlregale<\/button>/g,
      (_, cls) => link(cls, `${anlagen}kuehlregale/index.html`, "K&uuml;hlregale"),
    ],
    [
      /<button type="button" class="(nav-link|mobile-link)" data-inert>Textilschläuche<\/button>/g,
      (_, cls) => link(cls, `${anlagen}textilschlaeuche/index.html`, "Textilschl&auml;uche"),
    ],
    [
      /<button type="button" class="(nav-link|mobile-link)" data-inert>Filterintegritätstest<\/button>/g,
      (_, cls) => link(cls, `${filter}index.html`, "Filterintegrit&auml;tstest"),
    ],
  ];

  let next = html;
  for (const [re, replacer] of pairs) {
    next = next.replace(re, replacer);
  }
  return next;
}

for (const { file, anlagen, filter } of TARGETS) {
  const full = path.join(ROOT, file);
  const html = fs.readFileSync(full, "utf8");
  const next = patch(html, anlagen, filter);
  if (next === html) {
    console.warn(`Keine Änderung: ${file}`);
    continue;
  }
  fs.writeFileSync(full, next, "utf8");
  const remaining = (next.match(/data-inert/g) || []).length;
  console.log(`Aktualisiert: ${file} (${remaining} data-inert verbleibend, nur Extranet)`);
}
