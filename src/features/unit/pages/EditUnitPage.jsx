// ✅ src/features/unit/pages/EditUnitPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useUnitStore from '../store/unitStore';
import UnitForm from '../components/UnitForm';

const EditUnitPage = () => {
  const { id } = useParams();
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
        console.error('loadUnit error:', err);
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
      navigate('/pos/stock/units/');
    } catch (err) {
      console.error('update unit error:', err);
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
