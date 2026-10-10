# Test plan

## Purpose and test oracle

This plan covers the public Vue 3 tab API, rendered components, utilities, package output, and the inputs that can reach them. The expected results below are acceptance criteria for future tests; they are **not** a claim that every case currently passes. Use `docs/api.md`, `docs/nav.md`, `docs/options.md`, `docs/tabview.md`, and the TypeScript `Tab` interface in `lib/hooks/use-operations.ts` as the current public contract. Where those sources are silent, prefer the safety invariants below and record any failing case as a product defect or an explicit contract decision.

Priorities: **P0** prevents broken tab state, data loss, or script execution; **P1** covers user-visible behavior and recoverable errors; **P2** covers usability, compatibility, and performance. `Unit` means Vitest with Happy DOM; `browser` means a real browser smoke or interaction test; `package` means a test against the built package rather than source files.

## Setup, fixtures, and shared assertions

- Run from the repository root with `pnpm install --frozen-lockfile`. Use `pnpm test`, `pnpm test:coverage`, `pnpm lint`, and `pnpm typecheck` for source/test changes. For package cases also run `pnpm build` and `pnpm publint`. Run `pnpm dev` and `pnpm preview` for playground smoke checks.
- Use a fresh, unique group name per case because `createTabs` stores groups at module scope. For tests that intentionally reuse a name, isolate the module registry first. Unmount wrappers and restore timers, document language, body styles, event listeners, and DOM measurement mocks after each case.
- Base fixture: `a` active and pinned (`closable: false`), `b` and `c` inactive and closable, with simple component views. Removal cases use at least five tabs with mixed closability; the shared seven-tab fixture pins `a`, `d`, and `g`, with consecutive closable tabs `b`, `c`, `e`, and `f`. Vary the active tab to cover survival and fallback behavior. Keep dedicated sole-tab, all-closable, all-pinned, and undefined-group edge cases. Add an empty-group fixture, nested groups (`parent`, `parent.child`, `parent.child.leaf`), and two independent groups. Use a stateful view with mount/unmount counters for cache tests and an iframe view for `hasIframe` tests.
- After every mutating action assert the complete ordered IDs, the active ID, each `active`/`closable` flag, generated `_key`, and the rendered nav/view. For every `remove*` function, preserve the current active tab whenever it survives; choose that function's specified fallback only when the active tab is removed. A nonempty usable group must have exactly one active tab, and a pinned tab must survive close operations. Assert that a rejected action leaves the group and rendered DOM unchanged.
- Use fake timers and advance a controlled `Date.now()` between key-generating actions; use `nextTick()` for Vue updates. Mock `getBoundingClientRect`, client/scroll dimensions, `requestAnimationFrame`, and `DataTransfer` in unit tests. Verify geometry and keyboard behavior in a real browser because Happy DOM cannot prove either.
- Do not render arbitrary supplied components in the XSS fixtures. Test only string titles, tooltip text, and locale strings as untrusted text; `title`, `view`, and their props can intentionally contain application code and remain the consumer's responsibility.

## Public API and tab state

