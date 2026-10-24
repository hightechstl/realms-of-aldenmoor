(() => {
  const originalLoadCharacter = window.loadCharacter;
  const originalSaveCharacter = window.saveCharacter;

  function maxHitpoints(character) {
    return levelForXp(character.skills.hitpoints.xp);
  }

  function initializeHealth(character) {
    if (!character) return false;
    const maxHp = maxHitpoints(character);
    let changed = false;
    if (!Number.isFinite(character.currentHp)) {
      character.currentHp = maxHp;
      changed = true;
    } else {
      const clampedHp = Math.max(0, Math.min(maxHp, Math.floor(character.currentHp)));
      if (clampedHp !== character.currentHp) {
        character.currentHp = clampedHp;
        changed = true;
      }
    }
    return changed;
  }

  window.loadCharacter = function (...args) {
    const character = originalLoadCharacter.apply(this, args);
    if (initializeHealth(character)) originalSaveCharacter.call(this, character);
    return character;
  };

  window.saveCharacter = function (character, ...args) {
    initializeHealth(character);
    return originalSaveCharacter.call(this, character, ...args);
  };

  function refreshHealth(character) {
    const current = Math.max(0, Math.min(character.currentHp, maxHitpoints(character)));
    character.currentHp = current;
    window.saveCharacter(character);
    window.refreshCombatHud?.(character);
  }

  function drawCombatHud(character) {
    const current = character.currentHp;
    const maximum = maxHitpoints(character);
    const label = document.querySelector('#hp-label');
    const fill = document.querySelector('#hp-bar-fill');
    if (!label || !fill) return;
    label.textContent = `Hitpoints ${current}/${maximum}`;
    const ratio = maximum === 0 ? 0 : current / maximum;
    fill.style.width = `${ratio * 100}%`;
    const red = Math.round(205 * (1 - ratio));
    const green = Math.round(175 * ratio);
    fill.style.backgroundColor = `rgb(${red + 40}, ${green + 40}, 65)`;
  }

  function createCombatMonsters(scene) {
    if (!scene.textures.exists('goblin')) {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0x26321f, 0.45);
      graphics.fillEllipse(16, 29, 23, 7);
      graphics.fillStyle(0x579943, 1);
      graphics.fillTriangle(5, 11, 0, 3, 10, 6);
      graphics.fillTriangle(27, 11, 32, 3, 22, 6);
      graphics.fillCircle(16, 11, 10);
      graphics.fillStyle(0x768e3b, 1);
      graphics.fillRoundedRect(7, 18, 18, 12, 4);
      graphics.fillStyle(0x2b2a20, 1);
      graphics.fillCircle(12, 11, 1.5);
      graphics.fillCircle(20, 11, 1.5);
      graphics.fillStyle(0x45352b, 1);
      graphics.fillRect(11, 29, 4, 3);
      graphics.fillRect(18, 29, 4, 3);
      graphics.generateTexture('goblin', 32, 34);
      graphics.destroy();
    }

    if (!scene.textures.exists('hobgoblin')) {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0x2e2019, 0.45);
      graphics.fillEllipse(16, 30, 26, 8);
      graphics.fillStyle(0x9c623a, 1);
      graphics.fillTriangle(4, 12, -1, 3, 10, 7);
      graphics.fillTriangle(28, 12, 33, 3, 22, 7);
      graphics.fillCircle(16, 12, 11);
      graphics.fillStyle(0x6e3b2a, 1);
      graphics.fillRoundedRect(5, 19, 22, 13, 4);
      graphics.fillStyle(0x1f1c14, 1);
      graphics.fillCircle(12, 12, 1.8);
      graphics.fillCircle(20, 12, 1.8);
      graphics.fillStyle(0x45352b, 1);
      graphics.fillRect(10, 30, 5, 3);
      graphics.fillRect(18, 30, 5, 3);
      graphics.generateTexture('hobgoblin', 32, 36);
      graphics.destroy();
    }

    if (!scene.textures.exists('chicken')) {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xeee4c9, 1);
      graphics.fillEllipse(16, 20, 22, 16);
      graphics.fillCircle(10, 14, 7);
      graphics.fillStyle(0xc84b35, 1);
      graphics.fillTriangle(13, 7, 18, 7, 16, 12);
      graphics.fillStyle(0xd59b38, 1);
      graphics.fillTriangle(4, 14, 0, 16, 5, 17);
      graphics.fillStyle(0x25221c, 1);
      graphics.fillCircle(8, 13, 1);
      graphics.fillStyle(0xb9772b, 1);
      graphics.fillRect(11, 26, 2, 5);
      graphics.fillRect(20, 26, 2, 5);
      graphics.generateTexture('chicken', 32, 34);
      graphics.destroy();
    }

    if (!scene.textures.exists('cow')) {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xeadfc8, 1);
      graphics.fillRoundedRect(3, 8, 26, 19, 6);
      graphics.fillStyle(0x483c33, 1);
      graphics.fillCircle(9, 12, 4);
      graphics.fillCircle(22, 22, 5);
      graphics.fillCircle(22, 11, 3);
      graphics.fillStyle(0xe7d7bf, 1);
      graphics.fillCircle(7, 8, 4);
      graphics.fillStyle(0xb8896f, 1);
      graphics.fillEllipse(16, 20, 11, 7);
      graphics.fillStyle(0x27231e, 1);
      graphics.fillCircle(13, 17, 1);
      graphics.fillCircle(21, 17, 1);
      graphics.fillStyle(0x594437, 1);
      graphics.fillRect(6, 26, 4, 7);
      graphics.fillRect(22, 26, 4, 7);
      graphics.generateTexture('cow', 32, 34);
      graphics.destroy();
    }

    if (!scene.textures.exists('training-target')) {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0x493626, 1);
      graphics.fillRect(14, 20, 4, 13);
      graphics.fillRect(7, 31, 18, 3);
      graphics.fillStyle(0x9a623a, 1);
      graphics.fillCircle(16, 12, 10);
      graphics.fillStyle(0xe6d7b3, 1);
      graphics.fillCircle(16, 12, 7);
      graphics.fillStyle(0xb44337, 1);
      graphics.fillCircle(16, 12, 4);
      graphics.fillStyle(0xf0d49c, 1);
      graphics.fillCircle(16, 12, 1.5);
      graphics.generateTexture('training-target', 32, 36);
      graphics.destroy();
    }

    const goblins = [
      { x: 30, y: 11 },
      { x: 36, y: 11 },
      { x: 30, y: 19 },
      { x: 36, y: 19 },
    ].map((spawn, index) => createMonsterNode(scene, 'goblin', `goblin-${index + 1}`, spawn, 'Goblin', 'goblin'));
    const hobgoblins = [
      { x: 33, y: 12 },
      { x: 27, y: 16 },
      { x: 38, y: 17 },
    ].map((spawn, index) => createMonsterNode(scene, 'hobgoblin', `hobgoblin-${index + 1}`, spawn, 'Hobgoblin', 'hobgoblin'));
    const chickens = [
      { x: 49, y: 29 }, { x: 54, y: 34 }, { x: 62, y: 38 }, { x: 65, y: 43 },
    ].map((spawn, index) => createMonsterNode(scene, 'chicken', `chicken-${index + 1}`, spawn, 'Chicken', 'chicken'));
    const cows = [
      { x: 50, y: 40 }, { x: 58, y: 43 }, { x: 65, y: 34 },
    ].map((spawn, index) => createMonsterNode(scene, 'cow', `cow-${index + 1}`, spawn, 'Cow', 'cow'));
    const targets = [
      { x: 30, y: 23 }, { x: 36, y: 23 },
    ].map((spawn, index) => createMonsterNode(
      scene,
      'trainingTarget',
      `training-target-${index + 1}`,
      spawn,
      'Training target',
      'training-target',
    ));
    return [...goblins, ...hobgoblins, ...chickens, ...cows, ...targets];
  }

  function createMonsterNode(scene, monsterId, id, spawn, displayName, texture) {
      const monster = MONSTERS[monsterId];
      const node = {
        id,
        type: monsterId === 'goblin' || monsterId === 'hobgoblin' ? 'goblin'
          : monsterId === 'trainingTarget' ? 'trainingTarget' : 'farmAnimal',
        monsterId,
        x: spawn.x,
        y: spawn.y,
        tile: { ...spawn },
        spawnTile: { ...spawn },
        region: monster.region,
        verb: 'Attack',
        displayName,
        label: displayName,
        maxHp: monster.hp,
        hp: monster.hp,
        maxYield: 1,
        remaining: 1,
        alive: true,
      };
      const worldX = node.x * 32 + 16;
      const worldY = node.y * 32 + 16;
      node.marker = scene.add.image(worldX, worldY, texture).setDepth(6);
      node.marker.setInteractive(new Phaser.Geom.Rectangle(-16, -16, 32, 32), Phaser.Geom.Rectangle.Contains);
      node.labelText = scene.add.text(worldX, worldY - 22, monster.name, {
        fontFamily: 'sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#b9ed91',
        stroke: '#252a20',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(7);
      node.hpBarBackground = scene.add.rectangle(worldX, worldY - 32, 28, 5, 0x222222)
        .setDepth(8)
        .setVisible(false);
      node.hpBarFill = scene.add.rectangle(worldX - 13, worldY - 32, 26, 3, 0x5ed35e)
        .setOrigin(0, 0.5)
        .setDepth(9)
        .setVisible(false);
      if (monsterId === 'trainingTarget') {
        node.hpBarBackground.destroy();
        node.hpBarFill.destroy();
        node.hpBarBackground = null;
        node.hpBarFill = null;
      }
      if (monsterId === 'goblin' || monsterId === 'hobgoblin') {
        node.wanderEvent = scene.time.addEvent({
          delay: Phaser.Math.Between(3000, 5000),
          loop: true,
          callback: () => wanderGoblin(scene, node),
        });
      } else if (monsterId !== 'trainingTarget') {
        node.wanderBounds = { minX: 46, maxX: 67, minY: 25, maxY: 46 };
        scheduleFarmAnimalWander(scene, node);
      }
      return node;
  }

  function scheduleFarmAnimalWander(scene, node) {
    if (!node.alive) return;
    node.wanderEvent = scene.time.delayedCall(Phaser.Math.Between(3000, 5000), () => {
      wanderGoblin(scene, node);
      scheduleFarmAnimalWander(scene, node);
    });
  }

  function occupiedByOther(scene, node, x, y) {
    if (scene.currentTile?.x === x && scene.currentTile?.y === y) return true;
    return scene.nodes.some((other) => (
      other !== node
      && other.alive !== false
      && other.tile?.x === x
      && other.tile?.y === y
    ));
  }

  function wanderGoblin(scene, node) {
    if (!node.alive || scene.currentAction === node || node.wandering) return;
    const directions = Phaser.Utils.Array.Shuffle([
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ]);
    const destination = directions.find(({ x, y }) => {
      const nextX = node.tile.x + x;
      const nextY = node.tile.y + y;
      const bounds = node.wanderBounds || { minX: 26, maxX: 39, minY: 9, maxY: 20 };
      const withinCamp = nextX >= bounds.minX && nextX <= bounds.maxX
        && nextY >= bounds.minY && nextY <= bounds.maxY;
      const withinRadius = node.wanderBounds
        ? true
        : Math.hypot(nextX - node.spawnTile.x, nextY - node.spawnTile.y) <= 4;
      return withinCamp
        && withinRadius
        && !scene.blocked[nextY][nextX]
        && !occupiedByOther(scene, node, nextX, nextY);
    });
    if (!destination) return;

    const oldTile = { ...node.tile };
    const nextTile = { x: oldTile.x + destination.x, y: oldTile.y + destination.y };
    node.wandering = true;
    scene.tileInteractables.delete(scene.tileKey(oldTile));
    node.tile = nextTile;
    node.x = nextTile.x;
    node.y = nextTile.y;
    scene.tileInteractables.set(scene.tileKey(nextTile), node);
    const worldX = nextTile.x * 32 + 16;
    const worldY = nextTile.y * 32 + 16;
    scene.tweens.add({
      targets: node.marker,
      x: worldX,
      y: worldY,
      duration: 250,
      onComplete: () => { node.wandering = false; },
    });
    scene.tweens.add({ targets: node.labelText, x: worldX, y: worldY - 22, duration: 250 });
    scene.tweens.add({ targets: node.hpBarBackground, x: worldX, y: worldY - 32, duration: 250 });
    scene.tweens.add({ targets: node.hpBarFill, x: worldX - 13, y: worldY - 32, duration: 250 });
  }

  function startCombat(scene, goblin) {
    stopCombat(scene);
    if (!goblin.alive) {
      scene.cancelNodeAction();
      return;
    }
    const magic = Boolean(window.canCastMagic?.(scene.character));
    const ranged = !magic && canUseRangedCombat(scene.character);
    scene.combatState = {
      goblin,
      timer: null,
      magic,
      ranged,
      range: magic ? 7 : ranged ? rangedAttackRange(scene.character) : 1,
    };
    if (magic) {
      window.addGameMessage?.('You cast Wind Strike.');
    } else if (ranged) {
      const style = scene.character.rangedStyle || 'accurate';
      const styleName = style.charAt(0).toUpperCase() + style.slice(1);
      window.addGameMessage?.(`Ranged style: ${styleName}.`);
    } else {
      const style = scene.character.combatStyle || 'accurate';
      const styleName = style.charAt(0).toUpperCase() + style.slice(1);
      window.addGameMessage?.(`Fighting style: ${styleName}.`);
    }
    goblin.hpBarBackground?.setVisible(true);
    goblin.hpBarFill?.setVisible(true);
    runCombatRound(scene);
  }

  function canUseRangedCombat(character) {
    const weaponId = character?.equipment?.weapon;
    const ammo = character?.equipment?.ammo;
    return Boolean(
      ITEMS[weaponId]?.equip?.rangedBonus
      && ammo?.itemId === 'bronzeArrow'
      && ammo.qty > 0,
    );
  }

  function canCastMagic() {
    return Boolean(window.isWindStrikeSelected?.());
  }

  function rangedAttackRange(character) {
    return character?.rangedStyle === 'longrange' ? 9 : 6;
  }

  function stopCombat(scene) {
    if (!scene.combatState) return;
    scene.combatState.timer?.remove(false);
    scene.combatState.goblin.hpBarBackground?.setVisible(false);
    scene.combatState.goblin.hpBarFill?.setVisible(false);
    scene.combatState = null;
  }

  function combatHitChance(attackerLevel, defenderLevel) {
    return Math.max(0.15, Math.min(0.95, 0.55 + (attackerLevel - defenderLevel) * 0.03));
  }

  function randomDamage(maxHit) {
    return Phaser.Math.Between(0, maxHit);
  }

  function showHitSplat(scene, target, damage) {
    const text = damage > 0 ? String(damage) : 'miss';
    const splat = scene.add.text(target.x, target.y - 28, text, {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: damage > 0 ? '#ff5b55' : '#69b9ff',
      stroke: '#201b1b',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    scene.tweens.add({
      targets: splat,
      y: splat.y - 24,
      alpha: 0,
      duration: 850,
      onComplete: () => splat.destroy(),
    });
  }

  function runCombatRound(scene) {
    const state = scene.combatState;
    const character = scene.character;
    if (!state || !character || !state.goblin.alive) return;
    const goblin = state.goblin;
    if (state.magic) {
      runMagicRound(scene, goblin, character);
      return;
    }
    if (state.ranged) {
      runRangedRound(scene, goblin, character);
      return;
    }
    if (!scene.isAdjacentTo(goblin)) {
      scene.cancelNodeAction();
      return;
    }

    function runRangedRound(scene, target, character) {
      const weapon = ITEMS[character.equipment.weapon]?.equip;
      if (!weapon?.rangedBonus) {
        stopCombat(scene);
        scene.currentAction = null;
        scene.actionStarted = false;
        return;
      }

      const style = character.rangedStyle || 'accurate';
      const attackRange = rangedAttackRange(character);
      const distance = Math.abs(scene.currentTile.x - target.tile.x)
        + Math.abs(scene.currentTile.y - target.tile.y);
      if (distance > attackRange) {
        scene.cancelNodeAction();
        return;
      }
      const ammo = character.equipment.ammo;
      if (!ammo || ammo.itemId !== 'bronzeArrow' || ammo.qty <= 0) {
        stopCombat(scene);
        scene.currentAction = null;
        scene.actionStarted = false;
        window.addGameMessage?.("You're out of arrows.");
        return;
      }

      const ranger = CLASSES[character.classId]?.perks?.arrowSaver;
      if (!(ranger && Math.random() < 0.2)) {
        ammo.qty -= 1;
        if (ammo.qty === 0) character.equipment.ammo = null;
        saveCharacter(character);
        window.refreshEquipmentHud?.(character);
      }

      const rangedLevel = levelForXp(character.skills.ranged.xp);
      const rangedBonus = window.getEquipBonuses?.(character).rangedBonus || 0;
      const monster = MONSTERS[target.monsterId];
      let damage = 0;
      const accuracyBonus = style === 'accurate' ? 2 : 0;
      if (Math.random() < combatHitChance(rangedLevel + rangedBonus + accuracyBonus, monster.defence)) {
        damage = randomDamage(1 + Math.floor(rangedLevel / 5));
      }
      showHitSplat(scene, target.marker, damage);
      if (damage > 0) {
        target.hp = Math.max(0, target.hp - damage);
        const rangedXp = addXp(character, 'ranged', damage * (style === 'longrange' ? 2 : 4));
        window.handleCombatXp?.('ranged', rangedXp, scene);
        if (style === 'longrange') {
          const defenceXp = addXp(character, 'defence', damage * 2);
          window.handleCombatXp?.('defence', defenceXp, scene);
        }
        const hitpointsXp = addXp(character, 'hitpoints', damage * 1.33);
        window.handleCombatXp?.('hitpoints', hitpointsXp, scene);
        if (target.type !== 'trainingTarget') updateGoblinHpBar(target);
      }
      if (target.hp <= 0) {
        if (target.type === 'trainingTarget') {
          target.hp = target.maxHp;
        } else {
          killGoblin(scene, target, character);
          return;
        }
      }

      if (target.type !== 'trainingTarget') {
        target.hostile = true;
        moveHostileMonster(scene, target);
        if (monsterCanAttackPlayer(scene, target)) return;
      }
      scene.combatState.timer = scene.time.delayedCall(style === 'rapid' ? 1200 : 1500, () => runCombatRound(scene));
    }

    function runMagicRound(scene, target, character) {
      if (countItem(character, 'airRune') < 1 || countItem(character, 'mindRune') < 1) {
        stopCombat(scene);
        scene.currentAction = null;
        scene.actionStarted = false;
        window.addGameMessage?.("You don't have the runes to cast Wind Strike.");
        return;
      }
      const runeSaver = CLASSES[character.classId]?.perks?.runeSaver;
      if (!(runeSaver && Math.random() < 0.15)) {
        removeItem(character, 'airRune', 1);
        removeItem(character, 'mindRune', 1);
      }

      const sparkle = scene.add.circle(
        target.tile.x * 32 + 16,
        target.tile.y * 32 + 16,
        10,
        0x67e9ff,
        0.9,
      ).setDepth(15);
      scene.tweens.add({
        targets: sparkle,
        radius: 24,
        alpha: 0,
        duration: 450,
        onComplete: () => sparkle.destroy(),
      });

      const magicLevel = levelForXp(character.skills.magic.xp);
      const magicBonus = window.getEquipBonuses?.(character).magicBonus || 0;
      const monster = MONSTERS[target.monsterId];
      let damage = 0;
      if (Math.random() < combatHitChance(magicLevel + magicBonus, monster.defence)) {
        damage = randomDamage(2 + Math.floor(magicLevel / 10));
      }
      showHitSplat(scene, target.marker, damage);
      if (damage > 0) {
        target.hp = Math.max(0, target.hp - damage);
        if (target.type !== 'trainingTarget') updateGoblinHpBar(target);
        const hitpointsXp = addXp(character, 'hitpoints', damage * 1.33);
        window.handleCombatXp?.('hitpoints', hitpointsXp, scene);
      }
      const magicXp = addXp(character, 'magic', 5.5 + damage * 2);
      window.handleCombatXp?.('magic', magicXp, scene);

      if (target.hp <= 0) {
        if (target.type === 'trainingTarget') {
          target.hp = target.maxHp;
        } else {
          killGoblin(scene, target, character);
          return;
        }
      }
      if (target.type !== 'trainingTarget') {
        target.hostile = true;
        moveHostileMonster(scene, target);
        if (monsterCanAttackPlayer(scene, target)) return;
      }
      scene.combatState.timer = scene.time.delayedCall(1800, () => runCombatRound(scene));
    }

    function monsterCanAttackPlayer(scene, target) {
      const enemyDistance = Math.abs(scene.currentTile.x - target.tile.x)
        + Math.abs(scene.currentTile.y - target.tile.y);
      if (enemyDistance <= 1 && target.alive) {
        attackPlayer(scene, target, character);
        return !scene.combatState;
      }
      return false;
    }

    function moveHostileMonster(scene, monsterNode) {
      if (!monsterNode.hostile || monsterNode.type === 'trainingTarget') return;
      const directions = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
      const start = { ...monsterNode.tile };
      const queue = [start];
      const previous = new Map([[`${start.x},${start.y}`, null]]);
      let goalKey = null;
      for (let index = 0; index < queue.length && !goalKey; index += 1) {
        const tile = queue[index];
        const distance = Math.abs(tile.x - scene.currentTile.x) + Math.abs(tile.y - scene.currentTile.y);
        if (distance === 1) {
          goalKey = `${tile.x},${tile.y}`;
          break;
        }
        for (const direction of directions) {
          const next = { x: tile.x + direction.x, y: tile.y + direction.y };
          const key = `${next.x},${next.y}`;
          if (
            next.x < 0 || next.y < 0
            || next.x >= scene.blocked[0].length || next.y >= scene.blocked.length
            || scene.blocked[next.y][next.x] || previous.has(key)
            || scene.nodes.some((other) => (
              other !== monsterNode && other.alive !== false
              && other.tile?.x === next.x && other.tile?.y === next.y
            ))
          ) continue;
          previous.set(key, `${tile.x},${tile.y}`);
          queue.push(next);
        }
      }
      if (!goalKey) return;
      let firstKey = goalKey;
      while (previous.get(firstKey) !== `${start.x},${start.y}`) {
        firstKey = previous.get(firstKey);
        if (!firstKey) return;
      }
      const [nextX, nextY] = firstKey.split(',').map(Number);
      scene.tileInteractables.delete(scene.tileKey(monsterNode.tile));
      monsterNode.tile = { x: nextX, y: nextY };
      monsterNode.x = nextX;
      monsterNode.y = nextY;
      scene.tileInteractables.set(scene.tileKey(monsterNode.tile), monsterNode);
      const worldX = nextX * 32 + 16;
      const worldY = nextY * 32 + 16;
      scene.tweens.add({ targets: monsterNode.marker, x: worldX, y: worldY, duration: 250 });
      scene.tweens.add({ targets: monsterNode.labelText, x: worldX, y: worldY - 22, duration: 250 });
      monsterNode.hpBarBackground?.setPosition(worldX, worldY - 32);
      monsterNode.hpBarFill?.setPosition(worldX - 13, worldY - 32);
    }

    function attackPlayer(scene, monsterNode, character) {
      const monster = MONSTERS[monsterNode.monsterId];
      const defenceLevel = levelForXp(character.skills.defence.xp)
        + (window.getEquipBonuses?.(character).defenceBonus || 0);
      let damage = 0;
      if (Math.random() < combatHitChance(monster.attack, defenceLevel)) {
        damage = randomDamage(monster.maxHit);
      }
      showHitSplat(scene, scene.player, damage);
      if (damage > 0) {
        character.currentHp = Math.max(0, character.currentHp - damage);
        refreshHealth(character);
        if (character.currentHp <= 0) playerDied(scene, character);
      }
    }

    const equipmentBonuses = window.getEquipBonuses?.(character) || {
      attackBonus: 0,
      strengthBonus: 0,
      defenceBonus: 0,
    };
    const attackLevel = levelForXp(character.skills.attack.xp) + equipmentBonuses.attackBonus;
    const defenceLevel = levelForXp(character.skills.defence.xp) + equipmentBonuses.defenceBonus;
    const monster = MONSTERS[goblin.monsterId];
    let playerDamage = 0;
    if (Math.random() < combatHitChance(attackLevel, monster.defence)) {
      playerDamage = randomDamage(1 + Math.floor(
        (levelForXp(character.skills.strength.xp) + equipmentBonuses.strengthBonus) / 5,
      ));
    }
    showHitSplat(scene, goblin.marker, playerDamage);
    if (playerDamage > 0) {
      goblin.hp = Math.max(0, goblin.hp - playerDamage);
      const styleXp = playerDamage * 4;
      const routedSkills = character.combatStyle === 'aggressive'
        ? [['strength', styleXp]]
        : character.combatStyle === 'defensive'
          ? [['defence', styleXp]]
          : character.combatStyle === 'controlled'
            ? [['attack', styleXp / 3], ['strength', styleXp / 3], ['defence', styleXp / 3]]
            : [['attack', styleXp]];
      routedSkills.forEach(([skill, amount]) => {
        const result = addXp(character, skill, amount);
        window.handleCombatXp?.(skill, result, scene);
      });
      const hitpointsXp = addXp(character, 'hitpoints', playerDamage * 1.33);
      window.handleCombatXp?.('hitpoints', hitpointsXp, scene);
      if (goblin.type !== 'trainingTarget') updateGoblinHpBar(goblin);
    }
    if (goblin.hp <= 0) {
      if (goblin.type === 'trainingTarget') goblin.hp = goblin.maxHp;
      else killGoblin(scene, goblin, character);
      if (goblin.type !== 'trainingTarget') return;
    }

    let goblinDamage = 0;
    if (Math.random() < combatHitChance(monster.attack, defenceLevel)) {
      goblinDamage = randomDamage(monster.maxHit);
    }
    showHitSplat(scene, scene.player, goblinDamage);
    if (goblinDamage > 0) {
      character.currentHp = Math.max(0, character.currentHp - goblinDamage);
      refreshHealth(character);
      if (character.currentHp <= 0) {
        playerDied(scene, character);
        return;
      }
    }
    state.timer = scene.time.delayedCall(1500, () => runCombatRound(scene));
  }

  function updateGoblinHpBar(goblin) {
    const ratio = Math.max(0, goblin.hp / goblin.maxHp);
    goblin.hpBarFill.scaleX = ratio;
    goblin.hpBarFill.setFillStyle(ratio > 0.5 ? 0x5ed35e : ratio > 0.25 ? 0xe5c943 : 0xe44b45);
  }

  function killGoblin(scene, goblin, character) {
    stopCombat(scene);
    scene.currentAction = null;
    scene.actionStarted = false;
    scene.tileInteractables.delete(scene.tileKey(goblin.tile));
    goblin.alive = false;
    goblin.hostile = false;
    goblin.remaining = 0;
    goblin.marker.disableInteractive();
    goblin.marker.setVisible(false);
    goblin.labelText.setVisible(false);
    goblin.hpBarBackground.setVisible(false);
    goblin.hpBarFill.setVisible(false);
    spawnDrops(scene, goblin, character);
    scene.time.delayedCall(MONSTERS[goblin.monsterId].respawnMs, () => {
      goblin.hp = goblin.maxHp;
      goblin.remaining = 1;
      goblin.alive = true;
      goblin.hostile = false;
      const campTiles = [];
      const bounds = goblin.wanderBounds || { minX: 26, maxX: 39, minY: 9, maxY: 20 };
      for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
        for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
          if (!scene.blocked[y][x] && !occupiedByOther(scene, goblin, x, y)) {
            campTiles.push({ x, y });
          }
        }
      }
      campTiles.sort((first, second) => (
        Math.abs(first.x - goblin.spawnTile.x) + Math.abs(first.y - goblin.spawnTile.y)
        - Math.abs(second.x - goblin.spawnTile.x) - Math.abs(second.y - goblin.spawnTile.y)
      ));
      goblin.tile = campTiles[0] || { ...goblin.spawnTile };
      goblin.x = goblin.tile.x;
      goblin.y = goblin.tile.y;
      const worldX = goblin.x * 32 + 16;
      const worldY = goblin.y * 32 + 16;
      goblin.marker.setPosition(worldX, worldY).setVisible(true).setInteractive();
      goblin.labelText.setPosition(worldX, worldY - 22).setVisible(true);
      goblin.marker.setInteractive(
        new Phaser.Geom.Rectangle(-16, -16, 32, 32),
        Phaser.Geom.Rectangle.Contains,
      );
      scene.tileInteractables.set(scene.tileKey(goblin.tile), goblin);
      if (goblin.type === 'farmAnimal') scheduleFarmAnimalWander(scene, goblin);
    });
  }

  function spawnDrops(scene, goblin, character) {
    const monster = MONSTERS[goblin.monsterId];
    const homeBonus = RACES[character.raceId]?.homeRegion === monster.region;
    const drops = [];
    monster.drops.forEach((drop) => {
      const chance = Math.min(1, drop.chance * (homeBonus ? 1.5 : 1));
      if (Math.random() >= chance) return;
      let qty = drop.qty;
      if (typeof qty === 'string') {
        const [min, max] = qty.split('-').map(Number);
        qty = Phaser.Math.Between(min, max);
        if (homeBonus && drop.itemId === 'coins') qty = Math.floor(qty * 1.5);
      }
      drops.push({ itemId: drop.itemId, qty });
    });
    if (!drops.length) return;

    const tile = { ...goblin.tile };
    const node = {
      id: `loot-${goblin.id}-${Date.now()}`,
      type: 'groundItem',
      groundItems: drops,
      x: tile.x,
      y: tile.y,
      tile,
      region: goblin.region,
      maxYield: Infinity,
      remaining: 1,
      verb: 'Take',
      displayName: ITEMS[drops[0].itemId].name,
    };
    window.updateGroundItemPresentation?.(scene, node, drops[0]);
    scene.nodes.push(node);
    scene.tileInteractables.set(scene.tileKey(tile), node);
  }

  function takeGroundItem(scene, node, character) {
    for (const drop of node.groundItems) {
      if (drop.qty <= 0) continue;
      const capacity = canAddItem(character, drop.itemId, drop.qty);
      if (capacity <= 0) {
        window.addGameMessage?.('Your inventory is too full.');
        return;
      }
      const remaining = addItem(character, drop.itemId, capacity);
      drop.qty -= capacity - remaining;
      if (drop.qty > 0) {
        node.groundItems = node.groundItems.filter((entry) => entry.qty > 0);
        if (node.groundItems.length) {
          const nextDrop = node.groundItems[0];
          window.updateGroundItemPresentation?.(scene, node, nextDrop);
        }
        window.addGameMessage?.('Your inventory is too full.');
        return;
      }
    }

    node.groundItems = node.groundItems.filter((entry) => entry.qty > 0);
    if (node.groundItems.length) {
      const nextDrop = node.groundItems[0];
      window.updateGroundItemPresentation?.(scene, node, nextDrop);
      return;
    }
    window.addGameMessage?.(`You take the ${node.displayName.toLowerCase()}.`);
    scene.tileInteractables.delete(scene.tileKey(node.tile));
    scene.nodes = scene.nodes.filter((entry) => entry !== node);
    node.marker.destroy();
    node.labelText?.destroy();
    scene.currentAction = null;
    scene.actionStarted = false;
  }

  function playerDied(scene, character) {
    stopCombat(scene);
    scene.currentAction = null;
    scene.actionStarted = false;
    scene.path = [];
    scene.moving = false;
    window.addGameMessage?.('You have died!', true);
    scene.cameras.main.fadeOut(250, 0, 0, 0);
    scene.cameras.main.once('camerafadeoutcomplete', () => {
      const spawn = { x: 20, y: 16 };
      scene.currentTile = spawn;
      scene.player.setPosition(spawn.x * 32 + 16, spawn.y * 32 + 16);
      character.currentHp = maxHitpoints(character);
      refreshHealth(character);
      scene.cameras.main.fadeIn(350, 0, 0, 0);
    });
  }

  function eatFoodFromSlot(character, index) {
    if (document.querySelector('.town-panel')) return false;
    const slot = character.inventory[index];
    const healing = ITEMS[slot?.itemId]?.heals;
    if (!Number.isFinite(healing)) return false;
    const multiplier = RACES[character.raceId]?.qol.foodHealBonus ?? 1;
    const amount = Math.floor(healing * multiplier);
    const restored = Math.min(amount, maxHitpoints(character) - character.currentHp);
    if (!removeInventorySlot(character, index)) return false;
    character.currentHp += restored;
    refreshHealth(character);
    window.addGameMessage?.(`You eat the ${ITEMS[slot.itemId].name.toLowerCase()}. It heals ${restored}.`);
    return true;
  }

  window.createCombatMonsters = createCombatMonsters;
  window.startCombat = startCombat;
  window.canUseRangedCombat = canUseRangedCombat;
  window.canCastMagic = canCastMagic;
  window.getRangedAttackRange = rangedAttackRange;
  window.stopCombat = stopCombat;
  window.updateCombat = (scene) => {
    if (!scene.combatState || !scene.currentAction) return;
    const { goblin } = scene.combatState;
    const distance = Math.abs(scene.currentTile.x - goblin.tile.x) + Math.abs(scene.currentTile.y - goblin.tile.y);
    if (scene.combatState.magic || scene.combatState.ranged) {
      if (distance > scene.combatState.range) scene.cancelNodeAction();
    } else if (distance >= 3) {
      scene.cancelNodeAction();
    }
  };
  window.isCombatTileOccupied = (scene, x, y) => scene.nodes.some((node) => (
    (node.type === 'goblin' || node.type === 'farmAnimal' || node.type === 'trainingTarget')
    && node.alive
    && node.tile.x === x
    && node.tile.y === y
  ));
  window.takeGroundItem = takeGroundItem;
  window.eatFoodFromSlot = eatFoodFromSlot;
  window.refreshCombatHud = drawCombatHud;
})();
