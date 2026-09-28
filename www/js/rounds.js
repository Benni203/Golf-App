// --- HISTORY FILTERING & RENDERING ---
function renderFilteredHistory() {
    const tbody = document.getElementById('table-history-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    if(!currentUser) {
        document.getElementById('history-total-count').innerText = '-- Runden';
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-12 text-center text-slate-500 text-xs">
                    <div class="text-sm font-bold text-slate-700 mb-1">🔒 Keine persönlichen Runden geladen</div>
                    <div class="text-slate-400 max-w-md mx-auto mb-4">Deine Rundenhistorie ist geschützt und wird erst nach der Anmeldung in deinem Benutzerkonto angezeigt.</div>
                    <button onclick="openAuthModal('login')" class="px-4 py-2 rounded-xl bg-golf-600 text-white font-bold text-xs shadow-sm hover:bg-golf-700 transition-all">
                        Jetzt anmelden
                    </button>
                </td>
            </tr>
        `;
        return;
    }

    const searchTerm = (document.getElementById('history-search')?.value || '').toLowerCase().trim();
    const filterValue = document.getElementById('history-filter-select')?.value || 'recent';

    let displayList = [...runden];

    if(searchTerm) {
        displayList = displayList.filter(r => 
            r.club_name.toLowerCase().includes(searchTerm) || 
            r.datum.includes(searchTerm)
        );
    }

    if(filterValue === 'oldest') {
        displayList.sort((a,b) => parseDateDe(a.datum) - parseDateDe(b.datum));
    } else if(filterValue === '18') {
        displayList = displayList.filter(r => r.loecher == 18).reverse();
    } else if(filterValue === '9') {
        displayList = displayList.filter(r => r.loecher == 9).reverse();
    } else if(filterValue === 'top8') {
        displayList = displayList.filter(r => r.isBest).sort((a,b) => parseFloat(a.sd) - parseFloat(b.sd));
    } else if(filterValue === 'best_sd') {
        displayList.sort((a,b) => parseFloat(a.sd) - parseFloat(b.sd));
    } else if(filterValue === 'lowest_gross') {
        displayList.sort((a,b) => parseInt(a.brutto, 10) - parseInt(b.brutto, 10));
    } else {
        displayList.reverse();
    }

    document.getElementById('history-total-count').innerText = `${displayList.length} Runden`;

    if(displayList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 text-xs">Keine Runden im Account gefunden. Erfasse jetzt deine erste Runde!</td></tr>`;
        return;
    }

    displayList.forEach(r => {
        const tr = document.createElement('tr');
        tr.className = r.isBest ? "bg-sand-50/50 hover:bg-sand-50 transition-colors" : "hover:bg-slate-50 transition-colors";

        const isCountingBadge = r.isBest 
            ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sand-200 text-sand-900 text-[11px] font-bold">★ Top 8</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">Archiv</span>`;

        tr.innerHTML = `
            <td class="py-3 px-4">${isCountingBadge}</td>
            <td class="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">${r.datum}</td>
            <td class="py-3 px-4 font-semibold text-slate-900">${r.club_name}</td>
            <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-bold">${r.loecher}L</span></td>
            <td class="py-3 px-4 text-center font-mono font-bold text-slate-800">${r.brutto}</td>
            <td class="py-3 px-4 text-center font-mono font-black ${r.isBest ? 'text-amber-700' : 'text-slate-700'}">${parseFloat(r.sd).toFixed(1)}</td>
            <td class="py-3 px-4 text-right">
                <button onclick="handleDeleteRound('${r.datum}', ${r.brutto}, '${r.club_name.replace(/'/g, "\\'")}', ${r.id || 'null'})" class="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors" title="Runde löschen">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


// --- ROUND ENTRY & LIVE PREVIEW LOGIC ---
function setEntryMode(mode) {
    entryMode = mode;
    const quickBtn = document.getElementById('mode-quick-btn');
    const holesBtn = document.getElementById('mode-holes-btn');
    const quickContainer = document.getElementById('quick-entry-container');
    const holesContainer = document.getElementById('holes-entry-container');

    if(mode === 'quick') {
        quickBtn.className = "px-5 py-2 rounded-xl bg-white text-slate-900 shadow-sm transition-all flex items-center gap-2";
        holesBtn.className = "px-5 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2";
        quickContainer.classList.remove('hidden');
        holesContainer.classList.add('hidden');
    } else {
        holesBtn.className = "px-5 py-2 rounded-xl bg-white text-slate-900 shadow-sm transition-all flex items-center gap-2";
        quickBtn.className = "px-5 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2";
        holesContainer.classList.remove('hidden');
        quickContainer.classList.add('hidden');
        initScorecardHoles();
    }
    onRoundInputChanged();
}

function adjustQuickBrutto(delta) {
    const input = document.getElementById('rec-brutto');
    let val = parseInt(input.value, 10) || 90;
    val = Math.max(20, Math.min(180, val + delta));
    input.value = val;
    onRoundInputChanged();
}

function onRoundInputChanged() {
    const clubName = document.getElementById('rec-club')?.value;
    const club = clubs.find(c => c.name === clubName);

    // Handle pure 9-hole courses
    const has18 = club && club.par18 !== null && club.par18 !== undefined && String(club.par18).trim() !== '';
    const has9 = club && club.par9 !== null && club.par9 !== undefined && String(club.par9).trim() !== '';
    const isPure9 = !has18 && has9;
    const recLoecherSelect = document.getElementById('rec-loecher');
    if(recLoecherSelect && isPure9 && recLoecherSelect.value === '18') {
        recLoecherSelect.value = '9';
    }

    const loecher = parseInt(document.getElementById('rec-loecher')?.value || '18', 10);

    // Update tournaments dropdown if club selection changed
    const recTurnier = document.getElementById('rec-turnier');
    if(recTurnier && (!recTurnier.dataset.currentClub || recTurnier.dataset.currentClub !== clubName)) {
        recTurnier.dataset.currentClub = clubName;
        updateTournamentDropdown(clubName);
    }

    const crPill = document.getElementById('rec-cr-val');
    const srPill = document.getElementById('rec-sr-val');
    const parPill = document.getElementById('rec-par-val');
    const chPill = document.getElementById('rec-course-hcp');
    const nineHoleCard = document.getElementById('nine-hole-info-card');

    if(club) {
        const is9 = loecher == 9;
        let cr = is9 
            ? (club.cr9 || (club.cr18 ? (parseFloat(club.cr18) / 2.0).toFixed(1) : '36.0')) 
            : (club.cr18 || club.cr9 || '72.0');
        let sr = is9 
            ? (club.sr9 || club.sr18 || '113') 
            : (club.sr18 || club.sr9 || '113');
        let par = is9 
            ? (club.par9 || (club.par18 ? Math.round(parseFloat(club.par18) / 2.0) : '36')) 
            : (club.par18 || club.par9 || '72');

        crPill.innerText = cr || '--';
        srPill.innerText = sr || '--';
        parPill.innerText = par || '--';

        const crNum = parseFloat(cr);
        const srNum = parseFloat(sr);
        const parNum = parseFloat(par);
        if(aktuellesHCP !== null && !isNaN(crNum) && !isNaN(srNum) && !isNaN(parNum)) {
            const ch = calculateCourseHandicap(aktuellesHCP, srNum, crNum, parNum, loecher);
            chPill.innerText = `${ch} Vorgabeschläge`;
        } else {
            chPill.innerText = '--';
        }
    } else {
        crPill.innerText = '--';
        srPill.innerText = '--';
        parPill.innerText = '--';
        chPill.innerText = '--';
    }

    if(loecher == 9) {
        nineHoleCard.classList.remove('hidden');
        document.getElementById('nine-hole-sd-ergaenzung').innerText = aktuellesHCP !== null ? `+${findSDErgaenzung(aktuellesHCP)}` : '+12.0 (DGV)';
    } else {
        nineHoleCard.classList.add('hidden');
    }

    if(entryMode === 'holes') {
        const tbody = document.getElementById('scorecard-holes-body');
        const curClub = tbody?.dataset?.club;
        const curCount = scorecardData?.length || 0;
        if(curClub !== clubName || curCount !== loecher) {
            if(tbody) tbody.dataset.club = clubName || '';
            initScorecardHoles();
        } else {
            updateScorecardTotals();
        }
    }

    const brutto = parseFloat(document.getElementById('rec-brutto')?.value);
    const sdPreviewEl = document.getElementById('preview-sd');
    const explainerEl = document.getElementById('preview-sd-explainer');
    const newHcpEl = document.getElementById('preview-new-hcp');
    const hcpDeltaEl = document.getElementById('preview-hcp-delta');
    const top8BadgeEl = document.getElementById('preview-top8-badge');
    const top8TextEl = document.getElementById('preview-top8-text');

    if(club && brutto && !isNaN(brutto) && brutto >= 25) {
        const sd = calculateSD(club, loecher, brutto, aktuellesHCP || 26.0);
        if(sd !== null) {
            sdPreviewEl.innerText = sd.toFixed(1);
            explainerEl.innerText = `SD = (113 / ${loecher == 18 ? club.sr18 : club.sr9}) × (${brutto} - ${loecher == 18 ? club.cr18 : club.cr9})${loecher == 9 ? ` + ${findSDErgaenzung(aktuellesHCP)} (DGV Ergänzung)` : ''}`;

            const simRounds = [...runden, { datum: "heute", club_name: clubName, loecher: loecher, brutto: brutto, sd: sd }];
            const letzte20 = simRounds.slice(-20);
            const count = letzte20.length >= 20 ? 8 : Math.max(1, Math.floor(letzte20.length / 2));
            const sorted = [...letzte20].sort((a,b) => parseFloat(a.sd) - parseFloat(b.sd));
            const best = sorted.slice(0, count);
            const newHcp = Math.round((best.reduce((a,b) => a + parseFloat(b.sd), 0) / best.length) * 10) / 10;
            const delta = aktuellesHCP !== null ? Math.round((newHcp - aktuellesHCP) * 10) / 10 : null;

            newHcpEl.innerText = newHcp.toFixed(1);

            if(delta === null) {
                hcpDeltaEl.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-golf-100 text-golf-800";
                hcpDeltaEl.innerText = "Erste Runde";
                top8BadgeEl.className = "p-3 rounded-xl bg-golf-50 border border-golf-200 text-xs text-golf-900 flex items-center gap-2";
                top8TextEl.innerText = "🎯 Deine erste gewertete Runde etabliert dein offizielles Handicap!";
            } else if(delta < 0) {
                hcpDeltaEl.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800";
                hcpDeltaEl.innerText = `${delta.toFixed(1)} ↘`;
                top8BadgeEl.className = "p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2";
                top8TextEl.innerText = "🎯 Super! Diese Runde verbessert dein WHS Handicap!";
            } else if(delta > 0) {
                hcpDeltaEl.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800";
                hcpDeltaEl.innerText = `+${delta.toFixed(1)} ↗`;
                top8BadgeEl.className = "p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2";
                top8TextEl.innerText = "ℹ️ Diese Runde würde dein Handicap leicht anheben.";
            } else {
                hcpDeltaEl.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700";
                hcpDeltaEl.innerText = "±0.0";
                top8BadgeEl.className = "p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2";
                top8TextEl.innerText = "Keine Veränderung deines Handicap Index.";
            }
            return;
        }
    }

    sdPreviewEl.innerText = '--';
    explainerEl.innerText = "Gib Club und Brutto-Schläge ein, um den genauen Score Differential zu sehen.";
    newHcpEl.innerText = '--';
    hcpDeltaEl.innerText = '--';
    top8TextEl.innerText = "Ergebnis eingeben, um Handicap-Veränderung zu simulieren.";
}


// --- SAVE ROUND HANDLER ---
async function handleSaveRound(e) {
    e.preventDefault();

    if(!currentUser || !authToken) {
        if(confirm("Du bist aktuell nicht angemeldet. Möchtest du dich jetzt anmelden oder ein kostenloses Konto erstellen, um deine Runden dauerhaft in deinem Profil zu speichern?")) {
            openAuthModal('login');
        }
        return;
    }

    const dateInput = document.getElementById('rec-datum').value;
    if(!dateInput) {
        alert("Bitte wähle ein Datum aus.");
        return;
    }

    const d = new Date(dateInput);
    const dateStr = formatDateDe(d);
    const clubName = document.getElementById('rec-club').value;
    const loecher = parseInt(document.getElementById('rec-loecher').value, 10);
    const brutto = parseInt(document.getElementById('rec-brutto').value, 10);
    const notes = document.getElementById('rec-notes').value.trim();
    const selectedTurnier = document.getElementById('rec-turnier')?.value;

    const club = clubs.find(c => c.name === clubName);
    const sd = calculateSD(club, loecher, brutto, aktuellesHCP || 26.0);

    if(sd === null) {
        alert(`Der Club "${clubName}" hat keine vollständigen CR/Slope-Werte für ${loecher} Löcher.`);
        return;
    }

    let fullName = clubName;
    if(selectedTurnier) {
        fullName += ` [🏆 ${selectedTurnier}]`;
    }
    if(notes) {
        fullName += ` (${notes})`;
    }

    const roundData = {
        datum: dateStr,
        club_name: fullName,
        loecher: loecher,
        brutto: brutto,
        sd: sd,
        isBest: false
    };

    // If logged in, save to Flask backend
    if(currentUser && authToken) {
        const res = await apiFetch('/api/runden', 'POST', roundData);
        if(res.ok && res.data.runde) {
            roundData.id = res.data.runde.id;
        }
    }

    runden.push(roundData);

    // Automatically complete active check-in if user played at the active club
    if(activeCheckIn && activeCheckIn.clubName === clubName) {
        activeCheckIn = null;
        saveData();
        renderHeader();
        renderActiveCheckInBanner();
        renderClubsExplorer();
    }

    updateApp();

    if(typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }

    showToast("Runde erfolgreich hinzugefügt & WHS berechnet!", "⛳");
    document.getElementById('rec-notes').value = '';
    const recTurnierEl = document.getElementById('rec-turnier');
    if(recTurnierEl) recTurnierEl.value = '';
    switchTab('dashboard');
}

async function handleDeleteRound(datum, brutto, club, roundId = null) {
    if(confirm(`Möchtest du die Runde vom ${datum} (${club}, ${brutto} Schläge) wirklich löschen?`)) {
        if(currentUser && authToken && roundId) {
            await apiFetch(`/api/runden/${roundId}`, 'DELETE');
        }

        const index = runden.findIndex(r => r.datum === datum && r.brutto == brutto && r.club_name === club);
        if(index > -1) {
            runden.splice(index, 1);
            updateApp();
            showToast("Runde gelöscht.", "🗑️");
        }
    }
}


// --- PDF SCORING RECORD IMPORT (PDF.js) ---
async function handlePDFUpload(event) {
    const file = event.target.files[0];
    if(!file) return;

    const loader = document.getElementById('pdf-import-loading');
    const resultBox = document.getElementById('pdf-import-result');
    const previewContainer = document.getElementById('pdf-preview-container');
    const previewBody = document.getElementById('pdf-preview-table-body');

    loader.classList.remove('hidden');
    resultBox.classList.add('hidden');
    previewContainer.classList.add('hidden');
    previewBody.innerHTML = '';
    detectedPdfRounds = [];

    const reader = new FileReader();
    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let textContent = "";

            for(let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                const pageText = text.items.map(item => item.str).join(' ');
                textContent += pageText + " ";
            }

            parsePDFText(textContent);
        } catch(err) {
            console.error(err);
            resultBox.className = "p-4 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold";
            resultBox.innerText = "Fehler beim Lesen der PDF-Datei. Bitte stelle sicher, dass es sich um eine gültige DGV-Scoring-Record PDF handelt.";
            resultBox.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
        }
    };
    reader.readAsArrayBuffer(file);
}