| ID | Priority / layer | Conditions and action | Expected result |
| --- | --- | --- | --- |
| API-01 | P0 / unit | `createTabs` with a normal group, one active tab, and mixed optional flags; read it through both `useTabs` and `useCurrentTab`. | Creation succeeds; the returned array and `useTabs` expose the same reactive tab list; `useCurrentTab` returns the active tab; flags normalize to booleans; each tab has an `id`-based `_key`; caller-owned source objects are not mutated. |
| API-02 | P0 / unit | `createTabs(group, [])`, then `addTab` once. | The active `_` blank tab appears first, then is replaced by the new active tab; no blank tab remains beside a real tab. |
| API-03 | P0 / unit | Create `parent`, then `parent.child` and `parent.child.leaf`; also try creating a group twice, calling `useTabs`/`useCurrentTab` for an unknown group, or creating a child before its full parent path exists. | Nested creation succeeds in order; invalid calls throw a `VueNavTabError` identifying the offending group; existing groups stay intact. For `parent.child.leaf`, both `parent` and `parent.child` must exist. |
| API-04 | P0 / unit | Pass a non-array `tabs`, missing `id`/`title`/`view`, `null` entries, `null`/`undefined` fields, non-string or empty IDs, or duplicate IDs. | Reject invalid fields with a controlled library error before mutating state; no raw `TypeError`. Duplicate IDs are accepted: the later tab replaces the earlier tab completely while retaining the first occurrence’s position; only one tab per ID remains. |
| API-05 | P0 / unit | Initialize zero or multiple `active: true` tabs, including a pinned tab. | With zero active flags, the first tab becomes active; with multiple, the last marked tab stays active and the others become inactive. `useCurrentTab` returns that tab and exactly one view renders. This activation rule is covered by the API suite. |
| API-06 | P1 / unit | Create sibling and nested groups, then use each API on one group. | Only the addressed group changes; another group's IDs, active tab, and rendered view stay unchanged. |
| API-07 | P0 / unit | Add a new inactive tab, then an active tab. | New tabs append; inactive addition preserves current activation; active addition deactivates the prior current tab and activates the new one. |
| API-08 | P0 / unit | `addTab` with an existing inactive ID, then the current active ID, using changed title/view/props. | The tab is replaced in place without a duplicate ID; an ordinary replacement preserves its cache key and a current-tab replacement remains active. |
| API-09 | P1 / unit | Remove a closable tab, then re-add the same ID. | Re-added tab is appended with a new cache key so stale view state is not reused. |
| API-10 | P0 / unit | Add to an unknown group, or pass wrong runtime types for `tab` (including `null`, missing required fields, and wrong field types). | Controlled `VueNavTabError`; no raw `TypeError`, partial insertion, deactivation, or change to other groups. |
| API-11 | P0 / unit | `removeTab` for an unknown ID, a pinned tab, an inactive closable tab, the active middle tab, and the active first tab. | Unknown IDs throw a controlled `VueNavTabError` without changing state; pinned-tab removal is a no-op; removing an inactive tab preserves the current active tab; removing the active tab selects the previous tab, or the next tab if it was first. |
| API-12 | P0 / unit | Remove the sole closable tab; invoke close operations when only the blank or pinned tab remains. | The blank tab is the sole active fallback; repeated close operations do not remove it or throw. |
| API-13 | P0 / unit | `removeAll` with all closable, mixed pinned/closable, and pinned active fixtures. | Only closable tabs are removed; a surviving active pinned tab stays active; if the active tab was removed, activate the first survivor or show the blank fallback. |
| API-14 | P0 / unit | Call `removeLeft`/`removeAbove` and `removeRight`/`removeBelow` on a middle anchor, with closable and pinned tabs on both sides; repeat with the active tab inside the removed range. | Only closable tabs before/after the anchor disappear; above/below match left/right respectively; anchor and pinned tabs survive. If the current tab is removed, the selected anchor becomes active; otherwise current activation stays unchanged. |
| API-15 | P1 / unit | Call each range operation on the first/last anchor, then repeat on an unknown tab ID. | First/last boundary calls leave the group unchanged. Unknown tab IDs throw a controlled `VueNavTabError` and leave the group unchanged. |
| API-16 | P0 / unit | `refreshTab` on current and inactive tabs, including a stateful view, with nested child and similarly prefixed sibling groups (`a.b` and `a.bc`). | Target gets a fresh key; its view remounts with reset local state when shown; nested groups created in the parent view’s `setup()` are recreated on remount with fresh child state; runtime-added child tabs are discarded. Only true descendant groups are invalidated; unrelated sibling groups remain usable. Unknown target throws a controlled error without state change. |
| API-17 | P1 / unit | Observe `useTabs` and `useCurrentTab` through add, replace, reorder, activate, and remove. | Consumers see reactive updates in order, with no stale active reference or missing view. |
| API-18 | P1 / unit | Mount a `KeepAlive` consumer using `onTabActivated`/`onTabDeactivated`, then activate, switch, deactivate, and unmount it. | Hooks fire once for the expected visible tab at the appropriate lifecycle boundary and do not leak callbacks after unmount. |
| API-19 | P0 / unit | Call `removeAll`, `removeLeft`, `removeAbove`, `removeRight`, `removeBelow`, `removeOthers`, and `refreshTab` with an undefined group. | Each call throws a controlled `VueNavTabError`; no other group or rendered view changes. |
| API-20 | P0 / unit | Call `removeOthers` on a middle tab, with closable neighbors and pinned tabs; repeat with an unknown selected ID. | All closable tabs except the selected tab are removed; pinned tabs remain present. If the previously active tab survives, including a pinned tab, it stays active; if it is removed, the selected tab becomes active. An unknown selected ID throws a controlled `VueNavTabError` without changing state. |
| API-21 | P0 / unit | For each of `removeTab`, `removeAll`, `removeLeft`, `removeAbove`, `removeRight`, `removeBelow`, and `removeOthers`, run one case where an active pinned tab survives and another where an active closable tab is removed. | In every survival case the same tab remains active. In every removal case exactly one fallback becomes active according to API-11 through API-14 and API-20; pinned tabs remain present. |

