(() => {
  const STALL_POSITIONS = [
    { id: 'bread-stall', stallId: 'bread', x: 16, y: 16, color: 0xc58d4e },
    { id: 'trinket-stall', stallId: 'trinket', x: 20, y: 18, color: 0x9a79b5 },
    { id: 'gem-stall', stallId: 'gem', x: 24, y: 16, color: 0x8c7a52 },
  ];
  const GUARD_WAYPOINTS = [
    { x: 18, y: 15 }, { x: 20, y: 14 }, { x: 24, y: 14 }, { x: 24, y: 18 },
    { x: 20, y: 19 }, { x: 16, y: 18 }, { x: 16, y: 14 },
  ];
  const CITIZEN_WAYPOINTS = [
    [{ x: 17, y: 18 }, { x: 18, y: 17 }, { x: 19, y: 18 }, { x: 18, y: 19 }],
    [{ x: 22, y: 17 }, { x: 23, y: 18 }, { x: 22, y: 19 }, { x: 21, y: 18 }],
  ];

  function createThievingNodes() {
    const nodes = STALL_POSITIONS.map(({ id, stallId, x, y, color }) => ({
      id,
      type: 'marketStall',
      stallId,
      level: THIEVING_STALLS[stallId].level,
      x,
      y,
      tile: { x, y },
      region: 'town',
      verb: 'Steal from',
      displayName: THIEVING_STALLS[stallId].name,
      range: 1,
      maxYield: THIEVING_STALLS[stallId].stock,
      remaining: THIEVING_STALLS[stallId].stock,
      label: stallId === 'trinket' ? 'Trinkets' : THIEVING_STALLS[stallId].itemId === 'ruby' ? 'Gems' : 'Bread',
      markerColor: color,
    }));
    nodes.push({
      id: 'town-guard',
      type: 'townGuard',
      x: 18,
      y: 15,
      tile: { x: 18, y: 15 },
      region: 'town',
      displayName: 'Guard',
      label: 'Guard',
      markerColor: 0x556e95,
      remaining: Infinity,
      maxYield: Infinity,
      waypoints: GUARD_WAYPOINTS,
    });
    CITIZEN_WAYPOINTS.forEach((waypoints, index) => {
      const tile = waypoints[0];
      nodes.push({
        id: `town-citizen-${index + 1}`,
        type: 'citizen',
        x: tile.x,
        y: tile.y,
        tile: { ...tile },
        region: 'town',
        verb: 'Pickpocket',
        displayName: 'Citizen',
        range: 1,
        level: THIEVING_PICKPOCKET.level,
        baseChance: THIEVING_PICKPOCKET.baseChance,
        label: 'Citizen',
        markerColor: 0x9b7544,
        remaining: Infinity,
        maxYield: Infinity,
        waypoints,
      });
    });
    return nodes;
  }

  function thievingChance(character, baseChance) {
    if (!character || !Number.isFinite(baseChance)) {
      throw new Error('A character and base thieving chance are required.');
    }
    const level = levelForXp(character.skills.thieving.xp);
    const characterClass = CLASSES[character.classId];
    const rogueBonus = characterClass?.perks?.lowProfile ? 10 : 0;
    const startingLevel = characterClass?.startSkill === 'thieving' ? 10 : 0;
    const earnedLevelBonus = Math.max(0, level - startingLevel) * 2;
    return Math.min(95, Math.max(0, baseChance + earnedLevelBonus + rogueBonus));
  }

  function rollThievingChance(character, baseChance) {
    return Math.random() * 100 < thievingChance(character, baseChance);
  }

  function isPlayerStunned(scene) {
    return Boolean(scene?.playerStunnedUntil && Date.now() < scene.playerStunnedUntil);
  }

  function performThievingAction(scene) {
    const node = scene.currentAction;
    const character = scene.character;
    if (!node || !character || isPlayerStunned(scene)) return;
    if (!scene.isAdjacentTo(node)) {
      scene.cancelNodeAction();
      return;
    }

    if (node.type === 'marketStall') {
      attemptStall(scene, node, character);
      return;
    }
    if (node.type === 'citizen') attemptPickpocket(scene, node, character);
  }

  function attemptStall(scene, node, character) {
    const stall = THIEVING_STALLS[node.stallId];
    if (node.refusedUntil && Date.now() < node.refusedUntil) {
      scene.cancelNodeAction();
      window.addGameMessage?.('The stallholder is watching you closely.');
      return;
    }
    if (node.remaining <= 0) {
      scene.cancelNodeAction();
      window.addGameMessage?.('The stall is empty.');
      return;
    }
    if (canAddItem(character, stall.itemId, stall.maxQty) < stall.maxQty) {
      scene.cancelNodeAction();
      window.addGameMessage?.('Your inventory is too full.');
      return;
    }

    if (rollThievingChance(character, stall.baseChance)) {
      const quantity = randomInteger(stall.minQty, stall.maxQty);
      if (addItem(character, stall.itemId, quantity) !== 0) {
        throw new Error(`Could not add stolen ${stall.itemId} to the backpack.`);
      }
      node.remaining -= 1;
      const result = addXp(character, 'thieving', stall.xp);
      showThievingXp(scene, result);
      if (node.remaining === 0) {
        node.marker.setFillStyle(0x777777).setAlpha(0.6).disableInteractive();
        scene.cancelNodeAction();
        scene.time.delayedCall(20000, () => {
          node.remaining = node.maxYield;
          node.marker.setFillStyle(node.markerColor).setAlpha(1).setInteractive(
            new Phaser.Geom.Rectangle(-16, -16, 32, 32),
            Phaser.Geom.Rectangle.Contains,
          );
          window.addGameMessage?.('The stallholder restocks the stall.');
        });
        return;
      }
    } else {
      window.addGameMessage?.('You fail to steal anything.');
      if (guardIsNear(scene, character)) {
        node.refusedUntil = Date.now() + 30000;
        catchPlayer(scene, 3000, true);
        return;
      }
    }
    scheduleNextAttempt(scene);
  }

  function attemptPickpocket(scene, citizen, character) {
    scene.cancelNodeAction();
    if (canAddItem(character, 'coins', THIEVING_PICKPOCKET.maxCoins) < THIEVING_PICKPOCKET.maxCoins) {
      window.addGameMessage?.('Your inventory is too full.');
      return;
    }
    if (rollThievingChance(character, citizen.baseChance)) {
      const coins = randomInteger(THIEVING_PICKPOCKET.minCoins, THIEVING_PICKPOCKET.maxCoins);
      addItem(character, 'coins', coins);
      showThievingXp(scene, addXp(character, 'thieving', THIEVING_PICKPOCKET.xp));
      return;
    }

    if (guardIsNear(scene, character)) {
      catchPlayer(scene, 3000, true);
      return;
    }
    catchPlayer(scene, 2000, false);
    character.currentHp = Math.max(1, character.currentHp - 1);
    saveCharacter(character);
    window.refreshCombatHud?.(character);
  }

  function guardIsNear(scene, character) {
    const guard = scene.nodes.find((node) => node.type === 'townGuard');
    if (!guard) return false;
    const radius = CLASSES[character.classId]?.perks?.lowProfile ? 4 : 6;
    return Math.abs(scene.currentTile.x - guard.tile.x)
      + Math.abs(scene.currentTile.y - guard.tile.y) <= radius;
  }

  function catchPlayer(scene, duration, guardCaught) {
    scene.cancelNodeAction();
    scene.path = [];
    scene.playerStunnedUntil = Date.now() + duration;
    window.addGameMessage?.("You've been caught!", true);
    if (guardCaught) window.addGameMessage?.('Oi! Hands off the goods!');
  }

  function scheduleNextAttempt(scene) {
    if (!scene.currentAction || !scene.actionStarted) return;
    scene.actionTimer = scene.time.delayedCall(2000, () => {
      scene.actionTimer = null;
      performThievingAction(scene);
    });
  }

  function showThievingXp(scene, result) {
    window.handleCombatXp?.('thieving', result, scene);
  }

  function randomInteger(minimum, maximum) {
    return Phaser.Math.Between(minimum, maximum);
  }

  function startThievingWorld(scene) {
    scene.nodes.filter((node) => node.type === 'townGuard' || node.type === 'citizen')
      .forEach((node) => scheduleWander(scene, node, 0));
  }

  function scheduleWander(scene, node, index) {
    const delay = node.type === 'townGuard' ? 2200 : 2800;
    scene.time.delayedCall(delay, () => {
      const nextIndex = (index + 1) % node.waypoints.length;
      const destination = node.waypoints[nextIndex];
      const occupied = scene.nodes.some((other) => (
        other !== node && other.tile.x === destination.x && other.tile.y === destination.y
        && (other.type === 'townGuard' || other.type === 'citizen')
      ));
      if (!occupied && !scene.blocked[destination.y][destination.x]) {
        moveWanderingNpc(scene, node, destination);
        scheduleWander(scene, node, nextIndex);
      } else {
        scheduleWander(scene, node, index);
      }
    });
  }

  function moveWanderingNpc(scene, node, destination) {
    const oldTile = node.tile;
    scene.tileInteractables.delete(scene.tileKey(oldTile));
    node.tile = { ...destination };
    node.x = destination.x;
    node.y = destination.y;
    if (node.type === 'citizen') scene.tileInteractables.set(scene.tileKey(node.tile), node);
    const x = destination.x * 32 + 16;
    const y = destination.y * 32 + 16;
    scene.tweens.add({ targets: node.marker, x, y, duration: 350 });
    scene.tweens.add({ targets: node.labelText, x, y, duration: 350 });
  }

  window.createThievingNodes = createThievingNodes;
  window.thievingChance = thievingChance;
  window.isPlayerStunned = isPlayerStunned;
  window.performThievingAction = performThievingAction;
  window.startThievingWorld = startThievingWorld;
})();
