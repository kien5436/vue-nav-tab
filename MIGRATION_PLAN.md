# vue-nav-tab 2.6.0 — pnpm + Vite migration, Vue 3.2–3.5 compatibility

Audience: any AI agent or engineer executing this migration. This document is the single source of
truth. Read it fully before touching the repo. Keep the Status, Verification log and Deviations
sections updated as you go.

How to prove each phase: [`MIGRATION_VERIFICATION.md`](./MIGRATION_VERIFICATION.md) holds the
copy-paste gate commands, the expected output for each of them, the Vue compatibility probe, and the list of known non-failures. Run the gates there; record results here.

## Status

| Phase | Scope | State |
| --- | --- | --- |
| 0 | Branch setup + this document | done (commit `e92d379`) |
| 1 | pnpm migration | done (commit `e92d379`) |
| 2 | Toolchain migration: Vite 8, TypeScript 5.9, ESLint 9 | gate green, commit pending |
| 3 | Codebase, tests, CI, docs, release 2.6.0 | not started |

Rule: a phase ends only when its gate is green and exactly one commit exists for it. Never start phase N+1 with a red gate at phase N.

## Git workflow (binding)

- Before touching anything: `git fetch --all --prune`, confirm the base branch is not behind
  `origin`, confirm a clean working tree, and confirm there are no unresolved conflicts. Report and
  stop if any check fails.
- Never work on `master`/`main`. Work happens on `chore/pnpm-vite-vue3-compat`, branched from
  `master` (`git switch -c chore/pnpm-vite-vue3-compat master`). `master` is read-only here.
- All three phase commits land on that branch. No push, PR, tag, or merge into `master` unless the user explicitly asks. If a PR is requested later, it targets `master`, must be rebased on the then-current `origin/master`, and must re-run the full gate suite before merge.
- If `master` moves during the work, integrate it into the branch and re-run the current phase gate.

## Verified starting state (2026-09-19, before any change)

- Git: `master` = `origin/master` = `9a8822a` (v2.5.1); `origin/dev` = `b9dc5f2` (v2.5.0), one
  release behind; clean tree; `git fetch --all --prune` reported nothing new.
- Toolchain: `vue@^3.2.31` (yarn lockfile → 3.2.31), `@vue/compiler-sfc` → 3.2.29,
  `typescript@4.5.5`, `rollup@2.67.2`, `eslint@7.32.0`, `@vue/cli-service@5.0.0-rc.2`;
  package manager declared as `yarn@4.7.0`; no `node_modules/`.
- The legacy build is already broken regardless of Vue version: `rollup-plugin-typescript2@0.31.2` matches no `.ts` files under micromatch 4, so `rollup -c` dies with `Unexpected token` on
  `lib/index.ts`. There is no green baseline to preserve.
- `tsc 5.9` over `lib/` reports 3 errors at `lib/index.ts:12-14`: `string | undefined`
  (`HTabs.name`, `VTabs.name`, `TabView.name`) passed to `app.component`.
- All 15 SFCs in `lib/` + `src/` compile cleanly under `@vue/compiler-sfc` 3.0.0 / 3.2.31 / 3.4.38 /
  3.5.43 — the source is already 3.0-compatible.
- ESLint 9 + `eslint-config-pk@2` + `eslint-plugin-vue@10` + `typescript-eslint@8` against the
  current source: 374 errors / 152 warnings (231 quotes, 38 curly, 22 eol-last,
  14 no-underscore-dangle, 9 no-prototype-builtins, remainder Vue formatting).
- `pnpm import` is not usable: it refuses while `packageManager` names yarn and it does not read
  Yarn Berry lockfiles (it produced no lockfile). Phase 1 is therefore a fresh `pnpm install`.
