const CHARACTER_STORAGE_KEY = 'dreamgame.character';
const COMBAT_STYLES = ['accurate', 'aggressive', 'defensive', 'controlled'];
const RANGED_STYLES = ['accurate', 'rapid', 'longrange'];
const CHARACTER_SKILLS = [
  'attack',
  'strength',
  'defence',
  'hitpoints',
  'mining',
  'smithing',
  'woodcutting',
  'fletching',
  'fishing',
  'cooking',
  'ranged',
  'magic',
  'runecrafting',
  'prayer',
  'thieving',
  'agility',
];
const SAVE_STORAGE_KEY = 'dreamgame.save.v2';
let saveStore = null;

function loadSaveStore() {
  if (saveStore) return saveStore;
  const raw = localStorage.getItem(SAVE_STORAGE_KEY);
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.slots)) {
        saveStore = {
          version: 2,
          sharedBank: normalizeBank(parsed.sharedBank),
          slots: [parsed.slots[0] || null, parsed.slots[1] || null, parsed.slots[2] || null],
          activeSlot: [0, 1, 2].includes(parsed.activeSlot) ? parsed.activeSlot : null,
        };
        return saveStore;
      }
    } catch (cause) {
      // A corrupt v2 save falls through to a fresh store rather than crashing the boot.
    }
  }
  saveStore = { version: 2, sharedBank: [], slots: [null, null, null], activeSlot: null };
  const legacy = localStorage.getItem(CHARACTER_STORAGE_KEY);
  if (legacy !== null) {
    try {
      const legacyCharacter = JSON.parse(legacy);
      saveStore.sharedBank = normalizeBank(legacyCharacter.bank);
      const slotCharacter = { ...legacyCharacter };
      delete slotCharacter.bank;
      saveStore.slots[0] = slotCharacter;
      saveStore.activeSlot = 0;
      persistSaveStore();
      localStorage.removeItem(CHARACTER_STORAGE_KEY);
    } catch (cause) {
      // A corrupt legacy save is ignored; the player starts fresh.
    }
  }
  return saveStore;
}

function persistSaveStore() {
  localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveStore));
}

function createCharacter(name, raceId, classId) {
  const trimmedName = name.trim();
  const race = RACES[raceId];
  const characterClass = CLASSES[classId];
  if (!trimmedName) throw new Error('Enter a character name.');
  if (!race) throw new Error('Choose a valid race.');
  if (!characterClass) throw new Error('Choose a valid class.');

  const skills = Object.fromEntries(
    CHARACTER_SKILLS.map((skill) => [skill, { xp: 0 }]),
  );
  for (const startSkill of new Set([race.startSkill, characterClass.startSkill])) {
    if (startSkill) skills[startSkill] = { xp: xpForLevel(10) };
  }
  skills.hitpoints = { xp: xpForLevel(10) };

  return {
    name: trimmedName,
    raceId,
    classId,
    skills,
    inventory: [{ itemId: 'coins', qty: 25 }, ...Array(27).fill(null)],
    equipment: { weapon: null, shield: null, ammo: null },
    combatStyle: 'accurate',
    rangedStyle: 'accurate',
    bank: [],
    quests: { firstErrand: 0 },
    starterCoinsGranted: true,
    saveVersion: 1,
  };
}

function saveCharacter(character) {
  Object.values(character.skills).forEach((skill) => {
    delete skill.level;
  });
  character.inventory = normalizeInventory(character.inventory);
  character.equipment = normalizeEquipment(character.equipment);
  character.combatStyle = normalizeCombatStyle(character.combatStyle);
  character.rangedStyle = normalizeRangedStyle(character.rangedStyle);
  const store = loadSaveStore();
  store.sharedBank = normalizeBank(character.bank);
  character.bank = store.sharedBank;
  character.quests = normalizeQuests(character.quests);
  character.saveVersion = 1;
  const slotCharacter = { ...character };
  delete slotCharacter.bank;
  if (!Number.isInteger(store.activeSlot)) store.activeSlot = 0;
  store.slots[store.activeSlot] = JSON.parse(JSON.stringify(slotCharacter));
  persistSaveStore();
}

function normalizeInventory(inventory) {
  const slots = Array.isArray(inventory) ? inventory.slice(0, 28) : [];
  while (slots.length < 28) slots.push(null);
  return slots.map((slot) => (
    slot
    && ITEMS[slot.itemId]
    && Number.isInteger(slot.qty)
    && slot.qty > 0
      ? { itemId: slot.itemId, qty: slot.qty }
      : null
  ));
}

function normalizeBank(bank) {
  const entries = new Map();
  if (Array.isArray(bank)) {
    bank.forEach((entry) => {
      if (
        !entry || !ITEMS[entry.itemId] || entry.itemId === 'coins'
        || !Number.isInteger(entry.qty) || entry.qty <= 0
      ) return;
      entries.set(entry.itemId, (entries.get(entry.itemId) || 0) + entry.qty);
    });
  }
  return [...entries].map(([itemId, qty]) => ({ itemId, qty }));
}

function normalizeQuests(quests) {
  const stage = quests?.firstErrand;
  return { firstErrand: Number.isInteger(stage) && stage >= 0 && stage <= 2 ? stage : 0 };
}

