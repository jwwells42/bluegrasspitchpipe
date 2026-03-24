# CLAUDE.md

## Project

Bluegrass pitch pipe — browser-based tone generator for tuning string instruments. Static site, no build step, deployed on Vercel.

## Stack

Pure vanilla HTML/CSS/JS. Zero dependencies. No framework, no bundler, no npm.

- `index.html` — single-page app shell
- `style.css` — mobile-first dark theme, CSS custom properties
- `app.js` — instrument data, audio engine, UI controller (all in one IIFE)

## Audio Engine

Web Audio API's destination node is broken on some Chrome + Linux/PipeWire setups. The audio engine generates WAV blobs in memory and plays them via `<audio>` elements instead. Tones include harmonics and vibrato baked into the WAV data.

Key constants in `app.js` for tuning the sound:
- `HARMONICS` — array of `{ mult, amp }` controlling the harmonic recipe
- `VIBRATO_RATE` — wobble speed in Hz (currently 5.0)
- `VIBRATO_DEPTH` — pitch deviation as a fraction (currently 0.006 = ±10 cents)

WAVs are cached by frequency in `audio.urlCache`. Gapless looping uses two `<audio>` elements that alternate.

## Conventions

- No external dependencies, ever
- No analytics, cookies, tracking, or third-party requests
- AGPL-3.0 licensed
- Keep total payload under 50KB (excluding LICENSE)
