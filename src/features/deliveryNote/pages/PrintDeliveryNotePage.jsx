import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useSalesStore from '@/features/sales/store/salesStore';
import DeliveryNoteForm from '../components/DeliveryNoteForm';


const PrintDeliveryNotePage = () => { // เปลี่ยนชื่อ Component ตรงนี้
  const { saleId } = useParams();
  const location = useLocation();

  const saleStore = useSalesStore();
  const { getSaleByIdAction, currentSale, setCurrentSale } = saleStore;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // เริ่มโหลด
      const saleFromState = location.state?.sale;

      if (saleFromState && String(saleFromState.id) === saleId) {
        // ถ้ามีข้อมูล sale ใน state และ ID ตรงกัน ให้ใช้ข้อมูลนั้นเลย
        setCurrentSale(saleFromState);
        console.log("Using sale data from navigation state:", saleFromState);
      } else {
        // ถ้าไม่มีข้อมูลใน state หรือ ID ไม่ตรงกัน ค่อยไปดึงจาก Backend
        console.log("Fetching sale data from backend for saleId:", saleId);
        await getSaleByIdAction(saleId); // รอให้ action ทำงานเสร็จ
      }
    };

    if (saleId) {
      fetchData();
    } else {
      setIsLoading(false); // ถ้าไม่มี saleId ก็ไม่ต้องโหลด
    }
  }, [saleId, location.state, getSaleByIdAction, setCurrentSale]);

  // คอยตรวจสอบ currentSale และ saleId เพื่อตั้งค่า isLoading
  useEffect(() => {
    if (currentSale && String(currentSale.id) === saleId) {
      setIsLoading(false); // เมื่อ currentSale มีข้อมูลและ ID ตรงกัน ให้หยุดโหลด
    }
  }, [currentSale, saleId]);


  // แสดงข้อความโหลดเมื่อ isLoading เป็น true เท่านั้น
  if (isLoading) {
    return <div className="p-4 text-center text-gray-600">กำลังโหลดข้อมูลใบส่งของ...</div>;
  }

  if (!currentSale || String(currentSale.id) !== String(saleId)) {
    return <div className="p-4 text-center text-red-600">ไม่พบข้อมูลใบส่งของ หรือข้อมูลไม่ถูกต้อง</div>;
  }

  // เตรียมข้อมูล saleItems ให้เหมือน PrintBillPageFullTax
  const preparedSaleItems = (currentSale.items || []).map((item) => ({
    id: item.id, // ใช้ ID ของ SaleItem
    productName: item.stockItem?.product?.name || 'ไม่พบชื่อสินค้า',
    price: item.basePrice ?? 0, // ใช้ basePrice จาก SaleItem
    quantity: 1, // สมมติว่าแต่ละ SaleItem คือ 1 ชิ้น
    unit: item.stockItem?.product?.template?.unit?.name || '-', // ต้องมีการ include product.template.unit ใน Backend
    discount: item.discount ?? 0, // ส่วนลดต่อชิ้น
    // สามารถเพิ่ม barcode หรือ serialNumber ได้ถ้าต้องการ
    barcode: item.stockItem?.barcode || '-',
    serialNumber: item.stockItem?.serialNumber || '-',
  }));

  // เตรียมข้อมูล config จาก branch ของ Sale
  const branch = currentSale.branch || {};
  const preparedConfig = {
    branchName: branch.name || '-',
    address: branch.address || '-',
    phone: branch.phone || '-',
    taxId: branch.taxId || '-', // สมมติว่า Branch มี taxId
    // สามารถเพิ่ม logoUrl หรือ footerNote ได้ถ้าต้องการ
  };

  return (
    <div className="p-4">
      {/* ✅ ซ่อนข้อความ "รายละเอียดใบส่งของ" โดยเพิ่ม Tailwind class "print:hidden" */}
      <h1 className="text-xl font-semibold mb-4 print:hidden">รายละเอียดใบส่งของ</h1>
      {/* ส่ง props ที่เตรียมไว้ให้ PrintDeliveryNoteForm */}
      <DeliveryNoteForm
        sale={currentSale}
        saleItems={preparedSaleItems}
        config={preparedConfig}
      />
    </div>
  );
};

export default PrintDeliveryNotePage; 

