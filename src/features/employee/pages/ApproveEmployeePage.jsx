import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { Button } from '@/components/ui/button';
import useEmployeeStore from '../store/employeeStore';

const ApproveEmployeePage = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset } = useForm();

  const branches = useBranchStore((s) => s.branches);
  const fetchBranches = useBranchStore((s) => s.fetchBranchesAction);

  const positions = useEmployeeStore((s) => s.positions);
  const fetchPositions = useEmployeeStore((s) => s.fetchPositionsAction);
  const approveEmployee = useEmployeeStore((s) => s.approveEmployeeAction);
  const findUserByEmail = useEmployeeStore((s) => s.findUserByEmailAction);

  useEffect(() => {
    fetchPositions();
    fetchBranches();
  }, [fetchPositions, fetchBranches]);

  const handleSearch = async () => {
    try {
      const user = await findUserByEmail(searchEmail);
      setUserInfo(user);
      setError('');
    } catch (err) {
      setUserInfo(null);
      setError('ไม่พบผู้ใช้ที่กรอก');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        userId: parseInt(userInfo.id, 10),
        positionId: data.positionId,
        branchId: data.branchId,
        role: data.role,
        name: userInfo.name,
        phone: userInfo.phone,
      };
      
      await approveEmployee(payload);
      alert('✅ อนุมัติพนักงานเรียบร้อยแล้ว');
      setUserInfo(null);
      reset();
    } catch (err) {
      alert('❌ ไม่สามารถอนุมัติได้');
    }
  };

  // 🟢 [UI EXPAND] ปรับครอบ Container ให้กางเต็มหน้ากระดานสไตล์พรีเมียม สอดคล้องกับภาพหน้าจอหลัก
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-5">
        <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">🔐 อนุมัติพนักงานใหม่</h1>
        <p className="text-xs text-zinc-400 mt-0.5">ตรวจสอบอีเมล คัดเลือกตำแหน่งและอนุมัติบุคคลากรเข้าทำงานระดับสาขา</p>
      </div>

      <div className="flex gap-2 mb-6 max-w-md">
        <input
          type="email"
          inputMode="email"
          placeholder="กรอกอีเมลผู้สมัคร..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-900 flex-1 text-zinc-800 dark:text-zinc-100"
        />
        <Button onClick={handleSearch} className="px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold">ค้นหา</Button>
      </div>

      {error && <p className="text-sm font-medium text-red-500 mb-4 bg-red-50 border border-red-200 px-4 py-2 rounded-lg inline-block">{error}</p>}

      {userInfo && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg bg-zinc-50/50 dark:bg-zinc-800/20 border border-dashed rounded-xl p-5">
          <div className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-2">
            <p><strong>ชื่อ-นามสกุล:</strong> {userInfo.name}</p>
            <p><strong>เบอร์โทรศัพท์:</strong> {userInfo.phone}</p>
            <p><strong>อีเมลแอดเดรส:</strong> {userInfo.email}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">ตำแหน่งพนักงาน</label>
            <select {...register('positionId')} className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100">
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>{pos.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">เลือกสาขาประจำการ</label>
            <select {...register('branchId')} className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100">
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">กำหนดสิทธิ์ระบบ (Role)</label>
            <select {...register('role')} className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100">
              <option value="employee">employee (พนักงานทั่วไป)</option>
              <option value="admin">admin (ผู้จัดการร้าน)</option>
            </select>
          </div>

          <div className="pt-2">
            <Button type="submit" className="px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold">ยืนยันอนุมัติพนักงาน</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ApproveEmployeePage;