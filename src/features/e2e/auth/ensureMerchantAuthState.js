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
  try {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('textbox', {
      name: /อีเมลหรือเบอร์โทรศัพท์|name@example\.com/i,
    }).fill(username);
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

    await page.waitForFunction(
      () => !/\/login(?:\?|$)|\/partner-portal\/login(?:\?|$)/i.test(window.location.pathname + window.location.search),
      null,
      { timeout: 20_000 }
    );

    if (!(await canOpenProtectedStore(page))) {
      throw new Error(
        `Merchant login completed but protected store route redirected to ${page.url()}. Confirm the account has access to ${branchSlug}.`
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
