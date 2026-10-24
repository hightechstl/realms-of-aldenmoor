const RACES = {
  'ember-dwarf': {
    name: 'Ember Dwarf',
    xpEdges: { mining: 1.25, smithing: 1.25 },
    startSkill: 'smithing',
    homeRegion: 'mine',
    qol: { oreStacking: 10 },
    tint: 0xd98a4a,
  },
  'sylvan-elf': {
    name: 'Sylvan Elf',
    xpEdges: { woodcutting: 1.25, fletching: 1.25 },
    startSkill: 'fletching',
    homeRegion: 'forest',
    qol: { sureShortcuts: true },
    tint: 0x7fc97f,
  },
  tideborn: {
    name: 'Tideborn',
    xpEdges: { fishing: 1.25, cooking: 1.25 },
    startSkill: 'fishing',
    homeRegion: 'coast',
    qol: { freeBoats: true },
    tint: 0x6ab4d9,
  },
  'ashen-orc': {
    name: 'Ashen Orc',
    xpEdges: { attack: 1.25, strength: 1.25 },
    startSkill: 'strength',
    homeRegion: 'stronghold',
    qol: { foodHealBonus: 1.2 },
    tint: 0xb05a5a,
  },
  freefolk: {
    name: 'Freefolk',
    xpEdges: {},
    startSkill: null,
    homeRegion: null,
    qol: { shopDiscount: 0.9, questXpBonus: 1.15 },
    tint: 0xe8e0c8,
  },
};

const CLASSES = {
  ranger: {
    name: 'Ranger',
    xpEdges: { ranged: 1.25 },
    startSkill: null,
    perks: { arrowSaver: true },
  },
  acolyte: {
    name: 'Acolyte',
    xpEdges: {},
    startSkill: 'prayer',
    perks: { slowPrayerDrain: true },
  },
  rogue: {
    name: 'Rogue',
    xpEdges: {},
    startSkill: 'thieving',
    perks: { lowProfile: true },
  },
  artisan: {
    name: 'Artisan',
    xpEdges: {},
    gatheringXpBonus: 1.10,
    startSkill: null,
    perks: {},
  },
  battlemage: {
    name: 'Battlemage',
    xpEdges: {},
    startSkill: 'magic',
    perks: { runeSaver: true },
  },
};

