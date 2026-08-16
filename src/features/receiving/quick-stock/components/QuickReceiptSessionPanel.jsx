import { useState } from 'react';
import { ConfirmActionDialog } from '@/design-system/composites';

import QuickReceiptActions from './QuickReceiptActions';
import QuickReceiptDraftPicker from './QuickReceiptDraftPicker';
import QuickReceiptHeaderFields from './QuickReceiptHeaderFields';
import QuickReceiptLineSummary from './QuickReceiptLineSummary';
import QuickReceiptHelpDrawer from '../help/QuickReceiptHelpDrawer';
import useQuickReceiptSessionController from '../session/useQuickReceiptSessionController';

const QuickReceiptSessionPanel = ({
  operationalProduct,
  barcodeQueue = [],
  defaultCost,
  priceForm = {},
  note,
  onCurrentLineSaved,
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const {
    header,
    suppliers,
    visibleDrafts,
    draftSearch,
    receipt,
    isBusy,
    locked,
    allLines,
    totalQuantity,
    setDraftSearch,
    updateHeader,
    resetReceipt,
    handleAddCurrentLine,
    handleSaveForLater,
    handleFinalize,
    resumeDraft,
    removeLocalLine,
    removeServerLine,
    handleCancelDraft,
  } = useQuickReceiptSessionController({
    operationalProduct,
    barcodeQueue,
    defaultCost,
    priceForm,
    note,
    onCurrentLineSaved,
  });

  const confirmCancelDraft = async () => {
    if (isBusy) return;
    const cancelled = await handleCancelDraft();
    if (cancelled) setCancelConfirmationOpen(false);
  };

  return (
    <>
      <section className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">ใบรับสินค้าด่วนตามใบส่งของ</h2>
            <p className="text-sm text-slate-600">รวบรวมสินค้าให้ครบก่อน แล้วเลือกเก็บไว้รับต่อหรือยืนยันทั้งใบครั้งเดียว</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isBusy}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setIsHelpOpen(true)}
              aria-label="เปิดคู่มือรับสินค้าด่วน"
            >
              คู่มือ
            </button>
            {receipt?.code && (
              <div className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
                {receipt.code} · {receipt.status}
              </div>
            )}
            {locked && (
              <button type="button" disabled={isBusy} className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50" onClick={resetReceipt}>
                เริ่มใบรับใหม่
              </button>
            )}
          </div>
        </div>

        <QuickReceiptHeaderFields
          header={header}
          suppliers={suppliers}
          disabled={isBusy || locked}
          onHeaderChange={updateHeader}
        />

        {!receipt?.id && (
          <QuickReceiptDraftPicker
            drafts={visibleDrafts}
            search={draftSearch}
            onSearchChange={setDraftSearch}
            onResumeDraft={resumeDraft}
          />
        )}

        <QuickReceiptLineSummary
          lines={allLines}
          totalQuantity={totalQuantity}
          locked={locked}
          isBusy={isBusy}
          onRemoveLocalLine={removeLocalLine}
          onRemoveServerLine={removeServerLine}
        />

        <QuickReceiptActions
          receipt={receipt}
          isBusy={isBusy}
          locked={locked}
          hasLines={allLines.length > 0}
          onCancelDraft={() => {
            if (!isBusy) setCancelConfirmationOpen(true);
          }}
          onAddCurrentLine={handleAddCurrentLine}
          onSaveForLater={handleSaveForLater}
          onFinalize={handleFinalize}
        />
      </section>

      <QuickReceiptHelpDrawer open={isHelpOpen} onClose={() => !isBusy && setIsHelpOpen(false)} />

      <ConfirmActionDialog
        open={cancelConfirmationOpen}
        title="ยืนยันยกเลิกใบรับสินค้าด่วน"
        description={receipt?.code
          ? `ยืนยันยกเลิก ${receipt.code} หรือไม่? รายการนี้จะไม่ถูกนำไป finalize เข้าสต๊อก`
          : 'ยืนยันยกเลิกใบรับสินค้าด่วนนี้หรือไม่?'}
        confirmLabel="ยืนยันยกเลิก"
        intent="destructive"
        loading={isBusy}
        loadingLabel="กำลังยกเลิก..."
        onClose={() => {
          if (!isBusy) setCancelConfirmationOpen(false);
        }}
        onConfirm={confirmCancelDraft}
      />
    </>
  );
};

export default QuickReceiptSessionPanel;
