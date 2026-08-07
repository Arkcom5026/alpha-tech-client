import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  loadSaleDocument,
  useSaleDocumentLineEditor,
} from '@/features/sales/documents/workspace';
import DeliveryNoteDocumentState from '../components/workspace/DeliveryNoteDocumentState';
import DeliveryNotePrintShell from '../print/workspace/components/DeliveryNotePrintShell';
import {
  buildDeliveryNoteBranchConfig,
  prepareDeliveryNoteSaleItems,
} from '../print/workspace/policies/deliveryNotePrintPolicy';

const PrintDeliveryNotePage = () => {
  const { saleId } = useParams();
  const [currentSale, setCurrentSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [hideDate, setHideDate] = useState(false);

  const reloadSaleDocument = useCallback(async () => {
    if (!saleId) {
      setCurrentSale(null);
      return null;
    }
    const sale = await loadSaleDocument({ saleId });
    setCurrentSale(sale || null);
    return sale || null;
  }, [saleId]);

  const {
    editingLineKey,
    lineDrafts,
    savingLineKey,
    error: editorError,
    actions: documentLineActions,
  } = useSaleDocumentLineEditor({ saleId, reload: reloadSaleDocument });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!saleId) {
        if (isMounted) {
          setCurrentSale(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setPageError('');
      documentLineActions.clearError();
      setCurrentSale(null);

      try {
        const sale = await loadSaleDocument({ saleId });
        if (isMounted) setCurrentSale(sale || null);
      } catch (error) {
        if (isMounted) {
          setPageError(
            error?.response?.data?.error ||
              error?.response?.data?.message ||
              error?.message ||
              'ไม่สามารถโหลดข้อมูลใบส่งสินค้าได้'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [saleId]);

  const preparedSaleItems = useMemo(
    () => prepareDeliveryNoteSaleItems(currentSale),
    [currentSale]
  );
  const preparedConfig = useMemo(
    () => buildDeliveryNoteBranchConfig(currentSale),
    [currentSale]
  );
  const error = pageError || editorError;

  if (isLoading) {
    return <DeliveryNoteDocumentState status="loading" message="ระบบกำลังโหลดข้อมูลและจัดเตรียมเอกสารสำหรับพิมพ์" />;
  }

  if (error) {
    return <DeliveryNoteDocumentState status="error" message={error} />;
  }

  if (!currentSale) {
    return <DeliveryNoteDocumentState status="empty" message="ไม่พบรายการขายที่ใช้สร้างใบส่งสินค้านี้" />;
  }

  return (
    <DeliveryNotePrintShell
      sale={currentSale}
      hideDate={hideDate}
      setHideDate={setHideDate}
      saleItems={preparedSaleItems}
      config={preparedConfig}
      editingLineKey={editingLineKey}
      lineDrafts={lineDrafts}
      savingLineKey={savingLineKey}
      onToggleDocumentLineEdit={documentLineActions.toggle}
      onChangeDocumentLineDraft={documentLineActions.change}
      onSaveDocumentLine={documentLineActions.save}
    />
  );
};

export default PrintDeliveryNotePage;