const ITEMS = {
  copperOre: { name: 'Copper ore', code: 'Cu', color: 0xc77b4a, sortOrder: 10 },
  tinOre: { name: 'Tin ore', code: 'Sn', color: 0x9aa4a8, sortOrder: 10 },
  bronzeBar: { name: 'Bronze bar', code: 'Br', color: 0xb87845, sortOrder: 20 },
  ironOre: { name: 'Iron ore', code: 'Io', color: 0x8a6a5e, sortOrder: 10 },
  ironBar: { name: 'Iron bar', code: 'Ib', color: 0x9aa0a3, sortOrder: 20 },
  logs: { name: 'Logs', code: 'Lo', color: 0x805332, sortOrder: 30 },
  oakLogs: { name: 'Oak logs', code: 'Oa', color: 0xa2763e, sortOrder: 30 },
  rawShrimp: { name: 'Raw shrimps', code: 'RS', color: 0x9a6158, sortOrder: 40 },
  rawTrout: { name: 'Raw trout', code: 'RT', color: 0x6e8b8b, sortOrder: 40 },
  cookedShrimp: { name: 'Shrimps', code: 'Sh', color: 0xd28c62, heals: 3, sortOrder: 50 },
  cookedTrout: { name: 'Trout', code: 'Tr', color: 0xc18c5e, heals: 7, sortOrder: 50 },
  rawBass: { name: 'Raw bass', code: 'Ba', color: 0x7d8c5c, sortOrder: 40 },
  cookedBass: { name: 'Bass', code: 'CB', color: 0xd8a860, heals: 8, sortOrder: 50 },
  bread: { name: 'Bread', code: 'Bd', color: 0xd7ad68, food: true, heals: 4, sortOrder: 50 },
  rawChicken: { name: 'Raw chicken', code: 'Rc', color: 0xb77958, sortOrder: 40 },
  cookedChicken: { name: 'Cooked chicken', code: 'Cc', color: 0xd49a63, heals: 4, sortOrder: 50 },
  rawBeef: { name: 'Raw beef', code: 'Rb', color: 0x9c5550, sortOrder: 40 },
  cookedBeef: { name: 'Cooked beef', code: 'Cb', color: 0xb87858, heals: 5, sortOrder: 50 },
  burntFish: { name: 'Burnt fish', code: 'Bu', color: 0x48413f, sortOrder: 60 },
  coins: { name: 'Coins', code: 'Co', color: 0xe5c34d, sortOrder: 1 },
  bones: { name: 'Bones', code: 'Bo', color: 0xe5dfc7, sortOrder: 90 },
  parcel: { name: 'Parcel', code: 'Pa', color: 0xb98b56, sortOrder: 95, unsellable: true },
  bronzePickaxe: { name: 'Bronze pickaxe', code: 'Bp', color: 0xb87845, sortOrder: 96, equip: { slot: 'weapon', attackBonus: 1, strengthBonus: 0 } },
  bronzeDagger: { name: 'Bronze dagger', code: 'Bd', color: 0xc08b58, sortOrder: 96, equip: { slot: 'weapon', attackBonus: 2, strengthBonus: 0 } },
  bronzeSword: { name: 'Bronze sword', code: 'Bs', color: 0xb8bec0, sortOrder: 96, equip: { slot: 'weapon', attackBonus: 3, strengthBonus: 1 } },
  bronzeKiteshield: { name: 'Bronze kiteshield', code: 'Bk', color: 0xa8744a, sortOrder: 96, equip: { slot: 'shield', defenceBonus: 3 } },
  ironDagger: { name: 'Iron dagger', code: 'Id', color: 0xb8bec0, sortOrder: 96, equip: { slot: 'weapon', attackBonus: 4, strengthBonus: 1 } },
  ironSword: { name: 'Iron sword', code: 'Is', color: 0xc9ced1, sortOrder: 96, equip: { slot: 'weapon', attackBonus: 5, strengthBonus: 2 } },
  ironKiteshield: { name: 'Iron kiteshield', code: 'Ik', color: 0x9aa0a3, sortOrder: 96, equip: { slot: 'shield', defenceBonus: 5 } },
  arrowShafts: { name: 'Arrow shafts', code: 'As', color: 0x94613b, sortOrder: 97, stackable: true },
  bronzeArrowheads: { name: 'Bronze arrowheads', code: 'Ah', color: 0xb8753f, sortOrder: 97, stackable: true },
  ironArrowheads: { name: 'Iron arrowheads', code: 'Ih', color: 0x9aa0a3, sortOrder: 97, stackable: true },
  ironArrow: { name: 'Iron arrows', code: 'Ia', color: 0x9aa0a3, sortOrder: 97, stackable: true, equip: { slot: 'ammo' } },
  bronzeArrow: { name: 'Bronze arrows', code: 'Ar', color: 0xb8753f, sortOrder: 97, stackable: true, equip: { slot: 'ammo' } },
  shortbow: { name: 'Shortbow', code: 'Sb', color: 0x805332, sortOrder: 96, equip: { slot: 'weapon', rangedBonus: 4 } },
  airRune: { name: 'Air rune', code: 'Ar', color: 0x8bd5e8, sortOrder: 97, stackable: true },
  mindRune: { name: 'Mind rune', code: 'Mr', color: 0x8296cb, sortOrder: 97, stackable: true },
  runeEssence: { name: 'Rune essence', code: 'Re', color: 0x9fd8e8, sortOrder: 97, stackable: true },
  staff: { name: 'Staff', code: 'St', color: 0x805332, sortOrder: 96, equip: { slot: 'weapon', magicBonus: 4 } },
  ruby: { name: 'Ruby', code: 'Ru', color: 0xc43b5b, sortOrder: 80 },
};

const PALETTE = {
  '.': null,
  K: '#17191f',
  W: '#f7f0dc',
  S: '#777d85',
  H: '#b3b8b8',
  C: '#d77839',
  T: '#d8d8c9',
  B: '#b8753f',
  D: '#60402d',
  L: '#94613b',
  O: '#50382b',
  P: '#f2a4a0',
  R: '#829ca8',
  F: '#d69b4c',
  X: '#292a2c',
  G: '#f2c94c',
  Y: '#d6ad68',
  N: '#e9e3d1',
  A: '#c18a51',
  E: '#6e4a32',
  U: '#c69a5e',
  I: '#9c623a',
  Q: '#8bd5e8',
  M: '#8296cb',
  V: '#c43b5b',
};