- Published `vue-nav-tab@2.5.1` tarball = 25 files: `dist/index.common.js`, `dist/index.es.js`,
  `dist/vue-nav-tab.umd.js`, `dist/vue-nav-tab.css`, `dist/fonts/{vp.svg,vp.ttf,vp.woff}`,
  `types/index.d.ts`, `types/**/*.vue.d.ts`, `LICENSE`, `README.md`, `package.json`. Every JS bundle
  starts with the banner block (`vue-nav-tab v2.5.1` / `@author` / `@link` / `@license MIT`).

## Goal and success criteria

Goal: publish `vue-nav-tab` from pnpm, built by Vite 8 on a current TypeScript/ESLint toolchain, and prove at runtime and type level that the package works in any Vue 3.2+ project (3.2 → 3.5).

Success criteria:

- `pnpm install --frozen-lockfile` is reproducible.
- `pnpm lint` and `pnpm typecheck` report zero problems.
- `pnpm build` reproduces the exact 2.5.1 artifact set plus `dist/index.mjs`.
- `publint` is clean and `pnpm pack` contains exactly the frozen surface.
- Vitest passes with 80% statements/lines/functions and 70% branches.
- The packed tarball installs and renders in a consumer app on Vue 3.2.0 → 3.5.43 in CI.

## Public packaging contract (must hold after phase 2)

| Field / path | Value |
| --- | --- |
| `main` | `dist/index.common.js` (unchanged) |
| `module` | `dist/index.es.js` (unchanged) |
| `unpkg` / `jsdelivr` | `dist/vue-nav-tab.umd.js` (unchanged) |
| `types` | `types/index.d.ts` (unchanged) |
| `exports["."]` | `types: ./types/index.d.ts`, `import: ./dist/index.mjs`, `require: ./dist/index.common.js`, `default: ./dist/index.es.js` |
| `exports["./style.css"]` | `./dist/vue-nav-tab.css` (new alias) |
| `exports["./dist/vue-nav-tab.css"]` | `./dist/vue-nav-tab.css` (documented in `docs/quick-start.md:18`) |
| `exports["./dist/*"]`, `exports["./package.json"]` | pass-through |
| `files` | `dist/`, `types/` — this plan file is never published |
| `sideEffects` | `["**/*.css"]` |
| `peerDependencies` | `vue: ^3.2.0` (raised from `^3.0.0`; the bundles require 3.2 runtime helpers) |

`dist/index.mjs` exists because `dist/index.es.js` is ESM syntax inside a package without
`"type": "module"`, so Node would treat it as CJS. No runtime API, export name, prop, or CSS class
changes in 2.6.0.

## Execution protocol

- pnpm only. Never run `npm install`, `yarn`, or add a lockfile other than `pnpm-lock.yaml`. The
  published manifest gets no `engines` field (it would warn consumers on Node 18); document Node
  ≥20.19 for contributors instead.
- Verify every claim with real command output; no asserting from memory. Record commands and
  results in Verification log.
- Approved deletions for this plan: `yarn.lock`, `.yarnrc.yml`, `.yarn/`, `rollup.config.js`,
  `babel.config.js`, `vue.config.js`, `.eslintrc.js`, `public/index.html`. Keep `postcss.config.js`
  (Tailwind stays). Delete nothing else without asking the user.
- If a gate exposes a real incompatibility, apply the smallest source fix inside the current phase
  and append it to Deviations with evidence.

## Phase 1 — pnpm migration (commit 1)

1. `package.json`: set `"packageManager": "pnpm@10.32.1"`; rewrite scripts to pnpm
   (`prepublishOnly: pnpm build`); pin every direct devDependency to the exact version resolved in
   `yarn.lock` so this phase stays version-neutral (read resolutions before deleting the lockfile).
2. Delete `yarn.lock`, `.yarnrc.yml`, `.yarn/`; run `pnpm install`; commit `pnpm-lock.yaml`. If
   pnpm 10 reports ignored build scripts, list exactly those packages under
   `pnpm.onlyBuiltDependencies` and reinstall.
3. Gate (no build can be green in this phase — the legacy build is already broken):
   - `pnpm install --frozen-lockfile` succeeds twice in a row.
   - `pnpm lint` behaves exactly as before the swap (same eslint 7 output).
   - `pnpm exec rollup -c` still fails; capture that output once in Deviations so nobody mistakes it
     for a regression.
