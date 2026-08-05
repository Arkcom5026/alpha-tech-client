import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import BarcodePreviewWorkspaceHeader from '../components/BarcodePreviewWorkspaceHeader';
import PreviewBarcodePage from './PreviewBarcodePage';

export default function BarcodePreviewWorkspacePage() {
  const { receiptId } = useParams();
  const barcodes = useBarcodeStore((state) => (Array.isArray(state?.barcodes) ? state.barcodes : []));

  const summary = useMemo(() => {
    const printedCount = barcodes.filter((item) => Boolean(item?.printed)).length;
    return {
      labelCount: barcodes.length,
      printedCount,
      isPrinted: barcodes.length > 0 && printedCount === barcodes.length,
    };
  }, [barcodes]);

  return (
    <main className="w-full space-y-4 p-3 sm:p-4 lg:p-6">
      <div className="print:hidden">
        <BarcodePreviewWorkspaceHeader
          receiptId={receiptId}
          labelCount={summary.labelCount}
          printedCount={summary.printedCount}
          isPrinted={summary.isPrinted}
        />
      </div>

      <section aria-label="พื้นที่พรีวิวและควบคุมการพิมพ์บาร์โค้ด">
        <PreviewBarcodePage />
      </section>
    </main>
  );
}
