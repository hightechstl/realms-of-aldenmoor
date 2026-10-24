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
  coal: { name: 'Coal', code: 'Cl', color: 0x2b2b30, sortOrder: 10 },
  steelBar: { name: 'Steel bar', code: 'Sb', color: 0xb9c0c7, sortOrder: 20 },
  mithrilOre: { name: 'Mithril ore', code: 'Mo', color: 0x7f9fb8, sortOrder: 10 },
  mithrilBar: { name: 'Mithril bar', code: 'Mb', color: 0x8fb8d8, sortOrder: 20 },
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
  steelDagger: { name: 'Steel dagger', code: 'Sd', color: 0xc9ced1, sortOrder: 96, equip: { slot: 'weapon', attackBonus: 6, strengthBonus: 2 } },
  steelSword: { name: 'Steel sword', code: 'Ss', color: 0xd4d9dd, sortOrder: 96, equip: { slot: 'weapon', attackBonus: 7, strengthBonus: 3 } },
  steelKiteshield: { name: 'Steel kiteshield', code: 'Sk', color: 0xb9c0c7, sortOrder: 96, equip: { slot: 'shield', defenceBonus: 8 } },
  emberbrand: { name: 'Emberbrand', code: 'Eb', color: 0xd96b3b, sortOrder: 96, equip: { slot: 'weapon', attackBonus: 10, strengthBonus: 5 } },
  emberfangPelt: { name: 'Emberfang pelt', code: 'Ep', color: 0x8a4b32, sortOrder: 80 },
  mithrilDagger: { name: 'Mithril dagger', code: 'Md', color: 0xa8c8e0, sortOrder: 96, equip: { slot: 'weapon', attackBonus: 8, strengthBonus: 3 } },
  mithrilSword: { name: 'Mithril sword', code: 'Ms', color: 0xb8d4ea, sortOrder: 96, equip: { slot: 'weapon', attackBonus: 9, strengthBonus: 4 } },
  mithrilKiteshield: { name: 'Mithril kiteshield', code: 'Mk', color: 0x8fb8d8, sortOrder: 96, equip: { slot: 'shield', defenceBonus: 11 } },
  stormbrand: { name: 'Stormbrand', code: 'Tb', color: 0x4b9fc0, sortOrder: 96, equip: { slot: 'weapon', attackBonus: 12, strengthBonus: 6 } },
  leviathanScale: { name: 'Leviathan scale', code: 'Ls', color: 0x3d7ea6, sortOrder: 80 },
  arrowShafts: { name: 'Arrow shafts', code: 'As', color: 0x94613b, sortOrder: 97, stackable: true },
  bronzeArrowheads: { name: 'Bronze arrowheads', code: 'Ah', color: 0xb8753f, sortOrder: 97, stackable: true },
  ironArrowheads: { name: 'Iron arrowheads', code: 'Ih', color: 0x9aa0a3, sortOrder: 97, stackable: true },
  ironArrow: { name: 'Iron arrows', code: 'Ia', color: 0x9aa0a3, sortOrder: 97, stackable: true, equip: { slot: 'ammo' } },
  steelArrowheads: { name: 'Steel arrowheads', code: 'Sh', color: 0xb9c0c7, sortOrder: 97, stackable: true },
  steelArrow: { name: 'Steel arrows', code: 'Sa', color: 0xb9c0c7, sortOrder: 97, stackable: true, equip: { slot: 'ammo' } },
  mithrilArrowheads: { name: 'Mithril arrowheads', code: 'Mh', color: 0x8fb8d8, sortOrder: 97, stackable: true },
  mithrilArrow: { name: 'Mithril arrows', code: 'Ma', color: 0x8fb8d8, sortOrder: 97, stackable: true, equip: { slot: 'ammo' } },
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
  e: '#3f9e4d',
  d: '#2e7d32',
  b: '#3d67a6',
  o: '#e67e22',
};

