import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { chromium } from '@playwright/test';
import { saleMerchantAuthStatePath } from './saleMerchantAuthState.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.e2e.local') });

const baseUrl = (process.env.E2E_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
const branchSlug = process.env.POS_SALE_E2E_BRANCH_SLUG;
const username = process.env.POS_SALE_E2E_OPERATOR_EMAIL;
const password = process.env.POS_SALE_E2E_OPERATOR_PASSWORD;

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
  if (!fs.existsSync(saleMerchantAuthStatePath)) return false;

  const context = await browser.newContext({ storageState: saleMerchantAuthStatePath });
  const page = await context.newPage();
  try {
    return await canOpenProtectedStore(page);
  } finally {
    await context.close();
  }
}

async function createStoredSession(browser) {
  if (!branchSlug || !username || !password) {
    throw new Error(
      'Sale E2E auth requires POS_SALE_E2E_BRANCH_SLUG, POS_SALE_E2E_OPERATOR_EMAIL, and POS_SALE_E2E_OPERATOR_PASSWORD.'
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
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

    const loginResponse = await page.waitForResponse(isLoginRequest, { timeout: 10_000 }).catch(() => null);
    if (loginResponse) {
      const loginBody = await loginResponse.text();
      if (!loginResponse.ok()) {
        throw new Error(`Sale E2E login failed with HTTP ${loginResponse.status()}: ${loginBody}`);
      }
    } else {
      await page.waitForTimeout(500);
      if (failedLoginRequest) {
        throw new Error(
          `Sale E2E login request failed: ${failedLoginRequest.failure()?.errorText || 'UNKNOWN_NETWORK_ERROR'} (${failedLoginRequest.url()})`
        );
      }
      throw new Error(`Sale E2E login produced no login response. Current URL: ${page.url()}`);
    }

    await page.waitForTimeout(500);
    if (!(await canOpenProtectedStore(page))) {
      throw new Error(
        `Sale E2E login succeeded but protected store route redirected to ${page.url()}. Confirm access to ${branchSlug}.`
      );
    }

    fs.mkdirSync(path.dirname(saleMerchantAuthStatePath), { recursive: true });
    await context.storageState({ path: saleMerchantAuthStatePath });
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch();
try {
  if (await isStoredSessionValid(browser)) {
    console.log(`Sale E2E auth state: REUSED (${branchSlug})`);
  } else {
    await createStoredSession(browser);
    console.log(`Sale E2E auth state: CREATED (${branchSlug})`);
  }
} finally {
  await browser.close();
}
