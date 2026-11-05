# Reel North (reelnorth.net) — content rules

Static site, no build step. Every file in this repo's root is served by Netlify as-is; a push to `main` deploys automatically.

## Who the site is for
- Casino review pages (`*-review.html`, `index.html`, province pages, `bonuses.html`) are for Canadian players **outside Ontario and Alberta**. They carry affiliate links through `/go/<casino>` redirects (see `_redirects`, Canada-only).
- Strategy guides (`guide-*.html`) are **education for readers worldwide** and contain **no casino links at all**.

## Automatic articles (scheduled task, twice a week)
Automatic articles are strategy / education guides only. They are published without human review, so:
- File name `guide-<slug>.html`, built by copying the full page structure of `guide-wagering-requirements.html` (head, 18+ strip, header, breadcrumbs, article + aside layout, footer). Change only: `<title>`, meta description, canonical, og tags, the two JSON-LD blocks (headline, `dateModified` = today, breadcrumb item URL = the page's own URL), breadcrumb text, eyebrow ("Strategy guide · Updated <Month YYYY>"), and the `<article>` body. Keep the aside's "Play within limits" box.
- **No casino links**: no `/go/` links, no casino brand names, no named bonus offers, no specific bonus amounts or promo codes. Worked examples use round illustrative numbers and say so.
- Facts must be stable, checkable maths or rules (house edge, RTP, probabilities, game rules, how wagering works, how verification/withdrawals generally work). Do the arithmetic in Python; never state a number you have not computed or verified. No legal claims beyond what `legal-canada.html` already says.
- Never use: guaranteed, can't lose, sure thing, risk-free, free money, beat the casino, "make money" / income claims. Every guide must say plainly that no strategy removes the house edge, and link `responsible-gambling.html`.
- 1,200–2,200 words of useful content: a clear lede answering the search question, H2 sections, at least one table or worked example, a short "Common mistakes" or "When to walk away" section. Written for people, not keyword-stuffed: use the main keyword in the title, H1, lede and one H2.
- Link it in: add a card to the grid in `guides.html`, add a `<url>` to `sitemap.xml` (lastmod today), add the new guide to the "More guides" aside of 1–2 closely related existing guides, and link to 2–3 existing pages from inside the new article.
- One new article per run. Skip any topic already covered (check existing `guide-*.html` and `TOPICS.md`).
- Run `python3 check_article.py guide-<slug>.html` — it must print `PASS` before committing. If it fails and can't be fixed, do not publish.
- After publishing, mark the topic done in `TOPICS.md` with the date and file name.
