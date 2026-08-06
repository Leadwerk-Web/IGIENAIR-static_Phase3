#!/usr/bin/env python3
"""Frontend-Crawl von igineair.local fuer die Go-Live-Checkliste."""
import json
import re
import sys
import urllib.request
import urllib.error
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
from xml.etree import ElementTree

BASE = "http://igineair.local"
HEADERS = {"User-Agent": "Mozilla/5.0 (GoLiveAudit/1.0)"}


def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read()
            return resp.status, body, dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read() if e.fp else b"", dict(e.headers or {})
    except Exception as e:
        return None, str(e).encode(), {}


def head_status(url, timeout=15):
    req = urllib.request.Request(url, headers=HEADERS, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        if e.code == 405:
            status, _, _ = fetch(url, timeout)
            return status
        return e.code
    except Exception:
        return None


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self._in_title = False
        self._in_h1 = False
        self._in_script_ld = False
        self._ld_buf = []
        self.meta = {}
        self.og = {}
        self.h1 = []
        self.images = []
        self.links = []
        self.tel_links = []
        self.mailto_links = []
        self.schema_raw = []
        self.canonical = ""
        self.favicon = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "h1":
            self._in_h1 = True
            self.h1.append("")
        elif tag == "meta":
            name = (a.get("name") or "").lower()
            prop = (a.get("property") or "").lower()
            if name:
                self.meta[name] = a.get("content", "")
            if prop.startswith("og:"):
                self.og[prop] = a.get("content", "")
        elif tag == "img":
            self.images.append({
                "src": a.get("src", ""),
                "loading": a.get("loading", ""),
                "alt": a.get("alt"),
            })
        elif tag == "a":
            href = a.get("href", "")
            if href.startswith("tel:"):
                self.tel_links.append(href)
            elif href.startswith("mailto:"):
                self.mailto_links.append(href)
            elif href and not href.startswith(("#", "javascript:")):
                self.links.append(href)
        elif tag == "link":
            rel = (a.get("rel") or "").lower()
            if rel == "canonical":
                self.canonical = a.get("href", "")
            if "icon" in rel:
                self.favicon = True
        elif tag == "script" and (a.get("type") == "application/ld+json"):
            self._in_script_ld = True
            self._ld_buf = []

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "h1":
            self._in_h1 = False
        elif tag == "script" and self._in_script_ld:
            self._in_script_ld = False
            self.schema_raw.append("".join(self._ld_buf))

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_h1 and self.h1:
            self.h1[-1] += data
        if self._in_script_ld:
            self._ld_buf.append(data)


def schema_types(raw_list):
    types = []
    for raw in raw_list:
        try:
            data = json.loads(raw)
        except Exception:
            types.append("(ungueltiges JSON-LD)")
            continue
        def walk(node):
            if isinstance(node, dict):
                t = node.get("@type")
                if t:
                    types.extend(t if isinstance(t, list) else [t])
                for v in node.values():
                    walk(v)
            elif isinstance(node, list):
                for v in node:
                    walk(v)
        walk(data)
    return types


def main():
    # URLs aus CSV (alle publizierten Seiten) + Sitemap-URLs sammeln
    import csv
    urls = []
    csv_path = "/Users/atlas/Documents/Github/IGIENAIR-static_Phase3/_golive_audit/all_page_urls.csv"
    with open(csv_path) as f:
        for row in csv.DictReader(f):
            urls.append(row["url"])
    for sm in ("page-sitemap.xml", "post-sitemap.xml"):
        status, body, _ = fetch(f"{BASE}/{sm}")
        if status == 200:
            root = ElementTree.fromstring(body)
            ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            urls += [el.text for el in root.findall(".//s:loc", ns)]
    urls = sorted(set(urls))
    print(f"Sitemap-URLs: {len(urls)}", file=sys.stderr)

    pages = {}
    internal_links = set()
    external_links = set()
    image_urls = set()

    def crawl(url):
        status, body, headers = fetch(url)
        result = {"status": status}
        if status != 200 or not body:
            return url, result
        html = body.decode("utf-8", errors="replace")
        p = PageParser()
        try:
            p.feed(html)
        except Exception as e:
            result["parse_error"] = str(e)
        result.update({
            "title": p.title.strip(),
            "meta_description": p.meta.get("description", ""),
            "robots": p.meta.get("robots", ""),
            "og_title": p.og.get("og:title", ""),
            "og_image": p.og.get("og:image", ""),
            "h1_count": len(p.h1),
            "h1": [h.strip()[:80] for h in p.h1],
            "canonical": p.canonical,
            "favicon": p.favicon,
            "img_total": len(p.images),
            "img_webp": sum(1 for i in p.images if ".webp" in i["src"].lower()),
            "img_lazy": sum(1 for i in p.images if i["loading"] == "lazy"),
            "img_no_alt": sum(1 for i in p.images if not (i["alt"] or "").strip()),
            "img_no_alt_srcs": [i["src"][-60:] for i in p.images if not (i["alt"] or "").strip()][:5],
            "tel": p.tel_links,
            "mailto": p.mailto_links,
            "schema": schema_types(p.schema_raw),
        })
        for href in p.links:
            absu = urljoin(url, href)
            host = urlparse(absu).netloc
            if host in ("igineair.local", ""):
                internal_links.add(absu.split("#")[0])
            elif absu.startswith("http"):
                external_links.add(absu)
        for img in p.images:
            if img["src"]:
                image_urls.add(urljoin(url, img["src"]))
        return url, result

    with ThreadPoolExecutor(max_workers=8) as ex:
        for fut in as_completed([ex.submit(crawl, u) for u in urls]):
            u, r = fut.result()
            pages[u] = r

    # Interne Links pruefen (nur die nicht schon gecrawlt wurden)
    to_check = sorted(l for l in internal_links if l not in pages and "wp-admin" not in l and "wp-login" not in l)
    link_status = {}
    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = {ex.submit(head_status, l): l for l in to_check}
        for fut in as_completed(futs):
            link_status[futs[fut]] = fut.result()

    # Bilder pruefen
    img_status = {}
    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = {ex.submit(head_status, i): i for i in sorted(image_urls)}
        for fut in as_completed(futs):
            img_status[futs[fut]] = fut.result()

    # Externe Links pruefen (dedupliziert nach Domain+Pfad)
    ext_status = {}
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(head_status, l): l for l in sorted(external_links)}
        for fut in as_completed(futs):
            ext_status[futs[fut]] = fut.result()

    # 404-Seite
    st404, body404, _ = fetch(f"{BASE}/diese-seite-gibt-es-nicht-{hash('x') % 9999}/")
    html404 = body404.decode("utf-8", errors="replace") if body404 else ""

    out = {
        "sitemap_url_count": len(urls),
        "pages": pages,
        "internal_link_status": link_status,
        "image_status": img_status,
        "external_link_status": ext_status,
        "custom_404": {"status": st404, "has_content": len(html404) > 2000,
                        "styled": ("404" in html404 and ("class=" in html404))},
    }
    with open(sys.argv[1] if len(sys.argv) > 1 else "crawl_result.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print("fertig", file=sys.stderr)


if __name__ == "__main__":
    main()
