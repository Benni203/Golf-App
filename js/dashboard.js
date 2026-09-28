// --- UI REFRESH & UPDATES ---
function updateApp() {
    updateHCP();
    saveData();

    renderHeader();
    renderDashboard();
    renderDropdowns();
    renderActiveCheckInBanner();
    renderClubsExplorer();
    renderFilteredHistory();
    renderChart();
    runSimulation();
    runCourseHcpCalc();
    onRoundInputChanged();
}

function renderHeader() {
    const hcpDisplay = (currentUser && aktuellesHCP !== null) ? aktuellesHCP.toFixed(1) : '--';
    document.getElementById('header-hcp').innerText = hcpDisplay;
    document.getElementById('dash-hcp').innerText = hcpDisplay;

    const trendEl = document.getElementById('header-hcp-trend');
    if(currentUser) {
        trendEl.innerText = 'ONLINE';
        trendEl.className = "text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300";
        trendEl.onclick = null;
        trendEl.title = `Angemeldet als ${currentUser.username}`;
    } else {
        trendEl.innerText = 'GAST';
        trendEl.className = "text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200/90 px-2 py-0.5 rounded-full border border-slate-300 cursor-pointer hover:bg-slate-300 transition-colors";
        trendEl.title = "Klicke hier zum Anmelden";
        trendEl.onclick = () => openAuthModal('login');
    }

    const checkinPill = document.getElementById('header-checkin-pill');
    const checkinName = document.getElementById('header-checkin-name');
    if(checkinPill && checkinName) {
        if(activeCheckIn) {
            checkinPill.classList.remove('hidden');
            checkinName.innerText = `⛳ ${activeCheckIn.clubName}`;
        } else {
            checkinPill.classList.add('hidden');
        }
    }
}

