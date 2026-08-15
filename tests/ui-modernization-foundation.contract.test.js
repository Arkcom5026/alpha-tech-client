import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('shared UI modernization foundation', () => {
  it('maps application primary and focus colors to semantic ADS tokens', () => {
    const css = read('src/index.css');
    expect(css).toContain('--primary: var(--ads-action-primary)');
    expect(css).toContain('--ring: var(--ads-focus)');
  });

  it('owns react-toastify configuration in the feedback provider', () => {
    const app = read('src/App.jsx');
    const provider = read('src/design-system/feedback/FeedbackProvider.jsx');
    expect(app).toContain('<FeedbackProvider />');
    expect(app).not.toContain('<ToastContainer />');
    expect(provider).toContain('limit={3}');
    expect(provider).toContain('closeOnClick={false}');
  });

  it('exports the unified feedback surface from the design system', () => {
    const exports = read('src/design-system/feedback/index.js');
    expect(exports).toContain("export * from './InlineFeedback.jsx'");
    expect(exports).toContain("export * from './feedback.js'");
    expect(exports).toContain("export * from './errorPresentation.js'");
  });

  it('guards the full repository by default while retaining an incremental mode', () => {
    const guard = read('scripts/verify-ui-modernization.mjs');
    const workflow = read('.github/workflows/frontend-ci.yml');

    expect(guard).toContain("|| 'full'");
    expect(guard).toContain("VALID_MODES = new Set(['diff', 'full'])");
    expect(guard).toContain("git(['ls-files', 'src'])");
    expect(guard).toContain("git(['ls-files', '--others', '--exclude-standard', 'src'])");
    expect(guard).toContain("id: 'legacy-action-orange'");
    expect(guard).toContain('Static light orange/amber remains valid for semantic warning/status surfaces.');

    expect(workflow).toContain('fetch-depth: 0');
    expect(workflow).toContain('UI modernization full-repository guard');
    expect(workflow).toContain('npm run guard:ui-modernization');
    expect(workflow).toContain('UI modernization incremental guard');
    expect(workflow).toContain('node scripts/verify-ui-modernization.mjs --mode=diff');
  });

  it('ignores comment-only dialog wording without weakening executable dialog detection', () => {
    const guard = read('scripts/verify-ui-modernization.mjs');

    expect(guard).toContain('const isCommentOnlyLine = (source) =>');
    expect(guard).toContain("trimmed.startsWith('//')");
    expect(guard).toContain("trimmed.startsWith('{/*')");
    expect(guard).toContain('if (isCommentOnlyLine(source)) return;');
    expect(guard).toContain("id: 'native-browser-dialog'");
    expect(guard).toContain('(?:alert|confirm)');
  });

  it('does not retain an unused orange candidate tone', () => {
    const badge = read('src/features/templateCandidate/components/CandidateBadge.jsx');
    const status = read('src/features/templateCandidate/utils/candidateStatus.js');

    expect(status).not.toContain("'orange'");
    expect(badge).not.toContain('bg-orange-');
  });
});
