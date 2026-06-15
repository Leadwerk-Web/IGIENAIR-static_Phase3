# IGIENAIR – Leistungsarchitektur, SEO & Google Ads (Phase 1)

> Arbeits- und Umsetzungsdokument zur fachlichen, strukturellen, SEO- und Google-Ads-orientierten
> Überarbeitung des Leistungsbereichs. Grundlage: aktueller Codebestand (statische HTML-Site),
> `IGIENAIR_Google_Ads_Search_Konto_Neu.xlsx`, `strategiepapier_final_igienair.pdf`,
> Infoblätter VDI 6022 / DIN 1946-4, Firmendarstellung „Technische Hygiene", `E-Mail Korrespodenz.txt`.

## 0. Strategische Positionierung (Leitlinie für alle Texte)

IGIENAIR ist **kein** Gebäudereiniger / Putzdienst / allgemeiner HLK-Anbieter, sondern:

> **„Technischer Hygienedienstleister für Betreiberpflicht, Normenkonformität, Auditfähigkeit und gesunde Raumluft."**

Verkauft wird nicht Reinigung, sondern: Sicherheit, Betreiberpflicht, Normenkonformität, Auditfähigkeit,
Risikominimierung, digitale/aussagekräftige Dokumentation, schnelle Wiederverfügbarkeit der Anlagen,
Energieeffizienz, hygienisch einwandfreier Betrieb nach Stand der Technik.

**Vermeiden** (austauschbar / vom Kunden ausdrücklich abgelehnt, Quelle E-Mail Lucereau):
„kompetente Beratung", „professioneller Service", „zertifizierte Experten", „24/7 Einsatz",
„Komplettreinigung", „Putzdienst", „Gebäudereinigung", „TÜV-Experten ohne Differenzierung",
„bundesweit" als Hauptclaim, „Prüfbericht inklusive" als USP, „Legionellenfrei"-Versprechen.

**Verwenden** (technisch, normbezogen): Hygieneinspektion nach VDI 6022, Betreiberpflicht rechtssicher
dokumentieren, digitale Bilddokumentation, Musterbericht anfordern, OP-Raum-Qualifizierung nach
DIN 1946-4, Reinraumprüfung nach ISO 14644, DEHS-Filterlecktest, Kühlturmhygiene nach VDI 2047-2 /
42. BImSchV, energetische Inspektion nach GEG, Vorher-/Nachher-Dokumentation, lokale Ansprechpartner
durch regionale Niederlassungen, eigenes festangestelltes Fachpersonal.

**Belegbare Trust-Fakten** (Quelle Firmen-PDF / E-Mail):
ISO 9001:2015, ISO 14001:2015, ISO 45001 (Arbeitssicherheit), FGK-geprüfte Arbeitsmethoden (FGK-QM-01),
WHG-Fachbetrieb, staatlich geprüfte Desinfektoren, ausschließlich eigenes festangestelltes Fachpersonal,
über 20 Jahre Erfahrung, 8/9 regionale Niederlassungen mit lokalen Ansprechpartnern.
Wichtig: **Unternehmenszertifizierungen (ISO) klar trennen von persönlichen Qualifikationen (VDI 6022, VDI 2047-2).**

**Zielgruppen** (priorisiert): Haustechniker, Facility Manager, technische Leiter, Betreiber von RLT-Anlagen,
Krankenhäuser/Unikliniken, Pharma, Industrie, FM-Unternehmen, Gemeinden/öffentliche Einrichtungen,
Lebensmittelindustrie (untergeordnet). **Gastronomie ist KEINE Kernzielgruppe** (in Ads sogar Negative).

## 1. Zusammenfassung der aktuellen Struktur (Ist)

Statische HTML-Site, ~179 produktive Seiten (je `index.html` pro Ordner, Slug = Ordnerpfad).
Kein Build-/Template-System: Header/Footer/Navigation sind in **jeder** Seite dupliziert; globale
Änderungen erfolgen über einmalige Node-Skripte in `asset-analysis/*.mjs`. Theme-Spiegel unter
`leadwerk_theme/` wird per `build-theme-package.mjs` aus dem Root extrahiert.

Hauptnavigation (7 Punkte): Unternehmen · Leistungen · Normen · Anlagen (breites Dropdown) · Kunden · Jobs · Standorte (→ `/kontakt/`).

