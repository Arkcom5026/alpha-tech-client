import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Trash } from 'lucide-react';

import { feedback } from '@/design-system';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getSupplierById } from '../api/supplierApi';
import SupplierForm from '../components/SupplierForm';
import useSupplierStore from '../store/supplierStore';
import {
  createSupplierPaths,
  normalizeSupplierForForm,
  normalizeSupplierMutationPayload,
} from './supplierWorkspacePolicy';
import useSupplierFormRuntime from './useSupplierFormRuntime';

const SupplierEditWorkspace = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const { updateSupplierAction, deleteSupplierAction } = useSupplierStore();
  const { banks, branchId, formSyncReady } = useSupplierFormRuntime();
  const [defaultValues, setDefaultValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const paths = useMemo(() => createSupplierPaths(shopSlug), [shopSlug]);
  const mutationBusy = submitting || deleting;

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const data = await getSupplierById(id);
        setDefaultValues(normalizeSupplierForForm(data));
      } catch (err) {
        feedback.actionError(err, 'โหลดข้อมูลผู้ขายไม่สำเร็จ', 'supplier:edit:load:error');
      } finally {
        setLoading(false);
      }
    };
    if (id && branchId) fetchSupplier();
  }, [id, branchId]);

  const handleSubmit = async (formData) => {
    if (mutationBusy) return;
    try {
      if (!branchId) throw new Error('ยังไม่ได้เลือกสาขา');
      setSubmitting(true);
      await updateSupplierAction(id, normalizeSupplierMutationPayload(formData));
      feedback.actionSuccess('บันทึกการแก้ไขผู้ขายเรียบร้อยแล้ว', 'supplier:update:success');
      navigate(paths.list);
    } catch (err) {
      feedback.actionError(err, 'บันทึกการแก้ไขผู้ขายไม่สำเร็จ', 'supplier:update:error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (mutationBusy) return;
    try {
      setDeleting(true);
      await deleteSupplierAction(id);
      setOpen(false);
      feedback.actionSuccess('ลบผู้ขายเรียบร้อยแล้ว', 'supplier:delete:success');
      navigate(paths.list);
    } catch (err) {
      feedback.actionError(err, 'ลบผู้ขายไม่สำเร็จ', 'supplier:delete:error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center py-12 font-bold text-slate-400 italic tracking-wide">⏳ กำลังเรียกถอดรหัสฟื้นคืนระบบข้อมูลคู่ค้า...</div>;
  if (!defaultValues) return <p className="text-center text-rose-500 font-black py-10 select-none">❌ ไม่พบข้อมูลรายชื่อบริษัทคู่ค้าในระบบทะเบียนคลัง</p>;
  if (!branchId) return <p className="text-center text-slate-400 font-bold py-10 select-none">📭 ยังไม่ได้ทำการเลือกสาขาผู้ปฏิบัติงานในระบบ</p>;

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 space-y-3 animate-fadeIn text-xs md:text-sm">
      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2"><div className="p-1.5 bg-slate-900/5 rounded-lg text-slate-800"><Building2 className="w-4 h-4" /></div><div><h1 className="text-xs md:text-sm font-black text-slate-900">แก้ไขข้อมูลผู้ขาย / ปรับปรุงเงื่อนไขดิว</h1><p className="text-[11px] text-slate-400 font-medium">บันทึกความเปลี่ยนแปลงของพิกัด ข้อมูลธุรกรรม และวงเงินอนุมัติเครดิต</p></div></div>
        <div className="flex items-center gap-1.5">
          <TooltipProvider><Tooltip><TooltipTrigger asChild><Dialog open={open} onOpenChange={(nextOpen) => !mutationBusy && setOpen(nextOpen)}><DialogTrigger asChild><button type="button" disabled={mutationBusy} className="flex items-center gap-1 h-7 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 rounded-lg text-[11px] font-black transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"><Trash className="w-3 h-3" /><span>ลบผู้ขาย</span></button></DialogTrigger><DialogContent className="sm:max-w-[425px]"><DialogHeader><p className="text-sm font-black text-slate-900">ยืนยันสัญญาณถอนถอนข้อมูลคู่ค้าออกจากคลัง</p><p className="text-xs text-slate-400 font-medium pt-1 leading-relaxed">คุณแน่ใจหรือไม่ว่าต้องการลบผู้ขายรายนี้? ระบบจะทำการล้างข้อมูลบัญชีคู่ค้าออกจากฐานข้อมูลส่วนกลางถาวรและไม่สามารถย้อนกลับลูปข้อมูลได้</p></DialogHeader><DialogFooter className="mt-4 gap-2 sm:gap-0"><Button variant="outline" size="sm" disabled={deleting} onClick={() => setOpen(false)} className="text-xs font-bold h-7 rounded-lg">ยกเลิกขั้นตอน</Button><Button variant="destructive" size="sm" disabled={deleting} onClick={handleDelete} className="text-xs font-black bg-rose-600 hover:bg-rose-700 h-7 rounded-lg">{deleting ? 'กำลังลบ...' : 'ยืนยันลบถาวร'}</Button></DialogFooter></DialogContent></Dialog></TooltipTrigger><TooltipContent side="bottom" className="text-[10px] font-black bg-slate-900 text-white border-none rounded p-1.5 shadow-md">⚠️ การล้างบัญชีรายชื่อผู้ขายจะไม่สามารถย้อนกลับลูปข้อมูลได้</TooltipContent></Tooltip></TooltipProvider>
          <button type="button" disabled={mutationBusy} onClick={() => navigate(paths.view(id))} className="flex items-center gap-1 h-7 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-black transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"><ArrowLeft className="w-3 h-3" /><span>ยกเลิก</span></button>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
        <SupplierForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          loading={submitting}
          isEdit={true}
          showCreditFields={true}
          banks={banks}
          branchId={branchId}
          formSyncReady={formSyncReady}
        />
      </div>
    </div>
  );
};

export default SupplierEditWorkspace;
