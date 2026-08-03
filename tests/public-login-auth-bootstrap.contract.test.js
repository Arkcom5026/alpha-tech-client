import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('public login auth bootstrap contract', () => {
  it('does not call refresh bootstrap on public routes without session evidence', () => {
    const app = read('src/App.jsx');

    expect(app).toContain("'/'");
    expect(app).toContain("'/login'");
    expect(app).toContain("'/partner-portal'");
    expect(app).toContain("'/partner-portal/apply'");
    expect(app).toContain("'/partner-portal/forgot-password'");
    expect(app).toContain("'/partner-portal/reset-password'");
    expect(app).toContain("'/repair/track/'");
    expect(app).toContain('isPublicUnauthenticatedPath(pathname)');
    expect(app).toContain('!hasRecoverableSessionEvidence(state)');
    expect(app).toContain("authBootstrapState: 'unauthenticated'");
    expect(app).toContain('settlePublicUnauthenticatedBootstrap()');

    const guardIndex = app.indexOf('if (isPublicUnauthenticatedPath(pathname) && !hasRecoverableSessionEvidence(state))');
    const bootstrapIndex = app.indexOf('const promise = runInitialAuthBootstrapOnce(bootstrapAuthAction)');

    expect(guardIndex).toBeGreaterThan(-1);
    expect(bootstrapIndex).toBeGreaterThan(guardIndex);
    expect(app).toContain('state?.accessToken');
    expect(app).toContain('state?.session');
    expect(app).toContain('state?.rememberMe');

    const publicGuardBlock = app.slice(guardIndex, bootstrapIndex);
    expect(publicGuardBlock).not.toContain('initialAuthBootstrapStarted = true');
  });
});
