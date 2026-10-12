#!/usr/bin/env node
/** Offline checks for the static MDX conventions used by this documentation. No dependencies. */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(process.argv[2] ?? defaultRoot);
const errors = [];
let checkedLinks = 0;
const slash = value => value.split(path.sep).join('/');
const relative = filename => slash(path.relative(root, filename));
const report = (file, message) => errors.push(`${file}: ${message}`);

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(filename) : [filename];
  });
}

function localPath(value) {
  const raw = value.trim();
  // Anchor/query-only links stay on the current page. Schemes include mailto, data and tel.
  if (!raw || /^[#?]/.test(raw) || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(raw)) return null;
  try {
    return decodeURIComponent(raw.split(/[?#]/, 1)[0]);
  } catch {
    return raw; // An invalid encoded local target will fail the existence check below.
  }
}

function checkTarget(value, origin, label, assetOnly = false) {
  const target = localPath(value);
  if (target === null) return;
  checkedLinks++;
  // Mintlify serves / by choosing the configured language/home page.
  if (target === '/' && !assetOnly) return;
  const absolute = target.startsWith('/')
    ? path.resolve(root, '.' + target)
    : path.resolve(path.dirname(origin), target);
  const rel = path.relative(root, absolute);
  if (rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) {
    report(label, `local target escapes the docs directory: ${value}`);
    return;
  }
  const candidates = assetOnly || path.extname(absolute)
    ? [absolute]
    : [absolute + '.mdx', absolute + '.md', path.join(absolute, 'index.mdx'), path.join(absolute, 'index.md')];
  if (!candidates.some(candidate => existsSync(candidate) && statSync(candidate).isFile())) {
    report(label, `missing ${assetOnly ? 'asset' : 'page or file'}: ${value}`);
  }
}

function navRoutes(node) {
  if (Array.isArray(node)) return node.flatMap(item => typeof item === 'string' ? [item] : navRoutes(item));
  if (!node || typeof node !== 'object') return [];
  return Object.entries(node).flatMap(([key, value]) =>
    key === 'pages' ? navRoutes(value) : typeof value === 'object' ? navRoutes(value) : []);
}

function checkParity(fr, en, label) {
  for (const route of fr) if (!en.has(route)) report(label, `missing English counterpart: ${route}`);
  for (const route of en) if (!fr.has(route)) report(label, `missing French counterpart: ${route}`);
}

function blankCode(source) {
  // Keep offsets/newlines so diagnostics identify the original file lines.
  const blank = text => text.replace(/[^\n]/g, ' ');
  return source
    .replace(/^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[^\n]*(?:\n|$)/gm, blank)
    .replace(/(`+)[^\n]*?\1/g, blank);
}

function inspectPage(filename) {
  const source = readFileSync(filename, 'utf8');
  const content = blankCode(source);
  const lineAt = offset => content.slice(0, offset).split('\n').length;
  const labelAt = offset => `${relative(filename)}:${lineAt(offset)}`;

  // JSX/HTML static values, including href={"/path"}. Dynamic expressions are left to Mintlify.
  const attributes = /\b(href|src|poster)\s*=\s*\{?\s*(["'])(.*?)\2\s*\}?/gs;
  for (const match of content.matchAll(attributes)) {
    checkTarget(match[3], filename, labelAt(match.index), match[1] !== 'href');
  }
  // Markdown inline links/images. Escaped characters and one balanced parenthesis pair are supported.
  const markdown = /(!?)\[[^\]\n]*\]\(\s*(<[^>\n]+>|(?:\\.|[^\s()\\]|\([^()\n]*\))+)/g;
  for (const match of content.matchAll(markdown)) {
    const destination = match[2].replace(/^<|>$/g, '').replace(/\\([()\s])/g, '$1');
    checkTarget(destination, filename, labelAt(match.index), match[1] === '!');
  }
  // Definitions used by reference-style Markdown links/images.
  for (const match of content.matchAll(/^\s{0,3}\[[^\]\n]+\]:\s*(<[^>\n]+>|\S+)/gm)) {
    checkTarget(match[1].replace(/^<|>$/g, ''), filename, labelAt(match.index));
  }
  if (/^(?:fr|en)\/tutorials\//.test(relative(filename))) {
    for (const match of source.matchAll(/\b(?:TODO|TBD|FIXME|PLACEHOLDER)\b|à compléter|capture à ajouter/gi)) {
      report(labelAt(match.index), `unfinished tutorial marker: ${match[0]}`);
    }
  }
}

try {
  const configFile = path.join(root, 'docs.json');
  const config = JSON.parse(readFileSync(configFile, 'utf8'));
  const pages = ['fr', 'en'].flatMap(lang => walk(path.join(root, lang)))
    .filter(filename => /\.mdx?$/.test(filename));
  if (!pages.length) report('docs.json', 'no French or English documentation pages found');

  const routes = navRoutes(config.navigation);
  if (!routes.length) report('docs.json', 'no navigation page routes found');
  for (const route of routes) {
    checkTarget(route.startsWith('/') || localPath(route) === null ? route : '/' + route,
      configFile, 'docs.json navigation');
  }
  const routeSet = lang => new Set(routes.filter(route => route.replace(/^\//, '').startsWith(lang + '/'))
    .map(route => route.replace(/^\//, '').slice(lang.length + 1)));
  checkParity(routeSet('fr'), routeSet('en'), 'docs.json navigation');
  const pageSet = lang => new Set(pages.map(relative).filter(file => file.startsWith(lang + '/'))
    .map(file => file.slice(lang.length + 1).replace(/\.mdx?$/, '')));
  checkParity(pageSet('fr'), pageSet('en'), 'FR/EN pages');

  const inspectConfig = object => {
    if (!object || typeof object !== 'object') return;
    for (const [key, value] of Object.entries(object)) {
      if (['href', 'src', 'favicon'].includes(key) && typeof value === 'string') {
        checkTarget(value, configFile, `docs.json ${key}`, key !== 'href');
      } else if (typeof value === 'object') inspectConfig(value);
    }
  };
  inspectConfig(config);
  for (const logo of typeof config.logo === 'string' ? [config.logo] : Object.values(config.logo ?? {})) {
    if (typeof logo === 'string') checkTarget(logo, configFile, 'docs.json logo', true);
  }
  pages.forEach(inspectPage);
  if (errors.length) {
    console.error(`Documentation validation failed (${errors.length} issue(s)):\n${errors.map(error => `- ${error}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(`Documentation validation passed: ${pages.length} pages, ${routes.length} navigation entries, ${checkedLinks} local targets; FR/EN paths and tutorial markers checked.`);
  }
  console.log('Offline scope: no external URL requests, anchor validation, MDX compilation or screenshot content verification.');
} catch (error) {
  console.error(`Documentation validation could not complete: ${error.message}`);
  process.exitCode = 1;
}
