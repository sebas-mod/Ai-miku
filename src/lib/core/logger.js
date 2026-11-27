/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import chalk from "chalk";
import * as timeHelper from "./time.js";

const PALETTE = [
  chalk.hex("#00F5D4"), // Neon Mint
  chalk.hex("#FF66CC"), // Cyber Pink
  chalk.hex("#FFD166"), // Bright Gold
  chalk.hex("#38B6FF"), // Sky Cyan
  chalk.hex("#A78BFA"), // Electric Purple
  chalk.hex("#4ADE80"), // Emerald Green
];

const gradient = (colors) => (text = "") => {
  const str = String(text);
  return [...str]
    .map((ch, i) => PALETTE[i % PALETTE.length](ch))
    .join("");
};

const cGreen = chalk.hex("#4ADE80");
const cCyan = chalk.hex("#38B6FF");
const cPink = chalk.hex("#FF66CC");
const cYellow = chalk.hex("#FFD166");
const cPurple = chalk.hex("#A78BFA");
const cRed = chalk.hex("#FF5555");
const cWhite = chalk.whiteBright;
const cGray = chalk.gray;

function makeTag(label, kind = "info") {
  const text = String(label || "INFO").toUpperCase().substring(0, 6).padStart(4, " ");
  const colorMap = {
    ok: cGreen.bold,
    success: cGreen.bold,
    boot: cPink.bold,
    fail: cRed.bold,
    error: cRed.bold,
    warn: cYellow.bold,
    info: cCyan.bold,
    wait: cYellow.bold,
    sys: cPurple.bold,
    dbg: cGray,
  };
  const fn = colorMap[kind] || cCyan.bold;
  return `${cPurple("⟦")} ${fn(text)} ${cPurple("⟧")}`;
}

const SYM = {
  ok: makeTag("OK", "ok"),
  no: makeTag("FAIL", "fail"),
  wn: makeTag("WARN", "warn"),
  info: makeTag("INFO", "info"),
  sys: makeTag("SYS", "sys"),
  dbg: makeTag("DBG", "dbg"),
};

function writeLog(kind, label, detail = "") {
  const tags = {
    info: SYM.info,
    success: SYM.ok,
    warn: SYM.wn,
    error: SYM.no,
    system: SYM.sys,
    debug: SYM.dbg,
  };
  const tag = tags[kind] || SYM.info;
  const labelColor =
    kind === "error"
      ? cRed.bold
      : kind === "warn"
      ? cYellow.bold
      : kind === "success"
      ? cGreen.bold
      : kind === "system"
      ? cPurple.bold
      : cCyan.bold;
  const timeStr = cGray(timeHelper.formatTime("HH:mm:ss"));
  const msg = `${timeStr} ${tag} ${labelColor(label)}${detail ? " " + cWhite("› ") + cWhite(detail) : ""}`;
  console.log(msg);
}

const logger = {
  info: (label, detail = "") => writeLog("info", label, detail),
  success: (label, detail = "") => writeLog("success", label, detail),
  warn: (label, detail = "") => writeLog("warn", label, detail),
  error: (label, detail = "") => writeLog("error", label, detail),
  system: (label, detail = "") => writeLog("system", label, detail),
  debug: (label, detail = "") => writeLog("debug", label, detail),
  tag: (label, msg, detail = "") => {
    console.log(`${makeTag(label, "info")} ${cCyan.bold(msg)}${detail ? " " + cWhite(detail) : ""}`);
  },
};

function createSpinner(label = "SYS", text = "loading") {
  let active = false;
  return {
    start() {
      active = true;
      console.log(`${makeTag(label, "wait")} ${cYellow(text)}...`);
    },
    update(nextText) {
      if (active) console.log(`${makeTag(label, "wait")} ${cYellow(nextText)}...`);
    },
    stop() {
      active = false;
    },
    succeed(detail = text) {
      this.stop();
      logger.success(label, detail);
    },
    warn(detail = text) {
      this.stop();
      logger.warn(label, detail);
    },
    fail(detail = text) {
      this.stop();
      logger.error(label, detail);
    },
    isActive() {
      return active;
    },
  };
}

