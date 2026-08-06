#!/usr/bin/env python3
"""Aktualisiert die Go-Live-Checkliste (Status + Kommentar) unter Erhalt von Charts/Tabellen."""
import re
import shutil
import zipfile

SRC = '/Users/atlas/Downloads/Igienair_go_live_checkliste_release.xlsx'
BAK = '/Users/atlas/Downloads/Igienair_go_live_checkliste_release_backup.xlsx'

E = 'Erledigt'
O = 'Offen'
LIVE = 'Erst nach Go-Live prüfbar.'

# Nr -> (Status oder None=unverändert, Kommentar)
U = {
    1: (None, 'Lokal (http) nicht prüfbar – nach Go-Live am Live-Server verifizieren.'),
    2: (O, LIVE),
    3: (None, 'Lokal nicht prüfbar – nach Go-Live verifizieren.'),
    4: (O, LIVE + ' (DNS)'),
    5: (O, LIVE + ' (www/non-www-Redirect)'),
    6: (E, 'Verifiziert: PHP 8.2.29, kompatibel mit WP 7.0.1.'),
    7: (None, 'Hosting-seitig (Raidboxes-MU-Plugin vorhanden) – lokal nicht prüfbar.'),
    8: (E, 'Verifiziert: 404-Seite liefert Status 404 mit gestalteter Fehlerseite.'),
    9: (E, 'Lokal erfüllt: blog_public=0, alle Seiten noindex. Live-Staging separat prüfen.'),
    10: (E, 'Staging-URL (beliu.myrdbx.io) in Datenschutz-Seite gefunden und durch interne Verlinkung ersetzt (WP + statische Quelle). Keine weiteren Testdomains.'),
    11: (E, 'Verifiziert: WordPress 7.0.1 (aktuellste Version).'),
    12: (E, 'Verifiziert: WordPress 7.0.1 (aktuellste Version).'),
    13: (O, 'Abweichung behoben: 5 Plugins aktualisiert (Complianz 7.5.0, HFCM 1.1.45, Matomo 5.11.1, WP Mail SMTP 4.9.0, Yoast 28.0). WPForms 1.9.9.4→1.10.2.1 erfordert gültigen Lizenzschlüssel (siehe Nr. 86).'),
    14: (E, 'Verifiziert: leadwerk_theme 2.9.3 aktiv, keine Updates offen. Hinweis: 3 inaktive Standard-Themes können gelöscht werden.'),
    15: (E, 'Untertitel war WP-Standard ("Just another WordPress site") – korrigiert auf "Ihr Partner für gesunde Raumluft".'),
    16: (E, 'Verifiziert: Europe/Berlin.'),
    17: (E, 'Verifiziert: de_DE.'),
    18: (E, 'Abweichung behoben: Permalinks von Datumsstruktur auf /%postname%/ umgestellt, Rewrite-Regeln neu geschrieben.'),
    19: (E, '"Hallo Welt"-Beitrag + Standardkommentar gelöscht; 349 Alt-Seiten aus dem Papierkorb endgültig entfernt.'),
    20: (E, 'Verifiziert: einziger Benutzer "leadwerk" (Administrator), kein Benutzer "admin".'),
    21: (E, 'Verifiziert: nur 1 Benutzerkonto vorhanden.'),
    22: (E, 'Verifiziert: 1 Administrator (Agentur), keine weiteren Rollen.'),
    23: (O, 'Aktuell Agentur-Adresse florian@leadwerk.de hinterlegt (funktionsfähig). Entscheidung nötig, ob Kundenadresse gewünscht.'),
    24: (E, 'Backup erstellt: DB-Dump + wp-content + wp-config unter Local Sites/igineair/backups/pre-golive-20260715-1234 (738 MB).'),
    25: (E, 'Verifiziert: alle 192 Seiten veröffentlicht, alle mit HTTP 200 erreichbar.'),
    26: (E, 'Keine Beiträge vorhanden (Website nutzt ausschließlich Seiten); Demo-Beitrag gelöscht.'),
    27: (E, 'Verifiziert: keine Entwürfe; Papierkorb geleert.'),
    28: (None, 'Redaktionelle Prüfung – lokal nicht automatisiert verifizierbar.'),
    29: (None, 'Redaktionelle Freigabe – nicht technisch prüfbar.'),
    30: (E, 'Verifiziert: kein Lorem ipsum / keine Platzhaltertexte in veröffentlichten Inhalten.'),
    31: (E, 'Verifiziert: 184/192 Seiten mit genau einer H1. 8 Weiterleitungs-Stub-Seiten ohne H1 (technisch bedingt, Canonical zeigt auf Zielseite).'),
    32: (E, 'Verifiziert: 131 Bild-URLs, 3 PDFs und Hero-Video laden alle mit HTTP 200.'),
    33: (E, 'Inhaltsbilder mit Alt-Texten. Hinweis: Header-/Footer-Logo mit leerem alt (dekorativ) – optional "IGIENAIR" setzen.'),
    34: (E, 'Verifiziert: 3 PDF-Downloads (Imagebroschüre, Hygieneinspektion, BTGA) erreichbar.'),
    35: (E, 'Verifiziert: alle intern verlinkten Seiten liefern HTTP 200.'),
    36: (E, 'Geprüft: 27 externe Links. 403 bei cookiedatabase.org und igienair-jobs.de (Bot-Schutz, im Browser ok). Toter Staging-Link behoben (siehe Nr. 10).'),
    37: (E, 'Verifiziert: keine defekten internen Links; einziger toter Link (Staging-URL) behoben.'),
    38: (E, 'Verifiziert: Footer-Kontaktdaten zentral über Theme identisch auf allen Seiten; regionale Rufnummern auf Referenzseiten beabsichtigt.'),
    39: (E, 'Abweichung behoben: Footer-tel:-Link enthielt "(0)" (+49072433699101). Theme korrigiert auf tel:+4972433699101 (functions.php, Repo + Instanz + ZIP).'),
    40: (E, 'Verifiziert: mailto-Links kontakt@igienair.com / anfrage@igienair.com korrekt.'),
    41: (E, 'Adresse Am Hardtwald 6-8, 76275 Ettlingen im Footer. Inhaltliche Aktualität = Kundenfreigabe.'),
    42: (E, 'Verifiziert: /impressum/ und /datenschutz/ erreichbar (HTTP 200) und im Footer verlinkt.'),
    59: (E, 'Verifiziert: Site-Icon (favicon-512) gesetzt, icon-Links im HTML-Head aller Seiten.'),
    60: (E, 'Verifiziert: logo.svg (hell/dunkel) im Header aller Seiten.'),
    61: (E, 'Testübermittlung Formular 577 (Startseite) erfolgreich: Validierung, Speicherung, E-Mail, Weiterleitung. Formular 579 (Angebotsseite) identisch konfiguriert.'),
    62: (E, 'Verifiziert per Testübermittlung: success + Weiterleitung auf /danke/.'),
    63: (E, 'Verifiziert: Pflichtfelder Firmenname, Name, E-Mail, Straße, PLZ, Auswahlfelder, Datenschutz-Checkbox.'),
    64: (E, 'WPForms-Standardvalidierung (deutsch) aktiv; fehlerhafte Übermittlung wird serverseitig mit verständlicher Meldung abgewiesen.'),
    65: (E, 'Bestätigung = Weiterleitung auf Danke-Seite (statt Inline-Meldung) – funktioniert.'),
    66: (E, 'Verifiziert: redirect_url = /danke/ nach Absenden.'),
    67: (E, 'Abweichung behoben: Bestätigungsseite zeigte auf nicht existierende Seiten-ID 143 – bei beiden Formularen auf Danke-Seite (ID 956) korrigiert.'),
    68: (E, 'Verifiziert: Seite /danke/ vorhanden (ID 956).'),
    69: (E, 'Verifiziert: HTTP 200.'),
    70: (E, 'Verifiziert: nicht in der Navigation verlinkt.'),
    71: (E, 'Abweichung behoben: noindex war nicht gesetzt – Yoast-noindex ergänzt; Seite aus XML-Sitemap entfernt.'),
    72: (E, 'WP Mail SMTP erzwingt Absender no-reply@igienair.de. Live: SMTP/SPF/DKIM nach Go-Live prüfen (Mailer aktuell "PHP mail").'),
    73: (E, 'Abweichung behoben: Formular 577 sendete an {admin_email} (Agentur) – auf anfrage@igienair.com umgestellt (wie Formular 579). Test-Mail in Mailpit bestätigt.'),
    74: (E, 'Keine CC/BCC konfiguriert (nicht erforderlich); Reply-To = Absender des Ausfüllenden.'),
    75: (O, 'From-Adresse no-reply@igienair.de erzwungen. SPF/DKIM/SMTP-Zustellung erst nach Go-Live prüfbar.'),
    76: (None, 'Prüfpunkt-Text unverständlich (vermutlich Diktatfehler) – bitte präzisieren.'),
    77: (E, 'Verifiziert: Pflicht-Checkbox Datenschutz mit Link auf Datenschutzerklärung in beiden Formularen.'),
    78: (E, 'Verifiziert: modernes WPForms-Anti-Spam (Token, antispam_v3) in beiden Formularen aktiv.'),
    79: (E, 'Modernes Anti-Spam-Token ersetzt den klassischen Honeypot (WPForms-Empfehlung).'),
    80: (O, 'Kein reCAPTCHA konfiguriert – optional, Anti-Spam-Token bereits aktiv. Bei Spam-Aufkommen nachrüsten.'),
    81: (E, 'Keine Datei-Upload-Felder in den Formularen vorhanden.'),
    82: (O, 'Manueller Browser-Test empfohlen (technisch identisch zur erfolgreichen Testübermittlung).'),
    83: (O, 'Manueller Test auf Mobilgeräten empfohlen.'),
    84: (E, 'Verifiziert: Formular 577 auf Startseite, Formular 579 auf /kontakt/angebot-anfordern/ eingebunden.'),
    85: (E, 'Verifiziert: WPForms Pro 1.9.9.4 installiert (Entries-Tabellen vorhanden).'),
    86: (O, 'Kein Lizenzschlüssel hinterlegt – dadurch kein WPForms-Update möglich (siehe Nr. 13). Vor Go-Live eintragen!'),
    87: (E, 'Verifiziert: Test-Entry wurde in wp_wpforms_entries gespeichert und war sichtbar.'),
    88: (E, 'Verifiziert per Testübermittlung (Entry-Speicherung aktiv).'),
    89: (E, 'Test-Entry erstellt, geprüft und anschließend wieder gelöscht.'),
    90: (E, 'Korrigiert und verifiziert (siehe Nr. 67).'),
    91: (O, 'Kein Tracking eingerichtet – erst nach Go-Live/Tag-Einrichtung prüfbar.'),
    92: (E, 'Serverseitige Validierung aktiv (manipulierte Übermittlung wird abgewiesen); deutsche Fehlermeldungen.'),
    142: (E, 'Complianz 7.5.0 aktiv, Banner A konfiguriert, Banner-Markup auf allen Seiten. Verhaltensprüfung mit echten Tags nach Go-Live.'),
    149: (E, 'Google Maps (Kontaktseite) ist consent-blockiert eingebunden (data-src, leadwerk-consent-embed). Kein YouTube/Vimeo vorhanden.'),
    150: (E, 'Verifiziert: Impressum und Datenschutz im Footer aller Seiten verlinkt.'),
    153: (E, 'Yoast 28.0 konfiguriert: Titel-Templates, XML-Sitemap aktiv, Organisation (IGIENAIR GmbH + Logo) in dieser Prüfung ergänzt.'),
    154: (O, 'WICHTIG am Go-Live-Tag: Einstellungen → Lesen → "Suchmaschinen abhalten" deaktivieren (aktuell blog_public=0, gewollt für Staging).'),
    155: (O, 'Siehe Nr. 154 – am Go-Live-Tag aktivieren.'),
    156: (O, 'Aktuell global noindex wegen Staging-Einstellung (gewollt). Entfällt automatisch mit Nr. 154/155.'),
    157: (E, 'Verifiziert: robots.txt vorhanden (Yoast + WPForms-Block, Sitemap-Verweis). Nach Go-Live mit Live-Domain erneut prüfen.'),
    158: (E, 'sitemap_index.xml vorhanden (Yoast). Hinweis: lokal enthält sie nur die Startseite, da alle Seiten Canonicals auf igienair.de tragen – nach Domainumstellung werden die Seiten automatisch aufgenommen.'),
    159: (O, LIVE),
    160: (O, LIVE),
    161: (O, 'Erst nach Domainumstellung aussagekräftig (siehe Nr. 158). Danach prüfen: Weiterleitungs-Stubs und noindex-Seiten dürfen nicht enthalten sein.'),
    162: (O, '18 alte URLs sind als Stub-Seiten ("Weiter zur Seite") mit Canonical statt als 301-Redirect angelegt. Empfehlung: vor Go-Live echte 301-Weiterleitungen (z. B. via Yoast Premium/Redirection) einrichten.'),
    163: (O, LIVE),
    164: (E, 'Verifiziert: 0 interne 404-Fehler im Crawl über alle 192 Seiten; 404-Seite korrekt.'),
    165: (E, 'Einsprachige Website; hreflang de-DE + x-default gesetzt.'),
    166: (E, 'Verifiziert: sprechende, hierarchische URLs ohne Parameter.'),
    167: (E, 'Abweichung behoben: Permalink-Struktur war datumsbasiert – auf /%postname%/ umgestellt.'),
    168: (E, 'BreadcrumbList-Schema auf allen Seiten (Yoast).'),
    169: (E, 'Verifiziert: BreadcrumbList-JSON-LD valide auf allen 192 Seiten.'),
    170: (E, 'Verifiziert: Meta-Titel auf allen 192 Seiten gesetzt.'),
    171: (E, 'Verifiziert: Meta-Description auf allen 192 Seiten gesetzt.'),
    172: (E, 'Verifiziert: alle Titel <= 65 Zeichen.'),
    173: (E, 'Verifiziert: nur News-Übersicht mit 167 Zeichen minimal über Richtwert – unkritisch.'),
    174: (E, 'Verifiziert: keine doppelten Titel oder Descriptions.'),
    175: (O, 'Redaktionelle Bewertung – nicht automatisiert prüfbar.'),
    176: (E, 'Verifiziert: og:title/og:description auf allen Seiten (Yoast).'),
    177: (E, 'Abweichung behoben: kein og:image vorhanden – Yoast-Standard-Social-Bild gesetzt (Hero-Poster 1280x720 WebP), erscheint jetzt auf allen Seiten.'),
    178: (E, 'Verifiziert: genau eine H1 auf allen Inhaltsseiten; nur die 8 Weiterleitungs-Stubs ohne H1 (technisch bedingt).'),
    179: (None, 'Stichproben ohne Auffälligkeiten.'),
    180: (O, 'Redaktionelle Bewertung.'),
    181: (E, 'Verifiziert: interne Verlinkung vorhanden und fehlerfrei.'),
    182: (E, 'Verifiziert: Hauptnavigation deckt alle Kernbereiche ab.'),
    183: (E, 'Siehe Nr. 33: Inhaltsbilder ok, Logo-alt optional ergänzen.'),
    184: (E, 'Verifiziert: sprechende Dateinamen (z. B. kuehlturm-reinigung.webp).'),
    185: (O, 'NAP im Footer konsistent; LocalBusiness-Schema fehlt (siehe Nr. 196).'),
    186: (None, 'Am Hardtwald 6-8, 76275 Ettlingen – inhaltliche Bestätigung durch Kunden.'),
    187: (E, 'Verifiziert: +49 7243 3699101, tel-Link korrigiert (siehe Nr. 39).'),
    188: (None, 'Keine Öffnungszeiten auf der Website angegeben – falls gewünscht ergänzen.'),
    189: (E, 'Verifiziert: alle Referenz-/Standortseiten erreichbar (HTTP 200).'),
    190: (E, 'Verifiziert: NAP zentral über Theme-Footer, identisch auf allen Seiten.'),
    191: (O, 'Teilweise: Yoast-Graph (WebPage/WebSite/Breadcrumb/Organization) aktiv. ABER: FAQ- und Service-JSON-LD der statischen Seiten wird beim Import nicht übernommen – Ergänzung empfohlen.'),
    192: (None, 'Rich-Results-Test benötigt öffentliche URL – nach Go-Live erneut durchführen.'),
    193: (E, 'Kein Aggregate Rating eingesetzt.'),
    194: (E, 'Keine Bewertungen/Rezensionen eingesetzt.'),
    195: (E, 'Kein Review-Markup vorhanden – konform.'),
    196: (O, 'Abweichung: kein LocalBusiness-Schema in WordPress. Yoast als Organization konfiguriert; LocalBusiness (Adresse, Telefon, Öffnungszeiten) via Yoast-Einstellungen oder Snippet ergänzen.'),
    197: (E, 'Abweichung behoben: Yoast-Firmendaten waren leer – Organization (IGIENAIR GmbH + Logo) konfiguriert, erscheint im Schema-Graph aller Seiten.'),
    198: (O, 'Abweichung: FAQPage-JSON-LD der statischen Seiten (z. B. Kühlturmreinigung) wird beim Import nicht übernommen – Ergänzung im Theme/Importer empfohlen.'),
    199: (E, 'Verifiziert: BreadcrumbList auf allen Seiten valide.'),
    200: (O, 'Service-Schema der statischen Leistungsseiten wird beim Import nicht übernommen (siehe Nr. 198).'),
    201: (E, 'Verifiziert: alle JSON-LD-Blöcke valide parsebar, keine fehlerhaften Daten.'),
    202: (E, 'Yoast-Schema auf allen 192 Seiten vorhanden.'),
    203: (E, 'Verifiziert: nur Yoast erzeugt Schema – keine Konflikte.'),
    204: (O, 'Prozess-Schritt – erst mit Live-Site möglich.'),
    205: (E, 'Verifiziert: Bilder als WebP mit skalierten Größen ausgeliefert.'),
    206: (E, 'Verifiziert: 118 von 131 Bild-URLs WebP, Rest SVG (Logos/Icons).'),
    207: (O, 'Abweichung: nur ein Teil der Bilder hat loading="lazy" (z. B. 4/17 auf Startseite). Empfehlung: lazy für Below-the-fold-Bilder in Theme-Sektionen ergänzen.'),
    208: (E, 'Verifiziert: 1 Hero-Video, lokal gehostet (mp4, Poster, muted/autoplay/playsinline), keine externen Embeds.'),
    209: (E, 'Verifiziert: Raleway lokal als WOFF2 via @font-face – kein Google-Fonts-CDN.'),
    210: (O, 'Vor Go-Live bereinigen: WP File Manager entfernen (Sicherheitsrisiko), All-in-One WP Migration nach Migration deaktivieren, ACF Pro (inaktiv) und Code Snippets (keine aktiven Snippets) entfernen.'),
    211: (O, LIVE + ' (PageSpeed benötigt öffentliche URL.)'),
    212: (O, LIVE),
    213: (None, 'Erreichbar und befüllt; juristische Aktualität = Kundenfreigabe.'),
    214: (O, 'Erreichbar; toter Staging-Link auf Cookie-Richtlinie korrigiert (siehe Nr. 10). Juristische Aktualität durch Kunden bestätigen lassen.'),
    215: (E, 'Verifiziert: beide Seiten HTTP 200, korrekt befüllt, im Footer verlinkt.'),
    216: (O, 'Lokale Prüfung abgeschlossen (15.07.2026); Live-Punkte (SSL, DNS, Tracking, Indexierung, PageSpeed) ausstehend.'),
    217: (O, 'Finale Kundenfreigabe ausstehend.'),
}

