// ✅ src/features/productType/pages/ListProductTypePage.jsx
import PageHeader from '@/components/shared/layout/PageHeader';
import SharedDataTable from '@/components/shared/table/SharedDataTable';
import LoadingSpinner from '@/components/shared/display/LoadingSpinner';
import EmptyState from '@/components/shared/display/EmptyState';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import ConfirmDeleteDialog from '@/components/shared/dialogs/ConfirmDeleteDialog';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductTypes, deleteProductType } from '../api/productTypeApi';

const ListProductTypePage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingItem, setDeletingItem] = useState(null);

  const fetchData = async () => {
    try {
      const result = await getProductTypes();
      setData(result);
    } catch (error) {
      console.error('❌ ไม่สามารถโหลดข้อมูลประเภทสินค้า:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => navigate('/pos/stock/types/create');
  const handleEdit = (id) => navigate(`/pos/stock/types/edit/${id}`);
  const handleDelete = (item) => setDeletingItem(item);

  const confirmDelete = async () => {
    try {
      await deleteProductType(deletingItem.id);
      setDeletingItem(null);
      fetchData();
    } catch (error) {
      console.error('❌ ลบข้อมูลไม่สำเร็จ:', error);
    }
  };

  const columns = [
    { key: 'name', header: 'ชื่อประเภทสินค้า' },
    { key: 'group', header: 'กลุ่ม' },
    {
      key: 'actions',
      header: 'การจัดการ',
      render: (row) => (
        <StandardActionButtons
          onEdit={() => handleEdit(row.id)}
          onDelete={() => handleDelete(row)}
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <PageHeader
        title="จัดการประเภทสินค้า"
        actions={<StandardActionButtons onAdd={handleAdd} />}
      />
      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <EmptyState message="ยังไม่มีประเภทสินค้าในระบบ" />
      ) : (
        <SharedDataTable columns={columns} data={data} />
      )}
      <ConfirmDeleteDialog
        open={!!deletingItem}
        itemLabel={deletingItem?.name}
        onCancel={() => setDeletingItem(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ListProductTypePage;
