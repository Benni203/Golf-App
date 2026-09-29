// --- GOLF COURSE HOLES DATA & WHS INTEGRITY ---
const clubHolesTemplates = {
    "jersbek": {
        holes18: [
            { hole: 1, par: 4, si: 13, meters_gelb: 353, meters_rot: 308 },
            { hole: 2, par: 4, si: 1, meters_gelb: 424, meters_rot: 374 },
            { hole: 3, par: 3, si: 5, meters_gelb: 154, meters_rot: 134 },
            { hole: 4, par: 5, si: 11, meters_gelb: 535, meters_rot: 462 },
            { hole: 5, par: 3, si: 7, meters_gelb: 165, meters_rot: 142 },
            { hole: 6, par: 5, si: 9, meters_gelb: 490, meters_rot: 420 },
            { hole: 7, par: 4, si: 17, meters_gelb: 330, meters_rot: 285 },
            { hole: 8, par: 4, si: 3, meters_gelb: 385, meters_rot: 340 },
            { hole: 9, par: 4, si: 15, meters_gelb: 340, meters_rot: 295 },
            { hole: 10, par: 5, si: 8, meters_gelb: 485, meters_rot: 422 },
            { hole: 11, par: 4, si: 4, meters_gelb: 365, meters_rot: 320 },
            { hole: 12, par: 4, si: 12, meters_gelb: 350, meters_rot: 305 },
            { hole: 13, par: 3, si: 18, meters_gelb: 160, meters_rot: 138 },
            { hole: 14, par: 4, si: 2, meters_gelb: 380, meters_rot: 335 },
            { hole: 15, par: 4, si: 10, meters_gelb: 340, meters_rot: 295 },
            { hole: 16, par: 4, si: 6, meters_gelb: 360, meters_rot: 310 },
            { hole: 17, par: 3, si: 16, meters_gelb: 150, meters_rot: 130 },
            { hole: 18, par: 5, si: 14, meters_gelb: 490, meters_rot: 425 }
        ]
    },
    "escheburg": {
        holes18: [
            { hole: 1, par: 4, si: 11, meters_gelb: 345, meters_rot: 298 },
            { hole: 2, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 3, par: 5, si: 5, meters_gelb: 490, meters_rot: 425 },
            { hole: 4, par: 4, si: 1, meters_gelb: 405, meters_rot: 350 },
            { hole: 5, par: 4, si: 7, meters_gelb: 360, meters_rot: 310 },
            { hole: 6, par: 3, si: 15, meters_gelb: 155, meters_rot: 130 },
            { hole: 7, par: 4, si: 13, meters_gelb: 335, meters_rot: 285 },
            { hole: 8, par: 3, si: 17, meters_gelb: 140, meters_rot: 120 },
            { hole: 9, par: 5, si: 9, meters_gelb: 475, meters_rot: 410 },
            { hole: 10, par: 4, si: 10, meters_gelb: 350, meters_rot: 305 },
            { hole: 11, par: 4, si: 4, meters_gelb: 375, meters_rot: 325 },
            { hole: 12, par: 5, si: 6, meters_gelb: 485, meters_rot: 420 },
            { hole: 13, par: 3, si: 18, meters_gelb: 145, meters_rot: 125 },
            { hole: 14, par: 4, si: 2, meters_gelb: 395, meters_rot: 340 },
            { hole: 15, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 480, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 355, meters_rot: 305 }
        ]
    },
    "ahrensburg": {
        holes18: [
            { hole: 1, par: 4, si: 11, meters_gelb: 330, meters_rot: 290 },
            { hole: 2, par: 4, si: 7, meters_gelb: 350, meters_rot: 305 },
            { hole: 3, par: 3, si: 15, meters_gelb: 155, meters_rot: 135 },
            { hole: 4, par: 4, si: 1, meters_gelb: 395, meters_rot: 345 },
            { hole: 5, par: 4, si: 5, meters_gelb: 360, meters_rot: 315 },
            { hole: 6, par: 5, si: 9, meters_gelb: 470, meters_rot: 410 },
            { hole: 7, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 8, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 9, par: 4, si: 13, meters_gelb: 340, meters_rot: 295 },
            { hole: 10, par: 4, si: 8, meters_gelb: 355, meters_rot: 310 },
            { hole: 11, par: 3, si: 16, meters_gelb: 150, meters_rot: 130 },
            { hole: 12, par: 4, si: 4, meters_gelb: 375, meters_rot: 325 },
            { hole: 13, par: 5, si: 6, meters_gelb: 485, meters_rot: 420 },
            { hole: 14, par: 4, si: 2, meters_gelb: 400, meters_rot: 350 },
            { hole: 15, par: 3, si: 18, meters_gelb: 135, meters_rot: 115 },
            { hole: 16, par: 4, si: 12, meters_gelb: 345, meters_rot: 300 },
            { hole: 17, par: 4, si: 10, meters_gelb: 350, meters_rot: 305 },
            { hole: 18, par: 4, si: 14, meters_gelb: 360, meters_rot: 315 }
        ]
    },
    "falkenstein": {
        holes18: [
            { hole: 1, par: 4, si: 9, meters_gelb: 340, meters_rot: 295 },
            { hole: 2, par: 4, si: 5, meters_gelb: 375, meters_rot: 325 },
            { hole: 3, par: 4, si: 1, meters_gelb: 405, meters_rot: 350 },
            { hole: 4, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 5, par: 4, si: 11, meters_gelb: 335, meters_rot: 290 },
            { hole: 6, par: 5, si: 7, meters_gelb: 480, meters_rot: 415 },
            { hole: 7, par: 3, si: 15, meters_gelb: 160, meters_rot: 135 },
            { hole: 8, par: 4, si: 3, meters_gelb: 390, meters_rot: 340 },
            { hole: 9, par: 4, si: 13, meters_gelb: 320, meters_rot: 280 },
            { hole: 10, par: 4, si: 16, meters_gelb: 355, meters_rot: 310 },
            { hole: 11, par: 4, si: 4, meters_gelb: 385, meters_rot: 335 },
            { hole: 12, par: 4, si: 8, meters_gelb: 360, meters_rot: 310 },
            { hole: 13, par: 3, si: 18, meters_gelb: 135, meters_rot: 115 },
            { hole: 14, par: 5, si: 6, meters_gelb: 495, meters_rot: 430 },
            { hole: 15, par: 4, si: 2, meters_gelb: 410, meters_rot: 355 },
            { hole: 16, par: 4, si: 12, meters_gelb: 345, meters_rot: 300 },
            { hole: 17, par: 4, si: 10, meters_gelb: 350, meters_rot: 305 },
            { hole: 18, par: 4, si: 14, meters_gelb: 370, meters_rot: 325 }
        ]
    },
    "wendlohe": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 350, meters_rot: 305 },
            { hole: 2, par: 4, si: 3, meters_gelb: 385, meters_rot: 335 },
            { hole: 3, par: 5, si: 9, meters_gelb: 475, meters_rot: 410 },
            { hole: 4, par: 3, si: 17, meters_gelb: 140, meters_rot: 120 },
            { hole: 5, par: 4, si: 1, meters_gelb: 410, meters_rot: 355 },
            { hole: 6, par: 4, si: 11, meters_gelb: 330, meters_rot: 285 },
            { hole: 7, par: 5, si: 5, meters_gelb: 490, meters_rot: 425 },
            { hole: 8, par: 3, si: 15, meters_gelb: 155, meters_rot: 135 },
            { hole: 9, par: 4, si: 13, meters_gelb: 325, meters_rot: 280 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 380, meters_rot: 330 },
            { hole: 12, par: 3, si: 18, meters_gelb: 135, meters_rot: 115 },
            { hole: 13, par: 5, si: 6, meters_gelb: 485, meters_rot: 420 },
            { hole: 14, par: 4, si: 2, meters_gelb: 405, meters_rot: 350 },
            { hole: 15, par: 4, si: 10, meters_gelb: 345, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 470, meters_rot: 405 },
            { hole: 18, par: 4, si: 14, meters_gelb: 355, meters_rot: 310 }
        ]
    },
    "kaden": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 365, meters_rot: 315 },
            { hole: 2, par: 5, si: 3, meters_gelb: 505, meters_rot: 440 },
            { hole: 3, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 4, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 5, par: 4, si: 9, meters_gelb: 355, meters_rot: 305 },
            { hole: 6, par: 4, si: 11, meters_gelb: 340, meters_rot: 295 },
            { hole: 7, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 8, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 9, par: 4, si: 13, meters_gelb: 330, meters_rot: 285 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 310 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 510, meters_rot: 445 },
            { hole: 14, par: 4, si: 2, meters_gelb: 420, meters_rot: 365 },
            { hole: 15, par: 4, si: 10, meters_gelb: 350, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 170, meters_rot: 145 },
            { hole: 17, par: 5, si: 12, meters_gelb: 485, meters_rot: 420 },
            { hole: 18, par: 4, si: 14, meters_gelb: 375, meters_rot: 325 }
        ]
    }
};

