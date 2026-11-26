/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: "savekontak",
    alias: ["sv", "svkontak"],
    category: "owner",
    description: "Menyimpan kontak dari grup menjadi file VCF",
    usage: ".savekontak <nombre>",
    example: ".savekontak Fulan",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
};

async function handler(m, { sock, args }) {
    if (args[0] === "get") {
        const target = args[1];
        const baseName = args.slice(2).join(" ") || "User";

        const chats = await sock.groupFetchAllParticipating();
        let groups = [];
        if (target === "all") {
            groups = Object.values(chats);
        } else {
            if (chats[target]) {
                groups.push(chats[target]);
            } else {
                return m.reply("❌ Grupo no encontrado.");
            }
        }

        if (groups.length === 0) {
            return m.reply("❌ El bot no está en ningún grupo.");
        }

        m.reply(`⏳ Extrayendo contactos de ${groups.length} grupos...`);

        let vcards = "";
        let count = 0;
        let index = 1;
        const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const contactArray = [];

        for (const group of groups) {
            for (const participant of group.participants) {
                if (participant.id === botId) continue;

                const number = participant.id.split("@")[0];
                const name = `${baseName} ${index}`;
                const singleVcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;

                vcards += singleVcard + "\n";
                contactArray.push({ vcard: singleVcard });
                count++;
                index++;
            }
        }

        if (count === 0) {
            return m.reply("❌ No hay contactos que extraer.");
        }

        await sock.sendMessage(m.chat, {
            document: Buffer.from(vcards, "utf8"),
            fileName: `${baseName}_${count}_Kontak.vcf`,
            mimetype: "text/vcard",
            caption: `✅ *Se extrajeron ${count} contactos al archivo VCF.*`
        }, { quoted: m });

        await sock.sendMessage(m.chat, {
            contacts: {
                displayName: `${count} Kontak`,
                contacts: contactArray
            }
        }, { quoted: m });

        return;
    }

    const baseName = args.join(" ") || "User";
    const chats = await sock.groupFetchAllParticipating();
    const groupList = Object.values(chats);

    if (groupList.length === 0) {
        return m.reply("❌ El bot no está en ningún grupo.");
    }

    const sections = [
        {
            title: "Lista de grupos",
            rows: groupList.map(g => ({
                header: "",
                title: g.subject,
                description: `Anggota: ${g.participants?.length || 0}`,
                id: `${m.prefix}savekontak get ${g.id} ${baseName}`
            }))
        }
    ];

    await sock.sendMessage(m.chat, {
        text: `📇 *SISTEMA DE GUARDADO DE CONTACTOS (VCF)*\n\n` +
            `Sistema de extracción automática de contactos de los grupos donde está el bot.\n` +
            `Nombre base: *${baseName}*\n\n` +
            `*USO:*\n` +
            `• *${m.prefix || "."}savekontak <nombre>* — Guarda con un nombre personalizado\n` +
            `• *${m.prefix || "."}savekontak* — Guarda con el nombre por defecto "User"\n\n` +
            `*EXPLICACIÓN DEL PROCESO:*\n` +
            `1. Elige un grupo concreto en el botón *Elegir grupo* de abajo, o pulsa *Todos los grupos* para extraer los contactos globalmente.\n` +
            `2. El bot recopilará los números de los participantes e ignorará su propio número.\n` +
            `3. El resultado se enviará como documento (*.vcf*) junto con una lista de contactos de WhatsApp para guardarlos directamente.`,
        footer: "Powered by ReviewBot",
        interactiveButtons: [
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Elegir grupo",
                    sections
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Todos los grupos",
                    id: `${m.prefix}savekontak get all ${baseName}`
                })
            }
        ]
    }, { quoted: m });
}

export { pluginConfig as config, handler };
