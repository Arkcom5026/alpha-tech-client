import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import StoreDocumentHeaderScope from '@/features/branch/documentHeader/StoreDocumentHeaderScope';
import {
  createSaleDeliveryNoteRevision,
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
import { feedback } from '@/design-system/feedback';
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
import { resolveDeliveryNotePrintableSale } from '../print/workspace/policies/deliveryNoteFinancialAuthority';
import {
  applyPersistedDeliveryNoteRevisionToSale,
  buildPersistedDeliveryNoteRevisionItems,
  hasPersistedDeliveryNoteRevision,
} from '../print/workspace/policies/deliveryNoteRevisionPresentation';

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
  const [revisionCreating, setRevisionCreating] = useState(false);

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

  const persistedRevisionActive = !isConsolidated
    && hasPersistedDeliveryNoteRevision(currentSale?.deliveryNoteAuthority);
  const preparationEnabled = !isConsolidated
    && Boolean(currentSale)
    && !persistedRevisionActive;

  const {
    preparation,
    taxProjectionResult,
    loading: preparationLoading,
    saving: preparationSaving,
    error: preparationError,
    actions: preparationActions,
  } = useSaleDocumentPreparation({
    saleId: preparationEnabled ? sourceId : null,
    enabled: preparationEnabled,
  });

  const replacementEnabled = preparationEnabled && preparation?.status === 'LOCKED';
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

  const legacyEditorEnabled = preparationEnabled && !preparation;
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
  const persistedRevisionSaleItems = useMemo(
    () => buildPersistedDeliveryNoteRevisionItems({
      sale: currentSale,
      authority: currentSale?.deliveryNoteAuthority,
    }),
    [currentSale]
  );
  const revisionAwareSale = useMemo(
    () => applyPersistedDeliveryNoteRevisionToSale({
      sale: currentSale,
      authority: currentSale?.deliveryNoteAuthority,
    }),
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
    if (persistedRevisionActive) return persistedRevisionSaleItems;
    if (replacementAuthorityActive) return replacementSaleItems;
    if (preparation) return buildPreparationPrintableItems(preparation);
    return legacySaleItems;
  }, [legacySaleItems, persistedRevisionActive, persistedRevisionSaleItems, preparation, replacementAuthorityActive, replacementSaleItems]);
  const printableSale = useMemo(() => resolveDeliveryNotePrintableSale({
    sale: revisionAwareSale,
    printableItems: preparedSaleItems,
    preparationStatus: preparation?.status,
    replacementAuthorityActive,
  }), [preparation?.status, preparedSaleItems, replacementAuthorityActive, revisionAwareSale]);
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

  const deliveryNoteLifecycle = currentSale?.deliveryNoteAuthority?.deliveryNoteLifecycle || null;
  const hasReturnAdjustment = !isConsolidated && deliveryNoteLifecycle?.lifecycleState === 'ADJUSTED';
  const canCreateAdjustedRevision = hasReturnAdjustment
    && deliveryNoteLifecycle?.actions?.canCreateAdjustedRevision === true;
  const requiresStatutoryCorrection = hasReturnAdjustment
    && deliveryNoteLifecycle?.actions?.requiresStatutoryCorrection === true;

  const handleCreateAdjustedRevision = useCallback(async () => {
    if (!sourceId || !canCreateAdjustedRevision || revisionCreating) return;
    setRevisionCreating(true);
    setPageError('');
    try {
      const revision = await createSaleDeliveryNoteRevision({ saleId: sourceId });
      const documentNumber = revision?.documentNumber || 'ฉบับปรับปรุง';
      feedback.actionSuccess(
        `สร้างใบส่งของ ${documentNumber} เรียบร้อย`,
        `sale:${sourceId}:delivery-note:revision:create:success`,
      );
      await loadCurrentDocument();
    } catch (error) {
      const message = error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || 'ไม่สามารถสร้างใบส่งของฉบับใหม่ได้';
      setPageError(message);
      feedback.actionError(
        error,
        message,
        `sale:${sourceId}:delivery-note:revision:create:error`,
      );
    } finally {
      setRevisionCreating(false);
    }
  }, [canCreateAdjustedRevision, loadCurrentDocument, revisionCreating, sourceId]);

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
      {hasReturnAdjustment ? (
        <div className="mx-auto mb-4 flex w-full max-w-[980px] flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm md:flex-row md:items-center md:justify-between print:hidden">
          <div>
            <div className="font-semibold">รายการนี้มีการคืนสินค้าแล้ว</div>
            <div className="mt-1 text-amber-800">
              ใบส่งของฉบับเดิมยังคงเป็นหลักฐานตามรายการและยอดเดิม ไม่แก้ไขย้อนหลัง
              {canCreateAdjustedRevision
                ? ' หากต้องการเอกสารตามยอดคงเหลือปัจจุบัน สามารถสร้างใบส่งของฉบับใหม่ได้'
                : requiresStatutoryCorrection
                  ? ' รายการนี้มีเอกสารภาษีแล้ว จึงต้องดำเนินการผ่านขั้นตอนแก้ไขเอกสารตามสิทธิ์ที่เกี่ยวข้อง'
                  : ' ขณะนี้ไม่มีรายการคงเหลือที่สามารถสร้างเป็นใบส่งของฉบับใหม่ได้'}
            </div>
          </div>
          {canCreateAdjustedRevision ? (
            <button
              type="button"
              onClick={handleCreateAdjustedRevision}
              disabled={revisionCreating}
              className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {revisionCreating ? 'กำลังสร้าง...' : 'สร้างใบส่งของฉบับใหม่'}
            </button>
          ) : null}
        </div>
      ) : null}
      {preparationEnabled ? (
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
        sale={printableSale}
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