function normalizeEquipment(equipment) {
  const normalized = { weapon: null, shield: null, ammo: null };
  ['weapon', 'shield'].forEach((slot) => {
    const itemId = equipment?.[slot];
    if (itemId && ITEMS[itemId]?.equip?.slot === slot) normalized[slot] = itemId;
  });
  const ammo = equipment?.ammo;
  if (
    ammo && ITEMS[ammo.itemId]?.equip?.slot === 'ammo'
    && Number.isInteger(ammo.qty) && ammo.qty > 0
  ) normalized.ammo = { itemId: ammo.itemId, qty: ammo.qty };
  return normalized;
}

function normalizeCombatStyle(style) {
  return COMBAT_STYLES.includes(style) ? style : 'accurate';
}

function normalizeRangedStyle(style) {
  return RANGED_STYLES.includes(style) ? style : 'accurate';
}

function loadCharacter() {
  const store = loadSaveStore();
  if (!Number.isInteger(store.activeSlot)) return null;
  const savedSlot = store.slots[store.activeSlot];
  if (!savedSlot) return null;
  const character = JSON.parse(JSON.stringify(savedSlot));
  character.bank = JSON.parse(JSON.stringify(store.sharedBank));
  let migrated = false;
  if (character.skills.hitpoints.xp < xpForLevel(10)) {
    character.skills.hitpoints.xp = xpForLevel(10);
    character.currentHp = 10;
    migrated = true;
  }
  CHARACTER_SKILLS.forEach((skill) => {
    if (!character.skills[skill]) {
      character.skills[skill] = { xp: 0 };
      migrated = true;
    }
  });
  if (!Number.isInteger(character.saveVersion)) {
    character.saveVersion = 0;
    migrated = true;
  }
  Object.values(character.skills).forEach((skill) => {
    if (Object.hasOwn(skill, 'level')) {
      delete skill.level;
      migrated = true;
    }
  });
  const inventory = normalizeInventory(character.inventory);
  if (
    !Array.isArray(character.inventory)
    || character.inventory.length !== 28
    || JSON.stringify(character.inventory) !== JSON.stringify(inventory)
  ) {
    character.inventory = inventory;
    migrated = true;
  }
  const equipment = normalizeEquipment(character.equipment);
  if (!character.equipment || JSON.stringify(character.equipment) !== JSON.stringify(equipment)) {
    character.equipment = equipment;
    migrated = true;
  }
  const combatStyle = normalizeCombatStyle(character.combatStyle);
  if (character.combatStyle !== combatStyle) {
    character.combatStyle = combatStyle;
    migrated = true;
  }
  const rangedStyle = normalizeRangedStyle(character.rangedStyle);
  if (character.rangedStyle !== rangedStyle) {
    character.rangedStyle = rangedStyle;
    migrated = true;
  }
  const bank = normalizeBank(character.bank);
  if (!Array.isArray(character.bank) || JSON.stringify(character.bank) !== JSON.stringify(bank)) {
    character.bank = bank;
    migrated = true;
  }

  const quests = normalizeQuests(character.quests);
  if (!character.quests || JSON.stringify(character.quests) !== JSON.stringify(quests)) {
    character.quests = quests;
    migrated = true;
  }
  if (character.starterCoinsGranted !== true && !Number.isInteger(character.starterCoinsPending)) {
    character.starterCoinsPending = 25;
    migrated = true;
  }
  grantPendingStarterCoins(character);
  if (character.starterCoinsGranted === true && character.starterCoinsPending !== undefined) {
    delete character.starterCoinsPending;
    migrated = true;
  }
  if (character.saveVersion !== 1) {
    character.saveVersion = 1;
    migrated = true;
  }
  if (migrated) saveCharacter(character);
  return character;
}

function grantPendingStarterCoins(character) {
  if (!Number.isInteger(character.starterCoinsPending) || character.starterCoinsPending <= 0) return;
  const coins = character.inventory.find((slot) => slot?.itemId === 'coins');
  if (coins) {
    coins.qty += character.starterCoinsPending;
    delete character.starterCoinsPending;
    character.starterCoinsGranted = true;
  } else {
    const emptySlot = character.inventory.findIndex((slot) => slot === null);
    if (emptySlot < 0) return;
    character.inventory[emptySlot] = { itemId: 'coins', qty: character.starterCoinsPending };
    delete character.starterCoinsPending;
    character.starterCoinsGranted = true;
  }
}

window.normalizeEquipment = normalizeEquipment;

function setActiveSlot(index) {
  const store = loadSaveStore();
  if (![0, 1, 2].includes(index)) return false;
  store.activeSlot = index;
  persistSaveStore();
  return true;
}

function clearActiveSlot() {
  const store = loadSaveStore();
  store.activeSlot = null;
  persistSaveStore();
}

function deleteCharacterSlot(index) {
  const store = loadSaveStore();
  if (![0, 1, 2].includes(index)) return;
  store.slots[index] = null;
  if (store.activeSlot === index) store.activeSlot = null;
  persistSaveStore();
}

function getSharedBank() {
  return JSON.parse(JSON.stringify(loadSaveStore().sharedBank));
}

function getCharacterSlots() {
  const store = loadSaveStore();
  return store.slots.map((slot) => {
    if (!slot) return null;
    const totalLevel = CHARACTER_SKILLS.reduce(
      (sum, skill) => sum + levelForXp(slot.skills?.[skill]?.xp || 0),
      0,
    );
    return { name: slot.name, raceId: slot.raceId, classId: slot.classId, totalLevel };
  });
}

window.getCharacterSlots = getCharacterSlots;
window.setActiveSlot = setActiveSlot;
window.clearActiveSlot = clearActiveSlot;
window.deleteCharacterSlot = deleteCharacterSlot;
window.getSharedBank = getSharedBank;
