import { useNavigate } from 'react-router-dom';
import {
  FaMoneyBillWave,
  FaListAlt,
  FaTimesCircle,
  FaBolt,
  FaSearch,
  FaBell,
  FaCog
} from 'react-icons/fa';

const SalesDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaMoneyBillWave className="text-green-600" />
        หน้าหลักการขาย
      </h1>

      {/* สรุปยอด */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-xl shadow">
          <h2 className="text-sm">ยอดขายวันนี้</h2>
          <p className="text-xl font-bold">฿15,200</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-4 rounded-xl shadow">
          <h2 className="text-sm">จำนวนรายการขาย</h2>
          <p className="text-xl font-bold">48 รายการ</p>
        </div>
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-xl shadow">
          <h2 className="text-sm">ยอดที่ยังไม่ชำระ</h2>
          <p className="text-xl font-bold">3 รายการ</p>
        </div>
      </div>

      {/* เมนูด่วน */}
      <h2 className="text-lg font-semibold mb-2">การเข้าถึงอย่างรวดเร็ว</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ✅ ปุ่มขายด่วน พร้อมลิงก์ */}
        <div
          onClick={() => navigate('/pos/sales/sale')}
          className="cursor-pointer bg-white dark:bg-zinc-800 p-4 rounded-xl border border-border shadow hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
        >
          <FaBolt className="text-yellow-500 mb-2" size={24} />
          <p>ขายสินค้า</p>
        </div>

        {/* ปุ่มอื่นๆ */}
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-border shadow hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
          <FaSearch className="text-blue-500 mb-2" size={24} />
          <p>ค้นหาออเดอร์</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-border shadow hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
          <FaBell className="text-red-500 mb-2" size={24} />
          <p>การแจ้งเตือน</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-border shadow hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
          <FaCog className="text-gray-500 mb-2" size={24} />
          <p>ตั้งค่าระบบขาย</p>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboardPage;
