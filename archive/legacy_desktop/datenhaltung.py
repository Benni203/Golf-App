import json
import os

class Datenhaltung:
    def __init__(self, filepath="golf_data.json"):
        self.filepath = filepath
        self.clubs = []
        self.runden = []
        self.sd_ergaenzung = []
        self._lade_standard_daten_falls_noetig()
        self.lade_daten()

    def _lade_standard_daten_falls_noetig(self):
        """Lädt Startwerte für die SD-Ergänzung, falls noch keine existieren."""
        # Hier fügen wir nur beispielhaft die ersten Werte der SD-Ergänzung ein.
        # (Dein DevOps kann hier die komplette Liste hinterlegen oder aus der CSV laden)
        self.standard_sd = [
            {"min_hcp": 26.0, "max_hcp": 26.4, "wert": 12.5},
            {"min_hcp": 26.5, "max_hcp": 26.8, "wert": 12.7}
        ]

    def lade_daten(self):
        """Lädt die Daten aus der JSON-Datei."""
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, 'r', encoding='utf-8') as f:
                    daten = json.load(f)
                    self.clubs = daten.get('clubs', [])
                    self.runden = daten.get('runden', [])
                    self.sd_ergaenzung = daten.get('sd_ergaenzung', self.standard_sd)
            except Exception as e:
                print(f"Fehler beim Laden der Daten: {e}")
        else:
            self.sd_ergaenzung = self.standard_sd

    def speichere_daten(self):
        """Speichert alle aktuellen Listen in die JSON-Datei."""
        daten = {
            'clubs': self.clubs,
            'runden': self.runden,
            'sd_ergaenzung': self.sd_ergaenzung
        }
        with open(self.filepath, 'w', encoding='utf-8') as f:
            json.dump(daten, f, indent=4)

    def runden_sortieren(self):
        """Sortiert die Runden chronologisch (älteste zuerst)."""
        # Annahme: Datum ist im Format DD.MM.YYYY
        def parse_date(date_str):
            parts = date_str.split('.')
            if len(parts) == 3:
                return f"{parts[2]}-{parts[1]}-{parts[0]}"
            return date_str
        self.runden.sort(key=lambda x: parse_date(x['datum']))
