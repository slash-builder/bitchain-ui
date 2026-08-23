#!/usr/bin/env python3
# WCAG 2.1 AA contrast pass for bitchain-ui review prototype (CLUS-29).
# Palette copied from the prototype's :root, which is copied verbatim from
# lockamy-studios/digital-zen _tokens.scss. Consumed, not redefined.
import sys

P = {
    "warm-white": "#FDFCFA", "stone-50": "#FAF9F7", "stone-100": "#F2EFE9",
    "stone-200": "#E5E0D8", "stone-300": "#CCC5B9", "stone-400": "#A89E8E",
    "stone-500": "#7D7168", "stone-600": "#5A5049", "stone-700": "#3D3630",
    "ink": "#1E1A16", "stone-900": "#161310",
    "sage-500": "#4D7D44", "sage-400": "#6D9E63", "sage-200": "#C8DBC1",
    "golden-tab": "#F5C842", "golden-dark": "#C9A020",
    "error": "#C0392B",
}

def lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def lum(hexc):
    h = hexc.lstrip('#')
    r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

def ratio(fg, bg):
    a, b = lum(P[fg]), lum(P[bg])
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)

T, L, C = 4.5, 3.0, 3.0  # body, large text, UI component

CHECKS = [
    # --- Nav rail (bg ink) ---
    ("warm-white", "ink", T, "rail brand title (18px 600)"),
    ("stone-400", "ink", T, "rail brand sub (11px mono)"),
    ("stone-300", "ink", T, "rail dest label (14px)"),
    ("stone-300", "ink", T, "rail dest icon glyph"),
    ("stone-300", "stone-900", T, "rail dest label on hover bg"),
    ("warm-white", "stone-700", T, "rail dest label active bg"),
    ("golden-tab", "ink", C, "Golden Tab active-marker border on rail"),
    ("stone-400", "ink", T, "rail scenario label (10px)"),
    ("warm-white", "stone-700", T, "rail scenario select text (12px)"),
    ("stone-400", "stone-700", C, "rail scenario select border"),
    ("stone-400", "ink", T, "rail scenario note (11px)"),
    ("sage-400", "ink", C, "focus outline on rail dest"),
    # --- Main canvas (bg stone-50) ---
    ("ink", "stone-50", L, "screen-head h2 (26px display)"),
    ("stone-600", "stone-50", T, "screen-head paragraph"),
    ("stone-600", "stone-100", T, "inline .cmd code chip text (12px)"),
    ("stone-600", "stone-50", T, "legend text (11px)"),
    # --- Card (bg warm-white) ---
    ("ink", "warm-white", T, "card h3 (16px)"),
    ("stone-700", "warm-white", T, ".mono / .hash body (12.5px)"),
    ("stone-600", "warm-white", T, ".muted body"),
    ("ink", "warm-white", T, "td body text"),
    ("stone-600", "warm-white", T, "th uppercase label (11px)"),
    ("stone-600", "warm-white", T, ".annot note (11px)"),
    ("stone-500", "warm-white", T, "kv dt label (11px)"),
    ("stone-500", "warm-white", T, "metric .k label (11px)"),
    ("ink", "warm-white", L, "metric .v value (30px)"),
    ("stone-600", "warm-white", T, "metric .u unit (13px)"),
    # --- Chips ---
    ("stone-700", "sage-200", T, "chip.ok text (12px)"),
    ("sage-500", "sage-200", C, "chip.ok dot marker"),
    ("error", "warm-white", T, "chip.err text (12px)"),
    ("error", "warm-white", C, "chip.err border"),
    ("stone-600", "warm-white", T, "chip.neutral text (12px)"),
    ("stone-500", "warm-white", C, "chip.neutral border"),
    ("stone-700", "stone-100", T, "chip.leaf text (12px)"),
    ("stone-700", "stone-100", T, "chip.list text (12px)"),
    # --- Buttons ---
    ("warm-white", "ink", T, "btn.primary label (13px)"),
    ("warm-white", "stone-700", T, "btn.primary label hover"),
    ("sage-500", "ink", C, "btn.primary focus outline"),
    ("ink", "warm-white", T, "btn.ghost label (13px)"),
    ("stone-500", "warm-white", C, "btn.ghost border"),
    ("sage-500", "warm-white", C, "btn.ghost focus outline"),
    # --- Search ---
    ("ink", "warm-white", T, "search input value text (13px)"),
    ("stone-500", "warm-white", C, "search input resting border"),
    ("stone-500", "warm-white", T, "search input placeholder"),
    ("sage-500", "warm-white", C, "search input focus border/outline"),
    # --- State blocks (bg warm-white inside card) ---
    ("stone-600", "warm-white", T, "state-block body text"),
    ("stone-500", "warm-white", L, "state-block glyph (26px)"),
    ("ink", "warm-white", T, "state-block h3 (18px)"),
    ("error", "warm-white", T, "state-block.error h3 (18px, non-bold => body)"),
    ("sage-500", "stone-200", C, "spinner active arc on track"),
    ("stone-700", "stone-100", T, "reason block mono text (12px)"),
    # --- Honesty-layer src tags on warm-white card ---
    ("stone-600", "warm-white", T, "src base text (10px)"),
    ("stone-500", "warm-white", C, "src base border"),
    ("sage-500", "warm-white", T, "src.cli text (10px)"),
    ("sage-500", "warm-white", C, "src.cli border"),
    ("error", "warm-white", T, "src.gap text (10px)"),
    ("error", "warm-white", C, "src.gap border"),
    # --- src tags render inside callout (stone-100) and legend (stone-50) too,
    # but .src background is pinned to warm-white, so the pill always sits on
    # warm-white regardless of container. Verify the pill's OUTER border against
    # each container it floats over (component boundary, 3:1). ---
    ("stone-500", "stone-100", C, "src base outer border on callout bg"),
    ("sage-500", "stone-100", C, "src.cli outer border on callout bg"),
    ("error", "stone-100", C, "src.gap outer border on callout bg"),
    ("stone-500", "stone-50", C, "src base outer border on legend bg"),
    ("sage-500", "stone-50", C, "src.cli outer border on legend bg"),
    # --- Callout (bg stone-100) ---
    ("stone-700", "stone-100", T, "callout body text (12.5px)"),
    ("ink", "stone-100", T, "callout <b> emphasis"),
    ("stone-600", "stone-100", C, "callout left accent bar (stone-600)"),
]

fails = 0
passes = 0
for fg, bg, mn, ctx in CHECKS:
    r = ratio(fg, bg)
    ok = r >= mn
    if ok:
        passes += 1
    else:
        fails += 1
    tag = "PASS" if ok else "FAIL"
    print(f"[{tag}] {r:5.2f}:1 (min {mn}) {fg} on {bg} — {ctx}")

print(f"\n{passes}/{len(CHECKS)} pass, {fails} fail")
sys.exit(1 if fails else 0)
