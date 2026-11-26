/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import fs from "fs";
import te from "../../src/lib/core/error.js";
import { saluranCtx } from "../../src/lib/core/context.js";
const pluginConfig = {
  name: "sewabot",
  alias: [],
  category: "owner",
  description: "Toggle dan kelola sistem sewa bot",
  usage: ".sewabot <on/off/leave/status>",
  example: ".sewabot on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
const pendingConfirmations = new Map();
async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.text?.trim()?.toLowerCase();
  if (!db.db.data.sewa) {
    db.db.data.sewa = { enabled: false, groups: {} };
    db.db.write();
  }
  const currentStatus = db.db.data.sewa.enabled;
  const sewaGroups = Object.keys(db.db.data.sewa.groups || {});
  if (!args || args === "status") {
    return m.reply(
      `🔧 *SISTEMA DE ALQUILER DEL BOT*\n\n` +
        `Estado: *${currentStatus ? "✅ ACTIVO" : "❌ INACTIVO"}*\n` +
        `Grupos registrados: *${sewaGroups.length}*\n\n` +
        `*COMANDOS DISPONIBLES:*\n` +
        `• *${m.prefix}sewabot on* — Activar el sistema de alquiler\n` +
        `• *${m.prefix}sewabot off* — Nonaktifkan sistem sewa\n` +
        `• *${m.prefix}sewabot leave* — Sal de todos los grupos fuera de la lista de alquiler\n\n` +
        `*GESTIÓN DEL ALQUILER:*\n` +
        `• *${m.prefix}addsewa <link> <durasi>* — Añadir grupo + unirse automáticamente\n` +
        `• *${m.prefix}delsewa <link/id>* — Elimina el grupo de la lista de alquiler\n` +
        `• *${m.prefix}renewsewa <link/id> <durasi>* — Perpanjang sewa\n` +
        `• *${m.prefix}listsewa* — Ver todos los grupos registrados\n` +
        `• *${m.prefix}checksewa* — Comprueba el alquiler restante (en el grupo)\n\n` +
        `*FORMATOS DE DURACIÓN:*\n` +
        `30i (minutos) \u2022 12h (horas) \u2022 7d (días) \u2022 1m (meses) \u2022 1y (años) \u2022 lifetime\n\n` +
        `*CARA KERJA:*\n` +
        `1. Añade el grupo con *${m.prefix}addsewa*\n` +
        `2. El bot se une automáticamente si usas un enlace\n` +
        `3. Actívalo con *${m.prefix}sewabot on*\n` +
        `4. El bot saldrá de todos los grupos no registrados\n` +
        `5. Alquiler vencido → el bot sale del grupo automáticamente`,
    );
  }
  if (args === "off") {
    db.db.data.sewa.enabled = false;
    db.db.write();
    await m.react("✅");
    return m.reply(
      `✅ Sistema de alquiler desactivado\n\nEl bot no saldrá de ningún grupo.`,
    );
  }
  if (args === "on") {
    const pending = pendingConfirmations.get(m.sender);
    if (
      pending &&
      pending.type === "sewabot_on" &&
      Date.now() - pending.timestamp < 60000
    ) {
      return m.reply(
        `🕕 Ya hay una solicitud pendiente\n\nEscribe *${m.prefix}sewabot confirm* para continuar\nEscribe *${m.prefix}sewabot cancel* para cancelar`,
      );
    }
    pendingConfirmations.set(m.sender, {
      type: "sewabot_on",
      timestamp: Date.now(),
    });
    setTimeout(() => {
      if (pendingConfirmations.get(m.sender)?.type === "sewabot_on")
        pendingConfirmations.delete(m.sender);
    }, 60000);
    return m.reply(
      `⚠️ *CONFIRMACIÓN DE ACTIVACIÓN DEL ALQUILER*\n\n` +
        `Si se activa:\n` +
        `• ✅ ${sewaGroups.length} grupos en la lista blanca siguen seguros\n` +
        `• ❌ ¡Se abandonarán todos los demás grupos!\n\n` +
        `Escribe *${m.prefix}sewabot confirm* para continuar\nEscribe *${m.prefix}sewabot cancel* para cancelar\n\n` +
        `💡 Asegúrate de registrar los grupos importantes con:\n*${m.prefix}addsewa <enlace del grupo> <duración>*`,
    );
  }
  if (args === "confirm" || args === "yes" || args === "y") {
    const pending = pendingConfirmations.get(m.sender);
    if (!pending || pending.type !== "sewabot_on") {
      return m.reply(
        `❌ No hay solicitudes pendientes\nEscribe *${m.prefix}sewabot on* primero`,
      );
    }
    pendingConfirmations.delete(m.sender);
    db.db.data.sewa.enabled = true;
    db.db.write();
    await m.react("🕕");
    await m.reply(`🕕 Sistema de alquiler activado, procesando la salida automática...`);
    try {
      global.isFetchingGroups = true;
      const allGroups = await sock.groupFetchAllParticipating();
      global.isFetchingGroups = false;
      const allGroupIds = Object.keys(allGroups);
      const unlistedGroups = allGroupIds.filter(
        (id) => !sewaGroups.includes(id),
      );
      let leftCount = 0;
      let failedCount = 0;
      for (const groupId of unlistedGroups) {
        try {
          await sock.sendText(
            groupId,
            `⛔ Este grupo no está registrado en el sistema de alquiler.\nEl bot saldrá de este grupo.\n\nContacta al owner para alquilar el bot.`,
            null,
            {
              contextInfo: saluranCtx(),
            },
          );
          await new Promise((r) => setTimeout(r, 2000));
          await sock.groupLeave(groupId);
          leftCount++;
          await new Promise((r) => setTimeout(r, 3000));
        } catch {
          failedCount++;
        }
      }
      await m.react("✅");
      return m.reply(
        `✅ *ALQUILER DEL BOT ACTIVO*\n\n` +
          `Grupos en la lista blanca: *${sewaGroups.length}*\n` +
          `Salida de: *${leftCount}* grupos\n` +
          `Fallidos: *${failedCount}* grupos`,
      );
    } catch (e) {
      await m.react("✅");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (args === "leave") {
    if (!currentStatus)
      return m.reply(`❌ Activa primero sewabot con *${m.prefix}sewabot on*`);
    await m.react("🕕");
    await m.reply(`🕕 Obteniendo la lista de grupos...`);
    global.sewaLeaving = true;
    try {
      global.isFetchingGroups = true;
      const allGroups = await sock.groupFetchAllParticipating();
      global.isFetchingGroups = false;
      const allGroupIds = Object.keys(allGroups);
      const unlistedGroups = allGroupIds.filter(
        (id) => !sewaGroups.includes(id),
      );
      if (unlistedGroups.length === 0) {
        delete global.sewaLeaving;
        await m.react("✅");
        return m.reply(`✅ No hay grupos de los que salir`);
      }
      await m.reply(
        `📊 Total: ${allGroupIds.length} grupos\nEn lista de alquiler: ${sewaGroups.length}\nSalida de: ${unlistedGroups.length} grupos`,
      );
      let leftCount = 0;
      let failedCount = 0;
      for (const groupId of unlistedGroups) {
        try {
          await sock.sendText(
            groupId,
            `👋 Este grupo no está registrado en el sistema de alquiler.\nEl bot saldrá de este grupo.\n\nContacta al owner para alquilar el bot.`,
            null,
            {
              contextInfo: saluranCtx(),
            },
          );
          await new Promise((r) => setTimeout(r, 3000));
          await sock.groupLeave(groupId);
          leftCount++;
          await new Promise((r) => setTimeout(r, 5000));
        } catch {
          failedCount++;
        }
      }
      delete global.sewaLeaving;
      await m.react("✅");
      return m.reply(
        `✅ Terminado\n\nSalidas correctas: *${leftCount}* grupos\nFallidos: *${failedCount}* grupos`,
      );
    } catch (e) {
      delete global.sewaLeaving;
      await m.react("☢");
      await m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (args === "cancel" || args === "no" || args === "n") {
    const pending = pendingConfirmations.get(m.sender);
    if (!pending || pending.type !== "sewabot_on")
      return m.reply(`❌ No hay solicitudes pendientes`);
    pendingConfirmations.delete(m.sender);
    await m.react("❌");
    return m.reply(
      `❌ Activación cancelada\nRegistra primero el grupo con *${m.prefix}addsewa*`,
    );
  }
  return m.reply(
    `❌ Comando no válido\n\nEscribe *${m.prefix}sewabot* para ver la guía completa`,
  );
}
export { pluginConfig as config, handler, pendingConfirmations };
