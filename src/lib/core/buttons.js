/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { generateWAMessageFromContent, prepareWAMessageMedia } from "@rexxhayanasi/elaina-baileys";
import config from "../../../config.js";

// ─────────────────────────────────────────────────────────────
//  TOMBOL INTERAKTIF (native flow) — satu pintu untuk semua fitur
//
//  Jenis tombol yang didukung (tampil dengan ikon bawaan WhatsApp):
//    quick_reply   ↩  balas cepat (kirim `id` sebagai pesan)
//    single_select ☰  daftar pilihan (sections > rows)
//    cta_url       ↗  buka link
//    cta_copy      ⧉  salin teks / kode
//    cta_call      📞 telepon
//
//  Bentuk penulisan yang diterima di `buttons`:
//   1) Native : { name: "quick_reply", buttonParamsJson: JSON.stringify({...}) }
//   2) Native : { name: "cta_url", params: { display_text, url } }
//   3) Ringkas:
//      { type: "reply",  text: "Semua Fitur", id: ".allmenu" }
//      { type: "url",    text: "Saluran",     url: "https://..." }
//      { type: "copy",   text: "Salin",       code: "12345" }
//      { type: "call",   text: "Telepon",     phone: "62812..." }
//      { type: "select", text: "Pilih Kategori", sections: [{ title, rows: [{ title, description, id }] }] }
//      (untuk select, `rows` langsung tanpa sections juga boleh)
// ─────────────────────────────────────────────────────────────

const TYPE_MAP = {
  reply: "quick_reply",
  quick_reply: "quick_reply",
  url: "cta_url",
  link: "cta_url",
  cta_url: "cta_url",
  copy: "cta_copy",
  cta_copy: "cta_copy",
  call: "cta_call",
  cta_call: "cta_call",
  select: "single_select",
  list: "single_select",
  single_select: "single_select",
};

const asJson = (v) => (typeof v === "string" ? v : JSON.stringify(v ?? {}));

/** Ubah daftar tombol bentuk apa pun menjadi { name, buttonParamsJson } yang valid. */
export function normalizeButtons(buttons = []) {
  const out = [];
  for (const b of Array.isArray(buttons) ? buttons : []) {
    if (!b || typeof b !== "object") continue;

    // Bentuk native (name + buttonParamsJson / params)
    if (b.name !== undefined && b.type === undefined) {
      if (b.name === "") {
        out.push({ name: "", buttonParamsJson: "" });
        continue;
      }
      const name = TYPE_MAP[b.name] || b.name;
      out.push({ name, buttonParamsJson: asJson(b.buttonParamsJson ?? b.params ?? {}) });
      continue;
    }

    // Bentuk ringkas (type + text)
    const name = TYPE_MAP[String(b.type || "").toLowerCase()];
    if (!name) continue;
    const text = b.text ?? b.display_text ?? b.title ?? "";
    let params;
    if (name === "quick_reply") {
      params = { display_text: text, id: String(b.id ?? b.command ?? text) };
    } else if (name === "cta_url") {
      params = { display_text: text, url: b.url, merchant_url: b.merchant_url || b.url };
    } else if (name === "cta_copy") {
      params = { display_text: text, copy_code: String(b.code ?? b.copy_code ?? "") };
    } else if (name === "cta_call") {
      params = { display_text: text, phone_number: String(b.phone ?? b.phone_number ?? "") };
    } else {
      const sections = b.sections || [{ title: b.sectionTitle || text || "Pilihan", rows: b.rows || [] }];
      params = { title: b.title || text || "Pilih", sections, ...(b.icon ? { icon: b.icon } : {}) };
    }
    out.push({ name, buttonParamsJson: JSON.stringify(params) });
  }
  return out;
}

function quotedContext(quoted) {
  if (!quoted?.key?.id || !quoted.message) return {};
  return {
    stanzaId: quoted.key.id,
    participant: quoted.key.participant || quoted.sender || quoted.key.remoteJid,
    quotedMessage: quoted.message,
  };
}

/** Susun isi pesan interaktif (tanpa mengirim). Fungsi murni supaya mudah dites. */
export function buildInteractiveContent({ text = "", footer, buttons, header, params, contextInfo, quoted } = {}) {
  const nativeButtons = normalizeButtons(buttons);
  if (!nativeButtons.length) throw new Error("botones vacíos / no válidos");
  return {
    interactiveMessage: {
      header: header || { title: "", subtitle: "", hasMediaAttachment: false },
      body: { text: String(text ?? "") },
      footer: { text: String(footer || config.bot?.name || "Ai Miku") },
      nativeFlowMessage: {
        buttons: nativeButtons,
        messageParamsJson: JSON.stringify(params || {}),
      },
      contextInfo: { ...quotedContext(quoted), ...(contextInfo || {}) },
    },
  };
}

