/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { jidDecode } from "@rexxhayanasi/elaina-baileys";

const pluginConfig = {
  name: "spr",
  alias: [],
  category: "owner",
  description: "Kirim pesan personal ke anggota grup (maks 100, tiap orang dapat sapaan namanya sendiri)",
  usage: ".spr <pesan, pakai @user untuk menyebut nama penerima>",
  example: ".spr Halo @user, ada info penting untukmu",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

const MAKS_TARGET = 100;
const TEKS_DEFAULT = "Hola @user, tienes un mensaje.";
const BATAS_DEVICE_MS = 9000;

const nomorDari = (jid) => {
  try {
    return jidDecode(jid)?.user || String(jid).split("@")[0].split(":")[0];
  } catch {
    return String(jid).split("@")[0].split(":")[0];
  }
};

const normalisasi = (jid) => {
  const n = nomorDari(jid);
  return n ? `${n}${String(jid).includes("@lid") ? "@lid" : "@s.whatsapp.net"}` : "";
};

// Fungsi enkripsi level rendah tidak selalu diekspor semua fork Baileys, jadi dimuat saat dipakai
async function muatAlatEnkripsi() {
  const lib = await import("@rexxhayanasi/elaina-baileys");
  if (typeof lib.encodeWAMessage !== "function" || typeof lib.encodeSignedDeviceIdentity !== "function") {
    return null;
  }
  return { encodeWAMessage: lib.encodeWAMessage, encodeSignedDeviceIdentity: lib.encodeSignedDeviceIdentity };
}

async function denganBatas(promise, ms, nilai) {
  let timer;
  const habis = new Promise((resolve) => {
    timer = setTimeout(() => resolve(nilai), ms);
    timer.unref?.();
  });
  try {
    return await Promise.race([promise, habis]);
  } finally {
    clearTimeout(timer);
  }
}

// Anggota grup (selain bot sendiri), superadmin dan admin didahulukan
async function ambilTarget(sock, groupJid) {
  const meta = await sock.groupMetadata(groupJid);
  const saya = new Set(
    [sock.user?.id, sock.user?.lid, sock.authState?.creds?.me?.id, sock.authState?.creds?.me?.lid]
      .filter(Boolean)
      .map(nomorDari),
  );
  const urutan = (p) => (p.admin === "superadmin" ? 0 : p.admin === "admin" ? 1 : 2);
  const target = (meta.participants || [])
    .filter((p) => p?.id && !saya.has(nomorDari(p.id)))
    .sort((a, b) => urutan(a) - urutan(b))
    .slice(0, MAKS_TARGET);
  return { meta, target };
}

async function cariDevice(sock, jids) {
  let devices = [];
  try {
    if (sock.getUSyncDevices) devices = (await sock.getUSyncDevices(jids, true, false)) || [];
  } catch {}
  if (!devices.length) devices = jids.map((jid) => ({ jid }));
  return devices.filter(
    (d) => d?.jid && !d.jid.endsWith("@hosted.lid") && jidDecode(d.jid)?.device !== 99,
  );
}

async function cariDeviceAman(sock, jids) {
  const cadangan = jids.map((jid) => ({ jid }));
  try {
    const hasil = await denganBatas(cariDevice(sock, jids), BATAS_DEVICE_MS, null);
    return hasil?.length ? hasil : cadangan;
  } catch {
    return cadangan;
  }
}

const pesanTeks = (text, mentions = []) => ({
  extendedTextMessage: {
    text,
    contextInfo: mentions.length ? { mentionedJid: mentions } : {},
  },
});

// Kirim satu stanza grup: ciphertext publik (skmsg) + ciphertext terpisah untuk tiap device penerima
async function kirimStanza(sock, alat, groupJid, meta, { teksPublik, perDevice }) {
  const { encodeWAMessage, encodeSignedDeviceIdentity } = alat;
  const meId = sock.authState?.creds?.me?.lid || sock.user?.id;
  const modeLid = meta?.addressingMode === "lid";
  let butuhIdentitas = false;

  const nodes = (
    await Promise.all(
      perDevice.map(async ({ jid, message }) => {
        try {
          const { type, ciphertext } = await sock.signalRepository.encryptMessage({
            jid,
            data: encodeWAMessage(message),
          });
          if (type === "pkmsg") butuhIdentitas = true;
          return {
            tag: "to",
            attrs: { jid },
            content: [{ tag: "enc", attrs: { v: "2", type }, content: ciphertext }],
          };
        } catch {
          return null;
        }
      }),
    )
  ).filter(Boolean);

  if (!nodes.length) return { ok: false, error: "Error al cifrar a todos los destinatarios. Inténtalo de nuevo." };

  const isi = [];
  if (teksPublik != null) {
    const enc = await sock.signalRepository.encryptGroupMessage({
      group: groupJid,
      meId,
      data: encodeWAMessage({ extendedTextMessage: { text: teksPublik, contextInfo: { mentionedJid: [] } } }),
    });
    if (enc?.ciphertext) isi.push({ tag: "enc", attrs: { v: "2", type: "skmsg" }, content: enc.ciphertext });
  }
  isi.push({ tag: "participants", attrs: {}, content: nodes });
  if (butuhIdentitas && sock.authState?.creds?.account) {
    isi.push({
      tag: "device-identity",
      attrs: {},
      content: encodeSignedDeviceIdentity(sock.authState.creds.account, true),
    });
  }

  await sock.query({
    tag: "message",
    attrs: { to: groupJid, type: "text", ...(modeLid ? { addressing_mode: "lid" } : {}) },
    content: isi,
  });
  return { ok: true, count: nodes.length };
}

async function handler(m, { sock, text }) {
  let reaksi = false;
  let sukses = false;
  try {
    if (!m.isGroup) return m.reply("Este comando solo se puede usar en grupos.");

    if (
      typeof sock?.query !== "function" ||
      !sock.signalRepository?.encryptMessage ||
      !sock.signalRepository?.encryptGroupMessage
    ) {
      return m.reply("La API de cifrado interna de Baileys no está disponible en esta versión.");
    }
    const alat = await muatAlatEnkripsi();
    if (!alat) return m.reply("La versión instalada de Baileys no incluye encodeWAMessage / encodeSignedDeviceIdentity.");

    await sock.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });
    reaksi = true;

    const template = String(text || "").trim() || TEKS_DEFAULT;
    const { meta, target } = await ambilTarget(sock, m.chat);
    if (!target.length) return m.reply("No hay miembros del grupo que puedan ser objetivo.");

    const devices = await cariDeviceAman(sock, target.map((p) => p.id));
    const semuaMention = [
      ...new Set(target.map((p) => (String(p.id).endsWith("@lid") ? p.id : normalisasi(p.id))).filter(Boolean)),
    ];

    const hasil = await kirimStanza(sock, alat, m.chat, meta, {
      teksPublik: template.replace(/@user/gi, "todos"),
      perDevice: devices.map((d) => ({
        jid: d.jid,
        message: pesanTeks(template.replace(/@user/gi, `@${nomorDari(d.jid)}`), semuaMention),
      })),
    });
    if (!hasil.ok) return m.reply(hasil.error);

    await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    sukses = true;
  } catch (e) {
    console.error("[spr]", e);
    try {
      await m.reply(`❌ Error: ${e?.message || e}`);
    } catch {}
  } finally {
    if (reaksi && !sukses) {
      try {
        await sock.sendMessage(m.chat, { react: { text: "", key: m.key } });
      } catch {}
    }
  }
}

export { pluginConfig as config, handler };