function renderDashboard() {
    const authPrompt = document.getElementById('dash-auth-prompt');
    const userWelcome = document.getElementById('dash-user-welcome');
    
    if(authPrompt) {
        if(currentUser) {
            authPrompt.classList.add('hidden');
        } else {
            authPrompt.classList.remove('hidden');
        }
    }

    if(userWelcome) {
        if(currentUser && runden.length === 0) {
            userWelcome.classList.remove('hidden');
        } else {
            userWelcome.classList.add('hidden');
        }
    }

    const hcpDisplay = (currentUser && aktuellesHCP !== null) ? aktuellesHCP.toFixed(1) : '--';
    document.getElementById('dash-hcp').innerText = hcpDisplay;
    
    const dashHcpSub = document.getElementById('dash-hcp-sub');
    const dashHcpDesc = document.getElementById('dash-hcp-desc');
    if(currentUser) {
        dashHcpSub.innerText = 'WHS Index';
        dashHcpDesc.innerText = aktuellesHCP !== null ? 'Berechnet aus den besten Runden der letzten 20' : 'Noch keine Runden erfasst';
    } else {
        dashHcpSub.innerText = 'Gast-Modus';
        dashHcpDesc.innerText = 'Melde dich an, um dein Handicap zu sehen';
    }

    document.getElementById('dash-rounds-count').innerText = currentUser ? runden.length : '--';

    const r18 = runden.filter(r => r.loecher == 18).length;
    const r9 = runden.filter(r => r.loecher == 9).length;
    document.getElementById('dash-rounds-18-9-sub').innerText = currentUser ? `${r18}x 18L / ${r9}x 9L` : 'Keine Runden';

    if(currentUser && runden.length > 0) {
        const minSD = Math.min(...runden.map(r => parseFloat(r.sd)));
        const bestSDRound = runden.find(r => parseFloat(r.sd) === minSD);
        document.getElementById('dash-best-sd').innerText = minSD.toFixed(1);
        document.getElementById('dash-best-sd-club').innerText = bestSDRound ? `${bestSDRound.club_name} (${bestSDRound.datum})` : 'Keine Runden';

        const runden18 = runden.filter(r => r.loecher == 18);
        if(runden18.length > 0) {
            const minGross = Math.min(...runden18.map(r => parseInt(r.brutto, 10)));
            const bestGrossRound = runden18.find(r => parseInt(r.brutto, 10) === minGross);
            document.getElementById('dash-best-gross').innerText = minGross;
            document.getElementById('dash-best-gross-date').innerText = bestGrossRound ? `${bestGrossRound.datum} (${bestGrossRound.club_name.substring(0, 18)})` : '--';
        } else {
            document.getElementById('dash-best-gross').innerText = '--';
            document.getElementById('dash-best-gross-date').innerText = 'Bisher nur 9-Loch';
        }
    } else {
        document.getElementById('dash-best-sd').innerText = '--';
        document.getElementById('dash-best-sd-club').innerText = currentUser ? 'Noch keine Runden' : 'Nicht angemeldet';
        document.getElementById('dash-best-gross').innerText = '--';
        document.getElementById('dash-best-gross-date').innerText = currentUser ? 'Noch keine Runden' : 'Nicht angemeldet';
    }

    const container = document.getElementById('counting-rounds-container');
    container.innerHTML = '';

    if(!currentUser) {
        document.getElementById('whs-counting-count').innerText = '0';
        document.getElementById('whs-formula-text').innerText = 'Anmeldung erforderlich';
        container.innerHTML = `
            <div class="col-span-full py-8 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 space-y-2">
                <div>🔒 <strong>Geschützter Bereich:</strong> Melde dich an, um deine gewerteten WHS-Runden zu sehen.</div>
                <div>
                    <button onclick="openAuthModal('login')" class="px-3.5 py-1.5 rounded-lg bg-golf-600 text-white font-bold text-xs hover:bg-golf-700 transition-colors">
                        Jetzt anmelden
                    </button>
                </div>
            </div>
        `;
    } else {
        const letzte20 = runden.slice(-20);
        const countingRounds = letzte20.filter(r => r.isBest).sort((a,b) => parseFloat(a.sd) - parseFloat(b.sd));
        document.getElementById('whs-counting-count').innerText = countingRounds.length;

        if(countingRounds.length === 0) {
            document.getElementById('whs-formula-text').innerText = 'Mindestens 1 Runde erforderlich';
            container.innerHTML = `<div class="col-span-full py-6 text-center text-xs text-slate-400">Noch keine Runden im Account vorhanden. Erfasse jetzt deine erste Runde!</div>`;
        } else {
            countingRounds.forEach((r, idx) => {
                const card = document.createElement('div');
                card.className = "rounded-xl p-3 bg-gradient-to-b from-sand-50 to-white border border-sand-200 shadow-xs text-center space-y-1 relative group hover:border-sand-400 transition-all";
                card.innerHTML = `
                    <div class="text-[10px] font-bold text-sand-700 flex items-center justify-center gap-0.5">
                        <span>★ #${idx + 1}</span>
                    </div>
                    <div class="text-xl font-black text-slate-900 font-mono">${parseFloat(r.sd).toFixed(1)}</div>
                    <div class="text-[10px] text-slate-500 font-medium truncate" title="${r.club_name}">${r.club_name.substring(0, 12)}</div>
                    <div class="text-[9px] text-slate-400">${r.datum}</div>
                `;
                container.appendChild(card);
            });

            const sum = countingRounds.reduce((acc, r) => acc + parseFloat(r.sd), 0);
            document.getElementById('whs-formula-text').innerText = `Ø (${sum.toFixed(1)} / ${countingRounds.length}) = ${aktuellesHCP !== null ? aktuellesHCP.toFixed(1) : '--'}`;
        }
    }

    const recentBody = document.getElementById('dash-recent-table-body');
    recentBody.innerHTML = '';
    
    if(!currentUser) {
        recentBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-xs text-slate-500">🔒 Spielergebnisse sind nur für angemeldete Benutzer sichtbar. <button onclick="openAuthModal('login')" class="text-golf-600 font-bold underline hover:text-golf-800 ml-1">Anmelden</button></td></tr>`;
    } else {
        const recent5 = [...runden].reverse().slice(0, 5);
        if(recent5.length === 0) {
            recentBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-xs text-slate-400">Keine Runden vorhanden. Erfasse jetzt deine erste Runde!</td></tr>`;
        } else {
            recent5.forEach(r => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50/80 transition-colors";
                const isCounting = r.isBest ? '<span class="text-sand-600 font-bold ml-1">★</span>' : '';
                tr.innerHTML = `
                    <td class="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">${r.datum}</td>
                    <td class="py-2.5 px-3 font-semibold text-slate-900 truncate max-w-[180px]">${r.club_name}</td>
                    <td class="py-2.5 px-3 text-center text-slate-600"><span class="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-bold">${r.loecher}L</span></td>
                    <td class="py-2.5 px-3 text-center font-mono font-bold text-slate-800">${r.brutto}</td>
                    <td class="py-2.5 px-3 text-right font-mono font-black ${r.isBest ? 'text-golf-700' : 'text-slate-700'}">${parseFloat(r.sd).toFixed(1)} ${isCounting}</td>
                `;
                recentBody.appendChild(tr);
            });
        }
    }
}

