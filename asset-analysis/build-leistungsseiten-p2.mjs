// Erzeugt die sieben neuen Phase-2-Leistungsseiten aus dem bestehenden Template
// (leistungen/inspektionundgutachten/index.html). Chrome (Header/Quick-Rail/
// Footer + neue Mega-Navigation) wird 1:1 uebernommen (Tiefe 2 -> ../../),
// Head-Meta und <main> werden ersetzt, JSON-LD (BreadcrumbList + Service +
// FAQPage) eingefuegt.
//
// Reihenfolge: erst rebuild-leistungen-nav.mjs laufen lassen (damit das Template
// die aktuelle Navigation traegt), dann dieses Skript, dann ggf. nochmal die
// Navigation ausrollen.
//
// Aufruf:  node asset-analysis/build-leistungsseiten-p2.mjs

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEMPLATE = path.join(ROOT, "leistungen", "inspektionundgutachten", "index.html");

const T = {
  title: "<title>Hygieneinspektionen und Gefährdungsbeurteilungen</title>",
  desc: '<meta name="description" content="Igienair bietet umfassende Leistungen zur Einschätzung und Bewertung Ihrer RLT-Anlagen mit Lüftungskanälen und Kühltürmen.">',
  ogTitle: '<meta property="og:title" content="Hygieneinspektionen und Gefährdungsbeurteilungen">',
  ogDesc: '<meta property="og:description" content="Igienair bietet umfassende Leistungen zur Einschätzung und Bewertung Ihrer RLT-Anlagen mit Lüftungskanälen und Kühltürmen.">',
  ogUrl: '<meta property="og:url" content="https://igienair.de/inspektionundgutachten/">',
  canonical: '<link rel="canonical" href="https://igienair.de/inspektionundgutachten/">',
};

function faqHtml(slug, faqs) {
  const items = faqs
    .map((f, i) => {
      const n = i + 1;
      const open = i === 0 ? " is-open" : "";
      const expanded = i === 0 ? "true" : "false";
      const hidden = i === 0 ? "" : " hidden";
      return `          <article class="accordion-item${open}" data-accordion-item>
            <h3 class="accordion-item__heading">
              <button class="accordion-item__trigger" type="button" aria-expanded="${expanded}" aria-controls="${slug}-panel-${n}" id="${slug}-trigger-${n}" data-accordion-trigger>${f.q}</button>
            </h3>
            <div class="accordion-item__panel" id="${slug}-panel-${n}" role="region" aria-labelledby="${slug}-trigger-${n}" data-accordion-panel${hidden}>
              <p>${f.a}</p>
            </div>
          </article>`;
    })
    .join("\n\n");
  return `    <section class="sustainability-accordion-section home-faq" data-section="faq" id="${slug}-faq">
      <div class="container faq-section">
        <header class="faq-section__header">
          <p class="eyebrow">HÄUFIGE FRAGEN</p>
          <h2>Häufige Fragen</h2>
          <div class="gradient-line"></div>
        </header>

        <div class="accordion faq-accordion" data-accordion>
${items}
        </div>
      </div>
    </section>`;
}

function faqJsonText(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "–")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß")
    .replace(/"/g, '\\"');
}

function jsonLd(name, serviceType, url, breadcrumb, faqs) {
  const crumbs = breadcrumb
    .map((b, i) => `          { "@type": "ListItem", "position": ${i + 1}, "name": "${b.name}", "item": "${b.item}" }`)
    .join(",\n");
  const qa = faqs
    .map(
      (f) =>
        `          { "@type": "Question", "name": "${faqJsonText(f.q)}", "acceptedAnswer": { "@type": "Answer", "text": "${faqJsonText(f.a)}" } }`
    )
    .join(",\n");
  return `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
${crumbs}
        ]
      },
      {
        "@type": "Service",
        "name": "${name}",
        "serviceType": "${serviceType}",
        "provider": { "@type": "Organization", "name": "IGIENAIR GmbH", "url": "https://igienair.de/" },
        "areaServed": "DE",
        "url": "${url}"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
${qa}
        ]
      }
    ]
  }
  </script>
`;
}

// Hilfsbausteine fuer wiederkehrende Sektionen ------------------------------

function introSection(id, eyebrow, h2, paragraphHtml, ctaLabel) {
  return `    <section class="services-intro" id="${id}" data-section="intro">
      <div class="container">
        <article class="section-copy">
          <p class="eyebrow">${eyebrow}</p>
          <h2>${h2}</h2>
          <div class="gradient-line"></div>
          <p>${paragraphHtml}</p>
          <a class="button button--solid" href="../../kontakt/angebot-anfordern/index.html">${ctaLabel}</a>
        </article>
      </div>
    </section>`;
}

function decisionSection(eyebrow, h2, cards) {
  const c = cards
    .map((x) => `          <div class="svc-decision__card"><h3>${x.t}</h3><p>${x.p}</p></div>`)
    .join("\n");
  return `    <section class="svc-section svc-section--soft" data-section="ausloeser">
      <div class="container">
        <header class="section-copy svc-section__head">
          <p class="eyebrow">${eyebrow}</p>
          <h2>${h2}</h2>
          <div class="gradient-line"></div>
        </header>
        <div class="svc-decision">
${c}
        </div>
      </div>
    </section>`;
}

function infoboxSection(eyebrow, h2, boxTitle, items) {
  const li = items.map((x) => `            <li>${x}</li>`).join("\n");
  return `    <section class="svc-section svc-section--soft" data-section="info">
      <div class="container">
        <header class="section-copy svc-section__head">
          <p class="eyebrow">${eyebrow}</p>
          <h2>${h2}</h2>
          <div class="gradient-line"></div>
        </header>
        <div class="svc-infobox">
          <h3>${boxTitle}</h3>
          <ul class="svc-checklist">
${li}
          </ul>
        </div>
      </div>
    </section>`;
}

