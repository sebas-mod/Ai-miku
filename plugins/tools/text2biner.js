/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "text2biner",
    alias: [],
    category: "tools",
    description: "text2biner <teks>",
    usage: ".text2biner <teks>",
    example: ".text2biner <teks>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { text, usedPrefix, command }) {
      if (!text) return m.reply(`🚩 *TEXT TO BINARY*\n\nMasukkan teks yang ingin diubah!\n\n*ᴄᴏɴᴛᴏʜ:* \`${usedPrefix + command} Halo\``);

      try {
          const binary = text.split('').map(char => {
              return char.charCodeAt(0).toString(2).padStart(8, '0');
          }).join(' ');

          await m.reply(`* *ʜᴀsɪʟ:**\n\n\`\`\`${binary}\`\`\``);
      } catch (e) {
          m.reply(`❌ *Error:* ${e.message}`);
      }
  };

export { pluginConfig as config, handler }
