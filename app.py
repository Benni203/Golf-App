import os
import io
import math
import hashlib
import json
import secrets
import smtplib
import csv
import re
import urllib.parse
import urllib.request
import ssl
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, or_
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

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

if db_url and 'postgresql' in db_url:
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_size': 10,
        'max_overflow': 20
    }

limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=[],
    storage_uri="memory://"
)

@app.errorhandler(429)
def ratelimit_handler(e):
    retry_after = getattr(e, 'retry_after', None) or 30
    return jsonify({
        "fehler": f"Zu viele Anfragen. Bitte warte {retry_after} Sekunden, bevor du es erneut versuchst.",
        "detail": str(e.description),
        "retry_after": retry_after
    }), 429

@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(self)'
    return response

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
    role = db.Column(db.String(20), default='player')  # 'player', 'club', 'admin'
    managed_club_name = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    runden = db.relationship('Runde', backref='user', cascade='all, delete-orphan', lazy=True)
    clubs = db.relationship('Club', backref='user', cascade='all, delete-orphan', lazy=True)
    turniere = db.relationship('Turnier', backref='user', cascade='all, delete-orphan', lazy=True)
    favorites = db.relationship('FavoriteClub', backref='user', cascade='all, delete-orphan', lazy=True)
    scorecards = db.relationship('Scorecard', backref='user', cascade='all, delete-orphan', lazy=True)
    registrations = db.relationship('TournamentRegistration', backref='user', cascade='all, delete-orphan', lazy=True)
    checkins = db.relationship('ClubLiveCheckin', backref='user', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email or "",
            "is_admin": bool(self.is_admin),
            "role": getattr(self, 'role', 'player') or 'player',
            "managed_club_name": getattr(self, 'managed_club_name', '') or "",
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

# --- STATISCHE REFERENZDATEN & KATALOGE (AUSGELAGERT IN catalog_data.py) ---
from catalog_data import (
    generate_course_holes,
    DEFAULT_HOLES_18,
    DEFAULT_HOLES_9,
    CATALOG_HOLES,
    get_katalog_holes_for_club,
    KATALOG_CLUBS,
    KATALOG_TURNIERE
)


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
    holes_data = db.Column(db.Text, nullable=True)
    pccaddie_url = db.Column(db.String(255), nullable=True)

    def get_holes_list(self):
        if self.holes_data:
            try:
                data = json.loads(self.holes_data)
                if isinstance(data, list) and len(data) in [9, 18]:
                    return data
            except Exception:
                pass
        return get_katalog_holes_for_club(self.name, self.par18, self.par9)

    @property
    def turniere(self):
        """Gibt alle Turniere zurück, die diesem Club zugeordnet sind."""
        return Turnier.query.filter_by(club_name=self.name).all()

    def to_dict(self):
        # Hole passende Turniere für diesen Club
        turniere_db = self.turniere
        encoded_name = urllib.parse.quote(f"{self.name} turnierkalender pccaddie")
        return {
            "id": self.id,
            "name": self.name,
            "tee": self.tee or "gelb",
            "region": self.region or "Deutschland",
            "city": self.city or "",
            "par18": self.par18 if self.par18 is not None else "",
            "cr18": self.cr18 if self.cr18 is not None else "",
            "sr18": self.sr18 if self.sr18 is not None else "",
            "par9": self.par9 if self.par9 is not None else "",
            "cr9": self.cr9 if self.cr9 is not None else "",
            "sr9": self.sr9 if self.sr9 is not None else "",
            "lat": self.lat,
            "lon": self.lon,
            "pccaddie_url": self.pccaddie_url or f"https://www.google.com/search?q={encoded_name}",
            "is_custom": bool(self.user_id),
            "holes": self.get_holes_list(),
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
    tee = db.Column(db.String(20), default='gelb')
    gps_latitude = db.Column(db.Float, nullable=True)
    gps_longitude = db.Column(db.Float, nullable=True)
    gps_verified = db.Column(db.Boolean, default=False)
    gps_distance_km = db.Column(db.Float, nullable=True)
    gps_audit_token = db.Column(db.String(128), nullable=True)
    submitted_to_club = db.Column(db.Boolean, default=False, index=True)
    submission_status = db.Column(db.String(30), default='draft', index=True)  # 'draft', 'submitted', 'verified', 'in_pccaddie', 'rejected'
    submitted_at = db.Column(db.DateTime, nullable=True)
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
            "tee": getattr(self, 'tee', 'gelb') or 'gelb',
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
            "player_signature": self.player_signature or "",
            "marker_signature": self.marker_signature or "",
            "marker_name": self.marker_name or "",
            "gps_verified": bool(self.gps_verified),
            "gps_distance_km": self.gps_distance_km,
            "gps_audit_token": self.gps_audit_token or "",
            "submitted_to_club": bool(getattr(self, 'submitted_to_club', False)),
            "submission_status": getattr(self, 'submission_status', 'draft') or 'draft',
            "submitted_at": self.submitted_at.isoformat() if getattr(self, 'submitted_at', None) else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class ClubLiveCheckin(db.Model):
    """Verwaltet serverseitige Live-Check-Ins von Spielern auf einem Golfplatz."""
    __tablename__ = 'club_live_checkins'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    club_name = db.Column(db.String(120), nullable=False, index=True)
    turnier_id = db.Column(db.Integer, db.ForeignKey('turniere.id', ondelete='SET NULL'), nullable=True)
    turnier_name = db.Column(db.String(120), nullable=True)
    tee = db.Column(db.String(20), default='gelb')
    loecher = db.Column(db.Integer, default=18)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(30), default='active', index=True)  # 'active', 'finished'

    def to_dict(self):
        user = db.session.get(User, self.user_id)
        now = datetime.utcnow()
        duration_minutes = int((now - self.started_at).total_seconds() / 60) if self.started_at else 0
        hcp = None
        try:
            if user and hasattr(user, 'runden') and user.runden:
                hcp = calculate_whs_hcp(user.runden)
        except Exception:
            hcp = None
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": user.username if user else "",
            "club_name": self.club_name,
            "turnier_id": self.turnier_id,
            "turnier_name": self.turnier_name or "",
            "tee": self.tee or "gelb",
            "loecher": self.loecher or 18,
            "handicap_index": hcp,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "started_at_time": self.started_at.strftime('%H:%M') if self.started_at else "",
            "duration_minutes": max(0, duration_minutes),
            "status": self.status
        }

