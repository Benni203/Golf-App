// --- DATE HELPER ---
function parseDateDe(dateStr) {
    if(!dateStr) return new Date();
    let parts = dateStr.split('.');
    if(parts.length === 3) {
        return new Date(parts[2], parseInt(parts[1], 10) - 1, parts[0]);
    }
    return new Date(dateStr);
}

function formatDateDe(dateObj) {
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}.${m}.${y}`;
}

// --- CORE WHS CALCULATION LOGIC ---
function findSDErgaenzung(hcp) {
    const val = parseFloat(hcp);
    for(let e of sdErgaenzung) {
        if(val >= e.min_hcp && val <= e.max_hcp) return e.wert;
    }
    return 12.0; // Fallback
}

function calculateSD(club, loecher, brutto, currentHcp) {
    if(!club || !brutto) return null;
    const b = parseFloat(brutto);
    if(isNaN(b)) return null;

    if(loecher == 18) {
        if(!club.sr18 || !club.cr18) return null;
        const sr = parseFloat(club.sr18);
        const cr = parseFloat(club.cr18);
        const sd = (113 / sr) * (b - cr);
        return Math.round(sd * 10) / 10;
    } else {
        if(!club.sr9 || !club.cr9) return null;
        const sr = parseFloat(club.sr9);
        const cr = parseFloat(club.cr9);
        const basisSD = (113 / sr) * (b - cr);
        const ergaenzung = findSDErgaenzung(currentHcp);
        const sd = basisSD + ergaenzung;
        return Math.round(sd * 10) / 10;
    }
}

function calculateCourseHandicap(hcp, slope, cr, par, loecher = 18) {
    const h = parseFloat(hcp);
    const sr = parseFloat(slope);
    const c = parseFloat(cr);
    const p = parseFloat(par);
    if(isNaN(h) || isNaN(sr) || isNaN(c) || isNaN(p)) return 0;

    if(loecher == 18) {
        const ch = h * (sr / 113) + (c - p);
        return Math.round(ch);
    } else {
        const ch = (h / 2) * (sr / 113) + (c - p);
        return Math.round(ch);
    }
}

// --- WHS HANDICAP INDEX RECALCULATION ---
function updateHCP() {
    if(!currentUser || runden.length === 0) {
        aktuellesHCP = null;
        previousHCP = null;
        return;
    }

    runden.sort((a,b) => parseDateDe(a.datum) - parseDateDe(b.datum));
    runden.forEach(r => r.isBest = false);

    const letzte20 = runden.slice(-20);
    let anzahlZuWerten = 8;
    if(letzte20.length >= 20) anzahlZuWerten = 8;
    else if(letzte20.length >= 19) anzahlZuWerten = 7;
    else if(letzte20.length >= 17) anzahlZuWerten = 6;
    else if(letzte20.length >= 15) anzahlZuWerten = 5;
    else if(letzte20.length >= 12) anzahlZuWerten = 4;
    else if(letzte20.length >= 9) anzahlZuWerten = 3;
    else if(letzte20.length >= 7) anzahlZuWerten = 2;
    else anzahlZuWerten = 1;

    const sortedBySD = [...letzte20].sort((a,b) => parseFloat(a.sd) - parseFloat(b.sd));
    const beste = sortedBySD.slice(0, anzahlZuWerten);

    beste.forEach(b => {
        const match = letzte20.find(r => r === b);
        if(match) match.isBest = true;
    });

    const sumSD = beste.reduce((acc, r) => acc + parseFloat(r.sd), 0);
    previousHCP = aktuellesHCP !== null ? aktuellesHCP : Math.round((sumSD / beste.length) * 10) / 10;
    aktuellesHCP = Math.round((sumSD / beste.length) * 10) / 10;
}


// --- 8. OFFIZIELLES DGV STAMMBLATT LOGIC ---
function openStammblattModal() {
    const playerName = currentUser?.username || 'Gast-Spieler';
    const hcp = aktuellesHCP !== null ? parseFloat(aktuellesHCP) : 54.0;
    document.getElementById('sb-player-name').innerText = playerName;
    document.getElementById('sb-hcpi').innerText = hcp.toFixed(1);
    document.getElementById('sb-date').innerText = `Stand: ${formatDateDe(new Date())}`;

    const tbody = document.getElementById('sb-rounds-tbody');
    tbody.innerHTML = '';

    // Last up to 20 rounds
    const last20 = [...runden].slice(0, 20);

    if(last20.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="py-6 text-center text-slate-400 font-sans">Noch keine gewerteten Runden im Stammblatt vorhanden.</td></tr>';
        document.getElementById('stammblatt-modal').classList.remove('hidden');
        return;
    }

    // Identify Best-8 rounds
    const n = last20.length;
    let numBest = 1;
    if(n >= 20) numBest = 8;
    else if(n >= 19) numBest = 7;
    else if(n >= 17) numBest = 6;
    else if(n >= 15) numBest = 5;
    else if(n >= 12) numBest = 4;
    else if(n >= 9) numBest = 3;
    else if(n >= 7) numBest = 2;
    else numBest = 1;

    // Find lowest score differentials
    const indexedSds = last20.map((r, idx) => ({ idx, sd: parseFloat(r.sd || 999) }));
    indexedSds.sort((a, b) => a.sd - b.sd);
    const bestIndices = new Set(indexedSds.slice(0, numBest).map(item => item.idx));

    tbody.innerHTML = last20.map((r, idx) => {
        const isBest = bestIndices.has(idx);
        return `
            <tr class="${isBest ? 'bg-emerald-50/60 font-bold text-slate-900' : 'text-slate-700 hover:bg-slate-50/70'} transition-colors">
                <td class="py-2 px-2 text-center text-slate-400 font-sans">${idx + 1}</td>
                <td class="py-2 px-3">${r.datum || '--'}</td>
                <td class="py-2 px-3 font-sans truncate max-w-[200px]" title="${r.club_name}">${r.club_name || '--'}</td>
                <td class="py-2 px-2 text-center">${r.loecher || 18}</td>
                <td class="py-2 px-2 text-center">${r.brutto || '--'}</td>
                <td class="py-2 px-3 text-right font-black ${isBest ? 'text-emerald-800' : 'text-slate-800'}">${parseFloat(r.sd || 0).toFixed(1)}</td>
                <td class="py-2 px-3 text-center">
                    ${isBest ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">★ Best ${numBest}</span>' : '<span class="text-slate-300 text-[10px]">-</span>'}
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('sb-calc-explanation').innerText = 
        `Aktuell gewertet: Die besten ${numBest} aus ${n} Runden nach offizieller WHS-Tabelle des Deutschen Golf Verbandes (DGV).`;

    document.getElementById('stammblatt-modal').classList.remove('hidden');
}

function closeStammblattModal() {
    document.getElementById('stammblatt-modal').classList.add('hidden');
}

function printStammblatt() {
    window.print();
}

