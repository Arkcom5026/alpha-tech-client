import { buildStoreDocumentHeader } from '@/features/branch/documentHeader/documentHeaderConfig';
import { resolveFinanceOperationalPresentation } from '@/features/printing/presentation/financeOperationalPresentation';

const DOCUMENT_PURPOSE = 'REFUND_RECEIPT';
const A4_RENDERER = 'A4';
const text = (value, max = 240) => String(value ?? '').trim().slice(0, max);
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const getRefundReceiptSnapshot = (saleReturn) => {
  const snapshot = saleReturn?.presentationSnapshots?.[A4_RENDERER];
  return isObject(snapshot) ? snapshot : null;
};

const resolveRefundReceiptPresentation = ({ saleReturn, branch } = {}) => {
  const presentationSnapshot = getRefundReceiptSnapshot(saleReturn);
  const presentation = resolveFinanceOperationalPresentation({
    storeConfig: branch?.documentHeaderConfig,
    documentPurpose: DOCUMENT_PURPOSE,
    presentationSnapshot,
  });

  return {
    ...presentation,
    notes: text(presentation.notes),
    customFooter: text(presentation.customFooter),
    presentationSnapshot,
  };
};

const resolveRefundReceiptStoreIdentity = ({ branch, presentationSnapshot } = {}) => {
  const frozen = presentationSnapshot?.businessSnapshot?.storeIdentity;
  return isObject(frozen) ? frozen : (branch || {});
};

const buildRefundReceiptHeader = ({ branch, presentation, presentationSnapshot } = {}) => {
  const storeIdentity = resolveRefundReceiptStoreIdentity({ branch, presentationSnapshot });
  const resolvedHeader = presentation?.resolved?.header || {};
  const authorityBranch = {
    ...storeIdentity,
    documentHeaderConfig: {
      version: 2,
      shared: {},
      documents: {
        [DOCUMENT_PURPOSE]: { header: resolvedHeader },
      },
    },
  };
  return buildStoreDocumentHeader({ branch: authorityBranch, documentType: DOCUMENT_PURPOSE });
};

export {
  A4_RENDERER,
  DOCUMENT_PURPOSE,
  buildRefundReceiptHeader,
  getRefundReceiptSnapshot,
  resolveRefundReceiptPresentation,
  resolveRefundReceiptStoreIdentity,
};
