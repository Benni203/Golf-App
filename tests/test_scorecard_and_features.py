import unittest
import json
from werkzeug.security import generate_password_hash
from app import app, db, User, Scorecard, Club

class ScorecardAndFeaturesTests(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

        # Clean up any previous test user
        User.query.filter_by(username="scorecard_pro_user").delete()
        db.session.commit()

        self.user = User(
            username="scorecard_pro_user",
            email="scorecard_pro@golf.de",
            api_token="token_scorecard_pro_test"
        )
        self.user.password_hash = generate_password_hash("GolfSecret2026!")
        db.session.add(self.user)
        db.session.commit()

        self.auth_headers = {
            "Authorization": f"Bearer {self.user.api_token}",
            "Content-Type": "application/json"
        }

    def tearDown(self):
        Scorecard.query.filter_by(user_id=self.user.id).delete()
        User.query.filter_by(id=self.user.id).delete()
        db.session.commit()
        self.ctx.pop()

    def test_create_and_get_scorecard_with_tee_and_signatures(self):
        """Testet das Erstellen und Abrufen einer DGV-Scorekarte mit Abschlag Rot/Gelb und Touch-Signaturen."""
        payload = {
            "club_name": "GC Jersbek 18",
            "datum": "03.10.2026",
            "loecher": 18,
            "tee": "rot",
            "course_rating": 73.2,
            "slope_rating": 135.0,
            "par": 72.0,
            "playing_hcp": 28,
            "handicap_index": 24.5,
            "brutto": 92,
            "netto": 64,
            "stableford": 44,
            "holes": [
                {"hole": 1, "par": 4, "si": 13, "meters": 308, "gross": 4, "netto": 3, "stableford": 3},
                {"hole": 2, "par": 4, "si": 1, "meters": 374, "gross": 5, "netto": 3, "stableford": 3}
            ],
            "player_signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "marker_signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "marker_name": "Max Mustermann (Zähler)",
            "save_as_round": False
        }

        # 1. Scorekarte erstellen
        res = self.client.post('/api/scorecards', data=json.dumps(payload), headers=self.auth_headers)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn("scorecard", data)
        card_id = data["scorecard"]["id"]
        self.assertEqual(data["scorecard"]["tee"], "rot")
        self.assertTrue(data["scorecard"]["has_player_signature"])
        self.assertTrue(data["scorecard"]["has_marker_signature"])
        self.assertIn("data:image/png", data["scorecard"]["player_signature"])

        # 2. Scorekarte nach ID abrufen
        res_get = self.client.get(f'/api/scorecards/{card_id}', headers=self.auth_headers)
        self.assertEqual(res_get.status_code, 200)
        card_data = res_get.get_json()
        self.assertEqual(card_data["club_name"], "GC Jersbek 18")
        self.assertEqual(card_data["tee"], "rot")
        self.assertEqual(card_data["marker_name"], "Max Mustermann (Zähler)")

        # 3. Liste aller Scorekarten des Nutzers abrufen
        res_list = self.client.get('/api/scorecards', headers=self.auth_headers)
        self.assertEqual(res_list.status_code, 200)
        list_data = res_list.get_json()
        self.assertIn("scorecards", list_data)
        self.assertGreaterEqual(len(list_data["scorecards"]), 1)
        self.assertEqual(list_data["scorecards"][0]["id"], card_id)

        # 4. PC CADDIE CSV Export abrufen
        res_csv = self.client.get(f'/api/scorecards/{card_id}/pccaddy.csv', headers=self.auth_headers)
        self.assertEqual(res_csv.status_code, 200)
        self.assertIn("PCC_SCORECARD_v2", res_csv.get_data(as_text=True))
        self.assertIn("GC Jersbek 18", res_csv.get_data(as_text=True))

    def test_scorecard_gps_verification(self):
        """Testet die automatische GPS-Verifikation bei Standortnähe zum Club."""
        jersbek = Club.query.filter_by(name="GC Jersbek 18").first()
        if not jersbek or jersbek.lat is None:
            self.skipTest("GC Jersbek 18 Koordinaten nicht in Test-DB")

        # Genau auf den Club-Koordinaten einreichen
        payload = {
            "club_name": "GC Jersbek 18",
            "datum": "03.10.2026",
            "loecher": 18,
            "tee": "gelb",
            "brutto": 88,
            "gps_latitude": jersbek.lat,
            "gps_longitude": jersbek.lon,
            "save_as_round": False
        }

        res = self.client.post('/api/scorecards', data=json.dumps(payload), headers=self.auth_headers)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data.get("gps_verified"))
        self.assertIsNotNone(data["scorecard"].get("gps_audit_token"))

if __name__ == '__main__':
    unittest.main()
