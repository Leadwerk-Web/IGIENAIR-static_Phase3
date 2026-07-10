import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const DE_SRC = path.join(ROOT, "Bildmaterial_final/icons/germany-admin-map_Staedte.svg");
const AT_SRC = path.join(ROOT, "Bildmaterial_final/icons/Map_of_Austria.svg");

const TARGETS = [
  path.join(ROOT, "index.html"),
  path.join(ROOT, "unternehmen/index.html"),
  path.join(ROOT, "kontakt/index.html"),
];

const CITY_META = {
  Karlsruhe: { label: "Ettlingen", region: "Baden-Württemberg" },
  Tuttlingen: { label: "Stockach", region: "Bodensee" },
  Oberasbach: { label: "Oberasbach", region: "Bayern" },
  Eching: { label: "Eching", region: "Bayern" },
  Niederhausen: { label: "Niedernhausen", region: "Hessen" },
  Leichlingen: { label: "Leichlingen", region: "Nordrhein-Westfalen" },
  Winsen: { label: "Winsen (Luhe)", region: "Niedersachsen" },
  Berlin: { label: "Berlin", region: "Berlin" },
};

const DE_MAP_DEFS = `<defs>
    <linearGradient id="de-map-land-gradient" x1="72" y1="48" x2="420" y2="620" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#d4ebff"/>
      <stop offset="38%" stop-color="#9fd0ff"/>
      <stop offset="72%" stop-color="#6eb5f2"/>
      <stop offset="100%" stop-color="#3d8fd9"/>
    </linearGradient>
    <linearGradient id="de-map-city-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4ec4ff"/>
      <stop offset="55%" stop-color="#0194e8"/>
      <stop offset="100%" stop-color="#0154a8"/>
    </linearGradient>
    <filter id="de-map-land-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#0161bf" flood-opacity="0.18"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#073975" flood-opacity="0.12"/>
    </filter>
    <filter id="de-map-city-glow" x="-120%" y="-120%" width="340%" height="340%">
      <feDropShadow dx="0" dy="3" stdDeviation="4.5" flood-color="#0161bf" flood-opacity="0.36"/>
    </filter>
  </defs>`;

const AT_MAP_DEFS = `<defs>
    <linearGradient id="at-map-land-gradient" x1="72" y1="48" x2="760" y2="420" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#d4ebff"/>
      <stop offset="38%" stop-color="#9fd0ff"/>
      <stop offset="72%" stop-color="#6eb5f2"/>
      <stop offset="100%" stop-color="#3d8fd9"/>
    </linearGradient>
    <linearGradient id="at-map-city-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4ec4ff"/>
      <stop offset="55%" stop-color="#0194e8"/>
      <stop offset="100%" stop-color="#0154a8"/>
    </linearGradient>
    <filter id="at-map-land-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#0161bf" flood-opacity="0.18"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#073975" flood-opacity="0.12"/>
    </filter>
    <filter id="at-map-city-glow" x="-120%" y="-120%" width="340%" height="340%">
      <feDropShadow dx="0" dy="3" stdDeviation="4.5" flood-color="#0161bf" flood-opacity="0.36"/>
    </filter>
  </defs>`;

