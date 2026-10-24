(() => {
  const TILE_SIZE = 32;
  const WORLD_COLUMNS = 128;
  const WORLD_ROWS = 150;
  const VIEW_WIDTH = 800;
  const VIEW_HEIGHT = 600;
  let currentCharacter = loadCharacter();
  let activeScene = null;
  const messageLog = [];

  class GameScene extends Phaser.Scene {
    constructor() {
      super('GameScene');
    }

    create() {
      activeScene = this;
      this.createTextures();
      this.createWorld();
      this.createControls();

      this.cameras.main.setBounds(0, 0, WORLD_COLUMNS * TILE_SIZE, WORLD_ROWS * TILE_SIZE);
      this.cameras.main.setZoom(1);
      if (currentCharacter) this.enterWorld(currentCharacter);
    }

    createTextures() {
      const makeTexture = (key, draw) => {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        draw(graphics);
        graphics.generateTexture(key, TILE_SIZE, TILE_SIZE);
        graphics.destroy();
      }

      [
        ['grass-a', 0x5d9b48, 0x70ad55],
        ['grass-b', 0x579344, 0x66a34d],
        ['stone-a', 0x888b8b, 0xa0a2a0],
        ['stone-b', 0x808484, 0x969997],
        ['dirt-a', 0xa87646, 0xbd8b58],
        ['dirt-b', 0x9e7045, 0xb28151],
        ['rock-a', 0x777d82, 0x92989b],
        ['rock-b', 0x6d747a, 0x858b8e],
        ['scorched-a', 0x5a4940, 0x705247],
        ['scorched-b', 0x55453e, 0x674b42],
        ['water-a', 0x398eb3, 0x55a6c5],
        ['water-b', 0x3485aa, 0x4c9bb9],
        ['dock', 0x9c693b, 0xb47a42],
        ['tree', 0x428345, 0x64a94d],
        ['sand-a', 0xd9c07a, 0xe6d194],
        ['sand-b', 0xd2b56e, 0xdec084],
      ].forEach(([key, base, detail]) => {
        makeTexture(key, (graphics) => {
          graphics.fillStyle(base, 1);
          graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
          graphics.fillStyle(detail, 0.38);
          graphics.fillRect(4, 5, 5, 4);
          graphics.fillRect(20, 19, 7, 5);
          graphics.fillStyle(0x263328, 0.12);
          graphics.fillRect(0, 29, TILE_SIZE, 3);
          if (key.startsWith('rock')) {
            graphics.fillStyle(0xd4d4cc, 0.4);
            graphics.fillTriangle(5, 24, 14, 7, 21, 24);
            graphics.fillStyle(0x555c61, 0.5);
            graphics.fillTriangle(14, 24, 23, 11, 29, 24);
          }
          if (key.startsWith('water')) {
            graphics.fillStyle(0xb8e5d9, 0.45);
            graphics.fillRect(5, 10, 11, 2);
            graphics.fillRect(19, 23, 8, 2);
          }
          if (key.startsWith('scorched')) {
            graphics.fillStyle(0x302e2c, 0.35);
            graphics.fillCircle(8, 21, 3);
            graphics.fillCircle(24, 8, 2);
          }
          if (key === 'dock') {
            graphics.lineStyle(2, 0x704b2d, 1);
            graphics.lineBetween(0, 8, TILE_SIZE, 8);
            graphics.lineBetween(0, 18, TILE_SIZE, 18);
            graphics.lineBetween(0, 28, TILE_SIZE, 28);
          }
          if (key === 'tree') {
            graphics.fillStyle(0x765333, 1);
            graphics.fillRect(13, 20, 7, 12);
            graphics.fillStyle(0x35723d, 1);
            graphics.fillCircle(16, 13, 13);
            graphics.fillStyle(0x75b957, 1);
            graphics.fillCircle(11, 11, 6);
            graphics.fillCircle(21, 15, 6);
          }
        });
      });
      makeTexture('fence', (graphics) => {
        graphics.fillStyle(0x4c3827, 1);
        graphics.fillRect(3, 6, 5, 26);
        graphics.fillRect(24, 6, 5, 26);
        graphics.fillRect(2, 10, 28, 5);
        graphics.fillRect(2, 23, 28, 5);
        graphics.fillStyle(0x8b6942, 1);
        graphics.fillRect(3, 10, 26, 2);
        graphics.fillRect(3, 23, 26, 2);
      });
    }

    showLevelUpBanner(skillName, level) {
      const banner = this.add.text(
        this.player.x,
        this.player.y - 58,
        `Level up! ${skillName} is now level ${level}`,
        {
          fontFamily: 'sans-serif',
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#fff0a8',
          stroke: '#30291f',
          strokeThickness: 4,
        },
      ).setOrigin(0.5).setDepth(12);
      this.tweens.add({
        targets: banner,
        y: banner.y - 32,
        alpha: 0,
        duration: 2200,
        onComplete: () => banner.destroy(),
      });
    }

    createWorld() {
      this.grid = Array.from({ length: WORLD_ROWS }, () => Array(WORLD_COLUMNS).fill('void'));
      this.blocked = Array.from({ length: WORLD_ROWS }, () => Array(WORLD_COLUMNS).fill(true));
      for (let y = 0; y < 84; y += 1) {
        for (let x = 0; x < 70; x += 1) {
          this.grid[y][x] = 'grass';
          this.blocked[y][x] = false;
        }
      }

      const setTile = (x, y, type, isBlocked = false) => {
        if (x < 0 || y < 0 || x >= 70 || y >= 84) return;
        this.grid[y][x] = type;
        this.blocked[y][x] = isBlocked;
      };
      const fill = (x1, y1, x2, y2, type, isBlocked = false) => {
        for (let y = y1; y <= y2; y += 1) {
          for (let x = x1; x <= x2; x += 1) setTile(x, y, type, isBlocked);
        }
      };

      // The square and spokes are laid over the grass before the surrounding regions.
      fill(16, 11, 24, 19, 'stone');
      fill(19, 0, 20, 10, 'dirt');
      fill(0, 14, 15, 15, 'dirt');
      fill(19, 20, 20, 29, 'dirt');
      fill(25, 14, 39, 15, 'dirt');

      fill(0, 0, 15, 29, 'tree', true);
      fill(0, 14, 15, 15, 'dirt');
      fill(19, 0, 20, 10, 'dirt');
      fill(0, 0, 39, 8, 'rock', true);
      fill(19, 0, 20, 10, 'dirt');
      fill(26, 9, 39, 20, 'scorched');
      fill(25, 14, 39, 15, 'dirt');
      // Phase 3, Step 3: agility course clearing in the forest, south of the oaks.
      fill(2, 19, 13, 27, 'grass');
      fill(7, 16, 7, 18, 'dirt');
      setTile(5, 20, 'tree', true);
      setTile(3, 23, 'fence', true);
      setTile(6, 25, 'stone', true);
      setTile(10, 25, 'stone', true);
      setTile(12, 22, 'tree', true);
      setTile(9, 20, 'tree', true);
      fill(14, 23, 25, 29, 'water', true);
      fill(19, 20, 20, 29, 'dirt');
      fill(19, 22, 20, 27, 'dock');

      fill(45, 24, 68, 47, 'grass');
      fill(25, 16, 56, 16, 'dirt');
      fill(55, 16, 56, 24, 'dirt');
      fill(11, 8, 14, 10, 'stone', true);
      fill(15, 10, 15, 13, 'dirt');
      for (let x = 45; x <= 68; x += 1) {
        if (x !== 56) setTile(x, 24, 'fence', true);
        setTile(x, 47, 'fence', true);
      }
      for (let y = 25; y < 47; y += 1) {
        setTile(45, y, 'fence', true);
        setTile(68, y, 'fence', true);
      }
      fill(61, 29, 64, 31, 'barn', true);

      // Phase 3, Step 5: the coast road runs south past the lake to a
      // fishing village on the shore, with a boat out to a small island.
      fill(3, 36, 10, 46, 'tree', true);
      fill(30, 34, 38, 42, 'tree', true);
      fill(12, 55, 36, 62, 'sand');
      fill(19, 30, 20, 62, 'dirt');
      fill(0, 63, 69, 64, 'sand');
      fill(0, 65, 69, 83, 'water', true);
      fill(32, 65, 33, 69, 'dock');
      fill(8, 72, 18, 80, 'sand');
      fill(10, 74, 16, 78, 'grass');
      setTile(13, 70, 'dock');
      setTile(13, 71, 'dock');

      this.add.rectangle(
        WORLD_COLUMNS * TILE_SIZE / 2,
        WORLD_ROWS * TILE_SIZE / 2,
        WORLD_COLUMNS * TILE_SIZE,
        WORLD_ROWS * TILE_SIZE,
        0x050607,
      ).setDepth(-2);
      this.add.tileSprite(0, 0, 70 * TILE_SIZE, 84 * TILE_SIZE, 'grass-a')
        .setOrigin(0)
        .setDepth(-1);

      for (let y = 0; y < WORLD_ROWS; y += 1) {
        for (let x = 0; x < WORLD_COLUMNS; x += 1) {
          const type = this.grid[y][x];
          if (type === 'grass' || type === 'void') continue;
          const variant = (x + y) % 2 === 0 ? 'a' : 'b';
          const texture = type.startsWith('interior-')
            ? type
            : type === 'tree' || type === 'dock' || type === 'fence' ? type : `${type}-${variant}`;
          if (type === 'barn') continue;
          this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, texture).setDepth(0);
        }
      }

      this.addBuilding(17, 12, 3, 2, 'BANK', 0x8e5d36);
      this.addBuilding(21, 12, 3, 2, 'STORE', 0x9d6738);
      this.addBuilding(26, 11, 3, 3, 'SMITHY', 0x855536);
      this.addBuilding(22, 7, 3, 3, 'CHAPEL', 0x74787d);
      this.addBuilding(11, 8, 4, 3, 'WIZARD TOWER', 0x62568d);
      this.interiorNodes = window.createInteriorWorld?.(this) || [];
      this.addBuilding(61, 29, 4, 3, 'BARN', 0x785334);
      this.addBuilding(26, 57, 4, 3, 'FISH MARKET', 0x7a5a38);
      this.addBuilding(14, 56, 3, 2, 'HUT', 0x8e5d36);
      this.add.text(20 * TILE_SIZE, 17 * TILE_SIZE, 'TOWN SQUARE', {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#f5e7c7',
        stroke: '#3f3a33',
        strokeThickness: 3,
      }).setOrigin(0.5);
      this.createGatheringNodes();
    }

    createGatheringNodes() {
      this.nodeObjects = new Map();
      this.nodes = [];
      // Tools are assumed in v0.1; resource nodes do not require tool items yet.
      [
        { id: 'copper-1', type: 'ore', itemId: 'copperOre', skill: 'mining', x: 18, y: 2, region: 'mine', label: 'Cu' },
        { id: 'copper-2', type: 'ore', itemId: 'copperOre', skill: 'mining', x: 21, y: 2, region: 'mine', label: 'Cu' },
        { id: 'copper-3', type: 'ore', itemId: 'copperOre', skill: 'mining', x: 18, y: 4, region: 'mine', label: 'Cu' },
        { id: 'copper-4', type: 'ore', itemId: 'copperOre', skill: 'mining', x: 21, y: 4, region: 'mine', label: 'Cu' },
        { id: 'copper-5', type: 'ore', itemId: 'copperOre', skill: 'mining', x: 18, y: 6, region: 'mine', label: 'Cu' },
        { id: 'copper-6', type: 'ore', itemId: 'copperOre', skill: 'mining', x: 21, y: 6, region: 'mine', label: 'Cu' },
        { id: 'tin-1', type: 'ore', itemId: 'tinOre', skill: 'mining', x: 18, y: 3, region: 'mine', label: 'Sn' },
        { id: 'tin-2', type: 'ore', itemId: 'tinOre', skill: 'mining', x: 21, y: 3, region: 'mine', label: 'Sn' },
        { id: 'tin-3', type: 'ore', itemId: 'tinOre', skill: 'mining', x: 18, y: 8, region: 'mine', label: 'Sn' },
        { id: 'tin-4', type: 'ore', itemId: 'tinOre', skill: 'mining', x: 21, y: 8, region: 'mine', label: 'Sn' },
        { id: 'tree-1', type: 'tree', itemId: 'logs', skill: 'woodcutting', level: 1, x: 4, y: 13, region: 'forest', label: 'Tr' },
        { id: 'tree-2', type: 'tree', itemId: 'logs', skill: 'woodcutting', level: 1, x: 8, y: 13, region: 'forest', label: 'Tr' },
        { id: 'tree-3', type: 'tree', itemId: 'logs', skill: 'woodcutting', level: 1, x: 12, y: 13, region: 'forest', label: 'Tr' },
        { id: 'oak-1', type: 'oak', itemId: 'oakLogs', skill: 'woodcutting', level: 15, x: 4, y: 16, region: 'forest', label: 'Oak' },
        { id: 'oak-2', type: 'oak', itemId: 'oakLogs', skill: 'woodcutting', level: 15, x: 8, y: 16, region: 'forest', label: 'Oak' },
        { id: 'shrimp-spot', type: 'fishing', itemId: 'rawShrimp', skill: 'fishing', level: 1, x: 18, y: 24, region: 'coast', label: 'Fish' },
        { id: 'trout-spot', type: 'fishing', itemId: 'rawTrout', skill: 'fishing', level: 15, x: 21, y: 24, region: 'coast', label: 'Fish' },
        { id: 'range', type: 'range', x: 23, y: 18, region: 'town', label: 'Cook' },
        { id: 'village-range', type: 'range', x: 30, y: 61, region: 'village', label: 'Cook' },
        { id: 'sea-trout-spot', type: 'fishing', itemId: 'rawTrout', skill: 'fishing', level: 15, x: 31, y: 67, region: 'coast', label: 'Fish' },
        { id: 'sea-bass-spot', type: 'fishing', itemId: 'rawBass', skill: 'fishing', level: 30, xp: 65, x: 34, y: 67, region: 'coast', label: 'Fish' },
        { id: 'island-bass-spot', type: 'fishing', itemId: 'rawBass', skill: 'fishing', level: 30, xp: 80, x: 19, y: 76, region: 'coast', label: 'Fish' },
        { id: 'oak-3', type: 'oak', itemId: 'oakLogs', skill: 'woodcutting', level: 15, x: 11, y: 75, region: 'coast', label: 'Oak' },
        { id: 'oak-4', type: 'oak', itemId: 'oakLogs', skill: 'woodcutting', level: 15, x: 15, y: 77, region: 'coast', label: 'Oak' },
        { id: 'village-boat', type: 'boat', x: 32, y: 70, region: 'village', label: 'Boat', displayName: 'Ferry boat', destX: 13, destY: 71, destName: 'the island', fare: 30, markerColor: 0xc49a5f },
        { id: 'island-boat', type: 'boat', x: 13, y: 69, region: 'coast', label: 'Boat', displayName: 'Ferry boat', destX: 32, destY: 69, destName: 'the fishing village', fare: 30, markerColor: 0xc49a5f },
      ].forEach((node) => {
        node.maxYield = node.type === 'ore' ? 1 : node.type === 'fishing' || node.type === 'furnace' || node.type === 'range' || node.type === 'banker' || node.type === 'shopkeeper' || node.type === 'altar' || node.type === 'boat'
          ? Infinity
          : Phaser.Math.Between(3, 6);
        node.remaining = node.maxYield;
        this.nodes.push(node);
      });

      window.createThievingNodes?.().forEach((node) => this.nodes.push(node));
      window.createAgilityNodes?.().forEach((node) => this.nodes.push(node));
      this.interiorNodes.forEach((node) => this.nodes.push(node));
      window.createQuestNpcs?.().forEach((node) => this.nodes.push(node));
      window.createCombatMonsters?.(this).forEach((node) => this.nodes.push(node));

      this.nodes.forEach((node) => {
        if (
          node.type === 'goblin' || node.type === 'farmAnimal'
          || node.type === 'trainingTarget'
        ) return;
        const color = node.type === 'ore'
          ? (node.itemId === 'runeEssence' ? 0x9fd8e8 : node.itemId === 'copperOre' ? 0xb76b43 : 0x9aa5aa)
          : node.type === 'tree' || node.type === 'oak'
            ? (node.type === 'oak' ? 0x8a6a3d : 0x4b8c48)
            : node.type === 'fishing'
              ? 0x4b9fc0
                : node.type === 'furnace' ? 0x8b5e45
                  : node.type === 'questNpc' ? 0x9b7544
                    : node.markerColor || 0xc57c46;
        const x = node.x * TILE_SIZE + 16;
        const y = node.y * TILE_SIZE + 16;
        const marker = this.add.rectangle(x, y, 26, 26, color, 1)
          .setStrokeStyle(2, 0xe6d1a2)
          .setDepth(5)
          .setInteractive(new Phaser.Geom.Rectangle(-16, -16, 32, 32), Phaser.Geom.Rectangle.Contains);
        node.labelText = this.add.text(x, y, node.label, {
          fontFamily: 'sans-serif',
          fontSize: node.label.length > 3 ? '7px' : '9px',
          fontStyle: 'bold',
          color: '#fff4dc',
          align: 'center',
          stroke: '#29251f',
          strokeThickness: 2,
        }).setOrigin(0.5).setDepth(6);
        node.marker = marker;
        this.nodeObjects.set(marker, node);
      });

      this.currentAction = null;
      this.actionTimer = null;
      this.hoveredInteractable = null;
      this.tileInteractables = new Map();
      this.pointerOverGame = false;
      this.gameCanvas = document.querySelector('#game canvas');
      if (!this.gameCanvas) throw new Error('Phaser canvas is missing from the game viewport.');
      this.gameCanvas.addEventListener('pointerenter', () => {
        this.pointerOverGame = true;
      });
      this.gameCanvas.addEventListener('pointerleave', () => {
        this.pointerOverGame = false;
        this.hoveredInteractable = null;
        this.hoverOutline.setVisible(false);
        this.interactTooltip.style.display = 'none';
      });
      this.hoverOutline = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE, 0x42e8df, 0.08)
        .setStrokeStyle(2, 0x42e8df, 1)
        .setDepth(9)
        .setVisible(false);
      this.createInteractTooltip();

      this.nodes.forEach((node) => {
        const interactions = {
          ore: {
            verb: 'Mine',
            displayName: node.displayName || (node.itemId === 'copperOre' ? 'Copper rock' : 'Tin rock'),
          },
          tree: { verb: 'Chop', displayName: 'Tree' },
          oak: { verb: 'Chop', displayName: 'Oak tree' },
          fishing: { verb: 'Fish', displayName: 'Fishing spot' },
          furnace: { verb: 'Smelt', displayName: 'Furnace' },
          anvil: { verb: 'Smith', displayName: 'Anvil' },
          altar: { verb: 'Offer bones', displayName: 'Altar' },
          runeAltar: { verb: 'Craft runes', displayName: 'Rune altar' },
          agilityObstacle: { verb: node.verb, displayName: node.displayName },
          shortcut: { verb: node.verb, displayName: node.displayName },
          marketStall: { verb: 'Steal from', displayName: node.displayName },
          citizen: { verb: 'Pickpocket', displayName: 'Citizen' },
          range: { verb: 'Cook', displayName: 'Cooking range' },
          banker: { verb: 'Bank', displayName: node.displayName || 'Banker' },
          shopkeeper: { verb: 'Trade', displayName: node.displayName || 'Shopkeeper' },
          interiorDoor: {
            verb: node.verb,
            displayName: node.displayName,
          },
          boat: { verb: 'Sail', displayName: node.displayName || 'Ferry boat' },
          goblin: { verb: 'Attack', displayName: 'Goblin' },
          questNpc: { verb: 'Talk to', displayName: node.displayName },
        };
        Object.assign(node, interactions[node.type] || {}, { tile: node.tile || { x: node.x, y: node.y } });
        if (!Number.isFinite(node.range)) node.range = 1;
        if (node.type !== 'townGuard') this.tileInteractables.set(this.tileKey(node.tile), node);
      });
      window.startThievingWorld?.(this);
    }

    createInteractTooltip() {
      this.interactTooltip = document.createElement('div');
      this.interactTooltip.setAttribute('aria-live', 'polite');
      Object.assign(this.interactTooltip.style, {
        position: 'absolute',
        zIndex: '3',
        top: '10px',
        left: '10px',
        display: 'none',
        padding: '6px 9px',
        border: '1px solid #ffffff40',
        borderRadius: '4px',
        background: '#101519dd',
        color: '#ffffff',
        font: '600 14px system-ui, sans-serif',
        pointerEvents: 'none',
      });
      this.interactVerb = document.createElement('span');
      this.interactVerb.style.color = '#62e2e5';
      this.interactName = document.createElement('span');
      this.interactName.style.color = '#ffffff';
      this.interactTooltip.append(this.interactVerb, document.createTextNode(' '), this.interactName);
      document.querySelector('#game').append(this.interactTooltip);
    }

    tileKey(tile) {
      return `${tile.x},${tile.y}`;
    }

    getTileUnderPointer(pointer) {
      const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const tileX = Math.floor(wp.x / 32);
      const tileY = Math.floor(wp.y / 32);
      if (tileX < 0 || tileY < 0 || tileX >= WORLD_COLUMNS || tileY >= WORLD_ROWS) return null;
      return { x: tileX, y: tileY };
    }

    isAdjacentTo(node) {
      return Math.abs(this.currentTile.x - node.tile.x) + Math.abs(this.currentTile.y - node.tile.y)
        <= (node.range ?? 1);
    }

    updateInteractHover() {
      const pointer = this.input.activePointer;
      const tile = this.pointerOverGame ? this.getTileUnderPointer(pointer) : null;
      this.hoveredInteractable = tile
        ? this.tileInteractables.get(this.tileKey(tile)) || null
        : null;
      if (!tile) {
        this.hoverOutline.setVisible(false);
        this.interactTooltip.style.display = 'none';
        return;
      }
      this.hoverOutline.setPosition(
        tile.x * TILE_SIZE + TILE_SIZE / 2,
        tile.y * TILE_SIZE + TILE_SIZE / 2,
      ).setVisible(true);
      if (!this.hoveredInteractable) {
        this.interactTooltip.style.display = 'none';
        return;
      }

      const node = this.hoveredInteractable;
      this.interactVerb.textContent = node.verb;
      this.interactName.textContent = node.displayName;
      this.interactTooltip.style.display = 'block';
    }

    findPathToNode(node, rangeOverride = node.range ?? 1) {
      const range = rangeOverride;
      const options = [];
      for (let y = node.tile.y - range; y <= node.tile.y + range; y += 1) {
        for (let x = node.tile.x - range; x <= node.tile.x + range; x += 1) {
          const distance = Math.abs(x - node.tile.x) + Math.abs(y - node.tile.y);
          if (
            distance > 0 && distance <= range
            && x >= 0 && y >= 0 && x < WORLD_COLUMNS && y < WORLD_ROWS
            && !this.blocked[y][x]
          ) options.push({ x, y });
        }
      }
      const paths = options
        .map((tile) => ({
          tile,
          path: tile.x === this.currentTile.x && tile.y === this.currentTile.y
            ? []
            : this.findPath(this.currentTile, tile),
        }))
        .filter(({ tile, path }) => (
          path.length > 0 || (tile.x === this.currentTile.x && tile.y === this.currentTile.y)
        ));
      paths.sort((first, second) => first.path.length - second.path.length);
      return paths[0]?.path ?? null;
    }

    startNodeAction(node) {
      if (!this.player || window.isPlayerStunned?.(this)) return;
      this.cancelNodeAction();
      this.path = [];
      if (node.remaining <= 0) {
        if (node.type === 'marketStall') window.addGameMessage?.('The stall is empty.');
        return;
      }
      if (node.refusedUntil && Date.now() < node.refusedUntil) {
        window.addGameMessage?.('The stallholder is watching you closely.');
        return;
      }
      const requirement = node.level || 1;
      const skill = node.skill;
      if (skill && levelForXp(currentCharacter.skills[skill].xp) < requirement) {
        const message = node.type === 'marketStall'
          ? `You need a Thieving level of ${requirement} to steal from that.`
          : `You need a ${formatSkill(skill)} level of ${requirement} to do that.`;
        window.addGameMessage?.(message);
        return;
      }
      if (
        (node.type === 'marketStall' || node.type === 'citizen')
        && levelForXp(currentCharacter.skills.thieving.xp) < requirement
      ) {
        const message = node.type === 'marketStall'
          ? `You need a Thieving level of ${requirement} to steal from that.`
          : `You need a Thieving level of ${requirement} to pickpocket that.`;
        window.addGameMessage?.(message);
        return;
      }
      const isMonster = Boolean(node.monsterId);
      const interactionRange = isMonster
        ? window.canCastMagic?.(currentCharacter) ? 7
          : window.canUseRangedCombat?.(currentCharacter)
            ? window.getRangedAttackRange?.(currentCharacter) ?? 6
            : undefined
        : undefined;
      const path = this.findPathToNode(node, interactionRange);
      if (path === null) {
        window.addGameMessage?.("I can't reach that.");
        return;
      }
      this.currentAction = node;
      this.actionStarted = false;
      this.actionMessageLogged = false;
      this.path = path;
      if (path.length === 0) this.beginCurrentAction();
    }

    cancelNodeAction() {
      this.currentAction = null;
      this.actionStarted = false;
      window.stopCombat?.(this);
      if (this.actionTimer) {
        this.actionTimer.remove(false);
        this.actionTimer = null;
      }
      if (this.prayerOfferingActive) window.finishPrayerOffering?.(this);
    }

    beginCurrentAction() {
      const node = this.currentAction;
      if (!node) return;
      const distance = Math.abs(this.currentTile.x - node.tile.x) + Math.abs(this.currentTile.y - node.tile.y);
      const canRangedTarget = Boolean(
        node.monsterId
        && (
          (window.canCastMagic?.(currentCharacter) && distance <= 7)
          || (
            !window.canCastMagic?.(currentCharacter)
            && window.canUseRangedCombat?.(currentCharacter)
            && distance <= (window.getRangedAttackRange?.(currentCharacter) ?? 6)
          )
        ),
      );
      if (!this.isAdjacentTo(node) && !canRangedTarget) {
        this.cancelNodeAction();
        return;
      }
      if (node.remaining <= 0) {
        this.cancelNodeAction();
        return;
      }
      if (node.type === 'interiorDoor') {
        window.useInteriorDoor?.(this, node);
        return;
      }
      if (node.type === 'boat') {
        window.sailBoat?.(this, node, currentCharacter);
        return;
      }
      if (node.type === 'banker' || node.type === 'shopkeeper') {
        this.cancelNodeAction();
        window.openTownInterface?.(
          node.type === 'banker' ? 'bank' : 'shop',
          node,
          currentCharacter,
        );
        return;
      }
      if (node.type === 'anvil') {
        this.cancelNodeAction();
        openSmithingPanel(currentCharacter, node);
        return;
      }
      if (node.type === 'runeAltar') {
        this.cancelNodeAction();
        window.openRunecraftingPanel?.(currentCharacter, node);
        return;
      }
      if (node.type === 'agilityObstacle') {
        window.performAgilityObstacle?.(this, node, currentCharacter);
        return;
      }
      if (node.type === 'shortcut') {
        window.useAgilityShortcut?.(this, node, currentCharacter);
        return;
      }
      if (node.type === 'altar') {
        window.startPrayerOffering?.(this, node, currentCharacter);
        return;
      }
      if (node.type === 'marketStall' || node.type === 'citizen') {
        this.actionStarted = true;
        window.performThievingAction?.(this);
        return;
      }
      if (node.type === 'questNpc') {
        this.cancelNodeAction();
        window.talkToQuestNpc?.(node, currentCharacter);
        return;
      }
      if (node.monsterId) {
        this.actionStarted = true;
        window.startCombat?.(this, node);
        return;
      }
      if (node.type === 'groundItem') {
        window.takeGroundItem?.(this, node, currentCharacter);
        return;
      }
      this.actionStarted = true;
      const actionText = {
        Mine: 'mining',
        Chop: 'chopping',
        Fish: 'fishing',
        Smelt: 'smelting',
        Cook: 'cooking',
      }[node.verb];
      if (!this.actionMessageLogged) {
        window.addGameMessage?.(`You begin ${actionText} the ${node.displayName.toLowerCase()}.`);
        this.actionMessageLogged = true;
      }
      this.performNodeAction();
    }

    performNodeAction() {
      const node = this.currentAction;
      if (!node || !currentCharacter) return;
      if (window.isPlayerStunned?.(this)) return;
      if (!this.isAdjacentTo(node)) {
        this.cancelNodeAction();
        return;
      }
      if (node.remaining <= 0) {
        this.cancelNodeAction();
        return;
      }

      if (node.type === 'altar') {
        window.performPrayerOffering?.(this);
        return;
      }
      if (node.type === 'marketStall' || node.type === 'citizen') {
        window.performThievingAction?.(this);
        return;
      }

      if (node.type === 'furnace') {
        const hasBronzeOres = countItem(currentCharacter, 'copperOre') >= 1
          && countItem(currentCharacter, 'tinOre') >= 1;
        if (!hasBronzeOres && countItem(currentCharacter, 'ironOre') >= 1) {
          if (levelForXp(currentCharacter.skills.smithing.xp) < 15) {
            window.addGameMessage?.('You need a Smithing level of 15 to smelt iron.');
            this.cancelNodeAction();
            return;
          }
          removeItem(currentCharacter, 'ironOre', 1);
          if (Math.random() < 0.5) {
            window.addGameMessage?.('The iron ore is too impure and the bar fails to form.');
          } else {
            addItem(currentCharacter, 'ironBar', 1);
            const ironResult = addXp(currentCharacter, 'smithing', 12.5);
            this.afterActionXp('smithing', ironResult);
          }
          this.scheduleNextAction();
          return;
        }
        if (!hasBronzeOres) {
          this.cancelNodeAction();
          return;
        }
        removeItem(currentCharacter, 'copperOre', 1);
        removeItem(currentCharacter, 'tinOre', 1);
        addItem(currentCharacter, 'bronzeBar', 1);
        const result = addXp(currentCharacter, 'smithing', 6.2);
        this.afterActionXp('smithing', result);
        this.scheduleNextAction();
        return;
      }

      if (node.type === 'range') {
        const rawFoodId = ['rawShrimp', 'rawTrout', 'rawChicken', 'rawBeef', 'rawBass']
          .find((itemId) => countItem(currentCharacter, itemId) > 0);
        if (!rawFoodId) {
          this.cancelNodeAction();
          return;
        }
        const cookingLevel = levelForXp(currentCharacter.skills.cooking.xp);
        const burnChance = Math.max(0.02, 0.25 - (cookingLevel - 1) * 0.01);
        removeItem(currentCharacter, rawFoodId, 1);
        if (Math.random() < burnChance) {
          addItem(currentCharacter, 'burntFish', 1);
          window.addGameMessage?.('You burn the fish.');
        } else {
          const cookedId = {
            rawShrimp: 'cookedShrimp',
            rawTrout: 'cookedTrout',
            rawChicken: 'cookedChicken',
            rawBeef: 'cookedBeef',
            rawBass: 'cookedBass',
          }[rawFoodId];
          addItem(currentCharacter, cookedId, 1);
          const baseXp = {
            rawShrimp: 30,
            rawTrout: 70,
            rawChicken: 30,
            rawBeef: 33,
            rawBass: 80,
          }[rawFoodId];
          const result = addXp(currentCharacter, 'cooking', baseXp);
          this.afterActionXp('cooking', result);
        }
        this.scheduleNextAction();
        return;
      }

      if (canAddItem(currentCharacter, node.itemId, 1) < 1) {
        window.addGameMessage?.('Your inventory is too full.');
        this.cancelNodeAction();
        return;
      }

      const skillLevel = levelForXp(currentCharacter.skills[node.skill].xp);
      const chance = Math.min(0.98, 0.80 + Math.max(0, skillLevel - (node.level || 1)) * 0.01);
      if (Math.random() >= chance) {
        this.scheduleNextAction();
        return;
      }

      if (addItem(currentCharacter, node.itemId, 1) > 0) {
        this.cancelNodeAction();
        return;
      }
      const baseXp = node.xp ?? (node.type === 'ore'
        ? 17.5
        : node.type === 'oak' ? 37.5
          : node.type === 'tree' ? 25
            : node.itemId === 'rawShrimp' ? 10 : 50);
      const result = addXp(currentCharacter, node.skill, baseXp);
      this.afterActionXp(node.skill, result);

      if (node.type !== 'fishing') {
        node.remaining -= 1;
        if (node.remaining === 0) this.depleteNode(node);
      }
      this.scheduleNextAction();
    }

    afterActionXp(skill, result) {
      refreshSkillsHud(currentCharacter);
      showXpDrop(result.gained, skill);
      if (result.leveledUp) {
        const skillName = formatSkill(skill);
        this.showLevelUpBanner(skillName, result.newLevel);
        window.addGameMessage?.(`You've advanced a ${skillName} level! You are now level ${result.newLevel}.`);
      }
    }

    scheduleNextAction() {
      if (!this.currentAction || !this.actionStarted) return;
      const node = this.currentAction;
      if (
        node.remaining <= 0
        || !this.isAdjacentTo(node)
        || (node.type === 'furnace'
          && !((countItem(currentCharacter, 'copperOre') >= 1 && countItem(currentCharacter, 'tinOre') >= 1)
            || countItem(currentCharacter, 'ironOre') >= 1))
        || (node.type === 'range'
          && !['rawShrimp', 'rawTrout', 'rawChicken', 'rawBeef', 'rawBass']
            .some((itemId) => countItem(currentCharacter, itemId) > 0))
        || (node.type === 'altar' && countItem(currentCharacter, 'bones') < 1)
      ) {
        this.cancelNodeAction();
        return;
      }
      const delay = node.type === 'altar' ? 1200 : 1800;
      this.actionTimer = this.time.delayedCall(delay, () => {
        this.actionTimer = null;
        this.performNodeAction();
      });
    }

    depleteNode(node) {
      node.marker.setFillStyle(0x777777);
      node.marker.setAlpha(0.6);
      node.marker.disableInteractive();
      if (node.type === 'tree' || node.type === 'oak') {
        node.marker.setFillStyle(0x765333);
        node.labelText.setText('Stump');
      }
      if (this.currentAction === node) this.cancelNodeAction();
      const respawnDelay = node.type === 'ore' ? 4000 : 12000;
      this.time.delayedCall(respawnDelay, () => {
        node.remaining = node.maxYield;
        node.marker.setFillStyle(node.type === 'oak' ? 0x8a6a3d : 0x4b8c48);
        if (node.type === 'ore') {
          node.marker.setFillStyle(node.itemId === 'runeEssence' ? 0x9fd8e8 : node.itemId === 'copperOre' ? 0xb76b43 : 0x9aa5aa);
        }
        if (node.type === 'fishing') node.marker.setFillStyle(0x4b9fc0);
        node.marker.setAlpha(1);
        node.labelText.setText(node.label);
        node.marker.setInteractive(
          new Phaser.Geom.Rectangle(-16, -16, 32, 32),
          Phaser.Geom.Rectangle.Contains,
        );
      });
    }

    addBuilding(tileX, tileY, width, height, label, color) {
      const x = tileX * TILE_SIZE;
      const y = tileY * TILE_SIZE;
      const pixelWidth = width * TILE_SIZE;
      const pixelHeight = height * TILE_SIZE;
      this.add.rectangle(x + pixelWidth / 2, y + pixelHeight / 2, pixelWidth, pixelHeight, color)
        .setStrokeStyle(3, 0x503927);
      this.add.rectangle(x + pixelWidth / 2, y + 8, pixelWidth - 12, 10, 0xc49a5f);
      this.add.text(x + pixelWidth / 2, y + pixelHeight / 2 + 2, label, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#fff0ce',
        stroke: '#503927',
        strokeThickness: 3,
      }).setOrigin(0.5);
      for (let row = 0; row < height; row += 1) {
        for (let column = 0; column < width; column += 1) {
          this.blocked[tileY + row][tileX + column] = true;
        }
      }
    }

    enterWorld(character) {
      if (this.player) return;
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0x27313e, 0.35);
      graphics.fillEllipse(16, 28, 22, 7);
      graphics.fillStyle(0xd9a879, 1);
      graphics.fillCircle(16, 8, 6);
      graphics.fillStyle(0x3d67a6, 1);
      graphics.fillRoundedRect(8, 13, 16, 13, 4);
      graphics.fillStyle(0xead9b6, 1);
      graphics.fillRect(9, 24, 6, 7);
      graphics.fillRect(17, 24, 6, 7);
      graphics.generateTexture('player', 32, 32);
      graphics.destroy();

      const savedTile = character.worldTile;
      const spawnTile = savedTile
        && Number.isInteger(savedTile.x) && Number.isInteger(savedTile.y)
        && savedTile.x >= 0 && savedTile.y >= 0
        && savedTile.x < WORLD_COLUMNS && savedTile.y < WORLD_ROWS
        && !this.blocked[savedTile.y][savedTile.x]
        ? { x: savedTile.x, y: savedTile.y }
        : { x: 20, y: 16 };
      this.player = this.add.image(spawnTile.x * TILE_SIZE + 16, spawnTile.y * TILE_SIZE + 16, 'player');
      this.player.setTint(RACES[character.raceId].tint);
      this.player.setDepth(10);
      this.characterLabel = this.add.text(
        this.player.x,
        this.player.y - 34,
        `${character.name}\n${RACES[character.raceId].name} · ${CLASSES[character.classId].name}`,
        {
          fontFamily: 'sans-serif',
          fontSize: '12px',
          color: '#fff1d1',
          align: 'center',
          lineSpacing: 2,
          stroke: '#30291f',
          strokeThickness: 4,
        },
      ).setOrigin(0.5).setDepth(11);
      this.currentTile = spawnTile;
      character.worldTile = { ...spawnTile };
      this.path = [];
      this.moving = false;
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
      currentCharacter = character;
      this.character = character;
      saveCharacter(character);
      createSkillsHud(character);
      createInventoryHud(character);
      window.createEquipmentPanel?.(character);
      window.createQuestJournal?.(character);
      window.refreshCombatHud?.(character);
    }

    createControls() {
      this.input.on('pointermove', () => {
        this.pointerOverGame = true;
      });
      this.input.on('pointerdown', (pointer) => {
        if (!this.player || window.isPlayerStunned?.(this)) return;
        const tile = this.getTileUnderPointer(pointer);
        if (!tile) return;
        const interactable = this.tileInteractables.get(this.tileKey(tile));
        if (interactable) {
          this.startNodeAction(interactable);
          return;
        }
        if (this.blocked[tile.y][tile.x]) {
          this.cancelNodeAction();
          this.path = [];
          return;
        }
        this.cancelNodeAction();
        this.path = this.findPath(this.currentTile, tile);
      });

      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys('W,A,S,D');
      // Do not capture these keys at the browser level: capturing calls
      // preventDefault on keydown, which stops W/A/S/D (and the arrows)
      // from ever reaching text inputs such as the character-name box.
      // Movement is polled through isDown, which keeps working uncaptured.
      this.input.keyboard.removeCapture('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE');
      [...Object.values(this.cursors), ...Object.values(this.wasd)].forEach((key) => {
        key.preventDefault = false;
      });
      this.input.keyboard.on('keydown', (event) => {
        if (
          event.repeat || document.querySelector('.creation-screen')
          || window.isPlayerStunned?.(this)
        ) return;
        if (event.key.toLowerCase() === 'e' || event.code === 'Space') {
          this.interactNearby();
          return;
        }
      });
    }

    interactNearby() {
      if (!this.player || !currentCharacter || window.isPlayerStunned?.(this)) return;
      const candidates = this.nodes
        .filter((node) => node.remaining > 0)
        .map((node) => ({
          node,
          distance: Math.abs(this.currentTile.x - node.tile.x) + Math.abs(this.currentTile.y - node.tile.y),
        }))
        .filter(({ node, distance }) => distance <= Math.max(2, node.range ?? 1))
        .sort((first, second) => first.distance - second.distance);
      if (candidates.length === 0) {
        window.addGameMessage?.('Nothing to interact with nearby.');
        return;
      }
      this.startNodeAction(candidates[0].node);
    }

    findPath(start, goal) {
      if (
        goal.x < 0 || goal.y < 0 || goal.x >= WORLD_COLUMNS || goal.y >= WORLD_ROWS
        || this.blocked[goal.y][goal.x]
      ) return [];

      const key = ({ x, y }) => `${x},${y}`;
      const startKey = key(start);
      const queue = [start];
      const previous = new Map([[startKey, null]]);
      const directions = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];

      for (let index = 0; index < queue.length; index += 1) {
        const current = queue[index];
        if (current.x === goal.x && current.y === goal.y) break;
        for (const direction of directions) {
          const next = { x: current.x + direction.x, y: current.y + direction.y };
          if (
            next.x < 0 || next.y < 0 || next.x >= WORLD_COLUMNS || next.y >= WORLD_ROWS
            || this.blocked[next.y][next.x]
            || window.isCombatTileOccupied?.(this, next.x, next.y)
          ) continue;
          const nextKey = key(next);
          if (previous.has(nextKey)) continue;
          previous.set(nextKey, key(current));
          queue.push(next);
        }
      }

      const goalKey = key(goal);
      if (!previous.has(goalKey)) return [];
      const result = [];
      let currentKey = goalKey;
      while (currentKey !== startKey) {
        const [x, y] = currentKey.split(',').map(Number);
        result.push({ x, y });
        currentKey = previous.get(currentKey);
      }
      return result.reverse();
    }

    update() {
      this.updateInteractHover();
      if (!this.player) return;
      window.updateTownDistance?.(this.currentTile);
      if (window.isPlayerStunned?.(this)) return;
      window.updateCombat?.(this);
      this.characterLabel.setPosition(this.player.x, this.player.y - 34);
      if (!this.moving && this.path.length === 0) {
        const direction = this.keyboardDirection();
        if (direction) {
          if (this.currentAction) this.cancelNodeAction();
          const next = { x: this.currentTile.x + direction.x, y: this.currentTile.y + direction.y };
          if (
            next.x >= 0 && next.y >= 0 && next.x < WORLD_COLUMNS && next.y < WORLD_ROWS
            && !this.blocked[next.y][next.x]
            && !window.isCombatTileOccupied?.(this, next.x, next.y)
          ) this.path = [next];
        }
      }

      if (this.moving) return;
      if (this.path.length === 0) {
        if (this.currentAction && !this.actionStarted) this.beginCurrentAction();
        return;
      }
      const next = this.path.shift();
      this.currentTile = next;
      this.character.worldTile = { ...next };
      saveCharacter(this.character);
      this.moving = true;
      this.tweens.add({
        targets: this.player,
        x: next.x * TILE_SIZE + 16,
        y: next.y * TILE_SIZE + 16,
        duration: 145,
        onComplete: () => {
          this.moving = false;
        },
      });
    }

    keyboardDirection() {
      if (this.cursors.left.isDown || this.wasd.A.isDown) return { x: -1, y: 0 };
      if (this.cursors.right.isDown || this.wasd.D.isDown) return { x: 1, y: 0 };
      if (this.cursors.up.isDown || this.wasd.W.isDown) return { x: 0, y: -1 };
      if (this.cursors.down.isDown || this.wasd.S.isDown) return { x: 0, y: 1 };
      return null;
    }
  }

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    backgroundColor: '#263b32',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      parent: 'game',
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600,
    },
    scene: GameScene,
  });

  function openSmithingPanel(character, anvil) {
    window.closeTownInterface?.();
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
    panel.className = 'town-panel smithing-panel';
    panel.setAttribute('aria-label', 'Smithing');
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
      title.textContent = 'Smithy';
      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'town-close';
      closeButton.textContent = 'Close';
      closeButton.addEventListener('click', close);
      header.append(title, closeButton);
      panel.append(header);

      const recipes = Object.entries(SMITHING_RECIPES);
      recipes.forEach(([itemId, recipe]) => {
        const item = ITEMS[itemId];
        const smithingLevel = levelForXp(character.skills.smithing.xp);
        const barId = recipe.barId || 'bronzeBar';
        const barName = ITEMS[barId].name.toLowerCase();
        const missingBars = countItem(character, barId) < recipe.bars;
        const levelTooLow = smithingLevel < recipe.level;
        const disabledReason = levelTooLow
          ? `Requires Smithing ${recipe.level}`
          : missingBars ? `Need ${recipe.bars} ${barName}${recipe.bars === 1 ? '' : 's'}` : '';
        const row = document.createElement('div');
        row.className = 'town-row';
        const description = document.createElement('span');
        const yieldLabel = recipe.yields ? ` ×${recipe.yields}` : '';
        description.textContent = `${item.name}${yieldLabel} — ${recipe.bars} ${barName}${recipe.bars === 1 ? '' : 's'}, Smithing ${recipe.level}`;
        row.append(description);
        const actions = document.createElement('div');
        actions.className = 'smithing-actions';
        ['Make 1', 'All'].forEach((label, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'smithing-action';
          button.textContent = label;
          button.disabled = Boolean(disabledReason);
          if (disabledReason) button.title = disabledReason;
          button.addEventListener('click', () => smithItem(itemId, recipe, index === 1));
          actions.append(button);
        });
        row.append(actions);
        panel.append(row);
      });
    }

    function smithItem(itemId, recipe, all) {
      const smithingLevel = levelForXp(character.skills.smithing.xp);
      if (smithingLevel < recipe.level) {
        window.addGameMessage?.(`You need a Smithing level of ${recipe.level} to make that.`);
        return;
      }
      const barId = recipe.barId || 'bronzeBar';
      let made = 0;
      while (countItem(character, barId) >= recipe.bars) {
        const yieldQty = recipe.yields ?? 1;
        // Consume the bars first: the slots they free count toward the
        // finished item, so a full backpack can't block a craft that
        // removes more than it adds. Refunded if it still can't fit.
        removeItem(character, barId, recipe.bars);
        if (canAddItem(character, itemId, yieldQty) < yieldQty) {
          addItem(character, barId, recipe.bars);
          if (made === 0) window.addGameMessage?.('Your inventory is too full.');
          break;
        }
        if (addItem(character, itemId, yieldQty) > 0) {
          throw new Error(`Could not add crafted item ${itemId} after checking backpack capacity.`);
        }
        const result = addXp(character, 'smithing', recipe.xpPerBar * recipe.bars);
        made += 1;
        refreshSkillsHud(character);
        showXpDrop(result.gained, 'smithing');
        if (result.leveledUp) {
          const skillName = formatSkill('smithing');
          activeScene?.showLevelUpBanner(skillName, result.newLevel);
          window.addGameMessage?.(`You've advanced a ${skillName} level! You are now level ${result.newLevel}.`);
        }
        if (!all) break;
      }
      if (made === 0 && countItem(character, barId) < recipe.bars) {
        window.addGameMessage?.(`You need ${recipe.bars} ${ITEMS[barId].name.toLowerCase()}${recipe.bars === 1 ? '' : 's'} to make that.`);
      }
      render();
    }

    render();
  }

  function createSkillsHud(character) {
    document.querySelector('.skills-hud')?.remove();
    const panel = document.createElement('aside');
    panel.className = 'skills-hud';
    panel.setAttribute('aria-label', 'Skills');

    const header = document.createElement('div');
    header.className = 'skills-hud-header';
    header.textContent = 'Skills';
    panel.append(header);

    const grid = document.createElement('div');
    grid.className = 'skills-grid';
    CHARACTER_SKILLS.forEach((skill) => {
      const cell = document.createElement('div');
      cell.className = 'skill-cell';
      cell.dataset.skill = skill;
      const name = document.createElement('span');
      name.className = 'skill-name';
      name.textContent = formatSkill(skill);
      const level = document.createElement('span');
      level.className = 'skill-level';
      const xp = document.createElement('span');
      xp.className = 'skill-xp';
      cell.append(name, level, xp);
      grid.append(cell);
    });
    panel.append(grid);

    const total = document.createElement('div');
    total.className = 'skills-total';
    total.innerHTML = '<span>Total level</span><span class="total-level"></span>';
    panel.append(total);
    document.querySelector('#skills-panel').append(panel);
    refreshSkillsHud(character);
  }

  function createInventoryHud(character) {
    document.querySelector('.inventory-hud')?.remove();
    const panel = document.createElement('aside');
    panel.className = 'inventory-hud';
    panel.setAttribute('aria-label', 'Inventory');
    const heading = document.createElement('div');
    heading.textContent = 'Inventory';
    panel.append(heading);

    const grid = document.createElement('div');
    grid.className = 'inventory-grid';
    for (let index = 0; index < INVENTORY_SLOT_COUNT; index += 1) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.dataset.slot = String(index);
      grid.append(slot);
    }
    panel.append(grid);
    document.querySelector('#inventory-panel').append(panel);
    refreshInventoryHud(character);
  }

  function refreshInventoryHud(character) {
    const panel = document.querySelector('.inventory-hud');
    if (!panel) return;
    character.inventory = normalizeInventory(character.inventory);
    panel.querySelectorAll('.inventory-slot').forEach((element, index) => {
      element.onclick = (event) => {
        if (window.isPlayerStunned?.(window.activePrayerScene?.())) return;
        if (document.querySelector('.town-panel')) {
          window.eatFoodFromSlot?.(character, index);
          return;
        }
        if (window.equipFromInventory?.(character, index)) return;
        if (window.handleBackpackItemClick?.(character, index)) return;
        if (character.inventory[index]?.itemId === 'bones') {
          window.buryBones?.(character, index, event.shiftKey);
          return;
        }
        window.eatFoodFromSlot?.(character, index);
      };
      element.oncontextmenu = (event) => {
        event.preventDefault();
        if (document.querySelector('.town-panel')) return;
        dropBackpackItem(character, index);
      };
      const slot = character.inventory[index];
      element.replaceChildren();
      element.title = slot ? '' : 'Empty slot';
      element.classList.toggle('filled', Boolean(slot));
      if (!slot) {
        element.style.backgroundColor = '';
        return;
      }
      const item = ITEMS[slot.itemId];
      element.style.backgroundColor = '#313941';
      const icon = window.createItemIconElement?.(slot.itemId, 'item-icon');
      if (icon) element.append(icon);
      else element.append(document.createTextNode(item.code));
      if (slot.qty > 1) {
        const quantity = document.createElement('span');
        quantity.className = 'inventory-qty';
        quantity.textContent = slot.qty.toLocaleString();
        element.append(quantity);
      }
      const tooltipContext = window.inventoryTooltipContext?.(slot.itemId) || '';
      window.attachItemTooltip?.(element, slot.itemId, tooltipContext, slot.qty);
    });
  }

  window.updateGroundItemPresentation = (scene, node, drop) => {
    const item = ITEMS[drop.itemId];
    if (!item) throw new Error(`Unknown ground item: ${drop.itemId}`);
    node.displayName = item.name;
    node.marker?.destroy();
    node.labelText?.destroy();
    const x = node.tile.x * TILE_SIZE + TILE_SIZE / 2;
    const y = node.tile.y * TILE_SIZE + TILE_SIZE / 2;
    const imageUrl = window.makeIcon?.(drop.itemId, scene);
    if (imageUrl) {
      node.marker = scene.add.image(x, y, `dreamgame-item-${drop.itemId}`)
        .setDisplaySize(TILE_SIZE, TILE_SIZE)
        .setDepth(5);
      node.labelText = null;
      return;
    }
    node.marker = scene.add.rectangle(x, y, 22, 22, item.color)
      .setStrokeStyle(2, 0xe6d1a2)
      .setDepth(5);
    node.labelText = scene.add.text(x, y, item.code, {
      fontFamily: 'sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#fff4dc',
      stroke: '#29251f',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(6);
  };

  function dropBackpackItem(character, index) {
    const scene = activeScene;
    if (!scene || !character.inventory[index]) return;
    const origin = scene.currentTile || character.worldTile;
    if (!origin) return;
    const removed = removeInventorySlot(character, index);
    if (!removed) return;
    const offsets = [
      [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1],
    ];
    const spot = offsets
      .map(([dx, dy]) => ({ x: origin.x + dx, y: origin.y + dy }))
      .find((tile) => (
        tile.x >= 0 && tile.y >= 0
        && tile.x < scene.grid[0].length && tile.y < scene.grid.length
        && !scene.blocked[tile.y][tile.x]
        && !scene.tileInteractables.has(scene.tileKey(tile))
      ));
    if (!spot) {
      addItem(character, removed.itemId, removed.qty);
      window.addGameMessage?.('There is no room to drop that here.');
      return;
    }
    const node = {
      id: `drop-${Date.now()}`,
      type: 'groundItem',
      groundItems: [{ itemId: removed.itemId, qty: removed.qty }],
      x: spot.x,
      y: spot.y,
      tile: { ...spot },
      region: 'ground',
      maxYield: Infinity,
      remaining: 1,
      verb: 'Take',
      displayName: ITEMS[removed.itemId].name,
    };
    window.updateGroundItemPresentation?.(scene, node, node.groundItems[0]);
    scene.nodes.push(node);
    scene.tileInteractables.set(scene.tileKey(node.tile), node);
    window.addGameMessage?.(`You drop the ${ITEMS[removed.itemId].name.toLowerCase()}.`);
  }

  window.refreshInventoryHud = refreshInventoryHud;
  window.dropBackpackItem = dropBackpackItem;
  window.addGameMessage = addMessage;
  window.activePrayerScene = () => activeScene;
  window.handleCombatXp = (skill, result, scene) => {
    refreshSkillsHud(currentCharacter);
    window.refreshCombatHud?.(currentCharacter);
    showXpDrop(result.gained, skill);
    if (result.leveledUp) {
      const skillName = formatSkill(skill);
      scene.showLevelUpBanner(skillName, result.newLevel);
      addMessage(`You've advanced a ${skillName} level! You are now level ${result.newLevel}.`);
    }
  };
  window.handlePrayerXp = (result) => {
    refreshSkillsHud(currentCharacter);
    showXpDrop(result.gained, 'prayer');
    if (result.leveledUp) {
      const skillName = formatSkill('prayer');
      activeScene?.showLevelUpBanner(skillName, result.newLevel);
      addMessage(`You've advanced a ${skillName} level! You are now level ${result.newLevel}.`);
    }
  };

  function refreshSkillsHud(character) {
    const panel = document.querySelector('.skills-hud');
    if (!panel) return;
    let totalLevel = 0;
    CHARACTER_SKILLS.forEach((skill) => {
      const xp = character.skills[skill].xp;
      const level = levelForXp(xp);
      totalLevel += level;
      const cell = panel.querySelector(`[data-skill="${skill}"]`);
      cell.querySelector('.skill-level').textContent = level;
      cell.querySelector('.skill-xp').textContent = `${xp.toLocaleString()} XP`;
    });
    panel.querySelector('.total-level').textContent = totalLevel.toLocaleString();
  }

  function showXpDrop(gained, skill) {
    const panel = document.querySelector('.skills-hud');
    if (!panel) return;
    const drop = document.createElement('span');
    drop.className = 'skills-xp-drop';
    drop.textContent = `+${gained} ${formatSkill(skill)}`;
    drop.addEventListener('animationend', () => drop.remove(), { once: true });
    panel.append(drop);
  }

  function addMessage(message, style = false) {
    messageLog.push({ text: message, style });
    if (messageLog.length > 5) messageLog.shift();
    const log = document.querySelector('#message-log');
    if (!log) throw new Error('Message log container is missing.');
    log.replaceChildren(...messageLog.map((entry) => {
      const line = document.createElement('p');
      line.textContent = entry.text;
      if (entry.style === 'gold') line.style.color = '#f0d286';
      else if (entry.style) line.style.color = '#ff6b67';
      return line;
    }));
    log.scrollTop = log.scrollHeight;
  }

  function formatSkill(skill) {
    return `${skill[0].toUpperCase()}${skill.slice(1)}`;
  }

  function formatXpEdges(edges) {
    const entries = Object.entries(edges);
    return entries.length
      ? entries.map(([skill, multiplier]) => `${formatSkill(skill)} +${Math.round((multiplier - 1) * 100)}% XP`).join(', ')
      : 'No XP edges';
  }

  function formatRaceQol(qol) {
    const descriptions = {
      oreStacking: (amount) => `Stack up to ${amount} ore`,
      sureShortcuts: () => 'Always succeeds at shortcuts',
      freeBoats: () => 'Can use boats for free',
      foodHealBonus: (amount) => `Food heals ${Math.round((amount - 1) * 100)}% more`,
      shopDiscount: (amount) => `${Math.round((1 - amount) * 100)}% shop discount`,
      questXpBonus: (amount) => `${Math.round((amount - 1) * 100)}% more quest XP`,
    };
    return Object.entries(qol).map(([perk, value]) => descriptions[perk](value));
  }

  function formatClassPerks(characterClass) {
    const descriptions = {
      arrowSaver: 'Sometimes saves arrows',
      slowPrayerDrain: 'Prayer drains more slowly',
      lowProfile: 'Keeps a low profile',
      runeSaver: 'Sometimes saves runes',
    };
    const perks = Object.entries(characterClass.perks)
      .filter(([, enabled]) => enabled)
      .map(([perk]) => descriptions[perk]);
    if (characterClass.gatheringXpBonus) {
      const percent = Math.round((characterClass.gatheringXpBonus - 1) * 100);
      perks.push(`Mining, woodcutting, and fishing +${percent}% XP`);
    }
    return perks.length ? perks : ['No extra perks'];
  }

  function addChoiceCard(container, name, details, onSelect) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'choice-card';
    card.setAttribute('aria-pressed', 'false');
    const title = document.createElement('strong');
    title.textContent = name;
    card.append(title);
    details.forEach((detail) => {
      const line = document.createElement('span');
      line.textContent = detail;
      card.append(line);
    });
    card.addEventListener('click', () => onSelect(card));
    container.append(card);
  }

  function showCreationScreen(slotIndex = 0, allowBack = false) {
    const overlay = document.createElement('section');
    overlay.className = 'creation-screen';
    overlay.setAttribute('aria-label', 'Character creation');

    const panel = document.createElement('div');
    panel.className = 'creation-panel';
    const heading = document.createElement('h1');
    heading.textContent = 'Create Your Character';
    panel.append(heading);

    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'character-name';
    nameLabel.textContent = 'Character name';
    const nameInput = document.createElement('input');
    nameInput.id = 'character-name';
    nameInput.maxLength = 24;
    nameInput.autocomplete = 'off';
    nameInput.placeholder = 'Enter a name';
    panel.append(nameLabel, nameInput);

    const raceHeading = document.createElement('h2');
    raceHeading.textContent = 'Choose a race';
    const raceGrid = document.createElement('div');
    raceGrid.className = 'choice-grid';
    panel.append(raceHeading, raceGrid);

    const classHeading = document.createElement('h2');
    classHeading.textContent = 'Choose a class';
    const classGrid = document.createElement('div');
    classGrid.className = 'choice-grid';
    panel.append(classHeading, classGrid);

    const error = document.createElement('p');
    error.className = 'creation-error';
    error.setAttribute('role', 'alert');
    const begin = document.createElement('button');
    begin.type = 'button';
    begin.className = 'begin-button';
    begin.textContent = 'Begin';
    begin.disabled = true;
    panel.append(error, begin);
    if (allowBack) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'begin-button';
      back.textContent = 'Back to Characters';
      back.addEventListener('click', () => {
        overlay.remove();
        showCharacterSelectScreen();
      });
      panel.append(back);
    }
    overlay.append(panel);
    document.querySelector('#game').append(overlay);

    const selection = { race: null, characterClass: null };
    const updateBegin = () => {
      begin.disabled = !nameInput.value.trim() || !selection.race || !selection.characterClass;
    };
    const selectCard = (grid, group, id, card) => {
      grid.querySelectorAll('.choice-card').forEach((choice) => {
        choice.setAttribute('aria-pressed', String(choice === card));
      });
      selection[group] = id;
      updateBegin();
    };

    Object.entries(RACES).forEach(([id, race]) => {
      const details = [
        `XP edge: ${formatXpEdges(race.xpEdges)}`,
        `Starting skill: ${race.startSkill ? `${formatSkill(race.startSkill)} at level 10` : 'None'}`,
        `Home turf: ${race.homeRegion ? race.homeRegion.replace('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'None'}`,
        `Perk: ${formatRaceQol(race.qol).join('; ')}`,
      ];
      addChoiceCard(raceGrid, race.name, details, (card) => {
        selectCard(raceGrid, 'race', id, card);
      });
    });

    Object.entries(CLASSES).forEach(([id, characterClass]) => {
      const details = [
        `XP edge: ${formatXpEdges(characterClass.xpEdges)}`,
        `Starting skill: ${characterClass.startSkill ? `${formatSkill(characterClass.startSkill)} at level 10` : 'None'}`,
        `Perk: ${formatClassPerks(characterClass).join('; ')}`,
      ];
      addChoiceCard(classGrid, characterClass.name, details, (card) => {
        selectCard(classGrid, 'characterClass', id, card);
      });
    });

    nameInput.addEventListener('input', updateBegin);
    begin.addEventListener('click', () => {
      error.textContent = '';
      try {
        currentCharacter = createCharacter(nameInput.value, selection.race, selection.characterClass);
        currentCharacter.bank = window.getSharedBank();
        window.setActiveSlot(slotIndex);
        saveCharacter(currentCharacter);
        overlay.remove();
        if (activeScene) activeScene.enterWorld(currentCharacter);
        addCharacterSelectButton();
      } catch (cause) {
        error.textContent = cause instanceof Error ? cause.message : 'Could not save the character.';
      }
    });
  }

  function addCharacterSelectButton() {
    document.querySelector('.new-character-button')?.remove();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'new-character-button';
    button.textContent = 'Characters';
    button.addEventListener('click', () => {
      try {
        if (currentCharacter) saveCharacter(currentCharacter);
        window.clearActiveSlot();
        window.location.reload();
      } catch (cause) {
        window.alert(cause instanceof Error ? cause.message : 'Could not switch characters.');
      }
    });
    document.querySelector('#sidebar-footer').append(button);
  }

  function showCharacterSelectScreen() {
    const overlay = document.createElement('section');
    overlay.className = 'creation-screen';
    overlay.setAttribute('aria-label', 'Character select');

    const panel = document.createElement('div');
    panel.className = 'creation-panel';
    const heading = document.createElement('h1');
    heading.textContent = 'Choose Your Character';
    const note = document.createElement('p');
    note.className = 'town-note';
    note.textContent = 'All three characters share one bank.';
    const grid = document.createElement('div');
    grid.className = 'choice-grid';
    panel.append(heading, note, grid);
    overlay.append(panel);
    document.querySelector('#game').append(overlay);

    window.getCharacterSlots().forEach((slot, index) => {
      const card = document.createElement('div');
      card.className = 'choice-card slot-card';
      if (!slot) {
        const title = document.createElement('strong');
        title.textContent = `Slot ${index + 1} - Empty`;
        const create = document.createElement('button');
        create.type = 'button';
        create.className = 'begin-button';
        create.textContent = 'Create character';
        create.addEventListener('click', () => {
          overlay.remove();
          showCreationScreen(index, true);
        });
        card.append(title, create);
      } else {
        const title = document.createElement('strong');
        title.textContent = slot.name;
        const detail = document.createElement('span');
        detail.textContent = `${RACES[slot.raceId]?.name || slot.raceId} - ${CLASSES[slot.classId]?.name || slot.classId}`;
        const level = document.createElement('span');
        level.textContent = `Total level ${slot.totalLevel}`;
        const play = document.createElement('button');
        play.type = 'button';
        play.className = 'begin-button';
        play.textContent = 'Play';
        play.addEventListener('click', () => {
          window.setActiveSlot(index);
          window.location.reload();
        });
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'slot-delete';
        del.textContent = 'Delete';
        del.addEventListener('click', () => {
          if (window.confirm(`Delete ${slot.name}? This cannot be undone. The shared bank is kept.`)) {
            window.deleteCharacterSlot(index);
            overlay.remove();
            showCharacterSelectScreen();
          }
        });
        card.append(title, detail, level, play, del);
      }
      grid.append(card);
    });
  }

  document.querySelectorAll('.sidebar-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const selected = tab.id.replace('-tab', '');
      ['skills', 'inventory', 'quests', 'equipment', 'spellbook'].forEach((panelName) => {
        document.querySelector(`#${panelName}-panel`).hidden = panelName !== selected;
        document.querySelector(`#${panelName}-tab`).setAttribute('aria-selected', String(panelName === selected));
      });
      window.refreshQuestJournal?.(currentCharacter);
      window.refreshEquipmentHud?.(currentCharacter);
      window.refreshSpellbookHud?.(currentCharacter);
    });
  });

  if (currentCharacter) addCharacterSelectButton();
  else if (window.getCharacterSlots().some(Boolean)) showCharacterSelectScreen();
  else showCreationScreen(0, false);
})();
