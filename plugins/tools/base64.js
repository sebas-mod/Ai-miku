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
    name: "base64",
    alias: [],
    category: "tools",
    description: "base64 enc/dec <teks>",
    usage: ".base64 enc/dec <teks>",
    example: ".base64 enc/dec <teks>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { text, usedPrefix, command }) {
      if (!text) return m.reply(`🌸 *ʙᴀsᴇ64 ᴇɴᴄᴏᴅᴇʀ & ᴅᴇᴄᴏᴅᴇʀ* 🌸\n\n✨ *ᴄᴏɴᴛᴏʜ:*\n• ${usedPrefix + command} enc halo\n• ${usedPrefix + command} dec aGFsbw==`);

      const args = text.trim().split(/\s+/);
      const type = args[0]?.toLowerCase();
      const input = args.slice(1).join(' ');

      if (!['enc', 'dec', 'encode', 'decode'].includes(type) || !input) {
          return m.reply(`*ғᴏʀᴍᴀᴛ ᴘᴇɴɢɢᴜɴᴀᴀɴ:*\n• ${usedPrefix + command} enc <teks>\n• ${usedPrefix + command} dec <base64>`);
      }

      try {
          if (type === 'enc' || type === 'encode') {
              const encoded = Buffer.from(input, 'utf-8').toString('base64');
              await m.reply(`*ʜᴀsɪʟ ʙᴀsᴇ64 ᴇɴᴄᴏᴅᴇ*\n\n` + '```' + encoded + '```');
          } else {
              const decoded = Buffer.from(input, 'base64').toString('utf-8');
              await m.reply(`*ʜᴀsɪʟ ʙᴀsᴇ64 ᴅᴇᴄᴏᴅᴇ*\n\n` + '```' + decoded + '```');
          }
      } catch (e) {
          m.reply(`❌ *ᴀᴅᴀ ʏᴀɴɢ ᴇʀʀᴏʀ ɴɪʜ 🥺:* ${e.message}`);
      }
  };

export { pluginConfig as config, handler }
