/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "getnumber",
    alias: [],
    category: "tools",
    description: "getnumber",
    usage: ".getnumber",
    example: ".getnumber",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { sock, conn, text, usedPrefix, command }) {
      const client = sock || conn;
      let number = '';

      if (m.quoted) {
          const quotedSender = m.quoted.sender || m.quoted.key?.participant || m.quoted.key?.remoteJid || '';
          number = quotedSender.replace(/[^0-9]/g, '');
      } else if (m.mentionedJid && m.mentionedJid.length > 0) {
          number = m.mentionedJid[0].replace(/[^0-9]/g, '');
      } else if (text) {
          number = text.replace(/[^0-9]/g, '');
      } else {
          number = m.sender.replace(/[^0-9]/g, '');
      }

      if (!number) return m.reply(`*ᴇᴊᴇᴍᴘʟᴏ:* \`${usedPrefix + command} @mención/respuesta\``);

      return m.reply(`📋 *Número:* \`${number}\``);
  };

export { pluginConfig as config, handler }