function buildDeInlineSvg() {
  let svg = fs.readFileSync(DE_SRC, "utf8");
  svg = svg.replace(/<\?xml[^?]*\?>\s*/i, "");
  svg = svg.replace(/<!--[\s\S]*?-->\s*/g, "");
  svg = svg.replace(/<style>[\s\S]*?<\/style>\s*/i, "");
  const viewBox = svg.match(/viewBox="([^"]+)"/i)?.[1] ?? "0 0 472.95 639.41";
  svg = svg.replace(
    /<svg[^>]*>/i,
    `<svg xmlns="http://www.w3.org/2000/svg" class="de-map__svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Deutschlandkarte – Igienair Standorte">`
  );
  svg = svg.replace(/<defs>[\s\S]*?<\/defs>\s*/i, "");
  svg = svg.replace(/<svg[^>]*>/i, (match) => `${match}\n  ${DE_MAP_DEFS}\n`);
  svg = svg.replace(/<rect[^>]*\/?>\s*/gi, "");

  if (/class="cls-3"/.test(svg)) {
    svg = svg.replace(/<path class="cls-3"/g, '<path class="de-map__bg"');
    svg = svg.replace(
      /((?:<path class="de-map__bg"[\s\S]*?\/>)+)/i,
      '<g class="de-map__land-shape">\n    $1\n  </g>'
    );
  } else {
    svg = svg.replace(
      /<g>\s*((?:<path[\s\S]*?\/>[\s]*)+)<\/g>/i,
      (_, paths) => {
        const styled = paths.replace(/<path(?=\s)/g, '<path class="de-map__bg"');
        return `<g class="de-map__land-shape">\n    ${styled.trim()}\n  </g>`;
      }
    );
  }

  for (const [id, meta] of Object.entries(CITY_META)) {
    const patterns = [
      new RegExp(
        `<circle\\s+id="${id}"\\s+class="cls-\\d+"\\s+cx="([^"]+)"\\s+cy="([^"]+)"\\s+r="([^"]+)"\\s*/>`,
        "i"
      ),
      new RegExp(
        `<circle\\s+id="${id}"[^>]*\\bcx="([^"]+)"[^>]*\\bcy="([^"]+)"[^>]*\\br="([^"]+)"[^>]*/>`,
        "i"
      ),
    ];
    for (const re of patterns) {
      if (re.test(svg)) {
        svg = svg.replace(
          re,
          `<circle class="de-map__land de-map__city" id="${id}" data-label="${meta.label}" cx="$1" cy="$2" r="$3" aria-label="${meta.label}"><title>${meta.label}</title></circle>`
        );
        break;
      }
    }
  }

  return svg.trim();
}

function buildAtInlineSvg() {
  let svg = fs.readFileSync(AT_SRC, "utf8");
  svg = svg.replace(/<\?xml[^?]*\?>\s*/i, "");
  svg = svg.replace(/<!--[\s\S]*?-->\s*/g, "");
  svg = svg.replace(/<style>[\s\S]*?<\/style>\s*/i, "");
  svg = svg.replace(/<defs>[\s\S]*?<\/defs>\s*/i, "");

  const viewBox = svg.match(/viewBox="([^"]+)"/i)?.[1] ?? "0 0 830 450";
  let body = svg.replace(/<svg[^>]*>/i, "").replace(/<\/svg>\s*$/i, "");

  body = body.replace(/<path id="Shadow"[^>]*\/>/i, "");

  let circleMarkup = "";
  body = body.replace(/<circle[^>]*id="Eching"[^>]*\/>/i, (match) => {
    const cx = match.match(/cx="([^"]+)"/i)?.[1] ?? "448.74";
    const cy = match.match(/cy="([^"]+)"/i)?.[1] ?? "259.19";
    const r = match.match(/r="([^"]+)"/i)?.[1] ?? "6.77";
    circleMarkup = `<circle class="de-map__land de-map__city" id="AtEching" data-label="Klagenfurt" cx="${cx}" cy="${cy}" r="${r}" aria-label="Klagenfurt"><title>Klagenfurt</title></circle>`;
    return "";
  });

  body = body.replace(/<path id="AT-[^"]+" class="cls-1"/g, '<path class="de-map__bg"');
  body = body.replace(/<g id="[^"]+">/g, "");
  body = body.replace(/<\/g>/g, "");
  body = body.replace(/\s{2,}/g, " ").trim();

  return `<svg xmlns="http://www.w3.org/2000/svg" class="de-map__svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Österreichkarte – Igienair Standorte">
  ${AT_MAP_DEFS}
  <g class="de-map__land-shape">
    ${body.trim()}
  </g>
  ${circleMarkup}
</svg>`.trim();
}