4. Commit message: `chore!: migrate package manager from yarn to pnpm`.

## Phase 2 — toolchain migration (commit 2)

Pins: `vite@8.3.0`, `@vitejs/plugin-vue@6.0.9`, `vue@3.5.43`, `vue-tsc@3.3.11`,
`typescript@5.9.3`, `tailwindcss@3.4.19`, `postcss@^8.5`, `autoprefixer@^10.4`, `eslint@^9`,
`eslint-config-pk@2.0.0`, `eslint-plugin-vue@10.11.0`, `typescript-eslint@8.70.0`,
`vue-eslint-parser`, `@eslint/js`, `publint`. Remove `rollup` + the 7 `rollup-plugin-*` packages,
`@typescript-eslint/*@5`, and `eslint-config-pk@1`.

- `vite.config.ts`: library build, `entry: lib/index.ts`, `name: "VueNavTab"`,
  `formats: ["es","cjs","umd"]`; `fileName` maps es → `dist/index.es.js`, cjs →
  `dist/index.common.js`, umd → `dist/vue-nav-tab.umd.js`; `cssFileName: "vue-nav-tab"`;
  `external: ["vue"]`; UMD global `vue → Vue`; `build.target: "es2015"` to match the previous ES6
  output; `rollupOptions.output.banner` reproducing the published header verbatim;
  `output.assetFileNames: "fonts/[name][extname]"` so fonts land in `dist/fonts/`.
- Strip the `?vkbuum` cache-busting query from the `@font-face` URLs in `lib/style.css` so Vite
  emits `dist/fonts/vp.{svg,ttf,woff}` instead of hashed names. Emitted CSS may use `./fonts/...`
  where 2.5.1 used `fonts/...` — accepted cosmetic difference.
- `scripts/postbuild.mjs`: copy `dist/index.es.js` → `dist/index.mjs` and assert the required
  artifact set exists (fail loudly if Vite renames anything). `pnpm build` =
  `vite build && node scripts/postbuild.mjs`.
- TypeScript: root `tsconfig.json` for editor/tests (`moduleResolution: bundler`,
  `types: ["vite/client"]`, drop `webpack-env`, keep `strict`); `tsconfig.node.json` for
  `vite.config.ts`; `tsconfig.build.json` with `rootDir: lib`, `declarationDir: types`,
  `emitDeclarationOnly` so `vue-tsc` regenerates `types/index.d.ts` + `types/**/*.vue.d.ts`. Add
  `lib/style.css.d.ts` so the emitted `import "./style.css"` line in `types/index.d.ts` resolves for
  consumers. `typecheck` = `vue-tsc --noEmit` over lib/src/tests + `vue-tsc -p tsconfig.build.json`.
- ESLint 9 flat `eslint.config.mjs` extending `eslint-config-pk@2`, then run `pnpm lint --fix`
  repo-wide and adopt pk 2 formatting fully (single quotes, `curly`, `eol-last`, sorting). The ~526
  expected findings are accepted churn in this commit.
- Minimal behavior-preserving source fixes required for green gates: literal component names in
  `lib/index.ts` (`app.component("HTabs", HTabs)` etc.), `obj.hasOwnProperty(k)` →
  `Object.hasOwn(obj, k)` at the 7 flagged sites, and a scoped lint exception for the `_key` naming
  convention. No other source edits in this phase.
- Gate: `pnpm lint` 0 problems; `pnpm typecheck` clean; `pnpm build` emits exactly the 2.5.1
  artifact set plus `dist/index.mjs`; `pnpm publint` clean.
- Commit message: `chore: migrate from rollup to vite`.

## Phase 3 — codebase, tests, CI, docs, release (commit 3)

