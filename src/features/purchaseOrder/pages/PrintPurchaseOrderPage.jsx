import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getPurchaseOrderById } from '../api/purchaseOrderApi';
import useEmployeeStore from '@/features/employee/store/employeeStore';

const PrintPurchaseOrderPage = () => {
  const { id } = useParams();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const branch = useEmployeeStore((state) => state.branch);
  const printRef = useRef();

  useEffect(() => {
    const fetchPO = async () => {
      try {
        const data = await getPurchaseOrderById(id);
        setPo(data);
      } catch (err) {
        console.error('❌ โหลดข้อมูลใบสั่งซื้อไม่สำเร็จ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPO();
  }, [id]);

  const handleDownloadPDF = () => {
    if (!printRef.current || !window.html2pdf) return;

    const opt = {
      margin: 0.5,
      filename: `purchase-order-${po.code}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    window.html2pdf().set(opt).from(printRef.current).save();
  };

  if (loading) return <p className="p-4">กำลังโหลด...</p>;
  if (!po) return <p className="p-4 text-red-500">ไม่พบใบสั่งซื้อ</p>;

  const total = po.items?.reduce((sum, item) => sum + item.quantity * item.costPrice, 0) || 0;

  return (
    <div>
      <div className="flex justify-end gap-2 p-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
        >
          พิมพ์ใบสั่งซื้อ
        </button>
        <button
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
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>วันที่พิมพ์: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">ใบสั่งซื้อ (Purchase Order)</h1>
          <p className="text-muted-foreground">เลขที่: {po.code}</p>
          <p className="text-muted-foreground">วันที่: {new Date(po.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold">ผู้ขาย (Supplier)</h2>
          <p>{po.supplier?.name || '-'}</p>
          <p className="text-muted-foreground">(ข้อมูลที่อยู่ / เบอร์ติดต่อ เพิ่มเติม)</p>
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
            {po.items.map((item, idx) => (
              <tr key={idx} className="border">
                <td className="border p-2 text-center">{idx + 1}</td>
                <td className="border p-2">{item.product?.name || '-'}</td>
                <td className="border p-2 text-center">{item.quantity}</td>
                <td className="border p-2 text-right">{item.costPrice.toLocaleString()} ฿</td>
                <td className="border p-2 text-right">{(item.quantity * item.costPrice).toLocaleString()} ฿</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td colSpan={4} className="text-right border p-2">รวมทั้งสิ้น</td>
              <td className="border p-2 text-right">{total.toLocaleString()} ฿</td>
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
