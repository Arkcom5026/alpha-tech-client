// PrintPurchaseOrderPage.jsx
// ✅ Branch Source of Truth:
// - authStore.employee.branchId = branchId ของผู้ login
// - branchStore = รายละเอียดสาขาสำหรับแสดงบนเอกสาร
// - ไม่อ่าน branch จาก employeeStore อีกต่อไป

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getPurchaseOrderById } from '../api/purchaseOrderApi';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { useAuthStore } from '@/features/auth/store/authStore';

const formatMoney = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.00';
  return n.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const PrintPurchaseOrderPage = () => {
  const { id } = useParams();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);

  const printRef = useRef();

  const authBranchId = useAuthStore((state) => state.employee?.branchId);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const branchDetail = useBranchStore((state) => state.branch || state.currentBranch || state.activeBranch || null);
  const loadAndSetBranchById = useBranchStore((state) => state.loadAndSetBranchById);

  const branchId = useMemo(() => {
    const raw =
      selectedBranchId ??
      branchDetail?.id ??
      branchDetail?.branchId ??
      authBranchId ??
      null;

    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [selectedBranchId, branchDetail?.id, branchDetail?.branchId, authBranchId]);

  const branch = useMemo(() => {
    return branchDetail || {};
  }, [branchDetail]);

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

  if (loading) return <p className="p-4">กำลังโหลด...</p>;
  if (!po) return <p className="p-4 text-red-500">ไม่พบใบสั่งซื้อ</p>;

  const items = Array.isArray(po.items) ? po.items : [];
  const total = items.reduce((sum, item) => {
    const qty = Number(item?.quantity ?? 0);
    const cost = Number(item?.costPrice ?? 0);
    return sum + qty * cost;
  }, 0);

  return (
    <div>
      <div className="flex justify-end gap-2 p-4 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
        >
          พิมพ์ใบสั่งซื้อ
        </button>

        <button
          type="button"
          onClick={handleDownloadPDF}
          className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
        >
          ดาวน์โหลด PDF
        </button>
      </div>

      <div
        ref={printRef}
        className="print-area p-8 print:p-0 text-sm font-sans print:bg-white bg-white max-w-[800px] mx-auto"
      >
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }

            .print-area, .print-area * {
              visibility: visible;
            }

            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold">{branch?.name || 'ชื่อบริษัท'}</h1>
            <p className="text-xs text-muted-foreground">
              {branch?.address || 'ที่อยู่บริษัท'} | โทร: {branch?.phone || '-'} | อีเมล: {branch?.email || '-'}
            </p>
            {branch?.taxId ? (
              <p className="text-xs text-muted-foreground">
                เลขประจำตัวผู้เสียภาษี: {branch.taxId}
              </p>
            ) : null}
          </div>

          <div className="text-right text-xs text-muted-foreground">
            <p>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</p>
            {branchId ? <p>Branch ID: {branchId}</p> : null}
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">ใบสั่งซื้อ (Purchase Order)</h1>
          <p className="text-muted-foreground">เลขที่: {po.code || '-'}</p>
          <p className="text-muted-foreground">
            วันที่: {po.createdAt ? new Date(po.createdAt).toLocaleDateString('th-TH') : '-'}
          </p>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold">ผู้ขาย (Supplier)</h2>
          <p>{po.supplier?.name || '-'}</p>
          <p className="text-muted-foreground">
            {po.supplier?.address || '(ข้อมูลที่อยู่ / เบอร์ติดต่อ เพิ่มเติม)'}
          </p>
          {po.supplier?.phone ? (
            <p className="text-muted-foreground">โทร: {po.supplier.phone}</p>
          ) : null}
        </div>

        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100 border">
              <th className="border p-2">#</th>
              <th className="border p-2 text-left">ชื่อสินค้า</th>
              <th className="border p-2">จำนวน</th>
              <th className="border p-2">ราคาต่อหน่วย</th>
              <th className="border p-2">รวม</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="border p-4 text-center text-muted-foreground">
                  ไม่มีรายการสินค้า
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const qty = Number(item?.quantity ?? 0);
                const cost = Number(item?.costPrice ?? 0);
                const lineTotal = qty * cost;

                return (
                  <tr key={item?.id ?? idx} className="border">
                    <td className="border p-2 text-center">{idx + 1}</td>
                    <td className="border p-2">{item.product?.name || item.productName || '-'}</td>
                    <td className="border p-2 text-center">{qty.toLocaleString('th-TH')}</td>
                    <td className="border p-2 text-right">{formatMoney(cost)} ฿</td>
                    <td className="border p-2 text-right">{formatMoney(lineTotal)} ฿</td>
                  </tr>
                );
              })
            )}

            <tr className="font-semibold">
              <td colSpan={4} className="text-right border p-2">
                รวมทั้งสิ้น
              </td>
              <td className="border p-2 text-right">{formatMoney(total)} ฿</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-6">
          <h3 className="font-semibold mb-1">หมายเหตุ</h3>
          <p className="text-muted-foreground whitespace-pre-line">{po.note || '-'}</p>
        </div>

        <div className="mt-[100px] flex justify-between signature-space">
          <div>
            <p>......................................</p>
            <p className="text-sm">ผู้สั่งซื้อ</p>
          </div>

          <div>
            <p>......................................</p>
            <p className="text-sm">ผู้ขาย (ลงชื่อรับทราบ)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPurchaseOrderPage;
