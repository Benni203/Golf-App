// --- AUTHENTICATION MODAL & LOGIC ---
function renderAuthHeader() {
    const loggedInView = document.getElementById('auth-logged-in');
    const loggedOutView = document.getElementById('auth-logged-out');

    if(currentUser && authToken) {
        loggedInView.classList.remove('hidden');
        loggedOutView.classList.add('hidden');
        document.getElementById('auth-username-display').innerText = currentUser.username;
        document.getElementById('auth-avatar').innerText = currentUser.username.substring(0, 1).toUpperCase();
        if(currentUser.email) {
            document.getElementById('auth-username-display').title = currentUser.email;
        }
        const adminBtn = document.getElementById('auth-admin-badge');
        if(adminBtn) {
            if(currentUser.is_admin) {
                adminBtn.classList.remove('hidden');
            } else {
                adminBtn.classList.add('hidden');
            }
        }

        const clubBtn = document.getElementById('nav-club-portal-btn');
        if(clubBtn) {
            if(currentUser.role === 'club' || currentUser.is_admin) {
                clubBtn.classList.remove('hidden');
            } else {
                clubBtn.classList.add('hidden');
            }
        }
    } else {
        loggedInView.classList.add('hidden');
        loggedOutView.classList.remove('hidden');
        document.getElementById('auth-admin-badge')?.classList.add('hidden');
        document.getElementById('nav-club-portal-btn')?.classList.add('hidden');
    }
}

function openAuthModal(tab = 'login') {
    const errBox = document.getElementById('auth-error');
    const infoBox = document.getElementById('auth-info');
    if(errBox) errBox.classList.add('hidden');
    if(infoBox) infoBox.classList.add('hidden');
    switchAuthTab(tab);
    document.getElementById('auth-modal')?.classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('auth-modal')?.classList.add('hidden');
    const errBox = document.getElementById('auth-error');
    const infoBox = document.getElementById('auth-info');
    if(errBox) errBox.classList.add('hidden');
    if(infoBox) infoBox.classList.add('hidden');
}

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if(!input) return;
    if(input.type === 'password') {
        input.type = 'text';
        if(icon) icon.innerText = '🙈';
    } else {
        input.type = 'password';
        if(icon) icon.innerText = '👁️';
    }
}