function buildMapBlock(deSvg, atSvg, indent = "          ") {
  const triggerIcon = `<svg class="presence-map-austria-trigger__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  return `${indent}<div class="presence-map-wrap">
${indent}  <div class="de-map de-map--germany" data-presence-map data-presence-map-mode="staedte">
${indent}    <div class="de-map__stage de-map__stage--staedte">
${indent}      <div class="de-map__svg-host" data-presence-map-svg>${deSvg}</div>
${indent}      <span class="de-map__tooltip" data-presence-map-tooltip role="status" aria-live="polite"></span>
${indent}    </div>
${indent}  </div>
${indent}  <div class="presence-map-austria-control">
${indent}    <button type="button" class="presence-map-austria-trigger" data-austria-map-open aria-haspopup="dialog">
${indent}      <span class="presence-map-austria-trigger__label">Österreich</span>
${indent}      ${triggerIcon}
${indent}    </button>
${indent}  </div>
${indent}  <div class="austria-map-lightbox" data-austria-map-lightbox hidden>
${indent}    <button type="button" class="austria-map-lightbox__backdrop" data-austria-map-close aria-label="Lightbox schließen"></button>
${indent}    <div class="austria-map-lightbox__dialog" role="dialog" aria-modal="true" aria-labelledby="austria-map-lightbox-title">
${indent}      <div class="austria-map-lightbox__header">
${indent}        <h2 class="austria-map-lightbox__title" id="austria-map-lightbox-title">Standorte in Österreich</h2>
${indent}        <button type="button" class="austria-map-lightbox__close" data-austria-map-close aria-label="Schließen">
${indent}          <span aria-hidden="true">&times;</span>
${indent}        </button>
${indent}      </div>
${indent}      <div class="austria-map-lightbox__body">
${indent}        <div class="de-map de-map--austria" data-presence-map data-presence-map-mode="staedte">
${indent}          <div class="de-map__stage de-map__stage--austria">
${indent}            <div class="de-map__svg-host" data-presence-map-svg>${atSvg}</div>
${indent}            <span class="de-map__tooltip" data-presence-map-tooltip role="status" aria-live="polite"></span>
${indent}          </div>
${indent}        </div>
${indent}      </div>
${indent}    </div>
${indent}  </div>
${indent}</div>`;
}

const blockRegex =
  /<div class="(?:presence-map-wrap|dach-map)">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

function replaceMapBlock(html, mapBlock) {
  const markers = ['<div class="presence-map-wrap">', '<div class="dach-map">'];
  let start = -1;

  for (const marker of markers) {
    const index = html.indexOf(marker);
    if (index !== -1 && (start === -1 || index < start)) {
      start = index;
    }
  }

  if (start !== -1) {
    let depth = 0;
    let end = start;
    for (let i = start; i < html.length; i += 1) {
      if (html.startsWith("<div", i)) {
        depth += 1;
      }
      if (html.startsWith("</div>", i)) {
        depth -= 1;
        if (depth === 0) {
          end = i + 6;
          break;
        }
      }
    }
    if (end > start) {
      return `${html.slice(0, start)}${mapBlock.trim()}${html.slice(end)}`;
    }
  }

  if (!blockRegex.test(html)) {
    return null;
  }

  return html.replace(blockRegex, mapBlock.trim());
}

const deSvg = buildDeInlineSvg();
const atSvg = buildAtInlineSvg();
const mapBlock = buildMapBlock(deSvg, atSvg);

for (const target of TARGETS) {
  if (!fs.existsSync(target)) {
    console.warn(`Übersprungen (nicht gefunden): ${path.relative(ROOT, target)}`);
    continue;
  }

  let html = fs.readFileSync(target, "utf8");
  const updated = replaceMapBlock(html, mapBlock);
  if (!updated) {
    console.warn(`Kein Karten-Block in ${path.relative(ROOT, target)}`);
    continue;
  }

  fs.writeFileSync(target, updated, "utf8");
  console.log(`DACH-Karte eingebettet: ${path.relative(ROOT, target)}`);
}

console.log(`Fertig (DE: ${deSvg.length} Zeichen, AT: ${atSvg.length} Zeichen).`);
