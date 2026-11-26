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
import * as timeHelper from "../../src/lib/core/time.js";
import fs from "fs";
import te from "../../src/lib/core/error.js";
import { saluranCtx } from "../../src/lib/core/context.js";
const pluginConfig = {
  name: "addsewa",
  alias: ["sewaadd", "tambahsewa"],
  category: "owner",
  description: "Tambah grup ke whitelist sewa + auto join",
  usage: ".addsewa <link/id grup> <durasi>",
  example: ".addsewa https://chat.whatsapp.com/xxx 30d",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function parseDuration(str) {
  if (
    ["lifetime", "permanent", "forever", "unlimited"].includes(
      str.toLowerCase(),
    )
  )
    return Infinity;
  const match = str.match(/^(\d+)([iIdDmMyYhH])$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = {
    i: 60000,
    h: 3600000,
    d: 86400000,
    m: 2592000000,
    y: 31536000000,
  };
  return multiplier[unit] ? Date.now() + value * multiplier[unit] : null;
}

function formatDuration(str) {
  if (
    ["lifetime", "permanent", "forever", "unlimited"].includes(
      str.toLowerCase(),
    )
  )
    return "Permanent";
  const match = str.match(/^(\d+)([iIdDmMyYhH])$/);
  if (!match) return str;
  const units = { i: "menit", h: "jam", d: "hari", m: "bulan", y: "tahun" };
  return `${match[1]} ${units[match[2].toLowerCase()] || match[2]}`;
}

async function resolveGroupId(sock, input) {
  if (input.includes("chat.whatsapp.com/")) {
    const inviteCode = input.split("chat.whatsapp.com/")[1]?.split(/[\s?]/)[0];
    if (!inviteCode) return null;
    try {
      const metadata = await sock.groupGetInviteInfo(inviteCode);
      console.log(metadata);
      if (!metadata?.id) return null;
      return {
        id: metadata.id,
        name: metadata.subject || "Unknown",
        inviteCode,
      };
    } catch {
      return null;
    }
  }
  const groupId = input.includes("@g.us") ? input : input + "@g.us";
  try {
    const metadata = await sock.groupMetadata(groupId);
    return {
      id: groupId,
      name: metadata?.subject || "Unknown",
      inviteCode: null,
    };
  } catch {
    return { id: groupId, name: "Unknown", inviteCode: null };
  }
}

async function tryJoinGroup(sock, inviteCode, groupId) {
  if (!inviteCode)
    return {
      joined: false,
      reason: "No hay código de invitación; añade el bot manualmente",
    };
  try {
    const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
    const metadata = await sock.groupMetadata(groupId).catch(() => null);
    if (metadata) {
      const isMember = metadata.participants?.some((p) => {
        const pJid = p.id?.split(":")[0] + "@s.whatsapp.net";
        return pJid === botJid || p.id === botJid;
      });
      if (isMember) return { joined: true, reason: "El bot ya está en el grupo" };
    }
    await sock.groupAcceptInvite(inviteCode);
    return { joined: true, reason: "El bot se unió al grupo" };
  } catch (e) {
    return { joined: false, reason: e.message || "No se pudo unir al grupo" };
  }
}

async function handler(m, { sock }) {
  const db = getDatabase();
  if (!db.db.data.sewa) {
    db.db.data.sewa = { enabled: false, groups: {} };
    db.db.write();
  }

  const args = m.args;
  if (args.length < 2) {
    return m.reply(
      `📝 *TAMBAH SEWA*\n\n` +
        `Formato: *${m.prefix}addsewa <enlace/id> <duración>*\n\n` +
        `*FORMATOS DE DURACIÓN:*\n` +
        `• 30i = 30 minutos\n` +
        `• 12h = 12 horas\n` +
        `• 7d = 7 días\n` +
        `• 1m = 1 mes (30 días)\n` +
        `• 1y = 1 año\n` +
        `• lifetime = Permanent\n\n` +
        `*INPUT GRUP:*\n` +
        `• Link: https://chat.whatsapp.com/xxx\n` +
        `• ID: 120363xxx@g.us\n\n` +
        `*EJEMPLO:*\n` +
        `• ${m.prefix}addsewa https://chat.whatsapp.com/xxx 30d\n` +
        `• ${m.prefix}addsewa 120363xxx 1m\n\n` +
        `💡 Si usas un enlace, ¡el bot se unirá automáticamente a ese grupo!`,
    );
  }

  const input = args[0];
  const durationStr = args[1];
  const expiredAt = parseDuration(durationStr);

  if (!expiredAt)
    return m.reply(
      `❌ Formato de duración no válido\n\nContoh: 7d, 1m, 1y, lifetime`,
    );

  await m.react("🕕");

  try {
    const result = await resolveGroupId(sock, input);
    if (!result) {
      await m.react("❌");
      return m.reply(`❌ Grupo no encontrado o enlace no válido`);
    }

    const { id: groupId, name: groupName, inviteCode } = result;
    const isLifetime = expiredAt === Infinity;

    db.db.data.sewa.groups[groupId] = {
      name: groupName,
      addedAt: Date.now(),
      expiredAt: isLifetime ? 0 : expiredAt,
      isLifetime,
      addedBy: m.sender,
    };
    db.db.write();

    const expiredStr = isLifetime
      ? "Permanent"
      : timeHelper.fromTimestamp(expiredAt, "D MMMM YYYY HH:mm");

    let text = `✅ *ALQUILER AÑADIDO*\n\n`;
    text += `Grup: *${groupName}*\n`;
    text += `ID: ${groupId.split("@")[0]}\n`;
    text += `Duración: *${formatDuration(durationStr)}*\n`;
    text += `Expired: *${expiredStr}*\n\n`;

    const joinResult = await tryJoinGroup(sock, inviteCode, groupId);

    if (joinResult.joined) {
      text += `✅ ${joinResult.reason}`;
      try {
        await new Promise((r) => setTimeout(r, 2000));
        await sock.sendText(
          groupId,
          `👋 *¡Hola a todos!*, les presento, soy ${config.bot?.name}\n\n- Duración del alquiler: *${formatDuration(durationStr)}*\n- Saldré el: *${expiredStr}*\n\nEscribe *${m.prefix}menu* para ver las funciones de este bot.`,
          null,
          {
            contextInfo: saluranCtx(),
          },
        );
      } catch {}
    } else {
      text += `⚠️ Error al unirse automáticamente: ${joinResult.reason}\nAñade el bot al grupo manualmente.`;
    }

    await m.react("✅");
    return m.reply(text);
  } catch (error) {
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
