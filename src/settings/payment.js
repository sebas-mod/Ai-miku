/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Sección de config: payment
export default {
  payment: {
    qrisUrl: "",
    methods: [
      { name: "Dana", number: "", holder: "" },
      { name: "GoPay", number: "", holder: "" },
      { name: "OVO", number: "", holder: "" },
      { name: "ShopeePay", number: "", holder: "" },
    ],
    banks: [],
    customText: "https://imgdrop.web.id/KodpV.webp",
  },

  donasi: {
    payment: [
      { name: "Dana", number: "6289677587355", holder: "arthazy" },
      { name: "GoPay", number: "08xxxxxxxxxx", holder: "Nombre" },
      { name: "OVO", number: "08xxxxxxxxxx", holder: "Nombre" },
    ],
    links: [
      { name: "Saweria", url: "saweria.co/username" },
      { name: "Trakteer", url: "trakteer.id/username" },
    ],
    benefits: [
      "Apoya el desarrollo",
      "Servidor más estable",
      "Funciones nuevas más rápido",
      "Soporte prioritario",
    ],
    qris: "https://imgdrop.web.id/KodpV.webp",
  }
};
