const GATHERING_SKILLS = new Set(['mining', 'woodcutting', 'fishing']);

function xpForLevel(level) {
  const targetLevel = Math.max(1, Math.min(99, Math.floor(level)));
  let points = 0;
  for (let currentLevel = 1; currentLevel < targetLevel; currentLevel += 1) {
    points += Math.floor(currentLevel + 300 * (2 ** (currentLevel / 7)));
  }
  return Math.floor(points / 4);
}

function levelForXp(xp) {
  const totalXp = Math.max(0, Number.isFinite(xp) ? xp : 0);
  let level = 1;
  while (level < 99 && xpForLevel(level + 1) <= totalXp) {
    level += 1;
  }
  return level;
}

function addXp(character, skill, baseAmount) {
  const skillData = character?.skills?.[skill];
  if (!skillData || !Number.isFinite(baseAmount) || baseAmount < 0) {
    throw new Error(`Cannot add XP to ${skill}.`);
  }

  const race = RACES[character.raceId];
  const characterClass = CLASSES[character.classId];
  if (!race || !characterClass) throw new Error('Character race or class is invalid.');

  const oldLevel = levelForXp(skillData.xp);
  let multiplier = race.xpEdges[skill] || 1;
  multiplier *= characterClass.xpEdges[skill] || 1;
  if (GATHERING_SKILLS.has(skill)) {
    multiplier *= characterClass.gatheringXpBonus || 1;
  }

  const gained = Math.max(1, Math.floor(baseAmount * multiplier));
  skillData.xp += gained;
  const newLevel = levelForXp(skillData.xp);
  saveCharacter(character);
  return { gained, newLevel, leveledUp: newLevel > oldLevel };
}
