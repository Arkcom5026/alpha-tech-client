const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const SaleReturnCreateWorkspace = ({
  eligibility,
  available,
  lines,
  reason,
  refunds,
  error,
  submitting,
  eligibleTotal,
  refundTotal,
  deduction,
  onSelectLine,
  onPatchLine,
  onReasonChange,
  onRefundsChange,
  onCancel,
  onSubmit,
  onOpenHelp,
}) => (
  <main className="p-6 space-y-5">
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">คืนสินค้าจากใบขาย {eligibility.sale.code}</h1>
          <p className="text-sm text-slate-500">สินค้าจะกลับเข้าพร้อมขายทันทีเมื่อรายการสำเร็จ ประวัติการขายเดิมยังคงอยู่ทั้งหมด</p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 font-bold text-orange-700"
          onClick={onOpenHelp}
        >
          คู่มือ
        </button>
      </div>
    </section>

    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-3" />
            <th className="text-left">สินค้า</th>
            <th>จำนวนคืน</th>
            <th>คืนได้สูงสุด</th>
            <th>คืนเงินจริง</th>
            <th>เหตุผลเฉพาะรายการ</th>
          </tr>
        </thead>
        <tbody>
          {available.map((item) => {
            const state = lines[`${item.kind}:${item.id}`] || {};
            return (
              <tr key={`${item.kind}:${item.id}`} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={Boolean(state.selected)}
                    onChange={(event) => onSelectLine(item, event.target.checked)}
                  />
                </td>
                <td>
                  <div className="font-semibold">{item.productName}</div>
                  <div className="text-xs text-slate-500">{item.barcode || (item.kind === 'SIMPLE' ? 'สินค้าแบบจำนวน' : '-')}</div>
                </td>
                <td className="p-2 text-center">
                  <input
                    className="w-24 rounded border p-2"
                    type="number"
                    disabled={!state.selected || item.kind !== 'SIMPLE'}
                    max={item.eligibleQuantity}
                    value={state.quantity || ''}
                    onChange={(event) => onPatchLine(item, { quantity: event.target.value })}
                  />
                </td>
                <td className="text-right">{money(item.eligibleRefund)} ฿</td>
                <td className="p-2">
                  <input
                    className="w-28 rounded border p-2 text-right"
                    type="number"
                    disabled={!state.selected}
                    value={state.refundAmount ?? ''}
                    onChange={(event) => onPatchLine(item, { refundAmount: event.target.value })}
                  />
                </td>
                <td className="p-2">
                  <input
                    className="w-full rounded border p-2"
                    disabled={!state.selected}
                    value={state.reason || ''}
                    onChange={(event) => onPatchLine(item, { reason: event.target.value })}
                    placeholder="กรอกเมื่อหักเงินรายการนี้"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>

    <section className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <label className="font-bold">เหตุผลการคืน/เหตุผลการหักโดยรวม</label>
        <textarea
          className="mt-2 w-full rounded-xl border p-3"
          rows={4}
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="ข้อความอิสระ เช่น ลูกค้าซื้อผิดรุ่น หักค่าอุปกรณ์ที่ไม่ครบ"
        />
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
        <h2 className="font-bold">ช่องทางคืนเงิน</h2>
        {refunds.map((refund, index) => (
          <div key={index} className="grid grid-cols-3 gap-2">
            <select
              className="rounded border p-2"
              value={refund.method}
              onChange={(event) => onRefundsChange(
                refunds.map((row, i) => i === index ? { ...row, method: event.target.value } : row),
              )}
            >
              {['CASH', 'TRANSFER', 'CARD', 'STORE_CREDIT', 'OTHER'].map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
            <input
              className="rounded border p-2 text-right"
              type="number"
              value={refund.amount}
              onChange={(event) => onRefundsChange(
                refunds.map((row, i) => i === index ? { ...row, amount: event.target.value } : row),
              )}
            />
            <select
              className="rounded border p-2"
              value={refund.sourcePaymentItemId}
              onChange={(event) => onRefundsChange(
                refunds.map((row, i) => i === index ? { ...row, sourcePaymentItemId: event.target.value } : row),
              )}
            >
              <option value="">ไม่ระบุรายการรับเงินเดิม</option>
              {eligibility.paymentItems.map((item) => (
                <option key={item.paymentItemId} value={item.paymentItemId}>
                  {item.paymentMethod} {money(item.amount)}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          className="text-sm font-bold text-blue-600"
          onClick={() => onRefundsChange([
            ...refunds,
            { method: 'TRANSFER', amount: 0, sourcePaymentItemId: '' },
          ])}
        >
          + เพิ่มช่องทาง
        </button>
        <div className="border-t pt-3 text-sm space-y-1">
          <div className="flex justify-between"><span>มูลค่าที่คืนได้</span><b>{money(eligibleTotal)} ฿</b></div>
          <div className="flex justify-between"><span>หัก</span><b className="text-orange-600">{money(deduction)} ฿</b></div>
          <div className="flex justify-between text-lg"><span>คืนเงินจริง</span><b>{money(refundTotal)} ฿</b></div>
        </div>
      </div>
    </section>

    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

    <div className="flex justify-end gap-3">
      <button className="rounded-xl border px-5 py-3 font-bold" onClick={onCancel}>ยกเลิก</button>
      <button
        className="rounded-xl bg-orange-500 px-6 py-3 font-black text-white disabled:opacity-50"
        disabled={submitting}
        onClick={onSubmit}
      >
        {submitting ? 'กำลังดำเนินการ...' : 'ยืนยันคืนสินค้าและคืนเงิน'}
      </button>
    </div>
  </main>
);

export default SaleReturnCreateWorkspace;
