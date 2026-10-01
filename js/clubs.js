// --- LIVE CHECK-IN & ACTIVE PLAYING ---
function checkInClub(clubName, turnier = null) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    activeCheckIn = {
        clubName: clubName,
        turnier: turnier ? (typeof turnier === 'string' ? turnier : turnier.name) : null,
        time: timeStr,
        date: dateStr
    };
    saveData();

    // Pre-select club in round recording
    const recClub = document.getElementById('rec-club');
    if(recClub) recClub.value = clubName;

    // Pre-select tournament & properties if applicable
    if(turnier && typeof turnier === 'object') {
        if(turnier.loecher) {
            const recLoecher = document.getElementById('rec-loecher');
            if(recLoecher) recLoecher.value = String(turnier.loecher);
        }
        if(turnier.datum && turnier.datum.includes('.')) {
            const parts = turnier.datum.split('.');
            if(parts.length === 3) {
                const isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                const dateInput = document.getElementById('rec-datum');
                if(dateInput) dateInput.value = isoDate;
            }
        }
    }

    updateTournamentDropdown(clubName, activeCheckIn.turnier);
    onRoundInputChanged();
    renderHeader();
    renderActiveCheckInBanner();
    renderClubsExplorer();

    switchTab('record');
    showToast(`Check-In aktiv: ${clubName}! ⛳`, "🏌️‍♂️");

    // Server-seitiger Live-Check-In für den Club
    if(typeof apiFetch === 'function' && authToken) {
        apiFetch('/api/club-portal/live-checkin', 'POST', {
            club_name: clubName,
            turnier_name: activeCheckIn.turnier || '',
            tee: document.getElementById('sc-tee-select')?.value || 'gelb',
            loecher: (activeCheckIn.turnier && typeof turnier === 'object' && turnier.loecher) ? turnier.loecher : 18
        }).catch(e => console.log('Live-Check-In Hintergrund-Sync:', e));
    }
}

function checkOutClub() {
    activeCheckIn = null;
    saveData();
    renderHeader();
    renderActiveCheckInBanner();
    renderClubsExplorer();
    showToast("Check-In beendet.", "📍");

    // Server-seitiger Live-Check-Out
    if(typeof apiFetch === 'function' && authToken) {
        apiFetch('/api/club-portal/live-checkout', 'POST', {}).catch(() => {});
    }
}

function renderActiveCheckInBanner() {
    const banner = document.getElementById('record-checkin-banner');
    if(!banner) return;

    if(activeCheckIn) {
        banner.className = "mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-golf-50 to-teal-500/10 border-2 border-emerald-400 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all";
        banner.innerHTML = `
            <div class="flex items-start sm:items-center gap-3">
                <div class="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-xs shrink-0 animate-bounce">
                    ⛳
                </div>
                <div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">Du spielst hier gerade</span>
                        <span class="text-xs text-slate-500">Aktiv seit ${activeCheckIn.time} Uhr</span>
                    </div>
                    <div class="text-base sm:text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>${activeCheckIn.clubName}</span>
                        ${activeCheckIn.turnier ? `<span class="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">🏆 ${activeCheckIn.turnier}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button type="button" onclick="setEntryMode('holes')" class="px-3.5 py-2 rounded-xl bg-golf-600 hover:bg-golf-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    <span>Loch-Scorekarte</span>
                </button>
                <button type="button" onclick="checkOutClub()" class="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-rose-600 border border-slate-300 font-bold text-xs transition-all active:scale-95" title="Check-In beenden">
                    Check-Out
                </button>
                <button type="button" onclick="switchTab('clubs')" class="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-bold" title="Anderen Golfclub wählen">
                    🔄
                </button>
            </div>
        `;
    } else {
        banner.className = "mb-5 p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all";
        banner.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-base">📍</span>
                <span>Tipp: Wähle deinen Club mit 1 Klick aus der <strong>Golfclub-Liste ("Hier jetzt golfen")</strong> für automatischen Check-In!</span>
            </div>
            <button type="button" onclick="switchTab('clubs')" class="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs shrink-0 shadow-xs border border-slate-200 transition-all self-end sm:self-auto">
                Zur Club-Liste & Turniere →
            </button>
        `;
    }
}

