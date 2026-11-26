/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (owner / premium / partner / banned)
// ═══════════════════════════════════════════════════════════════════════════
import { getDatabase } from "./lib/data/database.js";
import * as ownerPremiumDb from "./lib/data/premium-db.js";

// Diisi oleh config.js lewat attachHelpers(config)
let config = {};

function isOwner(number) {
  if (!number) return false;
  const cleanNumber = number.split(":")[0].replace(/[^0-9]/g, "");
  if (!cleanNumber) return false;

  if (config.bot?.number) {
    const botNum = config.bot.number.replace(/[^0-9]/g, "");
    if (
      botNum &&
      (cleanNumber.includes(botNum) || botNum.includes(cleanNumber))
    )
      return true;
  }

  try {
    const db = getDatabase();

    if (config.owner?.number) {
      const match = config.owner.number.some((own) => {
        const c = own.replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }

    if (db?.data && Array.isArray(db.data.owner)) {
      const match = db.data.owner.some((own) => {
        const c = String(own).replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }
    if (db) {
      const definedOwner = db.setting("ownerNumbers");
      if (Array.isArray(definedOwner)) {
        const match = definedOwner.some((own) => {
          const c = String(own).replace(/[^0-9]/g, "");
          return (
            c &&
            (cleanNumber === c ||
              cleanNumber.endsWith(c) ||
              c.endsWith(cleanNumber))
          );
        });
        if (match) return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function isPremium(number) {
  if (!number) return false;
  if (isOwner(number)) return true;
  if (isPartner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const premiumList = config.premiumUsers || [];

  const inConfig = premiumList.some((premium) => {
    if (!premium) return false;
    const cleanPremium = premium
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPremium ||
      cleanNumber.endsWith(cleanPremium) ||
      cleanPremium.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPremium(cleanNumber)) return true;
  } catch { }

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.premium)) {
      const now = Date.now();
      const foundIndex = db.data.premium.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.premium[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.premium.splice(foundIndex, 1);
          const jid = cleanNumber + "@s.whatsapp.net";
          const user = db.getUser(jid);
          if (user) {
            user.isPremium = false;
            db.setUser(jid, user);
          }
          db.save();
          return false;
        }
        return true;
      }
    }
    if (db) {
      const savedPremium = db.setting("premiumUsers") || [];
      const inDb = savedPremium.some((premium) => {
        if (!premium) return false;
        const cleanPremium = premium
          .split(":")[0]
          .split("@")[0]
          .replace(/[^0-9]/g, "");
        return (
          cleanNumber === cleanPremium ||
          cleanNumber.endsWith(cleanPremium) ||
          cleanPremium.endsWith(cleanNumber)
        );
      });
      if (inDb) return true;
    }
  } catch { }

  return false;
}

function isPartner(number) {
  if (!number) return false;
  if (isOwner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const partnerList = config.partnerUsers || [];

  const inConfig = partnerList.some((partner) => {
    if (!partner) return false;
    const cleanPartner = partner
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPartner ||
      cleanNumber.endsWith(cleanPartner) ||
      cleanPartner.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPartner(cleanNumber)) return true;
  } catch { }

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.partner)) {
      const now = Date.now();
      const foundIndex = db.data.partner.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.partner[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.partner.splice(foundIndex, 1);
          db.save();
          return false;
        }
        return true;
      }
    }
  } catch { }

  return false;
}

function isBanned(number) {
  if (!number) return false;
  if (isOwner(number)) return false;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");

  let bannedList = [];
  try {
    const db = getDatabase();
    if (db) {
      bannedList = db.setting("bannedUsers") || [];
      config.bannedUsers = bannedList;
    }
  } catch { }

  return bannedList.some((banned) => {
    const cleanBanned = String(banned)
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanBanned ||
      cleanNumber.endsWith(cleanBanned) ||
      cleanBanned.endsWith(cleanNumber)
    );
  });
}

function setBotNumber(number) {
  if (number) config.bot.number = number.replace(/[^0-9]/g, "");
}

function isSelf(number) {
  if (!number || !config.bot.number) return false;
  const cleanNumber = number.replace(/[^0-9]/g, "");
  const botNumber = config.bot.number.replace(/[^0-9]/g, "");
  return cleanNumber.includes(botNumber) || botNumber.includes(cleanNumber);
}

function getOwnerName(number) {
  if (!number) return config.owner?.name || "Owner";
  const cleanNumber = String(number).replace(/[^0-9]/g, "");
  try {
    const db = getDatabase();
    const nameMap = db.setting("ownerNames") || {};
    if (nameMap[cleanNumber]) return nameMap[cleanNumber];
  } catch { }
  if (config.owner?.number) {
    const isMainOwner = config.owner.number.some((own) => {
      const c = own.replace(/[^0-9]/g, "");
      return (
        c &&
        (cleanNumber === c ||
          cleanNumber.endsWith(c) ||
          c.endsWith(cleanNumber))
      );
    });
    if (isMainOwner) return config.owner?.name || "Owner";
  }
  return "Owner";
}

function attachHelpers(cfg) {
  config = cfg;
  cfg.isOwner = isOwner;
  cfg.isPremium = isPremium;
  cfg.isPartner = isPartner;
  cfg.isBanned = isBanned;
  cfg.setBotNumber = setBotNumber;
  cfg.isSelf = isSelf;
  cfg.getOwnerName = getOwnerName;
  return cfg;
}

export {
  attachHelpers,
  isOwner,
  isPartner,
  isPremium,
  isBanned,
  setBotNumber,
  isSelf,
  getOwnerName,
};
