import pypdf
import re
import math
from datenhaltung import Datenhaltung

class GolfLogik:
    def __init__(self, daten: Datenhaltung):
        self.daten = daten
        self.aktuelles_hcp = 26.0

    def ermittle_sd_ergaenzung(self, hcp):
        for e in self.daten.sd_ergaenzung:
            if e['min_hcp'] <= hcp <= e['max_hcp']:
                return e['wert']
        return 0

    def berechne_sd_fuer_eingabe(self, club_name, loecher, brutto):
        """Berechnet den Score Differential für die Live-Vorschau."""
        club = next((c for c in self.daten.clubs if c['name'] == club_name), None)
        if not club:
            return None

        try:
            if loecher == 18:
                if not club.get('sr18') or not club.get('cr18'): return None
                sd = (113 / float(club['sr18'])) * (float(brutto) - float(club['cr18']))
            else:
                if not club.get('sr9') or not club.get('cr9'): return None
                basis_sd = (113 / float(club['sr9'])) * (float(brutto) - float(club['cr9']))
                ergaenzung = self.ermittle_sd_ergaenzung(self.aktuelles_hcp)
                sd = basis_sd + ergaenzung
            return round(sd, 1)
        except ValueError:
            return None

    def berechne_hcp(self):
        """Berechnet das aktuelle WHS-Handicap aus den letzten 20 Runden."""
        self.daten.runden_sortieren()
        letzte_20 = self.daten.runden[-20:]
        
        if not letzte_20:
            return 0.0

        anzahl_zu_werten = 8 if len(letzte_20) >= 20 else max(1, math.floor(len(letzte_20) / 2))
        
        # Sortiere nach bestem SD
        sortiert_nach_sd = sorted(letzte_20, key=lambda x: float(x['sd']))
        beste_runden = sortiert_nach_sd[:anzahl_zu_werten]

        # Reset isBest flag
        for r in self.daten.runden: r['isBest'] = False
        for b in beste_runden: b['isBest'] = True

        summe_sd = sum(float(r['sd']) for r in beste_runden)
        self.aktuelles_hcp = round(summe_sd / len(beste_runden), 1)
        return self.aktuelles_hcp

    def runde_hinzufuegen(self, datum, club_name, loecher, brutto):
        sd = self.berechne_sd_fuer_eingabe(club_name, loecher, brutto)
        if sd is not None:
            neue_runde = {
                "datum": datum, "club_name": club_name, 
                "loecher": loecher, "brutto": brutto, "sd": sd, "isBest": False
            }
            self.daten.runden.append(neue_runde)
            self.berechne_hcp()
            self.daten.speichere_daten()
            return True
        return False

    def importiere_pdf(self, dateipfad):
        """Liest den Scoring Record aus einer PDF ein."""
        importiert_count = 0
        try:
            reader = pypdf.PdfReader(dateipfad)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + " "
            
            # Normalisieren für Regex
            text = re.sub(r'\s+', ' ', text)
            pattern = r"(?:^|\s)(\d{1,3})\s+(\d{2}\.\d{2}\.\d{4})\s+(\d{4,5})?\s*(.*?)\s+(18|9)\s+([A-Za-z])\s+(\d{2,3})\s+(\d+,\d+)(?=\s|$)"
            
            matches = re.findall(pattern, text)
            for match in matches:
                datum, turnier, loecher, brutto, sd_str = match[1], match[3].strip(), int(match[4]), int(match[6]), match[7]
                sd = float(sd_str.replace(',', '.'))
                
                # Duplikat-Check
                existiert = any(r['datum'] == datum and r['brutto'] == brutto for r in self.daten.runden)
                if not existiert:
                    self.daten.runden.append({
                        "datum": datum, "club_name": turnier[:25], 
                        "loecher": loecher, "brutto": brutto, "sd": sd, "isBest": False
                    })
                    importiert_count += 1
            
            if importiert_count > 0:
                self.berechne_hcp()
                self.daten.speichere_daten()
                
            return importiert_count
        except Exception as e:
            print(f"Fehler beim PDF Import: {e}")
            return -1