async function spinText(label, text) {
  console.log(`${makeTag(label || "OK", "ok")} ${cCyan(text)}`);
}

async function typeLine(text) {
  const clean = String(text || "").replace(/\x1B\[\d+m/g, "");
  console.log(`${makeTag("OK", "ok")} ${cWhite(clean)}`);
}

async function runLoader(text = "memuat") {
  console.log(`${makeTag("OK", "ok")} ${cGreen(text)}`);
}

async function playBootSequence(info = {}) {
  const { name = "Ai Miku", version = "1.0.0", developer = "Arthazy", mode = "public" } = info;
  const line = gradient()("━".repeat(52));
  console.log("");
  console.log(`  ${line}`);
  console.log(`  ${makeTag("BOOT", "boot")} ${cPink.bold(name)} ${cYellow(`v${version}`)} ${cGray("by")} ${cCyan.bold(developer)}`);
  console.log(`  ${makeTag("MODE", "info")} ${cGreen.bold(String(mode).toUpperCase())} ${cGray("• Multi-Device Engine Ready")}`);
  console.log(`  ${line}`);
}

function getTypeTag(msgType, isNewsletter) {
  if (isNewsletter) return "📢 Channel";
  const map = {
    imageMessage: "🖼️ Image",
    videoMessage: "🎬 Video",
    audioMessage: "🎵 Audio",
    stickerMessage: "✨ Sticker",
    documentMessage: "📄 Document",
    contactMessage: "👤 Contact",
    locationMessage: "📍 Location",
    viewOnceMessageV2: "👁️ 1xView",
    extendedTextMessage: "💬 Text",
    conversation: "💬 Text",
    interactiveResponseMessage: "🔘 Button",
    pollCreationMessage: "📊 Poll",
    reactionMessage: "❤️ Reaction",
  };
  return map[msgType] || "💬 Message";
}

function logMessage(info) {
  if (!info || typeof info !== "object") return;
  const {
    chatType = "private",
    groupName = "",
    pushName = "",
    sender = "",
    message = "",
    messageType = "conversation",
    isNewsletter = false,
  } = info;
  if (!sender) return;

  const clean = (value, max = 500) =>
    String(value ?? "")
      .replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/[\r\n\t]+/g, " ")
      .trim()
      .slice(0, max);

  const senderId = String(sender).split(":")[0];
  const num = senderId.replace(/@.+$/, "").replace(/[^0-9]/g, "") || "No disponible";
  const senderName = clean(pushName, 60) || num;
  const typeTag = getTypeTag(messageType, isNewsletter || chatType === "newsletter");
  const isGroup = chatType === "group";
  const chatBadge = isNewsletter || chatType === "newsletter"
    ? cYellow.bold("📢 SALURAN")
    : isGroup
    ? cPink.bold(`👥 GRUPO (${clean(groupName || "Grupo de WhatsApp", 40)})`)
    : cCyan.bold("👤 CHAT PRIBADI");
  const text = clean(message, 500) || `[${typeTag} sin texto]`;
  const time = timeHelper.formatTime("HH:mm:ss");
  const date = timeHelper.formatTime("DD/MM/YYYY");

  const edge = isGroup ? cPink : isNewsletter ? cYellow : cCyan;
  console.log("");
  console.log(` ${edge("╭━━━〔")} ${cWhite.bold("✨ AI MIKU")} ${cGray("•")} ${chatBadge} ${edge("〕━━━╮")}`);
  console.log(` ${edge("┃")} ${cCyan.bold("👤 Pengirim :")} ${cWhite.bold(senderName)} ${cGray(`(+${num})`)}`);
  console.log(` ${edge("┃")} ${cPurple.bold("🕒 Hora     :")} ${cYellow(`${date} ${time} WIB`)}`);
  console.log(` ${edge("┃")} ${cGreen.bold("🏷️ Tipe     :")} ${cGreen(typeTag)}`);
  console.log(` ${edge("┃")} ${cPink.bold("💬 Pesan    :")} ${cWhite(text)}`);
  console.log(` ${edge("╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯")}`);
}

