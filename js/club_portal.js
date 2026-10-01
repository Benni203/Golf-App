// =========================================================================
// CLUB PORTAL & SEKRETARIATS-COCKPIT
// Live-Spieler-Monitor, Scorekarten-Posteingang & PC CADDIE Scoring-Assistent
// =========================================================================

const clubPortalState = {
    clubName: '',
    livePlayers: [],
    scorecards: [],
    filterStatus: 'all',
    activeCardId: null,
    pollTimer: null
};

// --- INITIALISIERUNG & DATEN LADEN ---
async function loadClubPortalData() {
    const portalTab = document.getElementById('tab-club-portal');
    if (!portalTab || portalTab.classList.contains('hidden')) {
        // Nicht aktiv -> Polling stoppen
        if (clubPortalState.pollTimer) {
            clearInterval(clubPortalState.pollTimer);
            clubPortalState.pollTimer = null;
        }
    }

    if (!currentUser) return;

    // Club-Name ermitteln
    const userClub = currentUser.managed_club_name || (currentUser.role === 'club' ? currentUser.username : '');
    const activeClubName = userClub || (clubs && clubs.length > 0 ? clubs[0].name : 'GC Gut Jersbek');
    clubPortalState.clubName = activeClubName;

    // Header aktualisieren
    const titleEl = document.getElementById('cp-club-title');
    if (titleEl) titleEl.innerText = activeClubName;

    const clubMeta = (clubs || []).find(c => c.name === activeClubName);
    const metaEl = document.getElementById('cp-club-meta');
    if (metaEl && clubMeta) {
        metaEl.innerText = `${clubMeta.city || ''} • ${clubMeta.region || 'Deutschland'} • Par ${clubMeta.par18 || 72} • CR ${clubMeta.cr18 || 72.0} • SR ${clubMeta.sr18 || 130}`;
    }

    // 1. Live-Spieler laden
    try {
        const url = `/api/club-portal/live-players?club_name=${encodeURIComponent(activeClubName)}`;
        const res = await apiFetch(url, 'GET');
        if (res.ok && res.data) {
            clubPortalState.livePlayers = res.data.players || [];
        }
    } catch (e) {
        console.warn('Fehler beim Laden der Live-Spieler:', e);
    }

    // 2. Eingereichte Scorekarten laden
    try {
        let url = `/api/club-portal/scorecards?club_name=${encodeURIComponent(activeClubName)}`;
        if (clubPortalState.filterStatus && clubPortalState.filterStatus !== 'all') {
            url += `&status=${encodeURIComponent(clubPortalState.filterStatus)}`;
        }
        const res = await apiFetch(url, 'GET');
        if (res.ok && res.data) {
            clubPortalState.scorecards = res.data.scorecards || [];
        }
    } catch (e) {
        console.warn('Fehler beim Laden der Scorekarten:', e);
    }

    renderClubPortalMetrics();
    renderLivePlayersTable();
    renderScorecardsInboxTable();

    // Polling starten (alle 20 Sekunden), wenn noch nicht aktiv
    if (!clubPortalState.pollTimer) {
        clubPortalState.pollTimer = setInterval(() => {
            const tab = document.getElementById('tab-club-portal');
            if (tab && !tab.classList.contains('hidden')) {
                loadClubPortalData();
            } else {
                clearInterval(clubPortalState.pollTimer);
                clubPortalState.pollTimer = null;
            }
        }, 20000);
    }
}

// --- METRIKEN BERECHNEN & RENDERN ---
function renderClubPortalMetrics() {
    const liveCount = clubPortalState.livePlayers.length;
    const submittedCount = clubPortalState.scorecards.filter(c => c.submission_status === 'submitted').length;
    const pccaddieCount = clubPortalState.scorecards.filter(c => c.submission_status === 'in_pccaddie').length;
    const totalCount = clubPortalState.scorecards.length;

    const elLive = document.getElementById('cp-metric-live');
    if (elLive) elLive.innerText = liveCount;

    const elSub = document.getElementById('cp-metric-submitted');
    if (elSub) elSub.innerText = submittedCount;

    const elPc = document.getElementById('cp-metric-pccaddie');
    if (elPc) elPc.innerText = pccaddieCount;

    const elTotal = document.getElementById('cp-metric-total');
    if (elTotal) elTotal.innerText = totalCount;
}

