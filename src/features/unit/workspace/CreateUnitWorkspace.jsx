// src/features/unit/pages/CreateUnitPage.jsx
import { useNavigate, useParams } from 'react-router-dom';
import { useRef, useState } from 'react';
import { feedback } from '@/design-system';
import UnitForm from '../components/UnitForm';
import useUnitStore from '../store/unitStore';

const CreateUnitPage = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const { addUnit } = useUnitStore();

  const handleCreate = async (data) => {
    if (isSubmitting || submittingRef.current) return;

    const shopSlugSnapshot = shopSlug;
    const payload = { ...data, name: data?.name?.trim?.() || data?.name };

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await addUnit(payload);
      feedback.actionSuccess('เพิ่มหน่วยนับเรียบร้อยแล้ว', 'unit:create:success');
      navigate(`/${shopSlugSnapshot}/pos/stock/units`);
    } catch (err) {
      feedback.actionError(err, 'เพิ่มหน่วยนับไม่สำเร็จ', 'unit:create:error');
    } finally {
      submittingRef.current = false;
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
