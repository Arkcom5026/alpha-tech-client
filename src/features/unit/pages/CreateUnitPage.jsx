// ✅ src/features/unit/pages/CreateUnitPage.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import UnitForm from '../components/UnitForm';
import useUnitStore from '../store/unitStore';

const CreateUnitPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addUnit } = useUnitStore();

  const handleCreate = async (data) => {
    setIsSubmitting(true);
    try {
      await addUnit(data);
      navigate('/pos/stock/units/');
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
