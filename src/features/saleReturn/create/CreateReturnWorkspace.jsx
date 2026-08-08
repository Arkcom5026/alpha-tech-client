import ReturnForm from '../components/ReturnForm';

const CreateReturnWorkspace = ({ sale, onSubmit }) => (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">สร้างใบคืนสินค้า</h1>
    <p className="mb-2">เลขที่ใบขาย: {sale?.code}</p>

    {Array.isArray(sale?.items) ? (
      sale.items.length > 0 ? (
        <ReturnForm items={sale.items} sale={sale} onSubmit={onSubmit} />
      ) : (
        <div className="text-center py-6 text-gray-500">ไม่มีรายการสินค้าสำหรับคืน</div>
      )
    ) : (
      <div className="text-center py-6 text-gray-400 italic">กำลังโหลดข้อมูลสินค้า...</div>
    )}
  </div>
);

export default CreateReturnWorkspace;
