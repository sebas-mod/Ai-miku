/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { exec } from 'child_process'

const pluginConfig = {
    name: "speedtest",
    alias: [],
    category: "tools",
    description: "speedtest",
    usage: ".speedtest",
    example: ".speedtest",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const util = (__m => __m.default ?? __m)((await import('util')))

  const execPromise = util.promisify(exec);

  async function handler(m, { sock, reply }) {
      await reply('⚡ Ejecutando el test de velocidad, espera...');
      try {
          const { stdout, stderr } = await execPromise('speedtest-cli --simple');
          if (stdout) {
              await sock.sendMessage(m.chat, { text: `🚀 *🚀 *ʀᴇsᴜʟᴛᴀᴅᴏ ᴅᴇʟ ᴛᴇsᴛ:**\n\n${stdout.trim()}` }, { quoted: m });
          } else if (stderr) {
              await sock.sendMessage(m.chat, { text: `⚠️ *Speedtest Error:*\n${stderr}` }, { quoted: m });
          }
      } catch (err) {
          await sock.sendMessage(m.chat, { text: `❌ *Error executing speedtest:*\n${err.message}` }, { quoted: m });
      }
  };

export { pluginConfig as config, handler }