// --- LIVE-SPIELER TABELLE RENDERN ---
function renderLivePlayersTable() {
    const tbody = document.getElementById('cp-live-players-body');
    const emptyState = document.getElementById('cp-live-players-empty');
    if (!tbody) return;

    tbody.innerHTML = '';
    const players = clubPortalState.livePlayers;

    if (players.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    if (emptyState) emptyState.classList.add('hidden');

    players.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition-colors border-b border-slate-100';

        const hcpText = (p.handicap_index !== null && p.handicap_index !== undefined)
            ? (p.handicap_index < 0 ? `+${Math.abs(p.handicap_index).toFixed(1)}` : p.handicap_index.toFixed(1))
            : '54.0';

        const teeColorClass = (p.tee === 'rot')
            ? 'bg-rose-100 text-rose-800 border-rose-200'
            : 'bg-amber-100 text-amber-800 border-amber-200';

        tr.innerHTML = `
            <td class="py-3.5 px-4 font-bold text-slate-900">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Live auf der Runde"></span>
                    <span class="text-sm">${p.username}</span>
                </div>
            </td>
            <td class="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                ${hcpText}
            </td>
            <td class="py-3.5 px-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border uppercase tracking-wider ${teeColorClass}">
                    ${p.tee || 'gelb'}
                </span>
            </td>
            <td class="py-3.5 px-4 text-xs font-semibold text-slate-600">
                <div class="flex flex-col">
                    <span class="text-slate-900 font-bold font-mono">${p.started_at_time || '--:--'} Uhr</span>
                    <span class="text-[11px] text-slate-400">vor ${p.duration_minutes} Min.</span>
                </div>
            </td>
            <td class="py-3.5 px-4 text-xs">
                ${p.turnier_name ? `
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[11px]">
                        🏆 ${p.turnier_name}
                    </span>
                ` : `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]">
                        Freie Runde (${p.loecher}L)
                    </span>
                `}
            </td>
            <td class="py-3.5 px-4 text-right">
                <button type="button" onclick="clubCheckoutPlayer(${p.id}, '${p.username}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold text-xs border border-slate-200 transition-colors" title="Check-In beenden">
                    Abmelden
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- SCOREKARTEN-POSTEINGANG RENDERN ---
function renderScorecardsInboxTable() {
    const tbody = document.getElementById('cp-scorecards-body');
    const emptyState = document.getElementById('cp-scorecards-empty');
    if (!tbody) return;

    tbody.innerHTML = '';
    const cards = clubPortalState.scorecards;

    if (cards.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    if (emptyState) emptyState.classList.add('hidden');

    cards.forEach(card => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition-colors border-b border-slate-100';

        // Status Badge
        let statusBadge = '';
        if (card.submission_status === 'in_pccaddie') {
            statusBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px]">✅ In PC CADDIE</span>`;
        } else if (card.submission_status === 'verified') {
            statusBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-bold text-[11px]">🔵 Geprüft</span>`;
        } else {
            statusBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] animate-pulse">🟡 Neu eingereicht</span>`;
        }

        // Sicherheitsprüfungen (Unterschriften & GPS)
        const hasSignatures = card.has_player_signature && card.has_marker_signature;
        const sigBadge = hasSignatures
            ? `<span class="text-xs text-emerald-700 font-semibold" title="Spieler & Marker Unterschriften vorhanden">✍️ 2/2 Signiert</span>`
            : `<span class="text-xs text-amber-700 font-semibold" title="Nur teilweise signiert">✍️ ${card.has_player_signature ? '1/2' : '0/2'}</span>`;

        const gpsBadge = card.gps_verified
            ? `<span class="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold" title="DGV GPS-Verifikation bestätigt">🛡️ DGV-GPS</span>`
            : `<span class="text-[11px] text-slate-400 font-mono">Kein GPS</span>`;

        tr.innerHTML = `
            <td class="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600">
                ${card.datum}
            </td>
            <td class="py-3.5 px-4 font-bold text-slate-900">
                <div class="flex flex-col">
                    <span class="text-sm">${card.username}</span>
                    <span class="text-[11px] text-slate-400 font-normal">Zähler: ${card.marker_name || 'Nicht angegeben'}</span>
                </div>
            </td>
            <td class="py-3.5 px-4 text-center font-mono text-xs">
                <span class="font-bold text-slate-900">${card.brutto}</span>
                <span class="text-slate-400 text-[11px]">(${card.netto} N)</span>
            </td>
            <td class="py-3.5 px-4 text-center font-mono text-xs font-extrabold text-golf-800">
                ${card.stableford} Pkt.
            </td>
            <td class="py-3.5 px-4">
                <div class="flex flex-col gap-1">
                    ${sigBadge}
                    ${gpsBadge}
                </div>
            </td>
            <td class="py-3.5 px-4 text-center">
                ${statusBadge}
            </td>
            <td class="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                <button type="button" onclick="openPcCaddieAssistModal(${card.id})" class="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors" title="PC CADDIE Schnelleingabe-Maske öffnen">
                    💻 PC CADDIE
                </button>
                <button type="button" onclick="downloadSinglePcCaddieCsv(${card.id})" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors" title="PC CADDIE CSV herunterladen">
                    📥
                </button>
                <button type="button" onclick="openScorecardPrintPreviewForRound(${card.id})" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors" title="Offizielle Scorekarte drucken / PDF">
                    🖨️
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- FILTER WECHSELN ---
function setClubPortalFilter(status) {
    clubPortalState.filterStatus = status;
    document.querySelectorAll('.cp-filter-btn').forEach(btn => {
        if (btn.dataset.status === status) {
            btn.className = "cp-filter-btn active px-3 py-1 rounded-lg bg-golf-600 text-white font-bold text-xs shadow-xs transition-colors";
        } else {
            btn.className = "cp-filter-btn px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors";
        }
    });
    loadClubPortalData();
}

// --- PC CADDIE SCHNELLEINGABE-ASSISTENT (MODAL) ---
function openPcCaddieAssistModal(cardId) {
    const card = clubPortalState.scorecards.find(c => c.id === cardId);
    if (!card) return;

    clubPortalState.activeCardId = cardId;
    const modal = document.getElementById('pccaddie-assist-modal');
    if (!modal) return;

    // Header Infos
    const playerEl = document.getElementById('pca-player-name');
    if (playerEl) playerEl.innerText = `${card.username} (HCP ${card.handicap_index !== null ? card.handicap_index : '--'})`;

    const metaEl = document.getElementById('pca-meta-info');
    if (metaEl) metaEl.innerText = `${card.club_name} • ${card.datum} • Abschlag: ${card.tee.toUpperCase()} • Spielvorgabe: ${card.playing_hcp} • Zähler: ${card.marker_name || '-'}`;

    const totalsEl = document.getElementById('pca-totals');
    if (totalsEl) totalsEl.innerText = `Brutto: ${card.brutto} • Netto: ${card.netto} • Stableford: ${card.stableford} Pkt.`;

    // 18 Löcher Kacheln aufbauen
    const container = document.getElementById('pca-holes-grid');
    if (container) {
        container.innerHTML = '';
        const holes = card.holes || [];

        // 18 Löcher Grid
        holes.slice(0, 18).forEach(h => {
            const holeTile = document.createElement('div');
            holeTile.className = 'p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col justify-between';
            holeTile.innerHTML = `
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">L${h.hole}</div>
                <div class="my-1 text-xl font-mono font-black text-slate-900">${h.gross || '-'}</div>
                <div class="text-[10px] text-slate-500 font-mono">Par ${h.par || 4} • ${h.points || 0}P</div>
            `;
            container.appendChild(holeTile);
        });
    }

    // Status Buttons aktualisieren
    const statusSelect = document.getElementById('pca-status-select');
    if (statusSelect) statusSelect.value = card.submission_status || 'submitted';

    modal.classList.remove('hidden');
}

function closePcCaddieAssistModal() {
    const modal = document.getElementById('pccaddie-assist-modal');
    if (modal) modal.classList.add('hidden');
    clubPortalState.activeCardId = null;
}

// --- SCORES IN ZWISCHENABLAGE KOPIEREN (TAB-GETRENNT FÜR PC CADDIE) ---
async function copyScoresToClipboard() {
    const card = clubPortalState.scorecards.find(c => c.id === clubPortalState.activeCardId);
    if (!card || !card.holes) return;

    const scoresList = card.holes.slice(0, 18).map(h => String(h.gross || 0));
    const tabDelimited = scoresList.join('\t');

    try {
        await navigator.clipboard.writeText(tabDelimited);
        showToast("Scores in die Zwischenablage kopiert! Bereit zum Einfügen in PC CADDIE. 📋", "✅");
    } catch (e) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = tabDelimited;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast("Scores in die Zwischenablage kopiert! 📋", "✅");
    }
}

// --- STATUS AKTUALISIEREN ---
async function updateActiveScorecardStatus(newStatus) {
    if (!clubPortalState.activeCardId) return;
    const cardId = clubPortalState.activeCardId;

    try {
        const res = await apiFetch(`/api/club-portal/scorecards/${cardId}/status`, 'PUT', { status: newStatus });
        if (res.ok) {
            showToast(`Status auf '${newStatus}' gesetzt!`, "✅");
            closePcCaddieAssistModal();
            await loadClubPortalData();
        } else {
            showToast("Fehler beim Aktualisieren: " + (res.data?.fehler || 'Fehler'), "⚠️");
        }
    } catch (e) {
        showToast("Netzwerkfehler: " + e.message, "⚠️");
    }
}

// --- BATCH EXPORT DOWNLOAD ---
function downloadClubBatchPcCaddieCsv() {
    if (!currentUser) return;
    const club = clubPortalState.clubName || 'GC Gut Jersbek';
    const url = `/api/club-portal/export/pccaddie.csv?club_name=${encodeURIComponent(club)}&token=${encodeURIComponent(authToken || '')}`;
    window.open(url, '_blank');
    showToast("PC CADDIE Sammel-Export heruntergeladen! 📥", "⛳");
}

function downloadSinglePcCaddieCsv(cardId) {
    const url = `/api/scorecards/${cardId}/pccaddy.csv?token=${encodeURIComponent(authToken || '')}`;
    window.open(url, '_blank');
}

// --- SPIELER MANUELL DURCH CLUB AUSCHECKSTATUS NEHMEN ---
async function clubCheckoutPlayer(checkinId, playerName) {
    if (!confirm(`Möchtest du den Check-In für '${playerName}' beenden?`)) return;

    try {
        const res = await apiFetch('/api/club-portal/live-checkout', 'POST', { checkin_id: checkinId });
        if (res.ok) {
            showToast(`Check-In für '${playerName}' beendet.`, "📍");
            await loadClubPortalData();
        } else {
            showToast("Fehler: " + (res.data?.fehler || 'Fehler'), "⚠️");
        }
    } catch (e) {
        showToast("Fehler: " + e.message, "⚠️");
    }
}

// --- SCHNELL-LOGIN ALS DEMO-CLUB (FÜR TESTS) ---
async function loginAsDemoClub() {
    const identInput = document.getElementById('auth-login-identifier');
    const pwInput = document.getElementById('auth-login-password');
    if (identInput && pwInput) {
        identInput.value = 'club_jersbek';
        pwInput.value = 'GolfPassword2026!';
        showToast("Club-Zugangsdaten eingetragen (GC Gut Jersbek)!", "🏛️");
        const form = document.getElementById('auth-login-form');
        if (form) {
            if (typeof form.requestSubmit === 'function') {
                form.requestSubmit();
            } else if (typeof handleLoginSubmit === 'function') {
                handleLoginSubmit({ preventDefault: () => {} });
            }
        }
    }
}