def parse_pccaddy_turniere(content_str, fallback_club_name=""):
    """
    Parst PC CADDIE / Golf.de Turnierdaten aus iCalendar (.ics), CSV oder strukturiertem Text.
    Gibt eine Liste von Dictionaries zurück:
    [{'club_name': ..., 'name': ..., 'datum': 'DD.MM.YYYY', 'loecher': 9|18, 'spielform': ..., 'vorgabewirksam': bool}]
    """
    if not content_str:
        return []

    turniere = []

    # 1. Prüfen auf iCalendar (.ics)
    if "BEGIN:VEVENT" in content_str or "BEGIN:VCALENDAR" in content_str:
        # Entfalten von mehrzeiligen ICS-Feldern (RFC 5545: Folgezeilen mit Leading Space/Tab)
        unfolded = re.sub(r'\r?\n[ \t]', '', content_str)
        events = re.split(r'BEGIN:VEVENT', unfolded, flags=re.IGNORECASE)

        for ev in events[1:]:
            # Name / SUMMARY
            summary_m = re.search(r'SUMMARY(?::|;[^\r\n]*:)(.+?)(?:\r?\n|$)', ev, re.IGNORECASE)
            raw_summary = summary_m.group(1).strip() if summary_m else "Turnier"
            raw_summary = raw_summary.replace(r'\,', ',').replace(r'\;', ';').replace(r'\n', ' ')

            # Datum / DTSTART
            dt_m = re.search(r'DTSTART(?::|;[^\r\n]*:)(\d{8})(?:T\d{4,6}Z?)?', ev, re.IGNORECASE)
            datum = ""
            if dt_m:
                d_str = dt_m.group(1)  # YYYYMMDD
                try:
                    datum = f"{d_str[6:8]}.{d_str[4:6]}.{d_str[0:4]}"
                except Exception:
                    datum = ""
            else:
                # Alternative Suche nach YYYY-MM-DD
                alt_dt_m = re.search(r'DTSTART(?::|;[^\r\n]*:)(\d{4})-(\d{2})-(\d{2})', ev, re.IGNORECASE)
                if alt_dt_m:
                    datum = f"{alt_dt_m.group(3)}.{alt_dt_m.group(2)}.{alt_dt_m.group(1)}"

            if not datum:
                continue

            # DESCRIPTION
            desc_m = re.search(r'DESCRIPTION(?::|;[^\r\n]*:)(.+?)(?:\r?\n[A-Z-]+:|\r?\nEND:VEVENT|$)', ev, re.IGNORECASE | re.DOTALL)
            desc = desc_m.group(1).strip() if desc_m else ""
            desc = desc.replace(r'\,', ',').replace(r'\;', ';').replace(r'\n', ' ')

            # LOCATION (Club Name)
            loc_m = re.search(r'LOCATION(?::|;[^\r\n]*:)(.+?)(?:\r?\n|$)', ev, re.IGNORECASE)
            club_location = loc_m.group(1).strip() if loc_m else ""
            club_location = club_location.replace(r'\,', ',').replace(r'\;', ';')
            club_name = fallback_club_name or club_location or "Golfclub"

            combined_text = f"{raw_summary} {desc}".lower()

            # Löcher: 9 oder 18
            if any(term in combined_text for term in ["9-loch", "9 loch", " 9l", "after work 9", "kurzplatz", "9 holes"]):
                loecher = 9
            else:
                loecher = 18

            # Spielform
            if "scramble" in combined_text:
                spielform = "Scramble"
                vw = False
            elif "chapman" in combined_text or "vierer" in combined_text or "vierball" in combined_text:
                spielform = "Chapman-Vierer" if "chapman" in combined_text else "Vierer"
                vw = False
            elif "zählspiel" in combined_text or "zaehlspiel" in combined_text:
                spielform = "Zählspiel"
                vw = True
            else:
                spielform = "Stableford"
                vw = True

            # Vorgabewirksam explizit überschreiben falls angegeben
            if any(term in combined_text for term in ["nicht vorgabewirksam", "nicht vw", "vorgabenunwirksam", "privatturnier", "nicht hcpr", "nicht hcpi", "nicht handicaprelevant"]):
                vw = False
            elif any(term in combined_text for term in ["vorgabewirksam: ja", "hcpi-relevant", "vorgabenwirksam: ja", "handicaprelevant", "hcpr"]):
                vw = True

            # Team-Wettspiele (Vierer, Scramble) dürfen laut WHS/DGV niemals vorgabewirksam sein
            if spielform in ["Scramble", "Vierer", "Chapman-Vierer"]:
                vw = False

            turniere.append({
                "club_name": club_name,
                "name": raw_summary,
                "datum": datum,
                "loecher": loecher,
                "spielform": spielform,
                "vorgabewirksam": vw
            })

        return turniere

    # 2. Prüfen auf CSV / tabellarisches Format
    lines = [line.strip() for line in content_str.splitlines() if line.strip()]
    if not lines:
        return []

    # Prüfen auf Trennzeichen
    first_line = lines[0]
    delimiter = ';' if ';' in first_line else (',' if ',' in first_line else '\t')

    reader = csv.reader(lines, delimiter=delimiter)
    header = None
    rows = []

    for r in reader:
        if not r or not any(field.strip() for field in r):
            continue
        cleaned_row = [f.strip() for f in r]
        header_candidate = [c.lower() for c in cleaned_row]
        if any(h in header_candidate for h in ["datum", "date", "turnier", "turniername", "spielform", "löcher"]):
            header = header_candidate
            continue
        rows.append(cleaned_row)

    col_datum = -1
    col_name = -1
    col_loecher = -1
    col_spielform = -1
    col_vw = -1
    col_club = -1

    if header:
        for idx, col in enumerate(header):
            if any(term in col for term in ["datum", "date"]):
                col_datum = idx
            elif any(term in col for term in ["turniername", "turnier", "name", "titel", "bezeichnung"]):
                col_name = idx
            elif any(term in col for term in ["loch", "löcher", "loecher", "rundenlänge"]):
                col_loecher = idx
            elif any(term in col for term in ["spielform", "modus", "wettspielart"]):
                col_spielform = idx
            elif any(term in col for term in ["vorgabewirksam", "vw", "hcpi", "hcpi-relevant"]):
                col_vw = idx
            elif any(term in col for term in ["club", "platz", "golfclub"]):
                col_club = idx

    for row in rows:
        if not row:
            continue

        raw_datum = ""
        raw_name = ""
        raw_loecher = "18"
        raw_spielform = "Stableford"
        raw_vw = "Ja"
        raw_club = fallback_club_name

        if col_datum >= 0 and col_datum < len(row):
            raw_datum = row[col_datum]
        elif len(row) > 0:
            raw_datum = row[0]

        if col_name >= 0 and col_name < len(row):
            raw_name = row[col_name]
        elif len(row) > 1:
            raw_name = row[1]

        if col_loecher >= 0 and col_loecher < len(row):
            raw_loecher = row[col_loecher]
        elif len(row) > 2:
            raw_loecher = row[2]

        if col_spielform >= 0 and col_spielform < len(row):
            raw_spielform = row[col_spielform]
        elif len(row) > 3:
            raw_spielform = row[3]

        if col_vw >= 0 and col_vw < len(row):
            raw_vw = row[col_vw]
        elif len(row) > 4:
            raw_vw = row[4]

        if col_club >= 0 and col_club < len(row):
            raw_club = row[col_club] or fallback_club_name

        if not raw_name:
            continue

        # Datum normalisieren
        raw_datum = raw_datum.strip()
        datum = ""
        m_de = re.search(r'(\d{1,2})\.(\d{1,2})\.(\d{2,4})', raw_datum)
        if m_de:
            d, m, y = m_de.group(1).zfill(2), m_de.group(2).zfill(2), m_de.group(3)
            if len(y) == 2:
                y = f"20{y}"
            datum = f"{d}.{m}.{y}"
        else:
            m_iso = re.search(r'(\d{4})-(\d{2})-(\d{2})', raw_datum)
            if m_iso:
                datum = f"{m_iso.group(3)}.{m_iso.group(2)}.{m_iso.group(1)}"
            else:
                m_compact = re.search(r'(\d{4})(\d{2})(\d{2})', raw_datum)
                if m_compact:
                    datum = f"{m_compact.group(3)}.{m_compact.group(2)}.{m_compact.group(1)}"

        if not datum:
            continue

        loecher = 9 if ("9" in str(raw_loecher) or "9-loch" in raw_name.lower()) else 18

        sf_lower = str(raw_spielform).lower()
        if "scramble" in sf_lower:
            spielform = "Scramble"
            vw = False
        elif "vierer" in sf_lower or "chapman" in sf_lower or "vierball" in sf_lower:
            spielform = "Chapman-Vierer" if "chapman" in sf_lower else "Vierer"
            vw = False
        elif "zählspiel" in sf_lower or "zaehlspiel" in sf_lower:
            spielform = "Zählspiel"
            vw = True
        else:
            spielform = "Stableford"
            vw = True

        vw_lower = str(raw_vw).lower()
        if vw_lower in ["nein", "false", "0", "nvw", "nein/no", "unwirksam"]:
            vw = False
        elif vw_lower in ["ja", "true", "1", "vw", "ja/yes", "wirksam"]:
            vw = True

        if spielform in ["Scramble", "Vierer", "Chapman-Vierer"]:
            vw = False

        turniere.append({
            "club_name": raw_club or fallback_club_name or "Golfclub",
            "name": raw_name,
            "datum": datum,
            "loecher": loecher,
            "spielform": spielform,
            "vorgabewirksam": vw
        })

    return turniere


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

