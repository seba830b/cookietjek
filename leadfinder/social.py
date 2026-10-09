"""Step 3: for businesses without a website in OSM, look for a Facebook or
Instagram page (and a real website OSM doesn't know about).

Uses the official Brave Search API (free tier, key required). No Google
or Facebook scraping. Without a key, only the social links tagged in OSM
are used."""

import os
import re
from urllib.parse import urlparse

import requests

from osm import SOCIAL_HOSTS

BRAVE_URL = "https://api.search.brave.com/res/v1/web/search"

# Directory/listing sites: a hit here is not the business's own website.
DIRECTORY_HOSTS = (
    "krak.dk", "degulesider.dk", "proff.dk", "cvr.dk", "virk.dk", "findsmiley.dk",
    "tripadvisor", "google.", "yelp.", "linkedin.com", "booking.com", "hotels.com",
    "airbnb.", "visitsvendborg.dk", "visitfyn.dk", "visitdenmark", "foursquare.com",
    "eniro.", "118.dk", "firmaer.dk", "bedst.dk", "trustpilot.", "ownr.dk", "kompass.",
    "fyens.dk", "wikipedia.org", "just-eat.dk", "wolt.com", "hungry.dk", "menu.dk",
    "opendi.", "cylex", "hotfrog.", "infobel.", "youtube.com", "tiktok.com",
    "dinby.dk", "lokalebasen.dk", "bilbasen.dk", "dba.dk", "pinterest.", "x.com",
    "twitter.com", "thefork.", "restaurantguru.", "sluurpy.", "booksalon.dk",
    "planway.com", "bookbeauty.dk", "nemtilmeld", "jobindex.dk", "datacvr.virk.dk",
    "mapcarta.com", "openstreetmap.org", "apple.com", "bing.com", "kayak.",
)

# Words too generic to identify a business by its domain name.
STOPWORDS = {
    "svendborg", "fyn", "aps", "ivs", "a/s", "og", "the", "and", "cafe", "café",
    "restaurant", "frisør", "frisor", "salon", "klinik", "bageri", "bager", "hotel",
    "camping", "butik", "shop", "hus", "huset", "service", "v/", "din", "den", "det",
}


def _fold(text):
    """Lowercase and turn Danish letters into ASCII, keep letters/digits."""
    text = text.lower().replace("æ", "ae").replace("ø", "oe").replace("å", "aa")
    return re.sub(r"[^a-z0-9]", "", text)


def _name_tokens(name, town):
    stop = STOPWORDS | {town.lower()}
    words = [w for w in re.split(r"[\s&.,'/-]+", name.lower()) if w and w not in stop]
    return [_fold(w) for w in words if len(_fold(w)) >= 4]


def _domain_label(host):
    parts = host.lower().removeprefix("www.").split(".")
    return _fold(parts[0] if len(parts) <= 2 else parts[-2])


def looks_like_own_site(url, name, town):
    """True if the URL's domain plausibly belongs to this business."""
    host = urlparse(url).netloc.lower()
    if any(d in host for d in DIRECTORY_HOSTS + SOCIAL_HOSTS):
        return False
    label = _domain_label(host)
    whole = _fold(name)
    if len(whole) >= 5 and (whole in label or label in whole and len(label) >= 5):
        return True
    return any(tok in label for tok in _name_tokens(name, town))


def looks_like_social_page(url, title, name, town):
    host = urlparse(url).netloc.lower()
    if not any(h in host for h in SOCIAL_HOSTS):
        return False
    haystack = _fold(title + " " + urlparse(url).path)
    tokens = _name_tokens(name, town) or [_fold(name)]
    return any(tok and tok in haystack for tok in tokens)


class SocialFinder:
    def __init__(self, cfg, session, cache):
        search = cfg.get("search", {}) or {}
        self.api_key = os.environ.get(search.get("api_key_env", "BRAVE_API_KEY"), "")
        self.max_searches = int(search.get("max_searches", 300))
        self.session = session
        self.cache = cache
        self.used = 0
        self.warned = False

    @property
    def enabled(self):
        return bool(self.api_key)

    def search(self, query):
        """Brave Search web results as [(url, title)], cached."""
        hit = self.cache.get("search", query)
        if hit is not None:
            return hit
        if not self.enabled or self.used >= self.max_searches:
            return None
        self.used += 1
        try:
            resp = self.session.get(
                BRAVE_URL,
                params={"q": query, "country": "dk", "search_lang": "da", "count": 10},
                headers={"X-Subscription-Token": self.api_key, "Accept": "application/json"},
            )
            resp.raise_for_status()
        except requests.RequestException as exc:
            if not self.warned:
                print(f"  Søgning fejlede ({exc}); fortsætter uden.")
                self.warned = True
            return None
        results = [(r.get("url", ""), r.get("title", ""))
                   for r in resp.json().get("web", {}).get("results", [])]
        self.cache.set("search", query, results)
        return results

    def check(self, biz):
        """Fill biz['socials'] and biz['found_website'] where possible.
        Returns True if a search was made (or cached), False if skipped."""
        results = self.search(f'"{biz["name"]}" {biz["town"]}'.strip())
        if results is None:
            return False
        for url, title in results:
            if looks_like_social_page(url, title, biz["name"], biz["town"]):
                if url not in biz["socials"]:
                    biz["socials"].append(url)
            elif not biz.get("found_website") and looks_like_own_site(url, biz["name"], biz["town"]):
                parts = urlparse(url)
                biz["found_website"] = f"{parts.scheme}://{parts.netloc}/"
        return True
