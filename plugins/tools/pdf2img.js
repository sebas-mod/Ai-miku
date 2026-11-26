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
import { exec } from 'child_process'

const pluginConfig = {
    name: "pdf2img",
    alias: [],
    category: "tools",
    description: "pdf2img",
    usage: ".pdf2img",
    example: ".pdf2img",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const fs = (__m => __m.default ?? __m)((await import('fs')))
  const path = (__m => __m.default ?? __m)((await import('path')))
const { downloadMediaMessage } = (await import('@rexxhayanasi/elaina-baileys'))

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
      const innerMsg = rawMsg.documentMessage || rawMsg.documentWithCaptionMessage?.message?.documentMessage;

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

  async function handler(m, { sock, conn, usedPrefix, command, reply }) {
      const client = conn || sock || mikuGlobal.mainSock;
      const qmsg = m.quoted ? m.quoted : m;

      const mime = qmsg.mimetype || qmsg.msg?.mimetype || (qmsg.message?.documentMessage?.mimetype) || (qmsg.message?.documentWithCaptionMessage?.message?.documentMessage?.mimetype) || '';

      if (!/application\/pdf/i.test(mime)) {
          let help = `*${toSmallCaps('PDF to Image Converter')}*\n\n` +
              `*${toSmallCaps('Envía o responde a un documento PDF con el comando')}* *${usedPrefix + command}*\n\n` +
              `• 📌 *${toSmallCaps('Función:')}* ¡Convierte cada página del PDF en imágenes JPG de un álbum!\n` +
              `• *${toSmallCaps('Ejemplo:')}* Responde a un documento .pdf con \`${usedPrefix + command}\``;
          return reply(help);
      }

      await reply(`⏳ *${toSmallCaps('Extrayendo las páginas del PDF como imágenes, un momento...')}*`);

      const id = Date.now() + '_' + Math.random().toString(36).substring(7);
      const tempPdfPath = path.join('/tmp', `pdf_${id}.pdf`);
      const outputPrefix = path.join('/tmp', `page_${id}_%d.jpg`);

      try {
          const pdfBuffer = await extractMediaBuffer(qmsg, client);
          if (!pdfBuffer) {
              return reply(`❌ *${toSmallCaps('Gagal mengunduh dokumen PDF!')}*`);
          }

          fs.writeFileSync(tempPdfPath, pdfBuffer);

          const gsCmd = `gs -dNOPAUSE -dBATCH -sDEVICE=jpeg -r150 -sOutputFile="${outputPrefix}" "${tempPdfPath}"`;

          await new Promise((resolve, reject) => {
              exec(gsCmd, (err, stdout, stderr) => {
                  if (err) return reject(new Error(stderr || err.message));
                  resolve(stdout);
              });
          });

          const files = fs.readdirSync('/tmp')
              .filter(f => f.startsWith(`page_${id}_`) && f.endsWith('.jpg'))
              .sort((a, b) => {
                  const numA = parseInt(a.replace(`page_${id}_`, '').replace('.jpg', ''), 10);
                  const numB = parseInt(b.replace(`page_${id}_`, '').replace('.jpg', ''), 10);
                  return numA - numB;
              });

          if (!files.length) {
              if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
              return reply(`❌ *${toSmallCaps('¡No se pudo extraer ninguna página del PDF!')}*`);
          }

          const totalPages = files.length;
          const pageBuffers = files.map(f => {
              const filePath = path.join('/tmp', f);
              const buf = fs.readFileSync(filePath);
              if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
              return buf;
          });

          if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);

          let caption = `🖼️ *${toSmallCaps('Hasil Ekstrak PDF ke Album')}*\n\n` +
              `• 📑 *${toSmallCaps('Total Halaman:')}* ${totalPages} Halaman\n\n` +
              `꒰ © ${global.namebot} ꒱`;

          if (pageBuffers.length > 1) {
              try {
                  const albumMsg = await client.sendMessage(m.chat, {
                      album: {
                          expectedImageCount: pageBuffers.length,
                          expectedVideoCount: 0
                      }
                  }, { quoted: m });

                  for (let i = 0; i < pageBuffers.length; i++) {
                      let pageCaption = `🖼️ *${toSmallCaps('Halaman')} ${i + 1} / ${totalPages}*\n\n꒰ © ${global.namebot} ꒱`;
                      await client.sendMessage(m.chat, {
                          image: pageBuffers[i],
                          caption: i === 0 ? caption.trim() : pageCaption,
                          albumParentKey: albumMsg?.key
                      });
                  }
              } catch (err) {
                  console.warn('[PDF2IMG ALBUM FALLBACK]', err);
                  for (let i = 0; i < pageBuffers.length; i++) {
                      let pageCaption = `🖼️ *${toSmallCaps('Halaman')} ${i + 1} / ${totalPages}*\n\n꒰ © ${global.namebot} ꒱`;
                      await client.sendMessage(m.chat, {
                          image: pageBuffers[i],
                          caption: i === 0 ? caption.trim() : pageCaption
                      }, { quoted: m });
                  }
              }
          } else {
              await client.sendMessage(m.chat, {
                  image: pageBuffers[0],
                  caption: caption.trim()
              }, { quoted: m });
          }
      } catch (e) {
          console.error('[PDF2IMG ERROR]', e);
          if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
          reply(`❌ *${toSmallCaps('Terjadi kesalahan saat mengekstrak PDF:')}* ${e.message}`);
      }
  };

  handler.category = 'tools';

export { pluginConfig as config, handler }
