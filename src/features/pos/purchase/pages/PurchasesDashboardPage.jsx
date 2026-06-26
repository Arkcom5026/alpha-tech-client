import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const PurchasesDashboardPage = () => {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">แดชบอร์ดการจัดซื้อ</h1>

      {/* ปุ่มลิงก์ไปสร้างใบสั่งซื้อ */}
      <div>
        <Link
          to={shopSlug ? `/${shopSlug}/pos/purchases/po` : `/pos/purchases/po`}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ สร้างใบสั่งซื้อสินค้า
        </Link>
      </div>

      <Link to={shopSlug ? `/${shopSlug}/pos/purchases/po` : `/pos/purchases/po`}>
        <Card className="hover:shadow cursor-pointer">
          <CardContent className="p-4">
            <p className="font-bold text-lg">📄 รายการใบสั่งซื้อ</p>
            <p className="text-sm text-muted-foreground">ดู PO ทั้งหมดที่สร้างไว้</p>
          </CardContent>
        </Card>
      </Link>

      {/* TODO: ส่วนแสดงยอดรวม, รายงาน, สถิติ */}
    </div>
  );
};

export default PurchasesDashboardPage;