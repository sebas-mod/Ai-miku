/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import crypto from "crypto";
import { getUserAvatar } from "../../src/lib/core/rank-canvas.js";
import { getDatabase } from "../../src/lib/data/database.js";
import { calculateLevel, getRankInfo } from "../../src/lib/data/level.js";

const pluginConfig = {
  name: "daftar",
  alias: ["reg", "register", "verifikasi", "verify"],
  category: "user",
  description: "Daftar sebagai petualang resmi di Elysia Assistant",
  usage: ".daftar <nama>.<umur>",
  example: ".daftar Arthazy.19",
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
    .update(String(sender) + ":" + Date.now() + ":" + Math.random())
    .digest("hex")
    .toUpperCase();
  return `ELYSIA-${hash.slice(0, 4)}-${hash.slice(4, 8)}`;
}

function parseRegInput(rawText, fallbackName) {
  const text = String(rawText || "").trim();
  if (!text) return null;

  // Format: Nama.Umur atau Nama|Umur atau Nama,Umur
  let m = text.match(
    /^([^.|,]+)[.|,]\s*(\d{1,3})(?:[.|,]\s*(L|P|pria|wanita|cowok|cewek))?$/i
  );
  if (m) {
    return {
      name: m[1].trim(),
      age: parseInt(m[2], 10),
      gender: m[3] || "Rahasia",
    };
  }

  // Format: Nama Umur
  m = text.match(/^(.+?)\s+(\d{1,3})$/);
  if (m) {
    return {
      name: m[1].trim(),
      age: parseInt(m[2], 10),
      gender: "Rahasia",
    };
  }

  // Hanya angka umur -> gunakan pushName
  if (/^\d{1,3}$/.test(text)) {
    return {
      name: fallbackName || "Petualang",
      age: parseInt(text, 10),
      gender: "Rahasia",
    };
  }

  return null;
}

