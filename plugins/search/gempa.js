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
        const BASE = 'https://data.bmkg.go.id/DataMKG/TEWS/'
        const LINE = '━━━━━━━━━━━━━━━━━━━━'
        module.exports = {
          name: 'gempa', alias: ['infogempa', 'bmkg', 'gempaterkini'], category: 'search', cmds: ['gempa'], noLimit: false,
          desc: 'Info gempa terbaru BMKG (.gempa, .gempa dirasakan, .gempa m5)',
          run: async ({ sock, m, text, prefix, reply }) => {
            const q = String(text || '').trim().toLowerCase()
            try {
              if (q === 'dirasakan' || q === 'rasa') {
                const { data } = await axios.get(BASE + 'gempadirasakan.json', { timeout: 15000 }), l = (data.Infogempa.gempa || []).slice(0, 8)
                return reply(`${B('TERREMOTO SENTIDO')}\n${LINE}\n${l.map((g, i) => `${i + 1}. M${g.Magnitude} • ${g.Tanggal} ${g.Jam}\n   ${g.Wilayah}\n   Profundidad ${g.Kedalaman}`).join('\n')}\n\n_Fuente: BMKG_`)
              }
              if (/^m?5/.test(q) || q === 'm5' || q === 'besar') {
                const { data } = await axios.get(BASE + 'gempaterkini.json', { timeout: 15000 }), l = (data.Infogempa.gempa || []).slice(0, 15)
                return reply(`${B('TERREMOTOS M5.0+ RECIENTES')}\n${LINE}\n${l.map((g, i) => `${i + 1}. M${g.Magnitude} • ${g.Tanggal} ${g.Jam}\n   ${g.Wilayah}`).join('\n')}\n\n_Fuente: BMKG_`)
              }
              const { data } = await axios.get(BASE + 'autogempa.json', { timeout: 15000 }), g = data.Infogempa.gempa
              const cap = [B('TERREMOTO MÁS RECIENTE'), LINE, `Tiempo: ${g.Tanggal}, ${g.Jam}`, `Magnitud : M${g.Magnitude}`, `Profundidad : ${g.Kedalaman}`, `Ubicación : ${g.Lintang}, ${g.Bujur}`, `Zona      : ${g.Wilayah}`, `Sentido   : ${g.Dirasakan || '-'}`, `Potencial : ${g.Potensi || '-'}`, '', `_Otro: ${prefix}gempa dirasakan • ${prefix}gempa m5 • Sumber: BMKG_`].join('\n')
              if (g.Shakemap) { try { return await sock.sendMessage(m.chat, { image: { url: 'https://static.bmkg.go.id/' + g.Shakemap }, caption: cap }, { quoted: m }) } catch {} }
              return reply(cap)
            } catch (e) { console.log('[gempa]', e.message); return reply('No se pudieron recuperar los datos BMKG: ' + e.message) }
          },
        }
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
    name: "gempa",
    alias: ["bmkg", "gempaterkini", "infogempa"],
    category: "search",
    description: "gempa",
    usage: ".gempa",
    example: ".gempa",
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
