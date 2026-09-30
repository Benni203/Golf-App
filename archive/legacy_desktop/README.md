# Archiv: Früher Desktop-Prototyp (Mai 2026)

Dieser Ordner enthält die ursprünglichen Python-Desktop-Skripte (Tkinter / JSON / SQLite-Prototyp):
- `main.py`: Ehemaliger Startpunkt für die grafische Tkinter-Benutzeroberfläche.
- `oberflaeche.py`: Tkinter-GUI-Definitionen und Eingabemasken.
- `logik.py`: Ursprüngliche HCP- und Rundenberechnung.
- `datenhaltung.py`: Datei-basierte Speicherung (`golf_daten.json`).
- `golf_data.db`: Frühe Testdatenbank.
- `golf_backend/`: Früher separater Backend-Versuch.

## Aktueller Stand
Diese Komponenten wurden vollständig durch die moderne, reaktive **GolfApp Web & PWA** abgelöst:
- **Backend:** `app.py` (Flask REST-API, SQLAlchemy, Auth, WHS-Kalkulation, GPS-Verifikation, PC CADDIE Sync)
- **Frontend:** Modularisiertes JavaScript in `js/` und modernes HTML5/CSS in `index.html` bzw. `www/`
- **PWA:** Service-Worker `sw.js` & Web App Manifest `manifest.webmanifest`