## Rendered navigation and views

| ID | Priority / layer | Conditions and action | Expected result |
| --- | --- | --- | --- |
| UI-01 | P1 / unit + browser | Mount `HTabs` and `VTabs` with the base fixture. | One tab per entry, stable DOM IDs, visible active style, a `tablist`, and the expected horizontal or vertical layout. |
| UI-02 | P1 / unit | Click inactive, already-active, closable, and pinned tabs. Click the close control inside an inactive tab. | Activation moves once; re-click is a no-op; close removes only closable tabs; close click does not also activate its parent tab. Pinned tabs expose no close control. |
| UI-03 | P1 / unit + browser | Exercise `HTabs` `tabs`/`pills`, `top`/`bottom`, rounded true/false, and `VTabs` rounded true/false. | Variant classes and borders match props; vertical offsets and horizontal positioning update after add, close, reorder, and width changes without overlap. Invalid enum props produce a Vue validation warning, not corrupt state. |
| UI-04 | P1 / unit | Render string, component, and VNode titles; pass `titleProps`, `hoverTitle`, and `viewProps`. | Text titles render as text; component titles and views receive their props; tooltip uses `hoverTitle`; a changed view follows the active tab. |
| UI-05 | P0 / unit | Switch between ordinary views with local state, refresh one, then close and re-add its ID. | Normal switching preserves local state through `KeepAlive`; refresh and re-add mount a fresh instance; only the currently active view is visible. |
| UI-06 | P1 / unit + browser | Switch between two `hasIframe` views and an ordinary view; refresh or remove an iframe tab. | Previously visited iframe views stay mounted while hidden; only the current iframe is visible; refresh/re-add replaces stale instance; removed iframe content does not remain visible or retain duplicate instances. |
| UI-07 | P1 / unit | Mount `TabView` for an empty group, then add/remove the last real tab. | Blank view appears only when the blank tab is active; real view renders after add; blank view returns after last close. |
| UI-08 | P1 / browser | Navigate tabs and menu using keyboard alone, including close and Escape; inspect focus and ARIA state. | Controls are reachable and operable without a mouse, visible focus follows interaction, and the active tab is exposed to assistive technology. Treat missing keyboard or ARIA behavior as an accessibility gap to fix; the existing role attributes alone do not satisfy this case. |

## Drag and drop

| ID | Priority / layer | Conditions and action | Expected result |
| --- | --- | --- | --- |
| DND-01 | P1 / unit + browser | Start dragging a tab whose ID contains punctuation or `-tab`. | Transfer payload includes its exact ID and source group; no truncation or ID collision. |
| DND-02 | P1 / unit + browser | Drag over/drop another tab in the same group, the same tab, an empty nav area, and a child element inside a tab. | Valid pair swaps order once per event and preserves active identity; same-tab/outside actions leave order unchanged; child targets resolve to their containing tab. |
| DND-03 | P0 / unit | Drag between two groups or use a mismatched `text/vnt-group` value. | Neither group is reordered by the foreign payload. |
| DND-04 | P0 / unit | Supply missing `dataTransfer`, missing/unknown dragged ID, unknown target ID, malformed DOM ID, or a spoofed same-group payload. | No exception and no insertion of `undefined`, loss of a tab, or cross-group mutation; only IDs present in the addressed group can move. Record any failure as a data-integrity/security defect. |
| DND-05 | P1 / browser | Reorder first-to-last and last-to-first in both nav orientations, then click/close/refresh the moved tab. | Visual order matches model order, hit targets remain aligned, and later operations still address the intended ID. |

## Context menu, localization, and events