function mediaSection(eyebrow, h2, paragraphsHtml, image, imageAlt, ctaLabel) {
  const paras = paragraphsHtml.map((p) => `            <p>${p}</p>`).join("\n");
  return `    <section class="svc-section" data-section="ablauf">
      <div class="container reference-overview__layout">
        <div class="cleanroom-overview__grid">
          <article class="section-copy">
            <p class="eyebrow">${eyebrow}</p>
            <h2>${h2}</h2>
            <div class="gradient-line"></div>
${paras}
            <a class="button button--solid" href="../../kontakt/angebot-anfordern/index.html">${ctaLabel}</a>
          </article>
          <figure class="company-media-card">
            <img src="${image}" alt="${imageAlt}">
          </figure>
        </div>
      </div>
    </section>`;
}

function relatedSection(links) {
  const li = links.map(([href, label]) => `          <li><a href="${href}">${label}</a></li>`).join("\n");
  return `    <section class="svc-section svc-section--soft" data-section="weiter">
      <div class="container">
        <header class="section-copy svc-section__head">
          <p class="eyebrow">WEITERFÜHREND</p>
          <h2>Passende Leistungen</h2>
          <div class="gradient-line"></div>
        </header>
        <ul class="svc-related">
${li}
        </ul>
      </div>
    </section>`;
}

// ---------------------------------------------------------------------------
// Seiten-Definitionen (Phase 2)
// ---------------------------------------------------------------------------