const MEDIA_FIELD = { image: "imageMessage", video: "videoMessage", document: "documentMessage" };

/**
 * Kirim pesan tombol interaktif.
 * @param {object} sock
 * @param {string} jid
 * @param {object} o  { media, mediaType, mimetype, fileName, title, text, footer, buttons, params, contextInfo, quoted }
 */
export async function sendInteractive(sock, jid, o = {}) {
  let header;
  const type = o.mediaType || "image";
  if (o.media && MEDIA_FIELD[type]) {
    let data = o.media;
    if (typeof data === "string" && /^https?:\/\//.test(data)) data = { url: data };
    const payload = { [type]: data };
    if (type === "video" || type === "document") payload.mimetype = o.mimetype || (type === "video" ? "video/mp4" : "application/octet-stream");
    if (type === "document" && o.fileName) payload.fileName = o.fileName;
    const media = await prepareWAMessageMedia(payload, { upload: sock.waUploadToServer });
    header = {
      title: o.title || "",
      subtitle: "",
      hasMediaAttachment: true,
      [MEDIA_FIELD[type]]: media[MEDIA_FIELD[type]],
    };
  } else if (o.title) {
    header = { title: o.title, subtitle: "", hasMediaAttachment: false };
  }

  const content = buildInteractiveContent({
    text: o.text,
    footer: o.footer,
    buttons: o.buttons,
    header,
    params: o.params,
    contextInfo: o.contextInfo,
    quoted: o.quoted,
  });
  const msg = generateWAMessageFromContent(jid, content, { userJid: sock.user?.id });
  await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
  return msg;
}

import { getJpegThumb } from "./media.js";

/**
 * Kirim tombol pilih (list single_select atau quick reply) menggunakan format buttonsMessage
 * yang terbukti 100% muncul dan dapat diklik di WhatsApp Android/Desktop/iOS (sama seperti .allmenu).
 */
export async function sendButtons(sock, jid, o = {}, extra = {}) {
  const botName = config.bot?.name || "Ai Miku";
  const buttonsIn = Array.isArray(o.buttons) ? o.buttons : [];
  if (!buttonsIn.length) {
    return sock.sendMessage(jid, { text: String(o.text || ""), mentions: o.mentions }, extra);
  }

  const listBtn = buttonsIn.find((b) =>
    ["list", "select", "single_select"].includes(String(b.type || b.name || "").toLowerCase())
  );
  const quoted = extra?.quoted || o.quoted;
  const qKey = quoted?.key || quoted?.raw?.key;
  const qMsg = quoted?.message || quoted?.raw?.message;

  const contextInfo = {
    ...(Array.isArray(o.mentions) && o.mentions.length ? { mentionedJid: o.mentions } : {}),
    ...(qKey?.id
      ? {
          stanzaId: qKey.id,
          participant: qKey.participant || quoted?.sender || qKey.remoteJid,
          quotedMessage: qMsg || { conversation: quoted?.body || quoted?.text || "" },
        }
      : {}),
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: config.saluran?.id || "120363393471527483@newsletter",
      newsletterName: config.saluran?.name || botName,
      serverMessageId: 127,
    },
    ...(o.contextInfo || {}),
  };

  if (listBtn) {
    const sections = listBtn.sections || [
      { title: listBtn.sectionTitle || listBtn.text || "Pilihan", rows: listBtn.rows || [] },
    ];
    const btnTitle = listBtn.title || listBtn.text || "☰ Pilih";
    const paramsJson = JSON.stringify({ title: btnTitle, sections });

    return await sock.relayMessage(
      jid,
      {
        buttonsMessage: {
          buttons: [
            {
              buttonId: "miku_select_btn",
              buttonText: { displayText: btnTitle },
              type: 1,
              nativeFlowInfo: {
                name: "single_select",
                paramsJson,
              },
            },
          ],
          contentText: String(o.text || ""),
          footerText: String(o.footer || botName),
          contextInfo,
          headerType: 1,
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
        },
      },
      {}
    );
  }

  // Quick reply buttons (tetap utuh tanpa kotak hitam locationMessage)
  const quickButtons = buttonsIn.map((b, i) => ({
    buttonId: String(b.id || b.command || `btn_${i + 1}`),
    buttonText: { displayText: String(b.text || b.title || b.display_text || `Pilihan ${i + 1}`) },
    type: 1,
  }));

  return await sock.relayMessage(
    jid,
    {
      buttonsMessage: {
        buttons: quickButtons,
        contentText: String(o.text || ""),
        footerText: String(o.footer || botName),
        contextInfo,
        headerType: 1,
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
        },
      },
    },
    {}
  );
}

export default { normalizeButtons, buildInteractiveContent, sendInteractive, sendButtons };
