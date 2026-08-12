import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import BarcodePreviewWorkspaceHeader from '../components/BarcodePreviewWorkspaceHeader';
import PreviewBarcodePage from './PreviewBarcodePage';

export default function BarcodePreviewWorkspacePage() {
  const { receiptId, shopSlug } = useParams();
  const navigate = useNavigate();
  const barcodes = useBarcodeStore((state) => (Array.isArray(state?.barcodes) ? state.barcodes : []));
  const generateBarcodesAction = useBarcodeStore((state) => state.generateBarcodesAction);
  const loadBarcodesAction = useBarcodeStore((state) => state.loadBarcodesAction);
  const preparationKeyRef = useRef(null);
  const [preparing, setPreparing] = useState(false);
  const [preparationError, setPreparationError] = useState('');

  useEffect(() => {
    if (!receiptId) return;
    const rid = Number.isFinite(Number(receiptId)) ? Number(receiptId) : receiptId;
    const key = String(rid);
    if (preparationKeyRef.current === key) return;
    preparationKeyRef.current = key;

    let cancelled = false;
    setPreparing(true);
    setPreparationError('');

    Promise.resolve()
      .then(() => generateBarcodesAction?.(rid))
      .then(() => loadBarcodesAction?.(rid))
      .catch((error) => {
        if (cancelled) return;
        preparationKeyRef.current = null;
        setPreparationError(error?.response?.data?.message || error?.message || 'เตรียม Barcode / SN ไม่สำเร็จ');
      })
      .finally(() => {
        if (!cancelled) setPreparing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [receiptId, generateBarcodesAction, loadBarcodesAction]);

  const summary = useMemo(() => {
    const printedCount = barcodes.filter((item) => Boolean(item?.printed)).length;
    return {
      labelCount: barcodes.length,
      printedCount,
      isPrinted: barcodes.length > 0 && printedCount === barcodes.length,
    };
  }, [barcodes]);

  const continueToStockReceive = () => {
    if (!receiptId || summary.labelCount <= 0 || preparing) return;
    const targetSlug = shopSlug || 'advancetech';
    navigate(`/${targetSlug}/pos/purchases/receipt/items/scan/${receiptId}`);
  };

  return (
    <main className="w-full space-y-4 p-3 sm:p-4 lg:p-6">
      <div className="print:hidden">
        <BarcodePreviewWorkspaceHeader
          receiptId={receiptId}
          labelCount={summary.labelCount}
          printedCount={summary.printedCount}
          isPrinted={summary.isPrinted}
          preparing={preparing}
          onContinueToReceive={continueToStockReceive}
        />
      </div>

      {preparationError ? (
        <div className="print:hidden rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">
          {preparationError}
        </div>
      ) : null}

      <section aria-label="พื้นที่พรีวิวและควบคุมการพิมพ์บาร์โค้ด">
        <PreviewBarcodePage />
      </section>
    </main>
  );
}