const PAGES = [
  {
    dir: "leistungen/lueftungsreinigung-krankenhaus-klinik",
    title: "Lüftungsreinigung Krankenhaus | RLT-Hygiene",
    desc: "RLT- und Luftkanalreinigung für Krankenhäuser, Kliniken und OP-nahe Bereiche: normgerecht, dokumentiert und mit erfahrenem Fachpersonal.",
    h1: "Lüftungsreinigung für Krankenhäuser und Kliniken",
    crumbCurrent: "Lüftungsreinigung Krankenhaus / Klinik",
    serviceName: "Lüftungsreinigung für Krankenhäuser und Kliniken",
    serviceType: "Hygienetechnische RLT- und Luftkanalreinigung im Gesundheitswesen",
    image: "../../Bildmaterial_final/shared/anlagen-lueftungsreinigung7.webp",
    imageAlt: "RLT-Anlage zur Versorgung klinischer Bereiche",
    faqs: [
      { q: "Warum ist RLT-Hygiene in Kliniken besonders wichtig?", a: "In Krankenhäusern versorgen RLT-Anlagen sensible Bereiche mit Zuluft. Verschmutzte Kanäle und Komponenten können die Luftqualität und damit den Schutz von Patienten und Personal beeinträchtigen. Eine normgerechte Reinigung minimiert hygienische Risiken." },
      { q: "Worin unterscheidet sich die Reinigung von der OP-Raum-Qualifizierung?", a: "Die Lüftungsreinigung stellt den hygienischen Zustand der RLT-Anlage wieder her. Die OP-Raum-Qualifizierung nach DIN 1946-4 prüft messtechnisch die Funktion raumlufttechnischer Anlagen in OP-Bereichen. Beide Leistungen ergänzen sich." },
      { q: "Welche Normen sind maßgeblich?", a: "Maßgeblich sind die VDI 6022 für die Hygiene raumlufttechnischer Anlagen und die DIN EN 15780 für Sauberkeitsklassen und die Beurteilung des Reinigungsbedarfs. Alle Maßnahmen werden nachvollziehbar dokumentiert." },
      { q: "Wird der Klinikbetrieb gestört?", a: "Wir planen die Maßnahmen abschnittsweise und in Abstimmung mit dem Klinikbetrieb – auf Wunsch in Randzeiten oder definierten Wartungsfenstern, um Beeinträchtigungen so gering wie möglich zu halten." },
      { q: "Erhalten wir eine auditfähige Dokumentation?", a: "Ja. Sie erhalten eine Vorher-/Nachher-Dokumentation und einen Abschlussbericht als belastbaren Nachweis Ihrer Betreiberpflicht gegenüber Hygienefachkräften, Auditoren und Behörden." },
    ],
    sections: (p) => [
      introSection(
        "klinik-intro",
        "RLT-HYGIENE KLINIK",
        "Hygienisch einwandfreie Raumluft für sensible Klinikbereiche",
        `In Krankenhäusern und Kliniken transportieren raumlufttechnische Anlagen Zuluft in Patientenzimmer, Funktionsbereiche und OP-nahe Zonen. Ablagerungen in Kanälen, an Wärmeübertragern und in Filterkammern können die Luftqualität mindern und hygienische Risiken erhöhen. Als technischer Hygienedienstleister reinigen wir Ihre Anlagen normbezogen nach <a class="text-link" href="../../normen/vdi-6022/index.html">VDI 6022</a> und <a class="text-link" href="../../normen/din-en-15780/index.html">DIN EN 15780</a> – mit eigenem, festangestelltem Fachpersonal.`,
        "Lüftungsreinigung anfragen"
      ),
      decisionSection("TYPISCHE AUSLÖSER", "Wann eine Lüftungsreinigung im Krankenhaus notwendig wird", [
        { t: "Hygienebefund", p: "Eine Hygieneinspektion nach VDI 6022 zeigt Verschmutzungen oder mikrobiologische Auffälligkeiten." },
        { t: "Auditpflicht", p: "Hygienekommission, Begehungen oder Zertifizierungen verlangen einen dokumentierten Zustand." },
        { t: "Umbau & Sanierung", p: "Nach baulichen Maßnahmen gelangen Stäube und Partikel in die RLT-Anlage." },
        { t: "Risikominimierung", p: "Schutz von Patienten, Personal und Betrieb steht im Vordergrund." },
      ]),
      mediaSection(
        "ABLAUF & DOKUMENTATION",
        "So reinigen wir Ihre klinische RLT-Anlage",
        [
          "Wir nehmen den Anlagenzustand auf, legen die Sauberkeitsklasse nach DIN EN 15780 fest und reinigen Kanäle, Wärmeübertrager, Ventilatoren und Filterkammern. Bei Bedarf desinfizieren staatlich geprüfte Desinfektoren die relevanten Bereiche.",
          "Jeden Abschnitt belegen wir mit einer Vorher-/Nachher-Dokumentation. Den Abschluss bildet ein auditfähiger Bericht als Nachweis Ihrer Betreiberpflicht.",
        ],
        p.image,
        p.imageAlt,
        "Angebot anfordern"
      ),
      relatedSection([
        ["../../anlagen/op-raum-pruefung/index.html", "OP-Raum-Qualifizierung DIN 1946-4"],
        ["../../anlagen/reinraumqualifizierung/index.html", "Reinraumqualifizierung ISO 14644"],
        ["../../hygieneinspektion-vdi-6022/index.html", "Hygieneinspektion VDI 6022"],
        ["../../anlagen/lueftungsreinigung/index.html", "Lüftungsreinigung"],
      ]),
    ],
    ctaTitle: "Lüftungsreinigung für Ihre Klinik anfragen",
    ctaText: "Beschreiben Sie kurz Ihre Bereiche und Anlagen – wir nennen Ihnen Umfang, Ablauf und Ihren lokalen Ansprechpartner.",
  },

  {
    dir: "leistungen/luftkeimmessung-rlt-anlagen",
    title: "Luftkeimmessung RLT-Anlagen | VDI 6022",
    desc: "Luftkeimmessung im Rahmen der RLT-Hygieneprüfung: Probenahme, Laborbeurteilung, Dokumentation und Handlungsempfehlungen nach VDI 6022.",
    h1: "Luftkeimmessung in RLT-Anlagen und versorgten Räumen",
    crumbCurrent: "Luftkeimmessung RLT-Anlagen",
    serviceName: "Luftkeimmessung in RLT-Anlagen",
    serviceType: "Mikrobiologische Luftkeimmessung im Rahmen der Hygieneprüfung nach VDI 6022",
    image: "../../Bildmaterial_final/shared/inspektion-hygieneinspektion-vdi-6022.webp",
    imageAlt: "Probenahme im Rahmen der Hygieneinspektion nach VDI 6022",
    faqs: [
      { q: "Was ist eine Luftkeimmessung?", a: "Bei einer Luftkeimmessung wird die Konzentration von Mikroorganismen (z. B. Bakterien und Schimmelpilze) in der Luft bestimmt. Sie ist Bestandteil der Hygieneprüfung raumlufttechnischer Anlagen und liefert einen objektiven Hygienestatus." },
      { q: "Wann ist eine Luftkeimmessung sinnvoll?", a: "Sinnvoll ist sie im Rahmen der Hygieneinspektion nach VDI 6022, bei Verdacht auf mikrobiologische Belastung, nach Wasserschäden, bei Beschwerden über die Raumluft oder zur Kontrolle nach Reinigungs- und Sanierungsmaßnahmen." },
      { q: "Wie läuft die Probenahme ab?", a: "Mit kalibrierten Luftkeimsammlern werden definierte Luftvolumina auf Nährböden abgeschieden. Die Proben werden im Labor bebrütet, ausgewertet und mit Referenzwerten verglichen." },
      { q: "Was passiert mit den Ergebnissen?", a: "Sie erhalten eine Laborbeurteilung mit Einordnung der Messwerte sowie konkrete Handlungsempfehlungen. Auffällige Befunde fließen in die Priorisierung von Reinigungs- oder Sanierungsmaßnahmen ein." },
      { q: "Gehört die Luftkeimmessung zur Hygieneinspektion?", a: "Ja. Sie ist ein Baustein der Hygieneinspektion nach VDI 6022 und ergänzt die visuelle Beurteilung sowie die Bilddokumentation um objektive mikrobiologische Messwerte." },
    ],
    sections: (p) => [
      introSection(
        "luftkeim-intro",
        "LUFTKEIMMESSUNG",
        "Objektiver Hygienestatus durch mikrobiologische Messung",
        `Eine Luftkeimmessung macht die mikrobiologische Qualität der Luft messbar und ergänzt die visuelle Beurteilung der <a class="text-link" href="../../hygieneinspektion-vdi-6022/index.html">Hygieneinspektion nach VDI 6022</a>. So lässt sich belegen, ob Ihre raumlufttechnische Anlage und die versorgten Räume den hygienischen Anforderungen entsprechen – mit kalibrierten Geräten, Laborbeurteilung und nachvollziehbarer Dokumentation.`,
        "Luftkeimmessung anfragen"
      ),
      infoboxSection("ABLAUF", "Von der Probenahme bis zur Beurteilung", "Bestandteile der Luftkeimmessung", [
        "<strong>Planung:</strong> Festlegung repräsentativer Messpunkte in Anlage und Räumen",
        "<strong>Probenahme:</strong> Abscheidung definierter Luftvolumina mit kalibrierten Luftkeimsammlern",
        "<strong>Laborauswertung:</strong> Bebrütung und Quantifizierung von Bakterien und Schimmelpilzen",
        "<strong>Beurteilung:</strong> Einordnung der Messwerte und Handlungsempfehlungen",
        "<strong>Dokumentation:</strong> nachvollziehbarer Befundbericht für Ihre Betreiberpflicht",
      ]),
      mediaSection(
        "ZUSAMMENHANG",
        "Teil Ihrer RLT-Hygieneprüfung",
        [
          "Die Luftkeimmessung ist ein Baustein der Hygieneprüfung nach VDI 6022. In Kombination mit Bilddokumentation, der Beurteilung physikalischer und konstruktiver Mängel sowie weiteren Probenahmen entsteht ein vollständiges Bild des Anlagenzustands.",
          "Auffällige Befunde fließen direkt in die Priorisierung von Reinigungs-, Desinfektions- oder Sanierungsmaßnahmen ein – damit Sie gezielt und wirtschaftlich handeln können.",
        ],
        p.image,
        p.imageAlt,
        "Angebot anfordern"
      ),
      relatedSection([
        ["../../hygieneinspektion-vdi-6022/index.html", "Hygieneinspektion VDI 6022"],
        ["../inspektionundgutachten/index.html", "Inspektion & Gutachten"],
        ["../rlt-reinigung-industrie/index.html", "RLT-Reinigung Industrie"],
        ["../vdi-6022-pruefbericht-musterbericht/index.html", "VDI 6022 Prüfbericht & Musterbericht"],
      ]),
    ],
    ctaTitle: "Luftkeimmessung anfragen",
    ctaText: "Wir planen Probenahme und Laborauswertung für Ihre Anlage und liefern eine belastbare Beurteilung mit Handlungsempfehlungen.",
  },

  {
    dir: "leistungen/kuehlturm-entkalkung-biofilm",
    title: "Kühlturm Entkalkung & Biofilm entfernen",
    desc: "IGIENAIR entfernt Biofilm, Kalk und hygienische Risiken in Kühltürmen und Verdunstungskühlanlagen – fachgerecht, dokumentiert, nach VDI 2047-2.",
    h1: "Kühlturm entkalken und Biofilm hygienisch entfernen",
    crumbCurrent: "Kühlturm Entkalkung & Biofilm",
    serviceName: "Kühlturm-Entkalkung und Biofilmentfernung",
    serviceType: "Reinigung, Entkalkung und Biofilmentfernung an Verdunstungskühlanlagen",
    image: "../../Bildmaterial_final/shared/anlage-kuehlturmreinigung4.webp",
    imageAlt: "Kühlturm mit Wasserführung im Außenbereich",
    faqs: [
      { q: "Warum ist Biofilm im Kühlturm gefährlich?", a: "Biofilm bietet Mikroorganismen – darunter Legionellen – einen geschützten Nährboden und ist mit einfachen Mitteln kaum zu entfernen. Er erhöht das hygienische Risiko und mindert die Wärmeübertragung der Anlage." },
      { q: "Wie entsteht Kalk und warum ist er ein Problem?", a: "Durch Verdunstung reichern sich Mineralien im Kreislaufwasser an und lagern sich als Kalk ab. Kalkschichten verringern die Kühlleistung, begünstigen Ablagerungen und können Biofilme einschließen." },
      { q: "Wie läuft die technische Reinigung ab?", a: "Wir entleeren und reinigen die wasserführenden Bauteile mechanisch und chemisch, entfernen Biofilm und Kalk, desinfizieren das System und dokumentieren das Ergebnis – abgestimmt auf den Anlagentyp." },
      { q: "Welcher Normbezug besteht?", a: "Reinigung und Hygiene von Verdunstungskühlanlagen richten sich nach der VDI 2047-2 und der 42. BImSchV. Beide fordern einen hygienisch sicheren Betrieb und dessen Dokumentation." },
      { q: "Erhalte ich einen Hygienenachweis?", a: "Ja. Nach Abschluss der Maßnahmen erhalten Sie eine prüffeste Dokumentation inklusive Bildmaterial als Grundlage für Ihre Betreiberpflicht." },
    ],
    sections: (p) => [
      introSection(
        "biofilm-intro",
        "ENTKALKUNG & BIOFILM",
        "Biofilm und Kalk fachgerecht und nachweisbar entfernen",
        `Wasser, Wärme und organische Stoffe machen Kühltürme und <a class="text-link" href="../verdunstungskuehlanlage-vdi-2047-42-bimschv/index.html">Verdunstungskühlanlagen</a> zu einem idealen Lebensraum für Biofilme. In Verbindung mit Kalkablagerungen entstehen hygienische Risiken und Leistungsverluste. IGIENAIR entfernt Biofilm und Kalk technisch fachgerecht – im Rahmen der Betreiberpflicht nach <a class="text-link" href="../../normen/vdi-2047/index.html">VDI 2047-2</a> und 42. BImSchV.`,
        "Reinigung anfragen"
      ),
      decisionSection("WARNZEICHEN", "Wann Entkalkung und Biofilmentfernung nötig sind", [
        { t: "Biofilm & Schleim", p: "Sicht- oder messbarer Bewuchs an wasserführenden Bauteilen." },
        { t: "Kalkablagerungen", p: "Sinkende Kühlleistung und Beläge an Füllkörpern und Wärmetauschern." },
        { t: "Mikrobiologie", p: "Erhöhte Keim- oder Legionellenwerte in der Beprobung." },
        { t: "Betreiberpflicht", p: "Anstehende Prüfungen nach VDI 2047-2 / 42. BImSchV." },
      ]),
      mediaSection(
        "TECHNISCHE REINIGUNG",
        "So gehen wir vor",
        [
          "Wir reinigen die wasserführenden Bauteile mechanisch und chemisch, entfernen Biofilm und Kalk, desinfizieren das System und kontrollieren das Ergebnis. Die Maßnahmen stimmen wir auf Anlagentyp und Befund ab.",
          "Reicht eine Reinigung nicht aus, gehen wir in die <a class=\"text-link\" href=\"../kuehlturm-sanierung-fuellkoerper-duesen/index.html\">Sanierung</a> betroffener Bauteile über. Alle Schritte werden dokumentiert.",
        ],
        p.image,
        p.imageAlt,
        "Angebot anfordern"
      ),
      relatedSection([
        ["../../anlagen/kuehlturmreinigung/index.html", "Kühlturmreinigung"],
        ["../verdunstungskuehlanlage-vdi-2047-42-bimschv/index.html", "Verdunstungskühlanlage VDI 2047-2"],
        ["../kuehlturm-sanierung-fuellkoerper-duesen/index.html", "Kühlturm-Sanierung"],
        ["../instandsetzung-sanierung/index.html", "Instandsetzung & Sanierung"],
      ]),
    ],
    ctaTitle: "Kühlturm-Reinigung anfragen",
    ctaText: "Wir bewerten Biofilm- und Kalkbefund, planen die technische Reinigung und dokumentieren das Ergebnis für Ihre Betreiberpflicht.",
  },

  {
    dir: "leistungen/kuehlturm-sanierung-fuellkoerper-duesen",
    title: "Kühlturm-Sanierung | Füllkörper & Düsen",
    desc: "Sanierung von Kühltürmen und Verdunstungskühlanlagen: Füllkörper, Düsen, Tropfenabscheider, Korrosion und hygienischer Betrieb – dokumentiert.",
    h1: "Kühlturm-Sanierung mit Austausch von Füllkörpern, Düsen und Tropfenabscheidern",
    crumbCurrent: "Kühlturm-Sanierung",
    serviceName: "Sanierung von Kühltürmen und Verdunstungskühlanlagen",
    serviceType: "Technische Sanierung und Bauteilaustausch an Verdunstungskühlanlagen",
    image: "../../Bildmaterial_final/shared/instandsetzung.webp",
    imageAlt: "Technische Sanierung von Anlagenkomponenten",
    faqs: [
      { q: "Wann ist eine Sanierung statt einer Reinigung nötig?", a: "Wenn Bauteile dauerhaft geschädigt, verschlissen oder hygienisch nicht mehr instand zu setzen sind. Beschädigte Füllkörper, verschlissene Düsen oder defekte Tropfenabscheider lassen sich nicht durch Reinigung wiederherstellen." },
      { q: "Welche Bauteile werden typischerweise saniert?", a: "Typisch sind Füllkörper, Sprühdüsen, Tropfenabscheider, Wasserverteilung sowie korrodierte Wannen und Oberflächen. Wir tauschen oder ertüchtigen die betroffenen Komponenten." },
      { q: "Welche Rolle spielt Korrosion?", a: "Korrosion schwächt die Substanz der Anlage und schafft Oberflächen, an denen sich Ablagerungen und Biofilme festsetzen. Korrosionsschutz und Oberflächensanierung sind daher wichtige Bestandteile." },
      { q: "Bleibt der hygienische Betrieb gewährleistet?", a: "Ja. Ziel der Sanierung ist ein hygienisch einwandfreier, betriebssicherer Zustand nach VDI 2047-2 und 42. BImSchV – nachvollziehbar dokumentiert." },
      { q: "Erhalte ich eine Dokumentation?", a: "Ja. Sie erhalten eine prüffeste Dokumentation der Sanierungsmaßnahmen inklusive Bildmaterial als Nachweis für Ihre Betreiberpflicht." },
    ],
    sections: (p) => [
      introSection(
        "kt-sanierung-intro",
        "KÜHLTURM-SANIERUNG",
        "Wenn Reinigung nicht mehr ausreicht",
        `Verschlissene oder beschädigte Bauteile lassen sich nicht durch Reinigung wiederherstellen. IGIENAIR saniert Kühltürme und <a class="text-link" href="../verdunstungskuehlanlage-vdi-2047-42-bimschv/index.html">Verdunstungskühlanlagen</a> durch Austausch und Ertüchtigung von Füllkörpern, Düsen, Tropfenabscheidern und korrodierten Oberflächen – für einen hygienisch einwandfreien, betriebssicheren Zustand nach <a class="text-link" href="../../normen/vdi-2047/index.html">VDI 2047-2</a>.`,
        "Sanierung anfragen"
      ),
      infoboxSection("LEISTUNGSUMFANG", "Typische Sanierungsbausteine", "Das sanieren wir an Ihrer Anlage", [
        "Austausch verschlissener oder beschädigter <strong>Füllkörper</strong>",
        "Erneuerung von <strong>Sprühdüsen</strong> und Wasserverteilung",
        "Austausch defekter <strong>Tropfenabscheider</strong>",
        "<strong>Korrosionsschutz</strong> und Oberflächensanierung von Wannen und Bauteilen",
        "Wiederherstellung des hygienisch einwandfreien Betriebs",
      ]),
      mediaSection(
        "ABLAUF & DOKUMENTATION",
        "Von der Bewertung bis zum Nachweis",
        [
          "Wir bewerten den Zustand der Anlage, leiten den Sanierungsbedarf ab und tauschen oder ertüchtigen die betroffenen Bauteile. Korrodierte Oberflächen schützen und sanieren wir hygienisch.",
          "Die Maßnahmen dokumentieren wir prüffest inklusive Bildmaterial – als belastbaren Nachweis Ihrer Betreiberpflicht nach VDI 2047-2 und 42. BImSchV.",
        ],
        p.image,
        p.imageAlt,
        "Angebot anfordern"
      ),
      relatedSection([
        ["../../anlagen/kuehlturmreinigung/index.html", "Kühlturmreinigung"],
        ["../kuehlturm-entkalkung-biofilm/index.html", "Kühlturm Entkalkung & Biofilm"],
        ["../verdunstungskuehlanlage-vdi-2047-42-bimschv/index.html", "Verdunstungskühlanlage VDI 2047-2"],
        ["../instandsetzung-sanierung/index.html", "Instandsetzung & Sanierung"],
      ]),
    ],
    ctaTitle: "Kühlturm-Sanierung anfragen",
    ctaText: "Wir bewerten den Zustand Ihrer Anlage, planen den Bauteilaustausch und dokumentieren die Sanierung nachvollziehbar.",
  },

  {
    dir: "leistungen/partikelmessung-reinraum-iso-14644",
    title: "Partikelmessung Reinraum | ISO 14644",
    desc: "Partikelmessung für Reinräume in Pharma, Labor und Industrie: ISO 14644, VDI 2083, Dokumentation und qualifizierte Prüfung.",
    h1: "Partikelmessung und Reinraumprüfung nach ISO 14644",
    crumbCurrent: "Partikelmessung Reinraum ISO 14644",
    serviceName: "Partikelmessung und Reinraumprüfung nach ISO 14644",
    serviceType: "Partikelmessung und Klassifizierung von Reinräumen nach ISO 14644 / VDI 2083",
    image: "../../Bildmaterial_final/shared/anlagen-reinraumqualifizierung1.webp",
    imageAlt: "Reinraum mit Partikelmessung",
    faqs: [
      { q: "Wozu dient die Partikelmessung im Reinraum?", a: "Sie bestimmt die Konzentration luftgetragener Partikel und ordnet den Reinraum einer Reinheitsklasse nach ISO 14644 zu. So lässt sich nachweisen, dass die geforderte Luftreinheit eingehalten wird." },
      { q: "Welche Normen gelten?", a: "Maßgeblich sind die ISO 14644 (Klassifizierung der Luftreinheit) und die VDI 2083 (Reinraumtechnik). Beide bilden die Grundlage für Prüfung, Klassifizierung und Dokumentation." },
      { q: "Wie läuft die Messung ab?", a: "Mit kalibrierten Partikelzählern werden an definierten Messpunkten Partikel verschiedener Größenklassen erfasst. Die Ergebnisse werden ausgewertet, klassifiziert und dokumentiert." },
      { q: "In welchen Bereichen ist die Prüfung relevant?", a: "Vor allem in Pharma, Labor, Medizintechnik und Industrie – überall dort, wo definierte Luftreinheit für Produkt- und Prozesssicherheit gefordert ist." },
      { q: "Worin unterscheidet sich das von der OP-Raum-Qualifizierung?", a: "Die Partikelmessung klassifiziert Reinräume nach ISO 14644. Die OP-Raum-Qualifizierung nach DIN 1946-4 prüft raumlufttechnische Anlagen in OP-Bereichen mit eigenem Messumfang. Die Verfahren sind nicht deckungsgleich." },
    ],
    sections: (p) => [
      introSection(
        "partikel-intro",
        "PARTIKELMESSUNG",
        "Luftreinheit messbar machen und klassifizieren",
        `Die Partikelmessung weist nach, ob ein Reinraum die geforderte Luftreinheit erreicht, und ordnet ihn einer Reinheitsklasse nach <a class="text-link" href="../../anlagen/reinraumqualifizierung/index.html">ISO 14644</a> zu. Als Bestandteil der Reinraumqualifizierung schafft sie die Grundlage für Produkt- und Prozesssicherheit in Pharma, Labor und Industrie – mit kalibrierten Geräten und nachvollziehbarer Dokumentation.`,
        "Partikelmessung anfragen"
      ),
      infoboxSection("ABLAUF", "Von der Messung bis zur Klassifizierung", "Bestandteile der Partikelmessung", [
        "<strong>Messplanung:</strong> Festlegung der Messpunkte je nach Raumgröße und Klasse",
        "<strong>Messung:</strong> Erfassung luftgetragener Partikel mit kalibrierten Partikelzählern",
        "<strong>Klassifizierung:</strong> Einordnung nach ISO 14644 / VDI 2083",
        "<strong>Filterbezug:</strong> bei Bedarf Verbindung mit Filterleck- und Integritätstests",
        "<strong>Dokumentation:</strong> prüffähiger Bericht der Reinraumprüfung",
      ]),
      mediaSection(
        "EINSATZBEREICHE",
        "Wo die Partikelmessung gefordert ist",
        [
          "Definierte Luftreinheit ist überall dort entscheidend, wo Produkte und Prozesse geschützt werden müssen – in der pharmazeutischen Produktion, in Laboren, in der Medizintechnik und in sensiblen Industrieprozessen.",
          "Die Partikelmessung ergänzen wir bei Bedarf um den <a class=\"text-link\" href=\"../../filterintegritaetstest/index.html\">Filterintegritätstest</a> und den <a class=\"text-link\" href=\"../../lecktest-schwebstofffilter/index.html\">Schwebstofffilter-Lecktest</a>.",
        ],
        p.image,
        p.imageAlt,
        "Angebot anfordern"
      ),
      relatedSection([
        ["../../anlagen/reinraumqualifizierung/index.html", "Reinraumqualifizierung ISO 14644"],
        ["../../filterintegritaetstest/index.html", "Filterintegritätstest"],
        ["../../lecktest-schwebstofffilter/index.html", "Schwebstofffilter-Lecktest"],
        ["../dehs-leckpruefung-op-raum/index.html", "DEHS-Leckprüfung OP-Raum"],
      ]),
    ],
    ctaTitle: "Partikelmessung anfragen",
    ctaText: "Wir planen die Reinraumprüfung nach ISO 14644, führen die Partikelmessung durch und dokumentieren die Klassifizierung.",
  },

  {
    dir: "leistungen/dehs-leckpruefung-op-raum",
    title: "DEHS-Leckprüfung OP-Raum | DIN 1946-4",
    desc: "DEHS-Leckprüfung für OP-Räume nach DIN 1946-4: Filterprüfung am eingebauten System, Druckkaskade, Dokumentation und auditfähige Qualifizierung.",
    h1: "DEHS-Leckprüfung am eingebauten Filtersystem im OP-Raum",
    crumbCurrent: "DEHS-Leckprüfung OP-Raum",
    serviceName: "DEHS-Leckprüfung im OP-Raum",
    serviceType: "DEHS-Filterleckprüfung am eingebauten Filtersystem nach DIN 1946-4",
    image: "../../Bildmaterial_final/shared/inspektion-lecktest-schwebstofffilter.webp",
    imageAlt: "DEHS-Leckprüfung am Schwebstofffilter",
    faqs: [
      { q: "Was ist eine DEHS-Leckprüfung?", a: "Bei der DEHS-Leckprüfung wird ein definiertes Prüfaerosol (DEHS) vor dem Filter erzeugt und reingasseitig abgescannt. So lassen sich Leckagen am Filtermedium, am Dichtsitz und am Rahmen des eingebauten Schwebstofffilters lokalisieren." },
      { q: "Warum ist sie im OP-Raum wichtig?", a: "Schwebstofffilter sichern die Luftreinheit über dem OP-Tisch. Ein undichter Filter oder Dichtsitz gefährdet den Schutzgrad. Die DEHS-Leckprüfung weist die Integrität des eingebauten Filtersystems nach." },
      { q: "Gehört die Prüfung zur OP-Raum-Qualifizierung?", a: "Ja. Die DEHS-Leckprüfung am eingebauten Filter ist ein Baustein der OP-Raum-Qualifizierung nach DIN 1946-4 und ergänzt Verfahren wie Abströmungsvisualisierung, Druckkaskade und Erholzeitmessung." },
      { q: "Was wird dokumentiert?", a: "Sie erhalten einen prüffähigen Bericht mit Messmethode, Ergebnissen und festgestellten Leckagen – als auditfähigen Nachweis im Rahmen Ihrer Betreiberpflicht." },
      { q: "Worin unterscheidet sich das vom Filterintegritätstest im Reinraum?", a: "Das Messprinzip ist verwandt, der Kontext unterscheidet sich: Im OP-Raum erfolgt die Prüfung nach DIN 1946-4, im Reinraum nach ISO 14644. Wir ordnen das passende Verfahren Ihrem Anwendungsfall zu." },
    ],
    sections: (p) => [
      introSection(
        "dehs-intro",
        "DEHS-LECKPRÜFUNG",
        "Filterintegrität im OP-Raum nachweisen",
        `Schwebstofffilter sichern die Luftreinheit über dem OP-Feld. Mit der DEHS-Leckprüfung weisen wir die Integrität des eingebauten Filtersystems nach – als Baustein der <a class="text-link" href="../../anlagen/op-raum-pruefung/index.html">OP-Raum-Qualifizierung nach DIN 1946-4</a>. Geprüft werden Filtermedium, Dichtsitz und Rahmen mit einem definierten Prüfaerosol.`,
        "DEHS-Leckprüfung anfragen"
      ),
      infoboxSection("MESSMETHODE", "So funktioniert die DEHS-Leckprüfung", "Bestandteile der Prüfung", [
        "Erzeugung eines definierten <strong>DEHS-Prüfaerosols</strong> vor dem Filter",
        "Reingasseitiges <strong>Abscannen</strong> von Filterfläche, Dichtsitz und Rahmen",
        "<strong>Lokalisierung</strong> von Leckagen am eingebauten Filtersystem",
        "Einordnung im Zusammenhang mit <strong>Druckkaskade</strong> und Schutzgrad",
        "<strong>Dokumentation</strong> der Qualifizierungsmessung",
      ]),
      mediaSection(
        "ZUSAMMENHANG",
        "Teil der OP-Raum-Qualifizierung",
        [
          "Die DEHS-Leckprüfung ist Bestandteil der OP-Raum-Qualifizierung nach DIN 1946-4. Gemeinsam mit Abströmungsvisualisierung, Differenzdruck-/Druckkaskadenmessung und Erholzeitmessung entsteht der Nachweis der raumlufttechnischen Funktion.",
          "Für Reinräume führen wir die verwandte Prüfung nach <a class=\"text-link\" href=\"../../filterintegritaetstest/index.html\">ISO 14644</a> durch. Wir ordnen das passende Verfahren Ihrem Anwendungsfall zu.",
        ],
        p.image,
        p.imageAlt,
        "Angebot anfordern"
      ),
      relatedSection([
        ["../../anlagen/op-raum-pruefung/index.html", "OP-Raum-Qualifizierung DIN 1946-4"],
        ["../../lecktest-schwebstofffilter/index.html", "Schwebstofffilter-Lecktest"],
        ["../../filterintegritaetstest/index.html", "Filterintegritätstest"],
        ["../partikelmessung-reinraum-iso-14644/index.html", "Partikelmessung Reinraum"],
      ]),
    ],
    ctaTitle: "DEHS-Leckprüfung anfragen",
    ctaText: "Wir prüfen die Integrität Ihres eingebauten Filtersystems nach DIN 1946-4 und dokumentieren das Ergebnis auditfähig.",
  },

  {
    dir: "leistungen/rlt-sanierung-korrosion-2k-epoxy",
    title: "RLT-Sanierung Korrosion | 2K-Epoxy",
    desc: "Sanierung von RLT-Anlagen bei Korrosion, KMF und Oberflächenschäden – mit 2K-Epoxy-Beschichtung, Dokumentation und hygienischem Fokus.",
    h1: "RLT-Sanierung bei Korrosion und hygienischen Oberflächenschäden",
    crumbCurrent: "RLT-Sanierung Korrosion & 2K-Epoxy",
    serviceName: "RLT-Sanierung bei Korrosion mit 2K-Epoxy-Beschichtung",
    serviceType: "Sanierung und Oberflächenbeschichtung raumlufttechnischer Anlagen",
    image: "../../Bildmaterial_final/shared/instandsetzung.webp",
    imageAlt: "Instandsetzung und Oberflächensanierung einer RLT-Anlage",
    faqs: [
      { q: "Wann ist eine RLT-Sanierung nötig?", a: "Wenn Korrosion, geschädigte Oberflächen oder freiliegende künstliche Mineralfasern (KMF) den hygienischen und technischen Zustand der Anlage beeinträchtigen und eine Reinigung allein nicht mehr ausreicht." },
      { q: "Warum sind beschädigte Oberflächen ein Hygieneproblem?", a: "Raue, korrodierte oder beschädigte Oberflächen bieten Schmutz und Mikroorganismen Halt und lassen sich nicht dauerhaft reinigen. Eine hygienische Oberflächensanierung stellt einen reinigbaren Zustand wieder her." },
      { q: "Was leistet die 2K-Epoxy-Beschichtung?", a: "Die 2K-Epoxy-Beschichtung versiegelt sanierte Oberflächen widerstandsfähig, schützt vor erneuter Korrosion und schafft glatte, hygienisch reinigbare Flächen." },
      { q: "Worin unterscheidet sich die Sanierung von Wartung und Reparatur?", a: "Wartung und Reparatur erhalten bzw. stellen die Funktion einzelner Bauteile wieder her. Die Sanierung stellt den hygienischen und substanziellen Gesamtzustand wieder her, etwa durch Korrosionsschutz und Oberflächenbeschichtung." },
      { q: "Wird die Sanierung dokumentiert?", a: "Ja. Sie erhalten eine nachvollziehbare Dokumentation der Sanierungsmaßnahmen inklusive Bildmaterial als Nachweis für Ihre Betreiberpflicht." },
    ],
    sections: (p) => [
      introSection(
        "rlt-sanierung-intro",
        "RLT-SANIERUNG",
        "Korrosion und Oberflächenschäden hygienisch beseitigen",
        `Korrosion, geschädigte Oberflächen und freiliegende künstliche Mineralfasern beeinträchtigen den hygienischen und technischen Zustand raumlufttechnischer Anlagen. IGIENAIR saniert betroffene Bereiche mit Korrosionsschutz und 2K-Epoxy-Beschichtung – für glatte, reinigbare Oberflächen und einen normgerechten Zustand. Grundlage ist häufig eine <a class="text-link" href="../../hygieneinspektion-vdi-6022/index.html">Hygieneinspektion nach VDI 6022</a>.`,
        "Sanierung anfragen"
      ),
      decisionSection("AUSLÖSER", "Wann eine RLT-Sanierung sinnvoll ist", [
        { t: "Korrosion", p: "Rost an Gehäusen, Wannen und Kanälen schwächt die Substanz." },
        { t: "Oberflächenschäden", p: "Raue oder beschädigte Flächen lassen sich nicht dauerhaft reinigen." },
        { t: "KMF freiliegend", p: "Beschädigte Isolierungen geben Fasern an die Luft ab." },
        { t: "Hygienebefund", p: "Eine Inspektion zeigt, dass Reinigung allein nicht ausreicht." },
      ]),
      mediaSection(
        "ABLAUF & 2K-EPOXY",
        "So sanieren wir Ihre RLT-Anlage",
        [
          "Wir bewerten den Zustand, bereiten die Oberflächen vor und tragen Korrosionsschutz sowie eine widerstandsfähige 2K-Epoxy-Beschichtung auf. Das Ergebnis ist eine glatte, hygienisch reinigbare Oberfläche.",
          "Die Maßnahmen dokumentieren wir nachvollziehbar inklusive Bildmaterial – als belastbaren Nachweis Ihrer Betreiberpflicht.",
        ],
        p.image,
        p.imageAlt,
        "Angebot anfordern"
      ),
      relatedSection([
        ["../instandsetzung-sanierung/index.html", "Instandsetzung & Sanierung"],
        ["../../anlagen/lueftungsreinigung/index.html", "Lüftungsreinigung"],
        ["../../hygieneinspektion-vdi-6022/index.html", "Hygieneinspektion VDI 6022"],
        ["../rlt-reinigung-industrie/index.html", "RLT-Reinigung Industrie"],
      ]),
    ],
    ctaTitle: "RLT-Sanierung anfragen",
    ctaText: "Wir bewerten Korrosion und Oberflächenschäden, planen die Sanierung mit 2K-Epoxy und dokumentieren das Ergebnis.",
  },
];

