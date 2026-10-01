import unittest
import json
from app import app, db, User, Scorecard, ClubLiveCheckin

class ClubPortalTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

        with self.app.app_context():
            # Clean test tables
            ClubLiveCheckin.query.delete()
            Scorecard.query.delete()
            User.query.filter(User.username.in_(['test_player_1', 'test_player_2', 'test_club_user', 'test_other_user'])).delete()
            db.session.commit()

            # Create test player 1
            self.p1 = User(
                username='test_player_1',
                email='p1@example.com',
                password_hash='dummy',
                api_token='token_player_1',
                role='player'
            )
            # Create test player 2
            self.p2 = User(
                username='test_player_2',
                email='p2@example.com',
                password_hash='dummy',
                api_token='token_player_2',
                role='player'
            )
            # Create test club manager for GC Gut Jersbek
            self.club_mgr = User(
                username='test_club_user',
                email='club@jersbek.local',
                password_hash='dummy',
                api_token='token_club_mgr',
                role='club',
                managed_club_name='GC Gut Jersbek'
            )
            # Create regular user without club rights
            self.reg_user = User(
                username='test_other_user',
                email='other@example.com',
                password_hash='dummy',
                api_token='token_other_user',
                role='player'
            )
            db.session.add_all([self.p1, self.p2, self.club_mgr, self.reg_user])
            db.session.commit()

            self.p1_id = self.p1.id
            self.p2_id = self.p2.id

    def tearDown(self):
        with self.app.app_context():
            ClubLiveCheckin.query.delete()
            Scorecard.query.delete()
            User.query.filter(User.username.in_(['test_player_1', 'test_player_2', 'test_club_user', 'test_other_user'])).delete()
            db.session.commit()

    def test_live_checkin_and_checkout(self):
        # 1. Player 1 checks in on GC Gut Jersbek
        res = self.client.post('/api/club-portal/live-checkin',
            headers={'Authorization': 'Bearer token_player_1'},
            json={
                'club_name': 'GC Gut Jersbek',
                'tee': 'gelb',
                'loecher': 18,
                'turnier_name': 'Monatsbecher'
            }
        )
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn("Erfolgreich", data['nachricht'])
        self.assertEqual(data['checkin']['club_name'], 'GC Gut Jersbek')
        self.assertEqual(data['checkin']['status'], 'active')

        # 2. Player 1 checks out
        res_out = self.client.post('/api/club-portal/live-checkout',
            headers={'Authorization': 'Bearer token_player_1'},
            json={}
        )
        self.assertEqual(res_out.status_code, 200)

        with self.app.app_context():
            checkin = ClubLiveCheckin.query.filter_by(user_id=self.p1_id).first()
            self.assertEqual(checkin.status, 'finished')

    def test_club_live_players_monitoring(self):
        # Player 1 checks in on GC Gut Jersbek
        self.client.post('/api/club-portal/live-checkin',
            headers={'Authorization': 'Bearer token_player_1'},
            json={'club_name': 'GC Gut Jersbek', 'tee': 'gelb', 'loecher': 18}
        )
        # Player 2 checks in on Hamburger GC Falkenstein
        self.client.post('/api/club-portal/live-checkin',
            headers={'Authorization': 'Bearer token_player_2'},
            json={'club_name': 'Hamburger GC Falkenstein', 'tee': 'rot', 'loecher': 9}
        )

        # Regular user tries to access live players -> 403 Forbidden
        res_forbidden = self.client.get('/api/club-portal/live-players',
            headers={'Authorization': 'Bearer token_player_1'}
        )
        self.assertEqual(res_forbidden.status_code, 403)

        # Club Manager for Jersbek accesses live players
        res_club = self.client.get('/api/club-portal/live-players',
            headers={'Authorization': 'Bearer token_club_mgr'}
        )
        self.assertEqual(res_club.status_code, 200)
        data = res_club.get_json()
        self.assertEqual(data['club_name'], 'GC Gut Jersbek')
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['players'][0]['username'], 'test_player_1')
        self.assertEqual(data['players'][0]['tee'], 'gelb')

    def test_scorecard_submit_and_inbox(self):
        # Player 1 creates a scorecard
        holes_sample = [{"hole": i, "par": 4, "gross": 4, "net": 4, "points": 2} for i in range(1, 19)]
        with self.app.app_context():
            card = Scorecard(
                user_id=self.p1_id,
                club_name='GC Gut Jersbek',
                datum='01.10.2026',
                loecher=18,
                tee='gelb',
                course_rating=72.0,
                slope_rating=130.0,
                par=72.0,
                playing_hcp=15,
                handicap_index=14.2,
                brutto=72,
                netto=57,
                stableford=36,
                holes_json=json.dumps(holes_sample),
                player_signature='sig_p1',
                marker_signature='sig_m1',
                marker_name='Marker Max',
                gps_verified=True,
                gps_audit_token='DGV-GPS-TEST-123'
            )
            db.session.add(card)
            db.session.commit()
            card_id = card.id

        # Player submits scorecard to club
        res_sub = self.client.post(f'/api/scorecards/{card_id}/submit-to-club',
            headers={'Authorization': 'Bearer token_player_1'}
        )
        self.assertEqual(res_sub.status_code, 200)
        self.assertTrue(res_sub.get_json()['scorecard']['submitted_to_club'])
        self.assertEqual(res_sub.get_json()['scorecard']['submission_status'], 'submitted')

        # Club manager checks inbox
        res_inbox = self.client.get('/api/club-portal/scorecards',
            headers={'Authorization': 'Bearer token_club_mgr'}
        )
        self.assertEqual(res_inbox.status_code, 200)
        inbox_data = res_inbox.get_json()
        self.assertEqual(inbox_data['count'], 1)
        self.assertEqual(inbox_data['scorecards'][0]['username'], 'test_player_1')
        self.assertEqual(inbox_data['scorecards'][0]['brutto'], 72)

        # Club manager updates status to 'in_pccaddie'
        res_status = self.client.put(f'/api/club-portal/scorecards/{card_id}/status',
            headers={'Authorization': 'Bearer token_club_mgr'},
            json={'status': 'in_pccaddie'}
        )
        self.assertEqual(res_status.status_code, 200)
        self.assertEqual(res_status.get_json()['scorecard']['submission_status'], 'in_pccaddie')

    def test_pccaddie_batch_csv_export(self):
        # Create a submitted scorecard
        holes_sample = [{"hole": i, "par": 4, "gross": 5, "net": 4, "points": 2} for i in range(1, 19)]
        with self.app.app_context():
            card = Scorecard(
                user_id=self.p1_id,
                club_name='GC Gut Jersbek',
                datum='01.10.2026',
                loecher=18,
                tee='gelb',
                brutto=90,
                netto=75,
                stableford=33,
                holes_json=json.dumps(holes_sample),
                player_signature='sig_p1',
                marker_signature='sig_m1',
                marker_name='Marker Max',
                submitted_to_club=True,
                submission_status='submitted'
            )
            db.session.add(card)
            db.session.commit()

        res_csv = self.client.get('/api/club-portal/export/pccaddie.csv',
            headers={'Authorization': 'Bearer token_club_mgr'}
        )
        self.assertEqual(res_csv.status_code, 200)
        self.assertEqual(res_csv.mimetype, 'text/csv')
        csv_text = res_csv.data.decode('utf-8-sig')
        self.assertIn('PCC_SCORECARD_v2', csv_text)
        self.assertIn('GC Gut Jersbek', csv_text)
        self.assertIn('test_player_1', csv_text)
        self.assertIn('90', csv_text)

if __name__ == '__main__':
    unittest.main()