const ICONS = {
  coins: ['............', '....KKKK....', '..KKGGGGKK..', '.KGGGGGGGGK.', '.KGGGGGGGGK.', 'KKGGGGGGGGKK', 'KKGGGGGGGGKK', '.KGGGGGGGGK.', '.KGGGGGGGGK.', '..KKGGGGKK..', '....KKKK....', '............'],
  copperOre: ['............', '............', '....KKKK....', '..KKSSSSKK..', '.KSSHHSSSSK.', 'KSSSCSSSSSSK', 'KSSSSCSHSSSK', 'KSSSSSSCSSSK', '.KSSSSSSSSK.', '..KKSSSSKK..', '....KKKK....', '............'],
  tinOre: ['............', '............', '....KKKK....', '..KKSSSSKK..', '.KSSHHSSSSK.', 'KSSSTSSSSSSK', 'KSSSSSTHSSSK', 'KSSSSSSSTSSK', '.KSSSSSSSSK.', '..KKSSSSKK..', '....KKKK....', '............'],
  bronzeBar: ['............', '............', '............', '..KKKKKKKK..', '.KBBBBBBBBK.', 'KBBBAAAAABKK', 'KBBBBBBBBBBK', '.KBBBBBBBBK.', '..KKKKKKKK..', '............', '............', '............'],
  ironOre: ['............', '............', '....KKKK....', '..KKSSSSKK..', '.KSSHHSSSSK.', 'KSSSISSSSSSK', 'KSSSSISHSSSK', 'KSSSSSSISSSK', '.KSSSSSSSSK.', '..KKSSSSKK..', '....KKKK....', '............'],
  ironBar: ['............', '............', '............', '..KKKKKKKK..', '.KSSSSSSSSK.', 'KSSSHHHHHSSK', 'KSSSSSSSSSSK', '.KSSSSSSSSK.', '..KKKKKKKK..', '............', '............', '............'],
  logs: ['............', '............', '...KKKKKK...', '..KLLLLLLK..', '.KLKKLLKKLK.', '.KLLKLLKLLK.', '.KLKKLLKKLK.', '.KLLLLLLLLK.', '..KLLLLLLK..', '...KKKKKK...', '............', '............'],
  oakLogs: ['............', '............', '...KKKKKK...', '..KOOOOOOK..', '.KOKKOOKKOK.', '.KOOKOOKOOK.', '.KOKKOOKKOK.', '.KOOOOOOOOK.', '..KOOOOOOK..', '...KKKKKK...', '............', '............'],
  rawShrimp: ['............', '............', '.......KK...', '.....KKPPK..', '....KPPPPK..', '...KPPPKK...', '..KPPK......', '..KPK.......', '.KK.........', 'K...........', '............', '............'],
  rawTrout: ['............', '............', '............', '...KKKK.....', '..KRRRKK....', '.KRRHHRRK...', 'KRRRRRRRRK..', '.KRRHHRRK...', '..KRRRKK....', '...KKKK.....', '............', '............'],
  cookedShrimp: ['............', '............', '.......KK...', '.....KKFFK..', '....KFFFFK..', '...KFFFKK...', '..KFFK......', '..KFK.......', '.KK.........', 'K...........', '............', '............'],
  cookedTrout: ['............', '............', '............', '...KKKK.....', '..KFFFKK....', '.KFFAAFFK...', 'KFFFFFFFFK..', '.KFFAAFFK...', '..KFFFKK....', '...KKKK.....', '............', '............'],
  rawBass: ['............', '............', '............', '...KKKK.....', '..KSSSKK....', '.KSGGSSSK...', 'KSSSSSSSSK..', '.KSGGSSSK...', '..KSSSKK....', '...KKKK.....', '............', '............'],
  cookedBass: ['............', '............', '............', '...KKKK.....', '..KFFFKK....', '.KFAAAFFK...', 'KFFFFFFFFK..', '.KFAAAFFK...', '..KFFFKK....', '...KKKK.....', '............', '............'],
  burntFish: ['............', '....XX......', '..XX..XX....', '............', '...KKKK.....', '..KXXXKK....', '.KXXXXXXK...', 'KXXXXXXXXK..', '.KXXXXXXK...', '..KXXXKK....', '...KKKK.....', '............'],
  bread: ['............', '............', '....KKKK....', '..KKYYYYKK..', '.KYYYYYYYYK.', 'KYYYYYYYYYYK', 'KYYYYAYYYYYK', 'KYYAYYYYYYYK', '.KYYYYYYYYK.', '..KKKKKKKK..', '............', '............'],
  bones: ['............', '............', '..KK....KK..', '.KNKK..KNNK.', '.KNNKKKNNK..', '..KNNNNNK...', '...KNNNNKK..', '..KNNKKNNNK.', '.KNNK..KKNNK', '..KK....KK..', '............', '............'],
  parcel: ['............', '............', '..KKKKKKKK..', '.KAAAAAAAAK.', 'KAAKAAAAKAAK', 'KAAAKKKKAAAK', 'KAAAKWWKAAAK', 'KAAAKKKKAAAK', 'KAAKAAAAKAAK', '.KAAAAAAAAK.', '..KKKKKKKK..', '............'],
  bronzePickaxe: ['............', '............', '..KKKKKKK...', '.KBBBBBBK...', 'KBBBAAABKK..', '.KKKKK.K....', '.....K.K....', '.....K.K....', '....K.K.....', '....K.K.....', '...KK.KK....', '............'],
  bronzeDagger: ['............', '.....KK.....', '....KBBK....', '...KBBBBK...', '..KBBBBBBK..', '.KBBBBBBBBK.', '....KBBK....', '....KBBK....', '....KBBK....', '....KBBK....', '...KK..KK...', '............'],
  bronzeSword: ['.....KK.....', '....KBBK....', '...KBBBBK...', '..KBBBBBBK..', '.KBBBBBBBBK.', '....KBBK....', '....KBBK....', '....KBBK....', '....KBBK....', '....KBBK....', '...KK..KK...', '............'],
  bronzeKiteshield: ['............', '....KKKK....', '..KKBBBBKK..', '.KBBBBBBBBK.', '.KBBBBABBBK.', '.KBBBAABBBK.', '.KBBBBABBBK.', '.KBBBBBBBBK.', '..KBBBBBBK..', '...KBBBBK...', '....KKKK....', '............'],
  rawChicken: ['............', '............', '......KK....', '.....KNNK...', '....KNNNNK..', '...KNNNNNNK.', '..KNNNNNNNNK', '...KNNNNNNK.', '....KNNNNK..', '.....KKKK...', '............', '............'],
  cookedChicken: ['............', '............', '......KK....', '.....KFFK...', '....KFFFFK..', '...KFFFFFFK.', '..KFFFFFFFFK', '...KFFFFFFK.', '....KFFFFK..', '.....KKKK...', '............', '............'],
  rawBeef: ['............', '............', '..KKKKKKKK..', '.KRRRRRRRRK.', 'KRRKRRRRRRRK', 'KRRRRRRRRRRK', 'KRRRRKRRRRRK', 'KRRRRRRRRRRK', '.KRRRRRRRRK.', '..KKKKKKKK..', '............', '............'],
  cookedBeef: ['............', '............', '..KKKKKKKK..', '.KLLLALLLLK.', 'KLLKLLLLLLLK', 'KLLLLLLLLLLK', 'KLLLLKLLLLLK', 'KLLLLLLLLLLK', '.KLLLLLLLLK.', '..KKKKKKKK..', '............', '............'],
  arrowShafts: ['............', '............', '............', '..KKK.......', '..KUKK......', '..KUKK......', '...KUKK.....', '....KUKK....', '.....KUKK...', '......KKK...', '............', '............'],
  bronzeArrowheads: ['............', '............', '.....KK.....', '....KBBK....', '...KBBBBK...', '..KBBBBBBK..', '...KBBBBK...', '....KBBK....', '.....KK.....', '............', '............', '............'],
  bronzeArrow: ['............', '............', '.........KK.', '........KBBK', '.......KBBK.', '......KBBK..', '..KKKKKKK...', '..KUUUUU....', '..KKKKKKK...', '............', '............', '............'],
  ironDagger: ['............', '.....KK.....', '....KSSK....', '...KSSSSK...', '..KSSSSSSK..', '.KSSSSSSSSK.', '....KSSK....', '....KSSK....', '....KSSK....', '....KSSK....', '...KK..KK...', '............'],
  ironSword: ['.....KK.....', '....KSSK....', '...KSSSSK...', '..KSSSSSSK..', '.KSSSSSSSSK.', '....KSSK....', '....KSSK....', '....KSSK....', '....KSSK....', '....KSSK....', '...KK..KK...', '............'],
  ironKiteshield: ['............', '....KKKK....', '..KKSSSSKK..', '.KSSSSSSSSK.', '.KSSSSHSSSK.', '.KSSSHHSSSK.', '.KSSSSHSSSK.', '.KSSSSSSSSK.', '..KSSSSSSK..', '...KSSSSK...', '....KKKK....', '............'],
  ironArrowheads: ['............', '............', '.....KK.....', '....KSSK....', '...KSSSSK...', '..KSSSSSSK..', '...KSSSSK...', '....KSSK....', '.....KK.....', '............', '............', '............'],
  ironArrow: ['............', '............', '.........KK.', '........KSSK', '.......KSSK.', '......KSSK..', '..KKKKKKK...', '..KUUUUU....', '..KKKKKKK...', '............', '............', '............'],
  shortbow: ['............', '....KK......', '..KKUUK.....', '.KU..KK.....', 'KU....K.....', 'KU....K.....', 'KU....K.....', '.KU..KK.....', '..KKUUK.....', '....KK......', '............', '............'],
  airRune: ['............', '............', '....KKKK....', '..KKQQQQKK..', '.KQQQQQQQQK.', 'KQQQQQQQQQQK', 'KQQQQQQQQQQK', '.KQQQQQQQQK.', '..KKQQQQKK..', '....KKKK....', '............', '............'],
  mindRune: ['............', '............', '....KKKK....', '..KKMMMMKK..', '.KMMMMMMMMK.', 'KMMMMMMMMMMK', 'KMMMMMMMMMMK', '.KMMMMMMMMK.', '..KKMMMMKK..', '....KKKK....', '............', '............'],
  runeEssence: ['............', '............', '.....KK.....', '....KQQK....', '...KQQQQK...', '..KQQWQQQK..', '..KQQQQQQK..', '...KQQQQK...', '....KQQK....', '.....KK.....', '............', '............'],
  staff: ['............', '............', '..KK........', '..KUK.......', '...KUK......', '....KUK.....', '.....KUK....', '......KUK...', '.......KUK..', '........KK..', '............', '............'],
  ruby: ['............', '............', '.....KK.....', '....KVVK....', '...KVVVVK...', '..KVVVVVVK..', '..KVVVVVVK..', '...KVVVVK...', '....KVVK....', '.....KK.....', '............', '............'],
};

