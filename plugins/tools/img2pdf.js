/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
const mikuGlobal = MikuRuntime.mikuGlobal;
import { downloadMediaMessage } from '@rexxhayanasi/elaina-baileys'

const pluginConfig = {
    name: "img2pdf",
    alias: [],
    category: "tools",
    description: "Fitur tools img2pdf",
    usage: ".img2pdf",
    example: ".img2pdf",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const PDFDocument = (__m => __m.default ?? __m)((await import('pdfkit')))
  const sharp = (__m => __m.default ?? __m)((await import('sharp')))
const toSmallCaps = (str) => {
      const smallCapsMap = {
          a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
          j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
          s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
      };
      return str.toLowerCase().split('').map(c => smallCapsMap[c] || c).join('');
  };

  const extractMediaBuffer = async (msgObj, client) => {
      if (!msgObj) return null;
      if (Buffer.isBuffer(msgObj)) return msgObj;
      if (typeof msgObj.download === 'function') {
          try {
              const buf = await msgObj.download();
              if (buf && Buffer.isBuffer(buf)) return buf;
          } catch (_) {}
      }

      const rawMsg = msgObj.message || msgObj.msg || msgObj;
      const innerMsg = rawMsg.imageMessage || rawMsg.documentMessage || rawMsg.viewOnceMessageV2?.message?.imageMessage || rawMsg.viewOnceMessage?.message?.imageMessage;

      if (innerMsg) {
          try {
              const buf = await downloadMediaMessage(
                  { key: msgObj.key || {}, message: rawMsg },
                  'buffer',
                  {},
                  { logger: console, reuploadRequest: client?.updateMediaMessage }
              );
              if (buf && Buffer.isBuffer(buf)) return buf;
          } catch (_) {}
      }
      return null;
  };

  async function handler(m, { sock, conn, text, usedPrefix, command, reply }) {
      const client = conn || sock || mikuGlobal.mainSock;
      const qmsg = m.quoted ? m.quoted : m;

      let targetMessages = [];

      if (m.quoted) {
          const qId = m.quoted.id || m.quoted.key?.id;
          const qFake = m.quoted.fakeObj || {};
          const qFakeMsg = qFake.message || qFake.msg || {};
          const qMsgObj = m.quoted.message || m.quoted.msg || {};

          const cachedAlbum = qId ? mikuGlobal.albumCache?.get(qId) : null;
          const isAlbumReply =
              m.quoted.mtype === 'albumMessage' ||
              Boolean(qMsgObj?.albumMessage) ||
              Boolean(qFakeMsg?.albumMessage) ||
              Boolean(m.quoted.albumMessage) ||
              (Array.isArray(m.quoted.messages) && m.quoted.messages.length > 1) ||
              (Array.isArray(m.quoted.medias) && m.quoted.medias.length > 1) ||
              (Array.isArray(m.quoted.album) && m.quoted.album.length > 1) ||
              (Boolean(cachedAlbum?.isAlbum) && (cachedAlbum.parentId === qId || m.quoted.mtype === 'albumMessage'));

          if (isAlbumReply) {
              if (cachedAlbum && Array.isArray(cachedAlbum.messages) && cachedAlbum.messages.length > 0) {
                  targetMessages = cachedAlbum.messages;
              } else if (Array.isArray(m.quoted.messages) && m.quoted.messages.length > 0) {
                  targetMessages = m.quoted.messages;
              } else if (Array.isArray(m.quoted.medias) && m.quoted.medias.length > 0) {
                  targetMessages = m.quoted.medias;
              } else if (Array.isArray(m.quoted.album) && m.quoted.album.length > 0) {
                  targetMessages = m.quoted.album;
              } else if (qFakeMsg?.albumMessage?.messages || qMsgObj?.albumMessage?.messages) {
                  targetMessages = qFakeMsg?.albumMessage?.messages || qMsgObj?.albumMessage?.messages;
              } else {
                  targetMessages = [m.quoted];
              }
          } else {
              targetMessages = [m.quoted];
          }
      } else {
          targetMessages = [m];
      }

      const isImageCandidate = (msg) => {
          if (!msg) return false;
          if (msg.mtype === 'imageMessage') return true;
          const mime = msg.mimetype || msg.msg?.mimetype || (msg.message?.imageMessage?.mimetype) || '';
          return /image\/(png|jpe?g|webp|bmp)/i.test(mime);
      };

      const validMediaMsgs = targetMessages.filter(isImageCandidate);

      if (!validMediaMsgs.length) {
          let help = `*${toSmallCaps('Conversor de imagenes a PDF')}*\n\n` +
              `*${toSmallCaps('Envía o responde a una foto / álbum de fotos')}* *${usedPrefix + command} [nombredelearchivo]*\n\n` +
              `• 📌 *${toSmallCaps('Función:')}* ¡Admite 1 foto o varias fotos (álbum) a la vez!\n` +
              `• *${toSmallCaps('Ejemplo:')}* \`${usedPrefix + command} Documento_Tarea\``;
          return reply(help);
      }

      await reply(`⏳ *${toSmallCaps('Convirtiendo')}* ${validMediaMsgs.length} *${toSmallCaps('imágenes a PDF, un momento...')}*`);

      try {
          const imageBuffers = [];
          for (const msg of validMediaMsgs) {
              const buf = await extractMediaBuffer(msg, client);
              if (buf) {
                  const convertedJpeg = await sharp(buf)
                      .jpeg({ quality: 90 })
                      .toBuffer()
                      .catch(() => null);

                  if (convertedJpeg) {
                      const meta = await sharp(convertedJpeg).metadata().catch(() => null);
                      imageBuffers.push({
                          buffer: convertedJpeg,
                          width: meta?.width || 595.28,
                          height: meta?.height || 841.89
                      });
                  }
              }
          }

          if (!imageBuffers.length) {
              return reply(`❌ *${toSmallCaps('¡No se pudo descargar la imagen!')}*`);
          }

          const customFileName = (text || '').trim().replace(/[^a-zA-Z0-9_\- ]/g, '') || `angela_doc_${Date.now()}`;
          const finalPdfName = customFileName.endsWith('.pdf') ? customFileName : `${customFileName}.pdf`;

          const doc = new PDFDocument({ autoFirstPage: false });
          const chunks = [];

          doc.on('data', chunk => chunks.push(chunk));

          for (const img of imageBuffers) {
              doc.addPage({
                  size: [img.width, img.height],
                  margin: 0
              });
              doc.image(img.buffer, 0, 0, {
                  width: img.width,
                  height: img.height
              });
          }

          doc.end();

          const pdfBuffer = await new Promise((resolve) => {
              doc.on('end', () => resolve(Buffer.concat(chunks)));
          });

          let caption = `📄 *${toSmallCaps('Documento PDF creado')}*\n\n` +
              `• 📝 *${toSmallCaps('Nombre del archivo:')}* ${finalPdfName}\n` +
              `• 🖼️ *${toSmallCaps('Páginas totales:')}* ${imageBuffers.length} páginas\n` +
              `• 📦 *${toSmallCaps('Tamaño:')}* ${(pdfBuffer.length / 1024).toFixed(2)} KB\n\n` +
              `꒰ © ${global.namebot} ꒱`;

          await client.sendMessage(m.chat, {
              document: pdfBuffer,
              mimetype: 'application/pdf',
              fileName: finalPdfName,
              caption: caption.trim()
          }, { quoted: m });
      } catch (e) {
          console.error('[IMG2PDF ERROR]', e);
          reply(`❌ *${toSmallCaps('Ocurrió un error al crear el PDF:')}* ${e.message}`);
      }
  };

  handler.category = 'tools';

export { pluginConfig as config, handler }
