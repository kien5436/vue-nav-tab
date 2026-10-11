// PKG-02 (browser half): stage an isolated consumer that a human opens in each
// target browser. Packs the tarball, installs it beside one Vue version, and
// writes a file://-openable page that mounts all three components, sweeps the
// public API, and renders PASS/FAIL into the DOM.
// Run: `pnpm verify:consumer-browser` (or VNT_BROWSER_VUE=3.5.43 to switch).
// The directory persists at $TMPDIR/vnt-browser so it can be reopened.
import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = process.env.VNT_BROWSER_VUE ?? '3.2.0';
const dir = path.join(os.tmpdir(), 'vnt-browser');

rmSync(dir, { force: true, recursive: true });
mkdirSync(dir, { recursive: true });
execFileSync('pnpm', ['pack', '--pack-destination', dir], { cwd: root, stdio: 'ignore' });
writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ private: true }));
execFileSync('pnpm', ['add', path.join(dir, `vue-nav-tab-${pkg.version}.tgz`), `vue@${version}`], { cwd: dir, stdio: 'pipe', timeout: 180000 });

const installed = JSON.parse(readFileSync(path.join(dir, 'node_modules/vue/package.json'), 'utf8'));

assert.equal(installed.version, version);
assert.ok(existsSync(path.join(dir, 'node_modules/vue/dist/vue.global.js')));
assert.ok(existsSync(path.join(dir, 'node_modules/vue-nav-tab/dist/vue-nav-tab.umd.js')));

writeFileSync(path.join(dir, 'check.html'), page(version));
console.log(`open in each browser: ${ path.join(dir, 'check.html')}`);

function page(vueVersion) {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head><meta charset="utf-8"><title>vue-nav-tab browser consumer</title></head>',
    '<body>',
    '<div id="app"></div>',
    '<ol id="results"></ol>',
    '<script src="./node_modules/vue/dist/vue.global.js"></script>',
    '<script src="./node_modules/vue-nav-tab/dist/vue-nav-tab.umd.js"></script>',
    '<script>',
    'var out = [];',
    'function check(name, cond) { out.push((cond ? "PASS " : "FAIL ") + name); }',
    'try {',
    '  var Vue = window.Vue;',
    '  var nav = window.VueNavTab;',
    `  check('vue version', Vue.version === '${ vueVersion }');`,
    '  var events = [];',
    '  function view(group, id, text) {',
    '    return {',
    '      setup: function () {',
    '        nav.onTabActivated(group, function (tab) { events.push("activated:" + id + ":" + tab.id); });',
    '        nav.onTabDeactivated(group, function (tab) { events.push("deactivated:" + id + ":" + tab.id); });',
    '        return function () { return Vue.h("p", { class: "v" }, text); };',
    '      },',
    '    };',
    '  }',
    '  var hTabs = nav.createTabs("h", [',
    '    { active: true, closable: true, id: "a", title: "A", view: view("h", "a", "h-a") },',
    '    { closable: true, id: "b", title: "B", view: view("h", "b", "h-b") },',
    '  ]);',
    '  var vTabs = nav.createTabs("v", [',
    '    { active: true, closable: true, id: "a", title: "A", view: view("v", "a", "v-a") },',
    '    { closable: true, id: "b", title: "B", view: view("v", "b", "v-b") },',
    '  ]);',
    '  var app = Vue.createApp({',
    '    render: function () {',
    '      return Vue.h("div", [',
    '        Vue.h(nav.HTabs, { group: "h", tabs: hTabs }),',
    '        Vue.h(nav.TabView, { group: "h" }),',
    '        Vue.h(nav.VTabs, { group: "v", tabs: vTabs }),',
    '        Vue.h(nav.TabView, { group: "v" }),',
    '      ]);',
    '    },',
    '  });',
    '  app.use(nav.default);',
    '  app.mount("#app");',
    '  Vue.nextTick().then(function () {',
    '    check("HTabs renders 2 tabs", document.querySelectorAll(".vp-tabs [role=\\"tab\\"]").length === 2);',
    '    check("VTabs renders 2 tabs", document.querySelectorAll(".vp-pills [role=\\"tab\\"]").length === 2);',
    '    check("initial views", document.body.textContent.indexOf("h-a") !== -1 && document.body.textContent.indexOf("v-a") !== -1);',
    '    nav.addTab("h", Object.assign({}, hTabs[1], { active: true }));',
    '    return Vue.nextTick();',
    '  }).then(function () {',
    '    check("switch view", document.body.textContent.indexOf("h-b") !== -1);',
    '    var before = nav.useTabs("h").filter(function (t) { return t.id === "b"; })[0]._key;',
    '    nav.refreshTab("h", "b");',
    '    check("refresh rekeys", nav.useTabs("h").filter(function (t) { return t.id === "b"; })[0]._key !== before);',
    '    nav.addTab("v", { closable: true, id: "c", title: "C", view: view("v", "c", "v-c") });',
    '    check("add tab", nav.useTabs("v").length === 3);',
    '    nav.removeTab("v", "c");',
    '    nav.removeRight("h", "a");',
    '    nav.removeLeft("h", "a");',
    '    nav.removeOthers("v", "a");',
    '    nav.removeAbove("v", "a");',
    '    nav.removeBelow("v", "a");',
    '    check("removals", nav.useTabs("h").length === 1 && nav.useCurrentTab("h").value.id === "a");',
    '    nav.removeAll("h");',
    '    check("blank fallback", nav.useCurrentTab("h").value.id === "_");',
    '    check("hooks fired", events.indexOf("activated:b:b") !== -1);',
    '    return Vue.nextTick();',
    '  }).then(function () {',
    '    document.getElementById("results").innerHTML = out.map(function (line) {',
    '      return "<li>" + line.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</li>";',
    '    }).join("");',
    '    console.log(out.join("\\n"));',
    '  }).catch(function (error) {',
    '    document.getElementById("results").innerHTML = "<li>FAIL setup: " + String(error) + "</li>";',
    '    console.error(error);',
    '  });',
    '} catch (error) {',
    '  document.getElementById("results").innerHTML = "<li>FAIL setup: " + String(error) + "</li>";',
    '  console.error(error);',
    '}',
    '</script>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
