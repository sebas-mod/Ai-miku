/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const createMikuFeature = (module, exports, require) => {
        const axios = require('axios'), { B } = require('style')
        const FEED = { terkini: 'terkini', politik: 'politik', ekonomi: 'ekonomi', hukum: 'hukum', olahraga: 'olahraga', teknologi: 'tekno', tekno: 'tekno', dunia: 'dunia', hiburan: 'hiburan', lifestyle: 'lifestyle', otomotif: 'otomotif', bola: 'bola' }
        const dec = (s) => String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/<[^>]+>/g, '').trim()
        function parseRss(xml, n = 8) {
          return [...String(xml).matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, n).map(([, it]) => {
            const g = (t) => { const r = it.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)); return r ? dec(r[1]) : '' }
            return { title: g('title'), link: g('link'), date: g('pubDate') }
          }).filter(x => x.title && x.link)
        }
        const ago = (d) => { const t = Date.parse(d); if (!t) return ''; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'baru saja' : m < 60 ? `${m} menit lalu` : m < 1440 ? `${Math.round(m / 60)} jam lalu` : `${Math.round(m / 1440)} hari lalu` }
        module.exports = {
          name: 'berita', alias: ['news', 'beritaterkini', 'headline'], category: 'search', cmds: ['berita'], noLimit: false,
          desc: 'Berita terbaru Antara: .berita [politik|ekonomi|hukum|olahraga|teknologi|dunia|hiburan|otomotif]',
          run: async ({ text, prefix, reply }) => {
            const k = String(text || 'terkini').trim().toLowerCase()
            if (!FEED[k]) return reply(`Kategori tidak dikenal.\nPilih: ${Object.keys(FEED).filter(x => x !== 'tekno').join(', ')}\nContoh: ${prefix}berita ekonomi`)
            try {
              const { data } = await axios.get(`https://www.antaranews.com/rss/${FEED[k]}.xml`, { timeout: 15000, responseType: 'text', headers: { 'User-Agent': 'Mozilla/5.0' } })
              const items = parseRss(data); if (!items.length) return reply('Tidak ada berita yang terbaca saat ini.')
              return reply(`${B('BERITA ' + k.toUpperCase())}\n━━━━━━━━━━━━━━━━━━━━\n` + items.map((x, i) => `${i + 1}. *${x.title}*\n   ${ago(x.date)}\n   ${x.link}`).join('\n\n') + '\n\n_Sumber: Antara News_')
            } catch (e) { console.log('[berita]', e.message); return reply('Gagal mengambil berita: ' + e.message) }
          },
        }
        module.exports._t = { parseRss }
    }

const libs = {
    style: (module) => {
        const B = (t) => String(t ?? '').replace(/[A-Za-z0-9]/g, (c) => {
            const k = c.charCodeAt(0)
            return String.fromCodePoint(k >= 97 ? 0x1D41A + k - 97 : k >= 65 ? 0x1D400 + k - 65 : 0x1D7CE + k - 48)
        })
        const plain = (t) => String(t ?? '').normalize('NFKC').replace(/[\u{13000}-\u{1342F}]/gu, '').replace(/\s+/g, ' ').trim()
        const cut = (t, n) => { const a = Array.from(String(t ?? '')); return a.length > n ? a.slice(0, n - 1).join('') + '…' : a.join('') }
        module.exports = { B, plain, cut, fx: (t) => t, ancientize: (t) => t, content: (c) => c, on: () => false }
    },
}

const pluginConfig = {
    name: "berita",
    alias: ["beritaterkini", "headline", "news"],
    category: "search",
    description: "berita",
    usage: ".berita",
    example: ".berita",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const handler = MikuRuntime.createWorldHandler(createMikuFeature, typeof libs !== 'undefined' ? libs : {})

export { pluginConfig as config, handler }
