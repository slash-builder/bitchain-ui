# bitchain-ui

Desktop **inspection tool** for a local `bitchain` v2 content-addressed store —
the GUI companion to the `bitchain` CLI / `storage-kit` engine
(`slash-builder/bitchain`). Read-only by design: it looks at a store, it never
mutates one.

Jira epic: **CLUS-29** ("bitchain-ui v1 desktop inspection tool"). Scope is five
screens. This repo currently holds the **v1 review prototype**; the shipped app
is a Flutter build over the `storage-kit` engine via `flutter_rust_bridge`, not
yet started.

## Status

**Hardened review prototype committed.** Not the shipped app. It exists to make
the five-screen information architecture, the failure states, and the
data-source honesty legible to stakeholders and to the engineer who builds the
real thing.

- Blocked on: `storage-kit` build confirmation, and five CLI capability gaps
  flagged to software-developer (see `demo/index.html` honesty callouts and the
  CLUS-29 record in `context/projects/bitchain.md`).

## The five screens

| Screen | What it shows |
|---|---|
| **Store** | Partitions in the store + sealed packs; drill into a partition detail subview |
| **Block** | Look up one content block by BLAKE3 hash — stored size, codec, pack membership |
| **Verify** | Run a read-only re-hash of a partition; fail-fast fault reporting |
| **History** | The tool's own journal of operations it has run (not a store-side audit log) |
| **Metrics** | Store-wide diagnostic totals — on-disk bytes, partitions, dedup ratio |

Every screen carries its full failure surface: empty, loading, error, and
recovery. A global **engine-unreachable (FFI)** state replaces the whole canvas
when the `storage-kit` bridge fails to initialize — the highest-stakes failure
for an FFI desktop tool.

## Design posture

- **Digital Zen**, consumed not redefined. Tokens are copied verbatim from
  `lockamy-studios/digital-zen` `_tokens.scss` into the prototype's `:root`.
  The Golden Tab is reserved for the single semantic nav marker — never
  borrowed for decorative emphasis.
- **Diagnostic / operator altitude.** This is a dev tool, so engineering
  vocabulary (partition, pack, hash, FFI) is correct here — unlike a consumer
  surface. It still holds the 2026-06-06 "get out of the way" lock: no streaks,
  no "storage saved!" gamification, no engagement counters. These are facts an
  operator reads and leaves.
- **Honesty layer.** Every data point is tagged by source — `[cli]` from a
  shipped command, `[fs]` read from disk, `[tool]` journalled locally, `[gap]`
  not obtainable from the CLI today. The `[gap]` tags are the CLI capability
  findings routed to software-developer.

## Run the prototype

```sh
cd demo
docker build -t bitchain-ui-prototype .
docker run -p 8080:80 bitchain-ui-prototype   # → http://localhost:8080
```

Or just open `demo/index.html` in a browser. The nav switches screens; the
**Prototype state** selector in the rail walks every screen through its
empty / loading / error / fault / engine-unreachable states.

## Verification

Both passes are a precondition for review (`dlockamy/skills/verify-html-prototype.md`):

```sh
python3 verify/verify_contrast.py     # WCAG 2.1 AA — 64/64 pairs pass
# jsdom to a scratch dir, then:
node verify/verify_runtime.js         # runtime walk — 65/65 checks, 0 errors
```

Results and the one contrast fix found are recorded in
`CLUS-29-VERIFICATION.md`. A human screen-reader / real-browser keyboard pass is
still owed to qa-engineer for the shipped build.

## License

Apache-2.0. See `LICENSE`.