Relevante Bestands-Slugs (bleiben unverändert):
- `/leistungen/`, `/leistungen/inspektionundgutachten/`, `/leistungen/reinigung-desinfektion/`, `/leistungen/instandsetzung-sanierung/`
- `/hygieneinspektion-vdi-6022/`, `/gefaehrdungsbeurteilung-vdi-2047/`, `/kanaluntersuchung/`, `/rlt-hygiene/`
- `/energetische-inspektion-geg-2020/`, `/filterintegritaetstest/`, `/lecktest-schwebstofffilter/`
- `/anlagen/lueftungsreinigung/`, `/anlagen/lueftungsanlagenreinigung/`, `/anlagen/luftkanalreinigung/`, `/anlagen/kuehlturmreinigung/`, `/anlagen/op-raum-pruefung/`, `/anlagen/reinraumqualifizierung/` u. a.
- Regionale Seiten unter `/kunden/referenzen/{bundesland}/{stadt}/` (9 Regionen, 59 Städte)
- Glossar unter `/glossar/...` (39 Begriffe)

## 2. Identifizierte Probleme

1. **Positionierung zu schwach/generisch:** Bestandstexte nutzen Floskeln („professioneller Partner",
   „zertifiziert starke Leistungen", „Komplettpaket") statt Betreiberpflicht/Norm/Auditfähigkeit.
2. **Leistungs-Navigation flach & techniklastig:** „Leistungen" listet nur 4 Punkte; kaufentscheidende
   Cluster (Betreiberpflicht, Kühlturm/42. BImSchV, OP/Reinraum/Filter, Energie) sind nicht sichtbar.
   Fachthemen sind über „Leistungen"/„Anlagen"/„Normen" verstreut → unklare Suchintent-Zuordnung.
