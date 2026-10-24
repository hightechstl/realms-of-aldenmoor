const INVENTORY_SLOT_COUNT = 28;
let inventoryCharacter = null;

const originalLoadCharacter = window.loadCharacter;
if (typeof originalLoadCharacter === 'function') {
  window.loadCharacter = function (...args) {
    inventoryCharacter = originalLoadCharacter.apply(this, args);
    return inventoryCharacter;
  };
}

const originalSaveCharacter = window.saveCharacter;
if (typeof originalSaveCharacter === 'function') {
  window.saveCharacter = function (character, ...args) {
    inventoryCharacter = character;
    return originalSaveCharacter.call(this, character, ...args);
  };
}

function inventoryStackLimit(character, itemId) {
  if (itemId === 'coins') return Infinity;
  if (ITEMS[itemId].stackable) return Infinity;
  const oreLimit = RACES[character.raceId]?.qol.oreStacking;
  if (oreLimit && (itemId === 'copperOre' || itemId === 'tinOre')) return oreLimit;
  return 1;
}

function handleBackpackItemClick(character, index) {
  const slot = character.inventory[index];
  if (!slot) return false;
  if (slot.itemId === 'logs') {
    if (!removeItemFromSlot(character, index, 1)) return true;
    if (addItem(character, 'arrowShafts', 15) !== 0) {
      addItem(character, 'logs', 1);
      return true;
    }
    const result = addXp(character, 'fletching', 10);
    window.handleCombatXp?.('fletching', result, window.activePrayerScene?.());
    window.addGameMessage?.('You fletch 15 arrow shafts.');
    return true;
  }
  if (slot.itemId === 'bronzeArrowheads') {
    if (countItem(character, 'arrowShafts') < 15 || countItem(character, 'bronzeArrowheads') < 15) {
      window.addGameMessage?.('You need arrow shafts and bronze arrowheads to fletch arrows (15 each).');
      return true;
    }
    removeItem(character, 'arrowShafts', 15);
    removeItem(character, 'bronzeArrowheads', 15);
    if (addItem(character, 'bronzeArrow', 15) !== 0) {
      throw new Error('Could not add fletched arrows after consuming the required materials.');
    }
    const result = addXp(character, 'fletching', 15);
    window.handleCombatXp?.('fletching', result, window.activePrayerScene?.());
    window.addGameMessage?.('You fletch 15 bronze arrows.');
    return true;
  }
  if (slot.itemId === 'ironArrowheads') {
    if (countItem(character, 'arrowShafts') < 15 || countItem(character, 'ironArrowheads') < 15) {
      window.addGameMessage?.('You need arrow shafts and iron arrowheads to fletch arrows (15 each).');
      return true;
    }
    removeItem(character, 'arrowShafts', 15);
    removeItem(character, 'ironArrowheads', 15);
    if (addItem(character, 'ironArrow', 15) !== 0) {
      throw new Error('Could not add fletched arrows after consuming the required materials.');
    }
    const result = addXp(character, 'fletching', 20);
    window.handleCombatXp?.('fletching', result, window.activePrayerScene?.());
    window.addGameMessage?.('You fletch 15 iron arrows.');
    return true;
  }
  if (slot.itemId === 'steelArrowheads') {
    if (countItem(character, 'arrowShafts') < 15 || countItem(character, 'steelArrowheads') < 15) {
      window.addGameMessage?.('You need arrow shafts and steel arrowheads to fletch arrows (15 each).');
      return true;
    }
    removeItem(character, 'arrowShafts', 15);
    removeItem(character, 'steelArrowheads', 15);
    if (addItem(character, 'steelArrow', 15) !== 0) {
      throw new Error('Could not add fletched arrows after consuming the required materials.');
    }
    const result = addXp(character, 'fletching', 25);
    window.handleCombatXp?.('fletching', result, window.activePrayerScene?.());
    window.addGameMessage?.('You fletch 15 steel arrows.');
    return true;
  }
  return false;
}

