# 🚀 Deployment Guide: GolfApp im Internet veröffentlichen

Deine App ist nun als vollwertige Fullstack-Webanwendung aufgebaut:
* **Backend:** Python Flask mit REST-API (`app.py`), Benutzer-Authentifizierung, Passwort-Verschlüsselung und SQLite/PostgreSQL-Datenbank.
* **Frontend:** Modernes, responsives Dashboard (`index.html`) mit Chart.js, WHS-Berechnung und Benutzer-Login.

---

## Option 1: Kostenlos hosten auf Render.com (Empfohlen)

Render bietet kostenloses Python-Webhosting mit automatischer HTTPS-Verschlüsselung (z.B. `https://deine-golfapp.onrender.com`).

### Schritt 1: Änderungen auf GitHub pushen
Öffne das Terminal und pushe deine neuesten Änderungen in dein GitHub-Repository:

```bash
git add .
git commit -m "Add user authentication and production deployment configuration"
git push origin main
```

### Schritt 2: Auf Render.com bereitstellen
1. Gehe auf [render.com](https://render.com) und erstelle einen kostenlosen Account (am besten mit deinem GitHub-Login).
2. Klicke im Dashboard auf **New +** → **Web Service**.
3. Wähle dein GitHub-Repository (`GolfApp` oder `AbschlussprojektBenni`) aus und klicke auf **Connect**.
4. Trage folgende Einstellungen ein (falls nicht automatisch durch `render.yaml` erkannt):
   * **Name:** `golf-handicap-app` (oder dein Wunschname)
   * **Region:** Frankfurt (EU)
   * **Branch:** `main`
   * **Runtime:** `Python 3`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `gunicorn app:app`
   * **Instance Type:** `Free`
5. Klicke unten auf **Create Web Service**.

Fertig! In ca. 1–2 Minuten baut Render die Anwendung und gibt dir deine öffentliche URL (z.B. `https://golf-handicap-app.onrender.com`).

---

## Option 2: Alternative auf Railway.app

1. Gehe auf [railway.app](https://railway.app) und melde dich mit GitHub an.
2. Klicke auf **New Project** → **Deploy from GitHub repo**.
3. Wähle dein Repository aus. Railway erkennt das `Procfile` und die `requirements.txt` automatisch und startet die App.

---

## Lokales Testen des kompletten Fullstack-Servers

Bevor du deployest, kannst du den Server jederzeit lokal starten:

```bash
# In dein Projektverzeichnis wechseln:
cd /Users/benjaminberndt/Desktop/GolfApp

# Server starten:
.venv/bin/python3 app.py
```

Öffne anschließend deinen Browser unter: **http://localhost:5000**
* Du kannst dich registrieren, Runden speichern und testen, wie alles in der Datenbank gespeichert wird!
