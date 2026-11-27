/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import * as timeHelper from "../../src/lib/core/time.js";
import fs from "fs";
import te from "../../src/lib/core/error.js";
import { saluranCtx } from "../../src/lib/core/context.js";
const pluginConfig = {
  name: "renewsewa",
  alias: ["perpanjangsewa", "extendsewa"],
  category: "owner",
  description: "Amplía la duración del alquiler del grupo",
  usage: ".renewsewa <enlace/id del grupo> <duración>",
  example: ".renewsewa https://chat.whatsapp.com/xxx 30d",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function parseDurationMs(str) {
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
  return multiplier[unit] ? value * multiplier[unit] : null;
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
  const units = { i: "minutos", h: "horas", d: "días", m: "meses", y: "años" };
  return `${match[1]} ${units[match[2].toLowerCase()] || match[2]}`;
}

async function resolveGroupId(sock, input) {
  if (input.includes("chat.whatsapp.com/")) {
    const inviteCode = input.split("chat.whatsapp.com/")[1]?.split(/[\s?]/)[0];
    if (!inviteCode) return null;
    try {
      const metadata = await sock.groupGetInviteInfo(inviteCode);
      if (!metadata?.id) return null;
      return { id: metadata.id, name: metadata.subject || "Unknown" };
    } catch {
      return null;
    }
  }
  const groupId = input.includes("@g.us") ? input : input + "@g.us";
  return { id: groupId, name: null };
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
      `📝 *RENOVAR ALQUILER*\n\n` +
        `Formato: *${m.prefix}renewsewa <enlace/id> <duración>*\n\n` +
        `*FORMATOS DE DURACIÓN:*\n` +
        `• 30i = 30 minutos\n` +
        `• 12h = 12 horas\n` +
        `• 7d = 7 días\n` +
        `• 1m = 1 mes\n` +
        `• 1y = 1 año\n` +
        `• lifetime = Permanent\n\n` +
        `*EJEMPLO:*\n` +
        `• ${m.prefix}renewsewa https://chat.whatsapp.com/xxx 30d\n` +
        `• ${m.prefix}renewsewa 120363xxx 1m\n\n` +
        `💡 La duración se suma al tiempo restante; no se reinicia`,
    );
  }

  const input = args[0];
  const durationStr = args[1];
  const durationMs = parseDurationMs(durationStr);

  if (!durationMs)
    return m.reply(
      `❌ Formato de duración no válido\nContoh: 7d, 1m, 1y, lifetime`,
    );

  await m.react("🕕");

  try {
    const result = await resolveGroupId(sock, input);
    if (!result) {
      await m.react("❌");
      return m.reply(`❌ Grupo no encontrado`);
    }

    const { id: groupId } = result;
    const existing = db.db.data.sewa.groups[groupId];

    if (!existing) {
      await m.react("❌");
      return m.reply(
        `❌ El grupo no está registrado\nUsa *${m.prefix}addsewa* para añadirlo`,
      );
    }

    if (durationMs === Infinity) {
      existing.expiredAt = 0;
      existing.isLifetime = true;
    } else {
      if (existing.isLifetime) {
        await m.react("❌");
        return m.reply(`❌ Este grupo ya es permanente; no hace falta renovarlo`);
      }
      const baseTime =
        existing.expiredAt > Date.now() ? existing.expiredAt : Date.now();
      existing.expiredAt = baseTime + durationMs;
      existing.isLifetime = false;
    }

    existing.renewedAt = Date.now();
    existing.renewedBy = m.sender;
    if (existing.status) delete existing.status;
    db.db.write();

    const groupName = existing.name || groupId.split("@")[0];
    const expiredStr = existing.isLifetime
      ? "Permanent"
      : timeHelper.fromTimestamp(existing.expiredAt, "D MMMM YYYY HH:mm");

    await m.react("✅");

    let text = `✅ *ALQUILER RENOVADO*\n\n`;
    text += `Grupo: *${groupName}*\n`;
    text += `Añadido: *${formatDuration(durationStr)}*\n`;
    text += `Nueva caducidad: *${expiredStr}*`;

    try {
      await sock.sendText(
        groupId,
        `📢 ¡El alquiler del bot se ha renovado!\n\nAñadido: *${formatDuration(durationStr)}*\nNueva caducidad: *${expiredStr}*`,
        null,
        {
          contextInfo: saluranCtx(),
        },
      );
    } catch {}

    return m.reply(text);
  } catch (error) {
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
