// src/features/unit/pages/EditUnitPage.jsx
import { useEffect, useRef, useState } from 'react';
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
  const submittingRef = useRef(false);

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
    if (isSubmitting || submittingRef.current) return;

    const unitIdSnapshot = id;
    const shopSlugSnapshot = shopSlug;
    const payload = { ...formData, name: formData?.name?.trim?.() || formData?.name };

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await updateUnit(unitIdSnapshot, payload);
      feedback.actionSuccess('บันทึกการแก้ไขหน่วยนับเรียบร้อยแล้ว', `unit:${unitIdSnapshot}:update:success`);
      navigate(`/${shopSlugSnapshot}/pos/stock/units`);
    } catch (err) {
      feedback.actionError(err, 'บันทึกการแก้ไขหน่วยนับไม่สำเร็จ', `unit:${unitIdSnapshot}:update:error`);
    } finally {
      submittingRef.current = false;
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
