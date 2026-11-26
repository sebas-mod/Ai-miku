/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "kodepos",
    alias: [],
    category: "tools",
    description: "kodepos <wilayah>",
    usage: ".kodepos <wilayah>",
    example: ".kodepos <wilayah>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const BASE = 'https://www.emsifa.com/api-wilayah-indonesia/v2'

  const normalize = (str = '') =>
      str
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\b(kec|kecamatan|kab|kabupaten|kota|prov|provinsi)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim()

  async function getJSON(url) {
      const res = await fetch(url)

      if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
      }

      return await res.json()
  }

  function cleanName(name) {
      return normalize(name)
  }

  function matchName(name, query) {
      const a = cleanName(name)
      const b = cleanName(query)

      if (!a || !b) return false

      return (
          a === b ||
          a.includes(b) ||
          b.includes(a)
      )
  }

  async function cariWilayah(query) {
      const q = normalize(query)

      const provinces = await getJSON(
          `${BASE}/provinces.json`
      )

      const provs = provinces.data || provinces

      for (const province of provs) {
          let regencies

          try {
              const data = await getJSON(
                  `${BASE}/regencies/${province.id}.json`
              )

              regencies = data.data || data
          } catch {
              continue
          }

          for (const regency of regencies) {
              let districts

              try {
                  const data = await getJSON(
                      `${BASE}/districts/${regency.id}.json`
                  )

                  districts = data.data || data
              } catch {
                  continue
              }

              for (const district of districts) {
                  if (matchName(district.name, q)) {
                      return {
                          type: 'district',
                          province,
                          regency,
                          district
                      }
                  }

                  let villages

                  try {
                      const data = await getJSON(
                          `${BASE}/villages/${district.id}.json`
                      )

                      villages = data.data || data
                  } catch {
                      continue
                  }

                  for (const village of villages) {
                      if (matchName(village.name, q)) {
                          return {
                              type: 'village',
                              province,
                              regency,
                              district,
                              village
                          }
                      }
                  }

                  const combined = normalize(
                      `${regency.name} ${district.name}`
                  )

                  if (
                      q.includes(normalize(district.name)) &&
                      q.includes(normalize(regency.name).replace(
                          'kabupaten ',
                          ''
                      ))
                  ) {
                      return {
                          type: 'district',
                          province,
                          regency,
                          district
                      }
                  }

                  for (const village of villages) {
                      const fullVillage = normalize(
                          `${regency.name} ${district.name} ${village.name}`
                      )

                      if (
                          q.includes(normalize(village.name)) &&
                          q.includes(normalize(district.name))
                      ) {
                          return {
                              type: 'village',
                              province,
                              regency,
                              district,
                              village
                          }
                      }

                      if (fullVillage === q) {
                          return {
                              type: 'village',
                              province,
                              regency,
                              district,
                              village
                          }
                      }
                  }
              }
          }
      }

      for (const province of provs) {
          let regencies

          try {
              const data = await getJSON(
                  `${BASE}/regencies/${province.id}.json`
              )

              regencies = data.data || data
          } catch {
              continue
          }

          for (const regency of regencies) {
              if (matchName(regency.name, q)) {
                  return {
                      type: 'regency',
                      province,
                      regency
                  }
              }
          }
      }

      for (const province of provs) {
          if (matchName(province.name, q)) {
              return {
                  type: 'province',
                  province
              }
          }
      }

      return null
  }

  async function handler(m, { text, reply, example }) {
      if (!text) {
          return example(
              'kotabaru kelumpang hulu\n\n' +
              'o:\n' +
              '.kodepos kelumpang hulu\n' +
              '.kodepos cantung kiri hilir'
          )
      }

      try {
          const result = await cariWilayah(text)

          if (!result) {
              return reply(
                  `❌ No se encontró la zona *${text}*.\n\n` +
                  `Prueba con el nombre del distrito o del barrio.`
              )
          }

          if (result.type === 'district') {
              const data = await getJSON(
                  `${BASE}/villages/${result.district.id}.json`
              )

              const villages = data.data || data

              let teks = `📮 *CONSULTA DE CÓDIGO POSTAL*\n`
              teks += `━━━━━━━━━━━━━━━━━━\n\n`

              teks += `📍 Distrito: *${result.district.name}*\n`
              teks += `🏙️ Ciudad: *${result.regency.name}*\n`
              teks += `🗺️ Provincia: *${result.province.name}*\n\n`

              teks += `*Lista de barrios/pueblos:*\n\n`

              if (!villages.length) {
                  teks += `No hay datos de barrios.`
              } else {
                  for (const village of villages) {
                      teks += `• ${village.name}\n`
                      teks += `  Código postal: *${village.postal_code || '-'}*\n\n`
                  }
              }

              teks += `━━━━━━━━━━━━━━━━━━`

              return reply(teks)
          }

          if (result.type === 'village') {
              const v = result.village

              let teks = `📮 *CONSULTA DE CÓDIGO POSTAL*\n`
              teks += `━━━━━━━━━━━━━━━━━━\n\n`

              teks += `🏠 Barrio/Pueblo: *${v.name}*\n`
              teks += `📮 Código postal: *${v.postal_code || '-'}*\n`
              teks += `📍 Distrito: *${result.district.name}*\n`
              teks += `🏙️ Ciudad: *${result.regency.name}*\n`
              teks += `🗺️ Provincia: *${result.province.name}*\n`

              teks += `\n━━━━━━━━━━━━━━━━━━`

              return reply(teks)
          }

          if (result.type === 'regency') {
              let teks = `🏙️ *${result.regency.name}*\n`
              teks += `━━━━━━━━━━━━━━━━━━\n\n`
              teks += `Ciudad encontrada.\n\n`
              teks += `Escribe el nombre del distrito o del barrio para obtener el código postal.\n\n`
              teks += `Ejemplo:\n`
              teks += `.kodepos ${result.regency.name.replace(
                /^(Kabupaten|Kota)\s+/i,
                ''
            )} kelumpang hulu`

              return reply(teks)
          }

          if (result.type === 'province') {
              return reply(
                  `🗺️ *${result.province.name}*\n\n` +
                  `Provincia encontrada.\n` +
                  `Escribe el nombre del distrito o del barrio para buscar el código postal.`
              )
          }
      } catch (e) {
          console.error('[KODEPOS ERROR]', e)

          return reply(
              `❌ No se pudieron obtener los datos del código postal.\n\n` +
              `Error: ${e.message}`
          )
      }
  }

export { pluginConfig as config, handler }
