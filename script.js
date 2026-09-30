/**
 * SIWES CYBERSECURITY AWARENESS PLATFORM
 * Core Functional Logic & Interactive Tools
 */

// ==========================================
// 1. Audio System (Web Audio API Synthesizer)
// ==========================================
const SoundFX = {
    enabled: localStorage.getItem('cyber_sound_enabled') !== 'false',
    ctx: null,

    init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('cyber_sound_enabled', this.enabled);
        this.updateBtnUI();
        if (this.enabled) {
            this.playSuccess();
            Toast.show('Cyber Audio Enabled', 'info');
        } else {
            Toast.show('Audio Muted', 'info');
        }
    },

    updateBtnUI() {
        const btns = document.querySelectorAll('.sound-toggle-btn');
        btns.forEach(btn => {
            if (this.enabled) {
                btn.innerHTML = `
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                `;
                btn.setAttribute('title', 'Mute Sound Effects');
            } else {
                btn.innerHTML = `
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                `;
                btn.setAttribute('title', 'Enable Sound Effects');
            }
        });
    },

    playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.05) {
        if (!this.enabled) return;
        try {
            this.init();
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            if (!this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Audio error silently handled
        }
    },

    playClick() {
        this.playTone(800, 'sine', 0.05, 0.04);
    },

    playSuccess() {
        if (!this.enabled) return;
        setTimeout(() => this.playTone(523.25, 'triangle', 0.08, 0.04), 0);
        setTimeout(() => this.playTone(659.25, 'triangle', 0.08, 0.04), 70);
        setTimeout(() => this.playTone(783.99, 'triangle', 0.14, 0.04), 140);
    },

    playWarning() {
        if (!this.enabled) return;
        setTimeout(() => this.playTone(280, 'sawtooth', 0.12, 0.05), 0);
        setTimeout(() => this.playTone(220, 'sawtooth', 0.16, 0.05), 110);
    }
};

// ==========================================
// 2. Toast Notification System
// ==========================================
const Toast = {
    container: null,

    init() {
        let el = document.getElementById('toast-container');
        if (!el) {
            el = document.createElement('div');
            el.id = 'toast-container';
            document.body.appendChild(el);
        }
        this.container = el;
    },

    show(message, type = 'info', duration = 3200) {
        this.init();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'ℹ️';
        if (type === 'success') icon = '✓';
        if (type === 'warning') icon = '⚠️';
        if (type === 'danger') icon = '✕';

        toast.innerHTML = `<span style="font-weight:700;">${icon}</span> <span>${message}</span>`;
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// ==========================================
// 3. Theme Manager (Dark / Light Mode)
// ==========================================
const ThemeManager = {
    theme: localStorage.getItem('cyber_theme') || 'dark',

    init() {
        this.applyTheme(this.theme);
        const btns = document.querySelectorAll('.theme-toggle-btn');
        btns.forEach(b => {
            b.addEventListener('click', () => {
                SoundFX.playClick();
                this.toggle();
            });
        });
    },

    applyTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('cyber_theme', theme);
        this.updateBtnUI();
    },

    toggle() {
        const next = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(next);
        Toast.show(`Switched to ${next.toUpperCase()} mode`, 'info');
    },

    updateBtnUI() {
        const btns = document.querySelectorAll('.theme-toggle-btn');
        btns.forEach(btn => {
            if (this.theme === 'dark') {
                btn.innerHTML = `
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                `;
                btn.setAttribute('title', 'Switch to Light Mode');
            } else {
                btn.innerHTML = `
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                `;
                btn.setAttribute('title', 'Switch to Dark Cyber Mode');
            }
        });
    }
};

// ==========================================
// 4. Mobile Navigation & General UI
// ==========================================
function setupMobileNav() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            SoundFX.playClick();
            navLinks.classList.toggle('open');
        });
        // Close nav when clicking a link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('open'));
        });
    }
}

// Terminal typewriter effect for hero
function setupTerminalTypewriter() {
    const cursor = document.getElementById('typed-cmd');
    if (!cursor) return;
    const commands = [
        'generate --length 20 --mixed',
        'check --url paypal.com.security.net',
        'audit --mode personal-hygiene',
        'scan --phishing-indicators inbox'
    ];
    let ci = 0;
    function typeCmd(cmd) {
        cursor.innerHTML = '<span class="t-cursor"></span>';
        let i = 0;
        const interval = setInterval(() => {
            if (i < cmd.length) {
                cursor.textContent = cmd.slice(0, ++i);
                cursor.insertAdjacentHTML('beforeend', '<span class="t-cursor"></span>');
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    ci = (ci + 1) % commands.length;
                    typeCmd(commands[ci]);
                }, 2800);
            }
        }, 60);
    }
    setTimeout(() => typeCmd(commands[ci]), 1200);
}

// Security Tips Rotation
const SECURITY_TIPS = [
    "Never reuse passwords across personal and academic or work accounts.",
    "Hover over links before clicking to inspect the true destination URL in your browser's bottom corner.",
    "Always turn on Multi-Factor Authentication (MFA/2FA) on your email and banking accounts.",
    "Public Wi-Fi networks in cafes or airports can be intercepted; use a trusted VPN.",
    "Legitimate organizations will never ask for your password or PIN via SMS or unsolicited email.",
    "Keep your operating system and web browser updated automatically to patch zero-day vulnerabilities.",
    "Back up your crucial data following the 3-2-1 rule: 3 copies, 2 media types, 1 offsite/cloud."
];

