from datenhaltung import Datenhaltung
from logik import GolfLogik
from oberflaeche import GolfAppUI

def main():
    # 1. Datenhaltung initialisieren (Model)
    daten = Datenhaltung("golf_daten.json")
    
    # 2. Logik initialisieren und Daten übergeben (Controller)
    logik = GolfLogik(daten)
    
    # 3. UI initialisieren und Logik übergeben (View)
    app = GolfAppUI(logik)
    
    # 4. Applikation starten
    app.mainloop()

if __name__ == "__main__":
    main()


