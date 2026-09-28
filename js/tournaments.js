// --- TOURNAMENT MODAL & CRUD ---
function openTurnierModal(preselectedClub = null) {
    const modal = document.getElementById('turnier-modal');
    const select = document.getElementById('modal-turnier-club');
    const form = document.getElementById('turnier-modal-form');
    form.reset();

    const sortedClubs = [...clubs].sort((a,b) => a.name.localeCompare(b.name));
    select.innerHTML = '';
    sortedClubs.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.innerText = c.name + (c.city ? ` (${c.city})` : '');
        select.appendChild(opt);
    });

    if(preselectedClub && sortedClubs.some(c => c.name === preselectedClub)) {
        select.value = preselectedClub;
    }

    const today = new Date().toISOString().split('T')[0];
    const datumInput = document.getElementById('modal-turnier-datum');
    if(datumInput) datumInput.value = today;

    modal.classList.remove('hidden');
}

function closeTurnierModal() {
    document.getElementById('turnier-modal').classList.add('hidden');
}

async function handleSaveTurnier(e) {
    e.preventDefault();
    const club_name = document.getElementById('modal-turnier-club').value;
    const name = document.getElementById('modal-turnier-name').value.trim();
    const rawDatum = document.getElementById('modal-turnier-datum').value;
    const loecher = parseInt(document.getElementById('modal-turnier-loecher').value, 10);
    const spielform = document.getElementById('modal-turnier-spielform').value;
    const vorgabewirksam = document.getElementById('modal-turnier-vorgabe').checked;

    if(!club_name || !name || !rawDatum) {
        alert("Bitte alle Pflichtfelder ausfüllen.");
        return;
    }

    // Convert date YYYY-MM-DD to DD.MM.YYYY
    let datum = rawDatum;
    if(rawDatum.includes('-')) {
        const parts = rawDatum.split('-');
        if(parts.length === 3) datum = `${parts[2]}.${parts[1]}.${parts[0]}`;
    }

    const turnierObj = {
        id: Date.now(),
        club_name,
        name,
        datum,
        loecher,
        spielform,
        vorgabewirksam
    };

    if(currentUser && authToken) {
        const res = await apiFetch('/api/turniere', 'POST', turnierObj);
        if(res.ok && res.data.turnier) {
            turnierObj.id = res.data.turnier.id;
        }
    }

    turniere.push(turnierObj);
    saveData();
    closeTurnierModal();
    updateApp();
    showToast(`Turnier "${name}" erfolgreich angelegt! 🏆`, "⛳");
}

// --- PC CADDIE & iCal TURNIER-IMPORT LOGIC ---
let pccaddySelectedTab = 'file';

function openPcCaddyImportModal(preselectedClub = null) {
    const modal = document.getElementById('pccaddy-import-modal');
    const select = document.getElementById('pccaddy-import-club-select');
    const form = document.getElementById('pccaddy-import-form');
    const statusBox = document.getElementById('pccaddy-import-status');
    const fileLabel = document.getElementById('pccaddy-file-label');

    if(form) form.reset();
    if(statusBox) {
        statusBox.classList.add('hidden');
        statusBox.innerHTML = '';
    }
    if(fileLabel) fileLabel.innerText = 'Klicke hier oder ziehe eine .ics / .csv Datei hinein';

    if(select) {
        const sortedClubs = [...clubs].sort((a,b) => a.name.localeCompare(b.name));
        select.innerHTML = '';
        sortedClubs.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id || c.name;
            opt.dataset.clubName = c.name;
            opt.dataset.clubId = c.id || '';
            opt.innerText = c.name + (c.city ? ` (${c.city})` : '');
            select.appendChild(opt);
        });

        if(preselectedClub) {
            const match = sortedClubs.find(c => c.name === preselectedClub);
            if(match) select.value = match.id || match.name;
        }
    }

    switchPcCaddyImportTab('file');
    if(modal) modal.classList.remove('hidden');
}

function closePcCaddyImportModal() {
    const modal = document.getElementById('pccaddy-import-modal');
    if(modal) modal.classList.add('hidden');
}