| ID | Priority / layer | Conditions and action | Expected result |
| --- | --- | --- | --- |
| MENU-01 | P1 / unit + browser | Right-click first, middle, and last tabs in horizontal and vertical navs. | Menu opens at the pointer, uses left/right or above/below wording as appropriate, and disables impossible edge actions and `Close` for pinned tabs. |
| MENU-02 | P0 / unit | Invoke each menu action on a mixed pinned/closable fixture; invoke a disabled action. | Reload/close/range/others/all dispatch to the matching public operation; disabled action leaves state unchanged. |
| MENU-03 | P1 / unit | Open, then click outside, click an item, press Escape, scroll document/nav, resize, and unmount while open. | Menu closes for each dismissal event; component and document listeners are removed on unmount; no console error or later callback touches an unmounted node. |
| MENU-04 | P1 / browser | Open near each viewport edge and in a scrolled nav. | Menu remains within the visible viewport, does not clip against its nav container, and is focusable without jumping page scroll unexpectedly. |
| MENU-05 | P1 / unit | Install with no locale options, then full custom locale, then switch `<html lang>` among `en`, `vi`, custom, and unknown codes before opening. | Built-in messages are complete; custom messages appear when selected; unknown language falls back to English; changing language is reflected at the next open. |
| MENU-06 | P1 / unit | Omit each required locale key in turn, use a non-string value, or pass an invalid locale object. | Installation rejects with a controlled `VueNavTabError` naming the language/key; default locale data is not mutated. |
| MENU-07 | P0 / unit | Trigger a stale menu action after its tab was removed, or pass an unknown action ID. | No unrelated tab is changed and no uncaught exception occurs; unknown actions are ignored. |
| MENU-08 | P1 / unit | Rapidly reopen and dismiss the menu while scroll events fire; test `debounce` immediate, trailing, cancel, and recursive callback paths with fake timers. | At most the intended callback executes per burst; cancellation prevents pending execution; no timer or listener remains after teardown. |

## Scrollbars and layout boundaries

| ID | Priority / layer | Conditions and action | Expected result |
| --- | --- | --- | --- |
| SCROLL-01 | P1 / unit + browser | For X and Y, test no overflow, exact fit, and content 5× container size; enter/leave with pointer. | Thumb stays hidden without overflow, appears only during hover when needed, and has the expected proportional size. |
| SCROLL-02 | P1 / unit + browser | Click track at start, middle, and end; drag thumb in both directions and release outside the component. | Scroll offset tracks pointer position within the legal range; `mouseup` stops dragging and restores body text selection. |
| SCROLL-03 | P1 / unit | Scroll nav through browser input and resize while thumb is visible. | Thumb position updates on animation frame and remains aligned with actual scroll offset; no stale position after content/viewport changes. |
| SCROLL-04 | P1 / unit + browser | Use zero-width/height measurements, zero scroll extent, negative/out-of-range pointer coordinates, and unmount during a drag. | No `NaN`, `Infinity`, negative thumb size, uncaught exception, stuck global mouse listener, or persistent `user-select: none`. Treat any failure as an edge-case defect. |
| SCROLL-05 | P2 / browser | Open hundreds of tabs, repeatedly reorder/close them, and resize the nav. | Tab order, hit targets, and scroll controls stay correct; capture interaction timing and memory before/after repeated cycles to spot growth or long stalls. |

## Security and robustness

These are library boundary tests. They do not attempt to sanitize consumer-supplied Vue components or an iframe's remote content.

| ID | Priority / layer | Conditions and action | Expected result |
| --- | --- | --- | --- |
| SEC-01 | P0 / unit + browser | Use `<img src=x onerror=...>`, `<script>`, quotes, and HTML entities in string `title`, `hoverTitle`, and locale labels. | They render as inert text/attribute values; no element from the payload is created, no handler runs, and no script executes. |
| SEC-02 | P0 / unit | Use `__proto__`, `constructor`, `prototype`, `toString`, dotted variants, and an inherited-property object as group and locale keys. | No prototype pollution or mutation of `Object.prototype`; another group's/locale's data cannot be overwritten. Unsafe names are rejected cleanly or stored as own data keys without special behavior. |
| SEC-03 | P0 / unit | Pass a malformed or forged drag payload containing unknown IDs, another group's IDs, or delimiter-like text. | Order and tab count stay intact; no arbitrary index or foreign group is accessed. |
| SEC-04 | P0 / unit | Call all public operations with invalid runtime values through `as unknown as` to bypass TypeScript. | Controlled rejection or safe no-op per API contract; no raw property-access exception, partial state change, or executable DOM insertion. |
| SEC-05 | P1 / browser | Repeatedly open/close menu, drag thumbs, mount/unmount navs, and refresh views. | Global listeners, timers, detached view nodes, and body style changes return to baseline; interaction does not degrade after repeated cycles. |
| SEC-06 | P1 / package | Inspect packed artifacts and test imports from an isolated consumer. | Beyond package metadata, readme, and license, only declared `dist/` and `types/` files ship; no test fixtures, source maps with secrets, absolute workspace paths, or unexpected runtime dependencies are included. |