# 43-58 Design und Layout: visuell, ohne lokale Auffälligkeiten
for n in range(43, 59):
    U.setdefault(n, (None, 'Visuelle Prüfung laut Checkliste; Crawl ohne Markup-Auffälligkeiten (alle Seiten HTTP 200).'))
# 93-141 Tracking: live-only
for n in range(93, 142):
    U.setdefault(n, (O, 'Erst nach Go-Live prüfbar – lokal kein GA4/GTM/Ads/Pixel eingebunden (HFCM ohne Snippets).'))
# 143-152 Consent (Rest)
for n in range(143, 153):
    U.setdefault(n, (O, 'Verhaltens-/Browser-Test mit echten Tags erst nach Go-Live sinnvoll; Complianz lokal aktiv.'))

shutil.copy2(SRC, BAK)

zin = zipfile.ZipFile(SRC)
sheet = zin.read('xl/worksheets/sheet1.xml').decode('utf-8')


def esc(t):
    return (t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
             .replace('"', '&quot;'))


changed = 0
for nr, (status, comment) in U.items():
    row = nr + 1
    if status is not None:
        pat = re.compile(r'<c r="F%d"([^>]*?)(?: t="[a-zA-Z]+")?(?:/>|>.*?</c>)' % row)
        m = pat.search(sheet)
        if m:
            style = re.search(r's="\d+"', m.group(0))
            s_attr = ' ' + style.group(0) if style else ''
            new = '<c r="F%d"%s t="inlineStr"><is><t>%s</t></is></c>' % (row, s_attr, esc(status))
            sheet = sheet[:m.start()] + new + sheet[m.end():]
    pat = re.compile(r'<c r="G%d"([^>]*?)(?: t="[a-zA-Z]+")?(?:/>|>.*?</c>)' % row)
    m = pat.search(sheet)
    if m:
        style = re.search(r's="\d+"', m.group(0))
        s_attr = ' ' + style.group(0) if style else ''
        new = '<c r="G%d"%s t="inlineStr"><is><t>%s</t></is></c>' % (row, s_attr, esc(comment))
        sheet = sheet[:m.start()] + new + sheet[m.end():]
        changed += 1

TMP = SRC + '.tmp'
with zipfile.ZipFile(TMP, 'w', zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        if item.filename == 'xl/worksheets/sheet1.xml':
            zout.writestr(item, sheet)
        else:
            zout.writestr(item, zin.read(item.filename))
zin.close()
shutil.move(TMP, SRC)
print('Aktualisierte Zeilen (Kommentar):', changed, '| Backup:', BAK)
