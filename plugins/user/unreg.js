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
  name: "unreg",
  alias: ["unregister", "hapusdaftar"],
  category: "user",
  description: "Borra el registro de tu cuenta usando tu número de serie (SN)",
  usage: ".unreg <SN>",
  example: ".unreg MIKU-76B1-A2C3",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

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
      `╭─── ❖ 『 ⚠️ *NO REGISTRADO* 』 ❖\n` +
        `│ ✦ Tu cuenta aún no está registrada en el sistema.\n` +
        `│ ✦ Tipo *${p}daftar Nombre.Edad* para registrarse.\n` +
        `╰──────────────────────────❖`
    );
  }

  const inputSn = String(m.text || m.args?.[0] || "").trim();
  const expectedSn = String(user.serialNumber || "").trim();

  if (!inputSn) {
    return m.reply(
      `╭─── ❖ 『 🔐 *VERIFICACIÓN DE BAJA* 』 ❖\n` +
        `│ ✦ ¡Para eliminar el registro, ingrese su *Número de serie (SN)*!\n` +
        `│\n` +
        `│ 📌 *Formato:* \`${p}unreg <SN>\`\n` +
        `│ ✨ *Ejemplo:* \`${p}unreg ${expectedSn || "MIKU-76B1-A2C3"}\`\n` +
        `│ 🔎 ¿Olvidaste tu SN? Escribe *${p}ceksn*\n` +
        `╰──────────────────────────❖`
    );
  }

  if (!expectedSn || inputSn.toUpperCase() !== expectedSn.toUpperCase()) {
    return m.reply(
      `╭─── ❖ 『 ❌ *NÚMERO DE SERIE INCORRECTO* 』 ❖\n` +
        `│ ✦ SN que ingresaste no coincide con tu cuenta.\n` +
        `│ 🔎 Escribe *${p}ceksn* para ver su número de serie correcto.\n` +
        `╰──────────────────────────❖`
    );
  }

  const oldName = user.regName || user.name || m.pushName || "Aventurero";
  const unregisteredAt = new Date().toISOString();

  db.setUser(targetJid, {
    isRegistered: false,
    name: m.pushName || "Unknown",
    regName: null,
    regAge: null,
    regGender: null,
    serialNumber: null,
    registeredAt: null,
    lastRegisteredAt: null,
    unregisteredAt,
  });
  await db.save();

  // Bersihkan juga data registrasi di global.db.data.users (RPG)
  if (global.db?.data?.users) {
    const cleanNum = targetJid.replace(/@.+/g, "").split(":")[0];
    const rpgKey = `${cleanNum}@s.whatsapp.net`;
    for (const k of new Set([rpgKey, m.sender, targetJid])) {
      const gu = global.db.data.users[k];
      if (gu) {
        gu.registered = false;
        gu.name = m.pushName || "Aventurero";
        gu.age = null;
        gu.regTime = null;
        gu.sn = null;
      }
    }
  }

  await m.react("✅");
  return m.reply(
    `╭─── ❖ 『 🗑️ *DESREGISTRO COMPLETADO* 』 ❖\n` +
      `│ ✦ Datos de registro *${oldName}* ha sido eliminado.\n` +
      `│ 🔑 *SN Terverifikasi:* \`${expectedSn}\`\n` +
      `│ ✦ Tu progreso de nivel y tus monedas se mantienen seguros.\n` +
      `│ ✦ Tipo *${p}daftar Nombre.Edad* en cualquier momento para volver a registrarse!\n` +
      `╰──────────────────────────❖`
  );
}

export { pluginConfig as config, handler };