function logPlugin(name, category) {
  console.log(`  ${cPurple("├─")} ${cCyan.bold(name)} ${cYellow(`[${category}]`)}`);
}

function logConnection(status, info = "") {
  if (status === "connected") {
    console.log(`${makeTag("ONLINE", "ok")} ${cGreen.bold("WhatsApp Terhubung!")} ${info ? cCyan(`— ${info}`) : ""}`);
  } else if (status === "connecting") {
    console.log(`${makeTag("WAIT", "wait")} ${cYellow.bold("Menghubungkan ke WhatsApp...")} ${info ? cGray(`— ${info}`) : ""}`);
  } else {
    console.log(`${makeTag("DISC", "fail")} ${cRed.bold("Koneksi Terputus")} ${info ? cYellow(`— ${info}`) : ""}`);
  }
}

function logErrorBox(title, message) {
  console.log(`${makeTag("ERROR", "fail")} ${cRed.bold(title)}: ${cYellow(message)}`);
}

function printBanner() {}
function printStartup() {}

const CODES = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  green: "\x1b[32m", purple: "\x1b[35m", white: "\x1b[37m", gray: "\x1b[90m",
  red: "\x1b[31m", yellow: "\x1b[33m", blue: "\x1b[34m", cyan: "\x1b[36m", magenta: "\x1b[35m",
};

const c = {
  green: cGreen,
  purple: cPurple,
  white: cWhite,
  gray: cGray,
  bold: chalk.bold,
  dim: cGray,
  greenBold: cGreen.bold,
  purpleBold: cPurple.bold,
  whiteBold: cWhite.bold,
  grayDim: cGray,
  red: cRed,
  yellow: cYellow,
  cyan: cCyan,
  blue: chalk.blueBright,
  magenta: cPink,
};

function divider() {
  console.log(`  ${gradient()("─".repeat(56))}`);
}

function createBanner(lines, color = "cyan") {
  const borderColor = color === "green" ? cGreen : color === "pink" ? cPink : cCyan;
  const top = borderColor("╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮");
  const bot = borderColor("╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯");
  const body = lines.map((l) => `${borderColor("┃")} ${cWhite(l)}`).join("\n");
  return `${top}\n${body}\n${bot}`;
}

function getTimestamp() {
  return cYellow(timeHelper.formatTime("HH:mm:ss"));
}

const theme = {
  primary: cCyan,
  secondary: cPink,
  accent: cGreen,
  text: cWhite,
  dim: cGray,
  muted: cGray,
  success: cGreen,
  error: cRed,
  warning: cYellow,
  info: cCyan,
  debug: cGray,
  border: cPurple,
  tag: cPink.bold,
  pill: (t, tone = "primary") => {
    const bg =
      tone === "accent"
        ? chalk.bgHex("#00F5D4").black.bold
        : tone === "system"
        ? chalk.bgHex("#A78BFA").black.bold
        : chalk.bgHex("#FF66CC").black.bold;
    return bg(` ${t} `);
  },
  rainbow: gradient(),
  borderFx: (t) => gradient()(t),
  mintFx: (t) => cGreen(t),
  warmFx: (t) => cYellow(t),
  colorizeCategory: (t, idx = 0) => PALETTE[idx % PALETTE.length].bold(t),
};

export {
  c,
  CODES,
  logger,
  createSpinner,
  spinText,
  typeLine,
  runLoader,
  playBootSequence,
  logMessage,
  logPlugin,
  logConnection,
  logErrorBox,
  printBanner,
  printStartup,
  createBanner,
  getTimestamp,
  divider,
  theme,
  chalk,
  gradient,
};
