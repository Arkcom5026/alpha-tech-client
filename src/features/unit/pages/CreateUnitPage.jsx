// src/features/unit/pages/CreateUnitPage.jsx
import { useNavigate, useParams } from 'react-router-dom'; // 🟢 [DYNAMIC PARAM FIX] นำเข้า useParams มาร่วมทีม
import { useState } from 'react';
import UnitForm from '../components/UnitForm';
import useUnitStore from '../store/unitStore';

const CreateUnitPage = () => {
  const { shopSlug } = useParams(); // 🟢 [LINK BINDING] แกะรหัสชื่อร้านค้าพาร์ตเนอร์สแตนด์บายใช้งานแบบ Multi-Tenant
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addUnit } = useUnitStore();

  const handleCreate = async (data) => {
    setIsSubmitting(true);
    try {
      await addUnit(data);
      // 🟢 [BUG FIX SIGNALS] ล้างเครื่องหมายโควทเดี่ยวซ้อน และตัดสแลช (/) ตัวท้ายสุดออกให้แบนราบตรงล็อกเราเตอร์
      navigate(`/${shopSlug}/pos/stock/units`);
    } catch (err) {
      console.error('create unit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">➕ เพิ่มหน่วยนับ</h1>
      <UnitForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CreateUnitPage;