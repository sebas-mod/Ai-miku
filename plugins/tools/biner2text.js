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
    name: "biner2text",
    alias: [],
    category: "tools",
    description: "biner2text <kode biner>",
    usage: ".biner2text <kode biner>",
    example: ".biner2text <kode biner>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { text, usedPrefix, command }) {
      if (!text) return m.reply(`🚩 *BINARIO A TEXTO*\n\n¡Escribe el código binario que quieres convertir!\n\n*ᴇᴊᴇᴍᴘʟᴏ:* \`${usedPrefix + command} 01001000 01100001 01101100 01101111\``);

      try {
          const binary = text.replace(/\s+/g, '');
          if (binary.length % 8 !== 0) throw new Error("Formato binario no válido (debe ser múltiplo de 8 bits).");

          const result = binary.match(/.{1,8}/g).map(bin => {
              return String.fromCharCode(parseInt(bin, 2));
          }).join('');

          await m.reply(`* *ʜᴀsɪʟ:**\n\n\`\`\`${result}\`\`\``);
      } catch (e) {
          m.reply(`❌ *Error:* ${e.message}`);
      }
  };

export { pluginConfig as config, handler }