function parsePDFText(text) {
    const normalized = text.replace(/\s+/g, ' ');
    const pattern = /(?:^|\s)(\d{1,3})\s+(\d{2}\.\d{2}\.\d{4})\s+(\d{4,5})?\s*(.*?)\s+(18|9)\s+([A-Za-z])\s+(\d{2,3})\s+(\d+,\d+)(?=\s|$)/g;

    let match;
    const previewBody = document.getElementById('pdf-preview-table-body');
    const previewContainer = document.getElementById('pdf-preview-container');

    let newCount = 0;
    let dupCount = 0;

    while ((match = pattern.exec(normalized)) !== null) {
        const datum = match[2];
        const turnier = match[4].trim();
        const loecher = parseInt(match[5], 10);
        const brutto = parseInt(match[7], 10);
        const sd = parseFloat(match[8].replace(',', '.'));

        const exists = runden.some(r => r.datum === datum && r.brutto === brutto);
        const isNew = !exists;

        if(isNew) newCount++;
        else dupCount++;

        const roundItem = { datum, club_name: turnier.substring(0, 30), loecher, brutto, sd, isNew, selected: isNew };
        detectedPdfRounds.push(roundItem);

        const tr = document.createElement('tr');
        tr.className = isNew ? "bg-emerald-50/50" : "bg-slate-50 opacity-60";
        tr.innerHTML = `
            <td class="py-2.5 px-3">
                <input type="checkbox" ${isNew ? 'checked' : ''} onchange="togglePdfRow(${detectedPdfRounds.length - 1}, this.checked)" class="rounded text-golf-600 focus:ring-golf-500">
            </td>
            <td class="py-2.5 px-3 font-medium whitespace-nowrap">${datum}</td>
            <td class="py-2.5 px-3 font-semibold text-slate-800">${turnier}</td>
            <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold">${loecher}L</span></td>
            <td class="py-2.5 px-3 text-center font-mono font-bold">${brutto}</td>
            <td class="py-2.5 px-3 text-center font-mono font-black">${sd.toFixed(1)}</td>
            <td class="py-2.5 px-3">
                ${isNew 
                    ? '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Neu</span>' 
                    : '<span class="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-medium">Bereits vorhanden</span>'}
            </td>
        `;
        previewBody.appendChild(tr);
    }

    const resultBox = document.getElementById('pdf-import-result');
    resultBox.classList.remove('hidden');

    if(detectedPdfRounds.length > 0) {
        previewContainer.classList.remove('hidden');
        resultBox.className = "p-4 rounded-xl bg-golf-50 border border-golf-200 text-golf-900 text-xs font-semibold";
        resultBox.innerText = `PDF erfolgreich analysiert: ${detectedPdfRounds.length} Runden gefunden (${newCount} neu, ${dupCount} bereits vorhanden).`;
    } else {
        resultBox.className = "p-4 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold";
        resultBox.innerText = "Es konnten keine Runden im typischen DGV Scoring Record Format erkannt werden.";
    }
}

function togglePdfRow(index, checked) {
    if(detectedPdfRounds[index]) {
        detectedPdfRounds[index].selected = checked;
    }
}

async function confirmPDFImport() {
    if(!currentUser || !authToken) {
        alert("Bitte melde dich an oder erstelle ein Konto, um Runden in dein Benutzerkonto zu importieren.");
        openAuthModal('login');
        return;
    }

    const toImport = detectedPdfRounds.filter(r => r.selected);
    if(toImport.length === 0) {
        alert("Keine Runden ausgewählt.");
        return;
    }

    await apiFetch('/api/runden/batch', 'POST', { runden: toImport });

    toImport.forEach(r => {
        runden.push({
            datum: r.datum,
            club_name: r.club_name,
            loecher: r.loecher,
            brutto: r.brutto,
            sd: r.sd,
            isBest: false
        });
    });

    updateApp();
    showToast(`${toImport.length} Runden aus PDF erfolgreich importiert!`, "📄");
    document.getElementById('pdf-preview-container').classList.add('hidden');
    switchTab('history');
}

