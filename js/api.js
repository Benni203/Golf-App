
// Determine API Base URL
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:5000' : '';

// API Helper with Bearer Token
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
        const json = await res.json();
        return { ok: res.ok, status: res.status, data: json };
    } catch(err) {
        console.warn(`API-Aufruf an ${endpoint} fehlgeschlagen:`, err);
        return { ok: false, error: err.message };
    }
}

