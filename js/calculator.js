// --- HCP SIMULATOR ("WHAT-IF") ---
function setSimHoles(h) {
    document.getElementById('sim-btn-18').className = h === 18 ? "py-2.5 rounded-xl font-bold text-sm bg-golf-600 text-white shadow-sm transition-all" : "py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
    document.getElementById('sim-btn-9').className = h === 9 ? "py-2.5 rounded-xl font-bold text-sm bg-golf-600 text-white shadow-sm transition-all" : "py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
    
    const slider = document.getElementById('sim-score-slider');
    if(h === 9) {
        slider.min = "30";
        slider.max = "75";
        if(parseInt(slider.value, 10) > 75) slider.value = "45";
    } else {
        slider.min = "60";
        slider.max = "140";
        if(parseInt(slider.value, 10) < 60) slider.value = "92";
    }
    onSimSliderInput(slider.value);
    runSimulation();
}

function onSimSliderInput(val) {
    document.getElementById('sim-score-display').innerText = val;
    runSimulation();
}

function runSimulation() {
    const clubName = document.getElementById('sim-club')?.value;
    const loecher = document.getElementById('sim-btn-18')?.classList.contains('bg-golf-600') ? 18 : 9;
    const brutto = parseInt(document.getElementById('sim-score-slider')?.value || '92', 10);
    const club = clubs.find(c => c.name === clubName);

    const crEl = document.getElementById('sim-cr');
    const srEl = document.getElementById('sim-sr');
    const chEl = document.getElementById('sim-ch');
    const resultHcpEl = document.getElementById('sim-result-hcp');
    const resultDeltaEl = document.getElementById('sim-result-delta');
    const resultSdEl = document.getElementById('sim-result-sd');
    const feedbackBox = document.getElementById('sim-feedback-box');
    const dropoffEl = document.getElementById('sim-dropoff-text');

    if(aktuellesHCP === null || !currentUser) {
        document.getElementById('sim-curr-hcp').innerText = '--';
        if(resultHcpEl) resultHcpEl.innerText = '--';
        if(resultDeltaEl) resultDeltaEl.innerText = '--';
        if(resultSdEl) resultSdEl.innerText = '--';
        if(chEl) chEl.innerText = '--';
        if(crEl) crEl.innerText = '--';
        if(srEl) srEl.innerText = '--';
        if(feedbackBox) {
            feedbackBox.className = "p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700";
            feedbackBox.innerHTML = `🔒 Bitte melde dich an oder erfasse Runden, um dein persönliches Handicap zu simulieren. <button onclick="openAuthModal('login')" class="text-golf-600 font-bold underline ml-1">Anmelden</button>`;
        }
        if(dropoffEl) dropoffEl.innerText = "Keine Runden vorhanden.";
        return;
    }

    document.getElementById('sim-curr-hcp').innerText = aktuellesHCP.toFixed(1);

    if(!club) return;

    const cr = loecher == 18 ? club.cr18 : club.cr9;
    const sr = loecher == 18 ? club.sr18 : club.sr9;
    const par = loecher == 18 ? club.par18 : club.par9;

    crEl.innerText = cr || '--';
    srEl.innerText = sr || '--';

    if(cr && sr && par) {
        const ch = calculateCourseHandicap(aktuellesHCP, sr, cr, par, loecher);
        chEl.innerText = `${ch}`;
    } else {
        chEl.innerText = '--';
    }

    const sd = calculateSD(club, loecher, brutto, aktuellesHCP);
    if(sd !== null) {
        resultSdEl.innerText = sd.toFixed(1);

        const simRounds = [...runden, { datum: "Simulation", club_name: clubName, loecher: loecher, brutto: brutto, sd: sd }];
        const letzte20 = simRounds.slice(-20);
        const count = letzte20.length >= 20 ? 8 : Math.max(1, Math.floor(letzte20.length / 2));
        const sorted = [...letzte20].sort((a,b) => parseFloat(a.sd) - parseFloat(b.sd));
        const best = sorted.slice(0, count);
        const simHcp = Math.round((best.reduce((a,b) => a + parseFloat(b.sd), 0) / best.length) * 10) / 10;
        const delta = Math.round((simHcp - aktuellesHCP) * 10) / 10;

        resultHcpEl.innerText = simHcp.toFixed(1);

        if(delta < 0) {
            resultDeltaEl.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800";
            resultDeltaEl.innerText = `${delta.toFixed(1)} ↘`;
            feedbackBox.className = "p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold";
            feedbackBox.innerText = `🎯 Mit ${brutto} Schlägen (SD ${sd.toFixed(1)}) verbesserst du dein Handicap um ${Math.abs(delta).toFixed(1)} Schläge!`;
        } else if(delta > 0) {
            resultDeltaEl.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800";
            resultDeltaEl.innerText = `+${delta.toFixed(1)} ↗`;
            feedbackBox.className = "p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-semibold";
            feedbackBox.innerText = `⚠️ Mit ${brutto} Schlägen verschlechtert sich dein Handicap leicht um +${delta.toFixed(1)}.`;
        } else {
            resultDeltaEl.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700";
            resultDeltaEl.innerText = `±0.0`;
            feedbackBox.className = "p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium";
            feedbackBox.innerText = `Dein Handicap Index bleibt unverändert bei ${aktuellesHCP.toFixed(1)}.`;
        }

        if(runden.length >= 20) {
            const oldest = runden.slice(-20)[0];
            dropoffEl.innerText = `Deine älteste gewertete Runde (${oldest.datum}, Brutto ${oldest.brutto}, SD ${oldest.sd}) fällt aus den letzten 20 Runden heraus.`;
        } else {
            dropoffEl.innerText = `Da du aktuell ${runden.length} Runden hast, wird diese Runde einfach zur Historie hinzugefügt (noch keine 20 Runden voll).`;
        }
    } else {
        resultSdEl.innerText = '--';
        resultHcpEl.innerText = '--';
        resultDeltaEl.innerText = '--';
        feedbackBox.innerText = "Bitte wähle einen Club mit gültigen Slope- und CR-Werten.";
    }
}