function switchPcCaddyImportTab(tab) {
    pccaddySelectedTab = tab;
    const tabFile = document.getElementById('pccaddy-tab-file');
    const tabText = document.getElementById('pccaddy-tab-text');
    const tabUrl = document.getElementById('pccaddy-tab-url');
    const paneFile = document.getElementById('pccaddy-pane-file');
    const paneText = document.getElementById('pccaddy-pane-text');
    const paneUrl = document.getElementById('pccaddy-pane-url');

    const activeClass = 'flex-1 py-1.5 rounded-lg bg-white shadow-xs text-indigo-700 font-extrabold transition-all';
    const inactiveClass = 'flex-1 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all';

    if(tabFile) tabFile.className = tab === 'file' ? activeClass : inactiveClass;
    if(tabText) tabText.className = tab === 'text' ? activeClass : inactiveClass;
    if(tabUrl) tabUrl.className = tab === 'url' ? activeClass : inactiveClass;

    if(paneFile) paneFile.classList.toggle('hidden', tab !== 'file');
    if(paneText) paneText.classList.toggle('hidden', tab !== 'text');
    if(paneUrl) paneUrl.classList.toggle('hidden', tab !== 'url');
}

function onPcCaddyFileSelected(event) {
    const file = event.target.files && event.target.files[0];
    const fileLabel = document.getElementById('pccaddy-file-label');
    if(file && fileLabel) {
        fileLabel.innerText = `Ausgewählt: ${file.name} (${Math.round(file.size / 1024)} KB)`;
    }
}

