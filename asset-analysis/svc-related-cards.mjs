export const RELATED_CARD_ICONS = {
  inspection: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 7v5c0 4.2 3.2 7.8 7.5 9 4.3-1.2 7.5-4.8 7.5-9V7l-8-4z"></path><path d="m9.5 12.2 1.7 1.8 3.3-3.4"></path></svg>`,
  cleaning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14c2.2-4.8 6.4-7.5 8-7.5s5.8 2.7 8 7.5"></path><path d="M7.5 17.5h9"></path><path d="M9 20h6"></path></svg>`,
  report: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h7l3 3v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"></path><path d="M14 4v4h4"></path><path d="M9 13h6"></path><path d="M9 17h4"></path></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v10"></path><path d="m8 9 4 4 4-4"></path><path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"></path></svg>`,
  contact: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16v12H4z"></path><path d="m4 7 8 6 8-6"></path></svg>`,
  norm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v14H4z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"></path><path d="M7 17l3-5 3 3 5-8"></path></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,
};

export function relatedCardsSection(sectionId, lead, cards) {
  const cardHtml = cards
    .map(
      (card) => `          <a class="svc-related-card${card.accent ? " svc-related-card--accent" : ""}" href="${card.href}">
            <span class="svc-related-card__icon" aria-hidden="true">
              ${RELATED_CARD_ICONS[card.icon] || RELATED_CARD_ICONS.inspection}
            </span>
            <span class="svc-related-card__eyebrow">${card.eyebrow}</span>
            <h3 class="svc-related-card__title">${card.title}</h3>
            <p class="svc-related-card__text">${card.text}</p>
            <span class="svc-related-card__cta">${card.cta}</span>
          </a>`
    )
    .join("\n\n");

  return `    <section class="svc-section" id="${sectionId}" data-section="weiter">
      <div class="container">
        <header class="section-copy svc-section__head svc-section__head--center">
          <p class="eyebrow">WEITERF&Uuml;HREND</p>
          <h2>Passende Leistungen &amp; Unterlagen</h2>
          <div class="gradient-line gradient-line--center"></div>
          <p class="svc-section__lead">${lead}</p>
        </header>

        <div class="svc-related-cards">
${cardHtml}
        </div>
      </div>
    </section>`;
}
