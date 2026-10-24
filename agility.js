(() => {
  // Phase 3, Step 3: Agility. A six-obstacle course in a forest clearing
  // south of the oaks, plus fence shortcuts around the farmland.
  // Sylvan Elves always succeed at shortcuts (their sureShortcuts perk).

  const OBSTACLES = [
    { id: 'course-log', name: 'Log balance', label: 'Log', verb: 'Cross', x: 5, y: 20, exit: { x: 3, y: 20 }, xp: 10, markerColor: 0x8a6a3d },
    { id: 'course-net', name: 'Climbing net', label: 'Net', verb: 'Climb', x: 3, y: 23, exit: { x: 3, y: 25 }, xp: 10, markerColor: 0x7a7f52 },
    { id: 'course-stones', name: 'Stepping stones', label: 'Stones', verb: 'Cross', x: 6, y: 25, exit: { x: 8, y: 25 }, xp: 10, markerColor: 0x9aa5aa },
    { id: 'course-wall', name: 'Low wall', label: 'Wall', verb: 'Climb over', x: 10, y: 25, exit: { x: 12, y: 25 }, xp: 10, markerColor: 0xa08b62 },
    { id: 'course-rope', name: 'Rope swing', label: 'Rope', verb: 'Swing across', x: 12, y: 22, exit: { x: 12, y: 20 }, xp: 10, markerColor: 0xb08d4f },
    { id: 'course-branch', name: 'Tree branch', label: 'Branch', verb: 'Traverse', x: 9, y: 20, exit: { x: 7, y: 20 }, xp: 10, markerColor: 0x4b8c48 },
  ];
  const LAP_BONUS_XP = 40;

  const SHORTCUTS = [
    { id: 'shortcut-farm-west', name: 'Fence stile', label: 'Stile', verb: 'Climb over', x: 45, y: 35, level: 5, xp: 8, sides: [{ x: 44, y: 35 }, { x: 46, y: 35 }], successText: 'You climb over the fence stile.', markerColor: 0xa08b62 },
    { id: 'shortcut-farm-north', name: 'Fence gap', label: 'Gap', verb: 'Squeeze through', x: 50, y: 24, level: 10, xp: 10, sides: [{ x: 50, y: 23 }, { x: 50, y: 25 }], successText: 'You squeeze through the gap in the fence.', markerColor: 0xa08b62 },
    { id: 'shortcut-farm-south', name: 'Fence stile', label: 'Stile', verb: 'Climb over', x: 58, y: 47, level: 15, xp: 12, sides: [{ x: 58, y: 46 }, { x: 58, y: 48 }], successText: 'You climb over the fence stile.', markerColor: 0xa08b62 },
    { id: 'shortcut-wastes-wall', name: 'Crumbled wall', label: 'Wall', verb: 'Climb over', x: 42, y: 10, level: 25, xp: 15, region: 'wastes', sides: [{ x: 41, y: 10 }, { x: 43, y: 10 }], successText: 'You scramble over the crumbled wall.', markerColor: 0x8a7a68 },
    { id: 'shortcut-stormcove-cliff', name: 'Cliff climb', label: 'Cliff', verb: 'Climb', x: 55, y: 75, level: 40, xp: 20, region: 'stormcove', sides: [{ x: 54, y: 75 }, { x: 56, y: 75 }], successText: 'You climb over the storm ridge.', markerColor: 0x6e8b8b },
  ];

  // Index into OBSTACLES of the next obstacle that advances the current lap.
  let courseStep = 0;

  function createAgilityNodes() {
    const nodes = [];
    OBSTACLES.forEach((obstacle) => {
      nodes.push({
        id: obstacle.id,
        type: 'agilityObstacle',
        x: obstacle.x,
        y: obstacle.y,
        tile: { x: obstacle.x, y: obstacle.y },
        region: 'forest',
        verb: obstacle.verb,
        displayName: obstacle.name,
        label: obstacle.label,
        range: 1,
        remaining: Infinity,
        maxYield: Infinity,
        markerColor: obstacle.markerColor,
        exit: obstacle.exit,
        xp: obstacle.xp,
      });
    });
    SHORTCUTS.forEach((shortcut) => {
      nodes.push({
        id: shortcut.id,
        type: 'shortcut',
        x: shortcut.x,
        y: shortcut.y,
        tile: { x: shortcut.x, y: shortcut.y },
        region: shortcut.region || 'farm',
        verb: shortcut.verb,
        displayName: shortcut.name,
        label: shortcut.label,
        range: 1,
        remaining: Infinity,
        maxYield: Infinity,
        markerColor: shortcut.markerColor,
        level: shortcut.level,
        xp: shortcut.xp,
        sides: shortcut.sides,
        successText: shortcut.successText,
      });
    });
    return nodes;
  }

  // Instant reposition, mirroring the interior-door teleport in interiors.js.
  function movePlayer(scene, destination) {
    scene.cancelNodeAction();
    scene.path = [];
    scene.moving = false;
    scene.tweens.killTweensOf(scene.player);
    scene.currentTile = { ...destination };
    scene.character.worldTile = { ...destination };
    scene.player.setPosition(destination.x * 32 + 16, destination.y * 32 + 16);
    scene.cameras.main.centerOn(scene.player.x, scene.player.y);
    scene.cameras.main.startFollow(scene.player, true, 0.08, 0.08);
  }

  function awardAgilityXp(scene, character, amount) {
    const result = addXp(character, 'agility', amount);
    scene.afterActionXp?.('agility', result);
  }

  function performAgilityObstacle(scene, node, character) {
    if (!character?.skills?.agility) return;
    const level = levelForXp(character.skills.agility.xp);
    const failChance = Math.max(0.02, 0.22 - (level - 1) * 0.015);
    if (Math.random() < failChance) {
      scene.cancelNodeAction();
      window.sfx?.('slip');
      window.addGameMessage?.(`You slip on the ${node.displayName.toLowerCase()} and fail to cross.`);
      return;
    }
    movePlayer(scene, node.exit);
    awardAgilityXp(scene, character, node.xp);
    const expected = OBSTACLES[courseStep];
    if (expected && node.id === expected.id) {
      courseStep += 1;
      if (courseStep >= OBSTACLES.length) {
        courseStep = 0;
        awardAgilityXp(scene, character, LAP_BONUS_XP);
        window.sfx?.('quest');
        window.addGameMessage?.(`Lap complete! Bonus ${LAP_BONUS_XP} Agility XP.`);
      } else {
        window.addGameMessage?.(`You cross the ${node.displayName.toLowerCase()}. Next up: the ${OBSTACLES[courseStep].name.toLowerCase()}.`);
      }
    } else {
      window.addGameMessage?.(`You cross the ${node.displayName.toLowerCase()}.`);
    }
    saveCharacter(character);
  }

  function useAgilityShortcut(scene, node, character) {
    if (!character?.skills?.agility) return;
    const level = levelForXp(character.skills.agility.xp);
    if (level < node.level) {
      scene.cancelNodeAction();
      window.addGameMessage?.(`You need an Agility level of ${node.level} to use this shortcut.`);
      return;
    }
    const here = scene.currentTile;
    const distA = Math.abs(here.x - node.sides[0].x) + Math.abs(here.y - node.sides[0].y);
    const distB = Math.abs(here.x - node.sides[1].x) + Math.abs(here.y - node.sides[1].y);
    const destination = distA >= distB ? node.sides[0] : node.sides[1];
    const elfSureFooted = RACES[character.raceId]?.qol?.sureShortcuts === true;
    const chance = elfSureFooted ? 1 : Math.min(0.95, 0.7 + 0.02 * (level - node.level));
    if (Math.random() > chance) {
      scene.cancelNodeAction();
      window.addGameMessage?.('You slip and fail to make it through the shortcut.');
      return;
    }
    movePlayer(scene, destination);
    awardAgilityXp(scene, character, node.xp);
    window.addGameMessage?.(node.successText);
    saveCharacter(character);
  }

  window.createAgilityNodes = createAgilityNodes;
  window.performAgilityObstacle = performAgilityObstacle;
  window.useAgilityShortcut = useAgilityShortcut;
})();
