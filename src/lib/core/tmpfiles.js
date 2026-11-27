/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";
import FormData from "form-data";

/**
 * Upload buffer ke 0x0.st dan kembalikan tautan langsungnya.
 * @returns {Promise<{ url: string, directUrl: string, directLink: string }>}
 */
export async function uploadTo0x0(buffer, { filename = "file.bin", contentType = "application/octet-stream" } = {}) {
  const form = new FormData();
  form.append("file", buffer, { filename, contentType });
  const res = await axios.post("https://0x0.st", form, {
    headers: { ...form.getHeaders(), "User-Agent": "AiMiku/1.0 (WhatsApp bot)" },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 60000,
  });
  const url = String(res.data || "").trim();
  if (!/^https?:\/\//i.test(url)) throw new Error("Falló la subida a 0x0.st");
  return { url, directUrl: url, directLink: url };
}

export default { uploadTo0x0 };
