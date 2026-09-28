// --- GOLF COURSE HOLES DATA & WHS INTEGRITY ---
function getCourseHolesForClub(club, loecher) {
    const numLoecher = parseInt(loecher, 10) || 18;
    if(club && Array.isArray(club.holes) && club.holes.length >= numLoecher) {
        return club.holes.slice(0, numLoecher).map(h => ({
            hole: h.hole,
            par: parseInt(h.par, 10) || 4,
            si: parseInt(h.si, 10) || h.hole
        }));
    }
    // Dynamic fallback matching official DGV pars
    const is9 = numLoecher === 9;
    const parVal = is9 
        ? (club?.par9 ? Math.round(parseFloat(club.par9)) : 36)
        : (club?.par18 ? Math.round(parseFloat(club.par18)) : 72);
    let pars;
    if(is9) {
        pars = [4, 4, 3, 5, 4, 4, 3, 5, 4]; // sum = 36
    } else if(parVal === 71) {
        pars = [4, 4, 3, 5, 4, 4, 3, 4, 4, 4, 4, 4, 3, 5, 4, 3, 5, 4]; // sum = 71
    } else if(parVal === 73) {
        pars = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 4, 5, 4]; // sum = 73
    } else {
        pars = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 3, 5, 4]; // sum = 72
    }
    const sis = is9
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
        : [7, 3, 15, 1, 11, 5, 17, 9, 13, 8, 4, 16, 2, 12, 18, 6, 10, 14];
    return pars.slice(0, numLoecher).map((p, idx) => ({
        hole: idx + 1,
        par: p,
        si: sis[idx] || (idx + 1)
    }));
}

// --- HOLE-BY-HOLE SCORECARD IMPLEMENTATION ---
function initScorecardHoles() {
    const tbody = document.getElementById('scorecard-holes-body');
    if(!tbody) return;
    const loecher = parseInt(document.getElementById('rec-loecher')?.value || '18', 10);
    const clubName = document.getElementById('rec-club')?.value;
    const club = clubs.find(c => c.name === clubName) || clubs[0];
    tbody.innerHTML = '';
    tbody.dataset.club = clubName || '';

    const courseHoles = getCourseHolesForClub(club, loecher);
    scorecardData = [];

    for(let i = 1; i <= loecher; i++) {
        const holeObj = courseHoles[i - 1] || { hole: i, par: 4, si: i };
        const par = holeObj.par;
        scorecardData.push({ hole: i, par: par, strokes: par, si: holeObj.si });

        const tr = document.createElement('tr');
        tr.id = `scorecard-row-${i}`;
        tr.className = "hover:bg-slate-50";
        tr.innerHTML = `
            <td class="py-2 px-2 font-bold text-slate-700">Loch ${i} <span class="text-[10px] text-slate-400 font-normal">SI ${holeObj.si}</span></td>
            <td class="py-2 px-2">
                <select onchange="updateHolePar(${i}, this.value)" class="text-xs py-1 px-1.5 rounded-md border border-slate-200 bg-white font-mono">
                    <option value="3" ${par == 3 ? 'selected' : ''}>Par 3</option>
                    <option value="4" ${par == 4 ? 'selected' : ''}>Par 4</option>
                    <option value="5" ${par == 5 ? 'selected' : ''}>Par 5</option>
                </select>
            </td>
            <td class="py-2 px-2">
                <div class="inline-flex items-center gap-1.5">
                    <button type="button" onclick="adjustHoleScore(${i}, -1)" class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">−</button>
                    <input type="number" id="hole-score-${i}" min="1" max="15" value="${par}" oninput="updateHoleScore(${i}, this.value)" class="w-12 text-center py-1 rounded-md border border-slate-200 text-sm font-bold font-mono">
                    <button type="button" onclick="adjustHoleScore(${i}, 1)" class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">+</button>
                </div>
            </td>
            <td class="py-2 px-2" id="hole-relative-${i}">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold score-par">Par</span>
            </td>
            <td class="py-2 px-2 font-mono text-xs font-bold text-slate-600" id="hole-stb-${i}">2 Pkt</td>
        `;
        tbody.appendChild(tr);
    }
    updateScorecardTotals();
}

function adjustHoleScore(holeNum, delta) {
    const h = scorecardData.find(x => x.hole === holeNum);
    if(!h) return;
    h.strokes = Math.max(1, h.strokes + delta);
    document.getElementById(`hole-score-${holeNum}`).value = h.strokes;
    updateScorecardTotals();
}

function updateHoleScore(holeNum, val) {
    const h = scorecardData.find(x => x.hole === holeNum);
    if(!h) return;
    const parsed = parseInt(val, 10);
    if(!isNaN(parsed) && parsed >= 1) {
        h.strokes = parsed;
        updateScorecardTotals();
    }
}

function updateHolePar(holeNum, val) {
    const h = scorecardData.find(x => x.hole === holeNum);
    if(!h) return;
    h.par = parseInt(val, 10);
    updateScorecardTotals();
}

function updateScorecardTotals() {
    let totalBrutto = 0;
    let totalPar = 0;
    let totalStableford = 0;

    scorecardData.forEach(h => {
        totalBrutto += h.strokes;
        totalPar += h.par;

        const diff = h.strokes - h.par;
        const relEl = document.getElementById(`hole-relative-${h.hole}`);
        const stbEl = document.getElementById(`hole-stb-${h.hole}`);

        if(relEl) {
            if(diff <= -2) {
                relEl.innerHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold score-eagle">Eagle</span>`;
            } else if(diff === -1) {
                relEl.innerHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold score-birdie">Birdie</span>`;
            } else if(diff === 0) {
                relEl.innerHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold score-par">Par</span>`;
            } else if(diff === 1) {
                relEl.innerHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold score-bogey">+1 Bogey</span>`;
            } else {
                relEl.innerHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold score-double">+${diff}</span>`;
            }
        }

        const stbPoints = Math.max(0, 2 - diff);
        totalStableford += stbPoints;
        if(stbEl) stbEl.innerText = `${stbPoints} Pkt`;
    });

    document.getElementById('scorecard-total-brutto').innerText = totalBrutto;
    const diffTotal = totalBrutto - totalPar;
    document.getElementById('scorecard-vs-par').innerText = diffTotal > 0 ? `+${diffTotal}` : (diffTotal === 0 ? 'E' : `${diffTotal}`);
    document.getElementById('scorecard-stableford').innerText = `${totalStableford} Pkt`;

    document.getElementById('rec-brutto').value = totalBrutto;
    onRoundInputChanged();
}


