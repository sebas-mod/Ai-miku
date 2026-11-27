/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";
import sharp from "sharp";
import config from "../../config.js";
import {
  getCategories,
  getCommandsByCategory,
  getPlugin,
} from "../../src/lib/core/plugins.js";
import {
  sendHtmlCard,
  safeJson,
  escapeHtml,
} from "../../src/lib/features/rich-engine.js";

const pluginConfig = {
  name: "richmenu",
  alias: ["livemenu", "arcademenu", "richgames"],
  category: "rich",
  description:
    "Menu kategori seluruh fitur Ai Miku dalam tampilan HTML interaktif",
  usage: ".richmenu",
  example: ".richmenu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const CATEGORY_EMOJIS = {
  owner: "👑",
  main: "🏠",
  tools: "🛠️",
  ai: "🤖",
  rich: "🕹️",
  stalker: "🔎",
  roleplay: "🎭",
  tebak: "🧩",
  game: "🎯",
  vercel: "▲",
  fun: "🎮",
  download: "📥",
  search: "🔍",
  sticker: "🖼️",
  group: "👥",
  audio: "🎧",
  maker: "🎨",
  canvas: "🖌️",
  channel: "📢",
  clan: "🏰",
  cek: "🔮",
  menfess: "💌",
  user: "📊",
  anime: "🍥",
  convert: "🔄",
  premium: "💎",
  jpm: "📨",
  pushkontak: "📲",
};

let _cachedMenuThumb = { url: "", dataUri: "" };

async function getInlineThumbDataUri(url) {
  if (!url) return "";
  if (_cachedMenuThumb.url === url && _cachedMenuThumb.dataUri) {
    return _cachedMenuThumb.dataUri;
  }
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 10000,
    });
    const raw = Buffer.from(res.data);
    // Pertahankan rasio asli gambar agar foto tampil penuh tanpa terpotong
    const compressed = await sharp(raw)
      .rotate()
      .resize({ width: 760, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();
    const dataUri = `data:image/jpeg;base64,${compressed.toString("base64")}`;
    _cachedMenuThumb = { url, dataUri };
    return dataUri;
  } catch {
    return "";
  }
}

function buildCategoryPayload(m) {
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();

  const order = [
    "main",
    "tools",
    "ai",
    "download",
    "search",
    "sticker",
    "convert",
    "group",
    "rich",
    "game",
    "tebak",
    "roleplay",
    "stalker",
    "vercel",
    "fun",
    "cek",
    "anime",
    "audio",
    "maker",
    "canvas",
    "channel",
    "clan",
    "menfess",
    "user",
    "premium",
    "jpm",
    "pushkontak",
    "owner",
  ];

  const sorted = [...categories].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  const catList = [];
  const allCmds = [];

  for (const cat of sorted) {
    if (cat === "owner" && !m.isOwner) continue;
    const cmds = commandsByCategory[cat] || [];
    if (!cmds.length) continue;

    const icon = CATEGORY_EMOJIS[cat] || "📁";
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
    catList.push({
      id: cat,
      name: label,
      icon,
      count: cmds.length,
    });

    for (const c of cmds) {
      const cmdName = typeof c === "string" ? c : c?.name || c?.cmd || "";
      if (!cmdName) continue;
      const pluginObj = getPlugin(cmdName);
      const rawDesc =
        (typeof c === "object" && c?.description) ||
        pluginObj?.config?.description ||
        `Fitur ${cmdName}`;
      allCmds.push({
        cmd: cmdName,
        cat,
        icon,
        desc: String(rawDesc).slice(0, 56),
      });
    }
  }

  return { catList, allCmds };
}

