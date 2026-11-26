/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import { saluranCtx } from "../../src/lib/core/context.js";
import te from "../../src/lib/core/error.js";

const pluginConfig = {
  name: "join",
  alias: ["joingrup", "joingroup", "gabung"],
  category: "owner",
  description: "Bot join ke grup via link invite, support reply pesan yang mengandung link",
  usage: ".join <link> / .join (reply pesan berisi link)",
  example: ".join https://chat.whatsapp.com/xxx",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function extractAllInviteCodes(text) {
  if (!text) return [];
  const codes = [];
  const seen = new Set();

  const patterns = [
    /chat\.whatsapp\.com\/([a-zA-Z0-9]{20,})/gi,
    /invite\.whatsapp\.com\/([a-zA-Z0-9]{20,})/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const code = match[1];
      if (!seen.has(code)) {
        seen.add(code);
        codes.push(code);
      }
    }
  }

  return codes;
}

async function joinGroup(sock, inviteCode) {
  try {
    const groupInfo = await sock.groupGetInviteInfo(inviteCode);
    if (!groupInfo) return { success: false, error: "No se pudo obtener la información del grupo" };

    const botJid = sock.user?.id?.replace(/:.*@/, "@") || "";
    const isMember = groupInfo.participants?.some(
      (p) => p.id === botJid || p.id?.includes(sock.user?.id?.split(":")[0]),
    );

    if (isMember) {
      return {
        success: false,
        alreadyMember: true,
        subject: groupInfo.subject || "Unknown",
      };
    }

    await sock.groupAcceptInvite(inviteCode);
    return {
      success: true,
      subject: groupInfo.subject || "Unknown",
      members: groupInfo.size || groupInfo.participants?.length || 0,
      owner: groupInfo.owner?.split("@")[0] || "Unknown",
    };
  } catch (error) {
    let errorMsg = error.message || "Enlace no válido";
    if (errorMsg.includes("not-authorized")) errorMsg = "El enlace ya no es válido o expiró";
    else if (errorMsg.includes("gone") || errorMsg.includes("item-not-found") || errorMsg.includes("404")) errorMsg = "Grupo no encontrado (enlace inventado o revocado)";
    else if (errorMsg.includes("conflict")) errorMsg = "El bot ya es miembro";
    else errorMsg = "Enlace no válido o el bot no puede unirse";
    return { success: false, error: errorMsg };
  }
}

async function handler(m, { sock }) {
  const input = m.args.join(" ").trim();
  let sourceText = input;

  if (!input && m.quoted) {
    sourceText = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
  }

  if (!sourceText) {
    return m.reply(
      `🔗 *Join Grup*\n\n` +
        `El bot se unirá al grupo con el enlace de invitación que indiques.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}join <link>* — Join via link langsung\n` +
        `> *${m.prefix}join* (responde a un mensaje) — Únete con el enlace del mensaje respondido\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}join https://chat.whatsapp.com/xxx*\n` +
        ` > Responde al mensaje con el enlace y escribe *${m.prefix}join*\n\n` +
        `_El bot detectará todos los enlaces de grupo del mensaje y se unirá uno por uno_`
    );
  }

  const inviteCodes = extractAllInviteCodes(sourceText);

  if (inviteCodes.length === 0) {
    return m.reply(
      `❌ *No hay enlaces de grupo*\n\n` +
        `> El bot no encontró enlaces de invitación en ese mensaje.\n\n` +
        `*Formatos de enlace admitidos:*\n` +
        `> *https://chat.whatsapp.com/xxx*\n` +
        `> *https://invite.whatsapp.com/xxx*`
    );
  }

  m.react("🕕");

  if (inviteCodes.length === 1) {
    const result = await joinGroup(sock, inviteCodes[0]);

    if (result.alreadyMember) {
      m.react("❌");
      return m.reply(
        `❌ *Ya es miembro*\n\n> El bot ya está en el grupo *${result.subject}*`
      );
    }

    if (!result.success) {
      m.react("❌");
      return m.reply(`❌ *No se pudo unir*\n\n> ${result.error}`);
    }

    m.react("✅");
    const ctx = saluranCtx();
    return m.reply(
      `✅ *¡Se unió correctamente!*\n\n` +
        `> 🏠 Nombre: *${result.subject}*\n` +
        `> 👥 Member: *${result.members}*\n` +
        `> 👤 Owner: *${result.owner}*`,
      { contextInfo: ctx }
    );
  }

  let resultText =
    `🔗 *Multi Join — ${inviteCodes.length} Link Terdeteksi*\n\n` +
    `El bot se unirá a todos los grupos uno por uno.\n\n`;

  let successCount = 0;
  let alreadyCount = 0;
  let failedCount = 0;

  for (let i = 0; i < inviteCodes.length; i++) {
    const result = await joinGroup(sock, inviteCodes[i]);

    if (result.alreadyMember) {
      alreadyCount++;
      resultText += `*${i + 1}.* ${result.subject} — ⚠️ Ya era miembro\n`;
    } else if (result.success) {
      successCount++;
      resultText += `*${i + 1}.* ${result.subject} — ✅ Se unió correctamente\n`;
    } else {
      failedCount++;
      resultText += `*${i + 1}.* ${inviteCodes[i].substring(0, 12)}... — ❌ ${result.error}\n`;
    }

    if (i < inviteCodes.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  resultText +=
    `\n*Resultado:*\n` +
    `> ✅ Correctos: *${successCount}*\n` +
    `> ⚠️ Ya miembros: *${alreadyCount}*\n` +
    `> ❌ Fallidos: *${failedCount}*\n` +
    `> 📊 Total: *${inviteCodes.length}*`;

  m.react(successCount > 0 ? "✅" : "❌");
  return m.reply(resultText);
}

export { pluginConfig as config, handler };