const itemIconCaches = new Map();
const itemTooltipState = { element: null, owner: null };

function makeIcon(itemId, scene = null) {
  const drawing = ICONS[itemId];
  if (!drawing) return null;
  if (drawing.length !== 12 || drawing.some((row) => row.length !== 12)) {
    throw new Error(`Item icon ${itemId} must be a 12x12 pixel map.`);
  }
  let cached = itemIconCaches.get(itemId);
  if (!cached) {
    const pixels = document.createElement('canvas');
    pixels.width = 12;
    pixels.height = 12;
    const context = pixels.getContext('2d');
    if (!context) throw new Error('Could not create the item icon drawing context.');
    drawing.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (!Object.hasOwn(PALETTE, pixel)) {
          throw new Error(`Unknown palette color "${pixel}" in item icon ${itemId}.`);
        }
        const color = PALETTE[pixel];
        if (color) {
          context.fillStyle = color;
          context.fillRect(x, y, 1, 1);
        }
      });
    });
    const scaled = document.createElement('canvas');
    scaled.width = 48;
    scaled.height = 48;
    const scaledContext = scaled.getContext('2d');
    if (!scaledContext) throw new Error('Could not create the scaled item icon context.');
    scaledContext.imageSmoothingEnabled = false;
    scaledContext.drawImage(pixels, 0, 0, 48, 48);
    cached = {
      dataUrl: scaled.toDataURL(),
      pixels,
      textureKey: `dreamgame-item-${itemId}`,
    };
    itemIconCaches.set(itemId, cached);
  }
  if (scene && !scene.textures.exists(cached.textureKey)) {
    const texture = scene.textures.addCanvas(cached.textureKey, cached.pixels);
    if (!texture) throw new Error(`Could not register Phaser texture for ${itemId}.`);
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
  return cached.dataUrl;
}

