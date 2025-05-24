import { useState } from "react";
import { FaSave, FaPrint, FaPlus, FaMinus, FaTrash, FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { NavLink } from 'react-router-dom'
import "react-datepicker/dist/react-datepicker.css";
import PrintPurchaseOrder from "@/features/pos/purchase/pages/PrintPurchaseOrder";

const PurchaseOrderForm = () => {
  const [showPrintModal, setShowPrintModal] = useState(false);
  // ข้อมูลตัวอย่าง
  const mockSuppliers = [
    { id: "SUP001", name: "บริษัท ซัพพลายเออร์ จำกัด", address: "123 ถนนตัวอย่าง กรุงเทพ", phone: "02-123-4567", taxId: "1234567890123" },
    { id: "SUP002", name: "ห้างหุ้นส่วน ตัวอย่าง", address: "456 ถนนทดสอบ เชียงใหม่", phone: "053-987-6543", taxId: "9876543210987" }
  ];

  const mockProducts = [
    { id: "P001", code: "P001", name: "สินค้า A", price: 1000, unit: "ชิ้น" },
    { id: "P002", code: "P002", name: "สินค้า B", price: 2500, unit: "กล่อง" },
    { id: "P003", code: "P003", name: "สินค้า C", price: 500, unit: "อัน" }
  ];

  // สถานะฟอร์ม
  const [formData, setFormData] = useState({
    supplierId: "",
    orderDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    paymentTerms: "30",
    taxRate: 7,
    discount: 0,
    notes: "",
    items: [
      { productId: "", quantity: 1, unitPrice: 0, discount: 0, productName: "", unit: "" }
    ]
  });

  const [startDate, setStartDate] = useState(new Date());
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // คำนวณยอดรวมต่างๆ
  const subtotal = formData.items.reduce((sum, item) => {
    const itemTotal = (item.quantity * item.unitPrice) * (1 - (item.discount / 100));
    return sum + itemTotal;
  }, 0);

  const taxAmount = subtotal * (formData.taxRate / 100);
  const totalAmount = subtotal + taxAmount - formData.discount;

  // จัดการการเปลี่ยนแปลงข้อมูล
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (index, productId) => {
    const selectedProduct = mockProducts.find(p => p.id === productId);
    if (selectedProduct) {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        productId,
        unitPrice: selectedProduct.retailPrice ,
        productName: selectedProduct.name,
        unit: selectedProduct.unit
      };
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // เพิ่ม/ลบ รายการสินค้า
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, unitPrice: 0, discount: 0, productName: "", unit: "" }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  // จัดรูปแบบสกุลเงิน
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
  };

  // ส่งข้อมูลฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    alert("บันทึกข้อมูลเรียบร้อย (ดูข้อมูลใน Console)");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      {/* Header Section */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ใบสั่งซื้อใหม่</h2>
          <p className="text-sm text-gray-500">เลขที่เอกสาร: PO-{new Date().getFullYear()}-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
        </div>
        <div className="flex space-x-3">

          {/* แทนที่ NavLink ด้วย Button */}
          <button
            type="button"
            onClick={() => setShowPrintModal (true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <FaPrint className="mr-2" />
            <span>พิมพ์ใบสั่งซื้อ</span>
          </button>


          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <FaSave className="mr-2" /> บันทึก
          </button>
        </div>
      </div>

      {/* Supplier and Date Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Supplier Selection */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ผู้ขาย <span className="text-red-500">*</span>
          </label>
          <select
            name="supplierId"
            value={formData.supplierId}
            onChange={(e) => {
              handleInputChange(e);
              const supplier = mockSuppliers.find(s => s.id === e.target.value);
              setSelectedSupplier(supplier);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">เลือกผู้ขาย</option>
            {mockSuppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name} ({supplier.id})
              </option>
            ))}
          </select>
        </div>

        {/* Order Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่สั่งซื้อ <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DatePicker
              selected={formData.orderDate}
              onChange={(date) => {
                setStartDate(date);
                setFormData(prev => ({ ...prev, orderDate: date }));
              }}
              dateFormat="dd/MM/yyyy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Details (if selected) */}
      {selectedSupplier && (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">ที่อยู่</p>
              <p className="text-sm font-medium">{selectedSupplier.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">เบอร์โทร</p>
              <p className="text-sm font-medium">{selectedSupplier.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">เลขประจำตัวผู้เสียภาษี</p>
              <p className="text-sm font-medium">{selectedSupplier.taxId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Items Table */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          รายการสินค้า <span className="text-red-500">*</span>
        </label>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หน่วย</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคาต่อหน่วย</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ส่วนลด (%)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">เลือกสินค้า</option>
                      {mockProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.code})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                      required
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {item.unit || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                      required
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    {formatCurrency(
                      (item.quantity * item.unitPrice) * (1 - (item.discount / 100))
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-900"
                        title="ลบรายการ"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-2">
          <button
            type="button"
            onClick={addItem}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <FaPlus className="mr-1" /> เพิ่มรายการสินค้า
          </button>
        </div>
      </div>

      {/* Payment and Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Terms */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เงื่อนไขการชำระเงิน</label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="30">ชำระภายใน 30 วัน</option>
              <option value="15">ชำระภายใน 15 วัน</option>
              <option value="7">ชำระภายใน 7 วัน</option>
              <option value="0">ชำระเงินสด</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ครบกำหนดชำระ</label>
            <div className="relative">
              <DatePicker
                selected={formData.dueDate}
                onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                dateFormat="dd/MM/yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="บันทึกเพิ่มเติม..."
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">สรุปยอด</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">รวมเป็นเงิน</span>
              <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ภาษีมูลค่าเพิ่ม ({formData.taxRate}%)</span>
              <span className="text-sm font-medium">{formatCurrency(taxAmount)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ส่วนลดรวม</span>
              <span className="text-sm font-medium">-{formatCurrency(formData.discount)}</span>
            </div>

            <div className="border-t border-gray-200 my-2"></div>

            <div className="flex justify-between">
              <span className="text-base font-medium text-gray-900">รวมทั้งสิ้น</span>
              <span className="text-base font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
      {/* เพิ่มส่วนนี้ก่อนปิด </form> */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">พิมพ์ใบสั่งซื้อ</h2>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <PrintPurchaseOrder
                order={{
                  orderNumber: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                  supplier: selectedSupplier || { name: '', address: '', phone: '', taxId: '' },
                  orderDate: formData.orderDate,
                  dueDate: formData.dueDate,
                  paymentTerms: formData.paymentTerms,
                  taxRate: formData.taxRate,
                  discount: formData.discount,
                  notes: formData.notes,
                  items: formData.items.map(item => ({
                    ...item,
                    productName: item.productName || mockProducts.find(p => p.id === item.productId)?.name || ''
                  })),
                  subtotal,
                  taxAmount,
                  totalAmount
                }}
              />
            </div>
          </div>
        </div>
      )}


    </form>
  );
};

export default PurchaseOrderForm;