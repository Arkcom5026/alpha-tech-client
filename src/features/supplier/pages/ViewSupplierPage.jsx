import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSupplierById } from '../api/supplierApi';
import useAuthStore from '@/store/employeeStore';
import { Button } from '@/components/ui/button';

const ViewSupplierPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplierById(id);
        setSupplier(data);
      } catch (err) {
        console.error('ไม่สามารถโหลดข้อมูลผู้ขายได้', err);
        setError('ไม่สามารถโหลดข้อมูลผู้ขายได้');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchSupplier();
  }, [id, token]);

  if (loading) return <p className="text-center py-10">กำลังโหลดข้อมูล...</p>;
  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">เกิดข้อผิดพลาด:</strong>
          <span className="block sm:inline ml-1">{error}</span>
        </div>
      </div>
    );
  }

  if (!supplier || !supplier.name || !supplier.phone) {
    return <p className="text-center text-red-500">ข้อมูลไม่ครบถ้วน หรือไม่พบผู้ขาย</p>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-800">ข้อมูลผู้ขาย</h2>
          <p className="text-sm text-zinc-500">รายละเอียดทั้งหมดของผู้ขายรายนี้</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-zinc-600">ชื่อผู้ขาย:</span>
            <p className="text-zinc-900">{supplier.name}</p>
          </div>
          <div>
            <span className="font-medium text-zinc-600">ชื่อผู้ติดต่อ:</span>
            <p className="text-zinc-900">{supplier.contactPerson || '-'}</p>
          </div>
          <div>
            <span className="font-medium text-zinc-600">เบอร์โทร:</span>
            <p className="text-zinc-900">{supplier.phone}</p>
          </div>
          <div>
            <span className="font-medium text-zinc-600">Email:</span>
            <p className="text-zinc-900">{supplier.email || '-'}</p>
          </div>
          <div>
            <span className="font-medium text-zinc-600">เลขผู้เสียภาษี:</span>
            <p className="text-zinc-900">{supplier.taxId || '-'}</p>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-zinc-600">ที่อยู่:</span>
            <p className="text-zinc-900 whitespace-pre-wrap">{supplier.address || '-'}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-8 mb-2 text-zinc-700">ข้อมูลเครดิต</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-zinc-600">วงเงินเครดิตสูงสุด:</span>
            <p className="text-zinc-900">{supplier.creditLimit?.toLocaleString() || '0'} บาท</p>
          </div>
          <div>
            <span className="font-medium text-zinc-600">ระยะเวลาผ่อนชำระ:</span>
            <p className="text-zinc-900">{supplier.creditTerm || 0} วัน</p>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-zinc-600">หมายเหตุ:</span>
            <p className="text-zinc-900 whitespace-pre-wrap">{supplier.notes || '-'}</p>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ViewSupplierPage;

