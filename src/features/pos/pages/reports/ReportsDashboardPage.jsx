import { Card, CardContent } from "@/components/ui/card";
import { FileBarChart2, BarChartHorizontalBig, CalendarRange } from "lucide-react";
import { Link } from "react-router-dom";

const ReportsDashboardPage = () => {
  const mock = {
    vatMonth: 2940,
    totalYear: 87000,
    topBranch: "สาขากรุงเทพ",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ภาพรวมรายงานจัดซื้อ</h1>

      {/* สรุปยอดรวม */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
          <CardContent className="p-4">
            <p className="text-sm">VAT เดือนนี้</p>
            <p className="text-xl font-bold">{mock.vatMonth.toLocaleString()} บาท</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          <CardContent className="p-4">
            <p className="text-sm">ยอดซื้อรวมปีนี้</p>
            <p className="text-xl font-bold">{mock.totalYear.toLocaleString()} บาท</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm">สาขายอดซื้อสูงสุด</p>
            <p className="text-xl font-bold">{mock.topBranch}</p>
          </CardContent>
        </Card>
      </div>

      {/* เมนูเข้ารายงานต่าง ๆ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Link to="/pos/reports/vat">
          <Card className="hover:shadow-lg cursor-pointer">
            <CardContent className="p-4 flex gap-4 items-center">
              <FileBarChart2 size={28} />
              <div>
                <p className="font-bold">ภาษีซื้อ</p>
                <p className="text-sm text-muted-foreground">รายเดือน</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/pos/reports/branch-summary">
          <Card className="hover:shadow-lg cursor-pointer">
            <CardContent className="p-4 flex gap-4 items-center">
              <BarChartHorizontalBig size={28} />
              <div>
                <p className="font-bold">ยอดซื้อแยกสาขา</p>
                <p className="text-sm text-muted-foreground">เปรียบเทียบหลายสาขา</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/pos/reports/year-summary">
          <Card className="hover:shadow-lg cursor-pointer">
            <CardContent className="p-4 flex gap-4 items-center">
              <CalendarRange size={28} />
              <div>
                <p className="font-bold">ยอดซื้อรายปี</p>
                <p className="text-sm text-muted-foreground">แนวโน้มตลอดปี</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;
