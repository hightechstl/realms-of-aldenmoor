(() => {
  /* Encounter-based combat prototype (Version 1.6).
   *
   * Clicking a monster no longer starts the old overworld auto-battle.
   * Instead the fight moves into a turn-based encounter screen in the
   * style of Pokemon / Final Fantasy: big sprites, big numbered health
   * bars, and one deliberate choice per turn — Attack, an Ability,
   * Second Wind, Guard, Bag (eat food) or Flee. Spam clicking cannot
   * speed anything up: while a turn is animating, every button is
   * disabled and the world behind the overlay is frozen.
   *
   * All damage / XP formulas mirror the overworld combat in combat.js,
   * and a kill still routes through combat.js's kill function, so drops,
   * quest progress and respawn timers behave exactly as before.
   * Training targets are NOT encounters — they keep the old behaviour.
   */

  const overworldStartCombat = window.startCombat;

  const TEXTURE_BY_MONSTER = {
    goblin: 'goblin',
    hobgoblin: 'hobgoblin',
    ashHound: 'ash-hound',
    emberfang: 'emberfang',
    reefLurker: 'reef-lurker',
    stormmaw: 'stormmaw',
    chicken: 'chicken',
    cow: 'cow',
  };
  const BOSS_IDS = new Set(['emberfang', 'stormmaw']);
  const REGION_NAMES = {
    stronghold: 'Goblin Stronghold',
    wastes: 'The Ashen Wastes',
    stormcove: 'Stormcove Isle',
    farmland: 'Farmland',
    coast: 'The Coast',
    forest: 'The Forest',
    mine: 'The Mine',
  };
  const AMMO_BONUS = { bronzeArrow: 0, ironArrow: 1, steelArrow: 2, mithrilArrow: 3 };
  const ABILITY_BY_MODE = {
    melee: { name: 'Power Strike', accuracy: 4, bonusDamage: 2 },
    ranged: { name: 'Aimed Shot', accuracy: 4, bonusDamage: 2 },
    magic: { name: 'Surge', accuracy: 3, bonusDamage: 2 },
  };

  function hitChance(attackerLevel, defenderLevel) {
    if (typeof window.hitChanceForEncounter === 'function') {
      return window.hitChanceForEncounter(attackerLevel, defenderLevel);
    }
    return Math.max(0.15, Math.min(0.95, 0.55 + (attackerLevel - defenderLevel) * 0.03));
  }

  function maxHitpoints(character) {
    if (typeof window.maxHitpointsForEncounter === 'function') {
      return window.maxHitpointsForEncounter(character);
    }
    return levelForXp(character.skills.hitpoints.xp);
  }

  function refreshHealth(character) {
    if (typeof window.refreshHealthForEncounter === 'function') {
      window.refreshHealthForEncounter(character);
    } else {
      window.saveCharacter?.(character);
      window.refreshCombatHud?.(character);
    }
  }

  function roll(max) {
    return Phaser.Math.Between(0, Math.max(0, max));
  }

  function combatMode(character) {
    if (window.canCastMagic?.(character)) return 'magic';
    if (window.canUseRangedCombat?.(character)) return 'ranged';
    return 'melee';
  }

  function styleName(character, mode) {
    const style = mode === 'ranged'
      ? (character.rangedStyle || 'accurate')
      : (character.combatStyle || 'accurate');
    return style.charAt(0).toUpperCase() + style.slice(1);
  }

  function textureUrl(scene, key) {
    try {
      const texture = scene.textures?.get?.(key);
      const image = texture?.source?.[0]?.image || texture?.source?.[0]?.canvas;
      if (image && typeof image.toDataURL === 'function') return image.toDataURL();
      if (image && typeof image.src === 'string' && image.src) return image.src;
    } catch (error) {
      /* fall through to the letter fallback */
    }
    return null;
  }

  function makeEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function startEncounter(scene, node) {
    const character = scene.character;
    if (!character || !node?.alive) return;
    const monster = MONSTERS[node.monsterId];
    if (!monster) return;

    scene.encounterActive = true;
    scene.currentAction = node;
    scene.actionStarted = true;
    window.stopCombat?.(scene);
    node.hpBarBackground?.setVisible(false);
    node.hpBarFill?.setVisible(false);

    const state = {
      scene,
      node,
      monster,
      character,
      busy: false,
      over: false,
      bagOpen: false,
      guarding: false,
      staggered: false,
      turn: 1,
      abilityCooldown: 0,
      windCooldown: 0,
      prayers: new Set(),
      xp: {},
      lines: [],
      timers: [],
      el: {},
      menuButtons: [],
    };

    buildOverlay(state);
    logLine(state, `${monster.name} blocks your path!`);
    logLine(state, 'Choose a move — one action per turn.');
    render(state);
    window.addGameMessage?.(`Encounter! ${monster.name}.`);
  }

  function buildOverlay(state) {
    const { scene, node, monster, character } = state;
    const gameHost = document.querySelector('#game');
    if (!gameHost) throw new Error('Game container is missing.');
    const overlay = makeEl('div', `encounter-overlay encounter-region-${monster.region || 'wilds'}`);
    overlay.id = 'encounter-overlay';

    const head = makeEl('div', 'encounter-head');
    const title = makeEl('div', 'encounter-title', monster.name);
    const sub = makeEl(
      'div',
      'encounter-turn',
      `${REGION_NAMES[monster.region] || 'The Wilds'} · Turn 1`,
    );
    head.append(title, sub);
    state.el.turnLabel = sub;

    const arena = makeEl('div', 'encounter-arena');
    const playerSide = buildFighter(
      state,
      textureUrl(scene, 'player'),
      character.name,
      `${RACES[character.raceId]?.name || ''} ${CLASSES[character.classId]?.name || ''}`.trim(),
      RACES[character.raceId]?.tint,
      false,
    );
    const vs = makeEl('div', 'encounter-vs', 'VS');
    const enemySide = buildFighter(
      state,
      textureUrl(scene, TEXTURE_BY_MONSTER[node.monsterId]),
      monster.name,
      BOSS_IDS.has(node.monsterId) ? 'Boss' : (REGION_NAMES[monster.region] || 'Wild monster'),
      ITEMS[node.monsterId]?.color,
      BOSS_IDS.has(node.monsterId),
    );
    arena.append(playerSide.wrap, vs, enemySide.wrap);
    state.el.player = playerSide;
    state.el.enemy = enemySide;

    const log = makeEl('div', 'encounter-log');
    state.el.log = log;

    const menu = makeEl('div', 'encounter-menu');
    state.el.menu = menu;
    const attackBtn = makeMenuButton(state, menu, '', () => attackAction(state, false), true);
    const abilityBtn = makeMenuButton(state, menu, '', () => attackAction(state, true), false);
    const windBtn = makeMenuButton(state, menu, '', () => secondWindAction(state), false);
    const guardBtn = makeMenuButton(state, menu, 'Guard', () => guardAction(state), false);
    const bagBtn = makeMenuButton(state, menu, 'Bag', () => toggleBag(state), false);
    const fleeBtn = makeMenuButton(state, menu, 'Flee', () => fleeAction(state), false);
    state.el.attackBtn = attackBtn;
    state.el.abilityBtn = abilityBtn;
    state.el.windBtn = windBtn;
    state.el.guardBtn = guardBtn;
    state.el.bagBtn = bagBtn;
    state.el.fleeBtn = fleeBtn;

    const prayerBar = makeEl('div', 'encounter-prayer');
    const prayerLabel = makeEl('div', 'encounter-prayer-label', '');
    const prayerChips = makeEl('div', 'encounter-prayer-chips');
    prayerBar.append(prayerLabel, prayerChips);
    state.el.prayerLabel = prayerLabel;
    state.el.prayerChips = prayerChips;

    const bag = makeEl('div', 'encounter-bag');
    bag.style.display = 'none';
    state.el.bag = bag;

    const result = makeEl('div', 'encounter-result');
    result.style.display = 'none';
    state.el.result = result;

    overlay.append(head, arena, log, menu, prayerBar, bag, result);
    gameHost.append(overlay);
    state.el.overlay = overlay;
  }

  function buildFighter(state, imageUrl, name, subText, tint, isBoss) {
    const wrap = makeEl('div', 'encounter-fighter');
    const stage = makeEl('div', 'encounter-stage');
    if (imageUrl) {
      const img = makeEl('img', isBoss ? 'encounter-sprite encounter-boss' : 'encounter-sprite');
      img.src = imageUrl;
      img.alt = name;
      stage.append(img);
    } else {
      const fallback = makeEl('div', 'encounter-fallback', (name || '?').charAt(0).toUpperCase());
      const tintValue = Number.isFinite(tint) ? tint : 0x8d744e;
      fallback.style.background = `#${tintValue.toString(16).padStart(6, '0')}`;
      stage.append(fallback);
    }
    const nameEl = makeEl('div', 'encounter-name', name);
    const subEl = makeEl('div', 'encounter-sub', subText || '');
    const bar = makeEl('div', 'encounter-hpbar');
    const fill = makeEl('div', 'encounter-hpfill');
    bar.append(fill);
    const hpText = makeEl('div', 'encounter-hptext', '');
    wrap.append(stage, nameEl, subEl, bar, hpText);
    return { wrap, stage, fill, hpText };
  }

  function makeMenuButton(state, menu, label, onClick, primary) {
    const button = makeEl('button', primary ? 'encounter-btn encounter-btn-primary' : 'encounter-btn', label);
    button.type = 'button';
    button.addEventListener('click', () => {
      if (state.busy || state.over || button.disabled) return;
      onClick();
    });
    menu.append(button);
    state.menuButtons.push(button);
    return button;
  }

  function logLine(state, text) {
    state.lines.push(text);
    if (state.lines.length > 5) state.lines.shift();
    const log = state.el.log;
    if (!log) return;
    log.replaceChildren(...state.lines.map((line) => makeEl('p', '', line)));
  }

  function later(state, ms, fn) {
    const id = setTimeout(() => { if (!state.over) fn(); }, ms);
    state.timers.push(id);
    return id;
  }

  function grantXp(state, skill, baseAmount) {
    const result = addXp(state.character, skill, baseAmount);
    window.handleCombatXp?.(skill, result, state.scene);
    state.xp[skill] = (state.xp[skill] || 0) + result.gained;
    return result;
  }

  function equippedModSet(character, abilityKey) {
    const equipped = new Set();
    if (!character || typeof normalizeAbilityMods !== 'function') return equipped;
    const mods = normalizeAbilityMods(character.abilityMods);
    Object.values(mods[abilityKey] || {}).forEach((id) => { if (id) equipped.add(id); });
    return equipped;
  }

  function secondWindAmount(state) {
    const defence = levelForXp(state.character.skills.defence.xp);
    let amount = 3 + Math.floor(defence / 5);
    if (state.character.classId === 'acolyte') amount += 2;
    const mods = equippedModSet(state.character, 'heal');
    if (mods.has('deepBreath')) amount += 2;
    if (mods.has('fieldDressing')) amount += Math.floor(defence / 10);
    if (mods.has('secondHeart')) {
      amount = Math.max(amount, Math.ceil(maxHitpoints(state.character) / 4));
    }
    return amount;
  }

  function foodSlots(character) {
    const slots = [];
    character.inventory.forEach((slot, index) => {
      if (slot && Number.isFinite(ITEMS[slot.itemId]?.heals) && slot.qty > 0) {
        slots.push({ index, itemId: slot.itemId, qty: slot.qty });
      }
    });
    return slots;
  }

  function render(state) {
    const { character, node } = state;
    const playerMax = maxHitpoints(character);
    renderFighter(state.el.player, character.currentHp, playerMax);
    renderFighter(state.el.enemy, node.hp, node.maxHp);
    state.el.turnLabel.textContent = `${REGION_NAMES[state.monster.region] || 'The Wilds'} · Turn ${state.turn}`;

    const mode = combatMode(character);
    const busy = state.busy || state.over;
    state.el.attackBtn.textContent = mode === 'magic'
      ? 'Cast Wind Strike'
      : mode === 'ranged'
        ? `Shoot · ${styleName(character, mode)}`
        : `Attack · ${styleName(character, mode)}`;
    state.el.attackBtn.disabled = busy;
    const ability = ABILITY_BY_MODE[mode];
    const equippedPower = equippedModSet(character, 'power').size;
    state.el.abilityBtn.textContent = state.abilityCooldown > 0
      ? `${ability.name} (${state.abilityCooldown})`
      : equippedPower > 0
        ? `${ability.name} · ${equippedPower} mod${equippedPower === 1 ? '' : 's'}`
        : ability.name;
    state.el.abilityBtn.disabled = busy || state.abilityCooldown > 0;
    const heal = secondWindAmount(state);
    state.el.windBtn.textContent = state.windCooldown > 0
      ? `Second Wind (${state.windCooldown})`
      : `Second Wind · heal ${heal}`;
    state.el.windBtn.disabled = busy || state.windCooldown > 0 || character.currentHp >= playerMax;
    state.el.guardBtn.textContent = 'Guard · halve next hit';
    state.el.guardBtn.disabled = busy;
    const foods = foodSlots(character);
    state.el.bagBtn.textContent = foods.length ? `Bag · food ×${foods.reduce((sum, f) => sum + f.qty, 0)}` : 'Bag · no food';
    state.el.bagBtn.disabled = busy || foods.length === 0;
    state.el.fleeBtn.textContent = BOSS_IDS.has(node.monsterId) ? 'Flee · 50%' : 'Flee · 80%';
    state.el.fleeBtn.disabled = busy;
    if (state.bagOpen) renderBag(state);
    renderPrayers(state);
  }

  function renderPrayers(state) {
    const { character } = state;
    if (!state.el.prayerChips || typeof PRAYERS === 'undefined') return;
    const max = maxPrayerPoints(character);
    const points = normalizePrayerPoints(character);
    character.prayerPoints = points;
    state.el.prayerLabel.textContent = `✦ Prayer ${points} / ${max} — toggles are free, they drain each round`;
    const busy = state.busy || state.over;
    const level = levelForXp(character.skills.prayer.xp);
    const chips = Object.entries(PRAYERS).map(([id, prayer]) => {
      const locked = level < prayer.level;
      const active = state.prayers.has(id);
      const chip = makeEl(
        'button',
        active ? 'encounter-chip encounter-chip-on' : 'encounter-chip',
        locked ? `${prayer.name} · Prayer ${prayer.level}` : `${prayer.name} · drain ${prayer.drain}`,
      );
      chip.type = 'button';
      chip.title = prayer.desc;
      chip.disabled = busy || locked || (!active && points <= 0);
      chip.addEventListener('click', () => {
        if (chip.disabled || state.busy || state.over) return;
        togglePrayer(state, id);
      });
      return chip;
    });
    state.el.prayerChips.replaceChildren(...chips);
  }

  function togglePrayer(state, id) {
    const prayer = PRAYERS[id];
    if (!prayer) return;
    if (state.prayers.has(id)) {
      state.prayers.delete(id);
      logLine(state, `${prayer.name} fades.`);
    } else {
      if (prayer.excludes) state.prayers.delete(prayer.excludes);
      state.prayers.add(id);
      window.sfx?.('pray');
      logLine(state, `${prayer.name} — ${prayer.desc}`);
    }
    render(state);
  }

  function renderFighter(fighter, hp, max) {
    if (!fighter) return;
    const ratio = max > 0 ? Math.max(0, hp / max) : 0;
    fighter.fill.style.width = `${ratio * 100}%`;
    fighter.fill.style.backgroundColor = ratio > 0.5 ? '#53bd65' : ratio > 0.25 ? '#e5c943' : '#e44b45';
    fighter.hpText.textContent = `HP ${Math.max(0, hp)} / ${max}`;
  }

  function animateHit(state, side, damage) {
    const fighter = side === 'enemy' ? state.el.enemy : state.el.player;
    if (!fighter) return;
    fighter.stage.classList.add('encounter-hit');
    setTimeout(() => fighter.stage.classList.remove('encounter-hit'), 360);
    const splat = makeEl(
      'div',
      damage > 0 ? 'encounter-splat' : 'encounter-splat encounter-splat-miss',
      damage > 0 ? String(damage) : 'miss',
    );
    fighter.stage.append(splat);
    setTimeout(() => splat.remove(), 950);
  }

  function animateLunge(state, side) {
    const fighter = side === 'enemy' ? state.el.enemy : state.el.player;
    if (!fighter) return;
    const cls = side === 'enemy' ? 'encounter-lunge-left' : 'encounter-lunge-right';
    fighter.stage.classList.add(cls);
    setTimeout(() => fighter.stage.classList.remove(cls), 360);
  }

  /* ---------------- Player actions ---------------- */

  function beginTurn(state) {
    state.busy = true;
    state.bagOpen = false;
    state.el.bag.style.display = 'none';
    state.el.menu.style.display = '';
    render(state);
  }

  function attackAction(state, isAbility) {
    const { character, node, monster } = state;
    const mode = combatMode(character);
    if (mode === 'magic' && (countItem(character, 'airRune') < 1 || countItem(character, 'mindRune') < 1)) {
      logLine(state, "You're out of runes for Wind Strike — deselect it in the Spellbook or flee.");
      render(state);
      return;
    }
    if (isAbility && state.abilityCooldown > 0) return;
    beginTurn(state);
    if (isAbility) state.abilityCooldown = 3;
    const ability = isAbility ? ABILITY_BY_MODE[mode] : null;
    const bonuses = window.getEquipBonuses?.(character) || {
      attackBonus: 0, strengthBonus: 0, defenceBonus: 0, rangedBonus: 0, magicBonus: 0,
    };
    const powerMods = isAbility ? equippedModSet(character, 'power') : new Set();
    const accBonus = (ability ? ability.accuracy * (powerMods.has('precise') ? 2 : 1) : 0)
      + (state.prayers.has('vigor') ? 3 : 0);
    const dmgBonus = ability ? ability.bonusDamage * (powerMods.has('heavy') ? 2 : 1) : 0;
    const targetDefence = isAbility && powerMods.has('piercing')
      ? Math.floor(monster.defence / 2)
      : monster.defence;
    let strike = () => 0;

    if (mode === 'magic') {
      const saver = CLASSES[character.classId]?.perks?.runeSaver;
      if (!(saver && Math.random() < 0.15)) {
        removeItem(character, 'airRune', 1);
        removeItem(character, 'mindRune', 1);
        window.refreshSpellbookHud?.(character);
        window.refreshInventoryHud?.(character);
      }
      const magicLevel = levelForXp(character.skills.magic.xp);
      strike = () => (Math.random() < hitChance(magicLevel + bonuses.magicBonus + accBonus, targetDefence)
        ? roll(2 + Math.floor(magicLevel / 10) + dmgBonus)
        : 0);
      window.sfx?.('cast');
      logLine(state, ability
        ? `You surge with magic and cast Wind Strike at the ${monster.name}!`
        : `You cast Wind Strike at the ${monster.name}.`);
    } else if (mode === 'ranged') {
      const ammo = character.equipment.ammo;
      const saver = CLASSES[character.classId]?.perks?.arrowSaver;
      if (!(saver && Math.random() < 0.2)) {
        ammo.qty -= 1;
        if (ammo.qty === 0) character.equipment.ammo = null;
        window.saveCharacter?.(character);
        window.refreshEquipmentHud?.(character);
      }
      const rangedLevel = levelForXp(character.skills.ranged.xp);
      const style = character.rangedStyle || 'accurate';
      const accuracy = rangedLevel + bonuses.rangedBonus + (style === 'accurate' ? 2 : 0) + accBonus;
      strike = () => (Math.random() < hitChance(accuracy, targetDefence)
        ? roll(1 + Math.floor(rangedLevel / 5) + (AMMO_BONUS[ammo.itemId] ?? 0) + dmgBonus)
        : 0);
      window.sfx?.('shoot');
      logLine(state, ability
        ? `You take careful aim and loose a shot at the ${monster.name}!`
        : `You shoot at the ${monster.name}.`);
    } else {
      const attackLevel = levelForXp(character.skills.attack.xp);
      const strengthLevel = levelForXp(character.skills.strength.xp);
      strike = () => (Math.random() < hitChance(attackLevel + bonuses.attackBonus + accBonus, targetDefence)
        ? roll(1 + Math.floor((strengthLevel + bonuses.strengthBonus) / 5) + dmgBonus)
        : 0);
      window.sfx?.('swing');
      logLine(state, ability
        ? `You unleash a Power Strike on the ${monster.name}!`
        : `You attack the ${monster.name} (${styleName(character, mode)}).`);
    }

    let damage = strike();
    if (damage > 0 && state.prayers.has('vigor')) {
      damage = Math.max(damage + 1, Math.floor(damage * 1.25));
    }
    if (isAbility && damage > 0 && powerMods.has('executioner')
      && node.hp <= Math.floor(node.maxHp * 0.3)) {
      damage = Math.ceil(damage * 1.5);
      logLine(state, 'Executioner! You strike the weakened foe with lethal force!');
    }
    if (isAbility && powerMods.has('flurry')) {
      const second = strike();
      if (second > 0) {
        const flurryDamage = Math.floor(second * 0.6);
        damage += flurryDamage;
        logLine(state, `Flurry! A second strike lands for ${flurryDamage}.`);
      }
    }
    if (isAbility && damage > 0 && powerMods.has('crushing') && Math.random() < 0.25) {
      state.staggered = true;
      logLine(state, `Crushing Blow! The ${monster.name} is staggered!`);
    }

    animateLunge(state, 'player');
    animateHit(state, 'enemy', damage);
    if (damage > 0) window.sfx?.('hit');

    if (damage > 0) {
      node.hp = Math.max(0, node.hp - damage);
      if (mode === 'magic') {
        grantXp(state, 'hitpoints', damage * 1.33);
      } else if (mode === 'ranged') {
        const style = character.rangedStyle || 'accurate';
        grantXp(state, 'ranged', damage * (style === 'longrange' ? 2 : 4));
        if (style === 'longrange') grantXp(state, 'defence', damage * 2);
        grantXp(state, 'hitpoints', damage * 1.33);
      } else {
        const styleXp = damage * 4;
        const style = character.combatStyle || 'accurate';
        if (style === 'aggressive') grantXp(state, 'strength', styleXp);
        else if (style === 'defensive') grantXp(state, 'defence', styleXp);
        else if (style === 'controlled') {
          grantXp(state, 'attack', styleXp / 3);
          grantXp(state, 'strength', styleXp / 3);
          grantXp(state, 'defence', styleXp / 3);
        } else grantXp(state, 'attack', styleXp);
        grantXp(state, 'hitpoints', damage * 1.33);
      }
      logLine(state, `Hit! The ${monster.name} takes ${damage} damage.`);
    } else {
      logLine(state, `Miss! The ${monster.name} is unharmed.`);
    }
    if (mode === 'magic') grantXp(state, 'magic', 5.5 + damage * 2);
    render(state);
    finishPlayerPhase(state);
  }

  function secondWindAction(state) {
    const { character } = state;
    if (state.windCooldown > 0) return;
    if (character.currentHp >= maxHitpoints(character)) {
      logLine(state, "You're already at full health.");
      render(state);
      return;
    }
    beginTurn(state);
    const healMods = equippedModSet(character, 'heal');
    state.windCooldown = healMods.has('ironLungs') ? 3 : 4;
    const healed = Math.min(secondWindAmount(state), maxHitpoints(character) - character.currentHp);
    character.currentHp += healed;
    refreshHealth(character);
    window.sfx?.('eat');
    logLine(state, `Second Wind! You steady yourself and recover ${healed} HP.`);
    if (healMods.has('battleMend')) {
      state.guarding = true;
      logLine(state, 'Battle Mend! Your guard is up as the wounds close.');
    }
    if (healMods.has('rally') && state.abilityCooldown > 0) {
      state.abilityCooldown = 0;
      logLine(state, 'Rally! Your power ability is ready again!');
    }
    render(state);
    finishPlayerPhase(state);
  }

  function guardAction(state) {
    beginTurn(state);
    state.guarding = true;
    logLine(state, 'You raise your guard, bracing for the next hit.');
    render(state);
    finishPlayerPhase(state);
  }

  function fleeAction(state) {
    const { node, monster } = state;
    beginTurn(state);
    const chance = BOSS_IDS.has(node.monsterId) ? 0.5 : 0.8;
    if (Math.random() < chance) {
      logLine(state, 'You got away safely!');
      window.sfx?.('click');
      const fledNode = node;
      later(state, 650, () => {
        fledNode.hp = fledNode.maxHp;
        closeEncounter(state);
        window.addGameMessage?.(`You fled from the ${monster.name}.`);
      });
      return;
    }
    logLine(state, "Couldn't escape!");
    finishPlayerPhase(state);
  }

  function toggleBag(state) {
    state.bagOpen = !state.bagOpen;
    state.el.bag.style.display = state.bagOpen ? '' : 'none';
    state.el.menu.style.display = state.bagOpen ? 'none' : '';
    render(state);
  }

  function renderBag(state) {
    const { character } = state;
    const bag = state.el.bag;
    const foods = foodSlots(character);
    const children = [makeEl('div', 'encounter-bag-title', 'Eat what? (uses your turn)')];
    if (character.currentHp >= maxHitpoints(character)) {
      children.push(makeEl('p', 'encounter-bag-note', "You're at full health — food would be wasted."));
    }
    foods.forEach(({ index, itemId, qty }) => {
      const item = ITEMS[itemId];
      const bonus = RACES[character.raceId]?.qol.foodHealBonus ?? 1;
      const heal = Math.floor(item.heals * bonus);
      const button = makeEl('button', 'encounter-btn encounter-bag-btn', `${item.name} · heals ${heal} · ×${qty}`);
      button.type = 'button';
      button.disabled = character.currentHp >= maxHitpoints(character);
      button.addEventListener('click', () => {
        if (button.disabled || state.busy || state.over) return;
        eatAction(state, index);
      });
      children.push(button);
    });
    const back = makeEl('button', 'encounter-btn', 'Back');
    back.type = 'button';
    back.addEventListener('click', () => { if (!state.busy && !state.over) toggleBag(state); });
    children.push(back);
    bag.replaceChildren(...children);
  }

  function eatAction(state, inventoryIndex) {
    const slot = state.character.inventory[inventoryIndex];
    if (!slot || !Number.isFinite(ITEMS[slot.itemId]?.heals)) {
      state.bagOpen = false;
      state.el.bag.style.display = 'none';
      state.el.menu.style.display = '';
      render(state);
      return;
    }
    beginTurn(state);
    const eaten = window.eatFoodFromSlot?.(state.character, inventoryIndex);
    if (!eaten) {
      state.busy = false;
      render(state);
      return;
    }
    logLine(state, 'You take a bite and steady yourself.');
    render(state);
    finishPlayerPhase(state);
  }

  /* ---------------- Monster turn / endings ---------------- */

  function finishPlayerPhase(state) {
    if (state.over) return;
    if (state.node.hp <= 0) {
      later(state, 600, () => victory(state));
      return;
    }
    later(state, 650, () => monsterTurn(state));
  }

  function monsterTurn(state) {
    const { scene, node, monster, character } = state;
    if (state.over || !node.alive) return;
    if (state.staggered) {
      state.staggered = false;
      logLine(state, `The ${monster.name} is staggered and loses its turn!`);
      render(state);
      endMonsterTurn(state);
      return;
    }
    const bonuses = window.getEquipBonuses?.(character) || { defenceBonus: 0 };
    const defenceLevel = levelForXp(character.skills.defence.xp) + (bonuses.defenceBonus || 0);
    let damage = 0;
    const hit = Math.random() < hitChance(monster.attack, defenceLevel);
    if (hit) damage = roll(monster.maxHit);
    const guarded = state.guarding;
    if (guarded && damage > 0) damage = Math.floor(damage / 2);
    if (damage > 0 && state.prayers.has('greaterWard')) damage = Math.floor(damage / 2);
    else if (damage > 0 && state.prayers.has('ward')) damage = Math.floor(damage * 0.7);
    animateLunge(state, 'enemy');
    animateHit(state, 'player', damage);
    if (damage > 0) {
      window.sfx?.('hurt');
      character.currentHp = Math.max(0, character.currentHp - damage);
      refreshHealth(character);
      logLine(state, guarded && hit
        ? `Your guard absorbs the blow — the ${monster.name} hits you for ${damage}.`
        : `The ${monster.name} hits you for ${damage}.`);
    } else {
      logLine(state, hit && guarded
        ? `Your guard turns the ${monster.name}'s attack aside completely!`
        : `The ${monster.name} attacks… and misses!`);
    }
    render(state);
    if (character.currentHp <= 0) {
      later(state, 750, () => defeat(state));
      return;
    }

    if (applyRetribution(state, damage)) {
      render(state);
      later(state, 600, () => victory(state));
      return;
    }

    node.attackCount = (node.attackCount || 0) + 1;
    if (BOSS_IDS.has(node.monsterId) && node.attackCount % 3 === 0) {
      const breath = node.monsterId === 'emberfang' ? roll(2) + 2 : roll(2) + 3;
      // roll(2)+2 gives 2-4 for Emberfang; roll(2)+3 gives 3-5 for Stormmaw,
      // matching the overworld breath ranges (Between is inclusive).
      later(state, 550, () => {
        if (state.over) return;
        let breathDamage = breath;
        if (state.prayers.has('greaterWard')) breathDamage = Math.floor(breathDamage / 2);
        else if (state.prayers.has('ward')) breathDamage = Math.floor(breathDamage * 0.7);
        window.sfx?.(node.monsterId === 'emberfang' ? 'firebreath' : 'splash');
        animateHit(state, 'player', breathDamage);
        character.currentHp = Math.max(0, character.currentHp - breathDamage);
        refreshHealth(character);
        logLine(state, node.monsterId === 'emberfang'
          ? `Emberfang rears back and breathes fire for ${breathDamage}!`
          : `Stormmaw unleashes a crashing tempest wave for ${breathDamage}!`);
        render(state);
        if (character.currentHp <= 0) {
          later(state, 750, () => defeat(state));
          return;
        }
        if (applyRetribution(state, breathDamage)) {
          render(state);
          later(state, 600, () => victory(state));
          return;
        }
        endMonsterTurn(state);
      });
      return;
    }
    endMonsterTurn(state);
  }

  function applyRetribution(state, taken) {
    const { node, monster } = state;
    if (taken <= 0 || !state.prayers.has('retribution') || node.hp <= 0) return false;
    const reflected = Math.max(1, Math.floor(taken * 0.25));
    node.hp = Math.max(0, node.hp - reflected);
    logLine(state, `Retribution! ${reflected} damage is reflected back at the ${monster.name}!`);
    animateHit(state, 'enemy', reflected);
    return node.hp <= 0;
  }

  function tickPrayerEffects(state) {
    const { character } = state;
    if (state.prayers.size === 0) return;
    if (state.prayers.has('renewal') && character.currentHp > 0) {
      const max = maxHitpoints(character);
      if (character.currentHp < max) {
        const healed = Math.min(2, max - character.currentHp);
        character.currentHp += healed;
        refreshHealth(character);
        logLine(state, `Renewal restores ${healed} HP.`);
      }
    }
    let total = 0;
    state.prayers.forEach((id) => { total += PRAYERS[id]?.drain || 0; });
    if (character.classId === 'acolyte') total = Math.ceil(total / 2);
    if (total <= 0) return;
    const points = normalizePrayerPoints(character);
    const paid = Math.min(points, total);
    character.prayerPoints = points - paid;
    if (paid > 0) grantXp(state, 'prayer', paid);
    saveCharacter(character);
    if (character.prayerPoints <= 0) {
      state.prayers.clear();
      logLine(state, 'Your prayer points are spent — your prayers fade!');
    }
  }

  function endMonsterTurn(state) {
    tickPrayerEffects(state);
    state.turn += 1;
    if (state.abilityCooldown > 0) state.abilityCooldown -= 1;
    if (state.windCooldown > 0) state.windCooldown -= 1;
    state.guarding = false;
    state.busy = false;
    render(state);
  }

  function victory(state) {
    if (state.over) return;
    state.over = true;
    state.busy = false;
    const { scene, node, monster, character } = state;
    render(state);
    window.killMonsterForEncounter?.(scene, node, character);
    window.addGameMessage?.(`${monster.name} defeated!`);
    const xpLines = Object.entries(state.xp)
      .filter(([, gained]) => gained > 0)
      .map(([skill, gained]) => `+${gained} ${skill.charAt(0).toUpperCase()}${skill.slice(1)} XP`);
    const result = state.el.result;
    const title = makeEl('div', 'encounter-result-title', 'Victory!');
    const body = makeEl(
      'p',
      'encounter-result-body',
      `${monster.name} is defeated.${xpLines.length ? ` ${xpLines.join(' · ')}.` : ''} Its loot dropped where it fell — grab it back in the world.`,
    );
    const cont = makeEl('button', 'encounter-btn encounter-btn-primary', 'Continue');
    cont.type = 'button';
    cont.addEventListener('click', () => closeEncounter(state));
    result.replaceChildren(title, body, cont);
    result.style.display = '';
    state.el.menu.style.display = 'none';
    state.el.bag.style.display = 'none';
  }

  function defeat(state) {
    if (state.over) return;
    state.over = true;
    const { scene, node, character } = state;
    node.hp = node.maxHp;
    closeEncounter(state);
    window.playerDiedForEncounter?.(scene, character);
  }

  function closeEncounter(state) {
    state.over = true;
    state.timers.forEach((id) => clearTimeout(id));
    state.timers = [];
    state.el.overlay?.remove();
    const { scene, node } = state;
    scene.encounterActive = false;
    if (scene.currentAction === node) {
      scene.currentAction = null;
      scene.actionStarted = false;
    }
  }

  /* ---------------- Abilities panel (sidebar tab) ---------------- */

  let lastScene = null;

  function skillLabel(skill) {
    return skill.charAt(0).toUpperCase() + skill.slice(1);
  }

  function refreshAbilitiesPanel(character) {
    const panel = document.querySelector('#abilities-panel');
    if (!panel) return;
    if (!character) {
      panel.replaceChildren(makeEl('p', 'abilities-note', 'No character loaded.'));
      return;
    }
    const inFight = Boolean(lastScene?.encounterActive);
    const children = [];
    children.push(makeEl('div', 'abilities-title', 'Ability Mods'));
    children.push(makeEl('p', 'abilities-note', inFight
      ? "You're mid-fight — mods lock until the encounter ends."
      : 'Equip one mod per tier. Mods unlock as your Attack, Strength and Defence grow. Swap them any time out of combat.'));
    const equipped = normalizeAbilityMods(character.abilityMods);
    [
      ['power', 'Power ability', 'Power Strike with a sword · Aimed Shot with a bow · Surge with a staff'],
      ['heal', 'Second Wind', 'Your healing move in every encounter'],
    ].forEach(([key, title, sub]) => {
      children.push(makeEl('div', 'abilities-ability', title));
      children.push(makeEl('p', 'abilities-note', sub));
      ['tier1', 'tier2', 'tier3'].forEach((tierKey, tierIndex) => {
        children.push(makeEl('div', 'abilities-tier', `Tier ${tierIndex + 1}`));
        ABILITY_MODS[key].tiers[tierKey].forEach((mod) => {
          const level = levelForXp(character.skills[mod.skill]?.xp || 0);
          const met = level >= mod.level;
          const isEquipped = equipped[key][tierKey] === mod.id;
          const card = makeEl('div', isEquipped ? 'abilities-card abilities-card-on' : 'abilities-card');
          card.append(makeEl('div', 'abilities-card-name', mod.name));
          card.append(makeEl('div', 'abilities-card-req',
            `${skillLabel(mod.skill)} ${mod.level} · you: ${level}${met ? ' ✓' : ''}`));
          card.append(makeEl('div', 'abilities-card-desc', mod.desc));
          const button = makeEl('button', 'abilities-equip',
            isEquipped ? 'Equipped — tap to remove' : met ? 'Equip' : 'Locked');
          button.type = 'button';
          button.disabled = inFight || (!isEquipped && !met);
          button.addEventListener('click', () => {
            if (button.disabled) return;
            const current = normalizeAbilityMods(character.abilityMods);
            current[key][tierKey] = isEquipped ? null : mod.id;
            character.abilityMods = current;
            window.saveCharacter?.(character);
            window.sfx?.('click');
            refreshAbilitiesPanel(character);
          });
          card.append(button);
          children.push(card);
        });
      });
    });
    panel.replaceChildren(...children);
  }
  window.refreshAbilitiesPanel = refreshAbilitiesPanel;

  window.startCombat = function (scene, node) {
    lastScene = scene;
    if (scene?.encounterActive) return;
    if (!node?.monsterId || node.type === 'trainingTarget') {
      overworldStartCombat?.(scene, node);
      return;
    }
    startEncounter(scene, node);
  };
  window.startEncounter = startEncounter;
  window.isEncounterActive = (scene) => Boolean(scene?.encounterActive);
})();
