/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import {
  findParticipantByNumber,
  cacheParticipantLids,
  resolveFromSock,
  isBotParticipant,
  getCachedJid,
} from "../../src/lib/core/lid.js";
import te from "../../src/lib/core/error.js";

const pluginConfig = {
  name: "kick",
  alias: ["remove", "tendang"],
  category: "group",
  description: "Expulsa a un miembro del grupo",
  usage: ".kick @user",
  example: ".kick @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
  isBotAdmin: true,
};

const cleanDigits = (v) =>
  String(v || "")
    .split("@")[0]
    .split(":")[0]
    .replace(/\D/g, "");

async function handler(m, { sock }) {
  let targetJid = null;

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    targetJid = m.mentionedJid[0];
  } else if (m.quoted?.sender) {
    targetJid = m.quoted.sender;
  } else if (m.text) {
    const rawNum = m.text.replace(/\D/g, "");
    if (rawNum.length >= 8 && rawNum.length <= 16) {
      targetJid = `${rawNum}@s.whatsapp.net`;
    }
  }

  if (!targetJid) {
    await m.reply(
      `❌ *ᴛᴀʀɢᴇᴛ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n` +
        `> ¡Responde a un mensaje del usuario, menciónalo o escribe su número!\n` +
        `> Contoh: \`${m.prefix}kick @user\``
    );
    return;
  }

  try {
    let groupMeta = m.groupMetadata;
    let participants = groupMeta?.participants || [];

    if (participants.length > 0) {
      cacheParticipantLids(participants);
    }

    const resolveCandidates = async (jid) => {
      const set = new Set([jid]);
      const cached = getCachedJid(jid);
      if (cached) set.add(cached);
      if (sock?.getJid) {
        const sJid = sock.getJid(jid);
        if (sJid) set.add(sJid);
      }
      const fromSock = await resolveFromSock(jid, sock).catch(() => null);
      if (fromSock) set.add(fromSock);
      return [...set].filter(Boolean);
    };

    const candidates = await resolveCandidates(targetJid);

    const matchTarget = (list) => {
      for (const cand of candidates) {
        const found = findParticipantByNumber(list, cand);
        if (found) return found;
      }
      return null;
    };

    let targetParticipant = matchTarget(participants);

    // Jika tidak ketemu di metadata cache, ambil ulang metadata grup terbaru dari WhatsApp
    if (!targetParticipant) {
      try {
        const freshMeta = await sock.groupMetadata(m.chat);
        if (freshMeta?.participants?.length) {
          groupMeta = freshMeta;
          participants = freshMeta.participants;
          cacheParticipantLids(participants);
          const freshCandidates = await resolveCandidates(targetJid);
          for (const cand of freshCandidates) {
            targetParticipant = findParticipantByNumber(participants, cand);
            if (targetParticipant) break;
          }
        }
      } catch {}
    }

    if (!targetParticipant) {
      await m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡El usuario no está en el grupo!`);
      return;
    }

    const botNum = cleanDigits(sock.user?.id || sock.user?.jid);
    if (isBotParticipant(targetParticipant, [botNum])) {
      await m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡No puedes expulsar al propio bot!`);
      return;
    }

    const senderNum = cleanDigits(m.sender);
    const targetIds = [
      targetParticipant.id,
      targetParticipant.jid,
      targetParticipant.lid,
      targetParticipant.phoneNumber,
    ]
      .map(cleanDigits)
      .filter(Boolean);

    if (senderNum && targetIds.includes(senderNum)) {
      await m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡No puedes expulsarte a ti mismo!`);
      return;
    }

    if (targetParticipant.admin) {
      await m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡No puedes expulsar a un administrador del grupo!`);
      return;
    }

    const kickId = targetParticipant.id || targetParticipant.jid || targetJid;
    try {
      await sock.groupParticipantsUpdate(m.chat, [kickId], "remove");
    } catch (firstErr) {
      const altId =
        targetParticipant.phoneNumber ||
        targetParticipant.jid ||
        targetParticipant.lid;
      if (altId && altId !== kickId) {
        await sock.groupParticipantsUpdate(m.chat, [altId], "remove");
      } else {
        throw firstErr;
      }
    }

    const displayJid =
      targetParticipant.phoneNumber ||
      (targetParticipant.jid && !targetParticipant.jid.endsWith("@lid")
        ? targetParticipant.jid
        : null) ||
      kickId;
    const displayNum = cleanDigits(displayJid);

    await m.reply(`✅ @${displayNum} fue expulsado de este grupo.`, {
      mentions: [displayJid],
    });
  } catch (error) {
    console.error("[Kick Error]", error?.message || error);
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
