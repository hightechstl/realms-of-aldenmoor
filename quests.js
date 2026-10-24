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
      {
        id: 'captain-wren',
        type: 'questNpc',
        npcId: 'captainWren',
        displayName: 'Captain Wren',
        x: 35,
        y: 61,
        tile: { x: 35, y: 61 },
        region: 'village',
        label: 'Wren',
        maxYield: Infinity,
        remaining: Infinity,
      },
    ];
  }

  function stageOf(character, key) {
    return character?.quests?.[key] ?? 0;
  }

  function setStage(character, key, value) {
    if (!character.quests) character.quests = { firstErrand: 0 };
    character.quests[key] = value;
  }

  function firstErrandStatus(character) {
    const stage = stageOf(character, 'firstErrand');
    if (stage === 0) return 'Speak to Elder Maren in the town square.';
    if (stage === 2) return 'Complete.';
    const carriesParcel = countItem(character, 'parcel') > 0;
    return `Deliver the parcel to the Mine Foreman.${carriesParcel ? '' : ' (You no longer carry the parcel — speak to Maren.)'}`;
  }

  function goblinTroubleStatus(character) {
    const stage = stageOf(character, 'goblinTrouble');
    if (stage === 2) return 'Complete.';
    if (stage === 1) {
      const kills = character.quests?.goblinKills ?? 0;
      return kills >= 5
        ? 'Return to the Mine Foreman at the mine entrance.'
        : `Slay goblins at the stronghold east of town: ${kills}/5.`;
    }
    return stageOf(character, 'firstErrand') === 2
      ? 'Speak to the Mine Foreman at the mine entrance.'
      : 'Complete First Errand, then speak to the Mine Foreman.';
  }

  function feedingVillageStatus(character) {
    const stage = stageOf(character, 'feedingVillage');
    if (stage === 2) return 'Complete.';
    if (stage === 1) {
      return `Bring Captain Wren 5 raw trout. (You carry ${countItem(character, 'rawTrout')}.)`;
    }
    return stageOf(character, 'goblinTrouble') === 2
      ? 'Speak to Captain Wren at the fishing village, far south past the lake.'
      : 'Finish Goblin Trouble, then find Captain Wren at the fishing village.';
  }

  function ironForDepthsStatus(character) {
    const stage = stageOf(character, 'ironForDepths');
    if (stage === 2) return 'Complete.';
    if (stage === 1) {
      return `Bring the Mine Foreman 2 iron bars. (You carry ${countItem(character, 'ironBar')}.)`;
    }
    return stageOf(character, 'feedingVillage') === 2
      ? 'Speak to the Mine Foreman at the mine entrance.'
      : 'Finish Feeding the Village, then return to the Mine Foreman.';
  }

  function beastWastesStatus(character) {
    const stage = stageOf(character, 'beastWastes');
    if (stage === 2) return 'Complete.';
    if (stage === 1) {
      return character.quests?.emberfangSlain
        ? 'Return to Captain Wren at the fishing village.'
        : 'Slay Emberfang in its lair at the far east of the Ashen Wastes, north-east of town.';
    }
    return stageOf(character, 'ironForDepths') === 2
      ? 'Speak to Captain Wren at the fishing village.'
      : 'Finish Iron for the Depths, then speak to Captain Wren.';
  }

  const JOURNAL_QUESTS = [
    { key: 'firstErrand', name: 'First Errand', status: firstErrandStatus },
    { key: 'goblinTrouble', name: 'Goblin Trouble', status: goblinTroubleStatus },
    { key: 'feedingVillage', name: 'Feeding the Village', status: feedingVillageStatus },
    { key: 'ironForDepths', name: 'Iron for the Depths', status: ironForDepthsStatus },
    { key: 'beastWastes', name: 'The Beast of the Wastes', status: beastWastesStatus },
  ];

  function createQuestJournal(character) {
    const panel = document.querySelector('#quests-panel');
    if (!panel) throw new Error('Quest journal panel is missing.');
    panel.replaceChildren();
    const heading = document.createElement('h2');
    heading.className = 'skills-hud-header';
    heading.textContent = 'Quest Journal';
    panel.append(heading);
    JOURNAL_QUESTS.forEach((quest) => {
      const entry = document.createElement('section');
      entry.className = 'quest-entry';
      const name = document.createElement('h3');
      name.textContent = quest.name;
      const status = document.createElement('p');
      status.className = 'quest-status';
      status.dataset.quest = quest.key;
      entry.append(name, status);
      panel.append(entry);
    });
    refreshQuestJournal(character);
  }

  function refreshQuestJournal(character) {
    if (!character) return;
    JOURNAL_QUESTS.forEach((quest) => {
      const status = document.querySelector(`.quest-status[data-quest="${quest.key}"]`);
      if (!status) return;
      status.textContent = quest.status(character);
      status.classList.toggle('quest-complete', stageOf(character, quest.key) === 2);
    });
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

  function coinRewardBlocked(character) {
    return countItem(character, 'coins') === 0
      && character.inventory.filter((slot) => slot === null).length === 0;
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

    if (character.quests.firstErrand !== 2) {
      window.openDialogueInterface(
        node.displayName,
        [{ text: 'The mine entrance is just north of town. Keep clear of the rocks.' }],
        node,
        null,
        character,
      );
      return;
    }

    // The chain: Goblin Trouble, then Iron for the Depths.
    const goblinStage = stageOf(character, 'goblinTrouble');
    if (goblinStage === 0) {
      const lines = [{
        text: 'You did fine work with that parcel. Truth is, I have a bigger problem: goblins from the stronghold east of town keep raiding my supply carts.',
        onContinue: () => {
          setStage(character, 'goblinTrouble', 1);
          character.quests.goblinKills = 0;
          saveCharacter(character);
          lines[1].text = 'Slay 5 of them — the big hobgoblins count too — and I will pay you 150 coins.';
        },
      }, { text: 'Can I count on you?' }];
      window.openDialogueInterface(node.displayName, lines, node, null, character);
      return;
    }
    if (goblinStage === 1) {
      const kills = character.quests.goblinKills ?? 0;
      if (kills < 5) {
        window.openDialogueInterface(
          node.displayName,
          [{ text: `The stronghold is east of town, past the smithy. You have slain ${kills} of 5.` }],
          node,
          null,
          character,
        );
        return;
      }
      if (coinRewardBlocked(character)) {
        window.openDialogueInterface(
          node.displayName,
          [{ text: 'Fine slaying — but make room in your backpack so I can pay you.' }],
          node,
          null,
          character,
        );
        return;
      }
      if (addItem(character, 'coins', 150) !== 0) {
        throw new Error('Quest reward could not fit in the backpack.');
      }
      setStage(character, 'goblinTrouble', 2);
      saveCharacter(character);
      window.addGameMessage?.('Quest complete: Goblin Trouble — 150 coins.', 'gold');
      window.openDialogueInterface(
        node.displayName,
        [{ text: 'The carts roll safe again. If you are looking for more work, Captain Wren at the fishing village down south was asking after a capable hand.' }],
        node,
        null,
        character,
      );
      return;
    }

    if (stageOf(character, 'feedingVillage') !== 2) {
      window.openDialogueInterface(
        node.displayName,
        [{ text: 'Captain Wren at the fishing village could use your help, I hear. South, past the lake.' }],
        node,
        null,
        character,
      );
      return;
    }

    const ironStage = stageOf(character, 'ironForDepths');
    if (ironStage === 0) {
      const lines = [{
        text: 'One more thing, and it is the big one. The lower depths are rich, but the ladder shaft needs shoring up before my miners can work it safely.',
        onContinue: () => {
          setStage(character, 'ironForDepths', 1);
          saveCharacter(character);
          lines[1].text = 'Bring me 2 iron bars — mined from the depths below and smelted at the smithy. There is an iron sword and 100 coins in it for you.';
        },
      }, { text: 'Will you fetch them?' }];
      window.openDialogueInterface(node.displayName, lines, node, null, character);
      return;
    }
    if (ironStage === 1) {
      const bars = countItem(character, 'ironBar');
      if (bars < 2) {
        window.openDialogueInterface(
          node.displayName,
          [{ text: `I need 2 iron bars to shore up the shaft. You carry ${bars}. The ladder down is at the far end of the mine, up the north path.` }],
          node,
          null,
          character,
        );
        return;
      }
      if (!removeItem(character, 'ironBar', 2)) {
        throw new Error('The iron bars disappeared before delivery.');
      }
      const swordRemaining = addItem(character, 'ironSword', 1);
      const coinsRemaining = addItem(character, 'coins', 100);
      if (swordRemaining > 0 || coinsRemaining > 0) {
        addItem(character, 'ironBar', 2);
        window.openDialogueInterface(
          node.displayName,
          [{ text: 'Make room in your backpack before I can give you the reward.' }],
          node,
          null,
          character,
        );
        return;
      }
      setStage(character, 'ironForDepths', 2);
      saveCharacter(character);
      window.addGameMessage?.('Quest complete: Iron for the Depths — an Iron sword and 100 coins.', 'gold');
      window.openDialogueInterface(
        node.displayName,
        [{ text: 'Sturdy work. The depths are open and safe — Aldenmoor owes you, friend.' }],
        node,
        null,
        character,
      );
      return;
    }

    window.openDialogueInterface(
      node.displayName,
      [{ text: stageOf(character, 'beastWastes') === 2
        ? 'The mine runs smooth thanks to you.'
        : 'The mine runs smooth thanks to you. Captain Wren was asking after you again — something about trouble in the Wastes.' }],
      node,
      null,
      character,
    );
  }

  function talkToWren(character, node) {
    if (stageOf(character, 'goblinTrouble') !== 2) {
      window.openDialogueInterface(
        node.displayName,
        [{ text: 'The boats stay close to shore while goblins raid the roads. I hear the Mine Foreman is offering coin for that problem.' }],
        node,
        null,
        character,
      );
      return;
    }

    const stage = stageOf(character, 'feedingVillage');
    if (stage === 0) {
      const lines = [{
        text: 'So you are the one who cleared the roads. Then maybe you can help us too: the village stores are empty, and my crew eats what we catch.',
        onContinue: () => {
          setStage(character, 'feedingVillage', 1);
          saveCharacter(character);
          lines[1].text = 'Bring me 5 raw trout — the lake north of here or my own dock will do. 200 coins and my thanks.';
        },
      }, { text: 'Will you feed the village?' }];
      window.openDialogueInterface(node.displayName, lines, node, null, character);
      return;
    }
    if (stage === 1) {
      const trout = countItem(character, 'rawTrout');
      if (trout < 5) {
        window.openDialogueInterface(
          node.displayName,
          [{ text: `The village needs 5 raw trout. You carry ${trout}.` }],
          node,
          null,
          character,
        );
        return;
      }
      if (coinRewardBlocked(character)) {
        window.openDialogueInterface(
          node.displayName,
          [{ text: 'A fine catch — but make room in your backpack so I can pay you.' }],
          node,
          null,
          character,
        );
        return;
      }
      if (!removeItem(character, 'rawTrout', 5)) {
        throw new Error('The trout disappeared before delivery.');
      }
      if (addItem(character, 'coins', 200) !== 0) {
        throw new Error('Quest reward could not fit in the backpack.');
      }
      addXp(character, 'fishing', 150);
      setStage(character, 'feedingVillage', 2);
      saveCharacter(character);
      window.addGameMessage?.('Quest complete: Feeding the Village — 200 coins and Fishing experience.', 'gold');
      window.openDialogueInterface(
        node.displayName,
        [{ text: 'The village eats tonight because of you. Give my regards to the foreman — he was muttering about iron for the mine.' }],
        node,
        null,
        character,
      );
      return;
    }

    if (stageOf(character, 'ironForDepths') !== 2) {
      window.openDialogueInterface(
        node.displayName,
        [{ text: 'The village eats well thanks to you. The foreman was asking after you, I think.' }],
        node,
        null,
        character,
      );
      return;
    }

    const beastStage = stageOf(character, 'beastWastes');
    if (beastStage === 0) {
      const lines = [{
        text: 'One last trouble, and it is a monster: Emberfang, a fire-breathing wolf in the Ashen Wastes north-east of town. Its ash hounds raid my supply boats, and no crew will sail while it lives.',
        onContinue: () => {
          setStage(character, 'beastWastes', 1);
          character.quests.emberfangSlain = false;
          saveCharacter(character);
          lines[1].text = 'Its lair sits at the far east of the Wastes. Bring bass, mind its fire breath, and there are 500 coins and combat training in it for you.';
        },
      }, { text: 'Will you face the beast?' }];
      window.openDialogueInterface(node.displayName, lines, node, null, character);
      return;
    }
    if (beastStage === 1) {
      if (!character.quests.emberfangSlain) {
        window.openDialogueInterface(
          node.displayName,
          [{ text: 'Emberfang still lives. Follow the east road out of town into the Ashen Wastes — its lair is at the far east edge. The crumbled wall on the west side is a shortcut, if you are nimble enough.' }],
          node,
          null,
          character,
        );
        return;
      }
      if (coinRewardBlocked(character)) {
        window.openDialogueInterface(
          node.displayName,
          [{ text: 'You faced the beast and lived — but make room in your backpack so I can pay you.' }],
          node,
          null,
          character,
        );
        return;
      }
      if (addItem(character, 'coins', 500) !== 0) {
        throw new Error('Quest reward could not fit in the backpack.');
      }
      addXp(character, 'attack', 250);
      setStage(character, 'beastWastes', 2);
      saveCharacter(character);
      window.addGameMessage?.('Quest complete: The Beast of the Wastes — 500 coins and Attack experience.', 'gold');
      window.openDialogueInterface(
        node.displayName,
        [{ text: 'The Wastes are quiet and my boats sail free again. Aldenmoor will sing of this, friend.' }],
        node,
        null,
        character,
      );
      return;
    }

    window.openDialogueInterface(
      node.displayName,
      [{ text: 'The village eats well, the roads are safe, the mine runs deep, and the Wastes are quiet. Quite a season, friend.' }],
      node,
      null,
      character,
    );
  }

  function onMonsterKilled(character, monsterId) {
    if (!character?.quests) return;
    if (monsterId === 'emberfang') {
      if (character.quests.beastWastes !== 1 || character.quests.emberfangSlain) return;
      character.quests.emberfangSlain = true;
      saveCharacter(character);
      window.addGameMessage?.('The Beast of the Wastes: Emberfang slain. Return to Captain Wren.');
      return;
    }
    if (character.quests.goblinTrouble !== 1) return;
    if (monsterId !== 'goblin' && monsterId !== 'hobgoblin') return;
    const kills = Math.min(5, (character.quests.goblinKills ?? 0) + 1);
    character.quests.goblinKills = kills;
    saveCharacter(character);
    window.addGameMessage?.(kills >= 5
      ? 'Goblin Trouble: 5/5 goblins slain. Return to the Mine Foreman.'
      : `Goblin Trouble: ${kills}/5 goblins slain.`);
  }

  function talkToQuestNpc(node, character) {
    if (!character || !node) return;
    if (!character.quests) character.quests = { firstErrand: 0 };
    if (node.npcId === 'elderMaren') talkToElder(character, node);
    else if (node.npcId === 'mineForeman') talkToForeman(character, node);
    else if (node.npcId === 'captainWren') talkToWren(character, node);
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
  window.onMonsterKilled = onMonsterKilled;
})();
