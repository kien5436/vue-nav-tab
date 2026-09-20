import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const types = path.join(root, 'types');

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

const bundles = ['index.common.js', 'index.es.js', 'index.mjs', 'vue-nav-tab.umd.js'];
const assets = ['vue-nav-tab.css', path.join('fonts', 'vp.svg'), path.join('fonts', 'vp.ttf'), path.join('fonts', 'vp.woff')];

// The bundled minifier only keeps the leading comment in the `es` output, so the
// published header is injected here to stay identical across all three formats.
const banner = `/**
 * ${pkg.name} v${pkg.version}
 *     @author ${pkg.author}
 *     @link ${pkg.repository.url}
 *     @license MIT
 */
`;

const read = (file) => readFileSync(path.join(dist, file), 'utf8');

bundles
  .filter((bundle) => 'index.mjs' !== bundle)
  .forEach((bundle) => {
    const source = read(bundle);

    if (source.startsWith(banner)) return;

    writeFileSync(path.join(dist, bundle), banner + source);
  });

// `dist/index.es.js` is ESM syntax inside a package without `"type": "module"`,
// so the `import` condition needs an explicit `.mjs` twin.
copyFileSync(path.join(dist, 'index.es.js'), path.join(dist, 'index.mjs'));

// `types/index.d.ts` keeps the side-effect `import "./style.css"` from the entry,
// so the published declarations need a resolvable module for that specifier.
mkdirSync(types, { recursive: true });
copyFileSync(path.join(root, 'lib', 'style.css.d.ts'), path.join(types, 'style.css.d.ts'));

const expected = [...bundles, ...assets, path.join('..', 'types', 'style.css.d.ts')];
const missing = expected.filter((file) => !existsSync(path.join(dist, file)));

if (0 < missing.length) {
  console.error(`Missing build artifacts:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}

const unbanded = bundles.filter((bundle) => !read(bundle).startsWith(banner));

if (0 < unbanded.length) {
  console.error(`Bundles missing the published banner: ${unbanded.join(', ')}`);
  process.exit(1);
}

console.log(`build artifacts verified: ${[...bundles, ...assets].join(', ')}`);
