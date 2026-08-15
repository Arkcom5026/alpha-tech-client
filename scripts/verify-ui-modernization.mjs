import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE_REF = process.env.UI_GUARD_BASE_REF || 'origin/main';
const UI_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.scss']);
const ALLOWED_TOAST_IMPORTS = new Set([
  'src/design-system/feedback/FeedbackProvider.jsx',
  'src/design-system/feedback/feedback.js',
  'src/design-system/feedback/feedback.test.js',
]);

const rules = [
  {
    id: 'legacy-primary-orange',
    pattern: /(?:bg-orange-(?:400|500|600|700)|(?:hover|focus|active):(?:bg|text|border|ring)-orange-|focus:(?:ring|border)-orange-|selection:bg-orange-)/u,
    message: 'Use semantic Mint/Green action, focus, accent, or navigation tokens.',
  },
  {
    id: 'native-browser-dialog',
    pattern: /(?:\bwindow\.)?\b(?:alert|confirm)\s*\(/u,
    message: 'Use the canonical feedback or ConfirmActionDialog contract.',
  },
  {
    id: 'direct-toast-import',
    pattern: /\bfrom\s+['"]react-toastify['"]|\brequire\(\s*['"]react-toastify['"]\s*\)/u,
    message: 'Use the design-system feedback adapter.',
    allowed: ALLOWED_TOAST_IMPORTS,
  },
];

const git = (args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const refExists = (ref) => {
  try { git(['rev-parse', '--verify', '--quiet', ref]); return true; } catch { return false; }
};

const base = refExists(DEFAULT_BASE_REF) ? git(['merge-base', 'HEAD', DEFAULT_BASE_REF]) : null;
const patches = [];
if (base) patches.push(git(['diff', '--unified=0', '--no-color', `${base}...HEAD`, '--', 'src']));
patches.push(git(['diff', '--unified=0', '--no-color', 'HEAD', '--', 'src']));

const findings = [];
let currentFile = '';
let currentLine = 0;

for (const line of patches.join('\n').split(/\r?\n/u)) {
  if (line.startsWith('+++ b/')) {
    currentFile = line.slice(6).replaceAll('\\', '/');
    continue;
  }
  const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)/u);
  if (hunk) {
    currentLine = Number(hunk[1]);
    continue;
  }
  if (!line.startsWith('+') || line.startsWith('+++')) continue;
  const source = line.slice(1);
  for (const rule of rules) {
    if (rule.allowed?.has(currentFile)) continue;
    if (rule.pattern.test(source)) findings.push({ ...rule, file: currentFile, line: currentLine, source: source.trim() });
  }
  currentLine += 1;
}

for (const file of git(['ls-files', '--others', '--exclude-standard', 'src']).split(/\r?\n/u).filter(Boolean)) {
  if (!UI_EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
  const normalized = file.replaceAll('\\', '/');
  fs.readFileSync(file, 'utf8').split(/\r?\n/u).forEach((source, index) => {
    for (const rule of rules) {
      if (rule.allowed?.has(normalized)) continue;
      if (rule.pattern.test(source)) findings.push({ ...rule, file: normalized, line: index + 1, source: source.trim() });
    }
  });
}

if (findings.length) {
  console.error(`[ui-modernization] ${findings.length} new violation(s):`);
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} [${finding.id}] ${finding.message}`);
    console.error(`  ${finding.source}`);
  }
  process.exit(1);
}

console.log(`[ui-modernization] PASS (base=${base || 'working-tree-only'})`);
