/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";
import config from "../../../config.js";

// Basis URL penyedia API. Bisa ditimpa lewat config.apiBase = { azbry: "https://..." }
const BASES = {
  azbry: "https://api.azbry.com",
};

function provider(name) {
  const base = () => (config.apiBase?.[name] || BASES[name]).replace(/\/+$/, "");
  const call = (path, opts = {}, responseType) =>
    axios.get(`${base()}${path}`, { timeout: 30000, ...opts, responseType });
  return {
    base,
    get: async (path, opts) => (await call(path, opts, "json")).data,
    buffer: async (path, opts) => Buffer.from((await call(path, opts, "arraybuffer")).data),
  };
}

const vemzoApi = {
  azbry: provider("azbry"),
};

export default vemzoApi;
