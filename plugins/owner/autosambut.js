/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";

const pluginConfig = {
  name: "autosambut",
  alias: ["sambutowner"],
  category: "group",
  description: "Mengatur fitur sambutan otomatis saat owner muncul setelah lama idle",
  usage: ".autosambut on/off/delay/add/del/list",
  example: ".autosambut on",
  isOwner: true,
  isGroup: true,
  cooldown: 3,
  isEnabled: true,
};

function parseTime(str) {
  const match = str.match(/^([\d.]+)([a-zA-Z]+)$/);
  if (!match) return null;
  const val = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith('s')) return val * 1000;
  if (unit.startsWith('m')) return val * 60 * 1000;
  if (unit.startsWith('h')) return val * 60 * 60 * 1000;
  if (unit.startsWith('d')) return val * 24 * 60 * 60 * 1000;
  if (unit.startsWith('w')) return val * 7 * 24 * 60 * 60 * 1000;
  if (unit.startsWith('y')) return val * 365 * 24 * 60 * 60 * 1000;
  return null;
}

function formatTime(ms) {
  if (ms < 60000) return `${ms / 1000} segundos`;
  if (ms < 3600000) return `${ms / 60000} minutos`;
  if (ms < 86400000) return `${ms / 3600000} horas`;
  if (ms < 604800000) return `${ms / 86400000} días`;
  return `${ms / 86400000} días`;
}

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const isGlobal = args.includes("--global");

  const database = getDatabase();
  let groupData = database.getGroup(m.chat);
  if (!groupData.autoSambut) {
    groupData.autoSambut = {
      enabled: false,
      delayMs: 2 * 60 * 60 * 1000,
      pesanList: ["¡Hola {user}! Bienvenido de nuevo 🙇‍♂️"],
      lastChats: {}
    };
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
  }
  if (groupData.autoSambut.pesan !== undefined) {
    if (!groupData.autoSambut.pesanList) {
      groupData.autoSambut.pesanList = [groupData.autoSambut.pesan];
    }
    delete groupData.autoSambut.pesan;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
  }
  // Fallback
  if (!Array.isArray(groupData.autoSambut.pesanList) || groupData.autoSambut.pesanList.length === 0) {
    groupData.autoSambut.pesanList = ["¡Hola {user}! Bienvenido de nuevo 🙇‍♂️"];
  }

  if (!action) {
    const status = groupData.autoSambut.enabled ? "Activo ✅" : "Inactivo ❌";
    const delayMs = groupData.autoSambut.delayMs || 7200000;
    const totalPesan = groupData.autoSambut.pesanList.length;

    return m.reply(
      `⚠️ *SISTEM AUTO SAMBUT*\n\n` +
      `El sistema saluda al owner en el grupo de forma aleatoria cuando aparece tras mucho tiempo inactivo.\n` +
      `Estado: *${status}*\n` +
      `Límite de inactividad: *${formatTime(delayMs)}*\n` +
      `Mensajes aleatorios: *${totalPesan} saludos*\n\n` +
      `*USO PRINCIPAL:*\n` +
      `• *${m.prefix}autosambut on/off* — Activa/desactiva la función en este grupo\n` +
      `• *${m.prefix}autosambut delay <waktu>* — Cambia el límite de inactividad\n\n` +
      `*AJUSTES DE MENSAJES ALEATORIOS (LISTA):*\n` +
      `• *${m.prefix}autosambut list* — Ver todos los saludos registrados\n` +
      `• *${m.prefix}autosambut add <texto>* — Añadir un nuevo saludo a la lista\n` +
      `• *${m.prefix}autosambut del <angka>* — Eliminar el mensaje de un número de la lista\n\n` +
      `*PENJELASAN KHUSUS:*\n` +
      `1. Usa el formato de tiempo: *s* (segundos), *m* (minutos), *h* (horas), *d* (días). Ejemplo: *${m.prefix}autosambut delay 30m*\n` +
      `2. Usa *{name}* para nombrar al owner y *{user}* para mencionarlo.\n` +
      `3. Si añades *--global* al final de cada comando, ¡los ajustes de *este* grupo se copiarán a TODOS los grupos donde esté el bot!`
    );
  }

  if (action === "on" || action === "off") {
    const isEnable = action === "on";
    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: isEnable,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`${isEnable ? '✅' : '❌'} *¡Saludo automático global ${isEnable ? 'activado' : 'desactivado'}!*\n\nTodos los grupos (${count}) usan ahora el mismo sistema de saludo que este grupo.`);
    }

    groupData.autoSambut.enabled = isEnable;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
    return m.reply(isEnable ? `✅ *¡Saludo automático activado!*` : `❌ *Saludo automático desactivado.*`);
  }

  if (action === "delay") {
    const timeInput = args[1];
    if (!timeInput) return m.reply(`¡Indica un tiempo! Ejemplo: \`${m.prefix}autosambut delay 2h\``);

    const parsedMs = parseTime(timeInput);
    if (!parsedMs) {
      return m.reply(`Formato de tiempo no reconocido. Usa un número y las terminaciones s, m, h, d, w, y. Ejemplo: \`2h\` (2 horas), \`30m\` (30 minutos).`);
    }

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: parsedMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`⏱️ *¡Retardo del saludo automático global cambiado a ${formatTime(parsedMs)} para ${count} grupos!*`);
    }

    groupData.autoSambut.delayMs = parsedMs;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
    return m.reply(`⏱️ *¡Retardo del saludo automático cambiado!*\n\nAhora el bot te saludará cuando estés *${formatTime(parsedMs)}* sin escribir nada en este grupo.`);
  }

  if (action === "list") {
    let listText = `📜 *LISTA DE MENSAJES DE SALUDO*\n\nHay *${groupData.autoSambut.pesanList.length}* saludos aleatorios registrados en este grupo:\n\n`;
    groupData.autoSambut.pesanList.forEach((text, index) => {
      listText += `*${index + 1}.* ${text}\n\n`;
    });
    listText += `_Usa \`${m.prefix}autosambut del <número>\` para eliminar uno._`;
    return m.reply(listText);
  }

  if (action === "add") {
    const newMsg = args.slice(1).filter(v => v !== '--global').join(" ").trim();
    if (!newMsg) {
      return m.reply(`Escribe el texto del saludo.\nEjemplo: \`${m.prefix}autosambut add ¡Hola jefe {user}!\``);
    }

    groupData.autoSambut.pesanList.push(newMsg);
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`💬 *¡Nuevo mensaje añadido a la lista global (${count} grupos)!*\n\nMensaje registrado:\n"${newMsg}"`);
    }

    return m.reply(`💬 *¡Nuevo mensaje añadido!*\nAhora hay ${groupData.autoSambut.pesanList.length} saludos aleatorios en la lista.`);
  }

  if (action === "del") {
    const indexInput = parseInt(args[1]);
    if (isNaN(indexInput) || indexInput < 1 || indexInput > groupData.autoSambut.pesanList.length) {
      return m.reply(`Escribe un número de mensaje válido.\nConsulta la lista con \`${m.prefix}autosambut list\`.`);
    }
    if (groupData.autoSambut.pesanList.length <= 1) {
      return m.reply(`¡No se pudo eliminar! Debe quedar al menos 1 mensaje en la lista de saludos del grupo.`);
    }

    const removedMsg = groupData.autoSambut.pesanList.splice(indexInput - 1, 1)[0];
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`🗑️ *¡Mensaje eliminado globalmente (${count} grupos)!*\n\nEliminado:\n"${removedMsg}"`);
    }

    return m.reply(`🗑️ *¡Mensaje eliminado!*\n\nEliminado:\n"${removedMsg}"\nSaludos restantes: ${groupData.autoSambut.pesanList.length}`);
  }

  if (action === "pesan") {
    return m.reply(`⚠️ El comando \`pesan\` está obsoleto y se sustituyó por el sistema aleatorio.\nUsa \`${m.prefix}autosambut add <texto>\` para añadir un saludo, o \`${m.prefix}autosambut list\` para ver la lista de saludos.`);
  }

  return m.reply(`Comando no válido. Prueba a escribir \`${m.prefix}autosambut\` sin nada más para ver la guía.`);
}

export { pluginConfig as config, handler };
