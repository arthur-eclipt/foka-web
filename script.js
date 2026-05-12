/* FOKA · Marathon -- PoC game logic.
   Vanilla JS, no build step. Loaded after content.js which exposes CONTENT. */

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // Letter groups (from content.js)
  // ------------------------------------------------------------------
  const G1 = CONTENT.wheels.w3.group1;
  const G2 = CONTENT.wheels.w3.group2;
  const G3 = CONTENT.wheels.w3.group3;

  // ------------------------------------------------------------------
  // Game state
  // ------------------------------------------------------------------
  const state = {
    screen: 'splash',
    introIdx: 0,
    w1Items: CONTENT.wheels.w1.slice(),
    w2Items: CONTENT.wheels.w2.slice(),
    w3Wheel: G1.slice(),               // 6 active letters on Wheel 3
    w3Queue: [...G2, ...G3],           // letters waiting to peel in
    w1History: [],
    w2History: [],
    w2AntiStreak: 0,                    // remaining forced-opposite spins
    w2AntiStreakBan: null,              // the index banned during anti-streak
    w3ForcedPick: null,                 // letter that must win the next W3 spin
    spinning: false,
    cooldownTimers: [],
    headerTimer: null,
    overlayTimer: null,
    w1: null, w2: null, w3: null,
    audio: null,
  };

  // ------------------------------------------------------------------
  // Utility
  // ------------------------------------------------------------------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const randIdx = (n) => Math.floor(Math.random() * n);

  function letterGroup(letter) {
    if (G1.indexOf(letter) !== -1) return 1;
    if (G2.indexOf(letter) !== -1) return 2;
    if (G3.indexOf(letter) !== -1) return 3;
    return 99;
  }
  function letterOrderInGroup(letter) {
    if (G1.indexOf(letter) !== -1) return G1.indexOf(letter);
    if (G2.indexOf(letter) !== -1) return G2.indexOf(letter);
    if (G3.indexOf(letter) !== -1) return G3.indexOf(letter);
    return 99;
  }

  // ------------------------------------------------------------------
  // Audio engine (Web Audio API, all synthesized)
  // ------------------------------------------------------------------
  class AudioEngine {
    constructor() { this.ctx = null; }
    init() {
      if (this.ctx) return;
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor) this.ctx = new Ctor();
      } catch (e) { this.ctx = null; }
    }
    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
    click(volume) {
      if (!this.ctx) return;
      const v = volume == null ? 0.1 : volume;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filt = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);
      filt.type = 'lowpass';
      filt.frequency.value = 1400;
      filt.Q.value = 3;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(v, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.connect(filt); filt.connect(gain); gain.connect(this.ctx.destination);
      osc.start(now); osc.stop(now + 0.07);
    }
    thunk() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filt = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.2);
      filt.type = 'lowpass';
      filt.frequency.value = 500;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(filt); filt.connect(gain); gain.connect(this.ctx.destination);
      osc.start(now); osc.stop(now + 0.32);
    }
    ready() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(now); osc.stop(now + 0.6);
    }
    peel() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufSize = Math.floor(this.ctx.sampleRate * 0.6);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.4);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.setValueAtTime(1300, now);
      filt.frequency.exponentialRampToValueAtTime(450, now + 0.35);
      filt.Q.value = 1.4;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      src.connect(filt); filt.connect(gain); gain.connect(this.ctx.destination);
      src.start(now);
    }
  }

  // ------------------------------------------------------------------
  // Wheel
  // ------------------------------------------------------------------
  class Wheel {
    constructor(viewport, items) {
      this.viewport = viewport;
      this.strip = viewport.querySelector('.wheel-strip');
      this.items = items.slice();
      this.visibleCount = 5;
      this.centerOffset = 2;
      this.currentIdx = 0;
      this.measure();
      this.renderIdle();
    }
    measure() {
      const tester = document.createElement('div');
      tester.className = 'wheel-item';
      tester.textContent = 'M';
      this.strip.appendChild(tester);
      this.itemHeight = tester.offsetHeight || 48;
      this.strip.removeChild(tester);
      this.baseOffset = -(this.centerOffset * this.itemHeight + this.itemHeight / 2);
    }
    setItems(items) {
      this.items = items.slice();
    }
    appendItem(text) {
      const el = document.createElement('div');
      el.className = 'wheel-item';
      el.textContent = text;
      this.strip.appendChild(el);
    }
    renderIdle() {
      this.strip.innerHTML = '';
      this.strip.style.transition = 'none';
      this.strip.style.transform = `translateY(${this.baseOffset}px)`;
      const n = this.items.length;
      for (let i = 0; i < this.visibleCount; i++) {
        const offset = i - this.centerOffset;
        const idx = ((this.currentIdx + offset) % n + n) % n;
        this.appendItem(this.items[idx]);
      }
    }
    centerElement() {
      return this.strip.children[this.centerOffset];
    }
    async spin(winnerIdx, duration, audio, easing, extraRotations) {
      const n = this.items.length;
      const stepsToWinner = ((winnerIdx - this.currentIdx) % n + n) % n;
      const totalSteps = (extraRotations || 4) * n + stepsToWinner;

      this.strip.innerHTML = '';
      this.strip.style.transition = 'none';
      this.strip.style.transform = `translateY(${this.baseOffset}px)`;

      // pre-items (above current)
      for (let i = 0; i < this.centerOffset; i++) {
        const off = i - this.centerOffset;
        const idx = ((this.currentIdx + off) % n + n) % n;
        this.appendItem(this.items[idx]);
      }
      // current onward through totalSteps + post buffer
      for (let i = 0; i <= totalSteps + this.centerOffset; i++) {
        const idx = (this.currentIdx + i) % n;
        this.appendItem(this.items[idx]);
      }

      void this.strip.offsetHeight; // reflow

      this.strip.style.transition = `transform ${duration}ms ${easing || 'cubic-bezier(0.15, 0.78, 0.25, 1)'}`;
      this.strip.style.transform = `translateY(${this.baseOffset - totalSteps * this.itemHeight}px)`;

      if (audio) scheduleSpinClicks(audio, duration, totalSteps);

      await sleep(duration);

      this.currentIdx = winnerIdx;
      if (audio) audio.thunk();
      this.renderIdle();
    }
  }

  function scheduleSpinClicks(audio, duration, totalSteps) {
    const maxClicks = Math.min(totalSteps, 24);
    for (let i = 1; i <= maxClicks; i++) {
      const r = i / maxClicks;
      // ease-out: clicks spread out toward the end
      const t = 1 - Math.pow(1 - r, 2.4);
      const vol = 0.06 + (1 - r) * 0.07;
      setTimeout(() => audio.click(vol), t * duration);
    }
  }

  // ------------------------------------------------------------------
  // Wheel selection rules
  // ------------------------------------------------------------------

  // W1: same result 2 in a row → next must be opposite.
  function pickWheel1() {
    const n = state.w1Items.length;
    const h = state.w1History;
    if (h.length >= 2 && h[h.length - 1] === h[h.length - 2]) {
      const last = h[h.length - 1];
      const choices = [];
      for (let i = 0; i < n; i++) if (i !== last) choices.push(i);
      return choices[randIdx(choices.length)];
    }
    return randIdx(n);
  }
  function recordW1(idx) {
    state.w1History.push(idx);
    if (state.w1History.length > 4) state.w1History.shift();
  }

  // W2: same result 3 in a row → next 2 must be opposite.
  function pickWheel2() {
    const n = state.w2Items.length;
    if (state.w2AntiStreak > 0 && state.w2AntiStreakBan !== null) {
      const banned = state.w2AntiStreakBan;
      const choices = [];
      for (let i = 0; i < n; i++) if (i !== banned) choices.push(i);
      return choices[randIdx(choices.length)];
    }
    const h = state.w2History;
    if (h.length >= 3 && h[h.length-1] === h[h.length-2] && h[h.length-2] === h[h.length-3]) {
      const banned = h[h.length - 1];
      state.w2AntiStreak = 2;
      state.w2AntiStreakBan = banned;
      const choices = [];
      for (let i = 0; i < n; i++) if (i !== banned) choices.push(i);
      return choices[randIdx(choices.length)];
    }
    return randIdx(n);
  }
  function recordW2(idx) {
    state.w2History.push(idx);
    if (state.w2History.length > 5) state.w2History.shift();
    if (state.w2AntiStreak > 0) {
      state.w2AntiStreak--;
      if (state.w2AntiStreak === 0) state.w2AntiStreakBan = null;
    }
  }

  // W3: random pick unless a forced pick is queued.
  function pickWheel3() {
    const wheel = state.w3Wheel;
    let idx;
    if (state.w3ForcedPick !== null) {
      idx = wheel.indexOf(state.w3ForcedPick);
      if (idx === -1) idx = randIdx(wheel.length);
      state.w3ForcedPick = null;
    } else {
      idx = randIdx(wheel.length);
    }
    return idx;
  }
  function recordW3(idx) {
    const winner = state.w3Wheel[idx];
    const winnerGroup = letterGroup(winner);
    // After this spin's winner is consumed and replaced, look at the letters
    // that remain on the wheel. If any are from a lower group than the winner,
    // the next spin must land on the topmost (lowest-group, earliest-in-list)
    // remaining lower-group letter.
    const remaining = state.w3Wheel.filter((l, i) => i !== idx);
    const lower = remaining.filter((l) => letterGroup(l) < winnerGroup);
    if (lower.length > 0) {
      lower.sort((a, b) => {
        const ga = letterGroup(a), gb = letterGroup(b);
        if (ga !== gb) return ga - gb;
        return letterOrderInGroup(a) - letterOrderInGroup(b);
      });
      state.w3ForcedPick = lower[0];
    }
  }

  // ------------------------------------------------------------------
  // Screens
  // ------------------------------------------------------------------
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach((s) => {
      s.setAttribute('aria-hidden', s.dataset.screen === name ? 'false' : 'true');
    });
    state.screen = name;
  }

  function renderIntro(idx) {
    state.introIdx = idx;
    const data = CONTENT.intro[idx];
    const intro = document.querySelector('.intro');
    intro.querySelector('.intro-title').textContent = data.title;
    intro.querySelector('.intro-subtitle').textContent = data.subtitle;
    intro.querySelector('.intro-flag').textContent = data.flag || '';
    const copy = intro.querySelector('.intro-copy');
    copy.innerHTML = '';
    data.body.forEach((line) => {
      const p = document.createElement('p');
      // bold the section labels (e.g. "The Reset:", "Rule:", "The Outfit:")
      p.innerHTML = line.replace(
        /(^|\s)((?:The\s)?[A-Z][A-Za-z'’]*(?:\s[A-Z][A-Za-z'’]*)*:)/g,
        '$1<strong>$2</strong>'
      );
      copy.appendChild(p);
    });
    intro.querySelector('.intro-next').textContent = data.button;
    intro.querySelectorAll('.intro-dots .dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }

  function attachIntroHandlers() {
    const intro = document.querySelector('.intro');
    intro.querySelector('.intro-next').addEventListener('click', () => {
      state.audio.init();
      state.audio.resume();
      if (state.introIdx < CONTENT.intro.length - 1) {
        renderIntro(state.introIdx + 1);
      } else {
        startMarathon();
      }
    });
  }

  // ------------------------------------------------------------------
  // Header ticker
  // ------------------------------------------------------------------
  function startHeaderTicker() {
    const msgEl = document.querySelector('.header-msg');
    const messages = CONTENT.headerMessages;
    let i = 0;
    msgEl.textContent = messages[0];
    state.headerTimer = setInterval(() => {
      msgEl.classList.add('swap-out');
      setTimeout(() => {
        i = (i + 1) % messages.length;
        msgEl.textContent = messages[i];
        msgEl.classList.remove('swap-out');
      }, 380);
    }, 5000);
  }
  function stopHeaderTicker() {
    if (state.headerTimer) {
      clearInterval(state.headerTimer);
      state.headerTimer = null;
    }
  }

  // ------------------------------------------------------------------
  // Marathon screen entry
  // ------------------------------------------------------------------
  function tryLockLandscape() {
    if (window.screen && screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => { /* not allowed; ignore */ });
    }
  }

  function startMarathon() {
    tryLockLandscape();
    showScreen('marathon');
    showInGameOverlay();
    startHeaderTicker();

    state.w1 = new Wheel(document.querySelector('[data-wheel="1"]'), state.w1Items);
    state.w2 = new Wheel(document.querySelector('[data-wheel="2"]'), state.w2Items);
    state.w3 = new Wheel(document.querySelector('[data-wheel="3"]'), state.w3Wheel);

    // Enable spin after a moment so the overlay has stage time.
    setTimeout(() => setSpinEnabled(true), 1200);
  }

  function showInGameOverlay() {
    const overlay = document.querySelector('.game-overlay');
    overlay.querySelector('.game-overlay-heading').textContent = CONTENT.overlay.heading;
    const body = overlay.querySelector('.game-overlay-body');
    body.innerHTML = '';
    CONTENT.overlay.body.forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line;
      body.appendChild(p);
    });
    setTimeout(() => overlay.classList.add('visible'), 180);
    state.overlayTimer = setTimeout(() => {
      overlay.classList.remove('visible');
    }, 5200);
  }

  function setSpinEnabled(on) {
    const btn = document.querySelector('.btn-spin');
    btn.disabled = !on;
  }

  function attachSpinHandler() {
    document.querySelector('.btn-spin').addEventListener('click', () => {
      if (state.spinning) return;
      // First spin also dismisses the overlay immediately.
      const overlay = document.querySelector('.game-overlay');
      if (overlay.classList.contains('visible')) {
        overlay.classList.remove('visible');
      }
      runSpin();
    });
  }

  // ------------------------------------------------------------------
  // Spin sequence
  // ------------------------------------------------------------------
  async function runSpin() {
    state.spinning = true;
    setSpinEnabled(false);
    clearCooldownTimers();

    const w1Idx = pickWheel1();
    const w2Idx = pickWheel2();
    const w3Idx = pickWheel3();

    document.querySelector('.wheels').classList.remove('sentence-formed');
    const fill = document.querySelector('.timer-fill');
    fill.style.transition = 'none';
    fill.style.width = '0%';

    // Durations chosen so:
    //  - W1 stops first
    //  - W3 stops in the middle, slightly slower per-rotation than W1
    //  - W2 stops last, with faster per-rotation cadence
    const p1 = state.w1.spin(w1Idx, 2800, state.audio, 'cubic-bezier(0.15, 0.78, 0.25, 1)', 6);
    const p3 = state.w3.spin(w3Idx, 3700, state.audio, 'cubic-bezier(0.18, 0.75, 0.22, 1)', 5);
    const p2 = state.w2.spin(w2Idx, 4500, state.audio, 'cubic-bezier(0.12, 0.82, 0.22, 1)', 10);

    await Promise.all([p1, p2, p3]);
    const tStop = performance.now();

    recordW1(w1Idx);
    recordW2(w2Idx);
    recordW3(w3Idx);

    // Sentence formation: fade fringe text, brighten the centered row.
    await sleep(180);
    document.querySelector('.wheels').classList.add('sentence-formed');

    // Hold the sentence moment.
    await sleep(1400);

    // Peel off Wheel 3's centered (winning) letter and reveal the next from queue.
    const oldText = state.w3.items[w3Idx];
    const replacement = state.w3Queue.shift();
    if (replacement === undefined) {
      await transitionToFinal();
      return;
    }
    const isEnding = (replacement === G3[0]);

    // Start the peel-off, but don't await yet -- the cooldown bar must begin
    // filling at t=3s from wheel-stop, which can overlap the tail end of the
    // peel animation.
    const peelPromise = peelOff(state.w3, oldText, replacement);

    if (!isEnding) {
      const sinceStop = performance.now() - tStop;
      const fillStartIn = Math.max(0, 3000 - sinceStop);
      const tFillStart = setTimeout(() => {
        const remaining = Math.max(800, tStop + 30000 - performance.now());
        fill.style.transition = `width ${remaining}ms linear`;
        fill.style.width = '100%';
      }, fillStartIn);
      state.cooldownTimers.push(tFillStart);

      const enableIn = Math.max(0, tStop + 30000 - performance.now());
      const tEnable = setTimeout(() => {
        state.spinning = false;
        setSpinEnabled(true);
        if (state.audio) state.audio.ready();
      }, enableIn);
      state.cooldownTimers.push(tEnable);
    }

    await peelPromise;

    // Commit the replacement into wheel state.
    state.w3.items[w3Idx] = replacement;
    state.w3Wheel[w3Idx] = replacement;
    state.w3.renderIdle();

    // PoC ending: Inner Thighs has just been peeled in.
    if (isEnding) {
      // Per brief 5.7: "No header cycling during this beat".
      stopHeaderTicker();
      await sleep(1700);
      await transitionToFinal();
      return;
    }

    document.querySelector('.wheels').classList.remove('sentence-formed');
  }

  function clearCooldownTimers() {
    state.cooldownTimers.forEach((t) => clearTimeout(t));
    state.cooldownTimers = [];
  }

  // ------------------------------------------------------------------
  // Peel-off animation
  // ------------------------------------------------------------------
  async function peelOff(wheel, oldText, newText) {
    const centerEl = wheel.centerElement();
    if (!centerEl) return;
    centerEl.textContent = '';

    const stack = document.createElement('div');
    stack.className = 'peel-stack';

    const bottom = document.createElement('div');
    bottom.className = 'peel-layer bottom';
    bottom.textContent = newText;

    const top = document.createElement('div');
    top.className = 'peel-layer top';
    top.textContent = oldText;

    stack.appendChild(bottom);
    stack.appendChild(top);
    centerEl.appendChild(stack);

    void stack.offsetHeight; // reflow

    if (state.audio) state.audio.peel();
    stack.classList.add('peeling');

    await sleep(1850);
  }

  // ------------------------------------------------------------------
  // Final screen
  // ------------------------------------------------------------------
  async function transitionToFinal() {
    stopHeaderTicker();
    if (state.overlayTimer) clearTimeout(state.overlayTimer);
    clearCooldownTimers();
    renderFinal();
    showScreen('final');
  }

  function renderFinal() {
    const finalEl = document.querySelector('.final');
    finalEl.querySelector('.final-heading').textContent = CONTENT.final.heading;
    const copy = finalEl.querySelector('.final-copy');
    copy.innerHTML = '';
    CONTENT.final.body.forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line;
      copy.appendChild(p);
    });
    finalEl.querySelector('.final-label').textContent = CONTENT.final.cta.label;
    const input = finalEl.querySelector('.final-input');
    input.placeholder = CONTENT.final.cta.placeholder;
    finalEl.querySelector('.final-submit').textContent = CONTENT.final.cta.button;
    const feedback = finalEl.querySelector('.final-feedback');
    feedback.textContent = '';
    feedback.classList.remove('success', 'error');
    finalEl.classList.remove('submitted');
  }

  function attachFinalHandler() {
    const finalEl = document.querySelector('.final');
    finalEl.querySelector('.final-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = finalEl.querySelector('.final-input');
      const feedback = finalEl.querySelector('.final-feedback');
      const email = input.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      feedback.classList.remove('success', 'error');
      if (!ok) {
        feedback.textContent = CONTENT.final.cta.error;
        feedback.classList.add('error');
        return;
      }
      try {
        const raw = localStorage.getItem('foka_subscribers');
        const list = raw ? JSON.parse(raw) : [];
        list.push({ email: email, timestamp: new Date().toISOString() });
        localStorage.setItem('foka_subscribers', JSON.stringify(list));
      } catch (e) { /* localStorage may be disabled */ }
      feedback.textContent = CONTENT.final.cta.success;
      feedback.classList.add('success');
      finalEl.classList.add('submitted');
    });
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  function boot() {
    state.audio = new AudioEngine();

    // Splash → Intro after 2s
    setTimeout(() => {
      renderIntro(0);
      showScreen('intro');
    }, 2000);

    attachIntroHandlers();
    attachSpinHandler();
    attachFinalHandler();

    // First user gesture unlocks audio.
    const initAudio = () => {
      state.audio.init();
      state.audio.resume();
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
    window.addEventListener('pointerdown', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

    // Re-measure wheels on resize / orientation change (only when idle).
    let resizeT;
    window.addEventListener('resize', () => {
      if (state.spinning) return;
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        ['w1', 'w2', 'w3'].forEach((k) => {
          if (state[k]) { state[k].measure(); state[k].renderIdle(); }
        });
      }, 180);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
