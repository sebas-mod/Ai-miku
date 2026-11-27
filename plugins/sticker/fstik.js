/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'

const sendStickerPack = MikuRuntime.sendStickerPack;

const pluginConfig = {
    name: "fstik",
    alias: ["telegramsticker"],
    category: "sticker",
    description: "fstik",
    usage: ".fstik",
    example: ".fstik",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const fstik = {
    api: {
      base: 'https://api.fstik.app',
      endpoints: {
        direct: '/getStickerSetByName',
        search: '/searchStickerSet'
      }
    },

    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
      origin: 'https://webapp.fstik.app',
      referer: 'https://webapp.fstik.app/',
      'user-agent': 'NB Android/1.0.0'
    },

    name: async (name) => {
      if (!name || typeof name !== 'string') {
        return {
          success: false,
          code: 400,
          result: { error: '¡La entrada no puede estar vacía, colega! 🗿' }
        }
      }

      try {
        const res = await axios.post(
          fstik.api.base + fstik.api.endpoints.direct,
          { name, user_token: null },
          { headers: fstik.headers }
        )

        const set = res.data?.result
        if (!set) {
          return {
            success: false,
            code: 404,
            result: { error: `Sticker set "${name}"No hay ningún hermano... 🤙🏻` }
          }
        }

        return {
          success: true,
          code: 200,
          result: {
            source: 'database',
            id: set.id,
            title: set.title,
            name: set.name,
            description: set.description,
            tags: set.tags,
            kind: set.kind,
            type: set.type,
            public: set.public,
            safe: set.safe,
            verified: set.verified,
            reaction: set.reaction,
            installations: set.installations,
            stickerCount: set.stickers?.length || 0,
            stickers: set.stickers?.map((s, i) => {
              const file_id = s.file_id ?? s.fileid
              const thumb_id = s.thumb?.file_id ?? s.thumb?.fileid
              return {
                index: i + 1,
                file_id,
                thumb_id,
                size: `${s.width}x${s.height}`,
                image_url: thumb_id ? `${fstik.api.base}/file/${thumb_id}/sticker.webp` : null
              }
            })
          }
        }
      } catch (err) {
        return {
          success: false,
          code: err?.response?.status || 500,
          result: {
            error: 'Error bree 🫵🏻😂',
            details: err.message
          }
        }
      }
    },

    search: async ({ query = '', skip = 0, limit = 15, type = '', kind = 'regular' }) => {
      try {
        const payload = { query, skip, limit, type, kind, user_token: null }

        const res = await axios.post(
          fstik.api.base + fstik.api.endpoints.search,
          payload,
          { headers: fstik.headers }
        )

        const sets = res.data?.result?.stickerSets
        if (!sets || sets.length === 0) {
          return {
            success: false,
            code: 404,
            result: { error: 'Sticker No hay ningún conjunto establecido hermano... inténtalo de nuevo más tarde, vale 😂🫵🏻' }
          }
        }

        return {
          success: true,
          code: 200,
          result: sets.map((set, i) => ({
            index: i + skip + 1,
            id: set.id,
            name: set.name,
            title: set.title,
            description: set.description,
            tags: set.tags,
            kind: set.kind,
            type: set.type,
            public: set.public,
            safe: set.safe,
            verified: set.verified,
            reaction: set.reaction,
            installations: set.installations,
            stickerCount: set.stickers?.length || 0,
            stickers: set.stickers?.map((s, j) => {
              const file_id = s.file_id ?? s.fileid
              const thumb_id = s.thumb?.file_id ?? s.thumb?.fileid
              return {
                index: j + 1,
                file_id,
                thumb_id,
                size: `${s.width}x${s.height}`,
                image_url: thumb_id ? `${fstik.api.base}/file/${thumb_id}/sticker.webp` : null
              }
            })
          }))
        }
      } catch (err) {
        return {
          success: false,
          code: err?.response?.status || 500,
          result: {
            error: 'No encuentro el sticker hermano.. 🤙🏻',
            details: err.message
          }
        }
      }
    },

    more: async (link, skip = 0, limit = 15) => {
      if (!link?.startsWith('https://t.me/addstickers/')) {
        return {
          success: false,
          code: 400,
          result: { error: 'Link telegramnya kagak valid bree 🗿' }
        }
      }

      const name = link.split('/addstickers/')[1]?.trim()
      if (!name) {
        return {
          success: false,
          code: 400,
          result: { error: 'Lo siento, no hay nombre para el set sticker 😏' }
        }
      }

      const i = await fstik.name(name)
      if (!i.success) return i

      return await fstik.search({
        query: [i.result.id],
        type: 'more',
        skip,
        limit
      })
    },

    lookup: async (input) => {
      if (!input || typeof input !== 'string') {
        return {
          success: false,
          code: 400,
          result: { error: '¡La entrada no puede estar vacía, colega! 🗿' }
        }
      }

      let name = input.trim()
      const isLink = input.startsWith('https://t.me/addstickers/')
      if (isLink) {
        try {
          const url = new URL(name)
          name = url.pathname.replace('/addstickers/', '').trim()
          const direct = await fstik.name(name)
          if (direct.success) return direct
        } catch {
          return {
            success: false,
            code: 400,
            result: { error: 'Link telegramnya kagak valid bree... '}
          }
        }
      }

      return await fstik.search({
        query: name,
        type: '',
        kind: 'regular'
      })
    },

    request: async (query, mode = '', options = {}) => {
      if (!query || typeof query !== 'string') {
        return {
          success: false,
          code: 400,
          result: { error: '¡La entrada no puede estar vacía, colega! 🗿' }
        }
      }

      const input = query.trim()

      switch (mode) {
        case 'lookup':
          return await fstik.lookup(input)

        case 'more':
          return await fstik.more(input, options.skip || 0, options.limit || 15)

        case 'name':
          return await fstik.name(input)

        case 'search':
        case '':
          return await fstik.search({
            query: input,
            skip: options.skip || 0,
            limit: options.limit || 15,
            type: options.type || '',
            kind: options.kind || 'regular'
          })

        default:
          return {
            success: false,
            code: 400,
            result: { error: `Moda"${mode}"Bueno, no es válido...` }
          }
      }
    }
  }

  async function handler(m, { conn, args, command }) {
    try {
      if (!args[0]) return m.reply('Ingrese la consulta de búsqueda o el enlace sticker Telegram\n\nEjemplo:\n.fstik bokepanak\n.fstik https://t.me/addstickers/pepe_memes')

      const query = args.join(' ')
      const isLink = query.startsWith('https://t.me/addstickers/')

      let result
      if (isLink) {
        result = await fstik.more(query)
      } else {
        result = await fstik.lookup(query)
      }

      if (!result.success) {
        return m.reply(result.result.error || 'Ertor Bang :v')
      }

      const sendInfo = async (set) => {
        let text = `INFO STICKER SET\n\n`
        text += `Nombre: ${set.title}\n`
        text += `ID : ${set.id}\n`
        text += `Nombre del conjunto: ${set.name}\n`
        text += `Descripción: ${set.description || 'Sin descripción'}\n`
        text += `Etiquetas: ${set.tags?.join(', ') || 'Sin etiquetas'}\n`
        text += `Jenis : ${set.kind}\n`
        text += `Tipe : ${set.type}\n`
        text += `Público: ${set.public ? 'Sí' : 'No'}\n`
        text += `Seguro: ${set.safe ? 'Sí' : 'No'}\n`
        text += `Verificado: ${set.verified ? 'Sí' : 'No'}\n`
        text += `Cantidad Sticker: ${set.stickerCount}\n`
        text += `Link : https://t.me/addstickers/${set.name}\n\n`

        await conn.sendMessage(m.chat, {
          image: { url: set.stickers?.[0]?.image_url },
          caption: text
        }, { quoted: m })

        const urls = (set.stickers || []).map(st => st.image_url).filter(Boolean).slice(0, 30)
        if (!urls.length) throw new Error('Este conjunto no tiene pegatinas.')
        await sendStickerPack(conn, m.chat, urls, m, {
          name: set.title || set.name || 'Sticker Pack',
          publisher: set.name || 'fstik',
          description: set.description || `Sticker conjunto de fstik: ${set.name}`,
          emojis: ['✨']
        })
      }

      const delay = ms => new Promise(res => setTimeout(res, ms))

      if (Array.isArray(result.result)) {
        const firstSet = result.result[0]
        await sendInfo(firstSet)
      } else {
        const set = result.result
        await sendInfo(set)
      }
    } catch (e) {
      m.reply(e.message)
    }
  }

export { pluginConfig as config, handler }
