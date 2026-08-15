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
});