// --- GOLFCLUBS & TURNIERE EXPLORER ---
function renderClubsExplorer() {
    const cardsGrid = document.getElementById('clubs-cards-grid');
    const tableBody = document.getElementById('table-clubs-body');
    const emptyState = document.getElementById('clubs-empty-state');
    const alertBox = document.getElementById('clubs-checkin-alert');
    const alertText = document.getElementById('clubs-checkin-alert-text');

    if(alertBox && alertText) {
        if(activeCheckIn) {
            alertBox.classList.remove('hidden');
            alertText.innerHTML = `${activeCheckIn.clubName} <span class="text-xs font-normal text-slate-500">(Check-In um ${activeCheckIn.time} Uhr)</span>${activeCheckIn.turnier ? ` • 🏆 <span class="text-amber-800">${activeCheckIn.turnier}</span>` : ''}`;
        } else {
            alertBox.classList.add('hidden');
        }
    }

    // Filter logic
    const q = clubSearchQuery.toLowerCase().trim();
    let filtered = clubs.filter(c => {
        // Region filter
        if(selectedClubRegionFilter === 'favorites') {
            if(!favoriteClubNames.has(c.name)) return false;
        } else if(selectedClubRegionFilter === 'Hamburg & Umland') {
            if(!c.region || !c.region.includes('Hamburg')) return false;
        } else if(selectedClubRegionFilter === 'Schleswig-Holstein') {
            if(!c.region || !c.region.includes('Schleswig-Holstein')) return false;
        } else if(selectedClubRegionFilter === 'Niedersachsen & Bremen') {
            if(!c.region || (!c.region.includes('Niedersachsen') && !c.region.includes('Bremen'))) return false;
        } else if(selectedClubRegionFilter === 'Weitere') {
            if(!c.region || c.region.includes('Hamburg') || c.region.includes('Schleswig') || c.region.includes('Niedersachsen')) return false;
        } else if(selectedClubRegionFilter === 'custom') {
            if(!c.is_custom && !c.user_id) return false;
        }

        // Tournament only filter
        const cTournaments = turniere.filter(t => t.club_name === c.name);
        if(filterOnlyTournaments && cTournaments.length === 0) {
            return false;
        }

        // Search query
        if(q) {
            const matchName = c.name.toLowerCase().includes(q);
            const matchCity = (c.city || '').toLowerCase().includes(q);
            const matchRegion = (c.region || '').toLowerCase().includes(q);
            const matchTournament = cTournaments.some(t => t.name.toLowerCase().includes(q));
            if(!matchName && !matchCity && !matchRegion && !matchTournament) return false;
        }

        return true;
    });

    // Sort: Favorites first when in 'all' view
    if(selectedClubRegionFilter === 'all') {
        filtered.sort((a, b) => {
            const aFav = favoriteClubNames.has(a.name) ? 1 : 0;
            const bFav = favoriteClubNames.has(b.name) ? 1 : 0;
            return bFav - aFav;
        });
    }

    // Update Badges
    const badgeClubs = document.getElementById('clubs-count-badge');
    if(badgeClubs) badgeClubs.innerText = `${filtered.length} Clubs`;

    const badgeTurniere = document.getElementById('tournaments-count-badge');
    if(badgeTurniere) badgeTurniere.innerText = `${turniere.length} Turniere`;

    const navBadge = document.getElementById('nav-clubs-badge');
    if(navBadge) navBadge.innerText = `${clubs.length}`;

    // Handle empty state
    if(filtered.length === 0) {
        if(emptyState) emptyState.classList.remove('hidden');
        if(cardsGrid) cardsGrid.innerHTML = '';
        if(tableBody) tableBody.innerHTML = '';
        return;
    } else {
        if(emptyState) emptyState.classList.add('hidden');
    }

    // 1. Render Cards Grid
    if(cardsGrid) {
        cardsGrid.innerHTML = '';
        filtered.forEach(c => {
            const isCheckedIn = activeCheckIn && activeCheckIn.clubName === c.name;
            const isFav = favoriteClubNames.has(c.name);
            const cTournaments = turniere.filter(t => t.club_name === c.name);
            const origIndex = clubs.findIndex(item => item.name === c.name);

            const card = document.createElement('div');
            card.className = `rounded-2xl bg-white border p-5 flex flex-col justify-between transition-all ${
                isCheckedIn 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-gradient-to-b from-emerald-50/40 via-white to-white shadow-md' 
                    : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
            }`;

            let tournamentsHtml = '';
            if(cTournaments.length > 0) {
                tournamentsHtml = `
                    <div class="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
                        <div class="flex items-center justify-between text-xs">
                            <span class="font-bold text-slate-800 flex items-center gap-1">
                                <span>🏆 Turniere & Flights</span>
                                <span class="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">${cTournaments.length}</span>
                            </span>
                            <div class="flex items-center gap-2">
                                <button type="button" onclick="syncClubPcCaddy(${c.id || 'null'}, '${c.name.replace(/'/g, "\\'")}')" class="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center gap-0.5" title="Offizielle Turniere live von PC CADDIE synchronisieren">🔄 Live Sync</button>
                                <button type="button" onclick="openPcCaddyImportModal('${c.name.replace(/'/g, "\\'")}')" class="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline" title="PC CADDIE / iCal Turnierkalender importieren">📥 Import</button>
                                <button type="button" onclick="openTurnierModal('${c.name.replace(/'/g, "\\'")}')" class="text-[11px] text-amber-600 hover:text-amber-800 font-bold hover:underline">+ Mehr</button>
                            </div>
                        </div>
                        <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            ${cTournaments.map(t => `
                                <div class="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 hover:bg-amber-50 transition-colors flex items-center justify-between gap-2">
                                    <div class="min-w-0 flex-1 cursor-pointer" onclick="openTournamentDetails(${t.id})">
                                        <div class="text-xs font-bold text-slate-900 truncate" title="${t.name}">${t.name}</div>
                                        <div class="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                            <span class="font-semibold text-amber-900">${t.datum}</span>
                                            <span>•</span>
                                            <span>${t.loecher}L</span>
                                            <span>•</span>
                                            <span>${t.spielform || 'Stableford'}</span>
                                            <span>•</span>
                                            <span class="font-semibold ${t.vorgabewirksam ? 'text-emerald-700' : 'text-slate-400'}">${t.vorgabewirksam ? 'HCP' : 'Nicht vorgabew.'}</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-1 shrink-0">
                                        <button type="button" onclick="openTournamentDetails(${t.id})" class="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200 shadow-xs" title="Teilnehmer & Flight Details">
                                            Details
                                        </button>
                                        <button type="button" onclick="openScorecardModal(${JSON.stringify(t).replace(/"/g, '&quot;')})" class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] shadow-xs transition-transform active:scale-95 flex items-center gap-1" title="Digitale Scorekarte spielen">
                                            <span>🏆 Score</span>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                tournamentsHtml = `
                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span class="text-[11px]">Keine Turniere hinterlegt</span>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="syncClubPcCaddy(${c.id || 'null'}, '${c.name.replace(/'/g, "\\'")}')" class="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center gap-0.5" title="Offizielle Turniere live von PC CADDIE synchronisieren">🔄 Live Sync</button>
                            <button type="button" onclick="openPcCaddyImportModal('${c.name.replace(/'/g, "\\'")}')" class="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline">📥 Import</button>
                            <button type="button" onclick="openTurnierModal('${c.name.replace(/'/g, "\\'")}')" class="text-[11px] text-sand-600 hover:text-sand-700 font-bold hover:underline">+ Manuell</button>
                        </div>
                    </div>
                `;
            }

            // Weather widget box
            let weatherHtml = '';
            if(c.lat && c.lon) {
                weatherHtml = `
                    <div class="mt-2.5 flex items-center justify-between p-2 rounded-xl bg-sky-50/70 border border-sky-200/80 text-[11px] text-sky-950">
                        <div class="flex items-center gap-1.5" id="weather-chip-${origIndex}">
                            <span>🌤️</span>
                            <span class="font-medium">Live Wetter</span>
                        </div>
                        <button type="button" onclick="openWeatherModal('${c.name.replace(/'/g, "\\'")}')" class="text-[10px] font-bold text-sky-700 hover:text-sky-900 underline">
                            Wind & Details →
                        </button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div>
                    <!-- Card Header with Favorite Star -->
                    <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <h3 class="font-bold text-slate-900 text-base leading-tight">${c.name}</h3>
                                ${isFav ? '<span class="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">⭐ Favorit</span>' : ''}
                                ${c.is_custom ? '<span class="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[10px] font-bold">Mein Club</span>' : ''}
                            </div>
                            <div class="flex items-center gap-1.5 mt-1 text-xs text-slate-500 flex-wrap">
                                ${c.city ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">📍 ${c.city}</span>` : ''}
                                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-golf-50 text-golf-800 font-semibold text-[11px]">${c.region || 'Deutschland'}</span>
                                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono">Tee: ${c.tee || 'gelb'}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-1 shrink-0">
                            <button type="button" onclick="toggleFavoriteClub('${c.name.replace(/'/g, "\\'")}')" class="p-1 rounded-lg hover:bg-amber-50 text-base leading-none transition-transform active:scale-125" title="${isFav ? 'Aus Favoriten entfernen' : 'Als Favorit speichern'}">
                                ${isFav ? '<span class="text-amber-500">⭐</span>' : '<span class="text-slate-300 hover:text-amber-400">☆</span>'}
                            </button>
                            ${isCheckedIn ? `
                                <span class="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs animate-pulse">
                                    <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                                    <span>Hier aktiv</span>
                                </span>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Live Weather chip -->
                    ${weatherHtml}

                    <!-- Course Rating Stats Grid -->
                    <div class="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">18-Loch</div>
                            ${c.par18 ? `
                                <div class="mt-1 font-mono font-black text-slate-800 text-sm">Par ${c.par18}</div>
                                <div class="text-[11px] text-slate-500 font-mono mt-0.5">CR ${c.cr18} • SR ${c.sr18}</div>
                            ` : '<div class="text-slate-400 text-xs mt-1">Nicht hinterlegt</div>'}
                        </div>
                        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">9-Loch</div>
                            ${c.par9 ? `
                                <div class="mt-1 font-mono font-black text-slate-800 text-sm">Par ${c.par9}</div>
                                <div class="text-[11px] text-slate-500 font-mono mt-0.5">CR ${c.cr9} • SR ${c.sr9}</div>
                            ` : '<div class="text-slate-400 text-xs mt-1">Nicht hinterlegt</div>'}
                        </div>
                    </div>

                    <!-- Tournaments Block -->
                    ${tournamentsHtml}
                </div>

                <!-- Card Actions Footer -->
                <div class="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                    ${isCheckedIn ? `
                        <button type="button" onclick="switchTab('record')" class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95">
                            <span>Zur Scorekarte →</span>
                        </button>
                        <button type="button" onclick="checkOutClub()" class="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-rose-600 border border-slate-200 font-bold text-xs transition-all active:scale-95" title="Check-In beenden">
                            Check-Out
                        </button>
                    ` : `
                        <button type="button" onclick="checkInClub('${c.name.replace(/'/g, "\\'")}')" class="flex-1 py-2 px-3 rounded-xl bg-golf-600 hover:bg-golf-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-95">
                            <span>⛳ Hier golfen</span>
                        </button>
                        <a href="${c.pccaddie_url || ('https://www.google.com/search?q=' + encodeURIComponent(c.name + ' turnierkalender pccaddie'))}" target="_blank" rel="noopener noreferrer" class="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all flex items-center gap-1" title="Offiziellen PC CADDIE / Golf.de Turnierkalender im Browser öffnen">
                            <span>🌐 PC CADDIE</span>
                        </a>
                        <button type="button" onclick="syncClubPcCaddy(${c.id || 'null'}, '${c.name.replace(/'/g, "\\'")}')" class="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-all flex items-center gap-1" title="Turniere live von PC CADDIE synchronisieren">
                            <span>🔄 Sync</span>
                        </button>
                        <button type="button" onclick="openPcCaddyImportModal('${c.name.replace(/'/g, "\\'")}')" class="py-2 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-all" title="PC CADDIE / iCal Kalender importieren">
                            📥
                        </button>
                        <button type="button" onclick="openTurnierModal('${c.name.replace(/'/g, "\\'")}')" class="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs transition-all" title="Turnier manuell eintragen">
                            🏆 +
                        </button>
                    `}
                    ${c.is_custom ? `
                        <button type="button" onclick="editClub(${origIndex})" class="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100" title="Bearbeiten">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button type="button" onclick="deleteClub(${origIndex})" class="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50" title="Löschen">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    ` : ''}
                </div>
            `;
            cardsGrid.appendChild(card);
        });
    }

    // 2. Render Table View
    if(tableBody) {
        tableBody.innerHTML = '';
        filtered.forEach(c => {
            const isCheckedIn = activeCheckIn && activeCheckIn.clubName === c.name;
            const isFav = favoriteClubNames.has(c.name);
            const cTournaments = turniere.filter(t => t.club_name === c.name);
            const origIndex = clubs.findIndex(item => item.name === c.name);

            const tr = document.createElement('tr');
            tr.className = isCheckedIn ? "bg-emerald-50/60 hover:bg-emerald-50 transition-colors" : "hover:bg-slate-50 transition-colors";
            tr.innerHTML = `
                <td class="py-3 px-4 font-bold text-slate-900">
                    <div class="flex items-center gap-1.5">
                        <button type="button" onclick="toggleFavoriteClub('${c.name.replace(/'/g, "\\'")}')" class="text-sm ${isFav ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}" title="${isFav ? 'Aus Favoriten entfernen' : 'Als Favorit speichern'}">
                            ${isFav ? '⭐' : '☆'}
                        </button>
                        <span>${c.name}</span>
                        ${isCheckedIn ? '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>' : ''}
                        ${c.is_custom ? '<span class="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[10px] font-bold">Mein Club</span>' : ''}
                    </div>
                </td>
                <td class="py-3 px-4 text-slate-600 text-xs">
                    ${c.city ? `<span class="font-semibold text-slate-800">${c.city}</span>, ` : ''}${c.region || 'Deutschland'}
                </td>
                <td class="py-3 px-4 text-slate-600"><span class="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-semibold">${c.tee || 'gelb'}</span></td>
                <td class="py-3 px-4 text-center font-mono text-xs">
                    ${c.par18 ? `Par ${c.par18} | CR ${c.cr18} | SR ${c.sr18}` : '<span class="text-slate-300">-</span>'}
                </td>
                <td class="py-3 px-4 text-center font-mono text-xs">
                    ${c.par9 ? `Par ${c.par9} | CR ${c.cr9} | SR ${c.sr9}` : '<span class="text-slate-300">-</span>'}
                </td>
                <td class="py-3 px-4 text-center">
                    ${cTournaments.length > 0 ? `
                        <button type="button" onclick="showClubTournaments('${c.name.replace(/'/g, "\\'")}')" class="px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold transition-colors shadow-2xs" title="Turniere für ${c.name} anzeigen">
                            🏆 ${cTournaments.length}
                        </button>
                    ` : '<span class="text-slate-300 text-xs">-</span>'}
                </td>
                <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    ${isCheckedIn ? `
                        <button onclick="switchTab('record')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors">
                            Scorekarte →
                        </button>
                    ` : `
                        <button onclick="checkInClub('${c.name.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-lg bg-golf-600 hover:bg-golf-700 text-white font-bold text-xs transition-colors">
                            ⛳ Spielen
                        </button>
                        <a href="${c.pccaddie_url || ('https://www.google.com/search?q=' + encodeURIComponent(c.name + ' turnierkalender pccaddie'))}" target="_blank" rel="noopener noreferrer" class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors inline-block" title="PC CADDIE öffnen">
                            🌐
                        </a>
                        <button onclick="syncClubPcCaddy(${c.id || 'null'}, '${c.name.replace(/'/g, "\\'")}')" class="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors inline-block" title="PC CADDIE Live-Synchronisation">
                            🔄
                        </button>
                        <button onclick="openPcCaddyImportModal('${c.name.replace(/'/g, "\\'")}')" class="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors" title="PC CADDIE Turniere importieren">
                            📥
                        </button>
                    `}
                    ${c.is_custom ? `
                        <button onclick="editClub(${origIndex})" class="p-1 rounded-lg text-slate-500 hover:text-slate-900" title="Bearbeiten">✎</button>
                        <button onclick="deleteClub(${origIndex})" class="p-1 rounded-lg text-rose-500 hover:text-rose-700" title="Löschen">🗑️</button>
                    ` : ''}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

function setClubRegionFilter(region) {
    selectedClubRegionFilter = region;
    document.querySelectorAll('.region-pill').forEach(btn => {
        if(btn.dataset.region === region) {
            btn.className = "region-pill active px-3 py-1 rounded-lg bg-golf-600 text-white shadow-xs whitespace-nowrap transition-colors";
        } else {
            btn.className = "region-pill px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors";
        }
    });
    renderClubsExplorer();
}

function onClubFilterChanged() {
    const input = document.getElementById('club-search-input');
    const clearBtn = document.getElementById('club-search-clear');
    clubSearchQuery = input ? input.value : '';

    if(clearBtn) {
        if(clubSearchQuery) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }

    const tourneyCheckbox = document.getElementById('filter-only-tournaments');
    filterOnlyTournaments = tourneyCheckbox ? tourneyCheckbox.checked : false;

    renderClubsExplorer();
}

function clearClubSearch() {
    const input = document.getElementById('club-search-input');
    if(input) input.value = '';
    clubSearchQuery = '';
    const clearBtn = document.getElementById('club-search-clear');
    if(clearBtn) clearBtn.classList.add('hidden');
    renderClubsExplorer();
}

function resetClubFilters() {
    clubSearchQuery = '';
    filterOnlyTournaments = false;
    selectedClubRegionFilter = 'all';

    const input = document.getElementById('club-search-input');
    if(input) input.value = '';

    const tourneyCheckbox = document.getElementById('filter-only-tournaments');
    if(tourneyCheckbox) tourneyCheckbox.checked = false;

    setClubRegionFilter('all');
}

function setClubViewMode(mode) {
    clubViewMode = mode;
    const btnCards = document.getElementById('btn-view-cards');
    const btnTable = document.getElementById('btn-view-table');
    const cardsGrid = document.getElementById('clubs-cards-grid');
    const tableContainer = document.getElementById('clubs-table-container');

    if(mode === 'cards') {
        btnCards.className = "px-3 py-1 rounded-lg bg-white text-slate-900 shadow-xs flex items-center gap-1.5 transition-all";
        btnTable.className = "px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-all";
        cardsGrid.classList.remove('hidden');
        tableContainer.classList.add('hidden');
    } else {
        btnTable.className = "px-3 py-1 rounded-lg bg-white text-slate-900 shadow-xs flex items-center gap-1.5 transition-all";
        btnCards.className = "px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-all";
        cardsGrid.classList.add('hidden');
        tableContainer.classList.remove('hidden');
    }
}

function showClubTournaments(clubName) {
    clubSearchQuery = clubName;
    const searchInput = document.getElementById('clubs-search-input');
    if(searchInput) searchInput.value = clubName;
    setClubViewMode('cards');
    renderClubsExplorer();
    showToast(`Turniere für "${clubName}" angezeigt`, "🏆");
}


// --- GOLF CLUB CRUD MODAL ---
function openClubModal(editIndex = -1) {
    const modal = document.getElementById('club-modal');
    const title = document.getElementById('club-modal-title');
    const form = document.getElementById('club-modal-form');
    form.reset();
    document.getElementById('modal-club-index').value = editIndex;

    if(editIndex >= 0 && clubs[editIndex]) {
        const c = clubs[editIndex];
        title.innerText = "Golfclub bearbeiten";
        document.getElementById('modal-club-name').value = c.name || '';
        document.getElementById('modal-club-region').value = c.region || 'Hamburg & Umland';
        document.getElementById('modal-club-city').value = c.city || '';
        document.getElementById('modal-club-tee').value = c.tee || '';
        document.getElementById('modal-club-par18').value = c.par18 || '';
        document.getElementById('modal-club-cr18').value = c.cr18 || '';
        document.getElementById('modal-club-sr18').value = c.sr18 || '';
        document.getElementById('modal-club-par9').value = c.par9 || '';
        document.getElementById('modal-club-cr9').value = c.cr9 || '';
        document.getElementById('modal-club-sr9').value = c.sr9 || '';
    } else {
        title.innerText = "Neuen Golfclub anlegen";
        document.getElementById('modal-club-region').value = 'Hamburg & Umland';
        document.getElementById('modal-club-city').value = '';
    }
    modal.classList.remove('hidden');
}

function closeClubModal() {
    document.getElementById('club-modal').classList.add('hidden');
}

function editClub(index) {
    openClubModal(index);
}

async function deleteClub(index) {
    const club = clubs[index];
    if(!club) return;

    if(confirm(`Möchtest du den Club "${club.name}" wirklich löschen?`)) {
        if(currentUser && authToken && club.id) {
            await apiFetch(`/api/clubs/${club.id}`, 'DELETE');
        }
        clubs.splice(index, 1);
        updateApp();
        showToast("Club gelöscht.", "🗑️");
    }
}

async function handleSaveClub(e) {
    e.preventDefault();
    const index = parseInt(document.getElementById('modal-club-index').value, 10);
    const name = document.getElementById('modal-club-name').value.trim();
    const region = document.getElementById('modal-club-region').value || 'Meine Clubs';
    const city = document.getElementById('modal-club-city').value.trim();
    const tee = document.getElementById('modal-club-tee').value.trim() || 'gelb';

    const par18 = parseFloat(document.getElementById('modal-club-par18').value) || '';
    const cr18 = parseFloat(document.getElementById('modal-club-cr18').value) || '';
    const sr18 = parseFloat(document.getElementById('modal-club-sr18').value) || '';

    const par9 = parseFloat(document.getElementById('modal-club-par9').value) || '';
    const cr9 = parseFloat(document.getElementById('modal-club-cr9').value) || '';
    const sr9 = parseFloat(document.getElementById('modal-club-sr9').value) || '';

    const clubObj = { name, region, city, tee, par18, cr18, sr18, par9, cr9, sr9 };

    if(index >= 0 && clubs[index]) {
        const existing = clubs[index];
        if(existing.id) {
            clubObj.id = existing.id;
            if(currentUser && authToken) {
                await apiFetch(`/api/clubs/${existing.id}`, 'PUT', clubObj);
            }
        }
        clubs[index] = { ...existing, ...clubObj };
        showToast("Golfclub aktualisiert!", "✅");
    } else {
        if(currentUser && authToken) {
            const res = await apiFetch('/api/clubs', 'POST', clubObj);
            if(res.ok && res.data.club) {
                clubObj.id = res.data.club.id;
            }
        }
        clubs.push(clubObj);
        showToast("Neuer Golfclub hinzugefügt!", "⛳");
    }

    closeClubModal();
    updateApp();
}


// --- FEATURE EXTENSIONS: FAVORITES, WEATHER, SCORECARD, ADMIN, FRIENDS, STAMMBLATT ---
// =======================================================

// --- 1. FAVORITES LOGIC ---
async function toggleFavoriteClub(clubName) {
    if(!currentUser || !authToken) {
        openAuthModal('login');
        return;
    }
    const res = await apiFetch(`/api/favorites/clubs/${encodeURIComponent(clubName)}`, 'POST');
    if(res.ok) {
        if(res.data.is_favorite) {
            favoriteClubNames.add(clubName);
            showToast(`"${clubName}" zu Favoriten hinzugefügt! ⭐`, "⭐");
        } else {
            favoriteClubNames.delete(clubName);
            showToast(`"${clubName}" aus Favoriten entfernt.`, "☆");
        }
        renderClubsExplorer();
    } else {
        showToast("Fehler beim Aktualisieren des Favoriten.", "⚠️");
    }
}

// --- 2. WEATHER (OPEN-METEO) LOGIC ---
function getWeatherInfo(code) {
    const c = Number(code);
    if(c === 0) return { icon: "☀️", text: "Klar / Sonnig", tip: "Perfekte Sicht & Rollverhalten!" };
    if([1, 2, 3].includes(c)) return { icon: "🌤️", text: "Heiter / Leicht bewölkt", tip: "Optimale Spielbedingungen!" };
    if([45, 48].includes(c)) return { icon: "🌫️", text: "Nebel", tip: "Vorsicht bei weiten Abschlägen." };
    if([51, 53, 55].includes(c)) return { icon: "🌧️", text: "Nieselregen", tip: "Grüns werden langsamer, Schirm bereithalten." };
    if([61, 63, 65].includes(c)) return { icon: "🌧️", text: "Regen", tip: "Feuchtes Fairway, weniger Ausrollstrecke." };
    if([71, 73, 75].includes(c)) return { icon: "🌨️", text: "Schneefall", tip: "Wintergrüns beachten." };
    if([80, 81, 82].includes(c)) return { icon: "🌦️", text: "Regenschauer", tip: "Regenkleidung einpacken." };
    if([95, 96, 99].includes(c)) return { icon: "⛈️", text: "Gewitter", tip: "Achtung: Bei Blitzschlag Platz sofort verlassen!" };
    return { icon: "⛅", text: "Mäßig bewölkt", tip: "Gutes Golfwetter." };
}

async function fetchClubWeather(lat, lon) {
    if(!lat || !lon) return null;
    const key = `${Number(lat).toFixed(3)}_${Number(lon).toFixed(3)}`;
    if(weatherCache[key] && (Date.now() - weatherCache[key].time < 15 * 60 * 1000)) {
        return weatherCache[key].data;
    }
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if(!res.ok) return null;
        const json = await res.json();
        if(json.current_weather) {
            weatherCache[key] = { time: Date.now(), data: json.current_weather };
            return json.current_weather;
        }
    } catch(e) {
        console.warn("Wetterabruf fehlgeschlagen:", e);
    }
    return null;
}

async function openWeatherModal(clubName) {
    const club = clubs.find(c => c.name === clubName);
    if(!club) return;
    document.getElementById('wm-club').innerText = club.name;
    document.getElementById('wm-city').innerText = club.city || club.region || 'Deutschland';
    document.getElementById('wm-content').innerHTML = '<div class="py-6 text-center text-slate-500">Lade Live-Wetter von Open-Meteo...</div>';
    document.getElementById('weather-modal').classList.remove('hidden');

    if(club.lat && club.lon) {
        const w = await fetchClubWeather(club.lat, club.lon);
        if(w) {
            const info = getWeatherInfo(w.weathercode);
            document.getElementById('wm-icon').innerText = info.icon;
            document.getElementById('wm-content').innerHTML = `
                <div class="grid grid-cols-2 gap-3">
                    <div class="p-3 bg-sky-50 rounded-xl border border-sky-200">
                        <div class="text-[10px] uppercase font-bold text-sky-700">Temperatur</div>
                        <div class="text-xl font-black text-sky-950 font-mono mt-0.5">${w.temperature}°C</div>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div class="text-[10px] uppercase font-bold text-slate-600">Windgeschwindigkeit</div>
                        <div class="text-xl font-black text-slate-900 font-mono mt-0.5">${w.windspeed} km/h</div>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div class="text-[10px] uppercase font-bold text-slate-600">Windrichtung</div>
                        <div class="text-base font-bold text-slate-800 font-mono mt-1">${w.winddirection}°</div>
                    </div>
                    <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div class="text-[10px] uppercase font-bold text-emerald-800">Wetterlage</div>
                        <div class="text-sm font-bold text-emerald-950 mt-1">${info.text}</div>
                    </div>
                </div>
                <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs flex items-center gap-2">
                    <span class="text-lg">⛳</span>
                    <div><strong>Golfer-Tipp:</strong> ${info.tip} ${w.windspeed > 25 ? '1-2 Schläger mehr bei Gegenwind wählen!' : 'Ruhige Flugbahnen möglich.'}</div>
                </div>
            `;
            return;
        }
    }
    document.getElementById('wm-content').innerHTML = '<div class="py-4 text-center text-slate-500">Keine GPS-Koordinaten für diesen Club hinterlegt.</div>';
}

function closeWeatherModal() {
    document.getElementById('weather-modal').classList.add('hidden');
}

