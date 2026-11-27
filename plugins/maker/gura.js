/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import FormData from "form-data";
import fetch from "node-fetch";
import mime from "mime-types";
import { downloadMediaMessage, getContentType } from '@rexxhayanasi/elaina-baileys';

const te = MikuRuntime.te;

  const pluginConfig = {
    name: "gura",
    alias: ["guracanvas"],
    category: "maker",
    description: "Bikin efek canvas gura dari fotomu",
    usage: ".gura (reply/kirim foto)",
    example: ".gura",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true,
  };

  async function uploadToCatbox(buffer, filename = "file.jpg") {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
      filename,
      contentType: mime.lookup(filename) || "image/jpeg",
    });

    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
      timeout: 30000,
    });

    if (!res.ok) throw new Error("Error de Catbox");
    const url = await res.text();
    if (!url.startsWith("http")) throw new Error("Invalid response");
    return url;
  }

  async function handler(m, { sock }) {
    let media = null;

    if (m.quoted?.message) {
      const type = getContentType(m.quoted.message);
      if (!type || type !== "imageMessage") {
        return m.reply("⚠️ ¡Responde al mensaje de la imagen!");
      }
      media = await downloadMediaMessage(m.quoted, "buffer", {});
    } else if (m.message) {
      const type = getContentType(m.message);
      if (!type || type !== "imageMessage") {
        return m.reply(`🦈 *GURA CANVAS*\n\nEnvía o responde a una foto con el comando \`${m.prefix}gura\` para aplicar el efecto Gura!`);
      }
      media = await downloadMediaMessage(m, "buffer", {});
    }

    if (!media) return m.reply("❌ No se pudo leer el multimedia, ¡inténtalo de nuevo!");

    await m.react("🕕");

    try {
      const imgUrl = await uploadToCatbox(media);

      const apiUrl = `https://api.nexray.eu.cc/canvas/gura?url=${encodeURIComponent(imgUrl)}`;
      const res = await fetch(apiUrl);

      if (!res.ok) throw new Error("API Nexray error");

      const buffer = Buffer.from(await res.arrayBuffer());

      await sock.sendMessage(m.chat, { image: buffer, caption: "🦈 *RAWWRR! Gura is here!*" }, { quoted: m });
      await m.react("✅");

    } catch (err) { await m.react("☢");
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

export { pluginConfig as config, handler }
