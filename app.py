import os
import secrets
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
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
    password_hash = db.Column(db.String(256), nullable=False)
    api_token = db.Column(db.String(64), unique=True, index=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    runden = db.relationship('Runde', backref='user', cascade='all, delete-orphan', lazy=True)
    clubs = db.relationship('Club', backref='user', cascade='all, delete-orphan', lazy=True)
    turniere = db.relationship('Turnier', backref='user', cascade='all, delete-orphan', lazy=True)

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

    def to_dict(self):
        return {
            "id": self.id,
            "club_name": self.club_name,
            "name": self.name,
            "datum": self.datum,
            "loecher": self.loecher,
            "spielform": self.spielform,
            "vorgabewirksam": self.vorgabewirksam
        }

# --- SEED DATEN: UMFANGREICHER DEUTSCHER GOLFCLUB-KATALOG & TURNIERE ---
KATALOG_CLUBS = [
    # Hamburg & Metropolregion
    {"name": "Hamburger GC Falkenstein", "tee": "gelb", "region": "Hamburg & Umland", "city": "Hamburg-Rissen", "par18": 71.0, "cr18": 72.8, "sr18": 133.0, "par9": 36.0, "cr9": 36.4, "sr9": 131.0},
    {"name": "GC Hamburg-Walddörfer", "tee": "gelb", "region": "Hamburg & Umland", "city": "Hamburg-Wohldorf", "par18": 72.0, "cr18": 72.2, "sr18": 130.0, "par9": 36.0, "cr9": 36.1, "sr9": 128.0},
    {"name": "GC Wendlohe", "tee": "gelb", "region": "Hamburg & Umland", "city": "Bönningstedt", "par18": 72.0, "cr18": 72.5, "sr18": 132.0, "par9": 36.0, "cr9": 36.0, "sr9": 129.0},
    {"name": "GC Gut Kaden (A+B)", "tee": "gelb", "region": "Hamburg & Umland", "city": "Alveslohe", "par18": 72.0, "cr18": 72.9, "sr18": 135.0, "par9": 36.0, "cr9": 36.5, "sr9": 133.0},
    {"name": "GC Gut Kaden (B+C)", "tee": "gelb", "region": "Hamburg & Umland", "city": "Alveslohe", "par18": 72.0, "cr18": 72.4, "sr18": 132.0, "par9": 36.0, "cr9": 36.2, "sr9": 130.0},
    {"name": "GC Holm", "tee": "gelb", "region": "Hamburg & Umland", "city": "Holm (Pinneberg)", "par18": 72.0, "cr18": 72.1, "sr18": 131.0, "par9": 36.0, "cr9": 36.0, "sr9": 128.0},
    {"name": "GC Treudelberg", "tee": "gelb", "region": "Hamburg & Umland", "city": "Hamburg-Lemsahl", "par18": 72.0, "cr18": 71.9, "sr18": 130.0, "par9": 36.0, "cr9": 35.9, "sr9": 128.0},
    {"name": "HLGC Hittfeld", "tee": "gelb", "region": "Hamburg & Umland", "city": "Seevetal", "par18": 71.0, "cr18": 71.5, "sr18": 129.0, "par9": 36.0, "cr9": 35.8, "sr9": 127.0},
    {"name": "GC Buchholz-Nordheide", "tee": "gelb", "region": "Hamburg & Umland", "city": "Buchholz i.d.N.", "par18": 72.0, "cr18": 72.0, "sr18": 128.0, "par9": 36.0, "cr9": 36.0, "sr9": 127.0},
    {"name": "GC Hamburg-Ahrensburg", "tee": "gelb", "region": "Hamburg & Umland", "city": "Ahrensburg", "par18": 71.0, "cr18": 71.2, "sr18": 128.0, "par9": 36.0, "cr9": 35.6, "sr9": 126.0},

    # Schleswig-Holstein
    {"name": "GC Escheburg 18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Escheburg", "par18": 72.0, "cr18": 71.8, "sr18": 131.0, "par9": "", "cr9": "", "sr9": ""},
    {"name": "GC Escheburg 1-9", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Escheburg", "par18": "", "cr18": "", "sr18": "", "par9": 36.0, "cr9": 35.6, "sr9": 129.0},
    {"name": "GC Escheburg 10-18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Escheburg", "par18": "", "cr18": "", "sr18": "", "par9": 36.0, "cr9": 36.1, "sr9": 132.0},
    {"name": "GC Jersbek 18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Jersbek", "par18": 72.0, "cr18": 71.4, "sr18": 132.0, "par9": "", "cr9": "", "sr9": ""},
    {"name": "GC Jersbek 1-9", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Jersbek", "par18": "", "cr18": "", "sr18": "", "par9": 36.0, "cr9": 35.7, "sr9": 132.0},
    {"name": "GC Jersbek 10-18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Jersbek", "par18": "", "cr18": "", "sr18": "", "par9": 36.0, "cr9": 36.6, "sr9": 130.0},
    {"name": "GC Pinnau 18 A+B", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Pinneberg", "par18": 73.0, "cr18": 71.8, "sr18": 137.0, "par9": "", "cr9": "", "sr9": ""},
    {"name": "GC Pinnau 18 A+C", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Pinneberg", "par18": 72.0, "cr18": 71.4, "sr18": 131.0, "par9": "", "cr9": "", "sr9": ""},
    {"name": "GC Pinnau 18 B+C", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Pinneberg", "par18": 73.0, "cr18": 71.0, "sr18": 126.0, "par9": "", "cr9": "", "sr9": ""},
    {"name": "GC Grossensee 18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Großensee", "par18": 73.0, "cr18": 72.3, "sr18": 130.0, "par9": "", "cr9": "", "sr9": ""},
    {"name": "GC Gut Sachsenwald 18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Dassendorf", "par18": 72.0, "cr18": 72.6, "sr18": 130.0, "par9": "", "cr9": "", "sr9": ""},
    {"name": "GC Gut Grambek 18", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Grambek / Mölln", "par18": 71.0, "cr18": 71.8, "sr18": 126.0, "par9": "", "cr9": "", "sr9": ""},
    {"name": "GC Timmendorfer Strand (Nord)", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Timmendorfer Strand", "par18": 72.0, "cr18": 72.8, "sr18": 133.0, "par9": 36.0, "cr9": 36.4, "sr9": 131.0},
    {"name": "Lübeck-Travemünder GK", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Travemünde", "par18": 73.0, "cr18": 73.1, "sr18": 134.0, "par9": 36.0, "cr9": 36.5, "sr9": 132.0},
    {"name": "GC Altenhof", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Eckernförde", "par18": 72.0, "cr18": 72.4, "sr18": 131.0, "par9": 36.0, "cr9": 36.2, "sr9": 129.0},
    {"name": "GC Sylt", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Wenningstedt (Sylt)", "par18": 72.0, "cr18": 73.0, "sr18": 135.0, "par9": 36.0, "cr9": 36.5, "sr9": 133.0},
    {"name": "Marine-GC Sylt", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Tinnum (Sylt)", "par18": 72.0, "cr18": 72.8, "sr18": 132.0, "par9": 36.0, "cr9": 36.4, "sr9": 130.0},
    {"name": "GC Gut Bissenmoor", "tee": "gelb", "region": "Schleswig-Holstein", "city": "Bad Bramstedt", "par18": 72.0, "cr18": 71.9, "sr18": 129.0, "par9": 36.0, "cr9": 35.9, "sr9": 127.0},

    # Niedersachsen & Bremen
    {"name": "Club zur Vahr (Garlstedt)", "tee": "gelb", "region": "Niedersachsen & Bremen", "city": "Garlstedt (Bremen)", "par18": 72.0, "cr18": 72.7, "sr18": 134.0, "par9": 36.0, "cr9": 36.3, "sr9": 132.0},
    {"name": "GC Hannover", "tee": "gelb", "region": "Niedersachsen & Bremen", "city": "Garbsen (Hannover)", "par18": 72.0, "cr18": 72.3, "sr18": 131.0, "par9": 36.0, "cr9": 36.1, "sr9": 129.0},
    {"name": "GC Deinster Mühle", "tee": "gelb", "region": "Niedersachsen & Bremen", "city": "Deinste (Stade)", "par18": 72.0, "cr18": 71.6, "sr18": 127.0, "par9": 36.0, "cr9": 35.8, "sr9": 125.0},
    {"name": "GC Verden", "tee": "gelb", "region": "Niedersachsen & Bremen", "city": "Verden (Aller)", "par18": 72.0, "cr18": 71.8, "sr18": 128.0, "par9": 36.0, "cr9": 35.9, "sr9": 126.0},

    # Deutschlandweit Top-Plätze
    {"name": "GC St. Leon-Rot (St. Leon)", "tee": "gelb", "region": "Baden-Württemberg", "city": "St. Leon-Rot", "par18": 72.0, "cr18": 73.5, "sr18": 138.0, "par9": 36.0, "cr9": 36.7, "sr9": 136.0},
    {"name": "GC St. Leon-Rot (Rot)", "tee": "gelb", "region": "Baden-Württemberg", "city": "St. Leon-Rot", "par18": 72.0, "cr18": 73.2, "sr18": 136.0, "par9": 36.0, "cr9": 36.5, "sr9": 134.0},
    {"name": "GC München Eichenried (A+B)", "tee": "gelb", "region": "Bayern", "city": "Moosinning (München)", "par18": 72.0, "cr18": 73.1, "sr18": 135.0, "par9": 36.0, "cr9": 36.5, "sr9": 133.0},
    {"name": "Frankfurter GC", "tee": "gelb", "region": "Hessen", "city": "Frankfurt am Main", "par18": 71.0, "cr18": 72.4, "sr18": 133.0, "par9": 36.0, "cr9": 36.2, "sr9": 131.0},
    {"name": "GC Hubbelrath (Ostplatz)", "tee": "gelb", "region": "Nordrhein-Westfalen", "city": "Düsseldorf", "par18": 72.0, "cr18": 73.4, "sr18": 137.0, "par9": 36.0, "cr9": 36.7, "sr9": 135.0},
    {"name": "G&CC Seddiner See (Süd)", "tee": "gelb", "region": "Berlin / Brandenburg", "city": "Michendorf (Berlin)", "par18": 72.0, "cr18": 73.2, "sr18": 136.0, "par9": 36.0, "cr9": 36.6, "sr9": 134.0}
]

KATALOG_TURNIERE = [
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
    {"club_name": "Hamburger GC Falkenstein", "name": "Falkenstein Herbst-Vierer", "datum": "18.10.2026", "loecher": 18, "spielform": "Zählspiel", "vorgabewirksam": True},
    {"club_name": "GC Wendlohe", "name": "Wendlohe After-Work Cup", "datum": "09.10.2026", "loecher": 9, "spielform": "Stableford", "vorgabewirksam": True},
    {"club_name": "GC St. Leon-Rot (St. Leon)", "name": "St. Leon Open Championship", "datum": "25.10.2026", "loecher": 18, "spielform": "Zählspiel", "vorgabewirksam": True}
]

def migrate_and_seed_database():
    """Stellt sicher, dass alle Tabellenspalten existieren und initialisiert Katalog-Clubs & Turniere."""
    # 1. Sicherstellen, dass neue Spalten (region, city) in bestehenden SQLite-Tabellen existieren
    try:
        with db.engine.connect() as conn:
            cursor = conn.connection.cursor()
            cursor.execute("PRAGMA table_info(clubs)")
            cols = [row[1] for row in cursor.fetchall()]
            if cols and 'region' not in cols:
                cursor.execute("ALTER TABLE clubs ADD COLUMN region VARCHAR(100) DEFAULT 'Schleswig-Holstein / Hamburg'")
            if cols and 'city' not in cols:
                cursor.execute("ALTER TABLE clubs ADD COLUMN city VARCHAR(100) DEFAULT ''")
            conn.connection.commit()
    except Exception as e:
        print(f"Hinweis zur Tabellenmigration: {e}")

    # 2. Tabellen erstellen, falls noch nicht existent
    db.create_all()

    # 3. System-Clubs aktualisieren / seeden
    try:
        system_clubs_count = Club.query.filter_by(user_id=None).count()
        if system_clubs_count < len(KATALOG_CLUBS):
            # Alte Systemclubs bereinigen, damit der neue 38-Club-Katalog sauber eingespielt wird
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
                    user_id=None
                )
                db.session.add(club)

        if Turnier.query.count() == 0:
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
    password = daten.get('password', '').strip()

    if not username or len(username) < 3:
        return jsonify({"fehler": "Benutzername muss mindestens 3 Zeichen lang sein."}), 400
    if not password or len(password) < 4:
        return jsonify({"fehler": "Passwort muss mindestens 4 Zeichen lang sein."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"fehler": "Dieser Benutzername ist bereits vergeben."}), 409

    hashed_pw = generate_password_hash(password)
    token = secrets.token_hex(32)

    neuer_user = User(username=username, password_hash=hashed_pw, api_token=token)
    db.session.add(neuer_user)
    db.session.commit()

    return jsonify({
        "nachricht": "Benutzer erfolgreich registriert!",
        "token": token,
        "user": {
            "id": neuer_user.id,
            "username": neuer_user.username
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    """Prüft Logindaten und gibt neuen/aktuellen Token zurück."""
    daten = request.get_json(silent=True) or {}
    username = daten.get('username', '').strip()
    password = daten.get('password', '').strip()

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):
        user.api_token = secrets.token_hex(32)
        db.session.commit()

        return jsonify({
            "nachricht": "Login erfolgreich!",
            "token": user.api_token,
            "user": {
                "id": user.id,
                "username": user.username
            }
        }), 200
    else:
        return jsonify({"fehler": "Falscher Benutzername oder Passwort."}), 401

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
        "user": {
            "id": user.id,
            "username": user.username,
            "runden_count": len(user.runden),
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
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
    turnier = Turnier.query.get(turnier_id)
    if not turnier:
        return jsonify({"fehler": "Turnier nicht gefunden."}), 404

    db.session.delete(turnier)
    db.session.commit()
    return jsonify({"nachricht": "Turnier gelöscht."}), 200

# --- 7. STATIC WEBPAGE SERVING ---

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