# --- DAUERHAFTE BENUTZER-PERSISTENZ (ÜBERLEBT SERVER-NEUSTARTS & DEPLOYMENTS) ---
PERSISTENT_USERS_FILE = os.path.join(basis_ordner, 'users_persistent.json')

def backup_users_to_file():
    """Sichert alle registrierten Benutzer dauerhaft in users_persistent.json ab."""
    try:
        users = User.query.all()
        records = []
        for u in users:
            records.append({
                "username": u.username,
                "email": u.email or "",
                "password_hash": u.password_hash,
                "role": getattr(u, 'role', 'player') or 'player',
                "managed_club_name": getattr(u, 'managed_club_name', '') or "",
                "is_admin": bool(u.is_admin),
                "created_at": u.created_at.isoformat() if u.created_at else None
            })
        with open(PERSISTENT_USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(records, f, indent=2, ensure_ascii=False)
        print(f"[AUTH BACKUP] ✅ {len(records)} Benutzer in users_persistent.json gesichert.")
    except Exception as e:
        print(f"[AUTH BACKUP] Warnung: Konnte Benutzer nicht in Datei sichern: {e}")

def restore_users_from_file():
    """Stellt Benutzer aus users_persistent.json wieder her (überlebt Server-Neustarts/Deployments)."""
    if not os.path.exists(PERSISTENT_USERS_FILE):
        return
    try:
        with open(PERSISTENT_USERS_FILE, 'r', encoding='utf-8') as f:
            records = json.load(f)
        restored = 0
        for rec in records:
            username = rec.get("username")
            if not username:
                continue
            existing = User.query.filter(
                (func.lower(User.username) == username.lower()) |
                (func.lower(User.email) == (rec.get("email") or '').lower())
            ).first()
            if not existing:
                u = User(
                    username=username,
                    email=rec.get("email") or "",
                    password_hash=rec.get("password_hash"),
                    role=rec.get("role", "player"),
                    managed_club_name=rec.get("managed_club_name"),
                    is_admin=bool(rec.get("is_admin", False)),
                    api_token=secrets.token_hex(32)
                )
                db.session.add(u)
                restored += 1
            else:
                if rec.get("role") and existing.role != rec.get("role"):
                    existing.role = rec.get("role")
                if rec.get("managed_club_name") and existing.managed_club_name != rec.get("managed_club_name"):
                    existing.managed_club_name = rec.get("managed_club_name")
        if restored > 0:
            db.session.commit()
            print(f"[AUTH RESTORE] ✅ {restored} Benutzer erfolgreich aus users_persistent.json restauriert!")
    except Exception as e:
        print(f"[AUTH RESTORE] Warnung beim Wiederherstellen: {e}")

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
                if club_cols and 'holes_data' not in club_cols:
                    cursor.execute("ALTER TABLE clubs ADD COLUMN holes_data TEXT")
                if club_cols and 'pccaddie_url' not in club_cols:
                    cursor.execute("ALTER TABLE clubs ADD COLUMN pccaddie_url VARCHAR(255)")

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
                if user_cols and 'role' not in user_cols:
                    cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'player'")
                if user_cols and 'managed_club_name' not in user_cols:
                    cursor.execute("ALTER TABLE users ADD COLUMN managed_club_name VARCHAR(120)")

                cursor.execute("PRAGMA table_info(scorecards)")
                sc_cols = [row[1] for row in cursor.fetchall()]
                if sc_cols and 'tee' not in sc_cols:
                    cursor.execute("ALTER TABLE scorecards ADD COLUMN tee VARCHAR(20) DEFAULT 'gelb'")
                if sc_cols and 'submitted_to_club' not in sc_cols:
                    cursor.execute("ALTER TABLE scorecards ADD COLUMN submitted_to_club BOOLEAN DEFAULT 0")
                if sc_cols and 'submission_status' not in sc_cols:
                    cursor.execute("ALTER TABLE scorecards ADD COLUMN submission_status VARCHAR(30) DEFAULT 'draft'")
                if sc_cols and 'submitted_at' not in sc_cols:
                    cursor.execute("ALTER TABLE scorecards ADD COLUMN submitted_at DATETIME")
                conn.connection.commit()
            elif db.engine.name == 'postgresql':
                from sqlalchemy import text
                conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS region VARCHAR(100) DEFAULT 'Schleswig-Holstein / Hamburg'"))
                conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT ''"))
                conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS lat FLOAT"))
                conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS lon FLOAT"))
                conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS holes_data TEXT"))
                conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS pccaddie_url VARCHAR(255)"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(120)"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(64)"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'player'"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_club_name VARCHAR(120)"))
                conn.execute(text("ALTER TABLE scorecards ADD COLUMN IF NOT EXISTS tee VARCHAR(20) DEFAULT 'gelb'"))
                conn.execute(text("ALTER TABLE scorecards ADD COLUMN IF NOT EXISTS submitted_to_club BOOLEAN DEFAULT FALSE"))
                conn.execute(text("ALTER TABLE scorecards ADD COLUMN IF NOT EXISTS submission_status VARCHAR(30) DEFAULT 'draft'"))
                conn.execute(text("ALTER TABLE scorecards ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP"))
                conn.commit()
    except Exception as e:
        print(f"Hinweis zur Tabellenmigration: {e}")

    # 2. Tabellen erstellen, falls noch nicht existent
    db.create_all()

    # 3. System-Clubs aktualisieren / seeden mit Koordinaten und Lochdaten
    try:
        system_clubs_count = Club.query.filter_by(user_id=None).count()
        sample_club = Club.query.filter_by(user_id=None).first()
        if system_clubs_count < len(KATALOG_CLUBS) or (sample_club and (sample_club.lat is None or sample_club.holes_data is None or sample_club.pccaddie_url is None)):
            Club.query.filter_by(user_id=None).delete()
            for c_data in KATALOG_CLUBS:
                holes = get_katalog_holes_for_club(c_data["name"], c_data.get("par18"), c_data.get("par9"))
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
                    pccaddie_url=c_data.get("pccaddie_url"),
                    holes_data=json.dumps(holes),
                    user_id=None
                )
                db.session.add(club)
        else:
            # Bestehende System-Clubs mit authentischen Lochdaten & pccaddie_url aktualisieren
            for c_data in KATALOG_CLUBS:
                existing_club = Club.query.filter_by(name=c_data["name"], user_id=None).first()
                if existing_club:
                    holes = get_katalog_holes_for_club(c_data["name"], c_data.get("par18"), c_data.get("par9"))
                    existing_club.holes_data = json.dumps(holes)
                    if c_data.get("pccaddie_url") and existing_club.pccaddie_url != c_data.get("pccaddie_url"):
                        existing_club.pccaddie_url = c_data.get("pccaddie_url")

        # 4. Turniere aktualisieren / seeden
        system_turniere = Turnier.query.filter_by(user_id=None).all()
        existing_keys = {(t.club_name, t.name) for t in system_turniere}
        catalog_keys = {(t["club_name"], t["name"]) for t in KATALOG_TURNIERE}
        if not catalog_keys.issubset(existing_keys):
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

        # 5. Standard-Benutzer erstellen, falls noch keine Benutzer existieren
        if User.query.count() == 0:
            default_user = User(
                username="benni",
                email="benni@golf.de",
                password_hash=generate_password_hash("GolfPassword2026!"),
                api_token=secrets.token_hex(32),
                role="admin",
                is_admin=True
            )
            db.session.add(default_user)
            db.session.commit()
        else:
            first_user = User.query.order_by(User.id.asc()).first()
            if first_user:
                if not first_user.is_admin:
                    first_user.is_admin = True
                if not getattr(first_user, 'role', None) or first_user.role != 'admin':
                    first_user.role = 'admin'
                db.session.commit()

        # 6. Standard Club-Account erstellen (GC Gut Jersbek), falls noch nicht existent
        club_user = User.query.filter_by(username="club_jersbek").first()
        if not club_user:
            club_user = User(
                username="club_jersbek",
                email="jersbek@golfapp.local",
                password_hash=generate_password_hash("GolfPassword2026!"),
                api_token=secrets.token_hex(32),
                role="club",
                managed_club_name="GC Gut Jersbek",
                is_admin=False
            )
            db.session.add(club_user)
            db.session.commit()
        elif not getattr(club_user, 'managed_club_name', None):
            club_user.managed_club_name = "GC Gut Jersbek"
            club_user.role = "club"
            db.session.commit()

        # 7. Benutzer aus permanenter Sicherungsdatei restaurieren & sichern
        restore_users_from_file()
        backup_users_to_file()
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

