// REVERT + DYNAMIC: original cinematic dashboard (kept dynamic uptime/bots/mode underneath)
const buildAliveCard = (ctx = {}) => {
    const up = process.uptime();
    const h  = Math.floor(up/3600);
    const mn = Math.floor((up%3600)/60);
    const sc = Math.floor(up%60);
    const upStr = `${h}h ${mn}m ${sc}s`;
    const aliveCount = ctx.aliveCount ?? 0;
    const totalCount = ctx.totalCount ?? 0;
    const mode  = (ctx.mode ?? 'safe').toUpperCase();
    // UI: alive card — premium hacker dashboard look. Original cinematic header preserved,
    // added real RAM / heap / load metrics so the user can verify perf in one glance.
    const _mem = process.memoryUsage();
    const _ram  = (_mem.rss/1024/1024).toFixed(1);
    const _heap = (_mem.heapUsed/1024/1024).toFixed(1);
    return `╔══════ 🧛‍♂️ 𝐕ᴀᴍᴘɪʀᴇᴇ 𝐁ᴏᴛ 🧛‍♂️ ══════╗

       ◤━━━━━━━━━━━━━━━━━━◥
     ❄️     𝐕ᴀᴍᴘɪʀᴇ 𝐆ᴏᴅ 𝐎ɴʟɪɴᴇ      ❄️
       ◣━━━━━━━━━━━━━━━━━━◢
═════════════ ════════════════════╝`
                );
   ⚡  𝙴𝙻𝙸𝚃𝙴 𝙼𝚄𝙻𝚃𝙸-𝚂𝙴𝚂𝚂𝙸𝙾𝙽 𝙺𝙴𝚁𝙽𝙴𝙻
   🌑  𝚂𝙼𝙰𝚁𝚃𝙲𝙾𝚁𝙴 𝙰𝙽𝚃𝙸-𝙱𝙰𝙽 𝙰𝙲𝚃𝙸𝚅𝙴
   🔮  𝙿𝙴𝚁𝙿𝙴𝚃𝚄𝙰𝙻 𝟸𝟺/𝟽 𝚄𝙿𝚃𝙸𝙼𝙴
   🩻  𝚄𝙱𝚄𝙽𝚃𝚄 𝙵𝙸𝙽𝙶𝙴𝚁𝙿𝚁𝙸𝙽𝚃 𝙻𝙾𝙲𝙺𝙴𝙳
   🛰️   𝙰𝚂𝚈𝙽𝙲 𝙻𝙾𝙾𝙿𝚂 ▸ 𝙽𝙾𝙽-𝙱𝙻𝙾𝙲𝙺𝙸𝙽𝙶

   ⏱️  𝐔ᴘᴛɪᴍᴇ : ${upStr}
   🤖  𝐁ᴏᴛs   : ${aliveCount}/${totalCount} online
   🧠  𝐑ᴀᴍ    : ${_ram} MB rss / ${_heap} MB heap
   ⚙️  𝐌ᴏᴅᴇ   : ${mode}

╚══════ 🧛‍♂️𝐕ᴀᴍᴘɪʀᴇ 𝐔ʟᴛɪᴍᴀᴛᴇ 𝐄ᴅɪᴛɪᴏɴ  🧛‍♂️ ══════╝`;
};
const ALIVE_MSG = buildAliveCard();

// FEATURE: connect message — PREMIUM hacker-style card sent on every new bot connect.
// Glowing/bold/script fonts. Shows date, time, CPU%, GPU, runtime, uptime, RAM (rss/heap),
// RDP/system RAM (used/total/free + %), Node version, OS, hostname, fleet status, mode.
// Sent WITH ./susanoo.jpg image attached.
let _lastCpuMeasure = process.cpuUsage();
let _lastCpuStamp   = Date.now();
const _cpuPercent = () => {
    const u = process.cpuUsage(_lastCpuMeasure);
    const elapsedMs = Date.now() - _lastCpuStamp;
    _lastCpuMeasure = process.cpuUsage();
    _lastCpuStamp   = Date.now();
    const cpuMs = (u.user + u.system) / 1000;
    const cores = Math.max(1, os.cpus()?.length || 1);
    return Math.min(999, (cpuMs / Math.max(1, elapsedMs * cores)) * 100);
};
let _gpuNameCache = null;
const _gpuName = () => {
    if(_gpuNameCache !== null) return _gpuNameCache;
    try {
        const r = spawnSync('sh', ['-c', "lspci 2>/dev/null | grep -iE 'vga|3d|display' | head -1 | sed 's/.*: //'"], { encoding: 'utf8', timeout: 800 });
        const out = (r?.stdout || '').trim();
        if(out){ _gpuNameCache = out.length > 48 ? out.slice(0, 45) + '...' : out; return _gpuNameCache; }
    } catch {}
    _gpuNameCache = `${(os.cpus()?.[0]?.model||'CPU').split(' ').slice(0, 3).join(' ')} (iGPU)`;
    return _gpuNameCache;
};
const buildConnectCard = ({phone, totalSessions, onlineSessions, mode, fingerprint}={}) => {
    const up    = process.uptime();
    const h     = Math.floor(up/3600), mn = Math.floor((up%3600)/60), sc = Math.floor(up%60);
    const upStr = `${h}h ${mn}m ${sc}s`;
    const mem    = process.memoryUsage();
    const rssMB  = (mem.rss      / 1024 / 1024).toFixed(1);
    const heapMB = (mem.heapUsed / 1024 / 1024).toFixed(1);
    const totMB  = (os.totalmem()/ 1024 / 1024).toFixed(0);
    const freeMB = (os.freemem() / 1024 / 1024).toFixed(0);
    const usedMB = (Number(totMB) - Number(freeMB)).toFixed(0);
    const ramPct = ((Number(usedMB) / Math.max(1, Number(totMB))) * 100).toFixed(1);
    const cpuPct  = _cpuPercent().toFixed(1);
    const cores   = os.cpus()?.length || 0;
    const cpuName = (os.cpus()?.[0]?.model || 'CPU').replace(/\s+/g,' ').trim().slice(0, 38);
    const gpu     = _gpuName();
    const sysUp   = `${Math.floor(os.uptime()/3600)}h ${Math.floor((os.uptime()%3600)/60)}m`;
    const node    = process.version;
    const platf   = `${os.type()} ${os.release().split('-')[0]} ${os.arch()}`;
    const host    = (os.hostname() || 'rdp').slice(0, 24);
    const now     = new Date();
    const t       = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const d       = now.toLocaleDateString('en-GB');
    return `╔═══════════════════════════════╗
║  ░▒▓█  𝐍ᴇᴡ 𝐁ᴏᴛ 𝐎ɴʟɪɴᴇ  █▓▒░  ║
║   ⚡  𝐕ᴀᴍᴘɪʀᴇ 𝐆ᴏᴅ ⚡   ║
╚═══════════════════════════════╝

╭─⟦  𝐈 𝐃 𝐄 𝐍 𝐓 𝐈 𝐓 𝐘  ⟧──────╮
  📞  𝐏𝐡𝐨𝐧𝐞       +${phone||'—'}
  🪪  𝐅𝐢𝐧𝐠𝐞𝐫     ${fingerprint||'Ubuntu Chrome'}
  📅  𝐃𝐚𝐭𝐞       ${d}
  ⏰  𝐓𝐢𝐦𝐞       ${t}
╰─━━━━━━━━━━━━━━━━━━━━━━━━╯

╭─⟦  𝐑 𝐔 𝐍 𝐓 𝐈 𝐌 𝐄  ⟧──────╮
  ⏱️   𝐔𝐩𝐭𝐢𝐦𝐞     ${upStr}
  🖥️   𝐒𝐲𝐬 𝐔𝐩    ${sysUp}
  🟩  𝐍𝐨𝐝𝐞       ${node}
  🧬  𝐎𝐒          ${platf}
  🛰️   𝐇𝐨𝐬𝐭        ${host}
╰─━━━━━━━━━━━━━━━━━━━━━━━━╯

╭─⟦  𝐇 𝐀 𝐑 𝐃 𝐖 𝐀 𝐑 𝐄  ⟧───╮
  ⚙️   𝐂𝐏𝐔         ${cpuName} ×${cores}
  📊  𝐂𝐏𝐔 𝐔𝐬𝐞    ${cpuPct}%
  🎮  𝐆𝐏𝐔         ${gpu}
╰─━━━━━━━━━━━━━━━━━━━━━━━━╯

╭─⟦  𝐌 𝐄 𝐌 𝐎 𝐑 𝐘  ⟧───────╮
  🧠  𝐁𝐨𝐭 𝐑𝐀𝐌    ${rssMB} MB rss / ${heapMB} MB heap
  💾  𝐑𝐃𝐏 𝐑𝐀𝐌    ${usedMB} / ${totMB} MB  (${ramPct}%)
  🟢  𝐅𝐫𝐞𝐞         ${freeMB} MB
╰─━━━━━━━━━━━━━━━━━━━━━━━━╯

╭─⟦  𝐅 𝐋 𝐄 𝐄 𝐓  ⟧─────────╮
  🤖  𝐒𝐞𝐬𝐬𝐢𝐨𝐧𝐬   ${onlineSessions||0}/${totalSessions||0} 𝙾𝙽𝙻𝙸𝙽𝙴
  🚀  𝐌𝐨𝐝𝐞        ${(mode||'safe').toUpperCase()}
╰─━━━━━━━━━━━━━━━━━━━━━━━━╯

   ▸ 𝚂𝙼𝙰𝚁𝚃𝙲𝙾𝚁𝙴 𝙰𝙽𝚃𝙸-𝙱𝙰𝙽 ▸ 𝙾𝙽
   ▸ 𝙼𝚄𝙻𝚃𝙸-𝚂𝙴𝚂𝚂𝙸𝙾𝙽 𝙺𝙴𝚁𝙽𝙴𝙻 ▸ 𝙾𝙺
   ▸ 𝙰𝚂𝚈𝙽𝙲 𝙻𝙾𝙾𝙿𝚂 ▸ 𝙽𝙾𝙽-𝙱𝙻𝙾𝙲𝙺𝙸𝙽𝙶
   ▸ 𝚆𝙰𝚃𝙲𝙷𝙳𝙾𝙶𝚂 ▸ 𝙰𝚁𝙼𝙴𝙳

╔═══════════════════════════════╗
║   𓂀  𝙴𝙻𝙸𝚃𝙴 𝙺𝙴𝚁𝙽𝙴𝙻 ▸ 𝟸𝟺/𝟽 𝚁𝙴𝙰𝙳𝚈  𓂀  ║
╚═══════════════════════════════╝`;
};

// REVERT: original cinematic susanoo activation card
const SUSANOO_MSG = `╔════════════════════════╗
║   🌑  𝐒 𝐔 𝐒 𝐀 𝐍 𝐎 𝐎  🌑   ║
║      ◢◤◢◤◢◤◢◤◢◤◢◤      ║
║   ⚡  𝐀𝐖𝐀𝐊𝐄𝐍𝐈𝐍𝐆 𝐒𝐄𝐐𝐔𝐄𝐍𝐂𝐄  ⚡   ║
║      ◥◣◥◣◥◣◥◣◥◣◥◣      ║
╚════════════════════════╝

      ╔══════════════════╗
      ║   🐉 𝐃ᴀʙᴜʀᴀ|𝐔ɴʟᴏᴄᴋᴇᴅ 🐉 ║
      ╚══════════════════╝

       ▰▱▰▱▰▱▰▱▰▱▰▱▰▱
       ░▒▓ 𝐈ɴɪᴛɪᴀʟɪᴢɪɴɢ 𝐒ʏ𝐬ᴛᴇᴍ.▓▒░
       ░▒▓ 𝐃ᴀʙᴜʀᴀ 𝐊ᴀʀᴀʙᴀ         ▓▒░
       ░▒▓ 𝐀ᴄᴛɪᴠᴀᴛɪᴏɴ 𝐊ɪɴɢ.      ▓▒░ 
       ▰▱▰▱▰▱▰▱▰▱▰▱▱▱

🔮  𝐎ᴡɴᴇʀsʜɪᴘ 𝐒ᴇᴀʟᴇᴅ
🌌  𝐀ʟʟ 𝐋ɪɴᴋᴇᴅ 𝐁ᴏᴛs 𝐍ᴏᴡ 𝐀ᴄᴛɪᴠᴀᴛᴇ
⚔️   𝐌ᴜʟᴛɪ-𝐒ʏsᴛᴇᴍ
☄️   𝐀ɴᴛɪ-𝐁ᴀɴ 𝐒ᴍᴀʀᴛᴄᴏʀᴇ 𝐒ʜɪᴇʟᴅ 𝐔ᴘ
🌑  𝐔ɴʟɪᴍɪᴛᴇᴅ 𝐃ᴏᴍɪɴɪᴏɴ — 𝐒ᴇɴᴅ .𝐌ᴇɴᴜ

╔════════════════════════╗
║   🐉  𝐔ʟᴛɪᴍᴀᴛᴇ 𝐁ᴏᴛ 𝐒ʏsᴛᴇᴍ  🐉           ║
╚════════════════════════╝`;

import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    delay,
    fetchLatestBaileysVersion,
    Browsers,
    downloadMediaMessage
} from '@whiskeysockets/baileys';
import { Boom }          from '@hapi/boom';
import fs                from 'fs';
import http              from 'http';
import readline          from 'readline';
import gtts              from 'node-gtts';
import { spawnSync }     from 'child_process';
import ffmpegPath        from 'ffmpeg-static';
import os                from 'os';

const NULL_LOGGER = {
    level: 'silent',
    trace : () => {},
    debug : () => {},
    info  : () => {},
    warn  : () => {},
    error : () => {},
    fatal : () => {},
    child : () => NULL_LOGGER,
};

// ─────────────────────────────────────────────
//  CONSOLE NOISE FILTER — silence libsignal Bad MAC stack-trace storms
//  libsignal/baileys internals call console.log/error DIRECTLY, bypassing our
//  trackError + uncaughtException filters. Wrap the console once, drop the noise.
// ─────────────────────────────────────────────
const _CONSOLE_DROP_RE = /(bad ?mac|session ?cipher|decryptwithsession|decryptwhisper|no open sessions|message counter|old counter|senderkey|verifymac|asyncqueueexecutor|queue_job\.js|libsignal[\\/])/i;
const _origConsole = {
    log:   console.log.bind(console),
    info:  console.info.bind(console),
    warn:  console.warn.bind(console),
    error: console.error.bind(console),
};
const _wrap = (fn) => (...args) => {
    try {
        const joined = args.map(a => (a instanceof Error ? (a.stack || a.message) : (typeof a === 'string' ? a : ''))).join(' ');
        if (_CONSOLE_DROP_RE.test(joined)) return;
    } catch {}
    return fn(...args);
};
console.log   = _wrap(_origConsole.log);
console.info  = _wrap(_origConsole.info);
console.warn  = _wrap(_origConsole.warn);
console.error = _wrap(_origConsole.error);

// ─────────────────────────────────────────────
//  ERROR FILTER — suppress libsignal/Bad MAC noise
// ─────────────────────────────────────────────
// FIX: errors — broader noise filter covers every libsignal/decrypt variant
// so logs stay clean and connection.update never marks a session dead because
// of a transient decrypt fault.
const _isSuppressedErr = e => {
    const msg = (e?.message || e?.reason || String(e) || '').toLowerCase();
    return msg.includes('bad mac') ||
           msg.includes('bad_mac') ||
           msg.includes('mac error') ||
           msg.includes('session cipher') ||
           msg.includes('sessioncipher') ||
           msg.includes('decryptwhisper') ||
           msg.includes('decryptwithsession') ||
           msg.includes('decryptwithsessions') ||
           msg.includes('no sessions') ||
           msg.includes('no open sessions') ||
           msg.includes('message counter') ||
           msg.includes('old counter') ||
           msg.includes('duplicate counter') ||
           msg.includes('senderkey') ||
           msg.includes('failed to decrypt') ||
           msg.includes('invalid pdu') ||
           msg.includes('connection closed') ||
           msg.includes('stream errored') ||
           msg.includes('precondition required');
};
// FIX: errors — repeated decrypt-error storm per session triggers a soft socket reset
const _decryptErrCounter = new Map();
const _bumpDecryptErr = (sessionId, sock) => {
    const now = Date.now();
    const cur = _decryptErrCounter.get(sessionId) || { count: 0, ts: now };
    if (now - cur.ts > 60_000) { cur.count = 0; cur.ts = now; }
    cur.count++;
    _decryptErrCounter.set(sessionId, cur);
    if (cur.count >= 25) {
        cur.count = 0;
        try { sock?.end?.(new Error('soft-reconnect-decrypt-storm')); } catch {}
    }
};

// ─────────────────────────────────────────────
//  STORAGE PATHS
// ─────────────────────────────────────────────
const PATH_AUTH         = (id) => `./sessions/${id}`;
const PATH_FINGERPRINT  = (id) => `./sessions/${id}/.fingerprint.json`;
const PATH_USERS        = './store/users.json';
const PATH_NETWORK      = './store/network.json';
const PATH_TIMING       = './store/timing.json';
const PATH_SUSANOO_IMG  = './susanoo.jpg';
// FEATURE: per-panel + per-group custom images
const DIR_CUSTOM_IMG    = './assets/custom_images';
try { if(!fs.existsSync(DIR_CUSTOM_IMG)) fs.mkdirSync(DIR_CUSTOM_IMG, { recursive: true }); } catch {}
// Allowed slot names for .saveimg / .resetimg / panel lookup
const PANEL_IMG_SLOTS = new Set([
    'welcome','goodbye','menu','atkpanel','triplepanel','vampirencpanel',
    'ncpanel','funpanel','tagpanel','syspanel','fulladmin','broadcast'
]);
const _safeChat = (chat) => String(chat||'global').replace(/[^a-zA-Z0-9._-]/g,'_');
const _imgPath  = (slot, chat) => `${DIR_CUSTOM_IMG}/${slot}__${_safeChat(chat)}.bin`;
// per-group → global slot — null if user has NOT uploaded a custom image.
// Used by text-only panels (atk/triple/sas/nc/fun/tag/sys/bcast) that should stay
// pure-text by default and only become image cards if the owner sets a custom one.
const getCustomPanelImage = (slot, chat) => {
    try {
        const a = _imgPath(slot, chat);
        if(fs.existsSync(a)) return fs.readFileSync(a);
        const b = _imgPath(slot, 'global');
        if(fs.existsSync(b)) return fs.readFileSync(b);
    } catch {}
    return null;
};
// per-group → global → susanoo.jpg → null. Used by welcome/goodbye/fulladmin/menu
// which already had Susanoo as their default image.
const getPanelImage = (slot, chat) => {
    const c = getCustomPanelImage(slot, chat);
    if(c) return c;
    try { if(fs.existsSync(PATH_SUSANOO_IMG)) return fs.readFileSync(PATH_SUSANOO_IMG); } catch {}
    return null;
};
// List which slots have a saved image (for .listimg)
const listSavedImages = () => {
    const out = {};
    try {
        for(const f of (fs.readdirSync(DIR_CUSTOM_IMG) || [])){
            const m = f.match(/^([a-z]+)__(.+)\.bin$/);
            if(!m) continue;
            const [, slot, scope] = m;
            (out[slot] ||= []).push(scope === 'global' ? 'global' : scope);
        }
    } catch {}
    return out;
};
const PATH_GEO          = './store/geo.json';

// Limits: up to 10 accounts, 4 sessions each = 40 max
const MAX_BOTS    = 10;
const MAX_SEASONS = 40;
process.setMaxListeners(0);

const SEND_RETRY_COUNT        = 5;
const CONNECTION_RETRY_INTERVAL = 5000;
const SOCKET_TIMEOUT          = 60000;
const RATE_LIMIT_PAUSE        = 60000;

// ─────────────────────────────────────────────
//  ANTI-BAN CONFIG
// ─────────────────────────────────────────────
const JITTER_MIN_MS      = 20;
const JITTER_MAX_MS      = 140;
const MAX_MSG_PER_MIN    = 30;
const TYPING_SIM_MS      = 350;
// FIX: reconnect — old 6h hard cooldown REMOVED. Sessions now retry on 5s → 15s → 30s
// progressive ladder (capped at 30s) and NEVER stay restricted permanently.
const RESTRICTED_PAUSE   = 30*1000;          // hard ceiling — single 30s pause
const RESTRICTED_LADDER  = [5000, 15000, 30000]; // progressive resume schedule
const API_PORT           = 3001;

// ─────────────────────────────────────────────
//  SESSION STABILITY CONFIG (ANTI-BAN SAFE)
// ─────────────────────────────────────────────
const RECONNECT_DELAY_MIN  = 8000;   // 8s minimum retry delay — exponential backoff base
const RECONNECT_DELAY_MAX  = 60000;  // 60s maximum retry delay cap
// [PERFORMANCE FIX] Reduced login spacing from 30-60s → 12-25s.
// Still safe: WhatsApp's pairing endpoint flags >5/min from one IP; we stay well under that.
// Cuts multi-session connect time by ~60% while preserving anti-ban human-like spacing.
const LOGIN_QUEUE_MIN_MS   = 12000;  // 12s minimum between new bot logins
const LOGIN_QUEUE_MAX_MS   = 25000;  // 25s maximum between new bot logins (random in range)
const CONNECT_TIMEOUT_MS   = 60000; // 60s — restart session if no 'open' within this time
const PAIR_DELAY_MS        = 10000; // 10s human-like delay before requesting pairing code (anti-ban)
const PAIR_MAX_RETRIES     = 1;     // request pairing code ONLY ONCE — no retries cause detection

// ─────────────────────────────────────────────
//  FINGERPRINT BROWSER POOL — DYNAMIC RANDOM ASSIGNMENT
//  One unique fingerprint assigned per bot session, saved to disk, NEVER changes.
//  Each session gets a different browser so they don't all look identical to WhatsApp.
// ─────────────────────────────────────────────
// [STABILITY FIX] User requirement — bot must use ONLY the Ubuntu fingerprint.
// Pool collapsed to a single entry so every session (current + future) is Ubuntu Chrome.
// Existing saved non-Ubuntu fingerprints get auto-migrated below.
const BROWSER_POOL = [
    { name: 'Ubuntu Chrome',   fn: () => Browsers.ubuntu('Chrome')   },
];

const getOrCreateFingerprint = (sessionId) => {
    const fpPath = PATH_FINGERPRINT(sessionId);
    // [STABILITY FIX] always force Ubuntu — read existing file only to keep timestamp,
    // but if the saved browser isn't Ubuntu we silently rewrite it to Ubuntu.
    try {
        if (fs.existsSync(fpPath)) {
            const saved = JSON.parse(fs.readFileSync(fpPath, 'utf8'));
            const match = BROWSER_POOL.find(b => b.name === saved.browser);
            if (match) {
                log(sessionId, `[FINGERPRINT] Loaded saved fingerprint: ${match.name}`);
                return match;
            }
            log(sessionId, `[FINGERPRINT] Saved fingerprint "${saved?.browser}" is not Ubuntu — migrating to Ubuntu Chrome`);
        }
    } catch {}
    const chosen = BROWSER_POOL[0]; // Ubuntu Chrome — only choice
    try {
        const dir = PATH_AUTH(sessionId);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fpPath, JSON.stringify({ browser: chosen.name, assignedAt: Date.now() }));
    } catch {}
    log(sessionId, `[FINGERPRINT] Assigned fingerprint: ${chosen.name}`);
    return chosen;
};

//  MODE CAPS (msgs per minute per session)
const MODE_CAPS = { stealth:10, safe:30, fast:70, turbo:150 };

// Anti-ban safe performance config — reduced thread count and msg rate
const THREADS_PER_ATTACK = 2;        // 2 threads max — prevents flood detection
const MAX_MSG_PER_SEC    = 50;       // capped at 50 msg/sec globally (was 20, raised safely)
const MAX_GRP_PER_SEC    = 10;
const HUMAN_JITTER_MIN   = 800;      // minimum 800ms human-like send delay
const HUMAN_JITTER_MAX   = 2000;     // maximum 2000ms — randomized to avoid pattern detection

const humanJitter = () => HUMAN_JITTER_MIN + Math.random() * (HUMAN_JITTER_MAX - HUMAN_JITTER_MIN);

// ─────────────────────────────────────────────
//  EMOJI BANKS
// ─────────────────────────────────────────────
const SETS = {
    faces:   ['🤡','🥸','😶‍🌫️','🫠','🥴','🤑','😈','👿','😵‍💫','🤧','🥲','😬','🫡','🧑‍💻','🧐'],
    hearts:  ['🎋','🎍','🪴','🎑','🌾','🍀','🌴','🪦','🌵','🎄','🍄','🍃','🌿','🍁','🌴'],
    hands:   ['🍕','🍔','🌮','🍜','🍣','🍩','🧁','🍰','🧋','🥞','🫔','🥙','🧆','🥗','🫕'],
    flowers: ['🏗️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏧','🏨','🏩','🏪','🏫','🏬'],
    sky:     ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🥏','🎱','🏑','🏒','🥍','🏸','🥊','🪃'],
    animals: ['🎸','🎹','🎺','🎻','🥁','🪕','🎷','🪗','🎙️','🎚️','🎛️','📻','🪘','🪈','🎼'],
    fruits:  ['🚂','🛳️','🏎️','🚁','🛻','🚡','🛶','🚤','🚠','🛺','🚜','🏍️','🛵','🚲','🛴'],
    nc1:     ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '😍', '🥰'],
    nc2:     ['💋', '❤️', '🩶', '🤍', '🩷', '💘', '💝', '💝', '❤️‍🩹', '💔', '❤️‍🔥', '💓', '💗'],
    nc3:     ['👍', '👎', '🫶', '🙌', '👐', '🤲', '🤜', '🤛', '✊', '👊', '🫳', '🫴', '🫱', '🫲'],
    nc4:     ['💐', '🌹', '🥀', '🌺', '🌷', '🪷', '🌸', '💮', '🏵️', '🪻', '🌻', '🌼'],
    nc5:     ['☀️', '🌞', '🌝', '🌚', '🌜', '🌛', '🌙', '⭐', '🌟', '✨', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'],
    nc6:     ['🦁', '🐯', '🐱', '🐺', '🙈', '🐮', '🐷', '🦄', '🦚', '🐳', '🐋', '🐋', '🐬', '🦈'],
    nc7:     ['🍓', '🍒', '🍎', '🍅', '🌶️', '🍉', '🍑', '🍊', '🥕', '🥭', '🍍', '🍌', '🌽', '🍋', '🍋‍🟩', '🍈', '🍐', '🫛', '🍆', '🍇'],
    nc8:     ['🕦', '🕚', '🕥', '🕙', '🕤', '🕘', '🕣', '🕢', '🕖', '🕡', '🕕', '🕠', '🕔', '🕟', '🕓', '🕞', '🕒', '🕝', '🕑', '🕜', '🕧', '🕛', '⏱️'],
    nc9:     ['🇲🇦', '🇦🇴', '🏴‍☠️', '🇪🇬', '🇬🇱', '🇬🇮', '🇮🇶', '🇳🇪', '🇬🇶', '🇹🇷'],
};

// ═════════════════════════════════════════════
//  [NEW SYSTEM] EMOJI BANK + AUTO-GENERATED nc10..nc100
//  Each generated set is unique, themed, no internal repetition.
// ═════════════════════════════════════════════
const EMOJI_BANK = {
    cyber:    ['💻','📱','🖥️','⌨️','🖱️','💾','💿','📀','🕹️','🎮','🔌','🔋','📡','🛰️','🤖','👾','🧠','⚙️','🛠️','🔧','📟','💽'],
    fire:     ['🔥','💥','⚡','✨','🌟','⭐','💫','🌠','☄️','🔆','🎆','🎇','🌋','🎯','💢','💯','🚀','🛸','🌪️','💎'],
    dark:     ['🩸','☠️','💀','🖤','🌑','⚫','🌚','♠️','♣️','◾','🦇','🕷️','🕸️','🪦','⚰️','⛧','☣️','☢️','♟️','🃏'],
    cosmic:   ['🌌','🔮','🪐','🌠','☄️','🌙','✴️','✳️','❇️','💠','🌃','🛸','🌐','🌀','♾️','🔱','⚛️','🧿','🪬','♈'],
    weather:  ['⛈️','🌩️','🌨️','❄️','🌬️','🌫️','🌪️','🌧️','☂️','☔','💧','💦','🌊','🌡️','☀️','🌤️','⛅','🌥️','☁️','🌈'],
    nature:   ['🌲','🌳','🌴','🌵','🌷','🌸','🌹','🌺','🌻','🌼','🍀','🍁','🍂','🍃','🌾','🌱','🪴','🌿','🪷','🪻'],
    food:     ['🍕','🍔','🍟','🌭','🍿','🥓','🍳','🥞','🧇','🥨','🥯','🧀','🥗','🥘','🍝','🍜','🍣','🍱','🍙','🍘'],
    sweets:   ['🍩','🍪','🎂','🍰','🧁','🍫','🍬','🍭','🍮','🍯','🍦','🍨','🍧','🥧','🍡','🍢','🍥','🍠','🥮','🍵'],
    drinks:   ['🍷','🍸','🍹','🍺','🍻','🥂','🥃','🍶','🧃','🧉','🧋','🍵','☕','🥤','🧊','🍾','🥛','🫗','🫖','🥄'],
    sports:   ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳'],
    transport:['🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔'],
    music:    ['🎵','🎶','🎼','🎤','🎧','🎷','🎸','🎹','🎺','🎻','🪕','🪗','🪘','🪈','🥁','🎙️','🎚️','🎛️','📻','🔊'],
    animals:  ['🐶','🐺','🦊','🦝','🐱','🦁','🐯','🐅','🐴','🦄','🦓','🦌','🦬','🐮','🐷','🐗','🐭','🐹','🐰','🐻'],
    sea:      ['🐠','🐟','🐡','🐬','🐳','🐋','🦈','🦭','🐙','🦑','🦐','🦞','🦀','🐚','🪸','🪼','🐢','🐊','🦎','🐍'],
    fruit:    ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🌶️'],
    hands:    ['👍','👎','👊','✊','🤛','🤜','🤞','✌️','🤟','🤘','👌','🤌','🤏','👈','👉','👆','👇','☝️','🫳','🫴'],
    arrows:   ['➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↩️','↪️','⤴️','⤵️','🔃','🔄','🔙','🔚','🔛','🔝'],
    symbols:  ['❌','⭕','✖️','➕','➖','➗','♾️','‼️','⁉️','❓','❗','〰️','⚠️','🚸','🔆','🔅','💲','💱','™️','©️'],
    crystals: ['💎','🔷','🔶','🔸','🔹','🔺','🔻','🟦','🟧','🟨','🟩','🟪','🟥','🟫','🔵','🟢','🟡','🟠','🔴','🟣'],
    clocks:   ['🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛','🕜','🕝','🕞','🕟','🕠','🕡','🕢','🕣'],
};

// Procedurally build nc10..nc100 from EMOJI_BANK — themed, unique within each set
(function _buildExtraNcSets(){
    const themes = Object.keys(EMOJI_BANK);
    for(let i = 10; i <= 100; i++){
        const theme = themes[(i - 10) % themes.length];
        const pool  = EMOJI_BANK[theme];
        // Deterministic shuffle by seed `i` so the same nc number always gives the same set
        const order = pool.map((e, idx) => ({e, k: ((i * 2654435761) ^ (idx * 2246822519)) >>> 0}))
                          .sort((a, b) => a.k - b.k)
                          .map(o => o.e);
        const len = 8 + (i % 8); // 8..15 emojis per set
        SETS[`nc${i}`] = order.slice(0, len);
    }
})();

// ═════════════════════════════════════════════
//  [NEW SYSTEM] .vampirenc1 .. .vampirenc10 — TRIPLE-SPEED PREMIUM SETS
//  Modern emoji + symbol templates, runs with 3x parallelism (anti-ban safe)
// ═════════════════════════════════════════════
const vampireNC_SETS = {
    vampirenc1:  ['⚡','🌩️','🔥','💥','✨','🌟','💫','⭐','💢','💯','☄️','🚀'],
    vampirenc2:  ['🩸','☠️','💀','🖤','🌑','⚫','🌚','♠️','♣️','◾','🃏','⛧'],
    vampirenc3:  ['🌌','🔮','🪐','🌠','☄️','🌙','✴️','✳️','❇️','💠','🪬','🧿'],
    vampirenc4:  ['◤','◥','◣','◢','▰','▱','▲','▼','◆','◇','▣','▤','▥','▦'],
    vampirenc5:  ['❶','❷','❸','❹','❺','❻','❼','❽','❾','❿','⓫','⓬','⓭','⓮'],
    vampirenc6:  ['卐','卍','✠','✦','✧','✩','✪','✫','✬','✭','✮','✯','✰','⚝'],
    vampirenc7:  ['☯','☬','☫','☪','☭','☮','☸','♆','♅','♇','⚛','⚜','⚛️','⚔️'],
    vampirenc8:  ['༺','༻','꧁','꧂','彡','ミ','҂','҈','҉','᭡','᭢','᭣','᭤','᭥'],
    vampirenc9:  ['◉','◎','●','○','◍','◐','◑','◒','◓','◔','◕','⬤','◖','◗'],
    vampirenc10: ['🩻','🔱','⚔️','🛡️','🗡️','⚰️','🪦','🦴','🩸','💉','🧬','⚗️','🧪','🌡️'],
};
Object.assign(SETS, vampireNC_SETS);

const FLAG_CYCLE = [
    '🇳🇵','🇧🇩','🇱🇰','🇲🇾','🇹🇭','🇻🇳','🇵🇭','🇮🇩','🇸🇬','🇰🇿',
    '🇺🇿','🇦🇿','🇬🇪','🇮🇶','🇮🇷','🇸🇾','🇯🇴','🇱🇧','🇾🇪','🇲🇳'
];

const EMO_CYCLE = [
    '🪬','🧿','🪩','🪸','🪼','🫎','🪿','🦤','🪭','🪮',
    '🪈','🪗','🪘','🪃','🪁','🫙','🪣','🫗','🪤','🪆'
];

// FIX [PURE-EMOJI]: per user request, .nc word-cycle should rotate ONLY symbols
// and emojis — no extra text. Stripped each entry down to just the emoji.
const WORD_CYCLE = [
    '🪣','🫏','🪲','🪳','🦠',
    '🚽','🗑️','🧂','🪤',
    '🧻','🦟','🕳️','🪰','🤡','💩'
];

// ─────────────────────────────────────────────
//  FONT CONVERTER (small caps)
// ─────────────────────────────────────────────
const GLYPH = {
    a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',
    m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ',
    A:'ᴀ',B:'ʙ',C:'ᴄ',D:'ᴅ',E:'ᴇ',F:'ғ',G:'ɢ',H:'ʜ',I:'ɪ',J:'ᴊ',K:'ᴋ',L:'ʟ',
    M:'ᴍ',N:'ɴ',O:'ᴏ',P:'ᴘ',Q:'ǫ',R:'ʀ',S:'ꜱ',T:'ᴛ',U:'ᴜ',V:'ᴠ',W:'ᴡ',X:'x',Y:'ʏ',Z:'ᴢ'
};
const g = str => str.split('').map(c => GLYPH[c] ?? c).join('');

// ─────────────────────────────────────────────
//  SESSION STATES
// ─────────────────────────────────────────────
const SESSION_STATE = {
    ACTIVE     : 'ACTIVE',
    PAUSED     : 'PAUSED',
    RESTRICTED : 'RESTRICTED',
    DEAD       : 'DEAD',
    LOCKED     : 'LOCKED',
};

// ─────────────────────────────────────────────
//  GLOBAL NC / GLOBAL FAST STATE
// ─────────────────────────────────────────────
const globalNcState   = { active: false, loops: [] };
const globalFastState = { active: false, loops: [] };

// FEATURE: ultranc (fastest engine) — global speed config + per-chat loop registry
// burstDelayMs = max delay between bursts; burstSize = msgs per burst; parallel = concurrent worker count
const ultraNcSpeed = { burstDelayMs: 200, burstSize: 4, parallel: 3 };
const ultraNcLoops = new Map(); // chat → controller {on:boolean}
// FEATURE: sasnc — MAX-BURST but SAFE engine. Bigger bursts than ultranc with longer cooldowns.
// Aggressive smartcore awareness, lower parallel, longer breathing room → fast bursts but won't ban.
const sasNcSpeed   = { burstSize: 6, parallel: 2, restMin: 400, restMax: 750 };
const sasNcLoops   = new Map(); // chat → controller {on:boolean}
// FEATURE: triple1..triple10 — INSANE TIER NC engine. Level scales burst & parallel.
// L1=warmup ... L10=apocalypse. Each chat keyed independently for true per-group isolation.
// triple<N> command sets nLevel; rest/burst params auto-scale; smartcore + rate-limit aware.
const tripleNcLoops = new Map(); // chat → controller {on, level, txt}
const TRIPLE_PRESETS = [
    null, // 0 unused
    { burst:3,  parallel:2, restMin:380, restMax:620, suffixMin:2, suffixMax:3 }, // 1
    { burst:4,  parallel:2, restMin:340, restMax:560, suffixMin:2, suffixMax:3 }, // 2
    { burst:5,  parallel:3, restMin:300, restMax:500, suffixMin:2, suffixMax:4 }, // 3
    { burst:6,  parallel:3, restMin:260, restMax:440, suffixMin:2, suffixMax:4 }, // 4
    { burst:7,  parallel:3, restMin:230, restMax:400, suffixMin:3, suffixMax:5 }, // 5
    { burst:8,  parallel:4, restMin:200, restMax:360, suffixMin:3, suffixMax:5 }, // 6
    { burst:9,  parallel:4, restMin:170, restMax:320, suffixMin:3, suffixMax:6 }, // 7
    { burst:10, parallel:4, restMin:140, restMax:280, suffixMin:4, suffixMax:6 }, // 8
    { burst:12, parallel:4, restMin:110, restMax:240, suffixMin:4, suffixMax:7 }, // 9
    { burst:14, parallel:4, restMin: 80, restMax:200, suffixMin:4, suffixMax:8 }, // 10 — APOCALYPSE
];
// FEATURE: shadiparty — celebration loop registry (chat → controller)
const shadiPartyLoops = new Map();
// FEATURE: baccha — per-chat lock so the labour cinematic doesn't double-fire
const bacchaLock = new Set();

// ─────────────────────────────────────────────
//  ACTIVE SESSION REGISTRY
//  Maps phone → Set<sessionId> to allow up to MAX_SESSIONS_PER_PHONE
//  per number simultaneously (multi-season support)
// ─────────────────────────────────────────────
const activePhoneRegistry = new Map();  // phone → Set<sessionId> (multi-session support)
const pendingPairingRegistry = new Map(); // phone → Set<sessionId> currently in pairing (not yet online)
const MAX_SESSIONS_PER_PHONE = 4;       // allow same number in up to 4 sessions simultaneously (min 3)

// ─────────────────────────────────────────────
//  LOGIN QUEUE — only 1 new login every 30–60s
// ─────────────────────────────────────────────
let loginQueueLast = 0;

const loginQueueWait = async (sessionId) => {
    const now = Date.now();
    const since = now - loginQueueLast;
    const needed = LOGIN_QUEUE_MIN_MS + Math.round(Math.random() * (LOGIN_QUEUE_MAX_MS - LOGIN_QUEUE_MIN_MS));
    if (loginQueueLast > 0 && since < needed) {
        const wait = needed - since;
        logw(sessionId, `[LOGIN START] Queued — waiting ${Math.round(wait/1000)}s before connecting to avoid spam detection (anti-ban login queue)`);
        await delay(wait);
    } else {
        log(sessionId, `[LOGIN START] Starting login — no queue wait needed`);
    }
    loginQueueLast = Date.now();
};

// ─────────────────────────────────────────────
//  MENU
// ─────────────────────────────────────────────
// REVERT: original cinematic welcome card (kept image + once-per-join dedupe)
// FIX: welcome — now shows join-source line (admin add / user add / self join / invite)
const WELCOME_CARD = ({mention, groupName, time, date, joinLine}) => `╔══════════════════════════╗
║  👻  𝐍ᴇᴡ 𝐒ᴏᴜʟ 𝐃ᴇᴛᴇᴄᴛᴇᴅ  👻                     ║
║      ◢◤◢◤◢◤◢◤◢◤◢◤                                ║
╚══════════════════════════╝

  🩸  𝐖ᴇʟᴄᴏᴍᴇ→ @${mention}
  🌌  𝐂ʜᴀᴍʙᴇʀ : ${groupName}
  ⏱️  𝐓ɪᴍᴇ : ${time}
  📅  𝐃ᴀᴛᴇ : ${date}
${joinLine ? `  🛂  𝐄ɴᴛʀʏ : ${joinLine}\n` : ''}
       ▰▱▰▱▰▱▰▱▰▱▰▱
   👑 𝐌ᴀᴅᴇ 𝐁ʏ 𝐓ʜᴇ 𝐊ɪɴɢ 𝐕ᴀᴍᴘɪʀᴇ 🧛‍♂️
   🧞‍♀️ 𝐓ʜᴇ 𝐑ᴇᴀʟ-𝕄-𝐊ɪɴɢ 𝐃ᴀʙᴜʀᴀ 🐉
       ▰▱▰▱▰▱▰▱▰▱▰▱

╔════════════════════════╗
║   ⚔️   𝐎ʙᴇʏ 𝐎ʀ 𝐏ᴇʀɪsʜʜ  ⚔️                 ║
║  🧛‍♂️    𝐕ᴀᴍᴘɪʀᴇ 𝐔ʟᴛɪᴍᴀᴛᴇ ɴᴏᴅᴇ   🧛‍♂️     ║
╚════════════════════════╝`;

// FEATURE: goodbye card — same hacker style, fired when someone leaves / is kicked
const GOODBYE_CARD = ({mention, groupName, time, date, leaveLine}) => `╔══════════════════════════╗
║   🥀  𝐒ᴏᴜʟ 𝐃ᴇᴘᴀʀᴛᴇᴅ  🥀   ║
║      ◥◣◥◣◥◣◥◣◥◣◥◣      ║
╚══════════════════════════╝

  🕯️  𝐆ᴏᴏᴅʙʏᴇ → @${mention}
  🌌  𝐂ʜᴀᴍʙᴇʀ : ${groupName}
  ⏱️  𝐓ɪᴍᴇ : ${time}
  📅  𝐃ᴀᴛᴇ : ${date}
${leaveLine ? `  🚪  𝐄xɪᴛ : ${leaveLine}\n` : ''}
       ▰▱▰▱▰▱▰▱▰▱▰▱
   🌑  𝐎ɴᴇ 𝐋ᴇss 𝐒ʜᴀᴅᴏᴡ  🌑
   🥷  𝐅ᴀᴅᴇᴅ 𝐈ɴᴛᴏ 𝐓ʜᴇ 𝐃ᴀʀᴋ  🥷
       ▰▱▰▱▰▱▰▱▰▱▰▱

╔══════════════════════════╗
║   ⚰️   𝐌ᴀʏ 𝐘ᴏᴜ 𝐍ᴇᴠᴇʀ 𝐑ᴇᴛᴜʀɴ  ⚰️           ║
║  🐉   𝐃ᴀʙᴜʀᴀ 𝐔ʟᴛɪᴍᴀᴛᴇ 𝐍ᴏᴅᴇ     🐉          ║
╚══════════════════════════╝`;

// FIX: welcome dedupe — global cross-bot single-fire lock.
// Window lowered from 6h → 5min so re-testing actually shows the card again.
const _welcomeFiredCache = new Map(); // key=`${chat}__${jid}` → expireTs (legacy back-compat)
const _welcomeLock       = new Map(); // chat::jid → expiresAt — winner-takes-all across the fleet
const WELCOME_DEDUPE_MS  = 5 * 60 * 1000;
const _welcomeMetaCache  = new Map(); // chat → {name, ts}
setInterval(() => {
    const now = Date.now();
    for(const [k,exp] of _welcomeFiredCache) if(exp < now) _welcomeFiredCache.delete(k);
    for(const [k,exp] of _welcomeLock)        if(exp < now) _welcomeLock.delete(k);
    for(const [k,v]   of _welcomeMetaCache)   if(now - v.ts > 30 * 60 * 1000) _welcomeMetaCache.delete(k);
}, 60_000).unref?.();
const _getGroupName = async (sock, chat) => {
    const c = _welcomeMetaCache.get(chat);
    if(c && (Date.now() - c.ts) < 10 * 60 * 1000) return c.name;
    try { const md = await sock.groupMetadata(chat); const name = md?.subject || 'Group'; _welcomeMetaCache.set(chat, {name, ts: Date.now()}); return name; }
    catch { return 'Group'; }
};

// REVERT: original cinematic premium menu (kept dynamic header + new attack/fun commands listed)
const MENU_TEXT = (ctx = {}) => {
    const up = process.uptime();
    const h  = Math.floor(up/3600);
    const mn = Math.floor((up%3600)/60);
    const upStr = h > 0 ? `${h}h ${mn}m` : `${mn}m`;
    const aliveCount = ctx.aliveCount ?? '?';
    const totalCount = ctx.totalCount ?? '?';
    const mode = ctx.mode ?? 'safe';
    // UI: menu header — added live RAM + heap so ops can spot leaks at a glance.
    const _mem = process.memoryUsage();
    const _ram = (_mem.rss/1024/1024).toFixed(0);
    return `╔══════════════════════════════╗
║    🐉  𝐕ᴀᴍᴘɪʀᴇ 𝕍ᴇʀ𝕤ɪᴏɴ-𝟑𝟘     🐉   ║
║    🩸 𝐌ᴜʟᴛɪ-𝐒ᴇssɪᴏɴ 𝐊ᴇʀɴᴇʟ 🧛‍♂️   ║
╚══════════════════════════════╝
   ⏱️  𝐔𝐩𝐭𝐢𝐦𝐞: ${upStr}
   🤖  𝐁𝐨𝐭𝐬: ${aliveCount}/${totalCount} ${g('online')}
   🧠  𝐑𝐀𝐌  : ${_ram} MB
   ⚙️  𝐌𝐨𝐝𝐞: ${mode.toUpperCase()}

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   👑   𝐂ᴏɴᴛʀᴏʟ | 𝐎ᴡɴᴇʀ   👑               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
  +susanoo       𖤍 ${g('activate bot (first user = owner)')}
  .admin         👑 ${g('claim admin in dm')}
  .unadmin       ${g('drop your admin')}
  .sub / .unsub  ${g('promote / demote someone (reply)')}
  .fulladmin     ${g('grant full control (reply)')}
  .unfulladmin   ${g('revoke full control (reply)')}
  .giveaccess    ${g('give anyone all bot access (reply)')}
  .revokeaccess  ${g('revoke trusted user (reply)')}
  .setcontrol    ${g('set management gc')}
  .autoreact     ${g('toggle auto reaction')}
  .react on/off  ${g('explicit react toggle (alias)')}
  .welcome on/off    ${g('toggle premium welcome card')}
  .welcomeon / .welcomeoff   ${g('quick toggle aliases')}
  .testwelcome   ${g('preview welcome card (reply/mention)')}
  .testgoodbye   ${g('preview goodbye card (reply/mention)')}

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   ⚙️  𝐒ᴍᴀʀᴛᴄᴏʀᴇ / 𝐌ᴏᴅᴇ   ⚙️   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
  .bypass             🔓 ${g('force-clear all restrictions')}
  .setmode stealth    🕶️  10 msg/min
  .setmode safe       ⚖️  30 msg/min  (default
  .setmode fast       🚀 70 msg/min
  .setmode turbo      ⚡ 150 msg/min
  .status             🧠 ${g('smartcore health per bot')}
  .health             ❤️ ${g('bot health & condition')}
  .healthcheck        🛡️ ${g('safest bot picker (anti-ban)')}
  .healthstat / .hstat  📊 ${g('live error & failure stats')}
  .session            📡 ${g('per-phone session viewer')}

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚔️   𝐀 ᴛ ᴛ ᴀ ᴄ ᴋ    𝐂 ᴏ ɴ ᴛ ʀ ᴏ ʟ             ┃
┃         𝐏 ᴀ ɴ ᴇ ʟ   ⚔️                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛

  ◤━━ 🔥 𝐍ᴀᴍᴇ 𝐂ʜᴀɴɢᴇ 𝐀ʀsᴇɴᴀʟ ━━◥
  .f1 [${g('text')}]   🤡🥸🤑  ${g('cursed faces')}
  .f2 [${g('text')}]   🎋🪴🌵  ${g('plants')}
  .f3 [${g('text')}]   🍕🍔🧋  ${g('food & drink')}
  .f4 [${g('text')}]   🏗️🏠🏢  ${g('buildings')}
  .f5 [${g('text')}]   ⚽🏀🥊  ${g('sports')}
  .f6 [${g('text')}]   🎸🎹🥁  ${g('music')}
  .f7 [${g('text')}]   🚂🛳️🏎️  ${g('vehicles')}
  .nc1 ... .nc100      🌌 100 ${g('themed emoji sets')}
  .vampirenc1...10      ⚡ ${g('TRIPLE-SPEED premium sets')}
  .ultranc [${g('text')}]  💥 ${g('ULTRA burst engine')}  | .stopultranc
  .sasnc   [${g('text')}]  🛡️  ${g('SAFE-BURST max engine')}  | .stopsasnc
  .hypernc [${g('text')}]  ⚡ ${g('HYPER rotating-theme burst')}  | .stophyper
  .meganc  [${g('text')}]  💥 ${g('MEGA aggressive multi-thread')}  | .stopmega
  .ultrax  [${g('text')}]  🌌 ${g('ULTRAX emoji + symbol storm')}  | .stopultrax
  .hyper1 … .hyper20  🎨 ${g('20 themed hyper templates')}
  .hyperpanel    📋 ${g('full hyper command center')}
  .snc     [${g('text')}]  ⚡ ${g('STEALTH NC — low-rate cycle')}  | .stopsnc
  .bonusnc [${g('text')}]  🎁 ${g('BONUS NC — rotating burst')}  | .stopbonusnc / .stopbnc
  .fleet            🚢 ${g('show full fleet status')}
  .fleetnc [${g('text')}] 🛳️  ${g('FLEET-WIDE NC across all bots')}  | .stopfleetnc / .stopfnc
  .triple1 .. .triple10 [${g('text')}]  💀 ${g('INSANE TIER engine — L1 warm → L10 apocalypse')}  | .stoptriple
  .setncspeed [${g('ms')}]  ⏱️  ${g('tune ultranc speed')}
  .fstop                  🛑 ${g('stop all name changes')}

  ◤━━ 🌀 𝐂ʏᴄʟᴇ 𝐀ᴛᴛᴀᴄᴋs ━━◥
  .nc      [${g('text')}]   🌀 ${g('word cycle')}    | .stopnc
  .conemo  [${g('text')}]   🏳️ ${g('20 flag cycle')} | .stopconemo
  .ncemo   [${g('text')}]   🎭 ${g('20 emoji cycle')}| .stopncemo

  ◤━━ 🌐 𝐆ʟᴏʙᴀʟ 𝐀ᴛᴛᴀᴄᴋs ━━◥
  .globalnc    [${g('text')}]   ${g('NC all groups distributed')}
  .stopglobalnc
  .globalfast  [${g('text')}]   ${g('ultra-fast NC 100 groups/bot')}
  .stopglobalfast
  .mname       [${g('text')}]   ${g('multi-group name changer')}
  .stopmname
  .gcname      [${g('name')}]   ${g('fastest gc name loop')}
  .stopgcname

  ◤━━ 💬 𝐌ᴇssᴀɢᴇ 𝐀ᴛᴛᴀᴄᴋs ━━◥
  .spam    [${g('text')}]              ${g('flood the chat')}    | .stopspam
  .swipe   [${g('reply')}]             ${g('auto-reply everyone')}| .stopswipe
  .txt     [${g('text')}] [${g('ms')}] ${g('timed text loop')}    | .stoptxt
  .slide   [${g('text')}] [${g('ms')}] ${g('reply-slide spam')}   | .stopslide
  +s  [${g('text')}] [${g('ms')}]      ${g('slide spam shortcut')}
  +txt [${g('text')}] [${g('ms')}]     ${g('text spam shortcut')}

  ◤━━ 🎤 𝐕ᴏɪᴄᴇ & 𝐌ᴇᴅɪᴀ ━━◥
  .voice    [${g('text')}]              ${g('send one voice note')}
  .voiceatk [${g('text')}] [${g('ms')}] ${g('voice spam loop')}    | .stopvoice
  +tts [${g('text')}]                   ${g('send voice (shortcut)')}
  +ttw [${g('text')}] [${g('ms')}]      ${g('voice spam (shortcut)')}
  .img  [${g('ms')}]                    ${g('image spam (reply)')} | .stopimg
  +pic [${g('ms')}]                     ${g('image spam shortcut')}

  ◤━━ 📡 𝐓ᴀɢ & 𝐁ʀᴏᴀᴅᴄᴀsᴛ ━━◥
  .tagall   [${g('msg')}]   📣 ${g('tag every member visibly')}
  .smarttag [${g('msg')}]   📡 ${g('chunked silent tag — large groups')}
  .hidetag  [${g('msg')}]   👁️ ${g('invisible mention ping')}
  .bcast    [${g('msg')}]   📢 ${g('broadcast text to all groups')}
  .broadcast [${g('msg')}]  📢 ${g('alias for .bcast')}

  ◤━━ 🗑️ 𝐁ᴜʟʟʏ 𝐒ʏsᴛᴇᴍ (𝐛𝐨𝐭 = 𝐚𝐝𝐦𝐢𝐧) ━━◥
  .chud           🗑️ ${g('delete the replied message')}
  .tuchud         🎯 ${g('lock target — auto-delete every msg they send')}
  .untuchud       ✅ ${g('release a target')}
  .sabchud        🔒 ${g('GROUP LOCK — auto-delete every message')}
  .unsabchud      🔓 ${g('unlock the group')}

  ◤━━ 🌙 𝐃ᴇsᴄʀɪᴘᴛɪᴏɴ 𝐋ᴏᴏᴘ 🔁 ━━◥
  .dloop  [${g('text')}]    🌙 ${g('rotate group description with random face emojis')}
  .stopdloop          🛑 ${g('stop the description loop')}

  ◤━━ 🖼️ 𝐏ᴀɴᴇʟ 𝐈ᴍᴀɢᴇs ━━◥
  .saveimg  [${g('slot')}] [global]   ${g('reply to image to save')}
  .resetimg [${g('slot')}] [global]   ${g('remove saved image')}
  .listimg                            ${g('list all saved slots')}
  ${g('slots')}: welcome goodbye menu fulladmin atkpanel
         triplepanel vampirencpanel ncpanel funpanel
         tagpanel syspanel broadcast

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   💍  𝐒 ʜ ᴀ ᴅ ɪ   𝐅 ᴜ ɴ   💍   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
  .shadi  [@a] [@b]   💒 ${g('marry two users — full ceremony card')}
  .dulha   [${g('name')}]    🤵 ${g('crown the groom')}
  .dulhan  [${g('name')}]    👰 ${g('crown the bride')}
  .baraat              🥁 ${g('start the baraat parade')}
  .shaadigift          🎁 ${g('random wedding gift')}
  .rishta  [@user]     💌 ${g('send a rishta proposal')}
  .vidaai  [${g('name')}]    💔 ${g('emotional vidaai card')}
  .honeymoon           🌴 ${g('random honeymoon spot')}
  .shadiparty [${g('sec')}]  🎊 ${g('mega celebration loop')} | .stopparty
  .baccha [@a] [@b]    👶 ${g('baccha-making cinematic process')}

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   🎉  𝐅 ᴜ ɴ  /   𝐓  ɪ  ᴍ  ᴇ   ᴘ  ᴀ  s  s   🎉   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
  .ship  [@a] [@b]     💕 ${g('ship two users with %')}
  .shayri              📜 ${g('random shayri')}
  .joke                😂 ${g('random hindi/english joke')}
  .gali  [@user]       🌶️ ${g('light playful roast (PG)')}
  .flirt [@user]       💘 ${g('cheesy flirt line')}
  .truth               🤔 ${g('random truth question')}
  .dare                🔥 ${g('random dare')}
  .hug   [@user]       🤗 ${g('send a hug')}
  .slap  [@user]       👋 ${g('playful slap')}
  .pickup              😏 ${g('cheesy pickup line')}
  .compliment [@user]  🌹 ${g('sweet compliment')}
  .roll                🎲 ${g('roll a dice (1-6)')}
  .coin                🪙 ${g('flip a coin')}
  .8ball [${g('question')}] 🎱 ${g('magic 8-ball')}
  .meme                🤡 ${g('random meme line')}
  .propose [@user]     💍 ${g('propose with one knee + rose')}
  .breakup [@user]     💔 ${g('it is over — emotional breakup')}
  .divorce [@user]     ⚖️ ${g('papers signed, official divorce')}
  .love    [@a] [@b]   💖 ${g('love meter % between two')}
  .crush   [@user]     😍 ${g('reveal a secret crush')}
  .compatibility [@a] [@b]  🔮 ${g('compatibility report card')}

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   🎵  𝐌 ᴜ s  ɪ  ᴄ |   𝐒 ʏ s ᴛ ᴇ ᴍ 🎵          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
  .song [${g('name')}]   🎶 ${g('search a song & send as audio')}
                ${g('e.g.')} .song tum hi ho

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   🛑    𝐒  ᴛ ᴏ ᴘ  |  𝐔 ɴ ɪ  ᴛ  ᴇ    🛑           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
  .killall    ${g('stop every active attack (global)')}
  .gkill      ${g('GLOBAL KILL — every loop everywhere, sessions intact')}
  .stop / .stopallchat   ${g('stop everything in this chat only')}
  .reset      ${g('clear cache & refresh')}
  .name       [${g('text')}]   ${g('super fast name changer')}
  .fastname   [${g('name')}]   ${g('infinite group name loop')}
  .fstop      ${g('stop name loops')}
  .prof       [${g('text')}]   ${g('change profile name')}
  .speed [${g('f1-f7')}] [${g('ms')}]   ${g('set delay for set')}

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   🔧  𝐆 ʀ ᴏ ᴜ ᴘ s | 𝐁 ᴏ ᴛ  s  🔧               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
  .gc         [${g('name')}]   ${g('create groups (max 6)')}
  .autogc     [${g('name')}]   ${g('auto-create hive + bots')}
  .massgc     [${g('name')}]   ${g('create 50 groups rapidly')}
  .addall      ${g('add & promote all bots in group')}
  .addbot      ${g('link a new number')}
  .addsession  ${g('manually reconnect dead session')}
  .bots        ${g('show all session states')}

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃    📡   𝐈  ɴ  ғ  ᴏ  |  𝐃  ɪ  ᴀ  ɢ   📡             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
  .menu       ${g('show this menu')}
  .dashboard  ${g('full bot dashboard')}
  .alive      ${g('list all linked bots')}
  .ping       ${g('check response speed')}
  .live       ${g('active attack counts')}
  .words      ${g('show word list')}
  .atkpanel / .attackpanel   ${g('hacker-style attack control panel')}
  .triplepanel    ${g('triple1-10 ladder panel')}
  .vampirencpanel  ${g('full-fleet ultranc/sasnc panel')}
  .ncpanel        ${g('all NC commands quick reference')}
  .funpanel       ${g('shadi + fun commands panel')}
  .tagpanel       ${g('tag/hidetag/smarttag panel')}
  .syspanel       ${g('system info / diagnostics panel')}

╔══════════════════════════════╗
║   👑    𝐕ᴀᴍᴘɪʀᴇ  𝐆ᴏᴅ  𝐄ᴅɪᴛɪᴏɴ  👑                        ║
╚══════════════════════════════╝`;
};

// ─────────────────────────────────────────────
//  NOTIFICATION STRINGS
// ─────────────────────────────────────────────
const TAG  = `⚡ ${g('𝐂𝐇𝐔𝐃𝐀𝐈 𝐌𝐎𝐃𝐄 𝐎𝐍 🥵')}`;
const win  = what => `${TAG}\n\n▶ ${g(what)} ${g('activated')}`;
const lose = what => `${TAG}\n\n◼ ${g(what)} ${g('deactivated')}`;

// ─────────────────────────────────────────────
//  LOGGING HELPERS
// ─────────────────────────────────────────────
// LOGGER — clean rotating logger with sensitive-data redaction (auth keys, base64 blobs).
// File rotation by day: ./logs/<level>-YYYY-MM-DD.log  and  ./errors/error-YYYY-MM-DD.log
const DEBUG_BOT = (process.env.DEBUG_BOT === '1');
const _logTs = () => new Date().toISOString().slice(11, 23);
const _stripSensitive = (s) => String(s ?? '')
    .replace(/("?(?:noiseKey|signedIdentityKey|signedPreKey|advSecretKey|me|creds|state|auth|priv|pairingCode|sessionData)"?\s*:\s*)("[^"]*"|\{[^}]*\})/gi, '$1"<redacted>"')
    .replace(/[A-Za-z0-9+/]{48,}={0,2}/g, '<b64-redacted>');
const _logTruncate = (m) => { const s = (typeof m === 'string') ? m : (() => { try { return JSON.stringify(m); } catch { return String(m); } })(); return s.length > 800 ? s.slice(0, 800) + '…' : s; };
// OPTIMIZATION: log cleanup — drop libsignal/decrypt/heartbeat noise + dedupe spam
const _LOG_DROP_RE = /(bad mac|session ?cipher|decryptwithsession|no open sessions|message counter|old counter|senderkey|presence|heartbeat|^\s*tick\b)/i;
const _LOG_DEDUPE  = new Map(); // line → expireTs
const _writeLogLine = (level, tag, msg) => {
    try {
        const stripped = _stripSensitive(msg);
        const sample   = (typeof stripped === 'string') ? stripped : String(stripped);
        if (_LOG_DROP_RE.test(sample) && level !== 'ERROR') return;
        const key = `${level}|${tag}|${sample.slice(0,200)}`;
        const exp = _LOG_DEDUPE.get(key) || 0;
        const now = Date.now();
        if (exp > now) return; // suppress identical lines within 10s
        _LOG_DEDUPE.set(key, now + 10_000);
        if (_LOG_DEDUPE.size > 500) { for (const [k,e] of _LOG_DEDUPE) if (e < now) _LOG_DEDUPE.delete(k); }
    } catch {}
    const line = `[${_logTs()}] [${level}] [${tag}] ${_logTruncate(_stripSensitive(msg))}`;
    if (level === 'ERROR') console.error(line);
    else if (level === 'WARN') console.warn(line);
    else console.log(line);
    try {
        const dir = level === 'ERROR' ? './errors' : './logs';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const day = new Date().toISOString().slice(0, 10);
        fs.appendFile(`${dir}/${level.toLowerCase()}-${day}.log`, line + '\n', () => {});
    } catch {}
};
const logInfo  = (tag, msg) => _writeLogLine('INFO',  tag, msg);
const logWarn  = (tag, msg) => _writeLogLine('WARN',  tag, msg);
const logError = (tag, msg) => _writeLogLine('ERROR', tag, msg);
const logDebug = (tag, msg) => { if (DEBUG_BOT) _writeLogLine('DEBUG', tag, msg); };
// Back-compat aliases used throughout the existing codebase
const log  = (tag, msg) => logInfo(tag, msg);
const logi = (tag, msg) => logInfo(tag, `✅ ${msg}`);
const logw = (tag, msg) => logWarn(tag, msg);
const loge = (tag, msg) => logError(tag, msg);

// MONITORING — global error tracker. trackError() funnels every fault into _errorStats
// so .healthstat can show what's failing without spamming logs.
const _errorStats = { commands:0, loops:0, send:0, uncaught:0, unhandled:0, total:0, lastErr:null };
const trackError = (kind, e) => {
    if (typeof _isSuppressedErr === 'function' && _isSuppressedErr(e)) return;
    _errorStats[kind] = (_errorStats[kind] || 0) + 1;
    _errorStats.total++;
    _errorStats.lastErr = { kind, msg: (e?.message || String(e)).slice(0, 240), at: Date.now() };
    logError('TRACK', `[${kind}] ${e?.message || e}`);
};

// FEATURE [DELETE SYSTEM]: target-user delete + full group lock + dloop registry.
// _delTargets : chatId → Set<userJid>  (auto-delete every msg from these users)
// _lockedChats: Set<chatId>            (auto-delete EVERY message in this chat)
// _dloopMap   : chatId → { on:bool }   (group-description rotating loop)
// _moonEmojis : pool of moon faces for .dloop
const _delTargets   = new Map();
const _lockedChats  = new Set();
const _dloopMap     = new Map();
const _flagEmojis   = ['🇹🇻',🇱🇷','🇬🇷','🏴󠁧󠁢󠁷󠁬󠁳󠁿','🇨🇦','🇨🇴','🇯🇵','🇻🇮','🇦🇶','🇦🇷','🇦🇺','🇦🇴','🇦🇸','🇩🇿','🇦🇱','🇦🇽','🇦🇫',🏳‍🌈'];

// ─────────────────────────────────────────────
//  FIX: anti-freeze detector — global last-command timestamp + 10s reset watchdog.
//  If a chat's command pipeline has been silent for >10s while loops are active,
//  we forcibly drain that chat's loops so commands can flow again. The watchdog
//  ONLY resets stuck handlers — it never touches sockets or sessions.
// ─────────────────────────────────────────────
const _lastCmdAt    = new Map();   // chatId → ts of last successful handler return
const _cmdInFlight  = new Map();   // chatId → ts of last command START (cleared on finish)
const _antiFreezeStats = { resets: 0, lastReset: 0 };
const ANTI_FREEZE_MS = 10000;
setInterval(() => {
    const now = Date.now();
    for (const [chat, startTs] of _cmdInFlight) {
        if (now - startTs > ANTI_FREEZE_MS) {
            // command stuck >10s — force-clear in-flight flag so next msg parses fresh
            _cmdInFlight.delete(chat);
            _antiFreezeStats.resets++;
            _antiFreezeStats.lastReset = now;
            // Also drop this chat's hottest loop if any — restores responsiveness
            try {
                const t = chatTasks.get(chat);
                if (t && t.loops.size > 0) {
                    // pause (don't clear) — engines auto-recover when chat goes quiet
                    for (const ctl of t.loops) { try { ctl._paused = true; setTimeout(()=>{ ctl._paused=false; }, 1500); } catch {} }
                }
            } catch {}
        }
    }
}, 5000).unref?.();

// ─────────────────────────────────────────────
//  OPTIMIZATION: CPU yield helper — zero-delay setImmediate yield.
//  Hot loops can call `await _yield()` between bursts to let pending socket
//  events / commands flush WITHOUT slowing down attack speed (no setTimeout,
//  no real wait — just a tick of the event loop).
// ─────────────────────────────────────────────
const _yield = () => new Promise(r => setImmediate(r));

// ─────────────────────────────────────────────
//  SYSTEM: global loop registry — tracks live loop counts across every engine
//  for diagnostics + the .gkill / health panels. Lightweight counter only.
// ─────────────────────────────────────────────
const _globalLoopCount = () => {
    let n = 0;
    try {
        for (const m of [ultraNcLoops, sasNcLoops, tripleNcLoops, _dloopMap, hyperNcLoops, megaNcLoops, ultraXLoops]) {
            for (const [, ctl] of m) if (ctl?.on) n++;
        }
        for (const [, t] of chatTasks) for (const ctl of t.loops) if (ctl?.on) n++;
    } catch {}
    return n;
};

// ─────────────────────────────────────────────
//  SYSTEM: module-level memory cleanup interval.
//  Runs every 90s. Prunes:
//    - _lastCmdAt entries older than 30 min
//    - _cmdInFlight entries older than 60s (already handled, but double-safety)
//    - chatTasks entries with zero loops AND no command for 30 min
//  Sessions / sockets never touched — pure memory hygiene.
// ─────────────────────────────────────────────
setInterval(() => {
    try {
        const now = Date.now();
        const STALE_CMD_MS  = 30 * 60 * 1000;
        const STALE_FLT_MS  = 60 * 1000;
        for (const [chat, ts] of _lastCmdAt) {
            if (now - ts > STALE_CMD_MS) _lastCmdAt.delete(chat);
        }
        for (const [chat, ts] of _cmdInFlight) {
            if (now - ts > STALE_FLT_MS) _cmdInFlight.delete(chat);
        }
        for (const [chat, t] of chatTasks) {
            if (t.loops.size === 0 && (now - (t.lastCmdAt || 0) > STALE_CMD_MS)) {
                chatTasks.delete(chat);
            }
        }
        // also drain any controller marked .on=false but still mapped
        for (const m of [hyperNcLoops, megaNcLoops, ultraXLoops, _dloopMap]) {
            for (const [chat, ctl] of m) {
                if (!ctl || ctl.on === false) m.delete(chat);
            }
        }
    } catch {}
}, 90000).unref?.();

// ─────────────────────────────────────────────
//  FEATURE: HYPER NC ENGINE — fastest standalone name-change engine.
//  Independent of ultranc / sasnc / triplenc — has its own loop maps so it
//  never collides with existing engines. Uses 20 unique emoji template sets.
// ─────────────────────────────────────────────
const hyperNcLoops  = new Map();   // chat → ctl {on, theme, txt, workers}
const megaNcLoops   = new Map();   // chat → ctl
const ultraXLoops   = new Map();   // chat → ctl
const hyperNcSpeed  = { burstDelayMs: 180, burstSize: 5, parallel: 4 };
const megaNcSpeed   = { burstDelayMs: 140, burstSize: 6, parallel: 5 };
const ultraXSpeed   = { burstDelayMs: 200, burstSize: 4, parallel: 3 };
const HYPER_SETS = {
    hyper1:  ['⚡','💻','🔌','🧠','🖥️','⌨️','🖱️','💾'],                 // cyber
    hyper2:  ['☠️','🩸','⚫','🖤','🦴','⚰️','🕷️','🕸️'],                 // dark
    hyper3:  ['🔥','💥','⚡','🌶️','♨️','🧨','🎆','🎇'],                  // fire
    hyper4:  ['🌌','🪐','✨','🌠','☄️','🛸','👾','🌟'],                   // space
    hyper5:  ['🧬','⚠️','♾️','⛔','🚫','💢','〰️','♻️'],                  // glitch
    hyper6:  ['💎','💠','🔷','🔶','🔵','🟣','🟠','🟢'],                   // gem
    hyper7:  ['🌹','🌺','🌸','🌷','💐','🥀','🌻','🪷'],                   // flora
    hyper8:  ['❄️','🧊','💧','🌊','🥶','☃️','⛄','🌨️'],                  // ice
    hyper9:  ['👑','🏆','🥇','💰','💵','💸','🪙','💍'],                   // royal
    hyper10: ['🎭','🃏','🎪','🎨','🎬','🎤','🎧','🎼'],                   // theatre
    hyper11: ['⚔️','🛡️','🏹','🗡️','🪓','🔱','🥷','🥋'],                 // warrior
    hyper12: ['🐉','🐲','🦅','🦁','🐺','🦂','🐍','🦈'],                   // beast
    hyper13: ['🌙','⭐','🌟','✨','💫','🌃','🌌','🔮'],                   // night
    hyper14: ['💀','👻','🎃','🧟','🧛','🧞','😈','👹'],                   // horror
    hyper15: ['🎯','🎲','🎰','🎳','🃏','♠️','♥️','♣️'],                  // game
    hyper16: ['🌈','🦄','🍭','🧁','🎀','💖','💝','🌸'],                   // pastel
    hyper17: ['⚙️','🔩','🔧','🛠️','⚗️','🧪','🔬','🔭'],                 // mech
    hyper18: ['🚀','🛰️','🛸','🌍','🌏','🌎','🌐','🛬'],                  // launch
    hyper19: ['🪦','⚱️','🩻','💉','🧠','👁️','🦷','🫀'],                 // bio
    hyper20: ['🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜'],                   // matrix
};
const HYPER_SET_KEYS = Object.keys(HYPER_SETS);
const _pickHyperEmoji = (theme) => {
    const set = HYPER_SETS[theme] || HYPER_SETS.hyper1;
    return set[Math.floor(Math.random() * set.length)];
};
// FEATURE: ultrax mixed pool — symbols + emoji + zalgo-light spacers
const ULTRAX_POOL = ['⚡','💥','🔥','☠️','💀','⚔️','🩸','🌑','🌌','💢','♾️','⚜️','卐','✦','✧','★','☆','⟁','◈','◇','▲','▼','◉','⊛','⊕','✺','✹','✸'];

// FIX: per-group task isolation — every chat gets its own loop registry + active flag.
// Lets .stopallchat drain a single group without touching other groups' running attacks.
const chatTasks = new Map(); // chatId → { loops:Set, active:bool, lastCmdAt:number }
const getChatTasks = (chatId) => {
    let t = chatTasks.get(chatId);
    if (!t) { t = { loops: new Set(), active: true, lastCmdAt: 0 }; chatTasks.set(chatId, t); }
    return t;
};
const registerChatLoop   = (chatId, ctl) => { getChatTasks(chatId).loops.add(ctl); return ctl; };
const unregisterChatLoop = (chatId, ctl) => { const t = chatTasks.get(chatId); if (t) t.loops.delete(ctl); };
const stopAllChatLoops   = (chatId) => {
    const t = chatTasks.get(chatId); if (!t) return 0;
    let n = 0; for (const ctl of t.loops) { try { ctl.on = false; n++; } catch {} } t.loops.clear(); return n;
};

// ─────────────────────────────────────────────
//  PERSISTENCE HELPERS
// ─────────────────────────────────────────────
const ensureDir = p => { const d=p.includes('/')?p.substring(0,p.lastIndexOf('/')):'.'; if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true}); };
const readJson  = (p,def) => { try{ if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p,'utf8')); }catch{} return {...def}; };
const writeJson = (p,d)   => { try{ ensureDir(p); fs.writeFileSync(p,JSON.stringify(d,null,2)); }catch{} };

let userData  = readJson(PATH_USERS,  { owners:[], subs:{}, fullAdmins:[], controlGc:null, trustedUsers:[], welcomeGroups:[] });
// [NEW SYSTEM] backwards-compat — old users.json may not have welcomeGroups
if(!Array.isArray(userData.welcomeGroups)) userData.welcomeGroups = [];
let timingMap = readJson(PATH_TIMING, { f1:30,f2:30,f3:30,f4:30,f5:30,f6:30,f7:30 });

if (!userData.fullAdmins)    userData.fullAdmins = [];
if (!userData.trustedUsers)  userData.trustedUsers = [];

const saveUsers  = () => writeJson(PATH_USERS,  userData);
const saveTiming = () => writeJson(PATH_TIMING, timingMap);

// ─────────────────────────────────────────────
//  ACCESS CONTROL
// ─────────────────────────────────────────────
const isOwner      = j => userData.owners.includes(j);
const isFullAdmin  = j => userData.fullAdmins?.includes(j) || isOwner(j);
const isTrusted    = j => userData.trustedUsers?.includes(j) || isFullAdmin(j);
const isSub        = (j,grp) => userData.subs[grp]?.includes(j) || isTrusted(j);
const canUse       = (j,grp) => isOwner(j) || isTrusted(j) || isSub(j,grp);

const grantOwner      = j => { if(!userData.owners.includes(j)){userData.owners.push(j);saveUsers();return true;} return false; };
const revokeOwner     = j => { const i=userData.owners.indexOf(j);if(i>-1){userData.owners.splice(i,1);saveUsers();return true;}return false; };
const grantFullAdmin  = j => { if(!userData.fullAdmins.includes(j)){userData.fullAdmins.push(j);saveUsers();return true;} return false; };
const revokeFullAdmin = j => { const i=userData.fullAdmins.indexOf(j);if(i>-1){userData.fullAdmins.splice(i,1);saveUsers();return true;}return false; };
const grantTrusted    = j => { if(!userData.trustedUsers.includes(j)){userData.trustedUsers.push(j);saveUsers();return true;} return false; };
const revokeTrusted   = j => { const i=userData.trustedUsers.indexOf(j);if(i>-1){userData.trustedUsers.splice(i,1);saveUsers();return true;}return false; };
const grantSub        = (j,grp) => { if(!userData.subs[grp])userData.subs[grp]=[]; if(!userData.subs[grp].includes(j)){userData.subs[grp].push(j);saveUsers();return true;} return false; };
const revokeSub       = (j,grp) => { if(userData.subs[grp]){const i=userData.subs[grp].indexOf(j);if(i>-1){userData.subs[grp].splice(i,1);saveUsers();return true;}} return false; };

// [NEW SYSTEM] dispatch table — auto-registers every nc set including the
// procedurally-built nc10..nc100 and the .vampirenc1..10 triple-speed bank.
const SET_KEYS = { f1:'faces',f2:'hearts',f3:'hands',f4:'flowers',f5:'sky',f6:'animals',f7:'fruits' };
for(let i = 1; i <= 100; i++)  SET_KEYS[`nc${i}`]      = `nc${i}`;
for(let i = 1; i <= 10;  i++)  SET_KEYS[`vampirenc${i}`] = `vampirenc${i}`;

// ─────────────────────────────────────────────
//  TTS HELPER
// ─────────────────────────────────────────────
const HAS_FFMPEG = (() => {
    try { return !!ffmpegPath && spawnSync(ffmpegPath,['-version'],{encoding:'utf8'}).status===0; }
    catch { return false; }
})();

if(!HAS_FFMPEG) logw('BOT','ffmpeg not found — voice notes will play on web only. Install ffmpeg for mobile support.');
else            logi('BOT','ffmpeg found — voice notes will work on all platforms.');

const makeTTS = (text, lang='en') => new Promise((res,rej)=>{
    const chunks=[];
    gtts(lang).stream(text)
        .on('data',c=>chunks.push(c))
        .on('end',()=>{
            const mp3=Buffer.concat(chunks);
            if(HAS_FFMPEG){
                const r=spawnSync(ffmpegPath,[
                    '-y','-i','pipe:0',
                    '-acodec','libopus','-b:a','24k',
                    '-vbr','on','-compression_level','10',
                    '-f','ogg','pipe:1'
                ],{ input:mp3, maxBuffer:10*1024*1024 });
                if(r.status===0 && r.stdout?.length>0){
                    res({ buffer:r.stdout, mimetype:'audio/ogg; codecs=opus', ptt:true });
                    return;
                }
                logw('TTS','ffmpeg conversion failed, falling back to mp3');
            }
            res({ buffer:mp3, mimetype:'audio/mpeg', ptt:false });
        })
        .on('error',rej);
});

// ─────────────────────────────────────────────
//  RATE LIMIT DETECTION
// ─────────────────────────────────────────────
const isRateErr = e => {
    const msg=(e?.message||'').toLowerCase();
    const code=e?.output?.statusCode;
    return msg.includes('rate') || msg.includes('overlimit') || msg.includes('wait') ||
           msg.includes('spam') || msg.includes('too many') || code===429 || code===503;
};

// ─────────────────────────────────────────────
//  ASYNC QUEUE
// ─────────────────────────────────────────────
class AsyncQueue {
    constructor(){ this._queues = new Map(); }

    run(key, fn){
        if(!this._queues.has(key)) this._queues.set(key, Promise.resolve());
        const chain = this._queues.get(key).then(fn).catch(()=>{});
        this._queues.set(key, chain);
        return chain;
    }

    gc(){
        for(const [k,p] of this._queues){
            Promise.resolve(p).then(()=>this._queues.delete(k)).catch(()=>{});
        }
    }
}

// ─────────────────────────────────────────────
//  PER-BOT SECOND-RATE CAPS
// ─────────────────────────────────────────────
class SecRateCap {
    constructor(msgSec=MAX_MSG_PER_SEC, grpSec=MAX_GRP_PER_SEC){
        this.msgSec=msgSec; this.grpSec=grpSec;
        this.msgN=0; this.grpN=0;
        this._t=Date.now();
    }
    _tick(){ const now=Date.now(); if(now-this._t>=1000){this.msgN=0;this.grpN=0;this._t=now;} }
    canMsg(){ this._tick(); return this.msgN<this.msgSec; }
    canGrp(){ this._tick(); return this.grpN<this.grpSec; }
    hitMsg(){ this.msgN++; }
    hitGrp(){ this.grpN++; }
    async waitMsg(){ this._tick(); if(this.msgN>=this.msgSec){ await delay(1000-(Date.now()-this._t)); this._tick(); } }
    async waitGrp(){ this._tick(); if(this.grpN>=this.grpSec){ await delay(1000-(Date.now()-this._t)); this._tick(); } }
}

// ─────────────────────────────────────────────
//  PER-SESSION RATE LIMITER — Exponential backoff
// ─────────────────────────────────────────────
class RateLimiter {
    constructor(id){
        this.id       = id;
        this.until    = 0;
        this.session  = null;
        this.hitCount = 0;
        this._cleanTimer = null;
    }

    hit(){
        this.hitCount++;
        const pauseMs = Math.min(Math.pow(2, this.hitCount) * 60000, 30 * 60 * 1000);
        this.until = Date.now() + pauseMs;
        if(this.session && this.session.state === SESSION_STATE.ACTIVE){
            this.session.state = SESSION_STATE.PAUSED;
        }
        logw(this.id, `[RESTRICTED] Rate limited (hit #${this.hitCount}) — pausing ${pauseMs/1000}s`);
        if(this._cleanTimer) clearTimeout(this._cleanTimer);
        this._cleanTimer = setTimeout(() => { this.hitCount = 0; }, 10 * 60 * 1000);
    }

    isPaused(){ return Date.now() < this.until; }

    async wait(){
        if(this.isPaused()){
            const remaining = this.until - Date.now();
            logw(this.id, `Rate limiter: waiting ${Math.round(remaining/1000)}s before resuming`);
            await delay(remaining);
        }
        if(this.session && this.session.state === SESSION_STATE.PAUSED){
            this.session.state = SESSION_STATE.ACTIVE;
            logi(this.id, 'Rate limiter: session resumed after backoff');
        }
    }
}

// ═════════════════════════════════════════════
//  SMART CORE — anti-ban intelligence per session
// ═════════════════════════════════════════════
class SmartCore {
    constructor(id){
        this.id          = id;
        this.health      = 100;
        this.msgCount    = 0;
        this._resetTimer = null;
        this.mode        = 'safe';
        this._startMsgCounter();
    }

    jitter(){
        const base = JITTER_MIN_MS + Math.random()*(JITTER_MAX_MS - JITTER_MIN_MS);
        if(this.mode === 'turbo')   return 0;
        if(this.mode === 'fast')    return base * 0.4;
        if(this.mode === 'stealth') return base * 3.5;
        return base;
    }

    cap(){ return MODE_CAPS[this.mode] ?? MODE_CAPS.safe; }
    isThrottled(){ return this.msgCount >= this.cap(); }

    async waitThrottle(){
        while(this.isThrottled()){ await delay(turboWait(this.mode)); }
    }

    tick(){ this.msgCount++; }

    _startMsgCounter(){
        this._resetTimer = setInterval(()=>{ try{ this.msgCount=0; }catch{} }, 60000);
        if(this._resetTimer.unref) this._resetTimer.unref();
    }

    // [MEMORY FIX] explicit timer disposal — called from Session.destroy()
    dispose(){
        try { if(this._resetTimer){ clearInterval(this._resetTimer); this._resetTimer=null; } } catch{}
    }

    penalize(points=10){ this.health=Math.max(0,this.health-points); }
    reward(points=2)   { this.health=Math.min(100,this.health+points); }
    isHealthy()        { return this.health >= 30; }

    static isRestrictionErr(e){
        const msg=(e?.message||e?.data?.reason||'').toLowerCase();
        const code=e?.output?.statusCode||e?.code;
        return msg.includes('restrict') || msg.includes('spam') ||
               msg.includes('rate') || msg.includes('bulk') ||
               msg.includes('block') || code===479 || code===428 ||
               code===470 || code===432;
    }

    setMode(m){
        if(Object.keys(MODE_CAPS).includes(m)){ this.mode=m; return true; }
        return false;
    }

    async simulateTyping(socket, jid){
        if(!socket || this.mode !== 'stealth') return;
        try{
            await socket.sendPresenceUpdate('composing', jid);
            await delay(TYPING_SIM_MS + Math.random()*200);
            await socket.sendPresenceUpdate('paused', jid);
        }catch{}
    }

    status(){
        return {
            id      : this.id,
            health  : this.health,
            mode    : this.mode,
            cap     : this.cap(),
            msgMin  : this.msgCount,
            throttle: this.isThrottled() ? 'THROTTLED' : 'OK'
        };
    }
}

const turboWait = m => m === 'turbo' ? 200 : m === 'fast' ? 800 : 2000;

// ─────────────────────────────────────────────
//  GEO / IP CONSISTENCY TRACKER
//  On IP mismatch → PAUSE bot instead of reconnect
// ─────────────────────────────────────────────
let geoData = readJson(PATH_GEO, {});

const saveGeo = () => writeJson(PATH_GEO, geoData);

const checkGeoConsistency = (sessionId, currentIp, sessionRef) => {
    if(!currentIp) return 'ok';
    const stored = geoData[sessionId];
    if(!stored){
        geoData[sessionId] = { ip: currentIp, firstSeen: Date.now(), lastSeen: Date.now(), changes: 0 };
        saveGeo();
        logi(sessionId, `[GEO] IP registered: ${currentIp}`);
        return 'ok';
    }
    if(stored.ip !== currentIp){
        stored.changes++;
        logw(sessionId, `[IP MISMATCH] was: ${stored.ip} → now: ${currentIp} — pausing bot (change #${stored.changes})`);
        // Pause the bot instead of reconnecting — suspicious login prevention
        if(sessionRef && sessionRef.state === SESSION_STATE.ACTIVE){
            sessionRef.state = SESSION_STATE.PAUSED;
            // Auto-resume after 10 minutes
            setTimeout(() => {
                if(sessionRef.state === SESSION_STATE.PAUSED){
                    sessionRef.state = SESSION_STATE.ACTIVE;
                    logi(sessionId, '[IP MISMATCH] Auto-resumed after 10min pause');
                }
            }, 10 * 60 * 1000);
        }
        stored.lastSeen = Date.now();
        saveGeo();
        return 'mismatch';
    }
    stored.lastSeen = Date.now();
    saveGeo();
    return 'ok';
};

const resolveCurrentIp = () => new Promise(resolve => {
    const req = http.get('http://api.ipify.org', res => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => resolve(data.trim()));
    });
    req.setTimeout(5000);
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
});

// ─────────────────────────────────────────────
//  STABLE INPUT SYSTEM
//  Single global readline instance — created ONCE, NEVER recreated.
//  safeInput() reads via buffered stdin data events so partial chunks
//  (common on RDP/SSH terminals) are accumulated until a full line arrives.
//  askPhone() loops until a fully validated 10–15 digit number is entered.
// ─────────────────────────────────────────────
let _rl = null;

// getRl() — create the ONE global readline instance, keeping stdin open.
// terminal:false prevents raw-TTY processing that causes RDP auto-submit issues.
// safeInput() handles the actual reading via raw stdin data events.
const getRl = () => {
    if (_rl) return _rl;
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    _rl = readline.createInterface({
        input   : process.stdin,
        output  : process.stdout,
        terminal: false,   // no raw-TTY — safeInput handles buffering itself
    });
    _rl.on('close', () => { _rl = null; });
    return _rl;
};

// safeInput() — RDP-safe buffered input.
// Accumulates raw stdin chunks until a newline arrives, then resolves.
// This avoids rl.once('line') being triggered by partial/auto-submitted input.
const safeInput = (prompt) => new Promise((resolve) => {
    getRl(); // ensure readline keeps stdin open and resumed
    process.stdout.write(prompt);

    let buffer = '';

    const onData = (chunk) => {
        chunk = chunk.toString();
        if (chunk.includes('\n')) {
            // Add everything before the newline to the buffer, then resolve
            const nl = chunk.indexOf('\n');
            buffer += chunk.slice(0, nl);
            process.stdin.off('data', onData);
            resolve(buffer.trim());
        } else {
            buffer += chunk;
        }
    };

    process.stdin.on('data', onData);
});

// askPhone() — asks for phone, validates, retries until valid.
// Uses a temp variable — only returns once validation is COMPLETE.
// Supports process.env.PHONE to skip interactive input entirely.
// Called ONLY ONCE globally from boot() — guarded against parallel calls.
let _askPhoneInProgress = false;

const askPhone = async () => {
    // Block parallel calls — only one phone prompt allowed at a time
    if (_askPhoneInProgress) {
        logw('HUB', '[PHONE] askPhone() already in progress — blocking duplicate call');
        while (_askPhoneInProgress) await delay(500);
        return null;
    }
    _askPhoneInProgress = true;

    try {
        // Check env variable first — validated before returning
        const envRaw = (process.env.PHONE || '').replace(/\D/g, '');
        if (envRaw.length >= 10 && envRaw.length <= 15) {
            const inputPhone = envRaw;
            log('HUB', `[PHONE] Using PHONE environment variable: ${inputPhone}`);
            log('HUB', `[PHONE] Final phone assigned: ${inputPhone}`);
            return inputPhone;
        }

        console.log('\n[HUB] No active sessions found.\n');

        // Loop until a full, valid number is entered — DO NOT continue with partial input
        while (true) {
            log('HUB', '[PHONE] Waiting for full number input...');
            const raw = await safeInput('[HUB] Enter phone number with country code (e.g. 919876543210, no + or spaces): ');
            // Temp variable — not assigned anywhere until validation passes
            const inputPhone = raw.replace(/\D/g, '');
            log('HUB', `[PHONE] Received: "${inputPhone}" (${inputPhone.length} digits)`);

            // Strict length check BEFORE accepting — never use partial input
            if (inputPhone.length < 10 || inputPhone.length > 15) {
                logw('HUB', `[PHONE] Invalid — need 10–15 digits, got ${inputPhone.length}. Try again.`);
                continue;
            }

            // Validation passed — only now is the number considered final
            log('HUB', `[PHONE] Valid number accepted: ${inputPhone}`);
            log('HUB', `[PHONE] Final phone assigned: ${inputPhone}`);
            return inputPhone;
        }
    } finally {
        _askPhoneInProgress = false;
    }
};

// ═════════════════════════════════════════════
//  MESSAGE ROUTER
// ═════════════════════════════════════════════
class Router {
    constructor(){
        this.registry = new Map();
        this.processed= new Map();
        setInterval(()=>{ const n=Date.now(); for(const[k,v]of this.processed)if(n-v>90000)this.processed.delete(k); },90000);
    }
    attach(id,session){ this.registry.set(id,session); }
    detach(id)        { this.registry.delete(id); }
    dedupe(msgId)     { if(this.processed.has(msgId))return false; this.processed.set(msgId,Date.now()); return true; }
    push(cmd,payload,fromId,notify=true){
        const alive=[...this.registry.values()].filter(s=>s.online && s.state===SESSION_STATE.ACTIVE);
        return Promise.all(alive.map(s=>s.handle(cmd,payload,s.id===fromId&&notify).catch(e=>loge(s.id,e.message))));
    }
    pushAll(cmd,payload,fromId,notify=true,targetGid=null){
        const all=[...this.registry.values()];
        return Promise.all(all.map(s=>s.handle(cmd,payload,s.id===fromId&&notify,targetGid).catch(e=>loge(s.id,e.message))));
    }
    pushToGcs(cmd,payload,fromId,notify=true,gcs=[]){
        const all=[...this.registry.values()].filter(s=>s.state!==SESSION_STATE.DEAD && s.state!==SESSION_STATE.LOCKED);
        return Promise.all(gcs.flatMap(gid =>
            all.map(s => s.handle(cmd,payload,s.id===fromId&&notify,gid).catch(e=>loge(s.id,e.message)))
        ));
    }
    getAll()    { return [...this.registry.values()]; }
    getAlive()  {
        // Return only truly online+active sessions, deduplicated by phone number
        const seen = new Set();
        return [...this.registry.values()].filter(s => {
            if (!s || !s.online || !s.socket || s.state !== SESSION_STATE.ACTIVE) return false;
            const num = s.self?.split('@')[0];
            if (!num) return true; // include if no number known yet (still pairing)
            if (seen.has(num)) return false;
            seen.add(num);
            return true;
        });
    }
    getPrimary(){ const a=[...this.registry.values()].filter(s=>s.online && s.state===SESSION_STATE.ACTIVE); return a[0]||null; }
}

// ═════════════════════════════════════════════
//  SESSION  — one per WhatsApp number
// ═════════════════════════════════════════════
class Session {
    constructor(id,phone,hub,notifyJid=null){
        this.id        = id;
        this.phone     = phone;
        this.hub       = hub;
        this.notifyJid = notifyJid;
        this.socket    = null;
        this.online    = false;
        this.self      = null;
        this.didPair   = false;
        this.limiter   = new RateLimiter(id);
        this.limiter.session = this;

        this.core = new SmartCore(id);

        this.state         = SESSION_STATE.ACTIVE;
        this.retryCount    = 0;
        this._lastConnectTime = 0;
        this._initLocked   = false;   // prevents concurrent init() calls
        this.connectedAt   = 0;       // [STABILITY FIX] timestamp of current online session — for .session uptime
        this.lastOnline    = 0;       // [STABILITY FIX] timestamp of last time this session was online — for .session

        // Unique session folder — NEVER reused or overwritten
        this.sessionDir = PATH_AUTH(this.id);

        // Fingerprint — randomized once, saved, never changes
        this._fingerprint = getOrCreateFingerprint(this.id);

        this._pairingActive  = false;  // pairing lock — disables watchdog while pairing
        this._pairingStarted = false;  // one-shot lock — ensures pairing runs ONLY ONCE per session lifetime
        this._reconnecting   = false;  // true while connection.close retry is in progress — prevents watchdog double-init
        // FIX [24/7]: stamp of last inbound traffic from WhatsApp servers (any event:
        // messages.upsert, creds.update, presence.update, group event, etc). Used by the
        // inbound-silence watchdog to detect "WS open but actually frozen" — the exact
        // failure mode where the bot stopped responding on the user's RDP.
        this._lastInboundAt  = Date.now();

        this.nameLoops  = new Map();
        this.wordLoop   = new Map();
        this.flagLoop   = new Map();
        this.emojiLoop  = new Map();
        this.spamLoop   = new Map();
        this.swipeLoop  = new Map();
        this.txtLoop    = new Map();
        this.slideLoop  = new Map();
        this.voiceLoop  = new Map();
        this.imgLoop    = new Map();
        this.gcnameLoop = new Map();

        this.secCap     = new SecRateCap();
        this.queue      = new AsyncQueue();
        // [MEMORY FIX] track ALL setInterval handles so destroy() can clear them — no orphaned timers after a session dies
        this._intervals = [];
        this._intervals.push(setInterval(()=>{ try{ this.queue.gc(); }catch{} }, 5 * 60 * 1000));

        // Periodic loop GC — clear stale entries that are no longer active
        // [MEMORY FIX] wrapped in try/catch + tracked for cleanup
        this._intervals.push(setInterval(()=>{
            try {
                for(const map of [this.nameLoops, this.wordLoop, this.flagLoop, this.emojiLoop,
                    this.spamLoop, this.swipeLoop, this.txtLoop, this.slideLoop,
                    this.voiceLoop, this.imgLoop, this.gcnameLoop]){
                    for(const [k,v] of map){
                        if(v === false) { map.delete(k); continue; }
                        if(v && typeof v === 'object'){
                            const stale = ('on' in v && !v.on) || ('live' in v && !v.live);
                            if(stale) map.delete(k);
                        }
                    }
                }
            } catch{}
        }, 2 * 60 * 1000));
    }

    // [MEMORY FIX] proper teardown — clear timers, kill loops, drop sockets, release maps
    // [NEW SYSTEM] invisible session keep-alive heartbeat
    // Sends `presenceUpdate('available')` every 30-60s with random jitter.
    // This is what real WhatsApp clients do — keeps the WS session warm so
    // long-idle sessions don't die. Does NOT trigger rate limits, does NOT
    // notify groups, and does NOT interrupt running attack loops.
    // OPTIMIZATION + FIX: aggressive keepalive — sessions used to die after long idle.
    // Three-layer system:
    //   1. presenceUpdate('available') every 15-25s (was 30-60s)
    //   2. presenceUpdate('composing'→'paused') every 90-150s — mimics real client typing tick
    //   3. deadman watchdog every 60s — if last successful heartbeat > 180s, force re-init
    // All firings are silent (no logs, no group notification) and fire-and-forget.
    _startKeepAlive(){
        try { this._stopKeepAlive(); } catch {} // never stack
        this._lastHeartbeatOk = Date.now();
        const tick = async () => {
            if(!this.socket || !this.online) return;
            if(this.state===SESSION_STATE.RESTRICTED || this.state===SESSION_STATE.DEAD || this.state===SESSION_STATE.LOCKED) return;
            // FIX: heartbeat — track the timeout handle so we can clear it on the
            // happy path. Without this, every 12-18s a setTimeout was leaked
            // (orphan timers piled up forever — thousands per day per session).
            let _hbTimer = null;
            try {
                // FIX [SYNCING- 𝐕ᴀ𝐌ᴘ𝐈ʀ𝐄  𝕍ᴇʀ𝕤ɪᴏɴ-𝟑𝟘]: send 'available' so phone sees the linked device as
                // ONLINE on every heartbeat. Earlier this was 'unavailable' which made
                // the phone think every linked device was background → WhatsApp kept
                // showing "Syncing. Keep app open." for ALL sessions, forever.
                // FIX [HEARTBEAT-HANG]: race the presence send against a 5s timeout.
                // FIX [LIVENESS-PROBE]: also issue a no-op groupFetchAllParticipating
                // race to prove the WS is actually round-tripping — sometimes presence
                // succeeds locally but the underlying socket is half-dead. If THAT
                // succeeds we KNOW the socket is fully alive and reset the watchdog.
                await Promise.race([
                    this.socket.sendPresenceUpdate('available'),
                    new Promise((_, rej) => { _hbTimer = setTimeout(() => rej(new Error('hb-timeout')), 5000); if(_hbTimer.unref) _hbTimer.unref(); }),
                ]);
                this._lastHeartbeatOk = Date.now();
            } catch(e){ if(!_isSuppressedErr(e)) { /* silent — deadman handles real death */ } }
            finally { if(_hbTimer){ try{ clearTimeout(_hbTimer); }catch{} } }
        };
        // FIX [SCHEDULER-DEATH]: schedule next heartbeat BEFORE awaiting the current
        // tick, so even if tick() hangs the chain keeps firing. Combined with the
        // 5s timeout above, this makes the keepalive truly self-healing.
        const schedule = () => {
            const nextMs = 12000 + Math.round(Math.random() * 6000); // 12-18s jitter
            this._keepAliveTimer = setTimeout(() => {
                // Re-arm the scheduler IMMEDIATELY — never wait on tick() to finish
                if(this.online) schedule();
                // Fire-and-forget the actual presence ping
                tick().catch(()=>{});
            }, nextMs);
            if(this._keepAliveTimer.unref) this._keepAliveTimer.unref();
        };
        schedule();
        // FEATURE: deadman watchdog — auto-revive a session whose socket has gone silent.
        // Fires every 60s. If no successful presence update in 180s AND we're supposed to be online,
        // forcibly re-initialise the session. This is what stops sessions from dying after long idle.
        if(this._deadmanTimer){ try { clearInterval(this._deadmanTimer); } catch{} }
        this._deadmanTimer = setInterval(() => {
            try {
                if(!this.online) return; // disconnected sessions handled by reconnect flow
                if(this.state===SESSION_STATE.DEAD || this.state===SESSION_STATE.LOCKED || this.state===SESSION_STATE.RESTRICTED) return;
                const since = Date.now() - (this._lastHeartbeatOk||0);
                // FIX: watchdog — tightened 180s → 60s. With 12-18s heartbeat, this means
                // 3-5 missed beats triggers a forced reconnect (was 10-15 missed beats).
                // FIX: session watchdog — shared 60s cooldown across deadman / heal / hb-sweep
                // so an offline session is never re-init()'d more than once per minute by the
                // watchdog trio. Prevents reconnect-spam → DEAD-state oscillation.
                const _wdNow = Date.now();
                // FIX [24/7]: inbound-silence detector — the most important watchdog.
                // Triggers when the WebSocket has been completely silent (no messages,
                // no presence, no creds, no group events) for 4+ minutes WHILE we still
                // think we're online. This is exactly the failure mode the user hit on
                // RDP — bot looked alive but stopped replying. Force-reconnect anyway.
                const inboundSilence = Date.now() - (this._lastInboundAt || 0);
                if(inboundSilence > 240_000 && !this._reconnecting && !this._initLocked
                   && _wdNow - (this._lastWatchdogKickAt || 0) > 60_000){
                    logw(this.id, `[DEADMAN] no INBOUND traffic for ${Math.round(inboundSilence/1000)}s — forcing re-init`);
                    this.online = false;
                    this._reconnecting = true;
                    this._lastWatchdogKickAt = _wdNow;
                    setImmediate(async () => {
                        try { this.socket?.end?.(new Error('deadman-revive')); } catch{}
                        await delay(1500);
                        this._reconnecting = false;
                        try { this.init(); } catch(e){ if(!_isSuppressedErr(e)) loge(this.id, `inbound-silence re-init err: ${e?.message||e}`); }
                    });
                    return;
                }
                if(since > 60000 && !this._reconnecting && !this._initLocked
                   && _wdNow - (this._lastWatchdogKickAt || 0) > 60_000){
                    // FIX [FALSE-DEADMAN]: before forcing reconnect, double-check the actual
                    // WebSocket readyState. If WS is OPEN (1) the socket is genuinely alive
                    // and our heartbeat staleness was just rate-limit/silent-drop noise — no
                    // need to tear down a healthy connection. Just refresh the stamp and let
                    // the next outbound activity confirm liveness.
                    // readyState: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
                    const wsState = this.socket?.ws?.readyState;
                    // FIX [HALF-DEAD-WS]: previously, ANY ws.readyState===1 made us
                    // skip reconnect — but on RDP / NAT-timeout / power-throttle the
                    // socket can stay in OPEN state while completely silent. Result:
                    // bot looked alive in the dashboard but stopped replying to
                    // messages. Now we only trust readyState===1 if the silence is
                    // shorter than 120s. Past that, force a reconnect regardless of
                    // what the WS layer thinks.
                    if(wsState === 1 && since < 120_000){
                        this._lastHeartbeatOk = Date.now();
                        return;
                    }
                    logw(this.id, `[DEADMAN] no heartbeat for ${Math.round(since/1000)}s, ws=${wsState} — forcing re-init`);
                    this.online = false;
                    this._reconnecting = true;
                    this._lastWatchdogKickAt = _wdNow;   // FIX: session watchdog — claim the cooldown slot
                    setImmediate(async () => {
                        try { this.socket?.end?.(new Error('deadman-revive')); } catch{}
                        await delay(1500);
                        this._reconnecting = false;
                        try { this.init(); } catch(e){ if(!_isSuppressedErr(e)) loge(this.id, `deadman re-init err: ${e?.message||e}`); }
                    });
                }
            } catch{}
        }, 30000);     // FIX: watchdog — check every 30s (was 60s) — twice as fast freeze detection
        if(this._deadmanTimer.unref) this._deadmanTimer.unref();
    }
    _stopKeepAlive(){
        if(this._keepAliveTimer){
            try { clearTimeout(this._keepAliveTimer); } catch {}
            this._keepAliveTimer = null;
        }
        // OPTIMIZATION: also tear down the deadman watchdog
        if(this._deadmanTimer){
            try { clearInterval(this._deadmanTimer); } catch {}
            this._deadmanTimer = null;
        }
    }

    destroy(){
        try {
            // [NEW SYSTEM] stop keep-alive heartbeat first so it never fires after destroy
            this._stopKeepAlive();
            // 1. clear all tracked intervals (queue gc + loop gc)
            for(const h of this._intervals||[]){ try{ clearInterval(h); }catch{} }
            this._intervals = [];
            // 2. clear smartcore reset timer
            try { this.core?.dispose?.(); } catch{}
            // 3. mark every loop control object stopped
            for(const map of [this.nameLoops,this.wordLoop,this.flagLoop,this.emojiLoop,
                this.spamLoop,this.swipeLoop,this.txtLoop,this.slideLoop,
                this.voiceLoop,this.imgLoop,this.gcnameLoop]){
                if(!map) continue;
                for(const [,v] of map){
                    if(v && typeof v==='object'){
                        if('on'   in v) v.on   = false;
                        if('live' in v) v.live = false;
                    }
                }
                map.clear();
            }
            // 4. detach socket listeners (avoid leaking emitters across reconnects)
            try { this.socket?.ev?.removeAllListeners?.(); } catch{}
            this.socket = null;
            this.online = false;
        } catch(e){ try{ logw(this.id,`destroy err: ${e?.message||e}`); }catch{} }
    }

    // ── send pairing code to notifyJid ────────
    async _sendPairCode(code){
        const msg = code;
        for(let attempt=0; attempt<3; attempt++){
            const first = this.hub.router.getPrimary();
            if(first && first.socket && first.online){
                try{
                    await first.socket.sendMessage(this.notifyJid, {text:msg});
                    logi(this.id,'Pairing code sent to chat');
                    return;
                }catch(e){ loge(this.id,`pair notify err: ${e.message}`); }
            }
            await delay(2000);
        }
        log(this.id,`🔑 PAIR CODE (send manually): ${code}`);
    }

    // ── Delete auth files for this session (frees WA linked device slot on next WA GC) ──
    _clearAuthFiles(){
        try{
            const dir = this.sessionDir;
            if(!fs.existsSync(dir)) return;
            for(const f of fs.readdirSync(dir)){
                try{ fs.unlinkSync(`${dir}/${f}`); }catch{}
            }
            try{ fs.rmdirSync(dir); }catch{}
            logw(this.id, `[AUTH CLEAR] Session files deleted — slot freed`);
        }catch(e){ loge(this.id,`_clearAuthFiles err: ${e.message}`); }
    }

    async init(){
        // ── ANTI-REPLACE: Prevent concurrent init() calls on same session ──
        if(this._initLocked){
            logw(this.id, '[LOCK] init() already running — skipping duplicate call');
            return;
        }
        this._initLocked = true;

        try{
            // ── MULTI-SESSION: Allow up to MAX_SESSIONS_PER_PHONE per number ──
            if(this.phone){
                const existingSessions = activePhoneRegistry.get(this.phone);
                if(existingSessions && !existingSessions.has(this.id)){
                    // Count how many are truly online+active (excluding this session)
                    let activeCount = 0;
                    for(const sid of existingSessions){
                        const s = this.hub.sessions.get(sid);
                        if(s && s.online && s.state === SESSION_STATE.ACTIVE) activeCount++;
                    }
                    if(activeCount >= MAX_SESSIONS_PER_PHONE){
                        logw(this.id, `[MULTI-SESSION] Phone +${this.phone} already has ${activeCount}/${MAX_SESSIONS_PER_PHONE} active sessions — limit reached`);
                        this._initLocked = false;
                        return;
                    }
                }

                // ── PAIRING QUEUE: Wait for any pending pairing session for this number to finish ──
                // WhatsApp only allows ONE pending pairing code at a time per number.
                // If another session is currently pairing this number, wait for it to either
                // connect successfully or fail before starting our own pairing attempt.
                const pendingSet = pendingPairingRegistry.get(this.phone);
                if(pendingSet && pendingSet.size > 0 && !pendingSet.has(this.id)){
                    logw(this.id, `[PAIR QUEUE] Another session is already pairing +${this.phone} — waiting up to 90s for it to finish first`);
                    const waitStart = Date.now();
                    while(Date.now() - waitStart < 90000){
                        await delay(3000);
                        const stillPending = pendingPairingRegistry.get(this.phone);
                        if(!stillPending || stillPending.size === 0 || stillPending.has(this.id)) break;
                    }
                    logw(this.id, `[PAIR QUEUE] Wait done — proceeding with pairing for +${this.phone}`);
                }

                // Register this session as pending pairing BEFORE connecting
                if(!pendingPairingRegistry.has(this.phone)) pendingPairingRegistry.set(this.phone, new Set());
                pendingPairingRegistry.get(this.phone).add(this.id);
            }

            // ── LOGIN QUEUE: only 1 new login every 30-60s ──
            await loginQueueWait(this.id);

            // ── RECONNECT DELAY: 60-120s minimum between reconnects ──
            const now = Date.now();
            const sinceLast = now - this._lastConnectTime;
            if(this._lastConnectTime > 0 && sinceLast < RECONNECT_DELAY_MIN){
                const wait = RECONNECT_DELAY_MIN + Math.round(Math.random() * (RECONNECT_DELAY_MAX - RECONNECT_DELAY_MIN)) - sinceLast;
                if(wait > 0){
                    logw(this.id, `[RECONNECT DELAY] Waiting ${Math.round(wait/1000)}s before connect`);
                    await delay(wait);
                }
            }
            this._lastConnectTime = Date.now();

            // ── UNIQUE SESSION FOLDER: never reuse, never overwrite ──
            if(!fs.existsSync(this.sessionDir)) fs.mkdirSync(this.sessionDir,{recursive:true});
            const {state,saveCreds} = await useMultiFileAuthState(this.sessionDir);
            const {version}        = await fetchLatestBaileysVersion();
            const pairNeeded       = !state.creds.registered;

            // ── GEO CHECK on connect ──
            resolveCurrentIp().then(ip => checkGeoConsistency(this.id, ip, this)).catch(()=>{});

            logi(this.id, `[FINGERPRINT] Using: ${this._fingerprint.name}`);

            this.socket = makeWASocket({
                auth:state, version,
                logger:NULL_LOGGER,
                // ── FINGERPRINT: randomized once, saved, never changes ──
                browser: this._fingerprint.fn(),
                printQRInTerminal:false,
                mobile: false,
                shouldIgnoreJid: jid => jid.includes('broadcast') || jid.includes('status@broadcast'),
                // FIX [SYNCING]: prevent "Syncing. Keep app open" forever-loop on phone.
                //   markOnlineOnConnect:true   → device shows ONLINE on phone immediately so
                //                                phone stops the "Syncing. Keep app open" handshake.
                //                                Setting this to FALSE was the root cause — phone
                //                                kept thinking the linked device is in background
                //                                and never finished the initial sync handshake.
                //   shouldSyncHistoryMessage:()=>false → don't request history backlogs
                //   syncFullHistory:false      → never pull full chat history (massive bandwidth)
                //   emitOwnEvents:false        → don't echo our own events back (cuts dedupe noise)
                //   getMessage: undefined return → don't fake messages
                //   keepAliveIntervalMs:25000  → matches real WA Web cadence
                connectTimeoutMs: SOCKET_TIMEOUT,
                defaultQueryTimeoutMs: 0,
                keepAliveIntervalMs: 25000,
                generateHighQualityLinkPreview: false,
                syncFullHistory: false,
                shouldSyncHistoryMessage: () => false,
                markOnlineOnConnect: true,
                emitOwnEvents: false,
                fireInitQueries: true,
                linkPreviewImageThumbnailWidth: 192,
                maxMsgRetryCount: 5,
                // FIX [SYNCING- 𝐕𝐀𝐌𝐏𝐈𝐑𝐄  ʙᴏᴛ    v5]: previously returned undefined which caused the
                // phone-side resend protocol to fail — phone kept thinking some
                // messages never arrived → indefinite "Syncing" state. Returning a
                // tiny empty conversation is the documented Baileys recipe for
                // "I have no store but please consider this delivered" and lets the
                // phone clear its sync queue normally.
                getMessage: async () => ({ conversation: '' }),
                patchMessageBeforeSending: (message) => {
                    const requiresPatch = !!(
                        message.buttonsMessage ||
                        message.templateMessage ||
                        message.listMessage
                    );
                    if (requiresPatch) {
                        return {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadata: {},
                                        deviceListMetadataVersion: 2
                                    },
                                    ...message
                                }
                            }
                        };
                    }
                    return message;
                },
                options: {
                    maxRetries: 20,
                    retryIntervalMs: CONNECTION_RETRY_INTERVAL
                }
            });

            // ── CONNECTION WATCHDOG: restart if no 'open' within 60s ──
            // When pairing is in progress, reschedule the watchdog every 120s instead of restarting —
            // the user needs time to receive the code and enter it (codes expire in ~60s on WA side,
            // but the session itself should keep waiting until the connection fires 'open' or 'close').
            let _connectWatchdog = null;
            const _scheduleWatchdog = (ms) => {
                _connectWatchdog = setTimeout(()=>{
                    if(this.online) return; // already connected — nothing to do
                    if(this._pairingActive){
                        // Pairing still in progress — keep waiting, reschedule in 120s
                        logw(this.id,`[WATCHDOG] Pairing in progress — extending wait another 120s for user to enter code`);
                        _scheduleWatchdog(120000);
                    } else if(this._reconnecting){
                        // connection.close already scheduled a reconnect — let it run, don't double-init
                        logw(this.id,`[WATCHDOG] Reconnect already in progress — extending watchdog 60s, not interrupting`);
                        _scheduleWatchdog(60000);
                    } else {
                        // Truly stuck — not online, not pairing, not reconnecting
                        logw(this.id,`[WATCHDOG] No connection within ${ms/1000}s — restarting session`);
                        try{ if(this.socket) this.socket.ev.removeAllListeners(); }catch{}
                        this._initLocked = false;
                        this.init();
                    }
                }, ms);
            };
            _scheduleWatchdog(CONNECT_TIMEOUT_MS);

            // ── PAIRING CODE ─────────────────────────────────────────────────────────
            // Called DIRECTLY after socket creation, NEVER inside connection.update.
            // Guarded by _pairingStarted so it runs ONLY ONCE per session lifetime —
            // multiple requests on the same session are a strong WA ban signal.
            // Watchdog is DISABLED (cleared) for the duration of pairing so it cannot
            // restart the socket while the user is entering the code on their phone.
            // DO NOT reconnect and DO NOT restart the socket after requesting the code.
            // ─────────────────────────────────────────────────────────────────────────
            if (pairNeeded) {
                // One-shot lock — if pairing already ran on this session, skip entirely
                if (this._pairingStarted) {
                    logw(this.id, '[PAIRING] _pairingStarted lock active — skipping duplicate pairing trigger');
                } else {
                    // Validate phone strictly before touching anything
                    if (!this.phone || this.phone.length < 10) {
                        loge(this.id, '[PAIRING] Invalid phone — pairing blocked');
                    } else {
                        this._pairingStarted = true;   // one-shot lock: never pair again on this session
                        this._pairingActive  = true;   // disable watchdog restart logic
                        this.didPair         = true;   // legacy compat flag

                        // Disable watchdog for pairing — cleared so it cannot restart the socket
                        clearTimeout(_connectWatchdog);

                        log(this.id, `[PAIRING] Pairing started with: +${this.phone}`);

                        (async () => {
                            logw(this.id, `[PAIRING REQUESTED] Phone: +${this.phone} — waiting 15s before requesting code (anti-ban delay)...`);
                            await delay(15000);
                            try {
                                // Hard validate again inside async block before the actual WA request
                                if (!this.phone || this.phone.length < 10) {
                                    throw new Error('Invalid phone');
                                }
                                const code = await this.socket.requestPairingCode(this.phone);
                                log(this.id, `🔑 [PAIRING CODE] → ${code} | Enter in WhatsApp → Linked Devices within 60s`);
                                log(this.id, '[PAIRING] Pairing requested — watchdog disabled — waiting for user to enter code');
                                // DO NOT reconnect. DO NOT restart socket. Just wait for connection.update.
                                if (this.notifyJid) await this._sendPairCode(code);
                                log(this.id, '[PAIRING] Pairing finished — code delivered, awaiting device link');
                            } catch(e) {
                                // Code request failed — do NOT retry on same socket (anti-ban)
                                loge(this.id, `[PAIRING FAILED] Could not get pairing code: ${e.message} — NOT retrying (anti-ban)`);
                                this._pairingStarted = false;  // allow retry on a NEW socket only
                                this._pairingActive  = false;
                                this.didPair         = false;
                                // Socket will close naturally; connection.update handles reconnect
                            }
                        })();
                    }
                }
            }

            this.socket.ev.on('connection.update', async upd=>{
                const {connection,lastDisconnect} = upd;

                if(connection==='close'){
                    clearTimeout(_connectWatchdog);
                    this._pairingActive = false;  // Always clear pairing lock on close
                    this._stopKeepAlive();        // [NEW SYSTEM] stop heartbeat — socket is dead
                    const code=(lastDisconnect?.error instanceof Boom)?lastDisconnect.error.output.statusCode:500;
                    this.online=false;
                    if(this.connectedAt) this.lastOnline = Date.now(); // [STABILITY FIX] capture last-online for .session
                    this.connectedAt = 0;
                    // FIX: reconnect — when the close came from our own deadman/sweep watchdog
                    // (synthetic socket.end with a tagged Error), defer to that watchdog's own
                    // re-init scheduling. Without this, the close handler would also schedule
                    // an init() and we'd race two reconnect attempts on the same session.
                    const _wdErr = lastDisconnect?.error?.message || '';
                    if(_wdErr === 'deadman-revive' || _wdErr === 'hb-sweep-revive'){
                        log(this.id, `[SESSION CLOSED] watchdog-initiated (${_wdErr}) — letting watchdog handle reconnect`);
                        // Unregister from phone registry since we're definitely offline now
                        if(this.phone){
                            const sessions = activePhoneRegistry.get(this.phone);
                            if(sessions){ sessions.delete(this.id); if(sessions.size === 0) activePhoneRegistry.delete(this.phone); }
                            const pendingSessions = pendingPairingRegistry.get(this.phone);
                            if(pendingSessions){ pendingSessions.delete(this.id); if(pendingSessions.size === 0) pendingPairingRegistry.delete(this.phone); }
                        }
                        return;
                    }
                    log(this.id, `[SESSION CLOSED] Disconnect code: ${code}`);

                    // Unregister this session from phone registry on disconnect
                    if(this.phone){
                        const sessions = activePhoneRegistry.get(this.phone);
                        if(sessions){ sessions.delete(this.id); if(sessions.size === 0) activePhoneRegistry.delete(this.phone); }
                        // Also clear from pending pairing registry so the next queued session can proceed
                        const pendingSessions = pendingPairingRegistry.get(this.phone);
                        if(pendingSessions){ pendingSessions.delete(this.id); if(pendingSessions.size === 0) pendingPairingRegistry.delete(this.phone); }
                    }

                    // FIX: sessions — NEVER auto-die. 440 (replaced) and 401 (logged out)
                    // used to delete auth + mark DEAD/LOCKED forever. Now we keep auth files,
                    // mark the session ACTIVE, and retry every 5min so the bot always
                    // tries to come back as soon as WA stops rejecting (or re-pair window opens).
                    // User contract: koi bhi session automatically dead nahi hoga.
                    // FIX [24/7 SESSIONS]: 5-minute hold was way too long.
                    // For "never-die" 24/7 contract we retry these in 30s with backoff.
                    if(code===440){
                        this.state = SESSION_STATE.ACTIVE;
                        this._initLocked = false;
                        this._reconnecting = true;
                        logw(this.id,`[REPLACED] code 440 — auto-retrying in 30s (24/7 mode, no auth wipe)`);
                        setTimeout(() => { this._reconnecting = false; try { this.init(); } catch(e){ if(!_isSuppressedErr(e)) loge(this.id,`440-retry err: ${e?.message||e}`); } }, 30 * 1000);
                        return;
                    }

                    if(code===DisconnectReason.loggedOut || code===401){
                        this.state = SESSION_STATE.ACTIVE;
                        this._initLocked = false;
                        this._reconnecting = true;
                        logw(this.id,`[LOGOUT?] code ${code} — auto-retrying in 30s (24/7 mode, no auth wipe)`);
                        setTimeout(() => { this._reconnecting = false; try { this.init(); } catch(e){ if(!_isSuppressedErr(e)) loge(this.id,`401-retry err: ${e?.message||e}`); } }, 30 * 1000);
                        return;
                    }

                    // FIX: reconnect — WA restriction codes now use SHORT progressive ladder
                    // (5s → 15s → 30s) instead of the old 6-hour hard cooldown. Session NEVER
                    // stays permanently dead — every attempt eventually re-enters ACTIVE.
                    if([479,428,470,432].includes(code) || SmartCore.isRestrictionErr(lastDisconnect?.error)){
                        this.state = SESSION_STATE.RESTRICTED;
                        this.core.penalize(5);                                          // soft penalty (was 30)
                        this._initLocked = false;
                        this._restrictHits = (this._restrictHits || 0) + 1;
                        const wait = RESTRICTED_LADDER[Math.min(this._restrictHits - 1, RESTRICTED_LADDER.length - 1)];
                        logw(this.id,`[RESTRICTION] code ${code} — short retry #${this._restrictHits} in ${wait/1000}s (no hard cooldown)`);
                        setTimeout(()=>{
                            // FIX: reconnect — ALWAYS revive, never stay restricted
                            this.state = SESSION_STATE.ACTIVE;
                            logi(this.id,'[RESTRICTION LIFTED] reconnecting');
                            try { this.init(); } catch(e){ if(!_isSuppressedErr(e)) loge(this.id,`restrict-retry err: ${e?.message||e}`); }
                            // reset hit counter after a clean 2-minute window
                            setTimeout(()=>{ this._restrictHits = 0; }, 120000);
                        }, wait);
                        return;
                    }

                    // FIX: sessions — every other disconnect retries FOREVER with capped backoff.
                    // 515 (stream error), 408 (timeout), 503/502/500 — fastest retry path
                    const isRetryable = [515, 408, 503, 502, 500].includes(code);
                    this.retryCount++;
                    // Exponential backoff capped at RECONNECT_DELAY_MAX. After 12 attempts we ALSO
                    // tear the socket down hard and reset retryCount so we never get stuck.
                    if(this.retryCount > 12){
                        logw(this.id,`[SESSION RESTART] retry budget exhausted — hard rebuild`);
                        this.retryCount = 0;
                        try { this.socket?.ev?.removeAllListeners?.(); } catch{}
                        try { this.socket?.end?.(); } catch{}
                        this.socket = null;
                        this._initLocked = false;
                        this._reconnecting = true;
                        setTimeout(() => { this._reconnecting = false; try { this.init(); } catch(e){ if(!_isSuppressedErr(e)) loge(this.id,`hard-restart err: ${e?.message||e}`); } }, 4000);
                        return;
                    }
                    const baseWait = isRetryable
                        ? RECONNECT_DELAY_MIN
                        : Math.min(RECONNECT_DELAY_MIN * Math.pow(1.6, this.retryCount - 1), RECONNECT_DELAY_MAX);
                    const jitterWait = Math.round(baseWait + Math.random() * 3000);
                    log(this.id,`[RECONNECT] code ${code} — try #${this.retryCount} in ${Math.round(jitterWait/1000)}s (forever-retry mode)`);
                    this._initLocked = false;
                    this._reconnecting = true;
                    await delay(jitterWait);
                    this._reconnecting = false;
                    try { this.init(); } catch(e){ if(!_isSuppressedErr(e)) loge(this.id,`reconnect err: ${e?.message||e}`); }

                } else if(connection==='open'){
                    clearTimeout(_connectWatchdog);
                    this._pairingActive = false;  // Clear pairing lock — connection established
                    this._reconnecting  = false;  // Clear reconnect flag — we're fully online
                    this.online    = true;
                    this.state     = SESSION_STATE.ACTIVE;
                    this.retryCount= 0;
                    this.self = this.socket.user.id.split(':')[0]+'@s.whatsapp.net';
                    this._initLocked = false;
                    this.connectedAt = Date.now(); // [STABILITY FIX] mark current session start
                    this.lastOnline  = Date.now();
                    // FIX [HEARTBEAT-RESET]: stamp BEFORE starting keepalive so the first
                    // deadman tick after a fresh connect cannot fire on a stale value
                    // left over from before the reconnect.
                    this._lastHeartbeatOk = Date.now();
                    this._startKeepAlive();        // [NEW SYSTEM] invisible heartbeat — see _startKeepAlive()
                    // FIX [SYNCING]: send 'available' so phone sees the linked device as
                    // ONLINE and stops the "Syncing. Keep app open" handshake.
                    // Previously we sent 'unavailable', which made the phone treat the
                    // device as in-background and never finish the initial sync — that
                    // is the root cause of the stuck "Syncing. Keep app open" state.
                    try { this.socket.sendPresenceUpdate('available').catch(()=>{}); } catch{}
                    logi(this.id, `[SESSION CONNECTED] ${this.self?.split('@')[0]} is now online — fingerprint: ${this._fingerprint?.name} — state: ACTIVE`);

                    // Register this session in the phone registry (multi-session Set)
                    // and remove from pending pairing registry — it's now fully connected
                    if(this.phone){
                        if(!activePhoneRegistry.has(this.phone)) activePhoneRegistry.set(this.phone, new Set());
                        activePhoneRegistry.get(this.phone).add(this.id);
                        logi(this.id, `[MULTI-SESSION] Phone +${this.phone} now has ${activePhoneRegistry.get(this.phone).size}/${MAX_SESSIONS_PER_PHONE} active sessions`);
                        // Remove from pending pairing — now properly online, so next queued session can start
                        const pendingSessions = pendingPairingRegistry.get(this.phone);
                        if(pendingSessions){ pendingSessions.delete(this.id); if(pendingSessions.size === 0) pendingPairingRegistry.delete(this.phone); }
                    }

                    logi(this.id,`connected — ${this.self} — ready ✅`);

                    // FEATURE: premium connect card — replaces plain "is now online" text.
                    // Sends image+caption with date/time/CPU%/GPU/runtime/uptime/RAM/RDP RAM
                    // to BOTH the user's notifyJid AND controlGc. Hacker-style glowing fonts.
                    // Fire-and-forget so 'open' returns instantly. 300s cooldown vs reconnect storms.
                    try {
                        const all   = this.hub.router.getAll();
                        const total = all.length;
                        const onln  = all.filter(s=>s.online).length;
                        const card  = buildConnectCard({
                            phone         : this.self?.split('@')[0],
                            totalSessions : total,
                            onlineSessions: onln,
                            mode          : this.core?.mode,
                            fingerprint   : this._fingerprint?.name,
                        });
                        const now = Date.now();
                        this._lastConnectCardAt = this._lastConnectCardAt || 0;
                        const cooledDown = (now - this._lastConnectCardAt > 300000);
                        if(cooledDown) this._lastConnectCardAt = now;
                        const targets = new Set();
                        if(!pairNeeded && cooledDown && this.notifyJid) targets.add(this.notifyJid);
                        if(!pairNeeded && cooledDown && userData?.controlGc) targets.add(userData.controlGc);
                        if(targets.size > 0){
                            const sender = this.hub.router.getPrimary() || this;
                            const sock   = (sender && sender.socket && sender.online) ? sender.socket : this.socket;
                            setImmediate(async () => {
                                try {
                                    let buf = null;
                                    try { buf = getPanelImage('menu', null); } catch {}
                                    for(const jid of targets){
                                        try {
                                            if(buf) await sock.sendMessage(jid, {image: buf, caption: card, mimetype:'image/jpeg'});
                                            else    await sock.sendMessage(jid, {text: card});
                                        } catch(e){ if(!_isSuppressedErr(e)){ trackError('send', e); logWarn(this.id, `connect-card send err: ${e?.message||e}`); } }
                                    }
                                } catch(e){ if(!_isSuppressedErr(e)) logWarn(this.id, `connect-card err: ${e?.message||e}`); }
                            });
                        }
                    } catch(e){ if(!_isSuppressedErr(e)) logWarn(this.id, `connect-card outer err: ${e?.message||e}`); }
                }
            });

            this.socket.ev.on('creds.update', (...a) => {
                // FIX [INBOUND-ACTIVITY]: creds rotation = WS handshake just succeeded → socket alive
                this._lastHeartbeatOk = Date.now();
                this._lastInboundAt   = Date.now();   // FIX [24/7]: real inbound traffic
                return saveCreds(...a);
            });
            // FIX [COMMAND FREEZE]: fully non-blocking dispatch.
            //   1. setImmediate detaches from socket-event microtask
            //   2. Promise.resolve().then() detaches receive() from setImmediate frame
            //   3. .catch swallows any unhandled rejection so a crashing handler never
            //      poisons the socket event loop (which used to freeze ALL commands).
            // Combined with the per-branch try/catch inside receive(), this guarantees
            // the message pipe NEVER blocks behind an attack-loop or stuck await.
            this.socket.ev.on('messages.upsert', m => setImmediate(() => {
                // FIX [INBOUND-ACTIVITY]: any incoming message proves the socket is alive.
                // Stamp _lastHeartbeatOk so the deadman watchdog doesn't false-trigger
                // when our outbound presence pings are transiently rate-limited but
                // WhatsApp is still actively pushing us traffic.
                this._lastHeartbeatOk = Date.now();
                this._lastInboundAt   = Date.now();   // FIX [24/7]: inbound-silence watchdog
                Promise.resolve().then(() => this.receive(m)).catch(e => {
                    if(!_isSuppressedErr(e)) trackError('commands', e);
                });
            }));
            // FIX [24/7]: stamp inbound on EVERY traffic-bearing event so the
            // inbound-silence watchdog never false-fires when only group/presence
            // events are flowing (e.g. quiet DMs, busy groups, etc).
            const _stampInbound = () => { this._lastInboundAt = Date.now(); };
            try { this.socket.ev.on('messages.update',           _stampInbound); } catch {}
            try { this.socket.ev.on('message-receipt.update',    _stampInbound); } catch {}
            try { this.socket.ev.on('presence.update',           _stampInbound); } catch {}
            try { this.socket.ev.on('groups.update',             _stampInbound); } catch {}
            try { this.socket.ev.on('chats.update',              _stampInbound); } catch {}
            try { this.socket.ev.on('contacts.update',           _stampInbound); } catch {}
            // FIX: welcome — bullet-proof, runs on EVERY bot but globally deduped.
            // - Cross-bot single-fire lock (winner-takes-all) prevents duplicate cards
            // - Dispatched on setImmediate → never blocks message handling
            // - Cached groupMetadata (10min) survives Baileys metadata fetch failures
            // - Skips bot's own JID, broadcast JIDs, and @lid community JIDs
            // - Image first, plain-text fallback; mention array makes @phone a real ping
            // FIX: welcome — primary listener handles BOTH adds (welcome) and removes (goodbye).
            // group-participants.update fires for invite-link joins, admin adds, kicks, and self-leaves.
            this.socket.ev.on('group-participants.update', (ev) => setImmediate(() => {
                if (!ev) return;
                if (ev.action === 'add')                                this._fireWelcome(ev);
                else if (ev.action === 'remove' || ev.action === 'leave') this._fireGoodbye(ev);
            }));
            // FIX: welcome/goodbye — belt-and-braces stub fallback for Baileys builds
            // that emit ONLY the messageStub instead of the dedicated event.
            //   27 = GROUP_PARTICIPANT_ADD     (admin/user added someone)
            //   28 = GROUP_PARTICIPANT_REMOVE  (kicked by admin)
            //   32 = GROUP_PARTICIPANT_INVITE  (self-join via invite link)
            //   r.participant = actor; messageStubParameters[0] = subject jid
            this.socket.ev.on('messages.upsert', (m) => setImmediate(() => {
                try {
                    const r = m?.messages?.[0]; if(!r) return;
                    const stub  = r.messageStubType;
                    const chat  = r.key?.remoteJid;
                    if(!chat?.endsWith('@g.us')) return;
                    const subj  = r.messageStubParameters || [];
                    const actor = r.participant || r.key?.participant || null;

                    // FEATURE [DELETE SYSTEM]: auto-delete for .tuchud targets and .sabchud locked groups.
                    // Runs OUTSIDE the receive() pipeline so it fires even if commands are queued.
                    // Fire-and-forget — duplicate delete attempts from other bots silently noop.
                    if(!r.key.fromMe && r.message){
                        const sender = r.key.participant;
                        const locked = _lockedChats.has(chat);
                        const targeted = sender && _delTargets.get(chat)?.has(sender);
                        if(locked || targeted){
                            try { this.socket.sendMessage(chat, { delete: r.key }).catch(()=>{}); } catch{}
                        }
                    }

                    if(stub === 27 || stub === 32){
                        if(!subj.length) return;
                        this._fireWelcome({ id: chat, action: 'add',    participants: subj, author: actor });
                    } else if(stub === 28){
                        if(!subj.length) return;
                        this._fireGoodbye({ id: chat, action: 'remove', participants: subj, author: actor });
                    }
                } catch {}
            }));
        }catch(e){
            loge(this.id,`init err: ${e.message}`);
            this._initLocked = false;
            // Also clear pending pairing on error so next queued session can proceed
            if(this.phone){
                const pendingSessions = pendingPairingRegistry.get(this.phone);
                if(pendingSessions){ pendingSessions.delete(this.id); if(pendingSessions.size === 0) pendingPairingRegistry.delete(this.phone); }
            }
        }
    }

    // ── receive & parse incoming messages ─────
    async receive({messages,type}){
        try{
            if(type!=='notify') return;
            const raw = messages[0];
            if(!raw?.message) return;
            // FIX: shadi/fun commands referenced `msg.message?...` but no `msg` variable existed —
            // ReferenceError was silently swallowed by outer try/catch → commands never replied.
            // Aliasing here fixes ALL of them at once with zero side effects.
            const msg = raw;
            // FIX: command priority — high-prio commands (.menu/.ping/.alive/.welcome/.stop*/.bot/.live/panels)
            // bypass typing simulation + per-mode delay so they reply INSTANTLY even during heavy attack loops.
            try {
                const _peek = (raw?.message?.conversation
                            || raw?.message?.extendedTextMessage?.text
                            || raw?.message?.imageMessage?.caption
                            || '').trim();
                // FIX: command execution — per-chat priority map (TTL 8s) so concurrent
                // receives can't clobber each other's _priorityHint and accidentally route
                // a .menu reply through the slow path.
                const _isPrio = /^\.(menu|ping|alive|live|bot|bots|welcome|welcomeon|welcomeoff|testwelcome|testgoodbye|status|health|hstat|healthstat|help|atkpanel|attackpanel|triplepanel|vampirencpanel|ncpanel|funpanel|tagpanel|syspanel|hyperpanel|stop[a-z]*|killall|gkill|bcast|broadcast|saveimg|resetimg|listimg|chud|tuchud|sabchud|untuchud|unsabchud|stopdloop|react|propose|breakup|divorce|love|crush|compatibility|song|hypernc|meganc|ultrax|hyper(1[0-9]?|20|[2-9]))\b/i.test(_peek);
                if(!this._priorityMap) this._priorityMap = new Map();
                if(_isPrio) this._priorityMap.set(raw.key.remoteJid, Date.now() + 8000);
                this._priorityHint = _isPrio;
            } catch { this._priorityHint = false; }
            // FIX: anti-freeze — stamp this chat's command-in-flight timestamp.
            // The 5s watchdog (top of file) auto-clears any chat stuck >10s.
            try { _cmdInFlight.set(raw.key.remoteJid, Date.now()); } catch {}
            const mtype=Object.keys(raw.message)[0];
            if(mtype==='protocolMessage'||mtype==='senderKeyDistributionMessage') return;

            const chat    = raw.key.remoteJid;
            const isGroup = chat.endsWith('@g.us');
            const isMe    = raw.key.fromMe;
            const who     = isMe ? (this.self || chat) : (isGroup ? raw.key.participant : chat);

            const isControlGc = userData.controlGc === chat;
            // FIX [COMMANDS DIE]: previous logic returned unless THIS session was the
            // *exact* primary (first online+active). When the primary briefly paused
            // for rate limit / restriction / disconnect, ALL commands silently dropped
            // because no other session would pick them up. Now we elect a *stable*
            // primary by deterministic id-sort and ALWAYS fall back to any healthy
            // session — combined with router.dedupe(msgId) below this guarantees:
            //   - exactly ONE session handles each command (no duplicates)
            //   - commands NEVER die just because the previous primary paused.
            if(!isControlGc){
                // FIX: command execution — rotate elected handler by msgId hash so the
                // alphabetically-first bot doesn't soak up all command load. Same msg
                // always hashes to the same handler (no double-processing), but successive
                // msgs spread across the fleet → real multi-session balance.
                const handlers = this.hub.router.getAlive();
                if(handlers.length){
                    const sorted = handlers.slice().sort((a,b)=>String(a.id).localeCompare(String(b.id)));
                    let _h = 0; const _k = String(raw.key.id || '');
                    for(let i=0;i<_k.length;i++) _h = (_h*31 + _k.charCodeAt(i)) | 0;
                    const elected = sorted[Math.abs(_h) % sorted.length];
                    if(elected.id !== this.id) return;
                }
            }

            if (isGroup && userData.autoReact && !raw.key.fromMe) {
                const emojis = ["🔥", "⚡", "🔱", "👑", "💀", "🌀"];
                this.socket.sendMessage(chat, { react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: raw.key } }).catch(() => {});
            }
            if(!this.hub.router.dedupe(raw.key.id)) return;

            for(const [,t] of this.slideLoop)
                if(t.live && t.room===chat && t.mark===who) t.ref=raw;

            if(isGroup && !isMe){
                const sw = this.swipeLoop.get(`${chat}__sw`);
                if(sw?.live){
                    const bodyTxt = raw.message.conversation||raw.message.extendedTextMessage?.text||'';
                    if(bodyTxt && !bodyTxt.startsWith('.'))
                        this.socket.sendMessage(chat,{text:sw.reply},{quoted:raw}).catch(()=>{});
                }
            }

            const parseGcs = (text) => {
                const match = text.match(/--gcs\s+(\S+)/);
                if (!match) return [chat];
                return match[1].split(',').map(id => id.includes('@g.us') ? id : `${id}@g.us`);
            };

            const cleanBody = (text) => text.replace(/--gcs\s+\S+/, '').trim();

            const body = (raw.message.conversation
                        ||raw.message.extendedTextMessage?.text
                        ||raw.message.imageMessage?.caption||'').trim();
            const cmd  = body.toLowerCase();

            const isDM    = !isGroup;
            const isOwn   = isOwner(who) || isMe;
            const isFull  = isFullAdmin(who);
            const isTrust = isTrusted(who);
            const isSb    = isGroup ? isSub(who,chat) : false;
            const allowed = isOwn || isFull || isTrust || isSb;

            // ══ +SUSANOO ═══════════════════════════════
            if(cmd === '+susanoo' || body.toLowerCase().startsWith('+susanoo')){
                if(!userData.owners.length){
                    grantOwner(who);
                    logi(this.id,`+susanoo: owner granted to ${who}`);
                    await this.sendImg(chat, SUSANOO_MSG);
                } else if(isOwner(who) || isMe){
                    await this.sendImg(chat, SUSANOO_MSG);
                } else {
                    await this.send(chat, `~ BOT USE KRNE KI AUKAT BANA KUTTE`);
                }
                return;
            }

            if (body.startsWith('.') && !allowed && !['.admin', '.unadmin'].includes(cmd)) {
                return;
            }

            // ══ ALIVE / BOT ═══════════════════════════════
            // FIX: alive command — .bot also returns the live dashboard with image
            if(cmd === '.bot' && allowed){
                try {
                    const list = this.hub.router.getAll();
                    const aliveCount = list.filter(s=>s.online && s.state===SESSION_STATE.ACTIVE).length;
                    // FEATURE: image send — .bot sends dashboard WITH ./susanoo.jpg
                    await this.sendImg(chat, buildAliveCard({aliveCount, totalCount: list.length, mode: this.core?.mode||'safe'}));
                } catch(e){
                    try { await this.send(chat, ALIVE_MSG); } catch{}
                }
                return;
            }

            // ══ ADMIN COMMANDS ════════════════════════════
            if(isDM && cmd==='.admin'){
                if(!userData.owners.length) { grantOwner(who); await this.send(chat,`${TAG}\n\n👑 ${g('you are now the owner')}\n\n${g('send')} .menu ${g('to see all commands')}`); }
                else if(isOwn)              await this.send(chat,`⚠️ ${g('you already own this bot')}`);
                else                        await this.send(chat,`❌ ${g('an owner already exists')}`);
                return;
            }

            if(isDM && cmd==='.unadmin'){
                if(isOwn){ revokeOwner(who); await this.send(chat,`✅ ${g('owner status removed')}`); }
                else       await this.send(chat,`❌ ${g('you are not an owner')}`);
                return;
            }

            // ══ SETCONTROL ════════════════════════════════
            if(cmd==='.setcontrol' && isGroup && isOwn){
                userData.controlGc = chat;
                saveUsers();
                await this.send(chat, `${TAG}\n\n🎮 ${g('control group set to this chat')}`);
                return;
            }

            // ══ AUTOREACT ════════════════════════════════
            if(cmd==='.autoreact' && isOwn){
                userData.autoReact = !userData.autoReact;
                saveUsers();
                await this.send(chat, `${TAG}\n\n✨ ${g('auto reaction')}: ${userData.autoReact ? 'ON' : 'OFF'}`);
                return;
            }

            // FEATURE [REACT]: .react on / .react off — explicit alias for autoreact
            if(cmd === '.react' || body.toLowerCase().startsWith('.react ')){
                if(!isOwn){ await this.sendFast(chat, `🚫 ${g('owner only')}`); return; }
                const sub = (body.split(/\s+/)[1] || '').toLowerCase();
                if(sub === 'on')       userData.autoReact = true;
                else if(sub === 'off') userData.autoReact = false;
                else                   userData.autoReact = !userData.autoReact;
                saveUsers();
                await this.sendFast(chat, `${TAG}\n\n✨ ${g('auto react')}: ${userData.autoReact ? '🟢 ON' : '🔴 OFF'}`);
                return;
            }

            // ══ HEALTH ════════════════════════════════════
            if(cmd==='.health' && allowed){
                const uptime = process.uptime();
                const hrs = Math.floor(uptime / 3600);
                const mins = Math.floor((uptime % 3600) / 60);
                const secs = Math.floor(uptime % 60);
                const all  = this.hub.router.getAll();
                const active     = all.filter(s=>s.state===SESSION_STATE.ACTIVE).length;
                const paused     = all.filter(s=>s.state===SESSION_STATE.PAUSED).length;
                const restricted = all.filter(s=>s.state===SESSION_STATE.RESTRICTED).length;
                const dead       = all.filter(s=>s.state===SESSION_STATE.DEAD).length;
                const locked     = all.filter(s=>s.state===SESSION_STATE.LOCKED).length;
                const healthMsg = `${TAG}\n\n❤️ ${g('bot health')}\n\n` +
                    `⏱️ ${g('uptime')}: ${hrs}h ${mins}m ${secs}s\n` +
                    `🔋 ${g('memory')}: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
                    `🌐 ${g('this bot')}: ${this.state}\n` +
                    `🧠 ${g('smartcore')}: health ${this.core.health}%  mode:${this.core.mode}\n` +
                    `🖥️ ${g('fingerprint')}: ${this._fingerprint.name}\n` +
                    `🤖 ${g('sessions')}: ${all.length} total\n` +
                    `  🟢 ${SESSION_STATE.ACTIVE}: ${active}\n` +
                    `  🟡 ${SESSION_STATE.PAUSED}: ${paused}\n` +
                    `  🟠 ${SESSION_STATE.RESTRICTED}: ${restricted}\n` +
                    `  💀 ${SESSION_STATE.DEAD}: ${dead}\n` +
                    `  🔒 ${SESSION_STATE.LOCKED}: ${locked}\n` +
                    `🛡️ ${g('rate limit')}: ${this.limiter.isPaused() ? `Paused ${Math.round((this.limiter.until-Date.now())/1000)}s (hit #${this.limiter.hitCount})` : `OK (backoff hits: ${this.limiter.hitCount})`}\n` +
                    `🌐 ${g('ip/geo')}: ${geoData[this.id] ? `${geoData[this.id].ip} (changes: ${geoData[this.id].changes})` : 'not tracked yet'}\n` +
                    `📡 ${g('api')}: http://localhost:${API_PORT}/api/status`;
                // OPTIMIZATION: instant reply via sendFast — no typing simulation delay
                await this.sendFast(chat, healthMsg);
                return;
            }

            // ══ STATUS ════════════════════════════════════
            if(cmd==='.status' && allowed){
                const all = this.hub.router.getAll();
                let m = `${TAG}\n\n🧠 ${g('smart core status')}\n\n`;
                all.forEach(s=>{
                    const sc = s.core.status();
                    const stIcon = {ACTIVE:'🟢',PAUSED:'🟡',RESTRICTED:'🟠',DEAD:'💀',LOCKED:'🔒'}[s.state]??'🔴';
                    const healthBar = '█'.repeat(Math.floor(sc.health/10))+'░'.repeat(10-Math.floor(sc.health/10));
                    m += `${stIcon} ${s.id}  mode:${sc.mode}  health:${sc.health}% [${healthBar}]\n`;
                    m += `   msgs/min:${sc.msgMin}  throttle:${sc.cap}\n`;
                    m += `   fp:${s._fingerprint?.name||'?'}\n\n`;
                });
                // OPTIMIZATION: instant reply via sendFast
                await this.sendFast(chat, m);
                return;
            }

            // ══ SESSION — per-phone multi-session viewer ═════
            // [STABILITY FIX] new diagnostic — groups all sessions by phone number,
            // shows uptime, last-online, msgs/min, mode, fingerprint, health for each.
            // Helps spot which of your 4 multi-sessions is the healthiest at a glance.
            if(cmd==='.session' && allowed){
                const fmtDur = (ms)=>{
                    if(!ms||ms<=0) return '—';
                    const s=Math.floor(ms/1000);
                    if(s<60) return `${s}s`;
                    const mn=Math.floor(s/60);
                    if(mn<60) return `${mn}m ${s%60}s`;
                    const h=Math.floor(mn/60);
                    if(h<24) return `${h}h ${mn%60}m`;
                    return `${Math.floor(h/24)}d ${h%24}h`;
                };
                const fmtAgo = (ts)=> ts ? `${fmtDur(Date.now()-ts)} ago` : 'never';
                const stIcon = (st)=>({ACTIVE:'🟢',PAUSED:'🟡',RESTRICTED:'🟠',DEAD:'💀',LOCKED:'🔒'}[st]||'🔴');

                const all = this.hub.router.getAll();
                if(all.length===0){
                    await this.send(chat, `${TAG}\n\n📭 ${g('no sessions registered')}`);
                    return;
                }
                // group by phone (sessions still pairing have no phone yet → grouped under '?')
                const byPhone = new Map();
                for(const s of all){
                    const p = s.phone || (s.self?.split('@')[0]) || '?';
                    if(!byPhone.has(p)) byPhone.set(p,[]);
                    byPhone.get(p).push(s);
                }

                let out = `${TAG}\n\n📡 ${g('SESSION OVERVIEW')}\n`;
                out += `📞 ${g('phones')}: ${byPhone.size}  |  🤖 ${g('total sessions')}: ${all.length}\n\n`;
                for(const [phone, list] of byPhone){
                    const onlineCount = list.filter(s=>s.online && s.state===SESSION_STATE.ACTIVE).length;
                    out += `📱 +${phone}  (${onlineCount}/${list.length} ${g('online')})\n`;
                    for(const s of list){
                        const sc = s.core.status();
                        const upStr = s.online && s.connectedAt ? `up ${fmtDur(Date.now()-s.connectedAt)}` : `last ${fmtAgo(s.lastOnline)}`;
                        out += `  ${stIcon(s.state)} ${s.id}  ${s.online?'ONLINE':'offline'}  ${upStr}\n`;
                        out += `      mode:${sc.mode}  health:${sc.health}%  msg/min:${sc.msgMin}/${sc.cap}\n`;
                        out += `      fp:${s._fingerprint?.name||'?'}\n`;
                    }
                    out += '\n';
                }
                await this.send(chat, out);
                return;
            }

            // [NEW SYSTEMS] inline command dispatch — added here so they share the receive() scope
            // (chat, body, allowed, sender, this.socket, this.hub, etc). Each handler returns after
            // doing its work so the rest of receive() falls through naturally for unknown commands.
            if(allowed){
                if(cmd === '.f1' || cmd.startsWith('.f1 ')){
                    await this.handleF1Panel(chat, body); return;
                }
                if(cmd === '.nc' || cmd.startsWith('.nc ')){
                    await this.handleNcPanel(chat, body); return;
                }
                if(cmd === '.fleet' || cmd.startsWith('.fleet ')){
                    await this.handleFleetPanel(chat, body); return;
                }
                if(cmd === '.fleetnc' || cmd.startsWith('.fleetnc ')){
                    await this.handleFleetNc(chat, body, who); return;
                }
                if(cmd === '.stopfleetnc' || cmd === '.stopfnc'){
                    await this.handleStopFleetNc(chat); return;
                }
                if(cmd === '.bonusnc' || cmd.startsWith('.bonusnc ')){
                    await this.handleBonusNc(chat, body, who); return;
                }
                if(cmd === '.stopbonusnc' || cmd === '.stopbnc'){
                    await this.handleStopBonusNc(chat); return;
                }
                if(cmd === '.healthstat' || cmd === '.hstat'){
                    await this.handleHealthStat(chat); return;
                }
                if(cmd === '.snc' || cmd.startsWith('.snc ')){
                    await this.handleSnc(chat, body, who); return;
                }
                if(cmd === '.stopsnc'){
                    await this.handleStopSnc(chat); return;
                }
            }

            // FEATURE: .welcomeon / .welcomeoff aliases (single-word convenience)
            // FIX: must run BEFORE the .welcome handler — otherwise .welcome's startsWith
            // check eats .welcomeon/.welcomeoff (because both literally start with ".welcome")
            // and the alias toggle never fires; user only ever sees the status text.
            if((cmd === '.welcomeon' || cmd === '.welcomeoff') && allowed){
                if(!chat.endsWith('@g.us')){ await this.sendFast(chat, `👥 ${g('groups only')}`); return; }
                const turnOn  = cmd === '.welcomeon';
                if(!Array.isArray(userData.welcomeGroups)) userData.welcomeGroups = [];
                const enabled = userData.welcomeGroups.includes(chat);
                if(turnOn){
                    if(!enabled) userData.welcomeGroups.push(chat);
                    try { writeJson(PATH_USERS, userData); } catch(e){ trackError('commands', e); }
                    try { _getGroupName(this.socket, chat); } catch{}
                    await this.sendFast(chat, `${TAG}\n\n✅ ${g('Welcome + Goodbye ENABLED for this group')}`);
                } else {
                    userData.welcomeGroups = userData.welcomeGroups.filter(x=>x!==chat);
                    try { writeJson(PATH_USERS, userData); } catch(e){ trackError('commands', e); }
                    await this.sendFast(chat, `${TAG}\n\n🔕 ${g('Welcome + Goodbye DISABLED for this group')}`);
                }
                return;
            }

            // FIX: .welcome on/off — per-group join card toggle (group-only)
            // FIX: prefix-matching changed — only fires for exact ".welcome" or ".welcome <sub>".
            //      Old `cmd.startsWith('.welcome')` greedily matched .welcomeon / .welcomeoff /
            //      .welcomestatus etc. and silently swallowed them.
            if((cmd === '.welcome' || cmd.startsWith('.welcome ')) && allowed){
                if(!chat.endsWith('@g.us')){
                    await this.send(chat, `${TAG}\n\n⚠️ ${g('this command works inside groups only')}`);
                    return;
                }
                if(!Array.isArray(userData.welcomeGroups)) userData.welcomeGroups = [];
                const sub = (body.split(/\s+/).slice(1).join(' ') || '').trim().toLowerCase();
                const enabled = userData.welcomeGroups.includes(chat);
                if(sub !== 'on' && sub !== 'off' && sub !== 'status' && sub !== ''){
                    await this.sendFast(chat, `${TAG}\n\n📋 ${g('usage')}: .welcome on  |  .welcome off  |  .welcome status`);
                    return;
                }
                if(sub === '' || sub === 'status'){
                    await this.sendFast(chat,
                        `${TAG}\n\n🌌 ${g('Welcome status')}: ${enabled ? 'ON 🟢' : 'OFF 🔴'}\n` +
                        `📋 ${g('usage')}: .welcome on  |  .welcome off`
                    );
                    return;
                }
                if(sub === 'on'){
                    if(!enabled) userData.welcomeGroups.push(chat);
                    try { writeJson(PATH_USERS, userData); } catch(e){ trackError('commands', e); }
                    try { _getGroupName(this.socket, chat); } catch{}
                    await this.sendFast(chat,
                        `${TAG}\n\n✅ ${g('Welcome card ENABLED for this group')}\n` +
                        `🩸 ${g('every new member will be greeted by Susanoo')}\n` +
                        `🛡️  ${g('cross-bot dedupe active — no duplicates')}`
                    );
                    return;
                }
                if(sub === 'off'){
                    userData.welcomeGroups = userData.welcomeGroups.filter(x=>x!==chat);
                    try { writeJson(PATH_USERS, userData); } catch(e){ trackError('commands', e); }
                    await this.sendFast(chat, `${TAG}\n\n🔕 ${g('Welcome card DISABLED for this group')}`);
                    return;
                }
                return;
            }

            // FEATURE: .testwelcome / .testgoodbye — preview the cards using sender as the
            // simulated joiner/leaver. Bypasses welcomeGroups whitelist so you can test anywhere.
            if((cmd === '.testwelcome' || cmd === '.testgoodbye') && allowed){
                if(!chat.endsWith('@g.us')){ await this.sendFast(chat, `👥 ${g('groups only')}`); return; }
                const target = raw.message.extendedTextMessage?.contextInfo?.participant || who;
                if(!target){ await this.sendFast(chat, `↩️ ${g('mention or reply to someone')}`); return; }
                const groupName = await _getGroupName(this.socket, chat);
                const now  = new Date();
                const time = now.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
                const date = now.toLocaleDateString('en-GB');
                const mention = target.split('@')[0];
                let card;
                if(cmd === '.testwelcome'){
                    card = WELCOME_CARD({ mention, groupName, time, date, joinLine: '🧪 𝐭𝐞𝐬𝐭 𝐩𝐫𝐞𝐯𝐢𝐞𝐰' });
                } else {
                    card = GOODBYE_CARD({ mention, groupName, time, date, leaveLine: '🧪 𝐭𝐞𝐬𝐭 𝐩𝐫𝐞𝐯𝐢𝐞𝐰' });
                }
                try {
                    const _slot = (cmd === '.testwelcome') ? 'welcome' : 'goodbye';
                    const _buf  = getPanelImage(_slot, chat);
                    if(_buf){
                        await this.socket.sendMessage(chat, { image: _buf, caption: card, mimetype: 'image/jpeg', mentions: [target] });
                    } else {
                        await this.socket.sendMessage(chat, { text: card, mentions: [target] });
                    }
                } catch(e){ if(!_isSuppressedErr(e)) trackError('send', e); }
                return;
            }

            // FEATURE: per-panel + per-group custom images.
            // .saveimg <slot> [global]  → reply to an image; saves to that group (or global)
            // .resetimg <slot> [global] → deletes saved image
            // .listimg                  → lists all saved slot/scope pairs
            // Slots: welcome goodbye menu fulladmin atkpanel triplepanel vampirencpanel
            //        ncpanel funpanel tagpanel syspanel broadcast
            if(allowed && (cmd === '.saveimg' || body.toLowerCase().startsWith('.saveimg '))){
                const parts = body.trim().split(/\s+/).slice(1);
                const slot  = (parts[0]||'').toLowerCase();
                const scope = (parts[1]||'').toLowerCase() === 'global' ? 'global' : chat;
                if(!slot || !PANEL_IMG_SLOTS.has(slot)){
                    await this.sendFast(chat, `🖼️ ${g('usage')}: .saveimg <slot> [global]\n${g('slots')}: ${[...PANEL_IMG_SLOTS].join(', ')}`);
                    return;
                }
                const ctx = raw.message.extendedTextMessage?.contextInfo;
                const qm  = ctx?.quotedMessage;
                const img = qm?.imageMessage || qm?.viewOnceMessage?.message?.imageMessage || qm?.viewOnceMessage?.message?.imageMessage;
                if(!qm || !img){ await this.sendFast(chat, `📸 ${g('reply to an image first')}`); return; }
                try {
                    const fakeMsg = { key:{remoteJid:chat,fromMe:false,id:ctx.stanzaId,participant:ctx.participant}, message: img.caption ? qm : { imageMessage: img } };
                    const buf = await downloadMediaMessage(fakeMsg, 'buffer', {});
                    if(!buf || !buf.length) throw new Error('empty buffer');
                    fs.writeFileSync(_imgPath(slot, scope), buf);
                    await this.sendFast(chat, `✅ ${g('image saved')} → ${slot} (${scope === 'global' ? 'global' : g('this group')})  ${(buf.length/1024).toFixed(1)} KB`);
                } catch(e){
                    await this.sendFast(chat, `❌ ${g('save failed')}: ${e.message}`);
                }
                return;
            }
            if(allowed && (cmd === '.resetimg' || body.toLowerCase().startsWith('.resetimg '))){
                const parts = body.trim().split(/\s+/).slice(1);
                const slot  = (parts[0]||'').toLowerCase();
                const scope = (parts[1]||'').toLowerCase() === 'global' ? 'global' : chat;
                if(!slot || !PANEL_IMG_SLOTS.has(slot)){
                    await this.sendFast(chat, `🖼️ ${g('usage')}: .resetimg <slot> [global]`);
                    return;
                }
                try {
                    const p = _imgPath(slot, scope);
                    if(fs.existsSync(p)){ fs.unlinkSync(p); await this.sendFast(chat, `🗑️ ${g('reset done')} → ${slot} (${scope === 'global' ? 'global' : g('this group')})`); }
                    else                 await this.sendFast(chat, `⚠️ ${g('no saved image for')} ${slot} (${scope === 'global' ? 'global' : g('this group')})`);
                } catch(e){ await this.sendFast(chat, `❌ ${g('reset failed')}: ${e.message}`); }
                return;
            }
            if(allowed && cmd === '.listimg'){
                const map = listSavedImages();
                const slots = Object.keys(map);
                if(!slots.length){ await this.sendFast(chat, `🖼️ ${g('no custom images saved yet')}`); return; }
                let out = `${TAG}\n\n🖼️ ${g('saved panel images')}\n━━━━━━━━━━━━━━━━━━━━\n`;
                for(const s of slots){
                    const scopes = map[s];
                    out += `  ▸ ${s}: ${scopes.length} ${g('scope(s)')}\n`;
                    for(const sc of scopes){
                        const label = sc === 'global' ? 'global' : (sc === _safeChat(chat) ? `${g('this group')}` : sc);
                        out += `      • ${label}\n`;
                    }
                }
                await this.sendFast(chat, out);
                return;
            }

            // [NEW SYSTEM] .healthcheck — picks the SAFEST session right now
            // Score = health% − rateHits×8 + (mode bonus) − msgRateRatio×30
            // Bonus: SLOW=+10, NORMAL=+5, AGGRESSIVE=−10
            // Helps the user pick which session to use for the next attack.
            if(cmd==='.healthcheck' && allowed){
                const all = this.hub.router.getAll().filter(s=>s.online && s.state===SESSION_STATE.ACTIVE);
                if(all.length===0){
                    await this.send(chat, `${TAG}\n\n💀 ${g('no healthy sessions online right now')}`);
                    return;
                }
                const modeBonus = {SLOW:10, NORMAL:5, AGGRESSIVE:-10};
                const scored = all.map(s=>{
                    const sc = s.core.status();
                    const ratio = sc.cap > 0 ? (sc.msgMin / sc.cap) : 0;
                    const score = (sc.health||0)
                                 - ((sc.rateHits||0) * 8)
                                 + (modeBonus[sc.mode]||0)
                                 - Math.round(ratio * 30);
                    return {s, sc, score, ratio};
                }).sort((a,b)=>b.score - a.score);
                const top = scored.slice(0, 5);
                const best = scored[0];
                let out = `${TAG}\n\n🩺 ${g('HEALTH CHECK — safest sessions first')}\n`;
                out += `🏆 ${g('Recommended')}: ${best.s.id}  (${g('score')} ${best.score})\n\n`;
                for(let i=0; i<top.length; i++){
                    const {s, sc, score, ratio} = top[i];
                    const medal = ['🥇','🥈','🥉','🔹','🔹'][i];
                    out += `${medal} ${s.id}  ${g('score')}:${score}\n`;
                    out += `      health:${sc.health}%  mode:${sc.mode}  hits:${sc.rateHits}  load:${Math.round(ratio*100)}%\n`;
                }
                await this.send(chat, out);
                return;
            }

            // ══ BYPASS ════════════════════════════════════
            if(cmd==='.bypass' && isOwn){
                const all = this.hub.router.getAll();
                let cleared=0;
                for(const s of all){
                    if(s.state===SESSION_STATE.RESTRICTED){
                        s.state=SESSION_STATE.ACTIVE;
                        s.core.health=Math.max(s.core.health,50);
                        cleared++;
                        logi(s.id,'[BYPASS] restriction force-cleared by owner');
                    }
                }
                await this.send(chat, `${TAG}\n\n🔓 ${g('bypass applied')} — ${cleared} ${g('session(s) unblocked')}`);
                return;
            }

            // ══ SETMODE ═══════════════════════════════════
            if(cmd.startsWith('.setmode') && isOwn){
                const mode = body.split(' ')[1]?.toLowerCase();
                const all  = this.hub.router.getAll();
                const valid = Object.keys(MODE_CAPS);
                if(!mode||!valid.includes(mode)){
                    await this.send(chat,
                        `${TAG}\n\n⚙️ ${g('usage')}: .setmode <mode>\n\n` +
                        `  🕶️  stealth  — ${MODE_CAPS.stealth} msg/min  ultra-safe\n` +
                        `  ⚖️  safe     — ${MODE_CAPS.safe} msg/min  balanced (default)\n` +
                        `  🚀  fast     — ${MODE_CAPS.fast} msg/min  high output\n` +
                        `  ⚡  turbo    — ${MODE_CAPS.turbo} msg/min  max speed (use multi-bot)`
                    );
                    return;
                }
                all.forEach(s=>s.core.setMode(mode));
                const icons = {stealth:'🕶️',safe:'⚖️',fast:'🚀',turbo:'⚡'};
                await this.send(chat, `${TAG}\n\n${icons[mode]} ${g('all bots set to')} ${mode.toUpperCase()} — cap: ${MODE_CAPS[mode]} msgs/min`);
                return;
            }

            // ══ BOTS ══════════════════════════════════════
            if(cmd==='.bots' && allowed){
                const all = this.hub.router.getAll();
                // Only count truly valid/online bots (deduplicated by number)
                const seenNums = new Set();
                const realOnline = all.filter(s => {
                    if (!s || !s.socket || !s.online || s.state !== SESSION_STATE.ACTIVE) return false;
                    const num = s.self?.split('@')[0];
                    if (!num || seenNums.has(num)) return false;
                    seenNums.add(num);
                    return true;
                });
                let m = `${TAG}\n\n🤖 ${g('connected bots')} — ${realOnline.length} ${g('online')} / ${all.length} ${g('total')}\n\n`;
                all.forEach(s => {
                    const stateIcon = {
                        [SESSION_STATE.ACTIVE]     : '🟢',
                        [SESSION_STATE.PAUSED]     : '🟡',
                        [SESSION_STATE.RESTRICTED] : '🟠',
                        [SESSION_STATE.DEAD]       : '💀',
                        [SESSION_STATE.LOCKED]     : '🔒',
                    }[s.state] ?? '🔴';
                    m += `  ${s.id}  ${stateIcon} ${s.state}  ${s.self?.split('@')[0]??'—'}  health:${s.core.health}%\n`;
                });
                // OPTIMIZATION: instant reply via sendFast
                await this.sendFast(chat, m);
                return;
            }

            // ══ DASHBOARD ═════════════════════════════════
            if(cmd==='.dashboard' && allowed){
                const all = this.hub.router.getAll();

                // valid: online + ACTIVE + has socket
                const valid = all.filter(s =>
                    s && s.socket && s.online && s.state === SESSION_STATE.ACTIVE
                );

                // unique: deduplicate by phone number
                const unique = [];
                const seen = new Set();
                for (const b of valid) {
                    const num = b.self?.split('@')[0];
                    if (num && !seen.has(num)) {
                        seen.add(num);
                        unique.push(b);
                    }
                }

                const total      = all.length;
                const active     = all.filter(s => s.state === SESSION_STATE.ACTIVE).length;
                const paused     = all.filter(s => s.state === SESSION_STATE.PAUSED).length;
                const restricted = all.filter(s => s.state === SESSION_STATE.RESTRICTED).length;
                const dead       = all.filter(s => s.state === SESSION_STATE.DEAD).length;
                const locked     = all.filter(s => s.state === SESSION_STATE.LOCKED).length;
                const mem        = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
                const uptime     = process.uptime();
                const hrs        = Math.floor(uptime / 3600);
                const mins       = Math.floor((uptime % 3600) / 60);

                let msg =
`¤═══¤۩❦۩═══════════۩❦۩¤═══¤
⚡   𝐕ᴀᴍᴘɪʀᴇ    𝐃ᴀsʜʙᴏᴀʀᴅ   🐉
¤═══¤۩❦۩═══════════۩❦۩¤═══¤

📊 STATS
──────────────
Total Sessions : ${total}
Active (state) : ${active}
Online (real)  : ${unique.length}
Paused         : ${paused}
Restricted     : ${restricted}
Dead           : ${dead}
Locked         : ${locked}
Memory         : ${mem} MB
Uptime         : ${hrs}h ${mins}m

🤖 ACTIVE BOTS
──────────────
`;
                unique.forEach((b, i) => {
                    msg += `🟢 ${i+1}. ${b.self?.split('@')[0]} | ${b.id} | health:${b.core.health}%\n`;
                });

                if (unique.length === 0) msg += `  (no online bots right now)\n`;

                msg += `\n¤═══¤۩❦۩═══════════۩❦۩¤═══¤`;
                await this.send(chat, msg);
                return;
            }

            // ══ ADDSESSION ════════════════════════════════
            if(allowed && body.toLowerCase().startsWith('.addsession ')){
                const num = body.slice(12).replace(/\D/g,'');
                if(num.length < 10){ await this.send(chat,`❌ ${g('invalid phone number')}`); return; }

                // ── MULTI-SESSION: Allow up to MAX_SESSIONS_PER_PHONE per number ──
                const existingSessions = activePhoneRegistry.get(num);
                if(existingSessions){
                    let activeCount = 0;
                    for(const sid of existingSessions){
                        const s = this.hub.sessions.get(sid);
                        if(s && s.online && s.state === SESSION_STATE.ACTIVE) activeCount++;
                    }
                    if(activeCount >= MAX_SESSIONS_PER_PHONE){
                        await this.send(chat, `${TAG}\n\n⚠️ ${g('phone')} +${num} ${g('already has')} ${activeCount}/${MAX_SESSIONS_PER_PHONE} ${g('active sessions — limit reached')}`);
                        return;
                    }
                }

                const deadSlot = [...this.hub.sessions.values()].find(s =>
                    (s.state === SESSION_STATE.DEAD || s.state === SESSION_STATE.LOCKED) &&
                    (s.phone === num || !s.phone)
                );
                if(deadSlot){
                    deadSlot.state      = SESSION_STATE.ACTIVE;
                    deadSlot.retryCount = 0;
                    deadSlot.didPair    = false;
                    deadSlot.phone      = num;
                    await this.send(chat,`${TAG}\n\n♻️ ${g('reconnecting session')}: ${deadSlot.id} → +${num}`);
                    deadSlot.init();
                } else {
                    await this.send(chat,`${TAG}\n\n⏳ ${g('creating new session for')} +${num}…`);
                    const result = await this.hub.link(num, chat);
                    await this.send(chat, result);
                }
                return;
            }

            // ══ SUB / UNSUB ═══════════════════════════════
            if(isGroup && cmd==='.sub' && isOwn){
                const target=raw.message.extendedTextMessage?.contextInfo?.participant;
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone first')}`); return; }
                if(grantSub(target,chat)) await this.send(chat,`✅ ${g('promoted to sub-user')} 👥`,[target]);
                else                      await this.send(chat,`⚠️ ${g('already a sub-user')}`);
                return;
            }
            if(isGroup && cmd==='.unsub' && isOwn){
                const target=raw.message.extendedTextMessage?.contextInfo?.participant;
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone first')}`); return; }
                if(revokeSub(target,chat)) await this.send(chat,`✅ ${g('sub-user removed')}`,[target]);
                return;
            }

            // ══ FULLADMIN / UNFULLADMIN ═══════════════════
            // FEATURE: .fulladmin — hacker-style PFP card (REPLACED simple text)
            if(cmd==='.fulladmin' && isOwn){
                const target=raw.message.extendedTextMessage?.contextInfo?.participant;
                if(!target){ await this.sendFast(chat,`↩️ ${g('reply to someone first')}`); return; }
                const ok = grantFullAdmin(target);
                if(!ok){ await this.sendFast(chat,`⚠️ ${target.split('@')[0]} ${g('already has full admin access')}`); return; }
                const num = target.split('@')[0];
                let pfpUrl = null;
                try { pfpUrl = await this.socket.profilePictureUrl(target, 'image').catch(()=>null); } catch{}
                const card =
`╔═══════════════════════════════╗
║  ░▒▓█  𝐅ᴜʟʟ 𝐀ᴅᴍɪɴ 𝐆ʀᴀɴᴛᴇᴅ  █▓▒░  ║
║  🧛‍♂️   𝐕ᴀᴍᴘɪʀᴇ  𝐁ᴏᴛ  🧛‍♂️  ║
╚═══════════════════════════════╝

╭─⟦ 𝐓 𝐀 𝐑 𝐆 𝐄 𝐓 ⟧───────────╮
   👤  𝐁ᴇɴᴇғɪᴄɪᴀʀʏ   @${num}
   👑  𝐑ᴏʟᴇ            𝐅𝚄𝙻𝙻 𝐀𝙳𝙼𝙸𝙽
   🛰️  𝐒ᴄᴏᴘᴇ         𝐆𝙻𝙾𝙱𝙰𝙻 / 𝐀𝙻𝙻 𝐁𝙾𝚃𝚂
   🔓  𝐀ᴄᴄᴇss          𝐄𝚅𝙴𝚁𝚈 𝐂𝙾𝙼𝙼𝙰𝙽𝙳
   ⚙️  𝐆ʀᴀɴᴛᴇᴅ 𝐁𝚈     𝐎𝚆𝙽𝙴𝚁
╰─━━━━━━━━━━━━━━━━━━━━╯

   ▸ 𝚄𝚂𝙴𝚁 𝙲𝙰𝙽 ▸ 𝚛𝚞𝚗 𝚊𝚝𝚝𝚊𝚌𝚔𝚜
   ▸ 𝚄𝚂𝙴𝚁 𝙲𝙰𝙽 ▸ 𝚌𝚘𝚗𝚝𝚛𝚘𝚕 𝚏𝚕𝚎𝚎𝚝
   ▸ 𝚁𝙴𝚅𝙾𝙺𝙴 𝚆𝙸𝚃𝙷 ▸ .unfulladmin

╔═══════════════════════════════╗
║   𓂀  𝐀𝙲𝙲𝙴𝚂𝚂 𝐒𝙴𝙰𝙻𝙴𝙳 ▸ 𝟸𝟺/𝟽 𝐀𝙲𝚃𝙸𝚅𝙴  𓂀  ║
╚═══════════════════════════════╝`;
                try {
                    if(pfpUrl){
                        const buf = await (await fetch(pfpUrl)).arrayBuffer();
                        await this.socket.sendMessage(chat, { image: Buffer.from(buf), caption: card, mimetype: 'image/jpeg', mentions: [target] });
                    } else {
                        const _fa = getPanelImage('fulladmin', chat);
                        if(_fa) await this.socket.sendMessage(chat, { image: _fa, caption: card, mimetype: 'image/jpeg', mentions: [target] });
                        else    await this.socket.sendMessage(chat, { text: card, mentions: [target] });
                    }
                } catch(e){
                    if(!_isSuppressedErr(e)) try { await this.sendFast(chat, card, [target]); } catch {}
                }
                return;
            }
            if(cmd==='.unfulladmin' && isOwn){
                const target=raw.message.extendedTextMessage?.contextInfo?.participant;
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone first')}`); return; }
                if(revokeFullAdmin(target)) await this.send(chat,`◼ ${target.split('@')[0]} ${g('full control revoked')}`);
                return;
            }

            // ══ GIVEACCESS ════════════════════════════════
            if(cmd==='.giveaccess' && isOwn){
                const target=raw.message.extendedTextMessage?.contextInfo?.participant;
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone first')}`); return; }
                if(grantTrusted(target)){
                    await this.send(chat,`🔓 ${target.split('@')[0]} ${g('can now use ALL bot commands globally')} ⚡`,[target]);
                } else {
                    await this.send(chat,`⚠️ ${target.split('@')[0]} ${g('already has access')}`);
                }
                return;
            }
            if(cmd==='.revokeaccess' && isOwn){
                const target=raw.message.extendedTextMessage?.contextInfo?.participant;
                if(!target){ await this.send(chat,`↩️ ${g('reply to someone first')}`); return; }
                if(revokeTrusted(target)){
                    await this.send(chat,`🔒 ${target.split('@')[0]} ${g('all-bot access revoked')}`);
                } else {
                    await this.send(chat,`⚠️ ${g('user not in trusted list')}`);
                }
                return;
            }

            // ══ +nc1 - +nc100 ═══════════════════════════════
            // [NEW SYSTEM] expanded from +nc1-+nc9 → +nc1-+nc100 (auto-generated emoji sets).
            // Variable slice-length handles 1-, 2-, and 3-digit nc numbers correctly.
            const _ncShortcut = body.toLowerCase().match(/^\+nc(\d{1,3})\s+/);
            if(_ncShortcut){
                const i = parseInt(_ncShortcut[1], 10);
                if(i >= 1 && i <= 100){
                    const prefixLen = _ncShortcut[0].length; // "+ncNN " length
                    const txt = cleanBody(body.slice(prefixLen).trim());
                    if(!txt){ await this.send(chat,`📋 +nc${i} [${g('text')}]`); return; }
                    if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                    const targetGcs = parseGcs(body);
                    await this.hub.router.pushToGcs('nc_start',{txt,key:`nc${i}`,setName:`nc${i}`},this.id,true,targetGcs); return;
                }
            }

            // ══ +s (slide) ════════════════════════════════
            if(body.toLowerCase().startsWith('+s ')){
                if(!raw.message.extendedTextMessage?.contextInfo?.quotedMessage){
                    await this.send(chat,`↩️ ${g('reply to target first')}\n📋 +s [${g('text')}] [${g('ms')}]`); return;
                }
                const parts=body.slice(3).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 +s [${g('text')}] [${g('ms')}]`); return; }
                const ms=parseInt(parts[parts.length-1]);
                if(isNaN(ms)||ms<30){ await this.send(chat,`⏱️ ${g('minimum 30ms')}`); return; }
                const txt=parts.slice(0,-1).join(' ');
                const ctx=raw.message.extendedTextMessage.contextInfo;
                await this.hub.router.push('slide_start',{
                    chat,txt,ms,
                    mark:  ctx.participant||ctx.remoteJid,
                    refId: ctx.stanzaId,
                    refMsg:ctx.quotedMessage
                },this.id); return;
            }

            // ══ +txt ═════════════════════════════════════
            if(body.toLowerCase().startsWith('+txt ')){
                const parts=body.slice(5).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 +txt [${g('text')}] [${g('ms')}]`); return; }
                const ms=parseInt(parts[parts.length-1]);
                if(isNaN(ms)||ms<30){ await this.send(chat,`⏱️ ${g('minimum 30ms')}`); return; }
                const txt=parts.slice(0,-1).join(' ');
                await this.hub.router.push('txt_start',{chat,txt,ms},this.id); return;
            }

            // ══ +tts / +ttw ═══════════════════════════════
            if(body.toLowerCase().startsWith('+tts ')){
                const txt=body.slice(5).trim();
                if(!txt){ await this.send(chat,`📋 +tts [${g('text')}]`); return; }
                try{
                    const {buffer,mimetype,ptt}=await makeTTS(txt);
                    await this.socket.sendMessage(chat,{audio:buffer,mimetype,ptt});
                }catch(e){ await this.send(chat,`❌ ${g('tts failed')}: ${e.message}`); }
                return;
            }
            if(body.toLowerCase().startsWith('+ttw ')){
                const parts=body.slice(5).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 +ttw [${g('text')}] [${g('ms')}]`); return; }
                const ms=parseInt(parts[parts.length-1]);
                if(isNaN(ms)||ms<1000){ await this.send(chat,`⏱️ ${g('minimum 1000ms for voice')}`); return; }
                const txt=parts.slice(0,-1).join(' ');
                await this.hub.router.push('voice_start',{chat,txt,ms},this.id); return;
            }

            // ══ +pic ════════════════════════════════════
            if(body.toLowerCase().startsWith('+pic ')){
                if(!raw.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage){
                    await this.send(chat,`📸 ${g('reply to an image first')}\n📋 +pic [${g('ms')}]`); return;
                }
                const ms=parseInt(body.slice(5).trim());
                if(isNaN(ms)||ms<100){ await this.send(chat,`⏱️ ${g('minimum 100ms for images')}`); return; }
                const ctx=raw.message.extendedTextMessage.contextInfo;
                const qm={key:{remoteJid:chat,fromMe:false,id:ctx.stanzaId,participant:ctx.participant},message:ctx.quotedMessage};
                try{
                    const buf=await downloadMediaMessage(qm,'buffer',{});
                    await this.hub.router.push('img_start',{
                        chat,ms,
                        data:buf.toString('base64'),
                        mime:ctx.quotedMessage.imageMessage.mimetype||'image/jpeg'
                    },this.id);
                }catch(e){ await this.send(chat,`❌ ${g('could not download image')}`); }
                return;
            }

            // ══ ADDALL ════════════════════════════════════
            if(isGroup && cmd==='.addall' && isOwn){
                const alive = this.hub.router.getAlive();
                const botJids = alive.map(b => b.self).filter(Boolean);
                if(botJids.length === 0){ await this.send(chat,`❌ ${g('no bots connected')}`); return; }
                await this.send(chat,`${TAG}\n\n⏳ ${g('adding')} ${botJids.length} ${g('bots and promoting to admin')}...`);
                let added=0, skipped=0, failed=0;
                for(const jid of botJids){
                    try{
                        const res = await this.socket.groupParticipantsUpdate(chat, [jid], "add");
                        if(res && res[0]?.status === '403') { skipped++; continue; }
                        if(res && res[0]?.status === '200') { added++; }
                        else skipped++;
                        await delay(1500);
                    }catch(e){
                        if(isRateErr(e)){ logw(this.id,'Rate limit hit on addall — pausing 60s'); await delay(RATE_LIMIT_PAUSE); }
                        else { failed++; loge(this.id,`addall add err: ${e.message}`); }
                    }
                }
                await delay(2000);
                let promoted=0;
                for(const jid of botJids){
                    try{
                        await this.socket.groupParticipantsUpdate(chat, [jid], "promote");
                        promoted++;
                        await delay(1000);
                    }catch(e){
                        if(isRateErr(e)){ await delay(RATE_LIMIT_PAUSE); }
                        else loge(this.id,`addall promote err: ${e.message}`);
                    }
                }
                await this.send(chat,
                    `${TAG}\n\n✅ ${g('done')}\n`+
                    `➕ ${g('added')}: ${added}\n`+
                    `⏭️ ${g('skipped')} (${g('already in')}): ${skipped}\n`+
                    `❌ ${g('failed')}: ${failed}\n`+
                    `👑 ${g('promoted to admin')}: ${promoted}`
                );
                return;
            }

            // ══ ADD BOT ═══════════════════════════════════
            if(isOwn && body.toLowerCase().startsWith('.addbot ')){
                const num=body.slice(8).replace(/\D/g,'');
                if(num.length<10){ await this.send(chat,`❌ ${g('invalid phone number')}`); return; }

                // ── MULTI-SESSION: Allow up to MAX_SESSIONS_PER_PHONE per number ──
                const existingSessionsB = activePhoneRegistry.get(num);
                if(existingSessionsB){
                    let activeCountB = 0;
                    for(const sid of existingSessionsB){
                        const s = this.hub.sessions.get(sid);
                        if(s && s.online && s.state === SESSION_STATE.ACTIVE) activeCountB++;
                    }
                    if(activeCountB >= MAX_SESSIONS_PER_PHONE){
                        await this.send(chat, `${TAG}\n\n⚠️ ${g('phone')} +${num} ${g('already has')} ${activeCountB}/${MAX_SESSIONS_PER_PHONE} ${g('active sessions — limit reached')}`);
                        return;
                    }
                }

                await this.send(chat,`${TAG}\n\n⏳ ${g('creating session for')} +${num}…\n${g('pairing code will arrive in a few seconds')}`);
                const result = await this.hub.link(num,chat);
                await this.send(chat,result);
                return;
            }

            // ══ INFO COMMANDS ═════════════════════════════
            if(cmd==='.menu' && allowed){
                // [NEW UI] feed dynamic stats into the premium header
                const all = this.hub.router.getAll();
                const aliveCount = all.filter(s=>s.online && s.state===SESSION_STATE.ACTIVE).length;
                await this.sendImg(chat, MENU_TEXT({aliveCount, totalCount: all.length, mode: this.core.mode}));
                return;
            }

            // FEATURE: .song <name> — search a song by name and send as audio.
            // Uses saavn.dev (free, no key) for Indian/Bollywood + global pop/hits.
            // Picks the highest available bitrate (320kbps preferred) and streams as audio message.
            // Fully async — never blocks the event loop or other commands.
            if(allowed && cmd.startsWith('.song')){
                const query = body.slice(5).trim();
                if(!query){
                    await this.sendFast(chat, `${TAG}\n\n🎵 ${g('usage')}: .song <song name>\n   ${g('example')}: .song tum hi ho`);
                    return;
                }
                // Fire-and-forget so heavy network never freezes other commands.
                setImmediate(async () => {
                    try {
                        await this.sendFast(chat, `🔎 ${g('searching')}: ${query}...`);
                        const url = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=1`;
                        const ctrl = new AbortController();
                        const tmo  = setTimeout(()=>ctrl.abort(), 12000);
                        let json;
                        try {
                            const r = await fetch(url, { signal: ctrl.signal });
                            json = await r.json();
                        } finally { clearTimeout(tmo); }
                        const hit = json?.data?.results?.[0];
                        if(!hit){ await this.sendFast(chat, `❌ ${g('no results found for')}: ${query}`); return; }
                        // downloadUrl is an array sorted by quality — pick the highest (last).
                        const dl = Array.isArray(hit.downloadUrl) ? hit.downloadUrl : [];
                        const best = dl[dl.length-1]?.url || dl[0]?.url;
                        if(!best){ await this.sendFast(chat, `❌ ${g('no audio link available')}`); return; }
                        const title  = hit.name || query;
                        const artist = (hit.artists?.primary?.map(a=>a.name).join(', '))
                                    || hit.primaryArtists || hit.singers || '';
                        const album  = hit.album?.name || '';
                        const dur    = hit.duration ? `${Math.floor(hit.duration/60)}:${String(hit.duration%60).padStart(2,'0')}` : '';
                        // Download the audio with timeout so a slow CDN cannot hang us forever.
                        const ctrl2 = new AbortController();
                        const tmo2  = setTimeout(()=>ctrl2.abort(), 45000);
                        let buf;
                        try {
                            const ar = await fetch(best, { signal: ctrl2.signal });
                            buf = Buffer.from(await ar.arrayBuffer());
                        } finally { clearTimeout(tmo2); }
                        if(!buf || buf.length < 1024){ await this.sendFast(chat, `❌ ${g('failed to fetch audio')}`); return; }
                        const caption = `🎵 ${title}${artist?` — ${artist}`:''}${album?`\n💿 ${album}`:''}${dur?`\n⏱️ ${dur}`:''}`;
                        // Send as music (ptt:false so it shows as a track, not voice note).
                        await this.socket.sendMessage(chat, { audio: buf, mimetype: 'audio/mp4', ptt: false, fileName: `${title}.m4a` });
                        await this.sendFast(chat, caption);
                    } catch(e){
                        if(!_isSuppressedErr(e)) loge(this.id, `.song err: ${e?.message||e}`);
                        try { await this.sendFast(chat, `⚠️ ${g('song fetch failed')}: ${e?.message||'unknown error'}`); } catch{}
                    }
                });
                return;
            }

            // FIX: alive command — always responds, dynamic header (uptime/active/total/mode), sends WITH IMAGE, hardened try/catch
            if(cmd==='.alive' && allowed){
                try {
                    const list = this.hub.router.getAll();
                    const online    = list.filter(s => s.online && s.socket && s.state===SESSION_STATE.ACTIVE);
                    const pairing   = list.filter(s => !s.online && (s.state===SESSION_STATE.ACTIVE||s.state===SESSION_STATE.PAUSED) && s.phone);
                    const problem   = list.filter(s => s.state===SESSION_STATE.RESTRICTED||s.state===SESSION_STATE.DEAD||s.state===SESSION_STATE.LOCKED);
                    const aliveCount = online.length;
                    const totalCount = list.length;
                    const mode  = this.core?.mode || 'safe';
                    let m = buildAliveCard({aliveCount, totalCount, mode});
                    m += `\n\n  ▸ 𝐒𝐞𝐬𝐬𝐢𝐨𝐧𝐬     ${online.length} online`;
                    if(pairing.length) m += ` ▸ ${pairing.length} connecting`;
                    if(problem.length) m += ` ▸ ${problem.length} error`;
                    if(online.length){
                        m += `\n\n  𝙾𝙽𝙻𝙸𝙽𝙴`;
                        online.forEach(s => { m += `\n  ▣  ${s.id}   ${s.self?.split('@')[0]??'—'}`; });
                    }
                    if(pairing.length){
                        m += `\n\n  𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙸𝙽𝙶`;
                        pairing.forEach(s => { m += `\n  ▸  ${s.id}   +${s.phone??'—'}`; });
                    }
                    if(problem.length){
                        m += `\n\n  𝙴𝚁𝚁𝙾𝚁`;
                        problem.forEach(s => { m += `\n  ▼  ${s.id}   ${s.self?.split('@')[0]??s.phone??'—'}`; });
                    }
                    if(!online.length && !pairing.length && !problem.length){
                        m += `\n\n  ▸ no bots connected — use .addbot to add one`;
                    }
                    // FEATURE: image send — alive card sent WITH ./susanoo.jpg
                    await this.sendImg(chat, m);
                } catch(e){
                    // FIX: alive must NEVER fail silently — fallback to plain text response
                    try {
                        const upS = Math.floor(process.uptime());
                        await this.send(chat, `${TAG}\n\n▣ vampire ▸ ONLINE\n  ▸ uptime ${upS}s\n  ▸ alive (fallback) ${e?.message||'err'}`);
                    } catch{}
                }
                return;
            }
            // FIX: ping — real latency via round-trip sendMessage (was always reporting ~0ms before).
            // Sends an instant probe via sendFast (no typing/mode delay), measures actual ms,
            // then edits-in the result with a second instant send.
            // FEATURE: .ping — multi-bot fleet ping. Pings the current bot first (round-trip),
            // then probes EVERY other session in parallel and prints a per-bot ms breakdown
            // with online/offline status, mode, and health. Single message to keep chat clean.
            if(cmd==='.ping' && allowed){
                const t0 = Date.now();
                const ok = await this.sendFast(chat, `🏓 ${g('pinging fleet...')}`);
                const myMs = Date.now() - t0;
                if(!ok) return;
                const all = this.hub.router.getAll();
                const probes = await Promise.all(all.map(async s => {
                    if(s.id === this.id) return { id:s.id, ms:myMs, online:true, mode:s.core?.mode, health:s.core?.health, self:s.self };
                    if(!s.online || !s.socket) return { id:s.id, ms:null, online:false, mode:s.core?.mode, health:s.core?.health, self:s.self };
                    const t = Date.now();
                    let online = false;
                    try { await Promise.race([ s.socket.sendPresenceUpdate?.('available').then(()=>true).catch(()=>false), new Promise(r=>setTimeout(()=>r(false),3500)) ]); online = true; }
                    catch { online = false; }
                    return { id:s.id, ms: online ? Date.now()-t : null, online, mode:s.core?.mode, health:s.core?.health, self:s.self };
                }));
                const lines = probes
                    .sort((a,b) => (a.ms ?? 1e9) - (b.ms ?? 1e9))
                    .map(p => {
                        const phone = p.self?.split('@')[0] || '—';
                        const dot   = p.online ? '🟢' : '🔴';
                        const ms    = p.online ? `${p.ms}ms` : 'offline';
                        const star  = p.id === this.id ? ' ★' : '';
                        return `  ${dot} ${p.id}${star}  ${phone}  ${ms}  [${(p.mode||'safe').toUpperCase()}]  ❤${p.health ?? '?'}`;
                    }).join('\n');
                const onlineN = probes.filter(p=>p.online).length;
                await this.sendFast(chat,
                    `${TAG}\n\n` +
                    `⚡ 𝐅𝐋𝐄𝐄𝐓 𝐏𝐈𝐍𝐆\n` +
                    `🤖 ${g('online')} : ${onlineN}/${probes.length}\n` +
                    `★ ${g('responding bot')} : ${this.id}  (${myMs}ms)\n\n` +
                    lines
                );
                return;
            }
            if(cmd==='.words' && allowed){
                let m=`${TAG}\n\n📝 ${g('word list')}\n\n`;
                WORD_CYCLE.forEach((w,i)=>m+=`  ${i+1}. ${w}\n`);
                await this.send(chat, m);
                return;
            }
            if(cmd==='.live' && allowed){
                const all=this.hub.router.getAll();
                let nc=0,wl=0,fl=0,el=0,sp=0,sw=0,tx=0,sl=0,vc=0,im=0,gn=0,ult=0,sas=0,trp=0;
                all.forEach(s=>{
                    nc+=s.nameLoops.size; wl+=s.wordLoop.size; fl+=s.flagLoop.size;
                    el+=s.emojiLoop.size; sp+=s.spamLoop.size; sw+=s.swipeLoop.size;
                    tx+=s.txtLoop.size; sl+=s.slideLoop.size; vc+=s.voiceLoop.size;
                    im+=s.imgLoop.size; gn+=s.gcnameLoop.size;
                });
                // FEATURE: now also reports ultranc/sasnc/triple chat-level engines (global maps)
                try { ult = ultraNcLoops.size; sas = sasNcLoops.size; trp = tripleNcLoops.size; } catch{}
                // OPTIMIZATION: instant reply via sendFast
                await this.sendFast(chat,
                    `${TAG}\n`+
                    `━━━━━━━━━━━━━━━━━━━━\n`+
                    `  ${g('live attacks')}\n`+
                    `━━━━━━━━━━━━━━━━━━━━\n`+
                    `  ⚔️  ${g('name change')}  ${nc}\n`+
                    `  🌀  ${g('word cycle')}   ${wl}\n`+
                    `  🏳️  ${g('flag cycle')}   ${fl}\n`+
                    `  🎭  ${g('emoji cycle')}  ${el}\n`+
                    `  💬  ${g('spam')}         ${sp}\n`+
                    `  🔁  ${g('swipe')}        ${sw}\n`+
                    `  💀  ${g('txt loop')}     ${tx}\n`+
                    `  🎯  ${g('slide')}        ${sl}\n`+
                    `  🎤  ${g('voice')}        ${vc}\n`+
                    `  📸  ${g('image')}        ${im}\n`+
                    `  🏷️  ${g('gc name')}      ${gn}\n`+
                    `  💥  ${g('ultranc')}      ${ult}\n`+
                    `  🛡️   ${g('sasnc')}        ${sas}\n`+
                    `  🌀  ${g('triple')}       ${trp}\n`+
                    `━━━━━━━━━━━━━━━━━━━━\n`+
                    `  🤖  ${g('bots')}  ${all.filter(s=>s.online).length}/${all.length}`
                ); return;
            }

            // FEATURE + UI: hacker-style panels — .atkpanel / .triplepanel / .vampirencpanel
            // Three premium ASCII/unicode dashboards. Each is a scannable cinematic card,
            // mixing 𝐁𝐎𝐋𝐃 + 𝓈𝒸𝓇𝒾𝓅𝓉 + ░▒▓ glitch fonts for a hacker terminal vibe.
            // Sent via sendFast so they land instantly when the user types the command.
            if(allowed && (cmd==='.atkpanel' || cmd==='.attackpanel')){
                const all = this.hub.router.getAll();
                const onl = all.filter(s=>s.online && s.state===SESSION_STATE.ACTIVE).length;
                let nc=0,wl=0,fl=0,el=0,sp=0,sw=0,tx=0,sl=0,vc=0,im=0,gn=0;
                all.forEach(s=>{
                    nc+=s.nameLoops.size; wl+=s.wordLoop.size; fl+=s.flagLoop.size;
                    el+=s.emojiLoop.size; sp+=s.spamLoop.size; sw+=s.swipeLoop.size;
                    tx+=s.txtLoop.size; sl+=s.slideLoop.size; vc+=s.voiceLoop.size;
                    im+=s.imgLoop.size; gn+=s.gcnameLoop.size;
                });
                const totalAtk = nc+wl+fl+el+sp+sw+tx+sl+vc+im+gn;
                const ramMB = (process.memoryUsage().rss/1024/1024).toFixed(0);
                await this._sendPanelCard(chat, 'atkpanel',
                    `${TAG}\n`+
                    `╭─░▒▓█ 𝐀ᴛᴋ  𝐏ᴀɴᴇʟ █▓▒░─╮\n`+
                    `│   𝐕ᴀᴍᴘɪʀᴇ  𝔠𝔬𝔪𝔪𝔞𝔫𝔡  𝔠𝔢𝔫𝔱𝔢𝔯  │\n`+
                    `╰─━━━━━━━━━━━━━━━━━━━━━─╯\n`+
                    `  ▸ 𝐁ᴏᴛs       ${onl}/${all.length}\n`+
                    `  ▸ 𝐌ᴏᴅᴇ        ${this.core?.mode||'safe'}\n`+
                    `  ▸ 𝐑ᴀᴍ         ${ramMB}mb\n`+
                    `  ▸ 𝐓ᴏᴛᴀʟ  𝐀ᴛᴋ   ${totalAtk}\n`+
                    `╭─⟦ 𝐋ɪᴠᴇ  𝐅ᴇᴇᴅ ⟧─────────╮\n`+
                    `  ⚔️  𝐍ᴀᴍᴇ ${nc}     🌀 𝐰𝐨𝐫𝐝 ${wl}\n`+
                    `  🏳️  𝐅ʟᴀɢ ${fl}     🎭 𝐞𝐦𝐨𝐣𝐢 ${el}\n`+
                    `  💬 𝐒ᴘᴀᴍ ${sp}     🔁 𝐬𝐰𝐢𝐩𝐞 ${sw}\n`+
                    `  💀 𝐓xᴛ ${tx}      🎯 𝐬𝐥𝐢𝐝𝐞 ${sl}\n`+
                    `  🎤 𝐕ᴄ ${vc}       📸 𝐢𝐦𝐠 ${im}\n`+
                    `  🏷️  𝐆ᴄ𝐍ᴀᴍᴇ ${gn}\n`+
                    `╰─━━━━━━━━━━━━━━━━━━━━━─╯\n`+
                    `  ░▒▓█  ${g('strike when ready')}  █▓▒░`
                );
                return;
            }
            if(allowed && cmd==='.triplepanel'){
                const trp = (()=>{ try { return tripleNcLoops.size; } catch { return 0; } })();
                const presetList = (TRIPLE_PRESETS||[]).map((p,i) =>
                    `  ▸ .triple${i+1}  ${'★'.repeat(Math.min(p.intensity||(i+1),5))}${'☆'.repeat(Math.max(0,5-(p.intensity||(i+1))))}  ${p.label||''}`
                ).join('\n');
                await this._sendPanelCard(chat, 'triplepanel',
                    `${TAG}\n`+
                    `╭─░▒▓█ 𝐓ʀɪᴘʟᴇ  𝐏ᴀɴᴇʟ █▓▒░─╮\n`+
                    `│  𝓃𝒸  𝓅𝓇𝑒𝓈𝓈𝓊𝓇𝑒  𝓁𝒶𝒹𝒹𝑒𝓇  𝟙→𝟙𝟘  │\n`+
                    `╰─━━━━━━━━━━━━━━━━━━━━━─╯\n`+
                    `  ▸ 𝐀ᴄᴛɪᴠᴇ        ${trp} ${g('chats')}\n`+
                    `  ▸ 𝐔sᴀɢᴇ         .triple<1-10> [text]\n`+
                    `  ▸ 𝐒ᴛᴏᴘ          .stoptriple\n`+
                    `╭─⟦ 𝐏ʀᴇsᴇᴛ  𝐋ᴀᴅᴅᴇʀ ⟧───╮\n`+
                    `${presetList||'  ▸ (no presets loaded)'}\n`+
                    `╰─━━━━━━━━━━━━━━━━━━━━━─╯\n`+
                    `  ░▒▓█  𝐋𝟓+ 𝐝𝐨𝐮𝐛𝐥𝐞-𝐞𝐦𝐨𝐣𝐢   𝐋𝟖+ 𝐭𝐫𝐢𝐩𝐥𝐞-𝐞𝐦𝐨𝐣𝐢  █▓▒░`
                );
                return;
            }
            if(allowed && cmd==='.vampirencpanel'){
                const ult = ultraNcLoops.size, sas = sasNcLoops.size;
                const fleet = this.hub.router.getAll().filter(s => s && s.socket && s.online && s.state===SESSION_STATE.ACTIVE).length;
                // FEATURE [PANEL]: redesigned premium vampirenc panel — full 1→10 ladder,
                // theme tags, rotating banner, live fleet stats, every related command.
                const _themes = [
                    {n:'vampirenc1',  t:'⚡ 𝙻𝙸𝙶𝙷𝚃𝙽𝙸𝙽𝙶',     d:'electric burst — opener'},
                    {n:'vampirenc2',  t:'🔥 𝙱𝙻𝙰𝚉𝙴',         d:'flame ladder — warm-up'},
                    {n:'vampirenc3',  t:'🌑 𝚂𝙷𝙰𝙳𝙾𝚆',        d:'silent dark cycle'},
                    {n:'vampirenc4',  t:'🩸 𝙱𝙻𝙾𝙾𝙳',         d:'red-edge intensity'},
                    {n:'vampirenc5',  t:'❄️ 𝙵𝚁𝙾𝚂𝚃',         d:'cold ice rotation'},
                    {n:'vampirenc6',  t:'⚔️ 𝙱𝙻𝙰𝙳𝙴',         d:'metal slash sweep'},
                    {n:'vampirenc7',  t:'🌪️ 𝚂𝚃𝙾𝚁𝙼',         d:'whirlwind chain'},
                    {n:'vampirenc8',  t:'☠️ 𝚅𝙴𝙽𝙾𝙼',         d:'toxic slow-burn'},
                    {n:'vampirenc9',  t:'🌌 𝚅𝙾𝙸𝙳',          d:'cosmic emoji storm'},
                    {n:'vampirenc10', t:'💀 𝙰𝙿𝙾𝙲𝙰𝙻𝚈𝙿𝚂𝙴',   d:'TIER X — final form'},
                ];
                const _bars   = ['▰','▱','▰','▱','▰','▱','▰','▱','▰','▱'];
                const _ladder = _themes.map((s,i)=>
                    `  ${_bars[i]} .${s.n.padEnd(11,' ')} ${s.t.padEnd(18,' ')}  ${g(s.d)}`
                ).join('\n');
                await this._sendPanelCard(chat, 'vampirencpanel',
                    `${TAG}\n`+
                    `╔══════════════════════════════════╗\n`+
                    `║  🧛‍♂️ 𝐕ᴀᴍᴘɪʀᴇ  𝐍ᴄ   𝐂ᴏᴍᴍᴀɴᴅ  𝐂ᴇɴᴛᴇʀ  🧛‍♂️ ║\n`+
                    `║  🩸 𝐅ᴜʟʟ  𝐅ʟᴇᴇᴛ · 𝐌ᴜʟᴛɪ-𝐒ᴇssɪᴏɴ 🩸  ║\n`+
                    `╚══════════════════════════════════╝\n`+
                    `\n`+
                    `┏━━━━━━━━━ 𝐋ɪᴠᴇ  𝐒ᴛᴀᴛᴜs ━━━━━━━━━┓\n`+
                    `  🤖  𝐅ʟᴇᴇᴛ        ${fleet} ${g('bots online')}\n`+
                    `  💥  𝐔ʟᴛʀᴀ𝐍ᴄ      ${ult} ${g('chats running')}\n`+
                    `  🛡️   𝐒ᴀs𝐍ᴄ        ${sas} ${g('chats running')}\n`+
                    `  ⚡  𝐁ᴜʀsᴛ 𝕏      ${ultraNcSpeed.parallel||4} ${g('parallel')}\n`+
                    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`+
                    `\n`+
                    `┏━━━━ 🩸 𝐕ᴀᴍᴘɪʀᴇ𝐍ᴄ  𝐋𝟏 → 𝐋𝟏𝟎 ━━━━┓\n`+
                    `${_ladder}\n`+
                    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`+
                    `\n`+
                    `┏━━━━━━━ 🚀 𝐌ᴀɪɴ 𝐄ɴɢɪɴᴇs ━━━━━━┓\n`+
                    `  🩸 .ultranc  [text]   ${g('ULTRA burst engine')}\n`+
                    `  🛡️  .sasnc    [text]   ${g('SAFE-BURST engine')}\n`+
                    `  ⚡ .snc      [text]   ${g('STEALTH cycle')}\n`+
                    `  🎁 .bonusnc  [text]   ${g('BONUS rotating burst')}\n`+
                    `  🛳️  .fleetnc  [text]   ${g('FLEET-wide attack')}\n`+
                    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`+
                    `\n`+
                    `┏━━━━━━━ 🛑 𝐒ᴛᴏᴘ 𝐂ᴏɴᴛʀᴏʟ ━━━━━━┓\n`+
                    `  ◼ .stopultranc  / .stopsasnc\n`+
                    `  ◼ .stopsnc      / .stopbonusnc\n`+
                    `  ◼ .stopfleetnc  / .stoptriple\n`+
                    `  💀 .killall   ${g('this group only')}\n`+
                    `  💀 .gkill     ${g('every loop everywhere')}\n`+
                    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`+
                    `\n`+
                    `┏━━━━━━━ ⚙️  𝐓ᴜɴɪɴɢ ━━━━━━━━━━━┓\n`+
                    `  ▸ .setncspeed  [ms] [burst] [par]\n`+
                    `  ▸ .setsasspeed [ms] [burst] [par]\n`+
                    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`+
                    `\n`+
                    `╔══════════════════════════════════╗\n`+
                    `║  ░▒▓█  𝐀ʟʟ 𝐁ᴏᴛs 𝐒ᴛʀɪᴋᴇ 𝐈ɴ 𝐏ᴀʀᴀʟʟᴇʟ  █▓▒░  ║\n`+
                    `║  🧛‍♂️   𝐕ᴀᴍᴘɪʀᴇ  𝐆𝕠ᴅ  · 𝕍ᴇʀ𝕤ɪᴏɴ-𝟑𝟘   🧛‍♂️   ║\n`+
                    `╚══════════════════════════════════╝
                return;
            }

            // FEATURE: .bcast / .broadcast — fleet-wide group announcement (owner only).
            // Iterates every joined group, skips banned/restricted/community JIDs, throttles
            // 1.2s between sends to avoid WA rate-limit. Uses sendFast so heavy attack loops
            // don't stall the broadcast.
            if(allowed && (cmd === '.bcast' || cmd === '.broadcast' || body.toLowerCase().startsWith('.bcast ') || body.toLowerCase().startsWith('.broadcast '))){
                const text = body.replace(/^\.(bcast|broadcast)\s*/i,'').trim();
                if(!text){ await this.sendFast(chat, `📢 ${g('usage')}: .bcast <message>`); return; }
                const groups = (() => {
                    try { return Object.keys(this.socket?.store?.chats || {}).filter(j => j.endsWith('@g.us')); } catch { return []; }
                })();
                let groupList = groups;
                if(!groupList.length){
                    try {
                        const all = await this.socket.groupFetchAllParticipating();
                        groupList = Object.keys(all || {});
                    } catch {}
                }
                if(!groupList.length){ await this.sendFast(chat, `📢 ${g('no groups found')}`); return; }
                const card =
`╔═══ 📢 𝐁 𝐑 𝐎 𝐀 𝐃 𝐂 𝐀 𝐒 𝐓 📢 ═══╗
   ⚡  𝐕ᴀᴍᴘɪʀᴇ  𝐅ʟᴇᴇᴛ  𝐀ɴɴᴏᴜɴᴄᴇ ⚡
╚════════════════════════════════╝

${text}

  ▰▱▰▱▰▱▰▱▰▱▰▱▰▱`;
                await this.sendFast(chat, `📢 ${g('broadcasting to')} ${groupList.length} ${g('groups')}...`);
                let ok = 0, fail = 0;
                for(const gjid of groupList){
                    if(this.state === SESSION_STATE.RESTRICTED) break;
                    try {
                        const _bbuf = getCustomPanelImage('broadcast', gjid);
                        if(_bbuf) await this.socket.sendMessage(gjid, { image: _bbuf, caption: card, mimetype: 'image/jpeg' });
                        else      await this.socket.sendMessage(gjid, { text: card });
                        ok++;
                    } catch(e){
                        fail++;
                        if(_isSuppressedErr(e)) _bumpDecryptErr(this.id, this.socket);
                    }
                    await delay(1200);
                }
                await this.sendFast(chat, `📢 ${g('broadcast done')} — ✅ ${ok}  ❌ ${fail}`);
                return;
            }

            // FEATURE: tag commands — vampire style (.tagall .smarttag .hidetag .tag)
            if(allowed && (cmd === '.tagall' || body.toLowerCase().startsWith('.tagall '))){
                if(!isGroup){ await this.sendFast(chat, `👥 ${g('groups only')}`); return; }
                try {
                    const meta = await this.socket.groupMetadata(chat);
                    const ps   = (meta?.participants || []).map(p => p.id).filter(Boolean);
                    const note = body.slice(7).trim() || g('Sab dhyan do!');
                    const lines = ps.map(j => `▸ @${j.split('@')[0]}`).join('\n');
                    const card =
`╔═══ ⚡ 𝐓 𝐀 𝐆 𝐀 𝐋 𝐋 ⚡ ═══╗
   📣  ${note}
   👥  𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${ps.length}
╚══════════════════════════╝
${lines}`;
                    await this.socket.sendMessage(chat, { text: card, mentions: ps });
                } catch(e){ if(!_isSuppressedErr(e)) trackError('commands', e); }
                return;
            }
            if(allowed && (cmd === '.hidetag' || body.toLowerCase().startsWith('.hidetag '))){
                if(!isGroup){ await this.sendFast(chat, `👥 ${g('groups only')}`); return; }
                try {
                    const meta = await this.socket.groupMetadata(chat);
                    const ps   = (meta?.participants || []).map(p => p.id).filter(Boolean);
                    const note = body.slice(8).trim() || '👁️';
                    await this.socket.sendMessage(chat, { text: note, mentions: ps });
                } catch(e){ if(!_isSuppressedErr(e)) trackError('commands', e); }
                return;
            }
            if(allowed && (cmd === '.smarttag' || body.toLowerCase().startsWith('.smarttag '))){
                if(!isGroup){ await this.sendFast(chat, `👥 ${g('groups only')}`); return; }
                try {
                    const meta = await this.socket.groupMetadata(chat);
                    const ps   = (meta?.participants || []).map(p => p.id).filter(Boolean);
                    const note = body.slice(9).trim() || g('Smart ping');
                    for(let i=0; i<ps.length; i+=25){
                        const slice = ps.slice(i, i+25);
                        const lines = slice.map(j => `• @${j.split('@')[0]}`).join('\n');
                        await this.socket.sendMessage(chat, { text: `📡 ${note}\n${lines}`, mentions: slice });
                        await delay(800);
                    }
                } catch(e){ if(!_isSuppressedErr(e)) trackError('commands', e); }
                return;
            }
            if(allowed && (cmd === '.tag' || body.toLowerCase().startsWith('.tag '))){
                if(!isGroup){ await this.sendFast(chat, `👥 ${g('groups only')}`); return; }
                try {
                    const meta = await this.socket.groupMetadata(chat);
                    const ps   = (meta?.participants || []).map(p => p.id).filter(Boolean);
                    const note = body.slice(4).trim() || g('vampire calls you');
                    const card =
`╔══════ 🌑 𝐕𝐀𝐌𝐏𝐈𝐑𝐄  𝐓𝐀𝐆 🌑 ══════╗
   ⚔️   ${note}
   👁️   ${g('Sharingan watching')}: ${ps.length}
╚══════════════════════════════╝`;
                    await this.socket.sendMessage(chat, { text: card, mentions: ps });
                } catch(e){ if(!_isSuppressedErr(e)) trackError('commands', e); }
                return;
            }

            // FEATURE: new mast panels — .ncpanel / .funpanel / .tagpanel / .syspanel
            if(allowed && cmd === '.ncpanel'){
                const ult = ultraNcLoops.size, sas = sasNcLoops.size, trp = tripleNcLoops.size;
                await this._sendPanelCard(chat, 'ncpanel',
`╭─░▒▓█ 𝐍 𝐂   𝐏 𝐀 𝐍 𝐄 𝐋 █▓▒░─╮
│  𝓃𝒶𝓂𝑒-𝒸𝒽𝒶𝓃𝑔𝑒  𝒸𝑜𝓂𝓂𝒶𝓃𝒹  𝒽𝓊𝒷  │
╰─━━━━━━━━━━━━━━━━━━━━━─╯
  ▸ .ultranc  [text]    💥 burst engine
  ▸ .sasnc    [text]    🛡️ safe-burst
  ▸ .triple1..10 [text] 💀 insane tier
  ▸ .hacknc   [text]    🧨 hacker style
  ▸ .stopultranc / .stopsasnc / .stoptriple
╭─⟦ 𝐋 𝐈 𝐕 𝐄 ⟧──────────╮
  💥 ultranc ${ult}   🛡️ sasnc ${sas}
  🌀 triple  ${trp}
╰────────────────────╯`); return;
            }
            if(allowed && cmd === '.funpanel'){
                await this._sendPanelCard(chat, 'funpanel',
`╭─░▒▓█ 𝐅 𝐔 𝐍   𝐏 𝐀 𝐍 𝐄 𝐋 █▓▒░─╮
  ▸ .joke      😂 random joke
  ▸ .truth     🤔 truth question
  ▸ .dare      🔥 dare card
  ▸ .ship @a @b 💕 % match
  ▸ .flirt @x   💘 cheesy flirt
  ▸ .hug @x     🤗 .slap @x 👋
  ▸ .pickup     😏 .meme 🤡
  ▸ .roll 🎲    .coin 🪙   .8ball
╰────────────────────────────────╯`); return;
            }
            if(allowed && cmd === '.tagpanel'){
                await this._sendPanelCard(chat, 'tagpanel',
`╭─░▒▓█ 𝐓 𝐀 𝐆   𝐏 𝐀 𝐍 𝐄 𝐋 █▓▒░─╮
  ▸ .tagall  [msg]   ⚡ tag everyone
  ▸ .smarttag [msg]  📡 chunked tag
  ▸ .hidetag  [msg]  👁️ silent ping
  ▸ .tag      [msg]  🌑 vampire style
╰─━━━━━━━━━━━━━━━━━━━━━─╯`); return;
            }
            if(allowed && cmd === '.syspanel'){
                const mem = process.memoryUsage();
                const all = this.hub.router.getAll();
                const onl = all.filter(s=>s.online && s.state===SESSION_STATE.ACTIVE).length;
                let totalLoops = 0;
                try { totalLoops = ultraNcLoops.size + sasNcLoops.size + tripleNcLoops.size; } catch{}
                await this._sendPanelCard(chat, 'syspanel',
`╭─░▒▓█ 𝐒 𝐘 𝐒   𝐏 𝐀 𝐍 𝐄 𝐋 █▓▒░─╮
  ▸ 𝙱𝙾𝚃𝚂      ${onl}/${all.length}
  ▸ 𝚁𝙰𝙼       ${(mem.rss/1024/1024).toFixed(1)} MB
  ▸ 𝙷𝙴𝙰𝙿      ${(mem.heapUsed/1024/1024).toFixed(1)} MB
  ▸ 𝚄𝙿𝚃𝙸𝙼𝙴   ${Math.floor(process.uptime())}s
  ▸ 𝙻𝙾𝙾𝙿𝚂    ${totalLoops} active
╰─━━━━━━━━━━━━━━━━━━━━━─╯`); return;
            }

            // FIX: stop-everything global commands (priority command — bypasses delays)
            // FIX [KILLALL]: previously this only drained 6 specific maps (ultra/sas/triple/
            // hyper/mega/ultraXLoops + chatTasks). Per-session loops (nameLoops, wordLoop,
            // flagLoop, emojiLoop, spamLoop, swipeLoop, txtLoop, slideLoop, voiceLoop,
            // imgLoop, gcnameLoop), shadiPartyLoops, _dloopMap and the global fleet maps
            // (fleetNcLoops, bonusNcLoops, sncLoops) were skipped — so commands like .nc /
            // .ncemo / .spam / .txt / .voiceatk / .img / .swipe / .gcname / .fastname /
            // .shadiparty / .dloop / .fleetnc / .bonusnc / .snc kept running after .killall.
            // Now we drain EVERY known map so .killall truly stops every loop.
            if(allowed && cmd === '.killall'){
                let killed = 0;
                try {
                    // 1) drain global engine maps (HYPER / MEGA / ULTRAX / triple / sas / ultra)
                    for(const m of [ultraNcLoops, sasNcLoops, tripleNcLoops, hyperNcLoops, megaNcLoops, ultraXLoops]){
                        for(const [,ctl] of m){ try{ if(ctl){ ctl.on = false; killed++; } }catch{} }
                        m.clear();
                    }
                    // 2) drain shadiparty + description-rotate loops
                    if(typeof shadiPartyLoops !== 'undefined'){
                        for(const [,ctl] of shadiPartyLoops){ try{ if(ctl){ ctl.on = false; killed++; } }catch{} }
                        shadiPartyLoops.clear();
                    }
                    if(typeof _dloopMap !== 'undefined'){
                        for(const [,ctl] of _dloopMap){ try{ if(ctl){ ctl.on = false; killed++; } }catch{} }
                        _dloopMap.clear();
                    }
                    // 3) drain fleet-wide super-engine maps (.snc / .fleetnc / .bonusnc)
                    if(globalThis.fleetNcLoops){
                        for(const [,ctl] of globalThis.fleetNcLoops){ try{ if(ctl){ ctl.on = false; killed++; } }catch{} }
                        globalThis.fleetNcLoops.clear?.();
                    }
                    if(globalThis.bonusNcLoops){
                        for(const [,ctl] of globalThis.bonusNcLoops){ try{ if(ctl){ ctl.on = false; killed++; } }catch{} }
                        globalThis.bonusNcLoops.clear?.();
                    }
                    if(globalThis.sncLoops){
                        for(const [,ctl] of globalThis.sncLoops){ try{ if(ctl){ ctl.on = false; killed++; } }catch{} }
                        globalThis.sncLoops.clear?.();
                    }
                    // 4) drain per-chat task registry
                    for(const [,t] of chatTasks){
                        for(const ctl of t.loops){ try{ ctl.on = false; killed++; }catch{} }
                        t.loops.clear();
                    }
                    // 5) drain per-session loops on EVERY session in the fleet
                    //    (nameLoops, wordLoop, flagLoop, emojiLoop, spamLoop, swipeLoop,
                    //     txtLoop, slideLoop, voiceLoop, imgLoop, gcnameLoop)
                    try {
                        const all = this.hub?.router?.getAll?.() || [];
                        for(const s of all){
                            if(!s) continue;
                            const maps = [s.nameLoops, s.wordLoop, s.flagLoop, s.emojiLoop,
                                          s.spamLoop, s.swipeLoop, s.txtLoop, s.slideLoop,
                                          s.voiceLoop, s.imgLoop, s.gcnameLoop];
                            for(const m of maps){
                                if(!m || typeof m.forEach !== 'function') continue;
                                for(const [,v] of m){
                                    try {
                                        if(v && typeof v === 'object'){
                                            if('on'   in v) v.on   = false;
                                            if('live' in v) v.live = false;
                                        }
                                        killed++;
                                    } catch{}
                                }
                                try { m.clear?.(); } catch{}
                            }
                        }
                    } catch{}
                } catch(e){ if(!_isSuppressedErr(e)) trackError('commands', e); }
                await this.sendFast(chat, `${TAG}\n\n🛑 ${g('ALL loops killed across the fleet')} (${killed})`);
                return;
            }

            // FEATURE [.leave]: every SUB-bot leaves this group; the MAIN session stays.
            // Use this when you want the group cleaned of clones but keep yourself there.
            // Group-only command. Owner/sub-allowed (gated by the existing `allowed` flag).
            if(allowed && cmd === '.leave'){
                if(!chat.endsWith('@g.us')){
                    await this.sendFast(chat, `${TAG}\n\n👥 ${g('groups only')}`);
                    return;
                }
                const primary = this.hub?.router?.getPrimary?.();
                const primaryId = primary?.id;
                const all = this.hub?.router?.getAll?.() || [];
                let left = 0, failed = 0;
                // Inform the group BEFORE leaving (otherwise the bot can't send in it anymore)
                await this.sendFast(chat, `${TAG}\n\n🚪 ${g('all sub-bots leaving — main session staying')}…`);
                for(const s of all){
                    try {
                        if(!s || !s.online || !s.socket) continue;
                        if(s.id === primaryId) continue;            // skip main
                        // small jitter so phone doesn't see 10 simultaneous leaves
                        await delay(250 + Math.floor(Math.random()*350));
                        await s.socket.groupLeave(chat).catch(()=>{ throw new Error('leave-failed'); });
                        left++;
                    } catch(e){ failed++; if(!_isSuppressedErr(e)) trackError('commands', e); }
                }
                // Try to confirm via DM to whoever sent the command (group itself may now be unreachable for subs)
                try {
                    if(this.id === primaryId && primary?.socket){
                        await primary.socket.sendMessage(chat, { text: `${TAG}\n\n✅ ${left} ${g('sub-bots left')}${failed?` · ⚠️ ${failed} ${g('failed')}`:''}` }).catch(()=>{});
                    }
                } catch{}
                return;
            }

            // FEATURE [.leavegc]: EVERY session leaves this group, including main.
            // Use this when you want yourself + all clones out in one shot.
            if(allowed && cmd === '.leavegc'){
                if(!chat.endsWith('@g.us')){
                    await this.sendFast(chat, `${TAG}\n\n👥 ${g('groups only')}`);
                    return;
                }
                const all = this.hub?.router?.getAll?.() || [];
                const primary = this.hub?.router?.getPrimary?.();
                let left = 0, failed = 0;
                await this.sendFast(chat, `${TAG}\n\n🚪 ${g('every session (incl. main) leaving this group')}…`);
                // Subs first, main last — so the goodbye message above actually reaches the group
                for(const s of all){
                    try {
                        if(!s || !s.online || !s.socket) continue;
                        if(s.id === primary?.id) continue;          // defer main
                        await delay(250 + Math.floor(Math.random()*350));
                        await s.socket.groupLeave(chat).catch(()=>{ throw new Error('leave-failed'); });
                        left++;
                    } catch(e){ failed++; if(!_isSuppressedErr(e)) trackError('commands', e); }
                }
                // Now main leaves last
                try {
                    if(primary?.online && primary?.socket){
                        await delay(400);
                        await primary.socket.groupLeave(chat).catch(()=>{ throw new Error('leave-failed'); });
                        left++;
                    }
                } catch(e){ failed++; if(!_isSuppressedErr(e)) trackError('commands', e); }
                // No reply possible after main leaves — this is fire-and-forget by design.
                return;
            }

            if(allowed && (cmd === '.stop' || cmd === '.stopallchat')){
                try {
                    stopAllChatLoops(chat);
                    if(ultraNcLoops.has(chat)){ ultraNcLoops.get(chat).on = false; ultraNcLoops.delete(chat); }
                    if(sasNcLoops.has(chat)){   sasNcLoops.get(chat).on   = false; sasNcLoops.delete(chat); }
                    if(tripleNcLoops.has(chat)){tripleNcLoops.get(chat).on= false; tripleNcLoops.delete(chat); }
                    if(_dloopMap.has(chat)){    _dloopMap.get(chat).on    = false; _dloopMap.delete(chat); }
                    // FIX: stop — drain hyper engines for this chat too
                    if(hyperNcLoops.has(chat)){ hyperNcLoops.get(chat).on = false; hyperNcLoops.delete(chat); }
                    if(megaNcLoops.has(chat)){  megaNcLoops.get(chat).on  = false; megaNcLoops.delete(chat); }
                    if(ultraXLoops.has(chat)){  ultraXLoops.get(chat).on  = false; ultraXLoops.delete(chat); }
                } catch(e){ if(!_isSuppressedErr(e)) trackError('commands', e); }
                await this.sendFast(chat, `${TAG}\n\n🛑 ${g('all loops stopped in this chat')}`);
                return;
            }

            // FEATURE [GLOBAL KILL]: .gkill — stop EVERY loop & task across EVERY chat
            // WITHOUT touching sessions/sockets. Sessions stay 24/7 alive — only the
            // tasks die. Use this when bot feels heavy / lagging / spammy.
            if(allowed && cmd === '.gkill'){
                let n = 0;
                try {
                    // FIX: gkill — also drain the HYPER engine maps
                    for(const m of [ultraNcLoops, sasNcLoops, tripleNcLoops, _dloopMap, hyperNcLoops, megaNcLoops, ultraXLoops]){
                        for(const [,ctl] of m){ if(ctl){ try{ ctl.on = false; n++; }catch{} } }
                        m.clear();
                    }
                    for(const [,t] of chatTasks){ for(const ctl of t.loops){ try{ ctl.on=false; n++; }catch{} } t.loops.clear(); }
                    if(globalThis.fleetNcLoops) for(const [,ctl] of globalThis.fleetNcLoops){ try{ ctl.on=false; n++; }catch{} }
                    if(globalThis.bonusNcLoops) for(const [,ctl] of globalThis.bonusNcLoops){ try{ ctl.on=false; n++; }catch{} }
                    if(globalThis.sncLoops)     for(const [,ctl] of globalThis.sncLoops){     try{ ctl.on=false; n++; }catch{} }
                } catch(e){ if(!_isSuppressedErr(e)) trackError('commands', e); }
                await this.sendFast(chat, `${TAG}\n\n💀 ${g('GKILL — every loop killed everywhere')} (${n} ${g('tasks dropped, sessions intact')})`);
                return;
            }

            // FEATURE [DELETE SYSTEM]: .chud — delete the message you replied to
            if(allowed && cmd === '.chud'){
                if(!isGroup){ await this.sendFast(chat, `👥 ${g('groups only')}`); return; }
                const ctx = raw.message.extendedTextMessage?.contextInfo;
                if(!ctx?.stanzaId){ await this.sendFast(chat, `↩️ ${g('reply to a message first')}`); return; }
                const targetKey = { remoteJid: chat, fromMe: false, id: ctx.stanzaId, participant: ctx.participant };
                try {
                    await this.socket.sendMessage(chat, { delete: targetKey });
                    await this.sendFast(chat, `🗑️ ${g('message deleted')}`);
                } catch(e){ await this.sendFast(chat, `❌ ${g('delete failed — bot must be admin')}`); }
                return;
            }

            // FEATURE [DELETE SYSTEM]: .tuchud — pin a target user, auto-delete every future msg
            // .untuchud — release them
            if(allowed && (cmd === '.tuchud' || cmd === '.untuchud')){
                if(!isGroup){ await this.sendFast(chat, `👥 ${g('groups only')}`); return; }
                const ctx    = raw.message.extendedTextMessage?.contextInfo;
                const target = ctx?.participant || ctx?.mentionedJid?.[0];
                if(!target){ await this.sendFast(chat, `↩️ ${g('reply to or mention a user')}`); return; }
                if(!_delTargets.has(chat)) _delTargets.set(chat, new Set());
                const set = _delTargets.get(chat);
                if(cmd === '.tuchud'){
                    set.add(target);
                    await this.sendFast(chat, `🎯 ${g('target locked')} → @${target.split('@')[0]} ${g('every message will be auto-deleted')}`, [target]);
                } else {
                    set.delete(target);
                    if(set.size === 0) _delTargets.delete(chat);
                    await this.sendFast(chat, `✅ ${g('target released')} → @${target.split('@')[0]}`, [target]);
                }
                return;
            }

            // FEATURE [DELETE SYSTEM]: .sabchud — group lock, auto-delete EVERY message
            // .unsabchud — unlock
            if(allowed && (cmd === '.sabchud' || cmd === '.unsabchud')){
                if(!isGroup){ await this.sendFast(chat, `👥 ${g('groups only')}`); return; }
                if(cmd === '.sabchud'){
                    _lockedChats.add(chat);
                    await this.sendFast(chat, `🔒 ${g('GROUP LOCKED')} — ${g('every new message will be auto-deleted (bot must be admin)')}`);
                } else {
                    _lockedChats.delete(chat);
                    await this.sendFast(chat, `🔓 ${g('GROUP UNLOCKED')} — ${g('messages flow normally again')}`);
                }
                return;
            }

            // FEATURE [DLOOP]: .dloop <text> — rotate group description with random moon emojis
            // .stopdloop — stop the loop
            if(allowed && (cmd === '.dloop' || body.toLowerCase().startsWith('.dloop '))){
                if(!isGroup){ await this.sendFast(chat, `👥 ${g('groups only')}`); return; }
                const text = body.replace(/^\.dloop\s*/i, '').trim();
                if(!text){ await this.sendFast(chat, `📋 ${g('usage')}: .dloop <text>`); return; }
                if(_dloopMap.has(chat)){ _dloopMap.get(chat).on = false; _dloopMap.delete(chat); await delay(150); }
                const ctl = { on: true };
                _dloopMap.set(chat, ctl);
                registerChatLoop(chat, ctl);
                await this.sendFast(chat, `🌙 ${g('description loop started')} — ${g('rotating moon emojis')}`);
                (async () => {
                    let i = 0;
                    while(ctl.on){
                        try {
                            const e1 = _moonEmojis[Math.floor(Math.random() * _moonEmojis.length)];
                            const e2 = _moonEmojis[Math.floor(Math.random() * _moonEmojis.length)];
                            const desc = `${e1} ${text} ${e2}  ·  ${_moonEmojis[i % _moonEmojis.length]}`;
                            await this.socket.groupUpdateDescription(chat, desc);
                            i++;
                        } catch(e){ /* silent — phone often rate-limits desc updates */ }
                        // OPTIMIZATION [428 PREVENTION]: 4–8s jitter so WhatsApp doesn't
                        // flag this as automated description spam.
                        await delay(4000 + Math.floor(Math.random() * 4000));
                    }
                    unregisterChatLoop(chat, ctl);
                })().catch(()=>{});
                return;
            }
            if(allowed && cmd === '.stopdloop'){
                if(_dloopMap.has(chat)){ _dloopMap.get(chat).on = false; _dloopMap.delete(chat); }
                await this.sendFast(chat, `🛑 ${g('description loop stopped')}`);
                return;
            }

            // FEATURE [FUN]: lightweight romance commands. All single-shot, no loops.
            if(cmd === '.propose' || body.toLowerCase().startsWith('.propose ')){
                const target = raw.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
                            || raw.message.extendedTextMessage?.contextInfo?.participant
                            || who;
                const lines = [
                    `💍 ${g('I get on one knee and ask')}: @${target.split('@')[0]}, ${g('will you be mine forever?')} 💖`,
                    `🌹 ${g('with trembling hands I offer this rose')} — @${target.split('@')[0]}, ${g('marry me?')} 💕`,
                    `💝 ${g('my heart races thinking of you')} @${target.split('@')[0]} — ${g('be the love of my life')} 💞`,
                ];
                await this.sendFast(chat, `${TAG}\n\n${lines[Math.floor(Math.random()*lines.length)]}`, [target]);
                return;
            }
            if(cmd === '.breakup' || body.toLowerCase().startsWith('.breakup ')){
                const target = raw.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
                            || raw.message.extendedTextMessage?.contextInfo?.participant
                            || who;
                const lines = [
                    `💔 ${g("it's over between us")}, @${target.split('@')[0]} — ${g('we just want different things')} 😢`,
                    `🥀 @${target.split('@')[0]}, ${g("I think we should see other people")} 💔`,
                    `😭 ${g('this hurts but goodbye')} @${target.split('@')[0]} — ${g('keep the memories, return the hoodie')} 🧥`,
                ];
                await this.sendFast(chat, `${TAG}\n\n${lines[Math.floor(Math.random()*lines.length)]}`, [target]);
                return;
            }
            if(cmd === '.divorce' || body.toLowerCase().startsWith('.divorce ')){
                const target = raw.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
                            || raw.message.extendedTextMessage?.contextInfo?.participant
                            || who;
                await this.sendFast(chat, `${TAG}\n\n⚖️ ${g('papers signed')} — @${target.split('@')[0]} ${g('and you are officially divorced')} 💔📜`, [target]);
                return;
            }
            if(cmd === '.love' || body.toLowerCase().startsWith('.love ')){
                const target = raw.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
                            || raw.message.extendedTextMessage?.contextInfo?.participant
                            || who;
                const pct = Math.floor(Math.random()*101);
                const bar = '❤️'.repeat(Math.round(pct/10)) + '🤍'.repeat(10 - Math.round(pct/10));
                await this.sendFast(chat, `${TAG}\n\n💖 ${g('LOVE METER')} 💖\n@${who.split('@')[0]}  ❤️  @${target.split('@')[0]}\n${bar}\n${pct}%`, [who, target]);
                return;
            }
            if(cmd === '.crush' || body.toLowerCase().startsWith('.crush ')){
                const target = raw.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
                            || raw.message.extendedTextMessage?.contextInfo?.participant
                            || who;
                await this.sendFast(chat, `${TAG}\n\n😍 @${who.split('@')[0]} ${g('has a secret crush on')} @${target.split('@')[0]} 💕`, [who, target]);
                return;
            }
            if(cmd === '.compatibility' || body.toLowerCase().startsWith('.compatibility ')){
                const ctx = raw.message.extendedTextMessage?.contextInfo;
                const mentioned = ctx?.mentionedJid || [];
                const a = mentioned[0] || who;
                const b = mentioned[1] || ctx?.participant || who;
                if(a === b){ await this.sendFast(chat, `↩️ ${g('mention two users')}`); return; }
                const score = Math.floor(Math.random()*101);
                const verdict = score >= 80 ? '💞 SOULMATES' : score >= 60 ? '💖 GREAT MATCH' : score >= 40 ? '💛 OK' : score >= 20 ? '⚠️ ROUGH' : '💔 RUN';
                await this.sendFast(chat, `${TAG}\n\n🔮 ${g('COMPATIBILITY REPORT')}\n@${a.split('@')[0]} × @${b.split('@')[0]}\n${'★'.repeat(Math.round(score/20))}${'☆'.repeat(5-Math.round(score/20))}\n${score}% — ${verdict}`, [a, b]);
                return;
            }

            // ══ RESET ═════════════════════════════════════
            if(cmd==='.reset' && allowed){
                await this.send(chat, `${TAG}\n\n♻️ ${g('clearing cache and refreshing')}...`);
                this.hub.router.processed.clear();
                const all = this.hub.router.getAll();
                for(const s of all) {
                    if(s.socket) {
                        s.socket.ev.removeAllListeners();
                        s.socket.end();
                    }
                    setTimeout(() => s.init(), 2000);
                }
                return;
            }

            // ══ SUPER FAST NAME CHANGER ═══════════════════
            if(body.toLowerCase().startsWith('.name ') && allowed){
                const newName = body.slice(6).trim();
                if(!newName) { await this.send(chat, `📋 .name [${g('text')}]`); return; }
                const all = this.hub.router.getAlive();
                await Promise.all(all.map(s => s.socket.updateProfileName(newName).catch(() => {})));
                await this.send(chat, `${TAG}\n\n⚡ ${g('name changed to')}: ${newName}`);
                return;
            }

            // ══ GCNAME ════════════════════════════════════
            if(body.toLowerCase().startsWith('.gcname ') && allowed){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const newGcName = body.slice(8).trim();
                if(!newGcName){ await this.send(chat,`📋 .gcname [${g('name')}]`); return; }
                const tid = `${chat}__gcn`;
                if(this.gcnameLoop.has(tid)){ this.gcnameLoop.get(tid).on=false; await delay(100); }
                const t = {on:true};
                this.gcnameLoop.set(tid, t);
                (async()=>{
                    let backoff=0;
                    while(t.on){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        await this.secCap.waitGrp();
                        const rampMs=20;
                        try{
                            await this.socket.groupUpdateSubject(chat, newGcName);
                            this.secCap.hitGrp();
                            backoff=0;
                            await delay(rampMs + Math.round(humanJitter()));
                        }catch(e){
                            if(isRateErr(e)){ backoff=Math.min(backoff+2000,15000); await delay(backoff); }
                            else { backoff=Math.min(backoff+500,5000); await delay(backoff); }
                        }
                    }
                })();
                await this.send(chat, win('.gcname (loop)'));
                return;
            }
            if(cmd==='.stopgcname' && allowed){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const tid=`${chat}__gcn`;
                if(this.gcnameLoop.has(tid)){this.gcnameLoop.get(tid).on=false;this.gcnameLoop.delete(tid);}
                await this.send(chat,lose('.gcname'));
                return;
            }

            // ══ .gc — create groups ═══════════════════════
            if(body.toLowerCase().startsWith('.gc ') && isOwn){
                const gcName = body.slice(4).trim();
                if(!gcName){ await this.send(chat,`📋 .gc [${g('name')}]`); return; }
                const MAX_GC=6;
                await this.send(chat,`${TAG}\n\n⏳ ${g('creating')} ${MAX_GC} ${g('groups named')} "${gcName}"...`);
                let success=0,fail=0;
                for(let i=0;i<MAX_GC;i++){
                    try{
                        const name=`${gcName} ${i+1}`;
                        await this.socket.groupCreate(name,[this.self]);
                        success++;
                        await delay(1500+Math.round(humanJitter()));
                    }catch(e){
                        fail++;
                        if(isRateErr(e)){ await delay(RATE_LIMIT_PAUSE); }
                        else await delay(1000);
                    }
                }
                await this.send(chat,`${TAG}\n\n✅ ${g('done')}\n📊 ${g('success')}: ${success}\n❌ ${g('failed')}: ${fail}`);
                return;
            }

            // ══ .massgc — create 50 groups rapidly ════════
            if(body.toLowerCase().startsWith('.massgc ') && isOwn){
                const baseName = body.slice(8).trim();
                if(!baseName){ await this.send(chat,`📋 .massgc [${g('name')}]`); return; }
                const TOTAL=50;
                await this.send(chat,`${TAG}\n\n⚡ ${g('mass creating')} ${TOTAL} ${g('groups named')} "${baseName}"...`);
                let success=0,fail=0,massBack=0;
                for(let i=0;i<TOTAL;i++){
                    try{
                        const name = `${baseName} ${i + 1}`;
                        await this.socket.groupCreate(name, [this.self]);
                        success++;
                        massBack=0;
                        await delay(200 + Math.round(humanJitter()));
                    } catch (e) {
                        fail++;
                        if(isRateErr(e)){ massBack=Math.min(massBack+2000,15000); await delay(massBack); }
                        else await delay(500);
                    }
                }
                await this.send(chat, `${TAG}\n\n✅ ${g('mass creation complete')}\n📊 ${g('success')}: ${success}\n❌ ${g('failed')}: ${fail}`);
                return;
            }

            // ══ FASTNAME ══════════════════════════════════
            if(body.toLowerCase().startsWith('.fastname ') && allowed){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const newName = body.slice(10).trim();
                if(!newName) { await this.send(chat, `📋 .fastname [${g('name')}]`); return; }
                const tid = `${chat}__fn`;
                if(this.nameLoops.has(tid)){this.nameLoops.get(tid).on=false;await delay(100);}
                const t = {on:true};
                this.nameLoops.set(tid, t);
                (async()=>{
                    let backoff = 0;
                    while(t.on){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        await this.secCap.waitGrp();
                        const rampMs=20;
                        try {
                            await this.socket.groupUpdateSubject(chat, newName);
                            this.secCap.hitGrp();
                            backoff = 0;
                            await delay(rampMs + Math.round(humanJitter()));
                        } catch (e) {
                            if(isRateErr(e)){ backoff=Math.min(backoff+2000,15000); await delay(backoff); }
                            else { backoff=Math.min(backoff+500,5000); await delay(backoff); }
                        }
                    }
                })();
                await this.send(chat, win('.fastname (loop)'));
                return;
            }

            if(cmd === '.fstop' && allowed){
                if(isGroup){
                    const tid = `${chat}__fn`;
                    if(this.nameLoops.has(tid)){this.nameLoops.get(tid).on=false;this.nameLoops.delete(tid);}
                }
                const targetGcs = parseGcs(body);
                await this.hub.router.pushToGcs('nc_stop',{},this.id,true,targetGcs);
                return;
            }

            // ══ CHANGE PROFILE NAME ═══════════════════════
            if(body.toLowerCase().startsWith('.prof ') && allowed){
                const newProfName = body.slice(6).trim();
                if(!newProfName) { await this.send(chat, `📋 .prof [${g('text')}]`); return; }
                try {
                    await this.socket.updateProfileName(newProfName);
                    await this.send(chat, `${TAG}\n\n✅ ${g('profile name changed to')}: ${newProfName}`);
                } catch (e) {
                    await this.send(chat, `❌ ${g('failed to change profile name')}: ${e.message}`);
                }
                return;
            }

            if(!allowed) return;

            // ══ KILLALL ════════════════════════════════════
            if(cmd==='.killall'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                await this.hub.router.push('kill_all',{chat},this.id); return;
            }

            // ══ SPEED ══════════════════════════════════════
            if(body.toLowerCase().startsWith('.speed ')){
                const parts=body.slice(7).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 ${g('usage')}: .speed [f1-f7] [ms]`); return; }
                const setId=parts[0].toLowerCase(), ms=parseInt(parts[1]);
                if(!SET_KEYS[setId]){ await this.send(chat,`❌ ${g('use f1 to f7')}`); return; }
                if(isNaN(ms)||ms<30){ await this.send(chat,`⏱️ ${g('minimum 30ms')}`); return; }
                timingMap[setId]=ms; saveTiming();
                await this.send(chat,`${TAG}\n\n⏱️ ${setId.toUpperCase()} ${g('speed set to')} ${ms}ms`);
                return;
            }

            // ══ NAME CHANGE .f1–.f7 / .nc1–.nc100 / .vampirenc1–.vampirenc10 ═══
            // [NEW SYSTEM] dispatcher rewritten to support variable-length keys
            // (.nc10, .nc100, .vampirenc1 etc). Routes .vampirenc* to triple-speed handler.
            const _lcBody = body.toLowerCase();
            for(const [key,setName] of Object.entries(SET_KEYS)){
                if(_lcBody.startsWith(`.${key} `)){
                    const prefixLen = key.length + 2; // "." + key + " "
                    const txt=cleanBody(body.slice(prefixLen).trim());
                    if(!txt){ await this.send(chat,`📋 .${key} [${g('text')}]`); return; }
                    if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                    const targetGcs = parseGcs(body);
                    const route = key.startsWith('vampirenc') ? 'vampirenc_start' : 'nc_start';
                    await this.hub.router.pushToGcs(route,{txt,key,setName},this.id,true,targetGcs); return;
                }
            }
            if(cmd==='.fstop'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const targetGcs = parseGcs(body);
                await this.hub.router.pushToGcs('nc_stop',{},this.id,true,targetGcs); return;
            }

            // FIX + OPTIMIZATION: ultranc — now fans out across ALL online bots in parallel.
            // Previously only the receiving bot ran the loop → slow + only 1 socket utilized.
            // Now: every active bot in the hub bursts the same group simultaneously,
            // multiplying effective speed by N. Each bot has its own loop with per-bot rate
            // throttling so smartcore still protects every account from bans.
            if(allowed && body.toLowerCase().startsWith('.ultranc ')){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt = cleanBody(body.slice(9).trim());
                if(!txt){ await this.send(chat,`📋 .ultranc [${g('text')}]`); return; }
                if(ultraNcLoops.has(chat)){
                    await this.sendFast(chat,`⚠️ ${g('ultranc already running here — use .stopultranc first')}`);
                    return;
                }
                // collect ALL bots that are online + active for this fan-out
                const fleet = this.hub.router.getAll().filter(s =>
                    s && s.socket && s.online && s.state === SESSION_STATE.ACTIVE
                );
                if(fleet.length === 0){ await this.sendFast(chat, `❌ ${g('no active bots available')}`); return; }
                const ctl = { on:true, workers: fleet.length, txt };
                ultraNcLoops.set(chat, ctl);
                // FIX: instant ack via sendFast — replies before the fleet even spins up
                await this.sendFast(chat, `${TAG}\n\n💥 𝐔𝐋𝐓𝐑𝐀𝐍𝐂  𝐈𝐆𝐍𝐈𝐓𝐄𝐃\n  🤖 ${g('fleet')}: ${fleet.length} ${g('bots')}\n  ⚡ ${g('burst')}: ${ultraNcSpeed.burstSize}  ║  ${g('parallel')}: ${ultraNcSpeed.parallel}\n  📝 ${g('text')}: ${txt}\n  🛑 .stopultranc`);
                // OPTIMIZATION: spawn one worker per bot — fire-and-forget, never blocks dispatch
                for(const bot of fleet){
                    setImmediate(async () => {
                        const self = bot;
                    // FIX [PURE-EMOJI]: per user request the suffix should be ONLY symbols
                    // and emojis — no extra text. Was alphanumeric (a–z, 0–9), now a curated
                    // pool of decorative symbols + small emojis used by .hypernc / .fleetnc.
                    const SUFFIX_CHARS = ['⚡','💥','🔥','☠️','💀','⚔️','🩸','🌑','🌌','💢','♾️','⚜️','✦','✧','★','☆','⟁','◈','◇','▲','▼','◉','⊛','⊕','✺','✹','✸','♛','♕','♚','✪','❖','❂','✷','✶','✵','✴','♨','卐','✿','❀','❉','❁','❄','❅','❆'];
                    const randSuffix = () => {
                        const n = 2 + Math.floor(Math.random()*3); // 2-4 chars
                        let s = '';
                        for(let i=0;i<n;i++) s += SUFFIX_CHARS[Math.floor(Math.random()*SUFFIX_CHARS.length)];
                        return s;
                    };
                    const themeKeys = Object.keys(EMOJI_BANK);
                    const pickEmojiSet = () => EMOJI_BANK[themeKeys[Math.floor(Math.random()*themeKeys.length)]];
                    try {
                        while(ctl.on){
                            if(!self.socket || !self.online || self.state!==SESSION_STATE.ACTIVE){
                                await delay(1500); continue;
                            }
                            // FIX: loop blocking — yield WS bandwidth to user commands.
                            // If a user command landed for this same chat in the last 2s,
                            // pause one tick so the command's reply socket-write goes first.
                            try { if(_cmdInFlight && _cmdInFlight.get(chat) && Date.now() - _cmdInFlight.get(chat) < 2000) await delay(120); } catch {}
                            // smartcore throttle integration
                            try { if(self.core?.isThrottled?.()) await self.core.waitThrottle(); } catch{}
                            // burst params (turbo-mode boost)
                            let burstSize = ultraNcSpeed.burstSize;
                            let parallel  = Math.min(ultraNcSpeed.parallel, 4);
                            let interMin  = 100;
                            let interMax  = ultraNcSpeed.burstDelayMs;
                            if(self.core?.mode === 'turbo'){
                                burstSize = Math.min(burstSize+1, 6);
                                parallel  = Math.min(parallel+1, 4);
                                interMin  = 80;
                                interMax  = Math.max(150, interMax-50);
                            }
                            // run the burst in parallel batches
                            for(let b=0; b<burstSize && ctl.on; b += parallel){
                                const n = Math.min(parallel, burstSize - b);
                                const batch = [];
                                for(let p=0; p<n; p++){
                                    const set = pickEmojiSet();
                                    const shuffled = set.slice().sort(() => Math.random()-0.5);
                                    const emo = shuffled[Math.floor(Math.random()*shuffled.length)];
                                    const newSubject = `${txt} ${emo} ${randSuffix()}`;
                                    batch.push((async () => {
                                        try {
                                            await self.secCap.waitGrp();
                                            await self.socket.groupUpdateSubject(chat, newSubject);
                                            self.secCap.hitGrp();
                                            try { self.core.tick(); } catch{}
                                        } catch(e){
                                            if(_isSuppressedErr(e)) return;
                                            if(isRateErr(e)) { try { self.core.penalize?.(5); } catch{} await delay(1500); }
                                        }
                                    })());
                                    if(p < n-1) await delay(Math.floor(Math.random()*20)); // 0-20ms inside burst
                                }
                                try { await Promise.all(batch); }
                                catch(e){ if(!_isSuppressedErr(e)) loge(self.id, `ultranc batch err: ${e?.message||e}`); }
                            }
                            // 100-300ms between bursts (turbo: 80-250ms)
                            const span = Math.max(1, interMax - interMin);
                            await delay(interMin + Math.floor(Math.random()*span));
                        }
                    } catch(e){
                        if(!_isSuppressedErr(e)) loge(self.id, `ultranc loop err: ${e?.message||e}`);
                        await delay(1500);
                    } finally {
                        // OPTIMIZATION: only the LAST worker leaving deletes the registry,
                        // so .stopultranc / .killall can still find ctl while any worker runs.
                        ctl.workers = Math.max(0, (ctl.workers||1) - 1);
                        if(ctl.workers === 0) ultraNcLoops.delete(chat);
                    }
                    }); // end setImmediate
                } // end for(bot of fleet)
                return;
            }
            if(allowed && cmd === '.stopultranc'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const ctl = ultraNcLoops.get(chat);
                if(ctl){ ctl.on = false; } // workers self-clean via finally{}
                await this.sendFast(chat, `${TAG}\n\n🛑 ${g('ultranc stopped — all workers halting')}`);
                return;
            }
            if(allowed && body.toLowerCase().startsWith('.setncspeed')){
                const arg = body.slice(11).trim();
                if(!arg){
                    await this.send(chat, `${TAG}\n\n⏱️ ${g('current ultranc speed')}\n  burstDelayMs: ${ultraNcSpeed.burstDelayMs}\n  burstSize: ${ultraNcSpeed.burstSize}\n  parallel: ${ultraNcSpeed.parallel}\n\n📋 .setncspeed [ms]   ${g('or')}   .setncspeed [ms] [burst] [parallel]`);
                    return;
                }
                const parts = arg.split(/\s+/);
                const ms = parseInt(parts[0]);
                if(isNaN(ms) || ms < 50){ await this.send(chat, `❌ ${g('minimum 50ms')}`); return; }
                ultraNcSpeed.burstDelayMs = Math.min(2000, ms);
                if(parts[1]){
                    const bs = parseInt(parts[1]);
                    if(!isNaN(bs) && bs >= 1 && bs <= 8) ultraNcSpeed.burstSize = bs;
                }
                if(parts[2]){
                    const pr = parseInt(parts[2]);
                    if(!isNaN(pr) && pr >= 1 && pr <= 4) ultraNcSpeed.parallel = pr;
                }
                await this.send(chat, `${TAG}\n\n⚡ ${g('ultranc speed updated')}\n  burstDelayMs: ${ultraNcSpeed.burstDelayMs}\n  burstSize: ${ultraNcSpeed.burstSize}\n  parallel: ${ultraNcSpeed.parallel}`);
                return;
            }

            // ════════════════════════════════════════════════════════════
            // FEATURE: HYPER NC ENGINE — fastest standalone name-change engine.
            //   .hypernc [text]   → rotating theme burst (cycles hyper1→hyper20)
            //   .meganc  [text]   → aggressive multi-thread burst (mixed sets)
            //   .ultrax  [text]   → mixed nc + emoji + special-char visual storm
            //   .stophyper / .stopmega / .stopultrax
            //   .hyperpanel       → premium panel
            //   .hyper1 … .hyper20 → trigger that specific theme directly
            // ════════════════════════════════════════════════════════════
            // Shared internal worker — fanned out across the whole fleet, fully async.
            // SAFE: never touches ultranc / sasnc / triplenc state; runs in parallel.
            const _spinHyper = (engineName, loopMap, speedCfg, theme, txt, ctl) => {
                const fleet = this.hub.router.getAll().filter(s =>
                    s && s.socket && s.online && s.state === SESSION_STATE.ACTIVE
                );
                if(fleet.length === 0) return 0;
                ctl.workers = fleet.length;
                // FIX [PURE-EMOJI]: per user request the suffix should be ONLY symbols
                // and emojis — no extra text. Was alphanumeric (a–z, 0–9), now a curated
                // pool of decorative symbols + small emojis (.hypernc shared worker).
                const SUFFIX = ['⚡','💥','🔥','☠️','💀','⚔️','🩸','🌑','🌌','💢','♾️','⚜️','✦','✧','★','☆','⟁','◈','◇','▲','▼','◉','⊛','⊕','✺','✹','✸','♛','♕','♚','✪','❖','❂','✷','✶','✵','✴','♨','卐','✿','❀','❉','❁','❄','❅','❆'];
                const randSuffix = () => {
                    const n = 2 + Math.floor(Math.random()*3);
                    let s = ''; for(let i=0;i<n;i++) s += SUFFIX[Math.floor(Math.random()*SUFFIX.length)];
                    return s;
                };
                const pickEmoji = () => {
                    if(theme === '_mixed'){
                        const k = HYPER_SET_KEYS[Math.floor(Math.random()*HYPER_SET_KEYS.length)];
                        return _pickHyperEmoji(k);
                    }
                    if(theme === '_ultrax'){
                        return ULTRAX_POOL[Math.floor(Math.random()*ULTRAX_POOL.length)];
                    }
                    return _pickHyperEmoji(theme);
                };
                for(const bot of fleet){
                    setImmediate(async () => {
                        const self = bot;
                        try {
                            while(ctl.on){
                                if(ctl._paused){ await delay(200); continue; }
                                if(!self.socket || !self.online || self.state!==SESSION_STATE.ACTIVE){
                                    await delay(1500); continue;
                                }
                                // FIX: loop blocking — yield WS bandwidth to user commands
                                // when one landed for this same chat in the last 2s.
                                try { if(_cmdInFlight && _cmdInFlight.get(chat) && Date.now() - _cmdInFlight.get(chat) < 2000) await delay(120); } catch {}
                                try { if(self.core?.isThrottled?.()) await self.core.waitThrottle(); } catch{}
                                let burstSize = speedCfg.burstSize;
                                let parallel  = Math.min(speedCfg.parallel, 5);
                                let interMin  = 80;
                                let interMax  = speedCfg.burstDelayMs;
                                if(self.core?.mode === 'turbo'){
                                    burstSize = Math.min(burstSize+1, 8);
                                    parallel  = Math.min(parallel+1, 5);
                                    interMin  = 60;
                                    interMax  = Math.max(120, interMax-40);
                                }
                                for(let b=0; b<burstSize && ctl.on; b += parallel){
                                    const n = Math.min(parallel, burstSize - b);
                                    const batch = [];
                                    for(let p=0; p<n; p++){
                                        const e1 = pickEmoji();
                                        const e2 = pickEmoji();
                                        const newSubject = engineName === 'ultrax'
                                            ? `${e1} ${txt} ${e2} ${randSuffix()}`
                                            : `${txt} ${e1} ${randSuffix()}`;
                                        batch.push((async () => {
                                            try {
                                                await self.secCap.waitGrp();
                                                await self.socket.groupUpdateSubject(chat, newSubject);
                                                self.secCap.hitGrp();
                                                try { self.core.tick(); } catch{}
                                            } catch(e){
                                                if(_isSuppressedErr(e)) return;
                                                if(isRateErr(e)) { try { self.core.penalize?.(3); } catch{} await delay(1200); }
                                            }
                                        })());
                                        if(p < n-1) await delay(Math.floor(Math.random()*15));
                                    }
                                    try { await Promise.all(batch); }
                                    catch(e){ if(!_isSuppressedErr(e)) loge(self.id, `${engineName} batch err: ${e?.message||e}`); }
                                }
                                const span = Math.max(1, interMax - interMin);
                                await delay(interMin + Math.floor(Math.random()*span));
                            }
                        } catch(e){
                            if(!_isSuppressedErr(e)) loge(self.id, `${engineName} loop err: ${e?.message||e}`);
                            await delay(1500);
                        } finally {
                            ctl.workers = Math.max(0, (ctl.workers||1) - 1);
                            if(ctl.workers === 0) loopMap.delete(chat);
                        }
                    });
                }
                return fleet.length;
            };

            // ── .hypernc / .stophyper ─────────────────────────────
            if(allowed && body.toLowerCase().startsWith('.hypernc ')){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt = cleanBody(body.slice(9).trim());
                if(!txt){ await this.send(chat,`📋 .hypernc [${g('text')}]`); return; }
                if(hyperNcLoops.has(chat)){ await this.sendFast(chat,`⚠️ ${g('hypernc already running — use .stophyper first')}`); return; }
                const ctl = { on:true, theme:'_mixed', txt };
                hyperNcLoops.set(chat, ctl);
                registerChatLoop(chat, ctl);
                const n = _spinHyper('hypernc', hyperNcLoops, hyperNcSpeed, '_mixed', txt, ctl);
                if(n === 0){ hyperNcLoops.delete(chat); unregisterChatLoop(chat, ctl); await this.sendFast(chat, `❌ ${g('no active bots')}`); return; }
                await this.sendFast(chat, `${TAG}\n\n⚡ 𝐇𝐘𝐏𝐄𝐑𝐍𝐂  𝐈𝐆𝐍𝐈𝐓𝐄𝐃\n  🤖 ${g('fleet')}: ${n}\n  🎨 ${g('theme')}: rotating (hyper1→hyper20)\n  ⚡ ${g('burst')}: ${hyperNcSpeed.burstSize} ║ ${g('parallel')}: ${hyperNcSpeed.parallel}\n  📝 ${g('text')}: ${txt}\n  🛑 .stophyper`);
                return;
            }
            if(allowed && cmd === '.stophyper'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const ctl = hyperNcLoops.get(chat);
                if(ctl){ ctl.on = false; unregisterChatLoop(chat, ctl); }
                await this.sendFast(chat, `${TAG}\n\n🛑 ${g('hypernc stopped')}`);
                return;
            }

            // ── .meganc / .stopmega ─────────────────────────────
            if(allowed && body.toLowerCase().startsWith('.meganc ')){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt = cleanBody(body.slice(8).trim());
                if(!txt){ await this.send(chat,`📋 .meganc [${g('text')}]`); return; }
                if(megaNcLoops.has(chat)){ await this.sendFast(chat,`⚠️ ${g('meganc already running — use .stopmega first')}`); return; }
                const ctl = { on:true, theme:'_mixed', txt };
                megaNcLoops.set(chat, ctl);
                registerChatLoop(chat, ctl);
                const n = _spinHyper('meganc', megaNcLoops, megaNcSpeed, '_mixed', txt, ctl);
                if(n === 0){ megaNcLoops.delete(chat); unregisterChatLoop(chat, ctl); await this.sendFast(chat, `❌ ${g('no active bots')}`); return; }
                await this.sendFast(chat, `${TAG}\n\n💥 𝐌𝐄𝐆𝐀𝐍𝐂  𝐔𝐍𝐋𝐄𝐀𝐒𝐇𝐄𝐃\n  🤖 ${g('fleet')}: ${n}\n  🎨 ${g('theme')}: full mix\n  ⚡ ${g('burst')}: ${megaNcSpeed.burstSize} ║ ${g('parallel')}: ${megaNcSpeed.parallel}\n  📝 ${g('text')}: ${txt}\n  🛑 .stopmega`);
                return;
            }
            if(allowed && cmd === '.stopmega'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const ctl = megaNcLoops.get(chat);
                if(ctl){ ctl.on = false; unregisterChatLoop(chat, ctl); }
                await this.sendFast(chat, `${TAG}\n\n🛑 ${g('meganc stopped')}`);
                return;
            }

            // ── .ultrax / .stopultrax ─────────────────────────────
            if(allowed && body.toLowerCase().startsWith('.ultrax ')){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt = cleanBody(body.slice(8).trim());
                if(!txt){ await this.send(chat,`📋 .ultrax [${g('text')}]`); return; }
                if(ultraXLoops.has(chat)){ await this.sendFast(chat,`⚠️ ${g('ultrax already running — use .stopultrax first')}`); return; }
                const ctl = { on:true, theme:'_ultrax', txt };
                ultraXLoops.set(chat, ctl);
                registerChatLoop(chat, ctl);
                const n = _spinHyper('ultrax', ultraXLoops, ultraXSpeed, '_ultrax', txt, ctl);
                if(n === 0){ ultraXLoops.delete(chat); unregisterChatLoop(chat, ctl); await this.sendFast(chat, `❌ ${g('no active bots')}`); return; }
                await this.sendFast(chat, `${TAG}\n\n🌌 𝐔𝐋𝐓𝐑𝐀𝐗  𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃\n  🤖 ${g('fleet')}: ${n}\n  🎨 ${g('mode')}: emoji + symbols + chars\n  ⚡ ${g('burst')}: ${ultraXSpeed.burstSize} ║ ${g('parallel')}: ${ultraXSpeed.parallel}\n  📝 ${g('text')}: ${txt}\n  🛑 .stopultrax`);
                return;
            }
            if(allowed && cmd === '.stopultrax'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const ctl = ultraXLoops.get(chat);
                if(ctl){ ctl.on = false; unregisterChatLoop(chat, ctl); }
                await this.sendFast(chat, `${TAG}\n\n🛑 ${g('ultrax stopped')}`);
                return;
            }

            // ── .hyper1 … .hyper20 — fixed-theme triggers ─────────
            const _hyperMatch = body.match(/^\.hyper(\d{1,2})\b\s*(.*)$/i);
            if(allowed && _hyperMatch){
                const n = parseInt(_hyperMatch[1]);
                if(n >= 1 && n <= 20){
                    if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                    const txt = cleanBody((_hyperMatch[2] || '').trim());
                    if(!txt){ await this.send(chat,`📋 .hyper${n} [${g('text')}]`); return; }
                    if(hyperNcLoops.has(chat)){ await this.sendFast(chat,`⚠️ ${g('hyper engine already running — use .stophyper first')}`); return; }
                    const theme = `hyper${n}`;
                    const ctl = { on:true, theme, txt };
                    hyperNcLoops.set(chat, ctl);
                    registerChatLoop(chat, ctl);
                    const spawned = _spinHyper(theme, hyperNcLoops, hyperNcSpeed, theme, txt, ctl);
                    if(spawned === 0){ hyperNcLoops.delete(chat); unregisterChatLoop(chat, ctl); await this.sendFast(chat, `❌ ${g('no active bots')}`); return; }
                    await this.sendFast(chat, `${TAG}\n\n⚡ 𝐇𝐘𝐏𝐄𝐑${n}  𝐋𝐎𝐂𝐊𝐄𝐃\n  🤖 ${g('fleet')}: ${spawned}\n  🎨 ${g('theme')}: ${theme} ${HYPER_SETS[theme].slice(0,4).join('')}\n  📝 ${g('text')}: ${txt}\n  🛑 .stophyper`);
                    return;
                }
            }

            // ── .hyperpanel — premium UI ─────────────────────────
            if(allowed && cmd === '.hyperpanel'){
                const hyp = hyperNcLoops.size, meg = megaNcLoops.size, ulx = ultraXLoops.size;
                const fleet = this.hub.router.getAll().filter(s => s && s.socket && s.online && s.state===SESSION_STATE.ACTIVE).length;
                const themeRows = HYPER_SET_KEYS.map((k, i) => {
                    const e = HYPER_SETS[k].slice(0, 4).join(' ');
                    return `  ${(i+1).toString().padStart(2,'0')}. .${k.padEnd(8,' ')} ${e}`;
                }).join('\n');
                await this._sendPanelCard(chat, 'hyperpanel',
                    `${TAG}\n`+
                    `╔══════════════════════════════════╗\n`+
                    `║   ⚡ 𝐇𝐘𝐏𝐄𝐑  𝐍𝐂   𝐂𝐎𝐌𝐌𝐀𝐍𝐃   𝐂𝐄𝐍𝐓𝐄𝐑   ⚡ ║\n`+
                    `║   🌌 𝐅𝐀𝐒𝐓𝐄𝐒𝐓 · 𝐌𝐔𝐋𝐓𝐈-𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐒𝐀𝐅𝐄 🌌  ║\n`+
                    `╚══════════════════════════════════╝\n`+
                    `\n`+
                    `┏━━━━━━━━ 🔴 𝐋𝐈𝐕??  𝐒𝐓𝐀𝐓𝐔𝐒 ━━━━━━━━┓\n`+
                    `  🤖  𝐅𝐋𝐄𝐄𝐓        ${fleet} ${g('bots online')}\n`+
                    `  ⚡  𝐇𝐘𝐏𝐄𝐑𝐍𝐂      ${hyp} ${g('chats running')}\n`+
                    `  💥  𝐌𝐄𝐆𝐀𝐍𝐂       ${meg} ${g('chats running')}\n`+
                    `  🌌  𝐔𝐋𝐓𝐑𝐀𝐗       ${ulx} ${g('chats running')}\n`+
                    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`+
                    `\n`+
                    `┏━━━━━━ 🚀 𝐌𝐀𝐈𝐍 𝐄𝐍𝐆𝐈𝐍𝐄𝐒 ━━━━━━┓\n`+
                    `  ⚡ .hypernc [text]   ${g('rotating themed burst')}\n`+
                    `  💥 .meganc  [text]   ${g('aggressive multi-thread')}\n`+
                    `  🌌 .ultrax  [text]   ${g('emoji + symbols storm')}\n`+
                    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`+
                    `\n`+
                    `┏━━━━━━ 🎨 𝐓𝐇𝐄𝐌𝐄  𝐒𝐄𝐓𝐒  𝟏 → 𝟐𝟎 ━━━━━━┓\n`+
                    `${themeRows}\n`+
                    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`+
                    `\n`+
                    `┏━━━━━━ 🛑 𝐒𝐓𝐎𝐏 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 ━━━━━━┓\n`+
                    `  ◼ .stophyper   ◼ .stopmega\n`+
                    `  ◼ .stopultrax  💀 .gkill\n`+
                    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`+
                    `\n`+
                    `╔══════════════════════════════════╗\n`+
                    `║  ░▒▓█  𝐧𝐨𝐧-𝐛𝐥𝐨𝐜𝐤𝐢𝐧𝐠 · 𝐦𝐮𝐥𝐭𝐢-𝐬𝐞𝐬𝐬𝐢𝐨𝐧  █▓▒░  ║\n`+
                    `║  ⚡  𝐇𝐘𝐏𝐄𝐑 𝐄𝐍𝐆𝐈𝐍𝐄 · 𝐈𝐍𝐃𝐄𝐏𝐄𝐍𝐃𝐄𝐍𝐓 ⚡  ║\n`+
                    `╚══════════════════════════════════╝`
                );
                return;
            }

            // FEATURE: sasnc — MAX-BURST but SAFE name change engine.
            // Bigger bursts (5-7) and longer rest (400-750ms) so the bot drops fast bursts then breathes.
            // 2 parallel workers, deeper smartcore checks, harder back-off on rate errors → fast yet safe.
            if(allowed && body.toLowerCase().startsWith('.sasnc ')){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt = cleanBody(body.slice(7).trim());
                if(!txt){ await this.send(chat,`📋 .sasnc [${g('text')}]`); return; }
                if(sasNcLoops.has(chat)){
                    await this.sendFast(chat,`⚠️ ${g('sasnc already running here — use .stopsasnc first')}`);
                    return;
                }
                // FIX + OPTIMIZATION: sasnc — fan out across ALL active bots in parallel.
                // Same architecture as ultranc but with safer per-bot pacing.
                const fleet = this.hub.router.getAll().filter(s =>
                    s && s.socket && s.online && s.state === SESSION_STATE.ACTIVE
                );
                if(fleet.length === 0){ await this.sendFast(chat, `❌ ${g('no active bots available')}`); return; }
                const ctl = { on:true, workers: fleet.length, txt };
                sasNcLoops.set(chat, ctl);
                await this.sendFast(chat, `${TAG}\n\n🛡️  𝐒𝐀𝐒𝐍𝐂  𝐈𝐆𝐍𝐈𝐓𝐄𝐃\n  🤖 ${g('fleet')}: ${fleet.length} ${g('bots')}\n  ⚡ ${g('burst')}: ${sasNcSpeed.burstSize}  ║  ${g('parallel')}: ${sasNcSpeed.parallel}\n  📝 ${g('text')}: ${txt}\n  🛑 .stopsasnc`);
                for(const bot of fleet){
                    setImmediate(async () => {
                    const self = bot;
                    // FIX [PURE-EMOJI]: per user request the suffix should be ONLY symbols
                    // and emojis — no extra text. Was alphanumeric, now decorative pool (.sasnc).
                    const SUFFIX = ['⚡','💥','🔥','☠️','💀','⚔️','🩸','🌑','🌌','💢','♾️','⚜️','✦','✧','★','☆','⟁','◈','◇','▲','▼','◉','⊛','⊕','✺','✹','✸','♛','♕','♚','✪','❖','❂','✷','✶','✵','✴','♨','卐','✿','❀','❉','❁','❄','❅','❆'];
                    const randSuffix = () => {
                        const n = 2 + Math.floor(Math.random()*3);
                        let s = ''; for(let i=0;i<n;i++) s += SUFFIX[Math.floor(Math.random()*SUFFIX.length)];
                        return s;
                    };
                    const themeKeys = Object.keys(EMOJI_BANK);
                    const pickEmojiSet = () => EMOJI_BANK[themeKeys[Math.floor(Math.random()*themeKeys.length)]];
                    let consecutiveErr = 0;
                    try {
                        while(ctl.on){
                            if(!self.socket || !self.online || self.state!==SESSION_STATE.ACTIVE){
                                await delay(1500); continue;
                            }
                            // FIX: loop blocking — yield WS bandwidth to user commands.
                            try { if(_cmdInFlight && _cmdInFlight.get(chat) && Date.now() - _cmdInFlight.get(chat) < 2000) await delay(120); } catch {}
                            // safer pre-checks: throttle + restricted state
                            try { if(self.core?.isThrottled?.()) await self.core.waitThrottle(); } catch{}
                            // burst params (slightly smaller in stealth, slightly bigger in turbo)
                            let burstSize = sasNcSpeed.burstSize;
                            let parallel  = sasNcSpeed.parallel;
                            let restMin   = sasNcSpeed.restMin;
                            let restMax   = sasNcSpeed.restMax;
                            if(self.core?.mode === 'turbo'){
                                burstSize = Math.min(burstSize+1, 8);
                                restMin   = Math.max(300, restMin-100);
                            } else if(self.core?.mode === 'stealth'){
                                burstSize = Math.max(3, burstSize-2);
                                restMin   = restMin + 200;
                                restMax   = restMax + 300;
                            }
                            // run the burst in safer parallel batches
                            for(let b=0; b<burstSize && ctl.on; b += parallel){
                                const n = Math.min(parallel, burstSize - b);
                                const batch = [];
                                for(let p=0; p<n; p++){
                                    const set = pickEmojiSet();
                                    const shuffled = set.slice().sort(() => Math.random()-0.5);
                                    const emo = shuffled[Math.floor(Math.random()*shuffled.length)];
                                    const newSubject = `${txt} ${emo} ${randSuffix()}`;
                                    batch.push((async () => {
                                        try {
                                            await self.secCap.waitGrp();
                                            await self.socket.groupUpdateSubject(chat, newSubject);
                                            self.secCap.hitGrp();
                                            try { self.core.tick(); self.core.reward?.(); } catch{}
                                            consecutiveErr = 0;
                                        } catch(e){
                                            if(_isSuppressedErr(e)) return;
                                            consecutiveErr++;
                                            if(isRateErr(e)) {
                                                try { self.core.penalize?.(8); } catch{}
                                                await delay(2500);
                                            }
                                        }
                                    })());
                                    if(p < n-1) await delay(Math.floor(Math.random()*15));
                                }
                                try { await Promise.all(batch); }
                                catch(e){ if(!_isSuppressedErr(e)) loge(self.id, `sasnc batch err: ${e?.message||e}`); }
                                // safety brake: 3+ errors in a row → cooldown hard
                                if(consecutiveErr >= 3){
                                    await delay(4000 + Math.floor(Math.random()*2000));
                                    consecutiveErr = 0;
                                }
                            }
                            // longer breathing room between bursts (safe)
                            const span = Math.max(1, restMax - restMin);
                            await delay(restMin + Math.floor(Math.random()*span));
                        }
                    } catch(e){
                        if(!_isSuppressedErr(e)) loge(self.id, `sasnc loop err: ${e?.message||e}`);
                        await delay(1500);
                    } finally {
                        ctl.workers = Math.max(0, (ctl.workers||1) - 1);
                        if(ctl.workers === 0) sasNcLoops.delete(chat);
                    }
                    }); // end setImmediate
                } // end for(bot of fleet)
                return;
            }
            if(allowed && cmd === '.stopsasnc'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const ctl = sasNcLoops.get(chat);
                if(ctl){ ctl.on = false; }
                await this.sendFast(chat, `${TAG}\n\n🛑 ${g('sasnc stopped — all workers halting')}`);
                return;
            }

            // FEATURE: triple1..triple10 — INSANE TIER NC engine.
            // Usage: .triple<N> <text>     where N = 1..10 (1=warm, 10=apocalypse)
            //        .stoptriple           stop triple loop in this chat
            // Per-chat isolated controller. Smartcore-aware. Won't cross-block other groups.
            if(allowed && cmd === '.stoptriple'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const ctl = tripleNcLoops.get(chat);
                if(ctl){ ctl.on = false; tripleNcLoops.delete(chat); }
                await this.sendFast(chat, `${TAG}\n\n🛑 ${g('triple stopped')}`);
                return;
            }
            {
                const tripleMatch = body.match(/^\.triple([1-9]|10)\s+(.+)/i);
                if(allowed && tripleMatch){
                    if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                    const lvl = parseInt(tripleMatch[1]);
                    const txt = cleanBody(tripleMatch[2].trim());
                    if(!txt){ await this.send(chat, `📋 .triple${lvl} [${g('text')}]`); return; }
                    if(tripleNcLoops.has(chat)){
                        await this.sendFast(chat, `⚠️ ${g('triple already running here — use .stoptriple first')}`);
                        return;
                    }
                    const preset = TRIPLE_PRESETS[lvl];
                    const ctl = { on:true, level:lvl, txt };
                    tripleNcLoops.set(chat, ctl);
                    const self = this;
                    // FEATURE: fire-and-forget — runs in background, never blocks command dispatch
                    setImmediate(async () => {
                        // FIX [PURE-EMOJI]: per user request the suffix should be ONLY symbols
                        // and emojis — no extra text. Was alphanumeric+punctuation, now a
                        // curated pool of decorative symbols + small emojis (.triplenc).
                        const SUFFIX_CHARS = ['⚡','💥','🔥','☠️','💀','⚔️','🩸','🌑','🌌','💢','♾️','⚜️','✦','✧','★','☆','⟁','◈','◇','▲','▼','◉','⊛','⊕','✺','✹','✸','♛','♕','♚','✪','❖','❂','✷','✶','✵','✴','♨','卐','✿','❀','❉','❁','❄','❅','❆'];
                        const randSuffix = () => {
                            const n = preset.suffixMin + Math.floor(Math.random()*(preset.suffixMax-preset.suffixMin+1));
                            let s = '';
                            for(let i=0;i<n;i++) s += SUFFIX_CHARS[Math.floor(Math.random()*SUFFIX_CHARS.length)];
                            return s;
                        };
                        const themeKeys = Object.keys(EMOJI_BANK);
                        const pickEmojiSet = () => EMOJI_BANK[themeKeys[Math.floor(Math.random()*themeKeys.length)]];
                        const pickEmoji = () => { const set = pickEmojiSet(); return set[Math.floor(Math.random()*set.length)]; };
                        let consecErr = 0;
                        try {
                            while(ctl.on){
                                if(!self.socket || !self.online || self.state !== SESSION_STATE.ACTIVE){
                                    await delay(1500); continue;
                                }
                                // FIX: loop blocking — yield WS bandwidth to user commands.
                                try { if(_cmdInFlight && _cmdInFlight.get(chat) && Date.now() - _cmdInFlight.get(chat) < 2000) await delay(120); } catch {}
                                try { if(self.core?.isThrottled?.()) await self.core.waitThrottle(); } catch{}
                                // run burst in parallel batches
                                for(let b=0; b<preset.burst && ctl.on; b += preset.parallel){
                                    const n = Math.min(preset.parallel, preset.burst - b);
                                    const batch = [];
                                    for(let p=0; p<n; p++){
                                        // double/triple emoji prefix at higher levels for craziness
                                        const emoCount = lvl >= 8 ? 3 : lvl >= 5 ? 2 : 1;
                                        let emoStr = '';
                                        for(let e=0;e<emoCount;e++) emoStr += pickEmoji();
                                        const newSubject = `${emoStr} ${txt} ${emoStr} ${randSuffix()}`;
                                        batch.push((async () => {
                                            try {
                                                await self.secCap.waitGrp();
                                                await self.socket.groupUpdateSubject(chat, newSubject);
                                                self.secCap.hitGrp();
                                                try { self.core.tick(); } catch{}
                                                consecErr = 0;
                                            } catch(e){
                                                if(_isSuppressedErr(e)) return;
                                                consecErr++;
                                                if(isRateErr(e)){ try { self.core.penalize?.(8); } catch{} await delay(1800); }
                                            }
                                        })());
                                        if(p < n-1) await delay(Math.floor(Math.random()*15));
                                    }
                                    try { await Promise.all(batch); } catch(e){ if(!_isSuppressedErr(e)) loge(self.id, `triple batch err: ${e?.message||e}`); }
                                    // OPTIMIZATION: bail out if we hit a wall of errors (rate-limit / lost socket)
                                    if(consecErr >= 12){ await delay(3000); consecErr = 0; }
                                }
                                const span = Math.max(1, preset.restMax - preset.restMin);
                                await delay(preset.restMin + Math.floor(Math.random()*span));
                            }
                        } catch(e){
                            if(!_isSuppressedErr(e)) loge(self.id, `triple loop err: ${e?.message||e}`);
                            await delay(1500);
                        } finally {
                            tripleNcLoops.delete(chat);
                        }
                    });
                    // FIX: instant ack via sendFast — bot replies before loop even starts spinning
                    await this.sendFast(chat, `${TAG}\n\n💥 𝐓𝐑𝐈𝐏𝐋𝐄  𝐋${lvl}  𝐈𝐆𝐍𝐈𝐓𝐄𝐃\n  ⚡ burst: ${preset.burst}  ║  parallel: ${preset.parallel}\n  ⏱️  rest: ${preset.restMin}-${preset.restMax}ms\n  📝 text: ${txt}\n  🛑 ${g('stop')}: .stoptriple`);
                    return;
                }
            }

            // FEATURE: shadi (wedding) themed fun commands — all PG, light & playful
            if(allowed && cmd === '.shadi' || (allowed && body.toLowerCase().startsWith('.shadi '))){
                const mentions = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid)||[];
                const a = mentions[0] ? '@'+mentions[0].split('@')[0] : (g('Dulha'));
                const b = mentions[1] ? '@'+mentions[1].split('@')[0] : (g('Dulhan'));
                const card = `╔═══════ 💍 𝐒 𝐇 𝐀 𝐃 𝐈 💍 ═══════╗

   🌹 ${g('Aaj ki shaadi pyari pyari')} 🌹
   💒 ${g('Dulha-Dulhan ka swagat hai')} 💒

   🤵  𝐃𝐮𝐥𝐡𝐚 : ${a}
   👰  𝐃𝐮𝐥𝐡𝐚𝐧: ${b}

   🎊 ${g('Pheras lag rahe hain')} 🎊
   🥳 ${g('Sab log naacho – DJ on')}  🥳
   🍱 ${g('Khana 100% free for all')}  🍛

╚═══════ 💕 𝐕𝐀𝐌𝐏𝐈𝐑𝐄 𝐖𝐄𝐃𝐃𝐈𝐍𝐆 𝐇𝐀𝐋𝐋 💕 ═══════╝`;
                try { await this.socket.sendMessage(chat, {text: card, mentions}); } catch{}
                return;
            }
            if(allowed && (cmd === '.dulha' || body.toLowerCase().startsWith('.dulha '))){
                const name = body.slice(6).trim() || g('vampire Bhai');
                await this.send(chat, `🤵 𝐃𝐔𝐋𝐇𝐀  𝐂𝐑𝐎𝐖𝐍𝐄𝐃 🤵\n\n  👑  ${name}  👑\n\n  💍 ${g('Sehra bandhwa lo bhai')}\n  🐎 ${g('Ghodi ready hai')}\n  💃 ${g('Baraat chal padi')}`);
                return;
            }
            if(allowed && (cmd === '.dulhan' || body.toLowerCase().startsWith('.dulhan '))){
                const name = body.slice(7).trim() || g('Hawasi Rani');
                await this.send(chat, `👰 𝐃𝐔𝐋𝐇𝐀𝐍 𝐂𝐑𝐎𝐖𝐍𝐄𝐃 👰\n\n  👑  ${name}  👑\n\n  💄 ${g('Mehendi laga li')}\n  💍 ${g('Lehenga sajaya')}\n  🌹 ${g('Mandap pe milte hain')}`);
                return;
            }
            if(allowed && cmd === '.baraat'){
                const lines = ['🐎 🥁 🎺 💃 🕺 🎉 🎊', '🎷 🎺 🥁 💃 🕺 🐘 🎶', '🎉 💥 🥁 🎺 🕺 🎷 🪗', '🐎🐎🐎  🥁🥁🥁  🎺🎺🎺', '💃🕺💃🕺💃🕺💃🕺'];
                const txt = `🥁 𝐁 𝐀 𝐑 𝐀 𝐀 𝐓   𝐀 𝐀 𝐈   🥁\n\n${lines.join('\n')}\n\n  🎊 ${g('Naacho gaao mauj manao!')} 🎊`;
                await this.send(chat, txt);
                return;
            }
            if(allowed && cmd === '.shaadigift'){
                const gifts = [g('Sona ka set'), g('iPhone 17 Pro Max'), g('Honeymoon ticket to Goa'), g('Royal Enfield bullet'),
                               g('Box of mithai (5kg)'), g('Cash envelope ₹501'), g('Diamond ring 💎'), g('Toaster (uncle from US)'),
                               g('Hand-knitted sweater (nani)'), g('Tata Nano (sasur ji)'), g('Surprise: rishtedaar ka lecture')];
                const pick = gifts[Math.floor(Math.random()*gifts.length)];
                await this.send(chat, `🎁 𝐒𝐇𝐀𝐀𝐃𝐈 𝐆𝐈𝐅𝐓\n\n  🎀 ${g('Tumhe mila')}: ${pick}`);
                return;
            }
            if(allowed && (cmd === '.rishta' || body.toLowerCase().startsWith('.rishta '))){
                const mentions = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid)||[];
                const who = mentions[0] ? '@'+mentions[0].split('@')[0] : g('Aap');
                const card = `💌 𝐑 𝐈 𝐒 𝐇 𝐓 𝐀   𝐀 𝐀 𝐘 𝐀   𝐇 𝐀 𝐈 💌\n\n  💕 ${g('Beta')}, ${who} ${g('ke liye rishta aaya hai')}!\n  🏠 ${g('Ladka/ladki')}: ${g('Engineer hai, Bangalore me settled')}\n  💰 ${g('Salary')}: 18 LPA\n  👨‍👩‍👧‍👦 ${g('Family')}: ${g('Bahut achi hai')}\n\n  🤔 ${g('Soch ke bata dena')}!`;
                try { await this.socket.sendMessage(chat, {text: card, mentions}); } catch{}
                return;
            }
            if(allowed && (cmd === '.vidaai' || body.toLowerCase().startsWith('.vidaai '))){
                const name = body.slice(7).trim() || g('Hamari Beti');
                await this.send(chat, `💔 𝐕 𝐈 𝐃 𝐀 𝐀 𝐈 💔\n\n  😭  ${name} ${g('ki vidaai ka samay aa gaya')}\n  🌸 ${g('Sasural ko pyaar mile, maayke ki yaad rahe')}\n  🚗 ${g('Gaadi sajaa di gayi')}\n  💐 ${g('Sab rishtedaar ro rahe hain')}\n\n  🥹 ${g('Khush raho beta!')}`);
                return;
            }
            if(allowed && cmd === '.honeymoon'){
                const places = [g('Maldives 🏝️'), g('Switzerland 🏔️'), g('Bali 🌴'), g('Goa 🌊'), g('Manali 🌨️'),
                                g('Paris 🗼'), g('Andaman 🏖️'), g('Kashmir 🌷'), g('Dubai 🏜️'), g('Thailand 🛕')];
                const pick = places[Math.floor(Math.random()*places.length)];
                await this.send(chat, `🌴 𝐇 𝐎 𝐍 𝐄 𝐘 𝐌 𝐎 𝐎 𝐍   𝐃 𝐄 𝐒 𝐓 𝐈 𝐍 𝐀 𝐓 𝐈 𝐎 𝐍\n\n  💕 ${g('Aap dono jaa rahe ho')}: ${pick}\n  🎟️ ${g('Tickets booked!')}`);
                return;
            }

            // FEATURE: general fun/timepass commands
            if(allowed && (cmd === '.ship' || body.toLowerCase().startsWith('.ship '))){
                const mentions = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid)||[];
                const a = mentions[0] ? '@'+mentions[0].split('@')[0] : 'You';
                const b = mentions[1] ? '@'+mentions[1].split('@')[0] : 'Crush';
                const pct = Math.floor(Math.random()*101);
                const bar = (() => { const f = Math.round(pct/10); return '█'.repeat(f) + '░'.repeat(10-f); })();
                let verdict;
                if(pct < 20) verdict = g('Bhai delete kar number 🤡');
                else if(pct < 40) verdict = g('Hmm friendzone 😅');
                else if(pct < 60) verdict = g('Try kar sakte ho 🤔');
                else if(pct < 80) verdict = g('Match made! 💕');
                else verdict = g('Shadi karwa do iski! 💍');
                try { await this.socket.sendMessage(chat, {text:`💕 𝐒 𝐇 𝐈 𝐏 𝐏 𝐈 𝐍 𝐆 💕\n\n  ${a}  ❤️  ${b}\n\n  ${bar}  ${pct}%\n\n  💬 ${verdict}`, mentions}); } catch{}
                return;
            }
            if(allowed && cmd === '.shayri'){
                const arr = [
                    g('Mohabbat bhi ek silsila hai...\nBas dil tootne ka mausam hai 🥀'),
                    g('Tere bina jeena bhi koi jeena hai lalla?\nApna time aayega 😎'),
                    g('Wo bhi ek dor thi humein bandhe rakhne ki...\nKat gayi to ud chale aasmaan me 🕊️'),
                    g('Ishq mein hum to fakir ho gaye...\nDil bhi de diya, dimaag bhi 🤡'),
                    g('Chand bhi kabhi adhura lagta hai...\nJab tu meri yaado mein hota hai 🌙'),
                ];
                await this.send(chat, `📜 𝐒 𝐇 𝐀 𝐘 𝐑 𝐈\n\n${arr[Math.floor(Math.random()*arr.length)]}`);
                return;
            }
            if(allowed && cmd === '.joke'){
                const arr = [
                    g('Pappu: Sir, mujhe maths nahi aati.\nTeacher: Toh phir kya aata hai?\nPappu: Nashta khaali pet aata hai sir 🤡'),
                    g('Doctor: Tum kitna pani peete ho?\nPatient: Pyaar se?\nDoctor: Nahi, normal me!\nPatient: Phir samajh nahi aaya 😂'),
                    g('Wife: Tum hamesha late kyu hote ho?\nHusband: Office me clock galat hai 🙃'),
                    g('Teacher: Earth gol kyu hai?\nStudent: Nahi pata sir.\nTeacher: Sahi jawab! 😎'),
                    g('Boss: Tum office aate kyu nahi?\nMe: Office mujhe bulaata nahi 🤷'),
                ];
                await this.send(chat, `😂 𝐉 𝐎 𝐊 𝐄\n\n${arr[Math.floor(Math.random()*arr.length)]}`);
                return;
            }
            if(allowed && (cmd === '.gali' || body.toLowerCase().startsWith('.gali '))){
                const mentions = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid)||[];
                const who = mentions[0] ? '@'+mentions[0].split('@')[0] : g('Bhai');
                const arr = [g('itna lazy hai ki saans bhi auto-mode pe leta hai 🥱'),
                             g('iska brain WiFi ke baahar reh gaya 📡'),
                             g('joke samjhne me 3 working days lagte hain 📅'),
                             g('iski height pizza ke base se chhoti hai 🍕'),
                             g('itna over-confident hai ki Google ko bhi correct karta hai 🔍')];
                try { await this.socket.sendMessage(chat, {text:`🌶️ 𝐆 𝐀 𝐋 𝐈\n\n  ${who} ${arr[Math.floor(Math.random()*arr.length)]}`, mentions}); } catch{}
                return;
            }
            if(allowed && (cmd === '.flirt' || body.toLowerCase().startsWith('.flirt '))){
                const mentions = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid)||[];
                const who = mentions[0] ? '@'+mentions[0].split('@')[0] : g('cutie');
                const arr = [g('tum WiFi ho? mera dil connect ho gaya 📶'),
                             g('Google bolta hai mujhe tumhare jaise log dhundhne pasand hain 🔍'),
                             g('tum coffee ho ya chai? donon nahi to bas tum 🧋'),
                             g('mera GPS bhi tumhi tak le aata hai 📍'),
                             g('thoda dheere muskurao, dil se exception throw ho jaata hai ❤️')];
                try { await this.socket.sendMessage(chat, {text:`💘 𝐅 𝐋 𝐈 𝐑 𝐓\n\n  ${who} → ${arr[Math.floor(Math.random()*arr.length)]}`, mentions}); } catch{}
                return;
            }
            if(allowed && cmd === '.truth'){
                const arr = [g('Ab tak kitne crush rahe?'), g('Akhri jhoot kya bola tha?'), g('Kabhi kisi ka diary pada?'),
                             g('Family group me kaunsa msg accidentally bheja?'), g('Sabse zyada kis pe stalk karte ho insta pe?'),
                             g('Crush ke saamne kya goof-up kiya tha?')];
                await this.send(chat, `🤔 𝐓 𝐑 𝐔 𝐓 𝐇\n\n  ❓ ${arr[Math.floor(Math.random()*arr.length)]}`);
                return;
            }
            if(allowed && cmd === '.dare'){
                const arr = [g('Apni ex/crush ko "hi" bhejo abhi'), g('Status pe 5 min ke liye selfie lagao'),
                             g('Group me sabko good morning bhejo (raat 12 baje bhi)'), g('Aapne jis ko block kiya unblock karo'),
                             g('Maa-papa ko "I love you" bhejo bina reason'), g('Apna phone next person ko 5 min ke liye dedo')];
                await this.send(chat, `🔥 𝐃 𝐀 𝐑 𝐄\n\n  ⚡ ${arr[Math.floor(Math.random()*arr.length)]}`);
                return;
            }
            if(allowed && (cmd === '.hug' || body.toLowerCase().startsWith('.hug '))){
                const mentions = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid)||[];
                const who = mentions[0] ? '@'+mentions[0].split('@')[0] : g('bhai');
                try { await this.socket.sendMessage(chat, {text:`🤗 ${who} ${g('ko ek warm hug ❤️')}\n\n  *(づ｡◕‿‿◕｡)づ*`, mentions}); } catch{}
                return;
            }
            if(allowed && (cmd === '.slap' || body.toLowerCase().startsWith('.slap '))){
                const mentions = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid)||[];
                const who = mentions[0] ? '@'+mentions[0].split('@')[0] : g('bhai');
                try { await this.socket.sendMessage(chat, {text:`👋 ${who} ${g('ko ek zordaar thappad!')}\n\n  *(╯°□°)╯︵ ┻━┻*`, mentions}); } catch{}
                return;
            }
            if(allowed && cmd === '.pickup'){
                const arr = [g('Tumhare paas chai hai? mere paas time hai ☕'),
                             g('Battery low hai meri, tumhari smile charge karwa do 🔋'),
                             g('Tum maths ke teacher ho kya? dil pe complex daal diya 📐'),
                             g('Tumhari aankhon me kya hai? mera Wi-Fi connect ho gaya 📡'),
                             g('Tum hi ho meri 404 not found ka answer 🔍')];
                await this.send(chat, `😏 𝐏 𝐈 𝐂 𝐊 𝐔 𝐏\n\n  ${arr[Math.floor(Math.random()*arr.length)]}`);
                return;
            }
            if(allowed && (cmd === '.compliment' || body.toLowerCase().startsWith('.compliment '))){
                const mentions = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid)||[];
                const who = mentions[0] ? '@'+mentions[0].split('@')[0] : g('aap');
                const arr = [g('aap ki muskurahat ek dum dil ko sukoon deti hai 🌹'),
                             g('aap jab baat karte ho to room me energy aa jaati hai ✨'),
                             g('aap ki vibe sabse alag hai 💫'),
                             g('aap ki personality killer hai 💎'),
                             g('aap se milke kisi ka bhi din ban jaaye 🌸')];
                try { await this.socket.sendMessage(chat, {text:`🌹 𝐂 𝐎 𝐌 𝐏 𝐋 𝐈 𝐌 𝐄 𝐍 𝐓\n\n  ${who} ${arr[Math.floor(Math.random()*arr.length)]}`, mentions}); } catch{}
                return;
            }
            if(allowed && cmd === '.roll'){
                const n = 1 + Math.floor(Math.random()*6);
                const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
                await this.send(chat, `🎲 𝐃 𝐈 𝐂 𝐄\n\n  ${faces[n-1]}  →  𝐘𝐨𝐮 𝐫𝐨𝐥𝐥𝐞𝐝 ${n}`);
                return;
            }
            if(allowed && cmd === '.coin'){
                const r = Math.random() < 0.5 ? g('HEADS 🪙') : g('TAILS 🌚');
                await this.send(chat, `🪙 𝐂 𝐎 𝐈 𝐍   𝐅 𝐋 𝐈 𝐏\n\n  →  ${r}`);
                return;
            }
            if(allowed && (cmd === '.8ball' || body.toLowerCase().startsWith('.8ball '))){
                const q = body.slice(6).trim();
                const arr = [g('Bilkul, 100% haan ✅'), g('Mushkil hai bhai 😬'), g('Definitely no ❌'),
                             g('Try kar lo, lag sakta hai 🎲'), g('Soch samajh ke decision lo 🧠'),
                             g('Kal puchhna, aaj mood off 😴'), g('Mat kar, regret hoga 🚫'), g('Yes, abhi karle 🚀')];
                await this.send(chat, `🎱 𝟖-𝐁 𝐀 𝐋 𝐋\n\n  ❓ ${q || g('Tumne sawaal nahi puchha')}\n  💭 ${arr[Math.floor(Math.random()*arr.length)]}`);
                return;
            }
            if(allowed && cmd === '.meme'){
                const arr = [g('Mai bhi padhunga... kal se 🤡'), g('Battery 1% – bye sab 🔋'),
                             g('Mom: ek kaam kar do.\nMe: 1 hour me karta hu.\n[3 hours later]\nMom: ho gaya?\nMe: nahi maa, mood nahi 😭'),
                             g('Boss: meeting 9 baje.\nMe at 9:01 → "Sorry traffic" 🚗'),
                             g('Salary aate hi: shopping, food, treat. 5 din baad: maggi 🍜'),
                             g('Crush: hi.\nMe: *types deletes types deletes for 2 hours* → "k" 💀')];
                await this.send(chat, `🤡 𝐌 𝐄 𝐌 𝐄\n\n${arr[Math.floor(Math.random()*arr.length)]}`);
                return;
            }

            // FEATURE: shadiparty — full celebration mega-loop in current chat.
            // Sends rotating baraat / dance / confetti lines for [seconds] (default 30, max 180).
            // Uses smartcore throttle and respects rate limits — auto-stops when timer ends or .stopparty fires.
            if(allowed && (cmd === '.shadiparty' || body.toLowerCase().startsWith('.shadiparty '))){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                if(shadiPartyLoops.has(chat)){
                    await this.send(chat,`⚠️ ${g('shadiparty already running here — use .stopparty first')}`);
                    return;
                }
                const arg = body.slice(11).trim();
                let secs = parseInt(arg) || 30;
                if(secs < 5)  secs = 5;
                if(secs > 180) secs = 180;
                const ctl = {on:true};
                shadiPartyLoops.set(chat, ctl);
                const self = this;
                (async () => {
                    const lines = [
                        '🎉🎊  𝐒𝐇𝐀𝐀𝐃𝐈 𝐈𝐒 𝐎𝐍  🎊🎉',
                        '🥁 🎺 🎷 🎶 🪗 🥁 🎺 🎷 🎶 🪗',
                        '💃🕺💃🕺💃🕺💃🕺💃🕺',
                        '🎆🎇🎆🎇🎆🎇🎆🎇🎆🎇',
                        '🐎  𝐁𝐀𝐑𝐀𝐀𝐓 𝐂𝐇𝐀𝐋 𝐏𝐀𝐃𝐈  🐎',
                        '🌹  𝐃𝐔𝐋𝐇𝐀-𝐃𝐔𝐋𝐇𝐀𝐍 𝐙𝐈𝐍𝐃𝐀𝐁𝐀𝐃  🌹',
                        '🍱 🍛 🍗 🍰 🍪 🍮 🍢 🥘',
                        '🪩 𝐃𝐉 𝐖𝐀𝐋𝐄 𝐁𝐀𝐁𝐔  𝐌𝐄𝐑𝐀 𝐆𝐀𝐀𝐍𝐀 𝐂𝐇𝐀𝐋𝐀 𝐃𝐎 🪩',
                        '💐💍💐💍💐💍💐💍💐💍',
                        '✨ 𝐍𝐀𝐀𝐂𝐇𝐎  𝐆𝐀𝐀𝐎  𝐌𝐀𝐔𝐉  𝐌𝐀𝐍𝐀𝐎 ✨',
                    ];
                    const startTs = Date.now();
                    const endTs   = startTs + (secs * 1000);
                    try {
                        await self.send(chat, `╔═══ 🎊 𝐒𝐇𝐀𝐀𝐃𝐈 𝐏𝐀𝐑𝐓𝐘 𝐒𝐓𝐀𝐑𝐓𝐄𝐃 🎊 ═══╗\n  ⏱️ ${g('Duration')}: ${secs}s\n  💃 ${g('Naacho gaao mauj manao')}\n╚═══════════════════════════╝`);
                        let i = 0;
                        while(ctl.on && Date.now() < endTs){
                            try { if(self.core?.isThrottled?.()) await self.core.waitThrottle(); } catch{}
                            const line = lines[i % lines.length];
                            try { await self.send(chat, line); } catch(e){ if(!_isSuppressedErr(e)) loge(self.id,`shadiparty err: ${e?.message||e}`); }
                            i++;
                            // 1.2-2.2s between lines (safe pace)
                            await delay(1200 + Math.floor(Math.random()*1000));
                        }
                        if(ctl.on){
                            await self.send(chat, `╔═══ 🎉 𝐏𝐀𝐑𝐓𝐘 𝐎𝐕𝐄𝐑 🎉 ═══╗\n  💕 ${g('Mubarak ho! Sab ko mithai')} 🍬\n╚═══════════════════════╝`);
                        }
                    } catch(e){
                        if(!_isSuppressedErr(e)) loge(self.id, `shadiparty loop err: ${e?.message||e}`);
                    } finally {
                        shadiPartyLoops.delete(chat);
                    }
                })();
                return;
            }
            if(allowed && cmd === '.stopparty'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const ctl = shadiPartyLoops.get(chat);
                if(ctl){ ctl.on = false; shadiPartyLoops.delete(chat); }
                await this.send(chat, `🛑 ${g('shadiparty stopped')}`);
                return;
            }

            // FEATURE: baccha — multi-stage "baby-making" cinematic process.
            // Stages: rishta → suhaag-raat hint (PG) → 9-month skip → labour → birth card.
            // Picks parents from mentions (or defaults). Random gender, name, weight, look-alike %.
            // Per-chat lock prevents double-fire. PG only — no NSFW content.
            if(allowed && (cmd === '.baccha' || body.toLowerCase().startsWith('.baccha '))){
                if(bacchaLock.has(chat)){
                    await this.send(chat, `⏳ ${g('ek baccha already on the way! thoda sabar karo')}`);
                    return;
                }
                bacchaLock.add(chat);
                const self = this;
                (async () => {
                    try {
                        const mentions = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid)||[];
                        const papa = mentions[0] ? '@'+mentions[0].split('@')[0] : g('Papa');
                        const mama = mentions[1] ? '@'+mentions[1].split('@')[0] : g('Mama');
                        const boyNames  = ['Aarav','Veer','Kabir','Arjun','Reyansh','Ayaan','Vivaan','vampire Jr','Aditya','Rohan'];
                        const girlNames = ['Aaradhya','Anaya','Myra','Saanvi','Ira','Diya','Pari','Kiara','Aanya','Inaya'];
                        const isBoy   = Math.random() < 0.5;
                        const babyNm  = isBoy ? boyNames[Math.floor(Math.random()*boyNames.length)]
                                              : girlNames[Math.floor(Math.random()*girlNames.length)];
                        const gender  = isBoy ? `🧒 ${g('Beta')}` : `👧 ${g('Beti')}`;
                        const weight  = (2.5 + Math.random()*1.7).toFixed(2); // 2.5-4.2 kg
                        const papaPct = 30 + Math.floor(Math.random()*41);    // 30-70%
                        const mamaPct = 100 - papaPct;
                        const stage1 = `╔═══ 💍 𝐒𝐓𝐀𝐆𝐄 𝟏 ═══╗\n  💕 ${papa} ${g('aur')} ${mama} ${g('ki shaadi ho gayi')} 💍\n  🌹 ${g('Ghar me khushiyon ka mahaul')}\n╚════════════════════╝`;
                        const stage2 = `╔═══ 🌙 𝐒𝐓𝐀𝐆𝐄 𝟐 ═══╗\n  🌹 ${g('Suhaag raat — gulaab ki paankhudiyaan bichha di')} 🌹\n  🎶 ${g('Romantic music ON')} 🎵\n  🤫 ${g('Privacy please')}\n╚════════════════════╝`;
                        const stage3 = `╔═══ 🤰 𝐒𝐓𝐀𝐆𝐄 𝟑 ═══╗\n  🤰 ${mama} ${g('ke ghar khushkhabri')}!\n  🍼 ${g('9 mahine ka safar shuru')}\n  🥒 ${g('Achaar khaane ki craving')} 🥒\n╚════════════════════╝`;
                        const stage4 = `╔═══ 🏥 𝐒𝐓𝐀𝐆𝐄 𝟒 ═══╗\n  🚑 ${g('Hospital pohnch gaye!')}\n  👩‍⚕️ ${g('Doctor: push... push... push!')}\n  ⏳ ${g('Labour room me action')}\n╚════════════════════╝`;
                        const finalCard = `╔══════ 🎉 𝐁𝐀𝐂𝐂𝐇𝐀 𝐀𝐀 𝐆𝐀𝐘𝐀 🎉 ══════╗

   👶  𝐍𝐚𝐦𝐞   : ${babyNm}
   ${gender}  ${g('hua hai')}!
   ⚖️  𝐖𝐞𝐢𝐠𝐡𝐭 : ${weight} kg
   📅  𝐃𝐎𝐁    : ${new Date().toDateString()}

   🪞  ${g('Look-alike report')}:
       👨 ${papa} → ${papaPct}%
       👩 ${mama} → ${mamaPct}%

   🎁 ${g('Mubarak ho! Mithai khilao!')} 🍬
   👨‍👩‍👧‍👦 ${g('vampire parivaar me naya member')}

╚════════ 💕 𝐕𝐀𝐌𝐏𝐈𝐑𝐄 𝐌𝐀𝐓𝐄𝐑𝐍𝐈𝐓𝐘 𝐖𝐀𝐑𝐃 💕 ════════╝`;
                        await self.socket.sendMessage(chat, {text: stage1, mentions});
                        await delay(2500);
                        await self.socket.sendMessage(chat, {text: stage2, mentions});
                        await delay(2500);
                        await self.socket.sendMessage(chat, {text: stage3, mentions});
                        await delay(2500);
                        await self.socket.sendMessage(chat, {text: stage4, mentions});
                        await delay(2500);
                        await self.socket.sendMessage(chat, {text: finalCard, mentions});
                    } catch(e){
                        if(!_isSuppressedErr(e)) loge(self.id, `baccha err: ${e?.message||e}`);
                    } finally {
                        bacchaLock.delete(chat);
                    }
                })();
                return;
            }

            // ══ .nc WORD CYCLE ════════════════════════════
            if(/^\.(nc)\s+\S/i.test(body) && !/^\.(nc[0-9])/i.test(body.toLowerCase())){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt=cleanBody(body.slice(4).trim());
                const targetGcs = parseGcs(body);
                await this.hub.router.pushToGcs('word_start',{txt},this.id,true,targetGcs); return;
            }
            if(cmd==='.stopnc'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const targetGcs = parseGcs(body);
                await this.hub.router.pushToGcs('word_stop',{},this.id,true,targetGcs); return;
            }

            // ══ .conemo FLAG CYCLE ════════════════════════
            if(body.toLowerCase().startsWith('.conemo ')){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt=cleanBody(body.slice(8).trim());
                const targetGcs = parseGcs(body);
                await this.hub.router.pushToGcs('flag_start',{txt},this.id,true,targetGcs); return;
            }
            if(cmd==='.stopconemo'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const targetGcs = parseGcs(body);
                await this.hub.router.pushToGcs('flag_stop',{},this.id,true,targetGcs); return;
            }

            // ══ .ncemo EMOJI CYCLE ════════════════════════
            if(body.toLowerCase().startsWith('.ncemo ')){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt=cleanBody(body.slice(7).trim());
                const targetGcs = parseGcs(body);
                await this.hub.router.pushToGcs('emo_start',{txt},this.id,true,targetGcs); return;
            }
            if(cmd==='.stopncemo'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const targetGcs = parseGcs(body);
                await this.hub.router.pushToGcs('emo_stop',{},this.id,true,targetGcs); return;
            }

            // ══ .spam ═════════════════════════════════════
            if(body.toLowerCase().startsWith('.spam ')){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const txt=body.slice(6).trim();
                await this.hub.router.push('spam_start',{chat,txt},this.id); return;
            }
            if(cmd==='.stopspam'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                await this.hub.router.push('spam_stop',{chat},this.id); return;
            }

            // ══ .swipe ════════════════════════════════════
            if(body.toLowerCase().startsWith('.swipe')){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                const reply=body.slice(6).trim()||'👁️';
                await this.hub.router.push('swipe_start',{chat,reply},this.id); return;
            }
            if(cmd==='.stopswipe'){
                if(!isGroup){ await this.send(chat,`👥 ${g('groups only')}`); return; }
                await this.hub.router.push('swipe_stop',{chat},this.id); return;
            }

            // ══ .txt ══════════════════════════════════════
            if(body.toLowerCase().startsWith('.txt ')){
                const parts=body.slice(5).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 .txt [${g('text')}] [${g('ms')}]`); return; }
                const ms=parseInt(parts[parts.length-1]);
                if(isNaN(ms)||ms<30){ await this.send(chat,`⏱️ ${g('minimum 30ms')}`); return; }
                const txt=parts.slice(0,-1).join(' ');
                await this.hub.router.push('txt_start',{chat,txt,ms},this.id); return;
            }
            if(cmd==='.stoptxt'){
                await this.hub.router.push('txt_stop',{chat},this.id); return;
            }

            // ══ .slide ════════════════════════════════════
            if(body.toLowerCase().startsWith('.slide ')){
                if(!raw.message.extendedTextMessage?.contextInfo?.quotedMessage){
                    await this.send(chat,`↩️ ${g('reply to target first')}\n📋 .slide [${g('text')}] [${g('ms')}]`); return;
                }
                const parts=body.slice(7).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 .slide [${g('text')}] [${g('ms')}]`); return; }
                const ms=parseInt(parts[parts.length-1]);
                if(isNaN(ms)||ms<30){ await this.send(chat,`⏱️ ${g('minimum 30ms')}`); return; }
                const txt=parts.slice(0,-1).join(' ');
                const ctx=raw.message.extendedTextMessage.contextInfo;
                await this.hub.router.push('slide_start',{
                    chat,txt,ms,
                    mark:  ctx.participant||ctx.remoteJid,
                    refId: ctx.stanzaId,
                    refMsg:ctx.quotedMessage
                },this.id); return;
            }
            if(cmd==='.stopslide'){
                await this.hub.router.push('slide_stop',{chat},this.id); return;
            }

            // ══ .voice ════════════════════════════════════
            if(body.toLowerCase().startsWith('.voice ')){
                const txt=body.slice(7).trim();
                if(!txt){ await this.send(chat,`📋 .voice [${g('text')}]`); return; }
                try{
                    const {buffer,mimetype,ptt}=await makeTTS(txt);
                    await this.socket.sendMessage(chat,{audio:buffer,mimetype,ptt});
                }catch(e){ await this.send(chat,`❌ ${g('tts failed')}: ${e.message}`); }
                return;
            }

            // ══ .voiceatk ════════════════════════════════
            if(body.toLowerCase().startsWith('.voiceatk ')){
                const parts=body.slice(10).trim().split(' ');
                if(parts.length<2){ await this.send(chat,`📋 .voiceatk [${g('text')}] [${g('ms')}]`); return; }
                const ms=parseInt(parts[parts.length-1]);
                if(isNaN(ms)||ms<1000){ await this.send(chat,`⏱️ ${g('minimum 1000ms for voice')}`); return; }
                const txt=parts.slice(0,-1).join(' ');
                await this.hub.router.push('voice_start',{chat,txt,ms},this.id); return;
            }
            if(cmd==='.stopvoice'){
                await this.hub.router.push('voice_stop',{chat},this.id); return;
            }

            // ══ .img ════════════════════════════════════
            if(body.toLowerCase().startsWith('.img ')){
                if(!raw.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage){
                    await this.send(chat,`📸 ${g('reply to an image first')}\n📋 .img [${g('ms')}]`); return;
                }
                const ms=parseInt(body.slice(5).trim());
                if(isNaN(ms)||ms<100){ await this.send(chat,`⏱️ ${g('minimum 100ms for images')}`); return; }
                const ctx=raw.message.extendedTextMessage.contextInfo;
                const qm={key:{remoteJid:chat,fromMe:false,id:ctx.stanzaId,participant:ctx.participant},message:ctx.quotedMessage};
                try{
                    const buf=await downloadMediaMessage(qm,'buffer',{});
                    await this.hub.router.push('img_start',{
                        chat,ms,
                        data:buf.toString('base64'),
                        mime:ctx.quotedMessage.imageMessage.mimetype||'image/jpeg'
                    },this.id);
                }catch(e){ await this.send(chat,`❌ ${g('could not download image')}`); }
                return;
            }
            if(cmd==='.stopimg'){
                await this.hub.router.push('img_stop',{chat},this.id); return;
            }

            // ══ .globalnc ══════════════════════════════════
            if(allowed && body.toLowerCase().startsWith('.globalnc ')){
                const rawArgs  = body.slice(10).trim();
                const idMatch  = rawArgs.match(/--ids\s+(\S+)/);
                const txt      = rawArgs.replace(/--ids\s+\S+/,'').trim();
                if(!txt){ await this.send(chat,`📋 .globalnc [${g('text')}] [--ids id1,id2 optional]`); return; }

                if(globalNcState.active){
                    await this.send(chat,`⚠️ ${g('global nc already running — use .stopglobalnc first')}`);
                    return;
                }

                let allGids = [];
                if(idMatch){
                    allGids = idMatch[1].split(',').map(id=>id.includes('@g.us')?id:`${id}@g.us`);
                } else {
                    try{
                        const chats = await this.socket.groupFetchAllParticipating();
                        allGids = Object.keys(chats);
                    }catch(e){ await this.send(chat,`❌ ${g('could not fetch groups')}: ${e.message}`); return; }
                }

                if(allGids.length===0){ await this.send(chat,`❌ ${g('no groups found')}`); return; }

                const activeBots  = this.hub.router.getAlive();
                const GROUPS_PER_BOT = 10;
                for(let i=allGids.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [allGids[i],allGids[j]]=[allGids[j],allGids[i]]; }

                const chunks = [];
                for(let i=0;i<activeBots.length;i++){
                    const slice = allGids.slice(i*GROUPS_PER_BOT, (i+1)*GROUPS_PER_BOT);
                    if(slice.length>0) chunks.push({bot:activeBots[i],groups:slice});
                }

                globalNcState.active = true;
                globalNcState.loops  = [];

                logi('GLOBALNC',`GLOBAL NC STARTED | TOTAL GROUPS: ${allGids.length} | BOTS USED: ${chunks.length}`);
                await this.send(chat,
                    `${TAG}\n\n🌐 ${g('GLOBAL NC STARTED')}\n`+
                    `📊 ${g('TOTAL GROUPS')}: ${allGids.length}\n`+
                    `🤖 ${g('BOTS USED')}: ${chunks.length}`
                );

                for(const {bot, groups} of chunks){
                    const loopCtl = {on:true};
                    globalNcState.loops.push(loopCtl);
                    (async()=>{
                        try {  // [STABILITY FIX] global IIFE wrapped — never crashes process
                            let gncBack=0;
                            for(const gid of groups){
                                if(!loopCtl.on) break;
                                if(!bot || !bot.socket || !bot.online) break;
                                if(bot.state===SESSION_STATE.DEAD || bot.state===SESSION_STATE.LOCKED) break;
                                await bot.secCap.waitGrp();
                                try{
                                    const decor = SETS.faces[Math.floor(Math.random()*SETS.faces.length)];
                                    await bot.socket.groupUpdateSubject(gid,`${txt} ${decor}`);
                                    bot.secCap.hitGrp();
                                    gncBack=0;
                                }catch(e){
                                    if(_isSuppressedErr(e)){ /* swallow */ }
                                    else if(isRateErr(e)){ gncBack=Math.min(gncBack+2000,15000); await delay(gncBack); }
                                }
                                await delay(Math.max(20, Math.round(humanJitter()))); // [PERFORMANCE FIX] floor at 20ms
                            }
                            loopCtl.on = false;
                        } catch(e){ if(!_isSuppressedErr(e)) loge('GLOBALNC',`loop err: ${e?.message||e}`); loopCtl.on=false; }
                    })();
                }
                return;
            }

            if(allowed && cmd==='.stopglobalnc'){
                globalNcState.active = false;
                globalNcState.loops.forEach(l=>l.on=false);
                globalNcState.loops = [];
                await this.send(chat,lose('GLOBAL NC'));
                return;
            }

            // ══ .globalfast ════════════════════════════════
            if(allowed && body.toLowerCase().startsWith('.globalfast ')){
                const rawArgs = body.slice(12).trim();
                const idMatch = rawArgs.match(/--ids\s+(\S+)/);
                const txt     = rawArgs.replace(/--ids\s+\S+/,'').trim();
                if(!txt){ await this.send(chat,`📋 .globalfast [${g('text')}] [--ids id1,id2 optional]`); return; }

                if(globalFastState.active){
                    await this.send(chat,`⚠️ ${g('global fast already running — use .stopglobalfast first')}`);
                    return;
                }

                let allGids = [];
                if(idMatch){
                    allGids = idMatch[1].split(',').map(id=>id.includes('@g.us')?id:`${id}@g.us`);
                } else {
                    try{
                        const chats = await this.socket.groupFetchAllParticipating();
                        allGids = Object.keys(chats);
                    }catch(e){ await this.send(chat,`❌ ${g('could not fetch groups')}: ${e.message}`); return; }
                }

                if(allGids.length===0){ await this.send(chat,`❌ ${g('no groups found')}`); return; }

                const activeBots     = this.hub.router.getAlive();
                const MAX_GROUPS_PER_BOT = 100;

                for(let i=allGids.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [allGids[i],allGids[j]]=[allGids[j],allGids[i]]; }

                const chunks = [];
                for(let i=0;i<activeBots.length;i++){
                    const slice = allGids.slice(i*MAX_GROUPS_PER_BOT, (i+1)*MAX_GROUPS_PER_BOT);
                    if(slice.length>0) chunks.push({bot:activeBots[i], groups:slice});
                }

                globalFastState.active = true;
                globalFastState.loops  = [];

                logi('GLOBALFAST',`GLOBAL FAST STARTED | TOTAL GROUPS: ${allGids.length} | BOTS USED: ${chunks.length}`);
                await this.send(chat,
                    `${TAG}\n\n⚡ ${g('GLOBAL FAST STARTED')}\n`+
                    `📊 ${g('TOTAL GROUPS')}: ${allGids.length}\n`+
                    `🤖 ${g('BOTS USED')}: ${chunks.length}\n`+
                    `📦 ${g('GROUPS PER BOT')}: ${MAX_GROUPS_PER_BOT}`
                );

                for(const {bot, groups} of chunks){
                    const loopCtl = {on:true, consecutiveErrors:0, loadLimit:MAX_GROUPS_PER_BOT};
                    globalFastState.loops.push(loopCtl);
                    (async()=>{
                        try {  // [STABILITY FIX] wrapped — never crashes process
                            let gfBack=0;
                            const workGroups = groups.slice(0, loopCtl.loadLimit);
                            for(const gid of workGroups){
                                if(!loopCtl.on) break;
                                if(!bot || !bot.socket || !bot.online) break;
                                if(bot.state===SESSION_STATE.DEAD || bot.state===SESSION_STATE.LOCKED) break;
                                await bot.secCap.waitGrp();
                                try{
                                    const decor = SETS.faces[Math.floor(Math.random()*SETS.faces.length)];
                                    await bot.socket.groupUpdateSubject(gid,`${txt} ${decor}`);
                                    bot.secCap.hitGrp();
                                    loopCtl.consecutiveErrors = 0;
                                    gfBack = 0;
                                }catch(e){
                                    if(_isSuppressedErr(e)){ /* swallow */ }
                                    else {
                                        loopCtl.consecutiveErrors++;
                                        if(isRateErr(e)){
                                            gfBack=Math.min(gfBack+2000,15000);
                                            await delay(gfBack);
                                            loopCtl.consecutiveErrors = 0;
                                        } else if(loopCtl.consecutiveErrors>=3){
                                            loopCtl.loadLimit = Math.max(50, Math.floor(loopCtl.loadLimit/2));
                                        }
                                    }
                                }
                                await delay(Math.max(20, Math.round(humanJitter()))); // [PERFORMANCE FIX] floor at 20ms
                            }
                            loopCtl.on = false;
                        } catch(e){ if(!_isSuppressedErr(e)) loge('GLOBALFAST',`loop err: ${e?.message||e}`); loopCtl.on=false; }
                    })();
                }
                return;
            }

            if(allowed && cmd==='.stopglobalfast'){
                globalFastState.active = false;
                globalFastState.loops.forEach(l=>l.on=false);
                globalFastState.loops = [];
                await this.send(chat,lose('GLOBAL FAST'));
                return;
            }

        }catch(e){
            // FIX: command system — global error shield around the entire receive() pipeline.
            // Suppress Bad MAC / libsignal decryption errors — not a real crash.
            if(!_isSuppressedErr(e)) loge(this.id,`receive err: ${e.message}`);
        } finally {
            // FIX: watchdog — clear in-flight stamp on natural completion so the 5s sweeper
            // doesn't have to. Falls back to the sweeper only if the handler is truly stuck.
            try {
                const _chat = arguments?.[0]?.messages?.[0]?.key?.remoteJid;
                if(_chat) _cmdInFlight.delete(_chat);
            } catch {}
        }
    }

    // ── command executor — runs on ALL linked bots ─
    async handle(cmd, payload, notify=true, targetGid=null){
        const {chat: originalChat} = payload;
        const chat = targetGid || originalChat;
        try{
            switch(cmd){

            case 'nc_start':{
                // [LOOP FIX] previous version used boolean values per thread which caused
                // catastrophic STACKING: re-issuing .f1/.f2 etc. while a loop was already
                // running would spawn additional threads on top of the old ones. We now use
                // a shared object control + generation token: only ONE active generation per
                // (chat,key) tuple. Prior generations break out cleanly on next iteration.
                const {txt,key,setName}=payload;
                const emojis=SETS[setName];
                const ms=Math.max(30, timingMap[key]||30); // [PERFORMANCE FIX] enforce 30ms floor (no zero-delay loops)
                const groupKey=`${chat}__nc_${key}`;
                // [LOOP FIX] stop any prior generation for this (chat,key)
                const prev=this.nameLoops.get(groupKey);
                if(prev && typeof prev==='object'){ prev.on=false; await delay(150); }
                const gen=((prev&&prev.gen)||0)+1;
                const ctl={on:true, gen};
                this.nameLoops.set(groupKey, ctl);
                for(let t=0;t<THREADS_PER_ATTACK;t++){
                    const tid=`${chat}__nc_${key}_${t}`;
                    // also keep per-thread tracker for legacy killall compatibility
                    this.nameLoops.set(tid, ctl);
                    let i=t*Math.floor(emojis.length/THREADS_PER_ATTACK);
                    let backoff=0;
                    (async()=>{
                        try {
                            await delay(t*30 + Math.round(humanJitter()));
                            // [LOOP FIX] guard against stale generation — old IIFEs exit
                            while(ctl.on && this.nameLoops.get(groupKey)===ctl){
                                if(!this.socket||!this.online||this.state===SESSION_STATE.DEAD||this.state===SESSION_STATE.LOCKED){
                                    await delay(2000); continue;
                                }
                                await this.secCap.waitGrp();
                                const rampMs=ms;
                                const emo=emojis[i%emojis.length]; i++;
                                try{
                                    await this.socket.groupUpdateSubject(chat,`${txt} ${emo}`);
                                    this.secCap.hitGrp();
                                    backoff=0;
                                    await delay(rampMs + Math.round(humanJitter()));
                                }catch(e){
                                    if(_isSuppressedErr(e)){ await delay(rampMs); continue; }
                                    if(isRateErr(e)){ backoff=Math.min(backoff+1000,10000); await delay(backoff); }
                                    else { backoff=Math.min(backoff+300,3000); await delay(backoff); }
                                }
                            }
                        } catch(e) {
                            // [STABILITY FIX] never let an IIFE crash the process
                            if(!_isSuppressedErr(e)) loge(this.id,`nc loop err: ${e?.message||e}`);
                        }
                    })();
                }
                if(notify) await this.send(chat,win(`.${key} (${THREADS_PER_ATTACK} threads)`));
                break;
            }
            case 'nc_stop':{
                // [LOOP FIX] mark all matching control objects off, then drop entries
                for(const [k,v] of this.nameLoops){
                    if(k.startsWith(chat)){
                        if(v && typeof v==='object' && 'on' in v) v.on=false;
                        this.nameLoops.delete(k);
                    }
                }
                if(notify) await this.send(chat,lose('nc'));
                break;
            }

            // [NEW SYSTEM] vampirenc_start — TRIPLE-SPEED variant (3× threads, 15ms floor)
            // Mirrors nc_start safety: shared control + generation token, anti-stack guard,
            // anti-rate-limit backoff, restriction/dead/locked guards. Loop runs FOREVER
            // until .fstop / .killall — never auto-stops.
            case 'vampirenc_start':{
                const {txt,key,setName}=payload;
                const emojis=SETS[setName];
                if(!emojis){ break; } // safety
                const ms=Math.max(15, timingMap[key]||15); // [PERFORMANCE FIX] 15ms floor for triple-speed
                const groupKey=`${chat}__nc_${key}`;
                const prev=this.nameLoops.get(groupKey);
                if(prev && typeof prev==='object'){ prev.on=false; await delay(150); }
                const gen=((prev&&prev.gen)||0)+1;
                const ctl={on:true, gen};
                this.nameLoops.set(groupKey, ctl);
                const TRIPLE_THREADS = THREADS_PER_ATTACK * 3; // 6 threads (3× normal)
                for(let t=0;t<TRIPLE_THREADS;t++){
                    const tid=`${chat}__nc_${key}_${t}`;
                    this.nameLoops.set(tid, ctl);
                    let i=t*Math.floor(emojis.length/TRIPLE_THREADS);
                    let backoff=0;
                    (async()=>{
                        try {
                            await delay(t*20 + Math.round(humanJitter()));
                            while(ctl.on && this.nameLoops.get(groupKey)===ctl){
                                if(!this.socket||!this.online||this.state===SESSION_STATE.DEAD||this.state===SESSION_STATE.LOCKED){
                                    await delay(2000); continue;
                                }
                                await this.secCap.waitGrp();
                                const emo=emojis[i%emojis.length]; i++;
                                try{
                                    await this.socket.groupUpdateSubject(chat,`${txt} ${emo}`);
                                    this.secCap.hitGrp();
                                    backoff=0;
                                    await delay(ms + Math.round(humanJitter()/2)); // half-jitter for triple speed
                                }catch(e){
                                    if(_isSuppressedErr(e)){ await delay(ms); continue; }
                                    if(isRateErr(e)){ backoff=Math.min(backoff+1500,10000); await delay(backoff); }
                                    else { backoff=Math.min(backoff+300,3000); await delay(backoff); }
                                }
                            }
                        } catch(e) {
                            if(!_isSuppressedErr(e)) loge(this.id,`vampirenc loop err: ${e?.message||e}`);
                        }
                    })();
                }
                if(notify) await this.send(chat,win(`.${key} (${TRIPLE_THREADS} threads — TRIPLE SPEED)`));
                break;
            }

            case 'word_start':{
                const {txt}=payload;
                const tid=`${chat}__wl`;
                if(this.wordLoop.has(tid)){this.wordLoop.get(tid).on=false;await delay(100);}
                const t={on:true};
                this.wordLoop.set(tid,t);
                let wi=0,wBack=0;
                (async()=>{
                    while(t.on){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        await this.secCap.waitGrp();
                        const rampMs=30;
                        const word=WORD_CYCLE[wi%WORD_CYCLE.length]; wi++;
                        try{
                            await this.socket.groupUpdateSubject(chat,`${txt} ${word}`);
                            this.secCap.hitGrp();
                            wBack=0;
                            await delay(rampMs + Math.round(humanJitter()));
                        }catch(e){
                            if(isRateErr(e)){ wBack=Math.min(wBack+1500,12000); await delay(wBack); }
                            else await delay(rampMs);
                        }
                    }
                })();
                if(notify) await this.send(chat,win('.nc'));
                break;
            }
            case 'word_stop':{
                const tid=`${chat}__wl`;
                if(this.wordLoop.has(tid)){this.wordLoop.get(tid).on=false;this.wordLoop.delete(tid);}
                if(notify) await this.send(chat,lose('.nc'));
                break;
            }

            case 'flag_start':{
                const {txt}=payload;
                const tid=`${chat}__fl`;
                if(this.flagLoop.has(tid)){this.flagLoop.get(tid).on=false;await delay(100);}
                const t={on:true};
                this.flagLoop.set(tid,t);
                let fi=0,fBack=0;
                (async()=>{
                    while(t.on){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        await this.secCap.waitGrp();
                        const rampMs=30;
                        const flag=FLAG_CYCLE[fi%FLAG_CYCLE.length]; fi++;
                        try{
                            await this.socket.groupUpdateSubject(chat,`${txt} ${flag}`);
                            this.secCap.hitGrp();
                            fBack=0;
                            await delay(rampMs + Math.round(humanJitter()));
                        }catch(e){
                            if(isRateErr(e)){ fBack=Math.min(fBack+1500,12000); await delay(fBack); }
                            else await delay(rampMs);
                        }
                    }
                })();
                if(notify) await this.send(chat,win('.conemo'));
                break;
            }
            case 'flag_stop':{
                const tid=`${chat}__fl`;
                if(this.flagLoop.has(tid)){this.flagLoop.get(tid).on=false;this.flagLoop.delete(tid);}
                if(notify) await this.send(chat,lose('.conemo'));
                break;
            }

            case 'emo_start':{
                const {txt}=payload;
                const tid=`${chat}__em`;
                if(this.emojiLoop.has(tid)){this.emojiLoop.get(tid).on=false;await delay(100);}
                const t={on:true};
                this.emojiLoop.set(tid,t);
                let ei=0,eBack=0;
                (async()=>{
                    while(t.on){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        await this.secCap.waitGrp();
                        const rampMs=30;
                        const emo=EMO_CYCLE[ei%EMO_CYCLE.length]; ei++;
                        try{
                            await this.socket.groupUpdateSubject(chat,`${txt} ${emo}`);
                            this.secCap.hitGrp();
                            eBack=0;
                            await delay(rampMs + Math.round(humanJitter()));
                        }catch(e){
                            if(isRateErr(e)){ eBack=Math.min(eBack+1500,12000); await delay(eBack); }
                            else await delay(rampMs);
                        }
                    }
                })();
                if(notify) await this.send(chat,win('.ncemo'));
                break;
            }
            case 'emo_stop':{
                const tid=`${chat}__em`;
                if(this.emojiLoop.has(tid)){this.emojiLoop.get(tid).on=false;this.emojiLoop.delete(tid);}
                if(notify) await this.send(chat,lose('.ncemo'));
                break;
            }

            case 'spam_start':{
                const {txt}=payload;
                const tid=`${chat}__sp`;
                if(this.spamLoop.has(tid)){this.spamLoop.get(tid).on=false;await delay(100);}
                const t={on:true};
                this.spamLoop.set(tid,t);
                for(let th=0;th<THREADS_PER_ATTACK;th++){
                    (async(threadN)=>{
                        await delay(threadN*10 + Math.round(humanJitter()));
                        let sBack=0;
                        while(t.on){
                            if(!this.socket||!this.online){ await delay(2000); continue; }
                            await this.secCap.waitMsg();
                            const rampMs=30;
                            try{
                                await this.socket.sendMessage(chat,{text:txt});
                                this.secCap.hitMsg();
                                sBack=0;
                                await delay(rampMs + Math.round(humanJitter()));
                            }catch(e){
                                if(isRateErr(e)){ sBack=Math.min(sBack+1500,10000); await delay(sBack); }
                                else await delay(rampMs);
                            }
                        }
                    })(th);
                }
                if(notify) await this.send(chat,win('.spam'));
                break;
            }
            case 'spam_stop':{
                for(const [k,v] of this.spamLoop) if(k.startsWith(chat)){v.on=false;this.spamLoop.delete(k);}
                if(notify) await this.send(chat,lose('.spam'));
                break;
            }

            case 'swipe_start':{
                const {reply}=payload;
                this.swipeLoop.set(`${chat}__sw`,{live:true,reply});
                if(notify) await this.send(chat,`${win('.swipe')}  ›  ${reply}`);
                break;
            }
            case 'swipe_stop':{
                for(const [k,v] of this.swipeLoop) if(k.startsWith(chat)){v.live=false;this.swipeLoop.delete(k);}
                if(notify) await this.send(chat,lose('.swipe'));
                break;
            }

            case 'txt_start':{
                const {txt,ms}=payload;
                const tid=`${chat}__tx`;
                if(this.txtLoop.has(tid)){this.txtLoop.get(tid).on=false;await delay(100);}
                const t={on:true};
                this.txtLoop.set(tid,t);
                for(let th=0;th<THREADS_PER_ATTACK;th++){
                    (async(threadN)=>{
                        await delay(threadN*8 + Math.round(humanJitter()));
                        let tBack=0;
                        while(t.on){
                            if(!this.socket||!this.online){ await delay(2000); continue; }
                            await this.secCap.waitMsg();
                            const rampMs=ms;
                            try{
                                await this.socket.sendMessage(chat,{text:txt});
                                this.secCap.hitMsg();
                                tBack=0;
                                await delay(rampMs + Math.round(humanJitter()));
                            }catch(e){
                                if(isRateErr(e)){ tBack=Math.min(tBack+1500,10000); await delay(tBack); }
                                else await delay(rampMs);
                            }
                        }
                    })(th);
                }
                if(notify) await this.send(chat,win(`.txt (${ms}ms × ${THREADS_PER_ATTACK} threads)`));
                break;
            }
            case 'txt_stop':{
                const tid=`${chat}__tx`;
                if(this.txtLoop.has(tid)){this.txtLoop.get(tid).on=false;this.txtLoop.delete(tid);}
                if(notify) await this.send(chat,lose('.txt'));
                break;
            }

            case 'slide_start':{
                const {txt,ms,mark,refId,refMsg}=payload;
                const tid=`${chat}__${mark}`;
                // Kill any existing thread for this target first
                if(this.slideLoop.has(tid)){this.slideLoop.get(tid).live=false; await delay(150);}
                const t={
                    live:true, room:chat, mark,
                    ref:{key:{remoteJid:chat,fromMe:false,id:refId,participant:mark},message:refMsg}
                };
                this.slideLoop.set(tid,t);
                const SLIDE_THREADS = 6;
                for(let th=0;th<SLIDE_THREADS;th++){
                    (async(threadN)=>{
                        await delay(threadN*10 + Math.round(humanJitter()));
                        let slBack=0;
                        while(t.live){
                            // Exit thread if session went offline or socket died
                            if(!this.socket || !this.online || this.state===SESSION_STATE.DEAD || this.state===SESSION_STATE.LOCKED){
                                await delay(2000);
                                continue;
                            }
                            await this.secCap.waitMsg();
                            const rampMs=ms;
                            try{
                                await this.socket.sendMessage(chat,{text:txt},{quoted:t.ref});
                                this.secCap.hitMsg();
                                slBack=0;
                                await delay(rampMs + Math.round(humanJitter()));
                            }catch(e){
                                if(_isSuppressedErr(e)){
                                    await delay(rampMs); // silently skip bad MAC errors in slide
                                } else if(isRateErr(e)){
                                    slBack=Math.min(slBack+1500,10000); await delay(slBack);
                                } else {
                                    await delay(rampMs);
                                }
                            }
                        }
                        // Thread exited — clean up map entry if still pointing at same object
                        if(this.slideLoop.get(tid) === t) this.slideLoop.delete(tid);
                    })(th);
                }
                if(notify) await this.send(chat,win(`.slide (${ms}ms × ${SLIDE_THREADS} threads)`));
                break;
            }
            case 'slide_stop':{
                for(const [k,v] of this.slideLoop) if(v.room===chat){v.live=false;this.slideLoop.delete(k);}
                if(notify) await this.send(chat,lose('.slide'));
                break;
            }

            case 'voice_start':{
                const {txt,ms}=payload;
                const tid=`${chat}__vc`;
                if(this.voiceLoop.has(tid)){this.voiceLoop.get(tid).on=false;await delay(200);}
                const t={on:true};
                this.voiceLoop.set(tid,t);
                (async()=>{
                    let vBack=0;
                    while(t.on){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        const rampMs=ms;
                        try{
                            const {buffer,mimetype,ptt}=await makeTTS(txt);
                            await this.socket.sendMessage(chat,{audio:buffer,mimetype,ptt});
                            vBack=0;
                            await delay(rampMs + Math.round(humanJitter()));
                        }catch(e){
                            if(isRateErr(e)){ vBack=Math.min(vBack+1500,10000); await delay(vBack); }
                            else await delay(rampMs);
                        }
                    }
                })();
                if(notify) await this.send(chat,win('.voiceatk 🎤'));
                break;
            }
            case 'voice_stop':{
                const tid=`${chat}__vc`;
                if(this.voiceLoop.has(tid)){this.voiceLoop.get(tid).on=false;this.voiceLoop.delete(tid);}
                if(notify) await this.send(chat,lose('.voiceatk'));
                break;
            }

            case 'img_start':{
                const {ms,data,mime}=payload;
                const tid=`${chat}__im`;
                if(this.imgLoop.has(tid)){this.imgLoop.get(tid).on=false;await delay(100);}
                const t={on:true,buf:Buffer.from(data,'base64'),mime};
                this.imgLoop.set(tid,t);
                (async()=>{
                    let iBack=0;
                    while(t.on){
                        if(!this.socket||!this.online){ await delay(2000); continue; }
                        await this.secCap.waitMsg();
                        const rampMs=ms;
                        try{
                            await this.socket.sendMessage(chat,{image:t.buf,mimetype:t.mime});
                            this.secCap.hitMsg();
                            iBack=0;
                            await delay(rampMs + Math.round(humanJitter()));
                        }catch(e){
                            if(isRateErr(e)){ iBack=Math.min(iBack+1500,10000); await delay(iBack); }
                            else await delay(rampMs);
                        }
                    }
                })();
                if(notify) await this.send(chat,win('.img 📸'));
                break;
            }
            case 'img_stop':{
                const tid=`${chat}__im`;
                if(this.imgLoop.has(tid)){this.imgLoop.get(tid).on=false;this.imgLoop.delete(tid);}
                if(notify) await this.send(chat,lose('.img'));
                break;
            }

            case 'kill_all':
            case 'killall':{
                let killed=0;
                const wipe=(map,check)=>{
                    for(const [k,v] of map){
                        if(check(k,v)){
                            if(v&&typeof v==='object'){
                                if('on'   in v) v.on  =false;
                                if('live' in v) v.live=false;
                            }
                            map.delete(k); killed++;
                        }
                    }
                };
                wipe(this.nameLoops, k     => k.startsWith(chat));
                wipe(this.wordLoop,  k     => k.startsWith(chat));
                wipe(this.flagLoop,  k     => k.startsWith(chat));
                wipe(this.emojiLoop, k     => k.startsWith(chat));
                wipe(this.spamLoop,  k     => k.startsWith(chat));
                wipe(this.swipeLoop, k     => k.startsWith(chat));
                wipe(this.txtLoop,   k     => k.startsWith(chat));
                wipe(this.slideLoop, (_,v) => v.room===chat);
                wipe(this.voiceLoop, k     => k.startsWith(chat));
                wipe(this.imgLoop,   k     => k.startsWith(chat));
                wipe(this.gcnameLoop,k     => k.startsWith(chat));
                // FEATURE: killall now also stops .ultranc / .sasnc / .shadiparty / .triple loops in this chat
                // PLUS new fleet-wide engines: .snc, .fleetnc, .bonusnc, and per-chat task registry.
                {
                    const u = ultraNcLoops.get(chat);
                    if(u){ u.on = false; ultraNcLoops.delete(chat); killed++; }
                    const s = sasNcLoops.get(chat);
                    if(s){ s.on = false; sasNcLoops.delete(chat); killed++; }
                    const p = shadiPartyLoops.get(chat);
                    if(p){ p.on = false; shadiPartyLoops.delete(chat); killed++; }
                    const t = tripleNcLoops.get(chat);
                    if(t){ t.on = false; tripleNcLoops.delete(chat); killed++; }
                    // FIX: killall — also drain HYPER / MEGA / ULTRAX engines for this chat
                    const h = hyperNcLoops.get(chat);
                    if(h){ h.on = false; hyperNcLoops.delete(chat); killed++; }
                    const m = megaNcLoops.get(chat);
                    if(m){ m.on = false; megaNcLoops.delete(chat); killed++; }
                    const x = ultraXLoops.get(chat);
                    if(x){ x.on = false; ultraXLoops.delete(chat); killed++; }
                    // FEATURE: stop fleet super-engine (.snc) and fleet-nc panels for this chat
                    if (typeof globalThis.sncLoops?.get === 'function') {
                        const sn = globalThis.sncLoops.get(chat);
                        if (sn) { sn.on = false; globalThis.sncLoops.delete(chat); killed++; }
                    }
                    if (typeof globalThis.fleetNcLoops?.get === 'function') {
                        const fn = globalThis.fleetNcLoops.get(chat);
                        if (fn) { fn.on = false; globalThis.fleetNcLoops.delete(chat); killed++; }
                    }
                    if (typeof globalThis.bonusNcLoops?.get === 'function') {
                        const bn = globalThis.bonusNcLoops.get(chat);
                        if (bn) { bn.on = false; globalThis.bonusNcLoops.delete(chat); killed++; }
                    }
                    // per-chat task registry — drains every loop registered by chatTasks
                    try { killed += stopAllChatLoops(chat); } catch {}
                }
                if(notify) await this.send(chat,`${TAG}\n\n🛑 ${g('all attacks killed')} (${killed})`);
                break;
            }

            }
        }catch(e){ loge(this.id,`handle err: ${e.message}`); }
    }

    // FIX: command priority — fast-path send (no typing simulation, no per-mode delay)
    // Use sendFast() for command responses (.ping/.menu/.alive/.bot/.live etc.) so the
    // bot replies INSTANTLY even while heavy attack loops are running on the same socket.
    // sendFast still respects "restricted" state and limiter pause to avoid bans.
    // FIX: send — bullet-proof retry (1 immediate retry on transient failure)
    async sendFast(jid, text, mentions=[]){
        if(!this.socket || !this.online) return false;
        if(this.state === SESSION_STATE.RESTRICTED) return false;
        for(let attempt=0; attempt<2; attempt++){
            try {
                await this.socket.sendMessage(jid, { text, ...(mentions.length?{mentions}:{}) });
                // FIX [OUTBOUND-ACTIVITY]: successful send proves socket is alive.
                // Stamp heartbeat so deadman never false-triggers during heavy command activity.
                this._lastHeartbeatOk = Date.now();
                try { this.core.tick(); } catch{}
                return true;
            } catch(e){
                if(_isSuppressedErr(e)){ _bumpDecryptErr(this.id, this.socket); return false; }
                if(attempt === 0){ await delay(250); continue; }
                try { trackError('send', e); } catch{}
                return false;
            }
        }
        return false;
    }

    async send(jid,text,mentions=[]){
        if(!this.socket||!this.online) return;
        if(this.state===SESSION_STATE.RESTRICTED){ logw(this.id,'send blocked — reason: restricted'); return; }
        // FIX: command execution — read per-chat priority map (TTL) so a later non-priority
        // message can't have flipped the legacy this._priorityHint flag to false before
        // this send actually reads it. Falls back to the flag for safety.
        if((this._priorityMap?.get(jid) || 0) > Date.now() || this._priorityHint) return this.sendFast(jid, text, mentions);
        if(this.limiter.isPaused()) await this.limiter.wait();
        await this.core.waitThrottle();
        await this.core.simulateTyping(this.socket, jid);
        // [PERFORMANCE FIX] mode-aware human-like delay (was hard-coded 800-2000ms on EVERY send,
        // including .help / .menu / status replies — choking command responsiveness).
        // turbo: 80-200ms | fast: 200-500ms | safe: 600-1400ms | stealth: 1200-2400ms
        const m=this.core.mode;
        const baseMin = m==='turbo'?80  : m==='fast'?200 : m==='stealth'?1200 : 600;
        const baseMax = m==='turbo'?200 : m==='fast'?500 : m==='stealth'?2400 : 1400;
        await delay(baseMin + Math.random()*(baseMax-baseMin));
        await delay(Math.round(this.core.jitter()));
        let attempts=0;
        while(attempts<3){
            try{
                await this.socket.sendMessage(jid,{text,...(mentions.length?{mentions}:{})});
                // FIX [OUTBOUND-ACTIVITY]: successful send = socket alive → refresh heartbeat
                this._lastHeartbeatOk = Date.now();
                this.core.tick();
                this.core.reward();
                return;
            }catch(e){
                attempts++;
                this.core.penalize(5);
                if(SmartCore.isRestrictionErr(e)){
                    this.state=SESSION_STATE.RESTRICTED;
                    logw(this.id,`[RESTRICTION DETECTED] Restriction hit during send — auto-pausing ${RESTRICTED_PAUSE/3600000}h`);
                    setTimeout(()=>{ if(this.state===SESSION_STATE.RESTRICTED) this.state=SESSION_STATE.ACTIVE; }, RESTRICTED_PAUSE);
                    return;
                }
                if(isRateErr(e)){
                    logw(this.id,`[RATE LIMIT DETECTED] Rate limit hit — backing off exponentially (hit #${this.limiter.hitCount + 1})`);
                    this.limiter.hit();
                    await this.limiter.wait();
                } else {
                    loge(this.id,`send err: ${e.message}`);
                    return;
                }
            }
        }
    }

    // FEATURE: image send — sendImg now accepts mentions and falls back to text if image missing
    async sendImg(jid, caption, imgPath=PATH_SUSANOO_IMG, mentions=[]){
        if(!this.socket||!this.online) return;
        if(this.state===SESSION_STATE.RESTRICTED) return;
        if(this.limiter.isPaused()) await this.limiter.wait();
        await this.core.waitThrottle();
        await delay(Math.round(this.core.jitter()));
        try{
            if(fs.existsSync(imgPath)){
                const imgBuf = fs.readFileSync(imgPath);
                await this.socket.sendMessage(jid,{ image: imgBuf, caption, mimetype: 'image/jpeg', ...(mentions.length?{mentions}:{}) });
                this.core.tick();
                this.core.reward();
            } else {
                await this.send(jid, caption, mentions);
            }
        }catch(e){
            loge(this.id,`sendImg err: ${e.message}`);
            this.core.penalize(3);
            try { await this.send(jid, caption, mentions); } catch{}
        }
    }
}

// ═════════════════════════════════════════════
//  HUB  — manages all sessions
// ═════════════════════════════════════════════
class Hub {
    constructor(){
        this.sessions = new Map();
        this.router   = new Router();
        this.count    = 0;
        this.disk     = readJson(PATH_NETWORK,{count:0,list:[]});
        this.count    = this.disk.count||0;
    }

    _save(){
        // Persist sessions that: (a) have auth files, OR (b) are actively pairing/connecting
        const list = [...this.sessions.entries()]
            .filter(([id, s]) => {
                if(this._hasAuthFiles(id)) return true;
                // Also keep newly created sessions not yet written to disk
                if(s.phone && s.state !== SESSION_STATE.DEAD && s.state !== SESSION_STATE.LOCKED) return true;
                return false;
            })
            .map(([id,s]) => ({id, phone:s.phone, online:s.online}));
        writeJson(PATH_NETWORK, {count:this.count, list});
    }

    // Helper: check if a session id has real auth files on disk
    _hasAuthFiles(id){
        try {
            const ap = PATH_AUTH(id);
            return fs.existsSync(ap) && fs.readdirSync(ap).filter(f=>!f.startsWith('.')).length > 0;
        } catch { return false; }
    }

    async boot(){
        const sessionDirs = fs.existsSync('./sessions') ? fs.readdirSync('./sessions') : [];
        if (!this.disk.list) this.disk.list = [];

        // Merge any session dirs found on disk that aren't tracked yet
        for (const id of sessionDirs) {
            const p = `./sessions/${id}`;
            try {
                if (fs.statSync(p).isDirectory() && !this.disk.list.find(i => i.id === id)) {
                    this.disk.list.push({ id, phone: null, online: false });
                }
            } catch {}
        }

        // [STABILITY FIX] Force Ubuntu fingerprint on EVERY existing session.
        // Any non-Ubuntu fingerprint files left over from older runs are deleted so
        // they get reassigned to Ubuntu Chrome on the next connect. This guarantees
        // 100% Ubuntu identity across all sessions, current and future.
        for(const id of sessionDirs){
            const fpPath = PATH_FINGERPRINT(id);
            try{
                if(fs.existsSync(fpPath)){
                    const saved = JSON.parse(fs.readFileSync(fpPath,'utf8'));
                    if(saved.browser !== 'Ubuntu Chrome'){
                        fs.unlinkSync(fpPath);
                        log('HUB',`[FINGERPRINT] Migrated ${id} from "${saved.browser}" → Ubuntu Chrome`);
                    }
                }
            }catch{}
        }
        log('HUB','[FINGERPRINT] Fingerprint check complete — all sessions locked to Ubuntu Chrome');

        // ONLY restore sessions that actually have auth files — no ghost slots
        const realSessions = (this.disk.list || []).filter(entry => this._hasAuthFiles(entry.id));
        log('HUB', `Restoring ${realSessions.length} saved session(s)…`);

        for(const entry of realSessions){
            log('HUB',`Restoring: ${entry.id}`);
            const s = new Session(entry.id, entry.phone, this, null);
            this.sessions.set(entry.id, s);
            this.router.attach(entry.id, s);
            s.init();
            await delay(2000); // stagger startup to reduce connection risk
        }

        const primary = this.router.getPrimary();
        if (!primary && realSessions.length === 0) {
            // askPhone() handles: env var shortcut, retry loop, validation (10–15 digits)
            // askPhone() is called ONLY ONCE here — no parallel calls
            const phone = await askPhone();
            // Guard: block pairing if phone is null or invalid (should not happen, but defensive)
            if (!phone || phone.length < 10) {
                log('HUB', 'Invalid phone — pairing blocked');
                return;
            }
            log('HUB', `[PHONE] Pairing started with: ${phone}`);
            await this.link(phone, null);
        }
        this._save();

        const alive = this.router.getAlive();
        logi('HUB',`Boot complete — ${alive.length} bot(s) online`);
        alive.forEach(s => logi(s.id,`${s.self?.split('@')[0]??'—'} is online`));

        // Start auto-cleanup (purge DEAD/LOCKED sessions every 60s)
        this._startAutoCleanup();
    }

    async link(phone, notifyJid=null){
        // ── MULTI-SESSION: Allow up to MAX_SESSIONS_PER_PHONE active sessions per number ──
        const existingSet = activePhoneRegistry.get(phone);
        if(existingSet){
            let activeCount = 0;
            for(const sid of existingSet){
                const s = this.sessions.get(sid);
                if(s && s.online && s.state === SESSION_STATE.ACTIVE) activeCount++;
            }
            if(activeCount >= MAX_SESSIONS_PER_PHONE){
                logw('HUB', `[MULTI-SESSION] Phone +${phone} already has ${activeCount}/${MAX_SESSIONS_PER_PHONE} active sessions — limit reached`);
                return `${TAG}\n\n⚠️ ${g('phone')} +${phone} ${g('already has')} ${activeCount}/${MAX_SESSIONS_PER_PHONE} ${g('active sessions — max limit reached')}`;
            }
            logi('HUB', `[MULTI-SESSION] Phone +${phone} has ${activeCount}/${MAX_SESSIONS_PER_PHONE} sessions — adding new one`);
        }

        // Find unique empty slot — NEVER overwrite an existing session
        let id = null;
        for (let i = 1; i <= MAX_SEASONS; i++) {
            const s = `bot-${i}`;
            const sess = this.sessions.get(s);
            const authDir = PATH_AUTH(s);
            // Check for real auth files (ignore hidden files like .fingerprint.json)
            let isEmpty = true;
            try {
                isEmpty = !fs.existsSync(authDir) || fs.readdirSync(authDir).filter(f=>!f.startsWith('.')).length === 0;
            } catch {}
            // Slot valid only if auth dir empty AND session not currently online
            if (isEmpty && (!sess || !sess.online)) {
                id = s;
                break;
            }
        }

        if (!id) {
            this.count++;
            id = `X${this.count}`;
        }

        log('HUB',`Creating new session: ${id} for +${phone}`);

        const s = new Session(id, phone, this, notifyJid);
        this.sessions.set(id, s);
        this.router.attach(id, s);
        await s.init();
        this._save();
        return `${TAG}\n\n⏳ ${g('session')} ${id} ${g('created for')} +${phone}\n🔑 ${g('pairing code will arrive shortly')}\n\n${g('check the next message for the code')}`;
    }

    unlink(id){
        if(this.sessions.has(id)){
            const s = this.sessions.get(id);
            if (s) {
                // Unregister this session from the multi-session phone registry
                if(s.phone){
                    const sessions = activePhoneRegistry.get(s.phone);
                    if(sessions){ sessions.delete(id); if(sessions.size === 0) activePhoneRegistry.delete(s.phone); }
                    // Also remove from pending pairing registry
                    const pendingSessions = pendingPairingRegistry.get(s.phone);
                    if(pendingSessions){ pendingSessions.delete(id); if(pendingSessions.size === 0) pendingPairingRegistry.delete(s.phone); }
                }
                s.online = false;
                // [MEMORY FIX] proper teardown — clears intervals, kills loops, drops listeners
                try { s.destroy(); } catch{}
                // Session files are PRESERVED — do not delete on unlink
            }
            this.router.detach(id);
            this.sessions.delete(id);
            this._save();
            logw('HUB',`Session ${id} unlinked (files preserved)`);
        }
    }

    // ── Auto-cleanup: every 60s purge DEAD/LOCKED sessions from memory ──
    _startAutoCleanup(){
        // [MEMORY FIX] track this interval too so it can be cancelled if needed
        this._cleanupTimer = setInterval(() => {
          try {
            let removed = 0;
            for(const [id, s] of this.sessions){
                if(s.state === SESSION_STATE.DEAD || s.state === SESSION_STATE.LOCKED){
                    // Ensure not online before purging from memory
                    if(!s.online){
                        // [MEMORY FIX] one-shot teardown via destroy() — clears intervals,
                        // kills all loops, removes listeners, nulls socket.
                        try { s.destroy(); } catch{}
                        // Remove this session from the multi-session phone registry
                        if(s.phone){
                            const sessions = activePhoneRegistry.get(s.phone);
                            if(sessions){ sessions.delete(id); if(sessions.size === 0) activePhoneRegistry.delete(s.phone); }
                            // Also remove from pending pairing registry
                            const pendingSessions = pendingPairingRegistry.get(s.phone);
                            if(pendingSessions){ pendingSessions.delete(id); if(pendingSessions.size === 0) pendingPairingRegistry.delete(s.phone); }
                        }
                        this.router.detach(id);
                        this.sessions.delete(id);
                        removed++;
                    }
                }
            }
            if(removed > 0){
                logw('HUB', `[AUTO-CLEANUP] Removed ${removed} DEAD/LOCKED session(s) from memory`);
                this._save();
            }

            // Also GC stale session IDs from multi-session phone registry
            for(const [phone, sessionSet] of activePhoneRegistry){
                for(const sessId of [...sessionSet]){
                    const sess = this.sessions.get(sessId);
                    if(!sess || !sess.online || sess.state !== SESSION_STATE.ACTIVE){
                        sessionSet.delete(sessId);
                    }
                }
                if(sessionSet.size === 0) activePhoneRegistry.delete(phone);
            }
            // Also GC stale entries from pending pairing registry
            for(const [phone, pendingSet] of pendingPairingRegistry){
                for(const sessId of [...pendingSet]){
                    const sess = this.sessions.get(sessId);
                    // Remove if session is now online (already moved to activePhoneRegistry) or dead/gone
                    if(!sess || sess.online || sess.state === SESSION_STATE.DEAD || sess.state === SESSION_STATE.LOCKED){
                        pendingSet.delete(sessId);
                    }
                }
                if(pendingSet.size === 0) pendingPairingRegistry.delete(phone);
            }
          } catch(e){ try{ logw('HUB',`auto-cleanup err: ${e?.message||e}`); }catch{} } // [STABILITY FIX]
        }, 60 * 1000);
        if(this._cleanupTimer.unref) this._cleanupTimer.unref();
    }
}

// ─────────────────────────────────────────────
//  GLOBAL ERROR HANDLERS — keep bot alive 24/7
//  [STABILITY FIX] never crash; never let unhandled rejections terminate process
// ─────────────────────────────────────────────
// FIX: global error handlers — funnel into trackError() so .healthstat surfaces real fault rates.
// Still suppresses noisy libsignal/Bad MAC chatter. Heartbeat watchdog detects post-error hangs.
process.on('uncaughtException',  (e, origin) => {
    if(_isSuppressedErr(e)) return;
    try { trackError('uncaught', e); } catch {}
    try { loge('PROCESS', `Uncaught (${origin||'?'}): ${e?.message||e}`); } catch {}
});
process.on('unhandledRejection', (reason, _p) => {
    if(_isSuppressedErr(reason)) return;
    try { trackError('unhandled', reason); } catch {}
    try { loge('PROCESS', `Unhandled: ${reason?.message||reason}`); } catch {}
});
// [STABILITY FIX] keep process alive on warnings + ignore EPIPE on stdout
process.on('warning', () => {});
process.stdout?.on?.('error', () => {});
process.stderr?.on?.('error', () => {});
// [STABILITY FIX] never exit on SIGPIPE / SIGHUP from terminal disconnects (RDP/SSH)
try { process.on('SIGPIPE', () => {}); } catch {}
try { process.on('SIGHUP',  () => {}); } catch {}

// ═════════════════════════════════════════════
//  HTTP CONTROL API
// ═════════════════════════════════════════════
function startApiServer(hubRef){
    const server = http.createServer((req,res)=>{
        const url = req.url.toLowerCase().split('?')[0];

        // FEATURE: live HTML dashboard at  /  and  /dashboard
        // Auto-refreshing premium dark UI showing every session, stats, RAM, CPU, uptime.
        // NOTE: Node `cluster` mode was intentionally NOT added — Baileys persists per-session
        // auth files on disk. Forking workers would race-condition the auth state and replicate
        // logins, which WhatsApp detects as session-replace (440) and bans. Single-process with
        // async loops is the correct architecture for Baileys multi-session bots.
        if(req.method==='GET' && (url==='/' || url==='/dashboard')){
            try {
                const all = hubRef.router.getAll();
                const mem = process.memoryUsage();
                const ramMB  = (mem.rss/1024/1024).toFixed(1);
                const heapMB = (mem.heapUsed/1024/1024).toFixed(1);
                const up = process.uptime();
                const upStr = `${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m ${Math.floor(up%60)}s`;
                const rows = all.map(s=>{
                    const totalLoops =
                        (s.nameLoops?.size||0)+(s.wordLoop?.size||0)+(s.flagLoop?.size||0)+
                        (s.emojiLoop?.size||0)+(s.spamLoop?.size||0)+(s.swipeLoop?.size||0)+
                        (s.txtLoop?.size||0)+(s.slideLoop?.size||0)+(s.voiceLoop?.size||0)+
                        (s.imgLoop?.size||0)+(s.gcnameLoop?.size||0);
                    const dot = s.online ? '🟢' : (s.state==='RESTRICTED'?'🟡':'🔴');
                    return `<tr>
                        <td>${dot} <b>${s.id}</b></td>
                        <td>+${s.self?.split('@')[0]||'—'}</td>
                        <td><span class="badge ${s.state}">${s.state}</span></td>
                        <td>${s.core?.mode||'safe'}</td>
                        <td>${s.core?.health??'?'}/100</td>
                        <td>${s.core?.msgCount||0}/min</td>
                        <td>${totalLoops}</td>
                    </tr>`;
                }).join('');
                const html = `<!doctype html><html><head><meta charset="utf-8"/>
<title>Susanoo Bot Dashboard</title>
<meta http-equiv="refresh" content="5"/>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',monospace}
body{background:#0a0e1a;color:#e8eaf0;padding:20px;min-height:100vh}
.hdr{background:linear-gradient(135deg,#1a1f3a,#0f1428);padding:24px;border-radius:12px;border:1px solid #2a3050;margin-bottom:20px}
h1{font-size:28px;background:linear-gradient(90deg,#00d4ff,#7b2cff);-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:8px}
.sub{color:#7a8299;font-size:13px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px}
.stat{background:#11172a;border:1px solid #2a3050;padding:16px;border-radius:10px}
.stat .lbl{color:#7a8299;font-size:11px;text-transform:uppercase;letter-spacing:1px}
.stat .val{font-size:22px;font-weight:600;color:#00d4ff;margin-top:6px}
table{width:100%;background:#11172a;border-radius:10px;overflow:hidden;border:1px solid #2a3050;border-collapse:collapse}
th{background:#1a1f3a;padding:12px;text-align:left;font-size:12px;color:#7a8299;text-transform:uppercase;letter-spacing:1px}
td{padding:12px;border-top:1px solid #1a1f3a;font-size:13px}
tr:hover td{background:#161c34}
.badge{padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600}
.badge.ACTIVE{background:#0f3a1f;color:#22c55e}
.badge.RESTRICTED{background:#3a2f0f;color:#eab308}
.badge.DEAD,.badge.LOCKED{background:#3a0f0f;color:#ef4444}
.badge.PAIRING,.badge.IDLE{background:#0f1f3a;color:#3b82f6}
.foot{margin-top:20px;color:#7a8299;font-size:12px;text-align:center}
</style></head><body>
<div class="hdr">
  <h1>⚡ Susanoo Bot — Live Control Panel</h1>
  <div class="sub">Auto-refresh 5s • ${new Date().toLocaleString()}</div>
</div>
<div class="stats">
  <div class="stat"><div class="lbl">Sessions</div><div class="val">${all.length}</div></div>
  <div class="stat"><div class="lbl">Online</div><div class="val">${all.filter(s=>s.online).length}</div></div>
  <div class="stat"><div class="lbl">RAM (RSS)</div><div class="val">${ramMB} MB</div></div>
  <div class="stat"><div class="lbl">Heap</div><div class="val">${heapMB} MB</div></div>
  <div class="stat"><div class="lbl">Uptime</div><div class="val">${upStr}</div></div>
  <div class="stat"><div class="lbl">Node</div><div class="val">${process.version}</div></div>
</div>
<table>
  <thead><tr><th>Bot</th><th>Phone</th><th>State</th><th>Mode</th><th>Health</th><th>Rate</th><th>Loops</th></tr></thead>
  <tbody>${rows||'<tr><td colspan="7" style="text-align:center;color:#7a8299;padding:30px">No sessions yet</td></tr>'}</tbody>
</table>
<div class="foot">SmartCore Anti-Ban • Multi-Session Kernel • API: /api/status /api/bots /api/killall /api/setmode/{stealth|safe|fast|turbo}</div>
</body></html>`;
                res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
                res.end(html);
                return;
            } catch(e){
                res.writeHead(500, {'Content-Type':'text/plain'});
                res.end('dashboard err: '+(e?.message||e));
                return;
            }
        }

        res.setHeader('Content-Type','application/json');

        if(req.method==='GET' && url==='/api/status'){
            const all=hubRef.router.getAll();
            const data=all.map(s=>({
                id      : s.id,
                phone   : s.self?.split('@')[0]??null,
                state   : s.state,
                online  : s.online,
                health  : s.core.health,
                mode    : s.core.mode,
                msgMin  : s.core.msgCount,
                throttle: s.core.isThrottled(),
                fingerprint: s._fingerprint?.name??null
            }));
            res.writeHead(200);
            res.end(JSON.stringify({ok:true,sessions:data}));
            return;
        }

        if(req.method==='GET' && url==='/api/bots'){
            const all=hubRef.router.getAll();
            res.writeHead(200);
            res.end(JSON.stringify({ok:true,count:all.length,bots:all.map(s=>({id:s.id,state:s.state,online:s.online}))}));
            return;
        }

        if(req.method==='POST' && url==='/api/bypass'){
            const all=hubRef.router.getAll();
            let n=0;
            all.forEach(s=>{
                if(s.state===SESSION_STATE.RESTRICTED){
                    s.state=SESSION_STATE.ACTIVE;
                    s.core.health=Math.max(s.core.health,50);
                    n++;
                }
            });
            res.writeHead(200);
            res.end(JSON.stringify({ok:true,unblocked:n}));
            return;
        }

        const modeMatch = url.match(/^\/api\/setmode\/(stealth|safe|fast|turbo)$/);
        if(req.method==='POST' && modeMatch){
            const mode=modeMatch[1];
            hubRef.router.getAll().forEach(s=>s.core.setMode(mode));
            res.writeHead(200);
            res.end(JSON.stringify({ok:true,mode}));
            return;
        }

        if(req.method==='POST' && url==='/api/killall'){
            hubRef.router.getAll().forEach(s=>{
                for(const m of [s.nameLoops,s.wordLoop,s.flagLoop,s.emojiLoop,s.spamLoop,
                    s.swipeLoop,s.txtLoop,s.slideLoop,s.voiceLoop,s.imgLoop,s.gcnameLoop])
                    for(const [,v] of m){ if(typeof v==='object') Object.assign(v,{live:false,on:false}); }
            });
            res.writeHead(200);
            res.end(JSON.stringify({ok:true,msg:'all loops stopped'}));
            return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ok:false,error:'not found'}));
    });

    server.listen(API_PORT, ()=>{ logi('API',`HTTP control API listening on :${API_PORT}`); });
    server.on('error', e=>{ logw('API',`API server error: ${e.message}`); });
}

// ─────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────
console.log(`
¤═══¤۩❦۩════════════════════۩❦۩¤═══¤

  ⚡   𝐕𝐀𝐌𝐏𝐈𝐑𝐄  ʙᴏᴛ    v5     ⚡  [ANTI-BAN SAFE BUILD]

¤═══¤۩❦۩════════════════════۩❦۩¤═══¤

  fingerprint     :  Ubuntu Chrome — locked to Ubuntu identity for ALL sessions
  session lock    :  unique folder per bot — NEVER overwrite
  anti-replace    :  active phone registry — blocks duplicate login
  multi-session   :  up to ${MAX_SESSIONS_PER_PHONE} sessions per number safely
  login queue     :  ${LOGIN_QUEUE_MIN_MS/1000}–${LOGIN_QUEUE_MAX_MS/1000}s between new logins (anti-ban spacing)
  reconnect       :  ${RECONNECT_DELAY_MIN/1000}–${RECONNECT_DELAY_MAX/1000}s delay, exponential backoff + jitter
  max retries     :  unlimited soft retries — only 401 (banned) / 440 (replaced) stop session
  connect timeout :  ${CONNECT_TIMEOUT_MS/1000}s watchdog — auto-restart if stuck
  pairing         :  ${PAIR_DELAY_MS/1000}s delay, code requested ONCE (no retry spam)
  attack threads  :  ${THREADS_PER_ATTACK} per attack — reduced to prevent flood detection
  msg jitter      :  ${HUMAN_JITTER_MIN}–${HUMAN_JITTER_MAX}ms human-like delay between sends
  safety system   :  restriction auto-pause ${RESTRICTED_PAUSE/3600000}h + auto-resume
  geo/ip          :  IP mismatch → PAUSE bot (not reconnect)
  rate limit      :  exponential backoff (2min → 4min → 8min → max 30min)
  jitter          :  ${JITTER_MIN_MS}–${JITTER_MAX_MS}ms per send
  modes           :  stealth ${MODE_CAPS.stealth} | safe ${MODE_CAPS.safe} | fast ${MODE_CAPS.fast} | turbo ${MODE_CAPS.turbo} msg/min

  REASON CODES:
    replaced    →  440 — LOCKED (do NOT reconnect)
    banned      →  401 — DEAD  (do NOT reconnect)
    restricted  →  479/428/470/432 — pause ${RESTRICTED_PAUSE/3600000}h then retry
    retryable   →  515/408/503/502 — immediate retry (no DEAD)
    ip mismatch →  PAUSED 10min (warning only)

¤═══¤۩❦۩════════════════════۩❦۩¤═══¤
`);

// ─────────────────────────────────────────────
//  [NEW SYSTEMS] panels (.f1 / .nc / .fleet), fleet-wide engines (.fleetnc / .snc / .bonusnc),
//  health stat (.healthstat), per-chat task isolation, and self-healing watchdogs.
//  All wired onto Session.prototype so every existing instance + every new one inherits them
//  without touching the original constructor or boot path.
// ─────────────────────────────────────────────
globalThis.fleetNcLoops = globalThis.fleetNcLoops || new Map(); // chat → ctl
globalThis.bonusNcLoops = globalThis.bonusNcLoops || new Map();
globalThis.sncLoops     = globalThis.sncLoops     || new Map();

const _pickEmoji = (theme = null) => {
    const themes = theme ? [theme] : Object.keys(EMOJI_BANK);
    const t = themes[Math.floor(Math.random() * themes.length)];
    const arr = EMOJI_BANK[t] || EMOJI_BANK.fire;
    return arr[Math.floor(Math.random() * arr.length)];
};
const _pickWord = () => WORD_CYCLE[Math.floor(Math.random() * WORD_CYCLE.length)];
const _renderHealthBar = (pct, w = 14) => {
    const filled = Math.round(Math.max(0, Math.min(100, pct)) / 100 * w);
    return '█'.repeat(filled) + '░'.repeat(w - filled);
};
const _fmtMs = (ms) => {
    if (!ms || ms < 1000) return `${ms||0}ms`;
    const s = Math.floor(ms / 1000); if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ${s % 60}s`;
    const h = Math.floor(m / 60); return `${h}h ${m % 60}m`;
};

// ── PANEL: .f1 — formula-1 style live driver dashboard for the fleet
Session.prototype.handleF1Panel = async function (chat /*, body */) {
    try {
        const all = this.hub.router.getAll();
        const ranked = all.map(s => {
            const h = s.core?.health ?? 0;
            const m = (s.core?.mode || 'safe').toUpperCase();
            const r = s.core?.rateHits || 0;
            const score = Math.max(0, h - r * 8 + (m === 'SLOW' ? 10 : m === 'NORMAL' ? 5 : m === 'AGGRESSIVE' ? -10 : 0));
            return { s, h, m, r, score };
        }).sort((a, b) => b.score - a.score);
        const lines = ranked.map((x, i) => {
            const pos = String(i + 1).padStart(2, '0');
            const phone = x.s.self?.split('@')[0] || '—';
            const dot = x.s.online ? '🟢' : '🔴';
            return `  P${pos}  ${dot} ${x.s.id}  ${phone}\n        ❤${x.h} [${_renderHealthBar(x.h, 10)}] ${x.m}  rate:${x.r}  ▸ ${x.score.toFixed(0)}pts`;
        }).join('\n');
        await this.sendFast(chat,
            `${TAG}\n\n` +
            `🏁 𝐅𝟏  𝐂𝐎𝐍𝐓𝐑𝐎𝐋  𝐏𝐀𝐍𝐄𝐋\n` +
            `🤖 ${g('drivers')} : ${all.length}   🟢 ${ranked.filter(x => x.s.online).length}\n\n${lines}\n\n` +
            `🏆 ${g('pole')} : ${ranked[0]?.s.id || '—'}   ▸ score ${ranked[0]?.score.toFixed(0) || 0}`
        );
    } catch (e) { trackError('commands', e); }
};

// ── PANEL: .nc — list every nc-style attack engine + per-bot status
Session.prototype.handleNcPanel = async function (chat /*, body */) {
    try {
        const all = this.hub.router.getAll();
        const onln = all.filter(s => s.online).length;
        const ultra = (typeof ultraNcLoops !== 'undefined') ? ultraNcLoops.size : 0;
        const sas   = (typeof sasNcLoops   !== 'undefined') ? sasNcLoops.size   : 0;
        const trip  = (typeof tripleNcLoops!== 'undefined') ? tripleNcLoops.size: 0;
        const sp    = (typeof shadiPartyLoops !== 'undefined') ? shadiPartyLoops.size : 0;
        const fnc   = globalThis.fleetNcLoops.size;
        const snc   = globalThis.sncLoops.size;
        const bnc   = globalThis.bonusNcLoops.size;
        await this.sendFast(chat,
            `${TAG}\n\n` +
            `📡 𝐍𝐂  𝐂𝐎𝐌𝐌𝐀𝐍𝐃  𝐏𝐀𝐍𝐄𝐋\n` +
            `🤖 𝐅𝐥𝐞𝐞𝐭   ${onln}/${all.length}\n\n` +
            `▸ .ultranc       ${g('rapid mention spam')}        running:${ultra}\n` +
            `▸ .sasnc         ${g('vampire nc combo')}             running:${sas}\n` +
            `▸ .triple10      ${g('triple emoji burst')}          running:${trip}\n` +
            `▸ .shadiparty    ${g('multi-flow shadi blast')}      running:${sp}\n` +
            `▸ .fleetnc       ${g('all bots → same group')}       running:${fnc}\n` +
            `▸ .bonusnc       ${g('cosmic/fire bonus mode')}       running:${bnc}\n` +
            `▸ .snc           ${g('SUPER engine — full fleet')}   running:${snc}\n\n` +
            `📋 .stopfleetnc  .stopbonusnc  .stopsnc  .killall`
        );
    } catch (e) { trackError('commands', e); }
};

// ── PANEL: .fleet — full fleet status with mode/health/rate/uptime per bot
Session.prototype.handleFleetPanel = async function (chat /*, body */) {
    try {
        const all = this.hub.router.getAll();
        const lines = all.map(s => {
            const phone = s.self?.split('@')[0] || '—';
            const dot = s.online ? '🟢' : '🔴';
            const m = (s.core?.mode || 'safe').toUpperCase();
            const h = s.core?.health ?? 0;
            const r = s.core?.rateHits || 0;
            const up = s._connectedAt ? _fmtMs(Date.now() - s._connectedAt) : '—';
            return `  ${dot} ${s.id}  ${phone}\n      ❤${h} [${_renderHealthBar(h)}] ${m}  rate:${r}  up:${up}`;
        }).join('\n');
        const onln = all.filter(s => s.online).length;
        const totalRate = all.reduce((a, s) => a + (s.core?.rateHits || 0), 0);
        const avgH = all.length ? Math.round(all.reduce((a, s) => a + (s.core?.health || 0), 0) / all.length) : 0;
        await this.sendFast(chat,
            `${TAG}\n\n` +
            `🛰️  𝐅𝐋𝐄𝐄𝐓  𝐒𝐓𝐀𝐓𝐔𝐒\n` +
            `🤖 ${g('online')} ${onln}/${all.length}   ❤ ${g('avg')} ${avgH}   ⚠ ${g('rate hits')} ${totalRate}\n\n${lines}`
        );
    } catch (e) { trackError('commands', e); }
};

// ── ENGINE: .fleetnc — every online bot fires its own nc loop into the same chat in parallel
Session.prototype.handleFleetNc = async function (chat, body, who) {
    try {
        if (!chat.endsWith('@g.us')) { await this.sendFast(chat, `${TAG}\n\n⚠️ ${g('groups only')}`); return; }
        const existing = globalThis.fleetNcLoops.get(chat);
        if (existing?.on) { await this.sendFast(chat, `${TAG}\n\n⚠️ .fleetnc ${g('already running here')} — .stopfleetnc ${g('to stop')}`); return; }
        const target = (body.split(/\s+/)[1] || '').replace(/[^0-9]/g, '');
        const mention = target ? `${target}@s.whatsapp.net` : who;
        const ctl = { on: true, startedAt: Date.now(), sent: 0, errors: 0 };
        globalThis.fleetNcLoops.set(chat, ctl);
        registerChatLoop(chat, ctl);
        const fleet = this.hub.router.getAll().filter(s => s.online && s.socket);
        await this.sendFast(chat, `${TAG}\n\n🚀 .fleetnc ▸ ${g('engaging')} ${fleet.length} ${g('bots on')} @${mention.split('@')[0]}`, [mention]);
        for (const s of fleet) {
            (async () => {
                while (ctl.on && s.online && s.socket) {
                    try {
                        const txt = `${_pickEmoji()} @${mention.split('@')[0]} ${_pickWord()} ${_pickEmoji('fire')}`;
                        await s.sendFast(chat, txt, [mention]);
                        ctl.sent++;
                    } catch (e) { ctl.errors++; if (!_isSuppressedErr(e)) trackError('loops', e); }
                    await new Promise(r => setTimeout(r, 1100 + Math.random() * 900));
                }
            })().catch(() => {});
        }
    } catch (e) { trackError('commands', e); }
};
Session.prototype.handleStopFleetNc = async function (chat) {
    const ctl = globalThis.fleetNcLoops.get(chat);
    if (!ctl) { await this.sendFast(chat, `${TAG}\n\n⚠️ .fleetnc ${g('not running')}`); return; }
    ctl.on = false; globalThis.fleetNcLoops.delete(chat); unregisterChatLoop(chat, ctl);
    const dur = _fmtMs(Date.now() - ctl.startedAt);
    await this.sendFast(chat, `${TAG}\n\n🛑 .fleetnc ${g('stopped')} ▸ sent:${ctl.sent}  err:${ctl.errors}  dur:${dur}`);
};

// ── ENGINE: .bonusnc cosmic|fire — bonus pack with themed glyphs + extra fleet width
Session.prototype.handleBonusNc = async function (chat, body, who) {
    try {
        if (!chat.endsWith('@g.us')) { await this.sendFast(chat, `${TAG}\n\n⚠️ ${g('groups only')}`); return; }
        const existing = globalThis.bonusNcLoops.get(chat);
        if (existing?.on) { await this.sendFast(chat, `${TAG}\n\n⚠️ .bonusnc ${g('already running')} — .stopbonusnc`); return; }
        const args = body.split(/\s+/).slice(1);
        const flavor = (args[0] || 'cosmic').toLowerCase();
        const target = (args[1] || '').replace(/[^0-9]/g, '');
        const mention = target ? `${target}@s.whatsapp.net` : who;
        const themes = flavor === 'fire' ? ['fire', 'dark', 'crystals'] : ['cosmic', 'crystals', 'cyber'];
        const ctl = { on: true, startedAt: Date.now(), sent: 0, errors: 0, flavor };
        globalThis.bonusNcLoops.set(chat, ctl);
        registerChatLoop(chat, ctl);
        const fleet = this.hub.router.getAll().filter(s => s.online && s.socket);
        await this.sendFast(chat, `${TAG}\n\n🎁 .bonusnc[${flavor}] ▸ ${g('starting on')} @${mention.split('@')[0]} (${fleet.length} ${g('bots')})`, [mention]);
        for (const s of fleet) {
            (async () => {
                while (ctl.on && s.online && s.socket) {
                    try {
                        const e1 = _pickEmoji(themes[0]);
                        const e2 = _pickEmoji(themes[1]);
                        const e3 = _pickEmoji(themes[2]);
                        const txt = `${e1}${e2}${e3} @${mention.split('@')[0]} ${_pickWord()} ${e3}${e2}${e1}`;
                        await s.sendFast(chat, txt, [mention]);
                        ctl.sent++;
                    } catch (e) { ctl.errors++; if (!_isSuppressedErr(e)) trackError('loops', e); }
                    await new Promise(r => setTimeout(r, 950 + Math.random() * 850));
                }
            })().catch(() => {});
        }
    } catch (e) { trackError('commands', e); }
};
Session.prototype.handleStopBonusNc = async function (chat) {
    const ctl = globalThis.bonusNcLoops.get(chat);
    if (!ctl) { await this.sendFast(chat, `${TAG}\n\n⚠️ .bonusnc ${g('not running')}`); return; }
    ctl.on = false; globalThis.bonusNcLoops.delete(chat); unregisterChatLoop(chat, ctl);
    const dur = _fmtMs(Date.now() - ctl.startedAt);
    await this.sendFast(chat, `${TAG}\n\n🛑 .bonusnc ${g('stopped')} ▸ sent:${ctl.sent}  err:${ctl.errors}  dur:${dur}`);
};

// ── PANEL: .healthstat — live error stats + per-error-kind counters + last fault
Session.prototype.handleHealthStat = async function (chat) {
    try {
        const e = _errorStats;
        const all = this.hub.router.getAll();
        const onln = all.filter(s => s.online).length;
        const memMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
        const heapMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        const cpuPct = _cpuPercent().toFixed(1);
        const upS = _fmtMs(process.uptime() * 1000);
        const last = e.lastErr ? `${e.lastErr.kind}: ${e.lastErr.msg}` : 'none';
        const lastAgo = e.lastErr ? _fmtMs(Date.now() - e.lastErr.at) + ' ago' : '—';
        await this.sendFast(chat,
            `${TAG}\n\n` +
            `🏥 𝐇𝐄𝐀𝐋𝐓𝐇  𝐒𝐓𝐀𝐓\n\n` +
            `🤖 ${g('fleet')}      ${onln}/${all.length} ${g('online')}\n` +
            `⏱️  ${g('uptime')}     ${upS}\n` +
            `🧠 ${g('ram')}        ${memMB} MB rss / ${heapMB} MB heap\n` +
            `📊 ${g('cpu')}        ${cpuPct}%\n\n` +
            `❌ 𝐄𝐑𝐑𝐎𝐑𝐒\n` +
            `   commands  ${e.commands}\n` +
            `   loops     ${e.loops}\n` +
            `   send      ${e.send}\n` +
            `   uncaught  ${e.uncaught}\n` +
            `   unhandled ${e.unhandled}\n` +
            `   ▸ total   ${e.total}\n\n` +
            `🩸 ${g('last fault')}  ${last}  (${lastAgo})`
        );
    } catch (err) { trackError('commands', err); }
};

// ── ENGINE: .snc — SUPER fleet engine: every online bot runs ultranc + triple10 hybrid
//    (fast mention burst + triple-emoji storm) into the same chat at once. Highest throughput.
Session.prototype.handleSnc = async function (chat, body, who) {
    try {
        if (!chat.endsWith('@g.us')) { await this.sendFast(chat, `${TAG}\n\n⚠️ ${g('groups only')}`); return; }
        const existing = globalThis.sncLoops.get(chat);
        if (existing?.on) { await this.sendFast(chat, `${TAG}\n\n⚠️ .snc ${g('already running here')} — .stopsnc`); return; }
        const target = (body.split(/\s+/)[1] || '').replace(/[^0-9]/g, '');
        const mention = target ? `${target}@s.whatsapp.net` : who;
        const ctl = { on: true, startedAt: Date.now(), sent: 0, errors: 0 };
        globalThis.sncLoops.set(chat, ctl);
        registerChatLoop(chat, ctl);
        const fleet = this.hub.router.getAll().filter(s => s.online && s.socket);
        await this.sendFast(chat,
            `${TAG}\n\n` +
            `💥 .snc ▸ 𝐒𝐔𝐏𝐄𝐑  𝐍𝐂  𝐄𝐍𝐆𝐈𝐍𝐄  𝐎𝐍𝐋𝐈𝐍𝐄\n` +
            `🤖 ${fleet.length} ${g('bots locked on')} @${mention.split('@')[0]}\n` +
            `⚡ ${g('mode')} : ultranc + triple10 hybrid`,
            [mention]
        );
        // Two parallel waves per bot: ultra-style (single emoji + word) and triple10-style (3 emojis)
        for (const s of fleet) {
            // ultra wave
            (async () => {
                while (ctl.on && s.online && s.socket) {
                    try {
                        const txt = `${_pickEmoji('fire')} @${mention.split('@')[0]} ${_pickWord()}`;
                        await s.sendFast(chat, txt, [mention]); ctl.sent++;
                    } catch (e) { ctl.errors++; if (!_isSuppressedErr(e)) trackError('loops', e); }
                    await new Promise(r => setTimeout(r, 850 + Math.random() * 600));
                }
            })().catch(() => {});
            // triple10 wave
            (async () => {
                while (ctl.on && s.online && s.socket) {
                    try {
                        const e1 = _pickEmoji('cyber'), e2 = _pickEmoji('cosmic'), e3 = _pickEmoji('dark');
                        const txt = `${e1}${e2}${e3}${e1}${e2}${e3}${e1}${e2}${e3}${e1} @${mention.split('@')[0]}`;
                        await s.sendFast(chat, txt, [mention]); ctl.sent++;
                    } catch (e) { ctl.errors++; if (!_isSuppressedErr(e)) trackError('loops', e); }
                    await new Promise(r => setTimeout(r, 1200 + Math.random() * 700));
                }
            })().catch(() => {});
        }
    } catch (e) { trackError('commands', e); }
};
Session.prototype.handleStopSnc = async function (chat) {
    const ctl = globalThis.sncLoops.get(chat);
    if (!ctl) { await this.sendFast(chat, `${TAG}\n\n⚠️ .snc ${g('not running')}`); return; }
    ctl.on = false; globalThis.sncLoops.delete(chat); unregisterChatLoop(chat, ctl);
    const dur = _fmtMs(Date.now() - ctl.startedAt);
    await this.sendFast(chat, `${TAG}\n\n🛑 .snc ${g('stopped')} ▸ sent:${ctl.sent}  err:${ctl.errors}  dur:${dur}`);
};

// ─────────────────────────────────────────────
//  SELF-HEALING WATCHDOGS — keep the kernel alive forever
//  - heartbeat: log every 60s so we know the event loop isn't frozen
//  - mem watchdog: force GC + warn if rss > 1.6 GB
//  - cpu watchdog: warn on sustained >85% CPU
//  - loop watchdog: drains any chatTask whose lastCmdAt is older than 30min and is "stuck"
//  - heal: if a session has been offline > 5min, kick its self.boot() to re-open the socket
// ─────────────────────────────────────────────
let _lastHeartbeat = Date.now();
setInterval(() => {
    const now = Date.now();
    const drift = now - _lastHeartbeat - 60_000;
    _lastHeartbeat = now;
    if (drift > 5_000) logWarn('HEARTBEAT', `event-loop drift ${drift}ms (possible stall)`);
    else logDebug('HEARTBEAT', `ok drift=${drift}ms`);
}, 60_000).unref?.();

let _highCpuStreak = 0;
setInterval(() => {
    try {
        const rssMB = process.memoryUsage().rss / 1024 / 1024;
        if (rssMB > 1600) {
            logWarn('MEM-WD', `high RSS ${rssMB.toFixed(0)}MB — forcing gc + cache trims`);
            try { if (global.gc) global.gc(); } catch {}
            try {
                if (_welcomeMetaCache.size > 50) _welcomeMetaCache.clear();
                if (_welcomeFiredCache.size > 500) _welcomeFiredCache.clear();
                if (_welcomeLock.size > 1000) _welcomeLock.clear();
            } catch {}
        }
        const cpu = _cpuPercent();
        if (cpu > 85) { _highCpuStreak++; if (_highCpuStreak >= 3) logWarn('CPU-WD', `sustained CPU ${cpu.toFixed(1)}% (${_highCpuStreak} samples)`); }
        else _highCpuStreak = 0;
    } catch (e) { trackError('loops', e); }
}, 30_000).unref?.();

setInterval(() => {
    try {
        const now = Date.now();
        for (const [chatId, t] of chatTasks) {
            if (t.loops.size === 0 && now - (t.lastCmdAt || 0) > 30 * 60_000) chatTasks.delete(chatId);
        }
    } catch {}
}, 5 * 60_000).unref?.();

setInterval(() => {
    try {
        const ref = globalThis.__hubRef;
        if (!ref?.router?.getAll) return;
        for (const s of ref.router.getAll()) {
            if (s.online) continue;
            if (s.state === SESSION_STATE.DEAD || s.state === SESSION_STATE.LOCKED) continue;
            const since = s._lastDownAt || s._connectedAt || 0;
            if (since && (Date.now() - since) > 5 * 60_000) {
                if (s._healingNow) continue;
                // FIX: session watchdog — share the 60s cooldown stamp with deadman/hb-sweep
                if (Date.now() - (s._lastWatchdogKickAt || 0) < 60_000) continue;
                s._lastWatchdogKickAt = Date.now();
                s._healingNow = true;
                logWarn('HEAL', `session ${s.id} offline > 5min — kicking init()`);
                Promise.resolve().then(() => s.init && s.init()).catch(e => trackError('uncaught', e)).finally(() => { s._healingNow = false; });
            }
        }
    } catch (e) { trackError('loops', e); }
}, 60_000).unref?.();

// FIX: welcome — single shared handler used by both event paths (group-participants.update
// + messageStubType fallback). Uses the global cross-bot dedupe lock so the card fires
// EXACTLY ONCE per (chat, jid) regardless of which bot/event delivered the join first.
// Also detects HOW the user came in (admin add / user add / self-join / invite).
Session.prototype._fireWelcome = async function (ev) {
    try {
        if (!ev || ev.action !== 'add') return;
        const chat = ev.id;
        if (!chat?.endsWith('@g.us')) return;
        if (!Array.isArray(userData.welcomeGroups) || !userData.welcomeGroups.includes(chat)) return;
        if (!this.socket || !this.online) return;
        const groupName = await _getGroupName(this.socket, chat);
        const now  = new Date();
        const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const date = now.toLocaleDateString('en-GB');
        const selfBare = (this.self || '').split('@')[0];
        // Detect actor + admin status ONCE per event (cheap groupMetadata cache hit)
        let adminSet = null;
        try {
            const meta = await this.socket.groupMetadata(chat).catch(()=>null);
            if (meta?.participants) {
                adminSet = new Set(meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id));
            }
        } catch {}
        const actor = ev.author || null;
        for (const jid of (ev.participants || [])) {
            if (!jid) continue;
            if (jid.endsWith('@lid')) continue;
            if (jid.includes('broadcast')) continue;
            if (jid.split('@')[0] === selfBare) continue;
            const lockKey = `${chat}::${jid}`;
            const nowMs   = Date.now();
            const exp     = _welcomeLock.get(lockKey) || 0;
            if (exp > nowMs) continue;                                  // already greeted
            _welcomeLock.set(lockKey, nowMs + WELCOME_DEDUPE_MS);       // claim
            const mention = jid.split('@')[0];
            // Build join-source line
            let joinLine = '🪪 𝐢𝐧𝐯𝐢𝐭𝐞 𝐥𝐢𝐧𝐤';
            if (actor) {
                const actorBare = actor.split('@')[0];
                if (actorBare === jid.split('@')[0])     joinLine = '🚪 𝐬𝐞𝐥𝐟-𝐣𝐨𝐢𝐧𝐞𝐝';
                else if (adminSet && adminSet.has(actor)) joinLine = `👑 𝐚𝐝𝐝𝐞𝐝 𝐛𝐲 𝐚𝐝𝐦𝐢𝐧 @${actorBare}`;
                else                                      joinLine = `👤 𝐚𝐝𝐝𝐞𝐝 𝐛𝐲 𝐮𝐬𝐞𝐫 @${actorBare}`;
            }
            const card     = WELCOME_CARD({ mention, groupName, time, date, joinLine });
            const mentions = actor && actor !== jid ? [jid, actor] : [jid];
            try {
                const imgBuf = getPanelImage('welcome', chat);
                if (imgBuf) {
                    await this.socket.sendMessage(chat, { image: imgBuf, caption: card, mimetype: 'image/jpeg', mentions });
                } else {
                    await this.socket.sendMessage(chat, { text: card, mentions });
                }
                logInfo(this.id, `welcome → ${groupName} (+${mention})`);
            } catch (e) {
                if (_isSuppressedErr(e)) { _bumpDecryptErr(this.id, this.socket); continue; }
                _welcomeLock.delete(lockKey);                           // release claim — let another bot try
                trackError('send', e);
            }
        }
    } catch (e) { if (!_isSuppressedErr(e)) trackError('commands', e); }
};

// FIX: goodbye — mirror of _fireWelcome for leave/kick events. Same dedupe lock pattern.
const _goodbyeLock = new Map();
setInterval(() => { const now = Date.now(); for (const [k,e] of _goodbyeLock) if (e < now) _goodbyeLock.delete(k); }, 60_000).unref?.();
Session.prototype._fireGoodbye = async function (ev) {
    try {
        if (!ev || (ev.action !== 'remove' && ev.action !== 'leave')) return;
        const chat = ev.id;
        if (!chat?.endsWith('@g.us')) return;
        if (!Array.isArray(userData.welcomeGroups) || !userData.welcomeGroups.includes(chat)) return;
        if (!this.socket || !this.online) return;
        const groupName = await _getGroupName(this.socket, chat);
        const now  = new Date();
        const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const date = now.toLocaleDateString('en-GB');
        const selfBare = (this.self || '').split('@')[0];
        let adminSet = null;
        try {
            const meta = await this.socket.groupMetadata(chat).catch(()=>null);
            if (meta?.participants) {
                adminSet = new Set(meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id));
            }
        } catch {}
        const actor = ev.author || null;
        for (const jid of (ev.participants || [])) {
            if (!jid) continue;
            if (jid.endsWith('@lid')) continue;
            if (jid.includes('broadcast')) continue;
            if (jid.split('@')[0] === selfBare) continue;
            const lockKey = `${chat}::${jid}::leave`;
            const nowMs   = Date.now();
            const exp     = _goodbyeLock.get(lockKey) || 0;
            if (exp > nowMs) continue;
            _goodbyeLock.set(lockKey, nowMs + WELCOME_DEDUPE_MS);
            const mention = jid.split('@')[0];
            let leaveLine = '🚪 𝐥𝐞𝐟𝐭 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩';
            if (actor) {
                const actorBare = actor.split('@')[0];
                if (actorBare === jid.split('@')[0])     leaveLine = '🚪 𝐥𝐞𝐟𝐭 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩';
                else if (adminSet && adminSet.has(actor)) leaveLine = `🦶 𝐤𝐢𝐜𝐤𝐞𝐝 𝐛𝐲 𝐚𝐝𝐦𝐢𝐧 @${actorBare}`;
                else                                      leaveLine = `❌ 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐛𝐲 @${actorBare}`;
            }
            const card     = GOODBYE_CARD({ mention, groupName, time, date, leaveLine });
            const mentions = actor && actor !== jid ? [jid, actor] : [jid];
            try {
                const imgBuf = getPanelImage('goodbye', chat);
                if (imgBuf) {
                    await this.socket.sendMessage(chat, { image: imgBuf, caption: card, mimetype: 'image/jpeg', mentions });
                } else {
                    await this.socket.sendMessage(chat, { text: card, mentions });
                }
                logInfo(this.id, `goodbye → ${groupName} (-${mention})`);
            } catch (e) {
                if (_isSuppressedErr(e)) { _bumpDecryptErr(this.id, this.socket); continue; }
                _goodbyeLock.delete(lockKey);
                trackError('send', e);
            }
        }
    } catch (e) { if (!_isSuppressedErr(e)) trackError('commands', e); }
};

// FEATURE: _sendPanelCard — text-only panels (atkpanel/triplepanel/vampirencpanel/
// ncpanel/funpanel/tagpanel/syspanel/broadcast) only become image cards if the
// owner has saved a custom image for that slot via .saveimg. No custom image →
// stays pure text (sendFast). Falls back to text on any send error.
Session.prototype._sendPanelCard = async function (chat, slot, text, mentions = []) {
    try {
        const buf = getCustomPanelImage(slot, chat);
        if (buf && this.socket && this.online) {
            try {
                await this.socket.sendMessage(chat, { image: buf, caption: text, mimetype: 'image/jpeg', ...(mentions.length ? { mentions } : {}) });
                return;
            } catch (e) {
                if (_isSuppressedErr(e)) _bumpDecryptErr(this.id, this.socket);
            }
        }
    } catch {}
    try { await this.sendFast(chat, text, mentions); } catch {}
};

// FIX: sessions — global cross-fleet heartbeat sweep every 15s.
// User contract: "koi bhi session automatically dead nahi hoga kabhi bhi, hamesha active rahega."
// 1) RESTRICTED sessions are skipped (their own timer revives them on schedule).
// 2) DEAD / LOCKED — should never happen anymore, but if any code path leaks one,
//    we forcibly flip it back to ACTIVE and re-init so the fleet can NEVER stay dead.
// 3) Any session whose socket went silent >90s also gets a forced re-init.
setInterval(() => {
    try {
        const ref = globalThis.__hubRef;
        const all = ref?.router?.getAll?.() || [];
        const now = Date.now();
        for (const s of all) {
            if (!s) continue;
            if (s.state === SESSION_STATE.RESTRICTED) continue;
            // FIX: session watchdog — never act on a session that's currently pairing
            // or already mid-reconnect (covers both watchdog-initiated and natural retries).
            if (s._initLocked || s._reconnecting || s._pairingActive) continue;
            // SAFETY NET: revive any session that ever got marked DEAD/LOCKED
            if (s.state === SESSION_STATE.DEAD || s.state === SESSION_STATE.LOCKED) {
                logw(s.id, `[REVIVE] state was ${s.state} — forcing back to ACTIVE (sessions never die)`);
                s.state = SESSION_STATE.ACTIVE;
                s.retryCount = 0;
            }
            // FIX: session watchdog — shared 60s cooldown across deadman / heal / hb-sweep
            // so any one offline session can't be init()-spammed every 15s by this trio.
            if (now - (s._lastWatchdogKickAt || 0) < 60_000) continue;
            const since = now - (s._lastHeartbeatOk || 0);
            const stale = !s.online || (s._lastHeartbeatOk && since > 90_000);
            if (!stale) continue;
            s._lastWatchdogKickAt = now;
            s._reconnecting = true;
            setImmediate(async () => {
                try { s.socket?.end?.(new Error('hb-sweep-revive')); } catch {}
                await delay(1500);
                s._reconnecting = false;
                try { s.init(); } catch (e) { if (!_isSuppressedErr(e)) loge(s.id, `hb-sweep err: ${e?.message || e}`); }
            });
        }
    } catch {}
}, 15_000).unref?.();

const hub = new Hub();
globalThis.__hubRef = hub;
startApiServer(hub);
hub.boot();
