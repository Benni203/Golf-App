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

# Datenbank: Nutzt PostgreSQL falls DATABASE_URL vorhanden ist (z.B. Render / Railway / Heroku), sonst lokales SQLite
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

    # 1:N Beziehungen mit Kaskadierung beim Löschen
    runden = db.relationship('Runde', backref='user', cascade='all, delete-orphan', lazy=True)
    clubs = db.relationship('Club', backref='user', cascade='all, delete-orphan', lazy=True)

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
    """Speichert benutzerdefinierte oder allgemeine Golfclubs."""
    __tablename__ = 'clubs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True, index=True)
    name = db.Column(db.String(120), nullable=False)
    tee = db.Column(db.String(50), default='gelb')
    par18 = db.Column(db.Float, nullable=True)
    cr18 = db.Column(db.Float, nullable=True)
    sr18 = db.Column(db.Float, nullable=True)
    par9 = db.Column(db.Float, nullable=True)
    cr9 = db.Column(db.Float, nullable=True)
    sr9 = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "tee": self.tee or "gelb",
            "par18": self.par18 or "",
            "cr18": self.cr18 or "",
            "sr18": self.sr18 or "",
            "par9": self.par9 or "",
            "cr9": self.cr9 or "",
            "sr9": self.sr9 or ""
        }

# Tabellen erstellen
with app.app_context():
    db.create_all()

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

# --- 4. API ROUTEN ---

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

    # Passwort hashen
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
        # Bei jedem Login frischen Token generieren
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

            # Duplikat-Vermeidung
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

# --- 6. GOLFCLUBS VERWALTUNG ---

@app.route('/api/clubs', methods=['GET', 'POST'])
def clubs_endpoint():
    """Gibt alle Clubs des Users ab oder legt einen neuen an."""
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
