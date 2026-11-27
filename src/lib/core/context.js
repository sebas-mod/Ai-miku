/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from "fs";
import path from "path";
import config from "../../../config.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import axios from "axios";
import { getAssetBuffer, getJpegThumb } from "./media.js";

let gameThumbBuffer = null;
let winnerThumbBuffer = null;

const keys = [
  ["allmenu", (buf) => { gameThumbBuffer = buf; }],
  ["allmenu", (buf) => { winnerThumbBuffer = buf; }],
];
for (const [key, setter] of keys) {
  const buf = getAssetBuffer(key);
  if (buf) setter(buf);
}

const FAST_ANSWER_PRAISES = [
  "⚡ ¡Rapidísimo! ¡Eres un genio!",
  "🚀 ¡Superrápido! ¡Mente brillante!",
  "🔥 ¡Un monstruo! ¡Respondiste en un rayo!",
  "💫 ¡Increíble! ¡Eres Flash!",
  "🎯 ¡Precisión total! ¡Directo al blanco!",
  "⭐ ¡Estrella! ¡Reflejos de otro nivel!",
  "🏆 ¡Leyenda! ¡Velocidad máxima!",
  "💎 ¡Jugador premium! ¡Sin rival!",
  "🦅 ¡Vista de halcón!",
  "🧠 ¡Cerebro enorme! ¡IQ altísimo!",
];

const FAST_ANSWER_THRESHOLD = 4000;
const FAST_ANSWER_BONUS = {
  exp: 50,
  balance: 500,
  limit: 1,
};

function getRandomPraise() {
  return FAST_ANSWER_PRAISES[
    Math.floor(Math.random() * FAST_ANSWER_PRAISES.length)
  ];
}

function _saluranCtx() {
  const saluranId = config.saluran?.id || "120363393471527483@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ai Miku";
  return {
    forwardingScore: 9,
    isForwarded: true
  };
}

function getGameContextInfo() {
  return _saluranCtx();
}

function getWinnerContextInfo() {
  return _saluranCtx();
}

async function sendGamePreview(sock, jid, text, title, body, options) {
  const msgId = await sock.sendPreview(
    jid,
    {
      caption: text,
      title: title || "🎮 miku GAMES",
      description: body || "¡Diviértete jugando!",
      jpegThumbnail: await getJpegThumb("allmenu"),
      previewType: 0,
    },
    { contextInfo: _saluranCtx(), ...options },
  );
  return { key: { id: msgId, remoteJid: jid, fromMe: true } };
}

async function sendWinnerPreview(sock, jid, text, title, body, options) {
  const msgId = await sock.sendPreview(
    jid,
    {
      caption: text,
      title: title || "🏆 WINNER!",
      description: body || "¡Felicidades, has ganado!",
      jpegThumbnail: await getJpegThumb("allmenu"),
      previewType: 0,
    },
    { contextInfo: _saluranCtx(), ...options },
  );
  return { key: { id: msgId, remoteJid: jid, fromMe: true } };
}

async function sendToolsPreview(sock, jid, text, title, body, options) {
  const msgId = await sock.sendPreview(
    jid,
    {
      caption: text,
      title: title || "🛠️ miku TOOLS",
      description: body || "Utility & tools",
      jpegThumbnail: await getJpegThumb("allmenu"),
      previewType: 0,
    },
    { contextInfo: _saluranCtx(), ...options },
  );
  return { key: { id: msgId, remoteJid: jid, fromMe: true } };
}

function saluranCtx() {
  return _saluranCtx();
}

function checkFastAnswer(session) {
  if (!session?.startTime) return { isFast: false };

  const elapsed = Date.now() - session.startTime;

  if (elapsed <= FAST_ANSWER_THRESHOLD) {
    return {
      isFast: true,
      elapsed: elapsed,
      praise: getRandomPraise(),
      bonus: FAST_ANSWER_BONUS,
    };
  }

  return { isFast: false, elapsed: elapsed };
}

function createFakeQuoted(botName = "Ai Miku", verified = true) {
  return {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
    },
    message: {
      contactMessage: {
        displayName: verified ? `✅ ${botName}` : botName,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${botName}\nORG:${verified ? "Verified Bot" : "Bot"}\nEND:VCARD`,
      },
    },
  };
}

export {
  getGameContextInfo,
  getWinnerContextInfo,
  sendGamePreview,
  sendWinnerPreview,
  sendToolsPreview,
  saluranCtx,
  createFakeQuoted,
  checkFastAnswer,
  getRandomPraise,
  gameThumbBuffer,
  winnerThumbBuffer,
  FAST_ANSWER_THRESHOLD,
  FAST_ANSWER_BONUS,
  FAST_ANSWER_PRAISES,
};
