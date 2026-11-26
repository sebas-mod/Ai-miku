/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const OWNER_THUMB_URL = "https://cdn.zass.in/yL2y8XUPhD.jpeg";
import fs from "fs";
import config, { getOwnerName } from "../../config.js";
import { getDatabase } from "../../src/lib/data/database.js";
import axios from "axios";
import { Button, Carousel } from "../../src/lib/core/builder.js";

const pluginConfig = {
  name: "owner",
  alias: [],
  category: "main",
  description: "Menampilkan informasi owner dalam modern card carousel bergaya WhatsApp",
  usage: ".owner",
  example: ".owner",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function getImageBuffer(sock, jid, fallback) {
  try {
    const url = await sock.profilePictureUrl(jid, "image");
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 15000,
    });
    return Buffer.from(response.data);
  } catch {
    return fallback;
  }
}

function normalizeJid(value) {
  if (!value) return "";
  const raw = String(value).split(":")[0];
  return raw.includes("@") ? raw : `${raw}@s.whatsapp.net`;
}

function cleanNumber(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

async function makeCard(sock, { image, title, body, footer, buttons = [] }) {
  const card = new Button(sock)
    .setImage(image)
    .setTitle(title)
    .setBody(body)
    .setFooter(footer);

  for (const button of buttons) {
    if (!button?.name) continue;
    card.addButton(button.name, button.params || {});
  }

  return card.toCard();
}

async function handler(m, { sock, config: botConfig }) {
  const db = getDatabase();
  const configOwners = botConfig.owner?.number || [];
  const dbOwners = db.data.owner || [];

  const ownerNumbers = [...new Set([...configOwners, ...dbOwners])]
    .map(cleanNumber)
    .filter(Boolean)
    .slice(0, 9);

  const botName = botConfig.bot?.name || "Elysia Assistant";

  if (!ownerNumbers.length) {
    await m.reply("❌ Data owner belum tersedia di konfigurasi bot.");
    return;
  }

  const fallbackImage = await axios.get(OWNER_THUMB_URL, { responseType: "arraybuffer", timeout: 10000 }).then((r) => Buffer.from(r.data)).catch(() => null);

  const cards = [];

  // Modern Card: setiap owner menjadi satu kartu yang bisa digeser.
  for (let index = 0; index < ownerNumbers.length; index++) {
    const number = ownerNumbers[index];
    const ownerName = getOwnerName(number) || `Owner ${index + 1}`;
    const ownerJid = normalizeJid(number);
    const ownerImage = await getImageBuffer(sock, ownerJid, fallbackImage);

    cards.push(await makeCard(sock, {
      image: ownerImage,
      title: `👑 ${ownerName}`,
      body:
        `OWNER INFORMATION  •  ${index + 1}/${ownerNumbers.length}\n\n` +
        `✦ Lead Developer\n` +
        `✦ ${ownerName}\n` +
        `✦ Status : 🟢 Online\n` +
        `✦ Contact : +${number}\n\n` +
        `Owner resmi ${botName}.` ,
      footer: `${botName}  •  Owner Contact`,
      buttons: [
        {
          name: "cta_url",
          params: {
            display_text: "Chat Owner",
            url: `https://wa.me/${number}?text=${encodeURIComponent(`Halo ${ownerName}, saya ingin bertanya tentang ${botName}.`)}`,
          },
        },
        {
          name: "cta_url",
          params: {
            display_text: "Info Update",
            url: botConfig.saluran?.link || "https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O",
            merchant_url: botConfig.saluran?.link || "https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O",
          },
        },
      ],
    }));
  }

  // Kartu terakhir untuk identitas bot.
  const botJid = normalizeJid(sock.user?.id || sock.user?.jid);
  const botImage = botJid
    ? await getImageBuffer(sock, botJid, fallbackImage)
    : fallbackImage;

  cards.push(await makeCard(sock, {
    image: botImage,
    title: `🤖 ${botName}`,
    body:
      `OFFICIAL BOT  •  ${ownerNumbers.length + 1}/${ownerNumbers.length + 1}\n\n` +
      `✦ Official Bot\n` +
      `✦ ${botName}\n` +
      `✦ Status : 🟢 Online\n` +
      `✦ Platform : WhatsApp Multi-Device\n\n` +
      `Bot aktif dan siap digunakan.`,
    footer: `${botName}  •  Active System`,
    buttons: [
      {
        name: "quick_reply",
        params: {
          display_text: "Info Bot",
          id: `${botConfig.command?.prefix || "."}infobot`,
        },
      },
      {
        name: "cta_url",
        params: {
          display_text: "Website",
          url: "https://arthazyspace.my.id",
          merchant_url: "https://arthazyspace.my.id",
        },
      },
    ],
  }));

  const ownerNames = ownerNumbers
    .map((number) => getOwnerName(number))
    .filter(Boolean);

  try {
    const carousel = new Carousel(sock)
      .setBody(
        `♛  OWNER INFORMATION\n\n` +
        `Kenali owner dan official bot dalam tampilan card yang bisa digeser.\n\n` +
        `Owner: ${ownerNames.join(", ") || "Owner"}\n` +
        `Bot: ${botName}\n` +
        `Status: 🟢 Online`,
      )
      .setFooter("Swipe kartu ← → untuk melihat profil owner.");

    carousel.addCard(cards);
    await carousel.send(m.chat, { quoted: m.raw });
  } catch (error) {
    console.error("OWNER CAROUSEL ERROR:", error);
    await m.reply(
      "❌ Carousel gagal dikirim. Cek log server untuk detail error dari builder WhatsApp.",
    );
  }
}

export { pluginConfig as config, handler };
