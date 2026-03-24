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
  // Uses generated WAV blobs + <audio> elements instead of Web Audio
  // destination node, which is broken on some Chrome + Linux/PipeWire setups.

  var SAMPLE_RATE = 44100;

  // Harmonic recipe for a warm pitch-pipe tone
  var HARMONICS = [
    { mult: 1, amp: 1.0 },    // fundamental
    { mult: 2, amp: 0.4 },    // 2nd
    { mult: 3, amp: 0.25 },   // 3rd (odd, warmth)
    { mult: 4, amp: 0.1 },    // 4th
    { mult: 5, amp: 0.15 },   // 5th (odd)
    { mult: 6, amp: 0.05 },   // 6th
    { mult: 7, amp: 0.08 },   // 7th (odd)
  ];

  // Vibrato: gentle pitch wobble
  var VIBRATO_RATE = 5.0;    // Hz — speed of the wobble
  var VIBRATO_DEPTH = 0.006; // ±0.6% pitch deviation (~10 cents)

  function generateToneWav(freq) {
    // Buffer = exact integer of vibrato cycles for seamless loop
    var vibratoCycles = Math.max(1, Math.round(2 * VIBRATO_RATE)); // ~2s
    var duration = vibratoCycles / VIBRATO_RATE;
    var numSamples = Math.round(duration * SAMPLE_RATE);

    var buffer = new ArrayBuffer(44 + numSamples * 2);
    var view = new DataView(buffer);

    // WAV header
    function writeStr(off, s) { for (var i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); }
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, SAMPLE_RATE, true);
    view.setUint32(28, SAMPLE_RATE * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate samples using phase accumulation for accurate vibrato looping
    var phases = [];
    for (var h = 0; h < HARMONICS.length; h++) phases[h] = 0;

    for (var i = 0; i < numSamples; i++) {
      var t = i / SAMPLE_RATE;
      // Vibrato: modulate frequency slightly
      var vibrato = 1 + VIBRATO_DEPTH * Math.sin(2 * Math.PI * VIBRATO_RATE * t);
      var instFreq = freq * vibrato;

      var sample = 0;
      for (var h = 0; h < HARMONICS.length; h++) {
        var hFreq = instFreq * HARMONICS[h].mult;
        if (hFreq > SAMPLE_RATE / 2) break;
        phases[h] += hFreq / SAMPLE_RATE;
        sample += HARMONICS[h].amp * Math.sin(2 * Math.PI * phases[h]);
      }
      sample *= 0.35;
      view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample * 32767)), true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  var audio = {
    active: new Map(),
    urlCache: new Map(),

    getToneUrl: function (freq) {
      // Cache generated WAVs by frequency to avoid regenerating
      var key = freq.toFixed(2);
      if (!this.urlCache.has(key)) {
        this.urlCache.set(key, URL.createObjectURL(generateToneWav(freq)));
      }
      return this.urlCache.get(key);
    },

    toggleTone: function (index, freq) {
      if (this.active.has(index)) {
        this.stopTone(index);
        return false;
      }

      var url = this.getToneUrl(freq);

      // Two audio elements for gapless looping: start the next one
      // just before the current one ends to avoid decode gap
      var elA = new Audio(url);
      var elB = new Audio(url);
      elA.preload = 'auto';
      elB.preload = 'auto';
      elA.volume = 0.7;
      elB.volume = 0.7;

      var entry = { els: [elA, elB], current: 0, stopped: false };

      function scheduleNext(playing, next) {
        playing.ontimeupdate = function () {
          if (entry.stopped) return;
          // Start next element 150ms before current ends
          if (playing.duration - playing.currentTime < 0.15) {
            playing.ontimeupdate = null;
            next.currentTime = 0;
            next.play();
            // When next starts playing, set up its own handoff
            next.onplay = function () {
              next.onplay = null;
              scheduleNext(next, playing);
            };
          }
        };
      }

      elA.play();
      scheduleNext(elA, elB);

      this.active.set(index, entry);
      return true;
    },

    stopTone: function (index) {
      var entry = this.active.get(index);
      if (!entry) return;
      entry.stopped = true;
      entry.els.forEach(function (el) {
        el.ontimeupdate = null;
        el.pause();
        el.currentTime = 0;
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
