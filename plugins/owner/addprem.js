/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import { getDatabase } from "../../src/lib/data/database.js";
import {
  addJadibotPremium,
  removeJadibotPremium,
  getJadibotPremiums,
} from "../../src/lib/data/jadibot-database.js";

const pluginConfig = {
  name: "addprem",
  alias: [
    "addpremium",
    "setprem",
    "delprem",
    "delpremium",
    "listprem",
    "premlist",
  ],
  category: "owner",
  description: "Kelola premium users dengan durasi fleksibel (day / m / jam)",
  usage:
    ".addprem <nomor/@tag> [waktu: 30day / 15m / 2day 30m]\n.delprem <nomor/@tag>\n.listprem",
  example: ".addprem 6281234567890 30day",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function formatDateTime(ts) {
  return new Date(ts).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRemaining(ms) {
  if (ms <= 0) return "Expired";
  const totalMin = Math.ceil(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0 && days === 0) parts.push(`${mins}m`);
  return parts.join(" ") || "<1m";
}

function extractTargetAndRemainingArgs(m, sock) {
  const args = Array.isArray(m.args) ? [...m.args] : [];
  let targetNumber = "";

  if (m.quoted?.sender) {
    let raw = m.quoted.sender;
    if (raw.endsWith("@lid") && sock?.getJid) raw = sock.getJid(raw) || raw;
    targetNumber = raw.split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
    return { targetNumber, durationArgs: args };
  }

  if (m.mentionedJid?.length) {
    let raw = m.mentionedJid[0];
    if (raw.endsWith("@lid") && sock?.getJid) raw = sock.getJid(raw) || raw;
    targetNumber = raw.split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
    const durationArgs = args.filter((a) => !a.startsWith("@"));
    return { targetNumber, durationArgs };
  }

  if (args.length > 0) {
    const firstDigits = String(args[0]).replace(/[^0-9]/g, "");
    if (firstDigits.length >= 10 && firstDigits.length <= 15) {
      targetNumber = firstDigits;
      return { targetNumber, durationArgs: args.slice(1) };
    }
  }

  return { targetNumber: "", durationArgs: args };
}

/**
 * Parse durasi fleksibel: bisa day saja (30day / 30d), m saja (15m / 15menit),
 * jam saja (2jam / 2h), atau gabungan (2day 30m).
 */
function parseDurationArgs(durationArgs) {
  const joined = (durationArgs || []).join(" ").trim();
  if (!joined) {
    return {
      ms: 30 * 24 * 60 * 60 * 1000,
      label: "30 hari",
    };
  }

  const tokenRe = /(\d+)\s*(days?|hari|d|jam|hr|hours?|j|h|menit|mins?|m)\b/gi;
  let totalMs = 0;
  let totalDays = 0;
  let totalHours = 0;
  let totalMins = 0;
  let matched = false;

  for (const match of joined.matchAll(tokenRe)) {
    matched = true;
    const val = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (!Number.isFinite(val) || val <= 0) continue;

    if (["day", "days", "d", "hari"].includes(unit)) {
      totalDays += val;
      totalMs += val * 24 * 60 * 60 * 1000;
    } else if (["m", "min", "mins", "menit"].includes(unit)) {
      totalMins += val;
      totalMs += val * 60 * 1000;
    } else if (["j", "jam", "h", "hr", "hour", "hours"].includes(unit)) {
      totalHours += val;
      totalMs += val * 60 * 60 * 1000;
    }
  }

  // Fallback jika user hanya mengetik angka polos (misal: .addprem 628xxx 30 -> 30 hari)
  if (!matched && /^\d{1,4}$/.test(joined)) {
    const val = parseInt(joined, 10);
    if (val > 0) {
      totalDays = val;
      totalMs = val * 24 * 60 * 60 * 1000;
      matched = true;
    }
  }

  if (!matched || totalMs <= 0) {
    return null;
  }

  const parts = [];
  if (totalDays > 0) parts.push(`${totalDays} hari`);
  if (totalHours > 0) parts.push(`${totalHours} jam`);
  if (totalMins > 0) parts.push(`${totalMins} menit`);

  return { ms: totalMs, label: parts.join(" ") };
}

function toMentionJid(value) {
  const number = String(value || "").replace(/[^0-9]/g, "");
  return number ? `${number}@s.whatsapp.net` : null;
}

async function handler(m, { sock, jadibotId, isJadibot }) {
  const db = getDatabase();
  const cmd = m.command.toLowerCase();
  const p = m.prefix || ".";

  const isAdd = ["addprem", "addpremium", "setprem"].includes(cmd);
  const isDel = ["delprem", "delpremium"].includes(cmd);
  const isList = ["listprem", "premlist"].includes(cmd);

  if (!db.data.premium) db.data.premium = [];

  if (isList) {
    if (isJadibot && jadibotId) {
      const jbPremiums = getJadibotPremiums(jadibotId);
      if (jbPremiums.length === 0) {
        return m.reply(
          `💎 Belum ada premium di jadibot ini\nGunakan \`${p}addprem\` untuk menambah`,
        );
      }
      let txt = `💎 *DAFTAR PREMIUM JADIBOT* — ${jadibotId}\n\n`;
      const mentions = jbPremiums
        .map((item) => (typeof item === "string" ? item : item.jid))
        .map(toMentionJid)
        .filter(Boolean);
      jbPremiums.forEach((item, i) => {
        const num = typeof item === "string" ? item : item.jid;
        const number = String(num || "").replace(/[^0-9]/g, "");
        txt += `${i + 1}. @${number}\n`;
      });
      txt += `\nTotal: *${jbPremiums.length}* premium`;
      return m.reply(txt, { mentions });
    }

    if (db.data.premium.length === 0) {
      return m.reply(`💎 Belum ada premium terdaftar`);
    }
    let txt = `💎 *DAFTAR PREMIUM*\n\n`;
    const now = Date.now();
    const mentions = db.data.premium
      .map((item) => (typeof item === "string" ? item : item.id))
      .map(toMentionJid)
      .filter(Boolean);
    db.data.premium.forEach((item, i) => {
      const num = typeof item === "string" ? item : item.id;
      const status =
        typeof item === "object" && item.expired
          ? formatRemaining(item.expired - now)
          : "Permanent";
      const number = String(num || "").replace(/[^0-9]/g, "");
      txt += `${i + 1}. @${number} — ${status}\n`;
    });
    txt += `\nTotal: *${db.data.premium.length}* premium`;
    return m.reply(txt, { mentions });
  }

  let { targetNumber, durationArgs } = extractTargetAndRemainingArgs(m, sock);

  if (!targetNumber) {
    return m.reply(
      `💎 *${isAdd ? "ADD" : "DEL"} PREMIUM*\n\n` +
        `Masukkan nomor, @tag, atau reply pesan user.\n\n` +
        `📌 *Contoh (bisa salah satu atau digabung):*\n` +
        `• \`${p}${cmd} 6281234567890 30day\` (hari)\n` +
        `• \`${p}${cmd} 6281234567890 5h\` (jam)\n` +
        `• \`${p}${cmd} 6281234567890 30m\` (menit)\n` +
        `• \`${p}${cmd} 6281234567890 2day 5h 30m\` (gabungan)\n` +
        `• \`${p}${cmd} 6281234567890\` (default 30 hari)`,
    );
  }

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`❌ Format nomor tidak valid`);
  }

  if (isJadibot && jadibotId) {
    if (isAdd) {
      if (addJadibotPremium(jadibotId, targetNumber)) {
        await m.react("💎");
        return m.reply(
          `✅ Berhasil menambahkan *${targetNumber}* sebagai premium jadibot`,
        );
      }
      return m.reply(`❌ \`${targetNumber}\` sudah premium di Jadibot ini`);
    } else if (isDel) {
      if (removeJadibotPremium(jadibotId, targetNumber)) {
        await m.react("✅");
        return m.reply(
          `✅ Berhasil menghapus *${targetNumber}* dari premium jadibot`,
        );
      }
      return m.reply(`❌ \`${targetNumber}\` bukan premium di Jadibot ini`);
    }
    return;
  }

  if (isAdd) {
    const parsed = parseDurationArgs(durationArgs);
    if (!parsed) {
      return m.reply(
        `❌ Format waktu tidak valid!\n\n` +
          `Gunakan satuan *day* (hari), *m* (menit), atau *jam*:\n` +
          `• \`${p}${cmd} ${targetNumber} 7day\`\n` +
          `• \`${p}${cmd} ${targetNumber} 30m\`\n` +
          `• \`${p}${cmd} ${targetNumber} 1day 30m\``,
      );
    }

    const { ms: durationMs, label: durationLabel } = parsed;
    const existingIndex = db.data.premium.findIndex((item) =>
      typeof item === "string" ? item === targetNumber : item.id === targetNumber,
    );

    const pushName = m.quoted?.pushName || m.pushName || "Unknown";
    const now = Date.now();
    let newExpired;

    if (existingIndex !== -1) {
      const currentData = db.data.premium[existingIndex];
      const currentExpired =
        typeof currentData === "string" ? now : currentData.expired || now;
      const baseTime = currentExpired > now ? currentExpired : now;
      newExpired = baseTime + durationMs;

      if (typeof currentData === "string") {
        db.data.premium[existingIndex] = {
          id: targetNumber,
          expired: newExpired,
          name: pushName,
          addedAt: now,
        };
      } else {
        db.data.premium[existingIndex].expired = newExpired;
        db.data.premium[existingIndex].name = pushName;
      }
    } else {
      newExpired = now + durationMs;
      db.data.premium.push({
        id: targetNumber,
        expired: newExpired,
        name: pushName,
        addedAt: now,
      });
    }

    const jid = targetNumber + "@s.whatsapp.net";
    const user = db.getUser(jid) || db.setUser(jid);

    if (user.energi !== -1) {
      user.energi = config.energi?.premium ?? -1;
    }
    user.isPremium = true;

    db.setUser(jid, user);
    db.updateExp(jid, 200000);
    db.save();

    await m.react("💎");
    return m.reply(
      `✅ Berhasil ${existingIndex !== -1 ? "memperpanjang" : "menambahkan"} premium *${targetNumber}* selama *${durationLabel}*\nExpired: *${formatDateTime(newExpired)}*`,
    );
  } else if (isDel) {
    const index = db.data.premium.findIndex((item) =>
      typeof item === "string" ? item === targetNumber : item.id === targetNumber,
    );

    if (index === -1) {
      return m.reply(`❌ *${targetNumber}* bukan premium`);
    }

    db.data.premium.splice(index, 1);

    const jid = targetNumber + "@s.whatsapp.net";
    const user = db.getUser(jid);
    if (user) {
      user.isPremium = false;
      db.setUser(jid, user);
    }

    db.save();
    await m.react("✅");
    return m.reply(`✅ Berhasil menghapus *${targetNumber}* dari premium`);
  }
}

export { pluginConfig as config, handler };
