import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  loadSaleDocument,
  useSaleDocumentLineEditor,
} from '@/features/sales/documents/workspace';
import DeliveryNoteForm from '../components/DeliveryNoteForm';
import DeliveryNoteDocumentState from '../components/workspace/DeliveryNoteDocumentState';
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
    <main className="min-h-screen bg-slate-100 px-3 py-5 text-black print:bg-white print:p-0 md:px-6 md:py-8">
      <section className="mx-auto max-w-[210mm] rounded-2xl bg-white p-3 shadow-sm print:rounded-none print:p-0 print:shadow-none md:p-5">
        <DeliveryNoteForm
          sale={currentSale}
          hideDate={hideDate}
          setHideDate={setHideDate}
          saleItems={preparedSaleItems}
          config={preparedConfig}
          editableDocumentLines
          editingLineKey={editingLineKey}
          lineDrafts={lineDrafts}
          savingLineKey={savingLineKey}
          onToggleDocumentLineEdit={documentLineActions.toggle}
          onChangeDocumentLineDraft={documentLineActions.change}
          onSaveDocumentLine={documentLineActions.save}
        />
      </section>
    </main>
  );
};

export default PrintDeliveryNotePage;
