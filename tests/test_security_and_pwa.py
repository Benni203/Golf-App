import unittest
import json
from app import app, db, User, Runde, Scorecard, Friendship

class SecurityAndPwaTests(unittest.TestCase):
    def _cleanup(self):
        usernames = ["sec_test_user", "sec_friend_user"]
        users = User.query.filter(User.username.in_(usernames)).all()
        u_ids = [u.id for u in users]
        if u_ids:
            Friendship.query.filter((Friendship.user_id.in_(u_ids)) | (Friendship.friend_id.in_(u_ids))).delete(synchronize_session=False)
            Scorecard.query.filter(Scorecard.user_id.in_(u_ids)).delete(synchronize_session=False)
            Runde.query.filter(Runde.user_id.in_(u_ids)).delete(synchronize_session=False)
            User.query.filter(User.id.in_(u_ids)).delete(synchronize_session=False)
            db.session.commit()

    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

        self._cleanup()

        self.user = User(
            username="sec_test_user",
            email="sec@test.de",
            password_hash="pbkdf2:sha256:dummy",
            api_token="token_sec_123"
        )
        self.user.password_hash = "scrypt:32768:8:1$dummy"  # placeholder
        from werkzeug.security import generate_password_hash
        self.user.password_hash = generate_password_hash("SecretPassword123!")

        db.session.add(self.user)
        db.session.commit()

    def tearDown(self):
        self._cleanup()
        self.ctx.pop()

    def test_security_headers_present(self):
        """Prüft, ob alle sicherheitsrelevanten HTTP-Header ausgeliefert werden."""
        res = self.client.get('/api/turniere')
        self.assertEqual(res.headers.get('X-Content-Type-Options'), 'nosniff')
        self.assertEqual(res.headers.get('X-Frame-Options'), 'SAMEORIGIN')
        self.assertEqual(res.headers.get('X-XSS-Protection'), '1; mode=block')
        self.assertEqual(res.headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin')
        self.assertIn('geolocation=(self)', res.headers.get('Permissions-Policy', ''))

    def test_pwa_files_served(self):
        """Prüft, ob sw.js und manifest.webmanifest mit korrekten Headern ausgeliefert werden."""
        res_sw = self.client.get('/sw.js')
        self.assertEqual(res_sw.status_code, 200)
        self.assertIn('javascript', res_sw.content_type)
        res_sw.close()

        res_manifest = self.client.get('/manifest.webmanifest')
        self.assertEqual(res_manifest.status_code, 200)
        manifest_data = res_manifest.get_json()
        self.assertEqual(manifest_data['short_name'], 'BirdieTrack')
        self.assertEqual(manifest_data['display'], 'standalone')
        res_manifest.close()

    def test_gdpr_data_export(self):
        """Art. 20 DSGVO: Datenexport liefert vollständige strukturierte JSON-Daten."""
        headers = {'Authorization': f'Bearer {self.user.api_token}'}

        # Runde anlegen
        r = Runde(user_id=self.user.id, datum="20.08.2026", club_name="Hamburger GC Falkenstein", loecher=18, brutto=82, sd=8.5)
        db.session.add(r)
        db.session.commit()

        res = self.client.get('/api/user/export-data', headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertIn('attachment', res.headers.get('Content-Disposition', ''))
        data = res.get_json()

        self.assertEqual(data['export_metadata']['username'], 'sec_test_user')
        self.assertEqual(len(data['rounds']), 1)
        self.assertEqual(data['rounds'][0]['club_name'], 'Hamburger GC Falkenstein')

    def test_gdpr_account_self_deletion(self):
        """Art. 17 DSGVO: Benutzer kann sein Konto mit Passwort verifizieren und dauerhaft löschen."""
        headers = {'Authorization': f'Bearer {self.user.api_token}'}

        # 1. Falsches Passwort schlägt fehl
        res_fail = self.client.delete('/api/user/account', headers=headers, json={'password': 'WrongPassword!'})
        self.assertEqual(res_fail.status_code, 403)
        self.assertIsNotNone(db.session.get(User, self.user.id))

        # 2. Richtiges Passwort löscht Account
        res_ok = self.client.delete('/api/user/account', headers=headers, json={'password': 'SecretPassword123!'})
        self.assertEqual(res_ok.status_code, 200)
        self.assertIsNone(db.session.get(User, self.user.id))

    def test_logout_token_invalidation(self):
        """Prüft, ob der Logout-Endpoint den aktiven Token invalidiert."""
        headers = {'Authorization': f'Bearer {self.user.api_token}'}
        res = self.client.post('/api/logout', headers=headers)
        self.assertEqual(res.status_code, 200)

        # Prüfe in DB
        u = db.session.get(User, self.user.id)
        self.assertIsNone(u.api_token)

    def test_pro_stats_calculation(self):
        """Testet die Berechnung von Putts, GIR und FIR auf Basis von Scorekarten."""
        headers = {'Authorization': f'Bearer {self.user.api_token}'}

        holes_data = [
            {"hole": 1, "par": 4, "gross": 4, "putts": 2, "fir": "hit", "gir": True},
            {"hole": 2, "par": 3, "gross": 3, "putts": 1, "fir": "na", "gir": True},
            {"hole": 3, "par": 5, "gross": 6, "putts": 3, "fir": "left", "gir": False},
            {"hole": 4, "par": 4, "gross": 5, "putts": 2, "fir": "right", "gir": False}
        ]
        sc = Scorecard(
            user_id=self.user.id,
            club_name="GC Gut Sachsenwald",
            datum="25.09.2026",
            loecher=18,
            brutto=18,
            netto=16,
            stableford=10,
            holes_json=json.dumps(holes_data)
        )
        db.session.add(sc)
        db.session.commit()

        res = self.client.get('/api/user/pro-stats', headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data['total_scorecards'], 1)
        self.assertEqual(data['avg_putts_per_hole'], 2.0)
        self.assertEqual(data['total_gir'], 2)
        self.assertEqual(data['gir_percentage'], 50.0)
        self.assertEqual(data['total_fir'], 1)
        self.assertEqual(data['fir_miss_left'], 1)
        self.assertEqual(data['fir_miss_right'], 1)
