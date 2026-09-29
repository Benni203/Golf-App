// --- PWA INSTALLATION PROMPT ---
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const banner = document.getElementById('mobile-pwa-install-banner');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (banner && !isStandalone && !localStorage.getItem('birdietrack_dismiss_pwa_banner')) {
        banner.classList.remove('hidden');
    }
});

function isIosDevice() {
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function triggerPwaInstall() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
        showToast("BirdieTrack ist bereits als App installiert! ⛳", "📱");
        return;
    }

    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showToast("BirdieTrack wird auf deinem Gerät installiert! 🎉", "📱");
                const banner = document.getElementById('mobile-pwa-install-banner');
                if (banner) banner.classList.add('hidden');
            }
            deferredInstallPrompt = null;
        });
    } else if (isIosDevice()) {
        alert("📲 So installierst du BirdieTrack auf deinem iPhone / iPad:\n\n1. Tippe unten in Safari auf das Teilen-Symbol (Viereck mit Pfeil nach oben ⎋)\n2. Scrolle im Menü etwas nach unten\n3. Wähle 'Zum Home-Bildschirm' ➕\n4. Tippe oben rechts auf 'Hinzufügen'\n\nFertig! Die App startet direkt im Vollbild ohne Browserleiste!");
    } else {
        alert("📲 So installierst du BirdieTrack als App:\n\nTippe in deinem mobilen Browser auf das Drei-Punkte-Menü (⋮) oben rechts und wähle 'App installieren' oder 'Zum Startbildschirm hinzufügen'.");
    }
}

function dismissPwaBanner() {
    const banner = document.getElementById('mobile-pwa-install-banner');
    if (banner) banner.classList.add('hidden');
    localStorage.setItem('birdietrack_dismiss_pwa_banner', 'true');
}


// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('rec-datum');
    if(dateInput) dateInput.value = today;

    const calcHcpInput = document.getElementById('calc-hcp');
    if(calcHcpInput) calcHcpInput.value = aktuellesHCP;

    // Service Worker Registration for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('BirdieTrack PWA Service Worker aktiv:', reg.scope))
            .catch(err => console.log('Service Worker Registrierung fehlgeschlagen:', err));
    }

    // Online / Offline detection & synchronization (Feature 5)
    window.addEventListener('online', () => {
        const banner = document.getElementById('offline-banner');
        if(banner) banner.classList.add('hidden');
        showToast("Wieder online! Verbindung hergestellt. 🌐", "✅");
        updateHeaderSyncStatus();
        syncOfflineScorecards();
    });

    window.addEventListener('offline', () => {
        const banner = document.getElementById('offline-banner');
        if(banner) banner.classList.remove('hidden');
        showToast("Offline-Modus aktiv – Scorekarten werden lokal gesichert. 📵", "⚠️");
        updateHeaderSyncStatus();
    });

    if(!navigator.onLine) {
        const banner = document.getElementById('offline-banner');
        if(banner) banner.classList.remove('hidden');
    }

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isIosDevice() && !isStandalone && !localStorage.getItem('birdietrack_dismiss_pwa_banner')) {
        const banner = document.getElementById('mobile-pwa-install-banner');
        const textEl = document.getElementById('pwa-install-text');
        if (banner) banner.classList.remove('hidden');
        if (textEl) textEl.innerText = "Tippe auf Teilen ⎋ und 'Zum Home-Bildschirm' ➕ für das echte App-Erlebnis auf dem iPhone.";
    }

    loadData();
    initScorecardHoles();
    updateHeaderSyncStatus();
    syncOfflineScorecards();
});

// --- CLOUD SYNC & OFFLINE STATUS CONTROLLER (Feature 5) ---

function updateHeaderSyncStatus() {
    const btn = document.getElementById('header-sync-btn');
    const dot = document.getElementById('header-sync-dot');
    const text = document.getElementById('header-sync-text');
    if (!btn || !dot || !text) return;

    const isOnline = navigator.onLine;
    let queue = [];
    try {
        queue = JSON.parse(localStorage.getItem('birdietrack_offline_scorecards') || '[]');
    } catch(e) {
        queue = [];
    }

    if (!isOnline) {
        btn.className = "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition-all shadow-2xs group cursor-pointer";
        dot.className = "w-2 h-2 rounded-full bg-amber-500 animate-ping";
        if (queue.length > 0) {
            text.innerText = `Offline (${queue.length} ungesichert)`;
            btn.title = `Offline-Modus aktiv: ${queue.length} Scorekarte(n) lokal auf diesem Gerät gesichert.`;
        } else {
            text.innerText = "Offline-Modus";
            btn.title = "Offline-Modus aktiv: Scorekarten werden automatisch lokal gesichert.";
        }
    } else if (queue.length > 0) {
        btn.className = "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs group cursor-pointer";
        dot.className = "w-2 h-2 rounded-full bg-amber-500 animate-pulse";
        text.innerText = `${queue.length} Sync ausstehend`;
        btn.title = `${queue.length} Scorekarte(n) ausstehend. Klicke hier für sofortigen Sync mit der Cloud!`;
    } else {
        btn.className = "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-2xs group cursor-pointer";
        dot.className = "w-2 h-2 rounded-full bg-emerald-500";
        text.innerText = "Live synchronisiert";
        btn.title = "Cloud-Synchronisation aktiv und auf neuestem Stand (Klicken zum Prüfen)";
    }
}

async function handleManualSyncClick() {
    if (!navigator.onLine) {
        showToast("Gerät ist aktuell offline. Verbindung prüfen! 📵", "⚠️");
        return;
    }

    let queue = [];
    try {
        queue = JSON.parse(localStorage.getItem('birdietrack_offline_scorecards') || '[]');
    } catch(e) {
        queue = [];
    }

    if (queue.length > 0) {
        showToast("Synchronisiere ausstehende Scorekarten... ⏳", "🔄");
        if (typeof syncOfflineScorecards === 'function') {
            await syncOfflineScorecards();
        }
    } else {
        updateHeaderSyncStatus();
        showToast("Alles aktuell! Cloud ist 100% synchronisiert. ⛳", "✅");
    }
}

