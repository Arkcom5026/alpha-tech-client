import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import useInputTaxReceiptWorkspaceController from './useInputTaxReceiptWorkspaceController';
import { sumReceiptAllocations } from '../utils/inputTaxReceiptLink';

const useInputTaxReceiptCreateLinkController = () => {
  const controller = useInputTaxReceiptWorkspaceController();
  const pendingAutoLinkRef = useRef(false);

  const toggleCreateDocument = useCallback(() => {
    if (controller.showCreateDocument) {
      controller.setShowCreateDocument(false);
      return;
    }

    if (!controller.selectedSupplier || controller.selectedReceipts.length === 0) {
      toast.warning('กรุณาเลือกใบรับสินค้าก่อนสร้างใบกำกับภาษีซื้อ');
      return;
    }

    const totals = sumReceiptAllocations(controller.selectedReceipts);
    controller.changeInvoice('subtotalAmount', String(totals.subtotalAmount ?? 0));
    controller.changeInvoice('taxAmount', String(totals.vatAmount ?? 0));
    controller.changeInvoice('totalAmount', String(totals.totalAmount ?? 0));
    controller.setShowCreateDocument(true);
  }, [controller]);

  const createAndAutoLinkInputTaxDocument = useCallback(async (event) => {
    pendingAutoLinkRef.current = true;
    controller.setSelectedDocumentId('');
    await controller.createInputTaxDocument(event);
  }, [controller]);

  useEffect(() => {
    if (!pendingAutoLinkRef.current) return;
    if (controller.submitting || !controller.selectedDocumentId) return;

    pendingAutoLinkRef.current = false;
    Promise.resolve(controller.attachSelected()).catch(() => {});
  }, [controller.attachSelected, controller.selectedDocumentId, controller.submitting]);

  return {
    ...controller,
    toggleCreateDocument,
    createAndAutoLinkInputTaxDocument,
  };
};

export default useInputTaxReceiptCreateLinkController;
