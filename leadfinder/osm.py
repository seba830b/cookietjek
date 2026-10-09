"""Step 1: pull businesses from OpenStreetMap via the Overpass API."""

import math
import re
import time

import requests

SOCIAL_HOSTS = ("facebook.com", "fb.com", "instagram.com")


def geocode(town, country, session, cache):
    """Look up a town's coordinates with Nominatim (1 request, cached)."""
    key = f"{town},{country}"
    hit = cache.get("geocode", key)
    if hit:
        return hit
    resp = session.get(
        "https://nominatim.openstreetmap.org/search",
        params={"q": key, "format": "json", "limit": 1},
    )
    resp.raise_for_status()
    results = resp.json()
    if not results:
        raise SystemExit(f"Kunne ikke finde byen '{town}' via Nominatim.")
    coords = [float(results[0]["lat"]), float(results[0]["lon"])]
    cache.set("geocode", key, coords)
    return coords


def _tag_filter(tag):
    """'shop=bakery' -> ["shop"="bakery"], 'shop' -> ["shop"]"""
    if "=" in tag:
        k, v = tag.split("=", 1)
        return f'["{k}"="{v}"]'
    return f'["{tag}"]'


def build_query(tags, lat, lon, radius_m):
    """Overpass query for named features matching any of the tag filters."""
    lines = [f'  nwr(around:{radius_m},{lat},{lon}){_tag_filter(t)}["name"];' for t in tags]
    return "[out:json][timeout:300];\n(\n" + "\n".join(lines) + "\n);\nout center tags;"


def places_query(lat, lon, radius_m):
    """Town/village names, used to give each business a town."""
    return (f'[out:json][timeout:120];node(around:{radius_m + 5000},{lat},{lon})'
            f'["place"~"^(town|village|hamlet|suburb)$"];out body;')


def run_query(query, endpoints, session, cache):
    """Send the query to the first Overpass server that answers. Results
    are cached per query, so a rerun after a failure only redoes the rest."""
    hit = cache.get("overpass", query)
    if hit:
        return hit
    last_error = None
    for attempt in range(2):
        for url in endpoints:
            try:
                resp = session.post(url, data={"data": query}, timeout=320)
                if resp.status_code == 200 and resp.text.lstrip().startswith("{"):
                    data = resp.json()
                    # Timeouts come back as HTTP 200 with a "remark".
                    remark = data.get("remark", "")
                    if "error" not in remark.lower():
                        cache.set("overpass", query, data)
                        return data
                    last_error = remark
                else:
                    last_error = f"HTTP {resp.status_code}"
            except requests.RequestException as exc:
                last_error = str(exc)
            print(f"    {url} fejlede ({last_error[:80]}), prøver næste")
        time.sleep(15 * (attempt + 1))
    raise SystemExit(f"Ingen Overpass-server svarede. Sidste fejl: {last_error}\n"
                     "Prøv igen om lidt; det der allerede er hentet ligger i cachen.")


def _distance_km(lat1, lon1, lat2, lon2):
    """Great-circle distance (haversine)."""
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _matches(tags, tag):
    if "=" in tag:
        k, v = tag.split("=", 1)
        return tags.get(k) == v
    return tag in tags


def _category_of(tags, categories):
    # Specific categories win over the broad "shop" catch-all, so check
    # filters with a value before bare keys.
    for want_value in (True, False):
        for name, cat in categories.items():
            for tag in cat["tags"]:
                if ("=" in tag) == want_value and _matches(tags, tag):
                    return name
    return None


def normalize_url(url):
    url = (url or "").strip().split(";")[0].strip()
    if not url:
        return ""
    if not re.match(r"^https?://", url, re.I):
        url = "http://" + url
    return url


def is_social(url):
    return any(h in url.lower() for h in SOCIAL_HOSTS)


def parse_elements(data, categories, skip_chains=True):
    """Turn raw Overpass elements into a list of business dicts."""
    places, raw = [], []
    for el in data.get("elements", []):
        tags = el.get("tags", {})
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lon = el.get("lon") or el.get("center", {}).get("lon")
        if "place" in tags and el["type"] == "node":
            places.append((tags.get("name", ""), lat, lon, tags["place"]))
        else:
            raw.append((el, tags, lat, lon))

    businesses, seen = [], set()
    for el, tags, lat, lon in raw:
        if skip_chains and ("brand" in tags or "brand:wikidata" in tags):
            continue
        category = _category_of(tags, categories)
        if not category:
            continue

        # Town: address city if tagged, else nearest town/village node.
        town = tags.get("addr:city") or tags.get("addr:place") or ""
        if not town and lat and places:
            town = min(places, key=lambda p: _distance_km(lat, lon, p[1], p[2]))[0]

        website = normalize_url(tags.get("website") or tags.get("contact:website") or tags.get("url"))
        socials = [normalize_url(tags.get(k)) for k in
                   ("contact:facebook", "facebook", "contact:instagram", "instagram")
                   if tags.get(k)]
        # A "website" that is really a Facebook page counts as social only.
        if website and is_social(website):
            socials.append(website)
            website = ""

        street = " ".join(filter(None, [tags.get("addr:street"), tags.get("addr:housenumber")]))
        postcode_city = " ".join(filter(None, [tags.get("addr:postcode"), tags.get("addr:city")]))
        name = tags["name"].strip()

        # Same business is sometimes mapped twice (node + building).
        key = (name.lower(), town.lower())
        if key in seen:
            continue
        seen.add(key)

        businesses.append({
            "osm_id": f"{el['type']}/{el['id']}",
            "name": name,
            "category": category,
            "town": town,
            "address": ", ".join(filter(None, [street, postcode_city])),
            "phone": tags.get("phone") or tags.get("contact:phone") or tags.get("mobile") or "",
            "email": tags.get("email") or tags.get("contact:email") or "",
            "website": website,
            "socials": socials,
            "opening_hours": tags.get("opening_hours", ""),
        })
    return businesses


def fetch_businesses(cfg, session, cache):
    lat, lon = cfg.get("lat"), cfg.get("lon")
    if not lat or not lon:
        lat, lon = geocode(cfg["town"], cfg.get("country", ""), session, cache)
    radius_m = int(float(cfg["radius_km"]) * 1000)
    endpoints = cfg["overpass_endpoints"]

    # One small query per category is gentler on the servers than one huge one.
    elements = list(run_query(places_query(lat, lon, radius_m), endpoints, session, cache)["elements"])
    for name, cat in cfg["categories"].items():
        print(f"    {name}...")
        elements += run_query(build_query(cat["tags"], lat, lon, radius_m), endpoints, session, cache)["elements"]
    return parse_elements({"elements": elements}, cfg["categories"], cfg.get("skip_chains", True))
