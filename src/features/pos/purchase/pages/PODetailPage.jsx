import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PODetailPage = () => {
  const { id } = useParams();

  const po = {
    code: `PO-${String(id).padStart(5, "0")}`,
    supplier: "บริษัท สมาร์ทซัพพลาย จำกัด",
    date: "2025-05-16",
    status: "รอดำเนินการ",
    note: "สั่ง CPU และ RAM สำหรับสต๊อกใหม่",
    items: [
      { name: "CPU Intel i5 Gen13", quantity: 10, price: 4500 },
      { name: "RAM DDR5 16GB", quantity: 5, price: 2800 },
    ],
  };

  const total = po.items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);
  const vat = total * 0.07;
  const grandTotal = total + vat;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">รายละเอียดใบสั่งซื้อ {po.code}</h1>

      <div className="grid gap-2 text-sm">
        <p>วันที่: {po.date}</p>
        <p>สถานะ: {po.status}</p>
        <p>ผู้ขาย: {po.supplier}</p>
        <p>หมายเหตุ: {po.note}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border text-left">สินค้า</th>
              <th className="p-2 border text-right">จำนวน</th>
              <th className="p-2 border text-right">ราคาต่อหน่วย</th>
              <th className="p-2 border text-right">ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            {po.items.map((item, i) => (
              <tr key={i}>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border text-right">{item.quantity}</td>
                <td className="p-2 border text-right">{item.costPrice.toLocaleString()}</td>
                <td className="p-2 border text-right">{(item.quantity * item.costPrice).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="p-2 border text-right font-bold">รวม</td>
              <td className="p-2 border text-right">{total.toLocaleString()}</td>
            </tr>
            <tr>
              <td colSpan={3} className="p-2 border text-right font-bold">VAT (7%)</td>
              <td className="p-2 border text-right">{vat.toLocaleString()}</td>
            </tr>
            <tr>
              <td colSpan={3} className="p-2 border text-right font-bold">ยอดสุทธิ</td>
              <td className="p-2 border text-right text-green-700 font-bold">{grandTotal.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <Link to="/pos/purchases/po">
        <Button variant="outline">⬅️ กลับ</Button>
      </Link>
    </div>
  );
};

export default PODetailPage;