function buildMain(p) {
  const hero = `    <section class="company-hero" id="top" data-section="hero">
      <div class="container company-hero__content">
        <p class="eyebrow">Leistungen</p>
        <h1>${p.h1}</h1>
        <nav class="hero-breadcrumb" aria-label="Brotkrumen">
          <a class="hero-breadcrumb__link" href="../../index.html">Startseite</a>
          <span class="hero-breadcrumb__sep" aria-hidden="true">&raquo;</span>
          <a class="hero-breadcrumb__link" href="../index.html">Leistungen</a>
          <span class="hero-breadcrumb__sep" aria-hidden="true">&raquo;</span>
          <span class="hero-breadcrumb__current" aria-current="page">${p.crumbCurrent}</span>
        </nav>
      </div>
    </section>`;

  const body = p.sections(p).join("\n\n");
  const faq = faqHtml(p.dir.split("/").pop(), p.faqs);

  const cta = `    <section class="svc-cta" data-section="cta">
      <div class="container svc-cta__inner">
        <div class="svc-cta__text">
          <h2>${p.ctaTitle}</h2>
          <p>${p.ctaText}</p>
        </div>
        <div class="svc-cta__actions">
          <a class="button button--solid" href="../../kontakt/angebot-anfordern/index.html">Angebot anfordern</a>
          <a class="button button--ghost" href="../../kontakt/index.html#locations">Standorte ansehen</a>
        </div>
      </div>
    </section>`;

  return `  <main>\n${hero}\n\n${body}\n\n${faq}\n\n${cta}\n  </main>`;
}

