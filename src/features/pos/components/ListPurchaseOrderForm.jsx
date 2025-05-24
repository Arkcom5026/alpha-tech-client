import { useState, useEffect, useCallback } from "react";
import { FaSearch, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import UpdatePurchaseOrderForm from "./UpdatePurchaseOrderForm";


const ListPurchaseOrderForm = () => {

  // ข้อมูลตัวอย่าง
  const [orders, setOrders] = useState([
    {
      id: "PO-2023-0001",
      orderNumber: "PO-2023-0001",
      supplierId: "SUP001",
      supplierName: "บริษัท ซัพพลายเออร์ จำกัด",
      orderDate: new Date("2023-05-15"),
      dueDate: new Date("2023-06-15"),
      status: "completed",
      totalAmount: 15000,
      items: [
        { productId: "P001", productName: "สินค้า A", quantity: 5, unitPrice: 1000, discount: 0, unit: "ชิ้น" }
      ]
    },
    {
      id: "PO-2023-0002",
      orderNumber: "PO-2023-0002",
      supplierId: "SUP002",
      supplierName: "ห้างหุ้นส่วน ตัวอย่าง",
      orderDate: new Date("2023-05-20"),
      dueDate: new Date("2023-06-20"),
      status: "pending",
      totalAmount: 22500,
      items: [
        { productId: "P002", productName: "สินค้า B", quantity: 3, unitPrice: 2500, discount: 10, unit: "กล่อง" },
        { productId: "P003", productName: "สินค้า C", quantity: 10, unitPrice: 500, discount: 0, unit: "อัน" }
      ]
    }
  ]);

  // สถานะการค้นหา
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // สถานะการแก้ไข
  const [editingOrder, setEditingOrder] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // กรองข้อมูลตามเงื่อนไขการค้นหา
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesDate = (!startDate || new Date(order.orderDate) >= startDate) &&
      (!endDate || new Date(order.orderDate) <= endDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // จัดรูปแบบสกุลเงิน
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
  };

  // จัดรูปแบบวันที่
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('th-TH');
  };

  // ฟังก์ชันแก้ไขใบสั่งซื้อ
  const handleEdit = (order) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  // ฟังก์ชันลบใบสั่งซื้อ
  const handleDelete = (orderId) => {
    if (window.confirm("คุณแน่ใจว่าต้องการลบใบสั่งซื้อนี้?")) {
      setOrders(orders.filter(order => order.id !== orderId));
    }
  };

  // ฟังก์ชันบันทึกการแก้ไข
  const handleSave = (updatedOrder) => {
    setOrders(orders.map(order =>
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    setIsFormOpen(false);
    setEditingOrder(null);
  };




  // ในคอมโพเนนต์หลัก
  const handleCancel = useCallback(() => {
    setIsFormOpen(false);
    setEditingOrder(null);
  }, []); // <-- วงเล็บว่างไว้แบบนี้

  useEffect(() => {
    if (!isFormOpen) return; // เพิ่มบรรทัดนี้เพื่อความปลอดภัย

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen, handleCancel]); // <-- ต้องมี dependencies ทั้งสองตัว


  return (
    <div className="p-6">
      {/* ส่วนหัว */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการใบสั่งซื้อ</h1>
      </div>

      {/* ฟอร์มค้นหา */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* ช่องค้นหาทั่วไป */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาด้วยเลขที่ใบสั่งซื้อหรือชื่อผู้ขาย..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* ตัวกรองสถานะ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="completed">เสร็จสิ้น</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>

          {/* ตัวกรองวันที่ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ช่วงวันที่</label>
            <div className="relative">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                dateFormat="dd/MM/yyyy"
                placeholderText="เลือกช่วงวันที่"
                className="w-full px-3 py-2 border border-gray-300 rounded-md pl-10"
                isClearable={true}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ตารางแสดงผลลัพธ์ */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่ใบสั่งซื้อ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ขาย</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สั่งซื้อ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ครบกำหนด</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รวมทั้งสิ้น</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.orderNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.supplierName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.orderDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.dueDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {order.status === 'completed' ? 'เสร็จสิ้น' :
                        order.status === 'pending' ? 'รอดำเนินการ' : 'ยกเลิก'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="แก้ไข"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-900"
                        title="ลบ"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  ไม่พบใบสั่งซื้อที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal สำหรับฟอร์มแก้ไข */}

      
      {isFormOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">แก้ไขใบสั่งซื้อ</h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <UpdatePurchaseOrderForm
                initialOrder={editingOrder} // เปลี่ยนจาก initialData เป็น initialOrder
                onSave={handleSave} // ส่งฟังก์ชันบันทึก
                onCancel={handleCancel} // ส่งฟังก์ชันยกเลิก
              />
            </div>
          </div>
        </div>
      )}
      

      
    </div>
  );
};

export default ListPurchaseOrderForm;