function switchAuthTab(tab) {
    currentAuthTab = tab;
    const tabBar = document.getElementById('auth-tab-bar');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const title = document.getElementById('auth-modal-title');
    const errBox = document.getElementById('auth-error');
    const infoBox = document.getElementById('auth-info');

    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const forgotForm = document.getElementById('auth-forgot-form');
    const resetForm = document.getElementById('auth-reset-form');

    if(errBox) errBox.classList.add('hidden');
    if(tab !== 'reset' && infoBox) {
        infoBox.classList.add('hidden');
    }

    // Hide all 4 forms
    loginForm?.classList.add('hidden');
    registerForm?.classList.add('hidden');
    forgotForm?.classList.add('hidden');
    resetForm?.classList.add('hidden');

    if(tab === 'login') {
        tabBar?.classList.remove('hidden');
        if(tabLogin) tabLogin.className = "flex-1 py-3 text-xs font-bold uppercase tracking-wider text-golf-700 border-b-2 border-golf-600 bg-white transition-all";
        if(tabRegister) tabRegister.className = "flex-1 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-all";
        loginForm?.classList.remove('hidden');
        if(title) title.innerText = "Im Benutzerkonto anmelden";
        setTimeout(() => document.getElementById('auth-login-identifier')?.focus(), 50);
    } else if(tab === 'register') {
        tabBar?.classList.remove('hidden');
        if(tabRegister) tabRegister.className = "flex-1 py-3 text-xs font-bold uppercase tracking-wider text-golf-700 border-b-2 border-golf-600 bg-white transition-all";
        if(tabLogin) tabLogin.className = "flex-1 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-all";
        registerForm?.classList.remove('hidden');
        if(title) title.innerText = "Neues Benutzerkonto registrieren";
        setTimeout(() => document.getElementById('auth-reg-username')?.focus(), 50);
    } else if(tab === 'forgot') {
        tabBar?.classList.add('hidden');
        forgotForm?.classList.remove('hidden');
        if(title) title.innerText = "Passwort vergessen";
        const prevIdent = document.getElementById('auth-login-identifier')?.value.trim();
        const forgotInput = document.getElementById('auth-forgot-identifier');
        if(prevIdent && forgotInput) {
            forgotInput.value = prevIdent;
        }
        setTimeout(() => forgotInput?.focus(), 50);
    } else if(tab === 'reset') {
        tabBar?.classList.add('hidden');
        resetForm?.classList.remove('hidden');
        if(title) title.innerText = "Neues Passwort festlegen";
        setTimeout(() => document.getElementById('auth-reset-code')?.focus(), 50);
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const errBox = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-login-submit-btn');
    if(errBox) errBox.classList.add('hidden');

    const identifier = document.getElementById('auth-login-identifier').value.trim();
    const password = document.getElementById('auth-login-password').value;

    if(!identifier || !password) {
        if(errBox) {
            errBox.innerText = "Bitte E-Mail/Benutzername und Passwort eingeben.";
            errBox.classList.remove('hidden');
        }
        return;
    }

    const origBtnText = submitBtn ? submitBtn.innerText : "Anmelden";
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Anmelden...";
    }

    try {
        let res = await apiFetch('/api/login', 'POST', { identifier, password });

        // RESILIENT SELF-HEALING:
        // If the server restarted/redeployed its container and lost ephemeral SQLite accounts,
        // or if the server is offline, check local known accounts to self-heal seamlessly!
        if (!res.ok && (res.status === 401 || res.status === 404 || res.status === 0)) {
            const knownAccounts = JSON.parse(localStorage.getItem('birdietrack_known_accounts') || '[]');
            const lowIdent = identifier.toLowerCase().trim();
            const matched = knownAccounts.find(a => 
                (a.username && a.username.toLowerCase().trim() === lowIdent) || 
                (a.email && a.email.toLowerCase().trim() === lowIdent)
            );

            if (matched && matched.password === password) {
                console.log("[AUTH] Lokales Konto gefunden. Automatische Synchronisation mit Server...", matched.username);
                // Versuche, das Konto auf dem frischen Server-Container wiederherzustellen
                const reRegRes = await apiFetch('/api/register', 'POST', {
                    username: matched.username,
                    email: matched.email,
                    password: matched.password
                });

                if (reRegRes.ok && reRegRes.data && reRegRes.data.token) {
                    res = reRegRes; // Erfolgreich wiederhergestellt & Token erhalten!
                    showToast(`Konto '${matched.username}' synchronisiert! 🔄`, "✅");
                } else {
                    // Falls das Konto doch schon existierte, erneuter Login
                    const retryLogin = await apiFetch('/api/login', 'POST', { identifier, password });
                    if (retryLogin.ok) res = retryLogin;
                }
            } else if (res.status === 0 && matched && matched.password === password) {
                // Server komplett offline -> Sicherer Offline-Login
                authToken = 'offline_token_' + Date.now();
                currentUser = {
                    id: 999,
                    username: matched.username,
                    email: matched.email,
                    is_admin: false,
                    is_offline: true
                };
                localStorage.setItem('golf_auth', JSON.stringify({ token: authToken, user: currentUser }));
                document.getElementById('auth-login-form')?.reset();
                closeAuthModal();
                renderAuthHeader();
                await loadData();
                showToast(`Offline angemeldet als ${currentUser.username} 📶`, "👤");
                return;
            }
        }

        if(res.ok && res.data && res.data.token) {
            authToken = res.data.token;
            currentUser = res.data.user || {
                id: res.data.id,
                username: res.data.username || identifier,
                email: res.data.email || '',
                is_admin: Boolean(res.data.is_admin)
            };
            localStorage.setItem('golf_auth', JSON.stringify({ token: authToken, user: currentUser }));

            // Speichere/aktualisiere das bekannte Konto lokal
            try {
                const knownAccounts = JSON.parse(localStorage.getItem('birdietrack_known_accounts') || '[]');
                const lowUser = currentUser.username.toLowerCase();
                const existingIdx = knownAccounts.findIndex(a => a.username.toLowerCase() === lowUser || (a.email && a.email.toLowerCase() === (currentUser.email || '').toLowerCase()));
                const accObj = {
                    username: currentUser.username,
                    email: currentUser.email || (identifier.includes('@') ? identifier : ''),
                    password: password,
                    updated_at: Date.now()
                };
                if (existingIdx >= 0) {
                    knownAccounts[existingIdx] = accObj;
                } else {
                    knownAccounts.push(accObj);
                }
                localStorage.setItem('birdietrack_known_accounts', JSON.stringify(knownAccounts));
            } catch(cacheErr) {}

            document.getElementById('auth-login-form')?.reset();
            closeAuthModal();
            renderAuthHeader();
            await loadData();
            showToast(`Willkommen zurück, ${currentUser.username}! ⛳`, "👤");
            if (currentUser && currentUser.role === 'club') {
                switchTab('club-portal');
            }
        } else {
            let errMsg = res.data?.fehler;
            if(!errMsg) {
                if(res.status === 401) {
                    errMsg = "Falscher Benutzername/E-Mail oder falsches Passwort.";
                } else if(res.status === 429) {
                    errMsg = "Zu viele Anmeldeversuche. Bitte warte einen Moment und versuche es erneut.";
                } else if(res.status === 0 || !res.status) {
                    errMsg = "Der Server konnte nicht erreicht werden. Bitte prüfe deine Internetverbindung.";
                } else {
                    errMsg = `Anmeldung fehlgeschlagen (Status ${res.status}). Bitte überprüfe deine Daten.`;
                }
            }

            if(errBox) {
                const isNotFound = errMsg.toLowerCase().includes("nicht gefunden") || errMsg.toLowerCase().includes("kein benutzerkonto");
                if (isNotFound) {
                    errBox.innerHTML = `
                        <div class="space-y-2">
                            <div>${errMsg}</div>
                            <div class="pt-1">
                                <button type="button" onclick="autoFillAndSwitchToRegister('${identifier.replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-lg bg-golf-600 hover:bg-golf-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
                                    <span>➕ Jetzt '${identifier}' als neues Konto registrieren</span>
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    errBox.innerText = errMsg;
                }
                errBox.classList.remove('hidden');
            }
        }
    } catch(err) {
        if(errBox) {
            errBox.innerText = "Verbindung zum Server fehlgeschlagen. Bitte prüfe deine Internetverbindung.";
            errBox.classList.remove('hidden');
        }
    } finally {
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = origBtnText;
        }
    }
}

function autoFillAndSwitchToRegister(ident) {
    switchAuthTab('register');
    const isEmail = ident.includes('@');
    if (isEmail) {
        const emailInput = document.getElementById('auth-reg-email');
        if (emailInput) emailInput.value = ident;
        const userInput = document.getElementById('auth-reg-username');
        if (userInput && !userInput.value) userInput.value = ident.split('@')[0];
    } else {
        const userInput = document.getElementById('auth-reg-username');
        if (userInput) userInput.value = ident;
    }
    const loginPw = document.getElementById('auth-login-password')?.value;
    if (loginPw) {
        const regPw = document.getElementById('auth-reg-password');
        const regPwc = document.getElementById('auth-reg-password-confirm');
        if (regPw) regPw.value = loginPw;
        if (regPwc) regPwc.value = loginPw;
    }
    setTimeout(() => {
        if (!isEmail) {
            document.getElementById('auth-reg-email')?.focus();
        } else {
            document.getElementById('auth-reg-password')?.focus();
        }
    }, 100);
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const errBox = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-reg-submit-btn');
    if(errBox) errBox.classList.add('hidden');

    const username = document.getElementById('auth-reg-username').value.trim();
    const email = document.getElementById('auth-reg-email').value.trim();
    const password = document.getElementById('auth-reg-password').value;
    const passConfirm = document.getElementById('auth-reg-password-confirm').value;

    if(!username || username.length < 3) {
        if(errBox) {
            errBox.innerText = "Benutzername muss mindestens 3 Zeichen lang sein.";
            errBox.classList.remove('hidden');
        }
        return;
    }
    if(!email || !email.includes('@') || !email.includes('.')) {
        if(errBox) {
            errBox.innerText = "Bitte eine gültige E-Mail-Adresse angeben.";
            errBox.classList.remove('hidden');
        }
        return;
    }
    if(!password || password.length < 4) {
        if(errBox) {
            errBox.innerText = "Passwort muss mindestens 4 Zeichen lang sein.";
            errBox.classList.remove('hidden');
        }
        return;
    }
    if(password !== passConfirm) {
        if(errBox) {
            errBox.innerText = "Die Passwörter stimmen nicht überein.";
            errBox.classList.remove('hidden');
        }
        return;
    }

    const origBtnText = submitBtn ? submitBtn.innerText : "Konto erstellen";
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Wird erstellt...";
    }

    try {
        const res = await apiFetch('/api/register', 'POST', { username, email, password });
        if(res.ok && res.data && res.data.token) {
            authToken = res.data.token;
            currentUser = res.data.user;
            localStorage.setItem('golf_auth', JSON.stringify({ token: authToken, user: currentUser }));

            // Speichere bekanntes Konto lokal für nahtlose Wiederherstellung bei Server-Neustarts
            try {
                const knownAccounts = JSON.parse(localStorage.getItem('birdietrack_known_accounts') || '[]');
                const lowUser = username.toLowerCase();
                const existingIdx = knownAccounts.findIndex(a => a.username.toLowerCase() === lowUser || a.email.toLowerCase() === email.toLowerCase());
                const accObj = { username, email, password, updated_at: Date.now() };
                if (existingIdx >= 0) {
                    knownAccounts[existingIdx] = accObj;
                } else {
                    knownAccounts.push(accObj);
                }
                localStorage.setItem('birdietrack_known_accounts', JSON.stringify(knownAccounts));
            } catch(cacheErr) {}

            const migrate = document.getElementById('auth-migrate-local')?.checked;
            if(migrate && runden.length > 0) {
                await apiFetch('/api/runden/batch', 'POST', { runden: runden });
            }

            document.getElementById('auth-register-form')?.reset();
            closeAuthModal();
            await loadData();
            showToast(`Konto erstellt! Willkommen, ${currentUser.username}! ⛳`, "🎉");
            if(typeof confetti === 'function') confetti({ particleCount: 70, spread: 60 });
        } else {
            if(errBox) {
                errBox.innerText = res.data?.fehler || "Registrierung fehlgeschlagen. Bitte versuche es erneut.";
                errBox.classList.remove('hidden');
            }
        }
    } catch(err) {
        if(errBox) {
            errBox.innerText = "Verbindung zum Server fehlgeschlagen.";
            errBox.classList.remove('hidden');
        }
    } finally {
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = origBtnText;
        }
    }
}

async function handleForgotSubmit(e) {
    e.preventDefault();
    const errBox = document.getElementById('auth-error');
    const infoBox = document.getElementById('auth-info');
    const submitBtn = document.getElementById('auth-forgot-submit-btn');
    if(errBox) errBox.classList.add('hidden');

    const identifier = document.getElementById('auth-forgot-identifier').value.trim();
    if(!identifier) {
        if(errBox) {
            errBox.innerText = "Bitte gib deine E-Mail-Adresse oder deinen Benutzernamen ein.";
            errBox.classList.remove('hidden');
        }
        return;
    }

    const origBtnText = submitBtn ? submitBtn.innerText : "Code anfordern";
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Wird angefordert...";
    }

    try {
        const res = await apiFetch('/api/forgot-password', 'POST', { email: identifier });
        if(res.ok) {
            const code = res.data.code;
            const userEmailOrName = res.data.email || identifier;
            const resetIdent = document.getElementById('auth-reset-identifier');
            const resetCode = document.getElementById('auth-reset-code');
            if(resetIdent) resetIdent.value = userEmailOrName;
            if(resetCode && code) resetCode.value = code;

            if(infoBox) {
                if(res.data.email_gesendet) {
                    infoBox.innerHTML = `Ein Bestätigungscode wurde an <strong>${userEmailOrName}</strong> gesendet.<br><span class="text-xs text-emerald-900 font-mono font-bold">Code: ${code}</span> (30 Min. gültig)`;
                } else {
                    infoBox.innerHTML = `Dein 6-stelliger Bestätigungscode lautet:<br><span class="inline-block my-1 text-base font-mono font-bold tracking-widest text-golf-800 bg-golf-50 px-2 py-0.5 rounded border border-golf-200">${code}</span><br><span class="text-[11px] text-slate-500 font-normal">Gültig für 30 Minuten. Gib jetzt dein neues Passwort ein.</span>`;
                }
                infoBox.classList.remove('hidden');
            }

            switchAuthTab('reset');
        } else {
            if(errBox) {
                errBox.innerText = res.data?.fehler || "Anfrage fehlgeschlagen. Überprüfe deine Eingabe.";
                errBox.classList.remove('hidden');
            }
        }
    } catch(err) {
        if(errBox) {
            errBox.innerText = "Verbindung fehlgeschlagen.";
            errBox.classList.remove('hidden');
        }
    } finally {
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = origBtnText;
        }
    }
}

async function handleResetSubmit(e) {
    e.preventDefault();
    const errBox = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-reset-submit-btn');
    if(errBox) errBox.classList.add('hidden');

    const identifier = document.getElementById('auth-reset-identifier').value.trim();
    const code = document.getElementById('auth-reset-code').value.trim();
    const newPassword = document.getElementById('auth-reset-password').value;
    const passConfirm = document.getElementById('auth-reset-password-confirm').value;

    if(!identifier || !code || !newPassword) {
        if(errBox) {
            errBox.innerText = "Bitte fülle alle Pflichtfelder aus (Benutzer/E-Mail, Code und neues Passwort).";
            errBox.classList.remove('hidden');
        }
        return;
    }
    if(newPassword.length < 4) {
        if(errBox) {
            errBox.innerText = "Das Passwort muss mindestens 4 Zeichen lang sein.";
            errBox.classList.remove('hidden');
        }
        return;
    }
    if(newPassword !== passConfirm) {
        if(errBox) {
            errBox.innerText = "Die neuen Passwörter stimmen nicht überein.";
            errBox.classList.remove('hidden');
        }
        return;
    }

    const origBtnText = submitBtn ? submitBtn.innerText : "Passwort speichern";
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Wird gespeichert...";
    }

    try {
        const res = await apiFetch('/api/reset-password', 'POST', {
            email: identifier,
            code: code,
            new_password: newPassword
        });

        if(res.ok && res.data && res.data.token) {
            authToken = res.data.token;
            currentUser = res.data.user;
            localStorage.setItem('golf_auth', JSON.stringify({ token: authToken, user: currentUser }));

            // Aktualisiere das Passwort im lokalen Account-Cache
            try {
                const knownAccounts = JSON.parse(localStorage.getItem('birdietrack_known_accounts') || '[]');
                const lowIdent = identifier.toLowerCase();
                const acc = knownAccounts.find(a => (a.username && a.username.toLowerCase() === lowIdent) || (a.email && a.email.toLowerCase() === lowIdent));
                if (acc) {
                    acc.password = newPassword;
                    acc.updated_at = Date.now();
                } else {
                    knownAccounts.push({
                        username: currentUser.username,
                        email: currentUser.email || (identifier.includes('@') ? identifier : ''),
                        password: newPassword,
                        updated_at: Date.now()
                    });
                }
                localStorage.setItem('birdietrack_known_accounts', JSON.stringify(knownAccounts));
            } catch(cacheErr) {}

            document.getElementById('auth-reset-form')?.reset();
            closeAuthModal();
            await loadData();
            showToast("Passwort erfolgreich geändert! Du bist jetzt angemeldet. 🏌️‍♂️", "🔑");
        } else {
            if(errBox) {
                errBox.innerText = res.data?.fehler || "Passwort-Zurücksetzen fehlgeschlagen.";
                errBox.classList.remove('hidden');
            }
        }
    } catch(err) {
        if(errBox) {
            errBox.innerText = "Verbindung fehlgeschlagen.";
            errBox.classList.remove('hidden');
        }
    } finally {
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = origBtnText;
        }
    }
}

async function handleLogout() {
    if(confirm("Möchtest du dich wirklich abmelden?")) {
        try {
            await apiFetch('/api/logout', 'POST');
        } catch(e) {}
        authToken = null;
        currentUser = null;
        localStorage.removeItem('golf_auth');

        // Clear all auth inputs in the DOM
        document.getElementById('auth-login-form')?.reset();
        document.getElementById('auth-register-form')?.reset();
        document.getElementById('auth-forgot-form')?.reset();
        document.getElementById('auth-reset-form')?.reset();

        // Reset password input types and eye icons
        ['auth-login-password', 'auth-reg-password', 'auth-reg-password-confirm', 'auth-reset-password', 'auth-reset-password-confirm'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.type = 'password';
        });
        ['eye-login-pw', 'eye-reg-pw', 'eye-reg-confirm', 'eye-reset-pw', 'eye-reset-confirm'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.innerText = '👁️';
        });

        renderAuthHeader();
        await loadData();
        showToast("Erfolgreich abgemeldet.", "👋");
    }
}

// --- APP VERSION MODAL ---
function openVersionModal() {
    const modal = document.getElementById('version-modal');
    if(modal) modal.classList.remove('hidden');
    apiFetch('/api/version').then(res => {
        if(res.ok && res.data) {
            const numEl = document.getElementById('version-modal-number');
            if(numEl) numEl.innerText = `v${res.data.version}`;
        }
    }).catch(() => {});
}

function closeVersionModal() {
    const modal = document.getElementById('version-modal');
    if(modal) modal.classList.add('hidden');
}

// --- PROFILE DIRECT PASSWORD CHANGE ---
function toggleProfilePasswordForm() {
    const container = document.getElementById('pm-password-container');
    const errBox = document.getElementById('pm-pw-error');
    const successBox = document.getElementById('pm-pw-success');
    if(!container) return;
    const isHidden = container.classList.contains('hidden');
    if(isHidden) {
        container.classList.remove('hidden');
        if(errBox) errBox.classList.add('hidden');
        if(successBox) successBox.classList.add('hidden');
        document.getElementById('pm-password-form')?.reset();
        setTimeout(() => document.getElementById('pm-old-password')?.focus(), 50);
    } else {
        container.classList.add('hidden');
    }
}

async function handleProfilePasswordChange(e) {
    e.preventDefault();
    const oldPassword = document.getElementById('pm-old-password').value;
    const newPassword = document.getElementById('pm-new-password').value;
    const confirmPassword = document.getElementById('pm-new-password-confirm').value;
    const errBox = document.getElementById('pm-pw-error');
    const successBox = document.getElementById('pm-pw-success');
    const submitBtn = document.getElementById('pm-pw-submit-btn');

    if(errBox) errBox.classList.add('hidden');
    if(successBox) successBox.classList.add('hidden');

    if(!oldPassword || !newPassword) {
        if(errBox) {
            errBox.innerText = "Bitte fülle alle Pflichtfelder aus.";
            errBox.classList.remove('hidden');
        }
        return;
    }
    if(newPassword.length < 4) {
        if(errBox) {
            errBox.innerText = "Das neue Passwort muss mindestens 4 Zeichen lang sein.";
            errBox.classList.remove('hidden');
        }
        return;
    }
    if(newPassword !== confirmPassword) {
        if(errBox) {
            errBox.innerText = "Die neuen Passwörter stimmen nicht überein.";
            errBox.classList.remove('hidden');
        }
        return;
    }

    const origBtnText = submitBtn ? submitBtn.innerText : "Passwort aktualisieren";
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Wird gespeichert...";
    }

    try {
        const res = await apiFetch('/api/user/change-password', 'POST', {
            old_password: oldPassword,
            new_password: newPassword
        });

        if(res.ok) {
            if(successBox) {
                successBox.innerText = res.data?.nachricht || "Passwort erfolgreich aktualisiert!";
                successBox.classList.remove('hidden');
            }
            document.getElementById('pm-password-form')?.reset();
            showToast("Passwort erfolgreich aktualisiert! 🔑", "✅");
            setTimeout(() => {
                toggleProfilePasswordForm();
            }, 1800);
        } else {
            if(errBox) {
                errBox.innerText = res.data?.fehler || "Passwortänderung fehlgeschlagen.";
                errBox.classList.remove('hidden');
            }
        }
    } catch(err) {
        if(errBox) {
            errBox.innerText = "Verbindungsfehler. Bitte erneut versuchen.";
            errBox.classList.remove('hidden');
        }
    } finally {
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = origBtnText;
        }
    }
}

