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

### Schritt 2: Auf Render.com bereitstellen (Empfohlen: Blueprint mit PostgreSQL)

Um sicherzustellen, dass neu registrierte Benutzer, Runden und Turniere dauerhaft erhalten bleiben und nicht bei einem Container-Neustart (z. B. nach 15 Min. Inaktivität im Render Free Tier) verloren gehen, wird eine PostgreSQL-Datenbank verwendet:

#### Methode A: Über Blueprint (Automatisches Setup mit PostgreSQL)
1. Gehe auf [render.com](https://render.com) in dein Dashboard.
2. Klicke auf **New +** → **Blueprint**.
3. Wähle dein GitHub-Repository (`GolfApp`) aus.
4. Render liest die beiliegende `render.yaml` und erstellt automatisch:
   * Den Web Service `golf-handicap-app`
   * Eine kostenlose PostgreSQL-Datenbank `golfapp-db`
   * Die Verknüpfung der Umgebungsvariable `DATABASE_URL`
5. Klicke auf **Apply**.

#### Methode B: Manuell bestehenden Web Service mit PostgreSQL verbinden
Falls du bereits einen Web Service auf Render hast:
1. Klicke auf **New +** → **PostgreSQL**.
2. Vergib einen Namen (z.B. `golf-db`) und klicke auf **Create Database**.
3. Kopiere die **Internal Database URL** (beginnt mit `postgres://...`).
4. Öffne deinen Web Service → **Environment** → **Add Environment Variable**.
5. Key: `DATABASE_URL`, Value: die kopierte Datenbank-URL einfügen.
6. Klicke auf **Save Changes** (Render startet den Service neu und speichert ab sofort alles permanent in PostgreSQL).

> 💡 **Zusätzlicher Schutz:** Die App verfügt nun über einen **automatischen Konto-Tresor** (`birdietrack_accounts_v1`) im Browser sowie einen Server-Synchronisations-Endpoint (`/api/sync-accounts`). Selbst wenn der Server zwischenzeitlich schläft oder neu gestartet wird, stellt das Frontend alle registrierten Benutzerkonten automatisch und nahtlos wieder her!

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
