import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedback } from '@/design-system';
import { getEmployeeById, updateEmployee, getBranchDropdowns } from '../api/employeeApi';
import EmployeeForm from '../components/EmployeeForm';
import { useAuthStore } from '@/features/auth/store/authStore.js';

const EditEmployeePage = () => {
  const { shopSlug, id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const isSuperAdmin = String(role || '').toLowerCase() === 'superadmin';

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [branches, setBranches] = useState([]);
  const submittingRef = useRef(false);

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
        if (!cancelled) {
          setError(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'ดึงข้อมูลพนักงานล้มเหลว');
          feedback.actionError(err, 'ดึงข้อมูลพนักงานล้มเหลว', 'employee:edit:load:error');
        }
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
        if (!cancelled) feedback.actionError(err, 'โหลดรายการสาขาไม่สำเร็จ', 'employee:branches:load:error');
      }
    })();
    return () => { cancelled = true; };
  }, [isSuperAdmin]);

  const handleUpdate = async (formData) => {
    if (submitting || submittingRef.current) return;

    const employeeId = id;
    const payload = { ...formData };
    if (!employeeId) return;

    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      await updateEmployee(employeeId, payload);
      feedback.actionSuccess('บันทึกการแก้ไขข้อมูลพนักงานเรียบร้อยแล้ว', 'employee:update:success');
      navigate(`/${shopSlug}/pos/settings/employee`);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'แก้ไขพนักงานล้มเหลว');
      feedback.actionError(err, 'แก้ไขข้อมูลพนักงานไม่สำเร็จ', 'employee:update:error');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const mutationBusy = submitting || submittingRef.current;

  if (loading) return <p className="text-center text-emerald-700">กำลังโหลดข้อมูล...</p>;
  if (error && !employee) return <p className="text-center text-red-500">{error}</p>;
  if (!employee) return <p className="text-center text-red-500">ไม่พบข้อมูลพนักงาน</p>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-emerald-100 dark:border-zinc-700">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-emerald-800 dark:text-emerald-300">✏️ แก้ไขข้อมูลพนักงาน</h1>
        <button
          onClick={() => {
            if (!mutationBusy) navigate(-1);
          }}
          disabled={mutationBusy}
          className="text-sm px-3 py-1 border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 rounded shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          ← กลับ
        </button>
      </div>
      {error ? <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <EmployeeForm defaultValues={employee} onSubmit={handleUpdate} loading={mutationBusy} canEditBranch={isSuperAdmin} branchOptions={branches} />
    </div>
  );
};

export default EditEmployeePage;
