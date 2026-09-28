// --- PROFILE & GDPR (ART. 17 / 20) LOGIC ---
function openProfileModal() {
    if(!currentUser) {
        openAuthModal('login');
        return;
    }
    document.getElementById('pm-username').innerText = currentUser.username || 'Mein Profil';
    document.getElementById('pm-email').innerText = currentUser.email || 'Keine E-Mail hinterlegt';
    document.getElementById('pm-rounds-count').innerText = runden ? runden.length : 0;
    document.getElementById('pm-hcp').innerText = aktuellesHCP !== null ? aktuellesHCP : '--';
    document.getElementById('pm-created-at').innerText = currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString('de-DE') : 'Aktiv';
    document.getElementById('pm-role').innerText = currentUser.is_admin ? '🛡️ Administrator' : '⛳ Golfer';

    const delForm = document.getElementById('del-acc-form');
    if(delForm) delForm.classList.add('hidden');
    const pwInput = document.getElementById('del-acc-password');
    if(pwInput) pwInput.value = '';

    document.getElementById('profile-modal').classList.remove('hidden');
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
}

async function exportUserData() {
    if(!currentUser || !authToken) {
        openAuthModal('login');
        return;
    }
    showToast("Exportiere Benutzerdaten nach Art. 20 DSGVO... ⏳", "📥");
    try {
        const res = await apiFetch('/api/user/export-data');
        if(res.ok && res.data) {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `birdietrack_dsgvo_export_${currentUser.username}_${new Date().toISOString().slice(0,10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast("DSGVO-Daten erfolgreich heruntergeladen! 📥", "✅");
        } else {
            showToast(res.data?.fehler || "Export fehlgeschlagen", "⚠️");
        }
    } catch(e) {
        showToast("Fehler beim Herunterladen: " + e.message, "⚠️");
    }
}

function toggleDeleteAccountForm() {
    const form = document.getElementById('del-acc-form');
    if(form) {
        form.classList.toggle('hidden');
        if(!form.classList.contains('hidden')) {
            const input = document.getElementById('del-acc-password');
            if(input) input.focus();
        }
    }
}

async function confirmDeleteAccount() {
    const pwInput = document.getElementById('del-acc-password');
    const pw = pwInput ? pwInput.value.trim() : '';
    if(!pw) {
        alert("Bitte gib dein Passwort zur Bestätigung ein.");
        return;
    }
    if(!confirm("Bist du ABSOLUT sicher? Dein Konto und alle deine Runden, Scorekarten und Freundschaften werden dauerhaft und unwiderruflich gelöscht!")) {
        return;
    }

    const res = await apiFetch('/api/user/account', 'DELETE', { password: pw });
    if(res.ok) {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('golf_auth');
        closeProfileModal();
        renderAuthHeader();
        await loadData();
        alert("Dein Konto wurde gemäß Art. 17 DSGVO vollständig und dauerhaft gelöscht.");
        showToast("Konto erfolgreich gelöscht. Auf Wiedersehen! 👋", "🗑️");
    } else {
        alert("Fehler beim Löschen des Kontos: " + (res.data?.fehler || "Falsches Passwort"));
    }
}

function openPrivacyModal() {
    document.getElementById('privacy-modal').classList.remove('hidden');
}

function closePrivacyModal() {
    document.getElementById('privacy-modal').classList.add('hidden');
}

function openImprintModal() {
    document.getElementById('imprint-modal').classList.remove('hidden');
}

function closeImprintModal() {
    document.getElementById('imprint-modal').classList.add('hidden');
}


// --- 6. ADMIN AREA LOGIC ---
async function openAdminModal() {
    if(!currentUser || !currentUser.is_admin) {
        showToast("Nur für Administratoren zugänglich.", "🔒");
        return;
    }
    document.getElementById('admin-modal').classList.remove('hidden');
    await loadAdminUsers();
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
}

async function loadAdminUsers() {
    const tbody = document.getElementById('admin-users-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="py-6 text-center text-slate-400">Lade Benutzer...</td></tr>';
    const res = await apiFetch('/api/admin/users');
    if(res.ok && Array.isArray(res.data)) {
        document.getElementById('admin-user-count').innerText = `${res.data.length} Benutzer`;
        tbody.innerHTML = res.data.map(u => `
            <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="py-2.5 px-3 font-mono font-bold text-slate-400">#${u.id}</td>
                <td class="py-2.5 px-3 font-bold text-slate-900">${u.username}</td>
                <td class="py-2.5 px-3 text-slate-600 font-mono text-[11px]">${u.email || '-'}</td>
                <td class="py-2.5 px-2 text-center font-bold text-slate-700">${u.rounds_count}</td>
                <td class="py-2.5 px-2 text-center">
                    <button type="button" onclick="toggleAdminUser(${u.id})" class="px-2 py-0.5 rounded text-[10px] font-bold ${u.is_admin ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}">
                        ${u.is_admin ? '🛡️ Admin' : 'Mitglied'}
                    </button>
                </td>
                <td class="py-2.5 px-3 text-right">
                    ${u.id === currentUser.id ? '<span class="text-[10px] text-slate-400 font-medium">Dein Account</span>' : `
                        <button type="button" onclick="deleteUserAdmin(${u.id}, '${u.username.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] border border-rose-200 transition-all">
                            Löschen
                        </button>
                    `}
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-rose-500 font-semibold">${res.data?.fehler || 'Fehler beim Laden.'}</td></tr>`;
    }
}

async function toggleAdminUser(userId) {
    const res = await apiFetch(`/api/admin/users/${userId}/toggle-admin`, 'POST');
    if(res.ok) {
        showToast(res.data.message || "Rolle aktualisiert", "🛡️");
        await loadAdminUsers();
    } else {
        showToast(res.data?.fehler || "Aktion fehlgeschlagen", "⚠️");
    }
}

async function deleteUserAdmin(userId, username) {
    if(confirm(`Möchtest du das Benutzerkonto "${username}" wirklich unwiderruflich löschen? Alle zugehörigen Runden und Daten werden entfernt.`)) {
        const res = await apiFetch(`/api/admin/users/${userId}`, 'DELETE');
        if(res.ok) {
            showToast(`Benutzer "${username}" erfolgreich gelöscht.`, "🗑️");
            await loadAdminUsers();
        } else {
            showToast(res.data?.fehler || "Fehler beim Löschen", "⚠️");
        }
    }
}

// --- 7. FRIENDS & LEADERBOARD LOGIC ---
function openFriendsModal() {
    document.getElementById('friends-modal').classList.remove('hidden');
    switchFriendsTab('leaderboard');
}

function closeFriendsModal() {
    document.getElementById('friends-modal').classList.add('hidden');
}

function switchFriendsTab(tab) {
    const tabLeaderboard = document.getElementById('friends-subtab-leaderboard');
    const tabFriends = document.getElementById('friends-subtab-friends');
    const btnLeaderboard = document.getElementById('tab-btn-leaderboard');
    const btnFriends = document.getElementById('tab-btn-friends');

    if(tab === 'leaderboard') {
        tabLeaderboard.classList.remove('hidden');
        tabFriends.classList.add('hidden');
        btnLeaderboard.className = "px-4 py-2.5 font-bold text-xs border-b-2 border-golf-600 text-golf-700";
        btnFriends.className = "px-4 py-2.5 font-bold text-xs text-slate-500 hover:text-slate-800";
        loadLeaderboard();
    } else {
        tabLeaderboard.classList.add('hidden');
        tabFriends.classList.remove('hidden');
        btnFriends.className = "px-4 py-2.5 font-bold text-xs border-b-2 border-golf-600 text-golf-700";
        btnLeaderboard.className = "px-4 py-2.5 font-bold text-xs text-slate-500 hover:text-slate-800";
        loadFriends();
    }
}

async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboard-table-body');
    tbody.innerHTML = '<tr><td colspan="4" class="py-6 text-center text-slate-400">Lade Community Rangliste...</td></tr>';
    const res = await apiFetch('/api/leaderboard');
    if(res.ok && Array.isArray(res.data)) {
        if(res.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-slate-400">Noch keine Ranglisten-Einträge vorhanden.</td></tr>';
        } else {
            tbody.innerHTML = res.data.map(u => {
                let medal = `${u.rank}.`;
                if(u.rank === 1) medal = '🥇 1.';
                if(u.rank === 2) medal = '🥈 2.';
                if(u.rank === 3) medal = '🥉 3.';

                return `
                    <tr class="hover:bg-slate-50/70 transition-colors ${u.is_current_user ? 'bg-golf-50/50 font-bold' : ''}">
                        <td class="py-2.5 px-3 text-center font-bold text-slate-700">${medal}</td>
                        <td class="py-2.5 px-3">
                            <div class="flex items-center gap-2">
                                <div class="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                    ${u.username.substring(0, 1).toUpperCase()}
                                </div>
                                <span class="text-slate-900">${u.username}</span>
                                ${u.is_current_user ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-golf-200 text-golf-800 font-bold">Du</span>' : ''}
                            </div>
                        </td>
                        <td class="py-2.5 px-3 text-right font-mono font-black text-golf-700">${u.handicap_index !== null ? u.handicap_index.toFixed(1) : '--'}</td>
                        <td class="py-2.5 px-3 text-center text-slate-500 font-mono">${u.rounds_count}</td>
                    </tr>
                `;
            }).join('');
        }
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-slate-400">Rangliste konnte nicht geladen werden.</td></tr>';
    }
}

