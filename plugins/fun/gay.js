/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import {
  getMentionJid,
  resolveFromSock,
  isLid,
  cacheParticipantLids,
} from "../../src/lib/core/lid.js";

const pluginConfig = {
  name: "gay",
  alias: ["howgay"],
  category: "fun",
  description: "Menunjuk member paling gay di grup",
  usage: ".gay",
  isGroup: true,
  isBotAdmin: false,
  isAdmin: false,
  cooldown: 10,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (!m.isGroup) return m.reply(config.messages.groupOnly);
  let participants = m.groupMetadata?.participants || [];
  if (participants.length === 0) {
    const fresh = await sock.groupMetadata(m.chat).catch(() => null);
    participants = fresh?.participants || [];
  }
  cacheParticipantLids(participants);

  if (participants.length === 0) {
    return m.reply(`❌ ¡No hay miembros en el grupo!`);
  }

  const resolveJid = async (p) => {
    let jid = getMentionJid(p) || p.phoneNumber || p.jid || p.id || p.lid;
    if (isLid(jid)) {
      const pn = await resolveFromSock(jid, sock).catch(() => null);
      if (pn && !isLid(pn)) jid = pn;
    }
    return jid;
  };

  const p1 = participants[Math.floor(Math.random() * participants.length)];
  const p2 = participants[Math.floor(Math.random() * participants.length)];
  const orang1 = await resolveJid(p1);
  const orang2 = await resolveJid(p2);

  const n1 = String(orang1).split("@")[0].split(":")[0];
  const n2 = String(orang2).split("@")[0].split(":")[0];
  const text = `@${n1} *Nge gay sama* @${n2}`;
  await m.reply(text, { mentions: [orang1, orang2] });
}

export { pluginConfig as config, handler };