function setupTipRotator() {
    const tipTextEl = document.getElementById('daily-tip-text');
    const shuffleBtn = document.getElementById('shuffle-tip-btn');
    if (!tipTextEl) return;

    let currentIndex = 0;
    const updateTip = (idx) => {
        tipTextEl.textContent = SECURITY_TIPS[idx % SECURITY_TIPS.length];
    };

    updateTip(currentIndex);

    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            SoundFX.playClick();
            currentIndex = (currentIndex + 1) % SECURITY_TIPS.length;
            updateTip(currentIndex);
            Toast.show('Next cybersecurity tip loaded!', 'info');
        });
    }
}

// ==========================================
// 5. Interactive Checklist System
// ==========================================
function setupChecklists(checklistId, storageKey) {
    const container = document.getElementById(checklistId);
    if (!container) return;

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const progressFill = document.getElementById(`${checklistId}-progress-fill`);
    const progressText = document.getElementById(`${checklistId}-progress-text`);

    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch (e) {
        saved = {};
    }

    function update() {
        let total = checkboxes.length;
        let checked = 0;

        checkboxes.forEach((cb, idx) => {
            const item = cb.closest('.check-item');
            if (cb.checked) {
                checked++;
                item?.classList.add('done');
                saved[idx] = true;
            } else {
                item?.classList.remove('done');
                saved[idx] = false;
            }
        });

        localStorage.setItem(storageKey, JSON.stringify(saved));

        const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressText) progressText.textContent = `${checked} / ${total}`;

        if (pct === 100 && total > 0) {
            SoundFX.playSuccess();
            Toast.show('All items completed — great security posture!', 'success');
        }
    }

    checkboxes.forEach((cb, idx) => {
        if (saved[idx]) {
            cb.checked = true;
        }
        cb.addEventListener('change', () => {
            SoundFX.playClick();
            update();
        });
    });

    update();
}