async function loadFriends() {
    const listContainer = document.getElementById('friends-list-container');
    const pendingContainer = document.getElementById('friends-pending-container');
    const pendingList = document.getElementById('friends-pending-list');

    if(!currentUser || !authToken) {
        pendingContainer?.classList.add('hidden');
        if(listContainer) {
            listContainer.innerHTML = `
                <div class="py-8 text-center text-slate-500 space-y-3">
                    <div class="text-3xl">👥</div>
                    <div class="font-bold text-slate-700">Golffreunde & Vergleiche</div>
                    <p class="text-xs text-slate-500 max-w-xs mx-auto">Melde dich an, um dich mit deinen Golffreunden zu verbinden und Scores auszutauschen.</p>
                    <button type="button" onclick="openAuthModal('login')" class="px-4 py-2 rounded-xl bg-golf-600 hover:bg-golf-700 text-white font-bold text-xs shadow-xs transition-all">
                        Jetzt anmelden
                    </button>
                </div>
            `;
        }
        return;
    }

    listContainer.innerHTML = '<div class="py-4 text-center text-slate-400">Lade Freunde...</div>';
    const res = await apiFetch('/api/friends');

    if(res.ok && res.data) {
        const friends = res.data.friends || [];
        const pending = res.data.pending_requests || [];

        if(pending.length > 0) {
            pendingContainer.classList.remove('hidden');
            pendingList.innerHTML = pending.map(p => `
                <div class="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                    <span class="font-bold text-slate-800">${p.username} möchte dein Golffreund sein</span>
                    <div class="flex items-center gap-1.5">
                        <button type="button" onclick="respondFriendRequest(${p.id}, 'accepted')" class="px-2.5 py-1 rounded-lg bg-golf-600 text-white font-bold text-[10px]">Annehmen</button>
                        <button type="button" onclick="respondFriendRequest(${p.id}, 'declined')" class="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px]">Ablehnen</button>
                    </div>
                </div>
            `).join('');
        } else {
            pendingContainer.classList.add('hidden');
        }

        if(friends.length === 0) {
            listContainer.innerHTML = '<div class="py-4 text-center text-slate-400">Noch keine Golffreunde hinzugefügt. Suche oben nach einem Benutzernamen!</div>';
        } else {
            listContainer.innerHTML = friends.map(f => `
                <div class="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                            ${f.username.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-bold text-slate-900">${f.username}</div>
                            <div class="text-[10px] text-slate-500 font-mono">HCP: ${f.handicap_index !== null ? f.handicap_index : '--'} • ${f.rounds_count} Runden</div>
                        </div>
                    </div>
                    <button type="button" onclick="removeFriend(${f.id})" class="text-[11px] text-slate-400 hover:text-rose-600 font-semibold">Entfernen</button>
                </div>
            `).join('');
        }
    } else {
        listContainer.innerHTML = '<div class="py-4 text-center text-slate-400">Freundesliste konnte nicht geladen werden.</div>';
    }
}

