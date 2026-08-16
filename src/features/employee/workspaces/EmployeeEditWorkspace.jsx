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
  const employeeContextRef = useRef({ id: String(id || ''), shopSlug: shopSlug || 'advancetech' });
  const updateRequestRef = useRef(0);

  useEffect(() => {
    employeeContextRef.current = { id: String(id || ''), shopSlug: shopSlug || 'advancetech' };
    updateRequestRef.current += 1;
    submittingRef.current = false;
    setSubmitting(false);
    setEmployee(null);
    setError('');
  }, [id, shopSlug]);

  useEffect(() => {
    let cancelled = false;
    const employeeIdSnapshot = String(id || '');
    const loadEmployee = async () => {
      try {
        setLoading(true);
        setError('');
        if (!employeeIdSnapshot) {
          setError('ไม่พบรหัสพนักงานใน URL');
          return;
        }
        const data = await getEmployeeById(employeeIdSnapshot);
        if (!cancelled && employeeContextRef.current.id === employeeIdSnapshot) setEmployee(data);
      } catch (err) {
        if (!cancelled && employeeContextRef.current.id === employeeIdSnapshot) {
          setError(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'ดึงข้อมูลพนักงานล้มเหลว');
          feedback.actionError(err, 'ดึงข้อมูลพนักงานล้มเหลว', `employee:edit:${employeeIdSnapshot}:load:error`);
        }
      } finally {
        if (!cancelled && employeeContextRef.current.id === employeeIdSnapshot) setLoading(false);
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

    const employeeIdSnapshot = String(id || '');
    const shopSlugSnapshot = shopSlug || 'advancetech';
    const payload = { ...formData };
    if (!employeeIdSnapshot) return;

    const requestId = updateRequestRef.current + 1;
    updateRequestRef.current = requestId;
    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      await updateEmployee(employeeIdSnapshot, payload);
      feedback.actionSuccess(
        'บันทึกการแก้ไขข้อมูลพนักงานเรียบร้อยแล้ว',
        `employee:update:${employeeIdSnapshot}:success`,
      );

      const ownsCurrentContext =
        requestId === updateRequestRef.current &&
        employeeContextRef.current.id === employeeIdSnapshot &&
        employeeContextRef.current.shopSlug === shopSlugSnapshot;
      if (!ownsCurrentContext) {
        feedback.warning(
          'บันทึกข้อมูลพนักงานสำเร็จแล้ว แต่หน้าปัจจุบันเปลี่ยนไปเป็นพนักงานหรือร้านอื่น จึงไม่เปลี่ยนหน้าอัตโนมัติ',
          `employee:update:${employeeIdSnapshot}:context-changed:error`,
        );
        return;
      }

      navigate(`/${shopSlugSnapshot}/pos/settings/employee`);
    } catch (err) {
      const ownsCurrentContext =
        requestId === updateRequestRef.current &&
        employeeContextRef.current.id === employeeIdSnapshot &&
        employeeContextRef.current.shopSlug === shopSlugSnapshot;
      if (ownsCurrentContext) {
        setError(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'แก้ไขพนักงานล้มเหลว');
      }
      feedback.actionError(
        err,
        'แก้ไขข้อมูลพนักงานไม่สำเร็จ',
        `employee:update:${employeeIdSnapshot}:error`,
      );
    } finally {
      const ownsCurrentContext =
        requestId === updateRequestRef.current &&
        employeeContextRef.current.id === employeeIdSnapshot &&
        employeeContextRef.current.shopSlug === shopSlugSnapshot;
      if (ownsCurrentContext) {
        submittingRef.current = false;
        setSubmitting(false);
      }
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
