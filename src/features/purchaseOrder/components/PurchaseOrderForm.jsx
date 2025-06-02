import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import POSupplierSelector from './PurchaseOrderSupplierSelector';
import PurchaseOrderProductTable from './PurchaseOrderProductTable';
import usePurchaseOrderStore from '../store/purchaseOrderStore';
import useEmployeeStore from '@/store/employeeStore';
import { useParams, useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const PurchaseOrderForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');
  const [products, setProducts] = useState([]);

  const branchId = useEmployeeStore((state) => state.branch?.id);
  const {
    purchaseOrder,
    loading,
    fetchPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
  } = usePurchaseOrderStore();

  useEffect(() => {
    if (mode === 'edit' && id) {
      const load = async () => {
        await fetchPurchaseOrderById(id);
      };
      load();
    }
  }, [mode, id, fetchPurchaseOrderById]);

  useEffect(() => {
    if (mode === 'edit' && purchaseOrder) {
      setSupplier(purchaseOrder.supplier);
      setOrderDate(purchaseOrder.date?.substring(0, 10));
      setNote(purchaseOrder.note || '');
      const enriched = purchaseOrder.items.map((item) => ({
        id: item.productId,
        title: item.product?.title || '',
        quantity: item.quantity,
        price: item.price,
      }));
      setProducts(enriched);
    }
  }, [mode, purchaseOrder]);

  const handleSubmit = async () => {
    if (!supplier || products.length === 0) {
      console.warn('⚠️ กรุณาเลือก Supplier และเพิ่มสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    const payload = {
      supplierId: supplier.id,
      orderDate,
      note,
      items: products.map(p => ({
        productId: p.id,
        quantity: p.quantity,
        unitPrice: p.price || 0,
      })),
    };

    try {
      if (mode === 'edit') {
        await updatePurchaseOrder(id, payload);
        console.log('✅ อัปเดตใบสั่งซื้อเรียบร้อย');
        navigate(`/pos/purchases/orders/print/${id}`);
      } else {
        const created = await createPurchaseOrder(payload);
        console.log('✅ สร้างใบสั่งซื้อเรียบร้อย');
        navigate(`/pos/purchases/orders/print/${created.id}`);
      }
    } catch (err) {
      console.error('❌ เกิดข้อผิดพลาด:', err);
    }
  };

  if (loading) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* SECTION 1: ข้อมูลทั่วไป */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>เลือก Supplier</Label>
          <POSupplierSelector value={supplier} onChange={setSupplier} disabled={mode === 'edit'} />
        </div>

        <div>
          <Label>วันที่สั่งซื้อ</Label>
          <Input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            readOnly={mode === 'edit'}
          />
        </div>
      </div>

      <div>
        <Label>หมายเหตุเพิ่มเติม</Label>
        <Textarea
          rows={3}
          placeholder="เช่น เงื่อนไขการจัดส่งพิเศษ"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* SECTION 2: รายการสินค้า */}
      <div>
        <PurchaseOrderProductTable products={products} setProducts={setProducts} editable={mode !== 'view'} />
      </div>

      <div className="flex justify-end">
        <StandardActionButtons
          onSave={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
