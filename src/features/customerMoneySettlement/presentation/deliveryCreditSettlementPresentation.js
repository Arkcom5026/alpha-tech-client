import { buildStoreDocumentHeader } from '@/features/branch/documentHeader/documentHeaderConfig';
import { resolveFinanceOperationalPresentation } from '@/features/printing/presentation/financeOperationalPresentation';

const DOCUMENT_PURPOSE = 'DELIVERY_CREDIT_SETTLEMENT';
const A4_RENDERER = 'A4';
const THERMAL_RENDERER = 'THERMAL_80MM';
const text = (value, max = 240) => String(value ?? '').trim().slice(0, max);
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const rendererFamilyForMode = (mode) => String(mode || '').toUpperCase() === 'SHORT'
  ? THERMAL_RENDERER
  : A4_RENDERER;

const getDeliveryCreditSettlementSnapshot = (record, mode) => {
  const rendererFamily = rendererFamilyForMode(mode);
  const snapshot = record?.presentationSnapshots?.[rendererFamily];
  return isObject(snapshot) ? snapshot : null;
};

const resolveDeliveryCreditSettlementPresentation = ({ record, mode } = {}) => {
  const presentationSnapshot = getDeliveryCreditSettlementSnapshot(record, mode);
  const presentation = resolveFinanceOperationalPresentation({
    storeConfig: record?.branch?.documentHeaderConfig,
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

const resolveDeliveryCreditSettlementStoreIdentity = ({ record, presentationSnapshot } = {}) => {
  const frozen = presentationSnapshot?.businessSnapshot?.storeIdentity;
  return isObject(frozen) ? frozen : (record?.branch || {});
};

const buildDeliveryCreditSettlementHeader = ({ record, presentation, presentationSnapshot } = {}) => {
  const storeIdentity = resolveDeliveryCreditSettlementStoreIdentity({ record, presentationSnapshot });
  const resolvedHeader = presentation?.resolved?.header || {};
  const branch = {
    ...storeIdentity,
    documentHeaderConfig: {
      version: 2,
      shared: {},
      documents: {
        [DOCUMENT_PURPOSE]: { header: resolvedHeader },
      },
    },
  };
  return buildStoreDocumentHeader({ branch, documentType: DOCUMENT_PURPOSE });
};

export {
  A4_RENDERER,
  DOCUMENT_PURPOSE,
  THERMAL_RENDERER,
  buildDeliveryCreditSettlementHeader,
  getDeliveryCreditSettlementSnapshot,
  rendererFamilyForMode,
  resolveDeliveryCreditSettlementPresentation,
  resolveDeliveryCreditSettlementStoreIdentity,
};
