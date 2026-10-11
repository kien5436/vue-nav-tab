# Migration verification guide — vue-nav-tab (pnpm + Vite)

Audience: any AI agent or engineer who must prove that the migration described in
[`MIGRATION_PLAN.md`](./MIGRATION_PLAN.md) is correct. The plan explains *what* changes and in which
order; this guide explains *how to prove it with real output*. Re-run the gates before claiming any
phase is green. Never report a gate as passing from memory or from an older run.

## 0. Ground rules

- **pnpm only.** Never `npm install`, `yarn`, `bun`, or a second lockfile. `pnpm-lock.yaml` is the
  only lockfile that may exist.
- **Never work on `master`/`main`.** Work happens on `chore/pnpm-vite-vue3-compat`.
- **Fetch before you touch anything** and confirm there are no conflicts with `origin`.
- **Quote real output.** If a command was not run in this session, say so.
- All commands assume the working directory is the repository root.

## 1. What "the migration passes" means

Each phase has its own gate. A phase is done only when its gate is green **and** exactly one commit
exists for it.

| Phase | Scope | Gate commands | State |
| --- | --- | --- | --- |
| 0 | Branch + plan document | `git log --oneline -3` | done (`e92d379`) |
| 1 | yarn → pnpm | `pnpm install --frozen-lockfile` | done (`e92d379`) |
| 2 | Rollup → Vite 8, TS 5.9, ESLint 9 | `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm publint` | gate green, **commit pending** |
| 3 | Tests, CI, docs, 2.6.0 | `pnpm test`, `pnpm test:coverage` | not started |

There is **no test suite yet**. `pnpm test` does not exist until phase 3, so "the migration passes"
today means: reproducible install, lint clean, types clean, build emits the frozen artifact set,
`publint` exits 0, and a packed tarball works in a fresh
consumer project.

## 2. Prerequisites

| Requirement | Value used to verify | Check |
| --- | --- | --- |
| Node | 25.8.1 (documented floor: ≥ 20.19) | `node -v` |
| pnpm | 10.32.1 (pinned in `packageManager`) | `pnpm -v` |
| Network | required on the first install | `pnpm install` must not print `ENOTFOUND` |
| No foreign lockfiles | `yarn.lock`, `package-lock.json`, `.yarn/` must not exist | `ls yarn.lock package-lock.json .yarn 2>/dev/null` |

Enable the pinned pnpm through corepack (preferred) or a global install:

```bash
corepack enable && corepack prepare pnpm@10.32.1 --activate
# or
npm i -g pnpm@10.32.1
```

Always prefix non-interactive commands with `CI=true`. pnpm 10 aborts with
`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` when it needs to replace `node_modules` without a TTY.

## 3. Pre-flight — run this first, every session

```bash
git fetch --all --prune
git branch --show-current                                  # expect: chore/pnpm-vite-vue3-compat
git status --short
git log --oneline -3
git log --oneline --left-right --count master...origin/master   # expect: 0	0
```

Stop and report instead of continuing if any of these holds:

- `master` is behind `origin/master` (someone pushed; rebase the branch and re-run the gate).
- You are on `master`/`main`.
- The tree contains edits you did not make and cannot attribute to the current phase.
- `git status` shows conflict markers or a half-finished merge/rebase.

## 4. One-shot gate

Copy-paste block that runs the whole phase 2 gate. Each step must succeed; the script stops at the
first failure.

```bash
set -e
cd /Users/kien/workspace/vue-nav-tab

CI=true pnpm install --frozen-lockfile
CI=true pnpm lint
CI=true pnpm typecheck
CI=true pnpm build
find dist -type f | sort
CI=true pnpm publint
```

Expected: no lockfile changes, `eslint` prints nothing after its banner, two `vue-tsc` invocations
and one declaration emit print nothing, Vite prints `✓ built in …` plus
`build artifacts verified: …`, `dist` lists 8 files, and `publint` exits 0 with exactly two
warnings (section 10).

## 5. Phase 1 gate — pnpm