# --- VERSIONIERUNG & SYSTEMINFO ---
APP_VERSION = "1.2.0"

@app.route('/api/version', methods=['GET'])
def get_version():
    """Gibt aktuelle Versionsinformationen der Anwendung zurück."""
    return jsonify({
        "version": APP_VERSION,
        "name": "BirdieTrack Pro Golf Manager",
        "release_date": "2026-09-28",
        "environment": "production",
        "features": [
            "PC CADDIE & Golf.de Live-Turniersynchronisation",
            "Professionelle Benutzerauthentifizierung mit Sichtbarkeits-Toggle",
            "WHS Handicap Rechner & 20-Runden Differential Tracker",
            "GPS Distanz-Audit & Digitale Signaturen",
            "DSGVO Datenexport & Kontoverwaltung"
        ]
    }), 200

# --- 4. API ROUTEN: AUTH ---

@app.route('/api/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    """Registriert einen neuen Benutzer und liefert einen Auth-Token zurück."""
    daten = request.get_json(silent=True) or {}
    username = daten.get('username', '').strip()
    email = daten.get('email', '').strip().lower()
    password = daten.get('password', '')

    if not username or len(username) < 3:
        return jsonify({"fehler": "Benutzername muss mindestens 3 Zeichen lang sein."}), 400
    if not email or '@' not in email or '.' not in email:
        return jsonify({"fehler": "Bitte eine gültige E-Mail-Adresse angeben."}), 400
    if not password or len(password.strip()) < 4:
        return jsonify({"fehler": "Passwort muss mindestens 4 Zeichen lang sein."}), 400

    if User.query.filter(func.lower(User.username) == username.lower()).first():
        return jsonify({"fehler": "Dieser Benutzername ist bereits vergeben."}), 409

    if User.query.filter(func.lower(User.email) == email).first():
        return jsonify({"fehler": "Diese E-Mail-Adresse wird bereits verwendet."}), 409

    hashed_pw = generate_password_hash(password.strip())
    token = secrets.token_hex(32)

    role = daten.get('role', 'player').strip().lower()
    if role not in ('player', 'club'):
        role = 'player'
    managed_club_name = daten.get('managed_club_name', '').strip() if role == 'club' else None

    neuer_user = User(
        username=username,
        email=email,
        password_hash=hashed_pw,
        api_token=token,
        role=role,
        managed_club_name=managed_club_name
    )
    db.session.add(neuer_user)
    db.session.commit()
    backup_users_to_file()

    return jsonify({
        "nachricht": "Benutzer erfolgreich registriert!",
        "token": token,
        "user": neuer_user.to_dict(),
        "role": neuer_user.role,
        "managed_club_name": neuer_user.managed_club_name or ""
    }), 201

@app.route('/api/login', methods=['POST'])
@limiter.limit("30 per minute")
def login():
    """Prüft Logindaten (E-Mail oder Benutzername) und gibt neuen/aktuellen Token zurück."""
    daten = request.get_json(silent=True) or {}
    raw_ident = (daten.get('identifier') or daten.get('username') or daten.get('email') or '').strip()
    identifier = raw_ident.lower()
    clean_email = raw_ident.replace(' ', '').lower()
    password = daten.get('password', '')

    if not raw_ident or not password:
        return jsonify({"fehler": "Bitte E-Mail/Benutzername und Passwort eingeben."}), 400

    # 1. Schnelle Datenbank-Suche nach Benutzername oder E-Mail
    user = User.query.filter(
        (func.lower(User.username) == identifier) |
        (func.lower(User.email) == identifier) |
        (func.lower(User.email) == clean_email) |
        (User.username == raw_ident) |
        (User.email == raw_ident)
    ).first()

    # 2. In-Memory-Fallback bei Umlauten oder DB-spezifischer Unicode-Collation
    if not user and raw_ident:
        all_users = User.query.all()
        for u in all_users:
            u_name = (u.username or '').strip().lower()
            u_mail = (u.email or '').strip().lower()
            if u_name == identifier or (u_mail and (u_mail == identifier or u_mail == clean_email)):
                user = u
                break

    # 3. Bekannte Aliase für den Standard-Admin benni unterstützen (z. B. benjamin, benjamin.berndt@akquinet.de, benni@golf.de)
    if not user and identifier in ('benni', 'benjamin', 'benjamin.berndt@akquinet.de', 'benni@golf.de'):
        user = User.query.filter((User.username == 'benni') | (User.email == 'benjamin.berndt@akquinet.de') | (User.email == 'benni@golf.de')).first()

    if not user:
        # Fallback: Falls der Server-Container neugestartet wurde, Benutzer aus users_persistent.json nachladen
        restore_users_from_file()
        user = User.query.filter(
            (func.lower(User.username) == identifier) |
            (func.lower(User.email) == identifier) |
            (func.lower(User.email) == clean_email) |
            (User.username == raw_ident) |
            (User.email == raw_ident)
        ).first()

    if not user:
        print(f"[AUTH LOGIN] ❌ Benutzerkonto nicht gefunden für: '{raw_ident}'")
        return jsonify({
            "fehler": f"Kein Benutzerkonto mit '{raw_ident}' gefunden. Bitte registriere dich zuerst oder prüfe deine Eingabe."
        }), 401

    pw_ok = False
    if user and user.password_hash:
        for candidate_pw in (password, password.strip(), password.rstrip(), password.lstrip()):
            if check_password_hash(user.password_hash, candidate_pw):
                pw_ok = True
                break

    if not pw_ok:
        print(f"[AUTH LOGIN] ❌ Passwortprüfung fehlgeschlagen für Benutzer: '{user.username}' (E-Mail: '{user.email}')")
        return jsonify({
            "fehler": f"Das eingegebene Passwort für '{user.username}' ist nicht korrekt. Bitte prüfe deine Eingabe oder nutze 'Passwort vergessen'."
        }), 401

    user.api_token = secrets.token_hex(32)
    db.session.commit()
    print(f"[AUTH LOGIN] ✅ Login erfolgreich für: '{user.username}' (ID {user.id})")

    u_dict = user.to_dict()
    return jsonify({
        "nachricht": "Login erfolgreich!",
        "token": user.api_token,
        "user": u_dict,
        "id": user.id,
        "username": user.username,
        "email": user.email or "",
        "role": u_dict.get("role", "player"),
        "managed_club_name": u_dict.get("managed_club_name", ""),
        "is_admin": bool(user.is_admin)
    }), 200

@app.route('/api/forgot-password', methods=['POST'])
@limiter.limit("3 per minute")
def forgot_password():
    """Generiert einen 6-stelligen Bestätigungscode zum Zurücksetzen des Passworts."""
    daten = request.get_json(silent=True) or {}
    identifier = (daten.get('email') or daten.get('identifier') or daten.get('username') or '').strip().lower()

    if not identifier:
        return jsonify({"fehler": "Bitte gib deine E-Mail-Adresse oder deinen Benutzernamen ein."}), 400

    user = User.query.filter(
        (func.lower(User.email) == identifier) | (func.lower(User.username) == identifier)
    ).first()

    if not user and identifier in ('benni', 'benjamin', 'benjamin.berndt@akquinet.de', 'benni@golf.de'):
        user = User.query.filter((User.username == 'benni') | (User.email == 'benjamin.berndt@akquinet.de') | (User.email == 'benni@golf.de')).first()

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
@limiter.limit("5 per minute")
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

    if not user and identifier in ('benni', 'benjamin', 'benjamin.berndt@akquinet.de', 'benni@golf.de'):
        user = User.query.filter((User.username == 'benni') | (User.email == 'benjamin.berndt@akquinet.de') | (User.email == 'benni@golf.de')).first()

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
    backup_users_to_file()

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

    u_dict = user.to_dict()
    return jsonify({
        "user": u_dict,
        "id": user.id,
        "username": user.username,
        "email": user.email or "",
        "is_admin": bool(user.is_admin)
    }), 200

@app.route('/api/user/change-password', methods=['POST'])
@limiter.limit("5 per minute")
def change_password():
    """Erlaubt einem angemeldeten Benutzer, sein Passwort direkt zu ändern."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    daten = request.get_json(silent=True) or {}
    old_password = daten.get('old_password', '')
    new_password = daten.get('new_password', '')

    if not old_password or not new_password:
        return jsonify({"fehler": "Bitte aktuelles und neues Passwort eingeben."}), 400

    pw_ok = False
    if user.password_hash:
        pw_ok = check_password_hash(user.password_hash, old_password) or check_password_hash(user.password_hash, old_password.strip())

    if not pw_ok:
        return jsonify({"fehler": "Das aktuelle Passwort ist nicht korrekt."}), 400

    if len(new_password.strip()) < 4:
        return jsonify({"fehler": "Das neue Passwort muss mindestens 4 Zeichen lang sein."}), 400

    user.password_hash = generate_password_hash(new_password.strip())
    db.session.commit()
    backup_users_to_file()

    return jsonify({"nachricht": "Passwort erfolgreich geändert!"}), 200

@app.route('/api/system-status', methods=['GET'])
def system_status():
    """Liefert System- und Persistenzstatus der Datenbank und Benutzerverwaltung."""
    db_engine = db.engine.name
    users_count = User.query.count()
    has_backup = os.path.exists(PERSISTENT_USERS_FILE)
    backup_count = 0
    if has_backup:
        try:
            with open(PERSISTENT_USERS_FILE, 'r', encoding='utf-8') as f:
                backup_count = len(json.load(f))
        except Exception:
            pass

    return jsonify({
        "version": APP_VERSION,
        "database_type": db_engine,
        "is_postgresql": db_engine == 'postgresql',
        "is_persistent": db_engine == 'postgresql' or has_backup,
        "users_count": users_count,
        "backup_users_count": backup_count,
        "backup_file_active": has_backup
    }), 200

# --- DSGVO & PRO-STATS ENDPOINTS ---

@app.route('/api/user/export-data', methods=['GET'])
def export_user_data():
    """Art. 20 DSGVO: Vollständiger Datenexport des angemeldeten Benutzers als JSON."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    friendships = Friendship.query.filter(
        (Friendship.user_id == user.id) | (Friendship.friend_id == user.id)
    ).all()
    friends_list = []
    for f in friendships:
        f_user_id = f.friend_id if f.user_id == user.id else f.user_id
        f_user = db.session.get(User, f_user_id)
        if f_user:
            friends_list.append({"username": f_user.username, "status": f.status})

    export = {
        "export_metadata": {
            "application": "BirdieTrack",
            "export_date": datetime.utcnow().isoformat(),
            "gdpr_basis": "Art. 20 DSGVO - Recht auf Datenübertragbarkeit",
            "user_id": user.id,
            "username": user.username
        },
        "user_profile": {
            "id": user.id,
            "username": user.username,
            "email": user.email or "",
            "is_admin": bool(user.is_admin),
            "created_at": user.created_at.isoformat() if user.created_at else None
        },
        "rounds": [r.to_dict() for r in user.runden],
        "scorecards": [s.to_dict() for s in user.scorecards],
        "favorite_clubs": [f.club_name for f in user.favorites],
        "tournament_registrations": [t.to_dict() for t in user.registrations],
        "friends": friends_list,
        "custom_clubs": [c.to_dict() for c in user.clubs]
    }
    resp = Response(json.dumps(export, indent=2, ensure_ascii=False), mimetype='application/json; charset=utf-8')
    resp.headers['Content-Disposition'] = f'attachment; filename="birdietrack_export_{user.username}.json"'
    return resp

