import unittest
from datetime import datetime
from app import app, db, User, Club, Turnier, KATALOG_CLUBS, KATALOG_TURNIERE

class TournamentDataValidationTests(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    def test_katalog_turniere_club_references_exist(self):
        """Prüft, dass jeder Club in KATALOG_TURNIERE tatsächlich im Clubkatalog existiert."""
        club_names = {c['name'] for c in KATALOG_CLUBS}
        for t in KATALOG_TURNIERE:
            club_name = t.get('club_name')
            self.assertIn(
                club_name,
                club_names,
                f"Turnier '{t.get('name')}' verweist auf unbekannten Club '{club_name}'"
            )

    def test_katalog_turniere_valid_date_format(self):
        """Prüft, dass jedes Datum in KATALOG_TURNIERE ein valides deutsches Kalenderdatum (DD.MM.YYYY) ist."""
        for t in KATALOG_TURNIERE:
            datum_str = t.get('datum')
            self.assertTrue(datum_str, f"Turnier '{t.get('name')}' hat kein Datum")
            try:
                dt = datetime.strptime(datum_str, '%d.%m.%Y')
                self.assertGreaterEqual(dt.year, 2026, f"Datum {datum_str} sollte ab 2026 liegen")
            except ValueError:
                self.fail(f"Turnier '{t.get('name')}' hat ungültiges Datumsformat '{datum_str}', erwartet 'DD.MM.YYYY'")

    def test_katalog_turniere_valid_loecher(self):
        """Prüft, dass die Lochanzahl entweder 9 oder 18 ist."""
        for t in KATALOG_TURNIERE:
            loecher = t.get('loecher')
            self.assertIn(loecher, [9, 18], f"Turnier '{t.get('name')}' hat ungültige Lochanzahl: {loecher}")

    def test_katalog_turniere_vorgabewirksam_rules(self):
        """Prüft, dass Team-Spielformen (wie Vierer, Chapman-Vierer, Scramble) niemals vorgabewirksam sind."""
        for t in KATALOG_TURNIERE:
            spielform = t.get('spielform', '').lower()
            vorgabewirksam = t.get('vorgabewirksam')
            if 'vierer' in spielform or 'scramble' in spielform:
                self.assertFalse(
                    vorgabewirksam,
                    f"Team-Turnier '{t.get('name')}' mit Spielform '{t.get('spielform')}' darf laut WHS/DGV nicht vorgabewirksam sein!"
                )

    def test_turniere_api_get_and_post(self):
        """Testet das Abrufen und Anlegen von Turnieren über die REST-API."""
        # 1. Turniere abrufen
        res = self.client.get('/api/turniere')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), len(KATALOG_TURNIERE))

        # 2. Neues Turnier via API anlegen
        new_turnier_data = {
            "club_name": "GC Gut Sachsenwald 18",
            "name": "Test Herbstpokal 2026",
            "datum": "31.10.2026",
            "loecher": 18,
            "spielform": "Stableford",
            "vorgabewirksam": True
        }
        res_create = self.client.post('/api/turniere', json=new_turnier_data)
        self.assertEqual(res_create.status_code, 201)
        created = res_create.get_json().get('turnier')
        self.assertEqual(created['name'], "Test Herbstpokal 2026")

        # 3. Löschen
        turnier_id = created['id']
        res_del = self.client.delete(f'/api/turniere/{turnier_id}')
        self.assertEqual(res_del.status_code, 200)

if __name__ == '__main__':
    unittest.main()