async function sendFriendRequest() {
    if(!currentUser || !authToken) {
        showToast("Bitte melde dich zuerst an.", "🔒");
        openAuthModal('login');
        return;
    }

    const input = document.getElementById('friend-search-input');
    const targetUsername = input.value.trim();
    if(!targetUsername) return;

    const res = await apiFetch('/api/friends/request', 'POST', { username: targetUsername });
    if(res.ok) {
        showToast(`Freundschaftsanfrage an "${targetUsername}" gesendet!`, "🤝");
        input.value = '';
        await loadFriends();
    } else {
        showToast(res.data?.fehler || "Anfrage fehlgeschlagen.", "⚠️");
    }
}

async function respondFriendRequest(requestId, status) {
    const res = await apiFetch('/api/friends/respond', 'POST', { request_id: requestId, status: status });
    if(res.ok) {
        showToast(status === 'accepted' ? "Freundschaftsanfrage angenommen! 🎉" : "Anfrage abgelehnt.", "🤝");
        await loadFriends();
    }
}

async function removeFriend(friendshipId) {
    if(confirm("Möchtest du diesen Golffreund wirklich entfernen?")) {
        const res = await apiFetch(`/api/friends/${friendshipId}`, 'DELETE');
        if(res.ok) {
            showToast("Freund entfernt.", "👋");
            await loadFriends();
        }
    }
}