3. **Google-Ads-Landingpages mit Content-Lücken** (Blatt „Landingpages & UTM"):
   - VDI 6022: Musterbericht/Dokumentation zu schwach integriert.
   - Lüftungsreinigung: „Putzdienst/Komplettpaket"-Wording, Gastronomie-Fokus → für B2B schärfen.
   - OP-Raum: fachliche Texte teils mit Reinraum-Bezug vermischt → trennen.
   - Filterintegrität/Lecktest: dürfen nicht mit VDI 6022 vermischt werden (ISO 14644/DEHS).
4. **Gastronomie zu prominent** auf Reinigungsseiten (Ads-Negative, nicht Kernzielgruppe).
5. **Keine strukturierten Daten (JSON-LD):** Kein `BreadcrumbList`/`Service`/`FAQPage` in den Produktivseiten.
6. **Fehlende Silo-/interne Verlinkung** zwischen Leistungsübersicht → Cluster → Fachseite → Detailseite/CTA.
7. **Keine spezifischen B2B-/Dokumentations-Landingpages** für hohe Ads-Intents
   (RLT-Reinigung Industrie, VDI-6022-Prüfbericht/Musterbericht, Verdunstungskühlanlage VDI 2047-2/42. BImSchV).

## 3. Wichtiger Befund aus der XLSX (Google-Ads-Konto)

Die Ads-Kampagnen zeigen **auf bestehende Slugs** (Blätter „Kampagnenstruktur", „Anzeigengruppen",
„Landingpages & UTM"):

| Kampagne / Anzeigengruppe | Final URL (Bestand) | Hauptnorm | Tier |
|---|---|---|---|
| VDI 6022 Pflicht | `/hygieneinspektion-vdi-6022/` | VDI 6022 | 1 |
| OP-Raum | `/anlagen/op-raum-pruefung/` | DIN 1946-4 | 1 |
| Reinraum ISO 14644 | `/anlagen/reinraumqualifizierung/` | ISO 14644 / VDI 2083 | 1 |
| Filterintegrität | `/filterintegritaetstest/` · `/lecktest-schwebstofffilter/` | ISO 14644 / DEHS | 1 |
| Kühlturm 42 BImSchV | `/anlagen/kuehlturmreinigung/` | VDI 2047-2 / 42. BImSchV | 1 |
| RLT-Reinigung Industrie | `/anlagen/lueftungsreinigung/` | VDI 6022 / DIN EN 15780 | 1 |
| Energetische Inspektion | `/energetische-inspektion-geg-2020/` | GEG 2020 / DIN SPEC 15240 | 1 |
| RLT-Sanierung Korrosion | `/instandsetzung-sanierung/` | – | 2 |
| Brand IGIENAIR | `/` | Marke | 1 |
| Regional je Bundesland | `/kunden/referenzen/{land}/` bzw. `/{land}/{stadt}/` | je Thema | 1–3 |

**Schlussfolgerung:** Die neu im Prompt vorgeschlagenen `/leistungen/*`-Slugs sind **zusätzliche
SEO-/Silo-Seiten** (kein Ads-Ziel) und verbessern interne Verlinkung + Longtail-Abdeckung. Die
**Ads-Conversion läuft weiter über die bestehenden, inhaltlich überarbeiteten Seiten** – damit
bleiben SEO-Historie und Ads-Final-URLs intakt.

Weitere verwertete Inhalte aus der XLSX:
- **Responsive Search Ads** liefern conversionstarke Headlines/Descriptions je Thema (z. B. „Musterbericht
  anfordern", „Digitale Bilddoku", „Eigene Fachkräfte", „Alle 2-3 Jahre prüfen", „DEHS-Lecktest",
  „Druckkaskade prüfen", „24h Bilddoku", „2K-Epoxy Beschichtung", „Pflicht alle 10 Jahre") → in Hero/CTA/USP-Boxen übernommen.
- **Assets**: Sitelinks (Musterbericht, OP-Raum-Prüfung, Reinraumprüfung, Kühlturmservice, Standorte),
  Callouts (Digitale Berichte, 8 Standorte, Lokale Ansprechpartner, FGK-geprüfte Methoden, Staatl.
  Desinfektoren, Normkonformer Betrieb), Structured Snippets (Leistungen, Normen, Zielgruppen, Mehrwerte).
- **Negative Keywords**: jobs, privat/Wohnung, kaufen/Shop, PDF/Definition/Wiki, Schulung/Kurs,
  Gastronomie, „klimaanlage reinigen wohnung", „legionellenfrei" → Inhalte vermeiden diese Frames.
- **Lead-Form / Tracking**: Primär-Conversions = Kontakt-/Angebotsformular, Musterbericht-Anfrage,
  qualifizierter Anruf (≥60–90 s); Micro = E-Mail-Klick, PDF-Download.

## 4. Neue Leistungsnavigation (2 Ebenen, Mega-Dropdown)

Umsetzung als `nav-dropdown--mega` (mehrspaltig, mit Cluster-Überschriften) im bestehenden CD,
global ausgerollt via `asset-analysis/rebuild-leistungen-nav.mjs`. **Nur existierende + Phase-1-Ziele
verlinkt (404-frei).** Branchenlösungen verbleiben unter Top-Level „Kunden/Branchen" (P3-Ausbau).

**Cluster 1 – Betreiberpflicht & Hygieneinspektion**
- Hygieneinspektion VDI 6022 → `/hygieneinspektion-vdi-6022/`
- RLT-Hygiene → `/rlt-hygiene/`
- VDI 6022 Prüfbericht & Musterbericht → `/leistungen/vdi-6022-pruefbericht-musterbericht/` *(NEU)*
- Gefährdungsbeurteilung VDI 2047-2 → `/gefaehrdungsbeurteilung-vdi-2047/`
- Inspektion & Gutachten → `/leistungen/inspektionundgutachten/`

**Cluster 2 – Reinigung & hygienetechnische Instandhaltung**
- Lüftungsreinigung → `/anlagen/lueftungsreinigung/`
- Luftkanalreinigung → `/anlagen/luftkanalreinigung/`
- RLT-Anlagenreinigung → `/anlagen/lueftungsanlagenreinigung/`
- RLT-Reinigung Industrie → `/leistungen/rlt-reinigung-industrie/` *(NEU)*
- Reinigung & Desinfektion → `/leistungen/reinigung-desinfektion/`

**Cluster 3 – Kühlturm & Verdunstungskühlanlagen**
- Kühlturmreinigung → `/anlagen/kuehlturmreinigung/`
- Verdunstungskühlanlage VDI 2047-2 / 42. BImSchV → `/leistungen/verdunstungskuehlanlage-vdi-2047-42-bimschv/` *(NEU)*

**Cluster 4 – OP, Reinraum & Filterprüfung**
- OP-Raum-Qualifizierung DIN 1946-4 → `/anlagen/op-raum-pruefung/`
- Reinraumqualifizierung ISO 14644 → `/anlagen/reinraumqualifizierung/`
- Filterintegritätstest → `/filterintegritaetstest/`
- Schwebstofffilter-Lecktest → `/lecktest-schwebstofffilter/`

**Cluster 5 – Energie & Sanierung**
- Energetische Inspektion GEG → `/energetische-inspektion-geg-2020/`
- Instandsetzung & Sanierung → `/leistungen/instandsetzung-sanierung/`

## 5. Bestehende Seiten – überarbeitet (Phase 1)

| Seite | Schwerpunkt der Überarbeitung |
|---|---|
| `/leistungen/` | Zentrale Übersicht nach Suchintention: Positionierungs-Hero, 5 Cluster-Karten, Entscheidungshilfe „Welche Leistung benötigen Sie?", Trust-Bar, FAQ, 3 CTAs |
| `/hygieneinspektion-vdi-6022/` | Betreiberpflicht, Prüfintervalle (3/2 Jahre), Inspektionsinhalte (Bilddoku, CASO/DG18-Probenahmen, Luftkeimmessung, Laborbeurteilung, Anlagenaufbau, Ampelsystem, Prioritäten, Online-Zugriff), CTA „Musterbericht anfordern", FAQ + JSON-LD |
| `/anlagen/lueftungsreinigung/` | B2B-Schärfung (Betreiber/Industrie/Klinik/FM/Kommunen), DIN EN 15780 + VDI 6022, Vorher-/Nachher-Doku, eigenes Personal; Gastronomie/„Komplettpaket"-Wording entschärft |
| `/anlagen/kuehlturmreinigung/` | VDI 2047-2 / 42. BImSchV, Betreiberhaftung, Biofilm/Legionellen/Entkalkung/Füllkörper/Tropfenabscheider/Düsen/Korrosion, Hygienezertifikat, schnelle Wiederverfügbarkeit |
| `/anlagen/op-raum-pruefung/` | DIN 1946-4:2018-09, Messverfahren (Abströmung, Druckkaskade, DEHS, Erholzeit, Partikelmessung), 24-Monate-Intervall, klare Abgrenzung zu Reinraum |
| `/anlagen/reinraumqualifizierung/` | ISO 14644 / VDI 2083, Partikelmessung, Pharma/Labor/Klinik/Industrie, Verlinkung Filtertests, Abgrenzung zu OP |
| `/filterintegritaetstest/` + `/lecktest-schwebstofffilter/` | ISO 14644 / DEHS / HEPA / H13–H14, kalibrierte Messgeräte; NICHT VDI 6022; Links zu Reinraum/OP |
| `/energetische-inspektion-geg-2020/` | GEG-Pflicht (Klima/RLT > 12 kW), Einsparpotenziale, Ablauf/Bewertung, DIN SPEC 15240, CTA |

## 6. Neue Seiten – erstellt (Phase 1)

| Slug | SEO-Title | H1 |
|---|---|---|
| `/leistungen/rlt-reinigung-industrie/` | RLT-Reinigung Industrie \| Normgerechte Lüftungshygiene | RLT-Reinigung für Industrie, Betreiber und Facility Management |
| `/leistungen/vdi-6022-pruefbericht-musterbericht/` | VDI 6022 Prüfbericht \| Musterbericht anfordern | VDI 6022 Prüfbericht und digitale Bilddokumentation |
| `/leistungen/verdunstungskuehlanlage-vdi-2047-42-bimschv/` | Verdunstungskühlanlage VDI 2047-2 \| 42. BImSchV | Hygiene von Verdunstungskühlanlagen nach VDI 2047-2 und 42. BImSchV |

## 7. Bewusst NICHT in Phase 1 erstellt (Backlog mit Begründung)

**Phase 2 – weitere `/leistungen/*` (UMGESETZT, einzigartiger Longtail-Intent):**
Erzeugt per `asset-analysis/build-leistungsseiten-p2.mjs` (gleiches Chrome/Template wie P1, Tiefe 2,
JSON-LD BreadcrumbList + Service + FAQPage, eigene FAQ/CTA/Bild, Silo-Links). In Mega-Menü + Mobile-Menü verlinkt.
- `/leistungen/lueftungsreinigung-krankenhaus-klinik/` – Branchen-Longtail Klinik (hohe Leadqualität) · Bild `anlagen-lueftungsreinigung7.webp`
- `/leistungen/luftkeimmessung-rlt-anlagen/` – technischer Longtail VDI 6022 · Bild `inspektion-hygieneinspektion-vdi-6022.webp`
- `/leistungen/kuehlturm-entkalkung-biofilm/` – technisches Problem Biofilm/Kalk · Bild `anlage-kuehlturmreinigung4.webp`
- `/leistungen/kuehlturm-sanierung-fuellkoerper-duesen/` – Ersatzteile/Sanierung · Bild `instandsetzung.webp`
- `/leistungen/partikelmessung-reinraum-iso-14644/` – Partikelmessung Reinraum · Bild `anlagen-reinraumqualifizierung1.webp`
- `/leistungen/dehs-leckpruefung-op-raum/` – DEHS/OP-Filterlecktest · Bild `inspektion-lecktest-schwebstofffilter.webp`
- `/leistungen/rlt-sanierung-korrosion-2k-epoxy/` – Korrosion/2K-Epoxy · Bild `instandsetzung.webp`
> Mega-Menü modernisiert: 3×2-Raster mit Gradient-Akzent, Cluster-Unterstrich, Promo-Kachel
> („Welche Leistung brauchen Sie?" + Angebot-CTA + „Alle Leistungen"). Mobil: Cluster-Subtitles mit
> Gradient-Akzent + Angebot-CTA, responsiv (Desktop-Mega kompakter ab ≤1200px, Mobile-Panel ≤980px).

**Phase 3 – Branchenseiten** (`/branchen/krankenhaus-klinik-rlt-hygiene/`, `/branchen/pharma-reinraum-rlt-hygiene/`,
`/branchen/industrie-lueftungshygiene/`, `/branchen/facility-management-betreiberpflicht/`,
`/branchen/kommunen-oeffentliche-einrichtungen/`, `/branchen/lebensmittelindustrie-lueftungshygiene/`).
> Grund: benötigen konkrete Use-Cases/Betreiberfragen je Branche; bestehende `/kunden/*` bleiben erhalten.

**Phase 3 – Regionale Seiten:** **keine neuen `/standorte/*`-Slugs raten.** Bestehende
`/kunden/referenzen/{land}/{stadt}/` nutzen (Tier-Matrix s. u.), CTAs verbessern, Bundesland-LP priorisieren.
> Grund (XLSX „Regionale URLs & Budget"): „Kein Stadt-URL-Raten; bei fehlender Seite nationale
> Leistungsseite als Kurzfristlösung." Stadtseiten erst nach Performance-Validierung auf Anzeigengruppenebene.

### Regionale Tier-Matrix (Auszug, Quelle XLSX „Regionale Struktur" / „Regionale URLs & Budget")

| Bundesland | Tier | Leistungsfokus | Zielseite (Bestand) | Empfehlung |
|---|---|---|---|---|
| Baden-Württemberg | 1 | VDI 6022 + RLT-Reinigung | `/kunden/referenzen/baden-wuerttemberg/` | Bundesland-LP live, Top-Städte (Stuttgart, Karlsruhe, Mannheim, Freiburg, Ulm) CTA stärken |
| Bayern | 1 | RLT-Reinigung + VDI 6022 | `/kunden/referenzen/bayern/` | Bundesland-LP live; München/Nürnberg/Augsburg |
| Nordrhein-Westfalen | 1 | RLT-Reinigung + Kühlturm | `/kunden/referenzen/nrw/` | Köln/Düsseldorf/Duisburg; Kühlturm-Fokus |
| Hessen | 1 | VDI 6022 + GEG | `/kunden/referenzen/hessen/` | Frankfurt/Wiesbaden; GEG-Fokus |
| Berlin/Brandenburg | 1 | VDI 6022 + OP/Reinraum | `/kunden/referenzen/berlin/` | OP/Reinraum-Fokus (Kliniken) |
| Rheinland-Pfalz | 2 | RLT-Reinigung + VDI 6022 | `/kunden/referenzen/rheinland-pfalz/` | Mainz/Koblenz/Ludwigshafen |
| Saarland | 2 | RLT-Reinigung + VDI 6022 | `/kunden/referenzen/saarland/` | Saarbrücken |
| Nord (HH/SH/HB/NI) | 2 | RLT-Reinigung + VDI 6022 | `/kunden/referenzen/hamburg/` | Hamburg/Bremen/Kiel |
| Region Bodensee | 3 | RLT-Reinigung + Kühlturm | `/kunden/referenzen/region-bodensee/` | Friedrichshafen/Ravensburg/Tuttlingen |

> Risiko Thin/Duplicate Content: Reine „RLT-Reinigung + Stadt"-Vorlagen ohne lokalen Mehrwert vermeiden.
> Stadtseiten nur mit nächstgelegener Niederlassung, regionalem Bezug und individuellem Fachtext.

## 8. SEO-Metadaten (Phase-1-Seiten)

| Slug | SEO-Title (≈50–60) | Meta Description (≈140–160) | Primary Keyword |
|---|---|---|---|
| `/leistungen/` | Technische Hygiene & Betreiberpflicht \| IGIENAIR | Technische Hygiene für RLT-Anlagen: Hygieneinspektion VDI 6022, Reinigung, Kühlturm, OP/Reinraum & energetische Inspektion – normkonform dokumentiert. | technische hygiene leistungen |
| `/hygieneinspektion-vdi-6022/` | Hygieneinspektion VDI 6022 \| Betreiberpflicht | Hygieneinspektion nach VDI 6022 für RLT-Anlagen: Betreiberpflicht, Prüfintervalle, Laborbeurteilung, digitale Bilddoku. Musterbericht anfordern. | hygieneinspektion vdi 6022 |
| `/anlagen/lueftungsreinigung/` | Lüftungsreinigung VDI 6022 \| RLT-Hygiene B2B | Normgerechte Lüftungsreinigung nach VDI 6022 & DIN EN 15780 für Betreiber, Industrie, Kliniken und FM – mit Vorher-/Nachher-Dokumentation. | lüftungsreinigung |
| `/anlagen/kuehlturmreinigung/` | Kühlturmreinigung VDI 2047-2 \| 42. BImSchV | Kühlturm- & Verdunstungskühlanlagen-Hygiene nach VDI 2047-2 und 42. BImSchV: Biofilm, Entkalkung, Sanierung und dokumentierte Betreiberpflicht. | kühlturmreinigung |
| `/anlagen/op-raum-pruefung/` | OP-Raum-Qualifizierung nach DIN 1946-4 | OP-Raum-Qualifizierung nach DIN 1946-4: Druckkaskade, DEHS-Lecktest, Erholzeit, Partikelmessung – auditfähig dokumentiert, Intervall max. 24 Monate. | op-raum qualifizierung din 1946-4 |
| `/anlagen/reinraumqualifizierung/` | Reinraumqualifizierung ISO 14644 \| VDI 2083 | Reinraumqualifizierung nach ISO 14644 und VDI 2083: Partikelmessung, Filterlecktest, auditfähige Doku für Pharma, Labor, Klinik und Industrie. | reinraumqualifizierung iso 14644 |
| `/filterintegritaetstest/` | Filterintegritätstest \| ISO 14644 & DEHS | Filterintegritätstest nach ISO 14644 mit DEHS für HEPA-/Schwebstofffilter (H13/H14): kalibrierte Messgeräte und auditfähige Dokumentation. | filterintegritätstest |
| `/lecktest-schwebstofffilter/` | Schwebstofffilter-Lecktest \| HEPA & DEHS | DEHS-Lecktest für Schwebstofffilter (H13/H14) nach ISO 14644 in Reinraum, Pharma, Klinik und Labor – kalibrierte Messung, klare Bewertung. | schwebstofffilter lecktest |
| `/energetische-inspektion-geg-2020/` | Energetische Inspektion GEG \| Klima & RLT | Energetische Inspektion nach GEG für Klima- und RLT-Anlagen > 12 kW: gesetzliche Pflicht erfüllen und Einsparpotenziale erkennen. | energetische inspektion geg |
| `/leistungen/rlt-reinigung-industrie/` | RLT-Reinigung Industrie \| Lüftungshygiene | Normgerechte RLT-Reinigung für Industrie, FM und Betreiber: VDI 6022, DIN EN 15780, Bilddokumentation und schnelle Wiederverfügbarkeit. | rlt-reinigung industrie |
| `/leistungen/vdi-6022-pruefbericht-musterbericht/` | VDI 6022 Prüfbericht \| Musterbericht anfordern | Wie IGIENAIR Hygieneinspektionen nach VDI 6022 dokumentiert – Bilddokumentation, Ampelsystem, Maßnahmen und Online-Zugriff. Musterbericht anfordern. | vdi 6022 prüfbericht |
| `/leistungen/verdunstungskuehlanlage-vdi-2047-42-bimschv/` | Verdunstungskühlanlage VDI 2047-2 \| 42. BImSchV | Reinigung, Hygiene und Betreiberpflicht für Verdunstungskühlanlagen: VDI 2047-2, 42. BImSchV, Biofilm, Entkalkung und Dokumentation. | verdunstungskühlanlage vdi 2047-2 |

Schema je Seite: `BreadcrumbList` + `Service` + `FAQPage` (synchron zu sichtbaren FAQ).

## 9. Interne Verlinkungsmatrix (Silo)

```
/leistungen/  (Hub)
 ├─ /hygieneinspektion-vdi-6022/  →  /leistungen/vdi-6022-pruefbericht-musterbericht/  →  /downloads/, /kontakt/angebot-anfordern/
 │     └─ /gefaehrdungsbeurteilung-vdi-2047/, /rlt-hygiene/, /normen/vdi-6022/, /inspektionundgutachten/
 ├─ /anlagen/lueftungsreinigung/  →  /leistungen/rlt-reinigung-industrie/  →  /reinigung-desinfektion/, /hygieneinspektion-vdi-6022/
 │     └─ /anlagen/luftkanalreinigung/, /anlagen/lueftungsanlagenreinigung/, /normen/din-en-15780/
 ├─ /anlagen/kuehlturmreinigung/  →  /leistungen/verdunstungskuehlanlage-vdi-2047-42-bimschv/  →  /instandsetzung-sanierung/
 │     └─ /normen/vdi-2047/, /glossar/verdunstungskuehlanlagen/, /glossar/vdi-2047-2/
 ├─ /anlagen/op-raum-pruefung/  →  /lecktest-schwebstofffilter/, /filterintegritaetstest/, /anlagen/reinraumqualifizierung/
 ├─ /anlagen/reinraumqualifizierung/  →  /filterintegritaetstest/, /lecktest-schwebstofffilter/, /glossar/iso-14644-norm/
 └─ /energetische-inspektion-geg-2020/  →  /glossar/gebaeudeenergiegesetz-geg-2020/, /glossar/energetische-inspektion/
```

Glossar-Verlinkung (sofern Begriff vorhanden): VDI 6022 → `/glossar/hygieneinspektion-nach-vdi-6022/`,
VDI 2047-2 → `/glossar/vdi-2047-2/`, ISO 14644 → `/glossar/iso-14644-norm/`, DIN EN 15780 →
`/glossar/din-en-15780-norm/`, RLT-Anlage → `/glossar/rlt-anlagen/`, GEG → `/glossar/gebaeudeenergiegesetz-geg-2020/`,
Verdunstungskühlanlage → `/glossar/verdunstungskuehlanlagen/`, Filterintegritätstest → `/glossar/filterintegritaetstest/`.

## 10. Bild-/Grafikzuordnung (vorhandener Bildpool)

| Seite | Bild (relativ ab Root `Bildmaterial_final/...`) | Alt-Text-Leitidee |
|---|---|---|
| `/leistungen/` | `shared/leistungen-hero.webp`, `shared/inspektionsgutachten.webp` u. a. | Technische Hygiene / RLT-Inspektion |
| `/hygieneinspektion-vdi-6022/` | `shared/inspektion-hygieneinspektion-vdi-6022.webp` | Techniker bei Hygieneinspektion an RLT-Anlage |
| `/anlagen/lueftungsreinigung/` | `shared/anlagen-lueftungsreinigung7.webp`, `anlagen/lueftungsreinigung/*` | Lüftungskanal-Reinigung / Technikereinsatz |
| `/anlagen/kuehlturmreinigung/` | `shared/anlage-kuehlturmreinigung4.webp` | Kühlturm / Verdunstungskühlanlage |
| `/anlagen/op-raum-pruefung/` | `shared/anlagen-op4.webp`, `shared/inspektion-op-raum-pruefung.webp` | OP-naher technischer Bereich / Messung |
| `/anlagen/reinraumqualifizierung/` | `shared/anlagen-reinraumqualifizierung1.webp`, `shared/inspektion-reinraumqualifizierung.webp` | Reinraum / Partikelmessung |
| `/filterintegritaetstest/` | `shared/inspektion-filterintegritaetstest.webp` | Filterprüfung / Messgerät |
| `/lecktest-schwebstofffilter/` | `shared/inspektion-lecktest-schwebstofffilter.webp` | Schwebstofffilter-Lecktest |
| `/energetische-inspektion-geg-2020/` | `shared/energetischeinspektion.webp` | RLT-/Klimaanlage Energieeffizienz |
| `/leistungen/rlt-reinigung-industrie/` | `shared/anlagen-lueftungsreinigung7.webp` *(Bildpool-Ersatzmotiv, später final prüfen)* | Industrielle RLT-Anlage |
| `/leistungen/vdi-6022-pruefbericht-musterbericht/` | `shared/inspektion-hygieneinspektion-vdi-6022.webp` *(Ersatzmotiv)* | Dokumentation / Bericht |
| `/leistungen/verdunstungskuehlanlage-vdi-2047-42-bimschv/` | `shared/anlage-kuehlturmreinigung4.webp` *(Ersatzmotiv)* | Verdunstungskühlanlage |

## 11. Technische Änderungen im Code

- **Neu:** `docs/igienair-leistungsarchitektur-seo-ads.md` (dieses Dokument).
- **Neu:** `asset-analysis/rebuild-leistungen-nav.mjs` – rollt das 5-Cluster-Mega-Menü (Desktop + Mobile)
  in alle Root-HTML-Dateien aus (tiefenabhängige relative Pfade, idempotent, ohne `leadwerk_*`).
- **`styles.css`:** Ergänzung `.nav-dropdown--mega`, `.nav-cluster`, `.nav-cluster__title`,
  `.mobile-menu__subtitle` (im bestehenden CD, keine neuen Farben/Typo).
- **Überarbeitet:** 8 Bestands-Landingpages (Content + Meta + JSON-LD), s. Abschnitt 5.
- **Neu:** 3 Leistungsseiten, s. Abschnitt 6.
- **Theme-Sync:** `node leadwerk_theme/tools/build-theme-package.mjs` nach Nav-Rollout.

## 12. Offene fachliche Prüfpunkte für IGIENAIR

1. Bestätigung Niederlassungszahl in Außenkommunikation: **8 oder 9** (Firmen-PDF nennt „acht Standorte",
   E-Mail nennt „9 regionale Niederlassungen"). In Phase 1 neutral als „regionale Niederlassungen" formuliert.
2. Freigabe der Musterbericht-Auslieferung (CTA „Musterbericht anfordern") und Zielziel (`/downloads/` vs. Formular).
3. Verfügbarkeit konkreter Vorher-/Nachher-Bilder und OP-/Reinraum-Messgrafiken für spätere Grafikmodule.
4. Bestätigung der regionalen Tier-Priorisierung & Budget je Bundesland (Ads).
5. Prüfung, ob `sitemap.xml`/`robots.txt` für den statischen Export erzeugt/deployt werden (aktuell nicht im Repo).
6. Persönliche Qualifikationen vs. Unternehmenszertifizierungen: finale Wording-Freigabe (rechtssicher, keine Vermischung).

## 13. Nächste Schritte (Empfehlung)

1. Phase 2: `/leistungen/*`-Longtail-Seiten (s. Abschnitt 7) als Silo-Vertiefung.
2. Phase 3: Branchenseiten + regionale Tier-1-Bundesland-LPs (CTA „Angebot für [Region] anfordern").
3. `sitemap.xml`/`robots.txt` + JSON-LD `Organization`/`LocalBusiness` global ergänzen.
4. Ads-Final-URLs gegen überarbeitete Seiten testen; UTM-Suffix (Blatt „Assets/Landingpages & UTM") aktiv halten.
5. Conversion-Tracking (Formular, Musterbericht, qualifizierter Anruf) gemäß Blatt „Tracking & Conversions".
