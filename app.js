(function () {
  'use strict';

  // ── Instrument Data ──────────────────────────────────────────────

  var INSTRUMENTS = {
    fiddle: {
      name: 'Fiddle / Mandolin',
      tunings: {
        standard: {
          name: 'Standard',
          strings: [
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'D', octave: 4, freq: 293.66 },
            { note: 'A', octave: 4, freq: 440.00, reference: true },
            { note: 'E', octave: 5, freq: 659.26 }
          ]
        },
        crossAEAE: {
          name: 'Cross (A-E-A-E)',
          strings: [
            { note: 'A', octave: 3, freq: 220.00 },
            { note: 'E', octave: 4, freq: 329.63 },
            { note: 'A', octave: 4, freq: 440.00, reference: true },
            { note: 'E', octave: 5, freq: 659.26 }
          ]
        }
      }
    },
    guitar: {
      name: 'Guitar',
      tunings: {
        standard: {
          name: 'Standard',
          strings: [
            { note: 'E', octave: 2, freq: 82.41 },
            { note: 'A', octave: 2, freq: 110.00, reference: true },
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'B', octave: 3, freq: 246.94 },
            { note: 'E', octave: 4, freq: 329.63 }
          ]
        },
        dropD: {
          name: 'Drop D',
          strings: [
            { note: 'D', octave: 2, freq: 73.42 },
            { note: 'A', octave: 2, freq: 110.00, reference: true },
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'B', octave: 3, freq: 246.94 },
            { note: 'E', octave: 4, freq: 329.63 }
          ]
        },
        openG: {
          name: 'Open G',
          strings: [
            { note: 'D', octave: 2, freq: 73.42 },
            { note: 'G', octave: 2, freq: 98.00 },
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'B', octave: 3, freq: 246.94 },
            { note: 'D', octave: 4, freq: 293.66 }
          ]
        },
        dadgad: {
          name: 'DADGAD',
          strings: [
            { note: 'D', octave: 2, freq: 73.42 },
            { note: 'A', octave: 2, freq: 110.00, reference: true },
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'A', octave: 3, freq: 220.00 },
            { note: 'D', octave: 4, freq: 293.66 }
          ]
        }
      }
    },
    banjo: {
      name: '5-String Banjo',
      tunings: {
        openG: {
          name: 'Open G',
          strings: [
            { note: 'g', octave: 4, freq: 392.00, short: true },
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'B', octave: 3, freq: 246.94 },
            { note: 'D', octave: 4, freq: 293.66 }
          ]
        },
        openD: {
          name: 'Open D',
          strings: [
            { note: 'f\u266F', octave: 4, freq: 369.99, short: true },
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'F\u266F', octave: 3, freq: 185.00 },
            { note: 'A', octave: 3, freq: 220.00, reference: true },
            { note: 'D', octave: 4, freq: 293.66 }
          ]
        },
        doubleC: {
          name: 'Double C',
          strings: [
            { note: 'g', octave: 4, freq: 392.00, short: true },
            { note: 'C', octave: 3, freq: 130.81 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'C', octave: 4, freq: 261.63 },
            { note: 'D', octave: 4, freq: 293.66 }
          ]
        },
        sawmill: {
          name: 'Sawmill',
          strings: [
            { note: 'g', octave: 4, freq: 392.00, short: true },
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'C', octave: 4, freq: 261.63 },
            { note: 'D', octave: 4, freq: 293.66 }
          ]
        }
      }
    },
    bass: {
      name: 'Upright Bass',
      tunings: {
        standard: {
          name: 'Standard',
          strings: [
            { note: 'E', octave: 1, freq: 41.20 },
            { note: 'A', octave: 1, freq: 55.00, reference: true },
            { note: 'D', octave: 2, freq: 73.42 },
            { note: 'G', octave: 2, freq: 98.00 }
          ]
        }
      }
    }
  };

  var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  function noteToFreq(noteName, octave) {
    var semitones = (octave - 4) * 12 + (NOTE_NAMES.indexOf(noteName) - 9);
    return 440 * Math.pow(2, semitones / 12);
  }

  // ── Audio Engine ─────────────────────────────────────────────────
  // Web Audio API oscillators for instant, continuous, gapless tones.
  // Single shared AudioContext, one oscillator set per active string.

  // ── Sound design knobs ──────────────────────────────────────────
  //
  // VIBRATO — pitch wobble
  var VIBRATO_RATE = 4.5;    // Hz — speed of the wobble
  var VIBRATO_DEPTH = 0.004; // ±0.4% pitch deviation (~7 cents)
  //
  // FILTER — controls brightness of the sawtooth tone
  var FILTER_CUTOFF = 2000;  // Hz — higher = brighter, lower = darker/warmer
  // var FILTER_Q = 1;       // resonance — higher = more nasal peak at cutoff (default 1)
  //
  // OSCILLATOR TYPES — swap these to change the character:
  //   'sine'     — pure, clean, tuning fork
  //   'triangle' — warm, soft harmonics
  //   'square'   — hollow, reedy, clarinet-like
  //   'sawtooth' — bright, all harmonics, rich (best paired with filter)
  //
  // EXTRA IDEAS to try:
  //   Detune for chorus:  osc2.detune.value = 5;  (thickens the sound)
  //   Tremolo:  connect an LFO to gain instead of frequency
  //   Slower attack:  change 0.04 fade-in to 0.2 for breathy onset

  var audio = {
    ctx: null,
    masterGain: null,
    active: new Map(),

    ensureContext: function () {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.7;
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
        this.ctx.resume();
      }
    },

    toggleTone: function (index, freq) {
      if (this.active.has(index)) {
        this.stopTone(index);
        return false;
      }

      this.ensureContext();
      var ctx = this.ctx;
      var now = ctx.currentTime;

      // Main oscillator — sawtooth has all harmonics, filter tames it
      var osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      // Low-pass filter — rolls off harsh highs from sawtooth
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(FILTER_CUTOFF, now);

      // Vibrato via LFO modulating oscillator frequency
      var lfo = ctx.createOscillator();
      var lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(VIBRATO_RATE, now);
      lfoGain.gain.setValueAtTime(freq * VIBRATO_DEPTH, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Per-string gain with fade-in
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04);

      // Signal chain: osc → filter → gain → master
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      lfo.start(now);

      this.active.set(index, {
        oscs: [osc, lfo],
        gains: [gain]
      });
      return true;
    },

    stopTone: function (index) {
      var nodes = this.active.get(index);
      if (!nodes) return;

      var now = this.ctx.currentTime;
      // Fade out to avoid click
      nodes.gains.forEach(function (g) {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + 0.05);
      });
      // Stop oscillators after fade completes
      nodes.oscs.forEach(function (o) {
        o.stop(now + 0.06);
      });

      this.active.delete(index);
    },

    stopAll: function () {
      var self = this;
      var indices = Array.from(this.active.keys());
      indices.forEach(function (index) {
        self.stopTone(index);
      });
    },

    isPlaying: function (index) {
      return this.active.has(index);
    },

    playingCount: function () {
      return this.active.size;
    }
  };

  // ── UI State ─────────────────────────────────────────────────────

  var state = {
    instrument: 'fiddle',
    tuning: 'standard',
    customStrings: [
      { note: 'G', octave: 3 },
      { note: 'D', octave: 4 },
      { note: 'A', octave: 4 },
      { note: 'E', octave: 5 }
    ]
  };

  // ── DOM refs ─────────────────────────────────────────────────────

  var $instrumentSelector = document.getElementById('instrument-selector');
  var $tuningSelector = document.getElementById('tuning-selector');
  var $strings = document.getElementById('strings');
  var $stopAll = document.getElementById('stop-all');
  var $customControls = document.getElementById('custom-controls');
  var $customStrings = document.getElementById('custom-strings');
  var $stringCount = document.getElementById('string-count');
  var $addString = document.getElementById('add-string');
  var $removeString = document.getElementById('remove-string');

  // ── UI Controller ────────────────────────────────────────────────

  function selectInstrument(key) {
    audio.stopAll();
    state.instrument = key;

    // Update instrument buttons
    var btns = $instrumentSelector.querySelectorAll('.instrument-btn');
    btns.forEach(function (btn) {
      var isActive = btn.dataset.instrument === key;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Show/hide custom controls
    var isCustom = key === 'custom';
    $customControls.hidden = !isCustom;
    $tuningSelector.hidden = isCustom;

    if (isCustom) {
      renderCustomControls();
      renderStrings();
    } else {
      // Populate tuning selector
      var instrument = INSTRUMENTS[key];
      var tuningKeys = Object.keys(instrument.tunings);
      state.tuning = tuningKeys[0];
      renderTuningSelector(instrument, tuningKeys);
      renderStrings();
    }

    updateStopAllState();
  }

  function renderTuningSelector(instrument, tuningKeys) {
    $tuningSelector.innerHTML = '';
    tuningKeys.forEach(function (tKey) {
      var btn = document.createElement('button');
      btn.className = 'tuning-btn';
      btn.dataset.tuning = tKey;
      btn.textContent = instrument.tunings[tKey].name;
      if (tKey === state.tuning) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.setAttribute('aria-pressed', 'false');
      }
      $tuningSelector.appendChild(btn);
    });
  }

  function selectTuning(key) {
    audio.stopAll();
    state.tuning = key;

    var btns = $tuningSelector.querySelectorAll('.tuning-btn');
    btns.forEach(function (btn) {
      var isActive = btn.dataset.tuning === key;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    renderStrings();
    updateStopAllState();
  }

  function getActiveStrings() {
    if (state.instrument === 'custom') {
      return state.customStrings.map(function (s) {
        return {
          note: s.note,
          octave: s.octave,
          freq: Math.round(noteToFreq(s.note, s.octave) * 100) / 100
        };
      });
    }
    return INSTRUMENTS[state.instrument].tunings[state.tuning].strings;
  }

  function renderStrings() {
    $strings.innerHTML = '';
    var strings = getActiveStrings();
    $strings.style.gridTemplateColumns = 'repeat(' + strings.length + ', 1fr)';

    strings.forEach(function (s, i) {
      var btn = document.createElement('button');
      btn.className = 'string-btn';
      btn.dataset.index = i;
      btn.dataset.freq = s.freq;

      if (s.reference) btn.classList.add('reference');
      if (s.short) btn.classList.add('short');
      if (audio.isPlaying(i)) btn.classList.add('playing');

      var noteSpan = document.createElement('span');
      noteSpan.className = 'note';
      noteSpan.textContent = s.note;

      var octaveSpan = document.createElement('span');
      octaveSpan.className = 'octave';
      octaveSpan.textContent = s.octave;

      var freqSpan = document.createElement('span');
      freqSpan.className = 'freq';
      freqSpan.textContent = s.freq.toFixed(1) + ' Hz';

      btn.appendChild(noteSpan);
      btn.appendChild(octaveSpan);
      btn.appendChild(freqSpan);

      var label = s.note + s.octave + ', ' + s.freq.toFixed(1) + ' Hz';
      if (s.reference) label += ', reference string';
      if (s.short) label += ', 5th string';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('aria-pressed', audio.isPlaying(i) ? 'true' : 'false');

      $strings.appendChild(btn);
    });
  }

  function toggleString(index, freq, btn) {
    var wasPlaying = audio.isPlaying(index);

    // Stop all other strings first
    stopAllStrings();

    // If this string was already playing, we just wanted to stop it
    if (wasPlaying) return;

    // Start this string
    audio.toggleTone(index, freq);
    btn.classList.add('playing');
    btn.setAttribute('aria-pressed', 'true');
    updateStopAllState();
  }

  function stopAllStrings() {
    audio.stopAll();
    var btns = $strings.querySelectorAll('.string-btn');
    btns.forEach(function (btn) {
      btn.classList.remove('playing');
      btn.setAttribute('aria-pressed', 'false');
    });
    updateStopAllState();
  }

  function updateStopAllState() {
    $stopAll.classList.toggle('has-playing', audio.playingCount() > 0);
  }

  // ── Custom instrument ────────────────────────────────────────────

  function renderCustomControls() {
    $stringCount.textContent = state.customStrings.length;
    $customStrings.innerHTML = '';

    state.customStrings.forEach(function (s, i) {
      var row = document.createElement('div');
      row.className = 'custom-string-row';

      var label = document.createElement('label');
      label.textContent = (i + 1);

      var noteSelect = document.createElement('select');
      noteSelect.dataset.index = i;
      noteSelect.dataset.field = 'note';
      noteSelect.setAttribute('aria-label', 'String ' + (i + 1) + ' note');
      NOTE_NAMES.forEach(function (n) {
        var opt = document.createElement('option');
        opt.value = n;
        opt.textContent = n;
        if (n === s.note) opt.selected = true;
        noteSelect.appendChild(opt);
      });

      var octaveSelect = document.createElement('select');
      octaveSelect.dataset.index = i;
      octaveSelect.dataset.field = 'octave';
      octaveSelect.setAttribute('aria-label', 'String ' + (i + 1) + ' octave');
      for (var o = 1; o <= 6; o++) {
        var opt = document.createElement('option');
        opt.value = o;
        opt.textContent = o;
        if (o === s.octave) opt.selected = true;
        octaveSelect.appendChild(opt);
      }

      row.appendChild(label);
      row.appendChild(noteSelect);
      row.appendChild(octaveSelect);
      $customStrings.appendChild(row);
    });
  }

  function addCustomString() {
    if (state.customStrings.length >= 8) return;
    state.customStrings.push({ note: 'A', octave: 4 });
    audio.stopAll();
    renderCustomControls();
    renderStrings();
    updateStopAllState();
  }

  function removeCustomString() {
    if (state.customStrings.length <= 1) return;
    state.customStrings.pop();
    audio.stopAll();
    renderCustomControls();
    renderStrings();
    updateStopAllState();
  }

  function updateCustomString(index, field, value) {
    if (field === 'note') {
      state.customStrings[index].note = value;
    } else if (field === 'octave') {
      state.customStrings[index].octave = parseInt(value, 10);
    }
    if (audio.isPlaying(index)) {
      audio.stopTone(index);
    }
    renderStrings();
    updateStopAllState();
  }

  // ── Event listeners ──────────────────────────────────────────────

  $instrumentSelector.addEventListener('click', function (e) {
    var btn = e.target.closest('.instrument-btn');
    if (!btn) return;
    selectInstrument(btn.dataset.instrument);
  });

  $tuningSelector.addEventListener('click', function (e) {
    var btn = e.target.closest('.tuning-btn');
    if (!btn) return;
    selectTuning(btn.dataset.tuning);
  });

  $strings.addEventListener('click', function (e) {
    var btn = e.target.closest('.string-btn');
    if (!btn) return;
    var index = parseInt(btn.dataset.index, 10);
    var freq = parseFloat(btn.dataset.freq);
    toggleString(index, freq, btn);
  });

  $stopAll.addEventListener('click', function () {
    stopAllStrings();
  });

  $addString.addEventListener('click', addCustomString);
  $removeString.addEventListener('click', removeCustomString);

  $customStrings.addEventListener('change', function (e) {
    var select = e.target;
    if (!select.dataset.field) return;
    var index = parseInt(select.dataset.index, 10);
    updateCustomString(index, select.dataset.field, select.value);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAllStrings();
  });

  // ── Init ─────────────────────────────────────────────────────────

  selectInstrument('fiddle');

})();
