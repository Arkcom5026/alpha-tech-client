// ✅ src/features/productType/pages/EditProductTypePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/layout/PageHeader';
import ProductTypeForm from '../components/ProductTypeForm';
import LoadingSpinner from '@/components/shared/display/LoadingSpinner';
import EmptyState from '@/components/shared/display/EmptyState';
import { getProductTypeById, updateProductType } from '../api/productTypeApi';


const EditProductTypePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productType, setProductType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProductTypeById(id);
        setProductType(data);
      } catch (error) {
        console.error('❌ ไม่สามารถโหลดข้อมูลประเภทสินค้า:', error);
        setProductType(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      await updateProductType(id, data);
      navigate('/pos/stock/types');
    } catch (error) {
      const msg =
        error?.response?.data?.error ??
        (typeof error?.response?.data === 'string' ? error.response.data : null) ??
        error?.message ??
        'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
      throw new Error(msg);
    }
  };

  return (
    <div className="p-4">
      <PageHeader title="แก้ไขประเภทสินค้า" />
      {loading ? (
        <LoadingSpinner />
      ) : productType ? (
        <ProductTypeForm defaultValues={productType} onSubmit={handleSubmit} />
      ) : (
        <EmptyState message="ไม่พบข้อมูลประเภทสินค้าที่ต้องการแก้ไข" />
      )}
    </div>
  );
};

export default EditProductTypePage;
