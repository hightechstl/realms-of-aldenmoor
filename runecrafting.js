(() => {
  const RUNE_RECIPES = {
    airRune: { xpPerEssence: 5, multiplierEvery: 11 },
    mindRune: { xpPerEssence: 5.5, multiplierEvery: 14 },
  };

  function multiplierFor(runeId, runecraftingLevel) {
    return 1 + Math.floor(runecraftingLevel / RUNE_RECIPES[runeId].multiplierEvery);
  }

  function openRunecraftingPanel(character, node) {
    window.closeTownInterface?.();
    document.querySelector('.runecrafting-panel')?.remove();
    document.querySelector('.smithing-panel')?.remove();
    const sidebar = document.querySelector('#sidebar');
    const tabs = document.querySelector('.sidebar-tabs');
    const savedTab = ['skills', 'inventory', 'quests', 'equipment', 'spellbook'].find((name) => (
      document.querySelector(`#${name}-tab`)?.getAttribute('aria-selected') === 'true'
    )) || 'skills';
    tabs.hidden = true;
    ['skills', 'inventory', 'quests', 'equipment', 'spellbook'].forEach((name) => {
      document.querySelector(`#${name}-panel`).hidden = true;
    });

    const panel = document.createElement('section');
    panel.className = 'town-panel runecrafting-panel';
    panel.setAttribute('aria-label', 'Runecrafting');
    sidebar.insertBefore(panel, document.querySelector('#sidebar-footer'));

    function close() {
      panel.remove();
      tabs.hidden = false;
      ['skills', 'inventory', 'quests', 'equipment', 'spellbook'].forEach((name) => {
        document.querySelector(`#${name}-panel`).hidden = name !== savedTab;
        document.querySelector(`#${name}-tab`).setAttribute('aria-selected', String(name === savedTab));
      });
    }

    function render() {
      panel.replaceChildren();
      const header = document.createElement('header');
      header.className = 'town-panel-header';
      const title = document.createElement('strong');
      title.textContent = 'Rune Altar';
      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'town-close';
      closeButton.textContent = 'Close';
      closeButton.addEventListener('click', close);
      header.append(title, closeButton);
      panel.append(header);

      const essence = countItem(character, 'runeEssence');
      const level = levelForXp(character.skills.runecrafting.xp);
      const note = document.createElement('p');
      note.className = 'town-note';
      note.textContent = `Rune essence: ${essence} - Runecrafting level ${level}`;
      panel.append(note);

      Object.entries(RUNE_RECIPES).forEach(([runeId, recipe]) => {
        const multiplier = multiplierFor(runeId, level);
        const row = document.createElement('div');
        row.className = 'town-row';
        const description = document.createElement('span');
        description.textContent = `${ITEMS[runeId].name} - ${recipe.xpPerEssence} XP per essence, x${multiplier} per essence`;
        row.append(description);
        const actions = document.createElement('div');
        actions.className = 'smithing-actions';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'smithing-action';
        button.textContent = 'Craft all';
        button.disabled = essence <= 0;
        if (essence <= 0) button.title = 'You need rune essence';
        button.addEventListener('click', () => craft(runeId));
        actions.append(button);
        row.append(actions);
        panel.append(row);
      });
    }

    function craft(runeId) {
      const recipe = RUNE_RECIPES[runeId];
      const essence = countItem(character, 'runeEssence');
      if (essence <= 0) {
        window.addGameMessage?.('You need rune essence to craft runes.');
        return;
      }
      const level = levelForXp(character.skills.runecrafting.xp);
      const produced = essence * multiplierFor(runeId, level);
      if (canAddItem(character, runeId, produced) < produced) {
        window.addGameMessage?.('Your inventory is too full.');
        return;
      }
      removeItem(character, 'runeEssence', essence);
      addItem(character, runeId, produced);
      const result = addXp(character, 'runecrafting', recipe.xpPerEssence * essence);
      saveCharacter(character);
      window.refreshInventoryHud?.(character);
      const scene = window.activePrayerScene?.();
      if (scene) window.handleCombatXp?.('runecrafting', result, scene);
      window.sfx?.('cast');
      window.addGameMessage?.(`You craft the essence into ${produced} ${ITEMS[runeId].name.toLowerCase()}.`);
      render();
    }

    render();
  }

  window.openRunecraftingPanel = openRunecraftingPanel;
})();
