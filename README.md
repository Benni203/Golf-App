# GolfApp (BirdieTrack) - World Handicap System Calculator & Tracker ⛳

Eine moderne, professionelle Fullstack-Golfanwendung zur Verwaltung von Golfrunden, Berechnung des offiziellen World Handicap System (WHS) Handicap-Index, interaktiver Scorekarten-Führung, Turnierkalender mit PC CADDIE Synchronisation und GPS-gestützter Platzsuche.

---

## 🌟 Hauptfunktionen

- **WHS Handicap-Rechner:** Exakte WHS-Kalkulation nach DGV-Vorgaben (Mittelwert der besten 8 aus den letzten 20 Runden, inklusive Low-HCP-Index, Soft Cap und Hard Cap Begrenzung).
- **Interaktive digitale Scorekarte:** DGV-konforme Lochvorgaben, Netto- und Brutto-Stableford-Berechnung, Vor- und Rückrunden sowie automatische Platzdaten für deutsche Golfclubs.
- **Authentischer Clubkatalog:** Über 35 integrierte Golfclubs mit echten Platz- und Lochdaten (Slope, CR, Par, Stroke Index, Meterangaben).
- **Turnierkalender & PC CADDIE Sync:** Automatischer ICS-/CSV-Import und Kalender-Synchronisation mit PC CADDIE Clubkalendern.
- **Freunde & Social:** Freunde hinzufügen, Handicap-Vergleich und Aktivitäten-Feed.
- **PWA (Progressive Web App):** Installierbar auf iOS und Android, Offline-Cache und schnelle Ladezeiten.
- **Robuste Authentifizierung:** JWT-basierte API-Tokens, sichere Passwort-Hashes (Werkzeug/pbkdf2), Self-Healing Account Recovery und Passwörter-Reset.

---

## 📁 Projektstruktur

```text
GolfApp/
├── app.py                  # Flask REST-API Backend (Routen, Models, WHS-Logik, Auth)
├── catalog_data.py         # Statischer Club- und Turnierkatalog sowie authentische Lochdaten
├── build_frontend.py       # Validierungs- & Synchronisationsskript (js/ -> www/)
├── index.html              # Haupt-Frontend HTML5/CSS mit responsivem Design
├── js/                     # Modularer JavaScript-Quellcode (16 Module)
│   ├── api.js              # Zentrale API-Kommunikation & Auth-Header
│   ├── auth.js             # Benutzer-Authentifizierung, Registrierung & Session
│   ├── clubs.js            # Golfplatz-Verwaltung & Favoriten
│   ├── gps.js              # GPS-Standortermittlung & Distanzberechnung
│   ├── runden.js           # Rundenverwaltung & Filterung
│   ├── scorecard.js        # Interaktive Scorekarte & Stableford-Kalkulation
│   ├── stats.js            # WHS-Statistiken & HCP-Verlauf
│   ├── turniere.js         # Turnierübersicht & PC CADDIE Synchronisation
│   └── ...                 # Weitere UI-, Event- und Hilfsmodule
├── tests/                  # Vollständige Unittest-Suite (51 Tests)
│   ├── test_auth.py        # Authentifizierungs-, Login- & Token-Tests
│   ├── test_calculator.py  # WHS-Rechenlogik-Tests
│   ├── test_scorecard.py   # Scorekarten- & Stableford-Tests
│   └── test_turniere.py    # Turnier- und PC CADDIE Parser-Tests
├── www/                    # Produktionsfertiges Web-Bundle
├── archive/                # Archivierte historische Prototypen (Tkinter Desktop)
├── .vscode/                # VS Code Workspace-Konfiguration (F5 Debug, Tasks, Settings)
├── sw.js                   # Service Worker (PWA Offline-Caching)
├── manifest.webmanifest    # PWA Web-App Manifest
├── requirements.txt        # Python-Abhängigkeiten
├── render.yaml             # Render.com Blueprint (Web Service + Managed PostgreSQL)
└── Procfile                # Gunicorn Webserver-Startbefehl für Produktion
```

---

## 🚀 Schnellanleitung (Lokal starten)

### 1. Virtuelle Umgebung einrichten
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Backend starten
```bash
python3 app.py
```
Die Anwendung ist anschließend unter `http://localhost:5001` im Browser erreichbar.

---

## 🛠️ Arbeiten in Visual Studio Code

Dieses Projekt ist für Visual Studio Code optimiert:

- **1-Klick Start (F5):**  
  Drücke `F5`, um den Flask-Server direkt im Debugger zu starten (inkl. Breakpoints und Hot-Reloading).
- **Frontend bauen & synchronisieren (`Cmd+Shift+B` / `Ctrl+Shift+B`):**  
  Führt automatisch `build_frontend.py` aus. Prüft alle 16 JavaScript-Module auf Syntaxfehler und synchronisiert den Stand in den `www/`-Ordner.
- **Tests ausführen:**  
  Über das Test-Panel in VS Code oder mit:
  ```bash
  .venv/bin/python -m unittest discover tests
  ```
- **Übersichtlicher Dateibaum:**  
  Dank konfigurierter *File Nesting Rules* werden Konfigurationsdateien (`render.yaml`, `gunicorn.conf.py`, `Procfile`, etc.) übersichtlich unter `app.py` gruppiert.

---

## 🧪 Tests & Qualitätssicherung

Die Testsuite umfasst **51 automatisierte Unittests**, die alle Kernaspekte absichern:
- Registrierung, Login, Token-Handling und Brute-Force-Schutz
- WHS-Handicap-Index-Berechnung nach offiziellem Reglement
- Stableford-Punkteberechnung (Netto & Brutto)
- Authentische Club-Lochvorgaben und Scorekarten-Handling
- PC CADDIE ICS- und CSV-Parser

Tests lokal ausführen:
```bash
.venv/bin/python -m unittest discover tests
```

---

## 🌐 Deployment (Render.com)

Das Projekt wird automatisch via GitHub-Push auf **Render.com** bereitgestellt:
- **Web Service:** Läuft mit `gunicorn app:app -c gunicorn.conf.py`.
- **Datenbank:** Managed PostgreSQL (`DATABASE_URL`), automatischer Fallback auf lokales SQLite bei Offline-Entwicklung.
- **Automatisches Seeding:** Beim Serverstart werden System-Clubs, authentische Lochdaten und Beispielturniere automatisch initialisiert.