// --- COURSE HANDICAP CALCULATOR TAB ---
function runCourseHcpCalc() {
    const clubName = document.getElementById('calc-club')?.value;
    const loecher = parseInt(document.getElementById('calc-holes')?.value || '18', 10);
    let hcpInput = document.getElementById('calc-hcp');
    let hcpVal = parseFloat(hcpInput?.value);
    if(isNaN(hcpVal)) {
        if(aktuellesHCP !== null) {
            hcpVal = aktuellesHCP;
            if(hcpInput) hcpInput.value = aktuellesHCP.toFixed(1);
        } else {
            hcpVal = 54.0;
        }
    }

    const club = clubs.find(c => c.name === clubName);

    const crOverride = parseFloat(document.getElementById('calc-cr-override')?.value);
    const srOverride = parseFloat(document.getElementById('calc-sr-override')?.value);
    const parOverride = parseFloat(document.getElementById('calc-par-override')?.value);

    let cr = !isNaN(crOverride) ? crOverride : (club ? (loecher == 18 ? club.cr18 : club.cr9) : 72.0);
    let sr = !isNaN(srOverride) ? srOverride : (club ? (loecher == 18 ? club.sr18 : club.sr9) : 113.0);
    let par = !isNaN(parOverride) ? parOverride : (club ? (loecher == 18 ? club.par18 : club.par9) : 72.0);

    if(cr && sr && par && !isNaN(hcpVal)) {
        const ch = calculateCourseHandicap(hcpVal, sr, cr, par, loecher);
        document.getElementById('calc-result-ch').innerText = ch;
        document.getElementById('calc-formula-display').innerText = `CH = ${hcpVal.toFixed(1)} × (${sr} / 113) + (${cr} - ${par}) = ${ch}`;

        const targetScore = Math.round(par + ch);
        document.getElementById('calc-target-score').innerText = `${targetScore} Schläge`;
        document.getElementById('calc-netto-par').innerText = `${targetScore} Brutto`;
    } else {
        document.getElementById('calc-result-ch').innerText = '--';
        document.getElementById('calc-target-score').innerText = '--';
        document.getElementById('calc-netto-par').innerText = '--';
    }
}

