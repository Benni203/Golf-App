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

    def test_parse_pccaddy_turniere_ics(self):
        """Testet das Parsen von iCalendar (.ics) Exporten aus PC CADDIE."""
        from app import parse_pccaddy_turniere

        ics_sample = """BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PC CADDIE//DE
BEGIN:VEVENT
UID:turnier-101@pccaddie
DTSTART:20261017T090000Z
SUMMARY:Mercedes-Benz After Work Golf Cup 9-Loch
DESCRIPTION:9 Löcher Stableford; vorgabewirksam: Ja; Start ab 17:00 Uhr
LOCATION:GC Escheburg
END:VEVENT
BEGIN:VEVENT
UID:turnier-102@pccaddie
DTSTART;VALUE=DATE:20261024
SUMMARY:Offener Monatsbecher Escheburg
DESCRIPTION:18 Löcher Einzel-Zählspiel
LOCATION:GC Escheburg
END:VEVENT
BEGIN:VEVENT
UID:turnier-103@pccaddie
DTSTART:2026-10-31
SUMMARY:Herbst Scramble 2er
DESCRIPTION:18 Löcher Scramble nicht vorgabewirksam
LOCATION:GC Escheburg
END:VEVENT
END:VCALENDAR"""

        parsed = parse_pccaddy_turniere(ics_sample, fallback_club_name="GC Escheburg")
        self.assertEqual(len(parsed), 3)

        # 1. 9-Loch Stableford
        t1 = parsed[0]
        self.assertEqual(t1['name'], "Mercedes-Benz After Work Golf Cup 9-Loch")
        self.assertEqual(t1['datum'], "17.10.2026")
        self.assertEqual(t1['loecher'], 9)
        self.assertEqual(t1['spielform'], "Stableford")
        self.assertTrue(t1['vorgabewirksam'])

        # 2. 18-Loch Zählspiel
        t2 = parsed[1]
        self.assertEqual(t2['name'], "Offener Monatsbecher Escheburg")
        self.assertEqual(t2['datum'], "24.10.2026")
        self.assertEqual(t2['loecher'], 18)
        self.assertEqual(t2['spielform'], "Zählspiel")
        self.assertTrue(t2['vorgabewirksam'])

        # 3. Scramble (nicht vorgabewirksam)
        t3 = parsed[2]
        self.assertEqual(t3['name'], "Herbst Scramble 2er")
        self.assertEqual(t3['datum'], "31.10.2026")
        self.assertEqual(t3['loecher'], 18)
        self.assertEqual(t3['spielform'], "Scramble")
        self.assertFalse(t3['vorgabewirksam'])

    def test_parse_pccaddy_turniere_csv(self):
        """Testet das Parsen von CSV Exporten aus PC CADDIE."""
        from app import parse_pccaddy_turniere

        csv_sample = """Datum;Turniername;Löcher;Spielform;Vorgabewirksam
15.10.2026;Tiger & Rabbit 9-Loch;9;Stableford;Ja
22.10.2026;Clubmeisterschaft Runde 1;18;Zählspiel;Ja
29.10.2026;Chapman-Vierer Clubpokal;18;Chapman-Vierer;Nein"""

        parsed = parse_pccaddy_turniere(csv_sample, fallback_club_name="GC Gut Sachsenwald 18")
        self.assertEqual(len(parsed), 3)

        self.assertEqual(parsed[0]['name'], "Tiger & Rabbit 9-Loch")
        self.assertEqual(parsed[0]['datum'], "15.10.2026")
        self.assertEqual(parsed[0]['loecher'], 9)
        self.assertEqual(parsed[0]['spielform'], "Stableford")
        self.assertTrue(parsed[0]['vorgabewirksam'])

        self.assertEqual(parsed[1]['name'], "Clubmeisterschaft Runde 1")
        self.assertEqual(parsed[1]['loecher'], 18)
        self.assertEqual(parsed[1]['spielform'], "Zählspiel")
        self.assertTrue(parsed[1]['vorgabewirksam'])

        self.assertEqual(parsed[2]['name'], "Chapman-Vierer Clubpokal")
        self.assertEqual(parsed[2]['loecher'], 18)
        self.assertEqual(parsed[2]['spielform'], "Chapman-Vierer")
        self.assertFalse(parsed[2]['vorgabewirksam'])

    def test_import_club_turniere_pccaddy_endpoint(self):
        """Testet den POST /api/clubs/<id>/import-pccaddy Endpunkt."""
        test_club = Club(
            name="Test Neunloch GC",
            par18=None,
            cr18=None,
            sr18=None,
            par9=36.0,
            cr9=35.5,
            sr9=125.0
        )
        db.session.add(test_club)
        db.session.commit()

        try:
            # Reiner 9-Loch Club: Ein 18-Loch Turnier im Input muss automatisch auf 9 Löcher beschränkt werden!
            ics_payload = {
                "content": """BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20261105
SUMMARY:Test Imported Tournament 18L
DESCRIPTION:Wurde irrtümlich als 18L exportiert
LOCATION:Test Neunloch GC
END:VEVENT
END:VCALENDAR""",
                "replace_existing": True
            }

            res = self.client.post(f'/api/clubs/{test_club.id}/import-pccaddy', json=ics_payload)
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertEqual(data['count'], 1)
            imported = data['turniere'][0]
            self.assertEqual(imported['name'], "Test Imported Tournament 18L")
            self.assertEqual(imported['datum'], "05.11.2026")
            # Bei einem reinen 9-Loch Club muss loecher=9 erzwungen werden!
            self.assertEqual(imported['loecher'], 9)

            # Prüfen in Datenbank
            db_turnier = Turnier.query.filter_by(club_name=test_club.name, name="Test Imported Tournament 18L").first()
            self.assertIsNotNone(db_turnier)
            self.assertEqual(db_turnier.loecher, 9)
        finally:
            Turnier.query.filter_by(club_name=test_club.name).delete()
            db.session.delete(test_club)
            db.session.commit()

    def test_import_general_turniere_pccaddy_csv_endpoint(self):
        """Testet den allgemeinen POST /api/turniere/import-pccaddy Endpunkt mit CSV."""
        csv_payload = {
            "content": """Datum;Turniername;Löcher;Spielform;Vorgabewirksam
08.11.2026;Allgemeines API Turnier;18;Stableford;Ja""",
            "club_name": "GC Gut Sachsenwald 18"
        }
        res = self.client.post('/api/turniere/import-pccaddy', json=csv_payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['count'], 1)
        # Bereinigen
        t_id = data['turniere'][0]['id']
        self.client.delete(f'/api/turniere/{t_id}')

if __name__ == '__main__':
    unittest.main()

