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
    name: "samsat",
    alias: ["infoplat", "platsamsat"],
    category: "tools",
    description: "samsat <matrícula>",
    usage: ".samsat <matrícula>",
    example: ".samsat <matrícula>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const PROJECT_ID = 'informasisamsat'
  const FIRESTORE_REST_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`
  const TIMEOUT = 30_000

  const DEFAULT_HEADERS = {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
  }

  const same = (letters, info) => Object.fromEntries([...letters].map((l) => [l, info]))

  const SUMEDANG = { daerah: 'Kab. Sumedang', samsat: 'Samsat Sumedang', alamat: 'Jl. Prabu Gajah Agung No. 19, Kab. Sumedang' }
  const GARUT = { daerah: 'Kab. Garut', samsat: 'Samsat Garut', alamat: 'Jl. Suherman No. 64, Tarogong Kidul, Kab. Garut' }
  const KOTA_TASIK = { daerah: 'Ciudad de Tasikmalaya', samsat: 'Ciudad de Tasikmalaya Samsat', alamat: 'jl. Ir. H. Juanda (Desvío) Ciudad de Tasikmalaya' }
  const KAB_TASIK = { daerah: 'Kab. Tasikmalaya', samsat: 'Samsat Kabupaten Tasikmalaya', alamat: 'Jl. Raya Singaparna, Cintaraja, Kab. Tasikmalaya' }
  const CIAMIS = { daerah: 'Kab. Ciamis', samsat: 'Samsat Ciamis', alamat: 'Jl. Jenderal Sudirman No. 201, Kab. Ciamis' }
  const BANJAR = { daerah: 'Ciudad de Banjar', samsat: 'Ciudad de Banjar Samsat', alamat: 'jl. General de brigada M. Isa SH, Purwaharja, ciudad de Banjar' }

  const SAMSAT_DATABASE = {
      A: {
          provinsi: 'Provinsi Banten',
          default: { daerah: 'Ciudad / distrito de Serang. Ataque', samsat: 'Ciudad de Serang Samsat', alamat: 'jl. General Sudirman No. 1, ciudad de Serang' },
          sub: {
              A: { daerah: 'Ciudad de Serang', samsat: 'Ciudad de Serang Samsat', alamat: 'jl. General Sudirman No. 1, ciudad de Serang' },
              E: { daerah: 'Kab. Serang', samsat: 'Samsat Cikande', alamat: 'Jl. Raya Serang - Jakarta KM 27, Cikande' },
              J: { daerah: 'Kab. Pandeglang', samsat: 'Samsat Pandeglang', alamat: 'Jl. Raya Labuan KM 2, Kab. Pandeglang' },
              N: { daerah: 'Kab. Lebak', samsat: 'Samsat Rangkasbitung', alamat: 'Jl. Jenderal Sudirman KM 3, Rangkasbitung' },
              O: { daerah: 'Ciudad de Cilegón', samsat: 'Ciudad de Cilegón Samsat', alamat: 'jl. Raya Merak, Ciudad de Cilegon' },
              V: { daerah: 'Ciudad / distrito de Tangerang. Tangerang', samsat: 'Samsat Balaraja / Cikokol', alamat: 'jl. Pioneros de la Independencia, ciudad de Tangerang' }
          }
      },
      AA: {
          provinsi: 'Provinsi Jawa Tengah',
          default: { daerah: 'Magelang / Ciudad de Kedu', samsat: 'Ciudad de Magelang Samsat', alamat: 'jl. General Sudirman No. 45, ciudad de Magelang' },
          sub: {
              A: { daerah: 'Ciudad de Magelang', samsat: 'Ciudad de Magelang Samsat', alamat: 'jl. General Sudirman No. 45, ciudad de Magelang' },
              B: { daerah: 'Kab. Magelang', samsat: 'Samsat Mungkid', alamat: 'Jl. Mayor Kusen, Mungkid, Kab. Magelang' },
              C: { daerah: 'Kab. Purworejo', samsat: 'Samsat Purworejo', alamat: 'Jl. Mayjen Sutoyo No. 27, Purworejo' },
              D: { daerah: 'Kab. Kebumen', samsat: 'Samsat Kebumen', alamat: 'Jl. Tentara Pelajar No. 39, Kebumen' },
              E: { daerah: 'Kab. Temanggung', samsat: 'Samsat Temanggung', alamat: 'Jl. S. Kadar Maron, Temanggung' },
              F: { daerah: 'Kab. Wonosobo', samsat: 'Samsat Wonosobo', alamat: 'Jl. Mayjen Bambang Sugeng KM 3, Wonosobo' }
          }
      },
      AB: {
          provinsi: 'Provinsi DI Yogyakarta',
          default: { daerah: 'Ciudad de Yogyakarta', samsat: 'Samsat de la ciudad de Yogyakarta', alamat: 'jl. Ejército Estudiantil No. 15, ciudad de Yogyakarta' },
          sub: {
              A: { daerah: 'Ciudad de Yogyakarta', samsat: 'Samsat de la ciudad de Yogyakarta', alamat: 'jl. Ejército Estudiantil No. 15, ciudad de Yogyakarta' },
              B: { daerah: 'Kab. Bantul', samsat: 'Samsat Bantul', alamat: 'Jl. Urip Sumoharjo No. 8, Bantul' },
              C: { daerah: 'Kab. Kulon Progo', samsat: 'Samsat Kulon Progo', alamat: 'Jl. KH. Ahmad Dahlan, Wates' },
              D: { daerah: 'Kab. Gunungkidul', samsat: 'Samsat Gunungkidul', alamat: 'Jl. Brigjen Katamso No. 10, Wonosari' },
              E: { daerah: 'Kab. Sleman', samsat: 'Samsat Sleman', alamat: 'Jl. Magelang KM 12.5, Sleman' }
          }
      },
      AD: { provinsi: 'Provinsi Jawa Tengah', default: { daerah: 'Ciudad de Surakarta (Solo)', samsat: 'Ciudad de Surakarta Samsat', alamat: 'jl. Profesor DR. Soeharso No. 17, ciudad de Surakarta' } },
      AE: { provinsi: 'Provinsi Jawa Timur', default: { daerah: 'Ciudad de Madiun', samsat: 'Ciudad de Madiun Samsat', alamat: 'jl. Héroe No. 40, Ciudad Madiun' } },
      AG: { provinsi: 'Provinsi Jawa Timur', default: { daerah: 'Ciudad de Kediri', samsat: 'Ciudad de Kediri Samsat', alamat: 'jl. Supersemar No. 82, ciudad de Kediri' } },
      B: {
          provinsi: 'Provinsi DKI Jakarta / Jabar / Banten',
          default: { daerah: 'DKI Jakarta (Jadetabek)', samsat: 'Samsat Polda Metro Jaya', alamat: 'Jl. Jenderal Sudirman Kav. 55, Jakarta Selatan' },
          sub: {
              B: { daerah: 'Jakarta Barat', samsat: 'Samsat Jakarta Barat', alamat: 'Jl. Daan Mogot KM 13, Cengkareng, Jakarta Barat' },
              P: { daerah: 'Jakarta Pusat', samsat: 'Samsat Jakarta Pusat', alamat: 'Jl. Gunung Sahari No. 13, Jakarta Pusat' },
              S: { daerah: 'Jakarta Selatan', samsat: 'Samsat Jakarta Selatan', alamat: 'Jl. Jenderal Sudirman Kav. 55, Jakarta Selatan' },
              T: { daerah: 'Jakarta Timur', samsat: 'Samsat Jakarta Timur', alamat: 'Jl. D.I. Panjaitan Kav. 55, Jakarta Timur' },
              U: { daerah: 'Jakarta Utara', samsat: 'Samsat Jakarta Utara', alamat: 'Jl. Gunung Sahari No. 13, Pademangan, Jakarta Utara' },
              E: { daerah: 'Ciudad de Depok', samsat: 'Samsat Depok', alamat: 'jl. Merdeka No. 2, Sukmajaya, ciudad de Depok' },
              K: { daerah: 'Ciudad de Bekasi', samsat: 'Ciudad de Bekasi Samsat', alamat: 'jl. Ir. H. Juanda No. 302, ciudad de Bekasi' },
              F: { daerah: 'Kab. Bekasi', samsat: 'Samsat Kab. Bekasi (Cikarang)', alamat: 'Jl. Industri Pasir Gombong, Cikarang Utara' },
              C: { daerah: 'ciudad de tangerang', samsat: 'Samsat Cikokol Tangerang', alamat: 'jl. Pioneros de la Independencia II, ciudad de Tangerang' },
              W: { daerah: 'Ciudad de Tangerang del Sur', samsat: 'Samsat Ciputat / BSD', alamat: 'Jl. R.E. Martadinata, Ciputat, Tangerang Selatan' }
          }
      },
      BA: { provinsi: 'Provinsi Sumatera Barat', default: { daerah: 'ciudad de padang', samsat: 'Ciudad de Padang Samsat', alamat: 'jl. Khatib Sulaiman No. 43, ciudad de Padang' } },
      BB: { provinsi: 'Provinsi Sumatera Utara', default: { daerah: 'Tapanuli / Ciudad de Sibolga', samsat: 'Samsat Sibolga', alamat: 'jl. Dr. FL Tobing, ciudad de Sibolga' } },
      BD: { provinsi: 'Provinsi Bengkulu', default: { daerah: 'Ciudad de Bengkulu', samsat: 'Samsat de la ciudad de Bengkulu', alamat: 'jl. Capitán P. Tendean, ciudad de Bengkulu' } },
      BE: { provinsi: 'Provinsi Lampung', default: { daerah: 'Ciudad de Bandar Lampung', samsat: 'Samsat Rajabasa Bandar Lampung', alamat: 'Jl. Pramuka No. 88, Rajabasa, Bandar Lampung' } },
      BG: { provinsi: 'Provinsi Sumatera Selatan', default: { daerah: 'ciudad de palembang', samsat: 'Ciudad de Palembang Samsat', alamat: 'jl. Capitán A. Rivai, ciudad de Palembang' } },
      BH: { provinsi: 'Provinsi Jambi', default: { daerah: 'Ciudad de Jambi', samsat: 'Ciudad de Jambi Samsat', alamat: 'jl. General Basuki Rahmat, ciudad de Jambi' } },
      BK: { provinsi: 'Provinsi Sumatera Utara', default: { daerah: 'ciudad de medan', samsat: 'Samsat Medan Utara / Selatan', alamat: 'jl. Princesa Verde No. 14, Ciudad de Medan' } },
      BL: { provinsi: 'Provinsi Aceh', default: { daerah: 'Ciudad de Banda Aceh', samsat: 'Banda Aceh Ciudad Samsat', alamat: 'jl. T. Nyak Arief, ciudad de Banda Aceh' } },
      BM: { provinsi: 'Provinsi Riau', default: { daerah: 'Ciudad de Pekanbaru', samsat: 'Ciudad de Pekanbaru Samsat', alamat: 'jl. Gajah Mada No. 200, ciudad de Pekanbaru' } },
      BN: { provinsi: 'Provinsi Kepulauan Bangka Belitung', default: { daerah: 'Ciudad de Pangkal Pinang', samsat: 'Samsat Pangkalpinang', alamat: 'Jl. Pulau Bangka, Komplek Perkantoran Gubernur, Pangkalpinang' } },
      BP: { provinsi: 'Provinsi Kepulauan Riau', default: { daerah: 'Batam/Ciudad de Tanjungpinang', samsat: 'Samsat Batam Centre', alamat: 'jl. Engku Putri, centro de Batam, ciudad de Batam' } },
      D: {
          provinsi: 'Provinsi Jawa Barat',
          default: { daerah: 'Bandung', samsat: 'Ciudad de Bandung Samsat (Soekarno-Hatta)', alamat: 'jl. Soekarno-Hatta No. 528, ciudad de Bandung' },
          sub: {
              A: { daerah: 'Bandung', samsat: 'Ciudad de Bandung Samsat', alamat: 'jl. Soekarno-Hatta No. 528, ciudad de Bandung' },
              S: { daerah: 'Ciudad de Cimahi', samsat: 'Ciudad de Cimahi Samsat', alamat: 'jl. General H. Amir Machmud, ciudad de Cimahi' },
              U: { daerah: 'Kab. Bandung Barat', samsat: 'Samsat Padalarang', alamat: 'Jl. Raya Padalarang, Kab. Bandung Barat' },
              V: { daerah: 'Kab. Bandung', samsat: 'Samsat Soreang / Rancaekek', alamat: 'Jl. Raya Gading Tutuka, Soreang, Kab. Bandung' }
          }
      },
      DA: { provinsi: 'Provinsi Kalimantan Selatan', default: { daerah: 'Ciudad de Banjarmasin', samsat: 'Samsat Banjarmasin', alamat: 'Jl. Jenderal Ahmad Yani KM 6, Banjarmasin' } },
      DB: { provinsi: 'Provinsi Sulawesi Utara', default: { daerah: 'ciudad de manado', samsat: 'Samsat de la ciudad de Manado', alamat: 'jl. 17 agosto, ciudad de Manado' } },
      DC: { provinsi: 'Provinsi Sulawesi Barat', default: { daerah: 'Kab. Mamuju', samsat: 'Samsat Mamuju', alamat: 'Jl. Jenderal Sudirman, Mamuju' } },
      DD: { provinsi: 'Provinsi Sulawesi Selatan', default: { daerah: 'Ciudad de Macasar', samsat: 'Samsat de la ciudad de Makassar', alamat: 'jl. Andi Mappanyuki No. 79, ciudad de Makassar' } },
      DE: { provinsi: 'Provinsi Maluku', default: { daerah: 'ciudad de ambón', samsat: 'Samsat de la ciudad de Ambon', alamat: 'jl. Rijali, ciudad de Ambón' } },
      DG: { provinsi: 'Provinsi Maluku Utara', default: { daerah: 'ciudad de ternate', samsat: 'Ciudad de Ternate Samsat', alamat: 'jl. Sultán M. Djabir Sjah, ciudad de Ternate' } },
      DH: { provinsi: 'Provinsi Nusa Tenggara Timur', default: { daerah: 'ciudad de kupang', samsat: 'Ciudad de Kupang Samsat', alamat: 'jl. Policía Militar No. 9, ciudad de Kupang' } },
      DK: { provinsi: 'Provinsi Bali', default: { daerah: 'Ciudad de Denpasar', samsat: 'Ciudad de Denpasar Samsat', alamat: 'jl. Cok Agung Tresna, Renon, Denpasar' } },
      DL: { provinsi: 'Provinsi Sulawesi Utara', default: { daerah: 'Kepulauan Sangihe / Talaud', samsat: 'Samsat Tahuna', alamat: 'Jl. Tatehe, Tahuna, Kep. Sangihe' } },
      DM: { provinsi: 'Provinsi Gorontalo', default: { daerah: 'Ciudad de Goróntalo', samsat: 'Ciudad de Gorontalo Samsat', alamat: 'jl. General Sudirman, ciudad de Gorontalo' } },
      DN: { provinsi: 'Provinsi Sulawesi Tengah', default: { daerah: 'ciudad de palú', samsat: 'Samsat de la ciudad de Palu', alamat: 'jl. RA. Kartini No. 102, ciudad de Palu' } },
      DP: { provinsi: 'Provinsi Sulawesi Selatan', default: { daerah: 'Parepare / Luwu / Ciudad Palopó', samsat: 'Ciudad de Parepare Samsat', alamat: 'jl. General Sudirman, ciudad de Parepare' } },
      DR: { provinsi: 'Provinsi Nusa Tenggara Barat', default: { daerah: 'Ciudad de Mataram (isla de Lombok)', samsat: 'Ciudad de Mataram Samsat', alamat: 'jl. Sello nº 32, ciudad de Mataram' } },
      DT: { provinsi: 'Provinsi Sulawesi Tenggara', default: { daerah: 'Ciudad de Kendari', samsat: 'Ciudad de Kendari Samsat', alamat: 'jl. Haluoleo, ciudad de Kendari' } },
      DW: { provinsi: 'Provinsi Sulawesi Selatan', default: { daerah: 'Kab. Bone / Wajo / Soppeng', samsat: 'Samsat Watampone', alamat: 'Jl. Jenderal Ahmad Yani, Watampone' } },
      E: {
          provinsi: 'Provinsi Jawa Barat',
          default: { daerah: 'Ciudad de Cirebón', samsat: 'Samsat de la ciudad de Cirebon', alamat: 'jl. Joven No. 44, Ciudad de Cirebon' },
          sub: {
              A: { daerah: 'Ciudad de Cirebón', samsat: 'Samsat de la ciudad de Cirebon', alamat: 'jl. Joven No. 44, Ciudad de Cirebon' },
              H: { daerah: 'Kab. Cirebon', samsat: 'Samsat Sumber', alamat: 'Jl. Sunan Drajat No. 17, Sumber, Kab. Cirebon' },
              P: { daerah: 'Kab. Indramayu', samsat: 'Samsat Indramayu', alamat: 'Jl. Gatot Subroto, Kab. Indramayu' },
              U: { daerah: 'Kab. Majalengka', samsat: 'Samsat Majalengka', alamat: 'Jl. KH. Abdul Halim, Kab. Majalengka' },
              Y: { daerah: 'Kab. Kuningan', samsat: 'Samsat Kuningan', alamat: 'Jl. RE. Martadinata, Kab. Kuningan' }
          }
      },
      EA: { provinsi: 'Provinsi Nusa Tenggara Barat', default: { daerah: 'Isla Sumbawa / Ciudad de Bima', samsat: 'Sumbawa Besar Samsat', alamat: 'jl. Garuda No. 105, Sumbawa Besar' } },
      EB: { provinsi: 'Provinsi Nusa Tenggara Timur', default: { daerah: 'Pulau Flores / Ende / Maumere', samsat: 'Samsat Ende', alamat: 'Jl. Eltari, Ende' } },
      ED: { provinsi: 'Provinsi Nusa Tenggara Timur', default: { daerah: 'Pulau Sumba / Waingapu', samsat: 'Samsat Sumba Timur', alamat: 'Jl. Jenderal Soeharto, Waingapu' } },
      F: {
          provinsi: 'Provinsi Jawa Barat',
          default: { daerah: 'ciudad de bogor', samsat: 'Samsat de la ciudad de Bogor', alamat: 'jl. Ir. H. Juanda No. 4, ciudad de Bogor' },
          sub: {
              A: { daerah: 'ciudad de bogor', samsat: 'Samsat de la ciudad de Bogor', alamat: 'jl. Ir. H. Juanda No. 4, ciudad de Bogor' },
              F: { daerah: 'Kab. Bogor', samsat: 'Samsat Cibinong', alamat: 'Jl. Raya Jakarta - Bogor KM 50, Cibinong' },
              Q: { daerah: 'ciudad de sukabumi', samsat: 'Ciudad de Sukabumi Samsat', alamat: 'jl. General Sudirman, ciudad de Sukabumi' },
              U: { daerah: 'Kab. Sukabumi', samsat: 'Samsat Cibadak / Pelabuhan Ratu', alamat: 'Jl. Raya Karangtengah, Cibadak, Kab. Sukabumi' },
              W: { daerah: 'Kab. Cianjur', samsat: 'Samsat Cianjur', alamat: 'Jl. Dr. Muwardi (By Pass), Kab. Cianjur' }
          }
      },
      G: { provinsi: 'Provinsi Jawa Tengah', default: { daerah: 'Ciudad de Pekalongan', samsat: 'Samsat de la ciudad de Pekalongan', alamat: 'jl. West Gajah Mada No. 11A, ciudad de Pekalongan' } },
      H: { provinsi: 'Provinsi Jawa Tengah', default: { daerah: 'ciudad de semarang', samsat: 'Ciudad de Semarang Samsat', alamat: 'jl. General de Brigada Sudiarto No. 500, ciudad de Semarang' } },
      K: { provinsi: 'Provinsi Jawa Tengah', default: { daerah: 'Kab. Pati / Kudus / Jepara', samsat: 'Samsat Pati', alamat: 'Jl. P. Sudirman No. 65, Pati' } },
      KB: { provinsi: 'Provinsi Kalimantan Barat', default: { daerah: 'Ciudad de Pontianak', samsat: 'Ciudad de Pontianak Samsat', alamat: 'jl. Adisucipto KM 5.5, ciudad de Pontianak' } },
      KH: { provinsi: 'Provinsi Kalimantan Tengah', default: { daerah: 'Ciudad de Palangka Raya', samsat: 'Samsat Palangka Raya', alamat: 'Jl. Tjilik Riwut KM 4.5, Palangka Raya' } },
      KT: { provinsi: 'Provinsi Kalimantan Timur', default: { daerah: 'Ciudad de Samarinda / Balikpapan', samsat: 'Ciudad de Samarinda Samsat', alamat: 'jl. M. Yamin, ciudad de Samarinda' } },
      KU: { provinsi: 'Provinsi Kalimantan Utara', default: { daerah: 'Ciudad de Tarakan / Tanjung Selor', samsat: 'Samsat Tarakan', alamat: 'jl. Mulawarman, ciudad de Tarakan' } },
      L: { provinsi: 'Provinsi Jawa Timur', default: { daerah: 'ciudad de surabaya', samsat: 'Samsat Surabaya Manyar', alamat: 'jl. Manyar Kertoarjo No. 1, ciudad de Surabaya' } },
      M: { provinsi: 'Provinsi Jawa Timur', default: { daerah: 'Pulau Madura', samsat: 'Samsat Pamekasan', alamat: 'Jl. Raya Pamekasan - Sumenep, Pamekasan' } },
      N: { provinsi: 'Provinsi Jawa Timur', default: { daerah: 'Ciudad de Malang', samsat: 'Ciudad de Malang Samsat', alamat: 'jl. S. Supriadi No. 80, ciudad de Malang' } },
      P: { provinsi: 'Provinsi Jawa Timur', default: { daerah: 'Kab. Jember / Banyuwangi', samsat: 'Samsat Jember', alamat: 'Jl. Gajah Mada No. 244, Jember' } },
      PA: { provinsi: 'Provinsi Papua', default: { daerah: 'Ciudad de Jayapura', samsat: 'Ciudad de Jayapura Samsat', alamat: 'jl. Raya Abepura, ciudad de Jayapura' } },
      PB: { provinsi: 'Provinsi Papua Barat', default: { daerah: 'Kab. Manokwari', samsat: 'Samsat Manokwari', alamat: 'Jl. Drs. Esau Sesa, Manokwari' } },
      PG: { provinsi: 'Provinsi Papua Pegunungan', default: { daerah: 'Kab. Jayawijaya (Wamena)', samsat: 'Samsat Wamena', alamat: 'Jl. Yos Sudarso, Wamena' } },
      PS: { provinsi: 'Provinsi Papua Selatan', default: { daerah: 'Kab. Merauke', samsat: 'Samsat Merauke', alamat: 'Jl. Raya Mandala, Merauke' } },
      PT: { provinsi: 'Provinsi Papua Tengah', default: { daerah: 'Kab. Nabire / Mimika', samsat: 'Samsat Nabire', alamat: 'Jl. Pepera, Nabire' } },
      PY: { provinsi: 'Provinsi Papua Barat Daya', default: { daerah: 'Ciudad de Sorong', samsat: 'Ciudad de Sorong Samsat', alamat: 'jl. General Sudirman, ciudad de Sorong' } },
      R: { provinsi: 'Provinsi Jawa Tengah', default: { daerah: 'Kab. Banyumas (Purwokerto)', samsat: 'Samsat Purwokerto', alamat: 'Jl. Gerilya Timur, Purwokerto' } },
      S: { provinsi: 'Provinsi Jawa Timur', default: { daerah: 'Kab. Bojonegoro / Mojokerto / Tuban', samsat: 'Samsat Bojonegoro', alamat: 'Jl. Teuku Umar No. 1, Bojonegoro' } },
      T: { provinsi: 'Provinsi Jawa Barat', default: { daerah: 'Kab. Karawang / Purwakarta / Subang', samsat: 'Samsat Karawang', alamat: 'Jl. Jenderal Ahmad Yani (By Pass), Karawang' } },
      W: { provinsi: 'Provinsi Jawa Timur', default: { daerah: 'Kab. Sidoarjo / Gresik', samsat: 'Samsat Sidoarjo', alamat: 'Jl. Cemengkalang No. 12, Sidoarjo' } },
      Z: {
          provinsi: 'Provinsi Jawa Barat',
          default: { ...KOTA_TASIK },
          sub: {
              ...same('ABC', SUMEDANG),
              ...same('DEFG', GARUT),
              ...same('HIJK', KOTA_TASIK),
              ...same('LMNP', KAB_TASIK),
              ...same('TUV', CIAMIS),
              ...same('WX', BANJAR),
              Y: { daerah: 'Kab. Pangandaran', samsat: 'Samsat Pangandaran', alamat: 'Jl. Raya Parigi - Cigugur, Kab. Pangandaran' }
          }
      }
  }

  function parsePlateInput(depanOrFull, angka = '', belakang = '') {
      if (!angka && !belakang) {
          const clean = String(depanOrFull).trim().toUpperCase().replace(/\s+/g, ' ')
          const match = clean.match(/^([A-Z]{1,2})\s*(\d{1,4})?\s*([A-Z]{1,3})?$/)
          if (match) {
              return {
                  depan: match[1],
                  angka: match[2] || '',
                  belakang: match[3] || ''
              }
          }
      }

      return {
          depan: String(depanOrFull).trim().toUpperCase(),
          angka: String(angka || '').trim(),
          belakang: String(belakang || '').trim().toUpperCase()
      }
  }

  async function getPlatInfo(depanOrFull, angka = '', belakang = '') {
      const { depan, angka: noAngka, belakang: seriBelakang } = parsePlateInput(depanOrFull, angka, belakang)

      if (!SAMSAT_DATABASE[depan]) {
          throw new Error(`¡El código inicial "${depan}" ¡No está en la base de datos de zonas!`)
    }

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), TIMEOUT)
      let firestoreData = null

      try {
          const targetUrl = `${FIRESTORE_REST_URL}/lámina_${depan.toLowerCase()}_${noAngka}`
        const res = await fetch(targetUrl, {
              method: 'GET',
              headers: DEFAULT_HEADERS,
              signal: controller.signal
          })

          if (res.ok) {
              const json = await res.json()
              firestoreData = json.fields || null
          }
      } catch (_) {
      } finally {
          clearTimeout(timer)
      }

      const regionInfo = SAMSAT_DATABASE[depan]
      let detailInfo = regionInfo.default

      if (regionInfo.sub && seriBelakang) {
          const firstChar = seriBelakang.charAt(0)
          if (regionInfo.sub[firstChar]) {
              detailInfo = regionInfo.sub[firstChar]
          }
      }

      return {
          status: true,
          plat_nomor: `${depan} ${noAngka} ${seriBelakang}`.trim(),
          provinsi: regionInfo.provinsi,
          daerah: detailInfo.daerah,
          samsat: detailInfo.samsat,
          alamat: detailInfo.alamat,
          firestore_data: firestoreData
      }
  }

  function flattenFirestore(fields) {
      if (!fields || typeof fields !== 'object') return []
      const unwrap = (v) => {
          if (v == null || typeof v !== 'object') return v
          if ('stringValue' in v) return v.stringValue
          if ('integerValue' in v) return v.integerValue
          if ('doubleValue' in v) return v.doubleValue
          if ('booleanValue' in v) return v.booleanValue ? 'Ya' : 'Tidak'
          if ('timestampValue' in v) return v.timestampValue
          if ('nullValue' in v) return '-'
          if (v.arrayValue) return (v.arrayValue.values || []).map(unwrap).join(', ')
          if (v.mapValue) return Object.entries(v.mapValue.fields || {}).map(([k, x]) => `${k}: ${unwrap(x)}`).join(', ')
          return JSON.stringify(v)
      }
      return Object.entries(fields).map(([k, v]) => `• ${k}: ${unwrap(v)}`)
  }

  async function handler(m, { text, prefix, command, reply }) {
      const input = String(text || m.quoted?.text || '').trim()
      if (!input) return reply(`*Ejemplo:*\n${prefix || '.'}${command} B 1234 XYZ\n${prefix || '.'}${command} D 5678 AB`)

      try {
          await m.react?.('⏳')
          const r = await getPlatInfo(input)
          await m.react?.('✅')

          const extra = flattenFirestore(r.firestore_data)
          return reply(
              `🚘 *INFO DE MATRÍCULA Y SAMSAT*\n\n` +
              `• Matrícula: ${r.plat_nomor}\n` +
              `• Provincia : ${r.provinsi}\n` +
              `• Zona      : ${r.daerah}\n` +
              `• Samsat    : ${r.samsat}\n` +
              `• Dirección : ${r.alamat}` +
              (extra.length ? `\n\n*Datos adicionales*\n${extra.join('\n')}` : '') +
              `\n\n_La zona se deduce del código de la matrícula, no de dónde está el dueño ahora._`
          )
      } catch (e) {
          console.error('[SAMSAT]', e)
          await m.react?.('❌')
          return reply(`❌ ${e?.message || e}`)
      }
  }

export { pluginConfig as config, handler }
