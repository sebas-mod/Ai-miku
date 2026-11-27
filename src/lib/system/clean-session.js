/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Bersihkan sesi chat tanpa logout. Hentikan bot dulu, lalu jalankan: npm run clean-session
import { cleanSessionFiles } from "./session-backup.js";

const { found, files, failed, mode } = cleanSessionFiles();

if (!found) {
  console.log("No se encontró la carpeta de sesión.");
} else {
  console.log(
    `Listo: ${files} sesiones/claves eliminadas${failed ? ` (${failed} no se pudieron borrar)` : ""} [modo ${mode}]. creds.json y el resto de claves quedan intactos.`,
  );
  console.log("Vuelve a iniciar el bot. La sesión se recrea sola cuando llega un mensaje (los primeros mensajes pueden demorar).");
}
process.exit(0);