function renderDropdowns() {
    const sortedClubs = [...clubs].sort((a,b) => a.name.localeCompare(b.name));
    const dropdownIds = ['rec-club', 'sim-club', 'calc-club', 'modal-turnier-club'];
    dropdownIds.forEach(id => {
        const select = document.getElementById(id);
        if(!select) return;
        const currentVal = select.value;
        select.innerHTML = '<option value="">-- Golfclub wählen --</option>';

        sortedClubs.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.name;
            opt.innerText = c.name + (c.city ? ` (${c.city})` : '') + (c.tee ? ` [${c.tee}]` : '');
            select.appendChild(opt);
        });

        if(currentVal && sortedClubs.some(c => c.name === currentVal)) {
            select.value = currentVal;
        } else if(sortedClubs.length > 0 && id !== 'rec-club') {
            select.value = sortedClubs[0].name;
        }
    });

    const recClub = document.getElementById('rec-club');
    if(recClub && !recClub.value && sortedClubs.length > 0) {
        recClub.value = sortedClubs[0].name;
    }

    if(recClub) {
        updateTournamentDropdown(recClub.value);
    }
}

function updateTournamentDropdown(selectedClubName, preselectedTurnierName = null) {
    const select = document.getElementById('rec-turnier');
    if(!select) return;

    select.innerHTML = '';
    
    const optPrivate = document.createElement('option');
    optPrivate.value = '';
    optPrivate.innerText = 'Freie Runde / Privatrunde (Kein Turnier)';
    select.appendChild(optPrivate);

    if(selectedClubName) {
        const club = clubs.find(c => c.name === selectedClubName);
        const clubTurniere = turniere.filter(t => t.club_name === selectedClubName || (club && club.id && t.club_id === club.id));
        if(clubTurniere.length > 0) {
            const optGroup = document.createElement('optgroup');
            optGroup.label = `Anstehende Turniere (${clubTurniere.length})`;
            clubTurniere.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.name;
                opt.innerText = `🏆 ${t.datum} – ${t.name} (${t.loecher}L, ${t.spielform || 'Stableford'})`;
                optGroup.appendChild(opt);
            });
            select.appendChild(optGroup);
        } else if(club && club.id) {
            apiFetch(`/api/clubs/${club.id}/turniere`).then(res => {
                if(res.ok && res.data) {
                    const list = Array.isArray(res.data) ? res.data : (res.data.turniere || []);
                    if(list.length > 0) {
                        list.forEach(ct => {
                            if(!turniere.some(t => t.id === ct.id)) turniere.push(ct);
                        });
                        updateTournamentDropdown(selectedClubName, preselectedTurnierName);
                    }
                }
            }).catch(() => {});
        }
    }

    if(preselectedTurnierName) {
        select.value = preselectedTurnierName;
    } else if(activeCheckIn && activeCheckIn.clubName === selectedClubName && activeCheckIn.turnier) {
        select.value = activeCheckIn.turnier;
    } else {
        select.value = '';
    }
}

function onTournamentSelectChanged() {
    const select = document.getElementById('rec-turnier');
    const turnierName = select ? select.value : '';
    if(!turnierName) return;

    const clubName = document.getElementById('rec-club')?.value;
    const t = turniere.find(item => item.club_name === clubName && item.name === turnierName);
    if(t) {
        if(t.loecher) {
            const recLoecher = document.getElementById('rec-loecher');
            if(recLoecher) recLoecher.value = String(t.loecher);
        }
        if(t.datum && t.datum.includes('.')) {
            const parts = t.datum.split('.');
            if(parts.length === 3) {
                const isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                const dateInput = document.getElementById('rec-datum');
                if(dateInput) dateInput.value = isoDate;
            }
        }
        showToast(`Turnier "${t.name}" (${t.loecher}L, ${t.spielform}) ausgewählt`, "🏆");
        onRoundInputChanged();
    }
}


