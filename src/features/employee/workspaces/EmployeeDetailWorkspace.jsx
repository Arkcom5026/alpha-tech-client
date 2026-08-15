import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmActionDialog } from '@/design-system/composites';
import { feedback } from '@/design-system';
import { getEmployeeById, setEmployeeActive } from '../api/employeeApi';

const statusLabel = {
  pending: 'รออนุมัติ',
  active: 'ใช้งานอยู่',
  inactive: 'ระงับการใช้งาน',
};

const ViewEmployeePage = () => {
  const { shopSlug, id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);
  const [error, setError] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getEmployeeById(id);
        if (active) setEmployee(data);
      } catch (err) {
        if (active) {
          const message = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'โหลดข้อมูลพนักงานไม่สำเร็จ';
          setError(message);
          feedback.actionError(err, 'โหลดข้อมูลพนักงานไม่สำเร็จ', 'employee:load:error');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) fetchData();
    return () => {
      active = false;
    };
  }, [id]);

  const status = useMemo(() => {
    if (!employee) return '';
    if (employee.status) return String(employee.status).toLowerCase();
    if (employee.approved === false) return 'pending';
    return employee.active === false ? 'inactive' : 'active';
  }, [employee]);

  const requestStatusChange = () => {
    if (!employee || status === 'pending') return;
    setPendingStatusChange(true);
  };

  const confirmStatusChange = async () => {
    if (!employee || status === 'pending') return;

    const nextActive = status !== 'active';
    const actionText = nextActive ? 'เปิดใช้งาน' : 'ระงับการใช้งาน';

    try {
      setChangingStatus(true);
      setError('');
      const result = await setEmployeeActive(employee.id, nextActive);
      setEmployee((current) => ({
        ...current,
        ...(result?.employee || {}),
        active: nextActive,
        status: nextActive ? 'active' : 'inactive',
      }));
      setPendingStatusChange(false);
      feedback.actionSuccess(`${actionText}พนักงานเรียบร้อยแล้ว`, `employee:${nextActive ? 'activate' : 'suspend'}:success`);
    } catch (err) {
      const message = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || `${actionText}พนักงานไม่สำเร็จ`;
      setError(message);
      feedback.actionError(err, `${actionText}พนักงานไม่สำเร็จ`, `employee:${nextActive ? 'activate' : 'suspend'}:error`);
    } finally {
      setChangingStatus(false);
    }
  };

  if (loading) return <p className="text-center">กำลังโหลดข้อมูล...</p>;
  if (!employee) return <p className="text-center text-red-500">{error || 'ไม่พบข้อมูลพนักงาน'}</p>;

  const isActive = status === 'active';
  const nextActive = status !== 'active';

  return (
    <>
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-md border dark:border-zinc-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
            {employee.name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-800 dark:text-white">👤 รายละเอียดพนักงาน</h1>
            <span className={`inline-flex mt-2 rounded-full px-2.5 py-1 text-xs font-medium ${
              status === 'active'
                ? 'bg-emerald-100 text-emerald-700'
                : status === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-zinc-200 text-zinc-700'
            }`}>
              {statusLabel[status] || status || '-'}
            </span>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-800 dark:text-zinc-200">
          <div><span className="font-medium">ชื่อ:</span> {employee.name || '-'}</div>
          <div><span className="font-medium">อีเมล:</span> {employee.user?.email || employee.email || '-'}</div>
          <div><span className="font-medium">เบอร์โทร:</span> {employee.phone || '-'}</div>
          <div><span className="font-medium">ตำแหน่ง:</span> {employee.position?.name || '-'}</div>
          <div><span className="font-medium">สาขา:</span> {employee.branch?.name || '-'}</div>
          <div><span className="font-medium">Role:</span> {employee.user?.role || employee.role || '-'}</div>
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded shadow"
          >
            ← กลับ
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/${shopSlug}/pos/settings/employee/edit/${employee.id}`)}
              className="rounded bg-emerald-600 px-4 py-2 text-sm text-white shadow transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              ✏️ แก้ไขข้อมูล
            </button>

            <button
              onClick={requestStatusChange}
              disabled={changingStatus || status === 'pending'}
              className={`text-sm px-4 py-2 text-white rounded shadow disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
              title={status === 'pending' ? 'พนักงานที่รออนุมัติต้องดำเนินการผ่านขั้นตอนอนุมัติ' : ''}
            >
              {changingStatus ? 'กำลังบันทึก...' : isActive ? '⏸ ระงับการใช้งาน' : '▶ เปิดใช้งาน'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmActionDialog
        open={pendingStatusChange}
        title={nextActive ? 'เปิดใช้งานพนักงานอีกครั้ง' : 'ระงับการใช้งานพนักงาน'}
        description={nextActive
          ? `ยืนยันเปิดใช้งาน ${employee.name || 'พนักงานรายนี้'} อีกครั้งหรือไม่?`
          : `ยืนยันระงับการใช้งาน ${employee.name || 'พนักงานรายนี้'} หรือไม่? ประวัติการทำงานทั้งหมดจะยังคงอยู่`}
        confirmLabel={nextActive ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'}
        intent={nextActive ? 'primary' : 'destructive'}
        loading={changingStatus}
        loadingLabel="กำลังบันทึก..."
        onClose={() => setPendingStatusChange(false)}
        onConfirm={confirmStatusChange}
      />
    </>
  );
};

export default ViewEmployeePage;