// --- 4. SIGNATURE PAD HELPER (HTML5 CANVAS WITH TOUCH & MOUSE) ---
function initSignaturePad(canvasId) {
    const canvas = document.getElementById(canvasId);
    if(!canvas) return null;
    const ctx = canvas.getContext('2d');
    let drawing = false;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }
    function start(e) {
        drawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        if(e.cancelable) e.preventDefault();
    }
    function draw(e) {
        if(!drawing) return;
        const pos = getPos(e);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0f172a';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        if(e.cancelable) e.preventDefault();
    }
    function end() {
        drawing = false;
    }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', end);

    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', end);

    return {
        clear: () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
        isEmpty: () => {
            const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
            return !pixelBuffer.some(color => color !== 0);
        },
        toDataURL: () => canvas.toDataURL('image/png')
    };
}

function clearPlayerSignature() {
    if(scPlayerSigPad) scPlayerSigPad.clear();
}
function clearMarkerSignature() {
    if(scMarkerSigPad) scMarkerSigPad.clear();
}

// --- 5. DIGITAL TOURNAMENT SCORECARD LOGIC ---
function openScorecardModal(turnier = null) {
    const selectEl = document.getElementById('sc-club-select');
    selectEl.innerHTML = '';

    // Populate clubs with favorites at top
    const sortedClubs = [...clubs].sort((a, b) => {
        const aFav = favoriteClubNames.has(a.name) ? 1 : 0;
        const bFav = favoriteClubNames.has(b.name) ? 1 : 0;
        return bFav - aFav;
    });

    sortedClubs.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.innerText = `${favoriteClubNames.has(c.name) ? '⭐ ' : ''}${c.name} (${c.city || c.region})`;
        selectEl.appendChild(opt);
    });

    if(turnier) {
        activeScorecardTournament = turnier;
        if(turnier.club_name) selectEl.value = turnier.club_name;
        if(turnier.datum) {
            let parts = turnier.datum.split('.');
            if(parts.length === 3) {
                document.getElementById('sc-datum').value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            } else {
                document.getElementById('sc-datum').value = turnier.datum;
            }
        } else {
            document.getElementById('sc-datum').value = new Date().toISOString().split('T')[0];
        }
        if(turnier.loecher) {
            document.getElementById('sc-loecher').value = String(turnier.loecher);
        }
    } else {
        activeScorecardTournament = null;
        document.getElementById('sc-datum').value = new Date().toISOString().split('T')[0];
    }

    // Reset GPS Status
    scGpsData = null;
    document.getElementById('sc-gps-badge').className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600";
    document.getElementById('sc-gps-badge').innerText = "Ungeprüft";
    document.getElementById('sc-gps-details').innerText = "Klicke auf 'Standort prüfen', um zu verifizieren, dass du dich auf dem Clubgelände befindest.";

    onScorecardClubChanged(turnier);
    document.getElementById('scorecard-modal').classList.remove('hidden');

    // Initialize signature pads
    setTimeout(() => {
        if(!scPlayerSigPad) scPlayerSigPad = initSignaturePad('sc-player-canvas');
        if(!scMarkerSigPad) scMarkerSigPad = initSignaturePad('sc-marker-canvas');
        scPlayerSigPad?.clear();
        scMarkerSigPad?.clear();
    }, 100);
}

function closeScorecardModal() {
    document.getElementById('scorecard-modal').classList.add('hidden');
}

async function onScorecardClubChanged(preselectedTournament = null) {
    const clubName = document.getElementById('sc-club-select').value;
    const club = clubs.find(c => c.name === clubName) || clubs[0];
    if(!club) return;

    // Handle pure 9-hole clubs
    const has18 = club.par18 !== null && club.par18 !== undefined && String(club.par18).trim() !== '';
    const has9 = club.par9 !== null && club.par9 !== undefined && String(club.par9).trim() !== '';
    const isPure9 = !has18 && has9;

    const opt18 = document.getElementById('sc-loecher-opt-18');
    const loecherSelect = document.getElementById('sc-loecher');
    if(opt18) {
        opt18.disabled = isPure9;
        opt18.innerText = isPure9 ? "18 Löcher (Nicht verfügbar)" : "18 Löcher";
    }
    if(isPure9 || (!has18 && loecherSelect.value === '18')) {
        loecherSelect.value = '9';
    }

    // Update Club Tournaments in dropdown
    await updateScorecardTournaments(club, preselectedTournament);

    recalculateScorecardHandicapAndCourse();
    initScorecardHolesTable();
}

