/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { DEFAULT_PP } from "../../src/lib/core/profile-picture.js";
import { getBlankAvatar } from "../../src/lib/core/rank-canvas.js";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/data/database.js";
import {
  calculateLevel,
  expForLevel,
  getRankInfo,
  getLevelBar,
} from "../../src/lib/data/level.js";
import { getDevice } from "@rexxhayanasi/elaina-baileys";

const pluginConfig = {
  name: "profile",
  alias: [],
  category: "user",
  description: "Muestra la tarjeta de perfil completa: nivel, bienes y estado del RPG",
  usage: ".profile [@user]",
  example: ".profile",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isRegistered: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function fmt(num) {
  return (Number(num) || 0).toLocaleString("id-ID");
}

function statBar(cur, max, len = 8, fill = "█", empty = "░") {
  const c = Math.max(0, Number(cur) || 0);
  const m = Math.max(1, Number(max) || 100);
  const f = Math.min(len, Math.max(0, Math.round((c / m) * len)));
  return fill.repeat(f) + empty.repeat(len - f);
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
  const isLid = target.endsWith("@lid");
  const resolvedJid = isLid && sock.getJid ? sock.getJid(target) || target : target;
  const phone = resolvedJid.split("@")[0].split(":")[0];

  const user = db.getUser(resolvedJid) || db.setUser(resolvedJid) || {};
  const rpgGlobal =
    global.db?.data?.users?.[`${phone}@s.whatsapp.net`] ||
    global.db?.data?.users?.[resolvedJid] ||
    {};

  const safe = (fn, ms = 1600) => {
    let t;
    return Promise.race([
      Promise.resolve().then(fn),
      new Promise((resolve) => {
        t = setTimeout(() => resolve(null), ms);
      }),
    ])
      .catch(() => null)
      .finally(() => clearTimeout(t));
  };

  const [ppUrl, statusRes, bizProfile, deviceInfo] = await Promise.all([
    safe(() => sock.profilePictureUrl(resolvedJid, "image")),
    safe(() => sock.fetchStatus(resolvedJid)),
    safe(() => sock.getBusinessProfile(resolvedJid)),
    safe(() => getDevice(resolvedJid, sock)),
  ]);

  const statusObj = Array.isArray(statusRes) ? statusRes[0] : statusRes;
  const bioStatus = statusObj?.status?.status || statusObj?.status || "-";
  const isBiz = !!bizProfile && Object.keys(bizProfile).length > 0;

  const userExp = Math.max(Number(user.exp) || 0, Number(rpgGlobal.exp) || 0);
  const userLevel = calculateLevel(userExp);
  const currentLevelExp = expForLevel(userLevel);
  const nextLevelExp = expForLevel(userLevel + 1);
  const expInLevel = Math.max(0, userExp - currentLevelExp);
  const expNeeded = Math.max(1, nextLevelExp - currentLevelExp);
  const expPct = Math.min(100, Math.floor((expInLevel / expNeeded) * 100));
  const rankInfo = getRankInfo(userLevel);

  const isReg = Boolean(user.isRegistered);
  const isOwnerUser = config.isOwner(resolvedJid);
  const isPremiumUser = config.isPremium(resolvedJid);
  const tierBadge = isOwnerUser
    ? "👑 Supreme Creator / Owner"
    : isPremiumUser
      ? "💎 Astral VIP Premium"
      : isReg
        ? "🌟 Verified Adventurer"
        : "🌱 Unverified Guest";

  const koin = Math.max(Number(user.koin) || 0, Number(rpgGlobal.money) || 0);
  const bank = Math.max(Number(user.rpg?.bank) || 0, Number(rpgGlobal.bank) || 0);
  const gold = Number(rpgGlobal.gold || user.rpg?.gold || 0);
  const diamond = Number(rpgGlobal.diamond || user.inventory?.diamond || 0);

  const hp = Number(user.rpg?.health ?? rpgGlobal.health ?? 100);
  const maxHp = Number(
    user.rpg?.maxHealth ?? rpgGlobal.maxHealth ?? 100 + (userLevel - 1) * 15
  );
  const mp = Number(user.rpg?.mana ?? rpgGlobal.mana ?? 100);
  const maxMp = Number(
    user.rpg?.maxMana ?? rpgGlobal.maxMana ?? 100 + (userLevel - 1) * 10
  );
  const sta = Number(user.rpg?.stamina ?? rpgGlobal.stamina ?? 100);
  const maxSta = Number(
    user.rpg?.maxStamina ?? rpgGlobal.maxStamina ?? 100 + (userLevel - 1) * 10
  );

  const energiDisplay =
    isOwnerUser || isPremiumUser || user.energi === -1
      ? "∞ Unlimited"
      : `${user.energi ?? 10} ⚡`;

  const displayName = isReg
    ? user.regName || user.name || m.pushName || "Aventurero"
    : m.pushName || user.name || "Aventurero";
  const regStatus = isReg
    ? `✅ Terdaftar (${user.regAge ?? "-"} thn)`
    : `⚠️ No registrado (${m.prefix || "."}lista)`;
  const snCode = isReg && user.serialNumber ? user.serialNumber : "-";
  const regDateRaw = isReg ? user.lastRegisteredAt || user.registeredAt : null;
  const regDateFmt = regDateRaw
    ? new Date(regDateRaw).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const clanName =
    (user.clanId && global.db?.data?.clans?.[user.clanId]?.name) ||
    user.clanId ||
    rpgGlobal.guild ||
    "Aún no unido";

  let caption =
    `╭─── ❖ 『 🌟 *MIKU ASTRAL DOSSIER* 』 ❖\n` +
    `│ 👤 *Nombre:* *${displayName}*\n` +
    `│ 🏷️ *Mention:* @${phone}\n` +
    `│ 👑 *Estado de la cuenta:* ${tierBadge}\n` +
    `│ 🪪 *Verificación:* ${regStatus}\n` +
    (snCode !== "-" ? `│ 🔑 *Serial ID:* \`${snCode}\`\n` : "") +
    (regDateFmt ? `│ 📅 *Terdaftar:* ${regDateFmt}\n` : "") +
    (user.birthday ? `│ 🎂 *Cumpleaños:* ${user.birthday}\n` : "") +
    `│ 🏰 *Clan / Guild:* ${clanName}\n` +
    `├─── ❖ 『 📈 *PANGKAT & LEVEL* 』 ❖\n` +
    `│ 🎖️ *Rank:* *${rankInfo.title}*\n` +
    `│ ⭐ *Tier Star:* ${rankInfo.starBar}\n` +
    `│ 📊 *Level:* *Lv.${userLevel}* ${rankInfo.nextRank ? `(Target: ${rankInfo.nextRank.title} Lv.${rankInfo.nextRank.min})` : "(MAX TIER)"}\n` +
    `│ ✨ *Total EXP:* ${fmt(userExp)} XP\n` +
    `│ 🔋 *Progres:* [${getLevelBar(expInLevel, expNeeded, 10)}] *${expPct}%*\n` +
    `│ ◦ _${fmt(expInLevel)} / ${fmt(expNeeded)} XP menuju Lv.${userLevel + 1}_\n` +
    `├─── ❖ 『 💰 *KEKAYAAN & ENERGI* 』 ❖\n` +
    `│ 💵 *Monedas en cartera:* Rp ${fmt(koin)}\n` +
    `│ 🏦 *Saldo bancario:* Rp ${fmt(bank)}\n` +
    `│ 🪙 *Oro y diamantes:* ${fmt(gold)} Gold • ${fmt(diamond)} Diamond\n` +
    `│ ⚡ *Energi Akses:* ${energiDisplay}\n` +
    `├─── ❖ 『 ⚔️ *ATRIBUTOS DEL AVENTURERO* 』 ❖\n` +
    `│ ❤️ *HP:* [${statBar(hp, maxHp)}] ${hp}/${maxHp}\n` +
    `│ 💙 *MP:* [${statBar(mp, maxMp)}] ${mp}/${maxMp}\n` +
    `│ ⚡ *STA:* [${statBar(sta, maxSta)}] ${sta}/${maxSta}\n` +
    `├─── ❖ 『 📱 *INFO WHATSAPP* 』 ❖\n` +
    `│ 📞 *Número:* +${phone}\n` +
    `│ 💬 *Bio:* ${bioStatus}\n` +
    `│ 🏢 *Tipo de cuenta:* ${isBiz ? "WhatsApp Business 💼" : "WhatsApp Personal 📱"}\n` +
    `│ 💻 *Perangkat:* ${deviceInfo?.device || "Mobile / Web"}\n`;

  if (user.inventory && Object.keys(user.inventory).length > 0) {
    const invItems = Object.entries(user.inventory)
      .filter(([_, qty]) => Number(qty) > 0)
      .slice(0, 8);
    if (invItems.length > 0) {
      caption += `├─── ❖ 『 🎒 *KOLEKSI TAS UTAMA* 』 ❖\n`;
      for (const [item, qty] of invItems) {
        caption += `│ 📦 *${item}:* ${fmt(qty)}x\n`;
      }
    }
  }

  caption +=
    `╰──────────────────────────❖\n` +
    `_✦ Tipo *${m.prefix || "."}nivel* o *${m.prefix || "."}Claimlevel* para reclamar premios para subir de nivel!_`;

  // Foto profil pengguna; kalau tidak ada / privasi -> pp kosong.
  const hasPp = Boolean(ppUrl) && ppUrl !== DEFAULT_PP;
  const profileImage = hasPp ? { url: ppUrl } : await getBlankAvatar();

  try {
    await sock.sendMessage(
      m.chat,
      {
        image: profileImage,
        caption,
        mentions: [resolvedJid],
      },
      { quoted: m }
    );
  } catch {
    await m.reply(caption, { mentions: [resolvedJid] });
  }
}

export { pluginConfig as config, handler };
