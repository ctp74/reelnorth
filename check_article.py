#!/usr/bin/env python3
"""Checks a new Reel North guide before it is published. Prints PASS or the problems."""
import re, sys, html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
BANNED = ["guaranteed", "can't lose", "cannot lose", "sure thing", "risk-free", "risk free",
          "free money", "beat the casino", "make money", "easy money", "get rich"]
BRANDS = ["ice casino", "v.vegas", "vvegas", "verde", "slotoro", "hit'n'spin", "hitnspin",
          "fs casino", "fieryplay", "ice-spin"]

def main(name):
    p = ROOT / name
    problems = []
    if not re.fullmatch(r"guide-[a-z0-9-]+\.html", name):
        problems.append("file name must be guide-<slug>.html")
    if not p.exists():
        print("FAIL: file not found"); return 1
    src = p.read_text(encoding="utf-8")
    m = re.search(r'<article class="prose">(.*?)</article>', src, re.S)
    if not m:
        problems.append("no <article class=\"prose\"> block")
        body = ""
    else:
        body = m.group(1)
    text = html.unescape(re.sub(r"<[^>]+>", " ", body))
    low = text.lower()
    words = len(text.split())
    if words < 1200: problems.append(f"article too short ({words} words, need 1200+)")
    if words > 2600: problems.append(f"article too long ({words} words)")
    for b in BANNED:
        if b in low: problems.append(f"banned phrase: {b!r}")
    for b in BRANDS:
        if b in low: problems.append(f"casino brand named: {b!r}")
    if "/go/" in body: problems.append("contains a /go/ casino link")
    for href in re.findall(r'href="(https?://[^"]+)"', body):
        if not href.startswith("https://reelnorth.net"):
            problems.append(f"external link not allowed: {href}")
    if "house edge" not in low: problems.append("must mention the house edge")
    if 'href="responsible-gambling.html"' not in body: problems.append("article body must link responsible-gambling.html")
    if src.count("<h1") != 1: problems.append("needs exactly one <h1>")
    if len(re.findall(r"<h2", body)) < 4: problems.append("needs at least 4 <h2> sections")
    if "<table" not in body and "example" not in low: problems.append("needs a table or a worked example")
    canon = f'<link rel="canonical" href="https://reelnorth.net/{name}">'
    if canon not in src: problems.append("canonical URL wrong or missing")
    if f'"item": "https://reelnorth.net/{name}"' not in src: problems.append("breadcrumb JSON-LD must point at this page")
    for needed in ['class="strip"', "<strong>18+</strong>", 'class="site-foot"', "Play within limits", 'href="styles.css"']:
        if needed not in src: problems.append(f"page structure missing: {needed}")
    t = re.search(r"<title>(.*?)</title>", src, re.S)
    if not t or not t.group(1).strip(): problems.append("missing <title>")
    d = re.search(r'<meta name="description" content="([^"]+)"', src)
    if not d or not (70 <= len(d.group(1)) <= 170): problems.append("meta description missing or not 70-170 chars")
    internal = set(re.findall(r'href="([a-z0-9-]+\.html)"', body))
    if len(internal - {name, "responsible-gambling.html"}) < 2: problems.append("link to at least 2 other Reel North pages from the article")
    if f"https://reelnorth.net/{name}" not in (ROOT / "sitemap.xml").read_text(): problems.append("not in sitemap.xml")
    if f'href="{name}"' not in (ROOT / "guides.html").read_text(): problems.append("not linked from guides.html")
    linked_from = [f.name for f in ROOT.glob("*.html") if f.name not in (name, "guides.html") and f'href="{name}"' in f.read_text(encoding="utf-8")]
    if not linked_from: problems.append("no other page links to it (add it to a related guide's aside)")
    if problems:
        print("FAIL"); [print(" -", x) for x in problems]; return 1
    print(f"PASS ({words} words, linked from {', '.join(linked_from)})"); return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
