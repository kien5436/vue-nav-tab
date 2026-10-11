// PKG-01 + SEC-06: verify the packed surface the way a consumer sees it.
// PKG-02: install the tarball beside pinned Vue versions in isolated consumers.
// Run: `pnpm verify:package` (requires a fresh `pnpm build` first).
import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const vue = require('vue');

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

function hasFile(rel) {
  assert.ok(existsSync(path.join(root, rel)), `missing artifact: ${rel}`);
}

function checkEntry(entry, label) {
  const plugin = 'function' === typeof entry.install ? entry : entry.default;

  assert.ok(plugin && 'function' === typeof plugin.install, `${label}: default plugin export missing`);

  for (const name of ['HTabs', 'VTabs', 'TabView']) {
    const app = vue.createApp({ render: () => null });

    app.use(plugin);
    assert.ok(app.component(name), `${label}: ${name} not registered`);
  }

  for (const api of ['createTabs', 'addTab', 'removeTab', 'refreshTab', 'useTabs', 'useCurrentTab'])
    assert.equal(typeof entry[api], 'function', `${label}: ${api} missing`);
}

// PKG-01: every declared entry point resolves to a file on disk.
const targets = new Set([pkg.main, pkg.module, pkg.unpkg, pkg.types]);

(function collect(node) {
  if ('string' === typeof node) targets.add(node);
  else if (null !== node && 'object' === typeof node) Object.values(node).forEach(collect);
})(pkg.exports);

for (const target of targets) {
  if (target.includes('*')) continue; // wildcard passthrough, covered by the pack-list check below

  hasFile(target.replace(/^\.\//, ''));
}

// PKG-01: ESM, CJS and UMD entries each install and expose the public API.
checkEntry(await import(path.join(root, 'dist/index.mjs')), 'dist/index.mjs');
checkEntry(require(path.join(root, 'dist/index.common.js')), 'dist/index.common.js');

const sandbox = { console, Vue: vue };

vm.runInNewContext(readFileSync(path.join(root, 'dist/vue-nav-tab.umd.js'), 'utf8'), sandbox);
assert.ok(sandbox.VueNavTab, 'UMD global VueNavTab missing');
checkEntry(sandbox.VueNavTab, 'dist/vue-nav-tab.umd.js');

// PKG-01: CSS asset URLs resolve relative to the package.
const css = readFileSync(path.join(root, 'dist/vue-nav-tab.css'), 'utf8');
const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1].split('#')[0]);

assert.ok(0 < urls.length, 'no asset URLs found in CSS');

for (const url of urls) hasFile(path.posix.join('dist', url));

// SEC-06: only dist/, types/ and root metadata ship in the tarball.
const pack = execFileSync('pnpm', ['pack', '--dry-run'], { cwd: root, encoding: 'utf8' });
const files = pack.slice(pack.indexOf('Tarball Contents'), pack.indexOf('Tarball Details'))
  .split('\n').map((line) => line.trim()).filter((line) => '' !== line && 'Tarball Contents' !== line);
const allowed = /^(dist|types)\/.+|^(package\.json|README\.md|LICENSE)$/;

assert.ok(0 < files.length, 'empty pack list');

for (const file of files) assert.match(file, allowed, `unexpected packed file: ${file}`);

if (!process.env.VNT_SKIP_CONSUMER) await verifyConsumers(consumerVues());

console.log(`package verified: ${files.length} packed files, ESM/CJS/UMD entries install, CSS assets resolve`);

function consumerVues() {
  const override = process.env.VNT_CONSUMER_VUES;

  if (override) return override.split(',').map((version) => version.trim()).filter(Boolean);

  return ['3.2.0', pkg.devDependencies.vue];
}

