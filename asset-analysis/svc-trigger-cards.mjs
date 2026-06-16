import { RELATED_CARD_ICONS } from "./svc-related-cards.mjs";

export function triggerCardsGrid(cards) {
  return cards
    .map((card) => {
      const icon = RELATED_CARD_ICONS[card.icon] || RELATED_CARD_ICONS.inspection;
      const eyebrow = card.eyebrow
        ? `\n            <span class="svc-trigger-card__eyebrow">${card.eyebrow}</span>`
        : "";

      return `          <article class="svc-trigger-card">
            <span class="svc-trigger-card__icon" aria-hidden="true">
              ${icon}
            </span>${eyebrow}
            <h3 class="svc-trigger-card__title">${card.title}</h3>
            <p class="svc-trigger-card__text">${card.text}</p>
          </article>`;
    })
    .join("\n\n");
}

export function ausloeserSection(eyebrow, h2, cards) {
  return `    <section class="svc-section svc-section--soft" data-section="ausloeser">
      <div class="container">
        <header class="section-copy svc-section__head">
          <p class="eyebrow">${eyebrow}</p>
          <h2>${h2}</h2>
          <div class="gradient-line"></div>
        </header>
        <div class="svc-trigger-cards">
${triggerCardsGrid(cards)}
        </div>
      </div>
    </section>`;
}