## Package and compatibility checks

| ID | Priority / layer | Conditions and action | Expected result |
| --- | --- | --- | --- |
| PKG-01 | P0 / package | Build, run `pnpm publint`, inspect ESM, CJS, UMD, declarations, CSS, and font paths; import each declared export path from a temporary consumer. | Declared entry points resolve; Vue stays external; CSS/fonts load relative to the package; declarations resolve; UMD exposes `VueNavTab`; no missing file or accidental source import. |
| PKG-02 | P0 / package + browser | Install the packed package beside Vue 3.2.x and the repository's current Vue version in isolated consumers. Mount all three exported components and call each public API. | No missing Vue helper/runtime error; basic add/switch/close/view flow works at the documented Vue 3.2+ floor. Keep fixture syntax compatible with Vue 3.2 (no `<script setup>` or `defineModel`). |
| PKG-03 | P1 / browser | Smoke the playground through `pnpm dev` and built `pnpm preview`; test representative current Chromium, Firefox, and WebKit browsers at narrow and wide widths. | Navigation, menus, dragging, overflow, and views work without console errors or clipping. Record browser/version and viewport for each result. |
| PKG-04 | P1 / automation | Run `pnpm test:coverage`, `pnpm lint`, and `pnpm typecheck` after test implementation. | All tests pass; coverage meets configured minimums (80% statements, lines, functions; 70% branches); lint reports zero problems; all three TypeScript configurations pass. |

## Implementation order and completion record

1. Add P0 cases around tab invariants and hostile inputs first, then P1 interaction/cleanup cases, then browser/package checks. Put API, drag, menu, component, scrollbar, locale, and utility cases beside the existing matching files in `tests/`; create a separate consumer fixture only for package checks.
2. For each case record **pass/fail**, command or browser/version, observed result, and issue link. A failing proposed safety or accessibility criterion is a product gap; do not weaken its expected result to match current behavior without updating the public contract.
3. Release gate: no open P0 failures; all existing and new automated tests green; coverage and lint/typecheck/build/publint gates green; Vue 3.2 consumer smoke passes. Track P1/P2 exceptions explicitly with an owner and follow-up issue.


### Progress — 2026-10-05

| Suite | Status | Evidence / next action |
| --- | --- | --- |
| Public API and tab state — `tests/use-operations.test.ts` | Passed | `pnpm test tests/use-operations.test.ts`: 1 test file passed, 91 tests passed. Includes duplicate replacement, initial activation, nested refresh/recreation, mixed seven-tab removal fixtures, and unknown-ID rejection. |
| Rendered navigation and views — `tests/components.test.ts` | 25 passed / 1 failed; browser checks pending | Focused review on 2026-10-07: 26 component cases; open iframe props stay stale after replacement (COMP-01 below). UI-08 and browser portions of UI-01/03/06 remain unverified. |
| Drag and drop; context menu/localization; scrollbars; security; package/compatibility | Pending review | Continue in the section order above; existing test files alone do not establish completion of these acceptance criteria. |

The API result records the implemented test suite, not exhaustive coverage of every condition in API-01 through API-21. Broader acceptance criteria remain subject to coverage review. No lint, typecheck, coverage, browser, or package gates were run for this documentation update. The API run emitted the existing Vite native config-loader warning; it did not fail the suite.

### Component review — 2026-10-07

Scope: `tests/components.test.ts` and the `TabView.vue` iframe-cache fix for COMP-01. Fixtures use unique groups, real mounted navigation/views, stateful views with lifecycle counters, real `about:blank` iframe elements, controlled time for generated keys, and restored measurement mocks. The iframe fixture attaches to the document so Happy DOM computed visibility includes ancestor `display: none`; teardown removes its host.

