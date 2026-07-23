import PropTypes from 'prop-types';
import { SALE_RETURN_REFUND_METHOD } from '../contracts/saleReturnContract';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const SaleReturnRefundSection = ({
  reason,
  refunds,
  paymentItems,
  projection,
  onReasonChange,
  onPatchRefund,
  onAddRefund,
  onRemoveRefund,
}) => (
  <section className="grid gap-5 lg:grid-cols-2">
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <label className="font-bold">เหตุผลการคืน / เหตุผลการหักโดยรวม</label>
      <textarea
        className="mt-2 w-full rounded-xl border p-3"
        rows={5}
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        placeholder="ข้อความอิสระ เช่น ลูกค้าซื้อผิดรุ่น หรืออุปกรณ์ไม่ครบ"
      />
    </div>
    <div className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="font-bold">ช่องทางคืนเงิน</h2>
      {refunds.map((refund, index) => (
        <div key={`${index}-${refund.method}`} className="grid gap-2 md:grid-cols-[1fr_1fr_1.5fr_auto]">
          <select
            className="rounded border p-2"
            value={refund.method}
            onChange={(event) => onPatchRefund(index, { method: event.target.value })}
          >
            {Object.values(SALE_RETURN_REFUND_METHOD).map((method) => (
              <option key={method}>{method}</option>
            ))}
          </select>
          <input
            className="rounded border p-2 text-right"
            type="number"
            min="0"
            value={refund.amount}
            onChange={(event) => onPatchRefund(index, { amount: event.target.value })}
          />
          <select
            className="rounded border p-2"
            value={refund.sourcePaymentItemId}
            onChange={(event) => onPatchRefund(index, {
              sourcePaymentItemId: event.target.value,
            })}
          >
            <option value="">ไม่ระบุรายการรับเงินเดิม</option>
            {paymentItems.map((item) => (
              <option key={item.paymentItemId} value={item.paymentItemId}>
                {item.paymentMethod} คงเหลือ {money(item.remainingRefundableAmount)} ฿
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded border px-3 text-red-600 disabled:opacity-30"
            disabled={refunds.length === 1}
            onClick={() => onRemoveRefund(index)}
          >
            ลบ
          </button>
        </div>
      ))}
      <button type="button" className="text-sm font-bold text-blue-600" onClick={onAddRefund}>
        + เพิ่มช่องทาง
      </button>
      <div className="space-y-1 border-t pt-3 text-sm">
        <div className="flex justify-between"><span>มูลค่าที่คืนได้</span><b>{money(projection.eligibleRefundTotal)} ฿</b></div>
        <div className="flex justify-between"><span>หัก</span><b className="text-orange-600">{money(projection.deductedAmount)} ฿</b></div>
        <div className="flex justify-between text-lg"><span>คืนเงินจริง</span><b>{money(projection.actualRefundTotal)} ฿</b></div>
        <div className="flex justify-between text-slate-500"><span>รวมช่องทางคืนเงิน</span><b>{money(projection.refundEvidenceTotal)} ฿</b></div>
      </div>
    </div>
  </section>
);

SaleReturnRefundSection.propTypes = {
  reason: PropTypes.string.isRequired,
  refunds: PropTypes.arrayOf(PropTypes.object).isRequired,
  paymentItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  projection: PropTypes.object.isRequired,
  onReasonChange: PropTypes.func.isRequired,
  onPatchRefund: PropTypes.func.isRequired,
  onAddRefund: PropTypes.func.isRequired,
  onRemoveRefund: PropTypes.func.isRequired,
};

export default SaleReturnRefundSection;
