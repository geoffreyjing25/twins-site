# Personal pages — Geoffrey & Albert

This document covers the **`/geoffrey`** and **`/albert`** pages on
`jingtwins.com`. The hub page (`twins-site/index.html`) and all sub-pages
under `geoffrey/{about,favorites,quotes,readings}` and
`albert/{beliefs,favorites,quotes,writings}` are **untouched**.

## URLs

| URL                          | Served from                       |
|------------------------------|-----------------------------------|
| `jingtwins.com/`             | `twins-site/index.html`           |
| `jingtwins.com/geoffrey`     | `twins-site/geoffrey/index.html`  |
| `jingtwins.com/albert`       | `twins-site/albert/index.html`    |

(The clean URLs work because static hosts like GitHub Pages auto-resolve
`/geoffrey` to `/geoffrey/index.html`.)

## File layout for the personal pages

```
twins-site/
├── index.html                    ← original twins hub (NOT touched)
├── styles.css, cursor.js         ← used by the hub (NOT touched)
├── geoffrey/
│   ├── index.html                ← NEW — Minimal theme, Geoffrey profile
│   ├── geoffrey.css              ← legacy, no longer referenced
│   ├── about/  favorites/        ← legacy sub-pages (NOT touched)
│   ├── quotes/ readings/
├── albert/
│   ├── index.html                ← NEW — Monet theme, Albert profile
│   ├── beliefs/  favorites/      ← legacy sub-pages (NOT touched)
│   ├── quotes/   writings/
└── src/                          ← NEW — shared React/JSX sources
    ├── content.jsx               ← GEOFFREY + ALBERT profile data
    ├── SoundButton.jsx           ← YouTube player + FlowsTrigger
    ├── ThemeMinimal.jsx          ← Minimal theme + MiniTerminal
    ├── ThemeMonet.jsx            ← Monet theme + painting cycler
    └── MonetPaintings.jsx        ← 5 procedural SVG paintings
```

The two index pages each load the React + Babel-Standalone CDN bundle and
import only the JSX files they need from `../src/`.

## Where to edit what

### Bio text, "now" list, social links

`twins-site/src/content.jsx` — two objects, `GEOFFREY` and `ALBERT`. Each
has:

- `name`, `initials`, `location`
- `intro.paragraphs` — array of strings rendered as `<p>` tags
- `flowsLine` — split into `prefix` / `suffix` so the word **flows** can be
  wired up as the hidden music trigger between them
- `now` — list of `{ label, value }` rows
- `links` — `{ label, href, handle }` for the social/email row

### YouTube tracks

- **Geoffrey's tracks** are defined inline at the bottom of
  `geoffrey/index.html` and passed to `<SoundButton tracks={...} />`. Edit
  that array in place.
- **Albert's tracks** use the default list at the top of
  `src/SoundButton.jsx` (`DEFAULT_TRACKS`). Either edit that list or pass
  a custom one via `tracks={...}` like Geoffrey does.

### Theme look

| Want to change…                              | Edit                                                |
|----------------------------------------------|-----------------------------------------------------|
| Minimal page colors / sizes                  | `minimalStyles` at the top of `ThemeMinimal.jsx`    |
| Minimal terminal commands / responses        | `run()` inside `MiniTerminal` in `ThemeMinimal.jsx` |
| Monet panel/plaque tints per painting        | `PAINTINGS[]` array at the top of `ThemeMonet.jsx`  |
| The actual paintings (sky/sea/etc.)          | `MonetPaintings.jsx` — one function per painting    |

## Feature inventory

### Geoffrey (`/geoffrey` → Minimal theme)

- Live SF clock (Pacific Time, ticks every 1s)
- Pulsing accent dot next to "San Francisco"
- Rotating "now" status line that cycles every ~2.8s with a slot-reel
  animation; the matching row in the "// now" list highlights in sync
- Sparkline tick divider — every fifth bar accented in the brand orange
- Two-column "// now" + "// elsewhere" footer block
- Inline **flows** trigger in the bio paragraph — hidden by default,
  reveals dotted underline + ♪ on hover, click toggles YouTube playback
- Collapsible MiniTerminal pinned bottom-right (`›_` chevron). Commands:
  - `help`, `whoami`, `now`, `links`, `clear`
  - `anticipated` — list of upcoming events (Derby, French Open, World
    Cup, NBA Finals, etc.)
  - `derby`, `french open`, `world cup`, `nba finals` — each has a
    one-liner
  - `coffee` — current rotation
  - `↑` / `↓` cycle input history (last 50)

