import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE_REF = process.env.UI_GUARD_BASE_REF || (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/main');
const UI_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.scss']);
const ALLOWED_TOAST_IMPORTS = new Set([
  'src/design-system/feedback/FeedbackProvider.jsx',
  'src/design-system/feedback/feedback.js',
  'src/design-system/feedback/feedback.test.js',
]);
const VALID_MODES = new Set(['diff', 'full']);

const requestedMode = process.argv.find((arg) => arg.startsWith('--mode='))?.slice('--mode='.length)
  || process.env.UI_GUARD_MODE
  || 'full';

if (!VALID_MODES.has(requestedMode)) {
  console.error(`[ui-modernization] Unsupported mode: ${requestedMode}. Use --mode=full or --mode=diff.`);
  process.exit(2);
}

const rules = [
  {
    id: 'legacy-action-orange',
    // Static light orange/amber remains valid for semantic warning/status surfaces.
    // This rule targets saturated primary/action colors and interactive orange states.
    pattern: /(?:bg-orange-(?:400|500|600|700)|(?:hover|focus|active):(?:bg|text|border|ring)-orange-|focus:(?:ring|border)-orange-|selection:bg-orange-)/u,
    message: 'Use semantic Mint/Green action, focus, accent, or navigation tokens. Keep orange/amber only for non-interactive semantic attention states.',
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
  try {
    git(['rev-parse', '--verify', '--quiet', ref]);
    return true;
  } catch {
    return false;
  }
};

const findings = [];
const normalizeFile = (file) => file.replaceAll('\\', '/');
const shouldScanFile = (file) => UI_EXTENSIONS.has(path.extname(file).toLowerCase());
const isCommentOnlyLine = (source) => {
  const trimmed = source.trim();
  return trimmed.startsWith('//')
    || trimmed.startsWith('/*')
    || trimmed.startsWith('*')
    || trimmed.startsWith('*/')
    || trimmed.startsWith('{/*');
};

const scanSourceLine = (file, line, source) => {
  if (isCommentOnlyLine(source)) return;
  for (const rule of rules) {
    if (rule.allowed?.has(file)) continue;
    if (rule.pattern.test(source)) {
      findings.push({ ...rule, file, line, source: source.trim() });
    }
  }
};

const scanWholeFile = (file) => {
  if (!shouldScanFile(file)) return;
  const normalized = normalizeFile(file);
  fs.readFileSync(file, 'utf8').split(/\r?\n/u).forEach((source, index) => {
    scanSourceLine(normalized, index + 1, source);
  });
};

const trackedAndUntrackedSourceFiles = () => {
  const tracked = git(['ls-files', 'src']).split(/\r?\n/u).filter(Boolean);
  const untracked = git(['ls-files', '--others', '--exclude-standard', 'src']).split(/\r?\n/u).filter(Boolean);
  return [...new Set([...tracked, ...untracked])].filter(shouldScanFile).sort();
};

const scanDiff = () => {
  const base = refExists(DEFAULT_BASE_REF) ? git(['merge-base', 'HEAD', DEFAULT_BASE_REF]) : null;
  const patches = [];
  if (base) patches.push(git(['diff', '--unified=0', '--no-color', `${base}...HEAD`, '--', 'src']));
  patches.push(git(['diff', '--unified=0', '--no-color', 'HEAD', '--', 'src']));

  let currentFile = '';
  let currentLine = 0;

  for (const line of patches.join('\n').split(/\r?\n/u)) {
    if (line.startsWith('+++ b/')) {
      currentFile = normalizeFile(line.slice(6));
      continue;
    }
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)/u);
    if (hunk) {
      currentLine = Number(hunk[1]);
      continue;
    }
    if (!line.startsWith('+') || line.startsWith('+++')) continue;
    scanSourceLine(currentFile, currentLine, line.slice(1));
    currentLine += 1;
  }

  for (const file of git(['ls-files', '--others', '--exclude-standard', 'src']).split(/\r?\n/u).filter(Boolean)) {
    scanWholeFile(file);
  }

  return base;
};

let scopeLabel;
if (requestedMode === 'full') {
  const files = trackedAndUntrackedSourceFiles();
  files.forEach(scanWholeFile);
  scopeLabel = `full:${files.length}-files`;
} else {
  const base = scanDiff();
  scopeLabel = `diff:${base || 'working-tree-only'}`;
}

if (findings.length) {
  console.error(`[ui-modernization] ${findings.length} violation(s) in ${scopeLabel}:`);
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} [${finding.id}] ${finding.message}`);
    console.error(`  ${finding.source}`);
  }
  process.exit(1);
}

console.log(`[ui-modernization] PASS (${scopeLabel})`);
