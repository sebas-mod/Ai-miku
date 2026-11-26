/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import apikey from "./apikey.js";
import messageGroup from "./message-group.js";
import message from "./message.js";
import payment from "./payment.js";
import pterodactyl from "./pterodactyl.js";
import thumbnail from "./thumbnail.js";

// Digabung ke config.js lewat spread
export default {
  ...apikey,
  ...messageGroup,
  ...message,
  ...payment,
  ...pterodactyl,
  ...thumbnail,
};
