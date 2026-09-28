// --- DATA PERSISTENCE & CLOUD SYNC ---
async function loadData() {
    // Check active check-in
    activeCheckIn = JSON.parse(localStorage.getItem('golf_checkin') || 'null');

    // Bereinige alte, nicht zugeordnete Runden aus dem LocalStorage
    localStorage.removeItem('golf_runden');

    // Check auth state in localStorage
    const savedAuth = JSON.parse(localStorage.getItem('golf_auth') || 'null');
    if(savedAuth && savedAuth.token && savedAuth.user) {
        authToken = savedAuth.token;
        currentUser = savedAuth.user;

        // Live-Verify token with backend to avoid stale or invalid session
        try {
            const checkMe = await apiFetch('/api/me');
            if(checkMe.ok && checkMe.data && checkMe.data.id) {
                currentUser = checkMe.data;
                localStorage.setItem('golf_auth', JSON.stringify({ token: authToken, user: currentUser }));
            } else if(checkMe.status === 401) {
                authToken = null;
                currentUser = null;
                localStorage.removeItem('golf_auth');
            }
        } catch(e) {
            console.warn("Auth token verification error:", e);
        }
    }

    if(currentUser && authToken) {
        renderAuthHeader();

        // Load user's data from Flask Backend
        const resRunden = await apiFetch('/api/runden');
        if(resRunden.ok && Array.isArray(resRunden.data)) {
            runden = resRunden.data;
        } else {
            runden = JSON.parse(localStorage.getItem(`golf_runden_${currentUser.id}`)) || [];
        }

        const resClubs = await apiFetch('/api/clubs');
        if(resClubs.ok && Array.isArray(resClubs.data) && resClubs.data.length > 0) {
            clubs = resClubs.data;
        } else {
            clubs = JSON.parse(localStorage.getItem('golf_clubs')) || defaultClubs;
        }

        const resTurniere = await apiFetch('/api/turniere');
        if(resTurniere.ok && Array.isArray(resTurniere.data) && resTurniere.data.length > 0) {
            turniere = resTurniere.data;
        } else {
            turniere = JSON.parse(localStorage.getItem('golf_turniere')) || defaultTurniere;
        }

        // Load club favorites
        const resFav = await apiFetch('/api/favorites/clubs');
        if(resFav.ok && Array.isArray(resFav.data)) {
            favoriteClubNames = new Set(resFav.data);
        } else {
            favoriteClubNames = new Set();
        }

        // Load Pro Analytics Stats
        await loadProStats();
    } else {
        favoriteClubNames = new Set();
        currentUser = null;
        authToken = null;
        renderAuthHeader();

        // Öffentliches Golfclub- und Turnierverzeichnis für Gäste
        try {
            const resClubs = await apiFetch('/api/clubs');
            if(resClubs.ok && Array.isArray(resClubs.data) && resClubs.data.length > 0) {
                clubs = resClubs.data;
            } else {
                const localClubs = JSON.parse(localStorage.getItem('golf_clubs'));
                clubs = (localClubs && Array.isArray(localClubs) && localClubs.length >= 25) ? localClubs : defaultClubs;
            }

            const resTurniere = await apiFetch('/api/turniere');
            if(resTurniere.ok && Array.isArray(resTurniere.data) && resTurniere.data.length > 0) {
                turniere = resTurniere.data;
            } else {
                const localTurniere = JSON.parse(localStorage.getItem('golf_turniere'));
                turniere = (localTurniere && Array.isArray(localTurniere) && localTurniere.length > 0) ? localTurniere : defaultTurniere;
            }
        } catch(e) {
            clubs = defaultClubs;
            turniere = defaultTurniere;
        }

        // WICHTIG: Wenn unangemeldet, NIEMALS persönliche Runden oder fremdes HCP anzeigen!
        runden = [];
        aktuellesHCP = null;
        previousHCP = null;
    }

    sdErgaenzung = JSON.parse(localStorage.getItem('golf_sd')) || defaultSdErgaenzung;
    updateApp();
}

function saveData() {
    localStorage.setItem('golf_clubs', JSON.stringify(clubs));
    localStorage.setItem('golf_turniere', JSON.stringify(turniere));
    if(currentUser && currentUser.id) {
        localStorage.setItem(`golf_runden_${currentUser.id}`, JSON.stringify(runden));
    }
    localStorage.removeItem('golf_runden');
    localStorage.setItem('golf_sd', JSON.stringify(sdErgaenzung));
    if(activeCheckIn) {
        localStorage.setItem('golf_checkin', JSON.stringify(activeCheckIn));
    } else {
        localStorage.removeItem('golf_checkin');
    }
}

// Importiert die 20 historischen Runden in das angemeldete Benutzerkonto
async function importHistoricalRoundsToAccount() {
    if(!currentUser || !authToken) {
        openAuthModal('login');
        return;
    }
    if(confirm("Möchtest du die 20 historischen Runden (u.a. Sachsenwaldbecher, RPR, BSV Finale) in dein Benutzerkonto importieren?")) {
        const res = await apiFetch('/api/runden/batch', 'POST', { runden: sampleHistoricalRounds });
        if(res.ok) {
            await loadData();
            showToast("20 Runden erfolgreich in deinen Account importiert!", "⛳");
        } else {
            showToast("Fehler beim Importieren: " + (res.data?.fehler || "Unbekannt"), "⚠️");
        }
    }
}

function resetToDefaults() {
    if(confirm("Möchtest du wirklich alle lokalen Daten auf die Ausgangswerte zurücksetzen?")) {
        localStorage.removeItem('golf_clubs');
        localStorage.removeItem('golf_turniere');
        localStorage.removeItem('golf_runden');
        localStorage.removeItem('golf_checkin');
        activeCheckIn = null;
        loadData();
        showToast("Auf Startwerte zurückgesetzt!", "🔄");
    }
}


// --- JSON BACKUP EXPORT & IMPORT ---
function exportDataJSON() {
    const data = {
        exportDate: new Date().toISOString(),
        user: currentUser ? currentUser.username : "guest",
        clubs: clubs,
        runden: runden,
        sdErgaenzung: sdErgaenzung
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", jsonStr);
    dlAnchor.setAttribute("download", `golf_handicap_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast("Backup heruntergeladen!", "💾");
}

function importDataJSON(event) {
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if(data.runden && Array.isArray(data.runden)) {
                runden = data.runden;
                if(data.clubs && Array.isArray(data.clubs)) clubs = data.clubs;
                if(data.sdErgaenzung && Array.isArray(data.sdErgaenzung)) sdErgaenzung = data.sdErgaenzung;

                if(currentUser && authToken) {
                    await apiFetch('/api/runden/batch', 'POST', { runden: runden });
                }

                updateApp();
                showToast("Backup erfolgreich wiederhergestellt!", "✅");
            } else {
                alert("Ungültiges JSON Backup Format.");
            }
        } catch(err) {
            alert("Fehler beim Parsen der JSON-Datei.");
        }
    };
    reader.readAsText(file);
}

// =======================================================
