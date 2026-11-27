/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import {
  cfg, store, saveStore, userData, numOf, same, toJid, wibDay,
  menfessNomor, menfessId, menfessRapikan, menfessIsi, menfessBatas,
  menfessCatat, menfessPetakan, menfessFooter, menfessBiaya, menfessBayar,
} from "../../src/lib/features/menfess.js";

const pluginConfig = {
  name: "menfess",
  alias: [],
  category: "menfess",
  description: "Kirim pesan anonim ke nomor lain (chat pribadi bot)",
  usage: ".menfess nomor|pesan",
  example: ".menfess 6281234567890|hai, kamu keren banget hari ini!",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, text, prefix }) {
  const c = cfg();
  const k = store();
  if (!c.on) return m.reply("La función menfess está actualmente desactivada.");
  if (m.isGroup) return m.reply("Menfess solo se puede enviar a través del chat privado bot para que tu identidad esté segura, OK~");

  const user = userData(m.sender);
  const raw = String(text || "").trim();
  let kiri, pesan;
  if (raw.includes("|")) {
    const [a, ...b] = raw.split("|");
    kiri = a;
    pesan = b.join("|").trim();
  } else {
    const mt = raw.match(/^(\S+)\s+([\s\S]+)$/);
    kiri = mt?.[1];
    pesan = mt?.[2]?.trim();
  }

  const tujuan = menfessNomor(kiri);
  if (!tujuan || !pesan) {
    return m.reply(
      `*MENFESS ANONIM* 💌\n\n¡Envía mensajes anónimos!\n\nFormato:\n*${prefix}menfess número|mensaje*\n\nEjemplo:\n${prefix}menfess 6281234567890|Hola, ¡estás genial hoy!\n\nOrden máxima ${c.maxPanjang} caracteres, sin enlaces ni números de teléfono.\nLos destinatarios pueden responder de forma anónima simplemente *responder* el mensaje.\n\nOtro: *${prefix}menfessku* (bandeja de entrada y cuota), *${prefix}samaranmenfess* (seudónimo)`,
    );
  }
  if (tujuan.length < 9 || tujuan.length > 15) return m.reply("El número de destino no es válido. Utilice el formato 628xxx o 08xxx.");

  const salah = menfessIsi(pesan, c);
  if (salah) return m.reply(salah);

  const ban = k.menfessBan[numOf(m.sender)];
  if (ban) return m.reply("🚫 Tiene prohibido utilizar menfess." + (ban.alasan ? `\nAlasan: ${ban.alasan}` : ""));

  if (tujuan === numOf(m.sender)) return m.reply("🍡 Es hora de enviarte menfess a ti mismo~");

  const batas = menfessBatas(user, c);
  if (batas) return m.reply(batas);

  const cek = await sock.onWhatsApp(`${tujuan}@s.whatsapp.net`).catch(() => null);
  if (cek && !cek[0]?.exists) return m.reply("El número no aparece en WhatsApp.");
  const jidTujuan = cek?.[0]?.jid || `${tujuan}@s.whatsapp.net`;
  const kunciTujuan = numOf(jidTujuan);

  if (
    k.menfessBlock[tujuan] || k.menfessBlock[kunciTujuan] ||
    k.menfessPair[`${tujuan}|${numOf(m.sender)}`] || k.menfessPair[`${kunciTujuan}|${numOf(m.sender)}`]
  ) {
    return m.reply("El destinatario no recibe menfess.");
  }

  // batas per tujuan per hari (anti-spam ke satu orang)
  const hari = wibDay();
  const keDia = Object.values(k.menfess).filter(
    (d) => same(d.from, m.sender) && numOf(d.to) === kunciTujuan && wibDay(d.t) === hari,
  ).length;
  if (keDia >= c.maxPerTujuan) return m.reply(`has enviado ${c.maxPerTujuan} menfess a ese número hoy. Inténtalo de nuevo mañana, ¿vale?`);

  // bayar energi (non-premium)
  const { biaya, bayar, kurang } = menfessBiaya(m, c);
  if (kurang) return m.reply(`Tu energía se está acabando. Menfess necesidad ${biaya} energía.`);

  const id = menfessId(k);
  const nama = user?.menfessNama || "Seseorang";
  let sent;
  try {
    sent = await sock.sendMessage(toJid(jidTujuan), {
      text: `💌 *MENFESS* · #${id}\n\nRecibiste un mensaje anónimo de *${nama}*:\n\n“${pesan}”\n\n${menfessFooter(prefix, id)}`,
    });
  } catch {
    return m.reply("No se pudo enviar, no se puede contactar al destinatario.");
  }

  const now = Date.now();
  k.menfess[id] = {
    from: toJid(m.sender),
    to: toJid(jidTujuan),
    t: now,
    last: now,
    pesan,
    log: [{ by: "a", t: now, pesan }],
    kirim: sent?.key?.id ? [sent.key.id] : [],
  };
  menfessPetakan(k, sent?.key?.id, id);
  menfessRapikan(k);
  saveStore();
  menfessCatat(user, "kirim");
  if (bayar) menfessBayar(m, biaya);

  await m.reply(
    `✅ Menfess enviado de forma anónima a ${tujuan}!\n🆔 ID: *${id}*${bayar ? `\n🎫 -${biaya} energi` : ""}\n\nSi respondes, la respuesta irá a este chat. Responde a la respuesta para seguir chateando.\nMensaje de extracción: *${prefix}tarikmenfess ${id}*`,
  );
}

export { pluginConfig as config, handler };
