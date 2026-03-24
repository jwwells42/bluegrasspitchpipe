# CLAUDE.md

## Project

Bluegrass pitch pipe — browser-based tone generator for tuning string instruments. Static site, no build step, deployed on Vercel.

## Stack

Pure vanilla HTML/CSS/JS. Zero dependencies. No framework, no bundler, no npm.

- `index.html` — single-page app shell
- `style.css` — mobile-first dark theme, CSS custom properties
- `app.js` — instrument data, audio engine, UI controller (all in one IIFE)

## Audio Engine

Uses Web Audio API OscillatorNodes for real-time tone generation. Each string creates:
- Triangle wave oscillator (fundamental) — warm, not harsh
- Sine wave oscillator (2nd harmonic) — adds body
- LFO oscillator modulating both frequencies — vibrato

Key constants in `app.js` for tuning the sound:
- `VIBRATO_RATE` — wobble speed in Hz (currently 5.0)
- `VIBRATO_DEPTH` — pitch deviation as a fraction (currently 0.006 = ±10 cents)

Single shared AudioContext, lazily created on first user tap (required for iOS Safari). Gain ramping on start/stop prevents click artifacts.


## Conventions

- No external dependencies, ever
- No analytics, cookies, tracking, or third-party requests
- AGPL-3.0 licensed
- Keep total payload under 50KB (excluding LICENSE)