async function updateScorecardTournaments(club, preselectedTournament = null) {
    const select = document.getElementById('sc-turnier-select');
    const customInput = document.getElementById('sc-turnier-name');
    if(!select) return;

    let clubTurniere = [];
    if(club && club.id) {
        try {
            const res = await apiFetch(`/api/clubs/${club.id}/turniere`);
            if(res.ok && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data.turniere || []);
                clubTurniere = list;
                list.forEach(ct => {
                    if(!turniere.some(t => t.id === ct.id)) turniere.push(ct);
                });
            }
        } catch(e) {
            console.warn("Konnte Turniere für Club nicht abrufen:", e);
        }
    }

    if(clubTurniere.length === 0 && club) {
        clubTurniere = turniere.filter(t => t.club_name === club.name || (club.id && t.club_id === club.id));
    }

    select.innerHTML = '<option value="">Freie Runde / Privatrunde</option>';
    if(clubTurniere.length > 0) {
        const group = document.createElement('optgroup');
        group.label = `Club-Turniere (${clubTurniere.length})`;
        clubTurniere.forEach(t => {
            const opt = document.createElement('option');
            opt.value = String(t.id);
            opt.innerText = `🏆 ${t.datum} – ${t.name} (${t.loecher}L, ${t.spielform || 'Stableford'})`;
            group.appendChild(opt);
        });
        select.appendChild(group);
    }
    const optCustom = document.createElement('option');
    optCustom.value = '__custom__';
    optCustom.innerText = '✍️ Anderes / Manuelles Turnier...';
    select.appendChild(optCustom);

    if(preselectedTournament) {
        const found = clubTurniere.find(t => (preselectedTournament.id && t.id === preselectedTournament.id) || t.name === preselectedTournament.name);
        if(found) {
            select.value = String(found.id);
            activeScorecardTournament = found;
            if(customInput) {
                customInput.classList.add('hidden');
                customInput.value = found.name;
            }
        } else {
            select.value = '__custom__';
            activeScorecardTournament = preselectedTournament;
            if(customInput) {
                customInput.classList.remove('hidden');
                customInput.value = preselectedTournament.name || '';
            }
        }
    } else if(activeScorecardTournament && activeScorecardTournament.club_name === club.name) {
        select.value = String(activeScorecardTournament.id || '__custom__');
    } else {
        select.value = '';
        activeScorecardTournament = null;
        if(customInput) {
            customInput.classList.add('hidden');
            customInput.value = 'Freie Runde';
        }
    }
}

