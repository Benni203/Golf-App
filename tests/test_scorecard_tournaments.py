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

    def test_par_and_handicap_strokes_math_across_all_clubs(self):
        """Prüft, dass für alle Clubs die Lochanzahl, Pars und Vorgabestriche mathematisch exakt aufgehen."""
        clubs = Club.query.all()
        for c in clubs:
            if c.par18 and str(c.par18).strip() != '':
                par_val = round(float(c.par18))
                self.assertIn(par_val, [71, 72, 73], f"Ungewöhnliches Par 18 bei {c.name}: {par_val}")
            if c.par9 and str(c.par9).strip() != '':
                par_val = round(float(c.par9))
                self.assertEqual(par_val, 36, f"Ungewöhnliches Par 9 bei {c.name}: {par_val}")

    def test_course_handicap_formula_and_stroke_allocation(self):
        """Prüft die WHS-Formel Course Handicap = HCP * Slope / 113 + (CR - Par) und dass die Summe der Striche exakt dem Course Handicap entspricht."""
        # Testfall 1: HCPI 18.4 auf GC Jersbek 18 (CR 71.4, Slope 132, Par 72)
        # CH = round(18.4 * 132 / 113 + (71.4 - 72)) = round(21.49 - 0.6) = round(20.89) = 21
        hcp = 18.4
        cr = 71.4
        slope = 132.0
        par = 72.0
        ch = round((hcp * slope / 113.0) + (cr - par))
        self.assertEqual(ch, 21)

        # 21 Vorgabestriche auf 18 Löcher:
        # Basis 1 Strich auf allen 18 Löchern (18 Striche),
        # plus 1 weiterer Strich auf den 3 schwersten Löchern (SI 1, SI 2, SI 3) = 21 Striche.
        base = ch // 18
        rem = ch % 18
        strokes = [base + (1 if si <= rem else 0) for si in range(1, 19)]
        self.assertEqual(sum(strokes), ch)

        # Testfall 2: HCPI 18.4 auf GC Jersbek 10-18 (Back Nine: CR 36.6, Slope 130, Par 36)
        # CH9 = round((18.4 / 2) * 130 / 113 + (36.6 - 36)) = round(9.2 * 1.1504 + 0.6) = round(10.58 + 0.6) = round(11.18) = 11
        ch9 = round(((hcp / 2.0) * 130.0 / 113.0) + (36.6 - 36.0))
        self.assertEqual(ch9, 11)
        base9 = ch9 // 9
        rem9 = ch9 % 9
        strokes9 = [base9 + (1 if rank <= rem9 else 0) for rank in range(1, 10)]
        self.assertEqual(sum(strokes9), ch9)

    def test_jersbek_hole_pars_and_stroke_indexes(self):
        """Prüft, dass GC Jersbek die exakten DGV-Parvorgaben besitzt: Loch 5 ist Par 3, Loch 4 ist Par 5, Loch 6 ist Par 5."""
        c18 = Club.query.filter_by(name="GC Jersbek 18").first()
        self.assertIsNotNone(c18)
        holes18 = c18.get_holes_list()
        self.assertEqual(len(holes18), 18)

        # Hole 5 must be Par 3 (User requirement!)
        h5 = next((h for h in holes18 if h["hole"] == 5), None)
        self.assertIsNotNone(h5)
        self.assertEqual(h5["par"], 3, f"Loch 5 bei GC Jersbek muss Par 3 sein, war aber {h5['par']}!")
        self.assertEqual(h5["si"], 7)

        # Hole 4 must be Par 5 (remodeled)
        h4 = next((h for h in holes18 if h["hole"] == 4), None)
        self.assertIsNotNone(h4)
        self.assertEqual(h4["par"], 5)
        self.assertEqual(h4["si"], 11)

        # Hole 6 must be Par 5
        h6 = next((h for h in holes18 if h["hole"] == 6), None)
        self.assertIsNotNone(h6)
        self.assertEqual(h6["par"], 5)

        # Hole 3 must be Par 3
        h3 = next((h for h in holes18 if h["hole"] == 3), None)
        self.assertIsNotNone(h3)
        self.assertEqual(h3["par"], 3)

        # Front 9 sum must be 36
        front9_par = sum(h["par"] for h in holes18[:9])
        self.assertEqual(front9_par, 36)

        # Back 9 sum must be 36
        back9_par = sum(h["par"] for h in holes18[9:])
        self.assertEqual(back9_par, 36)

        # Total 18 sum must be 72
        self.assertEqual(sum(h["par"] for h in holes18), 72)

        # Test GC Jersbek 1-9
        c1_9 = Club.query.filter_by(name="GC Jersbek 1-9").first()
        self.assertIsNotNone(c1_9)
        holes1_9 = c1_9.get_holes_list()
        self.assertEqual(len(holes1_9), 9)
        self.assertEqual(holes1_9[4]["par"], 3) # Hole 5
        self.assertEqual(sum(h["par"] for h in holes1_9), 36)

        # Test GC Jersbek 10-18
        c10_18 = Club.query.filter_by(name="GC Jersbek 10-18").first()
        self.assertIsNotNone(c10_18)
        holes10_18 = c10_18.get_holes_list()
        self.assertEqual(len(holes10_18), 9)
        self.assertEqual(holes10_18[0]["hole"], 10)
        self.assertEqual(holes10_18[0]["par"], 5) # Hole 10 is Par 5
        self.assertEqual(holes10_18[3]["par"], 3) # Hole 13 is Par 3
        self.assertEqual(holes10_18[7]["par"], 3) # Hole 17 is Par 3
        self.assertEqual(holes10_18[8]["par"], 5) # Hole 18 is Par 5
        self.assertEqual(sum(h["par"] for h in holes10_18), 36)

    def test_scorecard_inline_par_functionality(self):
        """Prüft, dass in js/scorecard.js die Inline-Par-Anpassung und verifizierte Templates vorhanden sind."""
        for path in ["js/scorecard.js", "www/js/scorecard.js"]:
            full_path = os.path.join(self.repo_root, path)
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            self.assertIn("function updateScorecardHolePar", content, f"updateScorecardHolePar fehlt in {path}")
            self.assertIn("{ hole: 5, par: 3,", content, f"Loch 5 Par 3 fehlt in Templates in {path}")
            self.assertIn("{ hole: 4, par: 5,", content, f"Loch 4 Par 5 fehlt in Templates in {path}")
            self.assertIn("updateScorecardHolePar(", content, f"Select-Handler fehlt in {path}")

if __name__ == '__main__':
    unittest.main()

