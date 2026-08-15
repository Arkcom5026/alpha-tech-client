// src/features/unit/pages/EditUnitPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedback } from '@/design-system';
import useUnitStore from '../store/unitStore';
import UnitForm from '../components/UnitForm';

const EditUnitPage = () => {
  const { shopSlug, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unit, setUnit] = useState(null);

  const { getUnitById, updateUnit } = useUnitStore();

  useEffect(() => {
    const loadUnit = async () => {
      try {
        const data = await getUnitById(id);
        setUnit(data);
      } catch (err) {
        feedback.actionError(err, 'โหลดข้อมูลหน่วยนับไม่สำเร็จ', 'unit:load:error');
      } finally {
        setLoading(false);
      }
    };
    loadUnit();
  }, [id, getUnitById]);

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      await updateUnit(id, formData);
      feedback.actionSuccess('บันทึกการแก้ไขหน่วยนับเรียบร้อยแล้ว', 'unit:update:success');
      navigate(`/${shopSlug}/pos/stock/units`);
    } catch (err) {
      feedback.actionError(err, 'บันทึกการแก้ไขหน่วยนับไม่สำเร็จ', 'unit:update:error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-4">กำลังโหลดข้อมูล...</div>;
  if (!unit) return <div className="p-4 text-red-500">ไม่พบข้อมูลหน่วยนับ</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">✏️ แก้ไขหน่วยนับ</h1>
      <UnitForm defaultValues={unit} onSubmit={handleUpdate} isSubmitting={isSubmitting} />
    </div>
  );
};

export default EditUnitPage;
