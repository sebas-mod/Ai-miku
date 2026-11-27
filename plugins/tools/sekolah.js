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
    name: "sekolah",
    alias: [],
    category: "tools",
    description: "Fitur tools sekolah",
    usage: ".sekolah",
    example: ".sekolah",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const API_URL =
      'https://sekolah.data.kemendikdasmen.go.id/v1/sekolah-service/sekolah/cari-sekolah'

  async function cariSekolah(keyword, options = {}) {
      const payload = {
          page: options.page || 0,
          size: options.limit || 12,
          keyword,
          kabupaten_kota: options.kabupatenKota || '',
          bentuk_pendidikan: options.bentukPendidikan || '',
          status_sekolah: options.statusSekolah || ''
      }

      const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*',
              'User-Agent':
                  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
              'Referer':
                  `https://sekolah.data.kemendikdasmen.go.id/sekolah?keyword=${encodeURIComponent(keyword)}`
          },
          body: JSON.stringify(payload)
      })

      if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
      }

      const json = await res.json()

      if (json.status_code && json.status_code !== 200) {
          throw new Error(
              json.message || 'No se pudieron recuperar los datos de la escuela.'
          )
      }

      const items = Array.isArray(json.data)
          ? json.data
          : []

      return {
          total: json.total || 0,
          count: items.length,
          sekolah: items.map(s => ({
              nama: s.nama,
              npsn: s.npsn,
              bentuk_pendidikan: s.bentuk_pendidikan,
              status_sekolah: s.status_sekolah,
              akreditasi: s.akreditasi,
              alamat: s.alamat_jalan,
              dusun: s.nama_dusun,
              kecamatan: s.kecamatan,
              kabupaten: s.kabupaten,
              provinsi: s.provinsi,
              kode_pos: s.kode_pos,
              foto: s.path_file
          }))
      }
  }

  function parseInput(text) {
      const parts = text
          .split('|')
          .map(v => v.trim())

      const keyword = parts[0] || ''

      const limit =
          Math.min(
              Math.max(
                  parseInt(parts[1] || '12', 10) || 12,
                  1
              ),
              50
          )

      return {
          keyword,
          limit,
          kabupatenKota: parts[2] || '',
          bentukPendidikan: parts[3] || '',
          statusSekolah: parts[4] || ''
      }
  }

  function formatSekolah(data, keyword) {
      if (!data.sekolah.length) {
          return [
              `╭─「 BÚSQUEDA DE COLEGIOS 」`,
              `│`,
              `│ Búsqueda : ${keyword}`,
              `│`,
              `│ No se encontraron colegios.`,
              `│`,
              `╰──────────────`
          ].join('\n')
      }

      const hasil = [
          `╭─「 DATOS DE COLEGIOS 」`,
          `│`,
          `│ Búsqueda : ${keyword}`,
          `│ Total   : ${data.total}`,
          `│ Mostrados: ${data.count}`,
          `│`
      ]

      data.sekolah.forEach((s, i) => {
          hasil.push(
              `├─「 ${i + 1} 」`,
              `│ Número: ${s.nama || '-'}`,
              `│ NPSN       : ${s.npsn || '-'}`,
              `│ Tipo       : ${s.bentuk_pendidikan || '-'}`,
              `│ Estado: ${s.status_sekolah || '-'}`,
              `│ Acreditación : ${s.akreditasi || '-'}`,
              `│ Dirección  : ${s.alamat || '-'}`,
              `│ Aldea      : ${s.dusun || '-'}`,
              `│ Distrito   : ${s.kecamatan || '-'}`,
              `│ Ciudad      : ${s.kabupaten || '-'}`,
              `│ Provincia  : ${s.provinsi || '-'}`,
              `│ Código postal : ${s.kode_pos || '-'}`,
              `│`
          )
      })

      hasil.push(`╰──────────────`)

      return hasil.join('\n')
  }

  async function handler(m, { text, reply }) {
      if (!text) {
          return reply(
              [
                  `╭─「 BÚSQUEDA DE COLEGIOS 」`,
                  `│`,
                  `│ Modo de uso:`,
                  `│.sekolah <búsqueda>`,
                  `│`,
                  `│ Ejemplo:`,
                  `│.sekolah PEQUEÑO 1`,
                  `│`,
                  `│ Con límite:`,
                  `│.sekolah ESCUELA SECUNDARIA 1|20`,
                  `│`,
                  `│ Con ciudad:`,
                  `│.sekolah SMAN|20|Banjar`,
                  `│`,
                  `│ Formato completo:`,
                  `│ búsqueda|límite|ciudad|tipo|estado`,
                  `│`,
                  `│ Ejemplo:`,
                  `│.sekolah ESCUELA SECUNDARIA|20|Banjar|SMA|Estado`,
                  `│`,
                  `╰──────────────`
              ].join('\n')
          )
      }

      try {
          const options = parseInput(text)

          if (!options.keyword) {
              return reply('Escribe el nombre o la palabra clave del colegio.')
          }

          await reply('Buscando datos del colegio...')

          const data =
              await cariSekolah(
                  options.keyword,
                  options
              )

          return reply(
              formatSekolah(
                  data,
                  options.keyword
              )
          )
      } catch (e) {
          console.error('[SEKOLAH]', e)

          return reply(
              `No se pudieron recuperar los datos de la escuela.\n\n${e.message}`
          )
      }
  }

export { pluginConfig as config, handler }
