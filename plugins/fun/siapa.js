/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import te from "../../src/lib/core/error.js";
import {
  getMentionJid,
  isBotParticipant,
  resolveFromSock,
  isLid,
  cacheParticipantLids,
} from "../../src/lib/core/lid.js";

const pluginConfig = {
  name: [
    "bego", "goblok", "janda", "perawan", "babi", "tolol", "pekok",
    "jancok", "pinter", "pintar", "asu", "bodoh", "lesby",
    "bajingan", "anjing", "anjg", "anjj", "anj", "ngentod", "ngentot",
    "monyet", "mastah", "newbie", "bangsat", "bangke", "sange", "sangean",
    "dakjal", "horny", "wibu", "puki", "puqi", "peak", "pantex", "pantek",
    "setan", "iblis", "cacat", "yatim", "piatu", "ganteng", "cantik",
    "jelek", "keren", "cupu", "noob", "pro", "sultan", "miskin", "kaya", "siapa",
  ],
  alias: [],
  category: "fun",
  description: "Elige al azar a un miembro para cierta categoría",
  usage: ".<kategori>",
  example: ".ganteng",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isRegistered: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const command = m.command?.toLowerCase();
  m.react("🕕");
  try {
    let participants = m.groupMetadata?.participants || [];
    if (participants.length === 0) {
      const fresh = await sock.groupMetadata(m.chat).catch(() => null);
      participants = fresh?.participants || [];
    }
    cacheParticipantLids(participants);

    const botNum = String(sock.user?.id || sock.user?.jid || "")
      .split("@")[0]
      .split(":")[0]
      .replace(/\D/g, "");

    const eligible = participants.filter((p) => !isBotParticipant(p, [botNum]));
    if (eligible.length === 0) {
      return m.reply(`❌ ¡No hay miembros en el grupo!`);
    }

    const picked = eligible[Math.floor(Math.random() * eligible.length)];
    let targetJid = getMentionJid(picked) || picked.phoneNumber || picked.jid || picked.id || picked.lid;
    if (isLid(targetJid)) {
      const pn = await resolveFromSock(targetJid, sock).catch(() => null);
      if (pn && !isLid(pn)) targetJid = pn;
    }

    const positiveWords = ["ganteng", "cantik", "keren", "pro", "sultan", "kaya", "pinter", "pintar", "mastah"];
    const isPositive = positiveWords.includes(command);
    const label = isPositive ? "El más" : "Anak";
    const mentionNum = String(targetJid || "").split("@")[0].split(":")[0];

    await m.reply(`*${label} ${command} aquí es* @${mentionNum}`, {
      mentions: [targetJid],
    });
    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