- Playground: replace vue-cli with Vite — add root `index.html` loading `/src/main.ts`, keep `src/`
  and `public/`, delete `vue.config.js`, `babel.config.js`, `public/index.html` and the
  `@vue/cli-*`, `core-js`, `vue-cli-plugin-tailwind`, `@types/webpack-env`, `cross-env`
  dependencies. Scripts: `dev: vite`, `preview: vite preview`.
- Vitest 4.1.11 + `@vitest/coverage-v8` + `@vue/test-utils` 2.5.1; `vitest.config.ts` with
  `environment: happy-dom` and coverage thresholds 80 statements / 80 lines / 80 functions /
  70 branches, excluding only `lib/shims-vue.d.ts` and `lib/style.css.d.ts`.
- Unit tests: `use-operations` store semantics (create/activate, add, removeTab/All/Left/Right/
  Above/Below/Others with boundary cases, refreshTab, activation hooks), drag-and-drop reorder,
  `mergeWithDefaultLocales` precedence, `debounce`, `error`.
- Component tests: HTabs/VTabs render from a group, active-tab switching and emitted events,
  `TabView` active vs `BlankTabView` fallback, context menu open/close (scroll-dismiss, disabled
  item no-op, keyboard/screen-reader attributes), close/refresh interactions, with explicit
  element-measurement stubs for the scrollbar components.
- Dist-artifact suite: import `dist/index.mjs` (ESM), `require` `dist/index.common.js` (CJS), run
  `dist/vue-nav-tab.umd.js` in a `vm` context with a `Vue` global; assert each entry installs the
  plugin and registers `HTabs`/`VTabs`/`TabView`; assert `dist/vue-nav-tab.css` references
  `fonts/vp.*` and `types/index.d.ts` exists.
- Consumer fixture (`scripts/verify-package.mjs`): `pnpm pack` → install the tarball into a fixture
  app → Vite build + Vitest mount importing `vue-nav-tab`, `vue-nav-tab/style.css` and the legacy
  `vue-nav-tab/dist/vue-nav-tab.css` path → assert rendered DOM and a clean `tsc --noEmit`.
- CI `.github/workflows/ci.yml`: `pnpm/action-setup` driven by `packageManager` +
  `actions/setup-node` with pnpm store cache and `--frozen-lockfile`; job A on Node 22 runs lint,
  typecheck, `vitest --coverage`, build, publint; job B runs the packed-tarball fixture against Vue
  3.2.0, 3.2.47, 3.3.13, 3.4.38, 3.5.43 plus a non-blocking `3.6.0-rc.9`; triggers are
  pushes to non-`master` branches and pull requests targeting `master`; `concurrency` with
  cancel-in-progress. Tests and fixtures must avoid `<script setup>` and `defineModel` — the 3.2
  floor is enforced by the matrix, not by lint.
- Docs and release: add `docs/compatibility.md` (3.2 floor, tested matrix, entrypoints) and link it
  in `docs/_sidebar.md`; update `docs/installation.md` and `docs/quick-start.md` to lead with pnpm
  and the `vue-nav-tab/style.css` import; add the 2.6.0 entry to `docs/changelog.md`; replace the
  hardcoded "build-passing" README badge with the real CI badge; bump `version` to `2.6.0`; set
  `prepublishOnly: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm verify:package`.
- Add root `AGENTS.md`: pnpm-only rule, branch-first/no-work-on-master rule, phase order, pointer to
  this file.
- Gate: `lint`, `typecheck`, `test`, `build`, `publint`, `verify:package` all green; update Status
  and Verification log here.
- Commit message: `feat: support any vue 3 project, vite playground, tests and ci`.

## Test plan / acceptance criteria

- Unit and component suites pass at the coverage thresholds above; `use-operations` boundary cases
  (remove on a one-tab group, out-of-range index, unknown group/id) are explicitly covered.
- Dist suite proves all three bundles load and register components, the UMD global is `VueNavTab`,
  and CSS plus fonts exist at the documented paths.
- Packed-tarball fixture proves `exports`, `types`, and both CSS specifiers resolve for a real
  consumer on every Vue version in the matrix.
