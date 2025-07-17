import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // สมมติว่าใช้ react-router-dom
import { useCombinedBillingStore } from '../store/combinedBillingStore';

/**
 * CombinedDocumentDetailPage
 * หน้าสำหรับแสดงรายละเอียดของเอกสารรวมบิล (CombinedSaleDocument) ที่สร้างขึ้น
 * และเป็นหน้าที่ใช้สำหรับสั่งพิมพ์
 */
const CombinedDocumentDetailPage = () => {
    const { id } = useParams(); // ดึง ID ของเอกสารจาก URL

    // ดึง State และ Actions จาก Store
    const {
        documentDetail,
        isLoadingDetail,
        errorDetail,
        fetchDocumentById,
    } = useCombinedBillingStore();

    // Effect สำหรับดึงข้อมูลเอกสารเมื่อ component โหลดขึ้นมา
    useEffect(() => {
        if (id) {
            fetchDocumentById(id);
        }
    }, [id, fetchDocumentById]);

    // ฟังก์ชันสำหรับจัดการการพิมพ์ (ในระบบจริงจะเรียกใช้ window.print())
    const handlePrint = () => {
        // ตามกฎ: ห้ามใช้ alert()
        console.log('Printing document...');
        window.print(); // คำสั่งพิมพ์มาตรฐานของเบราว์เซอร์
    };

    // แสดงสถานะขณะโหลดข้อมูล
    if (isLoadingDetail) {
        return <div className="p-8 text-center">กำลังโหลดข้อมูลเอกสาร...</div>;
    }

    // แสดงข้อความเมื่อเกิดข้อผิดพลาด
    if (errorDetail) {
        return <div className="p-8 text-center text-red-500">เกิดข้อผิดพลาด: {errorDetail.message}</div>;
    }

    // แสดงข้อความเมื่อไม่พบข้อมูล
    if (!documentDetail) {
        return <div className="p-8 text-center">ไม่พบข้อมูลเอกสาร</div>;
    }

    // ดึงข้อมูลลูกค้าจาก Sale แรก (เพราะทุก Sale ในเอกสารเดียวกันมาจากลูกค้ารายเดียว)
    const customer = documentDetail.sales?.[0]?.customer;

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
            {/* ส่วนของปุ่มควบคุม จะไม่ถูกพิมพ์ออกมาด้วย @media print */}
            <div className="max-w-4xl mx-auto mb-6 print:hidden">
                <div className="flex justify-between items-center">
                    <Link to="/billing/combine" className="text-indigo-600 hover:text-indigo-800">
                        &larr; กลับไปหน้ารวมบิล
                    </Link>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        พิมพ์เอกสาร
                    </button>
                </div>
            </div>

            {/* ส่วนของเอกสารที่จะพิมพ์ */}
            {/* ใช้ font-sarabun ตามกฎสำหรับการพิมพ์ */}
            <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg font-sarabun">
                <header className="flex justify-between items-start pb-6 border-b">
                    <div>
                        <h1 className="text-3xl font-bold">ใบแจ้งหนี้ / INVOICE</h1>
                        <p className="text-gray-600">สำหรับเอกสารรวมบิลเลขที่: {documentDetail.code}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg">บริษัท ตัวอย่าง จำกัด</p>
                        <p className="text-sm">123 ถนนตัวอย่าง แขวงตัวอย่าง</p>
                        <p className="text-sm">เขตตัวอย่าง กรุงเทพฯ 10110</p>
                        <p className="text-sm">เลขประจำตัวผู้เสียภาษี: 0123456789012</p>
                    </div>
                </header>

                <section className="flex justify-between mt-6">
                    <div>
                        <p className="font-bold text-gray-700">ลูกค้า:</p>
                        <p>{customer?.name || 'N/A'}</p>
                        <p className="text-sm">{customer?.address || ''}</p>
                        <p className="text-sm">เลขประจำตัวผู้เสียภาษี: {customer?.taxId || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-bold">เลขที่เอกสาร:</span> {documentDetail.code}</p>
                        <p><span className="font-bold">วันที่:</span> {new Date(documentDetail.issueDate).toLocaleDateString('th-TH')}</p>
                    </div>
                </section>

                <section className="mt-8">
                    <h2 className="text-lg font-bold mb-2">สรุปรายการใบส่งของที่รวมในเอกสารนี้</h2>
                    <table className="w-full text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-sm font-semibold">เลขที่ใบส่งของ</th>
                                <th className="p-2 text-sm font-semibold">วันที่ส่ง</th>
                                <th className="p-2 text-sm font-semibold">เลขที่อ้างอิง (PO)</th>
                                <th className="p-2 text-sm font-semibold text-right">ยอดรวม (บาท)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documentDetail.sales.map(sale => (
                                <tr key={sale.id} className="border-b">
                                    <td className="p-2">{sale.code}</td>
                                    <td className="p-2">{new Date(sale.soldAt).toLocaleDateString('th-TH')}</td>
                                    <td className="p-2">{sale.officialDocumentNumber || '-'}</td>
                                    <td className="p-2 text-right font-mono">{sale.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <footer className="mt-8 pt-6 border-t flex justify-end">
                    <div className="w-1/3">
                        <div className="flex justify-between">
                            <span className="font-bold">ยอดรวมทั้งสิ้น</span>
                            <span className="font-bold font-mono">{documentDetail.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        {/* สามารถเพิ่มรายละเอียดภาษีและอื่นๆ ได้ที่นี่ */}
                    </div>
                </footer>

                 <div className="mt-16 text-center text-sm text-gray-500">
                    <p>ผู้จัดทำ: {documentDetail.createdByUser?.name || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default CombinedDocumentDetailPage;