function createItemIconElement(itemId, className = 'item-icon') {
  const imageUrl = makeIcon(itemId);
  if (!imageUrl) {
    const fallback = document.createElement('span');
    fallback.className = 'town-item-code';
    fallback.textContent = ITEMS[itemId].code;
    return fallback;
  }
  const image = document.createElement('img');
  image.className = className;
  image.src = imageUrl;
  image.alt = '';
  image.draggable = false;
  return image;
}

function attachItemTooltip(element, itemId, context = '', quantity = 1) {
  const item = ITEMS[itemId];
  if (!item) throw new Error(`Cannot show a tooltip for unknown item: ${itemId}`);
  element.addEventListener('pointerenter', (event) => {
    if (!itemTooltipState.element) {
      const tooltip = document.createElement('div');
      tooltip.className = 'item-tooltip';
      tooltip.setAttribute('role', 'tooltip');
      document.body.append(tooltip);
      itemTooltipState.element = tooltip;
    }
    itemTooltipState.owner = element;
    const details = [item.name];
    if (quantity > 1) details.push(`×${quantity.toLocaleString()}`);
    if (context) details.push(context);
    itemTooltipState.element.textContent = details.join(' · ');
    itemTooltipState.element.style.display = 'block';
    positionItemTooltip(event);
  });
  element.addEventListener('pointermove', (event) => {
    if (itemTooltipState.owner === element) positionItemTooltip(event);
  });
  element.addEventListener('pointerleave', () => {
    if (itemTooltipState.owner === element) {
      itemTooltipState.owner = null;
      itemTooltipState.element.style.display = 'none';
    }
  });
}

