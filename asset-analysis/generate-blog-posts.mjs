import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const NEWS_DIR = path.join(ROOT, "unternehmen", "news");
const TEMPLATE = fs.readFileSync(
  path.join(NEWS_DIR, "vdi-6022-betreiber-rlt-anlagen", "index.html"),
  "utf8"
);

const headerPart = TEMPLATE.match(/^[\s\S]*(?=<main>)/)[0];
const footerPart = TEMPLATE.match(/<footer[\s\S]*$/)?.[0] ?? "";

function faqSection(id, title, items) {
  const panels = items
    .map(
      (item, i) => `
          <article class="accordion-item${i === 0 ? " is-open" : ""}" data-accordion-item>
            <h3 class="accordion-item__heading">
              <button class="accordion-item__trigger" type="button" aria-expanded="${i === 0 ? "true" : "false"}" aria-controls="${id}-panel-${i + 1}" id="${id}-trigger-${i + 1}" data-accordion-trigger>${item.q}</button>
            </h3>
            <div class="accordion-item__panel" id="${id}-panel-${i + 1}" role="region" aria-labelledby="${id}-trigger-${i + 1}" data-accordion-panel${i === 0 ? "" : " hidden"}>
              <p>${item.a}</p>
            </div>
          </article>`
    )
    .join("\n");

  return `
    <section class="sustainability-accordion-section home-faq news-article-faq" data-section="faq" id="${id}">
      <div class="container faq-section">
        <header class="faq-section__header">
          <p class="eyebrow">H&Auml;UFIGE FRAGEN</p>
          <h2>${title}</h2>
          <div class="gradient-line"></div>
        </header>
        <div class="accordion faq-accordion" data-accordion>
          ${panels}
        </div>
      </div>
    </section>`;
}

function articleImage(post) {
  return post.cardImage.replace(/^\.\.\/\.\.\//, "../../../");
}

function getRecentPosts(currentPost, limit = 3) {
  return [...posts]
    .filter((p) => p.slug !== currentPost.slug)
    .sort((a, b) => b.dateIso.localeCompare(a.dateIso))
    .slice(0, limit);
}

function buildRecentPostsSidebar(currentPost) {
  const items = getRecentPosts(currentPost)
    .map(
      (p) => `
            <li class="news-aside-recent__item">
              <a class="news-aside-recent__link" href="../${p.slug}/index.html">
                <span class="news-aside-recent__media news-aside-recent__media--${p.category === "normen" ? "normen" : "hygiene"}">
                  <img src="${articleImage(p)}" alt="" width="120" height="68" loading="lazy" decoding="async">
                </span>
                <span class="news-aside-recent__text">
                  <time class="news-aside-recent__date" datetime="${p.dateIso}">${p.dateDisplay}</time>
                  <span class="news-aside-recent__title">${p.h1}</span>
                </span>
              </a>
            </li>`
    )
    .join("\n");

  return `
          <div class="glossary-term__aside-card news-aside-card">
            <h2 class="glossary-term__aside-title">Neueste Beitr&auml;ge</h2>
            <ul class="news-aside-recent">${items}
            </ul>
            <a class="news-aside-recent__all text-link" href="../index.html">Alle News ansehen</a>
          </div>`;
}

function buildShareSidebar(post, canonical) {
  const title = encodeURIComponent(post.shareTitle);
  const url = encodeURIComponent(canonical);
  const whatsappText = encodeURIComponent(`${post.shareTitle} – ${canonical}`);
  const mailBody = encodeURIComponent(`${post.shareTitle}\n\n${post.metaDescription}\n\n${canonical}`);

  return `
          <div class="glossary-term__aside-card news-aside-card news-aside-card--share">
            <h2 class="glossary-term__aside-title">Beitrag teilen</h2>
            <ul class="news-share">
              <li>
                <a class="news-share__link news-share__link--linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.25 6.5 1.75 1.75 0 016.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h3v1.3a3.11 3.11 0 012.7-1.4c1.55 0 2.46 1 2.46 3.13V19z"/></svg>
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a class="news-share__link news-share__link--whatsapp" href="https://wa.me/?text=${whatsappText}" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a class="news-share__link news-share__link--teams" href="https://teams.microsoft.com/share?href=${url}&msgText=${title}" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.625 8.25h-2.437a2.812 2.812 0 10-5.625 0H9.75V6.375A2.625 2.625 0 007.125 3.75h-3A2.625 2.625 0 001.5 6.375v11.25A2.625 2.625 0 004.125 20.25h9.75A2.625 2.625 0 0016.5 17.625v-1.875h4.125A2.625 2.625 0 0023.25 13.125V10.875A2.625 2.625 0 0020.625 8.25zM7.125 6.375a.375.375 0 01.375-.375h3a.375.375 0 01.375.375v.375h-3.75V6.375zm9 11.25a.375.375 0 01-.375.375h-9a.375.375 0 01-.375-.375V9.75h9.75v7.875zM21 13.125a.375.375 0 01-.375.375H16.5V9.75h4.125a.375.375 0 01.375.375v3z"/></svg>
                  <span>Microsoft Teams</span>
                </a>
              </li>
              <li>
                <a class="news-share__link news-share__link--mail" href="mailto:?subject=${title}&amp;body=${mailBody}">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"/></svg>
                  <span>E-Mail</span>
                </a>
              </li>
            </ul>
          </div>`;
}

function buildPage(post) {
  const canonical = `https://igienair.de/unternehmen/news/${post.slug}/`;
  const faq = faqSection(post.faqId, post.faqTitle, post.faq);

  const main = `<main>
    <section class="company-hero glossary-term-hero" id="top" data-section="hero">
      <div class="container company-hero__content">
        <p class="eyebrow">News &raquo; ${post.categoryLabel}</p>
        <h1>${post.h1}</h1>
        <nav class="hero-breadcrumb" aria-label="Brotkrumen">
          <a class="hero-breadcrumb__link" href="../../../index.html">Startseite</a>
          <span class="hero-breadcrumb__sep" aria-hidden="true">&raquo;</span>
          <a class="hero-breadcrumb__link" href="../../index.html">Unternehmen</a>
          <span class="hero-breadcrumb__sep" aria-hidden="true">&raquo;</span>
          <a class="hero-breadcrumb__link" href="../index.html">News</a>
          <span class="hero-breadcrumb__sep" aria-hidden="true">&raquo;</span>
          <span class="hero-breadcrumb__current" aria-current="page">${post.breadcrumbShort}</span>
        </nav>
        <div class="glossary-term-hero__actions">
          <a class="button button--outline" href="../index.html">Zur News-&Uuml;bersicht</a>
          <a class="button button--solid" href="${post.ctaHref}">${post.ctaButtonHero}</a>
        </div>
      </div>
    </section>

    <section class="glossary-term" data-section="article">
      <div class="container glossary-term__layout">
        <article class="section-copy glossary-term__content">
          <p class="news-article__meta"><span class="news-article__category">${post.categoryLabel}</span><time class="news-article__date" datetime="${post.dateIso}">${post.dateDisplay}</time></p>
          ${post.content}
        </article>
        <aside class="glossary-term__aside" aria-label="Seitenleiste">
          <div class="news-aside-stack">
            ${buildRecentPostsSidebar(post)}
            ${buildShareSidebar(post, canonical)}
            <div class="glossary-term__aside-card news-aside-card">
            <h2 class="glossary-term__aside-title">Kontaktdaten und Angebot</h2>
            <p><strong>IGIENAIR GmbH</strong><br><em>Firmensitz/<br>Niederlassung Baden-W&uuml;rttemberg</em></p>
            <p>Robert-Bosch-Str. 10<br>76275 Ettlingen<br><a class="text-link" href="tel:+4972433699101">07243 3699101</a><br><a class="text-link" href="mailto:anfrage@igienair.com">anfrage@igienair.com</a></p>
            <a class="button button--solid" href="../../../kontakt/angebot-anfordern/index.html">Jetzt ein Angebot anfordern</a>
          </div>
          </div>
        </aside>
      </div>
    </section>
    ${faq}
    <section class="company-cta" id="news-article-cta" data-section="cta">
      <div class="container company-cta__inner">
        <p class="eyebrow eyebrow--light">JETZT KONTAKT AUFNEHMEN</p>
        <h2>${post.ctaHeadline}</h2>
        <p>${post.ctaText}</p>
        <a class="button button--ghost" href="${post.ctaHref}">${post.ctaButton}</a>
      </div>
    </section>
  </main>`;

  let head = headerPart
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${post.metaDescription}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${post.metaTitle}</title>`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${post.metaTitle} - Igienair GmbH">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`);

  return `${head}${main}${footerPart}`;
}

