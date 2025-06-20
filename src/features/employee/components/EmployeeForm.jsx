
// ✅ @filename: EmployeeForm.jsx
// ✅ @folder: src/features/employee/components/

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import apiClient from '@/utils/apiClient';
import useEmployeeStore from '@/features/employee/store/employeeStore';

const EmployeeForm = ({ defaultValues = {}, onSubmit, loading }) => {
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');  


const branchIdFromStore = useEmployeeStore.getState().branch?.id || '';

const [formData, setFormData] = useState({
    userId: defaultValues.userId || '',
    name: defaultValues.name || '',
    phone: defaultValues.phone || '',
    positionId: defaultValues.positionId || '',
    branchId: branchIdFromStore,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.positionId) {
      alert('โปรดเลือกตำแหน่ง');
      return;
    }
    await onSubmit({
      ...formData,
      positionId: Number(formData.positionId),
    });
  };

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) return;
    try {
      const res = await apiClient.get(`/employees/users/search?q=${searchQuery}&_=${Date.now()}`);
      console.log('✅ ค้นหา user:', res.data);
      setUserSuggestions(res.data);

      // ✅ Autofill ทันทีเมื่อเจอ 1 คนชัดเจน
      if (res.data.length === 1) {
        const user = res.data[0];
        setFormData((prev) => ({
          ...prev,
          userId: user.id,
          name: user.customerProfile?.name || '',
          phone: user.customerProfile?.phone || '',
          
        }));
      }
    } catch (err) {
      console.error('❌ searchUsers error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
  <label className="text-sm font-medium">ค้นหาผู้ใช้</label>
  <div className="flex gap-2">
    <input
      type="text"
      name="searchQuery"
      className="border p-2 w-full rounded text-sm"
      placeholder="พิมพ์ชื่อ หรืออีเมลของผู้ใช้..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={async (e) => {
        if (e.key === 'Enter') await handleSearch();
      }}
    />
    <Button type="button" onClick={handleSearch} className="text-sm">ค้นหา</Button>
  </div>
  {userSuggestions.length > 0 ? (
    <div className="mt-1 border rounded bg-white max-h-40 overflow-y-auto text-sm">
      {userSuggestions.map((user) => (
        <div
          key={user.id}
          className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
          onClick={() => setFormData((prev) => ({
            ...prev,
            userId: user.id,
            name: user.customerProfile?.name || '',
            phone: user.customerProfile?.phone || '',
            
          }))}
        >
          {user.customerProfile?.name || 'ไม่มีชื่อ'} ({user.email})
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-500 mt-2">ไม่พบผู้ใช้ที่ตรงกับคำค้น</p>
  )}
      
</div>

<Input name="name" placeholder="ชื่อพนักงาน" value={formData.name} onChange={handleChange} required />
      <Input name="phone" placeholder="เบอร์โทรศัพท์" value={formData.phone} onChange={handleChange} />

            <label className="text-sm font-medium">ตำแหน่ง</label>
      <select
        name="positionId"
        value={formData.positionId}
        onChange={handleChange}
        required
        className="border p-2 w-full rounded text-sm"
      >
        <option value="">-- เลือกตำแหน่ง --</option>
        <option value="1">ผู้ดูแลระบบ</option>
        <option value="2">ผู้จัดการสาขา</option>
        <option value="3">พนักงานขาย</option>
        <option value="4">ช่างเทคนิค</option>
        <option value="5">บัญชี</option>
        <option value="6">แคชเชียร์</option>
        <option value="7">พนักงานทั่วไป</option>
      </select>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;

