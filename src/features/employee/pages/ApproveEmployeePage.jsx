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
  const currentBranchId = useBranchStore((s) => s.selectedBranchId);
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
      console.log('Submitting payload:', payload);
      
      await approveEmployee(payload);
      alert('✅ อนุมัติพนักงานเรียบร้อยแล้ว');
      setUserInfo(null);
      reset();
    } catch (err) {
      alert('❌ ไม่สามารถอนุมัติได้');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">อนุมัติพนักงาน</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="email"
          inputMode="email"
          placeholder="กรอกอีเมลผู้สมัคร"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border rounded px-3 py-2 flex-1"
        />
        <Button onClick={handleSearch}>ค้นหา</Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {userInfo && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <p><strong>ชื่อ:</strong> {userInfo.name}</p>
            <p><strong>เบอร์โทร:</strong> {userInfo.phone}</p>
            <p><strong>อีเมล:</strong> {userInfo.email}</p>
          </div>

          <div>
            <label className="block mb-1">ตำแหน่งพนักงาน</label>
            <select {...register('positionId')} className="w-full border rounded px-3 py-2">
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>{pos.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">เลือกสาขา</label>
            <select {...register('branchId')} className="w-full border rounded px-3 py-2">
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">กำหนด Role</label>
            <select {...register('role')} className="w-full border rounded px-3 py-2">
              <option value="employee">employee</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <Button type="submit">อนุมัติ</Button>
        </form>
      )}
    </div>
  );
};

export default ApproveEmployeePage;
