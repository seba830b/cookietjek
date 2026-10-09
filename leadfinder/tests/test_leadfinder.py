"""Offline tests. Run from the leadfinder folder:  python3 -m unittest discover tests"""

import functools
import http.server
import json
import os
import sys
import tempfile
import threading
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
FIX = os.path.join(HERE, "fixtures")
sys.path.insert(0, os.path.dirname(HERE))

import audit  # noqa: E402
import osm  # noqa: E402
import score  # noqa: E402
import social  # noqa: E402
from net import Cache, PoliteSession  # noqa: E402

CATEGORIES = {
    "painter": {"label_da": "maler", "tags": ["craft=painter"]},
    "hairdresser": {"label_da": "frisør", "tags": ["shop=hairdresser"]},
    "cafe": {"label_da": "café", "tags": ["amenity=cafe"]},
    "shop": {"label_da": "butik", "tags": ["shop"]},
}


def read(name):
    with open(os.path.join(FIX, name), encoding="utf-8") as f:
        return f.read()


class AnalyzeHtmlTest(unittest.TestCase):
    def test_old_site_has_every_problem(self):
        f = audit.analyze_html(read("old_site.html"), "http://malerhansen.dk/", current_year=2026)
        self.assertFalse(f["viewport"])
        self.assertEqual(f["copyright_year"], 2013)
        self.assertTrue(f["flash"])
        self.assertTrue(f["table_layout"])
        self.assertTrue(f["old_generator"])
        self.assertFalse(f["responsive_css"])
        self.assertFalse(f["phone_visible"])

    def test_modern_site_is_clean(self):
        f = audit.analyze_html(read("modern_site.html"), "https://cafehavnen.dk/", current_year=2026)
        self.assertTrue(f["viewport"])
        self.assertTrue(f["responsive_css"])
        self.assertFalse(f["table_layout"])
        self.assertFalse(f["flash"])
        self.assertIsNone(f["free_builder"])
        self.assertTrue(f["phone_visible"] and f["email_visible"] and f["hours_visible"])
        self.assertEqual(f["contact_url"], "https://cafehavnen.dk/kontakt")

    def test_free_builder_by_text_and_host(self):
        f = audit.analyze_html(read("jimdo_site.html"), "https://frisorlis.dk/")
        self.assertEqual(f["free_builder"], "Jimdo")
        f = audit.analyze_html("<html><body>Hej</body></html>", "https://hansen.wixsite.com/maler")
        self.assertEqual(f["free_builder"], "Wix")

    def test_parked(self):
        self.assertTrue(audit.analyze_html(read("parked.html"), "https://x.dk/")["parked"])


class ScoreTest(unittest.TestCase):
    def test_bands(self):
        biz = {"name": "X", "town": "Svendborg", "category": "cafe", "socials": []}
        self.assertEqual(score.score_lead(biz, None, "café")[0], 90)
        self.assertEqual(score.score_lead({**biz, "socials": ["fb"]}, None, "café")[0], 95)
        broken = {"loads": False, "error": "domænet findes ikke"}
        s, _, pitch = score.score_lead(biz, broken, "café")
        self.assertEqual(s, 85)
        self.assertIn("domænet findes ikke", pitch)

    def test_bad_site_scores_high_and_good_site_low(self):
        biz = {"name": "X", "town": "Svendborg", "category": "painter", "socials": []}
        bad = {"loads": True, "https": "ingen", **audit.analyze_html(read("old_site.html"), "http://x.dk/", 2026)}
        good = {"loads": True, "https": "ok", **audit.analyze_html(read("modern_site.html"), "https://x.dk/", 2026)}
        s_bad, problems, pitch = score.score_lead(biz, bad, "maler")
        s_good, _, pitch_good = score.score_lead({**biz, "category": "cafe"}, good, "café")
        self.assertEqual(s_bad, 80)
        self.assertIn("ingen HTTPS", problems)
        self.assertEqual(pitch, "Hjemmesiden er ikke mobilvenlig og mangler HTTPS.")
        self.assertEqual(s_good, 10)
        self.assertIn("IT-support", pitch_good)


class OsmTest(unittest.TestCase):
    def test_parse(self):
        with open(os.path.join(FIX, "overpass.json"), encoding="utf-8") as f:
            data = json.load(f)
        found = {b["name"]: b for b in osm.parse_elements(data, CATEGORIES)}
        self.assertNotIn("Netto", found)                       # chain skipped
        self.assertEqual(len(found), 4)                         # Frisør Lis deduped
        self.assertEqual(found["Café Havnen"]["website"], "http://cafehavnen.dk")
        self.assertEqual(found["Café Havnen"]["address"], "Havnen 1, 5700 Svendborg")
        self.assertEqual(found["Frisør Lis"]["town"], "Gudme")  # nearest place
        self.assertEqual(found["Frisør Lis"]["category"], "hairdresser")  # not "shop"
        self.assertEqual(found["Tøjbutikken"]["website"], "")   # facebook is social
        self.assertTrue(found["Tøjbutikken"]["socials"])

    def test_query_contains_categories(self):
        q = osm.build_query(["craft=painter", "shop"], 55.0, 10.6, 25000)
        self.assertIn('["craft"="painter"]', q)
        self.assertIn('nwr(around:25000,55.0,10.6)["shop"]["name"];', q)


class SocialTest(unittest.TestCase):
    def test_matching(self):
        self.assertTrue(social.looks_like_own_site("https://www.malerhansen.dk/", "Malerfirma Hansen", "Svendborg"))
        self.assertFalse(social.looks_like_own_site("https://www.krak.dk/malerfirma-hansen", "Malerfirma Hansen", "Svendborg"))
        self.assertTrue(social.looks_like_social_page("https://www.facebook.com/cafehavnen", "Café Havnen | Svendborg", "Café Havnen", "Svendborg"))
        self.assertFalse(social.looks_like_social_page("https://www.facebook.com/andetsted", "Andet sted", "Café Havnen", "Svendborg"))


class AuditFetchTest(unittest.TestCase):
    """Audit a page served from a local web server (no HTTPS there)."""

    def test_audit_local_site(self):
        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *args):
                pass
        handler = functools.partial(Quiet, directory=FIX)
        server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            port = server.server_address[1]
            with tempfile.TemporaryDirectory() as tmp:
                session = PoliteSession("test", 0, 5, respect_robots=True)
                result = audit.audit_site(f"http://127.0.0.1:{port}/old_site.html", session, Cache(tmp, 1))
        finally:
            server.shutdown()
        self.assertTrue(result["loads"])
        self.assertEqual(result["https"], "ingen")
        self.assertTrue(result["flash"])
        self.assertEqual(result["copyright_year"], 2013)


if __name__ == "__main__":
    unittest.main()
