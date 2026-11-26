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
  if (!c.on) return m.reply("Fitur menfess sedang dimatikan.");
  if (m.isGroup) return m.reply("Menfess hanya bisa dikirim lewat chat pribadi bot supaya identitasmu aman ya~");

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
      `*MENFESS ANONIM* 💌\n\nKirim pesan tanpa nama!\n\nFormat:\n*${prefix}menfess nomor|pesan*\n\nContoh:\n${prefix}menfess 6281234567890|hai, kamu keren banget hari ini!\n\nPesan maks ${c.maxPanjang} karakter, tanpa link & nomor telepon.\nPenerima bisa membalas anonim cukup dengan *reply* pesannya.\n\nLainnya: *${prefix}menfessku* (kotak masuk & kuota), *${prefix}samaranmenfess* (nama samaran)`,
    );
  }
  if (tujuan.length < 9 || tujuan.length > 15) return m.reply("Nomor tujuan tidak valid. Pakai format 628xxx atau 08xxx.");

  const salah = menfessIsi(pesan, c);
  if (salah) return m.reply(salah);

  const ban = k.menfessBan[numOf(m.sender)];
  if (ban) return m.reply("🚫 Kamu dilarang memakai menfess." + (ban.alasan ? `\nAlasan: ${ban.alasan}` : ""));

  if (tujuan === numOf(m.sender)) return m.reply("🍡 Masa kirim menfess ke diri sendiri~");

  const batas = menfessBatas(user, c);
  if (batas) return m.reply(batas);

  const cek = await sock.onWhatsApp(`${tujuan}@s.whatsapp.net`).catch(() => null);
  if (cek && !cek[0]?.exists) return m.reply("Nomor itu tidak terdaftar di WhatsApp.");
  const jidTujuan = cek?.[0]?.jid || `${tujuan}@s.whatsapp.net`;
  const kunciTujuan = numOf(jidTujuan);

  if (
    k.menfessBlock[tujuan] || k.menfessBlock[kunciTujuan] ||
    k.menfessPair[`${tujuan}|${numOf(m.sender)}`] || k.menfessPair[`${kunciTujuan}|${numOf(m.sender)}`]
  ) {
    return m.reply("Penerima tidak menerima menfess.");
  }

  // batas per tujuan per hari (anti-spam ke satu orang)
  const hari = wibDay();
  const keDia = Object.values(k.menfess).filter(
    (d) => same(d.from, m.sender) && numOf(d.to) === kunciTujuan && wibDay(d.t) === hari,
  ).length;
  if (keDia >= c.maxPerTujuan) return m.reply(`Kamu sudah mengirim ${c.maxPerTujuan} menfess ke nomor itu hari ini. Coba lagi besok ya.`);

  // bayar energi (non-premium)
  const { biaya, bayar, kurang } = menfessBiaya(m, c);
  if (kurang) return m.reply(`Energi kamu habis. Menfess butuh ${biaya} energi.`);

  const id = menfessId(k);
  const nama = user?.menfessNama || "Seseorang";
  let sent;
  try {
    sent = await sock.sendMessage(toJid(jidTujuan), {
      text: `💌 *MENFESS* · #${id}\n\nKamu mendapat pesan anonim dari *${nama}*:\n\n“${pesan}”\n\n${menfessFooter(prefix, id)}`,
    });
  } catch {
    return m.reply("Gagal mengirim, penerima tidak bisa dihubungi.");
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
    `✅ Menfess terkirim secara anonim ke ${tujuan}!\n🆔 ID: *${id}*${bayar ? `\n🎫 -${biaya} energi` : ""}\n\nKalau dibalas, balasannya masuk ke chat ini. Reply balasan itu untuk lanjut ngobrol.\nTarik pesan: *${prefix}tarikmenfess ${id}*`,
  );
}

export { pluginConfig as config, handler };