async function main() {
  const template = await fs.readFile(TEMPLATE, "utf8");
  for (const p of PAGES) {
    let html = template;
    html = html.replace(T.title, `<title>${p.title.replace(/&/g, "&amp;")}</title>`);
    html = html.replace(T.desc, `<meta name="description" content="${p.desc}">`);
    html = html.replace(T.ogTitle, `<meta property="og:title" content="${p.title.replace(/&/g, "&amp;")}">`);
    html = html.replace(T.ogDesc, `<meta property="og:description" content="${p.desc}">`);
    html = html.replace(T.ogUrl, `<meta property="og:url" content="https://igienair.de/${p.dir}/">`);
    html = html.replace(T.canonical, `<link rel="canonical" href="https://igienair.de/${p.dir}/">`);

    html = html.replace(/  <main>[\s\S]*<\/main>/, buildMain(p));

    const url = `https://igienair.de/${p.dir}/`;
    const crumb = [
      { name: "Startseite", item: "https://igienair.de/" },
      { name: "Leistungen", item: "https://igienair.de/leistungen/" },
      { name: p.crumbCurrent, item: url },
    ];
    const ld = jsonLd(p.serviceName, p.serviceType, url, crumb, p.faqs);
    html = html.replace('  <script src="../../script.js"></script>', ld + '  <script src="../../script.js"></script>');

    const outDir = path.join(ROOT, ...p.dir.split("/"));
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
    console.log("erstellt:", p.dir + "/index.html");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
