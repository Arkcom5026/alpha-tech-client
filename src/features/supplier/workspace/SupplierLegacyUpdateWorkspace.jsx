import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { feedback } from '@/design-system';
import { getSupplierById, updateSupplier } from '../api/supplierApi';
import SupplierForm from '../components/SupplierForm';
import {
  createSupplierPaths,
  normalizeSupplierForForm,
  sanitizeLegacySupplierUpdatePayload,
} from './supplierWorkspacePolicy';
import useSupplierFormRuntime from './useSupplierFormRuntime';

const SupplierLegacyUpdateWorkspace = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const { banks, branchId, formSyncReady } = useSupplierFormRuntime();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const mutationRef = useRef(false);
  const supplierContextRef = useRef({ id, shopSlug, branchId });
  const loadRequestRef = useRef(0);
  const updateRequestRef = useRef(0);
  const paths = useMemo(() => createSupplierPaths(shopSlug), [shopSlug]);
  const mutationBusy = loading || mutationRef.current;

  useEffect(() => {
    supplierContextRef.current = { id, shopSlug, branchId };
    loadRequestRef.current += 1;
    updateRequestRef.current += 1;
    mutationRef.current = false;
    setLoading(false);
    setSupplier(null);
  }, [id, shopSlug, branchId]);

  useEffect(() => {
    const fetchSupplier = async () => {
      const supplierIdSnapshot = id;
      const branchIdSnapshot = branchId;
      const requestId = ++loadRequestRef.current;
      try {
        setFetching(true);
        const data = await getSupplierById(supplierIdSnapshot);
        const current = supplierContextRef.current;
        if (
          requestId !== loadRequestRef.current
          || current.id !== supplierIdSnapshot
          || current.branchId !== branchIdSnapshot
        ) return;
        setSupplier(normalizeSupplierForForm(data));
      } catch (error) {
        const current = supplierContextRef.current;
        if (
          requestId !== loadRequestRef.current
          || current.id !== supplierIdSnapshot
          || current.branchId !== branchIdSnapshot
        ) return;
        feedback.actionError(
          error,
          'โหลดข้อมูลผู้ขายไม่สำเร็จ',
          `supplier:legacy:${supplierIdSnapshot}:load:error`,
        );
      } finally {
        const current = supplierContextRef.current;
        if (
          requestId === loadRequestRef.current
          && current.id === supplierIdSnapshot
          && current.branchId === branchIdSnapshot
        ) {
          setFetching(false);
        }
      }
    };
    if (id && branchId) fetchSupplier();
  }, [id, branchId]);

  const handleUpdate = async (formData) => {
    if (mutationBusy) return;
    if (!branchId) {
      feedback.actionError(new Error('ยังไม่ได้เลือกสาขา'), 'ยังไม่ได้เลือกสาขา', 'supplier:legacy:update:error');
      return;
    }

    const supplierIdSnapshot = id;
    const shopSlugSnapshot = shopSlug;
    const branchIdSnapshot = branchId;
    const payloadSnapshot = sanitizeLegacySupplierUpdatePayload(formData);
    const listPathSnapshot = createSupplierPaths(shopSlugSnapshot).list;
    const requestId = ++updateRequestRef.current;

    mutationRef.current = true;
    setLoading(true);
    try {
      await updateSupplier(supplierIdSnapshot, payloadSnapshot);
      const current = supplierContextRef.current;
      const stillOwnsContext = (
        requestId === updateRequestRef.current
        && current.id === supplierIdSnapshot
        && current.shopSlug === shopSlugSnapshot
        && current.branchId === branchIdSnapshot
      );
      if (!stillOwnsContext) {
        feedback.warning(
          'บันทึกการแก้ไขผู้ขายสำเร็จแล้ว แต่บริบทหน้าจอเปลี่ยนไป จึงไม่เปลี่ยนหน้าอัตโนมัติ',
          `supplier:legacy:${supplierIdSnapshot}:update:context-changed:error`,
        );
        return;
      }
      feedback.actionSuccess(
        'บันทึกการแก้ไขผู้ขายเรียบร้อยแล้ว',
        `supplier:legacy:${supplierIdSnapshot}:update:success`,
      );
      navigate(listPathSnapshot);
    } catch (error) {
      const current = supplierContextRef.current;
      if (
        requestId !== updateRequestRef.current
        || current.id !== supplierIdSnapshot
        || current.shopSlug !== shopSlugSnapshot
        || current.branchId !== branchIdSnapshot
      ) return;
      feedback.actionError(
        error,
        'บันทึกการแก้ไขผู้ขายไม่สำเร็จ',
        `supplier:legacy:${supplierIdSnapshot}:update:error`,
      );
    } finally {
      const current = supplierContextRef.current;
      if (
        requestId === updateRequestRef.current
        && current.id === supplierIdSnapshot
        && current.shopSlug === shopSlugSnapshot
        && current.branchId === branchIdSnapshot
      ) {
        mutationRef.current = false;
        setLoading(false);
      }
    }
  };

  if (!branchId) {
    return <p className="text-center text-slate-400 font-bold py-10">📭 กรุณาเลือกสาขาผู้ดำเนินงานในระบบก่อนครับ</p>;
  }
  if (!supplier) {
    return <div className="text-center py-12 font-bold text-slate-400 italic">{fetching ? '⏳ กำลังเรียกเปิดหน้าข้อมูลแก้ไข...' : '❌ ไม่พบข้อมูลผู้ขาย'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 space-y-3 animate-fadeIn text-xs md:text-sm">
      <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm select-none">
        <div><h1 className="text-sm font-black text-slate-900">แก้ไขข้อมูลผู้ขายประจำคลัง</h1><p className="text-[11px] text-slate-400 font-medium">ปรับปรุงโครงสร้างบัญชี ข้อมูลการสื่อสาร และรายละเอียดเครดิตเทอม</p></div>
        <button type="button" disabled={mutationBusy} onClick={() => navigate(paths.list)} className="flex items-center gap-1 h-7 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-black transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"><ArrowLeft className="w-3 h-3" /><span>กลับหน้าทะเบียน</span></button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
        <SupplierForm
          onSubmit={handleUpdate}
          defaultValues={supplier}
          loading={mutationBusy}
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

export default SupplierLegacyUpdateWorkspace;
