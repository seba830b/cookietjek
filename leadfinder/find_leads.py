"""Find web design leads around a town and write a ranked lead list.

    python3 find_leads.py                 # use config.yaml
    python3 find_leads.py --refresh       # ignore the cache, fetch everything again
    python3 find_leads.py --limit 20      # only audit the first 20 (quick test)
"""

import argparse
import os
import sys

import yaml

import audit
import export
import osm
import score
from net import Cache, PoliteSession
from social import SocialFinder

HERE = os.path.dirname(os.path.abspath(__file__))


def load_config(path):
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--config", default=os.path.join(HERE, "config.yaml"))
    parser.add_argument("--refresh", action="store_true", help="ignore cached results")
    parser.add_argument("--limit", type=int, default=0, help="only process the first N businesses")
    args = parser.parse_args()

    cfg = load_config(args.config)
    base = os.path.dirname(os.path.abspath(args.config))
    cache = Cache(os.path.join(base, cfg.get("cache_dir", ".cache")), cfg.get("cache_days", 14),
                  enabled=not args.refresh)
    session = PoliteSession(cfg["user_agent"], cfg.get("min_seconds_between_requests_per_host", 2),
                            cfg.get("request_timeout_seconds", 15), cfg.get("respect_robots_txt", True))

    # 1. Businesses from OpenStreetMap.
    print(f"1/4 Henter virksomheder inden for {cfg['radius_km']} km af {cfg['town']} fra OpenStreetMap...")
    businesses = osm.fetch_businesses(cfg, session, cache)
    if args.limit:
        businesses = businesses[:args.limit]
    print(f"    {len(businesses)} virksomheder fundet.")

    # 3 (before 2). Businesses without a website: look for social pages, and
    # for a website OSM doesn't know about (which then gets audited too).
    finder = SocialFinder(cfg, session, cache)
    no_site = [b for b in businesses if not b["website"]]
    print(f"2/4 Søger efter Facebook/Instagram for {len(no_site)} uden hjemmeside i OSM...")
    if not finder.enabled:
        print(f"    Ingen søge-nøgle ({cfg.get('search', {}).get('api_key_env', 'BRAVE_API_KEY')}) sat;"
              " bruger kun sociale links fra OSM. Se README.")
    for i, biz in enumerate(no_site, 1):
        finder.check(biz)
        _progress(i, len(no_site))

    # 2. Audit every website.
    with_site = [b for b in businesses if b["website"] or b.get("found_website")]
    print(f"3/4 Tjekker {len(with_site)} hjemmesider (høfligt, med pauser)...")
    audits = {}
    for i, biz in enumerate(with_site, 1):
        url = biz["website"] or biz["found_website"]
        audits[biz["osm_id"]] = audit.audit_site(url, session, cache, cfg.get("slow_site_seconds", 3.0))
        _progress(i, len(with_site))

    # 4. Score and write.
    print("4/4 Scorer og gemmer...")
    leads = []
    for biz in businesses:
        result = audits.get(biz["osm_id"])
        label = cfg["categories"][biz["category"]].get("label_da", biz["category"])
        points, problems, pitch = score.score_lead(biz, result, label)
        notes = []
        if biz.get("found_website"):
            notes.append("hjemmeside fundet via søgning")
        if biz["socials"]:
            notes.append("sociale: " + " ".join(biz["socials"][:2]))
        if biz["email"]:
            notes.append("mail: " + biz["email"])
        if biz["opening_hours"]:
            notes.append("åbningstider (OSM): " + biz["opening_hours"])
        if not biz["website"] and not biz.get("found_website") and not finder.enabled:
            notes.append("ikke søgt på nettet, tjek selv")
        leads.append({
            "score": points,
            "name": biz["name"],
            "category": biz["category"],
            "town": biz["town"],
            "address": biz["address"],
            "phone": biz["phone"],
            "website": biz["website"] or biz.get("found_website", ""),
            "problems": problems,
            "pitch_angle": pitch,
            "contacted": "",
            "notes": "",                  # left empty for you
            "info": " | ".join(notes),    # extra facts found along the way
        })
    # Highest score first; among equals, leads with a phone number first.
    leads.sort(key=lambda l: (-l["score"], not l["phone"], l["name"]))

    csv_path = os.path.join(base, cfg.get("output_csv", "leads.csv"))
    xlsx_path = os.path.join(base, cfg.get("output_xlsx", "leads.xlsx"))
    export.write_csv(leads, csv_path, cfg.get("csv_delimiter", ";"))
    export.write_xlsx(leads, xlsx_path)
    print(f"    Gemt: {csv_path}\n          {xlsx_path}")
    export.print_summary(leads)


def _progress(i, total):
    if total and (i == total or i % 10 == 0):
        print(f"    {i}/{total}", file=sys.stderr)


if __name__ == "__main__":
    main()