function canAddItem(character, itemId, qty) {
  if (!ITEMS[itemId]) throw new Error(`Unknown item: ${itemId}`);
  character.inventory = normalizeInventory(character.inventory);
  const stackLimit = inventoryStackLimit(character, itemId);
  let capacity = character.inventory.reduce((total, slot) => {
    if (slot?.itemId === itemId && stackLimit > 1) {
      return total + Math.max(0, stackLimit - slot.qty);
    }
    return total;
  }, 0);
  const emptySlots = character.inventory.filter((slot) => slot === null).length;
  capacity += stackLimit === Infinity ? (emptySlots > 0 ? Infinity : 0) : emptySlots * stackLimit;
  return Math.min(qty, capacity);
}

function addItem(character, itemId, qty) {
  if (!ITEMS[itemId]) throw new Error(`Unknown item: ${itemId}`);
  if (!Number.isInteger(qty) || qty < 0) throw new Error('Item quantity must be a non-negative integer.');
  character.inventory = normalizeInventory(character.inventory);
  const stackLimit = inventoryStackLimit(character, itemId);
  let remaining = qty;

  if (stackLimit > 1) {
    for (const slot of character.inventory) {
      if (slot?.itemId !== itemId || slot.qty >= stackLimit) continue;
      const added = Math.min(remaining, stackLimit - slot.qty);
      slot.qty += added;
      remaining -= added;
      if (remaining === 0) break;
    }
  }

  while (remaining > 0) {
    const emptyIndex = character.inventory.findIndex((slot) => slot === null);
    if (emptyIndex === -1) break;
    const added = Math.min(remaining, stackLimit);
    character.inventory[emptyIndex] = { itemId, qty: added };
    remaining -= added;
  }

  if (remaining !== qty) inventoryChanged(character);
  if (remaining > 0) {
    window.addGameMessage?.('Your inventory is too full.');
  }
  return remaining;
}

function removeItem(character, itemId, qty) {
  if (!Number.isInteger(qty) || qty < 0) throw new Error('Item quantity must be a non-negative integer.');
  character.inventory = normalizeInventory(character.inventory);
  if (countItem(character, itemId) < qty) return false;
  let remaining = qty;

  for (let index = character.inventory.length - 1; index >= 0 && remaining > 0; index -= 1) {
    const slot = character.inventory[index];
    if (slot?.itemId !== itemId) continue;
    const removed = Math.min(remaining, slot.qty);
    slot.qty -= removed;
    remaining -= removed;
    if (slot.qty === 0) character.inventory[index] = null;
  }

  if (qty > 0) inventoryChanged(character);
  return true;
}

function removeInventorySlot(character, index) {
  character.inventory = normalizeInventory(character.inventory);
  if (!Number.isInteger(index) || index < 0 || index >= character.inventory.length) return null;
  return removeItemFromSlot(character, index, character.inventory[index]?.qty);
}

function removeItemFromSlot(character, index, qty) {
  character.inventory = normalizeInventory(character.inventory);
  if (!Number.isInteger(index) || index < 0 || index >= character.inventory.length) return null;
  const slot = character.inventory[index];
  if (!slot || !Number.isInteger(qty) || qty <= 0 || qty > slot.qty) return null;
  const removed = { itemId: slot.itemId, qty };
  slot.qty -= qty;
  if (slot.qty === 0) character.inventory[index] = null;
  inventoryChanged(character);
  return removed;
}

function countItem(character, itemId) {
  return (character.inventory || []).reduce(
    (total, slot) => total + (slot?.itemId === itemId ? slot.qty : 0),
    0,
  );
}

function inventoryTooltipContext(itemId) {
  const healing = ITEMS[itemId]?.heals;
  const suffixes = [];
  if (Number.isFinite(healing)) suffixes.push(`(heals ${healing})`);
  if (ITEMS[itemId]?.equip) suffixes.push('(click to equip)');
  return suffixes.join(' ');
}

