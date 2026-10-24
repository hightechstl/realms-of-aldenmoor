(() => {
  const EQUIPMENT_SLOTS = [
    ['weapon', 'Weapon'],
    ['shield', 'Shield'],
    ['ammo', 'Ammo'],
  ];
  const COMBAT_STYLES = [
    ['accurate', 'Accurate', 'Attack XP'],
    ['aggressive', 'Aggressive', 'Strength XP'],
    ['defensive', 'Defensive', 'Defence XP'],
    ['controlled', 'Controlled', 'all three shared'],
  ];
  const RANGED_STYLES = [
    ['accurate', 'Accurate'],
    ['rapid', 'Rapid'],
    ['longrange', 'Longrange'],
  ];
  let windStrikeSelected = false;

  function getEquipBonuses(character) {
    const totals = {
      attackBonus: 0,
      strengthBonus: 0,
      defenceBonus: 0,
      rangedBonus: 0,
      magicBonus: 0,
    };
    const equipment = window.normalizeEquipment?.(character.equipment) || character.equipment;
    ['weapon', 'shield'].forEach((slot) => {
      const itemId = equipment?.[slot];
      const bonuses = ITEMS[itemId]?.equip;
      if (!bonuses) return;
      totals.attackBonus += bonuses.attackBonus || 0;
      totals.strengthBonus += bonuses.strengthBonus || 0;
      totals.defenceBonus += bonuses.defenceBonus || 0;
    });
    const weaponBonuses = ITEMS[equipment?.weapon]?.equip;
    totals.rangedBonus += weaponBonuses?.rangedBonus || 0;
    totals.magicBonus += weaponBonuses?.magicBonus || 0;
    return totals;
  }

  function equipFromInventory(character, index) {
    const item = character.inventory[index];
    const equipData = ITEMS[item?.itemId]?.equip;
    if (!equipData) return false;

    character.equipment = window.normalizeEquipment?.(character.equipment)
      || { weapon: null, shield: null, ammo: null };
    const removed = removeInventorySlot(character, index);
    if (!removed) return false;
    if (equipData.slot !== 'ammo' && removed.qty !== 1) {
      throw new Error(`Equippable item ${removed.itemId} must occupy one inventory unit.`);
    }

    const previousItem = character.equipment[equipData.slot];
    character.equipment[equipData.slot] = equipData.slot === 'ammo'
      ? { itemId: removed.itemId, qty: removed.qty }
      : removed.itemId;
    if (previousItem) {
      const previousItemId = equipData.slot === 'ammo' ? previousItem.itemId : previousItem;
      const previousQty = equipData.slot === 'ammo' ? previousItem.qty : 1;
      if (addItem(character, previousItemId, previousQty) !== 0) {
        throw new Error(`Could not return swapped equipment ${previousItemId} to the backpack.`);
      }
    }
    saveEquipmentChange(character);
    return true;
  }

  function unequipFromSlot(character, slotName) {
    character.equipment = window.normalizeEquipment?.(character.equipment)
      || { weapon: null, shield: null, ammo: null };
    const equipped = character.equipment[slotName];
    if (!equipped) return;
    const itemId = slotName === 'ammo' ? equipped.itemId : equipped;
    const quantity = slotName === 'ammo' ? equipped.qty : 1;
    if (
      canAddItem(character, itemId, quantity) < quantity
      || addItem(character, itemId, quantity) !== 0
    ) {
      window.addGameMessage?.('Your backpack is too full to unequip that.');
      return;
    }
    character.equipment[slotName] = null;
    saveEquipmentChange(character);
  }

  function saveEquipmentChange(character) {
    saveCharacter(character);
    window.refreshInventoryHud?.(character);
    refreshEquipmentHud(character);
  }

  function createEquipmentPanel(character) {
    const panel = document.querySelector('#equipment-panel');
    if (!panel) throw new Error('Equipment panel is missing from the sidebar.');
    if (!document.querySelector('#fighting-style-styles')) {
      const styles = document.createElement('style');
      styles.id = 'fighting-style-styles';
      styles.textContent = `
        .fighting-style { margin-bottom: 12px; }
        .fighting-style h3 { margin: 0 0 7px; color: #f0c77f; font-size: 13px; }
        .fighting-style-buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
        .fighting-style-button { padding: 7px; border: 1px solid #596171; border-radius: 4px; background: #2a2f3a; color: #e9e4d8; cursor: pointer; }
        .fighting-style-button.active { border-color: #ffd166; color: #ffd166; box-shadow: inset 0 0 0 1px #ffd166; }
        .fighting-style-reminder { margin: 7px 0 0; color: #c4cbc9; font-size: 11px; }
      `;
      document.head.append(styles);
    }
    panel.className = 'sidebar-content equipment-content';
    refreshEquipmentHud(character);
    createSpellbookPanel(character);
  }

  function createSpellbookPanel(character) {
    const panel = document.querySelector('#spellbook-panel');
    if (!panel) throw new Error('Spellbook panel is missing from the sidebar.');
    panel.className = 'sidebar-content spellbook-content';
    refreshSpellbookHud(character);
  }

  function refreshSpellbookHud(character) {
    const panel = document.querySelector('#spellbook-panel');
    if (!panel || !character) return;
    panel.replaceChildren();
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `spell-card${windStrikeSelected ? ' active' : ''}`;
    card.setAttribute('aria-pressed', String(windStrikeSelected));
    const spellIcon = window.createSkillIconElement?.('magic', 'quest-icon');
    if (spellIcon) card.append(spellIcon);
    const title = document.createElement('strong');
    title.textContent = 'WIND STRIKE';
    const requirement = document.createElement('span');
    requirement.textContent = 'Magic level 1';
    const costs = document.createElement('span');
    costs.className = 'spell-costs';
    [
      ['airRune', 1],
      ['mindRune', 1],
    ].forEach(([itemId, required]) => {
      const cost = document.createElement('span');
      cost.append(
        window.createItemIconElement?.(itemId, 'item-icon') || document.createTextNode(ITEMS[itemId].code),
        document.createTextNode(` ${required} (${countItem(character, itemId)} owned)`),
      );
      costs.append(cost);
    });
    card.append(title, requirement, costs);
    card.addEventListener('click', () => {
      windStrikeSelected = !windStrikeSelected;
      refreshSpellbookHud(character);
    });
    panel.append(card);
  }

  function refreshEquipmentHud(character) {
    const panel = document.querySelector('#equipment-panel');
    if (!panel || !character) return;
    character.equipment = window.normalizeEquipment?.(character.equipment)
      || { weapon: null, shield: null, ammo: null };
    panel.replaceChildren();
    const content = document.createElement('section');
    content.className = 'equipment-hud';

    const styleBlock = document.createElement('section');
    styleBlock.className = 'fighting-style';
    const styleHeading = document.createElement('h3');
    styleHeading.textContent = 'Fighting style';
    styleBlock.append(styleHeading);
    const styleButtons = document.createElement('div');
    styleButtons.className = 'fighting-style-buttons';
    const isRanged = Boolean(ITEMS[character.equipment.weapon]?.equip?.rangedBonus);
    const styles = isRanged ? RANGED_STYLES : COMBAT_STYLES;
    const selectedStyle = isRanged ? character.rangedStyle : character.combatStyle;
    styles.forEach(([style, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fighting-style-button';
      button.textContent = label;
      button.setAttribute('aria-pressed', String(selectedStyle === style));
      if (selectedStyle === style) button.classList.add('active');
      button.addEventListener('click', () => {
        if (isRanged) character.rangedStyle = style;
        else character.combatStyle = style;
        saveCharacter(character);
        refreshEquipmentHud(character);
      });
      styleButtons.append(button);
    });
    styleBlock.append(styleButtons);
    const styleReminder = document.createElement('p');
    styleReminder.className = 'fighting-style-reminder';
    styleReminder.textContent = isRanged
      ? 'Accurate → +2 Ranged · Rapid → faster shots · Longrange → +3 range, shared XP'
      : 'Accurate → Attack XP · Aggressive → Strength XP · Defensive → Defence XP · Controlled → all three shared';
    styleBlock.append(styleReminder);
    content.append(styleBlock);

    EQUIPMENT_SLOTS.forEach(([slotName, label]) => {
      const equipped = character.equipment[slotName];
      const itemId = slotName === 'ammo' ? equipped?.itemId : equipped;
      const quantity = slotName === 'ammo' ? equipped?.qty : 1;
      const slot = itemId ? document.createElement('button') : document.createElement('div');
      if (itemId) {
        slot.type = 'button';
        slot.addEventListener('click', () => unequipFromSlot(character, slotName));
      }
      slot.className = 'equipment-slot';
      const slotLabel = document.createElement('span');
      slotLabel.className = 'equipment-slot-label';
      slotLabel.textContent = label;
      slot.append(slotLabel);

      if (itemId) {
        const icon = window.createItemIconElement?.(itemId, 'item-icon');
        if (icon) slot.append(icon);
        else {
          const fallback = document.createElement('span');
          fallback.className = 'town-item-code';
          fallback.textContent = ITEMS[itemId].code;
          slot.append(fallback);
        }
        const name = document.createElement('span');
        name.className = 'equipment-slot-name';
        name.textContent = quantity > 1
          ? `${ITEMS[itemId].name} ×${quantity.toLocaleString()}`
          : ITEMS[itemId].name;
        slot.append(name);
        window.attachItemTooltip?.(
          slot,
          itemId,
          slotName === 'ammo' ? 'Click to unequip' : equipmentBonusText(ITEMS[itemId].equip),
          quantity,
        );
      } else {
        const empty = document.createElement('span');
        empty.className = 'equipment-empty-icon';
        empty.setAttribute('aria-hidden', 'true');
        const name = document.createElement('span');
        name.className = 'equipment-slot-name';
        name.textContent = 'Empty';
        slot.append(empty, name);
      }
      content.append(slot);
    });

    const bonuses = getEquipBonuses(character);
    const totals = document.createElement('div');
    totals.className = 'equipment-bonuses';
    totals.textContent = `Attack +${bonuses.attackBonus} · Strength +${bonuses.strengthBonus} · Defence +${bonuses.defenceBonus} · Ranged +${bonuses.rangedBonus} · Magic +${bonuses.magicBonus}`;
    content.append(totals);
    panel.append(content);
  }

  function equipmentBonusText(bonuses) {
    return Object.entries({
      'Attack': bonuses.attackBonus || 0,
      'Strength': bonuses.strengthBonus || 0,
      'Defence': bonuses.defenceBonus || 0,
      'Ranged': bonuses.rangedBonus || 0,
      'Magic': bonuses.magicBonus || 0,
    })
      .filter(([, amount]) => amount !== 0)
      .map(([name, amount]) => `${name} +${amount}`)
      .join(' · ');
  }

  window.getEquipBonuses = getEquipBonuses;
  window.equipFromInventory = equipFromInventory;
  window.createEquipmentPanel = createEquipmentPanel;
  window.refreshEquipmentHud = refreshEquipmentHud;
  window.createSpellbookPanel = createSpellbookPanel;
  window.refreshSpellbookHud = refreshSpellbookHud;
  window.isWindStrikeSelected = () => windStrikeSelected;
})();
