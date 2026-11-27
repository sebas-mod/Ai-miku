/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { saluranCtx } from "../../src/lib/core/context.js";

const pluginConfig = {
  name: "anticulik",
  alias: ["antikidnap", "antiileng", "anticulikgc"],
  category: "group",
  description: "El bot sale solo del grupo si lo añaden sin permiso",
  usage: ".anticulik on/off",
  example: ".anticulik on",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const status = db.setting("anticulik") || "off";

    return m.reply(
      `🛡️ *Anti Culik*\n\n` +
        `El bot saldrá solo del grupo si lo añade alguien desconocido sin permiso.\n\n` +
        `*STATUS:*\n` +
        `> Modo: *${status === "on" ? "Activado ✅" : "Desactivado ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}anticulik on* — Activar\n` +
        `> *${m.prefix}anticulik off* — Desactivar\n\n` +
        `_Si está activo, el bot solo puede entrar con *${m.prefix}join* o si lo añade el dueño_`
    );
  }

  if (option === "on") {
    db.setting("anticulik", "on");
    const ctx = saluranCtx();
    return m.reply(
      `🛡️ *Anti Secuestro Activo*\n\n` +
        `> El bot saldrá solo si lo añaden sin permiso\n` +
        `> La única forma de que entre: *${m.prefix}join* por el dueño\n\n` +
        `_El miembro que añada el bot recibirá un aviso_`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("anticulik", "off");
    return m.reply(
      `🛡️ *Anti Secuestro Inactivo*\n\n` +
        `> El bot no saldrá solo si lo añaden a un grupo\n` +
        `> Cualquiera puede añadir el bot a un grupo`
    );
  }

  return m.reply(
    `❌ *Opción no válida*\n\n> Usa *${m.prefix}anticulik on* o *${m.prefix}anticulik off*`
  );
}

async function handleAntiCulik(event, sock, db) {
  if (event.action !== "add") return false;

  const botNumber =
    sock.user?.id?.split(":")[0] || sock.user?.id?.split("@")[0];
  const botLid = sock.user?.id;

  const isBotAdded = (event.participants || []).some((p) => {
    const rJid = typeof p === "object" && p !== null ? p.phoneNumber || p.id : p;
    if (typeof rJid !== "string") return false;
    const pNum = rJid.split("@")[0].split(":")[0];
    return (
      pNum === botNumber ||
      rJid === botLid ||
      rJid.includes(botNumber)
    );
  });

  if (!isBotAdded) return false;

  const anticulikStatus = db.setting("anticulik") || "off";
  if (anticulikStatus !== "on") return false;

  const inviter = event.author || "";
  const ownerNumbers = (global.owner || []).map((o) =>
    typeof o === "string" ? o.split("@")[0] : o
  );
  const inviterNum = inviter.split("@")[0].split(":")[0];

  const isOwnerInviter =
    inviterNum === botNumber ||
    ownerNumbers.includes(inviterNum) ||
    inviter === botLid;

  if (isOwnerInviter) return false;

  const inviterMention = inviter
    ? `@${inviter.split("@")[0]}`
    : "seseorang";

  await sock.sendMessage(event.id, {
    text:
      `🛡️ *Anti Culik*\n\n` +
      `Pide permiso primero, no secuestres a lo loco 🗿\n\n` +
      `> El bot fue añadido por ${inviterMention} sin permiso\n` +
      `> El bot va a salir de este grupo\n\n` +
      `_Contacta al dueño para añadir el bot de la forma correcta_`,
    contextInfo: saluranCtx(),
    mentionedJid: inviter ? [inviter] : [],
  });

  await new Promise((r) => setTimeout(r, 2000));
  await sock.groupLeave(event.id);
  return true;
}

export { pluginConfig as config, handler, handleAntiCulik };
