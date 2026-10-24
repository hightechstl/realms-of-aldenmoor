(() => {
  let activePanel = null;
  let activeNpc = null;
  let activeCharacter = null;
  let activeView = 'bank';
  let activeDialogue = null;
  let savedSidebarTab = 'skills';

  function openTownInterface(type, npc, character = loadCharacter()) {
    closeTownInterface();
    activeNpc = npc;
    activeCharacter = character;
    activeView = type === 'bank' ? 'bank' : 'shop';
    const shopName = activeView === 'shop'
      ? activeNpc?.shopId === 'magic' ? 'Magic Shop' : activeNpc?.shopId === 'fish' ? 'Fish Market' : 'General Store'
      : null;
    const sidebar = document.querySelector('#sidebar');
    const tabs = document.querySelector('.sidebar-tabs');
    const skills = document.querySelector('#skills-panel');
    const inventory = document.querySelector('#inventory-panel');
    const quests = document.querySelector('#quests-panel');
    const equipment = document.querySelector('#equipment-panel');
    const spellbook = document.querySelector('#spellbook-panel');
    savedSidebarTab = currentSidebarTab();
    tabs.hidden = true;
    skills.hidden = true;
    inventory.hidden = true;
    if (quests) quests.hidden = true;
    if (equipment) equipment.hidden = true;
    if (spellbook) spellbook.hidden = true;

    activePanel = document.createElement('section');
    activePanel.className = 'town-panel';
    activePanel.setAttribute('aria-label', type === 'bank' ? 'Bank' : shopName);
    sidebar.insertBefore(activePanel, document.querySelector('#sidebar-footer'));
    window.addGameMessage?.(type === 'bank'
      ? 'Banker: Welcome to the Bank of Emberfall.'
      : `${activeNpc?.displayName || 'Shopkeeper'}: Take a look at my wares.`);
    renderPanel(character);
  }

  function closeTownInterface() {
    if (!activePanel) return;
    activePanel.remove();
    activePanel = null;
    activeNpc = null;
    activeCharacter = null;
    activeDialogue = null;
    document.querySelector('.sidebar-tabs').hidden = false;
    ['skills', 'inventory', 'quests', 'equipment', 'spellbook'].forEach((tab) => {
      const panel = document.querySelector(`#${tab}-panel`);
      const button = document.querySelector(`#${tab}-tab`);
      if (panel) panel.hidden = savedSidebarTab !== tab;
      if (button) button.setAttribute('aria-selected', String(savedSidebarTab === tab));
    });
  }

  function currentSidebarTab() {
    return ['skills', 'inventory', 'quests', 'equipment', 'spellbook'].find((tab) => (
      document.querySelector(`#${tab}-tab`)?.getAttribute('aria-selected') === 'true'
    )) || 'skills';
  }

  function openDialogueInterface(speaker, lines, npc, onComplete, character = loadCharacter()) {
    closeTownInterface();
    activeNpc = npc;
    activeCharacter = character;
    activeView = 'dialogue';
    activeDialogue = { speaker, lines, index: 0, onComplete };
    savedSidebarTab = currentSidebarTab();
    const sidebar = document.querySelector('#sidebar');
    document.querySelector('.sidebar-tabs').hidden = true;
    ['skills', 'inventory', 'quests', 'equipment', 'spellbook'].forEach((tab) => {
      const panel = document.querySelector(`#${tab}-panel`);
      if (panel) panel.hidden = true;
    });
    activePanel = document.createElement('section');
    activePanel.className = 'town-panel dialogue-panel';
    activePanel.setAttribute('aria-label', `${speaker} dialogue`);
    sidebar.insertBefore(activePanel, document.querySelector('#sidebar-footer'));
    renderPanel(character);
  }

  function updateTownDistance(tile) {
    if (!activePanel || !activeNpc) return;
    const distance = Math.abs(tile.x - activeNpc.tile.x) + Math.abs(tile.y - activeNpc.tile.y);
    if (distance > 2) closeTownInterface();
  }

  function refreshTownPanel(character) {
    if (activePanel && character) {
      activeCharacter = character;
      renderPanel(character);
    }
  }

  function renderPanel(character = activeCharacter) {
    if (!activePanel || !character) return;
    activePanel.replaceChildren();
    const header = document.createElement('header');
    header.className = 'town-panel-header';
    const title = document.createElement('strong');
    title.textContent = activeView === 'dialogue'
      ? 'Dialogue'
      : activeView === 'shop'
        ? activeNpc?.shopId === 'magic' ? 'Magic Shop' : activeNpc?.shopId === 'fish' ? 'Fish Market' : 'General Store'
        : activeView === 'backpack' ? 'Backpack' : 'Bank';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'town-close';
    close.textContent = 'Close';
    close.addEventListener('click', closeTownInterface);
    header.append(title, close);
    activePanel.append(header);

    const subTabs = document.createElement('nav');
    subTabs.className = 'town-subtabs';
    if (activeNpc?.type === 'banker') {
      [
        ['bank', 'Bank'],
        ['backpack', 'Backpack'],
      ].forEach(([view, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.setAttribute('aria-selected', String(activeView === view));
        button.addEventListener('click', () => {
          activeView = view;
          renderPanel(character);
        });
        subTabs.append(button);
      });
      activePanel.append(subTabs);
    }

    if (activeView === 'dialogue') renderDialogue();
    else if (activeView === 'bank') renderBank(character);
    else if (activeView === 'backpack') renderBankBackpack(character);
    else renderShop(character);
  }

  function renderDialogue() {
    const dialogue = activeDialogue;
    if (!dialogue) return;
    const speaker = document.createElement('h3');
    speaker.className = 'dialogue-speaker';
    speaker.textContent = dialogue.speaker;
    const text = document.createElement('p');
    text.className = 'town-note dialogue-text';
    text.textContent = dialogue.lines[dialogue.index].text;
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'town-action';
    next.textContent = 'Continue';
    next.addEventListener('click', () => {
      dialogue.lines[dialogue.index].onContinue?.();
      dialogue.index += 1;
      if (dialogue.index >= dialogue.lines.length) {
        const onComplete = dialogue.onComplete;
        closeTownInterface();
        onComplete?.();
      } else {
        renderPanel(activeCharacter);
      }
    });
    activePanel.append(speaker, text, next);
  }

  function renderBank(character) {
    character.bank = normalizeBank(character.bank);
    const depositAll = document.createElement('button');
    depositAll.type = 'button';
    depositAll.className = 'town-action';
    depositAll.textContent = 'Deposit All';
    depositAll.addEventListener('click', () => depositAllItems(character));
    activePanel.append(depositAll);

    const list = document.createElement('div');
    list.className = 'town-list';
    character.bank.forEach((entry, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'town-row';
      button.append(
        window.createItemIconElement?.(entry.itemId) || createItemCode(entry.itemId),
        createItemLabel(`${ITEMS[entry.itemId].name} ×${entry.qty}`),
      );
      window.attachItemTooltip?.(button, entry.itemId, '', entry.qty);
      button.setAttribute('aria-label', `${ITEMS[entry.itemId].name} x${entry.qty}. Click to withdraw as much as your backpack can hold.`);
      button.addEventListener('click', () => withdrawBankEntry(character, index));
      list.append(button);
    });
    if (!character.bank.length) list.append(emptyNotice('Your bank is empty.'));
    activePanel.append(list);
  }

  function renderBankBackpack(character) {
    const note = document.createElement('p');
    note.className = 'town-note';
    note.textContent = 'Select a backpack slot to deposit it. Coins stay in your backpack.';
    activePanel.append(note);
    const grid = document.createElement('div');
    grid.className = 'inventory-grid town-inventory-grid';
    normalizeInventory(character.inventory).forEach((slot, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `inventory-slot${slot ? ' filled' : ''}`;
      button.disabled = !slot;
      button.dataset.slot = String(index);
      if (slot) {
        button.style.backgroundColor = '#313941';
        button.append(window.createItemIconElement?.(slot.itemId) || createItemCode(slot.itemId));
        window.attachItemTooltip?.(
          button,
          slot.itemId,
          window.inventoryTooltipContext?.(slot.itemId) || '',
          slot.qty,
        );
        if (slot.qty > 1) {
          const quantity = document.createElement('span');
          quantity.className = 'inventory-qty';
          quantity.textContent = slot.qty.toLocaleString();
          button.append(quantity);
        }
        button.addEventListener('click', () => depositInventorySlot(character, index));
      }
      grid.append(button);
    });
    activePanel.append(grid);
  }

  function renderShop(character) {
    const shop = activeShop();
    const coins = countItem(character, 'coins');
    const balance = document.createElement('p');
    balance.className = 'town-note';
    balance.textContent = `Coins: ${coins}`;
    activePanel.append(balance);

    const buyHeading = document.createElement('h3');
    buyHeading.textContent = 'For sale';
    activePanel.append(buyHeading);
    const discount = RACES[character.raceId]?.qol.shopDiscount ?? 1;
    Object.entries(shop.sells).forEach(([itemId, basePrice]) => {
      const price = Math.floor(basePrice * discount);
      const buy = document.createElement('button');
      buy.type = 'button';
      buy.className = 'town-row';
      buy.append(
        window.createItemIconElement?.(itemId) || createItemCode(itemId),
        createItemLabel(ITEMS[itemId].name),
        createItemLabel(`${price} coins`),
      );
      window.attachItemTooltip?.(buy, itemId, `Buy: ${price} coins`);
      buy.disabled = coins < price || canAddItem(character, itemId, 1) < 1;
      buy.addEventListener('click', () => buyShopItem(character, itemId, price));
      activePanel.append(buy);
    });

    const sellHeading = document.createElement('h3');
    sellHeading.textContent = 'Sell from backpack';
    activePanel.append(sellHeading);
    const list = document.createElement('div');
    list.className = 'town-list';
    normalizeInventory(character.inventory).forEach((slot, index) => {
      if (!slot) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'town-row';
      const price = activeShop().buys[slot.itemId];
      const priceText = price !== undefined ? `${price} coins each` : slot.itemId === 'burntFish' ? 'Refused' : 'Not for sale';
      button.append(
        window.createItemIconElement?.(slot.itemId) || createItemCode(slot.itemId),
        createItemLabel(`${ITEMS[slot.itemId].name} ×${slot.qty}`),
        createItemLabel(priceText),
      );
      button.setAttribute('aria-label', `${ITEMS[slot.itemId].name} x${slot.qty}. Click to sell one; Shift-click to sell this whole slot.`);
      window.attachItemTooltip?.(
        button,
        slot.itemId,
        price !== undefined ? `Sell: ${price} coins` : '',
        slot.qty,
      );
      button.addEventListener('click', (event) => sellSlot(character, index, event.shiftKey));
      list.append(button);
    });
    if (!list.childElementCount) list.append(emptyNotice('Nothing in your backpack to sell.'));
    activePanel.append(list);
  }

  function createItemCode(itemId) {
    const fallback = document.createElement('span');
    fallback.className = 'town-item-code';
    fallback.textContent = ITEMS[itemId].code;
    return fallback;
  }

  function createItemLabel(text) {
    const label = document.createElement('span');
    label.textContent = text;
    return label;
  }

  function depositInventorySlot(character, index) {
    const slot = character.inventory[index];
    if (!slot) return;
    if (slot.itemId === 'coins') {
      window.addGameMessage?.('Coins stay in your inventory.');
      return;
    }
    const deposited = removeInventorySlot(character, index);
    if (!deposited) return;
    addBankItem(character, deposited.itemId, deposited.qty);
    saveCharacter(character);
    renderPanel(character);
  }

  function depositAllItems(character) {
    character.inventory = normalizeInventory(character.inventory);
    character.inventory.forEach((slot) => {
      if (slot && slot.itemId !== 'coins') {
        addBankItem(character, slot.itemId, slot.qty);
        slot.itemId = null;
      }
    });
    character.inventory = character.inventory.map((slot) => (slot?.itemId ? slot : null));
    inventoryChanged(character);
  }

  function addBankItem(character, itemId, qty) {
    if (itemId === 'coins') return;
    character.bank = normalizeBank(character.bank);
    const existing = character.bank.find((entry) => entry.itemId === itemId);
    if (existing) existing.qty += qty;
    else character.bank.push({ itemId, qty });
  }

  function withdrawBankEntry(character, index) {
    const entry = character.bank[index];
    if (!entry) return;
    const itemId = entry.itemId;
    const bankQty = entry.qty;
    const amount = canAddItem(character, itemId, bankQty);
    if (amount <= 0) {
      window.addGameMessage?.('Your inventory is too full.');
      return;
    }
    addItem(character, itemId, amount);
    const updatedEntry = character.bank.find((bankEntry) => bankEntry.itemId === itemId);
    if (updatedEntry) updatedEntry.qty -= amount;
    character.bank = character.bank.filter((bankEntry) => bankEntry.qty > 0);
    saveCharacter(character);
    renderPanel(character);
    if (amount < bankQty) window.addGameMessage?.('Your inventory is too full.');
  }

  function sellSlot(character, index, all) {
    const slot = character.inventory[index];
    if (!slot) return;
    if (slot.itemId === 'burntFish') {
      window.addGameMessage?.("The shopkeeper doesn't want your burnt fish.");
      return;
    }
    if (ITEMS[slot.itemId].unsellable) {
      window.addGameMessage?.("The shopkeeper won't buy that.");
      return;
    }
    const price = activeShop().buys[slot.itemId];
    if (price === undefined) return;
    const quantity = all ? slot.qty : 1;
    if (!removeItemFromSlot(character, index, quantity)) return;
    addItem(character, 'coins', price * quantity);
    renderPanel(character);
  }

  function buyShopItem(character, itemId, price) {
    if (countItem(character, 'coins') < price || canAddItem(character, itemId, 1) < 1) {
      if (canAddItem(character, itemId, 1) < 1) window.addGameMessage?.('Your inventory is too full.');
      return;
    }
    removeItem(character, 'coins', price);
    addItem(character, itemId, 1);
    renderPanel(character);
  }

  function activeShop() {
    return SHOPS[activeNpc?.shopId] || SHOPS.general;
  }

  function emptyNotice(text) {
    const notice = document.createElement('p');
    notice.className = 'town-note';
    notice.textContent = text;
    return notice;
  }

  window.openTownInterface = openTownInterface;
  window.openDialogueInterface = openDialogueInterface;
  window.closeTownInterface = closeTownInterface;
  window.updateTownDistance = updateTownDistance;
  window.refreshTownPanel = refreshTownPanel;
})();
