/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import * as _canvas from '@napi-rs/canvas'
import axios from "axios";
import path from "path";
import fs from "fs";

const getAssetBuffer = MikuRuntime.getAssetBuffer;
const defaultAvatar = MikuRuntime.defaultAvatar;
const uploadTo0x0 = MikuRuntime.uploadTo0x0;
const te = MikuRuntime.te;

  const pluginConfig = {
    name: "fakeml",
    alias: ["mlbbfake", "mlcard", "mlfake"],
    category: "maker",
    description: "Crea un perfil falso de ML",
    usage: ".fakeml <nombre> (responde o envía una foto)",
    example: ".fakeml Misaki",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true,
  };
  let fontRegistered = false;
  async function handler(m, { sock }) {
    const name = m.text?.trim();
    if (!name) {
      return m.reply(
        `🎮 *PERFIL ML FALSO*\n\n` +
          `> Escribe un nombre para el perfil\n\n` +
          `*CÓMO USAR:*\n` +
          `> 1. Envía una foto con el texto \`${m.prefix}fakeml <nombre>\`\n` +
          `> 2. Responde a la foto con \`${m.prefix}fakeml <nombre>\``,
      );
    }
    let buffer = null;
    if (
      m.quoted &&
      (m.quoted.type === "imageMessage" || m.quoted.mtype === "imageMessage")
    ) {
      try {
        buffer = await m.quoted.download();
      } catch (e) { m.reply(te(m.prefix, m.command, m.pushName));
      }
    } else if (m.isMedia && m.type === "imageMessage") {
      try {
        buffer = await m.download();
      } catch (e) { m.reply(te(m.prefix, m.command, m.pushName));
      }
    } else {
      try {
        let te = await sock.profilePictureUrl(m.sender, "image");
        buffer = Buffer.from(
          (await axios.get(te, { responseType: "arraybuffer" })).data,
        );
      } catch (error) { buffer = (getAssetBuffer("pp-kosong") || defaultAvatar());
      }
    }
    if (!buffer) {
      return m.reply(`❌ ¡Envía o responde a una imagen para usarla como avatar!`);
    }
    m.react("🕕");
    try {
      const gmbr = await uploadTo0x0(buffer, {
        filename: "image.jpg",
        contentType: "image/jpeg",
      });
      await sock.sendMedia(
        m.chat,
        `https://api.nexray.eu.cc/maker/fakelobyml?avatar=${encodeURIComponent(gmbr.directUrl)}&nickname=${encodeURIComponent(name)}`,
        null,
        m,
        {
          type: "image",
        },
      );
      m.react("✅");
    } catch (error) { m.react("❌");
      m.reply(`Inténtalo de nuevo`);
    }
  }

export { pluginConfig as config, handler }