function sortInventory(character) {
  character.inventory = normalizeInventory(character.inventory);
  const totals = new Map();
  character.inventory.forEach((slot) => {
    if (slot) totals.set(slot.itemId, (totals.get(slot.itemId) || 0) + slot.qty);
  });

  const sortedItems = [...totals.keys()].sort((firstId, secondId) => (
    (ITEMS[firstId].sortOrder ?? 99) - (ITEMS[secondId].sortOrder ?? 99)
    || ITEMS[firstId].name.localeCompare(ITEMS[secondId].name)
    || firstId.localeCompare(secondId)
  ));
  const sortedSlots = [];
  sortedItems.forEach((itemId) => {
    let remaining = totals.get(itemId);
    const stackLimit = inventoryStackLimit(character, itemId);
    while (remaining > 0) {
      const qty = Math.min(remaining, stackLimit);
      sortedSlots.push({ itemId, qty });
      remaining -= qty;
    }
  });

  if (sortedSlots.length > INVENTORY_SLOT_COUNT) {
    throw new Error('Cannot sort inventory without losing items.');
  }
  character.inventory = [...sortedSlots, ...Array(INVENTORY_SLOT_COUNT - sortedSlots.length).fill(null)];

  const afterTotals = new Map();
  character.inventory.forEach((slot) => {
    if (slot) afterTotals.set(slot.itemId, (afterTotals.get(slot.itemId) || 0) + slot.qty);
  });
  if (
    totals.size !== afterTotals.size
    || [...totals].some(([itemId, qty]) => afterTotals.get(itemId) !== qty)
  ) {
    throw new Error('Inventory sort changed item quantities.');
  }

  inventoryChanged(character);
  window.addGameMessage?.('Backpack sorted.');
}

function inventoryChanged(character) {
  inventoryCharacter = character;
  grantPendingStarterCoins(character);
  saveCharacter(character);
  window.refreshInventoryHud?.(character);
  window.refreshEquipmentHud?.(character);
  window.refreshSpellbookHud?.(character);
  window.refreshTownPanel?.(character);
  window.onPrayerInventoryChanged?.(character);
}

function addInventorySortButton() {
  const panel = document.querySelector('.inventory-hud');
  if (!panel) return;
  if (panel.querySelector('.inventory-sort-button')) {
    addInventoryDropButton(panel);
    return;
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'inventory-sort-button';
  button.textContent = 'Sort';
  Object.assign(button.style, {
    display: 'block',
    width: '100%',
    margin: '0 0 8px',
    padding: '6px 10px',
    border: '1px solid #8d744e',
    borderRadius: '4px',
    background: '#51402e',
    color: '#f0d9aa',
    font: '600 12px system-ui, sans-serif',
    cursor: 'pointer',
  });
  button.addEventListener('click', () => {
    if (!inventoryCharacter) throw new Error('Cannot sort because the active character is unavailable.');
    sortInventory(inventoryCharacter);
  });
  panel.prepend(button);
  addInventoryDropButton(panel);
}

let dropMode = false;

function isDropMode() {
  return dropMode;
}

function addInventoryDropButton(panel) {
  if (panel.querySelector('.inventory-drop-button')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'inventory-drop-button';
  button.textContent = 'Drop';
  Object.assign(button.style, {
    display: 'block',
    width: '100%',
    margin: '0 0 8px',
    padding: '6px 10px',
    border: '1px solid #8d744e',
    borderRadius: '4px',
    background: '#51402e',
    color: '#f0d9aa',
    font: '600 12px system-ui, sans-serif',
    cursor: 'pointer',
  });
  button.addEventListener('click', () => {
    dropMode = !dropMode;
    button.textContent = dropMode ? 'Drop: ON' : 'Drop';
    button.style.background = dropMode ? '#7a2e2e' : '#51402e';
    window.addGameMessage?.(dropMode
      ? 'Drop mode is on — tap a backpack item to drop it. Tap Drop again to turn it off.'
      : 'Drop mode is off.');
  });
  const sortButton = panel.querySelector('.inventory-sort-button');
  if (sortButton) sortButton.after(button);
  else panel.prepend(button);
}

window.isDropMode = isDropMode;

const inventoryPanel = document.querySelector('#inventory-panel');
if (inventoryPanel) {
  new MutationObserver(addInventorySortButton).observe(inventoryPanel, {
    childList: true,
    subtree: true,
  });
}

window.sortInventory = sortInventory;
window.inventoryTooltipContext = inventoryTooltipContext;
window.handleBackpackItemClick = handleBackpackItemClick;
