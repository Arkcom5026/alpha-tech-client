// PrintPurchaseOrderPage.jsx
// ✅ Branch Source of Truth:
// - authStore.employee.branchId = branchId ของผู้ login
// - branchStore = รายละเอียดสาขาสำหรับแสดงบนเอกสาร
// - ไม่อ่าน branch จาก employeeStore อีกต่อไป

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getPurchaseOrderById } from '../../api/purchaseOrderApi';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  preparePurchaseOrderPrintProjection,
  resolvePurchaseOrderBranchId,
} from '../workspace/policies/purchaseOrderPrintPolicy';
import PurchaseOrderPrintState from '../workspace/components/PurchaseOrderPrintState';
import PurchaseOrderPrintToolbar from '../workspace/components/PurchaseOrderPrintToolbar';
import PurchaseOrderPrintShell from '../workspace/components/PurchaseOrderPrintShell';

const PrintPurchaseOrderPage = () => {
  const { id } = useParams();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);

  const printRef = useRef();

  const authBranchId = useAuthStore((state) => state.employee?.branchId);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const branchDetail = useBranchStore((state) => state.branch || state.currentBranch || state.activeBranch || null);
  const loadAndSetBranchById = useBranchStore((state) => state.loadAndSetBranchById);

  const branchId = useMemo(() => resolvePurchaseOrderBranchId({
    selectedBranchId,
    branchDetail,
    authBranchId,
  }), [selectedBranchId, branchDetail, authBranchId]);

  const branch = useMemo(() => branchDetail || {}, [branchDetail]);

  useEffect(() => {
    if (!branchId) return;
    if (branchDetail?.id && Number(branchDetail.id) === Number(branchId)) return;
    if (typeof loadAndSetBranchById !== 'function') return;

    Promise.resolve(loadAndSetBranchById(Number(branchId))).catch((err) => {
      console.error('❌ โหลดข้อมูลสาขาไม่สำเร็จ:', err);
    });
  }, [branchId, branchDetail?.id, loadAndSetBranchById]);

  useEffect(() => {
    let alive = true;

    const fetchPO = async () => {
      try {
        setLoading(true);
        const data = await getPurchaseOrderById(id);
        if (alive) setPo(data);
      } catch (err) {
        console.error('❌ โหลดข้อมูลใบสั่งซื้อไม่สำเร็จ:', err);
        if (alive) setPo(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    if (id) fetchPO();

    return () => {
      alive = false;
    };
  }, [id]);

  const handleDownloadPDF = () => {
    if (!printRef.current || !window.html2pdf || !po) return;

    const opt = {
      margin: 0.5,
      filename: `purchase-order-${po.code || po.id || id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    window.html2pdf().set(opt).from(printRef.current).save();
  };

  if (loading) return <PurchaseOrderPrintState status="loading" />;
  if (!po) return <PurchaseOrderPrintState status="missing" />;

  const { lines, total } = preparePurchaseOrderPrintProjection(po);

  return (
    <div>
      <PurchaseOrderPrintToolbar
        onPrint={() => window.print()}
        onDownloadPdf={handleDownloadPDF}
      />
      <PurchaseOrderPrintShell
        printRef={printRef}
        branch={branch}
        branchId={branchId}
        po={po}
        lines={lines}
        total={total}
      />
    </div>
  );
};

export default PrintPurchaseOrderPage;
