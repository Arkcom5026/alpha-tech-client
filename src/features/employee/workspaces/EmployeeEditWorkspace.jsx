import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById, updateEmployee, getBranchDropdowns } from '../api/employeeApi';
import EmployeeForm from '../components/EmployeeForm';
import { useAuthStore } from '@/features/auth/store/authStore.js';

const EditEmployeePage = () => {
  const { shopSlug, id } = useParams(); // 🟢 [DYNAMIC PARAM FIX] แกะรหัส shopSlug มาควบคุมเลนวิ่ง
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const isSuperAdmin = String(role || '').toLowerCase() === 'superadmin';

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const loadEmployee = async () => {
      try {
        setLoading(true);
        setError('');
        if (!id) {
          setError('ไม่พบรหัสพนักงานใน URL');
          return;
        }
        const data = await getEmployeeById(id);
        if (!cancelled) setEmployee(data);
      } catch (err) {
        console.error('❌ ดึงข้อมูลพนักงานล้มเหลว:', err);
        if (!cancelled) setError(err?.response?.data?.message || err?.message || 'ดึงข้อมูลพนักงานล้มเหลว');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEmployee();
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await getBranchDropdowns();
        if (!cancelled) setBranches(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error('❌ โหลดสาขาล้มเหลว:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [isSuperAdmin]);

  const handleUpdate = async (formData) => {
    try {
      await updateEmployee(id, formData);
      // 🟢 [DYNAMIC NAVIGATE] วิ่งสับเลนขากลับตรงล็อกพ่วง shopSlug เข้าหน้าบัญชีรายชื่อพนักงานส่วนกลาง
      navigate(`/${shopSlug}/pos/settings/employee`);
    } catch (err) {
      console.error('❌ แก้ไขพนักงานล้มเหลว:', err);
      setError(err?.response?.data?.message || err?.message || 'แก้ไขพนักงานล้มเหลว');
    }
  };

  if (loading) return <p className="text-center">กำลังโหลดข้อมูล...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!employee) return <p className="text-center text-red-500">ไม่พบข้อมูลพนักงาน</p>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-md border dark:border-zinc-700">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-blue-800 dark:text-white">✏️ แก้ไขข้อมูลพนักงาน</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded shadow"
        >
          ← กลับ
        </button>
      </div>
      <EmployeeForm defaultValues={employee} onSubmit={handleUpdate} loading={false} canEditBranch={isSuperAdmin} branchOptions={branches} />
    </div>
  );
};

export default EditEmployeePage;