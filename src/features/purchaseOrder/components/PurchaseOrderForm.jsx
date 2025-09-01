import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductSearchTable from './ProductSearchTable';
import usePurchaseOrderStore from '../store/purchaseOrderStore';
import useProductStore from '@/features/product/store/productStore';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import { useParams, useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import PurchaseOrderTable from './PurchaseOrderTable';
import { getAdvancePaymentsBySupplier } from '@/features/supplierPayment/api/supplierPaymentApi';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import PurchaseOrderSupplierSelector from './PurchaseOrderSupplierSelector';

const PurchaseOrderForm = ({ mode = 'create', searchText, onSearchTextChange }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [creditHint, setCreditHint] = useState(null);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');
  const [products, setProducts] = useState([]);
  const [advancePayments, setAdvancePayments] = useState([]);
  const [selectedAdvance, setSelectedAdvance] = useState([]);
  const { suppliers: supplierList } = useSupplierStore();
    const [shouldPrint, setShouldPrint] = useState(true);

  const {
    purchaseOrder,
    loading,
    fetchPurchaseOrderById,
    createPurchaseOrderWithAdvance,
    updatePurchaseOrder,
  } = usePurchaseOrderStore();

  const {
    fetchProductsAction,
    products: fetchedProducts,
    dropdowns,
    ensureDropdownsAction
  } = useProductStore();

  useEffect(() => {
    if (!supplier?.id) return;
    const selected = supplierList.find((s) => s.id === supplier.id);
    if (selected) {
      setCreditHint({
        used: selected.creditBalance || 0,
        total: selected.creditLimit || 0,
      });
    } else {
      setCreditHint(null);
    }

    const loadAdvance = async () => {
      const data = await getAdvancePaymentsBySupplier(supplier.id);
      setAdvancePayments(data);
    };
    loadAdvance();
  }, [supplier, supplierList]);

  const [filter, setFilter] = useState({
    categoryId: '',
    productTypeId: '',
    productProfileId: '',
    templateId: '',
  });

  const [committedSearchText, setCommittedSearchText] = useState('');

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
        name: item.product?.name || '-',
        description: item.product?.description || '-',
        category: item.product?.category || '-',
        productType: item.product?.productType || '-',
        productProfile: item.product?.productProfile || '-',
        productTemplate: item.product?.productTemplate || '-',
        quantity: item.quantity,
        costPrice: item.costPrice,
      }));
      setProducts(enriched);
    }
  }, [mode, purchaseOrder]);

  useEffect(() => {
    ensureDropdownsAction();
  }, [ensureDropdownsAction]);

  useEffect(() => {
    if (
      filter.categoryId || filter.productTypeId || filter.productProfileId || filter.templateId || committedSearchText
    ) {
      const transformedFilter = {
        categoryId: filter.categoryId ? Number(filter.categoryId) : undefined,
        productTypeId: filter.productTypeId ? Number(filter.productTypeId) : undefined,
        productProfileId: filter.productProfileId ? Number(filter.productProfileId) : undefined,
        templateId: filter.templateId ? Number(filter.templateId) : undefined,
        searchText: committedSearchText?.trim() || undefined,
      };
      fetchProductsAction(transformedFilter);
    }
  }, [filter, committedSearchText, fetchProductsAction]);

  const handleFilterChange = (newFilter) => {
    setFilter((prev) => {
      const updated = { ...prev, ...newFilter };
      if (newFilter.categoryId && newFilter.categoryId !== prev.categoryId) {
        updated.productTypeId = '';
        updated.productProfileId = '';
        updated.templateId = '';
      } else if (newFilter.productTypeId && newFilter.productTypeId !== prev.productTypeId) {
        updated.productProfileId = '';
        updated.templateId = '';
      } else if (newFilter.productProfileId && newFilter.productProfileId !== prev.productProfileId) {
        updated.templateId = '';
      }
      return updated;
    });
  };

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
        name: p.name,
        model: p.model || '-',
        category: p.category,
        productType: p.productType,
        productProfile: p.productProfile,
        productTemplate: p.productTemplate,
        quantity: p.quantity,
        costPrice: p.costPrice || 0,
      })),
      advancePaymentsUsed: selectedAdvance.map((adv) => ({
        paymentId: adv.id,
        amount: adv.debitAmount || 0,
      })),
    };

    try {
      if (mode === 'edit') {
        await updatePurchaseOrder(id, payload);
        console.log('✅ อัปเดตใบสั่งซื้อเรียบร้อย');
        if (shouldPrint) navigate(`/pos/purchases/orders/print/${id}`);
        else navigate(`/pos/purchases/orders`);
      } else {
        const created = await createPurchaseOrderWithAdvance(payload);
        console.log('✅ สร้างใบสั่งซื้อเรียบร้อย');
        if (shouldPrint) navigate(`/pos/purchases/orders/print/${created.id}`);
        else navigate(`/pos/purchases/orders`);
      }
    } catch (err) {
      console.error('❌ เกิดข้อผิดพลาด:', err);
    }
  };

  const addProductToOrder = (product) => {
    const exists = products.find((p) => p.id === product.id);
    if (exists) return;

    setProducts((prev) => [
      ...prev,
      {
        id: product.id,
        name: product.name || '-',
        model: product.model || '-',
        category: product.category || '-',
        productType: product.productType || '-',
        productProfile: product.productProfile || '-',
        productTemplate: product.productTemplate || '-',
        quantity: product.quantity || 1,
        costPrice: product.costPrice || 0,
      },
    ]);
  };

  if (loading) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <div className='flex gap-6 flex-wrap'>
        <div className='w-[300px]'>
          <Label>เลือก Supplier</Label>
          <PurchaseOrderSupplierSelector value={supplier} onChange={setSupplier} disabled={mode === 'edit'} />
          {creditHint && (
            <p className="text-sm text-muted-foreground mt-1">
              เครดิตโดยประมาณ: ฿{creditHint.total.toLocaleString()} / ใช้ไปแล้ว: ฿{creditHint.used.toLocaleString()}
            </p>
          )}
        </div>

        <div className='w-[300px]'>
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
            {advancePayments.map((adv) => {
              const isSelected = selectedAdvance.some((s) => s.id === adv.id);
              return (
                <div key={adv.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      setSelectedAdvance((prev) => {
                        if (e.target.checked) {
                          return [...prev, adv];
                        } else {
                          return prev.filter((p) => p.id !== adv.id);
                        }
                      });
                    }}
                  />
                  <span>
                    ยอดชำระล่วงหน้า: ฿{adv.debitAmount != null ? adv.debitAmount.toLocaleString() : 'ไม่ระบุ'} | วันที่: {adv.paidAt ? new Date(adv.paidAt).toLocaleDateString() : 'ไม่ระบุ'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className='p-2'>
        <Label>ค้นหาสินค้า</Label>
        <CascadingFilterGroup
          value={filter}
          onChange={handleFilterChange}
          dropdowns={dropdowns}
          showSearch
          searchText={searchText}
          onSearchTextChange={onSearchTextChange}
          onSearchCommit={(text) => {
            const trimmed = text.trim();
            setCommittedSearchText(trimmed.length > 0 ? trimmed : '');
          }}
        />
      </div>

      <div>
        <ProductSearchTable results={fetchedProducts} onAdd={addProductToOrder} />
      </div>

      <div>
        <PurchaseOrderTable products={products} setProducts={setProducts} editable={mode !== 'view'} />
      </div>

      <div className="flex flex-col items-end px-4 gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={shouldPrint}
            onChange={(e) => setShouldPrint(e.target.checked)}
          />
          <span className="text-sm text-gray-700">พิมพ์ใบสั่งซื้อ</span>
        </label>

        <div className="flex items-center gap-4">
          <StandardActionButtons onSave={handleSubmit} onCancel={() => navigate(-1)} />
        </div>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;




