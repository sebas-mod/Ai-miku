/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { downloadMediaMessage, getContentType } from '@rexxhayanasi/elaina-baileys';
import axios from "axios";

const ImageUploadService = ElysiaRuntime.ImageUploadService;

  const pluginConfig = {
    name: "musiccard",
    alias: ["mcard", "spotifycard"],
    category: "maker",
    description: "Membuat kartu musik (music card) keren dari gambar yang dikirim.",
    usage: ".musiccard <judul>|<nama artis>",
    example: ".musiccard Rewrite The Stars|James Arthur",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true,
  };

  async function handler(m, { sock }) {
    const text = m.text?.trim();

    let mediaBuffer = null;
    let mimetype = null;

    if (m.quoted?.message) {
      const type = getContentType(m.quoted.message);
      if (type !== "imageMessage") {
        return m.reply("❌ *¡Vaya, eso no es una imagen!*\n\nDebes responder a un mensaje con una *imagen* con el formato `.musiccard <título>|<artista>`.\n\nEjemplo: \nResponde a la imagen de un amigo y escribe: `.musiccard Perfect|Ed Sheeran`");
      }
      try {
        mediaBuffer = await downloadMediaMessage(
          { key: m.quoted.key, message: m.quoted.message },
          "buffer",
          {}
        );
        mimetype = m.quoted.message[type]?.mimetype;
      } catch (e) { return m.reply("😔 *No se pudo descargar la imagen.* Vuelve a enviarla.");
      }
    } else if (m.message) {
      const type = getContentType(m.message);
      if (type !== "imageMessage") {
        return m.reply("❌ *¿Y la imagen?*\n\nDebes enviar una imagen con el texto `.musiccard <título>|<artista>` o responder a una imagen existente.\n\nEjemplo: \nEnvía una imagen con el texto: `.musiccard Perfect|Ed Sheeran`");
      }
      try {
        mediaBuffer = await downloadMediaMessage(
          { key: m.key, message: m.message },
          "buffer",
          {}
        );
        mimetype = m.message[type]?.mimetype;
      } catch (e) { return m.reply("😔 *No se pudo descargar la imagen.* Vuelve a enviarla.");
      }
    }

    if (!mediaBuffer) {
      return m.reply("❌ *¡No se detectó la imagen!* Asegúrate de enviarla correctamente.");
    }

    if (!text) {
      return m.reply("❌ *¡Faltan el título de la canción y el artista!*\n\nEl formato correcto es: `.musiccard <título>|<artista>`\nSepara el título y el artista con una barra vertical ( | ).");
    }

    let judul = text;
    let nama = "Artista desconocido";

    if (text.includes("|")) {
      const parts = text.split("|");
      judul = parts[0].trim();
      nama = parts[1].trim() || m.pushName;
    }

    await m.react("🕕");

    try {

      const service = new ImageUploadService("pixhost.to");
      const uploadResult = await service.uploadFromBinary(mediaBuffer, "img.jpg");

      if (!uploadResult || !uploadResult.directLink) {
        await m.react("❌");
        return m.reply("⚠️ *¡No se pudo subir la imagen!* Comprueba que no sea demasiado grande e inténtalo de nuevo.");
      }

      const apiUrl = `https://api.nexray.eu.cc/canvas/musiccard?judul=${encodeURIComponent(judul)}&nama=${encodeURIComponent(nama)}&image_url=${encodeURIComponent(uploadResult.directLink)}`;

      const res = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      if (res.headers["content-type"] && !res.headers["content-type"].includes("image")) {
        await m.react("❌");
        return m.reply("⚠️ *No se pudo crear la Music Card.* El servidor respondió con un formato incorrecto.");
      }

      const cardBuffer = Buffer.from(res.data);

      await sock.sendMessage(m.chat, {
        image: cardBuffer,
        caption: `✨ *¡MUSIC CARD CREADA!* ✨\n\n🎧 *Título*: ${judul}\n🎤 *Artista*: ${nama}\n\n¿A que quedó genial? ¡Presúmela con tus amigos! 🚀`
      }, { quoted: m });

      await m.react("✅");

    } catch (err) { console.error("[Music Card]", err.message);
      await m.react("☢");
      m.reply("😔 *Hubo un problema en nuestro sistema.* \n\nEl sistema no pudo contactar con el servidor de tarjetas. Inténtalo de nuevo en un momento.");
    }
  }

export { pluginConfig as config, handler }