// ==========================================
// 6. Password Security Tools (passwords.html)
// ==========================================
function setupPasswordSuite() {
    const input = document.getElementById('pwd-input');
    if (!input) return;

    const fill = document.getElementById('pwd-meter-fill');
    const statusText = document.getElementById('pwd-status-text');
    const entropyVal = document.getElementById('pwd-entropy-val');
    const crackTimeVal = document.getElementById('pwd-crack-time-val');
    const lengthVal = document.getElementById('pwd-length-val');
    const toggleBtn = document.getElementById('toggle-pwd-vis');

    // Rule items
    const ruleLen = document.getElementById('rule-len');
    const ruleUpper = document.getElementById('rule-upper');
    const ruleLower = document.getElementById('rule-lower');
    const ruleNum = document.getElementById('rule-num');
    const ruleSym = document.getElementById('rule-sym');
    const ruleCommon = document.getElementById('rule-common');

    const commonPasswords = [
        'password', '123456', '12345678', 'qwerty', 'admin', 'welcome',
        'football', 'iloveyou', 'monkey', 'secret', 'pass123', 'cybersecurity'
    ];

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            SoundFX.playClick();
            if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.textContent = '🔒 Hide';
            } else {
                input.type = 'password';
                toggleBtn.textContent = '👁️ Show';
            }
        });
    }

    function evaluatePassword(pwd) {
        const len = pwd.length;
        if (lengthVal) lengthVal.textContent = `${len} chars`;

        if (len === 0) {
            if (fill) { fill.style.width = '0%'; fill.style.backgroundColor = 'transparent'; }
            if (statusText) statusText.textContent = 'Enter a password above';
            if (entropyVal) entropyVal.textContent = '0 bits';
            if (crackTimeVal) crackTimeVal.textContent = 'Instant';
            [ruleLen, ruleUpper, ruleLower, ruleNum, ruleSym, ruleCommon].forEach(el => el?.classList.remove('valid'));
            return;
        }

        const hasLen = len >= 12;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNum = /[0-9]/.test(pwd);
        const hasSym = /[^A-Za-z0-9]/.test(pwd);
        const isCommon = commonPasswords.some(common => pwd.toLowerCase().includes(common));

        if (ruleLen) ruleLen.classList.toggle('valid', hasLen);
        if (ruleUpper) ruleUpper.classList.toggle('valid', hasUpper);
        if (ruleLower) ruleLower.classList.toggle('valid', hasLower);
        if (ruleNum) ruleNum.classList.toggle('valid', hasNum);
        if (ruleSym) ruleSym.classList.toggle('valid', hasSym);
        if (ruleCommon) ruleCommon.classList.toggle('valid', !isCommon && len >= 6);

        // Character pool calculation for Shannon Entropy
        let pool = 0;
        if (hasLower) pool += 26;
        if (hasUpper) pool += 26;
        if (hasNum) pool += 10;
        if (hasSym) pool += 33;
        if (pool === 0) pool = 10;

        const entropy = Math.round(len * Math.log2(pool));
        if (entropyVal) entropyVal.textContent = `${entropy} bits`;

        // Calculate score
        let score = 0;
        if (len >= 8) score += 15;
        if (len >= 12) score += 20;
        if (len >= 16) score += 15;
        if (hasLower && hasUpper) score += 15;
        if (hasNum) score += 15;
        if (hasSym) score += 20;
        if (isCommon) score = Math.max(5, score - 50);

        score = Math.min(100, Math.max(5, score));

        // Crack time estimate based on 100 Billion guesses/sec (GPU cluster)
        const guessesPerSec = 1e11;
        const combinations = Math.pow(pool, len);
        const secondsToCrack = (combinations / 2) / guessesPerSec;

        let crackTime = 'Instant';
        if (isCommon) {
            crackTime = 'Instant (Common Word)';
        } else if (secondsToCrack < 1) {
            crackTime = '< 1 Second';
        } else if (secondsToCrack < 60) {
            crackTime = `${Math.round(secondsToCrack)} Seconds`;
        } else if (secondsToCrack < 3600) {
            crackTime = `${Math.round(secondsToCrack / 60)} Minutes`;
        } else if (secondsToCrack < 86400) {
            crackTime = `${Math.round(secondsToCrack / 3600)} Hours`;
        } else if (secondsToCrack < 31536000) {
            crackTime = `${Math.round(secondsToCrack / 86400)} Days`;
        } else if (secondsToCrack < 31536000 * 100) {
            crackTime = `${Math.round(secondsToCrack / 31536000)} Years`;
        } else if (secondsToCrack < 31536000 * 1e6) {
            crackTime = `${(secondsToCrack / (31536000 * 1e3)).toFixed(1)}k Centuries`;
        } else {
            crackTime = 'Millions of Years';
        }

        if (crackTimeVal) crackTimeVal.textContent = crackTime;

        // Visual Fill & Status Text
        if (fill) {
            fill.style.width = `${score}%`;
            if (score < 40) {
                fill.style.backgroundColor = 'var(--accent-rose)';
                if (statusText) statusText.innerHTML = '<span style="color:var(--accent-rose);">⚠️ Weak Password</span>';
            } else if (score < 70) {
                fill.style.backgroundColor = 'var(--accent-amber)';
                if (statusText) statusText.innerHTML = '<span style="color:var(--accent-amber);">⚡ Moderate Strength</span>';
            } else if (score < 90) {
                fill.style.backgroundColor = 'var(--accent-emerald)';
                if (statusText) statusText.innerHTML = '<span style="color:var(--accent-emerald);">🛡️ Strong Password</span>';
            } else {
                fill.style.backgroundColor = 'var(--accent-cyan)';
                if (statusText) statusText.innerHTML = '<span style="color:var(--accent-cyan);">💎 Ultra Formidable</span>';
            }
        }
    }

    input.addEventListener('input', () => {
        evaluatePassword(input.value);
    });

    // Password Generator
    const genLengthSlider = document.getElementById('gen-len-slider');
    const genLengthDisplay = document.getElementById('gen-len-display');
    const optUpper = document.getElementById('gen-opt-upper');
    const optLower = document.getElementById('gen-opt-lower');
    const optNum = document.getElementById('gen-opt-num');
    const optSym = document.getElementById('gen-opt-sym');
    const optAvoidAmbiguous = document.getElementById('gen-opt-no-ambig');
    const genBtn = document.getElementById('generate-pwd-btn');
    const copyBtn = document.getElementById('copy-pwd-btn');
    const testGenBtn = document.getElementById('test-gen-pwd-btn');

    if (genLengthSlider && genLengthDisplay) {
        genLengthSlider.addEventListener('input', () => {
            genLengthDisplay.textContent = genLengthSlider.value;
        });
    }

    function generateSecurePassword() {
        const len = parseInt(genLengthSlider ? genLengthSlider.value : '16', 10);
        let chars = '';
        let guaranteed = [];

        let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
        let numChars = '0123456789';
        let symChars = '!@#$%^&*()_+~|}{[]:;?><,.-=';

        if (optAvoidAmbiguous && optAvoidAmbiguous.checked) {
            upperChars = upperChars.replace(/[IO]/g, '');
            lowerChars = lowerChars.replace(/[lo]/g, '');
            numChars = numChars.replace(/[01]/g, '');
            symChars = symChars.replace(/[|()]/g, '');
        }

        if (optUpper && optUpper.checked) {
            chars += upperChars;
            guaranteed.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
        }
        if (optLower && optLower.checked) {
            chars += lowerChars;
            guaranteed.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
        }
        if (optNum && optNum.checked) {
            chars += numChars;
            guaranteed.push(numChars[Math.floor(Math.random() * numChars.length)]);
        }
        if (optSym && optSym.checked) {
            chars += symChars;
            guaranteed.push(symChars[Math.floor(Math.random() * symChars.length)]);
        }

        if (chars.length === 0) {
            chars = lowerChars + numChars;
        }

        let pwdArr = [...guaranteed];
        for (let i = pwdArr.length; i < len; i++) {
            const randIndex = Math.floor(Math.random() * chars.length);
            pwdArr.push(chars[randIndex]);
        }

        // Shuffle array
        for (let i = pwdArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pwdArr[i], pwdArr[j]] = [pwdArr[j], pwdArr[i]];
        }

        const result = pwdArr.join('');
        const outputBox = document.getElementById('generated-pwd-output');
        if (outputBox) {
            outputBox.value = result;
        }
        SoundFX.playSuccess();
        return result;
    }

    if (genBtn) {
        genBtn.addEventListener('click', () => {
            generateSecurePassword();
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const outputBox = document.getElementById('generated-pwd-output');
            if (outputBox && outputBox.value) {
                navigator.clipboard.writeText(outputBox.value).then(() => {
                    SoundFX.playSuccess();
                    Toast.show('Secure password copied to clipboard!', 'success');
                }).catch(() => {
                    outputBox.select();
                    document.execCommand('copy');
                    Toast.show('Password copied!', 'success');
                });
            } else {
                Toast.show('Generate a password first!', 'warning');
            }
        });
    }

    if (testGenBtn) {
        testGenBtn.addEventListener('click', () => {
            const outputBox = document.getElementById('generated-pwd-output');
            if (outputBox && outputBox.value) {
                input.value = outputBox.value;
                evaluatePassword(input.value);
                SoundFX.playClick();
                Toast.show('Loaded generated password into strength analyzer!', 'info');
                input.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Initialize with a default generated password
    generateSecurePassword();
}

// ==========================================
// 7. Phishing Simulator & Inspector (phishing.html)
// ==========================================
const PHISHING_SCENARIOS = [
    {
        id: 'office365',
        tabTitle: 'Scenario 1: Office 365',
        senderName: 'Microsoft Security Team',
        senderEmail: 'support@account-update-mssecurity365.com',
        isPhish: true,
        subject: 'URGENT: Password Expiry & Immediate Account Suspension Notice',
        date: 'Today, 09:14 AM',
        body: `
            <p>Dear Valued User,</p>
            <p>Your institutional Microsoft 365 account password will expire within <strong>2 hours</strong>. Due to suspicious unauthorized login attempts from a remote IP (Russia), access to your email and files will be permanently locked unless verified immediately.</p>
            <p>To retain uninterrupted access, click the secure verification portal below and confirm your current credentials:</p>
            <p style="margin: 20px 0;">
                <a href="#fakelink" class="btn btn-primary" onclick="event.preventDefault(); Toast.show('Simulated link: http://login.microsoft.com.verify-access-hub.net', 'warning');">Verify & Keep Password Now</a>
            </p>
            <p style="font-size:12px; color:var(--text-muted);">Microsoft Cloud Security Operations | Automated Notification</p>
        `,
        redFlags: [
            "Deceptive Sender Address: Domain is 'account-update-mssecurity365.com', NOT the authentic 'microsoft.com'.",
            "Artificial Urgency: Pressuring the victim with a '2 hour' deadline to bypass critical thinking.",
            "Generic Greeting: 'Dear Valued User' instead of your official name or institutional email.",
            "Spoofed Hyperlink: The button points to a deceptive third-party credential harvester (verify-access-hub.net)."
        ]
    },
    {
        id: 'bankalert',
        tabTitle: 'Scenario 2: Bank Alert',
        senderName: 'Apex Trust Bank Fraud Dept',
        senderEmail: 'alerts@secure-apextrust-verification.co',
        isPhish: true,
        subject: 'SECURITY WARNING: $2,840.00 Wire Transfer Pending Your Authorization',
        date: 'Yesterday, 04:32 PM',
        body: `
            <p>Apex Online Security Alert,</p>
            <p>A debit transaction of <strong>$2,840.00 USD</strong> to 'Global Crypto Trade LLC' was initiated on your checking account ending in [****].</p>
            <p>If you did <strong>NOT</strong> authorize this transaction, cancel it immediately to avoid irrevocable forfeiture of funds:</p>
            <p style="margin: 20px 0;">
                <a href="#fakelink" class="btn btn-danger" onclick="event.preventDefault(); Toast.show('Simulated link: http://apextrustbank.cancel-transfer.top', 'warning');">CANCEL UNAUTHORIZED TRANSFER</a>
            </p>
            <p>Or call our instant verification toll line: 1-800-FAKE-FRAUD.</p>
        `,
        redFlags: [
            "Fear & Panic Tactic: Uses a large fraudulent monetary sum to cause impulsive action.",
            "Mismatched Bank Domain: Legitimate banks use their primary registered domains, never newly registered '.co' or '.top' subdomains.",
            "Absence of Personal Account Info: Mentions an empty generic placeholder '[****]' because attackers do not know your real account number.",
            "Unsolicited Cancellation Link: Leads directly to an online banking credential-harvesting clone."
        ]
    },
    {
        id: 'hrbonus',
        tabTitle: 'Scenario 3: HR Benefits',
        senderName: 'Human Resources Management',
        senderEmail: 'hr-dept@company-internal-updates.online',
        isPhish: true,
        subject: 'Confidential: Revised Q3 Salary Adjustments and Bonus Schedule (PDF)',
        date: 'Oct 14, 11:20 AM',
        body: `
            <p>Good morning Team,</p>
            <p>Executive leadership has approved retroactive inflation bonuses and revised health stipend structures for all qualifying personnel.</p>
            <p>Please review the enclosed confidential schedule document to verify your updated compensation figures and deposit routing:</p>
            <div style="background:var(--bg-input); padding:12px; border:1px solid var(--border-subtle); border-radius:6px; margin:16px 0; display:inline-flex; align-items:center; gap:10px;">
                <span>📄</span>
                <div>
                    <div style="font-weight:600; font-size:13px;">Q3_Compensation_Adjustment_Final.pdf.exe</div>
                    <div style="font-size:11px; color:var(--text-muted);">Size: 428 KB | Executable Application</div>
                </div>
            </div>
            <p>All discrepancies must be flagged before end of business Friday.</p>
        `,
        redFlags: [
            "Double File Extension: The attachment masquerades as a PDF but is actually 'pdf.exe'—a malicious malware executable!",
            "Emotional Curiosity / Greed Trigger: Entices victims with unexpected financial rewards to provoke downloads.",
            "Lookalike Sender Domain: Unofficial external domain '.online' posing as company HR."
        ]
    },
    {
        id: 'university',
        tabTitle: 'Scenario 4: Campus IT Bulletin',
        senderName: 'University IT Services',
        senderEmail: 'it-support@university.edu.ng',
        isPhish: false,
        subject: 'Scheduled Campus Wi-Fi Maintenance Window - Saturday 2:00 AM',
        date: 'Oct 18, 02:15 PM',
        body: `
            <p>Dear University Community,</p>
            <p>Please be advised that the central campus network team will be performing scheduled core router firmware updates this Saturday between 2:00 AM and 4:00 AM.</p>
            <p>During this brief maintenance window, residential and library Wi-Fi connectivity will experience intermittent downtime. Normal service will resume automatically.</p>
            <p><strong>Note:</strong> IT Services will NEVER ask for your password, PIN, or personal login to perform routine hardware maintenance.</p>
            <p>For official status updates, visit the verified campus portal at: <code style="font-family:var(--font-mono); color:var(--accent-cyan);">https://status.university.edu.ng</code></p>
        `,
        redFlags: [
            "NO Red Flags! This is a legitimate notification.",
            "Authentic educational domain (.edu.ng) matching the institution.",
            "Explicit anti-phishing advisory: Clearly warns that IT never requests passwords.",
            "No urgent threats, no suspicious links, and no unexpected attachments."
        ]
    }
];

function setupPhishingSimulator() {
    const tabsContainer = document.getElementById('inbox-tabs');
    const emailContainer = document.getElementById('email-view-container');
    const scoreBadge = document.getElementById('phish-score-badge');
    if (!tabsContainer || !emailContainer) return;

    let activeIndex = 0;
    let userAnswers = {}; // id -> true/false

    function updateScoreUI() {
        const answeredIds = Object.keys(userAnswers);
        if (answeredIds.length === 0) {
            if (scoreBadge) scoreBadge.textContent = 'Score: 0/4';
            return;
        }
        let correct = 0;
        answeredIds.forEach(id => {
            const sc = PHISHING_SCENARIOS.find(s => s.id === id);
            if (sc && userAnswers[id] === sc.isPhish) {
                correct++;
            }
        });
        if (scoreBadge) scoreBadge.textContent = `Score: ${correct}/${answeredIds.length} Verified (${Math.round((correct / PHISHING_SCENARIOS.length) * 100)}%)`;
    }

    function renderTabs() {
        tabsContainer.innerHTML = '';
        PHISHING_SCENARIOS.forEach((sc, idx) => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${idx === activeIndex ? 'active' : ''}`;
            const answered = userAnswers[sc.id] !== undefined;
            btn.innerHTML = `${sc.tabTitle} ${answered ? '✓' : ''}`;
            btn.addEventListener('click', () => {
                SoundFX.playClick();
                activeIndex = idx;
                renderTabs();
                renderEmail();
            });
            tabsContainer.appendChild(btn);
        });
    }

    function renderEmail() {
        const sc = PHISHING_SCENARIOS[activeIndex];
        const isAnswered = userAnswers[sc.id] !== undefined;

        let flagsHtml = sc.redFlags.map(f => `<li>${f}</li>`).join('');

        emailContainer.innerHTML = `
            <div class="email-head">
                <div class="email-meta">
                    <div class="email-row">
                        <span class="lbl">From:</span>
                        <span class="val">${sc.senderName} &lt;<span class="${sc.isPhish ? 'fake' : ''}">${sc.senderEmail}</span>&gt;</span>
                    </div>
                    <div class="email-row">
                        <span class="lbl">Date:</span>
                        <span class="val">${sc.date}</span>
                    </div>
                </div>
                <div class="email-subject">${sc.subject}</div>
            </div>

            <div class="email-body">
                ${sc.body}
            </div>

            <div class="email-actions">
                <div style="font-size:13px; font-weight:500; color:var(--text-1);">
                    ${isAnswered 
                        ? (userAnswers[sc.id] === sc.isPhish 
                            ? '<span style="color:var(--green);">&#10003; Correct Diagnosis</span>' 
                            : '<span style="color:var(--red);">&#10007; Incorrect \u2014 Review red flags below</span>')
                        : 'What is your verdict on this message?'}
                </div>
                <div style="display:flex; gap:10px;">
                    <button id="btn-verdict-safe" class="btn btn-secondary btn-sm" ${isAnswered ? 'disabled' : ''}>
                        Mark as Legitimate
                    </button>
                    <button id="btn-verdict-phish" class="btn btn-danger btn-sm" ${isAnswered ? 'disabled' : ''}>
                        Flag as Phishing
                    </button>
                </div>
            </div>

            <div id="red-flags-box" class="flags-reveal ${isAnswered ? 'show' : ''}">
                <h4>${sc.isPhish ? 'Red Flags Identified in this Email:' : 'Why This Email Is Authentic:'}</h4>
                <ul>${flagsHtml}</ul>
            </div>
        `;

        const btnSafe = document.getElementById('btn-verdict-safe');
        const btnPhish = document.getElementById('btn-verdict-phish');

        if (btnSafe) {
            btnSafe.addEventListener('click', () => {
                handleVerdict(sc, false);
            });
        }
        if (btnPhish) {
            btnPhish.addEventListener('click', () => {
                handleVerdict(sc, true);
            });
        }
    }

    function handleVerdict(sc, markedAsPhish) {
        userAnswers[sc.id] = markedAsPhish;
        updateScoreUI();
        renderTabs();

        if (markedAsPhish === sc.isPhish) {
            SoundFX.playSuccess();
            Toast.show('Spot on! Excellent cybersecurity vigilance.', 'success');
        } else {
            SoundFX.playWarning();
            Toast.show('Threat missed! Examine the highlighted red flags.', 'danger');
        }

        renderEmail();
    }

    renderTabs();
    renderEmail();
    updateScoreUI();
}

// Suspicious URL Inspector Tool
function setupUrlInspector() {
    const input = document.getElementById('url-inspect-input');
    const btn = document.getElementById('btn-analyze-url');
    const resultBox = document.getElementById('url-inspect-result');
    const chips = document.querySelectorAll('.preset-chip');

    if (!input || !btn || !resultBox) return;

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            SoundFX.playClick();
            input.value = chip.getAttribute('data-url');
            analyzeUrl(input.value);
        });
    });

    btn.addEventListener('click', () => {
        SoundFX.playClick();
        analyzeUrl(input.value.trim());
    });

    function analyzeUrl(rawUrl) {
        if (!rawUrl) {
            Toast.show('Please enter a URL to inspect', 'warning');
            return;
        }

        let flags = [];
        let riskScore = 0; // 0: safe, 1-2: caution, 3+: dangerous

        let parsed;
        try {
            if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
                parsed = new URL('http://' + rawUrl);
            } else {
                parsed = new URL(rawUrl);
            }
        } catch (e) {
            flags.push("Malformed or invalid URL syntax.");
            riskScore += 3;
        }

        if (parsed) {
            const host = parsed.hostname.toLowerCase();
            const proto = parsed.protocol;

            // Check protocol
            if (proto === 'http:') {
                flags.push("Unencrypted HTTP Protocol: Data entered here can be intercepted in transit.");
                riskScore += 2;
            }

            // Check IP address directly
            if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
                flags.push("Raw IP Address Hostname: Legitimate consumer institutions use registered brand domains, not raw numeric IP addresses.");
                riskScore += 3;
            }

            // Check deceptive subdomains
            const parts = host.split('.');
            if (parts.length > 3) {
                flags.push(`Multiple Nested Subdomains (${parts.length}): Often used to disguise the real root domain '${parts.slice(-2).join('.')}'.`);
                riskScore += 2;
            }

            // Check typosquatting & brand impersonation
            const suspiciousKeywords = ['paypal', 'google', 'microsoft', 'apple', 'amazon', 'netflix', 'chase', 'wellsfargo', 'login', 'verify', 'security'];
            suspiciousKeywords.forEach(brand => {
                if (host.includes(brand) && !host.endsWith(brand + '.com') && !host.endsWith(brand + '.org')) {
                    flags.push(`Brand Impersonation / Typosquatting: Contains keyword '${brand}', but actual domain owner is '${parts.slice(-2).join('.')}'.`);
                    riskScore += 3;
                }
            });

            // Suspicious TLDs
            const suspiciousTlds = ['.top', '.xyz', '.work', '.click', '.tk', '.ml', '.ga', '.cf', '.gq', '.online', '.buzz'];
            if (suspiciousTlds.some(tld => host.endsWith(tld))) {
                flags.push("High-Risk Top-Level Domain (TLD): Frequently favored by disposable phishing campaigns.");
                riskScore += 2;
            }
        }

        resultBox.className = 'url-analysis-result show';
        if (riskScore === 0) {
            SoundFX.playSuccess();
            resultBox.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            resultBox.style.border = '1px solid rgba(16, 185, 129, 0.4)';
            resultBox.innerHTML = `
                <div style="font-weight:700; color:var(--accent-emerald); font-size:16px; margin-bottom:8px;">
                    🛡️ URL Verdict: Appears Legitimate & Low Risk
                </div>
                <p style="font-size:13px; color:var(--text-secondary); margin:0;">
                    No known spoofing patterns, suspicious subdomains, or unencrypted credential handlers detected. Always verify certificates before entering confidential credentials.
                </p>
            `;
        } else if (riskScore <= 2) {
            SoundFX.playWarning();
            resultBox.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            resultBox.style.border = '1px solid rgba(245, 158, 11, 0.4)';
            resultBox.innerHTML = `
                <div style="font-weight:700; color:var(--accent-amber); font-size:16px; margin-bottom:8px;">
                    ⚠️ URL Verdict: Caution Warranted (Moderate Risk)
                </div>
                <ul style="font-size:13px; color:var(--text-primary); margin-left:18px;">
                    ${flags.map(f => `<li>${f}</li>`).join('')}
                </ul>
            `;
        } else {
            SoundFX.playWarning();
            resultBox.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
            resultBox.style.border = '1px solid rgba(244, 63, 94, 0.4)';
            resultBox.innerHTML = `
                <div style="font-weight:700; color:var(--accent-rose); font-size:16px; margin-bottom:8px;">
                    🚨 URL Verdict: DANGEROUS / High Phishing Probability
                </div>
                <ul style="font-size:13px; color:var(--text-primary); margin-left:18px;">
                    ${flags.map(f => `<li>${f}</li>`).join('')}
                </ul>
            `;
        }
    }
}

// ==========================================
// 8. Cyber Hygiene Assessment & Safety (safety.html)
// ==========================================
const AUDIT_QUESTIONS = [
    {
        q: "1. How do you protect access to your primary email and banking accounts?",
        opts: [
            { text: "Strong password + Authenticator App / Hardware Security Key (MFA)", score: 25 },
            { text: "Password + SMS verification code", score: 18 },
            { text: "Just a complex password that I memorized", score: 10 },
            { text: "Same simple password used across multiple accounts", score: 0 }
        ]
    },
    {
        q: "2. What is your policy when connecting to open public Wi-Fi (airports, cafes)?",
        opts: [
            { text: "Always connect through an encrypted VPN service or use mobile hotspot", score: 25 },
            { text: "Connect only for reading news; never log into accounts or banking", score: 18 },
            { text: "Connect normally as long as websites show the HTTPS padlock", score: 12 },
            { text: "Connect freely to any open network without restrictions", score: 0 }
        ]
    },
    {
        q: "3. How frequently do you install security updates for your phone, PC, and browser?",
        opts: [
            { text: "Automatic updates enabled across all operating systems & software", score: 25 },
            { text: "Manually install updates within a week of receiving prompts", score: 18 },
            { text: "Postpone updates until my system forces a reboot", score: 8 },
            { text: "Rarely or never install updates to avoid interface changes", score: 0 }
        ]
    },
    {
        q: "4. How do you back up your critical documents, code, and project files?",
        opts: [
            { text: "3-2-1 strategy: 3 copies, across 2 different media, 1 securely cloud-synced", score: 25 },
            { text: "Cloud storage (Google Drive / OneDrive / iCloud) with versioning", score: 20 },
            { text: "Occasional manual copy to a portable USB drive", score: 10 },
            { text: "Files exist only on my current laptop hard drive", score: 0 }
        ]
    }
];

function setupHygieneAudit() {
    const container = document.getElementById('audit-container');
    if (!container) return;

    let currentQ = 0;
    let userScores = [];

    function renderQuestion() {
        if (currentQ >= AUDIT_QUESTIONS.length) {
            renderResults();
            return;
        }

        const q = AUDIT_QUESTIONS[currentQ];
        container.innerHTML = `
            <div class="audit-q active">
                <div class="q-counter">Question ${currentQ + 1} of ${AUDIT_QUESTIONS.length}</div>
                <div class="q-text">${q.q}</div>
                <div class="q-options">
                    ${q.opts.map((opt, i) => `
                        <button class="q-option" data-index="${i}">
                            <span>${opt.text}</span>
                            <span style="font-family:var(--font-mono); font-size:11px; color:var(--cyan); opacity:0.8;">+${opt.score} pts</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        const optBtns = container.querySelectorAll('.q-option');
        optBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                SoundFX.playClick();
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                userScores[currentQ] = q.opts[idx].score;
                currentQ++;
                renderQuestion();
            });
        });
    }

    function renderResults() {
        const totalScore = userScores.reduce((a, b) => a + b, 0);
        let grade = 'A+';
        let feedback = '';

        if (totalScore >= 90) {
            grade = 'A+';
            feedback = 'Outstanding cyber defense hygiene! You follow industry gold standards for identity, network, and data resilience.';
        } else if (totalScore >= 75) {
            grade = 'B';
            feedback = 'Solid security foundation! Review multi-factor authentication and automated backup habits to attain fortress status.';
        } else if (totalScore >= 50) {
            grade = 'C';
            feedback = 'Moderate exposure risk. Attackers can exploit gaps in public Wi-Fi habits or delayed software patching.';
        } else {
            grade = 'D';
            feedback = 'High risk vulnerability. Immediate improvements needed in password uniqueness, 2FA enforcement, and backup strategy.';
        }

        container.innerHTML = `
            <div class="audit-result show">
                <div class="score-ring">
                    <div class="score-grade">${grade}</div>
                    <div class="score-pct">${totalScore}/100</div>
                </div>
                <h3 style="font-family:var(--font-head); font-size:22px; margin-bottom:10px; letter-spacing:-0.02em;">
                    Cyber Readiness Grade: ${grade}
                </h3>
                <p style="color:var(--text-1); max-width:580px; margin:0 auto 24px; line-height:1.7; font-size:14px;">
                    ${feedback}
                </p>
                <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                    <button id="btn-restart-audit" class="btn btn-secondary">
                        Retake Assessment
                    </button>
                    <a href="passwords.html" class="btn btn-primary">
                        Strengthen Passwords
                    </a>
                </div>
            </div>
        `;

        SoundFX.playSuccess();

        const restartBtn = document.getElementById('btn-restart-audit');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                SoundFX.playClick();
                currentQ = 0;
                userScores = [];
                renderQuestion();
            });
        }
    }

    renderQuestion();
}

// Accordion (Incident Response)
function setupAccordions() {
    const accordions = document.querySelectorAll('.accordion-item');
    accordions.forEach(item => {
        const trigger = item.querySelector('.accordion-trigger');
        if (trigger) {
            trigger.addEventListener('click', () => {
                SoundFX.playClick();
                const isOpen = item.classList.contains('open');
                // Close others
                accordions.forEach(a => a.classList.remove('open'));
                if (!isOpen) {
                    item.classList.add('open');
                }
            });
        }
    });
}

// ==========================================
// 9. Command Center & Hub (index.html)
// ==========================================
const GLOSSARY_TERMS = [
    { term: 'Phishing', desc: 'Social engineering attack where deceptive messages entice victims to leak credentials or download malicious payloads.' },
    { term: 'Ransomware', desc: 'Malware that encrypts victims\' files, demanding ransom payment in cryptocurrency for decryption keys.' },
    { term: 'Two-Factor Authentication (2FA)', desc: 'Security layer requiring two distinct forms of identification before granting access (e.g., password + authenticator code).' },
    { term: 'Zero-Day Exploit', desc: 'A cyberattack targeting a software vulnerability unknown to the vendor, having zero days of existing defense patches.' },
    { term: 'Man-in-the-Middle (MitM)', desc: 'Attack where a malicious actor secretly intercepts and alters communication between two trusting parties (e.g. over public Wi-Fi).' },
    { term: 'Social Engineering', desc: 'Psychological manipulation tricking individuals into performing security actions or divulging confidential data.' },
    { term: 'Brute-Force Attack', desc: 'Automated trial-and-error method systematically guessing every possible password until finding the correct one.' },
    { term: 'End-to-End Encryption', desc: 'Secure communication system where only communicating users can read messages; third parties cannot decipher the stream.' },
    { term: 'SQL Injection (SQLi)', desc: 'Web security vulnerability allowing attackers to interfere with queries made by an application to its database.' }
];

function setupGlossary() {
    const searchInput = document.getElementById('glossary-search-input');
    const grid = document.getElementById('glossary-grid');
    if (!searchInput || !grid) return;

    function render(filter = '') {
        const query = filter.toLowerCase().trim();
        const filtered = GLOSSARY_TERMS.filter(item => 
            item.term.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align:center; padding:30px; color:var(--text-muted);">
                    No matching cybersecurity terms found for "${filter}".
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(item => `
            <div class="glossary-card">
                <h4>${item.term}</h4>
                <p>${item.desc}</p>
            </div>
        `).join('');
    }

    searchInput.addEventListener('input', (e) => {
        render(e.target.value);
    });

    render();
}

// Quick Home Page Daily Quiz
const MINI_QUIZ = [
    {
        q: "What should you check first when you receive an email requesting urgent password updates?",
        opts: [
            "Check if the sender's actual email domain matches the official company domain",
            "Click the link immediately to see if it looks real",
            "Reply with your password to ask if it's legitimate",
            "Forward the email to all friends"
        ],
        correct: 0,
        tip: "Always check the sender domain and never click unverified links under pressure!"
    },
    {
        q: "Why is password reuse across multiple websites considered extremely hazardous?",
        opts: [
            "It uses up too much computer memory",
            "A breach on one low-security website allows attackers to compromise all your accounts",
            "Web browsers only allow one account per password",
            "It slows down internet connection speeds"
        ],
        correct: 1,
        tip: "Credential stuffing bots immediately test stolen passwords across hundreds of popular services!"
    },
    {
        q: "Which of the following is the most secure method for Multi-Factor Authentication?",
        opts: [
            "SMS Text Code",
            "Hardware Security Key (FIDO2/WebAuthn) or Authenticator App",
            "Security Question asking for your mother's maiden name",
            "Email verification link"
        ],
        correct: 1,
        tip: "Hardware tokens and time-based authenticator apps are immune to SIM-swapping attacks!"
    }
];

function setupMiniQuiz() {
    const card = document.getElementById('home-quiz-card');
    if (!card) return;

    let qIdx = 0;
    let score = 0;

    function render() {
        if (qIdx >= MINI_QUIZ.length) {
            card.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <div style="font-size:36px; margin-bottom:10px;">🏆</div>
                    <h3 style="font-family:var(--font-heading); font-size:20px; margin-bottom:8px;">Quiz Completed!</h3>
                    <p style="color:var(--text-secondary); margin-bottom:18px;">
                        You scored <strong style="color:var(--accent-cyan); font-family:var(--font-mono);">${score}/${MINI_QUIZ.length}</strong> on the Cybersecurity Daily Challenge!
                    </p>
                    <button id="restart-mini-quiz" class="btn btn-secondary btn-sm">Retake Challenge</button>
                </div>
            `;
            SoundFX.playSuccess();
            const rBtn = document.getElementById('restart-mini-quiz');
            if (rBtn) {
                rBtn.addEventListener('click', () => {
                    qIdx = 0;
                    score = 0;
                    render();
                });
            }
            return;
        }

        const cur = MINI_QUIZ[qIdx];
        card.innerHTML = `
            <div style="font-family:var(--font-mono); font-size:12px; color:var(--accent-cyan); margin-bottom:6px;">
                CHALLENGE QUESTION ${qIdx + 1} OF ${MINI_QUIZ.length}
            </div>
            <h4 style="font-family:var(--font-heading); font-size:17px; margin-bottom:14px; color:var(--text-primary);">
                ${cur.q}
            </h4>
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px;">
                ${cur.opts.map((opt, i) => `
                    <button class="mini-quiz-opt btn btn-outline btn-sm" style="text-align:left; justify-content:flex-start; width:100%;" data-idx="${i}">
                        ${String.fromCharCode(65 + i)}. ${opt}
                    </button>
                `).join('')}
            </div>
        `;

        const btns = card.querySelectorAll('.mini-quiz-opt');
        btns.forEach(b => {
            b.addEventListener('click', () => {
                const choice = parseInt(b.getAttribute('data-idx'), 10);
                if (choice === cur.correct) {
                    SoundFX.playSuccess();
                    score++;
                    Toast.show('Correct! ' + cur.tip, 'success');
                } else {
                    SoundFX.playWarning();
                    Toast.show('Incorrect. ' + cur.tip, 'warning');
                }
                qIdx++;
                render();
            });
        });
    }

    render();
}

// ==========================================
// Initialization on DOM Ready
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Shared Systems
    ThemeManager.init();
    SoundFX.init();
    SoundFX.updateBtnUI();

    const soundBtns = document.querySelectorAll('.sound-toggle-btn');
    soundBtns.forEach(b => {
        b.addEventListener('click', () => SoundFX.toggle());
    });

    setupMobileNav();
    setupTipRotator();
    setupTerminalTypewriter();

    // Page Specific
    setupPasswordSuite();
    setupPhishingSimulator();
    setupUrlInspector();
    setupHygieneAudit();
    setupAccordions();
    setupGlossary();
    setupMiniQuiz();

    // Checklists
    setupChecklists('password-checklist', 'cyber_pwd_checklist');
    setupChecklists('phishing-checklist', 'cyber_phish_checklist');
    setupChecklists('safety-checklist', 'cyber_safe_checklist');
});
