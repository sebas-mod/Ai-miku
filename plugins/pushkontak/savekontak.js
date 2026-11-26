/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const getMeta = MikuRuntime.getMeta;
const memberJids = MikuRuntime.memberJids;
const sendVcf = MikuRuntime.sendVcf;

const pluginConfig = {
    name: "savekontak",
    alias: ["svkontak", "savecontact"],
    category: "pushkontak",
    description: "Fitur pushkontak savekontak",
    usage: ".savekontak",
    example: ".savekontak",
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, jid, text, reply, example }) {
      const nama = String(text || '').trim()
      if (!nama) return example('CustomerList  (nama dasar kontak, hasilnya "CustomerList - 1", "CustomerList - 2", ...)')

      const meta = await getMeta(sock, jid, true)
      const members = await memberJids(sock, meta)
      if (!members.length) return reply('❌ Tidak ada kontak yang bisa disimpan di grup ini.')

      await sendVcf(sock, m.sender, members, {
          fileName: `${nama}_${members.length}kontak`,
          nameOf: (_, i) => `${nama} - ${i + 1}`,
          caption: `*▢ KONTAK DISIMPAN*\n• Nama : ${nama}\n• Total : ${members.length} kontak\n• Grup : ${meta.subject || '-'}`
      })

      return reply(`*▢ SAVE KONTAK*\n• Total : ${members.length} kontak\n• Status : File VCF dikirim ke chat pribadi`)
  }

export { pluginConfig as config, handler }
