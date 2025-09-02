

// ✅ @filename: EmployeeForm.jsx
// ✅ @folder: src/features/employee/components/

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

/**
 * EmployeeForm — ใช้ได้ทั้งโหมดเพิ่ม และแก้ไข
 * ข้อกำหนดโปรเจกต์: ห้ามเรียก API ตรงจาก Component
 * - ถ้าเป็น superadmin จะสามารถแก้ไขสาขา (branchId) ได้ โดยรับข้อมูลสาขาผ่าน props
 */
const EmployeeForm = ({ defaultValues = {}, onSubmit, loading, canEditBranch = false, branchOptions = [] }) => {
  // ✂️ ตัด UI/logic ค้นหาผู้ใช้ออกทั้งหมด ตามคำขอ

  const [formData, setFormData] = useState({
    name: defaultValues.name || '',
    phone: defaultValues.phone || '',
    positionId: defaultValues.positionId ? String(defaultValues.positionId) : '',
    branchId: defaultValues.branchId
      ? String(defaultValues.branchId)
      : (defaultValues.branch?.id ? String(defaultValues.branch.id) : ''),
  });

  // sync เมื่อ defaultValues เปลี่ยน (หลังโหลดข้อมูล)
  useEffect(() => {
    setFormData({
      name: defaultValues.name || '',
      phone: defaultValues.phone || '',
      positionId: defaultValues.positionId ? String(defaultValues.positionId) : '',
      branchId: defaultValues.branchId
        ? String(defaultValues.branchId)
        : (defaultValues.branch?.id ? String(defaultValues.branch.id) : ''),
    });
  }, [defaultValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ใช้ browser validation แทน alert (ตามมาตรฐาน UI ของระบบ)
    await onSubmit({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      positionId: Number(formData.positionId),
      ...(canEditBranch && formData.branchId ? { branchId: Number(formData.branchId) } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 🔍 บล็อกค้นหาผู้ใช้ถูกตัดออกตามคำขอ */}

      <Input
        name="name"
        placeholder="ชื่อพนักงาน"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <Input
        name="phone"
        placeholder="เบอร์โทรศัพท์"
        value={formData.phone}
        onChange={handleChange}
      />

      {canEditBranch && (
        <>
          <label className="text-sm font-medium">สาขา</label>
          <select
            name="branchId"
            value={formData.branchId}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded text-sm"
          >
            <option value="">-- เลือกสาขา --</option>
            {Array.isArray(branchOptions) && branchOptions.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </>
      )}

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
        <Button type="submit" disabled={loading || !formData.positionId}>
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;




