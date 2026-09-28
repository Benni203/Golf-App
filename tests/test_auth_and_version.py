import unittest
import json
from app import app, db, User, Club, APP_VERSION

class AuthAndVersionTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        with self.app.app_context():
            # Clean up test entities if any exist
            User.query.filter(User.username.in_(['test_auth_user', 'change_pw_user'])).delete()
            Club.query.filter_by(name='Test Custom Club Bearbeitet').delete()
            Club.query.filter_by(name='Test Custom Club').delete()
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            User.query.filter(User.username.in_(['test_auth_user', 'change_pw_user'])).delete()
            Club.query.filter_by(name='Test Custom Club Bearbeitet').delete()
            Club.query.filter_by(name='Test Custom Club').delete()
            db.session.commit()

    def test_version_endpoint(self):
        """Testet den neuen Versionierungs-Endpoint GET /api/version."""
        res = self.client.get('/api/version')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('version'), APP_VERSION)
        self.assertEqual(data.get('version'), "1.2.0")
        self.assertIn('name', data)
        self.assertIn('release_date', data)
        self.assertTrue(len(data.get('features', [])) > 0)

    def test_full_auth_lifecycle(self):
        """Testet den vollständigen Auth-Lebenszyklus: Register -> Logout -> Re-Login mit Username & Email."""
        # 1. Registrieren
        reg_res = self.client.post('/api/register', json={
            'username': 'test_auth_user',
            'email': 'auth_user@example.com',
            'password': 'SicheresPasswort123!'
        })
        self.assertEqual(reg_res.status_code, 201)
        token = reg_res.get_json()['token']
        self.assertTrue(bool(token))

        # 2. Token-Verifikation über /api/me
        me_res = self.client.get('/api/me', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.get_json()['user']['username'], 'test_auth_user')

        # 3. Abmelden
        logout_res = self.client.post('/api/logout', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(logout_res.status_code, 200)

        # 4. Alter Token ist nach Logout ungültig
        me_after_logout = self.client.get('/api/me', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(me_after_logout.status_code, 401)

        # 5. Erneuter Login mit Benutzername
        login_user_res = self.client.post('/api/login', json={
            'identifier': 'test_auth_user',
            'password': 'SicheresPasswort123!'
        })
        self.assertEqual(login_user_res.status_code, 200)
        new_token = login_user_res.get_json()['token']
        self.assertTrue(bool(new_token))

        # 6. Erneuter Login mit E-Mail (Groß-/Kleinschreibung)
        login_email_res = self.client.post('/api/login', json={
            'identifier': 'AUTH_USER@EXAMPLE.COM',
            'password': 'SicheresPasswort123!'
        })
        self.assertEqual(login_email_res.status_code, 200)

        # 7. Login mit falschem Passwort schlägt fehl
        login_fail_res = self.client.post('/api/login', json={
            'identifier': 'test_auth_user',
            'password': 'FalschesPasswort'
        })
        self.assertEqual(login_fail_res.status_code, 401)
        self.assertIn('fehler', login_fail_res.get_json())

    def test_change_password_endpoint(self):
        """Testet die direkte Passwortänderung für angemeldete Nutzer."""
        # Registrieren
        reg_res = self.client.post('/api/register', json={
            'username': 'change_pw_user',
            'email': 'changepw@example.com',
            'password': 'OldPassword123!'
        })
        self.assertEqual(reg_res.status_code, 201)
        token = reg_res.get_json()['token']

        # Falsches altes Passwort -> Fehler 400
        fail_res = self.client.post('/api/user/change-password', 
            headers={'Authorization': f'Bearer {token}'},
            json={'old_password': 'WrongOldPassword', 'new_password': 'NewPassword456!'}
        )
        self.assertEqual(fail_res.status_code, 400)

        # Richtiges altes Passwort -> Erfolg 200
        ok_res = self.client.post('/api/user/change-password', 
            headers={'Authorization': f'Bearer {token}'},
            json={'old_password': 'OldPassword123!', 'new_password': 'NewPassword456!'}
        )
        self.assertEqual(ok_res.status_code, 200)

        # Login mit neuem Passwort funktioniert
        login_new = self.client.post('/api/login', json={
            'identifier': 'change_pw_user',
            'password': 'NewPassword456!'
        })
        self.assertEqual(login_new.status_code, 200)

    def test_update_custom_club(self):
        """Testet das Bearbeiten benutzerdefinierter Clubs via PUT /api/clubs/<id>."""
        reg_res = self.client.post('/api/register', json={
            'username': 'test_auth_user',
            'email': 'auth_user@example.com',
            'password': 'Password123!'
        })
        token = reg_res.get_json()['token']

        # Club anlegen
        create_res = self.client.post('/api/clubs',
            headers={'Authorization': f'Bearer {token}'},
            json={'name': 'Test Custom Club', 'region': 'Hamburg & Umland', 'par18': 72.0}
        )
        self.assertEqual(create_res.status_code, 201)
        club_id = create_res.get_json()['club']['id']

        # Club aktualisieren via PUT
        update_res = self.client.put(f'/api/clubs/{club_id}',
            headers={'Authorization': f'Bearer {token}'},
            json={'name': 'Test Custom Club Bearbeitet', 'region': 'Schleswig-Holstein', 'par18': 71.0}
        )
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.get_json()['club']['name'], 'Test Custom Club Bearbeitet')
        self.assertEqual(update_res.get_json()['club']['region'], 'Schleswig-Holstein')

if __name__ == '__main__':
    unittest.main()
