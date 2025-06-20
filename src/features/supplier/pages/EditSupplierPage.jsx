// ✅ แก้ไข EditSupplierPage: เปลี่ยนจาก updateSupplier() → useSupplierStore().updateSupplier()
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSupplierById, deleteSupplier } from '../api/supplierApi';
import useSupplierStore from '../store/supplierStore';
import { Button } from '@/components/ui/button';
import SupplierForm from '../components/SupplierForm';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Trash } from 'lucide-react';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useBranchStore } from '@/features/branch/store/branchStore';

const EditSupplierPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateSupplierAction } = useSupplierStore();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const [defaultValues, setDefaultValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplierById(id);

        // ✅ แปลง bankId ให้เป็น string เพื่อให้ default dropdown ทำงานถูกต้อง
        if (data.bankId !== null && typeof data.bankId !== 'string') {
          data.bankId = data.bankId.toString();
          console.log('✅ bankId (string):', data.bankId);
        }
        setDefaultValues(data);
      } catch (err) {
        console.error('❌ โหลดข้อมูลผู้ขายล้มเหลว', err);        
      } finally {
        setLoading(false);
      }
    };

    if (id && selectedBranchId) fetchSupplier();
  }, [id, selectedBranchId]);

  const handleSubmit = async (formData) => {
    try {
      if (!selectedBranchId) throw new Error('ยังไม่ได้เลือกสาขา');
      const formatted = {
        ...formData,
        creditLimit: parseFloat(formData.creditLimit || 0),
        creditBalance: parseFloat(formData.creditBalance || 0),
        paymentTerms: parseInt(formData.paymentTerms || 0),
        notes: formData.notes || null,
      };
      await updateSupplierAction(id, formatted);      
      navigate('/pos/purchases/suppliers');
    } catch (err) {
      console.error('❌ อัปเดตผู้ขายล้มเหลว', err);      
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSupplier(id);      
      navigate('/pos/purchases/suppliers');
    } catch (err) {
      console.error('❌ ลบผู้ขายล้มเหลว', err);
      
    }
  };

  if (loading) return <p className="text-center py-10">กำลังโหลดข้อมูล...</p>;
  if (!defaultValues) return <p className="text-center text-red-500">ไม่พบข้อมูลผู้ขาย</p>;
  if (!selectedBranchId) return <p className="text-center text-gray-500">ยังไม่ได้เลือกสาขา</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">แก้ไข Supplier</h2>
        <div className="flex gap-2">

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