- `publint` clean, and the `pnpm pack` file list equals the frozen 2.5.1 surface + `dist/index.mjs`.
- This document contains branch/remote state at start, per-phase status, exact commands, observed
  results, and a Deviations log.

## Assumptions and known tradeoffs

- Binding order: fetch/verify first, branch off `master`, then pnpm, then tooling, then
  code/tests/CI. Phase 2 source edits are limited to what lint/typecheck/build require.
- ~~Vue 3.0 was assumed to be the hard support floor~~ **Decided 2026-09-20: the floor is Vue 3.2.**
  The probe in [`MIGRATION_VERIFICATION.md`](./MIGRATION_VERIFICATION.md) §9 shows that
  `createElementBlock` / `createElementVNode` / `guardReactiveProps` do not exist before Vue 3.2.0,
  so the effective floor is 3.2 — the same as the already-published 2.5.1. `peerDependencies.vue`
  is therefore `^3.2.0`; 3.6 release candidates remain observed but non-blocking.
  Never lower the support floor by rewriting compiled output by hand.
- Repo-wide reformatting churn from adopting `eslint-config-pk@2` is accepted and isolated to phase
  2's commit.
- `types/index.d.ts` gains a resolvable `style.css` shim; if the `lib/style.css` import is ever
  removed, that shim goes with it.
- This file stays in the repo permanently for future agents and is never published to npm or the
  docsify site (`files` is limited to `dist/` and `types/`).

## Verification log

Format: `command` → observed result.

- `git fetch --all --prune` → no new refs; `master` = `origin/master` = `9a8822a`; `origin/dev` =
  `b9dc5f2`; working tree clean.
- `git switch -c chore/pnpm-vite-vue3-compat master` → branch created from `9a8822a`.
- Legacy lockfile version extraction from `yarn.lock` → used to pin phase 1 devDependencies
  (vue 3.2.31, @vue/compiler-sfc 3.2.29, typescript 4.5.5, rollup 2.67.2, eslint 7.32.0,
  eslint-plugin-vue 8.4.1, tailwindcss 3.4.17, …).
- `git fetch --all --prune` (phase 2 start) → no new refs; `master` = `origin/master` = `9a8822a`;
  branch `chore/pnpm-vite-vue3-compat` is `e92d379`, one commit ahead of `master`, no conflicts.
- `pnpm lint` (`eslint . --fix`) → first run 12 errors / 4 warnings, all in toolchain config or
  known-shape source: `.ts` files had no TypeScript parser (12 parse errors), `scripts/postbuild.mjs`
  had 4 `no-await-in-loop` warnings (rewritten to sync `node:fs`), `lib/**` had `_close`/`_tabs`
  naming hits. Second run → **0 problems**.
- `pnpm typecheck` → `vue-tsc --noEmit` (lib/src), `vue-tsc --noEmit -p tsconfig.node.json`
  (`vite.config.ts`), `vue-tsc -p tsconfig.build.json` (declaration emit into `types/`) all pass.
- `pnpm build` → `✓ built in 403ms`; emits exactly `dist/index.common.js`, `dist/index.es.js`,
  `dist/index.mjs`, `dist/vue-nav-tab.umd.js`, `dist/vue-nav-tab.css`, `dist/fonts/vp.{svg,ttf,woff}`
  and prints `build artifacts verified: …`. All four bundles start with the exact 2.5.1 banner
  (`vue-nav-tab v2.5.1` / `@author` / `@link` / `@license MIT`); CSS references
  `url(./fonts/vp.{ttf,woff,svg})`.
- `pnpm publint` → exit 0. Two residual warnings documented in Deviations.
- 2026-09-20: `peerDependencies.vue` raised `^3.0.0` → `^3.2.0` (user decision); `docs/installation.md`,
  `README.md` (install section) and `docs/changelog.md` updated to state the 3.2 floor; CI matrix in
  phase 3 narrowed to 3.2.0 → 3.5.43. Re-ran `pnpm install` + full phase 2 gate after the change.

