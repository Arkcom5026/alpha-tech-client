import { useParams } from "react-router-dom";

const ReceiptHistoryPage = () => {
  const { id } = useParams();

  const mockPO = {
    code: `PO-${String(id).padStart(5, "0")}`,
    supplier: "บริษัท สมาร์ทซัพพลาย จำกัด",
    receipts: [
      {
        id: 1,
        date: "2025-05-16",
        note: "รอบแรก",
        items: [
          { name: "CPU Intel i5 Gen13", quantity: 5 },
          { name: "RAM DDR5 16GB", quantity: 2 },
        ],
      },
      {
        id: 2,
        date: "2025-05-17",
        note: "รอบสุดท้าย",
        items: [
          { name: "CPU Intel i5 Gen13", quantity: 5 },
          { name: "RAM DDR5 16GB", quantity: 3 },
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ประวัติการรับสินค้า: {mockPO.code}</h1>
      <p className="text-muted-foreground">จาก: {mockPO.supplier}</p>

      {mockPO.receipts.map((receipt) => (
        <div key={receipt.id} className="border rounded-xl p-4 bg-white shadow-sm space-y-2">
          <div className="font-semibold">
            📅 วันที่: {receipt.date} | 📝 หมายเหตุ: {receipt.note}
          </div>
          <table className="w-full table-auto border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">สินค้า</th>
                <th className="p-2 border text-center">จำนวนที่รับ</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, i) => (
                <tr key={i}>
                  <td className="p-2 border">{item.name}</td>
                  <td className="p-2 border text-center">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ReceiptHistoryPage;