function buildMikuRichMenuHtml(
  prefix,
  botName,
  ownerName,
  thumbDataUri,
  catList,
  allCmds
) {
  const heroBg = thumbDataUri
    ? `<img src="${thumbDataUri}" alt="${escapeHtml(botName)}"/>`
    : "";

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<title>${escapeHtml(botName)} — Rich Menu</title>
<style>
:root{
  --bg:#0f0918;
  --panel:#1a1129;
  --pink:#f472b6;
  --violet:#c084fc;
  --ink:#fff7fe;
  --muted:#cdb7e6;
  --border:rgba(244,114,182,.28);
  --sys:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{background:transparent;color:var(--ink);font-family:var(--sys);width:100%;}
.wrap{padding:4px;width:100%;}
.card{
  width:100%;max-width:620px;margin:0 auto;border-radius:16px;overflow:hidden;
  background:radial-gradient(circle at 90% 0%,rgba(244,114,182,.22),transparent 46%),
             linear-gradient(180deg,#221336 0%,#140c21 55%,var(--bg) 100%);
  border:1px solid var(--border);
  box-shadow:0 12px 30px rgba(8,3,16,.72);
}
.hero{
  position:relative;width:100%;overflow:hidden;
  background:linear-gradient(135deg,#6b215e 0%,#3b1759 55%,#1b0d30 100%);
}
.hero img{
  width:100%;height:auto;display:block;
}
.hero-bar{
  padding:8px 11px;display:flex;align-items:center;justify-content:space-between;gap:8px;
  background:linear-gradient(90deg,rgba(36,18,58,.96),rgba(22,12,38,.96));
  border-bottom:1px solid rgba(244,114,182,.22);
}
.hero-title{
  font-size:13.5px;font-weight:900;
  background:linear-gradient(90deg,#ffffff 0%,#fbcfe8 55%,#d8b4fe 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.pill{
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 8px;border-radius:999px;font-size:9.5px;font-weight:800;
  background:rgba(244,114,182,.16);border:1px solid rgba(244,114,182,.42);color:#ffd6ec;
}
.body{padding:8px 10px 10px;}
.top-bar{display:flex;gap:6px;align-items:center;margin-bottom:8px;}
.back-btn{
  flex:none;border:1px solid rgba(244,114,182,.4);background:rgba(244,114,182,.16);
  color:#ffd6ec;border-radius:9px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer;
}
.search-box{position:relative;flex:1;}
.search-box input{
  width:100%;padding:6px 10px 6px 28px;border-radius:9px;
  background:rgba(29,18,46,.92);border:1px solid rgba(192,132,252,.28);
  color:#fff;font-size:11.5px;outline:none;
}
.search-box input:focus{border-color:var(--pink);}
.search-ico{position:absolute;left:9px;top:50%;transform:translateY(-50%);font-size:11.5px;opacity:.8;}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;}
.cat-card{
  display:flex;align-items:center;gap:8px;padding:8px 9px;border-radius:11px;cursor:pointer;
  background:linear-gradient(135deg,rgba(37,24,58,.94),rgba(24,15,40,.94));
  border:1px solid rgba(244,114,182,.22);min-width:0;
}
.cat-card:active{transform:scale(.98);border-color:var(--pink);}
.cat-ico{
  width:30px;height:30px;border-radius:9px;flex:none;
  display:flex;align-items:center;justify-content:center;font-size:15px;
  background:linear-gradient(135deg,rgba(244,114,182,.24),rgba(192,132,252,.24));
  border:1px solid rgba(244,114,182,.3);
}
.cat-name{font-size:11.5px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cat-cnt{font-size:9.5px;color:#fbcfe8;margin-top:1px;}
.item{
  display:flex;align-items:center;gap:7px;padding:7px 8px;border-radius:11px;
  background:linear-gradient(135deg,rgba(37,24,58,.94),rgba(24,15,40,.94));
  border:1px solid rgba(244,114,182,.18);cursor:pointer;min-width:0;
}
.item.sel{
  border-color:var(--pink);
  background:linear-gradient(135deg,rgba(244,114,182,.26),rgba(168,85,247,.26));
  box-shadow:0 0 0 1px rgba(244,114,182,.45);
}
.ico{
  width:26px;height:26px;border-radius:8px;flex:none;
  display:flex;align-items:center;justify-content:center;font-size:13px;
  background:linear-gradient(135deg,rgba(244,114,182,.22),rgba(192,132,252,.22));
  border:1px solid rgba(244,114,182,.28);
}
.info{min-width:0;flex:1;}
.gname{font-size:11px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.gdesc{font-size:9px;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pager{
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  margin-top:7px;padding-top:6px;border-top:1px solid rgba(244,114,182,.14);
}
.pbtn{
  border:1px solid rgba(192,132,252,.35);background:var(--panel);color:#fff;
  border-radius:8px;padding:4px 10px;font-size:10px;font-weight:700;cursor:pointer;
}
.pbtn:disabled{opacity:.38;cursor:default;}
.pinfo{font-size:10px;color:var(--muted);font-weight:700;}
.confirm-bar{
  margin-top:8px;padding:7px 9px;border-radius:11px;
  background:rgba(28,16,46,.95);border:1px solid rgba(244,114,182,.35);
  display:flex;align-items:center;justify-content:space-between;gap:8px;
}
.sel-input{
  flex:1;min-width:0;background:rgba(15,9,24,.85);border:1px solid rgba(244,114,182,.32);
  border-radius:8px;padding:5px 8px;color:#fff;font-size:11.5px;font-weight:800;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;outline:none;
}
.confirm-btn{
  flex:none;border:none;border-radius:8px;padding:7px 12px;
  background:linear-gradient(135deg,#f472b6 0%,#a855f7 100%);
  color:#fff;font-size:10.5px;font-weight:800;cursor:pointer;
  box-shadow:0 4px 12px rgba(244,114,182,.35);
}
.confirm-btn:disabled{opacity:.4;box-shadow:none;cursor:default;}
.empty{grid-column:1 / -1;text-align:center;padding:16px 8px;color:var(--muted);font-size:11px;}
.foot{
  margin-top:7px;display:flex;align-items:center;justify-content:space-between;font-size:9.5px;color:var(--muted);
}
.toast{
  position:fixed;left:50%;bottom:10px;transform:translateX(-50%) translateY(16px);
  opacity:0;pointer-events:none;transition:.18s;z-index:99;
  background:linear-gradient(135deg,#f472b6,#a855f7);color:#fff;
  padding:6px 12px;border-radius:999px;font-size:11px;font-weight:800;
}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="hero">${heroBg}</div>
    <div class="hero-bar">
      <div class="hero-title" id="heroTitle">✦ Kategori Fitur Bot</div>
      <span class="pill" id="cnt">${catList.length} Kategori • ${allCmds.length} Fitur</span>
    </div>
    <div class="body">
      <div class="top-bar">
        <button class="back-btn" id="backBtn" style="display:none;">◀ Kategori</button>
        <div class="search-box">
          <span class="search-ico">🔍</span>
          <input id="q" type="text" placeholder="Busque categorías o características... (pegatinas, inteligencia artificial, herramientas)"/>
        </div>
      </div>
      <div class="grid" id="content"></div>
      <div class="pager" id="pager">
        <button class="pbtn" id="prev">◀ Sebelumnya</button>
        <span class="pinfo" id="pinfo">Hal 1 / 1</span>
        <button class="pbtn" id="next">Berikutnya ▶</button>
      </div>
      <div class="confirm-bar" id="confirmBar" style="display:none;">
        <input class="sel-input" id="selInput" type="text" readonly value=""/>
        <button class="confirm-btn" id="confirmBtn">📋 Copy Command</button>
      </div>
      <div class="foot">
        <span>✦ ${escapeHtml(botName)}</span>
        <span>by ${escapeHtml(ownerName)}</span>
      </div>
    </div>
  </div>
</div>
<div class="toast" id="toast">Command disalin!</div>
<script>
const PREFIX = ${safeJson(prefix)};
const CATEGORIES = ${safeJson(catList)};
const COMMANDS = ${safeJson(allCmds)};
const PER_PAGE = 8;

let activeCat = null;
let page = 1;
let selectedCmd = null;

const contentEl = document.getElementById("content");
const cntEl = document.getElementById("cnt");
const heroTitleEl = document.getElementById("heroTitle");
const backBtn = document.getElementById("backBtn");
const qEl = document.getElementById("q");
const pagerEl = document.getElementById("pager");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const pinfoEl = document.getElementById("pinfo");
const confirmBar = document.getElementById("confirmBar");
const selInput = document.getElementById("selInput");
const confirmBtn = document.getElementById("confirmBtn");
const toastEl = document.getElementById("toast");
let toastTimer;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
}

function copyTextSafe(text) {
  let copied = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
      copied = true;
    }
  } catch {}
  try {
    selInput.value = text;
    selInput.focus();
    selInput.select();
    selInput.setSelectionRange(0, text.length);
    if (document.execCommand && document.execCommand("copy")) copied = true;
  } catch {}
  return copied;
}

function render() {
  const kw = qEl.value.trim().toLowerCase();

  // Mode 1: Halaman Awal = Kategori Fitur Bot (main, tools, ai, dll.)
  if (!activeCat && !kw) {
    backBtn.style.display = "none";
    heroTitleEl.textContent = "✦ Kategori Fitur Bot";
    cntEl.textContent = CATEGORIES.length + " Kategori • " + COMMANDS.length + " Fitur";

    const totalPages = Math.max(1, Math.ceil(CATEGORIES.length / PER_PAGE));
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    pagerEl.style.display = totalPages > 1 ? "flex" : "none";
    pinfoEl.textContent = "Hal " + page + " / " + totalPages;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;

    const start = (page - 1) * PER_PAGE;
    const slice = CATEGORIES.slice(start, start + PER_PAGE);

    contentEl.innerHTML = slice.map((c) =>
      '<div class="cat-card" data-cat="' + c.id + '">' +
        '<div class="cat-ico">' + c.icon + '</div>' +
        '<div style="min-width:0;flex:1;">' +
          '<div class="cat-name">' + c.name + '</div>' +
          '<div class="cat-cnt">' + c.count + ' fitur ▸</div>' +
        '</div>' +
      '</div>'
    ).join("");
    return;
  }

  // Mode 2: Lista de funciones dalam Kategori atau Hasil Pencarian
  backBtn.style.display = activeCat ? "inline-block" : "none";
  const catObj = CATEGORIES.find((c) => c.id === activeCat);
  heroTitleEl.textContent = kw
    ? "🔍 Resultados de la búsqueda"
    : (catObj ? catObj.icon + " Kategori " + catObj.name : "Lista de funciones");

  const filtered = COMMANDS.filter((c) => {
    if (activeCat && c.cat !== activeCat) return false;
    if (!kw) return true;
    return (
      c.cmd.toLowerCase().includes(kw) ||
      c.cat.toLowerCase().includes(kw) ||
      c.desc.toLowerCase().includes(kw)
    );
  });

  cntEl.textContent = filtered.length + " Fitur";
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;

  pagerEl.style.display = totalPages > 1 ? "flex" : "none";
  pinfoEl.textContent = "Hal " + page + " / " + totalPages;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;

  if (!filtered.length) {
    contentEl.innerHTML = '<div class="empty">Característica no encontrada ✨</div>';
    return;
  }

  const start = (page - 1) * PER_PAGE;
  const slice = filtered.slice(start, start + PER_PAGE);

  contentEl.innerHTML = slice.map((c) => {
    const isSel = selectedCmd === c.cmd;
    return (
      '<div class="item' + (isSel ? ' sel' : '') + '" data-cmd="' + c.cmd + '">' +
        '<div class="ico">' + c.icon + '</div>' +
        '<div class="info">' +
          '<div class="gname">' + PREFIX + c.cmd + '</div>' +
          '<div class="gdesc">' + c.desc + '</div>' +
        '</div>' +
      '</div>'
    );
  }).join("");
}

contentEl.addEventListener("click", (ev) => {
  const catCard = ev.target.closest(".cat-card");
  if (catCard) {
    activeCat = catCard.getAttribute("data-cat");
    page = 1;
    render();
    return;
  }
  const cmdCard = ev.target.closest(".item");
  if (cmdCard) {
    selectedCmd = cmdCard.getAttribute("data-cmd");
    const fullCmd = PREFIX + selectedCmd;
    confirmBar.style.display = "flex";
    selInput.value = fullCmd;
    confirmBtn.textContent = "📋 Copy Command";
    render();
  }
});

backBtn.addEventListener("click", () => {
  activeCat = null;
  qEl.value = "";
  page = 1;
  render();
});

confirmBtn.addEventListener("click", () => {
  if (!selectedCmd) return;
  const fullCmd = PREFIX + selectedCmd;
  copyTextSafe(fullCmd);
  showToast("✅ " + fullCmd + " disalin! Tempel & kirim di chat");
});

prevBtn.addEventListener("click", () => { if (page > 1) { page--; render(); } });
nextBtn.addEventListener("click", () => { page++; render(); });
qEl.addEventListener("input", () => { page = 1; render(); });

render();
</script>
</body>
</html>`;
}

async function handler(m, { sock }) {
  const p = m.prefix || config.command?.prefix || ".";
  const botName = config.bot?.name || "Ai Miku";
  const ownerName = config.owner?.name || "Arthazy";
  const thumbUrl = config.thumbUrl?.menu || "https://c.termai.cc/i126/Orm.jpg";

  const [thumbDataUri, { catList, allCmds }] = await Promise.all([
    getInlineThumbDataUri(thumbUrl),
    Promise.resolve(buildCategoryPayload(m)),
  ]);

  const html = buildMikuRichMenuHtml(
    p,
    botName,
    ownerName,
    thumbDataUri,
    catList,
    allCmds
  );

  const ok = await sendHtmlCard(sock, m, html, `${botName} — Rich Menu`, "🕹️", {
    quoted: m,
  });

  if (!ok) {
    const fallback =
      `╭─── ❖ 『 🕹️ *MIKU RICH MENU* 』 ❖\n` +
      catList
        .map((c) => `│ ${c.icon} *${c.name}* (${c.count} funciones)`)
        .join("\n") +
      `\n╰──────────────────────────❖`;
    await m.reply(fallback);
  }
}

export { pluginConfig as config, handler };