### Albert (`/albert` → Monet theme)

- Click anywhere on the canvas (outside the text panel) to **cycle through
  five procedural paintings**:
  1. Impression, Sunrise — after Monet
  2. The Starry Night — after Van Gogh
  3. The Persistence of Memory — after Dalí
  4. Travelers Among Mountains & Streams — after Fan Kuan
  5. The Great Wave off Kanagawa — after Hokusai
- Per-painting palette retints the panel background, plaque hue, link
  color, location label, and FlowsTrigger color to fit the active artwork
- Cursor parallax — panel drifts gently with cursor X; the Monet sun
  drifts with cursor Y
- Soft white repaint flash on each cycle
- Indicator dots show position in the cycle
- "click canvas →" hint top-left
- Vertical date stamp ("Après Monet · 1872") on the right edge
- Caption at the bottom names the current painting
- Inline **flows** trigger in Albert's bio works exactly like the Minimal
  one but takes its color from the active painting

### SoundButton (both pages)

- Tiny low-opacity ♪ dot pinned bottom-left; expands on hover into a
  compact "now playing" + skip button
- Hidden YouTube iframe (`yt-player-host`, sized 200×120 and positioned
  off-screen — *not* 0×0 because some browsers mute zero-sized players)
- Auto-skips on `onError` (so a removed/region-blocked video won't stall
  the cycle)
- Exposes `window.toggleSound()` and `window.nextSound()` so any element
  (e.g. the "flows" word) can trigger playback

## Deviations from the design bundle

These are places where the implementation **intentionally differs** from
the original design bundle (`/tmp/design_extract/jings-site-geoffrey/`),
why, and how to revert.

### 1. No theme switcher / multi-theme SPA

- **Original**: a single SPA with a floating pill that toggled between
  Minimal · Web 1.0 · Monet · Terminal, persisted in localStorage.
- **Here**: two standalone pages routed at `/geoffrey` and `/albert`. The
  user explicitly asked for "two different pages" rather than a toggle.
- **How to restore**: pull `App.jsx`, `ThemeAntique.jsx`, and
  `ThemeTerminal.jsx` from the design bundle, plus a single `index.html`
  importing all of them.

### 2. Profile assignment swapped

- **Original**: Minimal, Web 1.0, and Monet all rendered Albert; Terminal
  rendered Geoffrey.
- **Here**: Minimal renders **Geoffrey**, Monet renders **Albert** — per
  the user's explicit request.
- **How to swap back**: change one line each in `ThemeMinimal.jsx`
  (`window.PROFILES.geoffrey` → `albert`) and `ThemeMonet.jsx`
  (`window.PROFILES.albert` → `geoffrey`).

### 3. Geoffrey's "flows" line is newly written

- **Original**: only Albert had the "If I don't respond back on time, you
  can often find me strolling near a body of water listening to some
  **flows**" sentence — that's where the music trigger was wired up.
- **Here**: Geoffrey needed his own bridge sentence. The current one is:
  > "When I'm out on the golf course, deep in work, or doing any form of
  > writing, I'm usually locked in to some **flows**."

  This is **new copy** that doesn't appear in the design bundle.
- **How to fix**: edit `GEOFFREY.flowsLine.{prefix,suffix}` in
  `src/content.jsx`. The trigger word is always **flows**; everything
  around it is yours to change.

### 4. Web 1.0 and Terminal themes are not included

- The original bundle had four themes total. The user asked for only
  Minimal and Monet, so the other two are not built.
- **How to add them back**: copy `ThemeAntique.jsx` and
  `ThemeTerminal.jsx` from the design bundle into `src/`, create
  `geoffrey/antique.html` / `geoffrey/terminal.html` from the same
  template as `geoffrey/index.html`, and pick whichever profile each
  should render.

### 5. Tweaks panel / `contentScale` is removed

- **Original**: a top-right "Tweaks" panel let users scale content from
  80%–200% via the CSS `zoom` property. That panel was tied to the parent
  harness via `postMessage`, which doesn't exist on a real domain.
- **Here**: removed entirely. To resize, edit the `wrap` style in
  `ThemeMinimal.jsx` (`maxWidth`, `padding`) or the `panel` style in
  `ThemeMonet.jsx`.

### 6. Procedural SVG paintings, not real reproductions

