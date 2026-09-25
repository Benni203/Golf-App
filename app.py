import os
import math
import hashlib
import json
import secrets
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, or_
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

# --- 1. SETUP UND KONFIGURATION ---
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

basis_ordner = os.path.abspath(os.path.dirname(__file__))
db_url = os.environ.get('DATABASE_URL')
if db_url and db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url or ('sqlite:///' + os.path.join(basis_ordner, 'golfapp.db'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'golf-app-secret-dev-key-12345')

db = SQLAlchemy(app)

# --- 2. DATENBANK MODELLE ---

class User(db.Model):
    """Speichert registrierte Benutzer."""
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    api_token = db.Column(db.String(64), unique=True, index=True, nullable=True)
    reset_token = db.Column(db.String(64), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    runden = db.relationship('Runde', backref='user', cascade='all, delete-orphan', lazy=True)
    clubs = db.relationship('Club', backref='user', cascade='all, delete-orphan', lazy=True)
    turniere = db.relationship('Turnier', backref='user', cascade='all, delete-orphan', lazy=True)
    favorites = db.relationship('FavoriteClub', backref='user', cascade='all, delete-orphan', lazy=True)
    scorecards = db.relationship('Scorecard', backref='user', cascade='all, delete-orphan', lazy=True)
    registrations = db.relationship('TournamentRegistration', backref='user', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email or "",
            "is_admin": bool(self.is_admin),
            "runden_count": len(self.runden) if self.runden else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Runde(db.Model):
    """Speichert gespielte Runden eines Benutzers."""
    __tablename__ = 'runden'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    datum = db.Column(db.String(20), nullable=False)
    club_name = db.Column(db.String(120), nullable=False)
    loecher = db.Column(db.Integer, nullable=False)
    brutto = db.Column(db.Integer, nullable=False)
    sd = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "datum": self.datum,
            "club_name": self.club_name,
            "loecher": self.loecher,
            "brutto": self.brutto,
            "sd": self.sd
        }

class Club(db.Model):
    """Speichert Verzeichnis- oder benutzerdefinierte Golfclubs."""
    __tablename__ = 'clubs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True, index=True)
    name = db.Column(db.String(120), nullable=False)
    tee = db.Column(db.String(50), default='gelb')
    region = db.Column(db.String(100), default='Schleswig-Holstein / Hamburg')
    city = db.Column(db.String(100), default='')
    par18 = db.Column(db.Float, nullable=True)
    cr18 = db.Column(db.Float, nullable=True)
    sr18 = db.Column(db.Float, nullable=True)
    par9 = db.Column(db.Float, nullable=True)
    cr9 = db.Column(db.Float, nullable=True)
    sr9 = db.Column(db.Float, nullable=True)
    lat = db.Column(db.Float, nullable=True)
    lon = db.Column(db.Float, nullable=True)

    def to_dict(self):
        # Hole passende Turniere für diesen Club
        turniere_db = Turnier.query.filter_by(club_name=self.name).all()
        return {
            "id": self.id,
            "name": self.name,
            "tee": self.tee or "gelb",
            "region": self.region or "Deutschland",
            "city": self.city or "",
            "par18": self.par18 or "",
            "cr18": self.cr18 or "",
            "sr18": self.sr18 or "",
            "par9": self.par9 or "",
            "cr9": self.cr9 or "",
            "sr9": self.sr9 or "",
            "lat": self.lat,
            "lon": self.lon,
            "is_custom": bool(self.user_id),
            "turniere": [t.to_dict() for t in turniere_db]
        }

class Turnier(db.Model):
    """Speichert anstehende Club-Turniere."""
    __tablename__ = 'turniere'
    id = db.Column(db.Integer, primary_key=True)
    club_name = db.Column(db.String(120), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    datum = db.Column(db.String(20), nullable=False)
    loecher = db.Column(db.Integer, default=18)
    spielform = db.Column(db.String(50), default='Stableford')
    vorgabewirksam = db.Column(db.Boolean, default=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)

    registrations = db.relationship('TournamentRegistration', backref='turnier', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "club_name": self.club_name,
            "name": self.name,
            "datum": self.datum,
            "loecher": self.loecher,
            "spielform": self.spielform,
            "vorgabewirksam": self.vorgabewirksam,
            "participants_count": len(self.registrations) if self.registrations else 0
        }

class FavoriteClub(db.Model):
    """Speichert favorisierte Golfclubs eines Benutzers."""
    __tablename__ = 'favorite_clubs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    club_name = db.Column(db.String(120), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Friendship(db.Model):
    """Verwaltet Freundschaften zwischen Benutzern."""
    __tablename__ = 'friendships'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    friend_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    status = db.Column(db.String(20), default='accepted')  # 'pending', 'accepted'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class TournamentRegistration(db.Model):
    """Speichert Anmeldungen von Benutzern zu Turnieren."""
    __tablename__ = 'tournament_registrations'
    id = db.Column(db.Integer, primary_key=True)
    turnier_id = db.Column(db.Integer, db.ForeignKey('turniere.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    flight_number = db.Column(db.Integer, default=1)
    start_time = db.Column(db.String(20), default='09:00')
    handicap_index = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(30), default='angemeldet')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        user = db.session.get(User, self.user_id)
        return {
            "id": self.id,
            "turnier_id": self.turnier_id,
            "user_id": self.user_id,
            "username": user.username if user else "Unbekannt",
            "flight_number": self.flight_number,
            "start_time": self.start_time,
            "handicap_index": self.handicap_index,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Flight(db.Model):
    """Speichert Live-Flights für gemeinsame Team-Scorecards."""
    __tablename__ = 'flights'
    id = db.Column(db.Integer, primary_key=True)
    flight_code = db.Column(db.String(16), unique=True, nullable=False, index=True)
    turnier_id = db.Column(db.Integer, db.ForeignKey('turniere.id', ondelete='SET NULL'), nullable=True)
    club_name = db.Column(db.String(120), nullable=False)
    datum = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(120), default="Flight")
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    scores_data = db.Column(db.Text, default='{}')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        creator = db.session.get(User, self.created_by_user_id)
        scores = {}
        try:
            scores = json.loads(self.scores_data or '{}')
        except Exception:
            scores = {}
        return {
            "id": self.id,
            "flight_code": self.flight_code,
            "turnier_id": self.turnier_id,
            "club_name": self.club_name,
            "datum": self.datum,
            "name": self.name,
            "created_by": creator.username if creator else "",
            "scores": scores,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Scorecard(db.Model):
    """Speichert vollständige Turnier-Scorekarten inklusive Unterschriften, GPS-Audit und PC CADDIE Export."""
    __tablename__ = 'scorecards'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    turnier_id = db.Column(db.Integer, db.ForeignKey('turniere.id', ondelete='SET NULL'), nullable=True)
    club_name = db.Column(db.String(120), nullable=False)
    datum = db.Column(db.String(20), nullable=False)
    loecher = db.Column(db.Integer, default=18)
    course_rating = db.Column(db.Float, nullable=True)
    slope_rating = db.Column(db.Float, nullable=True)
    par = db.Column(db.Float, nullable=True)
    playing_hcp = db.Column(db.Integer, default=0)
    handicap_index = db.Column(db.Float, nullable=True)
    brutto = db.Column(db.Integer, default=0)
    netto = db.Column(db.Integer, default=0)
    stableford = db.Column(db.Integer, default=0)
    holes_json = db.Column(db.Text, default='[]')
    player_signature = db.Column(db.Text, nullable=True)
    marker_signature = db.Column(db.Text, nullable=True)
    marker_name = db.Column(db.String(100), default='')
    gps_latitude = db.Column(db.Float, nullable=True)
    gps_longitude = db.Column(db.Float, nullable=True)
    gps_verified = db.Column(db.Boolean, default=False)
    gps_distance_km = db.Column(db.Float, nullable=True)
    gps_audit_token = db.Column(db.String(128), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        holes = []
        try:
            holes = json.loads(self.holes_json or '[]')
        except Exception:
            holes = []
        user = db.session.get(User, self.user_id)
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": user.username if user else "",
            "turnier_id": self.turnier_id,
            "club_name": self.club_name,
            "datum": self.datum,
            "loecher": self.loecher,
            "course_rating": self.course_rating,
            "slope_rating": self.slope_rating,
            "par": self.par,
            "playing_hcp": self.playing_hcp,
            "handicap_index": self.handicap_index,
            "brutto": self.brutto,
            "netto": self.netto,
            "stableford": self.stableford,
            "holes": holes,
            "has_player_signature": bool(self.player_signature),
            "has_marker_signature": bool(self.marker_signature),
            "marker_name": self.marker_name or "",
            "gps_verified": bool(self.gps_verified),
            "gps_distance_km": self.gps_distance_km,
            "gps_audit_token": self.gps_audit_token or "",
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

# --- SEED DATEN: UMFANGREICHER DEUTSCHER GOLFCLUB-KATALOG & TURNIERE ---
KATALOG_CLUBS = [
    # Hamburg & Metropolregion
    {"name": "Hamburger GC Falkenstein", "tee": "gelb", "region": "Hamburg & Umland", "city": "Hamburg-Rissen", "par18": 71.0, "cr18": 72.8, "sr18": 133.0, "par9": 36.0, "cr9": 36.4, "sr9": 131.0, "lat": 53.5702, "lon": 9.7712},
    {"name": "GC Hamburg-Walddörfer", "tee": "gelb", "region": "Hamburg & Umland", "city": "Hamburg-Wohldorf", "par18": 72.0, "cr18": 72.2, "sr18": 130.0, "par9": 36.0, "cr9": 36.1, "sr9": 128.0, "lat": 53.7088, "lon": 10.1554},
    {"name": "GC Wendlohe", "tee": "gelb", "region": "Hamburg & Umland", "city": "Bönningstedt", "par18": 72.0, "cr18": 72.5, "sr18": 132.0, "par9": 36.0, "cr9": 36.0, "sr9": 129.0, "lat": 53.6667, "lon": 9.9242},
    {"name": "GC Gut Kaden (A+B)", "tee": "gelb", "region": "Hamburg & Umland", "city": "Alveslohe", "par18": 72.0, "cr18": 72.9, "sr18": 135.0, "par9": 36.0, "cr9": 36.5, "sr9": 133.0, "lat": 53.7715, "lon": 9.9482},
    {"name": "GC Gut Kaden (B+C)", "tee": "gelb", "region": "Hamburg & Umland", "city": "Alveslohe", "par18": 72.0, "cr18": 72.4, "sr18": 132.0, "par9": 36.0, "cr9": 36.2, "sr9": 130.0, "lat": 53.7715, "lon": 9.9482},
    {"name": "GC Holm", "tee": "gelb", "region": "Hamburg & Umland", "city": "Holm (Pinneberg)", "par18": 72.0, "cr18": 72.1, "sr18": 131.0, "par9": 36.0, "cr9": 36.0, "sr9": 128.0, "lat": 53.6212, "lon": 9.6812},
    {"name": "GC Treudelberg", "tee": "gelb", "region": "Hamburg & Umland", "city": "Hamburg-Lemsahl", "par18": 72.0, "cr18": 71.9, "sr18": 130.0, "par9": 36.0, "cr9": 35.9, "sr9": 128.0, "lat": 53.6812, "lon": 10.0812},
    {"name": "HLGC Hittfeld", "tee": "gelb", "region": "Hamburg & Umland", "city": "Seevetal", "par18": 71.0, "cr18": 71.5, "sr18": 129.0, "par9": 36.0, "cr9": 35.8, "sr9": 127.0, "lat": 53.3812, "lon": 9.9812},
    {"name": "GC Buchholz-Nordheide", "tee": "gelb", "region": "Hamburg & Umland", "city": "Buchholz i.d.N.", "par18": 72.0, "cr18": 72.0, "sr18": 128.0, "par9": 36.0, "cr9": 36.0, "sr9": 127.0, "lat": 53.3112, "lon": 9.8712},
    {"name": "GC Hamburg-Ahrensburg", "tee": "gelb", "region": "Hamburg & Umland", "city": "Ahrensburg", "par18": 71.0, "cr18": 71.2, "sr18": 128.0, "par9": 36.0, "cr9": 35.6, "sr9": 126.0, "lat": 53.6712, "lon": 10.2412},

    # Schleswig-Holstein
    {"name": "GC Escheburg 18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Escheburg", "par18": 72.0, "cr18": 71.8, "sr18": 131.0, "par9": "", "cr9": "", "sr9": "", "lat": 53.4682, "lon": 10.3325},
    {"name": "GC Escheburg 1-9", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Escheburg", "par18": "", "cr18": "", "sr18": "", "par9": 36.0, "cr9": 35.6, "sr9": 129.0, "lat": 53.4682, "lon": 10.3325},
    {"name": "GC Escheburg 10-18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Escheburg", "par18": "", "cr18": "", "sr18": "", "par9": 36.0, "cr9": 36.1, "sr9": 132.0, "lat": 53.4682, "lon": 10.3325},
    {"name": "GC Jersbek 18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Jersbek", "par18": 72.0, "cr18": 71.4, "sr18": 132.0, "par9": "", "cr9": "", "sr9": "", "lat": 53.7420, "lon": 10.2215},
    {"name": "GC Jersbek 1-9", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Jersbek", "par18": "", "cr18": "", "sr18": "", "par9": 36.0, "cr9": 35.7, "sr9": 132.0, "lat": 53.7420, "lon": 10.2215},
    {"name": "GC Jersbek 10-18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Jersbek", "par18": "", "cr18": "", "sr18": "", "par9": 36.0, "cr9": 36.6, "sr9": 130.0, "lat": 53.7420, "lon": 10.2215},
    {"name": "GC Pinnau 18 A+B", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Pinneberg", "par18": 73.0, "cr18": 71.8, "sr18": 137.0, "par9": "", "cr9": "", "sr9": "", "lat": 53.6917, "lon": 9.7667},
    {"name": "GC Pinnau 18 A+C", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Pinneberg", "par18": 72.0, "cr18": 71.4, "sr18": 131.0, "par9": "", "cr9": "", "sr9": "", "lat": 53.6917, "lon": 9.7667},
    {"name": "GC Pinnau 18 B+C", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Pinneberg", "par18": 73.0, "cr18": 71.0, "sr18": 126.0, "par9": "", "cr9": "", "sr9": "", "lat": 53.6917, "lon": 9.7667},
    {"name": "GC Grossensee 18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Großensee", "par18": 73.0, "cr18": 72.3, "sr18": 130.0, "par9": "", "cr9": "", "sr9": "", "lat": 53.6189, "lon": 10.3482},
    {"name": "GC Gut Sachsenwald 18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Dassendorf", "par18": 72.0, "cr18": 72.6, "sr18": 130.0, "par9": "", "cr9": "", "sr9": "", "lat": 53.5350, "lon": 10.3800},
    {"name": "GC Gut Grambek 18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Grambek / Mölln", "par18": 71.0, "cr18": 71.8, "sr18": 126.0, "par9": "", "cr9": "", "sr9": "", "lat": 53.5732, "lon": 10.6654},
    {"name": "GC Timmendorfer Strand (Nord)", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Timmendorfer Strand", "par18": 72.0, "cr18": 72.8, "sr18": 133.0, "par9": 36.0, "cr9": 36.4, "sr9": 131.0, "lat": 53.9932, "lon": 10.7812},
    {"name": "Lübeck-Travemünder GK", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Travemünde", "par18": 73.0, "cr18": 73.1, "sr18": 134.0, "par9": 36.0, "cr9": 36.5, "sr9": 132.0, "lat": 53.9634, "lon": 10.8712},
    {"name": "GC Altenhof", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Eckernförde", "par18": 72.0, "cr18": 72.4, "sr18": 131.0, "par9": 36.0, "cr9": 36.2, "sr9": 129.0, "lat": 54.4412, "lon": 9.8712},
    {"name": "GC Sylt", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Wenningstedt (Sylt)", "par18": 72.0, "cr18": 73.0, "sr18": 135.0, "par9": 36.0, "cr9": 36.5, "sr9": 133.0, "lat": 54.9212, "lon": 8.3182},
    {"name": "Marine-GC Sylt", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Tinnum (Sylt)", "par18": 72.0, "cr18": 72.8, "sr18": 132.0, "par9": 36.0, "cr9": 36.4, "sr9": 130.0, "lat": 54.8972, "lon": 8.3312},
    {"name": "GC Gut Bissenmoor", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Bad Bramstedt", "par18": 72.0, "cr18": 71.9, "sr18": 129.0, "par9": 36.0, "cr9": 35.9, "sr9": 127.0, "lat": 53.9182, "lon": 9.8972},

    # Niedersachsen & Bremen
    {"name": "Club zur Vahr (Garlstedt)", "tee": "gelb", "region": "Niedersachsen & Bremen", "city": "Garlstedt (Bremen)", "par18": 72.0, "cr18": 72.7, "sr18": 134.0, "par9": 36.0, "cr9": 36.3, "sr9": 132.0, "lat": 53.2212, "lon": 8.6812},
    {"name": "GC Hannover", "tee": "gelb", "region": "Niedersachsen & Bremen", "city": "Garbsen (Hannover)", "par18": 72.0, "cr18": 72.3, "sr18": 131.0, "par9": 36.0, "cr9": 36.1, "sr9": 129.0, "lat": 52.4412, "lon": 9.5812},
    {"name": "GC Deinster Mühle", "tee": "gelb", "region": "Niedersachsen & Bremen", "city": "Deinste (Stade)", "par18": 72.0, "cr18": 71.6, "sr18": 127.0, "par9": 36.0, "cr9": 35.8, "sr9": 125.0, "lat": 53.5212, "lon": 9.5182},
    {"name": "GC Verden", "tee": "gelb", "region": "Niedersachsen & Bremen", "city": "Verden (Aller)", "par18": 72.0, "cr18": 71.8, "sr18": 128.0, "par9": 36.0, "cr9": 35.9, "sr9": 126.0, "lat": 52.9212, "lon": 9.2412},

    # Deutschlandweit Top-Plätze
    {"name": "GC St. Leon-Rot (St. Leon)", "tee": "gelb", "region": "Baden-Württemberg", "city": "St. Leon-Rot", "par18": 72.0, "cr18": 73.5, "sr18": 138.0, "par9": 36.0, "cr9": 36.7, "sr9": 136.0, "lat": 49.2512, "lon": 8.6182},
    {"name": "GC St. Leon-Rot (Rot)", "tee": "gelb", "region": "Baden-Württemberg", "city": "St. Leon-Rot", "par18": 72.0, "cr18": 73.2, "sr18": 136.0, "par9": 36.0, "cr9": 36.5, "sr9": 134.0, "lat": 49.2512, "lon": 8.6182},
    {"name": "GC München Eichenried (A+B)", "tee": "gelb", "region": "Bayern", "city": "Moosinning (München)", "par18": 72.0, "cr18": 73.1, "sr18": 135.0, "par9": 36.0, "cr9": 36.5, "sr9": 133.0, "lat": 48.2712, "lon": 11.7812},
    {"name": "Frankfurter GC", "tee": "gelb", "region": "Hessen", "city": "Frankfurt am Main", "par18": 71.0, "cr18": 72.4, "sr18": 133.0, "par9": 36.0, "cr9": 36.2, "sr9": 131.0, "lat": 50.0812, "lon": 8.6412},
    {"name": "GC Hubbelrath (Ostplatz)", "tee": "gelb", "region": "Nordrhein-Westfalen", "city": "Düsseldorf", "par18": 72.0, "cr18": 73.4, "sr18": 137.0, "par9": 36.0, "cr9": 36.7, "sr9": 135.0, "lat": 51.2512, "lon": 6.8912},
    {"name": "G&CC Seddiner See (Süd)", "tee": "gelb", "region": "Berlin / Brandenburg", "city": "Michendorf (Berlin)", "par18": 72.0, "cr18": 73.2, "sr18": 136.0, "par9": 36.0, "cr9": 36.6, "sr9": 134.0, "lat": 52.2812, "lon": 13.0182}
]

KATALOG_TURNIERE = [
    # Verifizierte Turniere mit korrekter DGV-Vorgabewirksamkeit
    {"club_name": "GC Gut Sachsenwald 18", "name": "Sachsenwaldbecher 2026", "datum": "04.10.2026", "loecher": 18, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Gut Sachsenwald 18", "name": "After Work 9-Loch Challenge", "datum": "12.10.2026", "loecher": 9, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Gut Sachsenwald 18", "name": "Clubmeisterschaft Runde 1", "datum": "17.10.2026", "loecher": 18, "spielform": "Zählspiel", "vorgabewirksam": True},
    {"club_name": "GC Escheburg 18", "name": "Offener Monatsbecher Escheburg", "datum": "03.10.2026", "loecher": 18, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Escheburg 18", "name": "Early Bird Trophy", "datum": "11.10.2026", "loecher": 9, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Pinnau 18 A+B", "name": "Pinnau Monats-Cup", "datum": "18.10.2026", "loecher": 18, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Pinnau 18 A+B", "name": "Mercedes-Benz AWGC Pinnau", "datum": "22.10.2026", "loecher": 9, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Jersbek 18", "name": "Jersbeker Herbstpokal", "datum": "10.10.2026", "loecher": 18, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Jersbek 18", "name": "RPR Invitational", "datum": "24.10.2026", "loecher": 18, "spielform": "Zählspiel", "vorgabewirksam": True},
    {"club_name": "GC Grossensee 18", "name": "Grossensee Classic 18", "datum": "04.10.2026", "loecher": 18, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Grossensee 18", "name": "Sundowner 9-Hole Challenge", "datum": "15.10.2026", "loecher": 9, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Gut Kaden (A+B)", "name": "Gut Kaden Herbst Open", "datum": "17.10.2026", "loecher": 18, "spielform": "Zählspiel", "vorgabewirksam": True},
    {"club_name": "Hamburger GC Falkenstein", "name": "Falkenstein Herbst-Vierer", "datum": "18.10.2026", "loecher": 18, "spielform": "Chapman-Vierer", "vorgabewirksam": False},
    {"club_name": "GC Wendlohe", "name": "Wendlohe After-Work Cup", "datum": "09.10.2026", "loecher": 9, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC St. Leon-Rot (St. Leon)", "name": "St. Leon Open Championship", "datum": "25.10.2026", "loecher": 18, "spielform": "Zählspiel", "vorgabewirksam": True},
    {"club_name": "GC Hamburg-Walddörfer", "name": "Walddörfer Herbst-Trophy", "datum": "11.10.2026", "loecher": 18, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Holm", "name": "Holmer Herbstpokal", "datum": "18.10.2026", "loecher": 18, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Treudelberg", "name": "Treudelberg Open", "datum": "24.10.2026", "loecher": 18, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "HLGC Hittfeld", "name": "Hittfelder Herbstpreis", "datum": "25.10.2026", "loecher": 18, "spielform": "Zählspiel", "vorgabewirksam": True},
    {"club_name": "GC Sylt", "name": "Sylter Insel-Cup", "datum": "10.10.2026", "loecher": 18, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC Hannover", "name": "Hannoveraner Trophy", "datum": "17.10.2026", "loecher": 18, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC München Eichenried (A+B)", "name": "Eichenried Herbst-Masters", "datum": "18.10.2026", "loecher": 18, "spielform": "Zählspiel", "vorgabewirksam": True},
    {"club_name": "Frankfurter GC", "name": "Frankfurter Herbst-Vierer", "datum": "24.10.2026", "loecher": 18, "spielform": "Chapman-Vierer", "vorgabewirksam": False},
    {"club_name": "GC Hubbelrath (Ostplatz)", "name": "Hubbelrather Clubpokal", "datum": "25.10.2026", "loecher": 18, "spielform": "Zählspiel", "vorgabewirksam": True},
    {"club_name": "G&CC Seddiner See (Süd)", "name": "Seddiner See Herbst-Cup", "datum": "18.10.2026", "loecher": 18, "spielform": "Stableford", "vorgabewirksam": True}
]

def send_reset_email(to_email, reset_code):
    """Sendet optional eine E-Mail mit dem Reset-Code, wenn SMTP konfiguriert ist."""
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASSWORD')
    smtp_from = os.environ.get('SMTP_FROM', smtp_user or 'noreply@golfapp.local')

    if not smtp_host or not to_email:
        return False, "Kein SMTP konfiguriert oder keine E-Mail"

    try:
        msg = MIMEText(
            f"Hallo,\n\n"
            f"dein Bestätigungscode zum Zurücksetzen deines GolfApp-Passworts lautet:\n\n"
            f"  {reset_code}\n\n"
            f"Dieser Code ist 30 Minuten lang gültig.\n\n"
            f"Falls du diese Anfrage nicht gestellt hast, kannst du diese Nachricht ignorieren.\n\n"
            f"Sportliche Grüße,\nDein GolfApp Team"
        )
        msg['Subject'] = 'GolfApp - Passwort zurücksetzen'
        msg['From'] = smtp_from
        msg['To'] = to_email

        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls()
            if smtp_user and smtp_pass:
                server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        return True, "E-Mail erfolgreich versendet"
    except Exception as e:
        print(f"SMTP-Fehler: {e}")
        return False, str(e)

def calculate_distance_km(lat1, lon1, lat2, lon2):
    """Berechnet die Entfernung in km mittels Haversine-Formel."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None
    try:
        lat1, lon1, lat2, lon2 = float(lat1), float(lon1), float(lat2), float(lon2)
        R = 6371.0  # Erdradius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)
    except Exception:
        return None

def generate_gps_audit_token(user_id, club_name, lat, lon):
    """Generiert einen fälschungssicheren SHA256-Audit-Hash für die GPS-Verifikation."""
    secret = app.config.get('SECRET_KEY', 'golf-secret')
    payload = f"{user_id}:{club_name}:{lat:.4f}:{lon:.4f}:{secret}"
    return hashlib.sha256(payload.encode()).hexdigest()

def migrate_and_seed_database():
    """Stellt sicher, dass alle Tabellenspalten existieren und initialisiert Katalog-Clubs & Turniere."""
    # 1. Sicherstellen, dass neue Spalten in bestehenden Tabellen existieren
    try:
        with db.engine.connect() as conn:
            if db.engine.name == 'sqlite':
                cursor = conn.connection.cursor()
                cursor.execute("PRAGMA table_info(clubs)")
                club_cols = [row[1] for row in cursor.fetchall()]
                if club_cols and 'region' not in club_cols:
                    cursor.execute("ALTER TABLE clubs ADD COLUMN region VARCHAR(100) DEFAULT 'Schleswig-Holstein / Hamburg'")
                if club_cols and 'city' not in club_cols:
                    cursor.execute("ALTER TABLE clubs ADD COLUMN city VARCHAR(100) DEFAULT ''")
                if club_cols and 'lat' not in club_cols:
                    cursor.execute("ALTER TABLE clubs ADD COLUMN lat FLOAT")
                if club_cols and 'lon' not in club_cols:
                    cursor.execute("ALTER TABLE clubs ADD COLUMN lon FLOAT")

                cursor.execute("PRAGMA table_info(users)")
                user_cols = [row[1] for row in cursor.fetchall()]
                if user_cols and 'email' not in user_cols:
                    cursor.execute("ALTER TABLE users ADD COLUMN email VARCHAR(120)")
                if user_cols and 'reset_token' not in user_cols:
                    cursor.execute("ALTER TABLE users ADD COLUMN reset_token VARCHAR(64)")
                if user_cols and 'reset_token_expires' not in user_cols:
                    cursor.execute("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME")
                if user_cols and 'is_admin' not in user_cols:
                    cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0")
                conn.connection.commit()
            elif db.engine.name == 'postgresql':
                from sqlalchemy import text
                conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS region VARCHAR(100) DEFAULT 'Schleswig-Holstein / Hamburg'"))
                conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT ''"))
                conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS lat FLOAT"))
                conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS lon FLOAT"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(120)"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(64)"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE"))
                conn.commit()
    except Exception as e:
        print(f"Hinweis zur Tabellenmigration: {e}")

    # 2. Tabellen erstellen, falls noch nicht existent
    db.create_all()

    # 3. System-Clubs aktualisieren / seeden mit Koordinaten
    try:
        system_clubs_count = Club.query.filter_by(user_id=None).count()
        sample_club = Club.query.filter_by(user_id=None).first()
        if system_clubs_count < len(KATALOG_CLUBS) or (sample_club and sample_club.lat is None):
            Club.query.filter_by(user_id=None).delete()
            for c_data in KATALOG_CLUBS:
                club = Club(
                    name=c_data["name"],
                    tee=c_data.get("tee", "gelb"),
                    region=c_data.get("region", "Schleswig-Holstein / Hamburg"),
                    city=c_data.get("city", ""),
                    par18=c_data.get("par18") or None,
                    cr18=c_data.get("cr18") or None,
                    sr18=c_data.get("sr18") or None,
                    par9=c_data.get("par9") or None,
                    cr9=c_data.get("cr9") or None,
                    sr9=c_data.get("sr9") or None,
                    lat=c_data.get("lat"),
                    lon=c_data.get("lon"),
                    user_id=None
                )
                db.session.add(club)

        # 4. Turniere aktualisieren / seeden
        system_turniere_count = Turnier.query.filter_by(user_id=None).count()
        if system_turniere_count < len(KATALOG_TURNIERE):
            Turnier.query.filter_by(user_id=None).delete()
            for t_data in KATALOG_TURNIERE:
                turnier = Turnier(
                    club_name=t_data["club_name"],
                    name=t_data["name"],
                    datum=t_data["datum"],
                    loecher=t_data["loecher"],
                    spielform=t_data["spielform"],
                    vorgabewirksam=t_data["vorgabewirksam"],
                    user_id=None
                )
                db.session.add(turnier)

        # 5. Ersten Benutzer zum Admin befördern, falls noch kein Admin existiert
        first_user = User.query.order_by(User.id.asc()).first()
        if first_user and not first_user.is_admin:
            first_user.is_admin = True

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Fehler beim Seeden: {e}")

# Tabellen erstellen & Seeden
with app.app_context():
    migrate_and_seed_database()

# --- 3. AUTHENTIFIZIERUNG HELPER ---

def get_current_user():
    """Liest den Bearer Token aus dem Authorization Header oder query parameter aus."""
    auth_header = request.headers.get('Authorization', '')
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1].strip()
    elif request.args.get('token'):
        token = request.args.get('token')

    if not token:
        return None
    return User.query.filter_by(api_token=token).first()

# --- 4. API ROUTEN: AUTH ---

@app.route('/api/register', methods=['POST'])
def register():
    """Registriert einen neuen Benutzer und liefert einen Auth-Token zurück."""
    daten = request.get_json(silent=True) or {}
    username = daten.get('username', '').strip()
    email = daten.get('email', '').strip().lower()
    password = daten.get('password', '').strip()

    if not username or len(username) < 3:
        return jsonify({"fehler": "Benutzername muss mindestens 3 Zeichen lang sein."}), 400
    if not email or '@' not in email or '.' not in email:
        return jsonify({"fehler": "Bitte eine gültige E-Mail-Adresse angeben."}), 400
    if not password or len(password) < 4:
        return jsonify({"fehler": "Passwort muss mindestens 4 Zeichen lang sein."}), 400

    if User.query.filter(func.lower(User.username) == username.lower()).first():
        return jsonify({"fehler": "Dieser Benutzername ist bereits vergeben."}), 409

    if User.query.filter(func.lower(User.email) == email).first():
        return jsonify({"fehler": "Diese E-Mail-Adresse wird bereits verwendet."}), 409

    hashed_pw = generate_password_hash(password)
    token = secrets.token_hex(32)

    neuer_user = User(username=username, email=email, password_hash=hashed_pw, api_token=token)
    db.session.add(neuer_user)
    db.session.commit()

    return jsonify({
        "nachricht": "Benutzer erfolgreich registriert!",
        "token": token,
        "user": neuer_user.to_dict()
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    """Prüft Logindaten (E-Mail oder Benutzername) und gibt neuen/aktuellen Token zurück."""
    daten = request.get_json(silent=True) or {}
    identifier = (daten.get('identifier') or daten.get('username') or daten.get('email') or '').strip().lower()
    password = daten.get('password', '').strip()

    if not identifier or not password:
        return jsonify({"fehler": "Bitte E-Mail/Benutzername und Passwort eingeben."}), 400

    user = User.query.filter(
        (func.lower(User.username) == identifier) | (func.lower(User.email) == identifier)
    ).first()

    if user and check_password_hash(user.password_hash, password):
        user.api_token = secrets.token_hex(32)
        db.session.commit()

        return jsonify({
            "nachricht": "Login erfolgreich!",
            "token": user.api_token,
            "user": user.to_dict()
        }), 200
    else:
        return jsonify({"fehler": "Falsche Anmeldedaten oder Passwort."}), 401

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """Generiert einen 6-stelligen Bestätigungscode zum Zurücksetzen des Passworts."""
    daten = request.get_json(silent=True) or {}
    identifier = (daten.get('email') or daten.get('identifier') or daten.get('username') or '').strip().lower()

    if not identifier:
        return jsonify({"fehler": "Bitte gib deine E-Mail-Adresse oder deinen Benutzernamen ein."}), 400

    user = User.query.filter(
        (func.lower(User.email) == identifier) | (func.lower(User.username) == identifier)
    ).first()

    if not user:
        return jsonify({"fehler": "Kein Benutzerkonto mit dieser E-Mail-Adresse oder diesem Benutzernamen gefunden."}), 404

    # 6-stelligen Code generieren (100000 bis 999999)
    code = f"{secrets.randbelow(900000) + 100000}"
    user.reset_token = code
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=30)
    db.session.commit()

    email_to = user.email or identifier
    email_gesendet, smtp_info = send_reset_email(email_to, code)

    return jsonify({
        "nachricht": "Bestätigungscode wurde generiert.",
        "code": code,
        "email": user.email or user.username,
        "email_gesendet": email_gesendet,
        "hinweis": "Prüfe dein Postfach oder nutze den angezeigten Code."
    }), 200

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    """Validiert den Bestätigungscode und setzt das Passwort neu."""
    daten = request.get_json(silent=True) or {}
    identifier = (daten.get('email') or daten.get('identifier') or daten.get('username') or '').strip().lower()
    code = daten.get('code', '').strip()
    new_password = daten.get('new_password', '').strip()

    if not identifier or not code or not new_password:
        return jsonify({"fehler": "Bitte alle Felder ausfüllen (E-Mail/Benutzername, Code und neues Passwort)."}), 400

    if len(new_password) < 4:
        return jsonify({"fehler": "Das neue Passwort muss mindestens 4 Zeichen lang sein."}), 400

    user = User.query.filter(
        (func.lower(User.email) == identifier) | (func.lower(User.username) == identifier)
    ).first()

    if not user:
        return jsonify({"fehler": "Benutzerkonto nicht gefunden."}), 404

    if not user.reset_token or user.reset_token != code:
        return jsonify({"fehler": "Ungültiger Bestätigungscode."}), 400

    if not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        return jsonify({"fehler": "Der Bestätigungscode ist abgelaufen. Bitte fordere einen neuen an."}), 400

    # Neues Passwort speichern & Code invalidieren
    user.password_hash = generate_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    user.api_token = secrets.token_hex(32)
    db.session.commit()

    return jsonify({
        "nachricht": "Passwort erfolgreich geändert! Du bist jetzt angemeldet.",
        "token": user.api_token,
        "user": user.to_dict()
    }), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    """Meldet den aktuellen Benutzer ab und invalidiert den Token."""
    user = get_current_user()
    if user:
        user.api_token = None
        db.session.commit()
    return jsonify({"nachricht": "Erfolgreich abgemeldet."}), 200

@app.route('/api/me', methods=['GET'])
def get_me():
    """Gibt Profilinformationen des aktuell angemeldeten Benutzers zurück."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Nicht authentifiziert"}), 401

    return jsonify({
        "user": user.to_dict()
    }), 200

# --- 5. RUNDEN VERWALTUNG ---

@app.route('/api/runden', methods=['GET', 'POST'])
def runden_endpoint():
    """Ruft alle Runden des eingeloggten Benutzers ab oder erstellt eine neue."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich (Bearer Token fehlt)."}), 401

    if request.method == 'GET':
        runden_db = Runde.query.filter_by(user_id=user.id).order_by(Runde.id.asc()).all()
        return jsonify([r.to_dict() for r in runden_db]), 200

    elif request.method == 'POST':
        daten = request.get_json(silent=True) or {}
        try:
            datum = daten.get('datum')
            club_name = daten.get('club_name')
            loecher = int(daten.get('loecher', 18))
            brutto = int(daten.get('brutto'))
            sd = float(daten.get('sd'))

            if not datum or not club_name:
                return jsonify({"fehler": "Datum und Clubname erforderlich."}), 400

            neue_runde = Runde(
                user_id=user.id,
                datum=datum,
                club_name=club_name,
                loecher=loecher,
                brutto=brutto,
                sd=sd
            )
            db.session.add(neue_runde)
            db.session.commit()
            return jsonify({"nachricht": "Runde gespeichert", "runde": neue_runde.to_dict()}), 201
        except Exception as e:
            return jsonify({"fehler": f"Ungültige Daten: {str(e)}"}), 400

@app.route('/api/runden/batch', methods=['POST'])
def runden_batch_import():
    """Importiert mehrere Runden auf einmal (z.B. aus lokalem Speicher oder PDF-Import)."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    daten = request.get_json(silent=True) or {}
    runden_liste = daten.get('runden', [])

    if not isinstance(runden_liste, list):
        return jsonify({"fehler": "Liste von Runden erwartet."}), 400

    importiert = 0
    for item in runden_liste:
        try:
            datum = item.get('datum')
            club_name = item.get('club_name')
            loecher = int(item.get('loecher', 18))
            brutto = int(item.get('brutto'))
            sd = float(item.get('sd'))

            existiert = Runde.query.filter_by(user_id=user.id, datum=datum, brutto=brutto).first()
            if not existiert:
                r = Runde(
                    user_id=user.id,
                    datum=datum,
                    club_name=club_name,
                    loecher=loecher,
                    brutto=brutto,
                    sd=sd
                )
                db.session.add(r)
                importiert += 1
        except Exception:
            continue

    db.session.commit()
    return jsonify({
        "nachricht": f"{importiert} Runden erfolgreich importiert!",
        "importiert": importiert
    }), 201

@app.route('/api/runden/<int:runde_id>', methods=['DELETE'])
def delete_runde(runde_id):
    """Löscht eine Runde des aktuellen Benutzers."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    runde = Runde.query.filter_by(id=runde_id, user_id=user.id).first()
    if not runde:
        return jsonify({"fehler": "Runde nicht gefunden oder keine Berechtigung."}), 404

    db.session.delete(runde)
    db.session.commit()
    return jsonify({"nachricht": "Runde erfolgreich gelöscht."}), 200

# --- 6. GOLFCLUBS & TURNIERE VERWALTUNG ---

@app.route('/api/clubs', methods=['GET', 'POST'])
def clubs_endpoint():
    """Gibt alle Clubs (Katalog + User-Clubs) zurück oder legt einen neuen an."""
    user = get_current_user()

    if request.method == 'GET':
        user_id = user.id if user else None
        clubs_db = Club.query.filter((Club.user_id == user_id) | (Club.user_id == None)).all()
        return jsonify([c.to_dict() for c in clubs_db]), 200

    elif request.method == 'POST':
        if not user:
            return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

        daten = request.get_json(silent=True) or {}
        name = daten.get('name', '').strip()
        if not name:
            return jsonify({"fehler": "Name des Clubs erforderlich."}), 400

        neuer_club = Club(
            user_id=user.id,
            name=name,
            tee=daten.get('tee', 'gelb'),
            region=daten.get('region', 'Eigene Clubs'),
            city=daten.get('city', ''),
            par18=daten.get('par18') or None,
            cr18=daten.get('cr18') or None,
            sr18=daten.get('sr18') or None,
            par9=daten.get('par9') or None,
            cr9=daten.get('cr9') or None,
            sr9=daten.get('sr9') or None
        )
        db.session.add(neuer_club)
        db.session.commit()
        return jsonify({"nachricht": "Club erfolgreich gespeichert.", "club": neuer_club.to_dict()}), 201

@app.route('/api/clubs/<int:club_id>', methods=['DELETE'])
def delete_club(club_id):
    """Löscht einen benutzerdefinierten Club."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    club = Club.query.filter_by(id=club_id, user_id=user.id).first()
    if not club:
        return jsonify({"fehler": "Club nicht gefunden oder Standard-Club."}), 404

    db.session.delete(club)
    db.session.commit()
    return jsonify({"nachricht": "Club erfolgreich gelöscht."}), 200

@app.route('/api/turniere', methods=['GET', 'POST'])
def turniere_endpoint():
    """Gibt Turniere zurück oder legt ein neues Turnier für einen Club an."""
    user = get_current_user()

    if request.method == 'GET':
        club_filter = request.args.get('club')
        query = Turnier.query
        if club_filter:
            query = query.filter_by(club_name=club_filter)
        turniere_db = query.all()
        return jsonify([t.to_dict() for t in turniere_db]), 200

    elif request.method == 'POST':
        daten = request.get_json(silent=True) or {}
        club_name = daten.get('club_name', '').strip()
        name = daten.get('name', '').strip()
        datum = daten.get('datum', '').strip()
        loecher = int(daten.get('loecher', 18))
        spielform = daten.get('spielform', 'Stableford')
        vorgabewirksam = bool(daten.get('vorgabewirksam', True))

        if not club_name or not name or not datum:
            return jsonify({"fehler": "Clubname, Turniername und Datum sind erforderlich."}), 400

        turnier = Turnier(
            club_name=club_name,
            name=name,
            datum=datum,
            loecher=loecher,
            spielform=spielform,
            vorgabewirksam=vorgabewirksam,
            user_id=user.id if user else None
        )
        db.session.add(turnier)
        db.session.commit()
        return jsonify({"nachricht": "Turnier erfolgreich erstellt.", "turnier": turnier.to_dict()}), 201

@app.route('/api/turniere/<int:turnier_id>', methods=['DELETE'])
def delete_turnier(turnier_id):
    """Löscht ein Turnier."""
    user = get_current_user()
    turnier = db.session.get(Turnier, turnier_id)
    if not turnier:
        return jsonify({"fehler": "Turnier nicht gefunden."}), 404

    db.session.delete(turnier)
    db.session.commit()
    return jsonify({"nachricht": "Turnier gelöscht."}), 200

# --- 7. ADMIN ENDPOINTS ---

@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    """Gibt alle registrierten Benutzer für den Admin-Bereich zurück."""
    current_user = get_current_user()
    if not current_user or not current_user.is_admin:
        return jsonify({"fehler": "Zugriff verweigert. Nur Administratoren dürfen diesen Bereich einsehen."}), 403

    users = User.query.order_by(User.id.asc()).all()
    return jsonify([u.to_dict() for u in users]), 200

@app.route('/api/admin/users/<int:target_user_id>', methods=['DELETE'])
def admin_delete_user(target_user_id):
    """Löscht einen Benutzer und alle verknüpften Daten (CASCADE)."""
    current_user = get_current_user()
    if not current_user or not current_user.is_admin:
        return jsonify({"fehler": "Zugriff verweigert. Nur Administratoren dürfen Benutzer löschen."}), 403

    if current_user.id == target_user_id:
        return jsonify({"fehler": "Du kannst dein eigenes Administratorkonto nicht löschen."}), 400

    target = db.session.get(User, target_user_id)
    if not target:
        return jsonify({"fehler": "Benutzer nicht gefunden."}), 404

    target_name = target.username
    db.session.delete(target)
    db.session.commit()
    return jsonify({"nachricht": f"Benutzer '{target_name}' und alle zugehörigen Daten wurden erfolgreich gelöscht."}), 200

@app.route('/api/admin/users/<int:target_user_id>/toggle-admin', methods=['POST'])
def admin_toggle_role(target_user_id):
    """Schaltet den Administrator-Status eines Benutzers um."""
    current_user = get_current_user()
    if not current_user or not current_user.is_admin:
        return jsonify({"fehler": "Zugriff verweigert."}), 403

    target = db.session.get(User, target_user_id)
    if not target:
        return jsonify({"fehler": "Benutzer nicht gefunden."}), 404

    if current_user.id == target_user_id:
        return jsonify({"fehler": "Du kannst deine eigenen Administrator-Rechte nicht selbst entziehen."}), 400

    target.is_admin = not target.is_admin
    db.session.commit()
    return jsonify({"nachricht": f"Rolle für '{target.username}' aktualisiert.", "user": target.to_dict()}), 200

# --- 8. FAVORITEN ENDPOINTS ---

@app.route('/api/favorites/clubs', methods=['GET'])
def get_favorite_clubs():
    """Gibt alle favorisierten Clubs des eingeloggten Nutzers zurück."""
    user = get_current_user()
    if not user:
        return jsonify([]), 200
    favs = FavoriteClub.query.filter_by(user_id=user.id).all()
    return jsonify([f.club_name for f in favs]), 200

@app.route('/api/favorites/clubs/<path:club_name>', methods=['POST'])
def toggle_favorite_club(club_name):
    """Fügt einen Club zu den Favoriten hinzu oder entfernt ihn."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Bitte anmelde, um Favoriten zu speichern."}), 401

    fav = FavoriteClub.query.filter_by(user_id=user.id, club_name=club_name).first()
    if fav:
        db.session.delete(fav)
        is_fav = False
    else:
        new_fav = FavoriteClub(user_id=user.id, club_name=club_name)
        db.session.add(new_fav)
        is_fav = True

    db.session.commit()
    all_favs = [f.club_name for f in FavoriteClub.query.filter_by(user_id=user.id).all()]
    return jsonify({
        "nachricht": f"Club {'zu Favoriten hinzugefügt' if is_fav else 'aus Favoriten entfernt'}.",
        "is_favorite": is_fav,
        "favorites": all_favs
    }), 200

# --- 9. FREUNDE & LEADERBOARD ENDPOINTS ---

def calculate_whs_hcp(runden_list):
    """Berechnet den offiziellen WHS Handicap Index aus den gespielten Runden."""
    if not runden_list:
        return None
    sds = [r.sd for r in runden_list[-20:]]
    n = len(sds)
    if n == 0:
        return None
    sorted_sds = sorted(sds)
    if n <= 3:
        return round(sorted_sds[0] - 2.0, 1)
    elif n == 4:
        return round(sorted_sds[0] - 1.0, 1)
    elif n == 5:
        return round(sorted_sds[0], 1)
    elif n == 6:
        return round((sum(sorted_sds[:2]) / 2.0) - 1.0, 1)
    elif n in (7, 8):
        return round(sum(sorted_sds[:2]) / 2.0, 1)
    elif n in (9, 10, 11):
        return round(sum(sorted_sds[:3]) / 3.0, 1)
    elif n in (12, 13, 14):
        return round(sum(sorted_sds[:4]) / 4.0, 1)
    elif n in (15, 16):
        return round(sum(sorted_sds[:5]) / 5.0, 1)
    elif n in (17, 18):
        return round(sum(sorted_sds[:6]) / 6.0, 1)
    elif n == 19:
        return round(sum(sorted_sds[:7]) / 7.0, 1)
    else:
        return round(sum(sorted_sds[:8]) / 8.0, 1)

@app.route('/api/friends', methods=['GET'])
def get_friends():
    """Gibt Freunde und ausstehende Freundschaftsanfragen zurück."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    # Akzeptierte Freundschaften
    friendships = Friendship.query.filter(
        ((Friendship.user_id == user.id) | (Friendship.friend_id == user.id)),
        Friendship.status == 'accepted'
    ).all()

    friend_users = []
    for f in friendships:
        f_user_id = f.friend_id if f.user_id == user.id else f.user_id
        f_user = db.session.get(User, f_user_id)
        if f_user:
            hcp = calculate_whs_hcp(f_user.runden)
            friend_users.append({
                "id": f_user.id,
                "username": f_user.username,
                "email": f_user.email or "",
                "hcp": hcp,
                "runden_count": len(f_user.runden),
                "friendship_id": f.id
            })

    # Erhaltene ausstehende Anfragen
    received = []
    for req in Friendship.query.filter_by(friend_id=user.id, status='pending').all():
        sender = db.session.get(User, req.user_id)
        if sender:
            received.append({
                "request_id": req.id,
                "user_id": sender.id,
                "username": sender.username,
                "created_at": req.created_at.isoformat()
            })

    # Gesendete ausstehende Anfragen
    sent = []
    for req in Friendship.query.filter_by(user_id=user.id, status='pending').all():
        target = db.session.get(User, req.friend_id)
        if target:
            sent.append({
                "request_id": req.id,
                "user_id": target.id,
                "username": target.username,
                "created_at": req.created_at.isoformat()
            })

    return jsonify({
        "friends": friend_users,
        "pending_received": received,
        "pending_sent": sent
    }), 200

@app.route('/api/friends/request', methods=['POST'])
def send_friend_request():
    """Sendet eine Freundschaftsanfrage via Benutzername oder E-Mail."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    daten = request.get_json(silent=True) or {}
    ident = daten.get('identifier', '').strip().lower()
    if not ident:
        return jsonify({"fehler": "Bitte Benutzername oder E-Mail angeben."}), 400

    target = User.query.filter(
        (func.lower(User.username) == ident) | (func.lower(User.email) == ident)
    ).first()

    if not target:
        return jsonify({"fehler": "Kein Golfer mit diesem Namen oder dieser E-Mail gefunden."}), 404

    if target.id == user.id:
        return jsonify({"fehler": "Du kannst dir selbst keine Freundschaftsanfrage senden."}), 400

    existing = Friendship.query.filter(
        ((Friendship.user_id == user.id) & (Friendship.friend_id == target.id)) |
        ((Friendship.user_id == target.id) & (Friendship.friend_id == user.id))
    ).first()

    if existing:
        if existing.status == 'accepted':
            return jsonify({"fehler": "Ihr seid bereits befreundet!"}), 409
        elif existing.user_id == user.id:
            return jsonify({"fehler": "Anfrage wurde bereits gesendet und wartet auf Bestätigung."}), 409
        else:
            existing.status = 'accepted'
            db.session.commit()
            return jsonify({"nachricht": f"Freundschaftsanfrage von '{target.username}' angenommen!"}), 200

    new_req = Friendship(user_id=user.id, friend_id=target.id, status='pending')
    db.session.add(new_req)
    db.session.commit()
    return jsonify({"nachricht": f"Freundschaftsanfrage an '{target.username}' gesendet!"}), 201

@app.route('/api/friends/respond', methods=['POST'])
def respond_friend_request():
    """Nimmt eine Freundschaftsanfrage an oder lehnt sie ab."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    daten = request.get_json(silent=True) or {}
    req_id = daten.get('request_id')
    action = daten.get('action')  # 'accept' oder 'reject'

    req = db.session.get(Friendship, req_id)
    if not req or req.friend_id != user.id:
        return jsonify({"fehler": "Anfrage nicht gefunden."}), 404

    if action == 'accept':
        req.status = 'accepted'
        db.session.commit()
        return jsonify({"nachricht": "Freundschaftsanfrage angenommen!"}), 200
    else:
        db.session.delete(req)
        db.session.commit()
        return jsonify({"nachricht": "Freundschaftsanfrage abgelehnt."}), 200

@app.route('/api/friends/<int:friend_id>', methods=['DELETE'])
def remove_friend(friend_id):
    """Entfernt eine bestehende Freundschaft."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    f = Friendship.query.filter(
        ((Friendship.user_id == user.id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == user.id))
    ).first()

    if f:
        db.session.delete(f)
        db.session.commit()
    return jsonify({"nachricht": "Freundschaft entfernt."}), 200

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Liefert die Bestenliste (Community oder Freunde)."""
    user = get_current_user()
    scope = request.args.get('scope', 'all')

    if scope == 'friends' and user:
        friend_ids = {user.id}
        friendships = Friendship.query.filter(
            ((Friendship.user_id == user.id) | (Friendship.friend_id == user.id)),
            Friendship.status == 'accepted'
        ).all()
        for f in friendships:
            friend_ids.add(f.friend_id if f.user_id == user.id else f.user_id)
        users = User.query.filter(User.id.in_(friend_ids)).all()
    else:
        users = User.query.all()

    ranking = []
    for u in users:
        hcp = calculate_whs_hcp(u.runden)
        best_sd = min([r.sd for r in u.runden], default=None)
        best_gross = min([r.brutto for r in u.runden], default=None)
        ranking.append({
            "user_id": u.id,
            "username": u.username,
            "hcp": hcp,
            "best_sd": best_sd,
            "best_gross": best_gross,
            "runden_count": len(u.runden),
            "is_current_user": bool(user and u.id == user.id)
        })

    # Sortieren: Zuerst nach HCP aufsteigend, dann nach gespielten Runden absteigend
    ranking.sort(key=lambda x: (
        x["hcp"] if x["hcp"] is not None else 999.0,
        -x["runden_count"]
    ))

    # Rang-Nummerierung hinzufügen
    for idx, item in enumerate(ranking, 1):
        item["rank"] = idx

    return jsonify(ranking), 200

# --- 10. TURNIER-ANMELDUNG & FLIGHTS ENDPOINTS ---

@app.route('/api/turniere/<int:turnier_id>/register', methods=['POST'])
def register_for_turnier(turnier_id):
    """Meldet den aktuellen Benutzer für ein Club-Turnier an."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Bitte melde dich an, um am Turnier teilzunehmen."}), 401

    turnier = db.session.get(Turnier, turnier_id)
    if not turnier:
        return jsonify({"fehler": "Turnier nicht gefunden."}), 404

    existing = TournamentRegistration.query.filter_by(turnier_id=turnier_id, user_id=user.id).first()
    if existing:
        return jsonify({"nachricht": "Du bist bereits für dieses Turnier gemeldet.", "registration": existing.to_dict()}), 200

    daten = request.get_json(silent=True) or {}
    hcp = calculate_whs_hcp(user.runden) or daten.get('handicap_index')

    count = TournamentRegistration.query.filter_by(turnier_id=turnier_id).count()
    flight_no = (count // 4) + 1
    minute_offset = (count // 4) * 10
    start_hour = 9 + (minute_offset // 60)
    start_min = minute_offset % 60
    start_time = f"{start_hour:02d}:{start_min:02d}"

    reg = TournamentRegistration(
        turnier_id=turnier_id,
        user_id=user.id,
        flight_number=flight_no,
        start_time=start_time,
        handicap_index=hcp
    )
    db.session.add(reg)
    db.session.commit()

    return jsonify({
        "nachricht": f"Du wurdest erfolgreich für '{turnier.name}' in Flight {flight_no} angemeldet!",
        "registration": reg.to_dict()
    }), 201

@app.route('/api/turniere/<int:turnier_id>/participants', methods=['GET'])
def get_turnier_participants(turnier_id):
    """Liefert alle angemeldeten Teilnehmer und Flights für ein Turnier."""
    turnier = db.session.get(Turnier, turnier_id)
    if not turnier:
        return jsonify({"fehler": "Turnier nicht gefunden."}), 404

    regs = TournamentRegistration.query.filter_by(turnier_id=turnier_id).order_by(TournamentRegistration.flight_number.asc()).all()
    return jsonify([r.to_dict() for r in regs]), 200

@app.route('/api/flights', methods=['POST'])
def create_flight():
    """Erstellt einen neuen Live-Flight für geteilte Team-Scorekarten."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    daten = request.get_json(silent=True) or {}
    code = secrets.token_hex(3).upper()
    flight = Flight(
        flight_code=code,
        turnier_id=daten.get('turnier_id'),
        club_name=daten.get('club_name', 'Golfclub'),
        datum=daten.get('datum', datetime.utcnow().strftime('%d.%m.%Y')),
        name=daten.get('name') or f"Flight {code}",
        created_by_user_id=user.id,
        scores_data=json.dumps(daten.get('scores', {}))
    )
    db.session.add(flight)
    db.session.commit()
    return jsonify({"nachricht": "Flight erfolgreich erstellt!", "flight": flight.to_dict()}), 201

@app.route('/api/flights/<string:code_or_id>', methods=['GET'])
def get_flight(code_or_id):
    """Ruft einen Flight anhand seines Codes oder seiner ID ab."""
    flight = Flight.query.filter(
        (Flight.flight_code == code_or_id.upper()) |
        (Flight.id == (int(code_or_id) if code_or_id.isdigit() else -1))
    ).first()
    if not flight:
        return jsonify({"fehler": "Flight nicht gefunden."}), 404
    return jsonify(flight.to_dict()), 200

@app.route('/api/flights/<string:code_or_id>/score', methods=['POST'])
def update_flight_score(code_or_id):
    """Aktualisiert einen Loch-Score für einen Spieler im gemeinsamen Flight."""
    user = get_current_user()
    flight = Flight.query.filter(
        (Flight.flight_code == code_or_id.upper()) |
        (Flight.id == (int(code_or_id) if code_or_id.isdigit() else -1))
    ).first()
    if not flight:
        return jsonify({"fehler": "Flight nicht gefunden."}), 404

    daten = request.get_json(silent=True) or {}
    player_name = daten.get('player_name', user.username if user else "Golfer")
    hole = str(daten.get('hole', '1'))

    scores = json.loads(flight.scores_data or '{}')
    if hole not in scores:
        scores[hole] = {}

    scores[hole][player_name] = {
        "gross": int(daten.get('gross', 0)),
        "net": int(daten.get('net', 0)),
        "points": int(daten.get('points', 0))
    }
    flight.scores_data = json.dumps(scores)
    db.session.commit()
    return jsonify({"nachricht": "Score aktualisiert.", "scores": scores}), 200

# --- 11. DIGITALE SCOREKARTE & PC CADDIE EXPORT ENDPOINTS ---

@app.route('/api/scorecards', methods=['POST'])
def create_scorecard():
    """Speichert eine vollständige Turnier-Scorekarte mit Unterschriften & GPS-Audit."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    daten = request.get_json(silent=True) or {}
    club_name = daten.get('club_name', '').strip()
    lat = daten.get('gps_latitude')
    lon = daten.get('gps_longitude')

    gps_verified = False
    dist_km = None
    club = Club.query.filter_by(name=club_name).first()
    if club and club.lat is not None and lat is not None and lon is not None:
        dist_km = calculate_distance_km(lat, lon, club.lat, club.lon)
        if dist_km is not None and dist_km <= 3.5:
            gps_verified = True

    audit_token = generate_gps_audit_token(user.id, club_name, lat or 0.0, lon or 0.0) if gps_verified else None

    card = Scorecard(
        user_id=user.id,
        turnier_id=daten.get('turnier_id'),
        club_name=club_name,
        datum=daten.get('datum', datetime.utcnow().strftime('%d.%m.%Y')),
        loecher=int(daten.get('loecher', 18)),
        course_rating=float(daten.get('course_rating', 72.0)) if daten.get('course_rating') else None,
        slope_rating=float(daten.get('slope_rating', 113.0)) if daten.get('slope_rating') else None,
        par=float(daten.get('par', 72.0)) if daten.get('par') else None,
        playing_hcp=int(daten.get('playing_hcp', 0)),
        handicap_index=float(daten.get('handicap_index', 0.0)) if daten.get('handicap_index') is not None else None,
        brutto=int(daten.get('brutto', 0)),
        netto=int(daten.get('netto', 0)),
        stableford=int(daten.get('stableford', 0)),
        holes_json=json.dumps(daten.get('holes', [])),
        player_signature=daten.get('player_signature'),
        marker_signature=daten.get('marker_signature'),
        marker_name=daten.get('marker_name', ''),
        gps_latitude=lat,
        gps_longitude=lon,
        gps_verified=gps_verified,
        gps_distance_km=dist_km,
        gps_audit_token=audit_token
    )
    db.session.add(card)

    # Optional: Automatisch in Runden-Historie für Handicap übernehmen
    if daten.get('save_as_round', True):
        cr = card.course_rating or 72.0
        sr = card.slope_rating or 113.0
        brutto = card.brutto
        sd = round((113.0 / sr) * (brutto - cr), 1)
        runde = Runde(
            user_id=user.id,
            datum=card.datum,
            club_name=card.club_name,
            loecher=card.loecher,
            brutto=brutto,
            sd=sd
        )
        db.session.add(runde)

    db.session.commit()

    return jsonify({
        "nachricht": "Turnier-Scorekarte erfolgreich signiert und archiviert!",
        "scorecard": card.to_dict(),
        "gps_verified": gps_verified,
        "gps_distance_km": dist_km,
        "pccaddy_csv_url": f"/api/scorecards/{card.id}/pccaddy.csv"
    }), 201

@app.route('/api/scorecards/<int:card_id>', methods=['GET'])
def get_scorecard(card_id):
    """Ruft eine Scorekarte ab."""
    card = db.session.get(Scorecard, card_id)
    if not card:
        return jsonify({"fehler": "Scorekarte nicht gefunden."}), 404
    return jsonify(card.to_dict()), 200

@app.route('/api/scorecards/<int:card_id>/pccaddy.csv', methods=['GET'])
def export_pccaddy_csv(card_id):
    """Generiert den offiziellen PC CADDIE CSV-Export einer Scorekarte."""
    card = db.session.get(Scorecard, card_id)
    if not card:
        return jsonify({"fehler": "Scorekarte nicht gefunden."}), 404

    holes = json.loads(card.holes_json or '[]')
    l_cols = [str(h.get('gross', '-')) for h in holes]
    while len(l_cols) < 18:
        l_cols.append('-')

    row = [
        "PCC_SCORECARD_v2",
        str(card.turnier_id or "Privatrunde"),
        f'"{card.club_name}"',
        card.datum,
        f'"{card.user.username}"',
        str(card.handicap_index if card.handicap_index is not None else ""),
        str(card.playing_hcp),
    ] + l_cols[:18] + [
        str(card.brutto),
        str(card.netto),
        str(card.stableford),
        f'"{card.marker_name or ""}"',
        "JA" if card.player_signature else "NEIN",
        "JA" if card.marker_signature else "NEIN",
        "JA" if card.gps_verified else "NEIN",
        str(card.gps_distance_km or ""),
        str(card.gps_audit_token or "")
    ]

    csv_header = "PCC_SCORECARD_v2;Turnier-ID;Golfclub;Datum;Spieler;Stammvorgabe;Spielvorgabe;" + ";".join([f"Loch_{i}" for i in range(1, 19)]) + ";Brutto;Netto;Stableford;Zaehler;Signatur_Spieler;Signatur_Zaehler;GPS_Verifiziert;GPS_Distanz_km;GPS_Audit_Token\n"
    csv_content = csv_header + ";".join(row) + "\n"

    response = Response(csv_content, mimetype='text/csv; charset=utf-8')
    response.headers['Content-Disposition'] = f'attachment; filename="pccaddy_scorecard_{card.id}.csv"'
    return response

# --- 12. STATIC WEBPAGE SERVING ---

@app.route('/')
def index():
    """Liefert die Frontend HTML-Seite aus."""
    return send_from_directory(basis_ordner, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """Liefert zusätzliche statische Dateien (z.B. CSS, JS, Bilder) aus."""
    file_path = os.path.join(basis_ordner, path)
    if os.path.isfile(file_path):
        return send_from_directory(basis_ordner, path)
    return send_from_directory(basis_ordner, 'index.html')

# --- 8. START DES LOKALEN ENTWICKLUNGSSERVERS ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 GolfApp Server läuft auf http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
