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
  name: "top5",
  alias: ["toplist"],
  category: "fun",
  description: "Random top 5 member untuk kategori tertentu",
  usage: ".top5 <kategori>",
  example: ".top5 orang pintar",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isRegistered: true,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const kategori = m.args.join(" ")?.trim();

  if (!kategori) {
    return m.reply(`\`Contoh: ${m.prefix}top5 orang pintar\``);
  }

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
    if (eligible.length < 2) {
      return m.reply(`❌ Member grup kurang dari 2 orang!`);
    }

    const shuffled = [...eligible].sort(() => Math.random() - 0.5).slice(0, 5);
    const top5 = [];
    for (const p of shuffled) {
      let jid = getMentionJid(p) || p.phoneNumber || p.jid || p.id || p.lid;
      if (isLid(jid)) {
        const pn = await resolveFromSock(jid, sock).catch(() => null);
        if (pn && !isLid(pn)) jid = pn;
      }
      if (jid) top5.push(jid);
    }

    const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    let list = "";

    top5.forEach((jid, index) => {
      const num = String(jid).split("@")[0].split(":")[0];
      list += `*${index + 1}* ${medals[index]} @${num}\n`;
    });

    await m.reply(`🏆 *ᴛᴏᴘ 5 ${kategori.toUpperCase()}*\n${list}`, {
      mentions: top5,
    });
    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
