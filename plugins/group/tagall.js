/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import {
  getMentionJid,
  participantNumbers,
  resolveFromSock,
  isLid,
} from "../../src/lib/core/lid.js";
import te from "../../src/lib/core/error.js";
const pluginConfig = {
  name: "tagall",
  alias: ["all", "everyone"],
  category: "group",
  description: "Tag semua member grup",
  usage: ".tagall <pesan>",
  example: ".tagall Halo semua!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
  isBotAdmin: false,
};

async function handler(m, { sock }) {
  const text = m.text || "Tag All Members";

  try {
    const groupMeta = m.groupMetadata;
    const participants = groupMeta.participants || [];

    if (participants.length === 0) {
      await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak ada member di grup ini.`);
      return;
    }

    const senderNum = String(m.sender || "").split("@")[0].split(":")[0];

    const targetParticipants = participants.filter(
      (participant) => !participantNumbers(participant).has(senderNum),
    );

    if (targetParticipants.length === 0) {
      await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak ada member lain yang bisa di-tag.`);
      return;
    }

    // Resolve tiap member; kalau masih LID coba cari nomor asli lewat socket.
    const mentions = [];
    for (const participant of targetParticipants) {
      let jid = getMentionJid(participant);
      if (isLid(jid)) {
        const pn = await resolveFromSock(jid, sock);
        if (pn && !isLid(pn)) jid = pn;
      }
      if (jid && !mentions.includes(jid)) mentions.push(jid);
    }

    // Teks @nomor HARUS sama persis dengan user-part di mentions
    const memberList = mentions
      .map((jid) => `@${jid.split("@")[0]}`)
      .join("\n")
      .trim();

    await m.reply(
      `*Pesan:* ${text}\n\n` +
        `\`\`\`━━━ ${mentions.length} MEMBER TOTAL ━━━\`\`\`\n` +
        memberList,
      { mentions: mentions },
    );
  } catch (error) {
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