```bash
CI=true pnpm install --frozen-lockfile   # run twice; expect "Done in …" and an unchanged lockfile
git diff --stat pnpm-lock.yaml           # expect: no output
ls yarn.lock .yarnrc.yml .yarn 2>/dev/null   # expect: nothing
```

Phase 1 was intentionally shipped without a green build: the legacy Rollup build was already broken
before the package-manager swap (`rollup-plugin-typescript2@0.31.2` matches no `.ts` files under
micromatch 4). See Deviations in the plan. Do not treat that as a regression.

## 6. Phase 2 gate — toolchain

### 6.1 Install

```bash
CI=true pnpm install --frozen-lockfile
```

Expected: `Done in …`, no edit to `pnpm-lock.yaml`, and **no** "Ignored build scripts" warning
(`core-js`, `docsify`, `yorkie` are listed under `pnpm.ignoredBuiltDependencies`).

### 6.2 Lint

```bash
CI=true pnpm lint
```

Expected: only the script banner and `eslint . --fix`. Zero problems. `--fix` writes files, so run
`git status --short` afterwards: the file list must not change from the pre-run list.

### 6.3 Typecheck

```bash
CI=true pnpm typecheck
```

Expected: three invocations (`vue-tsc --noEmit`, `-p tsconfig.node.json`, `-p tsconfig.build.json`)
with no diagnostics. The third regenerates `types/`, which is gitignored.

### 6.4 Build

```bash
CI=true pnpm build
find dist -type f | sort
```

Expected artifact set — exactly 8 files, no hashed font names:

```
dist/fonts/vp.svg
dist/fonts/vp.ttf
dist/fonts/vp.woff
dist/index.common.js
dist/index.es.js
dist/index.mjs
dist/vue-nav-tab.css
dist/vue-nav-tab.umd.js
```

The build must also print `build artifacts verified: index.common.js, index.es.js, index.mjs,
vue-nav-tab.umd.js, vue-nav-tab.css, fonts/vp.svg, fonts/vp.ttf, fonts/vp.woff`. `scripts/postbuild.mjs`
fails loudly if Vite renames or drops anything.

Spot-check the two packaging invariants:

```bash
head -4 dist/index.common.js                 # banner: vue-nav-tab v2.5.1 / @author / @link / @license MIT
for f in dist/index.common.js dist/index.es.js dist/index.mjs dist/vue-nav-tab.umd.js; do
  grep -c 'vue-nav-tab v2.5.1' "$f" | sed "s|^|$f banner lines: |"
done
grep -o 'url([^)]*)' dist/vue-nav-tab.css    # expect url(./fonts/vp.{svg,ttf,woff})
```

### 6.5 Package hygiene

```bash
CI=true pnpm publint
```

Expected: `Running publint v0.3.24 for vue-nav-tab...`, exit code 0, two warnings and three
suggestions — all documented in section 10. Warnings are not failures; a non-zero exit is.

## 7. Packaging surface — what consumers receive

```bash
rm -f /tmp/vue-nav-tab-2.5.1.tgz
pnpm pack --pack-destination /tmp
tar -tzf /tmp/vue-nav-tab-2.5.1.tgz | sort
```

Expected: **27 entries** — the frozen 2.5.1 surface (25) plus `package/dist/index.mjs` and
`package/types/style.css.d.ts`:

```
package/LICENSE
package/README.md
package/package.json
package/dist/index.common.js
package/dist/index.es.js
package/dist/index.mjs
package/dist/vue-nav-tab.css
package/dist/vue-nav-tab.umd.js
package/dist/fonts/vp.svg
package/dist/fonts/vp.ttf
package/dist/fonts/vp.woff
package/types/index.d.ts
package/types/style.css.d.ts
package/types/components/*.vue.d.ts        (9 files)
package/types/hooks/*.d.ts                 (3 files)
package/types/utils/*.d.ts                 (2 files)
```

`MIGRATION_PLAN.md`, this guide, `src/`, `lib/` and `scripts/` must **not** appear: `files` is
limited to `dist/` and `types/`.

## 8. Consumer smoke test — packed tarball in a fresh Vue app

This is the strongest end-to-end proof: it exercises `exports`, `types`, both CSS specifiers, and a
real Vite build against Vue 3.5.

