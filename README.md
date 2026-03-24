# Bluegrass Pitch Pipe

A free, open-source pitch pipe for bluegrass instruments. No tracking, no ads, no cookies, no nonsense.

**[Live App](https://bluegrasspitchpipe.vercel.app)** (once deployed)

## Instruments & Tunings

- **Fiddle / Mandolin** — Standard (G-D-A-E), Cross-tune (A-E-A-E)
- **Guitar** — Standard, Drop D, Open G, DADGAD
- **5-String Banjo** — Open G, Open D, Double C, Sawmill
- **Upright Bass** — Standard (E-A-D-G)
- **Custom** — Pick 1–8 strings, any note/octave

## How It Works

Tones are generated in the browser via Web Audio API — no server, no external requests. Tap a string to play its reference pitch, tap another to switch. Multiple tunings per instrument. A440 standard.

Bookmark `/a` for a quick standalone A440 tone.

## Tech

Pure vanilla HTML / CSS / JS. Zero dependencies. Static site hosted on Vercel.

## Run Locally

Open `index.html` directly, or:

```
python3 -m http.server
```

## License

[AGPL-3.0](LICENSE)
