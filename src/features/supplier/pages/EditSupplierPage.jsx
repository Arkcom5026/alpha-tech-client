// src/features/supplier/pages/EditSupplierPage.jsx
// 🏛️ Premium Next-Gen Influx Terminal: (Separation of Concerns & Intent UI Edition)

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSupplierById } from '../api/supplierApi';
import useSupplierStore from '../store/supplierStore';
import { Button } from '@/components/ui/button';
import SupplierForm from '../components/SupplierForm';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Trash, ArrowLeft, Building2 } from 'lucide-react';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useBranchStore } from '@/features/branch/store/branchStore';

const EditSupplierPage = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const { updateSupplierAction, deleteSupplierAction } = useSupplierStore();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const [defaultValues, setDefaultValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const targetSlug = shopSlug || 'advancetech';

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplierById(id);

        // ✅ แปลง bankId ให้เป็น string เพื่อให้ default dropdown ทำงานถูกต้อง
        if (data.bankId !== null && typeof data.bankId !== 'string') {
          data.bankId = data.bankId.toString();
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
      navigate(`/${targetSlug}/pos/purchases/suppliers`);
    } catch (err) {
      console.error('❌ อัปเดตผู้ขายล้มเหลว', err);      
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSupplierAction(id);      
      navigate(`/${targetSlug}/pos/purchases/suppliers`);
    } catch (err) {
      console.error('❌ ลบผู้ขายล้มเหลว', err);
    }
  };

  if (loading) return <div className="text-center py-12 font-bold text-slate-400 italic tracking-wide">⏳ กำลังเรียกถอดรหัสฟื้นคืนระบบข้อมูลคู่ค้า...</div>;
  if (!defaultValues) return <p className="text-center text-rose-500 font-black py-10 select-none">❌ ไม่พบข้อมูลรายชื่อบริษัทคู่ค้าในระบบทะเบียนคลัง</p>;
  if (!selectedBranchId) return <p className="text-center text-slate-400 font-bold py-10 select-none">📭 ยังไม่ได้ทำการเลือกสาขาผู้ปฏิบัติงานในระบบ</p>;

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 space-y-3 animate-fadeIn text-xs md:text-sm">
      
      {/* 🟦 คอนโซลบาร์ส่วนหัวควบคุมกะทัดรัด (Compact Design Module Header) */}
      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-900/5 rounded-lg text-slate-800">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black text-slate-900">แก้ไขข้อมูลผู้ขาย / ปรับปรุงเงื่อนไขดิว</h1>
            <p className="text-[11px] text-slate-400 font-medium">บันทึกความเปลี่ยนแปลงของพิกัด ข้อมูลธุรกรรม และวงเงินอนุมัติเครดิต</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* ปุ่มลบผู้ขายสไตล์เนียนตา ไม่ตะโกนรบกวน visual load */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className="flex items-center gap-1 h-7 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 rounded-lg text-[11px] font-black transition-all shadow-sm">
                      <Trash className="w-3 h-3" /> 
                      <span>ลบผู้ขาย</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <p className="text-sm font-black text-slate-900">ยืนยันสัญญาณถอนถอนข้อมูลคู่ค้าออกจากคลัง</p>
                      <p className="text-xs text-slate-400 font-medium pt-1 leading-relaxed">คุณแน่ใจหรือไม่ว่าต้องการลบผู้ขายรายนี้? ระบบจะทำการล้างข้อมูลบัญชีคู่ค้าออกจากฐานข้อมูลส่วนกลางถาวรและไม่สามารถย้อนกลับลูปข้อมูลได้</p>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                      <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="text-xs font-bold h-7 rounded-lg">ยกเลิกขั้นตอน</Button>
                      <Button variant="destructive" size="sm" onClick={handleDelete} className="text-xs font-black bg-rose-600 hover:bg-rose-700 h-7 rounded-lg">ยืนยันลบถาวร</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-black bg-slate-900 text-white border-none rounded p-1.5 shadow-md">
                ⚠️ การล้างบัญชีรายชื่อผู้ขายจะไม่สามารถย้อนกลับลูปข้อมูลได้
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <button
            type="button"
            onClick={() => navigate(`/${targetSlug}/pos/purchases/suppliers/view/${id}`)}
            className="flex items-center gap-1 h-7 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-black transition-all shadow-sm"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>ยกเลิก</span>
          </button>
        </div>
      </div>

      {/* 🟦 ตัวฟอร์มประวัติผู้ขาย ได้รับการอัปเกรดเรียงหมวดหมู่สวยงามเชื่อมตรงลูปข้อมูล */}
      <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
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