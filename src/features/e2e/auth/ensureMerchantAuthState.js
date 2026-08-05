import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { chromium } from '@playwright/test';
import { merchantAuthStatePath } from './merchantAuthState.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.e2e.local') });

const baseUrl = (process.env.E2E_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
const branchSlug = process.env.REPAIR_INTAKE_E2E_BRANCH_SLUG || 'test-shop';
const username = process.env.E2E_TEST_USERNAME;
const password = process.env.E2E_TEST_PASSWORD;

function isLoginUrl(url) {
  return /\/login(?:\?|$)|\/partner-portal\/login(?:\?|$)/i.test(url);
}

function isLoginRequest(requestOrResponse) {
  const request = typeof requestOrResponse.request === 'function'
    ? requestOrResponse.request()
    : requestOrResponse;
  return request.method() === 'POST'
    && /\/api\/auth\/login(?:\?|$)|\/auth\/login(?:\?|$)/i.test(request.url());
}

async function canOpenProtectedStore(page) {
  await page.goto(`${baseUrl}/${branchSlug}/pos/`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  return !isLoginUrl(page.url());
}

async function isStoredSessionValid(browser) {
  if (!fs.existsSync(merchantAuthStatePath)) return false;

  const context = await browser.newContext({ storageState: merchantAuthStatePath });
  const page = await context.newPage();
  try {
    return await canOpenProtectedStore(page);
  } finally {
    await context.close();
  }
}

async function createStoredSession(browser) {
  if (!username || !password) {
    throw new Error(
      'Merchant E2E auth state is missing or expired. Set E2E_TEST_USERNAME and E2E_TEST_PASSWORD in .env.e2e.local.'
    );
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  let failedLoginRequest = null;
  page.on('requestfailed', (request) => {
    if (isLoginRequest(request)) failedLoginRequest = request;
  });

  try {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('textbox', {
      name: /อีเมลหรือเบอร์โทรศัพท์|name@example\.com/i,
    }).fill(username);
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);

    const submitButton = page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true });
    await submitButton.click();

    const loginResponse = await page.waitForResponse(isLoginRequest, { timeout: 10_000 }).catch(() => null);

    if (loginResponse) {
      const loginBody = await loginResponse.text();
      if (!loginResponse.ok()) {
        throw new Error(
          `Merchant login failed with HTTP ${loginResponse.status()}: ${loginBody}`
        );
      }
    } else {
      await page.waitForTimeout(500);
      if (failedLoginRequest) {
        throw new Error(
          `Merchant login request failed before receiving a response: ${failedLoginRequest.failure()?.errorText || 'UNKNOWN_NETWORK_ERROR'} (${failedLoginRequest.url()})`
        );
      }

      const visibleError = await page.locator('.text-red-600, .text-red-500')
        .filter({ hasText: /.+/ })
        .first()
        .textContent()
        .catch(() => null);
      throw new Error(
        `Merchant login produced no /auth/login response.${visibleError ? ` UI error: ${visibleError.trim()}` : ` Current URL: ${page.url()}`}`
      );
    }

    await page.waitForTimeout(500);

    if (!(await canOpenProtectedStore(page))) {
      throw new Error(
        `Merchant login API succeeded but protected store route redirected to ${page.url()}. Confirm the account has access to ${branchSlug}.`
      );
    }

    fs.mkdirSync(path.dirname(merchantAuthStatePath), { recursive: true });
    await context.storageState({ path: merchantAuthStatePath });
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch();
try {
  if (await isStoredSessionValid(browser)) {
    console.log(`Merchant E2E auth state: REUSED (${branchSlug})`);
  } else {
    await createStoredSession(browser);
    console.log(`Merchant E2E auth state: CREATED (${branchSlug})`);
  }
} finally {
  await browser.close();
}
