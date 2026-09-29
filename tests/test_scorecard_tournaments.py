import unittest
import os
import re
import filecmp
from app import app, db, Club, Turnier, KATALOG_CLUBS, KATALOG_TURNIERE

class ScorecardTournamentAndSignatureTests(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.ctx = self.app.app_context()
        self.ctx.push()
        self.repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    def tearDown(self):
        self.ctx.pop()

    def test_scorecard_tournament_banner_markup(self):
        """Prüft, dass das offizielle Turnier-Banner in index.html und www/index.html vorhanden ist."""
        for path in ["index.html", "www/index.html"]:
            full_path = os.path.join(self.repo_root, path)
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            self.assertIn('id="sc-tournament-banner"', content, f"sc-tournament-banner fehlt in {path}")
            self.assertIn('id="sc-tb-title"', content, f"sc-tb-title fehlt in {path}")
            self.assertIn('id="sc-tb-spielform"', content, f"sc-tb-spielform fehlt in {path}")
            self.assertIn('id="sc-tb-vorgabe"', content, f"sc-tb-vorgabe fehlt in {path}")
            self.assertIn('id="sc-tb-meta"', content, f"sc-tb-meta fehlt in {path}")

    def test_signature_zoom_modal_markup(self):
        """Prüft, dass das vergrößerte Touch-Signatur-Modal mit High-Res Canvas in index.html vorhanden ist."""
        for path in ["index.html", "www/index.html"]:
            full_path = os.path.join(self.repo_root, path)
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            self.assertIn('id="signature-zoom-modal"', content, f"signature-zoom-modal fehlt in {path}")
            self.assertIn('id="sc-zoom-canvas"', content, f"sc-zoom-canvas fehlt in {path}")
            self.assertIn('id="sig-zoom-title"', content, f"sig-zoom-title fehlt in {path}")
            self.assertIn('id="sig-zoom-role"', content, f"sig-zoom-role fehlt in {path}")
            self.assertIn('openZoomSignatureModal', content, f"openZoomSignatureModal fehlt in {path}")
            self.assertIn('confirmZoomSignature', content, f"confirmZoomSignature fehlt in {path}")
            self.assertIn('clearZoomSignature', content, f"clearZoomSignature fehlt in {path}")
            self.assertIn('id="sc-player-signed-badge"', content, f"sc-player-signed-badge fehlt in {path}")
            self.assertIn('id="sc-marker-signed-badge"', content, f"sc-marker-signed-badge fehlt in {path}")

    def test_scorecard_js_implementation(self):
        """Prüft, dass die Funktionen für Zoom-Signatur, Banner und Back-Nine in js/scorecard.js definiert sind."""
        for path in ["js/scorecard.js", "www/js/scorecard.js"]:
            full_path = os.path.join(self.repo_root, path)
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            self.assertIn('function openZoomSignatureModal', content, f"openZoomSignatureModal fehlt in {path}")
            self.assertIn('function confirmZoomSignature', content, f"confirmZoomSignature fehlt in {path}")
            self.assertIn('function updateSignatureBadges', content, f"updateSignatureBadges fehlt in {path}")
            self.assertIn('function updateScorecardTournamentBanner', content, f"updateScorecardTournamentBanner fehlt in {path}")
            self.assertIn('clubHolesTemplates', content, f"clubHolesTemplates fehlt in {path}")
            self.assertIn('isBackNine', content, f"isBackNine Handling fehlt in {path}")

    def test_frontend_parity(self):
        """Stellt sicher, dass Root und www zu 100% synchron sind."""
        index_root = os.path.join(self.repo_root, "index.html")
        index_www = os.path.join(self.repo_root, "www", "index.html")
        self.assertTrue(filecmp.cmp(index_root, index_www, shallow=False), "index.html und www/index.html sind nicht identisch!")

        js_root_dir = os.path.join(self.repo_root, "js")
        js_www_dir = os.path.join(self.repo_root, "www", "js")
        for fname in os.listdir(js_root_dir):
            if fname.endswith(".js"):
                f_root = os.path.join(js_root_dir, fname)
                f_www = os.path.join(js_www_dir, fname)
                self.assertTrue(os.path.exists(f_www), f"{fname} fehlt in www/js/")
                self.assertTrue(filecmp.cmp(f_root, f_www, shallow=False), f"{fname} unterscheidet sich in www/js/!")

    def test_jersbek_courses_and_tournaments(self):
        """Prüft, dass GC Jersbek 18, 1-9 und 10-18 Kurse sowie deren Turniere vollumfänglich existieren."""
        clubs = Club.query.all()
        club_names = [c.name for c in clubs]
        self.assertIn("GC Jersbek 18", club_names)
        self.assertIn("GC Jersbek 1-9", club_names)
        self.assertIn("GC Jersbek 10-18", club_names)

        # Prüfe Turniere für GC Jersbek 18, 1-9 und 10-18
        jersbek_tourneys = [t for t in KATALOG_TURNIERE if "Jersbek" in t.get("club_name", "")]
        self.assertGreaterEqual(len(jersbek_tourneys), 10)

        # Prüfe, dass 9-Loch und 18-Loch Turniere vorhanden sind
        loecher_set = {t["loecher"] for t in jersbek_tourneys}
        self.assertIn(18, loecher_set)
        self.assertIn(9, loecher_set)

        # Prüfe, dass Zählspiel und Stableford vertreten sind
        spielformen = {t.get("spielform") for t in jersbek_tourneys}
        self.assertIn("Stableford", spielformen)
        self.assertIn("Zählspiel", spielformen)

    def test_course_ratings_for_jersbek_subcourses(self):
        """Prüft die offiziellen DGV CR- und Slope-Werte für GC Jersbek 18, 1-9 und 10-18."""
        c18 = Club.query.filter_by(name="GC Jersbek 18").first()
        c1_9 = Club.query.filter_by(name="GC Jersbek 1-9").first()
        c10_18 = Club.query.filter_by(name="GC Jersbek 10-18").first()

        self.assertIsNotNone(c18)
        self.assertIsNotNone(c1_9)
        self.assertIsNotNone(c10_18)

        self.assertEqual(float(c18.par18), 72.0)
        self.assertEqual(float(c18.cr18), 71.4)
        self.assertEqual(float(c18.sr18), 132.0)

        self.assertEqual(float(c1_9.par9), 36.0)
        self.assertEqual(float(c1_9.cr9), 35.7)
        self.assertEqual(float(c1_9.sr9), 132.0)

        self.assertEqual(float(c10_18.par9), 36.0)
        self.assertEqual(float(c10_18.cr9), 36.6)
        self.assertEqual(float(c10_18.sr9), 130.0)

if __name__ == '__main__':
    unittest.main()
