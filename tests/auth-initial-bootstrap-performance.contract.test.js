import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const source = read('src/utils/apiClient.js');

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

  it('hydrates the branch store from the authoritative login payload without an immediate branch refetch', () => {
    const authApi = read('src/features/auth/api/authApi.js');
    const branchStore = read('src/features/branch/store/branchStore.js');

    expect(authApi).toContain("const branch = response?.data?.profile?.branch || null");
    expect(authApi).toContain("await import('@/features/branch/store/branchStore')");
    expect(authApi).toContain('useBranchStore.getState().setCurrentBranch(branch)');

    const cachedBranchBlock = branchStore.slice(
      branchStore.indexOf('if (cachedBranch?.id && Number(cachedBranch.id) === targetId)'),
      branchStore.indexOf('const branch = await getBranchById(targetId);'),
    );

    expect(cachedBranchBlock).toContain('return cachedBranch;');
    expect(cachedBranchBlock).not.toContain('getBranchById');
  });
});
