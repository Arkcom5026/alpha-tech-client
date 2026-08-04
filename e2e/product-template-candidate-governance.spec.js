// Product Template Candidate Governance Browser E2E.
// This certification deliberately uses the real local Server and Test DB.
// API interception and mocks are forbidden.

import process from 'node:process';
import { test, expect } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const username = process.env.E2E_SUPERADMIN_USERNAME;
const password = process.env.E2E_SUPERADMIN_PASSWORD;
const shopSlug = process.env.E2E_SUPERADMIN_SHOP_SLUG;
const rejectCandidateId = process.env.PRODUCT_TEMPLATE_E2E_REJECT_CANDIDATE_ID;
const mergeCandidateId = process.env.PRODUCT_TEMPLATE_E2E_MERGE_CANDIDATE_ID;
const promoteCandidateId = process.env.PRODUCT_TEMPLATE_E2E_PROMOTE_CANDIDATE_ID;
const targetTemplateProductId = process.env.PRODUCT_TEMPLATE_E2E_TARGET_TEMPLATE_PRODUCT_ID;

const requiredEnvironment = {
  E2E_SUPERADMIN_USERNAME: username,
  E2E_SUPERADMIN_PASSWORD: password,
  PRODUCT_TEMPLATE_E2E_REJECT_CANDIDATE_ID: rejectCandidateId,
  PRODUCT_TEMPLATE_E2E_MERGE_CANDIDATE_ID: mergeCandidateId,
  PRODUCT_TEMPLATE_E2E_PROMOTE_CANDIDATE_ID: promoteCandidateId,
  PRODUCT_TEMPLATE_E2E_TARGET_TEMPLATE_PRODUCT_ID: targetTemplateProductId,
};

const missingEnvironment = Object.entries(requiredEnvironment)
  .filter(([, value]) => !value)
  .map(([name]) => name);

const queuePath = shopSlug
  ? `/${shopSlug}/superadmin/catalog/candidates`
  : '/superadmin/catalog/candidates';

const login = async (page) => {
  await page.goto(`${baseUrl}/login`);
  await page.locator('input[placeholder="อีเมลหรือเบอร์โทรศัพท์"]').fill(username);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'เข้าสู่ระบบด้วยรหัสผ่าน' }).click();
  await page.waitForLoadState('networkidle');
};

const openCandidate = async (page, candidateId) => {
  await page.goto(`${baseUrl}${queuePath}/${candidateId}`);
  await expect(page.getByRole('heading', { name: `Candidate #${candidateId}` })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Source Snapshot' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Proposed Template Data' })).toBeVisible();
};

const waitForCommand = (page, command) =>
  page.waitForResponse(
    (response) => response.request().method() === 'POST'
      && response.url().includes(`/api/product-templates/candidates/`)
      && response.url().endsWith(`/${command}`),
    { timeout: 15_000 }
  );

test.describe.serial('Product Template Candidate Governance (Test DB)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      missingEnvironment.length > 0,
      `Set ${missingEnvironment.join(', ')} from the Test-DB fixture before running this browser E2E.`
    );
    await login(page);
  });

  test('reviewer starts review and rejects a candidate with audited reason', async ({ page }) => {
    await openCandidate(page, rejectCandidateId);

    const startReviewResponse = waitForCommand(page, 'start-review');
    await page.getByRole('button', { name: 'Start Review' }).click();
    expect((await startReviewResponse).ok()).toBeTruthy();
    await expect(page.getByRole('heading', { name: 'Review Decision' })).toBeVisible();

    const note = `Browser E2E reject ${Date.now()}`;
    await page.getByPlaceholder('เหตุผลหรือบันทึกประกอบการตัดสินใจ').fill(note);
    const rejectResponse = waitForCommand(page, 'reject');
    await page.getByRole('button', { name: 'Reject', exact: true }).click();
    const response = await rejectResponse;
    expect(response.ok()).toBeTruthy();
    await expect(page.getByText('ไม่ผ่านการตรวจ')).toBeVisible();
    await expect(page.getByText(note)).toBeVisible();
  });

  test('reviewer merges a candidate into an existing template', async ({ page }) => {
    await openCandidate(page, mergeCandidateId);

    if (await page.getByRole('button', { name: 'Start Review' }).isVisible().catch(() => false)) {
      const startReviewResponse = waitForCommand(page, 'start-review');
      await page.getByRole('button', { name: 'Start Review' }).click();
      expect((await startReviewResponse).ok()).toBeTruthy();
    }

    await page.getByPlaceholder('Target Template Product ID').fill(String(targetTemplateProductId));
    await page.getByPlaceholder('เหตุผลหรือบันทึกประกอบการตัดสินใจ').fill(`Browser E2E merge ${Date.now()}`);
    const mergeResponse = waitForCommand(page, 'merge');
    await page.getByRole('button', { name: 'Merge', exact: true }).click();
    const response = await mergeResponse;
    expect(response.ok()).toBeTruthy();
    await expect(page.getByText('รวมกับ Template เดิม')).toBeVisible();
    await expect(page.getByText(new RegExp(`#${targetTemplateProductId}`))).toBeVisible();
  });

  test('reviewer promotes a candidate into a new catalog-safe template', async ({ page }) => {
    await openCandidate(page, promoteCandidateId);

    if (await page.getByRole('button', { name: 'Start Review' }).isVisible().catch(() => false)) {
      const startReviewResponse = waitForCommand(page, 'start-review');
      await page.getByRole('button', { name: 'Start Review' }).click();
      expect((await startReviewResponse).ok()).toBeTruthy();
    }

    await page.getByPlaceholder('เหตุผลหรือบันทึกประกอบการตัดสินใจ').fill(`Browser E2E promote ${Date.now()}`);
    await expect(page.getByPlaceholder('Template name')).not.toHaveValue('');
    await expect(page.getByPlaceholder('Product Type ID *')).not.toHaveValue('');

    const promoteResponse = waitForCommand(page, 'promote');
    await page.getByRole('button', { name: 'Promote', exact: true }).click();
    const response = await promoteResponse;
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const promotedProductId = body?.targetTemplateProductId
      || body?.candidate?.targetTemplateProductId
      || body?.data?.targetTemplateProductId
      || body?.data?.candidate?.targetTemplateProductId;
    expect(promotedProductId, 'Promote response must contain targetTemplateProductId').toBeTruthy();
    await expect(page.getByText('สร้าง Template แล้ว')).toBeVisible();
    await expect(page.getByText(new RegExp(`#${promotedProductId}`))).toBeVisible();
  });
});
