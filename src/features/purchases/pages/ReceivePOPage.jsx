


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "react-router-dom";


const ReceivePOPage = () => {
  const { id } = useParams();

  // mock PO detail
  const po = {
    code: `PO-${String(id).padStart(5, "0")}`,
    date: "2025-05-16",
    supplier: "บริษัท สมาร์ทซัพพลาย จำกัด",
    items: [
      { id: 1, name: "CPU Intel i5 Gen13", ordered: 10, received: 0 },
      { id: 2, name: "RAM DDR5 16GB", ordered: 5, received: 0 },
    ],
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">รับสินค้า: {po.code}</h1>
      <p className="text-muted-foreground">จาก: {po.supplier}</p>

      <div className="grid gap-4 max-w-sm">
        <label className="font-medium">วันที่รับสินค้า</label>
        <Input type="date" />
      </div>

      <div className="mt-6">
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">สินค้า</th>
              <th className="p-2 border text-center">จำนวนที่สั่ง</th>
              <th className="p-2 border text-center">จำนวนที่รับ</th>
            </tr>
          </thead>
          <tbody>
            {po.items.map((item) => (
              <tr key={item.id}>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border text-center">{item.ordered}</td>
                <td className="p-2 border text-center">
                  <Input type="number" defaultValue={0} min={0} max={item.ordered} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 max-w-xl space-y-2">
        <label className="font-medium">หมายเหตุ</label>
        <Textarea placeholder="ใส่หมายเหตุเพิ่มเติม (ถ้ามี)" />
      </div>

      <Button className="mt-6">✅ ยืนยันการรับสินค้า</Button>
    </div>
  );
};

export default ReceivePOPage;
