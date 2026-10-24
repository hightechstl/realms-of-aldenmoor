(() => {
  function buryBones(character, _slotIndex, buryAll) {
    if (document.querySelector('.town-panel')) return false;
    const total = countItem(character, 'bones');
    const amount = buryAll ? total : Math.min(total, 1);
    if (amount < 1) return false;
    if (!removeItem(character, 'bones', amount)) {
      throw new Error('Bones could not be removed before burial.');
    }

    for (let index = 0; index < amount; index += 1) {
      window.handlePrayerXp?.(addXp(character, 'prayer', 4.5));
    }
    window.addGameMessage?.(buryAll ? `You bury ${amount} bones.` : 'You bury the bones.');
    return true;
  }

  function startPrayerOffering(scene, node, character) {
    if (countItem(character, 'bones') < 1) {
      window.addGameMessage?.('You pray at the altar. Offer bones here for bonus Prayer XP.');
      scene.cancelNodeAction();
      return;
    }
    scene.prayerOfferingActive = true;
    scene.prayerOfferingCount = 0;
    scene.prayerConsumingBone = false;
    scene.actionStarted = true;
    if (!scene.actionMessageLogged) {
      window.addGameMessage?.('You begin offering bones at the altar.');
      scene.actionMessageLogged = true;
    }
    performPrayerOffering(scene, node, character);
  }

  function performPrayerOffering(scene, node = scene.currentAction, character = scene.character) {
    if (!scene.prayerOfferingActive || scene.currentAction !== node) return;
    if (!scene.isAdjacentTo(node) || countItem(character, 'bones') < 1) {
      scene.cancelNodeAction();
      return;
    }

    scene.prayerConsumingBone = true;
    let removed;
    try {
      removed = removeItem(character, 'bones', 1);
    } finally {
      scene.prayerConsumingBone = false;
    }
    if (!removed) {
      scene.cancelNodeAction();
      return;
    }

    const result = addXp(character, 'prayer', 4.5 * 1.5);
    scene.prayerOfferingCount += 1;
    window.handlePrayerXp?.(result);
    if (countItem(character, 'bones') < 1) {
      scene.cancelNodeAction();
      return;
    }
    scene.scheduleNextAction();
  }

  function finishPrayerOffering(scene) {
    if (!scene.prayerOfferingActive) return;
    const count = scene.prayerOfferingCount;
    scene.prayerOfferingActive = false;
    scene.prayerOfferingCount = 0;
    scene.prayerConsumingBone = false;
    if (count > 0) {
      window.addGameMessage?.(`You offer ${count} bone${count === 1 ? '' : 's'} at the altar.`);
    }
  }

  function onPrayerInventoryChanged(character) {
    const scene = window.activePrayerScene?.();
    if (
      scene?.prayerOfferingActive
      && scene.character === character
      && !scene.prayerConsumingBone
      && countItem(character, 'bones') < 1
    ) {
      scene.cancelNodeAction();
    }
  }

  window.buryBones = buryBones;
  window.startPrayerOffering = startPrayerOffering;
  window.performPrayerOffering = performPrayerOffering;
  window.finishPrayerOffering = finishPrayerOffering;
  window.onPrayerInventoryChanged = onPrayerInventoryChanged;
})();
