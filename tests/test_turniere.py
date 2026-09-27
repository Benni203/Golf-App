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
    def test_get_club_turniere_by_id_endpoint(self):
        """Prüft, dass /api/clubs/<id>/turniere für jeden Club genau dessen Turniere liefert."""
        clubs = Club.query.all()
        self.assertGreaterEqual(len(clubs), 38)
        for club in clubs:
            res = self.client.get(f'/api/clubs/{club.id}/turniere')
            self.assertEqual(res.status_code, 200, f"Fehler bei /api/clubs/{club.id}/turniere")
            data = res.get_json()
            turniere_list = data.get('turniere') if isinstance(data, dict) else data
            self.assertIsInstance(turniere_list, list)
            for t in turniere_list:
                self.assertEqual(t['club_name'], club.name, f"Turnier '{t['name']}' gehört nicht zu Club '{club.name}'")
                if t.get('club_id'):
                    self.assertEqual(t['club_id'], club.id)

    def test_every_katalog_club_has_turniere(self):
        """Stellt sicher, dass alle 38 Katalog-Clubs mindestens 1 Turnier haben."""
        for c in KATALOG_CLUBS:
            club_name = c['name']
            matching = [t for t in KATALOG_TURNIERE if t.get('club_name') == club_name]
            self.assertGreater(
                len(matching),
                0,
                f"Katalog-Club '{club_name}' hat kein einziges Turnier im Katalog hinterlegt!"
            )

    def test_nine_hole_clubs_have_only_nine_hole_turniere(self):
        """Prüft, dass reine 9-Loch Plätze nur 9-Loch Turniere austragen."""
        clubs = Club.query.all()
        for club in clubs:
            has_18 = bool(club.par18 and str(club.par18).strip())
            has_9 = bool(club.par9 and str(club.par9).strip())
            if not has_18 and has_9:
                turniere = club.turniere
                self.assertGreater(len(turniere), 0, f"Reiner 9-Loch Club '{club.name}' sollte Turniere haben")
                for t in turniere:
                    self.assertEqual(
                        t.loecher, 9,
                        f"Reiner 9-Loch Club '{club.name}' darf kein {t.loecher}-Loch Turnier '{t.name}' haben!"
                    )

    def test_club_holes_data_integrity(self):
        """Validiert die Par-Summe, Lochanzahl und Stroke Index Regeln (DGV odd/even) für jeden Club."""
        clubs = Club.query.all()
        for club in clubs:
            holes = club.get_holes_list()
            has_18 = bool(club.par18 and str(club.par18).strip())
            has_9 = bool(club.par9 and str(club.par9).strip())

            if has_18:
                self.assertEqual(len(holes), 18, f"Club '{club.name}' mit Par18 muss 18 Löcher haben")
                expected_par = int(round(float(club.par18)))
                actual_par = sum(h['par'] for h in holes)
                self.assertEqual(
                    actual_par, expected_par,
                    f"Club '{club.name}': Par-Summe {actual_par} weicht von Par18 {expected_par} ab!"
                )
                sis = [h['si'] for h in holes]
                self.assertEqual(sorted(sis), list(range(1, 19)), f"Club '{club.name}': SIs müssen 1..18 ohne Duplikate sein")
                # DGV Regel: Front 9 ungerade SIs, Back 9 gerade SIs
                front_sis = [h['si'] for h in holes[:9]]
                back_sis = [h['si'] for h in holes[9:]]
                for si in front_sis:
                    self.assertEqual(si % 2, 1, f"Club '{club.name}' Front 9 SI {si} muss ungerade sein")
                for si in back_sis:
                    self.assertEqual(si % 2, 0, f"Club '{club.name}' Back 9 SI {si} muss gerade sein")
            elif has_9:
                self.assertEqual(len(holes), 9, f"Club '{club.name}' ohne Par18 muss genau 9 Löcher haben")
                expected_par = int(round(float(club.par9)))
                actual_par = sum(h['par'] for h in holes)
                self.assertEqual(
                    actual_par, expected_par,
                    f"Club '{club.name}': 9-Loch Par-Summe {actual_par} weicht von Par9 {expected_par} ab!"
                )
                sis = [h['si'] for h in holes]
                self.assertEqual(sorted(sis), list(range(1, 10)), f"Club '{club.name}': 9-Loch SIs müssen 1..9 sein")

    def test_api_turniere_filtering(self):
        """Testet die Filterung von /api/turniere nach club_id und club / club_name."""
        test_club = Club.query.first()
        self.assertIsNotNone(test_club)

        # Filter by club_id
        res_id = self.client.get(f'/api/turniere?club_id={test_club.id}')
        self.assertEqual(res_id.status_code, 200)
        data_id = res_id.get_json()
        for t in data_id:
            self.assertEqual(t['club_name'], test_club.name)

        # Filter by club_name
        res_name = self.client.get(f'/api/turniere?club={test_club.name}')
        self.assertEqual(res_name.status_code, 200)
        data_name = res_name.get_json()
        for t in data_name:
            self.assertEqual(t['club_name'], test_club.name)

if __name__ == '__main__':
    unittest.main()

