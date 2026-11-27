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

const pluginConfig = {
    name: "cariloker",
    alias: [],
    category: "tools",
    description: "cariloker <keyword>",
    usage: ".cariloker <keyword>",
    example: ".cariloker <keyword>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const API = 'https://himalayas.app/jobs/api/search'

  async function handler(m, { sock, jid, text }) {
      if (!text?.trim()) {
          return sock.sendMessage(jid, {
              text:
  `╭─「BÚSQUEDA DE CASQUILLO」
│
│ Búsqueda de ofertas de trabajo remoto
│
│ Ejemplo:
│.cariloker programador
│.cariloker javascript
│.cariloker desarrollador web
│.cariloker diseñador gráfico
│.cariloker atención al cliente
│
╰──────────────`
          }, { quoted: m })
      }

      const keyword = text.trim()

      await sock.sendMessage(jid, {
          text: `🔎 Buscando empleos remotos de *${keyword}*...`
      }, { quoted: m })

      try {
          const { data } = await axios.get(API, {
              params: {
                  q: keyword,
                  sort: 'recent',
                  page: 1
              },
              timeout: 20000,
              headers: {
                  'User-Agent': 'Arthazy/1.0'
              }
          })

          const jobs = Array.isArray(data?.jobs)
              ? data.jobs
              : []

          if (!jobs.length) {
              return sock.sendMessage(jid, {
                  text:
  `❌ No se encontraron ofertas para:

🔎 ${keyword}

Prueba otra palabra clave:
• programmer
• javascript
• frontend
• backend
• designer
• customer service`
              }, { quoted: m })
          }

          const hasil = jobs.slice(0, 10)

          let textOut =
  `╭─「 BUSCAR EMPLEO 」
│ 🔎 ${keyword}
│ 🌐 Remoto / Trabajo desde casa
│ 📋 ${hasil.length} resultados
╰──────────────

`

          for (let i = 0; i < hasil.length; i++) {
              const job = hasil[i]

              const title =
                  job.title ||
                  job.name ||
                  'Sin titulo'

              const company =
                  job.companyName ||
                  job.company?.name ||
                  'Desconocido'

              const location =
                  job.location ||
                  job.locationRestrictions?.join(', ') ||
                  'Remote'

              let salary = ''

              if (job.salary) {
                  salary = `\n│ 💰 ${job.salary}`
              } else if (
                  job.minSalary != null ||
                  job.maxSalary != null
              ) {
                  const min = job.minSalary
                      ? Number(job.minSalary).toLocaleString('id-ID')
                      : '?'

                  const max = job.maxSalary
                      ? Number(job.maxSalary).toLocaleString('id-ID')
                      : '?'

                  salary = `\n│ 💰 ${min} - ${max}`
              }

              const link =
                  job.applicationLink ||
                  job.url ||
                  job.guid ||
                  job.slug

              const url = link
                  ? String(link).startsWith('http')
                      ? link
                      : `https://himalayas.app/jobs/${link}`
                  : '-'

              textOut +=
  `╭─「 ${i + 1} 」
│ 💼 *${title}*
│ 🏢 ${company}
│ 📍 ${location}${salary}
│
│ 🔗 ${url}
╰──────────────

`
          }

          textOut +=
  `> Sumber: Himalayas
> Lowongan remote / work-from-home`

          await sock.sendMessage(jid, {
              text: textOut
          }, { quoted: m })
      } catch (err) {
          console.error('[CARILOKER]', err?.response?.status || err)

          await sock.sendMessage(jid, {
              text:
  `❌ No se pudieron recuperar los datos del casillero.

Actualmente no se puede acceder al servidor de origen.
Inténtalo de nuevo unos momentos más tarde.`
          }, { quoted: m })
      }
  }

export { pluginConfig as config, handler }