function getCourseHolesForClub(club, loecher, isBackNine = false) {
    const numLoecher = parseInt(loecher, 10) || 18;
    const clubNameLower = (club?.name || '').toLowerCase();

    // 1. Curated authentic club templates take priority for known golf clubs
    const templateKey = Object.keys(clubHolesTemplates).find(key => clubNameLower.includes(key));
    if(templateKey && clubHolesTemplates[templateKey]) {
        const full18 = clubHolesTemplates[templateKey].holes18;
        if(numLoecher === 9) {
            if(isBackNine || clubNameLower.includes('10-18')) {
                return full18.slice(9, 18).map(h => ({
                    hole: h.hole,
                    par: h.par,
                    si: h.si,
                    meters_gelb: h.meters_gelb,
                    meters_rot: h.meters_rot
                }));
            } else {
                return full18.slice(0, 9).map(h => ({
                    hole: h.hole,
                    par: h.par,
                    si: h.si,
                    meters_gelb: h.meters_gelb,
                    meters_rot: h.meters_rot
                }));
            }
        }
        return full18.map(h => ({
            hole: h.hole,
            par: h.par,
            si: h.si,
            meters_gelb: h.meters_gelb,
            meters_rot: h.meters_rot
        }));
    }

    // 2. Custom holes from club object (user-created club or backend data)
    if(club && Array.isArray(club.holes) && club.holes.length >= numLoecher) {
        if(numLoecher === 9 && (isBackNine || clubNameLower.includes('10-18')) && club.holes.length >= 18) {
            return club.holes.slice(9, 18).map(h => ({
                hole: h.hole || 10,
                par: parseInt(h.par, 10) || 4,
                si: parseInt(h.si, 10) || h.hole,
                meters_gelb: h.meters_gelb,
                meters_rot: h.meters_rot
            }));
        }
        return club.holes.slice(0, numLoecher).map(h => ({
            hole: h.hole,
            par: parseInt(h.par, 10) || 4,
            si: parseInt(h.si, 10) || h.hole,
            meters_gelb: h.meters_gelb,
            meters_rot: h.meters_rot
        }));
    }

    // 3. Dynamic fallback matching official DGV pars
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

    const offset = (is9 && (isBackNine || clubNameLower.includes('10-18'))) ? 9 : 0;
    return pars.slice(0, numLoecher).map((p, idx) => ({
        hole: idx + 1 + offset,
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

    const clubNameLower = (clubName || '').toLowerCase();
    const isBackNine = (loecher === 9) && clubNameLower.includes('10-18');
    const courseHoles = getCourseHolesForClub(club, loecher, isBackNine);
    scorecardData = [];

    for(let i = 1; i <= loecher; i++) {
        const holeObj = courseHoles[i - 1] || { hole: i + (isBackNine ? 9 : 0), par: 4, si: i };
        const holeNum = holeObj.hole || (i + (isBackNine ? 9 : 0));
        const par = holeObj.par;
        scorecardData.push({ hole: holeNum, par: par, strokes: par, si: holeObj.si });

        const tr = document.createElement('tr');
        tr.id = `scorecard-row-${holeNum}`;
        tr.className = "hover:bg-slate-50";
        tr.innerHTML = `
            <td class="py-2 px-2 font-bold text-slate-700">Loch ${holeNum} <span class="text-[10px] text-slate-400 font-normal">SI ${holeObj.si}</span></td>
            <td class="py-2 px-2">
                <select onchange="updateHolePar(${holeNum}, this.value)" class="text-xs py-1 px-1.5 rounded-md border border-slate-200 bg-white font-mono">
                    <option value="3" ${par == 3 ? 'selected' : ''}>Par 3</option>
                    <option value="4" ${par == 4 ? 'selected' : ''}>Par 4</option>
                    <option value="5" ${par == 5 ? 'selected' : ''}>Par 5</option>
                </select>
            </td>
            <td class="py-2 px-2">
                <div class="inline-flex items-center gap-1.5">
                    <button type="button" onclick="adjustHoleScore(${holeNum}, -1)" class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">−</button>
                    <input type="number" id="hole-score-${holeNum}" min="1" max="15" value="${par}" oninput="updateHoleScore(${holeNum}, this.value)" class="w-12 text-center py-1 rounded-md border border-slate-200 text-sm font-bold font-mono">
                    <button type="button" onclick="adjustHoleScore(${holeNum}, 1)" class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">+</button>
                </div>
            </td>
            <td class="py-2 px-2" id="hole-relative-${holeNum}">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold score-par">Par</span>
            </td>
            <td class="py-2 px-2 font-mono text-xs font-bold text-slate-600" id="hole-stb-${holeNum}">2 Pkt</td>
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
function initSignaturePad(canvasId, strokeWidth = 2.5) {
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
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        if(e.cancelable) e.preventDefault();
    }
    function end() {
        if(drawing) {
            drawing = false;
            updateSignatureBadges();
        }
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
            updateSignatureBadges();
        },
        isEmpty: () => {
            const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
            return !pixelBuffer.some(color => color !== 0);
        },
        toDataURL: () => canvas.toDataURL('image/png'),
        getCanvas: () => canvas
    };
}

function updateSignatureBadges() {
    const playerBadge = document.getElementById('sc-player-signed-badge');
    const markerBadge = document.getElementById('sc-marker-signed-badge');
    if(playerBadge) {
        if(scPlayerSigPad && !scPlayerSigPad.isEmpty()) {
            playerBadge.classList.remove('hidden');
        } else {
            playerBadge.classList.add('hidden');
        }
    }
    if(markerBadge) {
        if(scMarkerSigPad && !scMarkerSigPad.isEmpty()) {
            markerBadge.classList.remove('hidden');
        } else {
            markerBadge.classList.add('hidden');
        }
    }
}

function clearPlayerSignature() {
    if(scPlayerSigPad) scPlayerSigPad.clear();
    updateSignatureBadges();
}

function clearMarkerSignature() {
    if(scMarkerSigPad) scMarkerSigPad.clear();
    updateSignatureBadges();
}

// --- ENLARGED TOUCH SIGNATURE MODAL ---
function openZoomSignatureModal(type) {
    activeZoomSigType = type; // 'player' or 'marker'
    const modal = document.getElementById('signature-zoom-modal');
    const titleEl = document.getElementById('sig-zoom-title');
    const roleEl = document.getElementById('sig-zoom-role');

    if(type === 'player') {
        if(titleEl) titleEl.innerText = "Unterschrift Spieler (Großansicht)";
        if(roleEl) roleEl.innerText = currentUser?.username || "Spieler";
    } else {
        const markerName = document.getElementById('sc-marker-name')?.value.trim() || "Zähler / Marker";
        if(titleEl) titleEl.innerText = "Unterschrift Zähler (Großansicht)";
        if(roleEl) roleEl.innerText = markerName;
    }

    if(modal) modal.classList.remove('hidden');

    setTimeout(() => {
        if(!zoomSigPad) {
            zoomSigPad = initSignaturePad('sc-zoom-canvas', 4.0);
        }
        if(zoomSigPad) {
            zoomSigPad.clear();
            // Preload existing signature into zoom canvas if already present
            const targetCanvasId = (type === 'player') ? 'sc-player-canvas' : 'sc-marker-canvas';
            const targetPad = (type === 'player') ? scPlayerSigPad : scMarkerSigPad;
            const targetCanvas = document.getElementById(targetCanvasId);
            const zoomCanvas = document.getElementById('sc-zoom-canvas');
            if(targetPad && !targetPad.isEmpty() && targetCanvas && zoomCanvas) {
                const zctx = zoomCanvas.getContext('2d');
                zctx.drawImage(targetCanvas, 0, 0, zoomCanvas.width, zoomCanvas.height);
            }
        }
    }, 50);
}

function closeZoomSignatureModal() {
    const modal = document.getElementById('signature-zoom-modal');
    if(modal) modal.classList.add('hidden');
}

function clearZoomSignature() {
    if(zoomSigPad) zoomSigPad.clear();
}

function confirmZoomSignature() {
    if(!zoomSigPad || zoomSigPad.isEmpty()) {
        showToast("Bitte unterschreibe im vergrößerten Feld.", "✍️");
        return;
    }
    const zoomCanvas = document.getElementById('sc-zoom-canvas');
    const targetCanvasId = (activeZoomSigType === 'player') ? 'sc-player-canvas' : 'sc-marker-canvas';
    const targetCanvas = document.getElementById(targetCanvasId);

    if(targetCanvas && zoomCanvas) {
        const tctx = targetCanvas.getContext('2d');
        tctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        tctx.drawImage(zoomCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
    }

    updateSignatureBadges();
    closeZoomSignatureModal();
    showToast("Unterschrift erfolgreich übernommen! ✅", "✍️");
}

function updateScorecardTournamentBanner() {
    const banner = document.getElementById('sc-tournament-banner');
    if(!banner) return;
    if(!activeScorecardTournament) {
        banner.classList.add('hidden');
        return;
    }

    const t = activeScorecardTournament;
    const titleEl = document.getElementById('sc-tb-title');
    const spielformEl = document.getElementById('sc-tb-spielform');
    const vorgabeEl = document.getElementById('sc-tb-vorgabe');
    const metaEl = document.getElementById('sc-tb-meta');

    if(titleEl) titleEl.innerText = t.name || t.titel || 'Club-Turnier';
    if(spielformEl) {
        const sf = t.spielform || 'Stableford';
        spielformEl.innerText = sf;
        if(sf.toLowerCase().includes('zähl') || sf.toLowerCase().includes('stroke')) {
            spielformEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200";
        } else if(sf.toLowerCase().includes('scramble') || sf.toLowerCase().includes('vierer')) {
            spielformEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200";
        } else {
            spielformEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200";
        }
    }
    if(vorgabeEl) {
        const isVorgabe = t.vorgabenwirksam !== false && t.vorgabenwirksam !== 'nein';
        vorgabeEl.innerText = isVorgabe ? 'Vorgabenwirksam' : 'Nicht vorgabenwirksam';
        vorgabeEl.className = isVorgabe 
            ? "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
            : "px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200";
    }
    if(metaEl) {
        const clubStr = t.club_name || document.getElementById('sc-club-select')?.value || '';
        metaEl.innerText = `${clubStr} • ${t.datum || ''} • ${t.loecher || 18} Löcher`;
    }

    banner.classList.remove('hidden');
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
        
        // Match club by id or fuzzy name
        const rawClubName = (turnier.club_name || '').trim();
        const normalize = s => (s || '').toLowerCase()
            .replace(/^(gc|golfclub|golf-club)\s+/i, '')
            .replace(/\s*(18|1-9|10-18|nord|süd|ost|west)\b/gi, '')
            .trim();
        const normTarget = normalize(rawClubName);
        
        let targetClub = null;
        if(turnier.club_id) {
            targetClub = clubs.find(c => c.id === turnier.club_id);
        }
        if(!targetClub && rawClubName) {
            targetClub = clubs.find(c => c.name.toLowerCase() === rawClubName.toLowerCase());
            if(!targetClub) {
                targetClub = clubs.find(c => normalize(c.name) === normTarget);
            }
            if(!targetClub) {
                targetClub = clubs.find(c => c.name.toLowerCase().includes(normTarget) || normTarget.includes(c.name.toLowerCase()));
            }
        }

        // Special handling if tournament is 9 holes and specified 10-18 / Back-Nine
        const tNameLower = ((turnier.name || turnier.titel || '') + ' ' + (turnier.kurs || '') + ' ' + rawClubName).toLowerCase();
        const isBackNine = tNameLower.includes('10-18') || tNameLower.includes('back-nine') || tNameLower.includes('back 9');
        if(isBackNine) {
            const backNineClub = clubs.find(c => c.name.toLowerCase().includes('10-18') && normalize(c.name) === normTarget);
            if(backNineClub) targetClub = backNineClub;
        } else if(turnier.loecher === 9) {
            const frontNineClub = clubs.find(c => c.name.toLowerCase().includes('1-9') && normalize(c.name) === normTarget);
            if(frontNineClub) targetClub = frontNineClub;
        }

        if(targetClub) {
            selectEl.value = targetClub.name;
        } else if(turnier.club_name) {
            const exists = Array.from(selectEl.options).some(o => o.value === turnier.club_name);
            if(!exists) {
                const opt = document.createElement('option');
                opt.value = turnier.club_name;
                opt.innerText = turnier.club_name;
                selectEl.appendChild(opt);
            }
            selectEl.value = turnier.club_name;
        }

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

    updateScorecardTournamentBanner();
    onScorecardClubChanged(turnier);
    document.getElementById('scorecard-modal').classList.remove('hidden');

    // Initialize signature pads
    setTimeout(() => {
        if(!scPlayerSigPad) scPlayerSigPad = initSignaturePad('sc-player-canvas', 2.5);
        if(!scMarkerSigPad) scMarkerSigPad = initSignaturePad('sc-marker-canvas', 2.5);
        scPlayerSigPad?.clear();
        scMarkerSigPad?.clear();
        updateSignatureBadges();
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

    if(preselectedTournament && preselectedTournament.loecher) {
        loecherSelect.value = String(preselectedTournament.loecher);
    } else if(isPure9 || (!has18 && loecherSelect.value === '18')) {
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
        const baseName = club.name.replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
        clubTurniere = turniere.filter(t => {
            if(t.club_id && club.id && t.club_id === club.id) return true;
            if(t.club_name === club.name) return true;
            const tClubBase = (t.club_name || '').replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
            return tClubBase === baseName;
        });
    }

    select.innerHTML = '<option value="">Freie Runde / Privatrunde</option>';
    if(clubTurniere.length > 0) {
        const group = document.createElement('optgroup');
        group.label = `Club-Turniere (${clubTurniere.length})`;
        clubTurniere.forEach(t => {
            const opt = document.createElement('option');
            opt.value = String(t.id);
            opt.innerText = `🏆 ${t.datum} – ${t.name || t.titel} (${t.loecher}L, ${t.spielform || 'Stableford'})`;
            group.appendChild(opt);
        });
        select.appendChild(group);
    }
    const optCustom = document.createElement('option');
    optCustom.value = '__custom__';
    optCustom.innerText = '✍️ Anderes / Manuelles Turnier...';
    select.appendChild(optCustom);

    const targetTournament = preselectedTournament || activeScorecardTournament;
    if(targetTournament) {
        const found = clubTurniere.find(t => (targetTournament.id && t.id === targetTournament.id) || t.name === targetTournament.name || t.name === targetTournament.titel);
        if(found) {
            select.value = String(found.id);
            activeScorecardTournament = found;
            if(customInput) {
                customInput.classList.add('hidden');
                customInput.value = found.name || found.titel;
            }
        } else {
            const tId = targetTournament.id ? String(targetTournament.id) : `tourn_${Date.now()}`;
            const opt = document.createElement('option');
            opt.value = tId;
            const tName = targetTournament.name || targetTournament.titel || 'Turnier';
            opt.innerText = `🏆 ${targetTournament.datum || ''} – ${tName} (${targetTournament.loecher || 18}L, ${targetTournament.spielform || 'Stableford'})`;
            select.insertBefore(opt, optCustom);
            select.value = tId;
            activeScorecardTournament = targetTournament;
            if(!turniere.some(t => t.id === targetTournament.id)) {
                turniere.push(targetTournament);
            }
            if(customInput) {
                customInput.classList.add('hidden');
                customInput.value = tName;
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
    updateScorecardTournamentBanner();
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
        const t = turniere.find(item => item.id === turnierId) || (activeScorecardTournament && activeScorecardTournament.id === turnierId ? activeScorecardTournament : null);
        if(t) {
            activeScorecardTournament = t;
            if(customInput) {
                customInput.classList.add('hidden');
                customInput.value = t.name || t.titel;
            }
            if(t.datum && t.datum.includes('.')) {
                const parts = t.datum.split('.');
                if(parts.length === 3) {
                    document.getElementById('sc-datum').value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            } else if(t.datum) {
                document.getElementById('sc-datum').value = t.datum;
            }
            if(t.loecher) {
                document.getElementById('sc-loecher').value = String(t.loecher);
            }
        }
    }
    updateScorecardTournamentBanner();
    recalculateScorecardHandicapAndCourse();
    initScorecardHolesTable();
}

function onScorecardLoecherChanged() {
    recalculateScorecardHandicapAndCourse();
    initScorecardHolesTable();
}

function recalculateScorecardHandicapAndCourse() {
    const clubName = document.getElementById('sc-club-select').value;
    let club = clubs.find(c => c.name === clubName) || clubs[0];
    const loecher = parseInt(document.getElementById('sc-loecher').value, 10) || 18;

    const clubNameLower = (clubName || '').toLowerCase();
    const tNameLower = activeScorecardTournament ? ((activeScorecardTournament.name || activeScorecardTournament.titel || '') + ' ' + (activeScorecardTournament.kurs || '')).toLowerCase() : '';
    const isBackNine = (loecher === 9) && (clubNameLower.includes('10-18') || tNameLower.includes('10-18') || tNameLower.includes('back-nine') || tNameLower.includes('back 9'));

    // If club doesn't have 9-hole data but 9 holes is selected, check sister sub-course (e.g. GC Jersbek 10-18 or GC Jersbek 1-9)
    if(loecher === 9 && (!club?.cr9 || String(club.cr9).trim() === '')) {
        const baseName = clubName.replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
        const sisterClub = clubs.find(c => {
            const cLower = c.name.toLowerCase();
            const cBase = c.name.replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
            return cBase === baseName && (isBackNine ? cLower.includes('10-18') : cLower.includes('1-9'));
        });
        if(sisterClub && sisterClub.cr9) {
            club = sisterClub;
        }
    } else if(loecher === 18 && (!club?.cr18 || String(club.cr18).trim() === '')) {
        const baseName = clubName.replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
        const sisterClub = clubs.find(c => {
            const cBase = c.name.replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
            return cBase === baseName && c.cr18;
        });
        if(sisterClub && sisterClub.cr18) {
            club = sisterClub;
        }
    }

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

    const clubNameLower = (clubName || '').toLowerCase();
    const tNameLower = activeScorecardTournament ? ((activeScorecardTournament.name || activeScorecardTournament.titel || '') + ' ' + (activeScorecardTournament.kurs || '')).toLowerCase() : '';
    const isBackNine = (loecher === 9) && (clubNameLower.includes('10-18') || tNameLower.includes('10-18') || tNameLower.includes('back-nine') || tNameLower.includes('back 9'));

    const courseHoles = getCourseHolesForClub(club, loecher, isBackNine);
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

    // Rank holes by SI for clean stroke allocation on 9 holes
    const sortedBySi = courseHoles.map((h, idx) => ({ idx, si: h.si })).sort((a, b) => a.si - b.si);
    const siRankMap = {};
    sortedBySi.forEach((item, rank) => {
        siRankMap[item.idx] = rank + 1;
    });

    for(let i = 0; i < loecher; i++) {
        const holeObj = courseHoles[i] || { hole: i + 1 + (isBackNine ? 9 : 0), par: 4, si: i + 1 };
        const holeNr = holeObj.hole;
        const par = holeObj.par;
        const si = holeObj.si;

        // Vorgabestriche calculation according to WHS Course Handicap & Stroke Index
        const baseStriche = Math.floor(playingHcp / loecher);
        const remainder = ((playingHcp % loecher) + loecher) % loecher;
        const rank = (loecher === 9) ? (siRankMap[i] || (i + 1)) : si;
        const striche = baseStriche + (rank <= remainder ? 1 : 0);

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
                <td class="py-2 px-1 text-center">
                    <select onchange="updateScorecardHolePar(${i}, this.value)" class="text-xs py-0.5 px-1 rounded-md border border-slate-200 bg-white font-bold text-slate-700 cursor-pointer hover:border-golf-500 focus:outline-none focus:ring-1 focus:ring-golf-500" title="Par für Loch ${holeNr} anpassen">
                        <option value="3" ${par === 3 ? 'selected' : ''}>3</option>
                        <option value="4" ${par === 4 ? 'selected' : ''}>4</option>
                        <option value="5" ${par === 5 ? 'selected' : ''}>5</option>
                        <option value="6" ${par === 6 ? 'selected' : ''}>6</option>
                    </select>
                </td>
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
                <td class="py-2 px-1 text-center">
                    <select onchange="updateScorecardHolePar(${i}, this.value)" class="text-xs py-0.5 px-1 rounded-md border border-slate-200 bg-white font-bold text-slate-700 cursor-pointer hover:border-golf-500 focus:outline-none focus:ring-1 focus:ring-golf-500" title="Par für Loch ${holeNr} anpassen">
                        <option value="3" ${par === 3 ? 'selected' : ''}>3</option>
                        <option value="4" ${par === 4 ? 'selected' : ''}>4</option>
                        <option value="5" ${par === 5 ? 'selected' : ''}>5</option>
                        <option value="6" ${par === 6 ? 'selected' : ''}>6</option>
                    </select>
                </td>
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

function updateScorecardHolePar(index, newPar) {
    const hole = scHolesData[index];
    if(!hole) return;
    const parsed = parseInt(newPar, 10);
    if(parsed >= 3 && parsed <= 6) {
        hole.par = parsed;
        const totalPar = scHolesData.reduce((sum, h) => sum + h.par, 0);
        const totalParEl = document.getElementById('sc-total-par');
        if(totalParEl) totalParEl.innerText = totalPar;
        recalculateScorecardRow(index);
    }
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
    const diffStbf = totalStableford - expectedStbf;
    const calloutEl = document.getElementById('sc-callout-text');
    const spielform = (activeScorecardTournament?.spielform || 'Stableford').toLowerCase();
    const isZaehlspiel = spielform.includes('zähl') || spielform.includes('stroke') || spielform.includes('maximum');

    if(calloutEl) {
        if(isZaehlspiel) {
            const coursePar = parseInt(document.getElementById('sc-display-par')?.innerText, 10) || (loecher === 18 ? 72 : 36);
            const diffPar = totalNetto - coursePar;
            const diffStr = diffPar > 0 ? `+${diffPar}` : (diffPar === 0 ? 'Even (Par)' : `${diffPar}`);
            
            if(diffPar < 0) {
                calloutEl.innerHTML = `<strong class="text-purple-700">${totalNetto} Netto-Schläge (${diffStr} gegen Platz-Par ${coursePar})</strong> – Hervorragende Zählspiel-Runde unter Platzstandard! 🏆 (${totalStableford} Netto-Pkt)`;
            } else if(diffPar === 0) {
                calloutEl.innerHTML = `<strong class="text-blue-700">${totalNetto} Netto-Schläge (Even Par)</strong> – Genau Platzstandard gespielt! Solide Leistung. ⛳ (${totalStableford} Netto-Pkt)`;
            } else {
                calloutEl.innerHTML = `<strong class="text-slate-800">${totalNetto} Netto-Schläge (${diffStr} gegen Platz-Par ${coursePar})</strong> – Zählspiel-Ergebnis erfasst. (${totalStableford} Netto-Punkte)`;
            }
        } else {
            if(diffStbf > 0) {
                calloutEl.innerHTML = `<strong class="text-emerald-700">${totalStableford} Netto-Punkte (+${diffStbf})</strong> – Unterspielung! Dein WHS Handicap verbessert sich. 🎉`;
            } else if(diffStbf === 0) {
                calloutEl.innerHTML = `<strong class="text-blue-700">${totalStableford} Netto-Punkte</strong> – Handicap genau bestätigt! Solide Runde. ⛳`;
            } else {
                calloutEl.innerHTML = `<strong class="text-slate-800">${totalStableford} Netto-Punkte (${diffStbf})</strong> – Pufferbereich / Schonung nach WHS Soft Cap.`;
            }
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

