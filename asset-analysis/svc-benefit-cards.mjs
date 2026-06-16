import { RELATED_CARD_ICONS } from "./svc-related-cards.mjs";

export function benefitCardsGrid(cards) {
  return cards
    .map((card) => {
      const icon = RELATED_CARD_ICONS[card.icon] || RELATED_CARD_ICONS.shield;
      const eyebrow = card.eyebrow
        ? `\n            <span class="svc-benefit-card__eyebrow">${card.eyebrow}</span>`
        : "";

      return `          <article class="svc-benefit-card">
            <span class="svc-benefit-card__check" aria-hidden="true">&#10003;</span>
            <span class="svc-benefit-card__icon" aria-hidden="true">
              ${icon}
            </span>${eyebrow}
            <h3 class="svc-benefit-card__title">${card.title}</h3>
            <p class="svc-benefit-card__text">${card.text}</p>
          </article>`;
    })
    .join("\n\n");
}

function normBarHtml(norms) {
  if (!norms?.length) return "";

  const links = norms
    .map((norm) => `            <a class="svc-norm-chip" href="${norm.href}">${norm.label}</a>`)
    .join("\n");

  return `
        <div class="svc-norm-bar">
          <p class="svc-norm-bar__label">Ma&szlig;gebliche Normen</p>
          <div class="svc-norm-bar__links">
${links}
          </div>
        </div>`;
}

export function vorteileSection(eyebrow, h2, lead, cards, norms = []) {
  const leadHtml = lead ? `\n          <p class="svc-section__lead">${lead}</p>` : "";

  return `    <section class="svc-section" data-section="vorteile">
      <div class="container">
        <header class="section-copy svc-section__head svc-section__head--center">
          <p class="eyebrow">${eyebrow}</p>
          <h2>${h2}</h2>
          <div class="gradient-line gradient-line--center"></div>${leadHtml}
        </header>

        <div class="svc-benefit-cards">
${benefitCardsGrid(cards)}
        </div>${normBarHtml(norms)}
      </div>
    </section>`;
}
