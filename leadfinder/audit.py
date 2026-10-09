"""Step 2: audit a business website.

fetch -> analyze_html. analyze_html is a pure function (no network) so it
can be tested against saved pages."""

import re
import time
from datetime import date
from urllib.parse import urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup

MAX_BYTES = 2_000_000

# Hosts of free website builders. A site still living on one of these
# subdomains usually shows the builder's ads/branding.
FREE_BUILDER_HOSTS = {
    "wixsite.com": "Wix", "wix.com": "Wix",
    "jimdofree.com": "Jimdo", "jimdosite.com": "Jimdo", "jimdo.com": "Jimdo",
    "simplesite.com": "SimpleSite", "simplesite.dk": "SimpleSite",
    "webnode.dk": "Webnode", "webnode.page": "Webnode", "webnode.com": "Webnode",
    "weebly.com": "Weebly", "wordpress.com": "WordPress.com",
    "blogspot.com": "Blogger", "sites.google.com": "Google Sites",
    "site123.me": "Site123", "godaddysites.com": "GoDaddy",
}
# Branding text that free plans inject into the page.
FREE_BUILDER_TEXT = [
    (r"lavet med jimdo|made with jimdo|jimdo free", "Jimdo"),
    (r"designed with the wix|lavet med wix|this site was designed with", "Wix"),
    (r"simplesite\.com|lav din egen (gratis )?hjemmeside", "SimpleSite"),
    (r"lavet med webnode|made with webnode|powered by webnode", "Webnode"),
    (r"powered by weebly", "Weebly"),
]
# Builders that produce responsive pages even without visible @media rules.
RESPONSIVE_PLATFORMS = r"wix|squarespace|shopify|webflow|jimdo|one\.com|godaddy|bootstrap|tailwind|elementor"
OLD_GENERATORS = r"frontpage|microsoft word|iweb|dreamweaver|joomla! 1\.|wordpress [1-4]\.|website x5|netobjects"
PARKED_TEXT = (r"domain(et)? (er )?(til salg|for sale|is parked)|this domain (is|may be) for sale|"
               r"under (opbygning|construction|udarbejdelse)|coming soon|kommer snart|"
               r"velkommen til (din nye hjemmeside|one\.com)|default web site page|"
               r"it works!|parkeret (domæne|hos)")

PHONE_RE = re.compile(r"(?<!\d)(?:\+45[\s.]?)?(?:\d{2}[\s.-]?){3}\d{2}(?!\d)")
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
HOURS_RE = re.compile(
    r"åbningstid|åbent|opening hours|open hours|"
    r"(man(dag)?|tirs(dag)?|ons(dag)?|tors(dag)?|fre(dag)?|lør(dag)?|søn(dag)?)\.?\s*[-–:]?\s*"
    r"(?:(?:til|-|–)\s*(?:fre|lør|søn)\w*\.?\s*:?\s*)?(kl\.?\s*)?\d{1,2}([.:]\d{2})?\s*[-–]\s*\d{1,2}",
    re.I)
COPYRIGHT_RE = re.compile(
    r"(?:©|&copy;|copyright|\(c\))\s*[^0-9<]{0,30}?((?:19|20)\d{2})(?:\s*[-–/]\s*((?:19|20)\d{2}))?",
    re.I)


def _has_phone(text):
    """A Danish 8-digit number, but not a year range like 2009-2013."""
    for m in PHONE_RE.finditer(text):
        if not re.fullmatch(r"(19|20)\d{2}\s*-\s*(19|20)\d{2}", m.group().strip()):
            return True
    return False


def _host_matches(host, domain):
    return host == domain or host.endswith("." + domain)


def analyze_html(html, final_url, current_year=None):
    """Return a dict of findings about one HTML page."""
    current_year = current_year or date.today().year
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    lower_html = html.lower()
    host = urlparse(final_url).netloc.lower().split(":")[0]

    found = {}
    found["viewport"] = bool(soup.find("meta", attrs={"name": re.compile(r"^viewport$", re.I)}))

    # Latest copyright year on the page (a range like 2012-2015 counts as 2015).
    years = []
    for m in COPYRIGHT_RE.finditer(html):
        years += [int(y) for y in m.groups() if y and int(y) <= current_year]
    found["copyright_year"] = max(years) if years else None

    # Responsive CSS: @media in inline styles or <link media>, or a platform
    # known to be responsive. Linked stylesheets are checked by the caller.
    inline_css = " ".join(s.get_text() for s in soup.find_all("style")).lower()
    generator = soup.find("meta", attrs={"name": re.compile(r"^generator$", re.I)})
    found["generator"] = generator.get("content", "") if generator else ""
    found["responsive_css"] = (
        "@media" in inline_css
        or any("width" in (l.get("media") or "") for l in soup.find_all("link"))
        or bool(re.search(RESPONSIVE_PLATFORMS, found["generator"].lower() + " " + lower_html[:200_000]))
    )
    found["stylesheets"] = [
        urljoin(final_url, l["href"]) for l in soup.find_all("link", href=True)
        if "stylesheet" in " ".join(l.get("rel", [])).lower()
    ][:3]

    found["old_generator"] = bool(re.search(OLD_GENERATORS, found["generator"].lower()))
    found["flash"] = bool(re.search(r"\.swf\b|shockwave-flash|x-shockwave", lower_html))

    # Table layout: tables inside tables, or most of the page text sitting
    # in tables that carry layout attributes (width/bgcolor/cellpadding).
    tables = soup.find_all("table")
    nested = any(t.find("table") for t in tables)
    layout_tables = [t for t in tables if any(t.has_attr(a) for a in ("width", "bgcolor", "background", "cellpadding"))]
    table_text = sum(len(t.get_text(" ", strip=True)) for t in layout_tables if not t.find_parent("table"))
    found["table_layout"] = nested or (len(text) > 0 and table_text > 0.5 * len(text))

    # Free builder branding (by host or by injected text).
    builder = next((name for dom, name in FREE_BUILDER_HOSTS.items() if _host_matches(host, dom)), None)
    if not builder:
        builder = next((name for pat, name in FREE_BUILDER_TEXT if re.search(pat, text, re.I)), None)
    found["free_builder"] = builder

    found["parked"] = len(text) < 1500 and bool(re.search(PARKED_TEXT, text, re.I))
    found["phone_visible"] = _has_phone(text) or "tel:" in lower_html
    found["email_visible"] = bool(EMAIL_RE.search(text)) or "mailto:" in lower_html
    found["hours_visible"] = bool(HOURS_RE.search(text))
    found["text_length"] = len(text)

    # A same-site contact page, in case contact info lives there.
    found["contact_url"] = ""
    for a in soup.find_all("a", href=True):
        label = (a.get_text(" ", strip=True) + " " + a["href"]).lower()
        if re.search(r"kontakt|contact|find os|åbningstid", label):
            link = urljoin(final_url, a["href"])
            if urlparse(link).netloc.lower().split(":")[0] == host and link.rstrip("/") != final_url.rstrip("/"):
                found["contact_url"] = link
                break
    return found