const posts = [
  {
    slug: "vdi-6022-betreiber-rlt-anlagen",
    h1: "VDI 6022 einfach erkl&auml;rt: Was Betreiber von RLT-Anlagen wissen m&uuml;ssen",
    breadcrumbShort: "VDI 6022 erkl&auml;rt",
    metaTitle: "VDI 6022 erkl&auml;rt: Pflichten f&uuml;r RLT-Betreiber",
    metaDescription: "Was bedeutet VDI 6022 f\u00fcr Betreiber? \u00dcberblick zu Hygieneinspektion, Dokumentation und sicheren RLT-Anlagen.",
    shareTitle: "VDI 6022 erkl\u00e4rt: Pflichten f\u00fcr RLT-Betreiber",
    category: "normen",
    categoryLabel: "Normen &amp; Richtlinien",
    dateIso: "2026-02-12",
    dateDisplay: "12. Februar 2026",
    faqId: "faq-vdi-6022",
    faqTitle: "FAQ zur VDI 6022",
    ctaHref: "../../../hygieneinspektion-vdi-6022/index.html",
    ctaButtonHero: "Hygieneinspektion anfragen",
    ctaHeadline: "VDI 6022 sicher erf&uuml;llen?",
    ctaText: "Wir pr&uuml;fen Ihre RLT-Anlagen normkonform, dokumentieren Befunde nachvollziehbar und beraten Sie zu den n&auml;chsten Schritten.",
    ctaButton: "Hygieneinspektion nach VDI 6022 anfragen",
    search: "vdi 6022 einfach erklärt betreiber rlt-anlagen hygieneinspektion betreiberpflichten raumlufthygiene dokumentation normen",
    cardExcerpt: "Die VDI 6022 regelt Hygiene in RLT-Anlagen. Was Betreiber zu Inspektion, Dokumentation und Betreiberpflichten wissen m\u00fcssen \u2013 verst\u00e4ndlich erkl\u00e4rt.",
    cardImage: "../../Bildmaterial_final/anlagen/anlagen-lueftungsreinigung1.webp",
    faq: [
      { q: "Ist die VDI 6022 gesetzlich verpflichtend?", a: "Die VDI 6022 ist eine anerkannte Regel der Technik. Betreiber m\u00fcssen den Stand der Technik einhalten; die Richtlinie ist daf\u00fcr der ma\u00dfgebliche Referenzrahmen f\u00fcr hygienischen Betrieb von RLT-Anlagen." },
      { q: "Wie oft ist eine Hygieneinspektion nach VDI 6022 n\u00f6tig?", a: "Je nach Anlagentyp und Nutzung in der Regel alle zwei bis drei Jahre, bei Erstinbetriebnahme zus\u00e4tzlich eine Hygieneerstinspektion. Igienair plant Intervalle passend zu Ihrer Anlage." },
      { q: "Wer darf Hygieneinspektionen durchf\u00fchren?", a: "Inspektionen sollen durch qualifizierte Fachbetriebe erfolgen, die \u00fcber die erforderliche Sachkunde und Messtechnik verf\u00fcgen. Igienair ist auf technische Hygiene und Raumlufthygiene spezialisiert." },
      { q: "Was passiert bei M\u00e4ngeln?", a: "Befunde werden dokumentiert. Bei hygienisch relevanten M\u00e4ngeln sind Reinigung, Desinfektion oder Instandsetzung erforderlich. Wir beraten zu Ma\u00dfnahmen und deren Priorisierung." },
    ],
    content: `
          <figure class="news-article__figure">
            <img src="../../../Bildmaterial_final/anlagen/anlagen-lueftungsreinigung1.webp" alt="RLT-Anlage im Technikraum \u2013 VDI 6022 und Hygieneanforderungen f\u00fcr Betreiber" width="1200" height="675" loading="eager">
          </figure>
          <p>Der Facility Manager eines Verwaltungsgeb&auml;udes erh&auml;lt die Frage vom Gesch&auml;ftsf&uuml;hrer: &bdquo;Sind unsere L&uuml;ftungsanlagen eigentlich in Ordnung?&ldquo; Die Wartung l&auml;uft, Filter werden gewechselt &ndash; doch ob die <strong>Raumlufthygiene</strong> stimmt, l&auml;sst sich aus dem Wartungsvertrag allein nicht ablesen. Genau hier setzt die <a href="../../../normen/vdi-6022/index.html">VDI 6022</a> an.</p>
          <h2>Was ist die VDI 6022?</h2>
          <p>Die <strong>VDI 6022</strong> ist die zentrale Richtlinienreihe f&uuml;r hygienischen Betrieb von <a href="../../../anlagen/lueftungsanlagenreinigung/index.html">RLT-Anlagen</a> und Raumlufttechnik. Sie beschreibt Anforderungen an Planung, Betrieb, Inspektion, Reinigung und Dokumentation &ndash; damit die zugef&uuml;hrte Luft gesundheitlich unbedenklich bleibt.</p>
          <h2>Warum Betreiber handeln m&uuml;ssen</h2>
          <p>Als Betreiber tragen Sie die Verantwortung f&uuml;r <strong>Betriebssicherheit</strong>, <strong>Luftqualit&auml;t</strong> und <strong>Normkonformit&auml;t</strong>. Fehlende Hygienema&szlig;nahmen k&ouml;nnen zu Beschwerden der Nutzer, erh&ouml;htem Energieverbrauch, Schimmelbildung oder im Schadensfall zu Haftungsfragen f&uuml;hren.</p>
          <div class="news-article__infobox">
            <p class="news-article__infobox-title">Gut zu wissen</p>
            <p>Die VDI 6022 unterscheidet Anlagen nach Nutzung und Risiko. Nicht jede L&uuml;ftung ist gleich zu behandeln &ndash; deshalb ist eine fachliche Einordnung durch eine <a href="../../../leistungen/inspektionundgutachten/index.html">Hygieneinspektion</a> sinnvoll.</p>
          </div>
          <h2>Die wichtigsten Betreiberpflichten im &Uuml;berblick</h2>
          <ul>
            <li><strong>Hygieneerstinspektion</strong> nach Inbetriebnahme neuer oder wesentlich ge&auml;nderter Anlagen</li>
            <li><strong>Wiederkehrende Hygieneinspektion</strong> in festgelegten Intervallen</li>
            <li><strong>Dokumentation</strong> aller Pr&uuml;fungen, Befunde und Ma&szlig;nahmen</li>
            <li><strong>Schulung</strong> des Betriebspersonals (Kategorien A und B nach VDI 6022)</li>
            <li><strong>Reinigung und Desinfektion</strong>, wenn Inspektionen Handlungsbedarf zeigen</li>
          </ul>
          <h3>Typische Risiken bei Vernachl&auml;ssigung</h3>
          <p>Verschmutzte W&auml;rme&uuml;bertrager, feuchte Befeuchter, undichte Filter oder mikrobielles Wachstum in Kan&auml;len sind h&auml;ufige Befunde. Sie beeintr&auml;chtigen Hygiene und Effizienz gleicherma&szlig;en.</p>
          <div class="news-article__checklist">
            <h3>Checkliste f&uuml;r Betreiber</h3>
            <ul>
              <li>Liegt eine aktuelle Hygieneinspektion vor?</li>
              <li>Sind Inspektionsintervalle im Wartungsplan hinterlegt?</li>
              <li>Wurden M&auml;ngel aus dem letzten Gutachten abgearbeitet?</li>
              <li>Ist das Betriebspersonal nach VDI 6022 geschult?</li>
              <li>Gibt es eine l&uuml;ckenlose Dokumentation f&uuml;r Beh&ouml;rden und Audits?</li>
            </ul>
          </div>
          <h2>Praxisempfehlung: Planbar statt reaktiv</h2>
          <p>Wer Inspektionen fr&uuml;hzeitig plant, vermeidet &Uuml;berraschungen bei Audits und reduziert Folgekosten. Igienair unterst&uuml;tzt Betreiber deutschlandweit mit <a href="../../../hygieneinspektion-vdi-6022/index.html">Hygieneinspektionen nach VDI 6022</a>, nachvollziehbarer Dokumentation und klarer Handlungsempfehlung.</p>
          <div class="news-article__inline-cta">
            <h3>Jetzt Klarheit f&uuml;r Ihre RLT-Anlage</h3>
            <p>Fragen zur VDI 6022? Wir pr&uuml;fen Ihren Status und zeigen, welche Schritte als N&auml;chstes sinnvoll sind.</p>
            <a class="button button--solid" href="../../../kontakt/angebot-anfordern/index.html">Beratung zur VDI 6022 anfordern</a>
          </div>
          <h2>Fazit</h2>
          <p>Die VDI 6022 ist kein reines Experten-Thema, sondern eine klare Orientierung f&uuml;r verantwortungsvollen Betrieb. Wer Hygieneinspektion, Dokumentation und Ma&szlig;nahmen systematisch verankert, sch&uuml;tzt Nutzer, Anlage und Unternehmen gleicherma&szlig;en.</p>`,
  },
  {
    slug: "hygieneinspektion-vdi-6022-ablauf-maengel",
    h1: "Hygieneinspektion nach VDI 6022: Ablauf, Intervalle und typische M&auml;ngel",
    breadcrumbShort: "Hygieneinspektion VDI 6022",
    metaTitle: "Hygieneinspektion VDI 6022: Ablauf &amp; M&auml;ngel",
    metaDescription: "So l\u00e4uft eine Hygieneinspektion nach VDI 6022 ab. Erfahren Sie, welche M\u00e4ngel h\u00e4ufig auftreten und worauf Betreiber achten sollten.",
    shareTitle: "Hygieneinspektion VDI 6022: Ablauf & M\u00e4ngel",
    category: "normen",
    categoryLabel: "Normen &amp; Richtlinien",
    dateIso: "2026-03-12",
    dateDisplay: "12. M&auml;rz 2026",
    faqId: "faq-hygieneinspektion",
    faqTitle: "FAQ Hygieneinspektion VDI 6022",
    ctaHref: "../../../kontakt/angebot-anfordern/index.html",
    ctaButtonHero: "Inspektion beauftragen",
    ctaHeadline: "Hygieneinspektion termingerecht planen",
    ctaText: "Wir f&uuml;hren Hygieneinspektionen nach VDI 6022 durch, dokumentieren Befunde online und unterst&uuml;tzen Sie bei der Umsetzung notwendiger Ma&szlig;nahmen.",
    ctaButton: "Jetzt Hygieneinspektion anfragen",
    search: "hygieneinspektion vdi 6022 ablauf intervalle mängel typische befund rlt prüfung gutachten",
    cardExcerpt: "Schritt f\u00fcr Schritt: So l\u00e4uft die Hygieneinspektion nach VDI 6022 ab \u2013 inklusive Intervalle, Pr\u00fcfpunkte und typischen M\u00e4ngeln.",
    cardImage: "../../Bildmaterial_final/shared/inspektionsgutachten.webp",
    faq: [
      { q: "Wie lange dauert eine Hygieneinspektion?", a: "Das h\u00e4ngt von Anlagengr\u00f6\u00dfe und Erreichbarkeit ab. Nach einer Vorabkl\u00e4rung erhalten Sie einen realistischen Zeitrahmen f\u00fcr Ihr Objekt." },
      { q: "Muss die Anlage daf\u00fcr stillstehen?", a: "Teilweise ja \u2013 je nach Pr\u00fcfpunkt. Wir stimmen den Ablauf mit Ihnen ab, um den Betrieb so wenig wie m\u00f6glich zu beeintr\u00e4chtigen." },
      { q: "Welche M\u00e4ngel treten am h\u00e4ufigsten auf?", a: "Typisch sind Verschmutzungen an W\u00e4rme\u00fcbertragern, Befeuchtern und Filtern, undichte Filterpassungen, Ablagerungen in Kan\u00e4;len sowie fehlende oder unvollst\u00e4ndige Dokumentation." },
      { q: "Erhalte ich ein schriftliches Gutachten?", a: "Ja. Sie erhalten ein nachvollziehbares Protokoll mit Befunden, Bewertungen und Handlungsempfehlungen \u2013 Grundlage f\u00fcr Reinigung, Instandsetzung oder den n\u00e4chsten Inspektionstermin." },
      { q: "Was ist der Unterschied zur Wartung?", a: "Wartung sichert die Funktion. Die Hygieneinspektion bewertet gezielt hygienische Risiken nach VDI 6022 \u2013 erg\u00e4nzend und nicht ersetzend." },
    ],
    content: `
          <figure class="news-article__figure">
            <img src="../../../Bildmaterial_final/shared/inspektionsgutachten.webp" alt="Hygieneinspektion nach VDI 6022 \u2013 Fachkraft pr\u00fcft RLT-Anlage" width="1200" height="675" loading="eager">
          </figure>
          <p>Der Inspektionstermin r&uuml;ckt n&auml;her, doch im Betrieb herrscht Unsicherheit: Was genau passiert bei einer <strong>Hygieneinspektion nach VDI 6022</strong>? Muss die Anlage stillgelegt werden? Und welche Befunde sind &uuml;blich? Dieser Leitfaden gibt Facility Managern und Betreibern Klarheit.</p>
          <h2>Was ist eine Hygieneinspektion?</h2>
          <p>Die Hygieneinspektion ist eine systematische Bewertung von <a href="../../../glossar/rlt-anlagen/index.html">RLT-Anlagen</a> und angrenzenden Bereichen auf hygienische Risiken. Sie ist in der <a href="../../../normen/vdi-6022/index.html">VDI 6022</a> verankert und geht &uuml;ber eine reine Funktionspr&uuml;fung hinaus.</p>
          <h2>Ablauf in f&uuml;nf Schritten</h2>
          <ol>
            <li><strong>Vorbereitung:</strong> Abstimmung von Anlagen&uuml;bersicht, Zug&auml;ngen, Unterlagen und Terminfenster</li>
            <li><strong>Sichtpr&uuml;fung:</strong> Beurteilung von Komponenten, Leitungen, Filter, Befeuchtern und W&auml;rme&uuml;bertragern</li>
            <li><strong>Probenahme &amp; Messungen:</strong> Wo erforderlich mikrobiologische oder stoffliche Untersuchungen</li>
            <li><strong>Bewertung:</strong> Einordnung der Befunde nach VDI 6022 und ggf. weiteren Regelwerken</li>
            <li><strong>Dokumentation:</strong> Gutachten mit Ma&szlig;nahmenempfehlung und n&auml;chstem Pr&uuml;fintervall</li>
          </ol>
          <h2>Inspektionsintervalle</h2>
          <p>Je nach Nutzung und Anlagentyp gelten in der Regel Intervalle von <strong>24 bis 36 Monaten</strong>. Sonderf&auml;lle &ndash; etwa sensible Bereiche oder auff&auml;llige Vorinspektionen &ndash; k&ouml;nnen k&uuml;rzere Zyklen erfordern. Details finden Sie auch im Glossar zur <a href="../../../glossar/hygieneinspektion-nach-vdi-6022/index.html">Hygieneinspektion nach VDI 6022</a>.</p>
          <div class="news-article__infobox">
            <p class="news-article__infobox-title">Praxis-Tipp</p>
            <p>Tragen Sie Inspektionstermine fest in Ihren Wartungsplan ein. So vermeiden Sie L&uuml;cken in der Dokumentation bei Audits oder Versicherungsf&auml;llen.</p>
          </div>
          <h2>Typische M&auml;ngel in der Praxis</h2>
          <ul>
            <li>Staub- und Biofilmablagerungen an W&auml;rme&uuml;bertragern</li>
            <li>Feuchte oder verschmutzte Befeuchter</li>
            <li>Undichte oder falsch eingesetzte Filter</li>
            <li>Korrosion oder Schimmel in Kan&auml;len</li>
            <li>Fehlende Nachweise fr&uuml;herer Reinigungen</li>
          </ul>
          <figure class="news-article__figure">
            <img src="../../../Bildmaterial_final/anlagen/lueftungsreinigung/anlagen-lueftungsreinigung3.webp" alt="Techniker bei Inspektion einer L\u00fcftungsanlage \u2013 typische Pr\u00fcfpunkte VDI 6022" width="1200" height="675" loading="lazy">
          </figure>
          <div class="news-article__checklist">
            <h3>Vorbereitung f&uuml;r Betreiber</h3>
            <ul>
              <li>Anlagenpl&auml;ne und fr&uuml;here Gutachten bereithalten</li>
              <li>Zug&auml;nge zu Technikr&auml;umen und Revisionst&uuml;ren freimachen</li>
              <li>Ansprechpartner vor Ort benennen</li>
              <li>Geplante Stillstandszeiten kommunizieren</li>
            </ul>
          </div>
          <h2>Fazit</h2>
          <p>Eine professionelle Hygieneinspektion schafft Transparenz &uuml;ber den Zustand Ihrer Anlage. Sie ist Grundlage f&uuml;r gezielte <a href="../../../leistungen/reinigung-desinfektion/index.html">Reinigung und Desinfektion</a> und sichert den normkonformen Betrieb langfristig.</p>
          <div class="news-article__inline-cta">
            <h3>Hygieneinspektion beauftragen</h3>
            <p>Igienair f&uuml;hrt Inspektionen und Gutachten nach VDI 6022 bundesweit durch &ndash; terminsicher und dokumentiert.</p>
            <a class="button button--solid" href="../../../leistungen/inspektionundgutachten/index.html">Mehr zu Inspektion &amp; Gutachten</a>
          </div>`,
  },
  {
    slug: "luftkanalreinigung-wann-notwendig-vorteile",
    h1: "Luftkanalreinigung: Wann sie notwendig ist und welche Vorteile sie bringt",
    breadcrumbShort: "Luftkanalreinigung",
    metaTitle: "Luftkanalreinigung: Vorteile, Ablauf &amp; Pflichtwissen",
    metaDescription: "Wann ist eine Luftkanalreinigung sinnvoll? \u00dcberblick zu Ablauf, Vorteilen und hygienischen Anforderungen.",
    shareTitle: "Luftkanalreinigung: Vorteile, Ablauf & Pflichtwissen",
    category: "technische-hygiene",
    categoryLabel: "Technische Hygiene",
    dateIso: "2026-04-12",
    dateDisplay: "12. April 2026",
    faqId: "faq-luftkanal",
    faqTitle: "FAQ Luftkanalreinigung",
    ctaHref: "../../../anlagen/luftkanalreinigung/index.html",
    ctaButtonHero: "Luftkanalreinigung anfragen",
    ctaHeadline: "Luftkan&auml;le fachgerecht reinigen lassen",
    ctaText: "Igienair reinigt Zu- und Abluftkan&auml;le normgerecht, dokumentiert den Zustand vor und nach der Ma&szlig;nahme und ber&auml;t zu sinnvollen Intervallen.",
    ctaButton: "Angebot f&uuml;r Luftkanalreinigung anfordern",
    search: "luftkanalreinigung wann notwendig vorteile zu abluftkanäle din en 15780 raumlufthygiene reinigung",
    cardExcerpt: "Wann Luftkan\u00e4le gereinigt werden sollten, welche Vorteile das bringt und welche Normen Betreiber kennen m\u00fcssen \u2013 kompakt erkl\u00e4rt.",
    cardImage: "../../Bildmaterial_final/anlagen/luftkanalreinigung/luftkanalreinigung-anlagen-anlagen-luftkanalreinigung-3.webp",
    faq: [
      { q: "Wie erkenne ich, dass Kan\u00e4le gereinigt werden m\u00fcssen?", a: "Sichtbare Verschmutzung, Ger\u00fcche, erh\u00f6hter Druckverlust, auff\u00e4llige Inspektionsbefunde oder lange Intervalle ohne Reinigung sind typische Indizien." },
      { q: "Welche Norm ist relevant?", a: "Die DIN EN 15780 definiert Reinigungsgrade und Methoden f\u00fcr L\u00fcftungssysteme. Sie erg\u00e4nzt betriebliche Hygieneanforderungen und VDI-Vorgaben." },
      { q: "Wie oft sollte gereinigt werden?", a: "Das h\u00e4ngt von Nutzung, Umgebung und Verschmutzung ab \u2013 oft im Zyklus von mehreren Jahren, bei Bedarf fr\u00fcher. Eine Inspektion liefert die Grundlage." },
      { q: "Welche Vorteile bringt die Reinigung?", a: "Bessere Luftqualit\u00e4t, geringerer Energiebedarf, weniger Ger\u00fcche, h\u00f6here Betriebssicherheit und nachvollziehbare Hygienedokumentation." },
    ],
    content: `
          <figure class="news-article__figure">
            <img src="../../../Bildmaterial_final/anlagen/luftkanalreinigung/luftkanalreinigung-anlagen-anlagen-luftkanalreinigung-3.webp" alt="Luftkanalnetz in Industriehalle \u2013 wann Luftkanalreinigung sinnvoll ist" width="1200" height="675" loading="eager">
          </figure>
          <p>In einem Produktionsgeb&auml;ude steigt der Energieverbrauch der L&uuml;ftung, Mitarbeiter berichten &uuml;ber staubige Luft &ndash; und im Revisionsschacht zeigt sich, was passiert, wenn <strong>Luftkan&auml;le</strong> zu lange ohne Reinigung betrieben werden. F&uuml;r Betreiber stellt sich dann die Frage: Ist jetzt Handeln n&ouml;tig?</p>
          <h2>Was versteht man unter Luftkanalreinigung?</h2>
          <p>Bei der <strong>Luftkanalreinigung</strong> werden Zu- und Abluftkan&auml;le, Nischen und angrenzende Bauteile mechanisch von Staub, Fett, Biofilm und Ablagerungen befreit. Igienair reinigt <a href="../../../anlagen/luftkanalreinigung/index.html">Zu- &amp; Abluftkan&auml;le</a> mit Verfahren, die zum jeweiligen Kanalsystem und Verschmutzungsgrad passen.</p>
          <h2>Wann ist Reinigung notwendig?</h2>
          <ul>
            <li>Nach auff&auml;lligen Befunden aus Hygieneinspektion oder Kanaluntersuchung</li>
            <li>Bei sichtbarer Verschmutzung in Revisionssch&auml;chten</li>
            <li>Nach Bau- oder Sanierungsphasen mit Staubbelastung</li>
            <li>Bei Geruchsbildung oder R&uuml;ckf&uuml;hrung von Partikeln in R&auml;ume</li>
            <li>Bei &uuml;berschrittenen Reinigungsintervallen nach <a href="../../../normen/din-en-15780/index.html">DIN EN 15780</a></li>
          </ul>
          <h2>Normativer Bezug</h2>
          <p>Die <a href="../../../glossar/luftkanalreinigung/index.html">DIN EN 15780</a> und die VDI-Richtlinienreihe zur Raumlufttechnik definieren, wie Sauberkeit bewertet und dokumentiert wird. Betreiber profitieren, wenn Reinigung und Inspektion zusammen gedacht werden.</p>
          <div class="news-article__infobox">
            <p class="news-article__infobox-title">Vorteile auf einen Blick</p>
            <p>Reine Kan&auml;le verbessern die <strong>Luftqualit&auml;t</strong>, senken oft den <strong>Energiebedarf</strong>, reduzieren Ger&uuml;che und unterst&uuml;tzen <strong>Normkonformit&auml;t</strong> sowie l&uuml;ckenlose Dokumentation.</p>
          </div>
          <h2>Typische Risiken verschmutzter Kan&auml;le</h2>
          <p>Ablagerungen beg&uuml;nstigen mikrobielles Wachstum, erh&ouml;hen Brandlast (z.&nbsp;B. bei Fett in Abluftsystemen) und lassen Ventilatoren h&auml;rter arbeiten. In sensiblen Bereichen kann das Hygiene- und Produktionsrisiko steigen.</p>
          <figure class="news-article__figure">
            <img src="../../../Bildmaterial_final/anlagen/luftkanalreinigung/luftkanalreinigung-anlagen-anlagen-luftkanalreinigung-1.webp" alt="Rotierende B\u00fcrste bei fachgerechter Luftkanalreinigung durch Igienair" width="1200" height="675" loading="lazy">
          </figure>
          <div class="news-article__checklist">
            <h3>Checkliste: Reinigung planen</h3>
            <ul>
              <li>Aktuellen Kanalzustand per Inspektion bewerten lassen</li>
              <li>Relevante Nutzungs- und Hygienerisiken einordnen</li>
              <li>Stillstandszeiten und Zug&auml;nge abstimmen</li>
              <li>Reinigungsnachweis und Fotodokumentation anfordern</li>
              <li>Folgeintervalle im Wartungsplan verankern</li>
            </ul>
          </div>
          <h2>Fazit</h2>
          <p><strong>Luftkanalreinigung</strong> ist keine Daueraufgabe, aber eine wichtige Pr&auml;ventionsma&szlig;nahme. Wer fr&uuml;h handelt, sch&uuml;tzt Nutzer, Anlage und Betriebskosten.</p>
          <div class="news-article__inline-cta">
            <h3>Luftkan&auml;le pr&uuml;fen und reinigen lassen</h3>
            <p>Wir beraten Sie zur sinnvollen Reinigungsstrategie und setzen sie fachgerecht um.</p>
            <a class="button button--solid" href="../../../kontakt/angebot-anfordern/index.html">Angebot anfordern</a>
          </div>`,
  },
  {
    slug: "rlt-anlagen-reinigen-kosten-risiken",
    h1: "RLT-Anlagen reinigen lassen: Warum regelm&auml;&szlig;ige Hygiene Kosten und Risiken senkt",
    breadcrumbShort: "RLT-Anlagen reinigen",
    metaTitle: "RLT-Anlagen reinigen: Hygiene, Sicherheit, Effizienz",
    metaDescription: "Regelm\u00e4\u00dfige Reinigung von RLT-Anlagen verbessert Hygiene, reduziert Risiken und unterst\u00fctzt den normkonformen Betrieb.",
    shareTitle: "RLT-Anlagen reinigen: Hygiene, Sicherheit, Effizienz",
    category: "technische-hygiene",
    categoryLabel: "Technische Hygiene",
    dateIso: "2026-05-12",
    dateDisplay: "12. Mai 2026",
    faqId: "faq-rlt-reinigung",
    faqTitle: "FAQ RLT-Anlagen reinigen",
    ctaHref: "../../../leistungen/reinigung-desinfektion/index.html",
    ctaButtonHero: "Reinigung anfragen",
    ctaHeadline: "RLT-Anlagen hygienisch reinigen lassen",
    ctaText: "Von Filterwechsel bis Kanalreinigung: Igienair sorgt f\u00fcr saubere Anlagen, normgerechte Dokumentation und planbare Intervalle.",
    ctaButton: "Angebot f\u00fcr Reinigung &amp; Desinfektion",
    search: "rlt-anlagen reinigen kosten risiken hygienische reinigung wartung energieeffizienz technische hygiene",
    cardExcerpt: "Regelm\u00e4\u00dfige Reinigung von RLT-Anlagen senkt Kosten, reduziert Risiken und sichert normkonformen Betrieb \u2013 so profitieren Betreiber.",
    cardImage: "../../Bildmaterial_final/shared/reinigung-desinfektion.webp",
    faq: [
      { q: "Was kostet die Reinigung einer RLT-Anlage?", a: "Die Kosten h\u00e4ngen von Anlagengr\u00f6\u00dfe, Verschmutzung, Zug\u00e4nglichkeit und Umfang ab. Nach einer Vor-Ort-Beurteilung erhalten Sie ein transparentes Angebot." },
      { q: "Wie oft sollten RLT-Anlagen gereinigt werden?", a: "Das ergibt sich aus Nutzung, Inspektionsbefunden und Normvorgaben. Oft im mehrj\u00e4hrigen Rhythmus, bei Bedarf h\u00e4ufiger." },
      { q: "Reicht Filterwechsel allein?", a: "Nein. Filter sch\u00fctzen, ersetzen aber keine Reinigung von W\u00e4rme\u00fcbertragern, Befeuchtern, Kan\u00e4len und Komponenten im Str\u00f6mungsweg." },
      { q: "Welchen Nutzen hat Reinigung f\u00fcr Energiekosten?", a: "Saubere Register und Kan\u00e4le reduzieren Druckverlust. Ventilatoren arbeiten effizienter \u2013 das kann den Energieverbrauch sp\u00fcrbar senken." },
    ],
    content: `
          <figure class="news-article__figure">
            <img src="../../../Bildmaterial_final/shared/reinigung-desinfektion.webp" alt="RLT-Anlagen reinigen lassen \u2013 technische Hygiene und Reinigung von L\u00fcftungsanlagen" width="1200" height="675" loading="eager">
          </figure>
          <p>Die j&auml;hrlichen Energiekosten steigen, gleichzeitig mehren sich Beschwerden &uuml;ber stickige Luft. Der Hausmeister wechselt Filter &ndash; doch die W&auml;rme&uuml;bertrager und Kan&auml;le wurden seit Jahren nicht gereinigt. Ein typisches Szenario, das zeigt: <strong>RLT-Anlagen reinigen</strong> hei&szlig;t mehr als Wartung light.</p>
          <h2>Warum regelm&auml;&szlig;ige Hygiene wirtschaftlich sinnvoll ist</h2>
          <p>Verschmutzte <a href="../../../anlagen/lueftungsanlagenreinigung/index.html">RLT-Anlagen</a> arbeiten gegen h&ouml;heren Widerstand. Das kostet Energie, belastet Bauteile und erh&ouml;ht das Risiko hygienischer Probleme. Geplante <a href="../../../leistungen/reinigung-desinfektion/index.html">Reinigung und Desinfektion</a> ist deshalb Pr&auml;vention &ndash; nicht Luxus.</p>
          <h2>Risiken bei vernachl&auml;ssigter Hygiene</h2>
          <ul>
            <li>Schlechtere Raumluftqualit&auml;t und Beschwerden der Nutzer</li>
            <li>Mikrobielles Wachstum an feuchten Bauteilen</li>
            <li>Erh&ouml;hter Energieverbrauch durch Druckverlust</li>
            <li>Fr&uuml;hzeitiger Verschlei&szlig; von Ventilatoren und Registern</li>
            <li>Haftungs- und Dokumentationsl&uuml;cken bei Audits</li>
          </ul>
          <h2>Was bei einer professionellen RLT-Reinigung anf&auml;llt</h2>
          <p>Je nach Befund umfasst die Ma&szlig;nahme Filter, W&auml;rme&uuml;bertrager, Befeuchter, Tropfwasserstellen, Kan&auml;le und sometimes Kondensatleitungen. Igienair stimmt Umfang und Verfahren auf Anlage und Nutzung ab &ndash; normorientiert und dokumentiert.</p>
          <div class="news-article__infobox">
            <p class="news-article__infobox-title">Energieeffizienz mitdenken</p>
            <p>Saubere Anlagen unterst&uuml;tzen auch energetische Ziele. Erg&auml;nzend lohnt sich eine <a href="../../../energetische-inspektion-geg-2020/index.html">energetische Inspektion</a> nach GEG f&uuml;r Klimaanlagen.</p>
          </div>
          <figure class="news-article__figure">
            <img src="../../../Bildmaterial_final/anlagen/anlagen-lueftungsreinigung6.webp" alt="Igienair-Techniker reinigt L\u00fcftungskanal \u2013 RLT-Anlagen hygienisch instand halten" width="1200" height="675" loading="lazy">
          </figure>
          <div class="news-article__checklist">
            <h3>Handlungsempfehlungen f&uuml;r Betreiber</h3>
            <ul>
              <li>Hygieneinspektion als Status-Check nutzen</li>
              <li>Reinigungsma&szlig;nahmen aus Gutachten ableiten</li>
              <li>Intervalle im CAFM-/Wartungssystem hinterlegen</li>
              <li>Dokumentation f&uuml;r Audits bereithalten</li>
              <li>Spezialf&auml;lle (K&uuml;che, Produktion, Gesundheit) gesondert bewerten</li>
            </ul>
          </div>
          <h2>Fazit</h2>
          <p>Wer <strong>RLT-Anlagen reinigen</strong> l&auml;sst, investiert in Betriebssicherheit, Gesundheit und Effizienz. Die Kosten einer Reinigung stehen oft deutlich unter den Folgekosten ungeplanter Ausf&auml;lle oder ineffizienten Betriebs.</p>
          <div class="news-article__inline-cta">
            <h3>Reinigung planen statt reagieren</h3>
            <p>Wir erstellen Ihnen ein passendes Reinigungskonzept f&uuml;r Ihre L&uuml;ftungs- und RLT-Anlagen.</p>
            <a class="button button--solid" href="../../../kontakt/angebot-anfordern/index.html">Jetzt Angebot anfordern</a>
          </div>`,
  },
  {
    slug: "vdi-2047-2-bimschv-verdunstungskuehlanlagen",
    h1: "VDI 2047-2 und 42. BImSchV: Betreiberpflichten f&uuml;r Verdunstungsk&uuml;hlanlagen",
    breadcrumbShort: "VDI 2047-2 Betreiberpflichten",
    metaTitle: "VDI 2047-2: Pflichten f&uuml;r Verdunstungsk&uuml;hlanlagen",
    metaDescription: "Was Betreiber bei VDI 2047-2 und 42. BImSchV beachten m\u00fcssen, inklusive Hygiene, Risiken und Dokumentation.",
    shareTitle: "VDI 2047-2: Pflichten f\u00fcr Verdunstungsk\u00fchlanlagen",
    category: "normen",
    categoryLabel: "Normen &amp; Richtlinien",
    dateIso: "2026-06-12",
    dateDisplay: "12. Juni 2026",
    faqId: "faq-vdi-2047",
    faqTitle: "FAQ VDI 2047-2 &amp; Verdunstungsk&uuml;hlanlagen",
    ctaHref: "../../../anlagen/kuehlturmreinigung/index.html",
    ctaButtonHero: "Beratung anfordern",
    ctaHeadline: "Verdunstungsk&uuml;hlanlagen normkonform betreiben",
    ctaText: "Gef&auml;hrdungsbeurteilung, Hygienema&szlig;nahmen und Reinigung aus einer Hand &ndash; Igienair unterst&uuml;tzt Betreiber von K&uuml;hlt&uuml;rmen und Verdunstungsk&uuml;hlern.",
    ctaButton: "Angebot f&uuml;r K&uuml;hlturmreinigung anfordern",
    search: "vdi 2047-2 42 bimschv verdunstungskühlanlagen kühlturm betreiberpflichten legionellen gefährdungsbeurteilung",
    cardExcerpt: "VDI 2047-2 und 42. BImSchV im \u00dcberblick: Betreiberpflichten, Hygiene und Dokumentation f\u00fcr Verdunstungsk\u00fchlanlagen und K\u00fchlt\u00fcrme.",
    cardImage: "../../Bildmaterial_final/shared/shared-normen-vdi-2047-2.webp",
    faq: [
      { q: "Welche Anlagen fallen unter VDI 2047-2?", a: "Verdunstungsk\u00fchlanlagen wie K\u00fchlt\u00fcrme, Nassk\u00fchler und offene Verdunstungssysteme, die W\u00e4rme \u00fcber Verdunstung abf\u00fchren." },
      { q: "Was verlangt die 42. BImSchV?", a: "Betreiber m\u00fcssen Emissionen minimieren und Legionellenrisiken beherrschen \u2013 u. a. durch Gef\u00e4hrdungsbeurteilung, Betriebs\u00fcberwachung und geeignete Ma\u00dfnahmen bei Grenzwert\u00fcberschreitungen." },
      { q: "Wie oft sind Proben zu entnehmen?", a: "Das h\u00e4ngt von Anlage und Beurteilung ab. Die VDI 2047-2 und die BImSchV definieren Anforderungen an &Uuml;berwachung und Reaktion \u2013 wir beraten zur passenden Frequenz." },
      { q: "Was tun bei auff\u00e4lligen Laborwerten?", a: "Ursachen analysieren, Reinigung und Desinfektion durchf\u00fchren, Anlage gegebenenfalls stilllegen und Beh\u00f6rden informieren \u2013 dokumentiert und nach Freigabe wieder in Betrieb nehmen." },
    ],
    content: `
          <figure class="news-article__figure">
            <img src="../../../Bildmaterial_final/shared/shared-normen-vdi-2047-2.webp" alt="K\u00fchlturm und Verdunstungsk\u00fchlanlage \u2013 Betreiberpflichten nach VDI 2047-2 und 42. BImSchV" width="1200" height="675" loading="eager">
          </figure>
          <p>Ein Industriebetrieb nutzt seit Jahren einen <strong>K&uuml;hlturm</strong> zuverl&auml;ssig &ndash; bis das Gesundheitsamt Fragen zur Legionellenpr&auml;vention stellt. Pl&ouml;tzlich r&uuml;ckt ein Thema in den Fokus, das im Alltag leicht &uuml;bersehen wird: <strong>Betreiberpflichten nach VDI 2047-2 und 42. BImSchV</strong>.</p>
          <h2>Was regelt die VDI 2047-2?</h2>
          <p>Die <a href="../../../normen/vdi-2047/index.html">VDI 2047-2</a> beschreibt hygienische Anforderungen an <a href="../../../glossar/verdunstungskuehlanlagen/index.html">Verdunstungsk&uuml;hlanlagen</a>. Kern ist die Vermeidung mikrobieller Belastung &ndash; insbesondere von <strong>Legionellen</strong> &ndash; durch Betriebsf&uuml;hrung, &Uuml;berwachung, Reinigung und Instandhaltung.</p>
          <h2>Die 42. BImSchV im Betreiberalltag</h2>
          <p>Die Verordnung erg&auml;nzt rechtliche Pflichten: Betreiber m&uuml;ssen Emissionen und Gesundheitsrisiken beherrschen. Dazu geh&ouml;ren Gef&auml;hrdungsbeurteilung, &Uuml;berwachung, Ma&szlig;nahmenpl&auml;ne und Meldewege bei Grenzwert&uuml;berschreitungen.</p>
          <div class="news-article__infobox">
            <p class="news-article__infobox-title">WHG-Fachbetrieb</p>
            <p>F&uuml;r wasserrechtlich relevante Anlagen ist ein qualifizierter Partner entscheidend. Igienair verf&uuml;gt &uuml;ber die erforderliche Expertise f&uuml;r <a href="../../../anlagen/kuehlturmreinigung/index.html">Verdunstungsk&uuml;hlanlagen</a> und dokumentiert Ma&szlig;nahmen nachvollziehbar.</p>
          </div>
          <h2>Typische Risiken und M&auml;ngel</h2>
          <ul>
            <li>Fehlende oder veraltete Gef&auml;hrdungsbeurteilung</li>
            <li>Unregelm&auml;&szlig;ige Probenahme und &Uuml;berwachung</li>
            <li>Biofilm und Ablagerungen im Becken oder T&uuml;rm</li>
            <li>Unzureichende Reinigungs- und Desinfektionsintervalle</li>
            <li>L&uuml;cken in der Dokumentation gegen&uuml;ber Beh&ouml;rden</li>
          </ul>
          <h2>Praktische Handlungsempfehlungen</h2>
          <ol>
            <li>Aktuelle Gef&auml;hrdungsbeurteilung nach VDI 2047-2 erstellen lassen</li>
            <li>&Uuml;berwachungsplan mit Probenahme definieren</li>
            <li>Reinigungsintervalle f&uuml;r <a href="../../../anlagen/kuehlturmreinigung/index.html">K&uuml;hlturmreinigung</a> festlegen</li>
            <li>Schulung des Betriebspersonals dokumentieren</li>
            <li>Ma&szlig;nahmen bei Auff&auml;lligkeiten sofort einleiten</li>
          </ol>
          <div class="news-article__checklist">
            <h3>Betreiber-Checkliste</h3>
            <ul>
              <li>Gef&auml;hrdungsbeurteilung vorhanden und aktuell?</li>
              <li>Probenahme gem&auml;&szlig; Plan durchgef&uuml;hrt?</li>
              <li>Reinigungsnachweise der letzten Jahre vollst&auml;ndig?</li>
              <li>Notfallplan bei Grenzwert&uuml;berschreitung definiert?</li>
              <li>Fachbetrieb f&uuml;r Hygienema&szlig;nahmen benannt?</li>
            </ul>
          </div>
          <h2>Fazit</h2>
          <p>Verdunstungsk&uuml;hlanlagen sind effizient &ndash; erfordern aber konsequente Hygiene. Wer <strong>VDI 2047-2</strong> und <strong>42. BImSchV</strong> ernst nimmt, sch&uuml;tzt Mitarbeiter, Nachbarschaft und Betrieb gleicherma&szlig;en. Mehr Hintergrund bietet unser Glossar zur <a href="../../../glossar/gefaehrdungsbeurteilung-vdi-2047-2/index.html">Gef&auml;hrdungsbeurteilung VDI 2047-2</a>.</p>
          <div class="news-article__inline-cta">
            <h3>K&uuml;hlturm hygienisch sicher betreiben</h3>
            <p>Wir unterst&uuml;tzen bei Gef&auml;hrdungsbeurteilung, Reinigung und l&uuml;ckenloser Dokumentation.</p>
            <a class="button button--solid" href="../../../kontakt/angebot-anfordern/index.html">Beratung anfordern</a>
          </div>`,
  },
];

for (const post of posts) {
  const dir = path.join(NEWS_DIR, post.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), buildPage(post), "utf8");
  console.log("Created:", post.slug);
}

const overviewCards = [...posts]
  .reverse()
  .map(
    (post) => `
          <article class="news-card" data-news-card data-category="${post.category}" data-search="${post.search}">
            <a class="news-card__link" href="./${post.slug}/index.html">
              <div class="news-card__media news-card__media--${post.category === "normen" ? "normen" : "hygiene"}" aria-hidden="true">
                <img class="news-card__image" src="${post.cardImage}" alt="" width="640" height="360" loading="lazy" decoding="async">
                <span class="news-card__badge">${post.categoryLabel}</span>
              </div>
              <div class="news-card__body">
                <time class="news-card__date" datetime="${post.dateIso}">${post.dateDisplay}</time>
                <h3 class="news-card__title">${post.h1}</h3>
                <p class="news-card__excerpt">${post.cardExcerpt}</p>
                <span class="news-card__more">Weiterlesen</span>
              </div>
            </a>
          </article>`
  )
  .join("\n");

fs.writeFileSync(path.join(NEWS_DIR, "_overview-cards.html"), overviewCards, "utf8");
console.log("Overview cards written to _overview-cards.html");