| Case | Status | Observed result / remaining check | Issue |
| --- | --- | --- | --- |
| UI-01 | Unit pass; browser pending | Both orientations expose a tablist, stable ordered IDs and exactly one active class; rendered view follows activation. Real layout remains unverified. | None filed |
| UI-02 | Pass | Both orientations activate inactive/pinned tabs; re-click preserves tab object identity; closing an inactive tab preserves activation; active close selects the survivor; pinned tabs have no close control. Ordered IDs, active/closable flags, keys and rendered nav/view are asserted. | None |
| UI-03 | Unit pass; browser pending | Four horizontal combinations covering every pair of appearance/position/rounded values, defaults, both vertical rounded values, invalid enum warnings, add/close/reorder offsets, and title-driven measured width changes pass. CSS-only/viewport width changes, borders as painted and overlap still need browser checks. | None filed |
| UI-04 | Pass | Both orientations render string/component/VNode titles and receive updated title props, tooltip and ordinary-view props. Selecting a different component view works. String title/tooltip payloads remain inert (partial SEC-01; locales remain separate). Updating an already-open iframe tab receives the replaced props without remounting. | COMP-01 |
| UI-05 | Pass | Ordinary view state and node identity survive switching. Both ordinary views retain their independent local state; active/inactive refresh and close/re-add create fresh local state and expected keys. Only the current ordinary view is rendered. | None |
| UI-06 | Unit pass; browser pending | Visited iframe views retain nodes/state while hidden; ordinary state survives an iframe round trip; refresh/re-add replaces the old instance without duplicates; replaced props update the open iframe view without remounting. Reloading an inactive iframe through its menu preserves selection and resets the iframe on revisit. Closing hides removed content and shows the fallback. Actual iframe browsing-context preservation remains a browser check. | COMP-01 |
| UI-07 | Pass | Both nav orientations render the blank tab without a close control; first add shows the real view; clicking the last real tab’s close icon restores the sole active blank tab and blank view. | None |
| UI-08 | Pending | Keyboard-only interaction, focus and ARIA behavior require the planned browser review; role assertions do not establish accessibility compliance. | None filed |

Earlier verification before this focused revision (historical, not a result for the current suite): `pnpm test` → 6 files / 150 tests passed, including 28 component tests; `pnpm test:coverage` → 150 passed, statements 92.9%, branches 82.01%, functions 88.8%, lines 94.57%; `pnpm lint` → exit 0, no problems; `pnpm typecheck` → exit 0 for all three configurations. The existing Vite native config-loader warning remains. No browser or package checks were run, so this is not release-gate completion. That earlier run did not exercise COMP-01. Pending browser cases have no issue/owner assigned yet.


#### Focused user-journey review — 2026-10-07

The suite now has 26 cases. Existing scenarios were strengthened instead of adding every possible permutation: click nested title/close targets, re-click the selected tab, close an inactive tab without switching to it, close the last real tab, retain independent local state, and receive changed application props. Layout reorder now uses a DOM drop event rather than directly rearranging the array. The default-style assertions are part of the initial render tests; four horizontal configurations cover each pair of variant values. The hook test now focuses on its unique assertion: leaving the tab area fires the consumer’s deactivation callback once. Switching callbacks remain covered by `tests/use-operations.test.ts`, which was not changed in this pass. Existing typed-string/XSS and invalid-enum checks cover unsafe display text and mistyped configuration. No clicks are dispatched to removed controls or nonexistent pinned-tab close buttons.

Current command: `pnpm test tests/components.test.ts` → **26 passed (26 total)**. Full gates also run: `pnpm test` → 6 files / 148 tests passed; `pnpm test:coverage` → statements 93.29%, branches 83.43%, functions 90.22%, lines 95.04%; `pnpm lint` → exit 0, no problems; `pnpm typecheck` → exit 0 for all three configurations. The existing Vite config-loader warning is unchanged. Pending browser cases have no issue/owner assigned yet.

**COMP-01 — P1, fixed (no external issue filed):** `UI-04/06: updates an open iframe view when the app replaces its props` now passes. `TabView.vue` uses `watchEffect` to sync the live tab object into the iframe cache on every activation: same-id entries are evicted and the current tab pushed, so an `addTab` replacement with unchanged `_key` updates the cached entry and the keyed `v-for` patches props without remounting the existing iframe. Verified with the component suite (26/26) and the full gates above. This unblocks marking UI-04/06 complete; only the browser checks remain.
