import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';

import { feedback } from '@/design-system';
import SupplierForm from '../components/SupplierForm';
import useSupplierStore from '../store/supplierStore';
import {
  SUPPLIER_CREATE_DEFAULT_VALUES,
  createSupplierPaths,
  normalizeSupplierMutationPayload,
} from './supplierWorkspacePolicy';
import useSupplierFormRuntime from './useSupplierFormRuntime';

const SupplierCreateWorkspace = () => {
  const [loading, setLoading] = useState(false);
  const mutationRef = useRef(false);
  const createRequestRef = useRef(0);
  const createContextRef = useRef({ shopSlug: '', branchId: null });
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const { createSupplierAction } = useSupplierStore();
  const { banks, branchId, formSyncReady } = useSupplierFormRuntime();
  const paths = useMemo(() => createSupplierPaths(shopSlug), [shopSlug]);

  useEffect(() => {
    const previous = createContextRef.current;
    const changed = previous.shopSlug !== (shopSlug || '') || previous.branchId !== branchId;
    createContextRef.current = { shopSlug: shopSlug || '', branchId };
    if (changed && mutationRef.current) {
      createRequestRef.current += 1;
      mutationRef.current = false;
      setLoading(false);
    }
  }, [shopSlug, branchId]);

  const handleCreateSupplier = async (formData) => {
    if (loading || mutationRef.current) return;
    if (!branchId) {
      feedback.actionError(new Error('ยังไม่ได้เลือกสาขา'), 'ยังไม่ได้เลือกสาขา', 'supplier:create:branch-missing:error');
      return;
    }

    const payload = normalizeSupplierMutationPayload(formData);
    const shopSlugSnapshot = shopSlug || '';
    const branchIdSnapshot = branchId;
    const listPath = createSupplierPaths(shopSlugSnapshot).list;
    const requestId = createRequestRef.current + 1;
    createRequestRef.current = requestId;

    mutationRef.current = true;
    setLoading(true);
    try {
      await createSupplierAction(payload);
      feedback.actionSuccess(
        'เพิ่มผู้ขายเรียบร้อยแล้ว',
        `supplier:create:${branchIdSnapshot}:success`,
      );

      const currentContext = createContextRef.current;
      const stillOwnsContext =
        createRequestRef.current === requestId &&
        currentContext.shopSlug === shopSlugSnapshot &&
        currentContext.branchId === branchIdSnapshot;
      if (!stillOwnsContext) {
        feedback.warning(
          'เพิ่มผู้ขายสำเร็จแล้ว แต่บริบทสาขาหรือร้านเปลี่ยนระหว่างดำเนินการ จึงไม่เปลี่ยนหน้าอัตโนมัติ',
          `supplier:create:${branchIdSnapshot}:context-changed:error`,
        );
        return;
      }

      navigate(listPath);
    } catch (error) {
      const currentContext = createContextRef.current;
      const stillOwnsContext =
        createRequestRef.current === requestId &&
        currentContext.shopSlug === shopSlugSnapshot &&
        currentContext.branchId === branchIdSnapshot;
      if (stillOwnsContext) {
        feedback.actionError(
          error,
          'เพิ่มผู้ขายไม่สำเร็จ',
          `supplier:create:${branchIdSnapshot}:error`,
        );
      }
    } finally {
      const currentContext = createContextRef.current;
      const stillOwnsContext =
        createRequestRef.current === requestId &&
        currentContext.shopSlug === shopSlugSnapshot &&
        currentContext.branchId === branchIdSnapshot;
      if (stillOwnsContext) {
        mutationRef.current = false;
        setLoading(false);
      }
    }
  };

  const mutationBusy = loading || mutationRef.current;

  if (!branchId) {
    return (
      <div className="text-center py-12 text-slate-400 font-bold select-none border border-dashed rounded-xl bg-slate-50 animate-fadeIn text-xs md:text-sm">
        📭 กรุณาเลือกสาขาผู้ดำเนินงานในระบบก่อนเพิ่มข้อมูลครับ
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 space-y-3 animate-fadeIn text-xs md:text-sm">
      <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-900/5 rounded-lg text-slate-800"><Building2 className="w-4 h-4" /></div>
          <div>
            <h1 className="text-xs md:text-sm font-black text-slate-900">ลงทะเบียนคู่ค้า / เพิ่มผู้ขายใหม่</h1>
            <p className="text-[11px] text-slate-400 font-medium">บันทึกพิกัด ข้อมูลบัญชีธนาคาร และวงเงินอนุมัติทางการค้าเพื่อลดภาระความกังวล</p>
          </div>
        </div>
        <button type="button" disabled={mutationBusy} onClick={() => navigate(paths.list)} className="flex items-center gap-1 h-7 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-black transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
          <ArrowLeft className="w-3 h-3" /><span>กลับหน้าทะเบียน</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
        <SupplierForm
          onSubmit={handleCreateSupplier}
          defaultValues={{ ...SUPPLIER_CREATE_DEFAULT_VALUES }}
          loading={mutationBusy}
          isEdit={false}
          showCreditFields={true}
          banks={banks}
          branchId={branchId}
          formSyncReady={formSyncReady}
        />
      </div>
    </div>
  );
};

export default SupplierCreateWorkspace;
