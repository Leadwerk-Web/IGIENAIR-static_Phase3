#!/usr/bin/env node
/**
 * Fuehrt die echte Yoast-Analyse (yoastseo) fuer alle exportierten Seiten aus
 * und schreibt die Scores als JSON, damit sie in WordPress uebernommen werden koennen.
 */
const fs = require("fs");
const { Paper, SeoAssessor, ContentAssessor } = require("yoastseo");
const GermanResearcher = require("yoastseo/build/languageProcessing/languages/de/Researcher").default;

const [input, output] = process.argv.slice(2);
const pages = JSON.parse(fs.readFileSync(input, "utf8"));

// Näherung der Pixelbreite des SEO-Titels, wie sie der Yoast-Editor misst.
function estimateTitleWidth(title) {
  return Math.round(title.length * 9.7);
}

const results = [];
for (const page of pages) {
  try {
    const paper = new Paper(page.content || "", {
      keyword: page.keyword,
      title: page.title,
      titleWidth: estimateTitleWidth(page.title),
      textTitle: page.title.split("|")[0].trim(),
      description: page.description || "",
      slug: page.slug,
      permalink: page.url,
      locale: "de_DE",
    });
    const researcher = new GermanResearcher(paper);

    const seo = new SeoAssessor(researcher);
    seo.assess(paper);
    const seoScore = seo.calculateOverallScore();

    const content = new ContentAssessor(researcher);
    content.assess(paper);
    const readabilityScore = content.calculateOverallScore();

    results.push({ id: page.id, slug: page.slug, seo: seoScore, readability: readabilityScore });
  } catch (err) {
    results.push({ id: page.id, slug: page.slug, error: String(err.message || err) });
  }
}

fs.writeFileSync(output, JSON.stringify(results, null, 1));
const ok = results.filter((r) => !r.error);
const buckets = { gut: 0, ok: 0, verbesserung: 0 };
for (const r of ok) {
  if (r.seo > 70) buckets.gut++;
  else if (r.seo > 40) buckets.ok++;
  else buckets.verbesserung++;
}
console.log(`Analysiert: ${ok.length}/${results.length}`);
console.log(`SEO-Scores  -> gut (gruen): ${buckets.gut}, ok (orange): ${buckets.ok}, verbesserungsbeduerftig (rot): ${buckets.verbesserung}`);
const failed = results.filter((r) => r.error);
if (failed.length) console.log("Fehler:", failed.slice(0, 5));
