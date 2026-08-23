// Runtime state-machine walk for bitchain-ui review prototype (CLUS-29).
// Loads the prototype in jsdom, drives it with real DOM events, asserts on
// rendered markup. Verifies wiring + state reachability, not layout.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] ||
  path.join(process.env.HOME, 'src/github.com/slash-builder/bitchain-ui/demo/index.html');
const html = fs.readFileSync(FILE, 'utf8');

let pass = 0, fail = 0;
const errors = [];
function ok(cond, label) {
  if (cond) { pass++; console.log('[PASS] ' + label); }
  else { fail++; console.log('[FAIL] ' + label); }
}

const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.detail || e.message || e)));

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
});
const win = dom.window, doc = win.document;
win.addEventListener('error', e => errors.push('window error: ' + e.message));

const $ = s => doc.querySelector(s);
const $$ = s => Array.from(doc.querySelectorAll(s));
const main = () => $('#main');
const mainHTML = () => main().innerHTML;
const has = t => mainHTML().indexOf(t) >= 0;

function setState(v) {
  const sel = $('#state');
  sel.value = v;
  sel.dispatchEvent(new win.Event('change'));
}
function nav(screen) { $('[data-open="' + screen + '"]').click(); }
const wait = ms => new Promise(r => win.setTimeout(r, ms));

(async () => {
  // 1. Boot clean, default screen + state
  ok(errors.length === 0, 'boot: no script errors on load');
  ok(main() && mainHTML().length > 0, 'boot: main canvas renders non-empty');
  ok($('[data-open="store"]').getAttribute('aria-current') === 'page',
     'boot: Store is the active nav destination');
  ok(has('Partitions'), 'boot: default screen is Store (populated)');

  // 2. Nav rail: every destination reachable, marks aria-current
  const screens = ['store', 'block', 'verify', 'history', 'metrics'];
  const marker = { store: 'Partitions', block: 'Block', verify: 'Verify',
                   history: 'Operations', metrics: 'Total on disk' };
  for (const s of screens) {
    setState('data'); nav(s);
    ok($('[data-open="' + s + '"]').getAttribute('aria-current') === 'page',
       'nav: ' + s + ' becomes active destination');
    ok(has(marker[s]), 'nav: ' + s + ' renders its populated content');
  }

  // 3. Every screen x every applicable state renders non-empty, no errors
  const stateMatrix = {
    store:   ['loading', 'empty', 'error', 'data'],
    block:   ['loading', 'empty', 'error', 'data'],
    verify:  ['loading', 'empty', 'error', 'fail', 'data'],
    history: ['loading', 'empty', 'error', 'data'],
    metrics: ['loading', 'empty', 'error', 'data'],
  };
  for (const s of screens) {
    for (const st of stateMatrix[s]) {
      nav(s); setState(st);
      ok(mainHTML().replace(/\s/g, '').length > 40,
         'state: ' + s + ' / ' + st + ' renders non-empty');
    }
  }

  // 4. State-specific markers (empty/loading/error/fail are the whole point)
  nav('store'); setState('loading'); ok(has('role="status"') || has('spinner'),
     'store/loading shows a spinner status');
  nav('store'); setState('empty');   ok(has('No partitions yet'), 'store/empty copy present');
  nav('store'); setState('error');   ok(has('Store root not found'), 'store/error copy present');
  nav('verify'); setState('fail');   ok(has('Fault found') && has('pack_content_hash mismatch'),
     'verify/fail shows the fault + exact reason');
  nav('block'); setState('error');   ok(has('Not found'), 'block/error copy present');
  nav('history'); setState('empty'); ok(has('No operations yet'), 'history/empty copy present');
  nav('metrics'); setState('empty'); ok(has('Empty store'), 'metrics/empty copy present');

  // 5. Global engine-unreachable (FFI) replaces EVERY screen
  for (const s of screens) {
    nav(s); setState('offline');
    ok(has('Engine unreachable') && has('Storage engine did not load'),
       'offline: engine-unreachable canvas replaces ' + s);
  }

  // 6. Store -> partition detail -> block drill path
  setState('data'); nav('store');
  ok($$('[data-open-partition]').length === 2, 'store: two partition rows are clickable');
  $$('[data-open-partition]')[0].click();
  ok(has('Manifest entries') && has('← All partitions'),
     'partition detail: renders entries + back control');
  ok($$('[data-open-block]').length > 0, 'partition detail: manifest rows are clickable to Block');
  $$('[data-open-block]')[0].click();
  ok($('[data-open="block"]').getAttribute('aria-current') === 'page' && has('In packs'),
     'block: opened from a manifest row');

  // 7. Back from partition detail returns to Store list
  setState('data'); nav('store'); $$('[data-open-partition]')[0].click();
  $('[data-open="store"].btn, .btn[data-open="store"]') // back button is a .btn ghost
    ? $('.btn[data-open="store"]').click() : null;
  ok(has('Partitions') && !has('← All partitions'), 'back: returns to Store list from detail');

  // 8. Empty-partition subview: a partition with zero manifest entries is a
  //    real inspectable state, not an error. Exercise the renderer directly.
  const api = win; // renderers are globals in the inline script
  ok(typeof api.renderPartitionDetail === 'function', 'renderPartitionDetail is defined');
  const emptyHTML = api.renderPartitionDetail('__does_not_exist__');
  // (falls back to first partition, which has entries) — instead assert the
  // zero-entry branch via a crafted partition through the live STORE object:
  const saved = api.STORE.partitions[1].manifestEntries;
  api.STORE.partitions[1].manifestEntries = [];
  const zero = api.renderPartitionDetail(api.STORE.partitions[1].id);
  ok(/No entries in this partition/.test(zero),
     'partition detail: zero-entry partition shows reclaimed-content empty state');
  api.STORE.partitions[1].manifestEntries = saved;

  // 9. Block lookup button re-renders to data
  nav('block'); setState('empty');
  ok(has('No hash entered'), 'block/empty precondition');
  $('[data-lookup]').click();
  ok(has('In packs'), 'block: Look up resolves to a populated block');

  // 10. Verify run button: data -> loading -> resolves back to data (async)
  nav('verify'); setState('data');
  $('[data-run-verify]').click();
  ok(has('Verifying') || has('role="status"'), 'verify: Run shows loading immediately');
  await wait(900);
  ok(has('Verified') && has('exit 0'), 'verify: resolves to a pass after the async read');

  // 11. Engine retry button re-renders (async back to data)
  setState('offline');
  ok(has('Retry connection'), 'offline: retry control present');
  $('[data-retry-engine]').click();
  await wait(900);
  ok(!has('Storage engine did not load'), 'offline: retry clears the engine-down canvas');

  // 12. reduced-motion + a11y structural checks
  ok(html.indexOf('prefers-reduced-motion') >= 0, 'a11y: prefers-reduced-motion honoured in CSS');
  nav('store'); setState('data');
  ok($$('button.dest').length === 5, 'a11y: nav destinations are real <button>s (5)');
  ok($('nav[aria-label="Primary"]') !== null, 'a11y: primary nav is labelled');
  ok($$('[data-open-partition][tabindex="0"]').length === 2,
     'a11y: partition rows are keyboard-focusable');

  // 13. No script errors accumulated across the whole walk
  ok(errors.length === 0, 'walk: zero uncaught script errors end to end'
     + (errors.length ? ' -> ' + errors.join(' | ') : ''));

  console.log('\n' + pass + '/' + (pass + fail) + ' checks pass, ' + fail + ' fail');
  if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
  process.exit(fail || errors.length ? 1 : 0);
})();
