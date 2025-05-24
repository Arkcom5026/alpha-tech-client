// src/features/productTemplate/pages/EditProductTemplatePage.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductTemplateForm from '../components/ProductTemplateForm';
import { getProductTemplateById, updateProductTemplate } from '../api/productTemplateApi';
import useEmployeeStore from '@/store/employeeStore';

const EditProductTemplatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const branchId = useEmployeeStore((state) => state.branch?.id);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState('');
  const imageRef = useRef();

  useEffect(() => {
    if (!branchId) {
      setError('ไม่พบ branchId โปรดล็อกอินใหม่');
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getProductTemplateById(id, branchId);

        // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ dropdown เข้าใจได้
        const mapped = {
          ...data,
          unitId: data.unitId?.toString() || '',
          productProfileId: data.productProfileId?.toString() || '',
        };

        setTemplate(mapped);
      } catch (err) {
        console.error('โหลดข้อมูลรูปแบบสินค้าล้มเหลว:', err);
        setError('ไม่สามารถโหลดข้อมูลรูปแบบสินค้าได้');
      }
    };

    fetchData();
  }, [id, branchId]);

  const handleUpdate = async (formData) => {
    formData.createdByBranchId = branchId;
    try {
      await updateProductTemplate(id, formData, branchId);
      navigate('/pos/stock/templates');
    } catch (err) {
      console.error('อัปเดตข้อมูลรูปแบบสินค้าล้มเหลว:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  if (error) return <p className="text-red-500 font-medium">{error}</p>;
  if (!template) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">แก้ไขรูปแบบสินค้า</h2>
      <ProductTemplateForm
        defaultValues={template}
        onSubmit={handleUpdate}
        mode="edit"
        imageRef={imageRef}
      />
    </div>
  );
};

export default EditProductTemplatePage;