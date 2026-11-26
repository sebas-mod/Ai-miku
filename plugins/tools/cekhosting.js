/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

const pluginConfig = {
    name: "cekhosting",
    alias: ["hosting"],
    category: "tools",
    description: "cekhosting <domain>",
    usage: ".cekhosting <domain>",
    example: ".cekhosting <domain>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const BASE_URL = 'https://hostingchecker.com/'
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  function cleanDomain(input) {
      if (!input) return null
      const domain = String(input).trim()
          .replace(/^https?:\/\//i, '')
          .replace(/^www\./i, '')
          .split('/')[0].split('?')[0].split('#')[0]
          .replace(/:\d+$/, '')
          .trim()
      return domain || null
  }

  function parseResult($) {
      const data = {}
      let whoisUrl = null
      $('.hcresults p').each((_, el) => {
          const text = $(el).text().trim()
          const match = text.match(/^([^:]+):\s*(.+)$/)
          if (!match) return
          const [, label, value] = match
          data[label.trim()] = value.trim()
          if (/WHOIS/i.test(label)) whoisUrl = $(el).find('a').attr('href') || null
      })
      return { data, whoisUrl }
  }

  function parseASN(value) {
      if (!value) return { asn: null, organization: null }
      const match = value.match(/^(AS\d+)\s*(.*)$/i)
      return { asn: match?.[1] || null, organization: match?.[2] || null }
  }

  async function checkHosting(domainInput) {
      const domain = cleanDomain(domainInput)
      if (!domain) throw new Error('Dominio no válido.')

      const body = new URLSearchParams({ target: domain, submit: 'Find Host' })
      const { data: html, status } = await axios.post(BASE_URL, body, {
          timeout: 30000,
          validateStatus: () => true,
          headers: {
              'User-Agent': USER_AGENT,
              'Content-Type': 'application/x-www-form-urlencoded',
              Origin: BASE_URL,
              Referer: BASE_URL
          }
      })
      if (status !== 200) throw new Error(`HTTP ${status} dari hostingchecker.com`)

    const $ = cheerio.load(html)
      if (!$('.hcresults').length) throw new Error('Falló la búsqueda o no se encontró el dominio.')

      const { data, whoisUrl } = parseResult($)
      const { asn, organization: asOrganization } = parseASN(data['AS (autonomous system) number and organization'])

      return {
          domain,
          hostedBy: data['It is hosted by'] || null,
          organization: data['Organization name'] || null,
          ipAddress: data['IP address'] || null,
          asn,
          asOrganization,
          asName: data['AS name'] || null,
          reverseDns: data['Reverse DNS of the IP'] || null,
          city: data['City'] || null,
          country: data['Country'] || null,
          whoisUrl
      }
  }

  async function handler(m, { text, reply, example }) {
      if (!text) return example('google.com')
      try {
          const r = await checkHosting(text)
          const v = (x) => x || '-'
          return reply(
              `🌐 *CEK HOSTING*\n\n` +
              `🔗 Domain : ${r.domain}\n` +
              `🏢 Hosting : ${v(r.hostedBy)}\n` +
              `🏛️ Organisasi : ${v(r.organization)}\n` +
              `📡 IP : ${v(r.ipAddress)}\n` +
              `🔢 ASN : ${v(r.asn)}\n` +
              `🏷️ AS Org : ${v(r.asOrganization)}\n` +
              `🧾 AS Name : ${v(r.asName)}\n` +
              `🔁 Reverse DNS : ${v(r.reverseDns)}\n` +
              `🏙️ Kota : ${v(r.city)}\n` +
              `🌍 Negara : ${v(r.country)}` +
              (r.whoisUrl ? `\n📄 WHOIS : ${r.whoisUrl}` : '')
          )
      } catch (e) {
          return reply(`❌ ${e.message}`)
      }
  }

export { pluginConfig as config, handler }
