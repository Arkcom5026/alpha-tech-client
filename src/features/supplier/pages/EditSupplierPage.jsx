// ✅ แก้ไข EditSupplierPage: เปลี่ยนจาก updateSupplier() → useSupplierStore().updateSupplier()
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSupplierById, deleteSupplier } from '../api/supplierApi';
import useSupplierStore from '../store/supplierStore';
import useEmployeeStore from '@/store/employeeStore';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import SupplierForm from '../components/SupplierForm';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Trash } from 'lucide-react';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

const EditSupplierPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useEmployeeStore((state) => state.token);
  const updateSupplier = useSupplierStore((state) => state.updateSupplier);
  const [defaultValues, setDefaultValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplierById(token, id);
        setDefaultValues(data);
      } catch (err) {
        console.error('❌ โหลดข้อมูลผู้ขายล้มเหลว', err);
        toast.error('โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };

    if (token && id) fetchSupplier();
  }, [token, id]);

  const handleSubmit = async (formData) => {
    try {
      const formatted = {
        ...formData,
        creditLimit: parseFloat(formData.creditLimit || 0),
        creditTerm: parseInt(formData.creditTerm || 0),
        notes: formData.notes || null,
      };
      await updateSupplier(token, id, formatted);
      toast.success('บันทึกข้อมูลผู้ขายเรียบร้อยแล้ว');
      navigate('/pos/purchases/suppliers');
    } catch (err) {
      console.error('❌ อัปเดตผู้ขายล้มเหลว', err);
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSupplier(token, id);
      toast.success('ลบผู้ขายเรียบร้อยแล้ว');
      navigate('/pos/purchases/suppliers');
    } catch (err) {
      console.error('❌ ลบผู้ขายล้มเหลว', err);
      toast.error('ไม่สามารถลบผู้ขายได้');
    }
  };

  if (loading) return <p className="text-center py-10">กำลังโหลดข้อมูล...</p>;
  if (!defaultValues) return <p className="text-center text-red-500">ไม่พบข้อมูลผู้ขาย</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">แก้ไข Supplier</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/pos/purchases/suppliers')}>
            ← ย้อนกลับ
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex items-center gap-1">
                      <Trash className="w-4 h-4" /> ลบผู้ขาย
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <p className="text-base font-semibold text-zinc-700">ยืนยันการลบผู้ขาย</p>
                      <p className="text-sm text-zinc-500">คุณแน่ใจหรือไม่ว่าต้องการลบผู้ขายรายนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
                      <Button variant="destructive" onClick={handleDelete}>ยืนยันลบ</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                การลบผู้ขายจะไม่สามารถย้อนกลับได้
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-zinc-50 rounded-xl shadow-sm border">
        <div>
          <p className="text-sm text-zinc-600">วงเงินเครดิตสูงสุด</p>
          <p className="text-lg font-semibold text-zinc-900">{defaultValues.creditLimit?.toLocaleString()} บาท</p>
        </div>
        <div>
          <p className="text-sm text-zinc-600">ระยะเวลาผ่อนชำระ (วัน)</p>
          <p className="text-lg font-semibold text-zinc-900">{defaultValues.creditTerm} วัน</p>
        </div>
        <div>
          <p className="text-sm text-zinc-600">ยอดค้างชำระ</p>
          <p className="text-lg font-bold text-red-600">{defaultValues.outstandingDebt?.toLocaleString()} บาท</p>
        </div>
        <div>
          <p className="text-sm text-zinc-600">หมายเหตุ</p>
          <p className="text-zinc-900 whitespace-pre-wrap">{defaultValues.notes || '-'}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white shadow-md border">
        <SupplierForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isEdit={true}
          showCreditFields={true}
        />
      </div>
    </div>
  );
};

export default EditSupplierPage;
