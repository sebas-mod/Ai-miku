/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
const elysiaLib = (name) => ElysiaRuntime.elysiaLib(name, typeof libs !== 'undefined' ? libs : null);
const elysiaGlobal = ElysiaRuntime.elysiaGlobal;

const libs = {
    "detectbot": async ({ elysiaLib }) => {
      function isBotMessage(msg, client) {
        const id = msg?.key?.id || ''
        const isBaileys = id.startsWith('BAE5') || id.length === 16 || id.length === 12
        const isBot = Boolean(isBaileys || msg?.isBot)
        return {
          isBot,
          score: isBot ? 95 : 5,
          indicators: isBot ? ['Baileys ID pattern detected'] : ['Official client signature']
        }
      }

      const __default = { isBotMessage }
      return { isBotMessage, default: __default }
    },
    "thumb": async () => {
      const axios = (await import('axios')).default
      const sharp = (await import('sharp')).default
      let cache = { url: '', buf: null }
      async function getActiveThumbBuffer(size = 300) {
        try {
          const url = global.thumb?.utama
          if (!url) return Buffer.alloc(0)
          if (cache.url !== url || !cache.buf) {
            const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })
            cache = { url, buf: Buffer.from(data) }
          }
          return await sharp(cache.buf).resize(size, size, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer()
        } catch (err) {
          console.error('[THUMB ERROR]:', err?.message || err)
        }
        return Buffer.alloc(0)
      }
      return { getActiveThumbBuffer, default: { getActiveThumbBuffer } }
    }
}
import { getDevice } from '@rexxhayanasi/elaina-baileys'

const pluginConfig = {
    name: "isbot",
    alias: [],
    category: "tools",
    description: "isbot",
    usage: ".isbot",
    example: ".isbot",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const { isBotMessage } = (await elysiaLib('detectbot'))
  const { getActiveThumbBuffer } = (await elysiaLib('thumb'))

  const parseDeviceDetailed = (msgId, isBot) => {
      const raw = getDevice(msgId) || 'unknown';
      if (isBot) return 'WhatsApp Bot (Baileys / Multi-Device)';
      switch (raw.toLowerCase()) {
          case 'android':
              return 'Android (Official WhatsApp)';
          case 'ios':
              return 'iOS / iPhone (Official WhatsApp)';
          case 'web':
              return 'WhatsApp Web (Browser)';
          case 'desktop':
              return 'WhatsApp Desktop (Windows / Mac)';
          default:
              return raw.charAt(0).toUpperCase() + raw.slice(1);
      }
  };

  async function handler(m, { sock, conn, reply }) {
      const client = sock || conn || elysiaGlobal.mainSock;
      const targetMsg = m.quoted ? m.quoted : m;
      const targetSender = targetMsg.sender || targetMsg.key?.participant || (targetMsg.key?.fromMe ? (client.decodeJid ? client.decodeJid(client.user?.id || '') : client.user?.id) : m.sender);
      const targetNumber = (targetSender || '').replace(/[^0-9]/g, '');

      const analysis = isBotMessage(targetMsg, client);
      const detailedDevice = parseDeviceDetailed(analysis.msgId, analysis.isBot);

      const status = analysis.isBot
          ? `🤖 *ʙᴏᴛ* (${analysis.confidence}%)`
          : `👤 *ʜᴜᴍᴀɴᴏ* (${100 - analysis.confidence}%)`;

      const captionText = `🤖 *ᴅᴇᴛᴇᴄᴄɪóɴ ᴅᴇ ʙᴏᴛ ʏ ᴅɪsᴘᴏsɪᴛɪᴠᴏ*\n\n` +
          `• 👤 *ᴏʙᴊᴇᴛɪᴠᴏ:* @${targetNumber}\n` +
          `• 📊 *ᴇsᴛᴀᴅᴏ:* ${status}\n` +
          `• 📱 *ᴅɪsᴘᴏsɪᴛɪᴠᴏ:* ${detailedDevice}\n` +
          `• 🆔 *ɪᴅ ᴅᴇʟ ᴍᴇɴsᴀᴊᴇ:* \`${analysis.msgId}\`\n` +
          `• 📑 *ᴛɪᴘᴏ ᴅᴇ ᴍᴇɴsᴀᴊᴇ:* \`${analysis.msgType}\``;

      const thumbBuffer = await getActiveThumbBuffer().catch(() => null);

      try {
          {
              await client.sendMessage(m.chat, {
                  location: {
                      degreesLatitude: 0,
                      degreesLongitude: 0,
                      name: '🤖 Detección de bot y dispositivo',
                      address: `Objetivo: @${targetNumber} • Estado: ${analysis.isBot ? 'BOT' : 'HUMANO'}`,
                      jpegThumbnail: thumbBuffer
                  },
                  caption: captionText,
                  mentions: [targetSender],
                  contextInfo: {
                      mentionedJid: [targetSender]
                  }
              }, { quoted: m });
          }
      } catch (e) {
          console.error('[ISBOT ERROR]', e);
          return await reply(captionText, { mentions: [targetSender] });
      }
  };

  handler.category = 'tools';

export { pluginConfig as config, handler }