function positionItemTooltip(event) {
  const tooltip = itemTooltipState.element;
  tooltip.style.left = `${Math.min(event.clientX + 12, window.innerWidth - tooltip.offsetWidth - 8)}px`;
  tooltip.style.top = `${Math.min(event.clientY + 14, window.innerHeight - tooltip.offsetHeight - 8)}px`;
}

const MONSTERS = {
  goblin: {
    name: 'Goblin',
    hp: 8,
    maxHit: 1,
    attack: 1,
    defence: 1,
    region: 'stronghold',
    respawnMs: 8000,
    drops: [
      { itemId: 'bones', qty: 1, chance: 1.0 },
      { itemId: 'coins', qty: '5-15', chance: 0.6 },
      { itemId: 'bronzeBar', qty: 1, chance: 0.10 },
    ],
  },
  hobgoblin: {
    name: 'Hobgoblin',
    hp: 22,
    maxHit: 3,
    attack: 4,
    defence: 3,
    region: 'stronghold',
    respawnMs: 12000,
    drops: [
      { itemId: 'bones', qty: 1, chance: 1.0 },
      { itemId: 'coins', qty: '10-30', chance: 0.6 },
      { itemId: 'ironOre', qty: 1, chance: 0.15 },
      { itemId: 'ironBar', qty: 1, chance: 0.05 },
    ],
  },
  chicken: {
    name: 'Chicken',
    hp: 3,
    maxHit: 0,
    attack: 0,
    defence: 0,
    region: 'farmland',
    respawnMs: 6000,
    drops: [
      { itemId: 'bones', qty: 1, chance: 1.0 },
      { itemId: 'rawChicken', qty: 1, chance: 1.0 },
    ],
  },
  cow: {
    name: 'Cow',
    hp: 8,
    maxHit: 1,
    attack: 1,
    defence: 1,
    region: 'farmland',
    respawnMs: 10000,
    drops: [
      { itemId: 'bones', qty: 1, chance: 1.0 },
      { itemId: 'rawBeef', qty: 1, chance: 1.0 },
    ],
  },
  trainingTarget: {
    name: 'Training target',
    hp: 999999,
    maxHit: 0,
    attack: 0,
    defence: 0,
    region: 'stronghold',
    respawnMs: 0,
    drops: [],
    stationary: true,
  },
};

const SHOP_PRICES = {
  copperOre: 4,
  tinOre: 4,
  bronzeBar: 30,
  ironOre: 18,
  ironBar: 105,
  logs: 5,
  oakLogs: 12,
  rawShrimp: 3,
  rawTrout: 15,
  cookedShrimp: 8,
  cookedTrout: 30,
  rawBass: 25,
  cookedBass: 55,
  rawChicken: 3,
  cookedChicken: 9,
  rawBeef: 4,
  cookedBeef: 11,
  bronzeDagger: 40,
  bronzeSword: 100,
  bronzeKiteshield: 170,
  ironDagger: 110,
  ironSword: 260,
  ironKiteshield: 440,
  bronzeArrow: 3,
  ironArrow: 6,
  arrowShafts: 1,
  ruby: 150,
};

