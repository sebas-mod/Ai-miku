/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getAssetBuffer } from "../../src/lib/core/media.js";
import { fileTypeFromBuffer } from "file-type";
import { config } from "../../config.js";
import te from "../../src/lib/core/error.js";
import { saluranCtx } from "../../src/lib/core/context.js";
import { generateWAMessage } from "@rexxhayanasi/elaina-baileys";

const botConfig = config;

function buildSyntheticSwGcRawMessage(sock, remoteJid, innerMessage, messageId) {
  const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
  return {
    key: {
      remoteJid,
      fromMe: true,
      id: messageId,
      participant: botJid,
    },
    message: {
      groupStatusMessageV2: {
        message: innerMessage,
      },
    },
    messageTimestamp: Math.floor(Date.now() / 1000),
  };
}

const pluginConfig = {
  name: "swgcv2all",
  alias: ["statusgrupv2all"],
  category: "owner",
  description: "Post Group Status V2 ke SEMUA grup",
  usage: ".swgcv2all <teks> atau reply media",
  example: ".swgcv2all Halo semua grup!",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text || "";

  let rawContent = null;

  if (m.isMedia || (m.quoted && m.quoted.isMedia)) {
    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }

    if (!buffer) {
      return m.reply("❌ No se pudo descargar el multimedia. Inténtalo de nuevo.");
    }

    const fileType = await fileTypeFromBuffer(buffer);
    const mime = fileType ? fileType.mime : "application/octet-stream";

    if (mime.startsWith("image/")) {
      rawContent = { image: buffer, caption: text };
    } else if (mime.startsWith("video/")) {
      rawContent = { video: buffer, caption: text };
    } else if (mime.startsWith("audio/")) {
      rawContent = {
        audio: buffer,
        mimetype: "audio/mpeg",
        ptt: m.quoted?.ptt || m.ptt || false,
      };
    } else {
      return m.reply("❌ Formato de multimedia no compatible con SW GC.");
    }
  } else if (text) {
    rawContent = { text: text };
  } else {
    return m.reply(
      `👋 *SWGCV2 ALL GLOBAL*\n\n` +
      `> Envía un mensaje de *Estado de grupo V2* a TODOS los grupos a la vez.\n\n` +
      `╭┈┈⬡「 📋 *CÓMO USAR* 」\n` +
      `┃ ${m.prefix}swgcv2all ¡Hola a todos!\n` +
      `┃ o responde a una imagen/vídeo con el texto ${m.prefix}swgcv2all\n` +
      `╰┈┈┈┈┈┈┈┈⬡`
    );
  }

  await m.react("🕕");

  try {
    const groups = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);

    if (groupIds.length === 0) {
      await m.react("❌");
      return m.reply("❌ El bot no está en ningún grupo.");
    }

    await m.reply(`⏳ *Iniciando la difusión de estado de grupo V2 a ${groupIds.length} grupos...*\n\n> Este proceso puede tardar un poco.`);

    let successCount = 0;
    let failCount = 0;

    for (const targetGroupId of groupIds) {
      try {
        let baseContent = {};
        if (rawContent.image) {
          baseContent = { image: rawContent.image, caption: rawContent.caption || "" };
        } else if (rawContent.video) {
          baseContent = { video: rawContent.video, caption: rawContent.caption || "" };
        } else if (rawContent.audio) {
          baseContent = { audio: rawContent.audio, mimetype: rawContent.mimetype || "audio/mpeg", ptt: rawContent.ptt || false };
        } else if (rawContent.text) {
          baseContent = { text: rawContent.text };
        }

        const genMsg = await generateWAMessage(targetGroupId, baseContent, {
          userJid: sock.user.id,
          upload: sock.waUploadToServer
        });

        const msgType = Object.keys(genMsg.message).find(k => k.endsWith('Message') && k !== 'senderKeyDistributionMessage');

        let mediaMessage = {};
        if (msgType) {
          mediaMessage[msgType] = genMsg.message[msgType];
          const newContextInfo = {
            isGroupStatus: true,
            statusSourceType: rawContent.text ? 4 : rawContent.audio ? 3 : rawContent.video ? 1 : 0,
            featureEligibilities: {
              canBeReshared: true,
              canBeSentToParticipants: true
            },
            statusAttributions: [
              {
                type: 10
              }
            ],
            statusAudienceMetadata: {
              audienceType: 1
            }
          };

          if (mediaMessage[msgType].contextInfo) {
            Object.assign(mediaMessage[msgType].contextInfo, newContextInfo);
          } else {
            mediaMessage[msgType].contextInfo = newContextInfo;
          }
        }

        const messageId = genMsg.key.id;
        const finalMessage = buildSyntheticSwGcRawMessage(
          sock,
          targetGroupId,
          mediaMessage,
          messageId
        );

        await sock.relayMessage(targetGroupId, finalMessage.message, {
          messageId: messageId,
        });

        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    await m.react("✅");
    await m.reply(
      `✅ *SWGCV2 ALL TERMINADO*\n\n` +
      `╭┈┈⬡「 📊 *RESULTADO* 」\n` +
      `┃ 🌐 Total de grupos: *${groupIds.length}*\n` +
      `┃ ✅ Sukses: *${successCount}*\n` +
      `┃ ❌ Fallidos: *${failCount}*\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> ¡El estado de grupo V2 (Ring Pink) se envió a todos los grupos!`
    );

  } catch (error) {
    console.error("[SwgcV2All] Error:", error.message);
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
