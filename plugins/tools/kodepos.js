/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

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
              'atau:\n' +
              '.kodepos kelumpang hulu\n' +
              '.kodepos cantung kiri hilir'
          )
      }

      try {
          const result = await cariWilayah(text)

          if (!result) {
              return reply(
                  `❌ Wilayah *${text}* tidak ditemukan.\n\n` +
                  `Coba gunakan nama kecamatan atau kelurahan.`
              )
          }

          if (result.type === 'district') {
              const data = await getJSON(
                  `${BASE}/villages/${result.district.id}.json`
              )

              const villages = data.data || data

              let teks = `📮 *CEK KODE POS*\n`
              teks += `━━━━━━━━━━━━━━━━━━\n\n`

              teks += `📍 Kecamatan: *${result.district.name}*\n`
              teks += `🏙️ Kabupaten/Kota: *${result.regency.name}*\n`
              teks += `🗺️ Provinsi: *${result.province.name}*\n\n`

              teks += `*Daftar Kelurahan/Desa:*\n\n`

              if (!villages.length) {
                  teks += `Tidak ada data kelurahan/desa.`
              } else {
                  for (const village of villages) {
                      teks += `• ${village.name}\n`
                      teks += `  Kode Pos: *${village.postal_code || '-'}*\n\n`
                  }
              }

              teks += `━━━━━━━━━━━━━━━━━━`

              return reply(teks)
          }

          if (result.type === 'village') {
              const v = result.village

              let teks = `📮 *CEK KODE POS*\n`
              teks += `━━━━━━━━━━━━━━━━━━\n\n`

              teks += `🏠 Kelurahan/Desa: *${v.name}*\n`
              teks += `📮 Kode Pos: *${v.postal_code || '-'}*\n`
              teks += `📍 Kecamatan: *${result.district.name}*\n`
              teks += `🏙️ Kabupaten/Kota: *${result.regency.name}*\n`
              teks += `🗺️ Provinsi: *${result.province.name}*\n`

              teks += `\n━━━━━━━━━━━━━━━━━━`

              return reply(teks)
          }

          if (result.type === 'regency') {
              let teks = `🏙️ *${result.regency.name}*\n`
              teks += `━━━━━━━━━━━━━━━━━━\n\n`
              teks += `Kabupaten/Kota ditemukan.\n\n`
              teks += `Masukkan nama kecamatan atau kelurahan untuk mendapatkan kode pos.\n\n`
              teks += `Contoh:\n`
              teks += `.kodepos ${result.regency.name.replace(
                /^(Kabupaten|Kota)\s+/i,
                ''
            )} kelumpang hulu`

              return reply(teks)
          }

          if (result.type === 'province') {
              return reply(
                  `🗺️ *${result.province.name}*\n\n` +
                  `Provinsi ditemukan.\n` +
                  `Masukkan nama kecamatan atau kelurahan untuk mencari kode pos.`
              )
          }
      } catch (e) {
          console.error('[KODEPOS ERROR]', e)

          return reply(
              `❌ Gagal mengambil data kode pos.\n\n` +
              `Error: ${e.message}`
          )
      }
  }

export { pluginConfig as config, handler }
