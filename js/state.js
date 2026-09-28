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
