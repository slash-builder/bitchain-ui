# CLUS-29 — bitchain-ui v1 prototype verification record

Artifact: `demo/index.html` (single-file `nginx:alpine`-servable review
prototype). Scripts: `verify/verify_contrast.py`, `verify/verify_runtime.js`.
Method: `dlockamy/skills/verify-html-prototype.md`. Run: 2026-08-23, ux-engineer.

## 1. WCAG 2.1 AA contrast — `verify/verify_contrast.py`

**64/64 meaningful pairs pass** after one fix (see below). Palette is the
Digital Zen `_tokens.scss` values copied verbatim into the prototype's `:root`
(consumed, not re-derived). Body text checked at 4.5:1, large text and UI
components/borders at 3:1.

**One AA failure found and fixed.** The honesty-layer provenance pill
`.src.cli` (sage-500, 10px) renders not only on warm-white cards but inside
`.callout` blocks (stone-100). On stone-100 it clocked **4.22:1** — below the
4.5 body-text floor. The prototype's own inline comments had reasoned about the
pill on warm-white only and missed the callout surface.

Fix: pinned `.src { background: var(--warm-white); }` so every provenance pill
renders on warm-white regardless of container (card / callout / legend), where
sage-500 clears at 4.73:1. This consumes an existing token — no fork, no new
value. The pill's outer border was then re-checked as a 3:1 component boundary
against each container it floats over; all pass.

Tightest passing margins to watch on any future token change:
- `sage-500` on `sage-200` (chip.ok dot marker) — **3.31:1** (component, min 3).
- `sage-500` on `ink` (btn.primary focus outline) — **3.57:1** (component).
- `sage-500` on `stone-200` (spinner arc) — **3.69:1** (component).
- `stone-500` on `warm-white` (kv/metric labels, placeholder) — **4.62:1** (body).
- `sage-500` on `warm-white` (src.cli text, ghost focus) — **4.73:1** (body).
- `error` on `stone-100` (src.gap border on callout) — **4.74:1** (component).

Any of these is a real pass with thin headroom; do not darken the surface or
lift text sizes past these without re-running the pass.

## 2. Runtime state-machine walk — `verify/verify_runtime.js`

**65/65 checks pass, zero uncaught script errors** end to end (jsdom,
`runScripts: 'dangerously'`). Covered:

- Boot: no errors, Store is the default active destination, populated content.
- Nav: all five destinations reachable, each sets `aria-current` and renders.
- Full screen × state matrix (Store/Block/Verify/History/Metrics ×
  loading/empty/error/[fail]/data) renders non-empty.
- State-specific copy markers for every empty/loading/error/fault state.
- Global engine-unreachable (FFI) state replaces **every** screen's canvas.
- Drill path: Store → partition detail → Block, and Back to the Store list.
- Zero-entry partition renders the reclaimed-content empty state (not an error).
- Block lookup and Verify-run async transitions resolve correctly.
- Engine retry clears the engine-down canvas.
- A11y structure: real `<button>` nav (5), labelled primary nav,
  keyboard-focusable partition rows, `prefers-reduced-motion` honoured.

## 3. Still needs a human pass (not automatable here)

- Screen-reader walkthrough (VoiceOver / NVDA) — jsdom does not evaluate AT.
- Real-browser keyboard operation and visible focus order.
- Real-browser rendering / font metrics (jsdom does no layout).

Route these to qa-engineer for the shipped Flutter build; jsdom verified logic
and wiring only.