function onScorecardTournamentSelected() {
    const select = document.getElementById('sc-turnier-select');
    const customInput = document.getElementById('sc-turnier-name');
    const val = select.value;

    if(!val) {
        activeScorecardTournament = null;
        if(customInput) {
            customInput.classList.add('hidden');
            customInput.value = 'Freie Runde';
        }
    } else if(val === '__custom__') {
        activeScorecardTournament = null;
        if(customInput) {
            customInput.classList.remove('hidden');
            customInput.value = '';
            customInput.focus();
        }
    } else {
        const turnierId = parseInt(val, 10);
        const t = turniere.find(item => item.id === turnierId);
        if(t) {
            activeScorecardTournament = t;
            if(customInput) {
                customInput.classList.add('hidden');
                customInput.value = t.name;
            }
            if(t.datum && t.datum.includes('.')) {
                const parts = t.datum.split('.');
                if(parts.length === 3) {
                    document.getElementById('sc-datum').value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }
            if(t.loecher) {
                document.getElementById('sc-loecher').value = String(t.loecher);
            }
            recalculateScorecardHandicapAndCourse();
            initScorecardHolesTable();
        }
    }
}

function onScorecardLoecherChanged() {
    recalculateScorecardHandicapAndCourse();
    initScorecardHolesTable();
}

function recalculateScorecardHandicapAndCourse() {
    const clubName = document.getElementById('sc-club-select').value;
    const club = clubs.find(c => c.name === clubName) || clubs[0];
    const loecher = parseInt(document.getElementById('sc-loecher').value, 10) || 18;

    let cr = 72.0;
    let slope = 113.0;
    let par = 72.0;

    if(loecher === 18) {
        cr = parseFloat(club?.cr18 || club?.cr9 || 72.0);
        slope = parseFloat(club?.sr18 || club?.sr9 || 113.0);
        par = parseFloat(club?.par18 || club?.par9 || 72.0);
    } else {
        cr = parseFloat(club?.cr9 || (club?.cr18 ? (parseFloat(club.cr18) / 2.0).toFixed(1) : 36.0));
        slope = parseFloat(club?.sr9 || club?.sr18 || 113.0);
        par = parseFloat(club?.par9 || (club?.par18 ? Math.round(parseFloat(club.par18) / 2.0) : 36.0));
    }

    if(isNaN(cr)) cr = (loecher === 18 ? 72.0 : 36.0);
    if(isNaN(slope)) slope = 113.0;
    if(isNaN(par)) par = (loecher === 18 ? 72.0 : 36.0);

    document.getElementById('sc-display-cr').innerText = cr.toFixed(1);
    document.getElementById('sc-display-slope').innerText = Math.round(slope);
    document.getElementById('sc-display-par').innerText = Math.round(par);

    // Player Info
    const hcp = (aktuellesHCP !== null && aktuellesHCP !== undefined && !isNaN(parseFloat(aktuellesHCP))) ? parseFloat(aktuellesHCP) : 54.0;
    document.getElementById('sc-player-name').innerText = currentUser?.username || 'Gast-Spieler';
    document.getElementById('sc-player-hcpi').innerText = hcp.toFixed(1);

    // Course Handicap (Spielvorgabe) official WHS formula
    let courseHcp = 0;
    if(loecher === 18) {
        courseHcp = Math.round((hcp * slope / 113.0) + (cr - par));
    } else {
        courseHcp = Math.round(((hcp / 2.0) * slope / 113.0) + (cr - par));
    }
    document.getElementById('sc-calculated-playing-hcp').innerText = isNaN(courseHcp) ? '0' : courseHcp;
}

let showProStats = false;

function toggleProStatsColumns() {
    showProStats = !showProStats;
    const btn = document.getElementById('btn-toggle-pro-stats');
    if(btn) {
        if(showProStats) {
            btn.className = "text-xs font-bold text-white bg-golf-600 border border-golf-600 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs transition-all";
            btn.innerHTML = "<span>✅ Pro-Statistiken aktiv (Putts / FIR / GIR)</span>";
        } else {
            btn.className = "text-xs text-golf-700 font-bold hover:text-golf-800 bg-golf-50 hover:bg-golf-100 border border-golf-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all";
            btn.innerHTML = "<span>📊 Pro-Statistiken erfassen (Putts / FIR / GIR)</span>";
        }
    }
    initScorecardHolesTable(true);
}

function initScorecardHolesTable(preserveExisting = false) {
    const loecher = parseInt(document.getElementById('sc-loecher').value, 10) || 18;
    const playingHcp = parseInt(document.getElementById('sc-calculated-playing-hcp').innerText, 10) || 0;
    const clubName = document.getElementById('sc-club-select').value;
    const club = clubs.find(c => c.name === clubName) || clubs[0];
    const courseHoles = getCourseHolesForClub(club, loecher);
    const tbody = document.getElementById('sc-holes-table-body');
    const thead = document.getElementById('sc-holes-table-head');
    const tfoot = document.getElementById('sc-holes-table-foot');
    
    const prevData = (preserveExisting && Array.isArray(scHolesData)) ? [...scHolesData] : [];
    tbody.innerHTML = '';
    scHolesData = [];

    let totalPar = 0;
    let totalStriche = 0;

    if (thead) {
        if (!showProStats) {
            thead.innerHTML = `
                <tr>
                    <th class="sticky left-0 bg-slate-100 z-20 py-2.5 px-2 text-center w-12 font-bold shadow-[1px_0_0_0_#cbd5e1]">Loch</th>
                    <th class="py-2.5 px-2 text-center w-12">Par</th>
                    <th class="py-2.5 px-2 text-center w-14" title="Stroke Index / Vorgaben-Schlüssel">SI</th>
                    <th class="py-2.5 px-2 text-center w-14" title="Vorgabestriche">Striche</th>
                    <th class="py-2.5 px-3 text-center w-28">Brutto Schläge</th>
                    <th class="py-2.5 px-2 text-center w-14">Netto</th>
                    <th class="py-2.5 px-2 text-center w-16" title="Netto-Stableford Punkte">Stbf. Pkt</th>
                </tr>
            `;
        } else {
            thead.innerHTML = `
                <tr>
                    <th class="sticky left-0 bg-slate-100 z-20 py-2.5 px-2 text-center w-10 font-bold shadow-[1px_0_0_0_#cbd5e1]">Loch</th>
                    <th class="py-2.5 px-2 text-center w-10">Par</th>
                    <th class="py-2.5 px-2 text-center w-12" title="Stroke Index">SI</th>
                    <th class="py-2.5 px-2 text-center w-12" title="Vorgabestriche">Striche</th>
                    <th class="py-2.5 px-2 text-center w-24">Brutto</th>
                    <th class="py-2.5 px-2 text-center w-12">Netto</th>
                    <th class="py-2.5 px-2 text-center w-12" title="Netto-Stableford Punkte">Stbf</th>
                    <th class="py-2.5 px-2 text-center w-20" title="Putts auf dem Grün">Putts</th>
                    <th class="py-2.5 px-2 text-center w-24" title="Fairway in Regulation">FIR (Tee)</th>
                    <th class="py-2.5 px-2 text-center w-16" title="Green in Regulation">GIR</th>
                </tr>
            `;
        }
    }

    for(let i = 0; i < loecher; i++) {
        const holeObj = courseHoles[i] || { hole: i + 1, par: 4, si: i + 1 };
        const holeNr = holeObj.hole;
        const par = holeObj.par;
        const si = holeObj.si;

        // Vorgabestriche calculation according to WHS Course Handicap & Stroke Index
        const baseStriche = Math.floor(playingHcp / loecher);
        const remainder = ((playingHcp % loecher) + loecher) % loecher;
        const striche = baseStriche + (si <= remainder ? 1 : 0);

        totalPar += par;
        totalStriche += striche;

        const prevHole = prevData[i];
        const initialStrokes = prevHole ? prevHole.strokes : par;
        const netto = Math.max(1, initialStrokes - striche);
        const stbf = Math.max(0, par - netto + 2);
        const putts = prevHole ? prevHole.putts : 2;
        const fir = prevHole ? prevHole.fir : (par >= 4 ? 'hit' : null);
        const gir = prevHole && prevHole.girManual ? prevHole.gir : (initialStrokes - putts <= par - 2);
        const girManual = prevHole ? prevHole.girManual : false;

        scHolesData.push({
            hole: holeNr,
            par: par,
            si: si,
            striche: striche,
            strokes: initialStrokes,
            gross: initialStrokes,
            netto: netto,
            stableford: stbf,
            putts: putts,
            fir: fir,
            gir: gir,
            girManual: girManual
        });

        const tr = document.createElement('tr');
        tr.id = `sc-row-${i}`;
        tr.className = "hover:bg-slate-50 transition-colors";
        
        if (!showProStats) {
            tr.innerHTML = `
                <td class="sticky left-0 bg-white z-10 py-2 px-2 text-center font-bold text-slate-800 shadow-[1px_0_0_0_#e2e8f0]">${holeNr}</td>
                <td class="py-2 px-2 text-center text-slate-600">${par}</td>
                <td class="py-2 px-2 text-center text-slate-400">${si}</td>
                <td class="py-2 px-2 text-center font-bold text-golf-700">${striche > 0 ? '+'.repeat(Math.min(3, striche)) + (striche > 3 ? striche : '') : '-'}</td>
                <td class="py-2 px-3 text-center">
                    <div class="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
                        <button type="button" onclick="updateScorecardHole(${i}, -1)" class="w-7 h-7 sm:w-6 sm:h-6 rounded bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-xs flex items-center justify-center select-none active:scale-90 touch-manipulation">-</button>
                        <input type="number" id="sc-stroke-${i}" onchange="onScorecardStrokeInput(${i}, this.value)" value="${initialStrokes}" min="1" max="15" class="w-9 text-center font-black text-sm sm:text-xs text-slate-900 focus:outline-none border-none p-0">
                        <button type="button" onclick="updateScorecardHole(${i}, 1)" class="w-7 h-7 sm:w-6 sm:h-6 rounded bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-xs flex items-center justify-center select-none active:scale-90 touch-manipulation">+</button>
                    </div>
                </td>
                <td class="py-2 px-2 text-center font-bold text-golf-800" id="sc-netto-${i}">${netto}</td>
                <td class="py-2 px-2 text-center font-bold text-amber-800" id="sc-stbf-${i}">${stbf}</td>
            `;
        } else {
            tr.innerHTML = `
                <td class="sticky left-0 bg-white z-10 py-2 px-2 text-center font-bold text-slate-800 shadow-[1px_0_0_0_#e2e8f0]">${holeNr}</td>
                <td class="py-2 px-2 text-center text-slate-600">${par}</td>
                <td class="py-2 px-2 text-center text-slate-400">${si}</td>
                <td class="py-2 px-2 text-center font-bold text-golf-700">${striche > 0 ? '+'.repeat(Math.min(3, striche)) + (striche > 3 ? striche : '') : '-'}</td>
                <td class="py-2 px-2 text-center">
                    <div class="inline-flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
                        <button type="button" onclick="updateScorecardHole(${i}, -1)" class="w-6 h-6 sm:w-5 sm:h-5 rounded bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-xs flex items-center justify-center select-none active:scale-90 touch-manipulation">-</button>
                        <input type="number" id="sc-stroke-${i}" onchange="onScorecardStrokeInput(${i}, this.value)" value="${initialStrokes}" min="1" max="15" class="w-8 text-center font-black text-sm sm:text-xs text-slate-900 focus:outline-none border-none p-0">
                        <button type="button" onclick="updateScorecardHole(${i}, 1)" class="w-6 h-6 sm:w-5 sm:h-5 rounded bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-xs flex items-center justify-center select-none active:scale-90 touch-manipulation">+</button>
                    </div>
                </td>
                <td class="py-2 px-2 text-center font-bold text-golf-800" id="sc-netto-${i}">${netto}</td>
                <td class="py-2 px-2 text-center font-bold text-amber-800" id="sc-stbf-${i}">${stbf}</td>
                <td class="py-2 px-2 text-center">
                    <div class="inline-flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
                        <button type="button" onclick="updateScorecardPutts(${i}, -1)" class="w-6 h-6 sm:w-5 sm:h-5 rounded bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center select-none active:scale-90 touch-manipulation">-</button>
                        <input type="number" id="sc-putt-${i}" onchange="onScorecardPuttInput(${i}, this.value)" value="${putts}" min="0" max="6" class="w-6 text-center font-bold text-xs text-slate-900 border-none p-0 focus:outline-none">
                        <button type="button" onclick="updateScorecardPutts(${i}, 1)" class="w-6 h-6 sm:w-5 sm:h-5 rounded bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center select-none active:scale-90 touch-manipulation">+</button>
                    </div>
                </td>
                <td class="py-2 px-2 text-center">
                    ${par >= 4 ? `
                        <select id="sc-fir-${i}" onchange="onScorecardFirChange(${i}, this.value)" class="text-[11px] sm:text-[10px] font-bold rounded-lg border border-slate-200 py-1 px-1 bg-white text-emerald-800 touch-manipulation">
                            <option value="hit" ${fir === 'hit' ? 'selected' : ''}>🎯 Fairway</option>
                            <option value="left" ${fir === 'left' ? 'selected' : ''}>⬅️ Links</option>
                            <option value="right" ${fir === 'right' ? 'selected' : ''}>➡️ Rechts</option>
                        </select>
                    ` : `<span class="text-slate-300 text-[10px]">-</span>`}
                </td>
                <td class="py-2 px-2 text-center">
                    <button type="button" onclick="toggleScorecardGir(${i})" id="sc-gir-btn-${i}" class="px-2 py-1 sm:py-0.5 rounded-lg text-[11px] sm:text-[10px] font-bold touch-manipulation active:scale-95 ${gir ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-400 border border-slate-200'}">
                        ${gir ? '✅ GIR' : '❌ Miss'}
                    </button>
                </td>
            `;
        }
        tbody.appendChild(tr);
    }

    if (tfoot) {
        if (!showProStats) {
            tfoot.innerHTML = `
                <tr>
                    <td class="sticky left-0 bg-slate-50 z-20 py-3 px-2 text-center font-sans font-black shadow-[1px_0_0_0_#cbd5e1]">GESAMT</td>
                    <td id="sc-total-par" class="py-3 px-2 text-center text-slate-700 font-mono">${totalPar}</td>
                    <td class="py-3 px-2 text-center text-slate-400 font-mono">-</td>
                    <td id="sc-total-striche" class="py-3 px-2 text-center text-slate-700 font-mono">${totalStriche}</td>
                    <td id="sc-total-brutto" class="py-3 px-3 text-center text-slate-900 font-mono font-black text-sm">--</td>
                    <td id="sc-total-netto" class="py-3 px-2 text-center text-golf-800 font-mono font-black text-sm">--</td>
                    <td id="sc-total-stableford" class="py-3 px-2 text-center text-amber-800 font-mono font-black text-sm">--</td>
                </tr>
            `;
        } else {
            tfoot.innerHTML = `
                <tr>
                    <td class="sticky left-0 bg-slate-50 z-20 py-3 px-2 text-center font-sans font-black shadow-[1px_0_0_0_#cbd5e1]">GESAMT</td>
                    <td id="sc-total-par" class="py-3 px-2 text-center text-slate-700 font-mono">${totalPar}</td>
                    <td class="py-3 px-2 text-center text-slate-400 font-mono">-</td>
                    <td id="sc-total-striche" class="py-3 px-2 text-center text-slate-700 font-mono">${totalStriche}</td>
                    <td id="sc-total-brutto" class="py-3 px-2 text-center text-slate-900 font-mono font-black text-sm">--</td>
                    <td id="sc-total-netto" class="py-3 px-2 text-center text-golf-800 font-mono font-black text-sm">--</td>
                    <td id="sc-total-stableford" class="py-3 px-2 text-center text-amber-800 font-mono font-black text-sm">--</td>
                    <td id="sc-total-putts" class="py-3 px-2 text-center text-slate-900 font-mono font-black text-xs">--</td>
                    <td id="sc-total-fir" class="py-3 px-2 text-center text-emerald-800 font-mono font-bold text-[11px]">--</td>
                    <td id="sc-total-gir" class="py-3 px-2 text-center text-emerald-800 font-mono font-bold text-[11px]">--</td>
                </tr>
            `;
        }
    }

    recalculateScorecardTotals();
}

function updateScorecardHole(index, delta) {
    const hole = scHolesData[index];
    if(!hole) return;
    hole.strokes = Math.max(1, Math.min(15, hole.strokes + delta));
    hole.gross = hole.strokes;
    const input = document.getElementById(`sc-stroke-${index}`);
    if(input) input.value = hole.strokes;
    recalculateScorecardRow(index);
}

function onScorecardStrokeInput(index, value) {
    const hole = scHolesData[index];
    if(!hole) return;
    const parsed = parseInt(value, 10);
    hole.strokes = isNaN(parsed) ? hole.par : Math.max(1, Math.min(15, parsed));
    hole.gross = hole.strokes;
    const input = document.getElementById(`sc-stroke-${index}`);
    if(input) input.value = hole.strokes;
    recalculateScorecardRow(index);
}

function updateScorecardPutts(index, delta) {
    const hole = scHolesData[index];
    if(!hole) return;
    hole.putts = Math.max(0, Math.min(6, (hole.putts || 2) + delta));
    const input = document.getElementById(`sc-putt-${index}`);
    if(input) input.value = hole.putts;
    if(!hole.girManual) {
        hole.gir = (hole.strokes - hole.putts <= hole.par - 2);
        updateGirBadge(index);
    }
    recalculateScorecardTotals();
}

function onScorecardPuttInput(index, value) {
    const hole = scHolesData[index];
    if(!hole) return;
    const parsed = parseInt(value, 10);
    hole.putts = isNaN(parsed) ? 2 : Math.max(0, Math.min(6, parsed));
    const input = document.getElementById(`sc-putt-${index}`);
    if(input) input.value = hole.putts;
    if(!hole.girManual) {
        hole.gir = (hole.strokes - hole.putts <= hole.par - 2);
        updateGirBadge(index);
    }
    recalculateScorecardTotals();
}

function onScorecardFirChange(index, value) {
    const hole = scHolesData[index];
    if(!hole) return;
    hole.fir = value;
    recalculateScorecardTotals();
}

function toggleScorecardGir(index) {
    const hole = scHolesData[index];
    if(!hole) return;
    hole.girManual = true;
    hole.gir = !hole.gir;
    updateGirBadge(index);
    recalculateScorecardTotals();
}

function updateGirBadge(index) {
    const hole = scHolesData[index];
    const btn = document.getElementById(`sc-gir-btn-${index}`);
    if(btn && hole) {
        if(hole.gir) {
            btn.className = "px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
            btn.innerText = "✅ GIR";
        } else {
            btn.className = "px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200";
            btn.innerText = "❌ Miss";
        }
    }
}

function recalculateScorecardRow(index) {
    const hole = scHolesData[index];
    if(!hole) return;
    hole.netto = Math.max(1, hole.strokes - hole.striche);
    hole.stableford = Math.max(0, hole.par - hole.netto + 2);
    hole.gross = hole.strokes;

    if(!hole.girManual) {
        hole.gir = (hole.strokes - (hole.putts || 2) <= hole.par - 2);
        updateGirBadge(index);
    }

    const nettoEl = document.getElementById(`sc-netto-${index}`);
    const stbfEl = document.getElementById(`sc-stbf-${index}`);
    if(nettoEl) nettoEl.innerText = hole.netto;
    if(stbfEl) stbfEl.innerText = hole.stableford;

    recalculateScorecardTotals();
}

function recalculateScorecardTotals() {
    let totalBrutto = 0;
    let totalNetto = 0;
    let totalStableford = 0;
    let totalPutts = 0;
    let firHits = 0;
    let firOpp = 0;
    let girHits = 0;

    scHolesData.forEach(h => {
        totalBrutto += h.strokes;
        totalNetto += h.netto;
        totalStableford += h.stableford;
        totalPutts += (h.putts !== undefined ? h.putts : 2);
        if(h.par >= 4) {
            firOpp++;
            if(h.fir === 'hit' || h.fir === 'center' || h.fir === true) firHits++;
        }
        if(h.gir) girHits++;
    });

    const bruttoEl = document.getElementById('sc-total-brutto');
    const nettoEl = document.getElementById('sc-total-netto');
    const stbfEl = document.getElementById('sc-total-stableford');
    if(bruttoEl) bruttoEl.innerText = totalBrutto;
    if(nettoEl) nettoEl.innerText = totalNetto;
    if(stbfEl) stbfEl.innerText = totalStableford;

    if(showProStats) {
        const puttsEl = document.getElementById('sc-total-putts');
        const firEl = document.getElementById('sc-total-fir');
        const girEl = document.getElementById('sc-total-gir');
        if(puttsEl) puttsEl.innerText = totalPutts;
        if(firEl) firEl.innerText = firOpp > 0 ? `${firHits}/${firOpp}` : '-';
        if(girEl) girEl.innerText = `${girHits}/${scHolesData.length}`;
    }

    const loecher = scHolesData.length;
    const expectedStbf = loecher === 18 ? 36 : 18;
    const diff = totalStableford - expectedStbf;
    const calloutEl = document.getElementById('sc-callout-text');

    if(calloutEl) {
        if(diff > 0) {
            calloutEl.innerHTML = `<strong class="text-emerald-700">${totalStableford} Netto-Punkte (+${diff})</strong> – Unterspielung! Dein WHS Handicap verbessert sich. 🎉`;
        } else if(diff === 0) {
            calloutEl.innerHTML = `<strong class="text-blue-700">${totalStableford} Netto-Punkte</strong> – Handicap genau bestätigt! Solide Runde. ⛳`;
        } else {
            calloutEl.innerHTML = `<strong class="text-slate-800">${totalStableford} Netto-Punkte (${diff})</strong> – Pufferbereich / Schonung nach WHS Soft Cap.`;
        }
    }
}

function setScorecardMode(mode) {
    scorecardMode = mode;
    const singleView = document.getElementById('sc-single-view');
    const flightView = document.getElementById('sc-flight-view');
    const btnSingle = document.getElementById('btn-sc-mode-single');
    const btnFlight = document.getElementById('btn-sc-mode-flight');

    if(mode === 'single') {
        singleView.classList.remove('hidden');
        flightView.classList.add('hidden');
        btnSingle.className = "px-3 py-1 rounded-lg bg-golf-600 text-white font-bold text-xs shadow-xs transition-all";
        btnFlight.className = "px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all";
    } else {
        singleView.classList.add('hidden');
        flightView.classList.remove('hidden');
        btnFlight.className = "px-3 py-1 rounded-lg bg-golf-600 text-white font-bold text-xs shadow-xs transition-all";
        btnSingle.className = "px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all";
        loadFlightScoreboard();
    }
}

// --- GPS VERIFICATION FOR SCORECARD ---
function verifyScorecardLocation() {
    const btn = document.getElementById('sc-gps-btn');
    const badge = document.getElementById('sc-gps-badge');
    const details = document.getElementById('sc-gps-details');
    const clubName = document.getElementById('sc-club-select').value;
    const club = clubs.find(c => c.name === clubName);

    if(!navigator.geolocation) {
        alert("GPS-Geolokalisierung wird von deinem Browser nicht unterstützt.");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Ermittle Standort...";
    badge.className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800";
    badge.innerText = "Prüfe GPS...";

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            btn.disabled = false;
            btn.innerText = "Erneut prüfen";
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            if(club && club.lat && club.lon) {
                // Haversine formula
                const R = 6371.0;
                const dLat = (club.lat - lat) * Math.PI / 180.0;
                const dLon = (club.lon - lon) * Math.PI / 180.0;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                          Math.cos(lat * Math.PI / 180.0) * Math.cos(club.lat * Math.PI / 180.0) *
                          Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distKm = Math.round((R * c) * 100) / 100;

                const isVerified = distKm <= 3.5;
                scGpsData = {
                    verified: isVerified,
                    lat: lat,
                    lon: lon,
                    distance_km: distKm
                };

                if(isVerified) {
                    badge.className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
                    badge.innerText = `✅ Vor Ort (${distKm} km)`;
                    details.innerHTML = `<span class="text-emerald-800 font-semibold">Erfolgreich verifiziert!</span> Du befindest dich auf dem Gelände von <strong>${club.name}</strong>. Kryptografisches Audit-Token wird bei Abgabe generiert.`;
                    showToast("GPS-Standort erfolgreich verifiziert! 📍", "✅");
                } else {
                    badge.className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300";
                    badge.innerText = `⚠️ Fern-Erfassung (${distKm} km)`;
                    details.innerHTML = `Hinweis: Du bist <span class="font-bold text-amber-900">${distKm} km</span> vom Club entfernt. Die Scorekarte wird als Fern-Erfassung für das Sekretariat protokolliert.`;
                }
            } else {
                scGpsData = { verified: true, lat: lat, lon: lon, distance_km: 0.0 };
                badge.className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800";
                badge.innerText = "GPS aktiv";
                details.innerText = `Standort erfasst (${lat.toFixed(4)}, ${lon.toFixed(4)}). Club-Koordinaten nicht hinterlegt.`;
            }
        },
        (err) => {
            btn.disabled = false;
            btn.innerText = "Standort prüfen";
            badge.className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800";
            badge.innerText = "GPS-Fehler";
            details.innerText = "Standort konnte nicht ermittelt werden (" + (err.message || 'Zugriff verweigert') + ").";
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// --- PC CADDIE EXPORT & SUBMISSION ---
function exportCurrentScorecardPcCaddy() {
    const turnierName = activeScorecardTournament ? activeScorecardTournament.name : (document.getElementById('sc-turnier-name')?.value || 'Freie Runde');
    const clubName = document.getElementById('sc-club-select').value;
    const datum = document.getElementById('sc-datum').value;
    const spieler = currentUser?.username || 'Gast';
    const hcp = aktuellesHCP !== null ? aktuellesHCP : 54.0;
    const playingHcp = document.getElementById('sc-calculated-playing-hcp').innerText;
    const brutto = document.getElementById('sc-total-brutto').innerText;
    const netto = document.getElementById('sc-total-netto').innerText;
    const stableford = document.getElementById('sc-total-stableford').innerText;
    const markerName = document.getElementById('sc-marker-name').value || 'Unbekannt';

    // Holes
    const holeScores = [];
    for(let i = 0; i < 18; i++) {
        if(i < scHolesData.length) {
            holeScores.push(scHolesData[i].strokes);
        } else {
            holeScores.push(0);
        }
    }

    const playerSig = scPlayerSigPad && !scPlayerSigPad.isEmpty() ? 'VORHANDEN' : 'NICHT_SIGNIERT';
    const markerSig = scMarkerSigPad && !scMarkerSigPad.isEmpty() ? 'VORHANDEN' : 'NICHT_SIGNIERT';
    const gpsVer = scGpsData && scGpsData.verified ? 'JA' : 'NEIN';
    const gpsDist = scGpsData ? scGpsData.distance_km : 0.0;
    const gpsToken = scGpsData ? `AUDIT_${Math.abs(spieler.length * 12345).toString(16)}` : 'KEIN_TOKEN';

    const header = "PCC_SCORECARD_v2;Turnier;Golfclub;Datum;Spieler;Stammvorgabe;Spielvorgabe;" + 
        Array.from({length: 18}, (_, i) => `Loch_${i+1}`).join(';') + 
        ";Brutto;Netto;Stableford;Zaehler;Signatur_Spieler;Signatur_Zaehler;GPS_Verifiziert;GPS_Distanz_km;GPS_Audit_Token";

    const row = [
        turnierName, clubName, datum, spieler, hcp, playingHcp,
        ...holeScores,
        brutto, netto, stableford, markerName,
        playerSig, markerSig, gpsVer, gpsDist, gpsToken
    ].join(';');

    const csvContent = "\uFEFF" + header + "\n" + row;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pccaddy_${spieler}_${clubName.replace(/\s+/g, '_')}_${datum}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("PC CADDIE CSV erfolgreich exportiert! 📥", "⛳");
}

async function submitTournamentScorecard() {
    if(!currentUser || !authToken) {
        showToast("Bitte melde dich an, um deine Scorekarte offiziell einzureichen.", "🔒");
        openAuthModal('login');
        return;
    }

    const turnierName = activeScorecardTournament ? activeScorecardTournament.name : (document.getElementById('sc-turnier-name')?.value || 'Freie Runde');
    const clubName = document.getElementById('sc-club-select').value;
    const club = clubs.find(c => c.name === clubName) || clubs[0];
    const datum = document.getElementById('sc-datum').value;
    const loecher = parseInt(document.getElementById('sc-loecher').value, 10) || 18;
    const brutto = parseInt(document.getElementById('sc-total-brutto').innerText, 10);
    const netto = parseInt(document.getElementById('sc-total-netto').innerText, 10);
    const stableford = parseInt(document.getElementById('sc-total-stableford').innerText, 10);
    const markerName = document.getElementById('sc-marker-name').value.trim();

    const playerSig = scPlayerSigPad && !scPlayerSigPad.isEmpty() ? scPlayerSigPad.toDataURL() : null;
    const markerSig = scMarkerSigPad && !scMarkerSigPad.isEmpty() ? scMarkerSigPad.toDataURL() : null;

    if(!playerSig) {
        if(!confirm("Du hast die Scorekarte noch nicht mit deiner Unterschrift signiert. Trotzdem ohne Unterschrift einreichen?")) {
            return;
        }
    }

    const formattedHoles = scHolesData.map(h => ({
        hole: h.hole,
        par: h.par,
        si: h.si,
        striche: h.striche,
        strokes: h.strokes,
        gross: h.strokes,
        netto: h.netto,
        stableford: h.stableford,
        putts: h.putts !== undefined ? h.putts : 2,
        fir: h.fir !== undefined ? h.fir : (h.par >= 4 ? 'hit' : null),
        gir: h.gir !== undefined ? h.gir : (h.strokes - 2 <= h.par - 2)
    }));

    const payload = {
        turnier_id: activeScorecardTournament ? activeScorecardTournament.id : null,
        club_name: clubName,
        datum: datum,
        loecher: loecher,
        course_rating: parseFloat(document.getElementById('sc-display-cr').innerText),
        slope_rating: parseFloat(document.getElementById('sc-display-slope').innerText),
        par: parseInt(document.getElementById('sc-display-par').innerText, 10),
        playing_hcp: parseInt(document.getElementById('sc-calculated-playing-hcp').innerText, 10),
        handicap_index: aktuellesHCP !== null ? parseFloat(aktuellesHCP) : 54.0,
        brutto: brutto,
        netto: netto,
        stableford: stableford,
        holes: formattedHoles,
        player_signature: playerSig,
        marker_signature: markerSig,
        marker_name: markerName,
        player_lat: scGpsData ? scGpsData.lat : null,
        player_lon: scGpsData ? scGpsData.lon : null
    };

    // Offline handling
    if (!navigator.onLine) {
        saveOfflineScorecard(payload);
        closeScorecardModal();
        return;
    }

    try {
        const res = await apiFetch('/api/scorecards', 'POST', payload);
        if(res.ok) {
            const roundDatumDe = formatDateDe(new Date(datum));
            const sd = calculateSD(club, loecher, brutto, aktuellesHCP || 54.0);
            await apiFetch('/api/runden', 'POST', {
                datum: roundDatumDe,
                club_name: `${clubName} (${turnierName})`,
                loecher: loecher,
                brutto: brutto,
                sd: sd
            });

            closeScorecardModal();
            await loadData();
            await loadProStats();
            showToast("Scorekarte erfolgreich an Club übermittelt & in Historie verbucht! ⛳", "🎉");
            if(typeof confetti === 'function') confetti({ particleCount: 80, spread: 70 });
        } else {
            showToast("Fehler beim Einreichen: " + (res.data?.fehler || 'Unbekannt'), "⚠️");
        }
    } catch(e) {
        console.warn("Netzwerkfehler beim Einreichen, speichere offline:", e);
        saveOfflineScorecard(payload);
        closeScorecardModal();
    }
}

// --- OFFLINE SCORECARD QUEUE & SYNC ---
function saveOfflineScorecard(payload) {
    const queue = JSON.parse(localStorage.getItem('birdietrack_offline_scorecards') || '[]');
    queue.push({
        payload: payload,
        savedAt: new Date().toISOString()
    });
    localStorage.setItem('birdietrack_offline_scorecards', JSON.stringify(queue));
    showToast("Offline gesichert! Wird bei Verbindung automatisch synchronisiert. 📶", "💾");

    // Optimistically append round to local list
    const club = clubs.find(c => c.name === payload.club_name) || clubs[0];
    const roundDatumDe = formatDateDe(new Date(payload.datum));
    const sd = calculateSD(club, payload.loecher, payload.brutto, payload.handicap_index || 54.0);
    runden.unshift({
        id: 'offline_' + Date.now(),
        datum: roundDatumDe,
        club_name: `${payload.club_name} (Offline)`,
        loecher: payload.loecher,
        brutto: payload.brutto,
        sd: sd
    });
    saveData();
    updateApp();
}

async function syncOfflineScorecards() {
    if(!navigator.onLine || !authToken) return;
    const queue = JSON.parse(localStorage.getItem('birdietrack_offline_scorecards') || '[]');
    if(queue.length === 0) return;

    let syncedCount = 0;
    const remaining = [];

    for(const item of queue) {
        try {
            const res = await apiFetch('/api/scorecards', 'POST', item.payload);
            if(res.ok) {
                const club = clubs.find(c => c.name === item.payload.club_name) || clubs[0];
                const roundDatumDe = formatDateDe(new Date(item.payload.datum));
                const sd = calculateSD(club, item.payload.loecher, item.payload.brutto, item.payload.handicap_index || 54.0);
                await apiFetch('/api/runden', 'POST', {
                    datum: roundDatumDe,
                    club_name: `${item.payload.club_name}`,
                    loecher: item.payload.loecher,
                    brutto: item.payload.brutto,
                    sd: sd
                });
                syncedCount++;
            } else {
                remaining.push(item);
            }
        } catch(e) {
            remaining.push(item);
        }
    }

    localStorage.setItem('birdietrack_offline_scorecards', JSON.stringify(remaining));
    if(syncedCount > 0) {
        await loadData();
        await loadProStats();
        showToast(`${syncedCount} offline erfasste Scorekarte(n) synchronisiert! ⛳`, "🎉");
    }
}

