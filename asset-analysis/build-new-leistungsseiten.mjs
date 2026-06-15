// Erzeugt die drei neuen Phase-1-Leistungsseiten aus dem bestehenden, bereits
// auf die neue Mega-Navigation umgestellten Template
// (leistungen/inspektionundgutachten/index.html). Chrome (Header/Quick-Rail/
// Footer) wird 1:1 uebernommen (Tiefe 2 -> ../../), Head-Meta und <main> werden
// ersetzt und JSON-LD (BreadcrumbList + Service + FAQPage) eingefuegt.
//
// Aufruf:  node asset-analysis/build-new-leistungsseiten.mjs

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
          <h2>${"Häufige Fragen"}</h2>
          <div class="gradient-line"></div>
        </header>

        <div class="accordion faq-accordion" data-accordion>
${items}
        </div>
      </div>
    </section>`;
}

function faqJsonText(text) {
  return text.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&ndash;/g, "–").replace(/"/g, '\\"');
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

// ---------------------------------------------------------------------------
// Seiten-Definitionen
// ---------------------------------------------------------------------------

const PAGES = [
  {
    dir: "leistungen/rlt-reinigung-industrie",
    title: "RLT-Reinigung Industrie | Lüftungshygiene",
    desc: "Normgerechte RLT-Reinigung für Industrie, FM und Betreiber: VDI 6022, DIN EN 15780, Bilddokumentation und schnelle Wiederverfügbarkeit.",
    url: "https://igienair.de/leistungen/rlt-reinigung-industrie/",
    h1: "RLT-Reinigung für Industrie, Betreiber und Facility Management",
    crumbCurrent: "RLT-Reinigung Industrie",
    serviceName: "RLT-Reinigung für Industrie",
    serviceType: "Reinigung raumlufttechnischer Anlagen in Industrie und Facility Management",
    image: "../../Bildmaterial_final/shared/anlagen-lueftungsreinigung7.webp",
    imageAlt: "Industrielle RLT-Anlage auf einem Geb&auml;udedach",
    faqs: [
      { q: "Was umfasst eine RLT-Reinigung in der Industrie?", a: "Die hygienetechnische Reinigung von Zu- und Abluftkan&auml;len, W&auml;rme&uuml;bertragern, Ventilatoren, Filterkammern und weiteren Bauteilen Ihrer raumlufttechnischen Anlage &ndash; normbezogen nach VDI 6022 und DIN EN 15780, mit Vorher-/Nachher-Dokumentation." },
      { q: "Welche Normen gelten f&uuml;r die industrielle RLT-Reinigung?", a: "Ma&szlig;geblich sind die VDI 6022 (Hygieneanforderungen) und die DIN EN 15780 (Sauberkeitsklassen und Beurteilung des Reinigungsbedarfs). Wir dokumentieren alle Ma&szlig;nahmen nachvollziehbar." },
      { q: "Muss die Produktion f&uuml;r die Reinigung stillstehen?", a: "Wir planen Ma&szlig;nahmen so, dass Ihr Betrieb m&ouml;glichst wenig beeintr&auml;chtigt wird &ndash; auf Wunsch in Wartungsfenstern, nachts oder am Wochenende, f&uuml;r eine schnelle hygienische Wiederverf&uuml;gbarkeit." },
      { q: "Wie wird der Reinigungsbedarf festgestellt?", a: "Grundlage ist eine Beurteilung des Anlagenzustands, h&auml;ufig im Rahmen einer Hygieneinspektion nach VDI 6022. Daraus leiten wir den notwendigen Reinigungsumfang und die Sauberkeitsklasse nach DIN EN 15780 ab." },
      { q: "Reinigt IGIENAIR mit eigenem Personal?", a: "Ja. Alle Arbeiten f&uuml;hrt ausschlie&szlig;lich eigenes, festangestelltes und geschultes Fachpersonal durch &ndash; mit lokalen Ansprechpartnern aus unseren regionalen Niederlassungen." },
    ],
    body: `    <section class="services-intro" id="rlt-industrie-intro" data-section="intro">
      <div class="container">
        <article class="section-copy">
          <p class="eyebrow">RLT-REINIGUNG INDUSTRIE</p>
          <h2>Normgerechte L&uuml;ftungshygiene f&uuml;r Produktion, Technik und Betrieb</h2>
          <div class="gradient-line"></div>
          <p>In Industriegeb&auml;uden transportieren raumlufttechnische Anlagen gro&szlig;e Luftmengen &ndash; und mit ihnen Staub, Aerosole, Fasern und Prozessr&uuml;ckst&auml;nde. Ablagerungen in Kan&auml;len, an W&auml;rme&uuml;bertragern und in Filterkammern mindern die Hygiene, senken die Effizienz und k&ouml;nnen die Produktionssicherheit gef&auml;hrden. Als technischer Hygienedienstleister reinigen wir Ihre RLT-Anlagen normbezogen nach <a class="text-link" href="../../normen/din-en-15780/index.html">DIN EN 15780</a> und <a class="text-link" href="../../normen/vdi-6022/index.html">VDI 6022</a> &ndash; B2B, ohne Privatkundengesch&auml;ft.</p>
          <a class="button button--solid" href="../../kontakt/angebot-anfordern/index.html">RLT-Reinigung anfragen</a>
        </article>
      </div>
    </section>

    <section class="svc-section svc-section--soft" data-section="ausloeser">
      <div class="container">
        <header class="section-copy svc-section__head">
          <p class="eyebrow">TYPISCHE AUSL&Ouml;SER</p>
          <h2>Wann eine RLT-Reinigung in der Industrie notwendig wird</h2>
          <div class="gradient-line"></div>
        </header>
        <div class="svc-decision">
          <div class="svc-decision__card"><h3>Hygienebefund</h3><p>Eine Hygieneinspektion zeigt Verschmutzung oder mikrobiologische Auff&auml;lligkeiten.</p></div>
          <div class="svc-decision__card"><h3>Audit &amp; Nachweis</h3><p>Kunden, Beh&ouml;rden oder Zertifizierungen verlangen einen sauberen, dokumentierten Zustand.</p></div>
          <div class="svc-decision__card"><h3>Produktionssicherheit</h3><p>Ablagerungen gef&auml;hrden Produktqualit&auml;t, Brandlast oder Anlagenverf&uuml;gbarkeit.</p></div>
          <div class="svc-decision__card"><h3>Effizienzverlust</h3><p>Verschmutzte Bauteile erh&ouml;hen Druckverlust und Energieverbrauch.</p></div>
        </div>
      </div>
    </section>

    <section class="svc-section" data-section="ablauf">
      <div class="container reference-overview__layout">
        <div class="cleanroom-overview__grid">
          <article class="section-copy">
            <p class="eyebrow">ABLAUF &amp; DOKUMENTATION</p>
            <h2>So reinigen wir Ihre RLT-Anlage</h2>
            <div class="gradient-line"></div>
            <ul class="svc-checklist">
              <li><strong>Bestandsaufnahme:</strong> Beurteilung des Anlagenzustands und Festlegung der Sauberkeitsklasse nach DIN EN 15780</li>
              <li><strong>Reinigung:</strong> Kan&auml;le, W&auml;rme&uuml;bertrager, Ventilatoren, Filterkammern und Klappen</li>
              <li><strong>Desinfektion bei Bedarf:</strong> durch staatlich gepr&uuml;fte Desinfektoren</li>
              <li><strong>Vorher-/Nachher-Dokumentation:</strong> Bildnachweis je Abschnitt</li>
              <li><strong>Abschlussbericht:</strong> auditf&auml;higer Nachweis Ihrer Betreiberpflicht</li>
            </ul>
            <a class="button button--solid" href="../../kontakt/angebot-anfordern/index.html">Angebot anfordern</a>
          </article>
          <figure class="company-media-card">
            <img src="../../Bildmaterial_final/shared/anlagen-lueftungsreinigung7.webp" alt="Industrielle RLT-Anlage auf einem Geb&auml;udedach">
          </figure>
        </div>
      </div>
    </section>

    <section class="svc-section svc-section--soft" data-section="vorteile">
      <div class="container">
        <header class="section-copy svc-section__head">
          <p class="eyebrow">VORTEILE &amp; NORMEN</p>
          <h2>Ihr Nutzen als Betreiber</h2>
          <div class="gradient-line"></div>
        </header>
        <ul class="svc-checklist">
          <li>Erf&uuml;llung der Betreiberpflicht und Auditf&auml;higkeit nach VDI 6022 / DIN EN 15780</li>
          <li>Schnelle hygienische Wiederverf&uuml;gbarkeit der Anlage</li>
          <li>Geringerer Druckverlust und Energieverbrauch</li>
          <li>Reduziertes Hygiene- und Haftungsrisiko</li>
        </ul>
        <h3 class="svc-cluster-card__title" style="margin-top:18px;">Weiterf&uuml;hrende Leistungen</h3>
        <ul class="svc-related">
          <li><a href="../../anlagen/lueftungsreinigung/index.html">L&uuml;ftungsreinigung</a></li>
          <li><a href="../../anlagen/luftkanalreinigung/index.html">Luftkanalreinigung</a></li>
          <li><a href="../../hygieneinspektion-vdi-6022/index.html">Hygieneinspektion VDI 6022</a></li>
          <li><a href="../reinigung-desinfektion/index.html">Reinigung &amp; Desinfektion</a></li>
        </ul>
      </div>
    </section>`,
    ctaTitle: "RLT-Reinigung f&uuml;r Ihren Standort anfragen",
    ctaText: "Beschreiben Sie kurz Ihre Anlage und Branche &ndash; wir nennen Ihnen Umfang, Ablauf und Ihren lokalen Ansprechpartner.",
  },

  {
    dir: "leistungen/vdi-6022-pruefbericht-musterbericht",
    title: "VDI 6022 Prüfbericht | Musterbericht anfordern",
    desc: "Wie IGIENAIR Hygieneinspektionen nach VDI 6022 dokumentiert – Bilddokumentation, Ampelsystem, Maßnahmen und Online-Zugriff. Musterbericht anfordern.",
    url: "https://igienair.de/leistungen/vdi-6022-pruefbericht-musterbericht/",
    h1: "VDI 6022 Prüfbericht und digitale Bilddokumentation",
    crumbCurrent: "VDI 6022 Prüfbericht & Musterbericht",
    serviceName: "VDI 6022 Prüfbericht und Dokumentation",
    serviceType: "Dokumentation und Berichtswesen zur Hygieneinspektion nach VDI 6022",
    image: "../../Bildmaterial_final/shared/inspektion-hygieneinspektion-vdi-6022.webp",
    imageAlt: "Dokumentation einer Hygieneinspektion nach VDI 6022",
    faqs: [
      { q: "Was ist im VDI 6022 Pr&uuml;fbericht enthalten?", a: "Der Bericht enth&auml;lt die Befunde der Hygieneinspektion, eine Bilddokumentation, die Bewertung im Ampelsystem, mikrobiologische Ergebnisse, eine Priorit&auml;tenliste sowie konkrete Handlungsempfehlungen." },
      { q: "Kann ich einen Musterbericht ansehen?", a: "Ja. Auf Anfrage stellen wir Ihnen einen Musterbericht bereit, damit Sie Aufbau, Tiefe und Aussagekraft unserer Dokumentation vor der Beauftragung beurteilen k&ouml;nnen." },
      { q: "Was bedeutet das Ampelsystem im Bericht?", a: "Das Ampelsystem priorisiert festgestellte M&auml;ngel nach Dringlichkeit (rot/gelb/gr&uuml;n) und macht so transparent, welche Ma&szlig;nahmen kurzfristig und welche mittelfristig erforderlich sind." },
      { q: "Ist der Bericht f&uuml;r Audits und Beh&ouml;rden geeignet?", a: "Ja. Die Dokumentation ist so aufgebaut, dass Sie Ihre Betreiberpflicht nach VDI 6022 gegen&uuml;ber Pr&uuml;fern, Auditoren und Beh&ouml;rden belastbar nachweisen k&ouml;nnen." },
      { q: "Erhalte ich die Dokumentation auch digital?", a: "Auf Wunsch stellen wir die Berichte digital und gesichert online bereit, sodass Sie jederzeit Zugriff auf Ihre Befunde und deren Verlauf haben." },
    ],
    body: `    <section class="services-intro" id="bericht-intro" data-section="intro">
      <div class="container">
        <article class="section-copy">
          <p class="eyebrow">PR&Uuml;FBERICHT &amp; DOKUMENTATION</p>
          <h2>Warum der Bericht &uuml;ber die eigentliche Pr&uuml;fung entscheidet</h2>
          <div class="gradient-line"></div>
          <p>Eine <a class="text-link" href="../../hygieneinspektion-vdi-6022/index.html">Hygieneinspektion nach VDI 6022</a> ist nur so wertvoll wie ihre Dokumentation. Erst ein nachvollziehbarer Pr&uuml;fbericht macht Befunde belastbar, Ma&szlig;nahmen planbar und Ihre Betreiberpflicht auditf&auml;hig. IGIENAIR dokumentiert jede Inspektion mit digitaler Bilddokumentation, einer Bewertung im Ampelsystem und klaren Handlungsempfehlungen.</p>
          <a class="button button--solid" href="../../kontakt/angebot-anfordern/index.html">Musterbericht anfordern</a>
        </article>
      </div>
    </section>

    <section class="svc-section svc-section--soft" data-section="aufbau">
      <div class="container">
        <header class="section-copy svc-section__head">
          <p class="eyebrow">AUFBAU DES BERICHTS</p>
          <h2>Das steckt in unserer Dokumentation</h2>
          <div class="gradient-line"></div>
        </header>
        <div class="svc-infobox">
          <h3>Inhalte des VDI 6022 Pr&uuml;fberichts</h3>
          <ul class="svc-checklist">
            <li><strong>Bilddokumentation</strong> der hygienisch relevanten Stellen</li>
            <li><strong>Ampelsystem</strong> zur Priorisierung festgestellter M&auml;ngel</li>
            <li>Mikrobiologische Ergebnisse inkl. Laborbeurteilung</li>
            <li>Grafische Darstellung des Anlagenaufbaus mit Mess- und Inspektionspunkten</li>
            <li>Priorit&auml;tenliste und konkrete Handlungsempfehlungen</li>
            <li>Auf Wunsch gesicherter Online-Zugriff auf Ihre Berichte</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="svc-section" data-section="musterbericht">
      <div class="container reference-overview__layout">
        <div class="cleanroom-overview__grid">
          <article class="section-copy">
            <p class="eyebrow">MUSTERBERICHT</p>
            <h2>&Uuml;berzeugen Sie sich vor der Beauftragung</h2>
            <div class="gradient-line"></div>
            <p>Fordern Sie einen Musterbericht an und beurteilen Sie selbst, wie aussagekr&auml;ftig und verst&auml;ndlich unsere Dokumentation ist. So sehen Sie vorab, welchen Nachweis Sie f&uuml;r Ihre Betreiberpflicht erhalten.</p>
            <p>Weitere Unterlagen und Vorlagen finden Sie in unserem <a class="text-link" href="../../downloads/index.html">Download-Bereich</a>.</p>
            <a class="button button--solid" href="../../kontakt/angebot-anfordern/index.html">Musterbericht anfordern</a>
          </article>
          <figure class="company-media-card">
            <img src="../../Bildmaterial_final/shared/inspektion-hygieneinspektion-vdi-6022.webp" alt="Dokumentation einer Hygieneinspektion nach VDI 6022">
          </figure>
        </div>
      </div>
    </section>

    <section class="svc-section svc-section--soft" data-section="weiter">
      <div class="container">
        <header class="section-copy svc-section__head">
          <p class="eyebrow">WEITERF&Uuml;HREND</p>
          <h2>Passende Leistungen</h2>
          <div class="gradient-line"></div>
        </header>
        <ul class="svc-related">
          <li><a href="../../hygieneinspektion-vdi-6022/index.html">Hygieneinspektion VDI 6022</a></li>
          <li><a href="../inspektionundgutachten/index.html">Inspektion &amp; Gutachten</a></li>
          <li><a href="../../downloads/index.html">Downloads</a></li>
          <li><a href="../../kontakt/angebot-anfordern/index.html">Angebot anfordern</a></li>
        </ul>
      </div>
    </section>`,
    ctaTitle: "Musterbericht anfordern",
    ctaText: "Wir senden Ihnen einen aussagekr&auml;ftigen Musterbericht und beantworten Ihre Fragen zur Dokumentation nach VDI 6022.",
  },

  {
    dir: "leistungen/verdunstungskuehlanlage-vdi-2047-42-bimschv",
    title: "Verdunstungskühlanlage VDI 2047-2 | 42. BImSchV",
    desc: "Reinigung, Hygiene und Betreiberpflicht für Verdunstungskühlanlagen: VDI 2047-2, 42. BImSchV, Biofilm, Entkalkung und Dokumentation.",
    url: "https://igienair.de/leistungen/verdunstungskuehlanlage-vdi-2047-42-bimschv/",
    h1: "Hygiene von Verdunstungskühlanlagen nach VDI 2047-2 und 42. BImSchV",
    crumbCurrent: "Verdunstungskühlanlage VDI 2047-2 / 42. BImSchV",
    serviceName: "Hygiene von Verdunstungskühlanlagen nach VDI 2047-2",
    serviceType: "Hygiene, Reinigung und Betreiberpflicht für Verdunstungskühlanlagen",
    image: "../../Bildmaterial_final/shared/anlage-kuehlturmreinigung4.webp",
    imageAlt: "Verdunstungsk&uuml;hlanlage im Au&szlig;enbereich",
    faqs: [
      { q: "Welche Pflichten gelten f&uuml;r Verdunstungsk&uuml;hlanlagen?", a: "Betreiber m&uuml;ssen den hygienischen Betrieb sicherstellen und das Risiko wasserassoziierter Keime wie Legionellen minimieren. Grundlage sind die 42. BImSchV und die VDI 2047-2, inklusive Gef&auml;hrdungsbeurteilung und Dokumentation." },
      { q: "Was schreibt die 42. BImSchV vor?", a: "Die 42. BImSchV regelt Errichtung und Betrieb von Verdunstungsk&uuml;hlanlagen, K&uuml;hlt&uuml;rmen und Nassabscheidern &ndash; unter anderem regelm&auml;&szlig;ige Untersuchungen, Pr&uuml;fpflichten und die Anzeige der Anlage bei der Beh&ouml;rde." },
      { q: "Wie entstehen Biofilm und Kalk &ndash; und warum sind sie kritisch?", a: "Wasser, W&auml;rme und organische Stoffe bilden den N&auml;hrboden f&uuml;r Biofilme, in denen sich Keime vermehren. Kalk und Ablagerungen mindern zus&auml;tzlich Leistung und Hygiene. Beides muss fachgerecht entfernt werden." },
      { q: "Reinigung oder Sanierung &ndash; was ist n&ouml;tig?", a: "Reicht eine Reinigung und Desinfektion nicht aus, sanieren wir betroffene Bauteile wie F&uuml;llk&ouml;rper, Spr&uuml;hd&uuml;sen und Tropfenabscheider. Die Entscheidung leiten wir aus Inspektion und Gef&auml;hrdungsbeurteilung ab." },
      { q: "Erhalte ich einen Hygienenachweis?", a: "Ja. Nach den Ma&szlig;nahmen erhalten Sie eine pr&uuml;ffeste Dokumentation inklusive Bildmaterial und Hygienenachweis als Grundlage f&uuml;r Ihre Betreiberpflicht." },
    ],
    body: `    <section class="services-intro" id="vka-intro" data-section="intro">
      <div class="container">
        <article class="section-copy">
          <p class="eyebrow">VERDUNSTUNGSK&Uuml;HLANLAGE</p>
          <h2>Betreiberpflicht nach VDI 2047-2 und 42. BImSchV sicher erf&uuml;llen</h2>
          <div class="gradient-line"></div>
          <p>Verdunstungsk&uuml;hlanlagen, offene K&uuml;hlt&uuml;rme und Hybridk&uuml;hler sind wirtschaftlich &ndash; aber hygienisch sensibel. Als Betreiber stehen Sie nach der <a class="text-link" href="../../normen/vdi-2047/index.html">VDI 2047-2</a> und der 42. BImSchV in der Pflicht, das Risiko wasserassoziierter Keime wie Legionellen zu minimieren und den Betrieb nachweisbar zu dokumentieren. IGIENAIR unterst&uuml;tzt Sie von der Gef&auml;hrdungsbeurteilung &uuml;ber Reinigung und Desinfektion bis zur Sanierung.</p>
          <a class="button button--solid" href="../../kontakt/angebot-anfordern/index.html">Beratung anfragen</a>
        </article>
      </div>
    </section>

    <section class="svc-section svc-section--soft" data-section="pflichten">
      <div class="container">
        <header class="section-copy svc-section__head">
          <p class="eyebrow">BETREIBERPFLICHT</p>
          <h2>Was VDI 2047-2 und 42. BImSchV verlangen</h2>
          <div class="gradient-line"></div>
        </header>
        <div class="svc-infobox">
          <h3>Ihre Pflichten im &Uuml;berblick</h3>
          <ul class="svc-checklist">
            <li>Gef&auml;hrdungsbeurteilung durch eine fachkundige Person</li>
            <li>Regelm&auml;&szlig;ige mikrobiologische Untersuchungen (u. a. Legionellen)</li>
            <li>Reinigung, Desinfektion und Entkalkung relevanter Bauteile</li>
            <li>Dokumentation, Betriebstagebuch und Anzeige der Anlage bei der Beh&ouml;rde</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="svc-section" data-section="risiken">
      <div class="container reference-overview__layout">
        <div class="cleanroom-overview__grid">
          <article class="section-copy">
            <p class="eyebrow">BIOFILM, KALK &amp; KORROSION</p>
            <h2>Risiken erkennen und beseitigen</h2>
            <div class="gradient-line"></div>
            <p>In Wasser f&uuml;hrenden Systemen bilden sich Biofilm, Algen, Schlamm und Kalk. Sie bieten Keimen einen N&auml;hrboden, mindern die K&uuml;hlleistung und f&ouml;rdern Korrosion. Wir entfernen Ablagerungen fachgerecht, desinfizieren und dokumentieren das Ergebnis &ndash; f&uuml;r einen hygienisch einwandfreien, energieeffizienten Betrieb.</p>
            <a class="button button--solid" href="../../kontakt/angebot-anfordern/index.html">Angebot anfordern</a>
          </article>
          <figure class="company-media-card">
            <img src="../../Bildmaterial_final/shared/anlage-kuehlturmreinigung4.webp" alt="Verdunstungsk&uuml;hlanlage im Au&szlig;enbereich">
          </figure>
        </div>
      </div>
    </section>

    <section class="svc-section svc-section--soft" data-section="weiter">
      <div class="container">
        <header class="section-copy svc-section__head">
          <p class="eyebrow">WEITERF&Uuml;HREND</p>
          <h2>Passende Leistungen</h2>
          <div class="gradient-line"></div>
        </header>
        <ul class="svc-related">
          <li><a href="../../anlagen/kuehlturmreinigung/index.html">K&uuml;hlturmreinigung</a></li>
          <li><a href="../../gefaehrdungsbeurteilung-vdi-2047/index.html">Gef&auml;hrdungsbeurteilung VDI 2047-2</a></li>
          <li><a href="../instandsetzung-sanierung/index.html">Instandsetzung &amp; Sanierung</a></li>
          <li><a href="../../normen/vdi-2047/index.html">Norm VDI 2047-2</a></li>
        </ul>
      </div>
    </section>`,
    ctaTitle: "Verdunstungsk&uuml;hlanlage pr&uuml;fen lassen",
    ctaText: "Wir bewerten Ihre Anlage nach VDI 2047-2 / 42. BImSchV und planen Reinigung, Desinfektion oder Sanierung inklusive Dokumentation.",
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

  return `  <main>\n${hero}\n\n${p.body}\n\n${faq}\n\n${cta}\n  </main>`;
}

async function main() {
  const template = await fs.readFile(TEMPLATE, "utf8");
  for (const p of PAGES) {
    let html = template;
    html = html.replace(T.title, `<title>${p.title.replace(/&/g, "&amp;")}</title>`);
    html = html.replace(T.desc, `<meta name="description" content="${p.desc}">`);
    html = html.replace(T.ogTitle, `<meta property="og:title" content="${p.title.replace(/&/g, "&amp;")}">`);
    html = html.replace(T.ogDesc, `<meta property="og:description" content="${p.desc}">`);
    html = html.replace(T.ogUrl, `<meta property="og:url" content="${p.url}">`);
    html = html.replace(T.canonical, `<link rel="canonical" href="${p.url}">`);

    html = html.replace(/  <main>[\s\S]*<\/main>/, buildMain(p));

    const crumb = [
      { name: "Startseite", item: "https://igienair.de/" },
      { name: "Leistungen", item: "https://igienair.de/leistungen/" },
      { name: p.crumbCurrent.replace(/&/g, "&"), item: p.url },
    ];
    const ld = jsonLd(p.serviceName, p.serviceType, p.url, crumb, p.faqs);
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
