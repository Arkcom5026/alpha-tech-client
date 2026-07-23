import PropTypes from 'prop-types';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const SaleReturnCompletionSummary = ({ result, onBack, onTrace }) => (
  <section className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
    <h1 className="text-xl font-black text-emerald-800">คืนสินค้าเรียบร้อยแล้ว</h1>
    <p className="mt-1 text-sm text-emerald-700">
      สินค้าถูกนำกลับเข้าพร้อมขาย และบันทึกหลักฐานวงจรสินค้าแล้ว
    </p>
    <dl className="mt-5 grid gap-3 rounded-xl bg-white p-4 text-sm sm:grid-cols-2">
      <div><dt className="text-slate-500">เลขที่ใบคืน</dt><dd className="font-bold">{result.code}</dd></div>
      <div><dt className="text-slate-500">สถานะ</dt><dd className="font-bold">{result.status}</dd></div>
      <div><dt className="text-slate-500">มูลค่าที่คืนได้</dt><dd className="font-bold">{money(result.totals?.eligibleRefund)} ฿</dd></div>
      <div><dt className="text-slate-500">คืนเงินจริง</dt><dd className="font-bold">{money(result.totals?.refundedAmount)} ฿</dd></div>
    </dl>
    <div className="mt-5 flex flex-wrap justify-end gap-3">
      {onTrace && (
        <button type="button" className="rounded-xl border bg-white px-5 py-3 font-bold" onClick={onTrace}>
          ดูวงจรสินค้า
        </button>
      )}
      <button type="button" className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white" onClick={onBack}>
        กลับหน้าคืนสินค้า
      </button>
    </div>
  </section>
);

SaleReturnCompletionSummary.propTypes = {
  result: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onTrace: PropTypes.func,
};

export default SaleReturnCompletionSummary;
