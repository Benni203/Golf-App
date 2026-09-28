// --- PRO GOLF ANALYTICS STATS ---
async function loadProStats() {
    const avgPuttsRoundEl = document.getElementById('dash-avg-putts-round');
    const avgPuttsHoleEl = document.getElementById('dash-avg-putts-hole');
    const girPctEl = document.getElementById('dash-gir-pct');
    const girDetailsEl = document.getElementById('dash-gir-details');
    const firPctEl = document.getElementById('dash-fir-pct');
    const firDetailsEl = document.getElementById('dash-fir-details');

    if(!avgPuttsRoundEl) return;

    if(!currentUser || !authToken) {
        avgPuttsRoundEl.innerText = '--';
        avgPuttsHoleEl.innerText = 'Ø -- Putts pro Loch';
        girPctEl.innerText = '--%';
        girDetailsEl.innerText = '-- Grüns regulär getroffen';
        firPctEl.innerText = '--%';
        firDetailsEl.innerText = 'Tendenz: ⬅️ -- Links | ➡️ -- Rechts';
        return;
    }

    try {
        const res = await apiFetch('/api/user/pro-stats');
        if(res.ok && res.data) {
            const d = res.data;
            avgPuttsRoundEl.innerText = d.avg_putts_round !== null ? d.avg_putts_round : '--';
            avgPuttsHoleEl.innerText = d.avg_putts_hole !== null ? `Ø ${d.avg_putts_hole} Putts pro Loch` : 'Ø -- Putts pro Loch';
            girPctEl.innerText = d.gir_percentage !== null ? `${d.gir_percentage}%` : '--%';
            girDetailsEl.innerText = d.gir_opportunities > 0 ? `${d.total_gir} von ${d.gir_opportunities} Grüns regulär getroffen` : 'Noch keine Grüns erfasst';
            firPctEl.innerText = d.fir_percentage !== null ? `${d.fir_percentage}%` : '--%';
            firDetailsEl.innerText = d.fir_opportunities > 0 ? `Tendenz: ⬅️ ${d.fir_miss_left} Links | ➡️ ${d.fir_miss_right} Rechts` : 'Tendenz: ⬅️ -- Links | ➡️ -- Rechts';
        }
    } catch(e) {
        console.warn("Konnte Pro-Statistiken nicht laden:", e);
    }
}