function resolveCanonicalJid(jid, sock) {
  if (!jid) return "";
  const raw = String(jid);
  if (raw.endsWith("@lid") && sock?.getJid) {
    const resolved = sock.getJid(raw);
    if (resolved) return resolved;
  }
  return raw;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const targetJid = resolveCanonicalJid(m.sender, sock);
  const user = db.getUser(targetJid) || db.setUser(targetJid);
  if (!user) {
    return m.reply("⚠️ Gagal membaca data akun kamu. Coba lagi ya!");
  }
  const p = m.prefix || ".";

  // Sumber kebenaran tunggal: user.isRegistered pada database utama
  if (user.isRegistered) {
    const sn = user.serialNumber || makeSerial(targetJid);
    if (!user.serialNumber) {
      db.setUser(targetJid, { serialNumber: sn });
      await db.save();
    }
    const regDate = user.registeredAt
      ? new Date(user.registeredAt).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";
    return m.reply(
      `╭─── ❖ 『 ✅ *SUDAH TERDAFTAR* 』 ❖\n` +
        `│ ✦ Akun kamu sudah terdaftar di *Elysia Assistant*!\n` +
        `│ 👤 *Nama:* ${user.regName || user.name || m.pushName || "Petualang"}\n` +
        `│ 🎂 *Umur:* ${user.regAge ? `${user.regAge} Tahun` : "-"}\n` +
        `│ 🔑 *Serial ID:* \`${sn}\`\n` +
        `│ 📅 *Terdaftar:* ${regDate}\n` +
        `├─── ❖ 『 💡 *INFO* 』 ❖\n` +
        `│ ◦ Cek kartu ID: *${p}ceksn*\n` +
        `│ ◦ Cek profil: *${p}profile*\n` +
        `│ ◦ Hapus daftar: *${p}unreg ${sn}*\n` +
        `╰──────────────────────────❖`
    );
  }

  const parsed = parseRegInput(m.text, m.pushName);
  if (!parsed) {
    return m.reply(
      `╭─── ❖ 『 📜 *PENDAFTARAN PETUALANG* 』 ❖\n` +
        `│ ✦ Silakan masukkan *Nama* dan *Umur* kamu!\n` +
        `│\n` +
        `│ 📌 *Format:* \`${p}${m.command || "daftar"} Nama.Umur\`\n` +
        `│ ✨ *Contoh 1:* \`${p}daftar ${m.pushName || "Arthazy"}.19\`\n` +
        `│ ✨ *Contoh 2:* \`${p}daftar ${m.pushName || "Arthazy"} 19\`\n` +
        `├─── ❖ 『 🎁 *BONUS PENDAFTARAN* 』 ❖\n` +
        `│ 💰 *+Rp 25.000* Koin Awal\n` +
        `│ ✨ *+15.000* EXP Petualang\n` +
        `│ ⚡ *+15* Energi Tambahan\n` +
        `│ 🧪 *+5* Health Potion & *1* Common Crate\n` +
        `╰──────────────────────────❖\n` +
        `_✦ Daftar sekarang untuk membuka seluruh fitur RPG, Clan, & Game!_`
    );
  }

  const { name, age } = parsed;
  if (name.length < 2 || name.length > 35) {
    return m.reply(`⚠️ Nama harus terdiri dari *2 hingga 35 karakter*!`);
  }
  if (age < 7 || age > 90) {
    return m.reply(`⚠️ Umur pendaftaran harus di antara *7 hingga 90 tahun*!`);
  }

  const sn = makeSerial(targetJid);
  const nowIso = new Date().toISOString();
  const isFirstReg = !user.hasClaimedRegBonus && !user.hasClaimedRegisterReward;

  const bonusKoin = isFirstReg ? 25000 : 0;
  const bonusExp = isFirstReg ? 15000 : 0;
  const bonusEnergi = isFirstReg ? 15 : 0;

  const newKoin = (Number(user.koin) || 0) + bonusKoin;
  const newExp = (Number(user.exp) || 0) + bonusExp;
  const newLevel = calculateLevel(newExp);
  const newEnergi =
    user.energi === -1 ? -1 : (Number(user.energi) || 10) + bonusEnergi;

  const nextInventory = { ...(user.inventory || {}) };
  if (isFirstReg) {
    nextInventory.healthpotion = (Number(nextInventory.healthpotion) || 0) + 5;
    nextInventory.common = (Number(nextInventory.common) || 0) + 1;
  }

  db.setUser(targetJid, {
    name,
    isRegistered: true,
    regName: name,
    regAge: age,
    regGender: parsed.gender || "Rahasia",
    serialNumber: sn,
    registeredAt: nowIso,
    lastRegisteredAt: nowIso,
    unregisteredAt: null,
    registrationCount: (Number(user.registrationCount) || 0) + 1,
    hasClaimedRegBonus: true,
    hasClaimedRegisterReward: true,
    koin: newKoin,
    exp: newExp,
    level: newLevel,
    energi: newEnergi,
    inventory: nextInventory,
  });
  await db.save();

  // Sinkronkan ke global.db.data.users untuk plugin RPG
  if (global.db?.data?.users) {
    const cleanNum = targetJid.replace(/@.+/g, "").split(":")[0];
    const rpgKey = `${cleanNum}@s.whatsapp.net`;
    const gu = (global.db.data.users[rpgKey] ||= {});
    gu.registered = true;
    gu.name = name;
    gu.age = age;
    gu.regTime = Date.now();
    gu.sn = sn;
    if (isFirstReg) {
      gu.money = (Number(gu.money) || 0) + bonusKoin;
      gu.exp = (Number(gu.exp) || 0) + bonusExp;
      gu.potion = (Number(gu.potion) || 0) + 5;
      gu.common = (Number(gu.common) || 0) + 1;
    }
    if (m.sender !== rpgKey && global.db.data.users[m.sender]) {
      global.db.data.users[m.sender].registered = true;
      global.db.data.users[m.sender].name = name;
      global.db.data.users[m.sender].age = age;
      global.db.data.users[m.sender].sn = sn;
    }
  }

  const rankInfo = getRankInfo(newLevel);
  const dateFmt = new Date(nowIso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const cleanTag = targetJid.split("@")[0].split(":")[0];
  const cardText =
    `╭─── ❖ 『 🌟 *KARTU IDENTITAS PETUALANG* 』 ❖\n` +
    `│ ✦ Selamat datang di dunia *Elysia Assistant*!\n` +
    `├─── ❖ 『 🪪 *BIODATA RESMI* 』 ❖\n` +
    `│ 👤 *Nama:* ${name}\n` +
    `│ 🎂 *Umur:* ${age} Tahun\n` +
    `│ 🏷️ *Tag:* @${cleanTag}\n` +
    `│ 🎖️ *Pangkat:* ${rankInfo.title} (Lv.${newLevel})\n` +
    `│ 🔑 *Serial ID:* \`${sn}\`\n` +
    `│ 📅 *Terdaftar:* ${dateFmt}\n` +
    (isFirstReg
      ? `├─── ❖ 『 🎁 *STARTER PACK DITERIMA* 』 ❖\n` +
        `│ 💰 *Koin:* +Rp ${bonusKoin.toLocaleString("id-ID")}\n` +
        `│ ✨ *EXP:* +${bonusExp.toLocaleString("id-ID")} EXP\n` +
        `│ ⚡ *Energi:* +${bonusEnergi} Energi\n` +
        `│ 🧪 *Item:* +5 Health Potion & +1 Common Crate\n`
      : "") +
    `├─── ❖ 『 🚀 *LANGKAH SELANJUTNYA* 』 ❖\n` +
    `│ ◦ \`${p}profile\` — Lihat profil lengkapmu\n` +
    `│ ◦ \`${p}ceksn\` — Cek kartu & Serial Number\n` +
    `│ ◦ \`${p}unreg ${sn}\` — Hapus pendaftaran\n` +
    `╰──────────────────────────❖\n` +
    `_✦ Elysia Assistant • by Arthazy_`;

  await m.react("🎉");
  try {
    await sock.sendMessage(
      m.chat,
      {
        text: cardText,
        contextInfo: {
          mentionedJid: [targetJid],
          externalAdReply: {
            title: `🪪 VERIFIED ADVENTURER • ${name.toUpperCase()}`,
            body: `SN: ${sn} • ${rankInfo.title}`,
            thumbnail: await getUserAvatar(sock, targetJid),
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
  } catch {
    await m.reply(cardText, { mentions: [targetJid] });
  }
}

export { pluginConfig as config, handler };
