import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import POSupplierSelector from './PurchaseOrderSupplierSelector';
import ProductSearchTable from './ProductSearchTable';
import usePurchaseOrderStore from '../store/purchaseOrderStore';
import useEmployeeStore from '@/store/employeeStore';
import useProductStore from '@/features/product/store/productStore';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import { useParams, useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import PurchaseOrderTable from './PurchaseOrderTable';
import { getAdvancePaymentsBySupplier } from '@/features/supplierPayment/api/supplierPaymentApi';


const PurchaseOrderForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [creditHint, setCreditHint] = useState(null);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [advancePayments, setAdvancePayments] = useState([]);
  const [selectedAdvanceIds, setSelectedAdvanceIds] = useState([]);

  const branchId = useEmployeeStore((state) => state.branch?.id);
  const {
    purchaseOrder,
    loading,
    fetchPurchaseOrderById,
    createPurchaseOrder,
    createPurchaseOrderWithAdvance,
    updatePurchaseOrder,
  } = usePurchaseOrderStore();

  const {
    searchResults,
    searchProductsAction
  } = useProductStore();

  const { suppliers: supplierList } = useSupplierStore();

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

  useEffect(() => {
    if (!supplier?.id) return;
    const selected = supplierList.find((s) => s.id === supplier.id);
    if (selected) {
      setCreditHint({
        used: selected.currentBalance || 0,
        total: selected.creditLimit || 0,
      });
    } else {
      setCreditHint(null);
    }

    // ✅ โหลดยอดมัดจำเมื่อเลือก Supplier
    const loadAdvance = async () => {
      const data = await getAdvancePaymentsBySupplier(supplier.id);
      setAdvancePayments(data);
    };
    loadAdvance();
  }, [supplier, supplierList]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        searchProductsAction(searchQuery);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

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
      advancePaymentIds: selectedAdvanceIds, // ✅ ส่งไปผูกกับใบสั่งซื้อ
    };

    try {
      if (mode === 'edit') {
        await updatePurchaseOrder(id, payload);
        console.log('✅ อัปเดตใบสั่งซื้อเรียบร้อย');
        navigate(`/pos/purchases/orders/print/${id}`);
      } else {
        const created = await createPurchaseOrderWithAdvance(payload);
        console.log('✅ สร้างใบสั่งซื้อเรียบร้อย');
        navigate(`/pos/purchases/orders/print/${created.id}`);
      }
    } catch (err) {
      console.error('❌ เกิดข้อผิดพลาด:', err);
    }
  };

  const addProductToOrder = (product) => {
    const exists = products.find((p) => p.id === product.id);
    if (exists) return;
    setProducts([...products, product]);
  };

  if (loading) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* SECTION 1: ข้อมูลทั่วไป */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>เลือก Supplier</Label>
          <POSupplierSelector value={supplier} onChange={setSupplier} disabled={mode === 'edit'} />
          {creditHint && (
            <p className="text-sm text-muted-foreground mt-1">
              เครดิตโดยประมาณ: ฿{creditHint.total.toLocaleString()} / ใช้ไปแล้ว: ฿{creditHint.used.toLocaleString()}
            </p>
          )}
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

      {advancePayments.length > 0 && (
        <div>
          <Label>เลือกยอดมัดจำที่จะใช้กับใบสั่งซื้อนี้</Label>
          <div className="space-y-1 mt-2">
            {advancePayments.map((adv) => (
              <div key={adv.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedAdvanceIds.includes(adv.id)}
                  onChange={(e) => {
                    const id = adv.id;
                    setSelectedAdvanceIds((prev) =>
                      e.target.checked ? [...prev, id] : prev.filter((i) => i !== id)
                    );
                  }}
                />
                <span>
                  ยอดชำระล่วงหน้า: ฿{adv.debitAmount != null ? adv.debitAmount.toLocaleString() : 'ไม่ระบุ'} | วันที่: {adv.paidAt ? new Date(adv.paidAt).toLocaleDateString() : 'ไม่ระบุ'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: ค้นหาและเพิ่มสินค้า */}
      <div className="space-y-2">
        <Label>ค้นหาสินค้า</Label>
        <div className="flex gap-2 items-center">
          <Input
            className="max-w-[400px]"
            placeholder="พิมพ์ชื่อสินค้า หรือบาร์โค้ด"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ProductSearchTable results={searchResults} onAdd={addProductToOrder} />
      </div>

      {/* SECTION 3: รายการสินค้าในใบสั่งซื้อ */}
      <div>
        <h3 className="text-md font-semibold px-4 pt-3 pb-2 text-gray-700">รายการสินค้าที่สั่งซื้อ</h3>
        <PurchaseOrderTable products={products} setProducts={setProducts} editable={mode !== 'view'} />
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


  
