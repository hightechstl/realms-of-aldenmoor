(() => {
  function createFloorTextures(scene) {
    const floor = scene.make.graphics({ x: 0, y: 0, add: false });
    floor.fillStyle(0x765335, 1);
    floor.fillRect(0, 0, 32, 32);
    floor.fillStyle(0x9b7045, 0.55);
    floor.fillRect(3, 4, 25, 3);
    floor.fillStyle(0x533d2d, 0.55);
    floor.fillRect(0, 29, 32, 3);
    floor.generateTexture('interior-floor-a', 32, 32);
    floor.destroy();

    const floorAlt = scene.make.graphics({ x: 0, y: 0, add: false });
    floorAlt.fillStyle(0x805b39, 1);
    floorAlt.fillRect(0, 0, 32, 32);
    floorAlt.fillStyle(0xa77a4d, 0.45);
    floorAlt.fillRect(3, 4, 25, 3);
    floorAlt.fillStyle(0x59422e, 0.55);
    floorAlt.fillRect(0, 29, 32, 3);
    floorAlt.generateTexture('interior-floor-b', 32, 32);
    floorAlt.destroy();

    const wall = scene.make.graphics({ x: 0, y: 0, add: false });
    wall.fillStyle(0x262321, 1);
    wall.fillRect(0, 0, 32, 32);
    wall.fillStyle(0x574333, 1);
    wall.fillRect(0, 5, 32, 22);
    wall.fillStyle(0x906b45, 1);
    wall.fillRect(0, 5, 32, 4);
    wall.lineStyle(2, 0x211e1b, 1);
    wall.lineBetween(0, 28, 32, 28);
    wall.generateTexture('interior-wall', 32, 32);
    wall.destroy();

    const chapelFloor = scene.make.graphics({ x: 0, y: 0, add: false });
    chapelFloor.fillStyle(0x777b80, 1);
    chapelFloor.fillRect(0, 0, 32, 32);
    chapelFloor.lineStyle(1, 0x5d6268, 1);
    chapelFloor.strokeRect(0, 0, 32, 32);
    chapelFloor.fillStyle(0x92969a, 0.45);
    chapelFloor.fillRect(3, 3, 26, 2);
    chapelFloor.generateTexture('chapel-floor-a', 32, 32);
    chapelFloor.destroy();

    const chapelFloorAlt = scene.make.graphics({ x: 0, y: 0, add: false });
    chapelFloorAlt.fillStyle(0x6e7378, 1);
    chapelFloorAlt.fillRect(0, 0, 32, 32);
    chapelFloorAlt.lineStyle(1, 0x595e64, 1);
    chapelFloorAlt.strokeRect(0, 0, 32, 32);
    chapelFloorAlt.fillStyle(0x888d91, 0.45);
    chapelFloorAlt.fillRect(3, 3, 26, 2);
    chapelFloorAlt.generateTexture('chapel-floor-b', 32, 32);
    chapelFloorAlt.destroy();
  }

  function createInteriorWorld(scene) {
    createFloorTextures(scene);
    const nodes = [];
    const rooms = INTERIOR_ROOMS;

    Object.entries(rooms).forEach(([roomId, room]) => {
      for (let y = room.y; y < room.y + room.height; y += 1) {
        for (let x = room.x; x < room.x + room.width; x += 1) {
          const border = x === room.x || x === room.x + room.width - 1
            || y === room.y || y === room.y + room.height - 1;
          const doorGap = y === room.y + room.height - 1 && x === room.doorX;
          const floorTexture = roomId === 'emberfangLair'
            ? ((x + y) % 2 ? 'scorched-b' : 'scorched-a')
            : roomId === 'stormmawLair'
              ? ((x + y) % 2 ? 'chapel-floor-a' : 'chapel-floor-b')
              : roomId === 'chapel'
                ? ((x + y) % 2 ? 'chapel-floor-a' : 'chapel-floor-b')
                : ((x + y) % 2 ? 'interior-floor-a' : 'interior-floor-b');
          scene.grid[y][x] = border ? 'interior-wall' : floorTexture;
          scene.blocked[y][x] = border;
          if (doorGap) {
            scene.grid[y][x] = floorTexture;
            scene.blocked[y][x] = true;
          }
          scene.add.image(x * 32 + 16, y * 32 + 16, scene.grid[y][x]).setDepth(1);
        }
      }

      const doorTile = { x: room.doorX, y: room.y + room.height - 1 };
      nodes.push({
        id: `${roomId}-inside-door`,
        type: 'interiorDoor',
        doorAction: 'leave',
        roomId,
        x: doorTile.x,
        y: doorTile.y,
        tile: doorTile,
        region: roomId,
        verb: 'Leave',
        displayName: 'Door',
        range: 1,
        remaining: Infinity,
        maxYield: Infinity,
        label: 'Door',
        markerColor: 0x8a5732,
      });

      const outsideDoor = {
        x: room.exterior.x,
        y: room.exterior.y,
      };
      nodes.push({
        id: `${roomId}-outside-door`,
        type: 'interiorDoor',
        doorAction: 'enter',
        roomId,
        x: outsideDoor.x,
        y: outsideDoor.y,
        tile: outsideDoor,
        region: 'town',
        verb: 'Enter',
        displayName: roomId === 'tower'
          ? 'Wizard Tower entrance'
          : roomId === 'essenceMine'
            ? 'Essence portal'
            : roomId === 'mineDepths'
              ? 'Mine ladder'
            : roomId === 'emberfangLair'
              ? 'Emberfang lair entrance'
            : roomId === 'stormmawLair'
              ? 'Stormmaw lair entrance'
            : `${roomId[0].toUpperCase()}${roomId.slice(1)} door`,
        range: 1,
        remaining: Infinity,
        maxYield: Infinity,
        label: 'Enter',
        markerColor: 0x8a5732,
      });
    });

    const bank = rooms.bank;
    nodes.push(
      {
        id: 'banker',
        type: 'banker',
        x: bank.x + 2,
        y: bank.y + 3,
        tile: { x: bank.x + 2, y: bank.y + 3 },
        region: 'bank',
        verb: 'Bank',
        displayName: 'Banker',
        range: 1,
        remaining: Infinity,
        maxYield: Infinity,
        label: 'Banker',
      },
      {
        id: 'bank-chest',
        type: 'banker',
        x: bank.x + 9,
        y: bank.y + 3,
        tile: { x: bank.x + 9, y: bank.y + 3 },
        region: 'bank',
        verb: 'Bank',
        displayName: 'Bank chest',
        range: 1,
        remaining: Infinity,
        maxYield: Infinity,
        label: 'Chest',
        markerColor: 0x9b7544,
      },
    );

    const store = rooms.store;
    for (let x = store.x + 2; x <= store.x + 9; x += 1) {
      const y = store.y + 4;
      scene.grid[y][x] = 'interior-wall';
      scene.blocked[y][x] = true;
      scene.add.image(x * 32 + 16, y * 32 + 16, 'interior-wall').setDepth(2);
      // Visual pass: the counter is plain wood now — no word painted on it.
    }
    nodes.push({
      id: 'shopkeeper',
      type: 'shopkeeper',
      x: store.x + 6,
      y: store.y + 3,
      tile: { x: store.x + 6, y: store.y + 3 },
      region: 'store',
      verb: 'Trade',
      displayName: 'Shopkeeper',
      shopId: 'general',
      range: 2,
      remaining: Infinity,
      maxYield: Infinity,
      label: 'Shopkeeper',
    });

    const fishShop = rooms.fishShop;
    nodes.push({
      id: 'fishmonger',
      type: 'shopkeeper',
      x: fishShop.x + 6,
      y: fishShop.y + 3,
      tile: { x: fishShop.x + 6, y: fishShop.y + 3 },
      region: 'fishShop',
      verb: 'Trade',
      displayName: 'Fishmonger',
      shopId: 'fish',
      range: 2,
      remaining: Infinity,
      maxYield: Infinity,
      label: 'Fishmonger',
    });

    const smithy = rooms.smithy;
    nodes.push(
      {
        id: 'smithy-furnace',
        type: 'furnace',
        x: smithy.x + 3,
        y: smithy.y + 3,
        tile: { x: smithy.x + 3, y: smithy.y + 3 },
        region: 'smithy',
        verb: 'Smelt',
        displayName: 'Furnace',
        range: 1,
        remaining: Infinity,
        maxYield: Infinity,
        label: 'Smelt',
      },
      {
        id: 'smithy-anvil',
        type: 'anvil',
        x: smithy.x + 8,
        y: smithy.y + 3,
        tile: { x: smithy.x + 8, y: smithy.y + 3 },
        region: 'smithy',
        verb: 'Smith',
        displayName: 'Anvil',
        range: 1,
        remaining: Infinity,
        maxYield: Infinity,
        label: 'Anvil',
      },
    );

    const tower = rooms.tower;
    nodes.push({
      id: 'wizard',
      type: 'shopkeeper',
      x: tower.x + 5,
      y: tower.y + 3,
      tile: { x: tower.x + 5, y: tower.y + 3 },
      region: 'tower',
      verb: 'Trade',
      displayName: 'Wizard',
      shopId: 'magic',
      range: 2,
      remaining: Infinity,
      maxYield: Infinity,
      label: 'Wizard',
      markerColor: 0x7564b3,
    });

    const runeAltarTile = { x: tower.x + 7, y: tower.y + 2 };
    scene.blocked[runeAltarTile.y][runeAltarTile.x] = true;
    nodes.push({
      id: 'rune-altar',
      type: 'runeAltar',
      x: runeAltarTile.x,
      y: runeAltarTile.y,
      tile: runeAltarTile,
      region: 'tower',
      verb: 'Craft runes',
      displayName: 'Rune altar',
      range: 1,
      remaining: Infinity,
      maxYield: Infinity,
      label: 'Altar',
      markerColor: 0x8bd5e8,
    });

    const mine = rooms.essenceMine;
    [[2, 2], [6, 4], [9, 2]].forEach(([offsetX, offsetY], index) => {
      const rockTile = { x: mine.x + offsetX, y: mine.y + offsetY };
      scene.blocked[rockTile.y][rockTile.x] = true;
      nodes.push({
        id: `essence-rock-${index + 1}`,
        type: 'ore',
        itemId: 'runeEssence',
        skill: 'mining',
        xp: 5,
        x: rockTile.x,
        y: rockTile.y,
        tile: rockTile,
        region: 'mine',
        verb: 'Mine',
        displayName: 'Rune essence rock',
        range: 1,
        remaining: 1,
        maxYield: 1,
        label: 'Essence',
        markerColor: 0x9fd8e8,
      });
    });

    const depths = rooms.mineDepths;
    [[2, 2], [5, 3], [8, 2], [11, 3], [3, 6], [7, 6], [10, 6]].forEach(([offsetX, offsetY], index) => {
      const rockTile = { x: depths.x + offsetX, y: depths.y + offsetY };
      scene.blocked[rockTile.y][rockTile.x] = true;
      nodes.push({
        id: `iron-rock-${index + 1}`,
        type: 'ore',
        itemId: 'ironOre',
        skill: 'mining',
        level: 15,
        xp: 35,
        x: rockTile.x,
        y: rockTile.y,
        tile: rockTile,
        region: 'mineDepths',
        verb: 'Mine',
        displayName: 'Iron rock',
        range: 1,
        remaining: 1,
        maxYield: 1,
        label: 'Fe',
        markerColor: 0x9aa5aa,
      });
    });

    const chapel = rooms.chapel;
    const altarTile = { x: chapel.x + 5, y: chapel.y + 2 };
    scene.blocked[altarTile.y][altarTile.x] = true;
    nodes.push({
      id: 'chapel-altar',
      type: 'altar',
      x: altarTile.x,
      y: altarTile.y,
      tile: altarTile,
      region: 'chapel',
      verb: 'Offer bones',
      displayName: 'Altar',
      range: 1,
      remaining: Infinity,
      maxYield: Infinity,
      label: 'Altar',
      markerColor: 0xe0d5bf,
    });

    return nodes;
  }

  function teleport(scene, node) {
    const room = INTERIOR_ROOMS[node.roomId];
    if (!room) throw new Error(`Unknown interior room: ${node.roomId}`);
    const destination = node.doorAction === 'enter'
      ? { x: room.doorX, y: room.y + room.height - 2 }
      : { ...room.exterior };
    if (
      destination.x < 0 || destination.y < 0
      || destination.x >= scene.grid[0].length || destination.y >= scene.grid.length
      || scene.blocked[destination.y][destination.x]
    ) {
      throw new Error(`Interior door destination is not walkable: ${destination.x}, ${destination.y}`);
    }
    scene.cancelNodeAction();
    scene.path = [];
    scene.moving = false;
    scene.tweens.killTweensOf(scene.player);
    scene.currentTile = destination;
    scene.character.worldTile = { ...destination };
    scene.player.setPosition(destination.x * 32 + 16, destination.y * 32 + 16);
    scene.cameras.main.centerOn(scene.player.x, scene.player.y);
    scene.cameras.main.startFollow(scene.player, true, 0.08, 0.08);
    saveCharacter(scene.character);
    window.addGameMessage?.(node.doorAction === 'enter'
      ? `You enter the ${room.name || node.roomId}.`
      : `You leave the ${room.name || node.roomId}.`);
  }

  function sailBoat(scene, node, character) {
    const destination = { x: node.destX, y: node.destY };
    if (
      destination.x < 0 || destination.y < 0
      || destination.x >= scene.grid[0].length || destination.y >= scene.grid.length
      || scene.blocked[destination.y][destination.x]
    ) {
      throw new Error(`Boat destination is not walkable: ${destination.x}, ${destination.y}`);
    }
    const fare = node.fare ?? 0;
    const tideborn = character.raceId === 'tideborn';
    if (!tideborn && fare > 0) {
      if (countItem(character, 'coins') < fare) {
        window.addGameMessage?.(`The boatman charges ${fare} coins for the crossing. You don't have enough.`);
        scene.cancelNodeAction();
        return;
      }
      removeItem(character, 'coins', fare);
    }
    scene.cancelNodeAction();
    scene.path = [];
    scene.moving = false;
    scene.tweens.killTweensOf(scene.player);
    window.sfx?.('splash');
    scene.currentTile = destination;
    scene.character.worldTile = { ...destination };
    scene.player.setPosition(destination.x * 32 + 16, destination.y * 32 + 16);
    scene.cameras.main.centerOn(scene.player.x, scene.player.y);
    scene.cameras.main.startFollow(scene.player, true, 0.08, 0.08);
    saveCharacter(scene.character);
    window.addGameMessage?.(tideborn
      ? `The boatman waves you aboard — Tideborn cross free. You sail to ${node.destName}.`
      : `You pay ${fare} coins and sail to ${node.destName}.`);
  }

  window.createInteriorWorld = createInteriorWorld;
  window.useInteriorDoor = teleport;
  window.sailBoat = sailBoat;
})();
