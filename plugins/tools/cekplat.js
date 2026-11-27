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
    name: "cekplat",
    alias: ["plat"],
    category: "tools",
    description: "cekplat",
    usage: ".cekplat",
    example: ".cekplat",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const PLAT = {
      BL: 'Aceh',
      BB: 'Sumatera Utara (Tapanuli: Sibolga, Tarutung, Padangsidimpuan, dll)',
      BK: 'Sumatera Utara (Medan, Deli Serdang, Binjai, dll)',
      BA: 'Sumatera Barat',
      BM: 'Riau',
      BP: 'Kepulauan Riau',
      BH: 'Jambi',
      BG: 'Sumatera Selatan',
      BD: 'Bengkulu',
      BE: 'Lampung',
      BN: 'Kepulauan Bangka Belitung',
      A: 'Banten (Serang, Cilegon, Pandeglang, Lebak)',
      B: 'DKI Jakarta, Depok, Tangerang, Bekasi',
      D: 'Jawa Barat (Bandung dan sekitarnya)',
      E: 'Jawa Barat (Cirebon, Indramayu, Majalengka, Kuningan)',
      F: 'Jawa Barat (Bogor, Sukabumi, Cianjur)',
      T: 'Jawa Barat (Karawang, Purwakarta, Subang)',
      Z: 'Jawa Barat (Garut, Tasikmalaya, Sumedang, Ciamis, Banjar, Pangandaran)',
      G: 'Jawa Tengah (Pekalongan, Tegal, Brebes, Batang, Pemalang)',
      H: 'Jawa Tengah (Semarang, Kendal, Salatiga, Demak, Ungaran)',
      K: 'Jawa Tengah (Pati, Kudus, Jepara, Rembang, Blora, Grobogan)',
      R: 'Jawa Tengah (Banyumas, Cilacap, Purbalingga, Banjarnegara)',
      AA: 'Jawa Tengah (Kedu: Magelang, Purworejo, Temanggung, Kebumen, Wonosobo)',
      AD: 'Jawa Tengah (Surakarta, Sukoharjo, Boyolali, Klaten, Karanganyar)',
      AB: 'DI Yogyakarta',
      L: 'Jawa Timur (Surabaya)',
      M: 'Jawa Timur (Madura)',
      N: 'Jawa Timur (Malang, Pasuruan, Probolinggo, Batu, Lumajang)',
      P: 'Jawa Timur (Besuki: Jember, Banyuwangi, Bondowoso, Situbondo)',
      S: 'Jawa Timur (Bojonegoro, Tuban, Lamongan, Mojokerto, Jombang)',
      W: 'Jawa Timur (Sidoarjo, Gresik)',
      AE: 'Jawa Timur (Madiun, Ngawi, Magetan, Ponorogo, Pacitan)',
      AG: 'Jawa Timur (Kediri, Blitar, Tulungagung, Nganjuk, Trenggalek)',
      DK: 'Bali',
      DR: 'Nusa Tenggara Barat (Pulau Lombok)',
      EA: 'Nusa Tenggara Barat (Pulau Sumbawa)',
      DH: 'Nusa Tenggara Timur (Kupang dan Timor)',
      EB: 'Nusa Tenggara Timur (Flores)',
      ED: 'Nusa Tenggara Timur (Sumba)',
      KB: 'Kalimantan Barat',
      KH: 'Kalimantan Tengah',
      DA: 'Kalimantan Selatan',
      KT: 'Kalimantan Timur',
      KU: 'Kalimantan Utara',
      DB: 'Sulawesi Utara (Manado dan sekitarnya)',
      DL: 'Sulawesi Utara (Kepulauan Sangihe dan Talaud)',
      DM: 'Gorontalo',
      DN: 'Sulawesi Tengah',
      DT: 'Sulawesi Tenggara',
      DD: 'Sulawesi Selatan (Makassar dan sekitarnya)',
      DP: 'Sulawesi Selatan (Makassar / Ujung Pandang)',
      DC: 'Sulawesi Barat',
      DE: 'Maluku',
      DG: 'Maluku Utara',
      PA: 'Papua',
      DS: 'Papua',
      PB: 'Papua Barat'
  }

  const SPECIAL = {
      CD: 'Cuerpo Diplomático (embajadas/representantes de países extranjeros)',
      CC: 'Korps Konsuler (konsulat negara asing)'
  }

  const WARNA = [
      'Putih, tulisan hitam: kendaraan pribadi',
      'Kuning, tulisan hitam: angkutan umum',
      'Merah, tulisan putih: kendaraan dinas pemerintah',
      'Hijau, tulisan hitam: kawasan perdagangan bebas',
      'Fondo negro, letras blancas: vehículo temporal / de prueba (antes particular)'
  ]

  async function handler(m, { text, reply, example }) {
      const input = String(text || '').trim().toUpperCase()
      if (!input) return example('BK 1234 ABC')

      const letters = (input.match(/^[A-Z]{1,2}/) || [''])[0]
      if (!letters) return reply('Matrícula no válida. Empieza con 1 o 2 letras del código de región, por ejemplo: BK 1234 ABC')

      const hit = SPECIAL[letters] ? { code: letters, info: SPECIAL[letters] }
          : PLAT[letters] ? { code: letters, info: PLAT[letters] }
          : null

      if (!hit) {
          return reply(`El código de región *${letters}* no está en los datos.\n\nRevisa las letras. Ejemplo de matrícula: B 1234 XYZ, DK 5678 AB`)
      }

      const rest = input.slice(hit.code.length).trim()
      const suffix = (rest.match(/[A-Z]{1,3}$/) || [''])[0]

      return reply(
          `🚘 *CONSULTA DE MATRÍCULA*\n\n` +
          `Matrícula : ${input}\n` +
          `Código    : *${hit.code}*\n` +
          `Región    : ${hit.info}` +
          (suffix && !SPECIAL[hit.code] ? `\nLetras finales: ${suffix} (código de serie, no determinan la región exacta)` : '') +
          `\n\n*Colores de matrícula*\n${WARNA.map(w => `- ${w}`).join('\n')}` +
          `\n\n_El código de región indica dónde se registró el vehículo, no dónde está su dueño ahora._`
      )
  }

export { pluginConfig as config, handler }
