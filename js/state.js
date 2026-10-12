// --- APP STATE ---
let clubs = [];
let turniere = [];
let sdErgaenzung = [];
let runden = [];
let aktuellesHCP = null;
let previousHCP = null;
let chartInstance = null;
let currentChartFilter = 'last20';
let entryMode = 'quick'; // 'quick' or 'holes'
let scorecardData = [];
let detectedPdfRounds = [];

// --- CHECK-IN & EXPLORER STATE ---
let activeCheckIn = null; // { clubName, turnier, time, date }
let selectedClubRegionFilter = 'all';
let clubSearchQuery = '';
let filterOnlyTournaments = false;
let clubViewMode = 'cards'; // 'cards' or 'table'

// --- AUTH STATE ---
let currentUser = null;
let authToken = null;
let currentAuthTab = 'login'; // 'login' or 'register'

// --- NEW FEATURES STATE ---
let favoriteClubNames = new Set();
let weatherCache = {};
let currentViewingTournament = null;
let scorecardMode = 'single'; // 'single' or 'flight'
let scPlayerSigPad = null;
let scMarkerSigPad = null;
let scGpsData = null; // { verified, lat, lon, distance_km, token }
let currentFlightData = null;
let scHolesData = [];
let activeScorecardTournament = null;
let activeZoomSigType = null; // 'player' or 'marker'
let zoomSigPad = null;

// --- MOBILE & OUTDOOR SETTINGS STATE (Features A, B, C) ---
let isSunlightMode = localStorage.getItem('golf_sunlight_mode') === 'true';
let isGloveMode = localStorage.getItem('golf_glove_mode') === 'true';
let isHapticEnabled = localStorage.getItem('golf_haptic_enabled') !== 'false'; // default true

function triggerHaptic(type = 'light') {
    if (!('vibrate' in navigator)) return;
    try {
        if (localStorage.getItem('golf_haptic_enabled') === 'false') return;
        if (type === 'light') {
            navigator.vibrate(12);
        } else if (type === 'medium') {
            navigator.vibrate(28);
        } else if (type === 'heavy') {
            navigator.vibrate(45);
        } else if (type === 'par') {
            navigator.vibrate([15, 35, 18]);
        } else if (type === 'birdie') {
            navigator.vibrate([20, 35, 25, 35, 45]);
        } else if (type === 'success') {
            navigator.vibrate([20, 50, 20]);
        }
    } catch(e) {}
}

function applyOutdoorSettings() {
    // 1. Sunlight High-Contrast Mode
    if (isSunlightMode) {
        document.documentElement.classList.add('sunlight-mode');
        document.body?.classList.add('sunlight-mode');
    } else {
        document.documentElement.classList.remove('sunlight-mode');
        document.body?.classList.remove('sunlight-mode');
    }
    const sunlightPill = document.getElementById('sheet-sunlight-status');
    if (sunlightPill) sunlightPill.innerText = isSunlightMode ? 'Aktiv ☀️' : 'Aus';
    const headerSunlightBtn = document.getElementById('header-sunlight-btn');
    if (headerSunlightBtn) {
        headerSunlightBtn.innerHTML = isSunlightMode ? '🕶️' : '☀️';
        headerSunlightBtn.title = isSunlightMode ? 'Normaler Kontrast' : 'Sonnenlicht High-Contrast Modus';
    }
    const scSunlightBtn = document.getElementById('sc-sunlight-toggle-btn');
    if (scSunlightBtn) {
        scSunlightBtn.className = isSunlightMode 
            ? 'px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs' 
            : 'px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 shadow-2xs';
    }

    // 2. Glove Mode (Big Touch Targets)
    if (isGloveMode) {
        document.documentElement.classList.add('glove-mode');
        document.body?.classList.add('glove-mode');
    } else {
        document.documentElement.classList.remove('glove-mode');
        document.body?.classList.remove('glove-mode');
    }
    const glovePill = document.getElementById('sheet-glove-status');
    if (glovePill) glovePill.innerText = isGloveMode ? 'Aktiv 🧤' : 'Aus';
    const scGloveBtn = document.getElementById('sc-glove-toggle-btn');
    if (scGloveBtn) {
        scGloveBtn.className = isGloveMode 
            ? 'px-2.5 py-1 rounded-lg bg-golf-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs' 
            : 'px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 shadow-2xs';
    }

    // 3. Haptic Feedback Status
    const hapticPill = document.getElementById('sheet-haptic-status');
    if (hapticPill) {
        hapticPill.innerText = isHapticEnabled ? 'Aktiv' : 'Deaktiviert';
        hapticPill.className = isHapticEnabled 
            ? 'text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800' 
            : 'text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600';
    }
}

function toggleSunlightMode() {
    isSunlightMode = !isSunlightMode;
    localStorage.setItem('golf_sunlight_mode', isSunlightMode ? 'true' : 'false');
    applyOutdoorSettings();
    triggerHaptic('medium');
    if (typeof showToast === 'function') {
        showToast(isSunlightMode ? 'Sonnenlicht High-Contrast aktiviert! ☀️' : 'Normaler Kontrast aktiv. 🕶️', isSunlightMode ? '☀️' : '🕶️');
    }
}

function toggleGloveMode() {
    isGloveMode = !isGloveMode;
    localStorage.setItem('golf_glove_mode', isGloveMode ? 'true' : 'false');
    applyOutdoorSettings();
    triggerHaptic('medium');
    if (typeof showToast === 'function') {
        showToast(isGloveMode ? 'Handschuh-Modus (XL Tasten) aktiviert! 🧤' : 'Standard Tastengröße aktiv.', '🧤');
    }
}

function toggleHapticFeedback() {
    isHapticEnabled = !isHapticEnabled;
    localStorage.setItem('golf_haptic_enabled', isHapticEnabled ? 'true' : 'false');
    if (isHapticEnabled) triggerHaptic('success');
    applyOutdoorSettings();
    if (typeof showToast === 'function') {
        showToast(isHapticEnabled ? 'Haptische Vibration aktiviert! 📳' : 'Vibration deaktiviert. 🔇', '📳');
    }
}