def _with_scheme(url, scheme):
    return urlunparse(urlparse(url)._replace(scheme=scheme))


def _fetch(session, url):
    """GET a page. Returns (response, seconds, body)."""
    start = time.time()
    resp = session.get(url, allow_redirects=True, stream=True)
    body = resp.raw.read(MAX_BYTES, decode_content=True)
    seconds = time.time() - start
    resp.close()
    encoding = resp.encoding if resp.encoding and resp.encoding.lower() != "iso-8859-1" else None
    if not encoding:
        encoding = requests.utils.get_encodings_from_content(body[:5000].decode("ascii", "ignore"))
        encoding = encoding[0] if encoding else "utf-8"
    return resp, seconds, body.decode(encoding, errors="replace")


def audit_site(url, session, cache, slow_seconds=3.0):
    """Fetch a site (HTTPS first, then HTTP) and analyze it. Cached by URL."""
    cached = cache.get("audit", url)
    if cached:
        return cached

    result = {"url": url, "loads": False, "error": "", "status": None,
              "seconds": None, "final_url": "", "https": "ok", "slow": False}
    resp = None
    https_url = _with_scheme(url, "https")
    try:
        if not session.allowed(https_url):
            result.update(error="robots.txt tillader ikke besøg", robots_blocked=True)
            cache.set("audit", url, result)
            return result
        resp, seconds, html = _fetch(session, https_url)
    except requests.exceptions.SSLError as exc:
        # "wrong version number" means plain HTTP answered on port 443.
        result["https"] = "ingen" if "WRONG_VERSION" in str(exc).upper() else "ugyldigt certifikat"
    except requests.RequestException:
        result["https"] = "ingen"

    if resp is None:
        try:
            resp, seconds, html = _fetch(session, _with_scheme(url, "http"))
        except requests.RequestException as exc:
            result["error"] = _short_error(exc)
            cache.set("audit", url, result)
            return result

    result.update(status=resp.status_code, seconds=round(seconds, 2), final_url=resp.url,
                  slow=seconds > slow_seconds)
    if resp.url.startswith("http://"):
        result["https"] = result["https"] if result["https"] != "ok" else "ingen"
    if resp.status_code >= 400:
        result["error"] = f"HTTP {resp.status_code}"
        cache.set("audit", url, result)
        return result

    result["loads"] = True
    found = analyze_html(html, resp.url)

    # Look for @media in up to 3 linked stylesheets if nothing found yet.
    if not found["responsive_css"]:
        for css_url in found["stylesheets"]:
            try:
                css = session.get(css_url).text
                if "@media" in css:
                    found["responsive_css"] = True
                    break
            except requests.RequestException:
                pass

    # Contact info or hours missing on the front page? Try the contact page.
    if found["contact_url"] and not (found["phone_visible"] and found["hours_visible"]):
        try:
            if session.allowed(found["contact_url"]):
                _, _, contact_html = _fetch(session, found["contact_url"])
                extra = analyze_html(contact_html, found["contact_url"])
                for key in ("phone_visible", "email_visible", "hours_visible"):
                    found[key] = found[key] or extra[key]
        except requests.RequestException:
            pass

    found.pop("stylesheets", None)
    result.update(found)
    cache.set("audit", url, result)
    return result


def _short_error(exc):
    msg = str(exc)
    if "NameResolution" in msg or "Name or service not known" in msg or "getaddrinfo" in msg:
        return "domænet findes ikke"
    if isinstance(exc, requests.exceptions.Timeout):
        return "den svarer ikke"
    if isinstance(exc, requests.exceptions.ConnectionError):
        return "kan ikke forbinde"
    return type(exc).__name__