// --- INTERACTIVE CHART.JS PROGRESSION ---
function renderChart() {
    const ctx = document.getElementById('handicapChart');
    if(!ctx) return;

    if(chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    if(!currentUser || runden.length === 0) {
        return;
    }

    let chronRounds = [...runden].sort((a,b) => parseDateDe(a.datum) - parseDateDe(b.datum));

    if(currentChartFilter === 'last10') chronRounds = chronRounds.slice(-10);
    else if(currentChartFilter === 'last20') chronRounds = chronRounds.slice(-20);

    const labels = chronRounds.map(r => r.datum);
    const sdData = chronRounds.map(r => parseFloat(r.sd));

    const hcpData = [];
    for(let i = 0; i < chronRounds.length; i++) {
        const subRounds = chronRounds.slice(0, i + 1).slice(-20);
        const count = subRounds.length >= 20 ? 8 : Math.max(1, Math.floor(subRounds.length / 2));
        const best = [...subRounds].sort((a,b) => parseFloat(a.sd) - parseFloat(b.sd)).slice(0, count);
        const sum = best.reduce((acc, r) => acc + parseFloat(r.sd), 0);
        hcpData.push(Math.round((sum / best.length) * 10) / 10);
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Handicap Index',
                    data: hcpData,
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#15803d',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'Score Differential (SD)',
                    data: sdData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.4)',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    fill: false,
                    tension: 0.2,
                    pointBackgroundColor: chronRounds.map(r => r.isBest ? '#eab308' : '#cbd5e1'),
                    pointBorderColor: chronRounds.map(r => r.isBest ? '#ca8a04' : '#94a3b8'),
                    pointRadius: chronRounds.map(r => r.isBest ? 6 : 4),
                    pointHoverRadius: 7,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
                    bodyFont: { family: 'Plus Jakarta Sans' },
                    padding: 12,
                    cornerRadius: 10,
                    callbacks: {
                        afterBody: function(items) {
                            const index = items[0].dataIndex;
                            const r = chronRounds[index];
                            if(r) {
                                return `Club: ${r.club_name}\nBrutto: ${r.brutto} (${r.loecher} Löcher)${r.isBest ? '\n★ Gehört zu den Top 8!' : ''}`;
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } }
                },
                y: {
                    reverse: false,
                    grid: { color: 'rgba(226, 232, 240, 0.7)' },
                    ticks: { font: { family: 'JetBrains Mono', size: 11 } }
                }
            }
        }
    });
}

function updateChartFilter(filter) {
    currentChartFilter = filter;
    document.querySelectorAll('.chart-filter-btn').forEach(btn => {
        if(btn.dataset.filter === filter) {
            btn.className = "chart-filter-btn px-3 py-1 rounded-lg bg-white text-slate-900 shadow-xs transition-colors";
        } else {
            btn.className = "chart-filter-btn px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-colors";
        }
    });
    renderChart();
}


// --- NAVIGATION TABS ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
    
    // Desktop Tabs
    document.querySelectorAll('.nav-tab').forEach(el => {
        if(el.dataset.tab === tabId) {
            el.className = "nav-tab active flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap bg-golf-600 text-white shadow-xs";
        } else {
            el.className = "nav-tab flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap text-slate-600 hover:text-slate-900 hover:bg-slate-100";
        }
    });

    // Mobile Bottom Navigation Bar Tabs
    document.querySelectorAll('.mobile-nav-btn').forEach(el => {
        if(el.dataset.tab === tabId) {
            el.className = "mobile-nav-btn active flex flex-col items-center justify-center h-full text-golf-700 font-bold transition-all select-none scale-105";
        } else if(el.dataset.tab) {
            el.className = "mobile-nav-btn flex flex-col items-center justify-center h-full text-slate-400 hover:text-slate-700 font-medium transition-all select-none";
        }
    });

    const activeTab = document.getElementById(`tab-${tabId}`);
    if(activeTab) activeTab.classList.remove('hidden');

    if(tabId === 'dashboard') {
        renderChart();
    }

    // Smoothly scroll to top on mobile tab switch
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openMobileMoreMenu() {
    if(!currentUser) {
        openAuthModal('login');
    } else {
        openProfileModal();
    }
}


// --- TOAST NOTIFICATIONS ---
let toastTimeout = null;
function showToast(msg, icon = "✨") {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    document.getElementById('toast-icon').innerText = icon;

    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    if(toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