```bash
FIX=/tmp/vnt-consumer-check
rm -rf "$FIX" && mkdir -p "$FIX"
cd /Users/kien/workspace/vue-nav-tab && pnpm pack --pack-destination "$FIX"
```

Create the fixture (files below), then install and build:

```bash
cd "$FIX" && pnpm init >/dev/null
pnpm add vue@3.5.43 vite@8.3.0 @vitejs/plugin-vue@6.0.9 vue-tsc@3.3.11 typescript@5.9.3 ./vue-nav-tab-2.5.1.tgz
pnpm exec vue-tsc --noEmit && echo "typecheck OK"
pnpm exec vite build 2>&1 | tail -6
```

Creating the files before or after `pnpm init` makes no difference; `pnpm init` only writes
`package.json`.

`index.html`

```html
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>vnt-consumer</title></head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`vite.config.ts`

```ts
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [vue()] });
```

`tsconfig.json`

```json
{
  "compilerOptions": {
    "lib": ["ES2021", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2020"
  },
  "include": ["src/**/*", "vite.config.ts"]
}
```

`src/main.ts` — imports both the JS entry and both CSS specifiers.

```ts
import { createApp } from 'vue';
import VueNavTab from 'vue-nav-tab';
import 'vue-nav-tab/style.css';
import 'vue-nav-tab/dist/vue-nav-tab.css';   // legacy deep specifier, must still resolve

import App from './App.vue';

createApp(App).use(VueNavTab).mount('#app');
```

`src/App.vue`

```vue
<script lang="ts">
import { defineComponent } from 'vue';
import { HTabs, TabView, VTabs, createTabs } from 'vue-nav-tab';

export default defineComponent({
  components: { HTabs, TabView, VTabs },
  setup() {
    const tabs = createTabs('consumer', [
      { active: true, id: 'home', title: 'Home', view: { template: '<p>home</p>' } },
      { id: 'about', title: 'About', view: { template: '<p>about</p>' } },
    ]);

    return { tabs };
  },
});
</script>

<template>
  <div>
    <HTabs group="consumer" :tabs="tabs" />
    <TabView group="consumer" />
  </div>
</template>
```

Expected:

```
typecheck OK
dist/index.html                  0.30 kB │ gzip:  0.22 kB
dist/assets/vp-DeTzUwDU.svg      0.87 kB │ gzip:  0.42 kB
dist/assets/index-C7R-95Q7.css  14.01 kB │ gzip:  3.82 kB
dist/assets/index-BnnF4-6r.js   89.14 kB │ gzip: 32.74 kB
✓ built in 255ms
```

The hashes change between runs; the file set does not. A `dist/assets/vp-*.svg` and a `~14 kB` CSS
chunk containing the component styles prove both CSS specifiers resolved.

**API gotcha:** a group must be created with `createTabs(group, tabs)` (or `addTab`) before the
components render it. Passing only `:tabs` throws `VueNavTabError: Group '<g>' is undefined` — that
is documented behaviour, not a migration bug.

## 9. Vue compatibility floor

The build imports `createElementBlock`, `createElementVNode`, `normalizeClass`, `normalizeStyle` and
`guardReactiveProps` from `vue`. These do not exist before Vue 3.2.0, in either the CJS/ESM entry or
`@vue/runtime-core`'s bundler entry.

| Vue | helpers present | `import('vue-nav-tab')` (Node ESM) |
| --- | --- | --- |
| 3.0.11 | no | fail — `Named export 'createElementBlock' not found` |
| 3.1.5 | no | fail — same |
| 3.2.0 | yes | ok, 18 exports |
| 3.5.43 | yes | ok, 18 exports |

This is **pre-existing**: the published `vue-nav-tab@2.5.1` bundle imports the same helpers and fails
identically on 3.0/3.1. The effective floor is therefore Vue **3.2**, and `peerDependencies` now
declares `^3.2.0` (decision recorded in section 12).

Re-run the probe (do it outside the repo so the repo's own `vue` version is not used):

```bash
mkdir -p /tmp/vnt-floor && cd /tmp/vnt-floor && pnpm init >/dev/null
cp /Users/kien/workspace/vue-nav-tab/dist/index.mjs ./vnt-new.mjs
for v in 3.0.11 3.1.5 3.2.0 3.5.43; do
  echo "=== vue $v ==="
  pnpm add vue@$v 2>&1 | tail -1
  node -e 'const V=require("vue");const n=["createElementBlock","createElementVNode","normalizeClass","normalizeStyle","guardReactiveProps"];console.log("  missing:",n.filter(k=>!(k in V)).join(", ")||"none")'
  node --input-type=module -e 'try{const m=await import("./vnt-new.mjs");console.log("  esm import: OK,",Object.keys(m).length,"exports")}catch(e){console.log("  esm import: FAIL ->",(e.message||"").split("\n")[0])}'
done
```

## 10. Known non-failures

Do not "fix" these; they are accepted and documented in the plan's Deviations section.

| Observation | Why it is expected |
| --- | --- |
| `publint` warning: `exports["."].import.types` is CJS-flavored | Clearing it needs an ESM `.d.mts` declaration twin; no runtime effect, deferred past 2.6.0 |
| `publint` warning: `exports["./dist/*"]` interpreted as CJS | Kept on purpose so 2.5.1 deep imports keep working |
| `publint` suggestions: no `type`, no `engines.node`, short repo URL | Intentionally not applied; adding `engines` would warn consumers |
| `dist/index.mjs` exists in addition to `dist/index.es.js` | Publint-safe `default`/`import` target; `main`/`module`/`unpkg` are unchanged |
| `types/style.css.d.ts` is shipped | Makes the retained `import "./style.css"` in `types/index.d.ts` resolvable |
| CSS uses `url(./fonts/…)` where 2.5.1 used `url(fonts/…)` | Cosmetic; required because Vite's default `base` is absolute |
| Font files are emitted via a `?no-inline` query in `lib/style.css` | Vite 8 library mode always inlines assets, ignoring `assetsInlineLimit` |
| SSR render of `HTabs` logs `Unhandled error during execution of watcher callback` | The tab-measurement watcher needs DOM refs that SSR never provides; phase 3 test scope |
| `pnpm install` prints nothing about ignored build scripts | `core-js`, `docsify`, `yorkie` are listed under `pnpm.ignoredBuiltDependencies` |
| An empty `.pnpm-store/` skeleton appears in the repo root | Created by a sandboxed install with a restricted store; git ignores it (no files). Safe to `rm -rf .pnpm-store` |

## 11. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` | pnpm needs a TTY to replace `node_modules`; prefix commands with `CI=true` |
| `ENOTFOUND` / `EAI_AGAIN` on install, then an empty `node_modules` | No network (sandbox or offline). Re-run the install outside the sandbox — the lockfile is authoritative, nothing is lost |
| `sh: eslint: command not found` (or `vite`, `vue-tsc`) | `node_modules` is empty/incomplete: run `CI=true pnpm install --frozen-lockfile` |
| `TypeError: Cannot read properties of undefined (reading '$el')` in SSR | Same class of issue as the SSR watcher above: `HTabs` needs DOM measurement. Test via a browser/consumer build, not `renderToString` alone |
| Dev server crashes with an ESLint `extensions` option error | `@vue/cli-plugin-eslint` passes a removed ESLint 9 option; `vue.config.js` deliberately sets `lintOnSave: false` until phase 3 deletes vue-cli |
| `vue-tsc: command not found` only in a fixture | Install the fixture's own devDependencies and invoke through `pnpm exec`, not a bare binary |

## 12. Decision recorded (2026-09-20)

Option 1 adopted: `peerDependencies.vue` is now `^3.2.0`, matching the verified floor. The CI matrix
for phase 3 is 3.2.0, 3.2.47, 3.3.13, 3.4.38, 3.5.43 (plus non-blocking `3.6.0-rc.9`).

`@vue/compiler-sfc` 3.5 has no mode that emits 3.0-era helper names, so "support 3.0/3.1" is not
reachable without hand-writing a render-function layer — that is out of scope for 2.6.0.

## 13. Last full run

Record of the most recent complete gate run. Re-run section 4 and update this table rather than
trusting it.

| Item | Value |
| --- | --- |
| Date | 2026-09-20 |
| Branch | `chore/pnpm-vite-vue3-compat` (`e92d379`, 1 commit ahead of `master`) |
| Node / pnpm | 25.8.1 / 10.32.1 |
| `pnpm install --frozen-lockfile` | pass — `Done in 421ms`, lockfile unchanged |
| `pnpm lint` | pass — 0 problems |
| `pnpm typecheck` | pass — 3 configurations, no diagnostics |
| `pnpm build` | pass — `✓ built in 434ms`, 8 artifacts verified |
| `pnpm publint` | pass — exit 0, 2 warnings + 3 suggestions (section 10) |
| `pnpm dev` | pass — `Compiled successfully in 812ms`, `http://localhost:8080/` → HTTP 200, `id="app"` |
| `pnpm pack` | pass — 27 files (section 7) |
| Consumer fixture (Vue 3.5.43 + Vite 8.3.0) | pass — `vue-tsc --noEmit` clean, `vite build` green |
| Vue floor probe | 3.0.11 fail, 3.1.5 fail, 3.2.0 ok, 3.5.43 ok |
| Phase 2 commit | **pending user approval** |

### 13.1 Re-run after the 3.2 floor decision (2026-09-20, same day)

Change under test: `peerDependencies.vue` `^3.0.0` → `^3.2.0`, install/consumer docs, changelog
`Unreleased` entry, plan-doc updates. No source, toolchain, or packaging change.

Pre-existing issue found and fixed: the working-tree lockfile recorded `eslint-config-pk`
specifier `2.1.0` while `package.json` pins `2.0.0`, so every `pnpm install` failed on a specifier
mismatch (masked by piping through `tail`, which hid the non-zero exit). Fixed with one
`pnpm install --no-frozen-lockfile`, which synced exactly that importer entry (2.1.0 → 2.0.0 in
lockfile and `node_modules`) plus the peer specifier; no other resolution moved.

| Item | Value |
| --- | --- |
| `pnpm install --no-frozen-lockfile` | pass — lockfile synced, `eslint-config-pk 2.1.0` → `2.0.0` |
| `pnpm install --frozen-lockfile` | pass — `Lockfile is up to date`, `Done in 421ms` |
| `pnpm lint` | pass — 0 problems; `--fix` introduced no new file modifications |
| `pnpm typecheck` | pass — 3 configurations, no diagnostics |
| `pnpm build` | pass — `✓ built in 434ms`, 8 artifacts, banner in all 4 bundles, `url(./fonts/vp.*)` |
| `pnpm publint` | pass — exit 0, same 2 warnings + 3 suggestions |
| Dist helper surface | no post-3.2 helpers (`useId`, `useTemplateRef`, `onWatcherCleanup`, `useModel`, `hydrateOn*` all absent); 3.2-era `createElementBlock`/`createElementVNode` present |
| Vue floor probe (fresh `dist/index.mjs`) | 3.0.11 fail, 3.1.5 fail (both `Named export 'createElementBlock' not found` — pre-existing), 3.2.0 ok (18 exports), 3.5.43 ok (18 exports) |
| `pnpm dev`, `pnpm pack` | not re-run — unaffected by a peer-range + docs change; last green this morning (table above) |
| Consumer fixture (Vue 3.5.43 + Vite 8.3.0), §8 verbatim | pass — `vue-tsc --noEmit` clean (exit 0), `vite build` green with the exact expected file set (`index.html` 0.30 kB, `vp-*.svg` 0.87 kB, css 14.01 kB, js 89.14 kB); tarball contained the 27-file surface |

Every command block in this guide was executed verbatim before this run was recorded, including the
consumer fixture in section 8 and the floor probe in section 9.

## 14. Phase 3 additions

When phase 3 lands, extend this guide with:

- `pnpm test` / `pnpm test:coverage` (Vitest 4.1.11, `@vue/test-utils` 2.5.1, happy-dom, coverage
  thresholds taken from the plan).
- The dist/artifact suite and the packed-tarball fixture test that replace the manual section 8.
- The CI matrix (Node 22 × Vue versions) and its expected job names.
