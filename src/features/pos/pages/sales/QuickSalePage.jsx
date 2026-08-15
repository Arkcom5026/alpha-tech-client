import { useState } from 'react';
import { FaMoneyBill, FaPlus, FaTrash } from 'react-icons/fa';
import { feedback } from '@/design-system';

const mockFetchProductByBarcode = (barcode) => {
  // จำลองการดึงข้อมูลสินค้าจาก barcode จริง
  return {
    productId: 123,
    barcode,
    name: `สินค้า ${barcode}`,
    price: 100,
    stock: 5,
    unit: 'ชิ้น',
  };
};

const QuickSalePage = () => {
  const [barcode, setBarcode] = useState('');
  const [items, setItems] = useState([]);

  const handleAddItem = () => {
    if (!barcode.trim()) return;

    const foundProduct = mockFetchProductByBarcode(barcode);

    // ✅ ตรวจสอบซ้ำ: barcode เดียวกันห้ามเพิ่มซ้ำ
    if (items.some((item) => item.barcode === foundProduct.barcode)) {
      feedback.warning('สินค้านี้ถูกเพิ่มในรายการแล้ว', { eventKey: 'quick-sale-duplicate-product' });
      setBarcode('');
      return;
    }

    if (foundProduct.stock <= 0) {
      feedback.warning('สินค้าหมดสต๊อก', { eventKey: 'quick-sale-out-of-stock' });
      return;
    }

    setItems((prev) => [...prev, { ...foundProduct }]);
    setBarcode('');
  };

  const handleRemove = (itemBarcode) => {
    setItems((prev) => prev.filter((item) => item.barcode !== itemBarcode));
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <main className="space-y-5 p-4 md:p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Quick Sale</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">ขายด่วน</h1>
          <p className="mt-1 text-sm text-slate-500">สแกนหรือกรอกบาร์โค้ดเพื่อเพิ่มสินค้า แล้วตรวจยอดรวมก่อนยืนยันการขาย</p>
        </div>

        <div className="mt-5 flex gap-2">
          <input
            type="text"
            placeholder="สแกนหรือกรอกรหัส Barcode..."
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleAddItem()}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-emerald-500 px-4 text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            aria-label="เพิ่มสินค้า"
          >
            <FaPlus />
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-black text-slate-900">รายการสินค้า</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{items.length.toLocaleString('th-TH')} รายการในบิล</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500">
              <tr>
                <th className="px-5 py-3">ชื่อสินค้า</th>
                <th className="px-4 py-3">Barcode</th>
                <th className="px-4 py-3 text-center">หน่วย</th>
                <th className="px-4 py-3 text-right">ราคา</th>
                <th className="px-5 py-3 text-center">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.barcode} className="transition hover:bg-emerald-50/30">
                  <td className="px-5 py-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-4 py-4 font-mono text-xs text-slate-600">{item.barcode}</td>
                  <td className="px-4 py-4 text-center text-slate-600">{item.unit}</td>
                  <td className="px-4 py-4 text-right font-bold text-emerald-700">
                    ฿{Number(item.price || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(item.barcode)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100"
                      aria-label={`ลบ ${item.name}`}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-sm font-medium text-slate-400">
                    ยังไม่มีรายการสินค้า กรุณาสแกนหรือกรอก Barcode เพื่อเริ่มขาย
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700/70">ยอดรวม</p>
          <p className="mt-1 text-3xl font-black text-emerald-800">
            ฿{Number(total || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <button
          type="button"
          disabled={items.length === 0}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-black text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          <FaMoneyBill />
          ยืนยันการขาย
        </button>
      </section>
    </main>
  );
};

export default QuickSalePage;
