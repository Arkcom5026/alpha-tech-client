import PropTypes from 'prop-types';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const SaleReturnItemSelection = ({ items, lineState, onSelect, onPatch }) => (
  <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
    <table className="w-full min-w-[900px] text-sm">
      <thead className="bg-slate-50">
        <tr>
          <th className="p-3" />
          <th className="text-left">สินค้า</th>
          <th>จำนวนคืน</th>
          <th className="text-right">คืนได้สูงสุด</th>
          <th>คืนเงินจริง</th>
          <th className="text-left">เหตุผลเฉพาะรายการ</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const state = lineState[item.identity] || {};
          return (
            <tr key={item.identity} className="border-t">
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={Boolean(state.selected)}
                  onChange={(event) => onSelect(item, event.target.checked)}
                />
              </td>
              <td>
                <div className="font-semibold">{item.productName}</div>
                <div className="text-xs text-slate-500">{item.barcode || 'สินค้าแบบจำนวน'}</div>
              </td>
              <td className="p-2 text-center">
                <input
                  className="w-24 rounded border p-2"
                  type="number"
                  min="1"
                  max={item.eligibleQuantity}
                  disabled={!state.selected || item.kind !== 'SIMPLE'}
                  value={state.quantity || ''}
                  onChange={(event) => onPatch(item.identity, { quantity: event.target.value })}
                />
              </td>
              <td className="p-2 text-right">{money(item.eligibleRefund)} ฿</td>
              <td className="p-2">
                <input
                  className="w-28 rounded border p-2 text-right"
                  type="number"
                  min="0"
                  disabled={!state.selected}
                  value={state.refundAmount ?? ''}
                  onChange={(event) => onPatch(item.identity, { refundAmount: event.target.value })}
                />
              </td>
              <td className="p-2">
                <input
                  className="w-full rounded border p-2"
                  disabled={!state.selected}
                  value={state.reason || ''}
                  onChange={(event) => onPatch(item.identity, { reason: event.target.value })}
                  placeholder="กรอกเมื่อหักเงินรายการนี้"
                />
              </td>
            </tr>
          );
        })}
        {!items.length && (
          <tr><td colSpan={6} className="p-8 text-center text-slate-500">ไม่มีสินค้าที่คืนได้</td></tr>
        )}
      </tbody>
    </table>
  </section>
);

SaleReturnItemSelection.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  lineState: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  onPatch: PropTypes.func.isRequired,
};

export default SaleReturnItemSelection;
