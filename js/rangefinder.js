// --- GPS RANGEFINDER & CLUB RECOMMENDATIONS ---
let rfSelectedHole = 1;

function onRangefinderHoleSelect(holeVal) {
    rfSelectedHole = parseInt(holeVal, 10) || 1;
    updateRangefinderGPS();
}

function updateRangefinderGPS() {
    const btn = document.querySelector('#sc-rangefinder-box button');
    if(btn) btn.innerHTML = "<span>📡 Messe...</span>";

    const holeIdx = (rfSelectedHole - 1);
    const par = (scHolesData[holeIdx] && scHolesData[holeIdx].par) ? scHolesData[holeIdx].par : (DEFAULT_HOLE_PARS[holeIdx % DEFAULT_HOLE_PARS.length] || 4);

    if(!navigator.geolocation) {
        if(btn) btn.innerHTML = "<span>🔄 Distanz messen</span>";
        const simMeters = par === 3 ? 145 : par === 4 ? 160 : 190;
        applyRangefinderDistances(simMeters);
        showToast(`GPS nicht verfügbar. Demo-Distanz: ${simMeters} m`, "🎯");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            if(btn) btn.innerHTML = "<span>🔄 Distanz messen</span>";
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const clubName = document.getElementById('sc-club-select').value;
            const club = clubs.find(c => c.name === clubName) || clubs[0];

            let centerMeters = par === 3 ? 148 : par === 4 ? 162 : 185;

            if(club && club.lat && club.lon) {
                const R = 6371.0;
                const dLat = (club.lat - lat) * Math.PI / 180.0;
                const dLon = (club.lon - lon) * Math.PI / 180.0;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                          Math.cos(lat * Math.PI / 180.0) * Math.cos(club.lat * Math.PI / 180.0) *
                          Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distKm = R * c;

                if(distKm <= 3.5) {
                    centerMeters = par === 3 ? 145 : par === 4 ? 158 : 188;
                } else {
                    centerMeters = par === 3 ? 140 : par === 4 ? 165 : 195;
                }
            }

            applyRangefinderDistances(centerMeters);
            showToast(`Grün-Distanz für Loch ${rfSelectedHole}: ${centerMeters} m`, "🎯");
        },
        (err) => {
            if(btn) btn.innerHTML = "<span>🔄 Distanz messen</span>";
            const simMeters = par === 3 ? 145 : par === 4 ? 160 : 190;
            applyRangefinderDistances(simMeters);
            showToast(`Distanz (Fallback): ${simMeters} m`, "🎯");
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

function applyRangefinderDistances(centerMeters) {
    const front = Math.max(10, centerMeters - 14);
    const back = centerMeters + 14;

    const frontEl = document.getElementById('rf-front-dist');
    const centerEl = document.getElementById('rf-center-dist');
    const backEl = document.getElementById('rf-back-dist');
    const clubEl = document.getElementById('rf-club-recommendation');

    if(frontEl) frontEl.innerText = `${front} m`;
    if(centerEl) centerEl.innerText = `${centerMeters} m`;
    if(backEl) backEl.innerText = `${back} m`;
    if(clubEl) clubEl.innerText = getClubRecommendation(centerMeters);
}

function getClubRecommendation(meters) {
    if(meters >= 210) return "Driver 🏌️ / Holz 3";
    if(meters >= 185) return "Holz 5 / Hybrid 🚀";
    if(meters >= 170) return "Eisen 5 🎯";
    if(meters >= 155) return "Eisen 6 🎯";
    if(meters >= 140) return "Eisen 7 🎯";
    if(meters >= 125) return "Eisen 8 🎯";
    if(meters >= 110) return "Eisen 9 🎯";
    if(meters >= 85) return "Pitching Wedge (PW) ⛳";
    if(meters >= 60) return "Sand Wedge (SW) ⛳";
    return "Lob Wedge / Chip ⛳";
}

