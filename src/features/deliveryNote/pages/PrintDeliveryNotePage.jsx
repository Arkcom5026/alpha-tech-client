import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import StoreDocumentHeaderScope from '@/features/branch/documentHeader/StoreDocumentHeaderScope';
import {
  loadSaleDeliveryNoteAuthority,
  loadSaleDocument,
  useSaleDocumentLineEditor,
} from '@/features/sales/documents/workspace';
import { useSaleDocumentPreparation } from '@/features/sales/documents/preparation/hooks/useSaleDocumentPreparation';
import { buildPreparationPrintableItems } from '@/features/sales/documents/preparation/adapters/saleDocumentPreparationAdapter';
import { useSaleDocumentReplacement } from '@/features/sales/documents/replacement/hooks/useSaleDocumentReplacement';
import { buildReplacementPrintableItems } from '@/features/sales/documents/replacement/adapters/saleDocumentReplacementAdapter';
import { getConsolidatedDeliveryPrintable } from '@/features/combinedBilling/api/combinedBillingApi';
import {
  buildConsolidatedSaleDocument,
  isConsolidatedDocumentSource,
} from '@/features/combinedBilling/adapters/consolidatedDocumentAdapter';
import DeliveryNotePresentationFooter from '../components/DeliveryNotePresentationFooter';
import DeliveryNoteDocumentState from '../components/workspace/DeliveryNoteDocumentState';
import DeliveryNotePreparationPanel from '../components/workspace/DeliveryNotePreparationPanel';
import DeliveryNoteReplacementPanel from '../components/workspace/DeliveryNoteReplacementPanel';
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
  const navigate = useNavigate();
  const { saleId, shopSlug } = useParams();
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
    preparation,
    taxProjectionResult,
    loading: preparationLoading,
    saving: preparationSaving,
    error: preparationError,
    actions: preparationActions,
  } = useSaleDocumentPreparation({
    saleId: isConsolidated ? null : sourceId,
    enabled: !isConsolidated,
  });

  const replacementEnabled = !isConsolidated && preparation?.status === 'LOCKED';
  const {
    replacement,
    loading: replacementLoading,
    saving: replacementSaving,
    error: replacementError,
    actions: replacementActions,
  } = useSaleDocumentReplacement({
    saleId: replacementEnabled ? sourceId : null,
    enabled: replacementEnabled,
    onLocked: loadCurrentDocument,
  });

  const legacyEditorEnabled = !isConsolidated && !preparation;
  const {
    editingLineKey,
    lineDrafts,
    savingLineKey,
    error: editorError,
    actions: documentLineActions,
  } = useSaleDocumentLineEditor({
    saleId: legacyEditorEnabled ? saleId : null,
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
    // documentLineActions is intentionally omitted: the hook returns a new actions
    // object as line-edit state changes, while document loading is keyed only by source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConsolidated, loadStandardSale, sourceId]);

  const legacySaleItems = useMemo(
    () => prepareDeliveryNoteSaleItems(currentSale),
    [currentSale]
  );
  const replacementAuthorityActive = Boolean(currentSale?.deliveryNoteAuthority?.document?.replacement);
  const replacementSaleItems = useMemo(
    () => replacementAuthorityActive
      ? buildReplacementPrintableItems(currentSale?.deliveryNoteAuthority)
      : [],
    [currentSale?.deliveryNoteAuthority, replacementAuthorityActive]
  );
  const preparedSaleItems = useMemo(() => {
    if (replacementAuthorityActive) return replacementSaleItems;
    if (preparation) return buildPreparationPrintableItems(preparation);
    return legacySaleItems;
  }, [legacySaleItems, preparation, replacementAuthorityActive, replacementSaleItems]);
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
  const sourceQuotationPath = useMemo(() => {
    const sourceQuotationId = currentSale?.sourceQuotation?.id || currentSale?.sourceQuotation?.quotationId || null;
    return sourceQuotationId
      ? `/${shopSlug || 'advancetech'}/pos/sales/quotations/${sourceQuotationId}/print`
      : null;
  }, [currentSale?.sourceQuotation, shopSlug]);
  const openSourceQuotation = useCallback(() => {
    if (sourceQuotationPath) navigate(sourceQuotationPath);
  }, [navigate, sourceQuotationPath]);
  const error = pageError || preparationError || replacementError || (legacyEditorEnabled ? editorError : '');

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
      {!isConsolidated ? (
        <DeliveryNotePreparationPanel
          preparation={preparation}
          taxProjectionResult={taxProjectionResult}
          sourceSaleItems={legacySaleItems}
          saving={preparationLoading || preparationSaving}
          onCreate={preparationActions.ensure}
          onSave={preparationActions.saveLines}
          onLock={preparationActions.lock}
          onProjectTaxDrafts={preparationActions.projectTaxDrafts}
        />
      ) : null}
      {replacementEnabled ? (
        <DeliveryNoteReplacementPanel
          replacement={replacement}
          loading={replacementLoading}
          saving={replacementSaving}
          onCreate={replacementActions.create}
          onSave={replacementActions.saveLines}
          onLock={replacementActions.lock}
        />
      ) : null}
      <DeliveryNotePrintShell
        sale={currentSale}
        hideDate={hideDate}
        setHideDate={setHideDate}
        saleItems={preparedSaleItems}
        config={preparedConfig}
        sourceQuotationPath={sourceQuotationPath}
        onOpenSourceQuotation={openSourceQuotation}
        presentationFooter={(
          <DeliveryNotePresentationFooter
            content={footerContent}
            fontSizePx={footerFontSize}
          />
        )}
        editableDocumentLines={legacyEditorEnabled}
        editingLineKey={legacyEditorEnabled ? editingLineKey : null}
        lineDrafts={legacyEditorEnabled ? lineDrafts : {}}
        savingLineKey={legacyEditorEnabled ? savingLineKey : null}
        onToggleDocumentLineEdit={legacyEditorEnabled ? documentLineActions.toggle : undefined}
        onChangeDocumentLineDraft={legacyEditorEnabled ? documentLineActions.change : undefined}
        onSaveDocumentLine={legacyEditorEnabled ? documentLineActions.save : undefined}
      />
    </StoreDocumentHeaderScope>
  );
};

export default PrintDeliveryNotePage;
