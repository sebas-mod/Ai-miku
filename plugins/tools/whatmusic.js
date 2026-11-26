/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pickMedia = ElysiaRuntime.pickMedia;
const identifyAudio = ElysiaRuntime.identifyAudio;

const pluginConfig = {
    name: "whatmusic",
    alias: [],
    category: "tools",
    description: "whatmusic",
    usage: ".whatmusic",
    example: ".whatmusic",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { reply, prefix, command }) {
      const media = pickMedia(m)
      if (!media || !/audio|video/.test(media.mime)) {
          return reply(`Kirim atau reply audio/video dengan perintah *${prefix}${command}*`)
      }

      try {
          await reply('🔍 Mendeteksi musik...')
          const track = await identifyAudio(await media.download())
          if (!track) return reply('❌ Lagu tidak ditemukan / tidak terdeteksi.')

          const out = `— *SONG IDENTIFIED* —\n\n` +
              `🎵 *Judul:* ${track.title || '-'}\n` +
              `👤 *Artis:* ${track.artist || '-'}\n` +
              `💿 *Album:* ${track.album || '-'}\n` +
              `📅 *Rilis:* ${track.release_date || '-'}\n` +
              (track.spotify?.external_urls?.spotify ? `\n🟢 Spotify: ${track.spotify.external_urls.spotify}` : '')

          await reply(out.trim())
      } catch (e) {
          reply(`❌ Error: ${e.message}`)
      }
  }

export { pluginConfig as config, handler }
