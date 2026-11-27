/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
const mikuLib = (name) => MikuRuntime.mikuLib(name, typeof libs !== 'undefined' ? libs : null);

const libs = {
    "google": async ({ mikuLib }) => {
      const cheerio = (await import('cheerio'))
      const axios = (__m => __m.default ?? __m)((await import('axios')))

      const ENGINE_CONFIG = Object.freeze({
        TARGET_HOST: 'bmV3cy5nb29nbGUuY29t',
        DEFAULT_LANG: 'id',
        DEFAULT_REGION: 'ID',
        NETWORK_TIMEOUT: 8500,
        UA_POOL:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      })

      class GoogleScraperKernel {
        constructor() {
          this.resolverHost = Buffer.from(
            ENGINE_CONFIG.TARGET_HOST,
            'base64',
          ).toString('utf-8')
        }

        $extractCipherPayload(sourceUrl) {
          if (!sourceUrl || typeof sourceUrl !== 'string') return null
          const pointer = sourceUrl.indexOf('articles/')
          if (pointer === -1) return null
          return sourceUrl.substring(pointer + 9).split('?')[0]
        }

        $transformSerialization(cipherText) {
          let serialized = cipherText.replace(/-/g, '+').replace(/_/g, '/')
          const padMetric = serialized.length % 4
          if (padMetric > 0) {
            serialized += '='.repeat(4 - padMetric)
          }
          return serialized
        }

        compileBinaryPayload(rawUrl) {
          try {
            const token = this.$extractCipherPayload(rawUrl)
            if (!token) return rawUrl

            const targetMatrix = this.$transformSerialization(token)
            const byteBuffer = Buffer.from(targetMatrix, 'base64')
            const streamOutput = byteBuffer.toString('utf-8')

            const urlVector = streamOutput.match(/https?:\/\/[^\s"\><]+/g)
            return urlVector && urlVector.length > 0 ? urlVector[0] : rawUrl
          } catch {
            return rawUrl
          }
        }

        async executeQueryPipeline(searchToken) {
          if (!searchToken || searchToken.trim().length === 0) {
            return { status: false, error: 'La consulta no puede estar vacía.' }
          }

          const queryHex = encodeURIComponent(searchToken)
          const endpointUri = `https://${this.resolverHost}/rss/search?q=${queryHex}&hl=${ENGINE_CONFIG.DEFAULT_LANG}&gl=${ENGINE_CONFIG.DEFAULT_REGION}&ceid=${ENGINE_CONFIG.DEFAULT_REGION}:${ENGINE_CONFIG.DEFAULT_LANG}`

          try {
            const networkResponse = await axios.get(endpointUri, {
              timeout: ENGINE_CONFIG.NETWORK_TIMEOUT,
              headers: {
                'User-Agent': ENGINE_CONFIG.UA_POOL,
                'X-Engine-Context': 'Production-Kernel-v3.0.4',
              },
            })

            if (networkResponse.status !== 200) {
              throw new Error(`El núcleo de red rechazó la transmisión con estado: ${networkResponse.status}`)
            }

            const documentContext = cheerio.load(networkResponse.data, {
              xmlMode: true,
            })
            const allocationPool = []

            documentContext('item').each((index, structuralNode) => {
              const nodeLink = documentContext(structuralNode).find('link').text()
              const processedAddress = this.compileBinaryPayload(nodeLink)

              allocationPool.push({
                index_node: index + 1,
                resource_title: documentContext(structuralNode).find('title').text(),
                resolved_endpoint: processedAddress,
                temporal_stamp: documentContext(structuralNode).find('pubDate').text(),
                origin_node: documentContext(structuralNode).find('source').text(),
              })
            })

            return { status: true, results: allocationPool }
          } catch (pipelineError) {
            return { status: false, error: pipelineError.message }
          }
        }
      }

      async function GoogleSearch(query) {
        const kernel = new GoogleScraperKernel()
        return kernel.executeQueryPipeline(query)
      }

      const __default = GoogleSearch
      return { GoogleSearch, default: __default }
    }
}

const pluginConfig = {
    name: "google",
    alias: ["gugel", "searchgoogle"],
    category: "search",
    description: "google <query>",
    usage: ".google <query>",
    example: ".google <query>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const { GoogleSearch } = (await mikuLib('google'))

  async function handler(m, { text, reply, usedPrefix, command }) {
    if (!text) {
      return reply(`🔍 *GOOGLE SEARCH*\n\nBúsqueda de información y noticias en Google.\n\nEjemplo:\n${usedPrefix}${command} noticias recientes de tecnología\n${usedPrefix}${command} AI Gemini`)
    }

    await m.react('⏳')

    try {
      const res = await GoogleSearch(text.trim())

      if (!res.status || !res.results || res.results.length === 0) {
        await m.react('✖️')
        return reply(`❌ No se encontraron resultados para *"${text}"*.`)
      }

      await m.react('✅')

      const items = res.results.slice(0, 10)
      let caption = `🌐 *GOOGLE SEARCH RESULTS*\n\n`
      caption += `🔎 *Query:* ${text}\n`
      caption += `📊 *Encontrados:* ${res.results.length} resultados\n\n`
      caption += `──────────────────\n\n`

      items.forEach((item, idx) => {
        caption += `*${idx + 1}. ${item.resource_title}*\n`
        if (item.origin_node) caption += `   🏢 Sumber: *${item.origin_node}*\n`
        if (item.temporal_stamp) caption += `   🕒 Hora: ${item.temporal_stamp}\n`
        caption += `   🔗 Link: ${item.resolved_endpoint}\n\n`
      })

      return reply(caption.trim())
    } catch (e) {
      await m.react('❌')
      return reply(`❌ Se produjo un error: ${e.message || String(e)}`)
    }
  }

export { pluginConfig as config, handler }
