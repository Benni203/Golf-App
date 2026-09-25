import unittest
import json
from app import app, db, User, Club, Turnier, Runde, FavoriteClub, Friendship, TournamentRegistration, Flight, Scorecard, calculate_distance_km, generate_gps_audit_token, calculate_whs_hcp

class FeatureIntegrationTests(unittest.TestCase):
    def _cleanup(self):
        test_usernames = ["admin_test", "golfer_max", "golfer_anna", "to_delete_user"]
        test_users = User.query.filter(User.username.in_(test_usernames)).all()
        user_ids = [u.id for u in test_users]
        if user_ids:
            Friendship.query.filter((Friendship.user_id.in_(user_ids)) | (Friendship.friend_id.in_(user_ids))).delete(synchronize_session=False)
            FavoriteClub.query.filter(FavoriteClub.user_id.in_(user_ids)).delete(synchronize_session=False)
            TournamentRegistration.query.filter(TournamentRegistration.user_id.in_(user_ids)).delete(synchronize_session=False)
            Scorecard.query.filter(Scorecard.user_id.in_(user_ids)).delete(synchronize_session=False)
            Flight.query.filter(Flight.created_by_user_id.in_(user_ids)).delete(synchronize_session=False)
            User.query.filter(User.id.in_(user_ids)).delete(synchronize_session=False)
            db.session.commit()

    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

        self._cleanup()

        # Erstelle Test-Nutzer: Admin und Standard-Nutzer
        self.admin_user = User(
            username="admin_test",
            email="admin@test.de",
            password_hash="dummyhash",
            api_token="token_admin_test_123",
            is_admin=True
        )
        self.normal_user = User(
            username="golfer_max",
            email="max@test.de",
            password_hash="dummyhash",
            api_token="token_max_test_123",
            is_admin=False
        )
        self.second_user = User(
            username="golfer_anna",
            email="anna@test.de",
            password_hash="dummyhash",
            api_token="token_anna_test_123",
            is_admin=False
        )

        db.session.add_all([self.admin_user, self.normal_user, self.second_user])
        db.session.commit()

    def tearDown(self):
        self._cleanup()
        self.ctx.pop()

    def test_admin_user_management(self):
        """Testet Admin-Abruf, Löschen von Nutzern und Rollenumschaltung."""
        # 1. Normaler User darf Admin-Bereich nicht abrufen
        res_forbidden = self.client.get('/api/admin/users', headers={'Authorization': f'Bearer {self.normal_user.api_token}'})
        self.assertEqual(res_forbidden.status_code, 403)

        # 2. Admin darf alle Nutzer abrufen
        res_admin = self.client.get('/api/admin/users', headers={'Authorization': f'Bearer {self.admin_user.api_token}'})
        self.assertEqual(res_admin.status_code, 200)
        users = res_admin.get_json()
        self.assertTrue(any(u['username'] == 'golfer_max' for u in users))

        # 3. Admin kann Admin-Rolle für User umschalten
        res_toggle = self.client.post(
            f'/api/admin/users/{self.normal_user.id}/toggle-admin',
            headers={'Authorization': f'Bearer {self.admin_user.api_token}'}
        )
        self.assertEqual(res_toggle.status_code, 200)
        self.assertTrue(res_toggle.get_json()['user']['is_admin'])

        # 4. Admin kann User anlegen und löschen
        user_to_delete = User(username="to_delete_user", email="del@test.de", password_hash="dummy", is_admin=False)
        db.session.add(user_to_delete)
        db.session.commit()

        res_del = self.client.delete(
            f'/api/admin/users/{user_to_delete.id}',
            headers={'Authorization': f'Bearer {self.admin_user.api_token}'}
        )
        self.assertEqual(res_del.status_code, 200)
        self.assertIsNone(db.session.get(User, user_to_delete.id))

    def test_club_favorites(self):
        """Testet das Hinzufügen und Entfernen von Golfclub-Favoriten."""
        headers = {'Authorization': f'Bearer {self.normal_user.api_token}'}

        # 1. Zu Favoriten hinzufügen
        res_add = self.client.post('/api/favorites/clubs/GC Gut Sachsenwald 18', headers=headers)
        self.assertEqual(res_add.status_code, 200)
        self.assertTrue(res_add.get_json()['is_favorite'])
        self.assertIn("GC Gut Sachsenwald 18", res_add.get_json()['favorites'])

        # 2. Favoriten abrufen
        res_get = self.client.get('/api/favorites/clubs', headers=headers)
        self.assertEqual(res_get.status_code, 200)
        self.assertIn("GC Gut Sachsenwald 18", res_get.get_json())

        # 3. Aus Favoriten entfernen (Toggle)
        res_remove = self.client.post('/api/favorites/clubs/GC Gut Sachsenwald 18', headers=headers)
        self.assertEqual(res_remove.status_code, 200)
        self.assertFalse(res_remove.get_json()['is_favorite'])
        self.assertNotIn("GC Gut Sachsenwald 18", res_remove.get_json()['favorites'])

    def test_friends_and_leaderboard(self):
        """Testet Freundschaftsanfragen, Annahme und Bestenliste."""
        headers_max = {'Authorization': f'Bearer {self.normal_user.api_token}'}
        headers_anna = {'Authorization': f'Bearer {self.second_user.api_token}'}

        # 1. Max sendet Anfrage an Anna
        res_req = self.client.post('/api/friends/request', headers=headers_max, json={'identifier': 'golfer_anna'})
        self.assertEqual(res_req.status_code, 201)

        # 2. Anna sieht ausstehende Anfrage
        res_anna_friends = self.client.get('/api/friends', headers=headers_anna)
        self.assertEqual(res_anna_friends.status_code, 200)
        pending = res_anna_friends.get_json()['pending_received']
        self.assertTrue(any(p['username'] == 'golfer_max' for p in pending))
        req_id = pending[0]['request_id']

        # 3. Anna nimmt Anfrage an
        res_accept = self.client.post('/api/friends/respond', headers=headers_anna, json={'request_id': req_id, 'action': 'accept'})
        self.assertEqual(res_accept.status_code, 200)

        # 4. Beide sind nun befreundet
        res_friends_now = self.client.get('/api/friends', headers=headers_max)
        self.assertEqual(len(res_friends_now.get_json()['friends']), 1)
        self.assertEqual(res_friends_now.get_json()['friends'][0]['username'], 'golfer_anna')

        # 5. Leaderboard Abruf
        res_lead = self.client.get('/api/leaderboard?scope=friends', headers=headers_max)
        self.assertEqual(res_lead.status_code, 200)
        lead_data = res_lead.get_json()
        self.assertGreaterEqual(len(lead_data), 2)

    def test_tournament_registration_and_flight_planning(self):
        """Testet die Anmeldung zu einem Turnier mit automatischer Flight-Einteilung."""
        headers = {'Authorization': f'Bearer {self.normal_user.api_token}'}
        turnier = Turnier.query.first()
        self.assertIsNotNone(turnier)

        # 1. Anmelden
        res_reg = self.client.post(f'/api/turniere/{turnier.id}/register', headers=headers, json={'handicap_index': 18.5})
        self.assertIn(res_reg.status_code, [200, 201])
        reg_info = res_reg.get_json()['registration']
        self.assertEqual(reg_info['username'], 'golfer_max')
        self.assertGreaterEqual(reg_info['flight_number'], 1)

        # 2. Teilnehmerliste abrufen
        res_part = self.client.get(f'/api/turniere/{turnier.id}/participants')
        self.assertEqual(res_part.status_code, 200)
        participants = res_part.get_json()
        self.assertTrue(any(p['username'] == 'golfer_max' for p in participants))

    def test_scorecard_signatures_gps_and_pccaddy_export(self):
        """Testet die digitale Scorekarte mit Signaturen, GPS-Abstand und PC CADDIE CSV Export."""
        headers = {'Authorization': f'Bearer {self.normal_user.api_token}'}

        # Falkenstein Koordinaten: 53.5702, 9.7712
        card_payload = {
            "club_name": "Hamburger GC Falkenstein",
            "datum": "04.10.2026",
            "loecher": 18,
            "course_rating": 72.8,
            "slope_rating": 133.0,
            "par": 71.0,
            "playing_hcp": 20,
            "handicap_index": 17.8,
            "brutto": 89,
            "netto": 69,
            "stableford": 39,
            "holes": [
                {"hole": 1, "par": 4, "si": 7, "gross": 5, "net": 4, "points": 2},
                {"hole": 2, "par": 3, "si": 15, "gross": 3, "net": 2, "points": 3}
            ],
            "player_signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "marker_signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "marker_name": "Dr. Markus Zähler",
            "gps_latitude": 53.5705, # ~30 Meter vom Club entfernt
            "gps_longitude": 9.7715,
            "save_as_round": True
        }

        # 1. Scorekarte speichern
        res_card = self.client.post('/api/scorecards', headers=headers, json=card_payload)
        self.assertEqual(res_card.status_code, 201)
        data = res_card.get_json()
        self.assertTrue(data['gps_verified'], "GPS-Standort sollte als verifiziert erkannt werden!")
        self.assertLess(data['gps_distance_km'], 0.5)

        card_id = data['scorecard']['id']

        # 2. Scorekarte JSON abrufen
        res_get = self.client.get(f'/api/scorecards/{card_id}')
        self.assertEqual(res_get.status_code, 200)
        self.assertTrue(res_get.get_json()['has_player_signature'])
        self.assertTrue(res_get.get_json()['has_marker_signature'])

        # 3. PC CADDIE CSV Export abrufen
        res_csv = self.client.get(f'/api/scorecards/{card_id}/pccaddy.csv')
        self.assertEqual(res_csv.status_code, 200)
        self.assertIn("text/csv", res_csv.content_type)
        csv_text = res_csv.get_data(as_text=True)
        self.assertIn("PCC_SCORECARD_v2", csv_text)
        self.assertIn("Hamburger GC Falkenstein", csv_text)
        self.assertIn("Dr. Markus Zähler", csv_text)
        self.assertIn("JA", csv_text)

    def test_live_flight_creation_and_scoring(self):
        """Testet das Erstellen eines Live-Flights und das Eintragen von Loch-Scores."""
        headers = {'Authorization': f'Bearer {self.normal_user.api_token}'}

        # 1. Flight erstellen
        res_flight = self.client.post('/api/flights', headers=headers, json={
            "club_name": "GC Escheburg 18",
            "name": "Herren-Vierer Flight A"
        })
        self.assertEqual(res_flight.status_code, 201)
        flight_data = res_flight.get_json()['flight']
        flight_code = flight_data['flight_code']

        # 2. Score für Loch 1 eintragen
        res_score = self.client.post(f'/api/flights/{flight_code}/score', headers=headers, json={
            "hole": 1,
            "player_name": "golfer_max",
            "gross": 4,
            "net": 3,
            "points": 3
        })
        self.assertEqual(res_score.status_code, 200)
        scores = res_score.get_json()['scores']
        self.assertEqual(scores['1']['golfer_max']['gross'], 4)

        # 3. Flight abrufen
        res_get = self.client.get(f'/api/flights/{flight_code}')
        self.assertEqual(res_get.status_code, 200)
        self.assertIn('golfer_max', res_get.get_json()['scores']['1'])

if __name__ == '__main__':
    unittest.main()
