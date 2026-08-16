import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'src/utils/apiClient.js'), 'utf8');

describe('Auth initial bootstrap performance contract', () => {
  it('reuses the successful bootstrap refresh payload for auth/me and branch reads', () => {
    expect(source).toContain('BOOTSTRAP_SESSION_SNAPSHOT_TTL_MS');
    expect(source).toContain("reason !== 'bootstrap'");
    expect(source).toContain('setBootstrapSessionSnapshot(res?.data || {}, reason)');
    expect(source).toContain("authDebug('bootstrap-reuse:auth-me')");
    expect(source).toContain("authDebug('bootstrap-reuse:branch'");
    expect(source).toContain("'x-alpha-bootstrap-reuse': '1'");
  });

  it('keeps refresh security and fallback behavior intact', () => {
    expect(source).toContain('acquireRefreshLock()');
    expect(source).toContain('waitForCrossTabRefreshResult()');
    expect(source).toContain("refreshAccessToken('401')");
    expect(source).toContain('applyAuthorizationHeader(originalRequest, bearerToken)');
    expect(source).toContain('BOOTSTRAP_SESSION_SNAPSHOT_TTL_MS = 5000');
  });
});
