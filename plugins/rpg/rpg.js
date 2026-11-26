/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import fs from 'fs'

const flatByNumber = ElysiaRuntime.flatByNumber;

const pluginConfig = {
    name: "rpg",
    alias: [],
    category: "rpg",
    description: "dungeon",
    usage: ".dungeon",
    example: ".dungeon",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const dg = () => { const d = (global.db.dungeon ||= { users: {}, world: null }); d.users ||= {}; return d }
  const saveRpgDb = () => { global.db.dungeon = dg() }
  const copy = (o) => JSON.parse(JSON.stringify(o))
  const DUNGEON_SIZE = 10
  const MAX_HEALTH = 100
  const BASE_DAMAGE = 5
  const BASE_DEFENSE = 0
  const HELP_RADIUS = 3
  const KNOCK_DOWN_TURNS = 3

  const MONSTERS = {
    '🐺': { name: 'Serigala', hp: 20, damage: 5, reward: 50, xp: 10 },
    '🦇': { name: 'Kelelawar Vampir', hp: 15, damage: 3, reward: 30, xp: 8 },
    '🐲': { name: 'Naga Kecil', hp: 50, damage: 10, reward: 200, xp: 25 },
    '👹': { name: 'Goblin', hp: 25, damage: 7, reward: 70, xp: 15 },
    '🕷️': { name: 'Laba-laba Raksasa', hp: 18, damage: 6, reward: 45, xp: 12 },
    '💀': { name: 'Skeleton', hp: 22, damage: 6, reward: 60, xp: 14 },
    '🧟': { name: 'Zombie', hp: 30, damage: 4, reward: 65, xp: 16 }
  }

  const BOSSES = {
    '🐉': { name: 'Naga Kuno', hp: 200, damage: 15, reward: 1000, xp: 100 },
    '👿': { name: 'Demon Lord', hp: 250, damage: 20, reward: 1500, xp: 150 },
    '💀': { name: 'Lich King', hp: 300, damage: 25, reward: 2000, xp: 200 },
    '🧙‍♂️': { name: 'Dark Wizard', hp: 180, damage: 30, reward: 1200, xp: 120 }
  }

  const ITEMS = {
    '🗡️': { name: 'Pedang Tajam', type: 'weapon', damage: 5, value: 150 },
    '🔪': { name: 'Belati', type: 'weapon', damage: 3, value: 80 },
    '🪓': { name: 'Kapak', type: 'weapon', damage: 7, value: 200 },
    '⚔️': { name: 'Pedang Legendaris', type: 'weapon', damage: 15, value: 1000 },
    '🏹': { name: 'Busur Elf', type: 'weapon', damage: 10, value: 500 },
    '🛡️': { name: 'Perisai', type: 'armor', defense: 3, value: 120 },
    '🧥': { name: 'Jubah Kulit', type: 'armor', defense: 2, value: 90 },
    '⛑️': { name: 'Helm Besi', type: 'armor', defense: 4, value: 140 },
    '🥼': { name: 'Baju Zirah', type: 'armor', defense: 8, value: 400 },
    '👑': { name: 'Mahkota Pelindung', type: 'armor', defense: 12, value: 800 },
    '🧪': { name: 'Ramuan Penyembuh', type: 'potion', heal: 30, value: 50 },
    '🍖': { name: 'Daging', type: 'food', heal: 15, value: 25 },
    '': { name: 'Apel Ajaib', type: 'food', heal: 50, value: 100 },
    '📜': { name: 'Gulungan Kebangkitan', type: 'revival', value: 300 }
  }

  const TREASURES = {
    '💰': { name: 'Kantong Emas', value: 100 },
    '💎': { name: 'Permata', value: 300 },
    '👑': { name: 'Mahkota', value: 500 },
    '📜': { name: 'Gulungan Kuno', value: 250 },
    '🏆': { name: 'Piala Emas', value: 800 },
    '💍': { name: 'Cincin Kekuasaan', value: 1000 }
  }

  const DIRECTIONS = ['north', 'east', 'south', 'west']
  const DIRECTION_EMOJI = {
    'north': '⬆️',
    'east': '➡️',
    'south': '⬇️',
    'west': '⬅️'
  }

  const ROOM_TYPES = ['monster', 'treasure', 'empty', 'item', 'boss']
  const ROOM_WEIGHTS = [0.35, 0.25, 0.25, 0.1, 0.05]

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function loadDungeon() {
    if (!dg().world) {
      dg().world = {
        map: generateDungeon(),
        players: {}
      }
      saveRpgDb()
    }
    return copy(dg().world)
  }

  function saveDungeon(data) {
    dg().world = data
    saveRpgDb()
  }

  async function handler(m, { conn, args, command, text }) {
    let users = loadUsers()
    const sender = m.sender.split('@')[0]

    if (!users[sender]) {
      users[sender] = {
        balance: 0,
        dungeons: {}
      }
      saveUsers(users)
    }

    if (!users[sender].dungeons) {
      users[sender].dungeons = {}
      saveUsers(users)
    }

    let dungeonData = loadDungeon()

    try {
      const subCommand = args[0]?.toLowerCase()

      if (subCommand === 'start') {
        if (users[sender].dungeons.active) {
          return m.reply(`⚠️ Kamu sudah berada dalam dungeon! Gunakan .dungeon exit untuk keluar.`)
        }

        const username = args[1]
        if (!username) {
          return m.reply(`⚠️ Masukkan username untuk karakter kamu! Contoh: .dungeon start HeroKu`)
        }

        users[sender].dungeons = {
          active: true,
          username: username,
          position: { x: 0, y: 0 },
          health: MAX_HEALTH,
          maxHealth: MAX_HEALTH,
          level: users[sender].dungeons.level || 1,
          xp: users[sender].dungeons.xp || 0,
          xpToNextLevel: users[sender].dungeons.xpToNextLevel || 100,
          gold: 0,
          inventory: users[sender].dungeons.inventory || [],
          equippedWeapon: users[sender].dungeons.equippedWeapon || null,
          equippedArmor: users[sender].dungeons.equippedArmor || null,
          visitedRooms: { '0,0': true },
          knockedDown: false,
          knockDownTurns: 0
        }

        dungeonData.players[sender] = {
          username: username,
          position: { x: 0, y: 0 },
          health: MAX_HEALTH,
          maxHealth: MAX_HEALTH,
          level: users[sender].dungeons.level
        }

        saveUsers(users)
        saveDungeon(dungeonData)

        const currentRoom = dungeonData.map[0][0]
        users[sender].dungeons.currentRoom = currentRoom

        await conn.sendMessage(m.chat, {
          text: `🧭 *DUNGEON CRAWLER MULTIPLAYER* 🧭\n\n` +
                `Selamat datang, ${username}!\n` +
                `Kamu memasuki dungeon yang gelap dan berbahaya...\n` +
                `Gunakan .dungeon move [arah] untuk bergerak.\n` +
                `Gunakan .dungeon help untuk bantuan.\n\n` +
                describeRoom(users[sender].dungeons, dungeonData, sender)
        })

        await notifyPlayersInSameRoom(conn, sender, dungeonData, `🔔 *PLAYER BARU!* 🔔\n\n${username} memasuki dungeon dan berada di ruangan yang sama denganmu!`)

        return
      }

      if (!users[sender].dungeons.active) {
        return m.reply(`⚠️ Kamu belum memulai petualangan! Gunakan .dungeon start [username] untuk memulai.`)
      }

      if (users[sender].dungeons.knockedDown) {
        if (subCommand !== 'use' && subCommand !== 'status' && subCommand !== 'inventory' && subCommand !== 'help' && subCommand !== 'chat') {
          return m.reply(`⚠️ Kamu sedang tergeletak tak berdaya! Gunakan ramuan penyembuh atau tunggu bantuan. ${users[sender].dungeons.knockDownTurns} giliran tersisa sebelum mati.`)
        }
      }

      if (subCommand === 'chat') {
        const message = args.slice(1).join(' ')

        if (!message) {
          return m.reply(`⚠️ Masukkan pesan yang ingin disampaikan! Contoh: .dungeon chat Halo semua!`)
        }

        const dungeon = users[sender].dungeons

        const playersInRoom = getPlayersInSameRoom(sender, dungeonData)

        if (playersInRoom.length === 0) {
          return m.reply(`⚠️ Tidak ada pemain lain di ruangan ini untuk diajak chat.`)
        }

        for (const player of playersInRoom) {
          try {
            await conn.sendMessage(player.id + '@s.whatsapp.net', {
              text: `💬 *CHAT DARI ${dungeon.username}* 💬\n\n` +
                    `"${message}"\n\n` +
                    `Lokasi: (${dungeon.position.x}, ${dungeon.position.y})\n` +
                    `Balas dengan .dungeon chat [pesan] untuk membalas.`
            })
          } catch (error) {
            console.error('Error sending chat message:', error)
          }
        }

        await conn.sendMessage(m.chat, {
          text: `💬 Pesan kamu telah dikirim ke ${playersInRoom.length} pemain di ruangan ini.`
        })

        return
      }

      if (subCommand === 'move') {
        const direction = args[1]?.toLowerCase()

        if (!direction || !DIRECTIONS.includes(direction)) {
          return m.reply(`⚠️ Arah tidak valid! Gunakan: north, east, south, atau west.`)
        }

        const { x, y } = users[sender].dungeons.position
        let newX = x
        let newY = y

        switch (direction) {
          case 'north': newY = Math.max(0, y - 1); break
          case 'south': newY = Math.min(DUNGEON_SIZE - 1, y + 1); break
          case 'west': newX = Math.max(0, x - 1); break
          case 'east': newX = Math.min(DUNGEON_SIZE - 1, x + 1); break
        }

        if (newX === x && newY === y) {
          return m.reply(`🧱 Kamu menabrak dinding! Tidak bisa bergerak ke arah ${direction}.`)
        }

        users[sender].dungeons.position = { x: newX, y: newY }
        dungeonData.players[sender].position = { x: newX, y: newY }

        users[sender].dungeons.visitedRooms[`${newX},${newY}`] = true

        users[sender].dungeons.currentRoom = dungeonData.map[newY][newX]

        saveUsers(users)
        saveDungeon(dungeonData)

        await conn.sendMessage(m.chat, {
          text: `${DIRECTION_EMOJI[direction]} Kamu bergerak ke ${direction}.\n\n` +
                describeRoom(users[sender].dungeons, dungeonData, sender)
        })

        await notifyPlayersInSameRoom(conn, sender, dungeonData, `🔔 *PLAYER BARU DI RUANGAN!* 🔔\n\n${users[sender].dungeons.username} memasuki ruangan ini!\n\nGunakan .dungeon chat [pesan] untuk mengobrol dengannya.`)

        return
      }

      if (subCommand === 'attack') {
        const dungeon = users[sender].dungeons
        const room = dungeon.currentRoom

        if ((room.type !== 'monster' && room.type !== 'boss') || room.cleared) {
          return m.reply(`⚠️ Tidak ada monster untuk diserang di ruangan ini!`)
        }

        const weaponDamage = dungeon.equippedWeapon ? ITEMS[dungeon.equippedWeapon].damage : 0
        const playerDamage = BASE_DAMAGE + weaponDamage

        const target = room.type === 'boss' ? room.boss : room.monster

        target.hp -= playerDamage

        if (target.hp <= 0) {
          room.cleared = true
          dungeon.gold += target.reward

          dungeon.xp += target.xp

          if (dungeon.xp >= dungeon.xpToNextLevel) {
            dungeon.level += 1
            dungeonData.players[sender].level = dungeon.level
            dungeon.xp -= dungeon.xpToNextLevel
            dungeon.xpToNextLevel = Math.floor(dungeon.xpToNextLevel * 1.5)
            dungeon.maxHealth += 10
            dungeon.health = dungeon.maxHealth
            dungeonData.players[sender].maxHealth = dungeon.maxHealth
            dungeonData.players[sender].health = dungeon.health

            await conn.sendMessage(m.chat, {
              text: `🎉 *LEVEL UP!* 🎉\n\n` +
                    `Kamu naik ke level ${dungeon.level}!\n` +
                    `Max HP +10\n` +
                    `HP dipulihkan sepenuhnya!`
            })
          }

          saveUsers(users)
          saveDungeon(dungeonData)

          if (room.type === 'boss') {
            await conn.sendMessage(m.chat, {
              text: `⚔️ Kamu menyerang ${target.emoji} ${target.name} dan menyebabkan ${playerDamage} damage!\n\n` +
                    `🎯 *BOSS DIKALAHKAN!* 🎯\n` +
                    `${target.emoji} ${target.name} telah dikalahkan!\n` +
                    `💰 Mendapatkan ${target.reward} gold\n` +
                    `Mendapatkan ${target.xp} XP\n\n` +
                    describeRoom(dungeon, dungeonData, sender)
            })

            for (const playerId in dungeonData.players) {
              if (playerId !== sender) {
                try {
                  await conn.sendMessage(playerId + '@s.whatsapp.net', {
                    text: `*KABAR DUNGEON*\n\n` +
                          `${dungeon.username} telah mengalahkan boss ${target.emoji} ${target.name}!`
                  })
                } catch (error) {
                  console.error('Error sending notification:', error)
                }
              }
            }
          } else {
            await conn.sendMessage(m.chat, {
              text: `⚔️ Kamu menyerang ${target.emoji} ${target.name} dan menyebabkan ${playerDamage} damage!\n\n` +
                    `🎯 ${target.emoji} ${target.name} dikalahkan!\n` +
                    `💰 Mendapatkan ${target.reward} gold\n` +
                    `Mendapatkan ${target.xp} XP\n\n` +
                    describeRoom(dungeon, dungeonData, sender)
            })
          }

          return
        }

        const armorDefense = dungeon.equippedArmor ? ITEMS[dungeon.equippedArmor].defense : 0
        const monsterDamage = Math.max(1, target.damage - BASE_DEFENSE - armorDefense)

        dungeon.health -= monsterDamage
        dungeonData.players[sender].health = dungeon.health

        if (dungeon.health <= 0) {
          dungeon.knockedDown = true
          dungeon.knockDownTurns = KNOCK_DOWN_TURNS
          dungeonData.players[sender].knockedDown = true

          saveUsers(users)
          saveDungeon(dungeonData)

          await conn.sendMessage(m.chat, {
            text: `⚔️ Kamu menyerang ${target.emoji} ${target.name} dan menyebabkan ${playerDamage} damage!\n\n` +
                  `💥 ${target.emoji} ${target.name} menyerangmu dan menyebabkan ${monsterDamage} damage!\n\n` +
                  `💀 *KAMU TERGELETAK TAK BERDAYA!* 💀\n` +
                  `Kamu memiliki ${KNOCK_DOWN_TURNS} giliran untuk menggunakan ramuan penyembuh atau mendapat bantuan sebelum mati.\n` +
                  `Gunakan .dungeon tolong untuk memanggil bantuan dari pemain lain!`
          })

          return
        }

        saveUsers(users)
        saveDungeon(dungeonData)

        await conn.sendMessage(m.chat, {
          text: `⚔️ Kamu menyerang ${target.emoji} ${target.name} dan menyebabkan ${playerDamage} damage!\n\n` +
                `💥 ${target.emoji} ${target.name} menyerangmu dan menyebabkan ${monsterDamage} damage!\n\n` +
                `${target.emoji} HP: ${target.hp}\n` +
                `❤️ HP Kamu: ${dungeon.health}/${dungeon.maxHealth}`
        })

        return
      }

      if (subCommand === 'take') {
        const dungeon = users[sender].dungeons
        const room = dungeon.currentRoom

        if ((room.type !== 'treasure' && room.type !== 'item') || room.cleared) {
          return m.reply(`⚠️ Tidak ada yang bisa diambil di ruangan ini!`)
        }

        if (room.type === 'treasure') {
          dungeon.gold += room.treasure.value
          room.cleared = true

          saveUsers(users)
          saveDungeon(dungeonData)

          await conn.sendMessage(m.chat, {
            text: `💰 Kamu mengambil ${room.treasure.emoji} ${room.treasure.name}!\n` +
                  `Mendapatkan ${room.treasure.value} gold.\n\n` +
                  describeRoom(dungeon, dungeonData, sender)
          })

          return
        } else if (room.type === 'item') {
          dungeon.inventory.push(room.item.emoji)
          room.cleared = true

          saveUsers(users)
          saveDungeon(dungeonData)

          await conn.sendMessage(m.chat, {
            text: `🎒 Kamu mengambil ${room.item.emoji} ${room.item.name}!\n\n` +
                  describeRoom(dungeon, dungeonData, sender)
          })

          return
        }
      }

      if (subCommand === 'use') {
        const itemEmoji = args[1]

        if (!itemEmoji) {
          return m.reply(`⚠️ Tentukan item yang ingin digunakan! Contoh: .dungeon use 🧪`)
        }

        const dungeon = users[sender].dungeons

        const itemIndex = dungeon.inventory.indexOf(itemEmoji)

        if (itemIndex === -1) {
          return m.reply(`⚠️ Kamu tidak memiliki item ${itemEmoji} dalam inventory!`)
        }

        if (!ITEMS[itemEmoji]) {
          return m.reply(`⚠️ Item ${itemEmoji} tidak dikenali!`)
        }

        const item = ITEMS[itemEmoji]

        if (item.type === 'potion' || item.type === 'food') {
          const healAmount = item.heal

          dungeon.inventory.splice(itemIndex, 1)

          dungeon.health = Math.min(dungeon.maxHealth, dungeon.health + healAmount)
          dungeonData.players[sender].health = dungeon.health

          if (dungeon.knockedDown && dungeon.health > 0) {
            dungeon.knockedDown = false
            dungeon.knockDownTurns = 0
            dungeonData.players[sender].knockedDown = false
          }

          saveUsers(users)
          saveDungeon(dungeonData)

          await conn.sendMessage(m.chat, {
            text: `🧪 Kamu menggunakan ${itemEmoji} ${item.name}.\n` +
                  `❤️ HP dipulihkan sebanyak ${healAmount}.\n` +
                  `❤️ HP Kamu: ${dungeon.health}/${dungeon.maxHealth}` +
                  (dungeon.knockedDown ? "" : "\n\n✅ Kamu berhasil bangkit kembali!")
          })

          return
        } else if (item.type === 'revival') {
          if (!dungeon.knockedDown) {
            return m.reply(`⚠️ Item ${itemEmoji} ${item.name} hanya bisa digunakan saat tergeletak tak berdaya!`)
          }

          dungeon.inventory.splice(itemIndex, 1)

          dungeon.health = Math.floor(dungeon.maxHealth * 0.5)
          dungeon.knockedDown = false
          dungeon.knockDownTurns = 0
          dungeonData.players[sender].health = dungeon.health
          dungeonData.players[sender].knockedDown = false

          saveUsers(users)
          saveDungeon(dungeonData)

          await conn.sendMessage(m.chat, {
            text: `📜 Kamu menggunakan ${itemEmoji} ${item.name}.\n` +
                  `Kekuatan magis menyelimutimu dan memulihkan hidupmu!\n` +
                  `❤️ HP dipulihkan menjadi ${dungeon.health}/${dungeon.maxHealth}\n\n` +
                  `✅ Kamu berhasil bangkit kembali!`
          })

          return
        } else {
          return m.reply(`⚠️ Item ${itemEmoji} tidak bisa digunakan! Hanya potion, makanan, dan gulungan kebangkitan yang bisa digunakan.`)
        }
      }

      if (subCommand === 'equip') {
        const itemEmoji = args[1]

        if (!itemEmoji) {
          return m.reply(`⚠️ Tentukan item yang ingin diequip! Contoh: .dungeon equip 🗡️`)
        }

        const dungeon = users[sender].dungeons

        const itemIndex = dungeon.inventory.indexOf(itemEmoji)

        if (itemIndex === -1) {
          return m.reply(`⚠️ Kamu tidak memiliki item ${itemEmoji} dalam inventory!`)
        }

        if (!ITEMS[itemEmoji] || (ITEMS[itemEmoji].type !== 'weapon' && ITEMS[itemEmoji].type !== 'armor')) {
          return m.reply(`⚠️ Item ${itemEmoji} tidak bisa diequip! Hanya senjata dan armor yang bisa diequip.`)
        }

        const item = ITEMS[itemEmoji]

        if (item.type === 'weapon') {
          if (dungeon.equippedWeapon) {
            dungeon.inventory.push(dungeon.equippedWeapon)
          }

          dungeon.equippedWeapon = itemEmoji
        } else if (item.type === 'armor') {
          if (dungeon.equippedArmor) {
            dungeon.inventory.push(dungeon.equippedArmor)
          }

          dungeon.equippedArmor = itemEmoji
        }

        dungeon.inventory.splice(itemIndex, 1)

        saveUsers(users)

        await conn.sendMessage(m.chat, {
          text: `🎽 Kamu mengequip ${itemEmoji} ${item.name}.\n\n` +
                `${item.type === 'weapon' ? `⚔️ Damage +${item.damage}` : `🛡️ Defense +${item.defense}`}`
        })

        return
      }

      if (subCommand === 'inventory' || subCommand === 'inv') {
        const dungeon = users[sender].dungeons

        const itemCounts = {}
        dungeon.inventory.forEach(item => {
          itemCounts[item] = (itemCounts[item] || 0) + 1
        })

        let inventoryText = `🎒 *INVENTORY* 🎒\n\n`

        if (Object.keys(itemCounts).length === 0) {
          inventoryText += `Inventory kosong.\n`
        } else {
          for (const [emoji, count] of Object.entries(itemCounts)) {
            const item = ITEMS[emoji]
            if (!item) continue

            inventoryText += `${emoji} ${item.name} (${count}x)\n`

            if (item.type === 'weapon') {
              inventoryText += `   ⚔️ Damage +${item.damage}\n`
            } else if (item.type === 'armor') {
              inventoryText += `   🛡️ Defense +${item.defense}\n`
            } else if (item.type === 'potion' || item.type === 'food') {
              inventoryText += `   ❤️ Heal +${item.heal}\n`
            } else if (item.type === 'revival') {
              inventoryText += `   🔄 Efek: Kebangkitan\n`
            }

            inventoryText += `   💰 Nilai: ${item.value} gold\n`
          }
        }

        inventoryText += `\n⚔️ *EQUIPPED* ⚔️\n`

        if (dungeon.equippedWeapon) {
          const weapon = ITEMS[dungeon.equippedWeapon]
          inventoryText += `Senjata: ${dungeon.equippedWeapon} ${weapon.name} (+${weapon.damage} damage)\n`
        } else {
          inventoryText += `Senjata: -\n`
        }

        if (dungeon.equippedArmor) {
          const armor = ITEMS[dungeon.equippedArmor]
          inventoryText += `Armor: ${dungeon.equippedArmor} ${armor.name} (+${armor.defense} defense)\n`
        } else {
          inventoryText += `Armor: -\n`
        }

        inventoryText += `\n💰 Gold: ${dungeon.gold}`

        await conn.sendMessage(m.chat, { text: inventoryText })

        return
      }

      if (subCommand === 'status' || subCommand === 'stat') {
        const dungeon = users[sender].dungeons

        const statusText = `📊 *STATUS* 📊\n\n` +
                           `👤 Username: ${dungeon.username}\n` +
                           `❤️ HP: ${dungeon.health}/${dungeon.maxHealth}\n` +
                           `⭐ Level: ${dungeon.level}\n` +
                           `XP: ${dungeon.xp}/${dungeon.xpToNextLevel}\n` +
                           `💰 Gold: ${dungeon.gold}\n\n` +
                           `⚔️ Base Damage: ${BASE_DAMAGE}\n` +
                           `🛡️ Base Defense: ${BASE_DEFENSE}\n\n` +
                           `🗺️ Posisi: (${dungeon.position.x}, ${dungeon.position.y})\n` +
                           `🔍 Ruangan yang ditemukan: ${Object.keys(dungeon.visitedRooms).length}/${DUNGEON_SIZE * DUNGEON_SIZE}` +
                           (dungeon.knockedDown ? `\n\n⚠️ Status: Tergeletak (${dungeon.knockDownTurns} giliran tersisa)` : "")

        await conn.sendMessage(m.chat, { text: statusText })

        return
      }

      if (subCommand === 'map') {
        const dungeon = users[sender].dungeons

        let mapText = `🗺️ *PETA DUNGEON* 🗺️\n\n`

        for (let y = 0; y < DUNGEON_SIZE; y++) {
          let row = ''
          for (let x = 0; x < DUNGEON_SIZE; x++) {
            const isCurrentPos = dungeon.position.x === x && dungeon.position.y === y
            const isVisited = dungeon.visitedRooms[`${x},${y}`]

            let otherPlayersHere = false
            for (const playerId in dungeonData.players) {
              if (playerId !== sender &&
                  dungeonData.players[playerId].position.x === x &&
                  dungeonData.players[playerId].position.y === y) {
                otherPlayersHere = true
                break
              }
            }

            if (isCurrentPos) {
              row += '🟢'
            } else if (otherPlayersHere && isVisited) {
              row += '🔵'
            } else if (isVisited) {
              const room = dungeonData.map[y][x]
              if (room.cleared) {
                row += '⬜'
              } else {
                switch (room.type) {
                  case 'monster': row += '🔴'; break
                  case 'boss': row += '🟣'; break
                  case 'treasure': row += '🟡'; break
                  case 'item': row += '🟠'; break
                  case 'empty': row += '⚪'; break
                }
              }
            } else {
              row += '⬛'
            }
          }
          mapText += row + '\n'
        }

        mapText += `\n🟢 Posisi kamu\n` +
                   `🔵 Pemain lain\n` +
                   `🔴 Monster\n` +
                   `🟣 Boss\n` +
                   `🟡 Harta karun\n` +
                   `🟠 Item\n` +
                   `⚪ Ruangan kosong\n` +
                   `⬜ Ruangan yang sudah dibersihkan\n` +
                   `⬛ Belum dijelajahi`

        await conn.sendMessage(m.chat, { text: mapText })

        return
      }

      if (subCommand === 'tolong') {
        const dungeon = users[sender].dungeons

        let helpSent = false

        for (const playerId in dungeonData.players) {
          if (playerId === sender) continue

          const otherPlayer = dungeonData.players[playerId]
          const distance = Math.abs(otherPlayer.position.x - dungeon.position.x) +
                           Math.abs(otherPlayer.position.y - dungeon.position.y)

          if (distance <= HELP_RADIUS) {
            helpSent = true

            try {
              await conn.sendMessage(playerId + '@s.whatsapp.net', {
                text: `🆘 *PANGGILAN BANTUAN!* 🆘\n\n` +
                      `${dungeon.username} membutuhkan bantuan!\n` +
                      `Posisi: (${dungeon.position.x}, ${dungeon.position.y})\n` +
                      `Jarak dari posisimu: ${distance} langkah\n\n` +
                      `Gunakan .dungeon help-player ${sender} untuk membantunya.`
              })
            } catch (error) {
              console.error('Error sending help message:', error)
            }
          }
        }

        if (helpSent) {
          await conn.sendMessage(m.chat, {
            text: `🆘 Kamu berteriak meminta bantuan!\n` +
                  `Pesan bantuan telah dikirim ke pemain yang berada dalam radius ${HELP_RADIUS} langkah.`
          })
        } else {
          await conn.sendMessage(m.chat, {
            text: `🆘 Kamu berteriak meminta bantuan!\n` +
                  `Sayangnya tidak ada pemain lain dalam radius ${HELP_RADIUS} langkah.`
          })
        }

        return
      }

      if (subCommand === 'help-player') {
        const targetId = args[1]

        if (!targetId) {
          return m.reply(`⚠️ Tentukan ID pemain yang ingin dibantu! Contoh: .dungeon help-player 123456789`)
        }

        if (!dungeonData.players[targetId] || !dungeonData.players[targetId].knockedDown) {
          return m.reply(`⚠️ Pemain tersebut tidak ditemukan atau tidak membutuhkan bantuan!`)
        }

        const dungeon = users[sender].dungeons
        const targetPos = dungeonData.players[targetId].position

        if (dungeon.position.x !== targetPos.x || dungeon.position.y !== targetPos.y) {
          return m.reply(`⚠️ Kamu harus berada di ruangan yang sama dengan pemain tersebut untuk membantunya!`)
        }

        try {
          let targetUsers = loadUsers()

          if (!targetUsers[targetId] || !targetUsers[targetId].dungeons || !targetUsers[targetId].dungeons.active) {
            return m.reply(`⚠️ Pemain tersebut tidak ditemukan atau tidak aktif!`)
          }

          targetUsers[targetId].dungeons.health = Math.floor(targetUsers[targetId].dungeons.maxHealth * 0.3)
          targetUsers[targetId].dungeons.knockedDown = false
          targetUsers[targetId].dungeons.knockDownTurns = 0

          dungeonData.players[targetId].health = targetUsers[targetId].dungeons.health
          dungeonData.players[targetId].knockedDown = false

          saveUsers(targetUsers)
          saveDungeon(dungeonData)

          try {
            await conn.sendMessage(targetId + '@s.whatsapp.net', {
              text: `*BANTUAN DATANG!*\n\n` +
                    `${dungeon.username} telah membantumu bangkit kembali!\n` +
                    `❤️ HP dipulihkan menjadi ${targetUsers[targetId].dungeons.health}/${targetUsers[targetId].dungeons.maxHealth}`
            })
          } catch (error) {
            console.error('Error sending notification to target:', error)
          }

          await conn.sendMessage(m.chat, {
            text: `Kamu membantu ${dungeonData.players[targetId].username} bangkit kembali!\n` +
                  `Mereka berterima kasih atas bantuanmu.`
          })
        } catch (error) {
          console.error('Error helping player:', error)
          return m.reply(`⚠️ Terjadi kesalahan saat membantu pemain tersebut!`)
        }

        return
      }

      if (subCommand === 'transfer') {
        const targetId = args[1]
        const amount = parseInt(args[2])

        if (!targetId || isNaN(amount) || amount <= 0) {
          return m.reply(`⚠️ Format tidak valid! Gunakan: .dungeon transfer [id_player] [jumlah]`)
        }

        if (!dungeonData.players[targetId]) {
          return m.reply(`⚠️ Pemain tersebut tidak ditemukan!`)
        }

        const dungeon = users[sender].dungeons
        const targetPos = dungeonData.players[targetId].position

        if (dungeon.position.x !== targetPos.x || dungeon.position.y !== targetPos.y) {
          return m.reply(`⚠️ Kamu harus berada di ruangan yang sama dengan pemain tersebut untuk transfer gold!`)
        }

        if (dungeon.gold < amount) {
          return m.reply(`⚠️ Gold tidak cukup! Gold kamu: ${dungeon.gold}`)
        }

        try {
          let targetUsers = loadUsers()

          if (!targetUsers[targetId] || !targetUsers[targetId].dungeons || !targetUsers[targetId].dungeons.active) {
            return m.reply(`⚠️ Pemain tersebut tidak ditemukan atau tidak aktif!`)
          }

          dungeon.gold -= amount
          targetUsers[targetId].dungeons.gold += amount

          saveUsers(users)
          saveUsers(targetUsers)

          try {
            await conn.sendMessage(targetId + '@s.whatsapp.net', {
              text: `💰 *TRANSFER GOLD* 💰\n\n` +
                    `${dungeon.username} mentransfer ${amount} gold kepadamu!\n` +
                    `Gold baru: ${targetUsers[targetId].dungeons.gold}`
            })
          } catch (error) {
            console.error('Error sending notification to target:', error)
          }

          await conn.sendMessage(m.chat, {
            text: `💰 Kamu mentransfer ${amount} gold kepada ${dungeonData.players[targetId].username}.\n` +
                  `Gold tersisa: ${dungeon.gold}`
          })
        } catch (error) {
          console.error('Error transferring gold:', error)
          return m.reply(`⚠️ Terjadi kesalahan saat transfer gold!`)
        }

        return
      }

      if (subCommand === 'trade') {
        const targetId = args[1]
        const itemEmoji = args[2]
        const requestedItemEmoji = args[3]

        if (!targetId || !itemEmoji) {
          return m.reply(`⚠️ Format tidak valid! Gunakan: .dungeon trade [id_player] [emoji_item_kamu] [emoji_item_diminta]`)
        }

        if (!dungeonData.players[targetId]) {
          return m.reply(`⚠️ Pemain tersebut tidak ditemukan!`)
        }

        const dungeon = users[sender].dungeons
        const targetPos = dungeonData.players[targetId].position

        if (dungeon.position.x !== targetPos.x || dungeon.position.y !== targetPos.y) {
          return m.reply(`⚠️ Kamu harus berada di ruangan yang sama dengan pemain tersebut untuk barter!`)
        }

        const itemIndex = dungeon.inventory.indexOf(itemEmoji)
        if (itemIndex === -1) {
          return m.reply(`⚠️ Kamu tidak memiliki item ${itemEmoji} dalam inventory!`)
        }

        try {
          let targetUsers = loadUsers()

          if (!targetUsers[targetId] || !targetUsers[targetId].dungeons || !targetUsers[targetId].dungeons.active) {
            return m.reply(`⚠️ Pemain tersebut tidak ditemukan atau tidak aktif!`)
          }

          if (!requestedItemEmoji) {
            dungeon.inventory.splice(itemIndex, 1)

            targetUsers[targetId].dungeons.inventory.push(itemEmoji)

            saveUsers(users)
            saveUsers(targetUsers)

            try {
              await conn.sendMessage(targetId + '@s.whatsapp.net', {
                text: `🎁 *HADIAH ITEM* 🎁\n\n` +
                      `${dungeon.username} memberikan ${itemEmoji} ${ITEMS[itemEmoji]?.name || 'Item'} kepadamu!`
              })
            } catch (error) {
              console.error('Error sending notification to target:', error)
            }

            await conn.sendMessage(m.chat, {
              text: `🎁 Kamu memberikan ${itemEmoji} ${ITEMS[itemEmoji]?.name || 'Item'} kepada ${dungeonData.players[targetId].username}.`
            })

            return
          }

          const targetItemIndex = targetUsers[targetId].dungeons.inventory.indexOf(requestedItemEmoji)
          if (targetItemIndex === -1) {
            return m.reply(`⚠️ Pemain tersebut tidak memiliki item ${requestedItemEmoji} dalam inventory!`)
          }

          try {
            await conn.sendMessage(targetId + '@s.whatsapp.net', {
              text: `🔄 *PERMINTAAN BARTER* 🔄\n\n` +
                    `${dungeon.username} ingin menukar:\n` +
                    `- ${itemEmoji} ${ITEMS[itemEmoji]?.name || 'Item'}\n\n` +
                    `Dengan item kamu:\n` +
                    `- ${requestedItemEmoji} ${ITEMS[requestedItemEmoji]?.name || 'Item'}\n\n` +
                    `Gunakan .dungeon accept-trade ${sender} ${requestedItemEmoji} ${itemEmoji} untuk menerima barter.`
            })
          } catch (error) {
            console.error('Error sending trade request:', error)
            return m.reply(`⚠️ Terjadi kesalahan saat mengirim permintaan barter!`)
          }

          await conn.sendMessage(m.chat, {
            text: `🔄 Permintaan barter telah dikirim kepada ${dungeonData.players[targetId].username}.\n` +
                  `Menunggu konfirmasi...`
          })
        } catch (error) {
          console.error('Error trading item:', error)
          return m.reply(`⚠️ Terjadi kesalahan saat barter!`)
        }

        return
      }

      if (subCommand === 'accept-trade') {
        const targetId = args[1]
        const myItemEmoji = args[2]
        const theirItemEmoji = args[3]

        if (!targetId || !myItemEmoji || !theirItemEmoji) {
          return m.reply(`⚠️ Format tidak valid! Gunakan: .dungeon accept-trade [id_player] [emoji_item_kamu] [emoji_item_mereka]`)
        }

        if (!dungeonData.players[targetId]) {
          return m.reply(`⚠️ Pemain tersebut tidak ditemukan!`)
        }

        const dungeon = users[sender].dungeons
        const targetPos = dungeonData.players[targetId].position

        if (dungeon.position.x !== targetPos.x || dungeon.position.y !== targetPos.y) {
          return m.reply(`⚠️ Kamu harus berada di ruangan yang sama dengan pemain tersebut untuk barter!`)
        }

        const itemIndex = dungeon.inventory.indexOf(myItemEmoji)
        if (itemIndex === -1) {
          return m.reply(`⚠️ Kamu tidak memiliki item ${myItemEmoji} dalam inventory!`)
        }

        try {
          let targetUsers = loadUsers()

          if (!targetUsers[targetId] || !targetUsers[targetId].dungeons || !targetUsers[targetId].dungeons.active) {
            return m.reply(`⚠️ Pemain tersebut tidak ditemukan atau tidak aktif!`)
          }

          const targetItemIndex = targetUsers[targetId].dungeons.inventory.indexOf(theirItemEmoji)
          if (targetItemIndex === -1) {
            return m.reply(`⚠️ Pemain tersebut tidak memiliki item ${theirItemEmoji} dalam inventory!`)
          }

          dungeon.inventory.splice(itemIndex, 1)
          dungeon.inventory.push(theirItemEmoji)

          targetUsers[targetId].dungeons.inventory.splice(targetItemIndex, 1)
          targetUsers[targetId].dungeons.inventory.push(myItemEmoji)

          saveUsers(users)
          saveUsers(targetUsers)

          try {
            await conn.sendMessage(targetId + '@s.whatsapp.net', {
              text: `🔄 *BARTER BERHASIL* 🔄\n\n` +
                    `${dungeon.username} menerima permintaan barter!\n\n` +
                    `Kamu mendapatkan:\n` +
                    `- ${myItemEmoji} ${ITEMS[myItemEmoji]?.name || 'Item'}\n\n` +
                    `Kamu memberikan:\n` +
                    `- ${theirItemEmoji} ${ITEMS[theirItemEmoji]?.name || 'Item'}`
            })
          } catch (error) {
            console.error('Error sending notification to target:', error)
          }

          await conn.sendMessage(m.chat, {
            text: `🔄 *BARTER BERHASIL* 🔄\n\n` +
                  `Kamu mendapatkan:\n` +
                  `- ${theirItemEmoji} ${ITEMS[theirItemEmoji]?.name || 'Item'}\n\n` +
                  `Kamu memberikan:\n` +
                  `- ${myItemEmoji} ${ITEMS[myItemEmoji]?.name || 'Item'}`
          })
        } catch (error) {
          console.error('Error accepting trade:', error)
          return m.reply(`⚠️ Terjadi kesalahan saat menerima barter!`)
        }

        return
      }

      if (subCommand === 'exit') {
        const dungeon = users[sender].dungeons

        users[sender].balance += dungeon.gold

        const inventory = dungeon.inventory
        const equippedWeapon = dungeon.equippedWeapon
        const equippedArmor = dungeon.equippedArmor
        const level = dungeon.level
        const xp = dungeon.xp
        const xpToNextLevel = dungeon.xpToNextLevel
        const username = dungeon.username

        delete dungeonData.players[sender]

        users[sender].dungeons = {
          active: false,
          username,
          inventory,
          equippedWeapon,
          equippedArmor,
          level,
          xp,
          xpToNextLevel
        }

        saveUsers(users)
        saveDungeon(dungeonData)

        await conn.sendMessage(m.chat, {
          text: `🚪 Kamu keluar dari dungeon.\n\n` +
                `💰 ${dungeon.gold} gold telah ditambahkan ke balance.\n` +
                `💰 Balance baru: ${users[sender].balance}\n\n` +
                `Gunakan .dungeon start ${username} untuk memulai petualangan baru.`
        })

        return
      }

      if (subCommand === 'help' || !subCommand) {
        const helpText = `🧭 *DUNGEON CRAWLER MULTIPLAYER HELP* 🧭\n\n` +
                         `*.dungeon start [username]* - Memulai petualangan baru\n` +
                         `*.dungeon move [arah]* - Bergerak (north/east/south/west)\n` +
                         `*.dungeon attack* - Menyerang monster\n` +
                         `*.dungeon take* - Mengambil harta/item\n` +
                         `*.dungeon use [emoji]* - Menggunakan potion/makanan\n` +
                         `*.dungeon equip [emoji]* - Mengequip senjata/armor\n` +
                         `*.dungeon inventory* - Melihat inventory\n` +
                         `*.dungeon status* - Melihat status karakter\n` +
                         `*.dungeon map* - Melihat peta dungeon\n` +
                         `*.dungeon chat [pesan]* - Mengirim pesan ke pemain di ruangan yang sama\n` +
                         `*.dungeon tolong* - Memanggil bantuan dari pemain terdekat\n` +
                         `*.dungeon help-player [id]* - Membantu pemain yang tergeletak\n` +
                         `*.dungeon transfer [id] [jumlah]* - Transfer gold ke pemain lain\n` +
                         `*.dungeon trade [id] [item] [item_diminta]* - Barter item dengan pemain lain\n` +
                         `*.dungeon exit* - Keluar dari dungeon\n\n` +
                         `Selamat berpetualang! 🗡️`

        await conn.sendMessage(m.chat, { text: helpText })

        return
      }

      return m.reply(`⚠️ Perintah tidak dikenal! Gunakan .dungeon help untuk bantuan.`)
    } catch (error) {
      console.error('Error in dungeon game:', error)
      m.reply('Terjadi error saat memproses perintah!')
    }
  }

  function getPlayersInSameRoom(senderId, dungeonData) {
    const senderPos = dungeonData.players[senderId].position
    const playersInRoom = []

    for (const playerId in dungeonData.players) {
      if (playerId === senderId) continue

      const playerPos = dungeonData.players[playerId].position

      if (playerPos.x === senderPos.x && playerPos.y === senderPos.y) {
        playersInRoom.push({
          id: playerId,
          username: dungeonData.players[playerId].username,
          knockedDown: dungeonData.players[playerId].knockedDown
        })
      }
    }

    return playersInRoom
  }

  function generateDungeon() {
    const dungeon = []

    for (let y = 0; y < DUNGEON_SIZE; y++) {
      const row = []
      for (let x = 0; x < DUNGEON_SIZE; x++) {
        if (x === 0 && y === 0) {
          row.push({
            type: 'empty',
            description: 'Ruangan kosong dengan pintu masuk dungeon.',
            cleared: true
          })
          continue
        }

        const rand = Math.random()
        let typeIndex = 0
        let cumulativeWeight = 0

        for (let i = 0; i < ROOM_WEIGHTS.length; i++) {
          cumulativeWeight += ROOM_WEIGHTS[i]
          if (rand < cumulativeWeight) {
            typeIndex = i
            break
          }
        }

        const roomType = ROOM_TYPES[typeIndex]

        let room = { type: roomType, cleared: false }

        switch (roomType) {
          case 'monster':
            const monsterKeys = Object.keys(MONSTERS)
            const monsterEmoji = monsterKeys[Math.floor(Math.random() * monsterKeys.length)]
            const monster = MONSTERS[monsterEmoji]

            room.monster = {
              emoji: monsterEmoji,
              name: monster.name,
              hp: monster.hp,
              damage: monster.damage,
              reward: monster.reward,
              xp: monster.xp
            }

            room.description = `Ruangan gelap dengan ${monsterEmoji} ${monster.name} yang menghadangmu!`
            break

          case 'boss':
            const bossKeys = Object.keys(BOSSES)
            const bossEmoji = bossKeys[Math.floor(Math.random() * bossKeys.length)]
            const boss = BOSSES[bossEmoji]

            room.boss = {
              emoji: bossEmoji,
              name: boss.name,
              hp: boss.hp,
              damage: boss.damage,
              reward: boss.reward,
              xp: boss.xp
            }

            room.description = `Ruangan besar dengan ${bossEmoji} ${boss.name} yang menunggu di tengah! Hawa kekuatan yang mengerikan terasa di udara.`
            break

          case 'treasure':
            const treasureKeys = Object.keys(TREASURES)
            const treasureEmoji = treasureKeys[Math.floor(Math.random() * treasureKeys.length)]
            const treasure = TREASURES[treasureEmoji]

            room.treasure = {
              emoji: treasureEmoji,
              name: treasure.name,
              value: treasure.value
            }

            room.description = `Ruangan dengan ${treasureEmoji} ${treasure.name} yang berkilauan!`
            break

          case 'item':
            const itemKeys = Object.keys(ITEMS)
            const itemEmoji = itemKeys[Math.floor(Math.random() * itemKeys.length)]
            const item = ITEMS[itemEmoji]

            room.item = {
              emoji: itemEmoji,
              name: item.name,
              ...item
            }

            room.description = `Ruangan dengan ${itemEmoji} ${item.name} tergeletak di lantai.`
            break

          case 'empty':
            const emptyDescriptions = [
              'Ruangan kosong dengan debu tebal di lantai.',
              'Ruangan kosong dengan tetesan air dari langit-langit.',
              'Ruangan kosong dengan bekas api unggun.',
              'Ruangan kosong dengan tulang-belulang berserakan.',
              'Ruangan kosong dengan ukiran aneh di dinding.'
            ]

            room.description = emptyDescriptions[Math.floor(Math.random() * emptyDescriptions.length)]
            break
        }

        row.push(room)
      }
      dungeon.push(row)
    }

    return dungeon
  }

  function describeRoom(dungeon, dungeonData, senderId) {
    const room = dungeon.currentRoom
    const { x, y } = dungeon.position

    let description = `🧭 *POSISI: (${x}, ${y})* 🧭\n\n`

    description += `${room.description}\n\n`

    let otherPlayers = []
    for (const playerId in dungeonData.players) {
      if (playerId !== senderId &&
          dungeonData.players[playerId].position.x === x &&
          dungeonData.players[playerId].position.y === y) {
        otherPlayers.push({
          id: playerId,
          username: dungeonData.players[playerId].username,
          knockedDown: dungeonData.players[playerId].knockedDown
        })
      }
    }

    if (otherPlayers.length > 0) {
      description += `👥 *PEMAIN LAIN DI RUANGAN INI:* 👥\n`
      for (const player of otherPlayers) {
        description += `- ${player.username}${player.knockedDown ? ' (Tergeletak!)' : ''}\n`
      }
      description += `\nGunakan .dungeon chat [pesan] untuk mengobrol dengan mereka.\n`
    }

    description += `🚶 *ARAH TERSEDIA:* 🚶\n`

    if (y > 0) description += `${DIRECTION_EMOJI.north} North\n`
    if (x < DUNGEON_SIZE - 1) description += `${DIRECTION_EMOJI.east} East\n`
    if (y < DUNGEON_SIZE - 1) description += `${DIRECTION_EMOJI.south} South\n`
    if (x > 0) description += `${DIRECTION_EMOJI.west} West\n`

    description += `\n`

    if (room.type === 'monster' && !room.cleared) {
      description += `⚔️ *MONSTER:* ${room.monster.emoji} ${room.monster.name}\n`
      description += `❤️ HP: ${room.monster.hp}\n`
      description += `💥 Damage: ${room.monster.damage}\n\n`
      description += `Gunakan .dungeon attack untuk menyerang!\n`
    } else if (room.type === 'boss' && !room.cleared) {
      description += `⚔️ *BOSS:* ${room.boss.emoji} ${room.boss.name}\n`
      description += `❤️ HP: ${room.boss.hp}\n`
      description += `💥 Damage: ${room.boss.damage}\n\n`
      description += `Gunakan .dungeon attack untuk menyerang!\n`
    } else if (room.type === 'treasure' && !room.cleared) {
      description += `💰 *HARTA KARUN:* ${room.treasure.emoji} ${room.treasure.name}\n`
      description += `💰 Nilai: ${room.treasure.value} gold\n\n`
      description += `Gunakan .dungeon take untuk mengambil!\n`
    } else if (room.type === 'item' && !room.cleared) {
      description += `🎒 *ITEM:* ${room.item.emoji} ${room.item.name}\n`

      if (room.item.type === 'weapon') {
        description += `⚔️ Damage: +${room.item.damage}\n`
      } else if (room.item.type === 'armor') {
        description += `🛡️ Defense: +${room.item.defense}\n`
      } else if (room.item.type === 'potion' || room.item.type === 'food') {
        description += `❤️ Heal: +${room.item.heal}\n`
      } else if (room.item.type === 'revival') {
        description += `🔄 Efek: Kebangkitan\n`
      }

      description += `💰 Nilai: ${room.item.value} gold\n\n`
      description += `Gunakan .dungeon take untuk mengambil!\n`
    }

    description += `\n📊 *STATUS:* 📊\n`
    description += `❤️ HP: ${dungeon.health}/${dungeon.maxHealth}\n`
    description += `⭐ Level: ${dungeon.level} (${dungeon.xp}/${dungeon.xpToNextLevel} XP)\n`
    description += `💰 Gold: ${dungeon.gold}\n`

    return description
  }

  async function notifyPlayersInSameRoom(conn, senderId, dungeonData, message) {
    const senderPos = dungeonData.players[senderId].position

    for (const playerId in dungeonData.players) {
      if (playerId === senderId) continue

      const playerPos = dungeonData.players[playerId].position

      if (playerPos.x === senderPos.x && playerPos.y === senderPos.y) {
        try {
          await conn.sendMessage(playerId + '@s.whatsapp.net', { text: message })
        } catch (error) {
          console.error('Error sending notification:', error)
        }
      }
    }
  }

  function loadUsers() {
    const data = copy(dg().users)
    for (const k of Object.keys(data)) {
      const flat = flatByNumber(k)
      if (!flat || !data[k] || typeof data[k] !== 'object') continue
      data[k].balance = Number(flat.money) || 0
      data[k]._bal0 = data[k].balance
    }
    return data
  }

  function saveUsers(data) {
    for (const k of Object.keys(data)) {
      const flat = flatByNumber(k)
      if (!flat || !data[k] || typeof data[k] !== 'object') continue
      const delta = (Number(data[k].balance) || 0) - (Number(data[k]._bal0) || 0)
      if (delta) flat.money = Math.max(0, (Number(flat.money) || 0) + delta)
      data[k].balance = Number(flat.money) || 0
      data[k]._bal0 = data[k].balance
    }
    dg().users = data
    saveRpgDb()
  }

export { pluginConfig as config, handler }
