import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import StoreDocumentHeaderScope from '@/features/branch/documentHeader/StoreDocumentHeaderScope';
import {
  loadSaleDeliveryNoteAuthority,
  loadSaleDocument,
  useSaleDocumentLineEditor,
} from '@/features/sales/documents/workspace';
import { getConsolidatedDeliveryPrintable } from '@/features/combinedBilling/api/combinedBillingApi';
import {
  buildConsolidatedSaleDocument,
  isConsolidatedDocumentSource,
} from '@/features/combinedBilling/adapters/consolidatedDocumentAdapter';
import DeliveryNotePresentationFooter from '../components/DeliveryNotePresentationFooter';
import DeliveryNoteDocumentState from '../components/workspace/DeliveryNoteDocumentState';
import {
  applyDeliveryNoteHeaderPresentation,
  deliveryNoteTypographyPx,
  resolveDeliveryNoteFooterContent,
  resolveDeliveryNotePresentation,
} from '../presentation/deliveryNotePresentation';
import DeliveryNotePrintShell from '../print/workspace/components/DeliveryNotePrintShell';
import {
  buildDeliveryNoteBranchConfig,
  prepareDeliveryNoteSaleItems,
} from '../print/workspace/policies/deliveryNotePrintPolicy';

const PrintDeliveryNotePage = () => {
  const { saleId } = useParams();
  const [searchParams] = useSearchParams();
  const sourceType = String(searchParams.get('sourceType') || 'SALE').toUpperCase();
  const sourceId = searchParams.get('sourceId') || saleId;
  const isConsolidated = isConsolidatedDocumentSource(sourceType);
  const [currentSale, setCurrentSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [hideDate, setHideDate] = useState(false);

  const loadStandardSale = useCallback(async () => {
    const [sale, deliveryNoteAuthority] = await Promise.all([
      loadSaleDocument({ saleId: sourceId }),
      loadSaleDeliveryNoteAuthority({ saleId: sourceId }),
    ]);
    return sale ? { ...sale, deliveryNoteAuthority } : sale;
  }, [sourceId]);

  const loadCurrentDocument = useCallback(async () => {
    if (!sourceId) {
      setCurrentSale(null);
      return null;
    }

    if (isConsolidated) {
      const printable = await getConsolidatedDeliveryPrintable(sourceId);
      const sale = buildConsolidatedSaleDocument(printable);
      setCurrentSale(sale || null);
      return sale || null;
    }

    const sale = await loadStandardSale();
    setCurrentSale(sale || null);
    return sale || null;
  }, [isConsolidated, loadStandardSale, sourceId]);

  const {
    editingLineKey,
    lineDrafts,
    savingLineKey,
    error: editorError,
    actions: documentLineActions,
  } = useSaleDocumentLineEditor({
    saleId: isConsolidated ? null : saleId,
    reload: loadCurrentDocument,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!sourceId) {
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
        const sale = isConsolidated
          ? buildConsolidatedSaleDocument(await getConsolidatedDeliveryPrintable(sourceId))
          : await loadStandardSale();
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
  }, [documentLineActions, isConsolidated, loadStandardSale, sourceId]);

  const preparedSaleItems = useMemo(
    () => prepareDeliveryNoteSaleItems(currentSale),
    [currentSale]
  );
  const presentation = useMemo(
    () => resolveDeliveryNotePresentation({
      authority: currentSale?.deliveryNoteAuthority,
      branch: currentSale?.branch,
    }),
    [currentSale?.branch, currentSale?.deliveryNoteAuthority]
  );
  const preparedConfig = useMemo(
    () => applyDeliveryNoteHeaderPresentation({
      config: buildDeliveryNoteBranchConfig(currentSale),
      presentation,
    }),
    [currentSale, presentation]
  );
  const footerContent = useMemo(
    () => resolveDeliveryNoteFooterContent(presentation),
    [presentation]
  );
  const footerFontSize = useMemo(
    () => deliveryNoteTypographyPx(presentation, 'footer', 'md'),
    [presentation]
  );
  const error = pageError || (isConsolidated ? '' : editorError);

  if (isLoading) {
    return <DeliveryNoteDocumentState status="loading" message="ระบบกำลังโหลดข้อมูลและจัดเตรียมเอกสารสำหรับพิมพ์" />;
  }

  if (error) {
    return <DeliveryNoteDocumentState status="error" message={error} />;
  }

  if (!currentSale) {
    return <DeliveryNoteDocumentState status="empty" message="ไม่พบเอกสารที่ใช้สร้างใบส่งสินค้านี้" />;
  }

  return (
    <StoreDocumentHeaderScope config={preparedConfig}>
      <DeliveryNotePrintShell
        sale={currentSale}
        hideDate={hideDate}
        setHideDate={setHideDate}
        saleItems={preparedSaleItems}
        config={preparedConfig}
        presentationFooter={(
          <DeliveryNotePresentationFooter
            content={footerContent}
            fontSizePx={footerFontSize}
          />
        )}
        editableDocumentLines={!isConsolidated}
        editingLineKey={isConsolidated ? null : editingLineKey}
        lineDrafts={isConsolidated ? {} : lineDrafts}
        savingLineKey={isConsolidated ? null : savingLineKey}
        onToggleDocumentLineEdit={isConsolidated ? undefined : documentLineActions.toggle}
        onChangeDocumentLineDraft={isConsolidated ? undefined : documentLineActions.change}
        onSaveDocumentLine={isConsolidated ? undefined : documentLineActions.save}
      />
    </StoreDocumentHeaderScope>
  );
};

export default PrintDeliveryNotePage;