- **Original chat**: the user asked for famous paintings (Starry Night,
  Persistence of Memory, etc.). The design assistant tried to fetch real
  images from Wikipedia / Met / Cleveland Museum, all of which CORS-block
  the sandbox, and ended up rendering custom SVG homages.
- **Here**: same approach. The paintings look impressionist-correct in
  palette and composition but are **not** true reproductions of the
  originals — they're stylized homages drawn deterministically from a
  seeded RNG.
- **How to use real images**: drop a JPG/PNG into `twins-site/images/` and
  edit `ThemeMonet.jsx` so the matching `PAINTINGS[]` entry renders
  `<img src=…>` instead of the procedural component. You can mix-and-match.

### 7. YouTube IDs may go stale

- The track IDs in `SoundButton.jsx` (`DEFAULT_TRACKS`) and
  `geoffrey/index.html` (`GEOFFREY_TRACKS`) were verified at the time of
  writing, but YouTube videos can be removed, region-blocked, or
  re-uploaded under different IDs.
- The player **auto-skips** on `onError`, so a broken video won't stall
  the cycle.
- **How to fix a bad track**: replace the `id` with the `?v=…` portion of
  any YouTube URL (`https://youtube.com/watch?v=ABC123` → `id: "ABC123"`).

### 8. Pages render under cdn.babeljs.io, not as compiled bundles

- **Original prototype** used Babel Standalone (in-browser JSX compile).
- **Here**: same — to keep the no-build property the user prefers.
- **Risk**: roughly ~1s of "blank screen" before React boots the first
  time. Acceptable for personal pages, not great for SEO.
- **Production-ready fix**: `npx esbuild src/*.jsx --bundle
  --outfile=src/bundle.js --loader:.jsx=jsx`, then drop the three
  `unpkg.com` script tags in each HTML file and replace with one
  `<script src="../src/bundle.js">`.

### 9. Legacy files left in place

- `twins-site/geoffrey/geoffrey.css` is no longer referenced by the new
  `geoffrey/index.html`. It's kept on disk in case any sub-page (e.g.
  `geoffrey/readings/`) still uses it via a relative path.
- The legacy sub-pages under `geoffrey/{about,favorites,quotes,readings}`
  and `albert/{beliefs,favorites,quotes,writings}` still exist. They are
  **not linked** from the new index pages. If you want the new pages to
  link out to them, add a small "more" nav row in either `ThemeMinimal.jsx`
  or `ThemeMonet.jsx`.

## Things that are implemented exactly as the user asked

- ✅ `/geoffrey` URL still works (routed via `geoffrey/index.html`)
- ✅ `/albert` URL still works (routed via `albert/index.html`)
- ✅ Twins hub at `/` is untouched
- ✅ Minimal page = Geoffrey, Monet page = Albert
- ✅ Hidden "flows" music trigger in body copy on both pages
- ✅ Floating subtle SoundButton on both pages, with track cycling
- ✅ Geoffrey gets his own custom track list (Chinese, Vietnamese, lofi)
- ✅ Collapsible MiniTerminal in Minimal page with all the requested
     commands (`now`, `anticipated`, `derby`, `french open`, `world cup`,
     `nba finals`, `clear`, etc.)
- ✅ Click-to-cycle painting gallery on Monet with 5 distinct artworks
- ✅ Per-painting palette retinting (panel, plaque, flows link, location)
- ✅ Cursor parallax on the Monet panel
- ✅ Sparkline tick divider on Minimal
- ✅ Live SF clock + pulsing dot on Minimal

## Local development

```sh
cd twins-site
python3 -m http.server 8000
# open http://localhost:8000/        ← hub
# open http://localhost:8000/geoffrey
# open http://localhost:8000/albert
```

## Quick troubleshooting

| Symptom                                          | Likely cause                                       | Fix                                       |
|--------------------------------------------------|----------------------------------------------------|-------------------------------------------|
| Page is blank for 1–2s                           | Babel Standalone compiling                         | Expected; pre-compile for production      |
| `flows` link does nothing                        | Browser blocked autoplay until first user gesture  | Click anywhere on the page first          |
| 404 on `../src/content.jsx`                      | Pages opened via `file://` not a server            | Run `python3 -m http.server`              |
| Painting cycle "snaps back" after edit           | Hot-reload re-running `useState(0)`                | Expected during dev                       |
| Geoffrey's bio reads wrong                       | Editing `ALBERT` instead of `GEOFFREY`             | Two separate objects in `content.jsx`     |
| Terminal command shows "command not found"       | Typo or unknown command                            | Type `help` to list valid commands        |
