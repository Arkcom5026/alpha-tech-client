import apiClient from '@/utils/apiClient';
import { getInputTaxErrorMessage } from '@/features/tax/contracts/inputTaxErrorMessages';

const unwrapData = (response) => response?.data?.data ?? response?.data;

const positiveId = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'INPUT_TAX_FILING_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return parsed;
};

const periodId = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    const error = new Error('ไม่พบรอบภาษี');
    error.code = 'INPUT_TAX_FILING_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

export const getInputTaxFilingWorkspace = async ({ branchId, taxPeriodId }) => {
  const response = await apiClient.get(
    `/tax-intake/input-documents/filing/periods/${periodId(taxPeriodId)}/workspace`,
    { params: { branchId: positiveId(branchId, 'branchId') } },
  );
  return unwrapData(response);
};

export const prepareInputTaxFilingBatch = async ({ branchId, taxPeriodId }) => {
  const response = await apiClient.post(
    `/tax-intake/input-documents/filing/periods/${periodId(taxPeriodId)}/prepare`,
    { branchId: positiveId(branchId, 'branchId') },
  );
  return unwrapData(response);
};

export const selectInputTaxDocumentForFiling = async ({ branchId, batchId, taxDocumentId }) => {
  const response = await apiClient.post(
    `/tax-intake/input-documents/filing/batches/${positiveId(batchId, 'batchId')}/documents/${positiveId(taxDocumentId, 'taxDocumentId')}/select`,
    { branchId: positiveId(branchId, 'branchId') },
  );
  return unwrapData(response);
};

export const removeInputTaxDocumentFromFiling = async ({
  branchId,
  batchId,
  taxDocumentId,
  reason,
  version,
}) => {
  const response = await apiClient.post(
    `/tax-intake/input-documents/filing/batches/${positiveId(batchId, 'batchId')}/documents/${positiveId(taxDocumentId, 'taxDocumentId')}/remove`,
    {
      branchId: positiveId(branchId, 'branchId'),
      reason: String(reason || '').trim(),
      version: positiveId(version, 'version'),
    },
  );
  return unwrapData(response);
};

export const inputTaxFilingErrorMessage = (error) => getInputTaxErrorMessage(
  error,
  error?.message || 'ไม่สามารถจัดเตรียมชุดภาษีซื้อได้',
);
