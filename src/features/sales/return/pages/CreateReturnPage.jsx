import { useNavigate, useParams } from 'react-router-dom';
import SaleReturnCompletionSummary from '../components/SaleReturnCompletionSummary';
import SaleReturnItemSelection from '../components/SaleReturnItemSelection';
import SaleReturnRefundSection from '../components/SaleReturnRefundSection';
import useSaleReturnRuntimeController from '../hooks/useSaleReturnRuntimeController';

const CreateReturnPage = () => {
  const { saleId, shopSlug = 'advancetech' } = useParams();
  const navigate = useNavigate();
  const controller = useSaleReturnRuntimeController(saleId);
  const searchRoute = `/${shopSlug}/pos/sales/sale-return`;

  if (controller.completedReturn) {
    const firstBarcode = controller.eligibility?.serializedItems?.find(
      (item) => item.barcode,
    )?.barcode;
    return (
      <main className="p-6">
        <SaleReturnCompletionSummary
          result={controller.completedReturn}
          onBack={() => navigate(searchRoute, { replace: true })}
          onTrace={firstBarcode ? () => navigate(
            `/${shopSlug}/pos/stock/product-trace?barcode=${encodeURIComponent(firstBarcode)}`,
          ) : undefined}
        />
      </main>
    );
  }

  if (controller.loading || !controller.eligibility) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border bg-white p-6">
          {controller.error || 'กำลังโหลดข้อมูลที่คืนได้...'}
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-5 p-6">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-black">
              คืนสินค้าจากใบขาย {controller.eligibility.sale.code}
            </h1>
            <p className="text-sm text-slate-500">
              เมื่อสำเร็จ สินค้าจะกลับเข้าพร้อมขายทันที โดยประวัติการขายเดิมยังอยู่ครบ
            </p>
          </div>
          <button type="button" className="rounded-xl border px-4 py-2 font-bold" onClick={controller.reload}>
            โหลดข้อมูลล่าสุด
          </button>
        </div>
      </section>

      <SaleReturnItemSelection
        items={controller.availableItems}
        lineState={controller.lineState}
        onSelect={controller.selectLine}
        onPatch={controller.patchLine}
      />
      <SaleReturnRefundSection
        reason={controller.reason}
        refunds={controller.refunds}
        paymentItems={controller.eligibility.paymentItems || []}
        projection={controller.projection}
        onReasonChange={controller.setReason}
        onPatchRefund={controller.patchRefund}
        onAddRefund={controller.addRefund}
        onRemoveRefund={controller.removeRefund}
      />

      {controller.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          {controller.error}
        </div>
      )}
      <div className="flex justify-end gap-3">
        <button type="button" className="rounded-xl border px-5 py-3 font-bold" onClick={() => navigate(searchRoute)}>
          ยกเลิก
        </button>
        <button
          type="button"
          className="rounded-xl bg-orange-500 px-6 py-3 font-black text-white disabled:opacity-50"
          disabled={controller.submitting}
          onClick={controller.submit}
        >
          {controller.submitting ? 'กำลังดำเนินการ...' : 'ยืนยันคืนสินค้าและคืนเงิน'}
        </button>
      </div>
    </main>
  );
};

export default CreateReturnPage;