const ICONS = {
  coins: ['............', '....KKKK....', '..KKGGGGKK..', '.KGGGGGGGGK.', '.KGGGGGGGGK.', 'KKGGGGGGGGKK', 'KKGGGGGGGGKK', '.KGGGGGGGGK.', '.KGGGGGGGGK.', '..KKGGGGKK..', '....KKKK....', '............'],
  copperOre: ['............', '............', '....KKKK....', '..KKSSSSKK..', '.KSSHHSSSSK.', 'KSSSCSSSSSSK', 'KSSSSCSHSSSK', 'KSSSSSSCSSSK', '.KSSSSSSSSK.', '..KKSSSSKK..', '....KKKK....', '............'],
  tinOre: ['............', '............', '....KKKK....', '..KKSSSSKK..', '.KSSHHSSSSK.', 'KSSSTSSSSSSK', 'KSSSSSTHSSSK', 'KSSSSSSSTSSK', '.KSSSSSSSSK.', '..KKSSSSKK..', '....KKKK....', '............'],
  bronzeBar: ['............', '............', '............', '..KKKKKKKK..', '.KBBBBBBBBK.', 'KBBBAAAAABKK', 'KBBBBBBBBBBK', '.KBBBBBBBBK.', '..KKKKKKKK..', '............', '............', '............'],
  ironOre: ['............', '............', '....KKKK....', '..KKSSSSKK..', '.KSSHHSSSSK.', 'KSSSISSSSSSK', 'KSSSSISHSSSK', 'KSSSSSSISSSK', '.KSSSSSSSSK.', '..KKSSSSKK..', '....KKKK....', '............'],
  ironBar: ['............', '............', '............', '..KKKKKKKK..', '.KSSSSSSSSK.', 'KSSSHHHHHSSK', 'KSSSSSSSSSSK', '.KSSSSSSSSK.', '..KKKKKKKK..', '............', '............', '............'],
  coal: ['............', '............', '....KKKK....', '..KKXXXXKK..', '.KXXHXXXXXK.', 'KXXXXXXXXXXK', 'KXXXXHXXXXXK', 'KXXXXXXXXXXK', '.KXXXXXXXXK.', '..KKXXXXKK..', '....KKKK....', '............'],
  steelBar: ['............', '............', '............', '..KKKKKKKK..', '.KHHHHHHHHK.', 'KHHHSSSSSHHK', 'KHHHHHHHHHHK', '.KHHHHHHHHK.', '..KKKKKKKK..', '............', '............', '............'],
  mithrilOre: ['............', '............', '....KKKK....', '..KKSSSSKK..', '.KSSHHSSSSK.', 'KSSSQSQSSSSK', 'KSSSSSQHSSSK', 'KSSSSSSSQSSK', '.KSSSSSSSSK.', '..KKSSSSKK..', '....KKKK....', '............'],
  mithrilBar: ['............', '............', '............', '..KKKKKKKK..', '.KQQQQQQQQK.', 'KQQQSSSSQQQK', 'KQQQQQQQQQQK', '.KQQQQQQQQK.', '..KKKKKKKK..', '............', '............', '............'],
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
  steelDagger: ['............', '.....KK.....', '....KHHK....', '...KHHHHK...', '..KHHHHHHK..', '.KHHHHHHHHK.', '....KHHK....', '....KHHK....', '....KHHK....', '....KHHK....', '...KK..KK...', '............'],
  steelSword: ['.....KK.....', '....KHHK....', '...KHHHHK...', '..KHHHHHHK..', '.KHHHHHHHHK.', '....KHHK....', '....KHHK....', '....KHHK....', '....KHHK....', '....KHHK....', '...KK..KK...', '............'],
  steelKiteshield: ['............', '....KKKK....', '..KKHHHHKK..', '.KHHHHHHHHK.', '.KHHHSHHHHK.', '.KHHHSSHHHK.', '.KHHHSHHHHK.', '.KHHHHHHHHK.', '..KHHHHHHK..', '...KHHHHK...', '....KKKK....', '............'],
  emberbrand: ['.....KK.....', '....KVVK....', '...KVVVVK...', '..KVVVVVVK..', '.KVVVGGVVVK.', '....KVVK....', '....KFFK....', '....KFFK....', '....KFFK....', '....KFFK....', '...KK..KK...', '............'],
  emberfangPelt: ['............', '............', '..KKKKKKKK..', '.KCCCCCCCCK.', 'KCCXCCCCXCCK', 'KCCCCCCCCCCK', 'KCCCXCCCXCCK', 'KCCCCCCCCCCK', '.KCCCCCCCCK.', '..KKKKKKKK..', '............', '............'],
  mithrilDagger: ['............', '.....KK.....', '....KQQK....', '...KQQQQK...', '..KQQQQQQK..', '.KQQQQQQQQK.', '....KQQK....', '....KQQK....', '....KQQK....', '....KQQK....', '...KK..KK...', '............'],
  mithrilSword: ['.....KK.....', '....KQQK....', '...KQQQQK...', '..KQQQQQQK..', '.KQQQQQQQQK.', '....KQQK....', '....KQQK....', '....KQQK....', '....KQQK....', '....KQQK....', '...KK..KK...', '............'],
  mithrilKiteshield: ['............', '....KKKK....', '..KKQQQQKK..', '.KQQQQQQQQK.', '.KQQQSQQQQK.', '.KQQQSSQQQK.', '.KQQQSQQQQK.', '.KQQQQQQQQK.', '..KQQQQQQK..', '...KQQQQK...', '....KKKK....', '............'],
  stormbrand: ['.....KK.....', '....KbbK....', '...KbbbbK...', '..KbbbbbbK..', '.KbbbQQbbbK.', '....KbbK....', '....KSSK....', '....KSSK....', '....KSSK....', '....KSSK....', '...KK..KK...', '............'],
  leviathanScale: ['............', '............', '..KKKKKKKK..', '.KbbbbbbbbK.', 'KbQbbbbQbbbK', 'KbbbbbbbbbbK', 'KbbQbbbbQbbK', 'KbbbbbbbbbbK', '.KbbbbbbbbK.', '..KKKKKKKK..', '............', '............'],
  ironArrowheads: ['............', '............', '.....KK.....', '....KSSK....', '...KSSSSK...', '..KSSSSSSK..', '...KSSSSK...', '....KSSK....', '.....KK.....', '............', '............', '............'],
  ironArrow: ['............', '............', '.........KK.', '........KSSK', '.......KSSK.', '......KSSK..', '..KKKKKKK...', '..KUUUUU....', '..KKKKKKK...', '............', '............', '............'],
  steelArrowheads: ['............', '............', '.....KK.....', '....KHHK....', '...KHHHHK...', '..KHHHHHHK..', '...KHHHHK...', '....KHHK....', '.....KK.....', '............', '............', '............'],
  steelArrow: ['............', '............', '.........KK.', '........KHHK', '.......KHHK.', '......KHHK..', '..KKKKKKK...', '..KUUUUU....', '..KKKKKKK...', '............', '............', '............'],
  mithrilArrowheads: ['............', '............', '.....KK.....', '....KQQK....', '...KQQQQK...', '..KQQQQQQK..', '...KQQQQK...', '....KQQK....', '.....KK.....', '............', '............', '............'],
  mithrilArrow: ['............', '............', '.........KK.', '........KQQK', '.......KQQK.', '......KQQK..', '..KKKKKKK...', '..KUUUUU....', '..KKKKKKK...', '............', '............', '............'],
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

// ---- Visual pass: skill icons, NPC avatars, and world sprites ----
// The same 12x12 pixel-art system as the item icons, extended so the
// game reads in pictures instead of words wherever it can.
const SKILL_ICONS = {
  attack: [".....KK.....", "....KHHK....", "...KHHHHK...", "..KHHHHHHK..", ".KHHHHHHHHK.", "....KHHK....", "....KHHK....", "....KHHK....", "....KHHK....", "....KHHK....", "...KK..KK...", "............"],
  strength: ["............", "....KKKK....", "..KKFFFFKK..", ".KFFKFFKFFK.", "KFFFFFFFFFFK", "KFFKFFFFFFFK", "KFFFFFFFFFFK", ".KFFFFFFFFK.", ".KFFFKFFFFK.", "..KKFFFFKK..", "....KKKK....", "............"],
  defence: ["............", "....KKKK....", "..KKHHHHKK..", ".KHHHHHHHHK.", ".KHHHSHHHHK.", ".KHHHSSHHHK.", ".KHHHSHHHHK.", ".KHHHHHHHHK.", "..KHHHHHHK..", "...KHHHHK...", "....KKKK....", "............"],
  hitpoints: ["............", "............", ".KKK..KKK...", "KVVVK.KVVVK.", "KVVVVVVVVVK.", "KVVVVVVVVK..", ".KVVVVVVK...", "..KVVVVK....", "...KVVK.....", "....KK......", "............", "............"],
  mining: ["............", "............", "..KKKKKKK...", ".KBBBBBBK...", "KBBBAAABKK..", ".KKKKK.K....", ".....K.K....", ".....K.K....", "....K.K.....", "....K.K.....", "...KK.KK....", "............"],
  smithing: ["............", "............", "............", ".KKKKKKKKK..", "KSSSSSSSSSK.", "KKSSSSSSKK..", "...KSSSK....", "...KSSSK....", "...KSSSK....", "..KSSSSSK...", ".KKKKKKKKK..", "............"],
  woodcutting: [".....KKKKK..", "....KHHHHHK.", "...KHHKKKKK.", "...KK.KUUUK.", "......KUK...", ".....KUK....", "....KUK.....", "...KUK......", "..KUK.......", ".KUK........", ".KK.........", "............"],
  fletching: ["............", "............", ".........KK.", "........KBBK", ".......KBBK.", "......KBBK..", "..KKKKKKK...", "..KUUUUU....", "..KKKKKKK...", "............", "............", "............"],
  fishing: ["............", "............", "............", "...KKKK.....", "..KRRRKK....", ".KRRHHRRK...", "KRRRRRRRRK..", ".KRRHHRRK...", "..KRRRKK....", "...KKKK.....", "............", "............"],
  cooking: ["............", ".......C....", "......CCC...", "......CFC...", ".....CFFC...", ".....CFYC...", "....CFFYC...", "....CFYYC...", "...CFFYYFC..", "...CFFFFFFC.", "....CCCC....", "............"],
  ranged: ["............", "....KK......", "..KKUUK.....", ".KU..KK.....", "KU....K.....", "KU....K.....", "KU....K.....", ".KU..KK.....", "..KKUUK.....", "....KK......", "............", "............"],
  magic: ["....QQ......", "...KQQK.....", "....KK......", "..KUK.......", "...KUK......", "....KUK.....", ".....KUK....", "......KUK...", ".......KUK..", "........KK..", "............", "............"],
  runecrafting: ["............", "............", ".....KK.....", "....KQQK....", "...KQQQQK...", "..KQQWQQQK..", "..KQQQQQQK..", "...KQQQQK...", "....KQQK....", ".....KK.....", "............", "............"],
  prayer: ["............", ".....KK.....", "....KGGK....", "....KGGK....", ".KKKGGKKK...", "KGGGGGGGGGGK", ".KKKGGKKK...", "....KGGK....", "....KGGK....", "....KGGK....", ".....KK.....", "............"],
  thieving: ["............", "............", "............", ".KKKKKKKKK..", "KXXXXXXXXXXK", "KXWWKXXKWWXK", "KXXXXXXXXXXK", ".KXXXXXXXXK.", "..KKKKKKKK..", "............", "............", "............"],
  agility: ["............", "............", "....KKK.....", "...KLLLK....", "...KLLLK....", "...KLLLK....", "...KLLLKKK..", "...KLLLLLLK.", "..KLLLLLLLK.", ".KKKKKKKKKK.", "KWWWWWWWWWWK", "KKKKKKKKKKKK"],
};

const AVATARS = {
  banker: ["............", "...KKKKKK...", "..KDDDDDDK..", "..DFFFFFFD..", "..DFKFFKFD..", "..DFFFFFFD..", "...FFFFFF...", "..KEEGGEEK..", "..KEEGGEEK..", ".KEEEGGEEEK.", ".KEEEGGEEEK.", "............"],
  shopkeeper: ["............", "...KKKKKK...", "..KLLLLLLK..", "..LFFFFFFL..", "..LFKFFKFL..", "..LFFFFFFL..", "...FFFFFF...", "..KAAAAAAK..", ".KAAWWWWAAK.", ".KAAWWWWAAK.", "..KAAAAAAK..", "............"],
  fishmonger: ["............", "...KKKKKK...", "..KbbbbbbK..", "..KFFFFFFK..", "..KFKFFKFK..", "..KFFFFFFK..", "...FFFFFF...", "..KbbbbbbK..", ".KbKQQQQKbK.", ".KbKQQQQKbK.", "..KbbbbbbK..", "............"],
  wizard: [".....KK.....", "....KMMK....", "...KMMMMK...", "..KMMMMMMK..", ".KWWWWWWWWK.", "..KFFFFFFK..", "..WFKFFKFW..", "..WWFFFFWW..", "...WWWWWW...", "..KMMMMMMK..", ".KMMMMMMMMK.", "............"],
  elderMaren: ["....KKKK....", "..KKWWWWKK..", ".KWWWWWWWWK.", ".KWFFFFFFWK.", "..WFKFFKFW..", "..WFFFFFFW..", "...FFFFFF...", "..KVVVVVVK..", ".KVKGGGGKVK.", ".KVVVVVVVVK.", "..KVVVVVVK..", "............"],
  mineForeman: ["............", "..KKKKKKKK..", ".KGGGGGGGGK.", "..KFFFFFFK..", "..KFKFFKFK..", "..KFFFFFFK..", "...KFFFFK...", "..KooooooK..", ".KoKSSSSKoK.", ".KoooooooK..", "..KooooooK..", "............"],
  captainWren: ["............", "..KKKKKKKK..", ".KbbbbbbbbK.", "..KGFFFFFK..", "..KFKFFKFK..", "..DFFFFFFD..", "..KDDDDDDK..", "...KbbbbK...", "..KbbbbbbK..", ".KbKGGGGKbK.", "..KbbbbbbK..", "............"],
  citizen: ["............", "...KKKKKK...", "..KDDDDDDK..", "..DFFFFFFD..", "..DFKFFKFD..", "..DFFFFFFD..", "...FFFFFF...", "..KRRRRRRK..", ".KRKRRRRKRK.", "..KRRRRRRK..", "..KRRRRRRK..", "............"],
  citizen2: ["............", "...KKKKKK...", "..KXXXXXXK..", "..XFFFFFFX..", "..XFKFFKFX..", "..XFFFFFFX..", "...FFFFFF...", "..KeeeeeeK..", ".KeKEEEEKeK.", "..KeeeeeeK..", "..KeeeeeeK..", "............"],
  guard: ["............", "..KKKKKKKK..", ".KSSSSSSSSK.", ".KSHHHHHHSK.", "..KFFFFFFK..", "..KFKFFKFK..", "..KFFFFFFK..", "...KFFFFK...", "..KRRRRRRK..", ".KRKSSSSKRK.", "..KRRRRRRK..", "............"],
};

const WORLD_ICONS = {
  tree: ["............", "....KKKK....", "..KKeeeeKK..", ".KeeKeeeeeK.", "KeKeeeeeeeeK", ".KeeKeeeeK..", "..KKeeeeKK..", "....KKKK....", "....KLLK....", "....KLLK....", "...KLLLK....", "............"],
  oakTree: ["............", "....KKKK....", "..KKddddKK..", ".KddKdddddK.", "KdKddddddddK", ".KddKddddK..", "..KKddddKK..", "....KKKK....", "....KOOK....", "....KOOK....", "...KOOK.....", "............"],
  fishingSpot: ["............", "............", "..KFFFK.....", ".KFFFFFK....", "KFFKFFFFFK..", ".KFFFFFK....", "..KFFFK.....", "............", ".KbK.bKbK...", "..bKbKbKb...", "............", "............"],
  range: ["............", ".....CC.....", "....CFFC....", "....CFYC....", "...KXXXXK...", "..KXXXXXXK..", "..KXKXXKXK..", "..KXXXXXXK..", "...KKKKKK...", "..KLLLLLLK..", "............", "............"],
  furnace: ["............", "..KKKKKKKK..", ".KDDDDDDDDK.", "KDCKKKKKKCDK", "KDCKFFFFKCDK", "KDCKFYYFKCDK", ".KDKFFFKDK..", "..KKKKKKKK..", ".KDDDDDDDDK.", "KDDDDDDDDDDK", "KKKKKKKKKKKK", "............"],
  anvil: ["............", "............", "............", ".KKKKKKKKK..", "KSSSSSSSSSK.", "KKSSSSSSKK..", "...KSSSK....", "...KSSSK....", "...KSSSK....", "..KSSSSSK...", ".KKKKKKKKK..", "............"],
  altar: ["............", ".....KF.....", ".....FY.....", "....KWWK....", "....KWWK....", "...KKKKKK...", "..KSSSSSSK..", "..KSKSSKSK..", "..KSSSSSSK..", ".KSSSSSSSSK.", "KSSSSSSSSSSK", "KKKKKKKKKKKK"],
  runeAltar: ["............", ".....KF.....", ".....FQ.....", "....KQQK....", "....KQQK....", "...KKKKKK...", "..KMMMMMMK..", "..KMKMMKMK..", "..KMMMMMMK..", ".KMMMMMMMMK.", "KMMMMMMMMMMK", "KKKKKKKKKKKK"],
  door: ["...KKKKKK...", "..KDDDDDDK..", ".KDLLLLLLDK.", ".KDLLKLLLDK.", ".KDLLLLLLDK.", ".KDLLLLLDGK.", ".KDLLLLLLDK.", ".KDLLLLLLDK.", ".KDLLLLLLDK.", "..KDDDDDDK..", "...KKKKKK...", "............"],
  boat: ["............", ".....KK.....", "....KWK.....", "....KWK.....", "...KWWWK....", "....KWK.....", "............", ".KKKKKKKKK..", "KLLLLLLLLLLK", ".KDLLLLLLDK.", "..KKKKKKKK..", ".b.bb.bb.b.."],
  chest: ["............", "............", "..KKKKKKKK..", ".KAAAAAAAAK.", "KAAAKKKKAAAK", "KAAAKGGKAAAK", "KAAAKGGKAAAK", ".KAAAAAAAAK.", "..KKKKKKKK..", "............", "............", "............"],
  net: ["............", ".KWKWKWKWK..", "..WKWKWKWK..", ".KWKWKWKWK..", "..WKWKWKWK..", ".KWKWKWKWK..", "..WKWKWKWK..", ".KWKWKWKWK..", "..WKWKWKWK..", ".KWKWKWKWK..", "............", "............"],
  stones: ["............", "............", "............", "....KKKK....", "..KKSSSSKK..", ".KSSHHSSSSK.", "KSSSSSSSSSSK", "KSSKSSSSKSSK", ".KSSSSSSSSK.", "..KKKKKKKK..", "............", "............"],
  wall: ["............", ".KKKKKKKKKK.", "KSKSSKSKSSKK", "KKKKKKKKKKK.", "KSSKSKSSKSKK", "KKKKKKKKKKK.", "KSKSSKSKSSKK", "KKKKKKKKKKK.", "KSSKSKSSKSKK", ".KKKKKKKKKK.", "............", "............"],
  rope: ["............", "...KKKKKK...", "..KUUKUUUK..", ".KUUK.KUUK..", ".KUK...KUK..", "..KUUKUUUK..", "...KKKKKK...", ".....KUK....", "....KUK.....", "...KUK......", "..KK........", "............"],
  stile: ["............", "..K..KK..K..", ".KLK.KLK.KL.", ".KLKKKLKKKL.", "..K..KK..K..", "..K.KKKK.K..", ".KLK.KLK.KL.", ".KLKKKLKKKL.", "..K..KK..K..", "............", "............", "............"],
  stump: ["............", "............", "............", "............", "...KKKKKK...", "..KOOOOOOK..", ".KOKKOOKKOK.", ".KOOOOOOOOK.", "..KOOOOOOK..", "...KKKKKK...", "............", "............"],
  backpack: [".....KK.....", "....KAAK....", "...KAAAAK...", "..KAAAAAAK..", ".KAAKAAKAAK.", ".KAAAAAAAAK.", "KAAAKKKKAAAK", "KAAAAAAAAAAA", "KAAAKGGKAAAK", "KAAAAAAAAAAA", ".KKKKKKKKKK.", "............"],
  scroll: ["............", "...KKKKKK...", "..KNNNNNNK..", ".KNKNNNNKNK.", "KNKNNNNNNKNK", "KNKNNVVNNKNK", "KNKNNVVNNKNK", "KNKNNNNNNKNK", ".KNKNNNNKNK.", "..KNNNNNNK..", "...KKKKKK...", "............"],
};

const pixelArtCaches = new Map();

function makePixelArt(drawing, key, scene = null) {
  if (!drawing || drawing.length !== 12 || drawing.some((row) => row.length !== 12)) {
    throw new Error(`Pixel art ${key} must be a 12x12 pixel map.`);
  }
  let cached = pixelArtCaches.get(key);
  if (!cached) {
    const pixels = document.createElement('canvas');
    pixels.width = 12;
    pixels.height = 12;
    const context = pixels.getContext('2d');
    if (!context) throw new Error('Could not create the pixel art drawing context.');
    drawing.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (!Object.hasOwn(PALETTE, pixel)) {
          throw new Error(`Unknown palette color "${pixel}" in pixel art ${key}.`);
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
    if (!scaledContext) throw new Error('Could not create the scaled pixel art context.');
    scaledContext.imageSmoothingEnabled = false;
    scaledContext.drawImage(pixels, 0, 0, 48, 48);
    cached = { dataUrl: scaled.toDataURL(), pixels, textureKey: `dreamgame-${key}` };
    pixelArtCaches.set(key, cached);
  }
  if (scene && !scene.textures.exists(cached.textureKey)) {
    const texture = scene.textures.addCanvas(cached.textureKey, cached.pixels);
    if (!texture) throw new Error(`Could not register Phaser texture for ${key}.`);
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
  return cached;
}

function pixelArtElement(drawing, key, className) {
  if (!drawing) return null;
  const art = makePixelArt(drawing, key);
  const image = document.createElement('img');
  image.className = className;
  image.src = art.dataUrl;
  image.alt = '';
  image.draggable = false;
  return image;
}

function createSkillIconElement(skill, className = 'skill-icon') {
  return pixelArtElement(SKILL_ICONS[skill], `skill-${skill}`, className);
}

function createWorldIconElement(name, className = 'tab-icon') {
  return pixelArtElement(WORLD_ICONS[name], `world-${name}`, className);
}

function createAvatarElement(avatarId, className = 'dialogue-avatar') {
  return pixelArtElement(AVATARS[avatarId], `avatar-${avatarId}`, className);
}

const AVATAR_BY_NPC_ID = {
  elderMaren: 'elderMaren',
  mineForeman: 'mineForeman',
  captainWren: 'captainWren',
};

function avatarForNode(node) {
  if (!node) return null;
  if (node.npcId && AVATAR_BY_NPC_ID[node.npcId]) return AVATAR_BY_NPC_ID[node.npcId];
  if (node.id === 'banker') return 'banker';
  if (node.id === 'shopkeeper') return 'shopkeeper';
  if (node.id === 'fishmonger') return 'fishmonger';
  if (node.id === 'wizard') return 'wizard';
  if (node.type === 'townGuard') return 'guard';
  if (node.type === 'citizen') return /-2$/.test(node.id || '') ? 'citizen2' : 'citizen';
  return null;
}

function avatarForName(name) {
  const byName = {
    Banker: 'banker',
    Shopkeeper: 'shopkeeper',
    Fishmonger: 'fishmonger',
    Wizard: 'wizard',
    'Elder Maren': 'elderMaren',
    'Mine Foreman': 'mineForeman',
    'Captain Wren': 'captainWren',
    Guard: 'guard',
    Citizen: 'citizen',
  };
  return byName[name] || null;
}

function itemVisual(itemId, scene) {
  if (!itemId || !ICONS[itemId]) return null;
  const dataUrl = makeIcon(itemId, scene);
  return dataUrl ? { dataUrl, textureKey: `dreamgame-item-${itemId}` } : null;
}

// Returns { dataUrl, textureKey } for the picture that should stand in
// the world for a node, or null to keep the legacy lettered square.
function worldVisualForNode(node, scene = null) {
  if (!node) return null;
  if (node.id === 'bank-chest') return makePixelArt(WORLD_ICONS.chest, 'world-chest', scene);
  const avatarId = avatarForNode(node);
  if (avatarId) return makePixelArt(AVATARS[avatarId], `avatar-${avatarId}`, scene);
  if (node.type === 'ore') return itemVisual(node.itemId, scene);
  if (node.type === 'marketStall') {
    const stall = window.THIEVING_STALLS?.[node.stallId];
    return itemVisual(stall?.itemId, scene);
  }
  if (node.type === 'agilityObstacle') {
    if (node.id.includes('log')) return itemVisual('logs', scene);
    if (node.id.includes('branch')) return makePixelArt(WORLD_ICONS.tree, 'world-tree', scene);
    if (node.id.includes('net')) return makePixelArt(WORLD_ICONS.net, 'world-net', scene);
    if (node.id.includes('stones')) return makePixelArt(WORLD_ICONS.stones, 'world-stones', scene);
    if (node.id.includes('wall')) return makePixelArt(WORLD_ICONS.wall, 'world-wall', scene);
    if (node.id.includes('rope')) return makePixelArt(WORLD_ICONS.rope, 'world-rope', scene);
    return null;
  }
  if (node.type === 'tree' || node.type === 'oak') {
    // Pre-register the stump so a depleted tree can swap its picture.
    makePixelArt(WORLD_ICONS.stump, 'world-stump', scene);
    const name = node.type === 'oak' ? 'oakTree' : 'tree';
    return makePixelArt(WORLD_ICONS[name], `world-${name}`, scene);
  }
  const byType = {
    fishing: 'fishingSpot',
    range: 'range',
    furnace: 'furnace',
    anvil: 'anvil',
    altar: 'altar',
    runeAltar: 'runeAltar',
    interiorDoor: 'door',
    boat: 'boat',
    shortcut: 'stile',
  };
  const worldName = byType[node.type];
  if (worldName) return makePixelArt(WORLD_ICONS[worldName], `world-${worldName}`, scene);
  return null;
}

window.SKILL_ICONS = SKILL_ICONS;
window.AVATARS = AVATARS;
window.WORLD_ICONS = WORLD_ICONS;
window.makePixelArt = makePixelArt;
window.createSkillIconElement = createSkillIconElement;
window.createWorldIconElement = createWorldIconElement;
window.createAvatarElement = createAvatarElement;
window.avatarForNode = avatarForNode;
window.avatarForName = avatarForName;
window.worldVisualForNode = worldVisualForNode;

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
      if (itemTooltipState.pinnedUntil && Date.now() < itemTooltipState.pinnedUntil) return;
      itemTooltipState.owner = null;
      itemTooltipState.element.style.display = 'none';
    }
  });

  // Touch: a long-press (450ms) pins the tooltip at the touch point so phone
  // players can read item names too, and the click generated by lifting the
  // finger is swallowed so inspecting an item never uses, buys, or eats it.
  let pressTimer = null;
  const cancelPress = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };
  element.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    cancelPress();
    pressTimer = setTimeout(() => {
      pressTimer = null;
      itemTooltipState.pinnedUntil = Date.now() + 3500;
      element.dispatchEvent(new PointerEvent('pointerenter', {
        clientX: event.clientX,
        clientY: event.clientY,
      }));
      const swallow = (clickEvent) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
      };
      document.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => document.removeEventListener('click', swallow, { capture: true }), 600);
      setTimeout(() => {
        if (itemTooltipState.owner === element
          && itemTooltipState.pinnedUntil
          && Date.now() >= itemTooltipState.pinnedUntil) {
          itemTooltipState.owner = null;
          if (itemTooltipState.element) itemTooltipState.element.style.display = 'none';
        }
      }, 3600);
    }, 450);
  });
  element.addEventListener('pointerup', cancelPress);
  element.addEventListener('pointercancel', cancelPress);
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
  ashHound: {
    name: 'Ash hound',
    hp: 38,
    maxHit: 5,
    attack: 7,
    defence: 5,
    region: 'wastes',
    respawnMs: 15000,
    drops: [
      { itemId: 'bones', qty: 1, chance: 1.0 },
      { itemId: 'coins', qty: '20-50', chance: 0.65 },
      { itemId: 'coal', qty: 1, chance: 0.25 },
      { itemId: 'steelBar', qty: 1, chance: 0.03 },
    ],
  },
  emberfang: {
    name: 'Emberfang',
    hp: 120,
    maxHit: 8,
    attack: 12,
    defence: 10,
    region: 'wastes',
    respawnMs: 60000,
    drops: [
      { itemId: 'emberfangPelt', qty: 1, chance: 1.0 },
      { itemId: 'coins', qty: '150-300', chance: 1.0 },
      { itemId: 'bones', qty: 1, chance: 1.0 },
      { itemId: 'emberbrand', qty: 1, chance: 0.25 },
    ],
  },
  reefLurker: {
    name: 'Reef lurker',
    hp: 65,
    maxHit: 7,
    attack: 10,
    defence: 8,
    region: 'stormcove',
    respawnMs: 20000,
    drops: [
      { itemId: 'bones', qty: 1, chance: 1.0 },
      { itemId: 'coins', qty: '40-90', chance: 0.65 },
      { itemId: 'coal', qty: 1, chance: 0.2 },
      { itemId: 'mithrilOre', qty: 1, chance: 0.12 },
    ],
  },
  stormmaw: {
    name: 'Stormmaw',
    hp: 180,
    maxHit: 11,
    attack: 16,
    defence: 14,
    region: 'stormcove',
    respawnMs: 90000,
    drops: [
      { itemId: 'leviathanScale', qty: 1, chance: 1.0 },
      { itemId: 'coins', qty: '300-600', chance: 1.0 },
      { itemId: 'bones', qty: 1, chance: 1.0 },
      { itemId: 'stormbrand', qty: 1, chance: 0.25 },
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
  coal: 12,
  steelBar: 180,
  mithrilOre: 45,
  mithrilBar: 420,
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
  steelDagger: 190,
  steelSword: 430,
  steelKiteshield: 720,
  emberbrand: 1200,
  emberfangPelt: 500,
  mithrilDagger: 460,
  mithrilSword: 980,
  mithrilKiteshield: 1600,
  stormbrand: 2500,
  leviathanScale: 900,
  bronzeArrow: 3,
  ironArrow: 6,
  steelArrow: 10,
  mithrilArrow: 16,
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
  steelDagger: { bars: 1, level: 30, xpPerBar: 30, barId: 'steelBar' },
  steelSword: { bars: 2, level: 35, xpPerBar: 30, barId: 'steelBar' },
  steelKiteshield: { bars: 3, level: 40, xpPerBar: 30, barId: 'steelBar' },
  steelArrowheads: { bars: 1, level: 30, xpPerBar: 30, yields: 15, barId: 'steelBar' },
  mithrilDagger: { bars: 1, level: 45, xpPerBar: 40, barId: 'mithrilBar' },
  mithrilSword: { bars: 2, level: 50, xpPerBar: 40, barId: 'mithrilBar' },
  mithrilKiteshield: { bars: 3, level: 55, xpPerBar: 40, barId: 'mithrilBar' },
  mithrilArrowheads: { bars: 1, level: 45, xpPerBar: 40, yields: 15, barId: 'mithrilBar' },
};

const ABILITY_MODS = {
  power: {
    tiers: {
      tier1: [
        { id: 'precise', name: 'Precise Strike', skill: 'attack', level: 10, desc: "Your ability's accuracy bonus is doubled." },
        { id: 'heavy', name: 'Heavy Strike', skill: 'strength', level: 10, desc: "Your ability's bonus damage is doubled." },
      ],
      tier2: [
        { id: 'piercing', name: 'Piercing Strike', skill: 'attack', level: 25, desc: "Your ability ignores half the monster's Defence." },
        { id: 'crushing', name: 'Crushing Blow', skill: 'strength', level: 25, desc: 'Ability hits have a 25% chance to stagger — the monster loses its next turn.' },
      ],
      tier3: [
        { id: 'flurry', name: 'Flurry', skill: 'attack', level: 40, desc: 'Your ability strikes a second time for 60% damage.' },
        { id: 'executioner', name: 'Executioner', skill: 'strength', level: 40, desc: 'Your ability deals 50% more damage to enemies below 30% HP.' },
      ],
    },
  },
  heal: {
    tiers: {
      tier1: [
        { id: 'deepBreath', name: 'Deep Breath', skill: 'defence', level: 10, desc: 'Second Wind heals +2 more HP.' },
        { id: 'ironLungs', name: 'Iron Lungs', skill: 'defence', level: 10, desc: "Second Wind's cooldown drops from 4 turns to 3." },
      ],
      tier2: [
        { id: 'battleMend', name: 'Battle Mend', skill: 'defence', level: 25, desc: "Second Wind also raises your Guard for the monster's next hit." },
        { id: 'fieldDressing', name: 'Field Dressing', skill: 'defence', level: 25, desc: 'Second Wind heals +1 HP per 10 Defence levels.' },
      ],
      tier3: [
        { id: 'secondHeart', name: 'Second Heart', skill: 'defence', level: 40, desc: 'Second Wind heals at least 25% of your max HP.' },
        { id: 'rally', name: 'Rally', skill: 'defence', level: 40, desc: "Second Wind also resets your power ability's cooldown." },
      ],
    },
  },
};

const INTERIOR_ROOMS = {
  bank: { x: 110, y: 10, width: 12, height: 9, doorX: 115, exterior: { x: 18, y: 14 }, doorTile: { x: 18, y: 13 } },
  store: { x: 110, y: 30, width: 12, height: 9, doorX: 115, exterior: { x: 22, y: 14 }, doorTile: { x: 22, y: 13 } },
  smithy: { x: 110, y: 50, width: 12, height: 9, doorX: 115, exterior: { x: 27, y: 14 }, doorTile: { x: 27, y: 13 } },
  chapel: { x: 110, y: 90, width: 10, height: 8, doorX: 115, exterior: { x: 23, y: 10 }, doorTile: { x: 23, y: 9 } },
  tower: { x: 110, y: 130, width: 10, height: 8, doorX: 115, exterior: { x: 15, y: 10 }, doorTile: { x: 14, y: 10 } },
  essenceMine: { x: 110, y: 60, width: 12, height: 9, doorX: 115, exterior: { x: 112, y: 132 }, name: 'Essence Mine' },
  mineDepths: { x: 110, y: 140, width: 14, height: 9, doorX: 116, exterior: { x: 19, y: 1 }, name: 'Mine Depths' },
  emberfangLair: { x: 110, y: 80, width: 14, height: 9, doorX: 117, exterior: { x: 65, y: 8 }, doorTile: { x: 65, y: 7 }, name: 'Emberfang Lair' },
  stormmawLair: { x: 110, y: 100, width: 14, height: 9, doorX: 117, exterior: { x: 60, y: 74 }, doorTile: { x: 60, y: 73 }, name: 'Stormmaw Lair' },
  fishShop: { x: 110, y: 70, width: 12, height: 9, doorX: 115, exterior: { x: 27, y: 60 }, doorTile: { x: 27, y: 59 }, name: 'Fish Market' },
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