## Deviations

- Legacy build is broken before this migration begins: `rollup-plugin-typescript2@0.31.2` matches no
  `.ts` files under micromatch 4 → `rollup -c` fails with `Unexpected token` on `lib/index.ts`.
  Reproduced in a throwaway sandbox. Consequence: phase 1 has no green build gate; the build becomes
  green only in phase 2. Do not treat that failure as a regression introduced by the pnpm swap.

### Phase 2

- **Vite always inlines library assets.** In Vite 8 lib mode `shouldInline()` returns `true`
  unconditionally, so `assetsInlineLimit: 0` is ignored and the `@font-face` files would be emitted
  as data URIs. Fix: the `?no-inline` query (Vite's documented opt-out) on the three URLs in
  `lib/style.css`, and `output.assetFileNames` routing font extensions to `fonts/[name][extname]`.
  Result: `dist/fonts/vp.{svg,ttf,woff}` exist as real files again.
- **Banner is injected by `scripts/postbuild.mjs`.** The library minifier keeps a leading comment
  only in the `es` output, so `output.banner` alone cannot reproduce the published header in the
  `cjs`/`umd` bundles. The script prepends the verbatim banner where it is missing and fails loudly
  if any bundle still lacks it.
- **`base: "./"`.** Vite's default `base: "/"` rewrites CSS asset URLs to `/fonts/…`; the library
  CSS must stay relative to itself (`./fonts/…`, was `fonts/…` in 2.5.1 — accepted cosmetic change).
- **`exports` shape.** `default` resolves to `./dist/index.mjs` instead of `./dist/index.es.js`.
  `dist/index.es.js` is ESM syntax in a package without `"type": "module"`, which publint flags as
  CJS-interpreted; `import`/`require`/`module`/`main` are unchanged, so no consumer-visible entry
  point moved. Residual publint warnings (publint still exits 0):
  1. `exports["."].import.types` points at `types/index.d.ts`, which TypeScript reads as CJS-flavored.
     Clearing it needs an ESM `.d.mts` twin tree for every emitted declaration; zero runtime effect,
     deferred past 2.6.0.
  2. `exports["./dist/*"]` lets consumers deep-import `dist/index.es.js` (`.js` = CJS interpretation).
     Kept on purpose: the wildcard preserves 2.5.1's deep-import ability, `publint` rejects only the
     alternative of narrowing it.
- **`lib/style.css` needs a `style.css.d.ts` shim.** `types/index.d.ts` keeps the side-effect
  `import "./style.css"` from the entry; `scripts/postbuild.mjs` copies `lib/style.css.d.ts` into
  `types/` so consumers resolve that specifier.
- **`pnpm.ignoredBuiltDependencies`.** pnpm 10 refuses to run install scripts for `core-js`,
  `docsify` and `yorkie` and warns on every install. None of the three is needed here (`core-js` and
  `docsify` only print notices, `yorkie` has no `gitHooks` config), so they are listed under
  `pnpm.ignoredBuiltDependencies` instead of `onlyBuiltDependencies`. Verified on a fresh
  `node_modules`: `pnpm install --frozen-lockfile` reports no ignored-script warning.
- **Additional minimal source fixes** beyond the plan's list, each required by a gate:
  `ContextMenuAction` interface exported from `lib/hooks/use-contextmenu.ts` and typed with
  `PropType` in `lib/components/ContextMenuList.vue` (was implicit `any[]`), `titleProps`/`viewProps`
  widened to `Record<string, unknown>`, `createTabRef` in `lib/components/HTabs.vue` accepting
  `Element | ComponentPublicInstance | null`, `Ref<Tab[]>` annotation in `lib/components/TabView.vue`
  (TS2742), `i--, len--` comma expressions split into statements in `lib/hooks/use-operations.ts`
  (`no-unused-expressions`), and `_close`/`_tabs` added to the scoped
  `no-underscore-dangle` allow list (with `allowFunctionParams: true` for the `_tab` callbacks).
  No documented behavior changes.
