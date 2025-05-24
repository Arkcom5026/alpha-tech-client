import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";

const PaymentPage = () => {
  const { id } = useParams();

  const mockPO = {
    code: `PO-${String(id).padStart(5, "0")}`,
    supplier: "บริษัท สมาร์ทซัพพลาย จำกัด",
    total: 10000,
    paid: 6000,
    due: 4000,
    date: "2025-05-16",
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">ชำระเงิน: {mockPO.code}</h1>
      <p>ผู้ขาย: {mockPO.supplier}</p>
      <p>วันที่สั่งซื้อ: {mockPO.date}</p>

      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <p>💰 ยอดรวม: {mockPO.total.toLocaleString()} บาท</p>
        <p>✅ ชำระแล้ว: {mockPO.paid.toLocaleString()} บาท</p>
        <p>❗ ค้างชำระ: <strong>{mockPO.due.toLocaleString()} บาท</strong></p>
      </div>

      <div className="grid gap-4 mt-4">
        <div>
          <label className="font-medium">วันที่ชำระ</label>
          <Input type="date" />
        </div>

        <div>
          <label className="font-medium">จำนวนเงินที่ชำระ</label>
          <Input type="number" min={0} max={mockPO.due} defaultValue={mockPO.due} />
        </div>

        <div>
          <label className="font-medium">วิธีชำระ</label>
          <Select defaultValue="cash">
            <SelectTrigger>
              <SelectValue placeholder="เลือกวิธีชำระเงิน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">เงินสด</SelectItem>
              <SelectItem value="transfer">โอน</SelectItem>
              <SelectItem value="cheque">เช็ค</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="font-medium">หมายเหตุ</label>
          <Textarea placeholder="เพิ่มเติม (ถ้ามี)" />
        </div>

        <Button className="mt-4">✅ ยืนยันการชำระเงิน</Button>
      </div>
    </div>
  );
};

export default PaymentPage;
