# AGENTS.md — vue-nav-tab contributor guide

Audience: any AI agent or engineer working in this repo. Follow this file first; repo
docs (`docs/`) describe the package for consumers.

## 1. Package manager — pnpm only

- `packageManager: pnpm@10.32.1`. Never `npm install`, `yarn`, or `bun`.
- `pnpm-lock.yaml` is the only lockfile. Install reproducibly:
  `pnpm install --frozen-lockfile`.
- All commands assume the repo root as working directory.

## 2. Git workflow

- Never work on `master`/`main`. Create a dedicated branch first
  (`git switch -c <type>/short-topic master`).
- Before touching anything: `git fetch --all --prune`, confirm a clean tree and no
  divergence from `origin`. Report and stop if any check fails.
- One commit per work item; commit new files promptly — never let untracked files
  leak into the next item's commit.
- Never `git push`, open a PR, tag, or merge without an explicit request.
- Commit subjects use conventional prefixes: `chore:`, `fix:`, `test:`, `ci:`,
  `docs:`. Scope keeps them short and imperative.

## 3. Gates — prove with real output

Run the gates that cover your change; quote observed output, never assert from memory.

| Change | Gates |
| --- | --- |
| Any | `pnpm lint`, `pnpm typecheck` |
| `lib/`, tests | `pnpm test`, `pnpm test:coverage` (thresholds: 80 stmts / 80 lines / 80 funcs / 70 branches) |
| Build/packaging | `pnpm build`, `pnpm publint` |
| Playground | `pnpm dev` serves, `pnpm preview` works |

`dist/` and `types/` are gitignored build output — never commit them.

## 4. Code style

- `eslint.config.mjs` (`eslint-config-pk@2`) is the source of truth. `pnpm lint`
  auto-fixes; a clean run must report 0 problems.
- Non-obvious rules: single quotes, `curly`, `eol-last`, sorted keys; use
  `Object.has(obj, k)` instead of `obj.hasOwnProperty(k)`; `_key`, `_close`, `_tabs`
  keep their underscores in `lib/` (public tab contract, scoped lint exception).
- TypeScript `strict`; `vue-tsc` must pass all three configs (`pnpm typecheck`).

## 5. Compatibility floor

- Supported runtime is Vue **3.2+** (`peerDependencies.vue: ^3.2.0`); the compiled
  bundles require 3.2-era helpers (`createElementBlock`, `createElementVNode`).
  See `docs/installation.md`.
- Tests and fixtures must avoid `<script setup>` and `defineModel` so the suite
  stays valid across the whole supported range.

## 6. Skills

- If your harness provides superpowers skills, prefer them — especially
  `systematic-debugging` (bugs), `test-driven-development` (features/fixes), and
  `verification-before-completion` (before claiming green or committing).
- Without superpowers, follow the same discipline from this file: reproduce with
  real command output first, apply the smallest fix, re-run the gates in §3, and
  record results. `skills/` holds the plain-markdown fallbacks when present.
