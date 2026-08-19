import { resolveDocumentPresentation } from './presentationConfig.js';

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const text = (value) => String(value ?? '').trim();

const blockContent = (presentation, blockType) => {
  const block = presentation?.resolved?.blocks?.[blockType];
  if (!isObject(block) || block.visible === false) return '';
  return text(block.content);
};

const resolveFinanceOperationalPresentation = ({
  storeConfig,
  documentPurpose,
  presentationSnapshot,
  perDocumentOverride,
} = {}) => {
  const presentation = resolveDocumentPresentation({
    storeConfig,
    documentPurpose,
    issuedSnapshot: presentationSnapshot,
    perDocumentOverride,
  });

  return {
    ...presentation,
    notes: blockContent(presentation, 'NOTES'),
    customFooter: blockContent(presentation, 'CUSTOM_FOOTER'),
    signatureConfig: presentation?.resolved?.blocks?.SIGNATURES || null,
  };
};

export {
  blockContent,
  resolveFinanceOperationalPresentation,
};
