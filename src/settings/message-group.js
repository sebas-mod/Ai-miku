/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Sección de config: message-group
export default {
  groupProtection: {
    antilink: "⚠ *Antilink* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkKick: "⚠ *Antilink* — @%user% fue expulsado por enviar un enlace.",
    antilinkGc: "⚠ *Antilink WA* — @%user% envió un enlace de WA.\nMensaje eliminado.",
    antilinkGcKick:
      "⚠ *Antilink WA* — @%user% fue expulsado por enviar un enlace de WA.",
    antilinkAll: "⚠ *Antilink* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkAllKick: "⚠ *Antilink* — @%user% fue expulsado por enviar un enlace.",
    antitagsw: "⚠ *AntiTagSW* — Se eliminó una mención de estado de @%user%.",
    antiviewonce: "👁️ *ViewOnce* — De @%user%",
    antiremove: "🗑️ *AntiDelete* — @%user% eliminó un mensaje:",
    antiswgc: "⚠ *AntiSWGC* — No se permite el estado de grupo @%user%",
    antihidetag: "⚠ *AntiHidetag* — Se eliminó un hidetag de @%user%.",
    antitoxicWarn:
      "⚠ @%user% habló con groserías.\nAdvertencia %warn% de %max%, la próxima infracción puede terminar en %method%.",
    antitoxicAction: "🚫 @%user% recibió %method% por tóxico. (%warn%/%max%)",
    antidocument: "⚠ *AntiDocument* — Se eliminó un documento de @%user%.",
    antisticker: "⚠ *AntiSticker* — Se eliminó un sticker de @%user%.",
    antimedia: "⚠ *AntiMedia* — Se eliminó un archivo multimedia de @%user%.",
    antibot: "🤖 *AntiBot* — @%user% fue detectado como bot y expulsado.",
    notAdmin: "El bot no es admin, no puede eliminar mensajes.",
  }
};
