import { useCreatePO } from '@/features/purchases/hooks/useCreatePO';

const CreatePOPage = () => {
  const { mutate: createPO, isLoading } = useCreatePO();

  const handleSubmit = (data) => {
    createPO(data, {
      onSuccess: (res) => {
        console.log('✅ PO สร้างแล้ว:', res.po);
        // อาจ redirect หรือแจ้งเตือนผู้ใช้
      },
      onError: (err) => {
        console.error('❌ สร้างไม่สำเร็จ:', err);
      },
    });
  };

  return (
    <POForm onSubmit={handleSubmit} isLoading={isLoading} />
  );
};


export default CreatePOPage;