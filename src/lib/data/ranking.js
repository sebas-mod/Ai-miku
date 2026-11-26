/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Kumpulkan data ranking (level, EXP, uang, energi) dari database utama + database RPG global.
import { getDatabase } from "./database.js";
import { calculateLevel } from "./level.js";

export const jidDigits = (jid) => String(jid || "").split("@")[0].split(":")[0].replace(/\D/g, "");

export function collectRankingUsers(db = getDatabase()) {
  const main = db.getAllUsers?.() || db.data?.users || db.db?.data?.users || {};
  const rpg = global.db?.data?.users || {};
  const map = new Map();

  const add = (jid, u = {}, r = {}) => {
    if (!jid || String(jid).includes("@g.us")) return;
    const id = jidDigits(jid);
    if (!id || id.length > 15) return;

    const exp = Math.max(Number(u.exp) || 0, Number(u.rpg?.exp) || 0, Number(r.exp) || 0);
    const koin = Math.max(Number(u.koin) || 0, Number(r.money) || 0);
    const bank = Math.max(Number(u.rpg?.bank) || 0, Number(r.bank) || 0);
    const energi = Math.max(0, Number(u.energi) || 0);
    const name = u.regName || u.name || r.name || "";

    const prev = map.get(id);
    if (prev) {
      prev.exp = Math.max(prev.exp, exp);
      prev.koin = Math.max(prev.koin, koin);
      prev.bank = Math.max(prev.bank, bank);
      prev.energi = Math.max(prev.energi, energi);
      if (!prev.name && name) prev.name = name;
      return;
    }
    map.set(id, { id, jid: `${id}@s.whatsapp.net`, name, exp, koin, bank, energi });
  };

  for (const [jid, u] of Object.entries(main)) add(jid, u, rpg[jid] || {});
  for (const [jid, r] of Object.entries(rpg)) if (!map.has(jidDigits(jid))) add(jid, {}, r);

  return [...map.values()].map((u) => ({
    ...u,
    name: u.name || u.id,
    level: calculateLevel(u.exp),
    total: u.koin + u.bank,
  }));
}
