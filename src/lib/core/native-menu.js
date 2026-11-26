/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../../config.js";
import sharp from "sharp";
import { getJpegThumb } from "./media.js";

/** Send a one-wide-button Native Flow menu using the same buttonsMessage shape as .allmenu. */
export async function sendElysiaNativeMenu(sock, m, {
  buttonId = "pilihan_menu",
  sections = [],
  pickerTitle = "☰ Menu",
  contentText = "",
  footerText = "",
  address = "MENU Elysia Assistant",
  thumbKey = "listmenu",
  thumbUrl = "",
} = {}) {
  const botName = config.bot?.name || "Elysia Assistant";
  let thumbnail = null;
  if (thumbUrl && /^https?:\/\//.test(thumbUrl)) {
    try {
      const res = await fetch(thumbUrl);
      const raw = Buffer.from(await res.arrayBuffer());
      thumbnail = await sharp(raw).rotate().resize(300, 300, { fit: "cover" }).jpeg({ quality: 80 }).toBuffer();
    } catch {}
  }
  if (!thumbnail) thumbnail = await getJpegThumb(thumbKey);

  const paramsJson = JSON.stringify({ title: pickerTitle, sections });
  const contextInfo = {
    ...(m.sender ? { mentionedJid: [m.sender] } : {}),
    forwardingScore: 777,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: config.saluran?.id || "120363393471527483@newsletter",
      newsletterName: config.saluran?.name || botName,
      serverMessageId: 127,
    },
  };

  return sock.relayMessage(m.chat, {
    buttonsMessage: {
      buttons: [{
        buttonId,
        buttonText: { displayText: "☰ Menu" },
        type: 1,
        nativeFlowInfo: { name: "single_select", paramsJson },
      }],
      locationMessage: {
        name: `──「 ${botName} 」──`,
        address,
        ...(thumbnail ? { jpegThumbnail: thumbnail } : {}),
      },
      contentText,
      ...(footerText ? { footerText } : {}),
      contextInfo,
      headerType: 6,
      messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
    },
  }, {});
}
