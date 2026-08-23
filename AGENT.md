# AGENT.md — bitchain-ui

Context for an AI agent working in this repo. Read before editing.

## What this is

`bitchain-ui` is the desktop **inspection tool** for a `bitchain` v2
content-addressed store (Jira epic **CLUS-29**). Read-only companion to the
`bitchain` CLI / `storage-kit` engine at `slash-builder/bitchain`. This repo
currently holds a **review prototype** (`demo/index.html`); the shipped app is a
future Flutter build over `storage-kit` via `flutter_rust_bridge`.

Repo home confirmed by DJ: **`slash-builder/bitchain-ui`** (relocated from
`clusterzer0/bitchain-studio/demo/`, where it lived untracked).

## Ownership boundaries — do not cross

- **Digital Zen tokens are consumed, never defined or forked.** Canonical
  values live in `lockamy-studios/digital-zen` `_tokens.scss`. The `:root` block
  in `demo/index.html` is a verbatim copy with a provenance comment. If you need
  a token that does not exist, that is a finding for industrial-designer /
  creative-director — not a value to invent locally.
- **The Golden Tab** (`--golden-tab`) is reserved for the single semantic nav
  active-marker. Never borrow the gold for decorative emphasis. Progress
  affordances use `--sage-500`, never gold.
- **Screen owns the screen; the CLI/engine owns the data contract.** This tool
  designs against the shipped CLI + `storage-kit` trait surface. Where a screen
  wants data the CLI cannot supply, it is flagged `[gap]` and routed to
  software-developer — it is not faked and not silently read from private
  on-disk format without saying so.

## Register / product posture

- **Diagnostic / operator altitude.** Engineering vocabulary (partition, pack,
  BLAKE3, FFI, codec) is correct here because the audience is a developer or
  operator. This is the opposite of a consumer Quickring surface.
- **"Get out of the way" still applies** (2026-06-06 lock,
  `lockamy-studios/marketing/agents/design-decisions.md`). No streaks, no
  gamified "storage reclaimed!" celebration, no engagement counters. Diagnostic
  facts an operator reads and leaves. No hype words in UI copy.
- **Honesty layer is load-bearing.** Every data point is tagged `[cli] / [fs] /
  [tool] / [gap]`. Do not remove or dilute these — they are how the tool refuses
  to over-promise against the real CLI.

## Failure states are not optional

Every screen ships its empty / loading / error / recovery states, plus a global
**engine-unreachable (FFI)** state that replaces the whole canvas. A flow
without its failure branches is unfinished. The `#state` selector in the rail
walks all of them.

## Verification is a precondition for review

`dlockamy/skills/verify-html-prototype.md`. Two passes, both must be green
before shipping the prototype to review, and both must be re-run after any token
swap or state-machine change:

```sh
python3 verify/verify_contrast.py     # WCAG 2.1 AA contrast
node verify/verify_runtime.js         # jsdom runtime state-machine walk
```

When you add a colour to the CSS, add its pair(s) to `verify_contrast.py`'s
`CHECKS` in the same change. When you add a screen or state, add its walk to
`verify_runtime.js`. Record outcomes in `CLUS-29-VERIFICATION.md`.

## Open blockers (as of 2026-08-23)

- `storage-kit` build confirmation (the trait surface exists in the relocation
  but no clean build has been run).
- Five CLI capability gaps flagged to software-developer — see the `[gap]`
  callouts in `demo/index.html` and the CLUS-29 record in
  `context/projects/bitchain.md`. Screens that depend on them render an honest
  placeholder until the verb exists.

## Workspace rule

Canonical workspace is `~/src/github.com/`. Never write work to the
iCloud-synced `~/Documents/Claude/src/` copy — it has silently reverted and
destroyed session output.
