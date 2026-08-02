// Real Browser E2E for Repair Intake Completion.
// No API interception, mock response, or client-store injection is allowed.
// Provision a fresh Test-DB fixture and run the paired Test-DB API server first.

import { test, expect } from '@playwright/test';
import { repairIntakeSelectors } from './repairIntakeCompletion.selectors';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const operatorEmail = process.env.E2E_TEST_USERNAME;
const operatorPassword = process.env.E2E_TEST_PASSWORD;
const branchSlug = process.env.REPAIR_INTAKE_E2E_BRANCH_SLUG;
const repairJobId = process.env.REPAIR_INTAKE_E2E_JOB_ID;
const repairJobNo = process.env.REPAIR_INTAKE_E2E_JOB_NO;

const requiredEnvironment = {
  E2E_TEST_USERNAME: operatorEmail,
  E2E_TEST_PASSWORD: operatorPassword,
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

test.describe('Repair intake completion (Test DB)', () => {
  test('blocks work before evidence, then accepts completed intake evidence', async ({ page }) => {
    test.skip(
      missingEnvironment.length > 0,
      `Set ${missingEnvironment.join(', ')} from the Test-DB fixture before running this Browser E2E.`
    );

    await page.goto(`${baseUrl}/login`);
    await page.locator(repairIntakeSelectors.loginIdentity).fill(operatorEmail);
    await page.locator(repairIntakeSelectors.loginPassword).fill(operatorPassword);
    await page.getByRole('button', { name: 'เข้าสู่ระบบด้วยรหัสผ่าน' }).click();
    await page.waitForURL(new RegExp(`/${branchSlug}/pos/`), { timeout: 15_000 });

    const detailResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'GET'
        && response.url().includes(`/api/repairs/jobs/${repairJobId}`),
      { timeout: 15_000 }
    );

    await page.goto(`${baseUrl}/${branchSlug}/pos/services/repairs/${repairJobId}`);
    const detailResponse = await detailResponsePromise;
    const detailBody = await detailResponse.text();

    expect(
      detailResponse.ok(),
      `Repair detail API failed with HTTP ${detailResponse.status()}: ${detailBody}. `
        + 'Start the Server with npm run start:test-database so Browser runtime uses the same Test DB as the fixture.'
    ).toBeTruthy();

    await expect(page.getByRole('heading', { name: repairJobNo })).toBeVisible();

    const statusSelect = page.locator(repairIntakeSelectors.statusSelect).first();
    await expect(statusSelect).toBeVisible();
    await expect(statusSelect.locator('option[value="COMPLETED"]')).toHaveCount(0);

    await statusSelect.selectOption('IN_PROGRESS');
    await page.getByPlaceholder('บันทึกความคืบหน้า').fill('E2E blocked before intake evidence');

    const blockedResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'PATCH'
        && response.url().includes(`/api/repairs/jobs/${repairJobId}/status`),
      { timeout: 15_000 }
    );
    await page.getByRole('button', { name: 'บันทึกสถานะ' }).click();
    const blockedResponse = await blockedResponsePromise;
    expect(blockedResponse.status()).toBe(409);
    await expect(page.getByText(/หลักฐานการรับเครื่อง.*ไม่ครบ|บันทึกหลักฐานการรับเครื่อง/i)).toBeVisible();

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
        && response.url().includes(`/api/repairs/jobs/${repairJobId}/intake-evidence`)
        && response.ok(),
      { timeout: 30_000 }
    );
    await page.getByRole('button', { name: 'บันทึกหลักฐานดิจิทัล' }).click();
    await evidenceResponsePromise;
    await expect(page.getByText(/ยืนยันโดย Repair E2E Customer/)).toBeVisible();

    await statusSelect.selectOption('IN_PROGRESS');
    await page.getByPlaceholder('บันทึกความคืบหน้า').fill('E2E intake evidence complete');

    const successResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'PATCH'
        && response.url().includes(`/api/repairs/jobs/${repairJobId}/status`)
        && response.ok(),
      { timeout: 15_000 }
    );
    await page.getByRole('button', { name: 'บันทึกสถานะ' }).click();
    await successResponsePromise;

    await expect(page.getByText('กำลังตรวจ/ซ่อม', { exact: true })).toBeVisible();
  });
});
