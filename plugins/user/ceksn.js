/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import crypto from "crypto";
import { getDatabase } from "../../src/lib/data/database.js";
import { calculateLevel, getRankInfo } from "../../src/lib/data/level.js";

const pluginConfig = {
  name: "ceksn",
  alias: ["sn", "kartudaftar", "idcard"],
  category: "user",
  description: "Cek Serial Number (SN) dan kartu pendaftaran kamu",
  usage: ".ceksn",
  example: ".ceksn",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function makeSerial(sender) {
  const hash = crypto
    .createHash("md5")
    .update(String(sender) + ":" + Date.now())
    .digest("hex")
    .toUpperCase();
  return `MIKU-${hash.slice(0, 4)}-${hash.slice(4, 8)}`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const targetJid =
    m.sender?.endsWith("@lid") && sock?.getJid
      ? sock.getJid(m.sender) || m.sender
      : m.sender;
  const user = db.getUser(targetJid);
  const p = m.prefix || ".";

  if (!user?.isRegistered) {
    return m.reply(
      `╭─── ❖ 『 🔒 *NO REGISTRADO* 』 ❖\n` +
        `│ ✦ Aún no tienes Tarjeta de Identidad de Aventurero.\n` +
        `│ ✦ Tipo *${p}regístrese Nombre.Edad* para registrarse!\n` +
        `│ ✦ *Ejemplo:* \`${p}lista ${m.pushName || "Arthazy"}.19\`\n` +
        `╰──────────────────────────❖`
    );
  }

  let sn = user.serialNumber;
  if (!sn) {
    sn = makeSerial(targetJid);
    db.setUser(targetJid, { serialNumber: sn });
    await db.save();
  }

  const lv = calculateLevel(user.exp || 0);
  const rank = getRankInfo(lv);
  const regTimestamp = user.lastRegisteredAt || user.registeredAt;
  const regDate = regTimestamp
    ? new Date(regTimestamp).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return m.reply(
    `╭─── ❖ 『 🪪 *ASTRAL ADVENTURER CARD* 』 ❖\n` +
      `│ 👤 *Nombre legal:* ${user.regName || user.name || m.pushName}\n` +
      `│ 🎂 *Edad:* ${user.regAge ? `${user.regAge} Tahun` : "-"}\n` +
      `│ 🎖️ *Pangkat:* ${rank.title} (Lv.${lv})\n` +
      `│ ⭐ *Bintang:* ${rank.starBar}\n` +
      `│ 🔑 *Serial Number:* \`${sn}\`\n` +
      `│ 📅 *Terdaftar Sejak:* ${regDate}\n` +
      `╰──────────────────────────❖\n` +
      `_💡Usar*${p}desregistrar ${sn}*si deseas eliminar el registro._`
  );
}

export { pluginConfig as config, handler };