function checkSource() {
  return [
    "import { strict as assert } from 'node:assert';",
    "import { Window } from 'happy-dom';",
    '',
    'const window = new Window({ url: \'https://localhost/\' });',
    '',
    "for (const key of ['window', 'document', 'Element', 'HTMLElement', 'SVGElement', 'Node', 'Document', 'Event', 'KeyboardEvent', 'MouseEvent'])",
    '  if (!(key in globalThis)) globalThis[key] = \'window\' === key ? window : window[key];',
    '',
    "const vue = await import('vue');",
    "const navTab = await import('vue-nav-tab');",
    'const expected = process.argv[2];',
    '',
    'assert.equal(vue.version, expected);',
    '',
    'const events = [];',
    'const view = (group, id, text) => vue.defineComponent({',
    '  name: text,',
    '  setup() {',
    '    navTab.onTabActivated(group, (tab) => events.push(\'activated:\' + id + \':\' + tab.id));',
    '    navTab.onTabDeactivated(group, (tab) => events.push(\'deactivated:\' + id + \':\' + tab.id));',
    '    return () => vue.h(\'p\', { class: \'v\' }, text);',
    '  },',
    '});',
    '',
    'function seed(group) {',
    '  return navTab.createTabs(group, [',
    '    { active: true, closable: true, id: \'a\', title: \'A\', view: view(group, \'a\', group + \'-a\') },',
    '    { closable: true, id: \'b\', title: \'B\', view: view(group, \'b\', group + \'-b\') },',
    '  ]);',
    '}',
    '',
    'const hTabs = seed(\'h\');',
    'const vTabs = seed(\'v\');',
    'const app = vue.createApp({',
    '  render: () => vue.h(\'div\', [',
    '    vue.h(navTab.HTabs, { group: \'h\', tabs: hTabs }),',
    '    vue.h(navTab.TabView, { group: \'h\' }),',
    '    vue.h(navTab.VTabs, { group: \'v\', tabs: vTabs }),',
    '    vue.h(navTab.TabView, { group: \'v\' }),',
    '  ]),',
    '});',
    '',
    'app.use(navTab.default);',
    '',
    'const host = window.document.createElement(\'div\');',
    'window.document.body.appendChild(host);',
    'app.mount(host);',
    'await vue.nextTick();',
    '',
    'assert.equal(host.querySelectorAll(\'[role="tab"]\').length, 4);',
    'assert.ok(host.textContent.includes(\'h-a\'));',
    'assert.ok(host.textContent.includes(\'v-a\'));',
    'assert.deepEqual(events, [\'activated:a:a\', \'activated:a:a\']);',
    '',
    'navTab.addTab(\'h\', { ...hTabs[1], active: true });',
    'await vue.nextTick();',
    'assert.ok(host.textContent.includes(\'h-b\'));',
    'assert.ok(events.includes(\'deactivated:a:a\'));',
    'assert.ok(events.includes(\'activated:b:b\'));',
    '',
    'const before = navTab.useTabs(\'h\').find((tab) => \'b\' === tab.id)._key;',
    'navTab.refreshTab(\'h\', \'b\');',
    'await vue.nextTick();',
    'assert.notEqual(navTab.useTabs(\'h\').find((tab) => \'b\' === tab.id)._key, before);',
    '',
    'navTab.addTab(\'v\', { closable: true, id: \'c\', title: \'C\', view: view(\'v\', \'c\', \'v-c\') });',
    'await vue.nextTick();',
    'assert.equal(navTab.useTabs(\'v\').map((tab) => tab.id).join(","), \'a,b,c\');',
    '',
    'navTab.removeTab(\'v\', \'c\');',
    'navTab.removeRight(\'h\', \'a\');',
    'navTab.removeLeft(\'h\', \'a\');',
    'navTab.removeOthers(\'v\', \'a\');',
    'navTab.removeAbove(\'v\', \'a\');',
    'navTab.removeBelow(\'v\', \'a\');',
    'await vue.nextTick();',
    'assert.equal(navTab.useTabs(\'h\').map((tab) => tab.id).join(","), \'a\');',
    'assert.equal(navTab.useCurrentTab(\'h\').value.id, \'a\');',
    '',
    'navTab.removeAll(\'h\');',
    'await vue.nextTick();',
    'assert.equal(navTab.useCurrentTab(\'h\').value.id, \'_\');',
    '',
    'console.log(\'consumer ok \' + expected);',
    '',
  ].join('\n');
}

async function verifyConsumers(versions) {
  const [head, ...tail] = versions;

  if (undefined === head) return;

  await verifyConsumer(head);
  await verifyConsumers(tail);
}

function verifyConsumer(version) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'vnt-consumer-'));

  try {
    execFileSync('pnpm', ['pack', '--pack-destination', dir], { cwd: root, stdio: 'ignore' });
    writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    execFileSync('pnpm', ['add', path.join(dir, `vue-nav-tab-${pkg.version}.tgz`), `vue@${version}`, `happy-dom@${pkg.devDependencies['happy-dom']}`], { cwd: dir, stdio: 'pipe', timeout: 180000 });
    writeFileSync(path.join(dir, 'check.mjs'), checkSource());

    const out = execFileSync('node', ['check.mjs', version], { cwd: dir, encoding: 'utf8', timeout: 120000 });

    assert.match(out, /consumer ok/, `vue ${version} consumer check failed`);
    console.log(`vue ${version} consumer ok`);
  }
  finally {
    rmSync(dir, forceRecursive());
  }
}

function forceRecursive() {
  return { force: true, recursive: true };
}
