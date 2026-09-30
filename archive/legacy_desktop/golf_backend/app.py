from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import os

# --- 1. SETUP UND KONFIGURATION ---
app = Flask(__name__)
# CORS erlaubt es deiner HTML-Website, mit diesem Server zu kommunizieren
CORS(app)

# Konfiguration der Datenbank (SQLite ist perfekt für den Start)
basis_ordner = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basis_ordner, 'golfapp.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- 2. DATENBANK MODELLE (Tabellen) ---

class User(db.Model):
    """Speichert die Benutzer und ihre verschlüsselten Passwörter."""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    # Verknüpfung zu den Runden des Users
    runden = db.relationship('Runde', backref='spieler', lazy=True)

class Runde(db.Model):
    """Speichert die gespielten Golfrunden pro Benutzer."""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    datum = db.Column(db.String(20), nullable=False)
    club_name = db.Column(db.String(100), nullable=False)
    loecher = db.Column(db.Integer, nullable=False)
    brutto = db.Column(db.Integer, nullable=False)
    sd = db.Column(db.Float, nullable=False)

# Datenbank und Tabellen erstellen (falls sie noch nicht existieren)
with app.app_context():
    db.create_all()

# --- 3. API SCHNITTSTELLEN (Routen) ---

@app.route('/api/register', methods=['POST'])
def register():
    """Registriert einen neuen Benutzer."""
    daten = request.json
    username = daten.get('username')
    password = daten.get('password')

    if not username or not password:
        return jsonify({"fehler": "Benutzername und Passwort erforderlich"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"fehler": "Benutzername existiert bereits"}), 409

    # Passwort sicher verschlüsseln (Niemals im Klartext speichern!)
    hashed_pw = generate_password_hash(password)
    neuer_user = User(username=username, password_hash=hashed_pw)
    
    db.session.add(neuer_user)
    db.session.commit()

    return jsonify({"nachricht": "Benutzer erfolgreich erstellt"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    """Überprüft die Logindaten und gibt die User-ID zurück."""
    daten = request.json
    username = daten.get('username')
    password = daten.get('password')

    user = User.query.filter_by(username=username).first()

    # Passwort prüfen
    if user and check_password_hash(user.password_hash, password):
        # In einer echten, großen App würde man hier ein "JWT Token" zurückgeben.
        # Für den Anfang reicht die user_id, die sich das Frontend merkt.
        return jsonify({
            "nachricht": "Login erfolgreich",
            "user_id": user.id,
            "username": user.username
        }), 200
    else:
        return jsonify({"fehler": "Falscher Benutzername oder Passwort"}), 401


@app.route('/api/runden', methods=['POST', 'GET'])
def verwalte_runden():
    """Speichert eine neue Runde oder lädt alle Runden eines Users."""
    # Bei jeder Anfrage muss das Frontend die user_id mitschicken
    user_id = request.args.get('user_id') or (request.json and request.json.get('user_id'))
    
    if not user_id:
        return jsonify({"fehler": "Nicht autorisiert (user_id fehlt)"}), 401

    if request.method == 'POST':
        # Neue Runde speichern
        daten = request.json
        neue_runde = Runde(
            user_id=user_id,
            datum=daten['datum'],
            club_name=daten['club_name'],
            loecher=daten['loecher'],
            brutto=daten['brutto'],
            sd=daten['sd']
        )
        db.session.add(neue_runde)
        db.session.commit()
        return jsonify({"nachricht": "Runde gespeichert", "id": neue_runde.id}), 201

    elif request.method == 'GET':
        # Alle Runden des Users laden
        runden_db = Runde.query.filter_by(user_id=user_id).all()
        runden_liste = []
        for r in runden_db:
            runden_liste.append({
                "id": r.id,
                "datum": r.datum,
                "club_name": r.club_name,
                "loecher": r.loecher,
                "brutto": r.brutto,
                "sd": r.sd
            })
        return jsonify(runden_liste), 200

# --- 4. SERVER STARTEN ---
if __name__ == '__main__':
    # Startet den Webserver auf Port 5000
    app.run(debug=True, port=5000)
