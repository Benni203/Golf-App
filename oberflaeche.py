import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from logik import GolfLogik

class GolfAppUI(tk.Tk):
    def __init__(self, logik: GolfLogik):
        super().__init__()
        self.logik = logik
        self.title("⛳ Golf Handicap Tracker")
        self.geometry("800x600")

        # UI Aufbau
        self.erstelle_widgets()
        self.aktualisiere_ui()

    def erstelle_widgets(self):
        # Tabs erstellen
        self.notebook = ttk.Notebook(self)
        self.notebook.pack(expand=True, fill='both', padx=10, pady=10)

        # Tab 1: Dashboard & Eingabe
        self.tab_erfassung = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_erfassung, text='Neue Runde & Dashboard')
        self._baue_dashboard()

        # Tab 2: Historie
        self.tab_historie = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_historie, text='Runden Historie')
        self._baue_historie()

        # Tab 3: Import
        self.tab_import = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_import, text='PDF Import')
        self._baue_import()

    def _baue_dashboard(self):
        # Stats
        stats_frame = ttk.LabelFrame(self.tab_erfassung, text="Aktuelle Statistik")
        stats_frame.pack(fill='x', padx=10, pady=5)
        self.lbl_hcp = ttk.Label(stats_frame, text="HCP: --", font=("Arial", 16, "bold"))
        self.lbl_hcp.pack(pady=10)

        # Formular
        form_frame = ttk.LabelFrame(self.tab_erfassung, text="Neue Runde erfassen")
        form_frame.pack(fill='both', expand=True, padx=10, pady=5)

        ttk.Label(form_frame, text="Datum (DD.MM.YYYY):").grid(row=0, column=0, sticky='w', pady=5)
        self.entry_datum = ttk.Entry(form_frame)
        self.entry_datum.grid(row=0, column=1, pady=5)

        ttk.Label(form_frame, text="Club:").grid(row=1, column=0, sticky='w', pady=5)
        self.combo_club = ttk.Combobox(form_frame, state="readonly")
        self.combo_club.grid(row=1, column=1, pady=5)
        self.combo_club.bind('<<ComboboxSelected>>', self.update_live_preview)

        ttk.Label(form_frame, text="Löcher:").grid(row=2, column=0, sticky='w', pady=5)
        self.combo_loecher = ttk.Combobox(form_frame, values=["18", "9"], state="readonly")
        self.combo_loecher.current(0)
        self.combo_loecher.grid(row=2, column=1, pady=5)
        self.combo_loecher.bind('<<ComboboxSelected>>', self.update_live_preview)

        ttk.Label(form_frame, text="Brutto:").grid(row=3, column=0, sticky='w', pady=5)
        self.var_brutto = tk.StringVar()
        self.var_brutto.trace_add("write", self.update_live_preview) # Live Preview Trigger!
        self.entry_brutto = ttk.Entry(form_frame, textvariable=self.var_brutto)
        self.entry_brutto.grid(row=3, column=1, pady=5)

        self.lbl_preview = ttk.Label(form_frame, text="SD Vorschau: --", foreground="blue", font=("Arial", 10, "bold"))
        self.lbl_preview.grid(row=4, column=0, columnspan=2, pady=10)

        btn_speichern = ttk.Button(form_frame, text="Runde speichern", command=self.speichere_runde)
        btn_speichern.grid(row=5, column=0, columnspan=2, pady=10)

    def _baue_historie(self):
        # Filter und Sortierung (NEU)
        filter_frame = ttk.Frame(self.tab_historie)
        filter_frame.pack(fill='x', padx=10, pady=5)

        ttk.Label(filter_frame, text="Ansicht:").pack(side='left', padx=5)
        
        self.combo_filter = ttk.Combobox(filter_frame, state="readonly", width=35)
        self.combo_filter['values'] = [
            "Zuletzt gespielt (Neueste zuerst)",
            "Nur 18-Loch Runden",
            "Nur 9-Loch Runden",
            "Bester Score Differential (SD)"
        ]
        self.combo_filter.current(0)
        self.combo_filter.pack(side='left', padx=5)
        self.combo_filter.bind('<<ComboboxSelected>>', lambda e: self.aktualisiere_historie())

        # Tabelle
        columns = ('Datum', 'Club', 'Löcher', 'Brutto', 'SD', 'Gewertet')
        self.tree = ttk.Treeview(self.tab_historie, columns=columns, show='headings')
        for col in columns: 
            self.tree.heading(col, text=col)
            # Spaltenbreite anpassen
            if col in ['Löcher', 'Brutto', 'SD']:
                self.tree.column(col, width=60, anchor='center')
        
        self.tree.pack(expand=True, fill='both', padx=10, pady=10)

    def _baue_import(self):
        ttk.Label(self.tab_import, text="Importiere deinen DGV Scoring Record (.pdf)").pack(pady=20)
        btn_import = ttk.Button(self.tab_import, text="PDF auswählen", command=self.starte_pdf_import)
        btn_import.pack(pady=10)

    def update_live_preview(self, *args):
        club = self.combo_club.get()
        loecher_str = self.combo_loecher.get()
        brutto_str = self.var_brutto.get()

        if len(brutto_str) >= 2 and brutto_str.isdigit() and club:
            sd = self.logik.berechne_sd_fuer_eingabe(club, int(loecher_str), int(brutto_str))
            if sd is not None:
                self.lbl_preview.config(text=f"SD Vorschau: {sd}")
                return
        self.lbl_preview.config(text="SD Vorschau: --")

    def speichere_runde(self):
        datum = self.entry_datum.get()
        club = self.combo_club.get()
        loecher = self.combo_loecher.get()
        brutto = self.var_brutto.get()

        if not all([datum, club, loecher, brutto]):
            messagebox.showwarning("Fehler", "Bitte alle Felder ausfüllen!")
            return

        erfolg = self.logik.runde_hinzufuegen(datum, club, int(loecher), int(brutto))
        if erfolg:
            messagebox.showinfo("Erfolg", "Runde gespeichert!")
            self.var_brutto.set("")
            self.entry_datum.delete(0, tk.END) # Datum leeren
            self.aktualisiere_ui()
        else:
            messagebox.showerror("Fehler", "Berechnung nicht möglich (Fehlende Clubdaten?)")

    def starte_pdf_import(self):
        pfad = filedialog.askopenfilename(filetypes=[("PDF Dateien", "*.pdf")])
        if pfad:
            anzahl = self.logik.importiere_pdf(pfad)
            if anzahl >= 0:
                messagebox.showinfo("Import", f"Es wurden {anzahl} neue Runden importiert!")
                self.aktualisiere_ui()
            else:
                messagebox.showerror("Fehler", "Fehler beim PDF Import.")

    def aktualisiere_historie(self):
        """Aktualisiert die Runden-Tabelle basierend auf dem gewählten Filter/Sortierung."""
        # Tabelle leeren
        for row in self.tree.get_children(): 
            self.tree.delete(row)

        auswahl = self.combo_filter.get()
        alle_runden = self.logik.daten.runden.copy()

        # Logik für Filter und Sortierung
        if auswahl == "Zuletzt gespielt (Neueste zuerst)":
            anzeige_runden = list(reversed(alle_runden))
        elif auswahl == "Nur 18-Loch Runden":
            anzeige_runden = [r for r in reversed(alle_runden) if r['loecher'] == 18]
        elif auswahl == "Nur 9-Loch Runden":
            anzeige_runden = [r for r in reversed(alle_runden) if r['loecher'] == 9]
        elif auswahl == "Bester Score Differential (SD)":
            anzeige_runden = sorted(alle_runden, key=lambda x: float(x['sd']))
        else:
            anzeige_runden = list(reversed(alle_runden))

        # Gefilterte/Sortierte Runden in die Tabelle einfügen
        for r in anzeige_runden:
            markierung = "★ Ja" if r.get('isBest') else "Nein"
            self.tree.insert('', tk.END, values=(r['datum'], r['club_name'], r['loecher'], r['brutto'], r['sd'], markierung))

    def aktualisiere_ui(self):
        # HCP Update
        hcp = self.logik.berechne_hcp()
        self.lbl_hcp.config(text=f"Handicap Index: {hcp}")
        
        # Clubs Dropdown Update
        club_namen = [c['name'] for c in self.logik.daten.clubs]
        self.combo_club['values'] = club_namen

        # Historie aktualisieren (berücksichtigt den aktuellen Filter)
        self.aktualisiere_historie()