@app.route('/api/user/account', methods=['DELETE'])
def delete_own_account():
    """Art. 17 DSGVO: Unwiderrufliche Selbstlöschung des Kontos nach Passwortbestätigung."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    daten = request.get_json(silent=True) or {}
    password = daten.get('password', '').strip()
    if not password:
        return jsonify({"fehler": "Bitte gib dein aktuelles Passwort zur Bestätigung ein."}), 400

    if not check_password_hash(user.password_hash, password):
        return jsonify({"fehler": "Das eingegebene Passwort ist nicht korrekt."}), 403

    user_name = user.username
    user_id = user.id

    # Bereinige verknüpfte Freundschaften und erstellte Flights
    Friendship.query.filter((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)).delete(synchronize_session=False)
    Flight.query.filter(Flight.created_by_user_id == user_id).delete(synchronize_session=False)

    db.session.delete(user)
    db.session.commit()
    return jsonify({"nachricht": f"Dein Konto '{user_name}' und alle deine Daten wurden dauerhaft gelöscht."}), 200

@app.route('/api/user/pro-stats', methods=['GET'])
def get_user_pro_stats():
    """Berechnet detaillierte Profi-Statistiken (Putts, GIR, FIR) für den eingeloggten Golfer."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    scorecards = Scorecard.query.filter_by(user_id=user.id).order_by(Scorecard.id.desc()).all()

    total_holes = 0
    total_putts = 0
    holes_with_putts = 0
    total_gir = 0
    gir_opportunities = 0
    total_fir = 0
    fir_opportunities = 0
    fir_miss_left = 0
    fir_miss_right = 0

    rounds_summary = []

    for sc in scorecards:
        sc_putts = 0
        sc_gir = 0
        sc_fir = 0
        try:
            holes = json.loads(sc.holes_json or '[]')
        except Exception:
            holes = []

        for h in holes:
            total_holes += 1
            p = h.get('putts')
            if p is not None and str(p).isdigit():
                val = int(p)
                total_putts += val
                sc_putts += val
                holes_with_putts += 1

            gir = h.get('gir')
            par = int(h.get('par', 4))
            gross = h.get('gross') or h.get('strokes')
            if gir is True or str(gir).lower() in ('true', '1'):
                total_gir += 1
                sc_gir += 1
                gir_opportunities += 1
            elif gir is False or str(gir).lower() in ('false', '0'):
                gir_opportunities += 1
            elif gross is not None and str(gross).isdigit() and p is not None and str(p).isdigit():
                shots_to_green = int(gross) - int(p)
                gir_opportunities += 1
                if shots_to_green <= (par - 2):
                    total_gir += 1
                    sc_gir += 1

            fir = h.get('fir')
            if par >= 4:
                fir_opportunities += 1
                if fir in ('hit', 'center', 'yes', True) or str(fir).lower() in ('hit', 'center'):
                    total_fir += 1
                    sc_fir += 1
                elif fir in ('left', 'links') or str(fir).lower() in ('left', 'links'):
                    fir_miss_left += 1
                elif fir in ('right', 'rechts') or str(fir).lower() in ('right', 'rechts'):
                    fir_miss_right += 1

        rounds_summary.append({
            "scorecard_id": sc.id,
            "club_name": sc.club_name,
            "datum": sc.datum,
            "brutto": sc.brutto,
            "putts": sc_putts if sc_putts > 0 else None,
            "gir_count": sc_gir,
            "fir_count": sc_fir
        })

    avg_putts_hole = round(total_putts / holes_with_putts, 2) if holes_with_putts > 0 else None
    avg_putts_round = round((total_putts / holes_with_putts) * 18, 1) if holes_with_putts > 0 else None
    gir_pct = round((total_gir / gir_opportunities) * 100, 1) if gir_opportunities > 0 else None
    fir_pct = round((total_fir / fir_opportunities) * 100, 1) if fir_opportunities > 0 else None

    return jsonify({
        "total_scorecards": len(scorecards),
        "total_holes_analyzed": total_holes,
        "avg_putts_per_hole": avg_putts_hole,
        "avg_putts_per_round": avg_putts_round,
        "gir_percentage": gir_pct,
        "total_gir": total_gir,
        "gir_opportunities": gir_opportunities,
        "fir_percentage": fir_pct,
        "total_fir": total_fir,
        "fir_opportunities": fir_opportunities,
        "fir_miss_left": fir_miss_left,
        "fir_miss_right": fir_miss_right,
        "recent_rounds": rounds_summary[:10]
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

@app.route('/api/clubs/<int:club_id>', methods=['PUT'])
def update_club(club_id):
    """Aktualisiert einen benutzerdefinierten Club."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    club = Club.query.filter_by(id=club_id, user_id=user.id).first()
    if not club:
        return jsonify({"fehler": "Club nicht gefunden oder keine Berechtigung zum Bearbeiten."}), 404

    daten = request.get_json(silent=True) or {}
    name = daten.get('name', '').strip()
    if not name:
        return jsonify({"fehler": "Name des Clubs erforderlich."}), 400

    club.name = name
    club.tee = daten.get('tee', club.tee or 'gelb')
    club.region = daten.get('region', club.region or 'Eigene Clubs')
    club.city = daten.get('city', club.city or '')
    club.par18 = daten.get('par18') or None
    club.cr18 = daten.get('cr18') or None
    club.sr18 = daten.get('sr18') or None
    club.par9 = daten.get('par9') or None
    club.cr9 = daten.get('cr9') or None
    club.sr9 = daten.get('sr9') or None

    db.session.commit()
    return jsonify({"nachricht": "Club erfolgreich aktualisiert.", "club": club.to_dict()}), 200

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

@app.route('/api/clubs/<int:club_id>/turniere', methods=['GET'])
def get_club_turniere(club_id):
    """Gibt alle anstehenden Turniere eines bestimmten Golfclubs zurück."""
    club = db.session.get(Club, club_id)
    if not club:
        return jsonify({"fehler": f"Club mit ID {club_id} nicht gefunden."}), 404

    turniere = Turnier.query.filter_by(club_name=club.name).all()
    return jsonify({
        "club_id": club.id,
        "club_name": club.name,
        "count": len(turniere),
        "turniere": [t.to_dict() for t in turniere]
    }), 200

@app.route('/api/clubs/<int:club_id>/sync-pccaddy', methods=['POST'])
def sync_club_pccaddy(club_id):
    """
    Ruft Live-Turniere direkt von PC CADDIE://online (iCal ICS-Feed) für den Club ab
    und aktualisiert die Turniere in der Datenbank.
    """
    club = db.session.get(Club, club_id)
    if not club:
        return jsonify({"fehler": f"Club mit ID {club_id} nicht gefunden."}), 404

    user = get_current_user()

    # Bekannte PC CADDIE Feeds nach Club-Name-Muster
    known_feeds = {
        "jersbek": "https://www.pccaddie.net/clubs/0492230/app.php?cat=ts_calendar&sub=ics",
        "ahrensburg": "https://www.pccaddie.net/clubs/0492201/app.php?cat=ts_calendar&sub=ics",
        "falkenstein": "https://www.pccaddie.net/clubs/0492202/app.php?cat=ts_calendar&sub=ics",
        "holm": "https://www.pccaddie.net/clubs/0492203/app.php?cat=ts_calendar&sub=ics",
        "pinnau": "https://www.pccaddie.net/clubs/0492204/app.php?cat=ts_calendar&sub=ics",
        "walddörfer": "https://www.pccaddie.net/clubs/0492206/app.php?cat=ts_calendar&sub=ics",
        "wendlohe": "https://www.pccaddie.net/clubs/0492207/app.php?cat=ts_calendar&sub=ics",
        "escheburg": "https://www.pccaddie.net/clubs/0492233/app.php?cat=ts_calendar&sub=ics",
        "kaden": "https://www.pccaddie.net/clubs/0492221/app.php?cat=ts_calendar&sub=ics"
    }

    # URL aus Request, Club-Attribut oder Known Feeds ermitteln
    req_data = request.get_json(silent=True) or {}
    custom_url = req_data.get('url', '').strip()
    target_url = custom_url or club.pccaddie_url or ""

    if not target_url or "google.com" in target_url:
        club_lower = club.name.lower()
        for key, feed_url in known_feeds.items():
            if key in club_lower:
                target_url = feed_url
                break

    if not target_url or "google.com" in target_url:
        return jsonify({
            "fehler": f"Für '{club.name}' ist keine PC CADDIE URL konfiguriert. Bitte gib eine URL ein oder nutze den Datei-Import."
        }), 400

    # In direkten ICS-Feed umwandeln, falls noch normale Web-URL
    feed_url = target_url
    if "sub=ics" not in feed_url:
        if "cat=ts_calendar" in feed_url:
            feed_url = feed_url.replace("cat=ts_calendar", "cat=ts_calendar&sub=ics")
        else:
            feed_url += ("&" if "?" in feed_url else "?") + "sub=ics"

    # Club pccaddie_url aktualisieren falls noch nicht gesetzt
    if not club.pccaddie_url or "google.com" in club.pccaddie_url:
        club.pccaddie_url = target_url
        db.session.commit()

    # iCal Feed von PC CADDIE herunterladen
    try:
        ctx = ssl._create_unverified_context()
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        req = urllib.request.Request(feed_url, headers=headers)
        with urllib.request.urlopen(req, timeout=12, context=ctx) as response:
            content_str = response.read().decode('utf-8', errors='replace')
    except Exception as e:
        return jsonify({
            "fehler": f"Verbindung zu PC CADDIE ({feed_url}) fehlgeschlagen: {str(e)}"
        }), 502

    parsed = parse_pccaddy_turniere(content_str, fallback_club_name=club.name)
    if not parsed:
        return jsonify({
            "fehler": f"Vom PC CADDIE Server konnten keine Turniere für '{club.name}' eingelesen werden."
        }), 400

    # Bisherige Turniere für diesen Club löschen
    Turnier.query.filter_by(club_name=club.name).delete()

    is_pure_9_hole = (not club.par18 and club.par9)
    saved_turniere = []

    for item in parsed:
        loecher = 9 if is_pure_9_hole else item.get('loecher', 18)
        turnier = Turnier(
            club_name=club.name,
            name=item['name'],
            datum=item['datum'],
            loecher=loecher,
            spielform=item.get('spielform', 'Stableford'),
            vorgabewirksam=item.get('vorgabewirksam', True),
            user_id=user.id if user else None
        )
        db.session.add(turnier)
        saved_turniere.append(turnier)

    db.session.commit()

    return jsonify({
        "nachricht": f"{len(saved_turniere)} Turniere erfolgreich live von PC CADDIE synchronisiert!",
        "club_id": club.id,
        "club_name": club.name,
        "count": len(saved_turniere),
        "turniere": [t.to_dict() for t in saved_turniere]
    }), 200

@app.route('/api/clubs/<int:club_id>/import-pccaddy', methods=['POST'])
def import_club_turniere_pccaddy(club_id):
    """
    Importiert PC CADDIE / iCal / CSV Turnierkalender für einen Club.
    Akzeptiert Datei-Upload (file) oder JSON { "content": "...", "url": "...", "replace_existing": true }.
    """
    club = db.session.get(Club, club_id)
    if not club:
        return jsonify({"fehler": f"Club mit ID {club_id} nicht gefunden."}), 404

    user = get_current_user()
    content_str = ""
    replace_existing = True

    if 'file' in request.files:
        f = request.files['file']
        if f and f.filename:
            content_str = f.read().decode('utf-8', errors='replace')
        replace_existing = request.form.get('replace_existing', 'true').lower() in ['true', '1', 'ja']
    else:
        daten = request.get_json(silent=True) or {}
        content_str = daten.get('content', '')
        replace_existing = daten.get('replace_existing', True)
        url = daten.get('url', '').strip()
        if url and not content_str:
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; BirdieTrack/1.0)'})
                with urllib.request.urlopen(req, timeout=8) as response:
                    content_str = response.read().decode('utf-8', errors='replace')
            except Exception as e:
                return jsonify({"fehler": f"Fehler beim Laden der URL: {str(e)}"}), 400

    if not content_str.strip():
        return jsonify({"fehler": "Keine Kalenderdaten übermittelt (Datei, Text oder URL leer)."}), 400

    parsed = parse_pccaddy_turniere(content_str, fallback_club_name=club.name)
    if not parsed:
        return jsonify({"fehler": "Aus den bereitgestellten Daten konnten keine Turniere erkannt werden. Bitte ICS oder CSV Format prüfen."}), 400

    if replace_existing:
        Turnier.query.filter_by(club_name=club.name).delete()

    saved_turniere = []
    is_pure_9_hole = (not club.par18 and club.par9)

    for item in parsed:
        loecher = 9 if is_pure_9_hole else item.get('loecher', 18)
        turnier = Turnier(
            club_name=club.name,
            name=item['name'],
            datum=item['datum'],
            loecher=loecher,
            spielform=item.get('spielform', 'Stableford'),
            vorgabewirksam=item.get('vorgabewirksam', True),
            user_id=user.id if user else None
        )
        db.session.add(turnier)
        saved_turniere.append(turnier)

    db.session.commit()
    return jsonify({
        "nachricht": f"{len(saved_turniere)} Turniere für '{club.name}' erfolgreich importiert.",
        "club_id": club.id,
        "club_name": club.name,
        "count": len(saved_turniere),
        "turniere": [t.to_dict() for t in saved_turniere]
    }), 200

@app.route('/api/turniere/import-pccaddy', methods=['POST'])
def import_turniere_pccaddy():
    """
    Allgemeiner Import von PC CADDIE Daten, optional mit club_id oder club_name.
    """
    user = get_current_user()
    content_str = ""
    replace_existing = False
    club_name_fallback = ""
    club_id = None

    if 'file' in request.files:
        f = request.files['file']
        if f and f.filename:
            content_str = f.read().decode('utf-8', errors='replace')
        replace_existing = request.form.get('replace_existing', 'false').lower() in ['true', '1', 'ja']
        club_name_fallback = request.form.get('club_name', '').strip()
        club_id = request.form.get('club_id')
    else:
        daten = request.get_json(silent=True) or {}
        content_str = daten.get('content', '')
        replace_existing = daten.get('replace_existing', False)
        club_name_fallback = daten.get('club_name', '').strip()
        club_id = daten.get('club_id')
        url = daten.get('url', '').strip()
        if url and not content_str:
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; BirdieTrack/1.0)'})
                with urllib.request.urlopen(req, timeout=8) as response:
                    content_str = response.read().decode('utf-8', errors='replace')
            except Exception as e:
                return jsonify({"fehler": f"Fehler beim Laden der URL: {str(e)}"}), 400

    if club_id:
        try:
            c = db.session.get(Club, int(club_id))
            if c:
                club_name_fallback = c.name
        except Exception:
            pass

    if not content_str.strip():
        return jsonify({"fehler": "Keine Kalenderdaten übermittelt."}), 400

    parsed = parse_pccaddy_turniere(content_str, fallback_club_name=club_name_fallback)
    if not parsed:
        return jsonify({"fehler": "Aus den bereitgestellten Daten konnten keine Turniere erkannt werden."}), 400

    if replace_existing and club_name_fallback:
        Turnier.query.filter_by(club_name=club_name_fallback).delete()

    saved_turniere = []
    for item in parsed:
        target_club_name = item.get('club_name') or club_name_fallback or "Golfclub"
        loecher = item.get('loecher', 18)
        matching_club = Club.query.filter_by(name=target_club_name).first()
        if matching_club and not matching_club.par18 and matching_club.par9:
            loecher = 9

        turnier = Turnier(
            club_name=target_club_name,
            name=item['name'],
            datum=item['datum'],
            loecher=loecher,
            spielform=item.get('spielform', 'Stableford'),
            vorgabewirksam=item.get('vorgabewirksam', True),
            user_id=user.id if user else None
        )
        db.session.add(turnier)
        saved_turniere.append(turnier)

    db.session.commit()
    return jsonify({
        "nachricht": f"{len(saved_turniere)} Turniere erfolgreich importiert.",
        "count": len(saved_turniere),
        "turniere": [t.to_dict() for t in saved_turniere]
    }), 200

@app.route('/api/turniere', methods=['GET', 'POST'])
def turniere_endpoint():
    """Gibt Turniere zurück oder legt ein neues Turnier für einen Club an."""
    user = get_current_user()

    if request.method == 'GET':
        club_filter = request.args.get('club') or request.args.get('club_name')
        club_id = request.args.get('club_id')
        query = Turnier.query
        if club_id:
            try:
                club = db.session.get(Club, int(club_id))
                if club:
                    query = query.filter_by(club_name=club.name)
                else:
                    return jsonify([]), 200
            except (ValueError, TypeError):
                return jsonify([]), 200
        elif club_filter:
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
        tee=daten.get('tee', 'gelb'),
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
        gps_audit_token=audit_token,
        submitted_to_club=bool(daten.get('submit_to_club', True)),
        submission_status='submitted' if daten.get('submit_to_club', True) else 'draft',
        submitted_at=datetime.utcnow() if daten.get('submit_to_club', True) else None
    )
    db.session.add(card)

    # Falls der Spieler noch als aktiv auf dem Platz eingecheckt war, Check-In beenden
    ClubLiveCheckin.query.filter_by(user_id=user.id, club_name=club_name, status='active').update({'status': 'finished'})

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

@app.route('/api/scorecards', methods=['GET'])
def list_user_scorecards():
    """Gibt alle archivierten Scorekarten des aktuellen Benutzers zurück."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401
    cards = Scorecard.query.filter_by(user_id=user.id).order_by(Scorecard.id.desc()).all()
    return jsonify({"scorecards": [c.to_dict() for c in cards]}), 200

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

# --- 11b. CLUB PORTAL: LIVE-SPIELER, SCORECARD-EMPFANG & PC CADDIE BATCH EXPORT ---

def require_club_user(user):
    """Prüft, ob der angemeldete Benutzer ein Club-Account oder Administrator ist."""
    if not user:
        return False, "Authentifizierung erforderlich.", 401
    if not (user.is_admin or (hasattr(user, 'role') and user.role in ('club', 'admin'))):
        return False, "Zugriff verweigert: Nur für Club-Accounts und Administratoren.", 403
    return True, None, 200

@app.route('/api/club-portal/live-checkin', methods=['POST'])
def club_live_checkin():
    """Startet oder aktualisiert einen serverseitigen Check-In eines Spielers."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    daten = request.get_json(silent=True) or {}
    club_name = (daten.get('club_name') or '').strip()
    if not club_name:
        return jsonify({"fehler": "Club-Name erforderlich."}), 400

    turnier_id = daten.get('turnier_id')
    turnier_name = (daten.get('turnier_name') or '').strip()
    tee = daten.get('tee', 'gelb')
    try:
        loecher = int(daten.get('loecher', 18))
    except (ValueError, TypeError):
        loecher = 18

    # Vorherige aktive Check-Ins des Benutzers als beendet markieren
    ClubLiveCheckin.query.filter_by(user_id=user.id, status='active').update({'status': 'finished'})

    checkin = ClubLiveCheckin(
        user_id=user.id,
        club_name=club_name,
        turnier_id=turnier_id,
        turnier_name=turnier_name,
        tee=tee,
        loecher=loecher,
        started_at=datetime.utcnow(),
        status='active'
    )
    db.session.add(checkin)
    db.session.commit()

    return jsonify({
        "nachricht": f"Erfolgreich auf {club_name} eingecheckt!",
        "checkin": checkin.to_dict()
    }), 201

@app.route('/api/club-portal/live-checkout', methods=['POST'])
def club_live_checkout():
    """Beendet den aktiven Check-In eines Spielers (durch den Spieler selbst oder Club-Admin)."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    daten = request.get_json(silent=True) or {}
    checkin_id = daten.get('checkin_id')

    if checkin_id and (user.is_admin or (hasattr(user, 'role') and user.role == 'club')):
        checkin = db.session.get(ClubLiveCheckin, checkin_id)
        if checkin:
            checkin.status = 'finished'
            db.session.commit()
            return jsonify({"nachricht": f"Check-In #{checkin_id} beendet."}), 200
    else:
        ClubLiveCheckin.query.filter_by(user_id=user.id, status='active').update({'status': 'finished'})
        db.session.commit()
        return jsonify({"nachricht": "Check-In beendet."}), 200

    return jsonify({"nachricht": "Kein aktiver Check-In gefunden."}), 200

@app.route('/api/club-portal/live-players', methods=['GET'])
def club_live_players():
    """Liefert alle aktuell aktiven Spieler auf dem Platz des eingeloggten Clubs."""
    user = get_current_user()
    ok, err_msg, code = require_club_user(user)
    if not ok:
        return jsonify({"fehler": err_msg}), code

    target_club = request.args.get('club_name') or getattr(user, 'managed_club_name', '') or ''
    if not target_club and not user.is_admin:
        return jsonify({"fehler": "Kein Golfclub zugewiesen."}), 400

    query = ClubLiveCheckin.query.filter_by(status='active')
    if target_club:
        query = query.filter_by(club_name=target_club)

    active_checkins = query.order_by(ClubLiveCheckin.started_at.desc()).all()
    return jsonify({
        "club_name": target_club or "Alle Clubs",
        "count": len(active_checkins),
        "players": [c.to_dict() for c in active_checkins]
    }), 200

@app.route('/api/scorecards/<int:card_id>/submit-to-club', methods=['POST'])
def submit_scorecard_to_club(card_id):
    """Spieler reicht seine signierte Scorekarte digital beim Club ein."""
    user = get_current_user()
    if not user:
        return jsonify({"fehler": "Authentifizierung erforderlich."}), 401

    card = db.session.get(Scorecard, card_id)
    if not card:
        return jsonify({"fehler": "Scorekarte nicht gefunden."}), 404

    if card.user_id != user.id and not user.is_admin:
        return jsonify({"fehler": "Keine Berechtigung für diese Scorekarte."}), 403

    card.submitted_to_club = True
    card.submission_status = 'submitted'
    card.submitted_at = datetime.utcnow()

    # Falls der Spieler noch als aktiv auf dem Platz eingecheckt war, Check-In beenden
    ClubLiveCheckin.query.filter_by(user_id=user.id, club_name=card.club_name, status='active').update({'status': 'finished'})

    db.session.commit()

    return jsonify({
        "nachricht": f"Scorekarte erfolgreich an '{card.club_name}' übermittelt!",
        "scorecard": card.to_dict()
    }), 200

@app.route('/api/club-portal/scorecards', methods=['GET'])
def club_portal_scorecards():
    """Gibt alle an den Club übermittelten Scorekarten zurück (Inbox)."""
    user = get_current_user()
    ok, err_msg, code = require_club_user(user)
    if not ok:
        return jsonify({"fehler": err_msg}), code

    target_club = request.args.get('club_name') or getattr(user, 'managed_club_name', '') or ''
    if not target_club and not user.is_admin:
        return jsonify({"fehler": "Kein Golfclub zugewiesen."}), 400

    query = Scorecard.query.filter_by(submitted_to_club=True)
    if target_club:
        query = query.filter_by(club_name=target_club)

    status_filter = request.args.get('status')
    if status_filter and status_filter != 'all':
        query = query.filter_by(submission_status=status_filter)

    cards = query.order_by(Scorecard.submitted_at.desc(), Scorecard.id.desc()).all()
    return jsonify({
        "club_name": target_club or "Alle Clubs",
        "count": len(cards),
        "scorecards": [c.to_dict() for c in cards]
    }), 200

@app.route('/api/club-portal/scorecards/<int:card_id>/status', methods=['PUT'])
def update_club_scorecard_status(card_id):
    """Club-Manager aktualisiert den Bearbeitungsstatus einer eingereichten Scorekarte."""
    user = get_current_user()
    ok, err_msg, code = require_club_user(user)
    if not ok:
        return jsonify({"fehler": err_msg}), code

    card = db.session.get(Scorecard, card_id)
    if not card:
        return jsonify({"fehler": "Scorekarte nicht gefunden."}), 404

    target_club = getattr(user, 'managed_club_name', '')
    if target_club and card.club_name != target_club and not user.is_admin:
        return jsonify({"fehler": "Diese Scorekarte gehört nicht zu deinem Club."}), 403

    daten = request.get_json(silent=True) or {}
    new_status = daten.get('status', 'verified')
    if new_status not in ('draft', 'submitted', 'verified', 'in_pccaddie', 'rejected'):
        return jsonify({"fehler": "Ungültiger Status."}), 400

    card.submission_status = new_status
    db.session.commit()

    return jsonify({
        "nachricht": f"Status erfolgreich auf '{new_status}' geändert.",
        "scorecard": card.to_dict()
    }), 200

@app.route('/api/club-portal/export/pccaddie.csv', methods=['GET'])
def export_club_pccaddie_batch_csv():
    """Generiert einen offiziellen PC CADDIE Batch-CSV-Export aller eingereichten Scorekarten."""
    user = get_current_user()
    ok, err_msg, code = require_club_user(user)
    if not ok:
        return jsonify({"fehler": err_msg}), code

    target_club = request.args.get('club_name') or getattr(user, 'managed_club_name', '') or ''
    if not target_club and not user.is_admin:
        return jsonify({"fehler": "Kein Golfclub zugewiesen."}), 400

    query = Scorecard.query.filter_by(submitted_to_club=True)
    if target_club:
        query = query.filter_by(club_name=target_club)

    cards = query.order_by(Scorecard.datum.desc(), Scorecard.id.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')

    header = [
        "FORMAT", "TURNIER_ID", "CLUB", "DATUM", "SPIELER", "MARKER", "HCP_INDEX", "PLAYING_HCP", "TEE",
        "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9",
        "OUT_GROSS",
        "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17", "L18",
        "IN_GROSS", "TOTAL_GROSS", "TOTAL_NET", "STABLEFORD",
        "STATUS", "GPS_VERIFIED", "GPS_TOKEN"
    ]
    writer.writerow(header)

    for c in cards:
        holes = []
        try:
            holes = json.loads(c.holes_json or '[]')
        except Exception:
            holes = []

        gross_scores = [str(h.get('gross', '-')) for h in holes]
        while len(gross_scores) < 18:
            gross_scores.append('-')

        try:
            out_gross = sum(int(s) for s in gross_scores[:9] if str(s).isdigit())
            in_gross = sum(int(s) for s in gross_scores[9:18] if str(s).isdigit())
        except Exception:
            out_gross = '-'
            in_gross = '-'

        u = db.session.get(User, c.user_id)
        player_name = u.username if u else "Unbekannt"

        row = [
            "PCC_SCORECARD_v2",
            str(c.turnier_id or "Privatrunde"),
            c.club_name,
            c.datum,
            player_name,
            c.marker_name or "-",
            str(c.handicap_index or "-"),
            str(c.playing_hcp or 0),
            c.tee or "gelb",
            *gross_scores[:9],
            str(out_gross),
            *gross_scores[9:18],
            str(in_gross),
            str(c.brutto or 0),
            str(c.netto or 0),
            str(c.stableford or 0),
            c.submission_status or "submitted",
            "JA" if c.gps_verified else "NEIN",
            c.gps_audit_token or "-"
        ]
        writer.writerow(row)

    csv_bytes = output.getvalue().encode('utf-8-sig')
    club_slug = re.sub(r'[^a-zA-Z0-9_-]', '_', target_club or 'Alle_Clubs')
    filename = f"pccaddie_scores_{club_slug}_{datetime.utcnow().strftime('%Y%m%d')}.csv"

    return Response(
        csv_bytes,
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# --- 12. STATIC WEBPAGE SERVING ---

@app.route('/sw.js')
def service_worker():
    """Liefert den PWA Service Worker mit JavaScript-Header aus."""
    return send_from_directory(basis_ordner, 'sw.js', mimetype='application/javascript')

@app.route('/manifest.webmanifest')
def web_manifest():
    """Liefert das PWA Web App Manifest mit JSON-Header aus."""
    return send_from_directory(basis_ordner, 'manifest.webmanifest', mimetype='application/manifest+json')

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
