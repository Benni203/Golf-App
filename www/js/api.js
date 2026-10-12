// =========================================================================
// API HELPER & AUTOMATIC PORT DISCOVERY
// Supports relative endpoints, local ports 5000/5001, Live Server (5500), file:, and production
// =========================================================================

let API_BASE = (function() {
    if (typeof window === 'undefined') return '';
    // Over file:// protocol, default to local backend port 5000
    if (window.location.protocol === 'file:') return 'http://localhost:5000';
    // If running on a dedicated static dev server (e.g. VS Code Live Server on 5500 or Vite on 3000)
    if (window.location.port === '5500' || window.location.port === '3000') {
        return `http://${window.location.hostname}:5000`;
    }
    // In all other cases (running directly on Flask at localhost:5000, localhost:5001, or in cloud production on Render/Railway):
    // Use relative path ('') so it ALWAYS talks to the exact server that served the application!
    return '';
})();

// Active port discovery cache for file: or static server setups
let verifiedApiBase = null;

// API Helper with Bearer Token and safe error handling
async function apiFetch(endpoint, method = 'GET', data = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (typeof authToken !== 'undefined' && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = { method, headers };
    if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        options.body = JSON.stringify(data);
    }

    const baseToUse = verifiedApiBase !== null ? verifiedApiBase : API_BASE;

    try {
        let res;
        try {
            res = await fetch(`${baseToUse}${endpoint}`, options);
        } catch (fetchErr) {
            // Intelligent fallback for file:// or static server (e.g. if Flask runs on 5001 instead of 5000):
            if (baseToUse.includes(':5000')) {
                const altBase = baseToUse.replace(':5000', ':5001');
                try {
                    res = await fetch(`${altBase}${endpoint}`, options);
                    verifiedApiBase = altBase; // Remember working port!
                } catch (altErr) {
                    throw fetchErr;
                }
            } else if (baseToUse.includes(':5001')) {
                const altBase = baseToUse.replace(':5001', ':5000');
                try {
                    res = await fetch(`${altBase}${endpoint}`, options);
                    verifiedApiBase = altBase;
                } catch (altErr) {
                    throw fetchErr;
                }
            } else {
                throw fetchErr;
            }
        }

        let json = null;
        try {
            const text = await res.text();
            if (text && text.trim().length > 0) {
                try {
                    json = JSON.parse(text);
                } catch (parseErr) {
                    json = { fehler: res.ok ? null : (res.status === 429 ? "Zu viele Anfragen. Bitte kurz warten." : `Server-Antwort (Status ${res.status})`), raw: text };
                }
            }
        } catch (readErr) {
            json = null;
        }
        return { ok: res.ok, status: res.status, data: json };
    } catch (err) {
        console.warn(`API-Aufruf an ${endpoint} fehlgeschlagen:`, err);
        return { ok: false, status: 0, error: err.message, data: null };
    }
}
