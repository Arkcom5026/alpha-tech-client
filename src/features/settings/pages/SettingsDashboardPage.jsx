
// 4 SettingsDashboardPage.jsx (หน้า Dashboard แบบ Table-first ตามมาตรฐานระบบ)
// ✅ โชว์การ์ดลิงก์แบบปุ่มตารางเรียบง่าย และสรุปตัวเลขสั้น ๆ (ถ้ามี store พร้อม)
import { useNavigate } from 'react-router-dom';

const Tile = ({ title, to, desc }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
    >
      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
      {desc && <div className="text-xs text-zinc-500 mt-1">{desc}</div>}
    </button>
  );
};

const SettingsDashboardPage = () => {
  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">หน้าหลักการตั้งค่า</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Tile title="รายชื่อพนักงาน" to="/pos/settings/employee" desc="จัดการข้อมูลพนักงานทั้งหมด" />
          <Tile title="อนุมัติพนักงานใหม่" to="/pos/settings/employee/approve" desc="อนุมัติการเข้าระบบของพนักงาน" />
          <Tile title="จัดการตำแหน่งงาน" to="/pos/settings/employee/positions" desc="เพิ่ม/แก้ไข/ปิดใช้งานตำแหน่ง" />
          <Tile title="จัดการสาขา" to="/pos/settings/branches" desc="ข้อมูลและสถานะสาขา" />
          <Tile title="จัดการธนาคาร" to="/pos/settings/bank" desc="ข้อมูลธนาคารสำหรับรับ/จ่าย" />
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboardPage;