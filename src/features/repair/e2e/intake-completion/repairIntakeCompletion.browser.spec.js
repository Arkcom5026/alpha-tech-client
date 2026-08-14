// Real Browser E2E for Repair Intake Completion.
// No API interception, mock response, or client-store injection is allowed.
// Provision a fresh fixture through the paired Server E2E package first.

import { test, expect } from '@playwright/test';
import { merchantAuthStatePath } from '../../../e2e/auth/merchantAuthState.js';
import { repairIntakeSelectors } from './repairIntakeCompletion.selectors';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const branchSlug = process.env.REPAIR_INTAKE_E2E_BRANCH_SLUG;
const repairJobId = process.env.REPAIR_INTAKE_E2E_JOB_ID;
const repairJobNo = process.env.REPAIR_INTAKE_E2E_JOB_NO;

const requiredEnvironment = {
  REPAIR_INTAKE_E2E_BRANCH_SLUG: branchSlug,
  REPAIR_INTAKE_E2E_JOB_ID: repairJobId,
  REPAIR_INTAKE_E2E_JOB_NO: repairJobNo,
};

const missingEnvironment = Object.entries(requiredEnvironment)
  .filter(([, value]) => !value)
  .map(([name]) => name);

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=',
  'base64'
);

test.use({
  storageState: merchantAuthStatePath,
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

test.describe('Repair intake completion (selected E2E authority)', () => {
  test('blocks work before evidence, then accepts completed intake evidence', async ({ page }) => {
    test.setTimeout(60_000);
    if (missingEnvironment.length > 0) {
      throw new Error(
        `Missing Repair Browser E2E environment: ${missingEnvironment.join(', ')}. `
          + 'Use the values emitted by the paired Server fixture before running this test.'
      );
    }

    const detailResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'GET'
        && response.url().includes(`/api/repairs/jobs/${repairJobId}`),
      { timeout: 15_000 }
    );

    await page.goto(`${baseUrl}/${branchSlug}/pos/services/repairs/${repairJobId}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();

    if (/\/login(?:\?|$)|\/partner-portal(?:\/login)?(?:\?|$)/i.test(page.url())) {
      throw new Error(
        'Stored Merchant E2E authentication is unavailable or expired. Run the auth bootstrap before this spec.'
      );
    }

    const detailResponse = await detailResponsePromise;
    const detailBody = await detailResponse.text();

    expect(
      detailResponse.ok(),
      `Repair detail API failed with HTTP ${detailResponse.status()}: ${detailBody}. `
        + 'Confirm that the API runtime uses the same authority as the fixture.'
    ).toBeTruthy();

    await expect(page.getByRole('heading', { name: repairJobNo })).toBeVisible();

    const acceptancePanel = page.locator(repairIntakeSelectors.jobAcceptancePanel).first();
    const acceptJobButton = acceptancePanel.getByRole('button');
    await expect(acceptJobButton).toBeVisible();

    const blockedResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'POST'
        && response.url().includes(`/api/repairs/jobs/${repairJobId}/workflow/commands`),
      { timeout: 15_000 }
    );
    await acceptJobButton.click();
    const blockedResponse = await blockedResponsePromise;
    const blockedBodyText = await blockedResponse.text();
    let blockedBody = null;
    try {
      blockedBody = JSON.parse(blockedBodyText);
    } catch (_) {}

    expect(
      blockedResponse.status(),
      `Expected intake-evidence gate to block status change, received HTTP ${blockedResponse.status()}: ${blockedBodyText}`
    ).toBe(409);

    const blockedSignal = [
      blockedBody?.code,
      blockedBody?.error,
      blockedBody?.message,
      blockedBodyText,
    ].filter(Boolean).join(' ');

    expect(
      blockedSignal,
      `409 response did not identify the intake-evidence gate: ${blockedBodyText}`
    ).toMatch(/intake|evidence|หลักฐาน|รับเครื่อง/i);

    // The evidence panel is intentionally deferred until it approaches the viewport.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '+ เพิ่มหลักฐาน' }).click();
    await page.locator(repairIntakeSelectors.evidenceFileInput).setInputFiles({
      name: `repair-intake-${Date.now()}.png`,
      mimeType: 'image/png',
      buffer: onePixelPng,
    });
    await page.getByPlaceholder('ลูกค้าหรือผู้ส่งมอบพิมพ์ชื่อเพื่อยืนยัน').fill('Repair E2E Customer');
    await page.getByText(/ยืนยันว่าอุปกรณ์ อาการ และสิ่งที่นำมาด้วยถูกต้อง/).click();

    const evidenceResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'POST'
        && response.url().includes(`/api/repairs/jobs/${repairJobId}/intake-evidence`),
      { timeout: 30_000 }
    );
    await page.getByRole('button', { name: 'บันทึกหลักฐานดิจิทัล' }).click();
    const evidenceResponse = await evidenceResponsePromise;
    const evidenceBodyText = await evidenceResponse.text();
    let evidenceBody = null;
    try {
      evidenceBody = JSON.parse(evidenceBodyText);
    } catch (_) {}

    expect(
      evidenceResponse.ok(),
      `Saving intake evidence failed with HTTP ${evidenceResponse.status()}: ${evidenceBodyText}`
    ).toBeTruthy();

    const savedEvidence = evidenceBody?.data ?? evidenceBody;
    expect(
      savedEvidence?.photos?.length,
      `Intake evidence API succeeded without persisting a condition photo: ${evidenceBodyText}`
    ).toBeGreaterThan(0);
    expect(savedEvidence?.completion?.hasConditionPhoto).toBe(true);
    expect(savedEvidence?.completion?.hasConsent).toBe(true);

    await expect(page.getByText(/ยืนยันโดย Repair E2E Customer/)).toBeVisible();
    await expect(page.getByText('ยังไม่มีภาพหลักฐาน')).toHaveCount(0);
    await expect(page.getByRole('img', { name: /หลักฐานรับเครื่อง 1/i })).toBeVisible();

    const successResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'POST'
        && response.url().includes(`/api/repairs/jobs/${repairJobId}/workflow/commands`),
      { timeout: 15_000 }
    );
    await acceptJobButton.click();
    const successResponse = await successResponsePromise;
    const successBodyText = await successResponse.text();

    expect(
      successResponse.ok(),
      `Job acceptance failed with HTTP ${successResponse.status()}: ${successBodyText}`
    ).toBeTruthy();

    await expect(acceptancePanel).toHaveCount(0);

    const repairActionPanel = page.locator('section:has-text("Primary Action")')
      .filter({ hasNotText: 'Job Acceptance' })
      .first();
    const startRepairButton = repairActionPanel.getByRole('button').first();
    await expect(startRepairButton).toBeVisible();

    const startRepairResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'POST'
        && response.url().includes(`/api/repairs/jobs/${repairJobId}/workflow/commands`),
      { timeout: 15_000 }
    );
    await startRepairButton.click();
    const startRepairResponse = await startRepairResponsePromise;
    const startRepairBodyText = await startRepairResponse.text();
    expect(
      startRepairResponse.ok(),
      `Starting repair failed with HTTP ${startRepairResponse.status()}: ${startRepairBodyText}`
    ).toBeTruthy();
  });
});
