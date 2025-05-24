import { useState } from 'react';
import { FaPlus, FaTrash, FaMoneyBill } from 'react-icons/fa';

const mockFetchProductByBarcode = (barcode) => {
  // จำลองการดึงข้อมูลสินค้าจาก barcode จริง
  return {
    productId: 123,
    barcode: barcode,
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
      alert('สินค้านี้ถูกเพิ่มแล้ว');
      setBarcode('');
      return;
    }

    if (foundProduct.stock <= 0) {
      alert('❌ สินค้าหมดสต๊อก');
      return;
    }

    setItems((prev) => [...prev, { ...foundProduct }]);
    setBarcode('');
  };

  const handleRemove = (barcode) => {
    setItems((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ขายด่วน (Quick Sale)</h1>

      {/* ช่องสแกน / ค้นหา barcode */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="🔍 สแกนหรือกรอกรหัส barcode..."
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleAddItem}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FaPlus />
        </button>
      </div>

      {/* ตารางสินค้า */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm border">
          <thead className="bg-gray-100 dark:bg-zinc-800">
            <tr>
              <th className="px-2 py-2 text-left">ชื่อสินค้า</th>
              <th>Barcode</th>
              <th>หน่วย</th>
              <th>ราคา</th>
              <th>ลบ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.barcode} className="text-center border-b">
                <td className="text-left px-2 py-2">{item.name}</td>
                <td>{item.barcode}</td>
                <td>{item.unit}</td>
                <td className="text-green-600">฿{item.price}</td>
                <td>
                  <button onClick={() => handleRemove(item.barcode)}>
                    <FaTrash className="text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray-400 py-4">
                  ยังไม่มีรายการสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* สรุปยอดรวม */}
      <div className="text-right mt-6">
        <p className="text-lg">
          รวมทั้งหมด: <span className="font-bold text-green-600">฿{total}</span>
        </p>
        <button
          disabled={items.length === 0}
          className="mt-3 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
        >
          <FaMoneyBill />
          ยืนยันการขาย
        </button>
      </div>
    </div>
  );
};

export default QuickSalePage;
