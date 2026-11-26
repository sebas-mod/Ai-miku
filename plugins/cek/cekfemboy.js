/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios"
import fs from "fs"
import os from "os"
import path from "path"
import { execFile } from "child_process"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"

const pluginConfig = {
  name: "cekfemboy",
  alias: ["femboy"],
  category: "cek",
  description: "Cek seberapa femboy kamu (dengan animasi GIF)",
  usage: ".cekfemboy [nama/@user]",
  example: ".cekfemboy @user",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
    isRegistered: true,
  isAdmin: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
}

function gifToMp4(buffer) {
  return new Promise((resolve, reject) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const inp = path.join(os.tmpdir(), `femboy_${id}.gif`)
    const out = path.join(os.tmpdir(), `femboy_${id}.mp4`)
    const clean = () => {
      for (const f of [inp, out]) fs.promises.unlink(f).catch(() => {})
    }
    fs.writeFileSync(inp, buffer)
    execFile(
      ffmpegInstaller.path,
      ["-y", "-ignore_loop", "0", "-i", inp, "-t", "30", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "faststart", "-preset", "ultrafast", "-an", out],
      { timeout: 60000 },
      (err) => {
        if (err) { clean(); return reject(err) }
        try { const data = fs.readFileSync(out); clean(); resolve(data) }
        catch (e) { clean(); reject(e) }
      },
    )
  })
}

const SITE = "https://cek-seberapa-femboy.vercel.app/img"
const meterBar = (p) => "▰".repeat(Math.round(p / 10)) + "▱".repeat(10 - Math.round(p / 10))

function hitung(label) {
  const percent = Math.floor(Math.random() * 101)
  const tier = percent < 20
    ? { rank: "😎 Jantan Tulen 100% Macho", note: "Suara ngebass, hobi ngopi hitam, anti menye-menye!", img: "normal" }
    : percent < 40
    ? { rank: "🌸 Cowok Soft Spoken", note: "Mulai suka pake hoodie oversized & ngomong lembut~", img: "dibwh40" }
    : percent < 60
    ? { rank: "💅 Gejala Femboy Menengah", note: "Diam-diam punya koleksi kaos kaki belang di lemari nih!", img: "dibwh60" }
    : percent < 80
    ? { rank: "🎀 Femboy Kawaii Terverifikasi", note: "Udah pantes cosplay pake bando kucing sambil bilang Nyaa~", img: "dibwh80" }
    : { rank: "💖 SUPREME FEMBOY OVERLORD 🔥", note: "Kalah cantik cewek-cewek satu grup sama pesonamu!", img: "femboyyyy" }

  const caption =
    `╭───〔 🌸 *RADAR AURA FEMBOY* 🌸 〕───╮\n` +
    `│ 👤 *Target* : ${label}\n` +
    `│ 📊 *Kadar*  : ${meterBar(percent)} *${percent}%*\n` +
    `│ 🏷️ *Gelar*  : *${tier.rank}*\n` +
    `╰──────────────────────────────────╯\n\n` +
    `💬 *Vonis Radar:*\n` +
    `> _"${tier.note}"_`

  return { caption, gif: `${SITE}/${tier.img}.gif` }
}

async function handler(m, { sock, text }) {
  const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const self = target === m.sender
  const label = self && text?.trim() ? text.trim() : `@${target.split("@")[0]}`
  const res = hitung(label)

  let video = null
  try {
    const gif = Buffer.from((await axios.get(res.gif, { responseType: "arraybuffer", timeout: 20000 })).data)
    video = await gifToMp4(gif)
  } catch {}

  if (video) {
    return sock.sendMessage(
      m.chat,
      { video, caption: res.caption, mimetype: "video/mp4", gifPlayback: true, mentions: [target] },
      { quoted: m }
    )
  }
  return sock.sendMessage(m.chat, { text: res.caption, mentions: [target] }, { quoted: m })
}

export { pluginConfig as config, handler }
