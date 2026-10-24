// ---- Sound pass: every effect is synthesized with Web Audio ----
// No audio files. Each effect is a small oscillator/noise recipe
// played through one master gain. A Sound toggle in the sidebar
// footer mutes everything and persists in localStorage. Browsers
// only allow audio after a user gesture, so the context wakes on
// the first pointer or key press.
(() => {
  const MUTE_KEY = 'dreamgame.muted';
  let audioContext = null;
  let masterGain = null;
  let noiseBuffer = null;
  let muted = false;
  try {
    muted = localStorage.getItem(MUTE_KEY) === '1';
  } catch (cause) {
    muted = false;
  }

  function ensureContext() {
    if (audioContext) {
      if (audioContext.state === 'suspended') audioContext.resume();
      return audioContext;
    }
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioContext = new AudioCtor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = muted ? 0 : 0.5;
    masterGain.connect(audioContext.destination);
    return audioContext;
  }

  window.addEventListener('pointerdown', ensureContext);
  window.addEventListener('keydown', ensureContext);

  function tone({ freq = 440, end = null, type = 'sine', dur = 0.15, vol = 0.25, delay = 0 }) {
    if (!audioContext || !masterGain) return;
    const start = audioContext.currentTime + delay;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (end) osc.frequency.exponentialRampToValueAtTime(Math.max(1, end), start + dur);
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function noise({ dur = 0.2, vol = 0.25, freq = 1000, end = null, q = 1, type = 'bandpass', delay = 0 }) {
    if (!audioContext || !masterGain) return;
    if (!noiseBuffer) {
      noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    const start = audioContext.currentTime + delay;
    const source = audioContext.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    const filter = audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, start);
    if (end) filter.frequency.exponentialRampToValueAtTime(Math.max(10, end), start + dur);
    filter.Q.value = q;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start(start);
    source.stop(start + dur + 0.02);
  }

  const RECIPES = {
    click() { tone({ freq: 660, type: 'square', dur: 0.05, vol: 0.1 }); },
    swing() { noise({ dur: 0.12, vol: 0.16, freq: 900, end: 300 }); },
    shoot() {
      noise({ dur: 0.08, vol: 0.13, freq: 1800, end: 500 });
      tone({ freq: 300, end: 150, type: 'triangle', dur: 0.06, vol: 0.1 });
    },
    cast() {
      tone({ freq: 300, end: 900, dur: 0.25, vol: 0.16 });
      tone({ freq: 600, end: 1800, dur: 0.25, vol: 0.06 });
    },
    hit() {
      tone({ freq: 160, end: 60, type: 'square', dur: 0.12, vol: 0.28 });
      noise({ dur: 0.08, vol: 0.15, freq: 400, type: 'lowpass' });
    },
    hurt() { tone({ freq: 220, end: 110, type: 'sawtooth', dur: 0.15, vol: 0.2 }); },
    death() { tone({ freq: 300, end: 40, type: 'square', dur: 0.35, vol: 0.22 }); },
    bossdeath() {
      tone({ freq: 200, end: 30, type: 'square', dur: 0.6, vol: 0.3 });
      tone({ freq: 80, end: 30, dur: 0.7, vol: 0.35 });
      noise({ dur: 0.5, vol: 0.2, freq: 300, type: 'lowpass' });
    },
    playerdeath() {
      tone({ freq: 400, end: 55, dur: 0.8, vol: 0.25 });
      tone({ freq: 200, end: 40, dur: 0.8, vol: 0.15, delay: 0.1 });
    },
    coin() {
      tone({ freq: 1320, dur: 0.07, vol: 0.16 });
      tone({ freq: 1760, dur: 0.14, vol: 0.16, delay: 0.06 });
    },
    pickup() { tone({ freq: 500, end: 760, dur: 0.08, vol: 0.18 }); },
    drop() { tone({ freq: 300, end: 150, dur: 0.08, vol: 0.14 }); },
    chop() {
      noise({ dur: 0.07, vol: 0.3, freq: 800, type: 'lowpass' });
      tone({ freq: 180, end: 90, dur: 0.05, vol: 0.12 });
    },
    mine() {
      tone({ freq: 2400, type: 'square', dur: 0.05, vol: 0.1 });
      tone({ freq: 1750, type: 'square', dur: 0.06, vol: 0.08, delay: 0.05 });
    },
    splash() { noise({ dur: 0.3, vol: 0.16, freq: 600, end: 200, type: 'lowpass' }); },
    cook() { noise({ dur: 0.25, vol: 0.05, freq: 3200, type: 'highpass' }); },
    burn() { tone({ freq: 300, end: 80, type: 'sawtooth', dur: 0.28, vol: 0.12 }); },
    smith() { [620, 927, 1244].forEach((freq) => tone({ freq, type: 'square', dur: 0.18, vol: 0.07 })); },
    craft() {
      tone({ freq: 800, type: 'triangle', dur: 0.05, vol: 0.14 });
      tone({ freq: 1050, type: 'triangle', dur: 0.06, vol: 0.14, delay: 0.05 });
    },
    pray() {
      tone({ freq: 880, dur: 0.3, vol: 0.1 });
      tone({ freq: 1318, dur: 0.35, vol: 0.08, delay: 0.1 });
    },
    eat() {
      tone({ freq: 200, end: 140, type: 'square', dur: 0.07, vol: 0.16 });
      tone({ freq: 170, end: 120, type: 'square', dur: 0.07, vol: 0.16, delay: 0.09 });
    },
    quest() { [523, 659, 784, 1047].forEach((freq, i) => tone({ freq, type: 'triangle', dur: 0.14, vol: 0.2, delay: i * 0.09 })); },
    levelup() { [392, 523, 659, 784, 1047].forEach((freq, i) => tone({ freq, dur: 0.16, vol: 0.2, delay: i * 0.07 })); },
    firebreath() {
      noise({ dur: 0.5, vol: 0.35, freq: 300, end: 900 });
      tone({ freq: 90, end: 60, type: 'sawtooth', dur: 0.5, vol: 0.15 });
    },
    slip() { tone({ freq: 600, end: 200, dur: 0.18, vol: 0.13 }); },
  };

  function sfx(name) {
    if (muted) return;
    const recipe = RECIPES[name];
    if (!recipe) return;
    if (!ensureContext()) return;
    try {
      recipe();
    } catch (cause) {
      // A sound must never break the game.
    }
  }
  window.sfx = sfx;
  window.isSoundMuted = () => muted;

  function refreshToggle(button) {
    button.textContent = muted ? 'Sound: Off' : 'Sound: On';
    button.setAttribute('aria-pressed', String(!muted));
  }

  function addSoundToggle() {
    const footer = document.querySelector('#sidebar-footer');
    if (!footer || document.querySelector('#sound-toggle')) return;
    const button = document.createElement('button');
    button.id = 'sound-toggle';
    button.type = 'button';
    button.className = 'new-character-button';
    refreshToggle(button);
    button.addEventListener('click', () => {
      muted = !muted;
      try {
        localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
      } catch (cause) {
        // Private browsing: the toggle still works for this session.
      }
      if (masterGain && audioContext) {
        masterGain.gain.setValueAtTime(muted ? 0 : 0.5, audioContext.currentTime);
      }
      refreshToggle(button);
      if (!muted) sfx('click');
    });
    footer.append(button);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addSoundToggle);
  } else {
    addSoundToggle();
  }
})();
