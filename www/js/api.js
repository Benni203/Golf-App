
// Determine API Base URL (supports file:, localhost dev ports, and production)
const API_BASE = (function() {
    if (typeof window === 'undefined') return '';
    if (window.location.protocol === 'file:') return 'http://localhost:5000';
    if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port && window.location.port !== '5000') {
        return `http://${window.location.hostname}:5000`;
    }
    return '';
})();

// API Helper with Bearer Token and safe error handling
async function apiFetch(endpoint, method = 'GET', data = null) {
    const headers = { 'Content-Type': 'application/json' };
    if(authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = { method, headers };
    if(data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        options.body = JSON.stringify(data);
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, options);
        let json = null;
        try {
            const text = await res.text();
            if (text && text.trim().length > 0) {
                try {
                    json = JSON.parse(text);
                } catch(parseErr) {
                    json = { fehler: res.ok ? null : (res.status === 429 ? "Zu viele Anfragen. Bitte kurz warten." : `Server-Antwort (Status ${res.status})`), raw: text };
                }
            }
        } catch(readErr) {
            json = null;
        }
        return { ok: res.ok, status: res.status, data: json };
    } catch(err) {
        console.warn(`API-Aufruf an ${endpoint} fehlgeschlagen:`, err);
        return { ok: false, status: 0, error: err.message, data: null };
    }
}

