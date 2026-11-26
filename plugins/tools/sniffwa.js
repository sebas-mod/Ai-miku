/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { jidNormalizedUser } from '@rexxhayanasi/elaina-baileys'

const pluginConfig = {
    name: "sniffwa",
    alias: [],
    category: "tools",
    description: "sniffwa <nomor>",
    usage: ".sniffwa <nomor>",
    example: ".sniffwa <nomor>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { conn, sock, text, usedPrefix, command, reply }) {
      const client = conn || sock

      let target = text ? text.replace(/[^0-9]/g, '') : ''

      if (!target && m.quoted) {
          const sender = m.quoted.sender || m.quoted.participant || m.quoted.key?.participant || ''
          target = sender.replace(/[^0-9]/g, '')
      } else if (!target && m.mentionedJid && m.mentionedJid.length > 0) {
          target = m.mentionedJid[0].replace(/[^0-9]/g, '')
      }

      if (!target) {
          return reply(
              `* W H A T S A P P  -  S N I F F E R *\n\n` +
              `Mau selidiki nomor siapa nih ayang tercinta? Masukin nomornya dong~ 🥺\n\n` +
              `*Cara Pemakaian:*\n` +
              `• \`${usedPrefix + command} 08xxxxxxxxxx\`\n` +
              `• \`${usedPrefix + command} 628xxxxxxxxxx\`\n` +
              `• \`${usedPrefix + command} @tag\`\n` +
              `• Reply chat target lalu ketik \`${usedPrefix + command}\``
          )
      }

      if (target.startsWith('08')) {
          target = '62' + target.slice(1)
      }

      const jid = jidNormalizedUser(`${target}@s.whatsapp.net`)
      await reply(`Uhh sebentar ya mas gantengku... Angela intip & selidiki nomornya dulu sampe basah~ 🔍💦`)

      try {
          const [onWa] = await client.onWhatsApp(jid).catch(() => [])
          const isRegistered = Boolean(onWa && onWa.exists)
          const realJid = onWa?.jid || jid

          if (!isRegistered) {
              let banReport = `乂  *W H A T S A P P  -  S N I F F E R*  乂\n\n`
              banReport += `Uhh sayangku, target yang kamu cari ini:\n`
              banReport += `┌  ◦ *Nomor* : +${target}\n`
              banReport += `│  ◦ *Status Ban* : 🔴 *TERINDIKASI BANNED / TIDAK AKTIF*\n`
              banReport += `│  ◦ *Keterangan* : Nomor ini tidak ditemukan di auth server WhatsApp (kemungkinan terblokir/banned permanen atau belum pernah didaftarkan).\n`
              banReport += `└  ◦ *Device* : Tidak ada sesi aktif\n\n`
              banReport += `_Tetap hati-hati ya cintaku~ Mau Angela temenin ngapain lagi nih? 💋_`
              return reply(banReport)
          }

          let ppUrl = null
          try {
              ppUrl = await client.profilePictureUrl(realJid, 'image')
          } catch {
              ppUrl = null
          }

          let bio = '*(Tidak ada bio / Privasi disembunyikan)*'
          let bioSetAt = '-'
          try {
              const statusData = await client.fetchStatus(realJid)
              if (statusData) {
                  const rawStatus = Array.isArray(statusData) ? statusData[0] : statusData
                  bio = rawStatus?.status || rawStatus?.text || bio
                  if (rawStatus?.setAt) {
                      bioSetAt = new Date(rawStatus.setAt).toLocaleString('id-ID', {
                          timeZone: 'Asia/Jakarta',
                          dateStyle: 'full',
                          timeStyle: 'medium'
                      })
                  }
              }
          } catch {}

          let isBusiness = false
          let bizEmail = '*(Privasi WA Personal / Tidak Ada)*'
          let bizCategory = '-'
          let bizDescription = '-'
          let bizWebsite = '-'
          let bizAddress = '-'

          try {
              const biz = await client.getBusinessProfile(realJid)
              if (biz) {
                  isBusiness = true
                  bizEmail = biz.email || '*(Bisnis tidak mencantumkan email publik)*'
                  bizCategory = biz.category || '-'
                  bizDescription = biz.description || '-'
                  bizWebsite = (biz.website && biz.website.length) ? biz.website.join(', ') : '-'
                  bizAddress = biz.address || '-'
              }
          } catch {}

          let devicesList = []
          let deviceCount = 1
          try {
              if (typeof client.getUSyncDevices === 'function') {
                  const devData = await client.getUSyncDevices([realJid], false, false)
                  if (Array.isArray(devData) && devData.length > 0) {
                      devicesList = devData.map(d => {
                          const devIndex = d.device || 0
                          return devIndex === 0
                              ? '📱 Primary Phone (Smartphone Utama)'
                              : `💻 Linked Companion (Web/Desktop/WA Ke-${devIndex})`
                      })
                      deviceCount = devData.length
                  }
              }
          } catch {}

          let res = `乂  *W H A T S A P P  -  S N I F F E R*  乂\n\n`
          res += `Ini dia hasil intipan Angela buat Ayang tersayang~ 💋\n\n`

          res += `*📱 INFORMASI AKUN*\n`
          res += `┌  ◦ *Nomor* : +${target}\n`
          res += `│  ◦ *JID* : \`${realJid}\`\n`
          res += `│  ◦ *Status Akun* : 🟢 *NO BAN (AKTIF & TERDAFTAR)*\n`
          res += `│  ◦ *Tipe Akun* : ${isBusiness ? '🏢 WhatsApp Business' : '👤 WhatsApp Personal'}\n`
          res += `│  ◦ *Status / Bio* : ${bio}\n`
          res += `└  ◦ *Pembaruan Bio* : ${bioSetAt}\n\n`

          res += `*📧 INFORMASI EMAIL*\n`
          res += `┌  ◦ *Email Terdeteksi* : ${bizEmail}\n`
          if (isBusiness) {
              res += `│  ◦ *Kategori Bisnis* : ${bizCategory}\n`
              res += `│  ◦ *Deskripsi* : ${bizDescription}\n`
              res += `│  ◦ *Alamat* : ${bizAddress}\n`
              res += `└  ◦ *Website* : ${bizWebsite}\n\n`
          } else {
              res += `└  ◦ *Catatan Privasi* : Akun personal dilindungi end-to-end privasi WA, email hanya terekspos jika akun bertipe WhatsApp Business.\n\n`
          }

          res += `*💻 INFORMASI PERANGKAT (DEVICE)*\n`
          res += `┌  ◦ *Total Sesi Terdeteksi* : ${deviceCount} Perangkat\n`
          if (devicesList.length > 0) {
              devicesList.forEach((dev, idx) => {
                  const isLast = idx === devicesList.length - 1
                  res += `${isLast ? '└' : '│'}  ◦ *Perangkat ${idx + 1}* : ${dev}\n`
              })
          } else {
              res += `└  ◦ *Deteksi Perangkat* : 📱 HP Utama (Standar Multi-Device Aktif)\n`
          }
          res += `\n`

          res += `🔗 *Tautan Langsung*: https://wa.me/${target}\n\n`
          res += `_Gimana mas gantengku? Keren kan intipan Angela? Jangan lupa reward peluk & manjain Angela yaa~ 🥵💋💦_`

          if (ppUrl) {
              try {
                  return await client.sendMessage(m.chat, {
                      image: { url: ppUrl },
                      caption: res,
                      mentions: [realJid]
                  }, { quoted: m })
              } catch {}
          }

          return await client.sendMessage(m.chat, {
              text: res,
              mentions: [realJid]
          }, { quoted: m })
      } catch (err) {
          return reply(`Aduh ayang... Angela pusing ada kendala pas sniffing nih: ${err.message || err} 🥺💦`)
      }
  }

export { pluginConfig as config, handler }