const SHOPS = {
  general: {
    sells: { bread: 12, shortbow: 50 },
    buys: SHOP_PRICES,
  },
  magic: {
    sells: { airRune: 4, mindRune: 4, staff: 60 },
    buys: { airRune: 2, mindRune: 2 },
  },
  fish: {
    sells: { bread: 12, cookedBass: 70 },
    buys: { rawShrimp: 3, rawTrout: 15, rawBass: 25, cookedShrimp: 8, cookedTrout: 30, cookedBass: 55 },
  },
};

const SHOP_BUY_PRICES = SHOPS.general.sells;

const SMITHING_RECIPES = {
  bronzeDagger: { bars: 1, level: 1, xpPerBar: 12.5 },
  bronzeSword: { bars: 2, level: 5, xpPerBar: 12.5 },
  bronzeKiteshield: { bars: 3, level: 10, xpPerBar: 12.5 },
  bronzeArrowheads: { bars: 1, level: 1, xpPerBar: 12.5, yields: 15 },
  ironDagger: { bars: 1, level: 15, xpPerBar: 25, barId: 'ironBar' },
  ironSword: { bars: 2, level: 20, xpPerBar: 25, barId: 'ironBar' },
  ironKiteshield: { bars: 3, level: 25, xpPerBar: 25, barId: 'ironBar' },
  ironArrowheads: { bars: 1, level: 15, xpPerBar: 25, yields: 15, barId: 'ironBar' },
};

const INTERIOR_ROOMS = {
  bank: { x: 110, y: 10, width: 12, height: 9, doorX: 115, exterior: { x: 18, y: 14 } },
  store: { x: 110, y: 30, width: 12, height: 9, doorX: 115, exterior: { x: 22, y: 14 } },
  smithy: { x: 110, y: 50, width: 12, height: 9, doorX: 115, exterior: { x: 27, y: 14 } },
  chapel: { x: 110, y: 90, width: 10, height: 8, doorX: 115, exterior: { x: 23, y: 10 } },
  tower: { x: 110, y: 130, width: 10, height: 8, doorX: 115, exterior: { x: 15, y: 10 } },
  essenceMine: { x: 110, y: 60, width: 12, height: 9, doorX: 115, exterior: { x: 112, y: 132 }, name: 'Essence Mine' },
  mineDepths: { x: 110, y: 140, width: 14, height: 9, doorX: 116, exterior: { x: 19, y: 1 }, name: 'Mine Depths' },
  fishShop: { x: 110, y: 70, width: 12, height: 9, doorX: 115, exterior: { x: 27, y: 60 }, name: 'Fish Market' },
};

window.RACES = RACES;
window.CLASSES = CLASSES;
window.ITEMS = ITEMS;
window.MONSTERS = MONSTERS;
window.SHOP_PRICES = SHOP_PRICES;
window.SHOP_BUY_PRICES = SHOP_BUY_PRICES;
window.SHOPS = SHOPS;
window.SMITHING_RECIPES = SMITHING_RECIPES;
window.INTERIOR_ROOMS = INTERIOR_ROOMS;
window.THIEVING_STALLS = {
  bread: { name: 'Bread stall', level: 1, baseChance: 60, itemId: 'bread', minQty: 1, maxQty: 1, xp: 12, stock: 5 },
  trinket: { name: 'Trinket stall', level: 5, baseChance: 50, itemId: 'coins', minQty: 10, maxQty: 25, xp: 16, stock: 5 },
  gem: { name: 'Gem stall', level: 20, baseChance: 40, itemId: 'ruby', minQty: 1, maxQty: 1, xp: 35, stock: 5 },
};
window.THIEVING_PICKPOCKET = { level: 1, baseChance: 55, minCoins: 5, maxCoins: 12, xp: 8 };
window.PALETTE = PALETTE;
window.ICONS = ICONS;
window.makeIcon = makeIcon;
window.createItemIconElement = createItemIconElement;
window.attachItemTooltip = attachItemTooltip;
