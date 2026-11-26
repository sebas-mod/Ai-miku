/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import moment from "moment-timezone";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/data/database.js";
import { createWideDiscordCard } from "../../src/lib/core/welcome-card.js";
import { resolveAnyLidToJid } from "../../src/lib/core/lid.js";
import path from "path";
import fs from "fs";
import axios from "axios";
import te from "../../src/lib/core/error.js";
import { saluranCtx } from "../../src/lib/core/context.js";
import { getAssetBuffer } from "../../src/lib/core/media.js";
import { prepareWAMessageMedia, generateWAMessageFromContent } from "@rexxhayanasi/elaina-baileys";
function resolvePlaceholders(
  template,
  username,
  groupName,
  groupDesc,
  memberCount,
  groupOwner,
  prefix,
) {
  const now = moment().tz("Asia/Jakarta");
  const dayNames = {
    Sunday: "Domingo",
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
  };
  const dayId = dayNames[now.format("dddd")] || now.format("dddd");
  return template
    .replace(/{user}/gi, `@${username}`)
    .replace(/{number}/gi, username)
    .replace(/{group}/gi, groupName || "Grupo")
    .replace(/{desc}/gi, groupDesc || "")
    .replace(/{count}/gi, memberCount?.toString() || "0")
    .replace(/{owner}/gi, groupOwner || "Admin")
    .replace(/{date}/gi, now.format("DD/MM/YYYY"))
    .replace(/{time}/gi, now.format("HH:mm"))
    .replace(/{day}/gi, dayId)
    .replace(/{bot}/gi, config.bot?.name || "elysia")
    .replace(/{prefix}/gi, prefix);
}
const pluginConfig = {
  name: "welcome",
  alias: ["wc"],
  category: "group",
  description: "Configura el mensaje de bienvenida del grupo",
  usage: ".welcome <on/off>",
  example: ".welcome on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
// eslint-disable-next-line require-await
async function buildWelcomeMessage(
  participant,
  groupName,
  groupDesc,
  memberCount,
  customMsg = null,
  groupOwner = "",
  prefix = ".",
) {
  const greetings = [
    `Por fin llegó`,
    `Bienvenido`,
    `Bienvenida`,
    `Hola`,
    `Hey`,
    `Yokoso~`,
    `Ohayou~`,
  ];
  const quotes = [
    `¡No te quedes solo leyendo!`,
    `Tranquilo, siéntete como en casa.`,
    `¡Venga, empieza a hablar!`,
    `¡Prepárate para la buena conversación!`,
    `No seas tímido, ¡aquí todos somos amigos!`,
    `Si no sabes por dónde empezar, saluda y ya 😄`,
  ];
  const emojis = ["🎐", "🌸", "✨", "💫", "🪸", "🔥", "💖"];
  const headers = [
    `🎐 ¡Ohayou~ minna-san!
Hoy nos llega un nuevo tomodachi 🌱
Vamos a darle la bienvenida entre todos~`,
    `🌸 ¡Ohayou minna-san!
Por fin se unió un nuevo amigo ✨
Que se sienta a gusto y participe desde ya~`,
    `✨ ¡Ohayou~!
Llega un nuevo tomodachi con vibras nuevas 💫
¡Yoroshiku ne~ vamos a divertirnos juntos!`,
    `🪸 ¡Ohayou minna-san!
Este grupo suma un miembro más a la familia 🤍
¡Pasemos buenos momentos juntos~`,
  ];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const header = headers[Math.floor(Math.random() * headers.length)];
  const username = participant?.split("@")[0] || "User";
  const now = moment().tz("Asia/Jakarta");
  const dayNames = {
    Sunday: "Domingo",
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
  };
  const dayId = dayNames[now.format("dddd")] || now.format("dddd");
  if (customMsg) {
    return resolvePlaceholders(
      customMsg,
      username,
      groupName,
      groupDesc,
      memberCount,
      groupOwner,
      prefix,
    );
  }
  let msg = `👋🏻 *NUEVO MIEMBRO* 👋🏻\n\n`;
  msg += `${header}\n`;
  msg += `${emoji} ${greeting}, *@${username}* 💫\n\n`;
  msg += `📌 *INFO DEL GRUPO*\n`;
  msg += `> 🏠 *Nombre* : ${groupName}\n`;
  msg += `> 👥 *Miembros* : ${memberCount}\n`;
  msg += `> 📅 *Fecha* : ${moment().tz("Asia/Jakarta").format("DD/MM/YYYY")}\n`;

  if (groupDesc) {
    msg += `\n📝 *Descripción*\n> ❝ ${groupDesc.slice(0, 120)}${groupDesc.length > 120 ? "..." : ""} ❞\n`;
  }

  msg += `\n✨ *Consejo del día*\n> 「 ${quote} 」\n\n🌸 _¡Yoroshiku ne~ que estés a gusto!_ 🤍`;

  return msg;
}
async function sendWelcomeMessage(sock, groupJid, participant, groupMeta) {
  try {
    const db = getDatabase();
    const groupData = db.getGroup(groupJid);
    if (groupData?.welcome !== true) return false;
    const welcomeType = db.setting("welcomeType") || 1;
    const realParticipant = resolveAnyLidToJid(
      participant,
      groupMeta?.participants || [],
    );
    const memberCount = groupMeta?.participants?.length || 0;
    const groupName = groupMeta?.subject || "Grupo";
    let userName = realParticipant?.split("@")[0] || "User";
    let ppUrl =
      "https://cdn.gimita.id/download/pp%20kosong%20wa%20default%20(1)_1769506608569_52b57f5b.jpg";
    try {
      ppUrl = await sock.profilePictureUrl(realParticipant, "image");
    } catch { }
    const text = await buildWelcomeMessage(
      realParticipant,
      groupMeta?.subject,
      groupMeta?.descOwner,
      memberCount,
      groupData?.welcomeMsg,
      groupMeta?.owner?.split("@")[0] || "",
      config.command?.prefix || ".",
    );
    const saluranId = config.saluran?.id || "120363393471527483@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Elysia Assistant";
    if (welcomeType === 2) {
      const cardBody = groupData?.welcomeMsg
        ? resolvePlaceholders(
          groupData.welcomeMsg,
          userName,
          groupMeta?.subject,
          groupMeta?.desc,
          memberCount,
          groupMeta?.owner?.split("@")[0] || "",
          config.command?.prefix || ".",
        )
        : `Bienvenido al grupo *${groupName}* 🎉\nMiembro n.º ${memberCount}`;
      await sock.sendMessage(groupJid, {
        interactiveMessage: {
          body: {
            text: `👋 Bienvenido *@${userName}*`,
          },
          footer: { text: config.bot?.name || "Elysia Assistant" },
          header: { title: "Welcome", hasMediaAttachment: false },
          carouselMessage: {
            cards: [
              {
                header: {
                  imageMessage: { url: ppUrl },
                },
                body: {
                  text: cardBody,
                },
                footer: { text: config.bot?.name || "Elysia Assistant" },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "👋 Hola @" + userName,
                        id: "hi",
                      }),
                    },
                  ],
                },
              },
            ],
            messageVersion: 1,
            carouselCardType: 1,
          },
          contextInfo: {
            ...saluranCtx(),
            mentionedJid: [realParticipant],
          },
        },
      });
    } else if (welcomeType === 3) {
      const textOnly = groupData?.welcomeMsg
        ? resolvePlaceholders(
          groupData.welcomeMsg,
          userName,
          groupMeta?.subject,
          groupMeta?.desc,
          memberCount,
          groupMeta?.owner?.split("@")[0] || "",
          config.command?.prefix || ".",
        )
        : `*Hola* @${userName} 👋\nBienvenido al grupo *${groupName}* 🌸`;
      await sock.sendMessage(groupJid, {
        text: textOnly,
        contextInfo: {
          ...saluranCtx(),
          mentionedJid: [realParticipant]
        },
      });
    } else if (welcomeType === 4) {
      await sock.sendText(groupJid, text, null, {
        mentions: [realParticipant],
        contextInfo: {
          ...saluranCtx(),
          mentionedJid: [realParticipant],
        },
      });
    } else if (welcomeType === 5) {
      await sock.sendPreview(
        groupJid,
        {
          caption: "https://welcome.guys " + text,
          url: "https://welcome.guys",
          title: `Welcome to ${groupName}`,
          description: `👋 Halo ${userName}!`,
          image: ppUrl,
          previewType: 0,
        },
        {
          contextInfo: {
            mentionedJid: [realParticipant],
          }
        }
      );
    } else if (welcomeType === 6) {
      await sock.sendMessage(groupJid, {
        image: getAssetBuffer("welcome"),
        caption: text,
        contextInfo: {
          mentionedJid: [realParticipant],
        }
      });
    } else if (welcomeType === 7) {
      const qFake = {
        key: {
          fromMe: false,
          participant: realParticipant,
          remoteJid: realParticipant
        },
        message: {
          conversation: `¡Hola a todos! 👋`
        }
      };

      const media = await prepareWAMessageMedia({
        image: { url: ppUrl }
      }, { upload: sock.waUploadToServer });

      const msg = generateWAMessageFromContent(groupJid, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {},
            interactiveMessage: {
              header: {
                title: "",
                subtitle: "",
                hasMediaAttachment: true,
                imageMessage: media.imageMessage
              },
              body: {
                text: text
              },
              footer: {
                text: config.bot?.name || "Elysia Assistant"
              },
              contextInfo: {
                mentionedJid: [realParticipant],
                isForwarded: true,
                forwardingScore: 9
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "👋 Hola",
                      id: "hi"
                    })
                  }
                ]
              }
            }
          }
        }
      }, { quoted: qFake, userJid: sock.user.jid });

      await sock.relayMessage(groupJid, msg.message, {
        messageId: msg.key.id,
      });
    } else {
      await sock.sendMessage(groupJid, {
        text: text,
        mentions: [realParticipant],
      });
    }
    return true;
  } catch (error) {
    console.error("Welcome Error:", error);
    return false;
  }
}
async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.welcome === true;
  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(config.messages.ownerOnly);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: true });
        count++;
      }
      m.react("✅");
      return m.reply(
        `✅ *BIENVENIDA GLOBAL ACTIVADA*\n\n` +
        `> ¡Bienvenida activada en *${count}* grupos!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(config.messages.ownerOnly);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: false });
        count++;
      }
      m.react("✅");
      return m.reply(
        `❌ *BIENVENIDA GLOBAL DESACTIVADA*\n\n` +
        `> ¡Bienvenida desactivada en *${count}* grupos!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *BIENVENIDA YA ACTIVA*\n\n` +
        `> Estado: *✅ ON*\n` +
        `> La bienvenida ya está activa en este grupo.\n\n` +
        `_Usa \`${m.prefix}welcome off\` para desactivarla._`,
      );
    }
    db.setGroup(m.chat, { welcome: true });
    return m.reply(
      `✅ *BIENVENIDA ACTIVADO*\n\n` +
      `> ¡Mensaje de bienvenida activado!\n` +
      `> Los nuevos miembros recibirán la bienvenida automáticamente.\n\n` +
      `_Usa \`${m.prefix}setwelcome\` para personalizar el mensaje._`,
    );
  }
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *BIENVENIDA YA DESACTIVADA*\n\n` +
        `> Estado: *❌ OFF*\n` +
        `> La bienvenida ya estaba desactivada en este grupo.\n\n` +
        `_Usa \`${m.prefix}welcome on\` para activarla._`,
      );
    }
    db.setGroup(m.chat, { welcome: false });
    return m.reply(
      `❌ *BIENVENIDA DESACTIVADO*\n\n` +
      `> Mensaje de bienvenida desactivado.\n` +
      `> Los nuevos miembros ya no recibirán la bienvenida.`,
    );
  }
  m.reply(
    `👋 *AJUSTES DE BIENVENIDA*\n\n` +
    `> Estado: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
    `\`\`\`━━━ OPCIONES ━━━\`\`\`\n` +
    `> \`${m.prefix}welcome on\` → Activar\n` +
    `> \`${m.prefix}welcome off\` → Desactivar\n` +
    `> \`${m.prefix}welcome on all\` → Activar en todo (dueño)\n` +
    `> \`${m.prefix}welcome off all\` → Desactivar en todo (dueño)\n` +
    `> \`${m.prefix}setwelcome\` → Mensaje personalizado\n` +
    `> \`${m.prefix}resetwelcome\` → Volver al mensaje por defecto`,
  );
}
export { pluginConfig as config, handler, sendWelcomeMessage };
