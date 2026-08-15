// src/features/employee/pages/EditEmployeePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedback } from '@/design-system';
import { getEmployeeById, updateEmployee } from '../api/employeeApi';
import EmployeeForm from '../components/EmployeeForm';
import { useAuthStore } from '@/features/auth/store/authStore.js';
import { ArrowLeft, UserCog, Loader2, AlertCircle } from 'lucide-react';

const EditEmployeePage = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
          feedback.actionError(err, 'ดึงข้อมูลพนักงานล้มเหลว', 'employee:legacy-edit:load:error');
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

  const handleUpdate = async (formData) => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await updateEmployee(id, formData);
      feedback.actionSuccess('บันทึกการแก้ไขข้อมูลพนักงานเรียบร้อยแล้ว', 'employee:legacy-update:success');
      const targetSlug = shopSlug || 'advancetech';
      navigate(`/${targetSlug}/pos/settings/employee`);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'แก้ไขพนักงานล้มเหลว');
      feedback.actionError(err, 'แก้ไขข้อมูลพนักงานไม่สำเร็จ', 'employee:legacy-update:error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center gap-3 text-slate-400 font-bold select-none animate-fadeIn">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        <p className="text-sm">กำลังเรียกค้นพิกัดข้อมูลพนักงานระดับคลัง...</p>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white border border-rose-200 text-center rounded-3xl shadow-sm space-y-3 animate-fadeIn">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-black text-rose-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transform active:scale-95 transition-all"
        >
          กลับไปหน้าร่อนถอยหลัง
        </button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white border border-slate-200 text-center rounded-3xl shadow-sm space-y-3 animate-fadeIn">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-200/60">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-black text-slate-500">ไม่พบข้อมูลประวัติพนักงานรายนี้ในฐานข้อมูลสาขา</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-slate-200/80 dark:border-zinc-800 animate-fadeIn">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
          <UserCog className="w-4 h-4 text-orange-500" /> แก้ไขข้อมูลพนักงาน
        </h1>
        <button
          onClick={() => navigate(-1)}
          disabled={submitting}
          className="flex items-center gap-1 h-8 px-3 text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-slate-200/40 dark:border-zinc-700/50 rounded-xl transform active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับ</span>
        </button>
      </div>

      {error ? <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      <EmployeeForm defaultValues={employee} onSubmit={handleUpdate} loading={submitting} showUserSearch={false} />
    </div>
  );
};

export default EditEmployeePage;