async function submitPcCaddyImport(e) {
    e.preventDefault();
    const select = document.getElementById('pccaddy-import-club-select');
    const statusBox = document.getElementById('pccaddy-import-status');
    const submitBtn = document.getElementById('pccaddy-submit-btn');
    const replaceExisting = document.getElementById('pccaddy-replace-existing')?.checked ?? true;

    const selectedOption = select?.selectedOptions?.[0];
    const clubId = selectedOption?.dataset?.clubId || (select ? select.value : '');
    const clubName = selectedOption?.dataset?.clubName || (select ? select.value : '');

    statusBox.classList.remove('hidden', 'bg-rose-50', 'text-rose-700', 'border-rose-200', 'bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
    statusBox.className = 'p-3 rounded-xl text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200';
    statusBox.innerHTML = '<span class="animate-pulse">⏳ Turniere werden analysiert und importiert...</span>';

    if(submitBtn) submitBtn.disabled = true;

    try {
        let res;
        if(pccaddySelectedTab === 'file') {
            const fileInput = document.getElementById('pccaddy-file-input');
            const file = fileInput?.files?.[0];
            if(!file) {
                throw new Error("Bitte wähle zuerst eine Datei (.ics oder .csv) aus.");
            }
            const formData = new FormData();
            formData.append('file', file);
            formData.append('replace_existing', replaceExisting ? 'true' : 'false');
            formData.append('club_name', clubName);

            const targetUrl = clubId ? `/api/clubs/${clubId}/import-pccaddy` : '/api/turniere/import-pccaddy';
            const headers = {};
            if(authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const response = await fetch(targetUrl, {
                method: 'POST',
                body: formData,
                headers: headers
            });
            const data = await response.json();
            if(!response.ok) throw new Error(data.fehler || "Import fehlgeschlagen.");
            res = { ok: true, data };
        } else if(pccaddySelectedTab === 'text') {
            const text = document.getElementById('pccaddy-text-input')?.value.trim();
            if(!text) throw new Error("Bitte füge zuerst Kalenderdaten im Textfeld ein.");

            const targetUrl = clubId ? `/api/clubs/${clubId}/import-pccaddy` : '/api/turniere/import-pccaddy';
            res = await apiFetch(targetUrl, 'POST', {
                content: text,
                replace_existing: replaceExisting,
                club_name: clubName
            });
            if(!res.ok) throw new Error(res.data?.fehler || "Import fehlgeschlagen.");
        } else {
            const url = document.getElementById('pccaddy-url-input')?.value.trim();
            if(!url) throw new Error("Bitte gib eine gültige URL ein.");

            const targetUrl = clubId ? `/api/clubs/${clubId}/import-pccaddy` : '/api/turniere/import-pccaddy';
            res = await apiFetch(targetUrl, 'POST', {
                url: url,
                replace_existing: replaceExisting,
                club_name: clubName
            });
            if(!res.ok) throw new Error(res.data?.fehler || "Import fehlgeschlagen.");
        }

        statusBox.className = 'p-3 rounded-xl text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-200';
        statusBox.innerHTML = `✅ ${res.data.nachricht || 'Turniere erfolgreich importiert!'}`;

        // Turniere & Clubs im State neu laden
        const resClubs = await apiFetch('/api/clubs');
        if(resClubs.ok && Array.isArray(resClubs.data)) clubs = resClubs.data;
        const resTurniere = await apiFetch('/api/turniere');
        if(resTurniere.ok && Array.isArray(resTurniere.data)) turniere = resTurniere.data;

        saveData();
        renderClubsExplorer();
        showToast(res.data.nachricht || "PC CADDIE Turniere erfolgreich importiert!", "📥");

        setTimeout(() => {
            closePcCaddyImportModal();
        }, 1300);

    } catch(err) {
        statusBox.className = 'p-3 rounded-xl text-xs font-medium border bg-rose-50 text-rose-700 border-rose-200';
        statusBox.innerHTML = `⚠️ ${err.message || 'Fehler beim Import.'}`;
    } finally {
        if(submitBtn) submitBtn.disabled = false;
    }
}

function triggerModalLiveSync() {
    const select = document.getElementById('pccaddy-import-club-select');
    const selectedOption = select?.selectedOptions?.[0];
    const clubId = selectedOption?.dataset?.clubId || (select ? select.value : '');
    const clubName = selectedOption?.dataset?.clubName || (select ? select.value : '');
    if(!clubId && !clubName) {
        showToast("Bitte wähle zuerst einen Ziel-Golfclub aus.", "⚠️");
        return;
    }
    syncClubPcCaddy(clubId, clubName);
}

async function syncClubPcCaddy(clubId, clubName) {
    let targetClub = null;
    if(clubId) {
        targetClub = clubs.find(c => String(c.id) === String(clubId));
    }
    if(!targetClub && clubName) {
        targetClub = clubs.find(c => c.name === clubName);
    }

    const cId = targetClub?.id || clubId;
    const cName = targetClub?.name || clubName || "Golfclub";

    if(!cId) {
        showToast("Club konnte nicht identifiziert werden.", "⚠️");
        return;
    }

    showToast(`🔄 PC CADDIE Live-Abruf für '${cName}'...`, "⏳");

    try {
        const res = await apiFetch(`/api/clubs/${cId}/sync-pccaddy`, 'POST');
        if(!res.ok) {
            throw new Error(res.data?.fehler || "Abruf von PC CADDIE fehlgeschlagen.");
        }

        // Daten neu laden
        const resClubs = await apiFetch('/api/clubs');
        if(resClubs.ok && Array.isArray(resClubs.data)) clubs = resClubs.data;
        const resTurniere = await apiFetch('/api/turniere');
        if(resTurniere.ok && Array.isArray(resTurniere.data)) turniere = resTurniere.data;

        saveData();
        renderClubsExplorer();
        showToast(res.data?.nachricht || `Turniere für '${cName}' erfolgreich aktualisiert!`, "✅");

        // Modal schließen falls geöffnet
        const modal = document.getElementById('pccaddy-import-modal');
        if(modal && !modal.classList.contains('hidden')) {
            closePcCaddyImportModal();
        }
    } catch(err) {
        console.error("Fehler bei PC CADDIE Live-Sync:", err);
        showToast(err.message || "Fehler beim Abruf von PC CADDIE.", "⚠️");
    }
}


// --- 3. TOURNAMENT DETAILS & REGISTRATION ---
async function openTournamentDetails(turnierId) {
    const t = turniere.find(item => item.id == turnierId);
    if(!t) return;
    currentViewingTournament = t;

    document.getElementById('td-title').innerText = t.name;
    document.getElementById('td-club').innerText = t.club_name;
    document.getElementById('td-datum').innerText = t.datum;
    document.getElementById('td-loecher').innerText = `${t.loecher} Löcher`;
    document.getElementById('td-spielform').innerText = t.spielform || 'Stableford';
    const vorgabeEl = document.getElementById('td-vorgabe');
    if(t.vorgabewirksam) {
        vorgabeEl.className = "font-bold text-emerald-700";
        vorgabeEl.innerText = "Vorgabewirksam";
    } else {
        vorgabeEl.className = "font-bold text-amber-700";
        vorgabeEl.innerText = "Nicht vorgabewirksam";
    }

    document.getElementById('tournament-details-modal').classList.remove('hidden');
    await loadTournamentParticipants(t.id);
}

function closeTournamentDetailsModal() {
    document.getElementById('tournament-details-modal').classList.add('hidden');
}

async function loadTournamentParticipants(turnierId) {
    const listEl = document.getElementById('td-participants-list');
    const countEl = document.getElementById('td-participants-count');
    listEl.innerHTML = '<div class="py-4 text-center text-slate-400">Lade Teilnehmer...</div>';

    const res = await apiFetch(`/api/turniere/${turnierId}/participants`);
    if(res.ok && res.data.participants) {
        const parts = res.data.participants;
        countEl.innerText = `${parts.length} Teilnehmer`;
        if(parts.length === 0) {
            listEl.innerHTML = '<div class="py-4 text-center text-slate-400">Noch keine Teilnehmer gemeldet. Melde dich jetzt an!</div>';
        } else {
            listEl.innerHTML = parts.map(p => `
                <div class="p-2.5 flex items-center justify-between text-xs bg-white">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                            ${(p.username || 'G').substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-bold text-slate-900">${p.username}</div>
                            <div class="text-[10px] text-slate-500 font-mono">HCP: ${p.handicap_index !== null && p.handicap_index !== undefined ? p.handicap_index : '--'}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Flight ${p.flight_nr || 1} • Start: ${p.tee_time || '09:00'}
                        </span>
                    </div>
                </div>
            `).join('');
        }
    } else {
        listEl.innerHTML = '<div class="py-4 text-center text-slate-400">Teilnehmer konnten nicht geladen werden.</div>';
    }
}

async function registerForCurrentTournament() {
    if(!currentUser || !authToken) {
        openAuthModal('login');
        return;
    }
    if(!currentViewingTournament) return;
    const res = await apiFetch(`/api/turniere/${currentViewingTournament.id}/register`, 'POST');
    if(res.ok) {
        showToast(`Erfolgreich für "${currentViewingTournament.name}" angemeldet!`, "⛳");
        if(typeof confetti === 'function') confetti({ particleCount: 50, spread: 60 });
        await loadTournamentParticipants(currentViewingTournament.id);
    } else {
        showToast(res.data?.fehler || "Anmeldung fehlgeschlagen.", "⚠️");
    }
}

function startScorecardForTournament() {
    if(!currentViewingTournament) return;
    const t = currentViewingTournament;
    closeTournamentDetailsModal();
    openScorecardModal(t);
}


// --- FLIGHT LIVE SCOREBOARD ---
async function loadFlightScoreboard() {
    const thead = document.getElementById('sc-flight-thead');
    const tbody = document.getElementById('sc-flight-tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    const turnierId = activeScorecardTournament ? activeScorecardTournament.id : 1;
    const res = await apiFetch(`/api/flights/${turnierId}`);

    let players = [
        { username: currentUser?.username || 'Ich', hcp: aktuellesHCP || 54.0 }
    ];

    if(res.ok && res.data.players && res.data.players.length > 0) {
        players = res.data.players;
        document.getElementById('sc-flight-info-pill').classList.remove('hidden');
        document.getElementById('sc-flight-name').innerText = res.data.flight_name || 'Flight 1';
    }

    let thHtml = `<th class="py-2.5 px-2 text-center w-12">Loch</th><th class="py-2.5 px-2 text-center w-12">Par</th>`;
    players.forEach(p => {
        thHtml += `<th class="py-2.5 px-3 text-center">${p.username} <span class="font-normal text-[10px] text-slate-400">(${p.hcp})</span></th>`;
    });
    thead.innerHTML = `<tr>${thHtml}</tr>`;

    const loecher = scHolesData.length || 18;
    for(let i = 0; i < loecher; i++) {
        const h = scHolesData[i] || { hole: i + 1, par: 4, strokes: 4 };
        let trHtml = `<td class="py-2 px-2 text-center font-bold text-slate-800">${i + 1}</td><td class="py-2 px-2 text-center text-slate-400">${h.par}</td>`;
        players.forEach((p, pIdx) => {
            const score = pIdx === 0 ? h.strokes : (h.par + (i % 3 === 0 ? 1 : 0));
            trHtml += `<td class="py-2 px-3 text-center font-bold ${score < h.par ? 'text-emerald-600' : score > h.par ? 'text-amber-800' : 'text-slate-700'}">${score}</td>`;
        });
        tbody.innerHTML += `<tr>${trHtml}</tr>`;
    }
}

