import { useCallback, useEffect, useRef } from 'react';
import { feedback } from '@/design-system/feedback';
import useInputTaxReceiptWorkspaceController from './useInputTaxReceiptWorkspaceController';
import { sumReceiptAllocations } from '../utils/inputTaxReceiptLink';

const useInputTaxReceiptCreateLinkController = () => {
  const controller = useInputTaxReceiptWorkspaceController();
  const pendingAutoLinkRef = useRef(false);
  const {
    selectedSupplier,
    selectedReceipts,
    eligibleDocuments,
    showCreateDocument,
    selectedDocumentId,
    submitting,
    changeInvoice,
    setSelectedDocumentId,
    setShowCreateDocument,
    createInputTaxDocument,
    attachSelected,
  } = controller;

  const openCreateDocument = useCallback(() => {
    if (!selectedSupplier || selectedReceipts.length === 0) {
      feedback.warning('กรุณาเลือกใบรับสินค้าก่อนสร้างใบกำกับภาษีซื้อ');
      return;
    }

    const totals = sumReceiptAllocations(selectedReceipts);
    changeInvoice('subtotalAmount', String(totals.subtotalAmount ?? 0));
    changeInvoice('taxAmount', String(totals.vatAmount ?? 0));
    changeInvoice('totalAmount', String(totals.totalAmount ?? 0));
    setSelectedDocumentId('');
    setShowCreateDocument(true);
  }, [changeInvoice, selectedReceipts, selectedSupplier, setSelectedDocumentId, setShowCreateDocument]);

  const toggleCreateDocument = useCallback(() => {
    if (showCreateDocument) {
      if (eligibleDocuments.length === 0 && selectedReceipts.length > 0) return;
      setShowCreateDocument(false);
      return;
    }

    openCreateDocument();
  }, [eligibleDocuments.length, openCreateDocument, selectedReceipts.length, setShowCreateDocument, showCreateDocument]);

  useEffect(() => {
    if (selectedReceipts.length === 0) return;
    if (eligibleDocuments.length > 0) return;
    if (showCreateDocument) return;

    openCreateDocument();
  }, [eligibleDocuments.length, openCreateDocument, selectedReceipts.length, showCreateDocument]);

  const createAndAutoLinkInputTaxDocument = useCallback(async (event) => {
    pendingAutoLinkRef.current = true;
    setSelectedDocumentId('');
    await createInputTaxDocument(event);
  }, [createInputTaxDocument, setSelectedDocumentId]);

  useEffect(() => {
    if (!pendingAutoLinkRef.current) return;
    if (submitting || !selectedDocumentId) return;

    pendingAutoLinkRef.current = false;
    Promise.resolve(attachSelected()).catch(() => {});
  }, [attachSelected, selectedDocumentId, submitting]);

  return {
    ...controller,
    toggleCreateDocument,
    createAndAutoLinkInputTaxDocument,
  };
};

export default useInputTaxReceiptCreateLinkController;