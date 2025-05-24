import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ListPOPage = () => {
  const mockPOs = [
    {
      id: 1,
      code: "PO-00001",
      supplier: "บริษัท สมาร์ทซัพพลาย จำกัด",
      date: "2025-05-16",
      status: "รอดำเนินการ",
    },
    {
      id: 2,
      code: "PO-00002",
      supplier: "บจก. ซีซัน เทรดดิ้ง",
      date: "2025-05-15",
      status: "รับครบแล้ว",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">รายการใบสั่งซื้อ</h1>
        <Link to="/pos/purchases/create">
          <Button>➕ สร้างใบสั่งซื้อ</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">เลขที่ใบสั่งซื้อ</th>
              <th className="p-2 border">ผู้ขาย</th>
              <th className="p-2 border">วันที่</th>
              <th className="p-2 border">สถานะ</th>
              <th className="p-2 border">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {mockPOs.map((po) => (
              <tr key={po.id} className="text-center">
                <td className="p-2 border">{po.code}</td>
                <td className="p-2 border">{po.supplier}</td>
                <td className="p-2 border">{po.date}</td>
                <td className="p-2 border">{po.status}</td>
                <td className="p-2 border space-x-2">
                  <Link to={`/pos/purchases/po/${po.id}/receive`}>
                    <Button size="sm" variant="outline">รับสินค้า</Button>
                  </Link>
                  <Link to={`/pos/purchases/po/${po.id}/receipts`}>
                    <Button size="sm" variant="secondary">ประวัติรับ</Button>
                  </Link>
                  <Link to={`/pos/purchases/po/${po.id}/payments`}>
                    <Button size="sm" variant="destructive">ชำระเงิน</Button>
                  </Link>
                  <Link to={`/pos/purchases/po/${po.id}/detail`}>
                    <Button size="sm" variant="ghost">ดูรายละเอียด</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListPOPage;
