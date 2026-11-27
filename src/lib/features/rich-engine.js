/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../../config.js";

const DEFAULT_BOT_JID = "867051314767696@bot";
const CAPABILITIES = [34, 58, 29, 1, 67, 60, 55, 8];

const hex = (n) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const randomResponseId = () =>
  `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;

const safeJson = (obj) =>
  JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028|\u2029/g, "");

const escapeHtml = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]
  );

// Tema Ai Miku: Sakura Rose-Pink (#f472b6), Astral Violet (#c084fc), Crystal Obsidian (#120c1c)
const MIKU_BASE_CSS = String.raw`
:root{
  --bg:#120c1c;
  --card:#1d142c;
  --card2:#281c3d;
  --ink:#fdf4ff;
  --soft:#d4bfe8;
  --line:#3f2b5c;
  --acc:#f472b6;
  --acc2:#c084fc;
  --warn:#fbbf24;
  --red:#fb7185;
  --blue:#818cf8;
  --sys:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{background:transparent;color:var(--ink);font-family:var(--sys);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
.stage{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:14px 10px;}
.app{
  width:100%;max-width:100%;border-radius:14px;overflow:hidden;position:relative;
  background:radial-gradient(circle at 85% 0%,rgba(244,114,182,.22) 0%,transparent 48%),
             radial-gradient(circle at 10% 100%,rgba(192,132,252,.18) 0%,transparent 52%),
             linear-gradient(180deg,#251738 0%,#171024 40%,var(--bg) 100%);
  border:1px solid rgba(244,114,182,.28);
  box-shadow:0 18px 44px rgba(8,4,16,.68), inset 0 1px 0 rgba(255,255,255,.08);
  padding:14px 12px 16px;
}
.top{display:flex;align-items:center;gap:9px;margin-bottom:12px;}
.logo{
  width:32px;height:32px;border-radius:10px;
  background:linear-gradient(135deg,#f472b6 0%,#a855f7 100%);
  color:#fff;flex:none;display:flex;align-items:center;justify-content:center;
  font-size:16px;box-shadow:0 4px 14px rgba(244,114,182,.35);
}
.meta{min-width:0;flex:1;}
.title{font-size:14.5px;font-weight:800;letter-spacing:.2px;color:#fff;}
.sub{font-size:10.5px;color:var(--soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;}
.chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:8px;scrollbar-width:none;}
.chips::-webkit-scrollbar{display:none;}
.chip{flex:none;border:1px solid var(--line);background:var(--card);color:var(--soft);border-radius:20px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;transition:.15s;}
.chip.on{background:linear-gradient(135deg,#f472b6,#a855f7);border-color:#f472b6;color:#fff;box-shadow:0 4px 12px rgba(244,114,182,.3);}
.btn{border:0;border-radius:11px;padding:10px 12px;font-size:13px;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#f472b6,#a855f7);color:#fff;box-shadow:0 4px 12px rgba(168,85,247,.25);}
.btn.alt{background:var(--card2);color:var(--ink);border:1px solid var(--line);box-shadow:none;}
.btn.red{background:linear-gradient(135deg,#fb7185,#e11d48);color:#fff;}
.inp{width:100%;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:10px 12px;color:var(--ink);font-size:14px;outline:none;font-family:var(--sys);}
.inp:focus{border-color:var(--acc);box-shadow:0 0 0 2px rgba(244,114,182,.2);}
.hide{display:none!important;}
`;


const THEME_PALETTES = {
  casino:  { bg:"#071b13", card:"#0d291e", card2:"#133829", ink:"#ecfdf5", soft:"#a7f3d0", line:"#1d4d3a", acc:"#10b981", acc2:"#059669", btnText:"#041a11", g1:"rgba(16,185,129,.18)", g2:"rgba(251,191,36,.12)", top:"#0d2b1f" },
  board:   { bg:"#171310", card:"#231d18", card2:"#2f261f", ink:"#fefce8", soft:"#d6c7b2", line:"#44372c", acc:"#d97706", acc2:"#b45309", btnText:"#fff",    g1:"rgba(217,119,6,.18)",  g2:"rgba(245,158,11,.12)", top:"#261e17" },
  arcade:  { bg:"#0b1120", card:"#131c31", card2:"#1b2744", ink:"#f8fafc", soft:"#94a3b8", line:"#273659", acc:"#38bdf8", acc2:"#0284c7", btnText:"#041524", g1:"rgba(56,189,248,.18)", g2:"rgba(34,197,94,.12)",  top:"#111b33" },
  snake:   { bg:"#081a10", card:"#10291b", card2:"#173826", ink:"#f0fdf4", soft:"#86efac", line:"#1f4d34", acc:"#22c55e", acc2:"#16a34a", btnText:"#052e16", g1:"rgba(34,197,94,.18)",  g2:"rgba(239,68,68,.10)",  top:"#0e2618" },
  amber:   { bg:"#1c1712", card:"#29221a", card2:"#382e23", ink:"#fffbeb", soft:"#d6c5ae", line:"#4d3f30", acc:"#f59e0b", acc2:"#d97706", btnText:"#1c1205", g1:"rgba(245,158,11,.18)", g2:"rgba(234,88,12,.12)",  top:"#2a2117" },
  puzzle:  { bg:"#0f172a", card:"#18243d", card2:"#213052", ink:"#f8fafc", soft:"#94a3b8", line:"#30436e", acc:"#3b82f6", acc2:"#2563eb", btnText:"#fff",    g1:"rgba(59,130,246,.18)", g2:"rgba(99,102,241,.12)", top:"#16223b" },
  rpg:     { bg:"#121024", card:"#1b1836", card2:"#26214a", ink:"#f5f3ff", soft:"#c4b5fd", line:"#3b336e", acc:"#f59e0b", acc2:"#d97706", btnText:"#1a1102", g1:"rgba(245,158,11,.16)", g2:"rgba(99,102,241,.18)", top:"#1d183b" },
  noir:    { bg:"#140e10", card:"#211619", card2:"#2e1e23", ink:"#fef2f2", soft:"#fca5a5", line:"#4a2b33", acc:"#ef4444", acc2:"#dc2626", btnText:"#fff",    g1:"rgba(239,68,68,.18)",  g2:"rgba(249,115,22,.10)", top:"#241519" },
  teal:    { bg:"#091a1d", card:"#10292e", card2:"#173940", ink:"#f0fdfa", soft:"#99f6e4", line:"#204f58", acc:"#14b8a6", acc2:"#0d9488", btnText:"#042f2e", g1:"rgba(20,184,166,.18)", g2:"rgba(245,158,11,.12)", top:"#0e262b" },
  sky:     { bg:"#081024", card:"#101c3b", card2:"#172852", ink:"#f0f9ff", soft:"#bae6fd", line:"#243c73", acc:"#38bdf8", acc2:"#0ea5e9", btnText:"#041a2b", g1:"rgba(56,189,248,.18)", g2:"rgba(251,191,36,.14)", top:"#0e1a38" },
  studio:  { bg:"#131418", card:"#1d1f26", card2:"#272a33", ink:"#f8fafc", soft:"#a1a1aa", line:"#343845", acc:"#f59e0b", acc2:"#d97706", btnText:"#141004", g1:"rgba(245,158,11,.12)", g2:"rgba(99,102,241,.10)", top:"#1c1e24" },
};

function buildGameBaseCss(themeKey = "arcade") {
  const t = THEME_PALETTES[themeKey] || THEME_PALETTES.arcade;
  return `
:root{
  --bg:${t.bg};--card:${t.card};--card2:${t.card2};--ink:${t.ink};--soft:${t.soft};
  --line:${t.line};--acc:${t.acc};--acc2:${t.acc2};--warn:#fbbf24;--red:#ef4444;--blue:#3b82f6;
  --sys:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{background:transparent;color:var(--ink);font-family:var(--sys);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
.stage{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:0;width:100%;}
.app{
  width:100%;max-width:100%;border-radius:14px;overflow:hidden;position:relative;
  background:radial-gradient(circle at 85% 0%,${t.g1} 0%,transparent 48%),
             radial-gradient(circle at 10% 100%,${t.g2} 0%,transparent 52%),
             linear-gradient(180deg,${t.top} 0%,${t.bg} 100%);
  border:1px solid ${t.line};
  box-shadow:0 16px 36px rgba(0,0,0,.6);
  padding:10px;
}
.top{display:flex;align-items:center;gap:9px;margin-bottom:10px;}
.logo{
  width:32px;height:32px;border-radius:10px;
  background:linear-gradient(135deg,${t.acc},${t.acc2});
  color:${t.btnText};flex:none;display:flex;align-items:center;justify-content:center;
  font-size:16px;
}
.meta{min-width:0;flex:1;}
.title{font-size:14.5px;font-weight:800;letter-spacing:.2px;color:var(--ink);}
.sub{font-size:10.5px;color:var(--soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;}
.chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:8px;scrollbar-width:none;}
.chips::-webkit-scrollbar{display:none;}
.chip{flex:none;border:1px solid var(--line);background:var(--card);color:var(--soft);border-radius:20px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;}
.chip.on{background:var(--acc);border-color:var(--acc);color:${t.btnText};}
.btn{border:0;border-radius:10px;padding:10px 12px;font-size:13px;font-weight:800;cursor:pointer;background:linear-gradient(135deg,${t.acc},${t.acc2});color:${t.btnText};}
.btn.alt{background:var(--card2);color:var(--ink);border:1px solid var(--line);}
.btn.red{background:#ef4444;color:#fff;}
.inp{width:100%;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px;color:var(--ink);font-size:14px;outline:none;font-family:var(--sys);}
.inp:focus{border-color:var(--acc);}
.box{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px;}
.row{display:flex;gap:8px;align-items:center;}
.muted{color:var(--soft);font-size:11px;}
.hide{display:none!important;}
`;
}

function pickThemeForGame(keys = []) {
  const joined = keys.join(" ").toLowerCase();
  if (/bj|poker|ceme|gaple|uno/.test(joined)) return "casino";
  if (/catur|chess|dam|othello|monopoli|ludo|ulartangga|ttc/.test(joined)) return "board";
  if (/isekai/.test(joined)) return "rpg";
  if (/mafia|undercover/.test(joined)) return "noir";
  if (/wordle|mines|memory|typing|sudoku/.test(joined)) return "puzzle";
  return "arcade";
}

function rebrandHtml(html) {
  if (typeof html !== "string") return html;
  return html
    .replace(/Kaguya\s*MD|Kaguya\s*Multi\s*Device|Kaguya/gi, "Ai Miku")
    .replace(/YannRzy\s*Tech|YannRzy/gi, "Arthazy")
    .replace(/HutaoMD/gi, "Miku");
}

function buildRichHtmlPayload(html, title = "Miku Arcade", opts = {}) {
  const q = opts.quoted;
  const qKey = q?.key || q?.raw?.key;
  const qMsg = q?.message || q?.raw?.message;
  const qCtx =
    qKey?.id && qMsg
      ? {
          stanzaId: qKey.id,
          participant: qKey.participant || q?.sender || qKey.remoteJid,
          remoteJid: q?.chat || qKey.remoteJid,
          quotedMessage: qMsg,
        }
      : {};

  const finalHtml = rebrandHtml(html);

  return {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      botMetadata: {
        capabilityMetadata: { capabilities: CAPABILITIES },
      },
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [{ messageType: 2, messageText: title }],
          unifiedResponse: {
            data: Buffer.from(
              JSON.stringify({
                response_id: randomResponseId(),
                sections: [
                  {
                    view_model: {
                      primitive: {
                        __typename: "GenAIaeacdsnwHtmlPrimitive",
                        payload: finalHtml,
                        trusted_sources: [],
                      },
                      __typename: "GenAISingleLayoutViewModel",
                    },
                  },
                ],
              })
            ).toString("base64"),
          },
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: DEFAULT_BOT_JID },
            forwardOrigin: 4,
            ...qCtx,
          },
        },
      },
    },
  };
}

async function sendHtmlCard(sock, m, html, title, emoji = "✨", opts = {}) {
  try {
    await sock.relayMessage(m.chat, buildRichHtmlPayload(html, title, opts), {});
    try {
      await sock.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    } catch {}
    return true;
  } catch (err) {
    console.error(`[MIKU-RICH:${title}] gagal kirim:`, err.message);
    await sock.sendMessage(
      m.chat,
      {
        text: "❌ No se pudo enviar la tarjeta interactiva. Esta función necesita la versión más reciente de WhatsApp.",
      },
      { quoted: m }
    );
    return false;
  }
}

const mikuHtmlCardModule = {
  buildRichHtmlPayload,
  sendHtmlCard,
  safeJson,
  escapeHtml,
  BASE_CSS: MIKU_BASE_CSS,
};

const dquoteModule = {
  quoteOf: (q) => {
    try {
      return q && (q.key || q.raw?.key) && (q.message || q.raw?.message)
        ? q
        : null;
    } catch {
      return null;
    }
  },
  apply: (o) => o,
  enabled: () => false,
};

const styleModule = {
  B: {
    box: (title, lines = []) =>
      `╭─── ❖ 『 ✨ *${title}* 』 ❖\n` +
      lines.map((l) => `│ ${l}`).join("\n") +
      `\n╰──────────────────────────❖`,
    err: (msg) => `❌ ${msg}`,
    ok: (msg) => `✅ ${msg}`,
  },
};

/**
 * Eksekutor modul game HTML live dengan resolver internal & tema Ai Miku.
 */
function createRichRunner(libs = {}, featureFn) {
  let cachedMod = null;

  function loadModule() {
    if (cachedMod) return cachedMod;
    const resolvedCache = {};

    const localRequire = (spec) => {
      const clean = String(spec || "")
        .replace(/^(\.\.\/)+/, "")
        .replace(/^\.\//, "")
        .replace(/^lib\//, "");
      const base = clean.split("/").pop().replace(/\.js$/, "");

      if (base === "htmlcard") {
        const themeKey = pickThemeForGame(Object.keys(libs));
        return { ...mikuHtmlCardModule, BASE_CSS: buildGameBaseCss(themeKey) };
      }
      if (base === "dquote") return dquoteModule;
      if (base === "style") return styleModule;

      if (resolvedCache[base]) return resolvedCache[base];
      const factory =
        libs[clean] ||
        libs[base] ||
        Object.entries(libs).find(([k]) =>
          k.replace(/\.js$/, "").endsWith(`/${base}`)
        )?.[1];
      if (typeof factory === "function") {
        const mod = { exports: {} };
        factory(mod, mod.exports, localRequire);
        resolvedCache[base] = mod.exports;
        return mod.exports;
      }
      throw new Error(`Rich internal module not found: ${spec}`);
    };

    const mod = { exports: {} };
    featureFn(mod, mod.exports, localRequire);
    cachedMod = mod.exports;
    return cachedMod;
  }

  return async function handler(m, ctx = {}) {
    const mod = loadModule();
    const sock = ctx.sock || ctx.conn;
    const prefix = ctx.prefix || m.prefix || config.command?.prefix || ".";
    const command = ctx.command || m.command || mod.name || "";
    const text = ctx.text ?? m.text ?? "";
    const args = ctx.args || m.args || [];
    const reply = (txt, opts) => m.reply(txt, opts);

    if (typeof mod.run === "function") {
      return await mod.run({
        sock,
        conn: sock,
        m,
        text,
        args,
        prefix,
        usedPrefix: prefix,
        command,
        reply,
        config,
      });
    }
  };
}

export {
  buildRichHtmlPayload,
  sendHtmlCard,
  safeJson,
  escapeHtml,
  MIKU_BASE_CSS,
  buildGameBaseCss,
  createRichRunner,
};
