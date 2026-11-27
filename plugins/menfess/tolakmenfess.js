/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { cfg, store, saveStore, numOf } from "../../src/lib/features/menfess.js";

const pluginConfig = {
  name: "tolakmenfess",
  alias: [],
  category: "menfess",
  description: "Rechaza todos los menfess o vuelve a abrirlos",
  usage: ".tolakmenfess",
  example: ".tolakmenfess",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const c = cfg();
  const k = store();
  if (!c.on) return m.reply("La función menfess está actualmente desactivada.");
  const me = numOf(m.sender);
  const aktif = !k.menfessBlock[me];
  if (aktif) k.menfessBlock[me] = true;
  else delete k.menfessBlock[me];
  saveStore();
  return m.reply(
    aktif
      ? "Vale, no recibirás más menfess.\nEscriba el mismo comando para volver a abrirlo."
      : "Menfess porque abriste de nuevo~",
  );
}

export { pluginConfig as config, handler };
