(() => {
  function createQuestNpcs() {
    return [
      {
        id: 'elder-maren',
        type: 'questNpc',
        npcId: 'elderMaren',
        displayName: 'Elder Maren',
        x: 22,
        y: 18,
        tile: { x: 22, y: 18 },
        region: 'town',
        label: 'Maren',
        maxYield: Infinity,
        remaining: Infinity,
      },
      {
        id: 'mine-foreman',
        type: 'questNpc',
        npcId: 'mineForeman',
        displayName: 'Mine Foreman',
        x: 20,
        y: 9,
        tile: { x: 20, y: 9 },
        region: 'mine',
        label: 'Foreman',
        maxYield: Infinity,
        remaining: Infinity,
      },
    ];
  }

  function questStatus(character) {
    const stage = character?.quests?.firstErrand ?? 0;
    if (stage === 0) return 'Speak to Elder Maren in the town square.';
    if (stage === 2) return 'Complete.';
    const carriesParcel = countItem(character, 'parcel') > 0;
    return `Deliver the parcel to the Mine Foreman.${carriesParcel ? '' : ' (You no longer carry the parcel — speak to Maren.)'}`;
  }

  function createQuestJournal(character) {
    const panel = document.querySelector('#quests-panel');
    if (!panel) throw new Error('Quest journal panel is missing.');
    panel.replaceChildren();
    const heading = document.createElement('h2');
    heading.className = 'skills-hud-header';
    heading.textContent = 'Quest Journal';
    const entry = document.createElement('section');
    entry.className = 'quest-entry';
    const name = document.createElement('h3');
    name.textContent = 'First Errand';
    const status = document.createElement('p');
    status.className = 'quest-status';
    status.dataset.quest = 'firstErrand';
    entry.append(name, status);
    panel.append(heading, entry);
    refreshQuestJournal(character);
  }

  function refreshQuestJournal(character) {
    const status = document.querySelector('.quest-status[data-quest="firstErrand"]');
    if (!status || !character) return;
    const complete = character.quests?.firstErrand === 2;
    status.textContent = questStatus(character);
    status.classList.toggle('quest-complete', complete);
  }

  function grantParcel(character) {
    if (canAddItem(character, 'parcel', 1) < 1) {
      window.addGameMessage?.('Your backpack is too full.');
      return false;
    }
    if (addItem(character, 'parcel', 1) !== 0) {
      throw new Error('Parcel could not be added after backpack capacity was verified.');
    }
    return true;
  }

  function talkToElder(character, node) {
    const stage = character.quests.firstErrand;
    if (stage === 0) {
      const lines = [{
        text: 'Could you deliver this parcel to the Mine Foreman at the mine entrance?',
        onContinue: () => {
          if (grantParcel(character)) {
            character.quests.firstErrand = 1;
            saveCharacter(character);
            lines[1].text = 'Thank you. Head north to the mine and give it to the foreman.';
          } else {
            lines[1].text = 'Make room in your backpack, then come speak to me again.';
          }
        },
      }, { text: 'I have a parcel for you.' }];
      window.openDialogueInterface(node.displayName, lines, node, null, character);
      return;
    }

    if (stage === 1 && countItem(character, 'parcel') === 0) {
      const lines = [
        { text: 'The foreman waits at the mine, north of town.' },
        {
          text: 'Here is another parcel for the foreman.',
          onContinue: () => grantParcel(character),
        },
      ];
      window.openDialogueInterface(node.displayName, lines, node, null, character);
      return;
    }

    const text = stage === 2
      ? 'Thank you for delivering the parcel.'
      : 'The foreman waits at the mine, north of town.';
    window.openDialogueInterface(node.displayName, [{ text }], node, null, character);
  }

  function talkToForeman(character, node) {
    if (character.quests.firstErrand === 1 && countItem(character, 'parcel') > 0) {
      const emptySlots = character.inventory.filter((slot) => slot === null).length;
      if (countItem(character, 'coins') === 0 && emptySlots === 0) {
        window.addGameMessage?.('Your inventory is too full.');
        window.openDialogueInterface(
          node.displayName,
          [{ text: 'Make room in your backpack before I can give you the reward.' }],
          node,
          null,
          character,
        );
        return;
      }
      if (!removeItem(character, 'parcel', 1)) {
        throw new Error('The quest parcel disappeared before delivery.');
      }
      const coinsRemaining = addItem(character, 'coins', 60);
      const pickaxeRemaining = addItem(character, 'bronzePickaxe', 1);
      if (coinsRemaining > 0 || pickaxeRemaining > 0) {
        throw new Error('Quest reward could not fit in the backpack.');
      }
      character.quests.firstErrand = 2;
      saveCharacter(character);
      window.addGameMessage?.('Quest complete: First Errand — 60 coins and a Bronze pickaxe.', 'gold');
      window.openDialogueInterface(
        node.displayName,
        [{ text: 'Thank you for bringing the parcel. Fine work!' }],
        node,
        null,
        character,
      );
      return;
    }

    const text = character.quests.firstErrand === 2
      ? 'Fine work, that parcel business.'
      : 'The mine entrance is just north of town. Keep clear of the rocks.';
    window.openDialogueInterface(node.displayName, [{ text }], node, null, character);
  }

  function talkToQuestNpc(node, character) {
    if (!character || !node) return;
    if (!character.quests) character.quests = { firstErrand: 0 };
    if (node.npcId === 'elderMaren') talkToElder(character, node);
    else if (node.npcId === 'mineForeman') talkToForeman(character, node);
    else throw new Error(`Unknown quest NPC: ${node.npcId}`);
  }

  const previousSaveCharacter = window.saveCharacter;
  window.saveCharacter = function (character, ...args) {
    const result = previousSaveCharacter.call(this, character, ...args);
    refreshQuestJournal(character);
    return result;
  };

  window.createQuestNpcs = createQuestNpcs;
  window.createQuestJournal = createQuestJournal;
  window.refreshQuestJournal = refreshQuestJournal;
  window.talkToQuestNpc = talkToQuestNpc;
})();
