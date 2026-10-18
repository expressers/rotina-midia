# Design: Rotina Mídia

The homepage is a reel being projected. Scroll is the playhead.

## World
- **Ground:** projection-room black `#0b0a09` (`ink`). Film base `#1a1714` (`film`) only under the strip.
- **Text:** warm print white `#f3efe8` (`paper`); secondary `#a7a29a` (`dim`, 7:1 on ink).
- **Accent:** logo red `#bf0811` (`red`) for fields and marks: play buttons, the playhead line, the "/" in Luanda / São Paulo, the WhatsApp button. Small red text uses `#f0464c` (`red-ink`, 5:1 on ink) because `#bf0811` only reaches 3:1.
- One theme (dark). No gradients on type, no glass, no glows beyond the soft red shadow under the showreel play button.
- Corners are square everywhere. Circles only for play buttons.

## Type
- Display: Barlow Condensed 700, uppercase, `line-height: .86`, `letter-spacing: -0.02em` (`.display`). Sizes are viewport-based: hero lines 23vw mobile / 14vw desktop, section titles 9 to 11.5vw.
- Text: Barlow 400/500. Labels: Barlow 500, uppercase, 0.08 to 0.12em tracking, used sparingly.
- Numbers that change (timecode, years, phones) use tabular figures (`.tnum`).
- Fonts are self-hosted via @fontsource (latin subset).

## Logo
- Header uses the horizontal lockup (AFs "variação 2") with the wordmark in `paper` and the mark grading `#bf0811` to `#3d0307` (the original grades to near-black, which disappears on the dark ground).
- Footer and favicon use the mark alone in solid red.

## Ornament
The film strip is the only ornament: perforated bands (`.perfs`, an SVG hole repeated on `film`), and a gate with four corner brackets whose surround is dimmed to 58%.

## Motion
- Lenis smooth scroll (off under reduced motion; touch keeps native scroll).
- Signature: header SMPTE timecode at 24 fps, one frame per 6px of scroll, plus a 1px red playhead showing page progress.
- Hero strip advances with an intermittent pull-down: each frame holds in the gate, then the next is pulled in.
- Work panels pin and stack; the image settles from 1.18 to 1.02 scale on arrival; the outgoing panel sinks 8% and darkens to 75%.
- Filmography: on hover-capable pointers a still follows the cursor on a spring.
- Easing: `cubic-bezier(0.23, 1, 0.32, 1)` for entrances; presses scale to 0.97 in 160ms.
- Reduced motion: strip, parallax and Ken Burns are frozen; fades remain.

## Components
- **Player:** native `<dialog>`, youtube-nocookie embed created on open and removed on close (stops playback). Showreel = playlist of the five featured films.
- **Panel:** full-screen image, title above a 1px centre rule, category and place below, "Ver filme" in a paper button with a red play dot.
- **Filmography:** semantic table grouped by category (`tbody` per group), play button only where a film exists online.
- **Contact:** solid ink card on the behind-the-scenes photo; WhatsApp is the single primary action.

## Imagery
All rasters in `public/img` come from Rotina Mídia's own material: stills from their site CDN (storage.alboom.ninja/sites/6397) and frames from their YouTube uploads (i.ytimg.com). Converted to WebP at 720/1280/1920 widths. `back2black-scope` keeps the original 2.39:1 frame (source is 1280px wide).

---

# Proposta 2: Tempo

A 3D journey told in acts. Same brand world (ink, paper, logo red, Barlow), pushed into a single projection-room black `#000` with grain.

## Story (scroll = camera)
- **Opening** (3.6s, skippable by wheel/touch/key): the mark is built in 3D. The circle is an eclipse (black sphere + red corona, brighter on the left like the logo gradient); the two slices fly in as its motion trail. Title "Da rotina / ao cinema." rises; the 2.39:1 letterbox opens to full frame (the IMAX switch).
- **Through the O**: the camera flies into the eclipse; a white flash cuts to the corridor.
- **I. A rotina**: everyday frames hung along the corridor.
- **II. O olhar**: one big behind-the-scenes screen; credit to Fernando Filó.
- **III. Os filmes**: five big screens, one station each, letterbox returns to scope; "Ver filme" opens the nocookie player.
- **IV. Dois mundos**: Luanda tiles on the floor; São Paulo hinges up and over into the ceiling (Inception fold). The "São Paulo" title turns over with it.
- **V. Vozes**: testimonials as film subtitles in the dark, a second eclipse growing ahead.
- **VI. Fim**: the eclipse, the wordmark, the showreel. Then end credits (filmography) roll by native scroll, and contact is "Próxima cena: a sua."

## Mechanics
- Three.js (vanilla) in `src/p2/scene/Stage.ts`: CatmullRom camera path through stations with eased holds at each station; screens are a custom shader (gate-slit power-on, distance focus/desaturation, slow push-in); UnrealBloom (threshold .82) so only the corona, slices and highlights glow; grade pass with multiplicative grain, vignette, slight chromatic aberration, fade and the white cut.
- GSAP ScrollTrigger (scrub 1.1) maps the 1500vh `#filme` scroll to progress; Lenis runs on the GSAP ticker.
- Overlays are DOM (`data-in`/`data-out` windows on the same progress), so text stays crisp and selectable.
- Act scrubber (I to VI) jumps through the film. Optional WebAudio score (drone + pocket-watch tick that tightens with progress, low hit per act), off by default.
- Reduced motion or no WebGL: `StaticTempo` renders the same story as a flat page.
- Portrait: wider FOV, film screens scaled to 0.56 and faced square-on.
