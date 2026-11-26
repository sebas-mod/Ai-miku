/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Sección de config: thumbnail
export default {
  thumbUrl: {
    // Miniatura pequeña por tipo de mensaje (por separado)
    small: "https://c.termai.cc/i149/k04E.jpg",
    quoted: "https://cdn.zass.in/18A4SvJByc.jpeg",
    location: "https://cdn.zass.in/SBvmXjmkpm.jpeg",
    fakeQuoted: "https://cdn.zass.in/RTyaBEBhMk.jpeg",
    reply: "https://cdn.zass.in/RTyaBEBhMk.jpeg",
    sewa: "https://cdn.zass.in/EpCuKc2M6T.jpeg",
    ppKosong: "https://cdn.zass.in/Mek743AGot.jpeg",

    // Imagen del menú (cada una por separado, allmenu no usa small)
    menu: "https://c.termai.cc/i126/Orm.jpg",
    allmenu: "https://c.termai.cc/i180/C21.jpg",

    // Imagen de bienvenida al grupo
    welcome: "https://cdn.zass.in/P0bAQ7HRMv.jpg",
    goodbye: "https://cdn.zass.in/17Ly3jWUph.jpeg",

    // Imagen de registro
    daftar: "https://cdn.zass.in/P3Q2YXg8u3.jpeg",
  },

  // Fondo del canvas = archivo jpg local (sin URL). Solo reemplaza el jpg por uno con el mismo nombre y tamaño.
  thumbFile: {
    levelup: "src/assets/thumbs/levelup.jpg",
    boostexp: "src/assets/thumbs/boostexp.jpg",
    leaderboard: "src/assets/thumbs/leaderboard.jpg",
    toplevel: "src/assets/thumbs/toplevel.jpg",
    ranklist: "src/assets/thumbs/ranklist.jpg",
  },

  // Tamaño (px) del fondo del canvas. Cualquier jpg se recorta automáticamente en modo "cover" a este tamaño,
  // pero lo mejor es crear el jpg con exactamente el tamaño indicado abajo.
  thumbSize: {
    levelup: { width: 1200, height: 630 }, // tarjeta horizontal: avatar + número de nivel
    boostexp: { width: 1200, height: 630 }, // tarjeta horizontal: avatar + EXP obtenido
    leaderboard: { width: 1080, height: 1560 }, // vertical: cabecera + 10 filas de ranking de dinero
    toplevel: { width: 1080, height: 1560 }, // vertical: cabecera + 10 filas de ranking de nivel
    ranklist: { width: 1200, height: 1500 }, // vertical: cabecera + cuadrícula 3 x 7 de rangos
  },
};
