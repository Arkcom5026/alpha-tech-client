import React from 'react';
import { FaPrint, FaDownload } from 'react-icons/fa';

const PrintPurchaseOrder = ({ order = {} }) => {
  // กำหนดโครงสร้างข้อมูลเริ่มต้นที่ปลอดภัย
  const orderData = {
    orderNumber: order.orderNumber || 'PO-XXXX',
    supplier: {
      name: order.supplier?.name || order.supplierId || 'ไม่มีข้อมูลผู้ขาย',
      address: order.supplier?.address || '',
      phone: order.supplier?.phone || '',
      taxId: order.supplier?.taxId || ''
    },
    orderDate: order.orderDate || new Date(),
    dueDate: order.dueDate || new Date(),
    paymentTerms: order.paymentTerms || '30',
    taxRate: order.taxRate || 7,
    discount: order.discount || 0,
    notes: order.notes || '',
    items: order.items?.map(item => ({
      productId: item.productId || '',
      productCode: item.productId || '', // ใช้ productId แทนหากไม่มี productCode
      productName: item.productName || 'ไม่มีชื่อสินค้า',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      discount: item.discount || 0,
      unit: item.unit || 'ชิ้น'
    })) || [],
    subtotal: order.subtotal || 0,
    taxAmount: order.taxAmount || 0,
    totalAmount: order.totalAmount || 0,
    deliveryDate: order.dueDate || new Date() // ใช้ dueDate แทน deliveryDate หากไม่มี
  };

  // ฟังก์ชันการพิมพ์
  const PrintPurchaseOrder = () => {
    window.print();
  };

  // จัดรูปแบบวันที่
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // จัดรูปแบบตัวเลข
  const formatNumber = (num) => {
    return num?.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0.00';
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:p-0">
      {/* ส่วนควบคุม - จะไม่แสดงเมื่อพิมพ์ */}
      <div className="no-print flex justify-end gap-4 mb-6">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <FaPrint className="mr-2" />
          พิมพ์เอกสาร
        </button>
      </div>

      {/* ส่วนเนื้อหาที่จะพิมพ์ */}
      <div className="print-content">
        {/* ส่วนหัวเอกสาร */}
        <header className="text-center mb-8 border-b pb-6">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <h2 className="text-xl font-bold">บริษัทของคุณ จำกัด</h2>
              <p>123 ถนนตัวอย่าง</p>
              <p>แขวงทดสอบ เขตตัวอย่าง กรุงเทพฯ 10100</p>
              <p>โทร: 02-123-4567 | ภาษี: 0123456789012</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-red-600">ใบสั่งซื้อ</h1>
              <p>เลขที่: <span className="font-bold">{orderData.orderNumber}</span></p>
              <p>วันที่: {formatDate(orderData.orderDate)}</p>
            </div>
          </div>
        </header>

        {/* ข้อมูลผู้ขาย */}
        <section className="mb-8">
          <h3 className="font-bold bg-gray-100 p-2">ผู้ขาย</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div>
              <p className="font-bold">{orderData.supplier.name}</p>
              <p>{orderData.supplier.address}</p>
            </div>
            <div>
              <p>โทร: {orderData.supplier.phone}</p>
            </div>
            <div>
              <p>เลขภาษี: {orderData.supplier.taxId}</p>
              <p>เงื่อนไข: {orderData.paymentTerms} วัน</p>
            </div>
          </div>
        </section>

           {/* รายการสินค้า */}
           <section className="mb-8">
          <h3 className="font-bold bg-gray-100 p-2">รายการสินค้า</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2">ลำดับ</th>
                <th className="border p-2">รหัสสินค้า</th>
                <th className="border p-2">รายละเอียด</th>
                <th className="border p-2">จำนวน</th>
                <th className="border p-2">หน่วย</th>
                <th className="border p-2">ราคา/หน่วย</th>
                <th className="border p-2">ส่วนลด</th>
                <th className="border p-2">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {orderData.items?.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{item.productCode || '-'}</td>
                  <td className="border p-2">{item.productName || '-'}</td>

                  <td className="border p-2 text-right">{item.quantity?.toLocaleString() || '0'}</td>                  

                  <td className="border p-2 text-center">{item.unit || '-'}</td>
                  <td className="border p-2 text-right">{formatNumber(item.unitPrice)}</td>
                  <td className="border p-2 text-right">{item.discount || 0}%</td>
                  <td className="border p-2 text-right"> {formatNumber((item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100))}</td>                                    
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* สรุปยอด */}
        <section className="flex justify-end mb-8">
          <div className="w-full md:w-1/2 lg:w-1/3 border-t-2 border-b-2 border-gray-300 p-4">
            <div className="flex justify-between">
              <span>รวมเป็นเงิน:</span>
              <span>{formatNumber(orderData.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>ภาษีมูลค่าเพิ่ม {orderData.taxRate || 0}%:</span>
              <span>{formatNumber(orderData.taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>ส่วนลดรวม:</span>
              <span>-{formatNumber(orderData.discount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>รวมทั้งสิ้น:</span>
              <span>{formatNumber(orderData.totalAmount)}</span>
            </div>
          </div>
        </section>

        {/* หมายเหตุและการอนุมัติ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold bg-gray-100 p-2">หมายเหตุ</h3>
            <div className="p-4 border border-gray-200 min-h-32">
              {orderData.notes || "ไม่มีหมายเหตุ"}
            </div>
          </div>
          <div>
            <h3 className="font-bold bg-gray-100 p-2">การอนุมัติ</h3>
            <div className="p-4 border border-gray-200 min-h-32 flex flex-col justify-between">
              <div>
                <p>วันที่ต้องการรับสินค้า: {formatDate(orderData.deliveryDate)}</p>
              </div>
              <div className="text-center">
                <p className="border-t-2 pt-4 inline-block">ลงชื่อ _______________________</p>
                <p>ผู้มีอำนาจอนุมัติ</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* CSS สำหรับการพิมพ์ */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintPurchaseOrder;