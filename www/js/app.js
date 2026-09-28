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

    // Online / Offline detection & synchronization
    window.addEventListener('online', () => {
        const banner = document.getElementById('offline-banner');
        if(banner) banner.classList.add('hidden');
        showToast("Wieder online! Verbindung hergestellt. 🌐", "✅");
        syncOfflineScorecards();
    });

    window.addEventListener('offline', () => {
        const banner = document.getElementById('offline-banner');
        if(banner) banner.classList.remove('hidden');
        showToast("Offline-Modus aktiv – Scorekarten werden lokal gesichert. 📵", "⚠️");
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
    syncOfflineScorecards();
});
