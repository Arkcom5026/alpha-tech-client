import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';


import PurchaseOrderTable from '../components/PurchaseOrderTable';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import usePurchaseOrderStore from '../store/purchaseOrderStore';

const PurchaseOrderListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const {
    purchaseOrders,
    fetchAllPurchaseOrders,
    loading,
  } = usePurchaseOrderStore();

  useEffect(() => {
    fetchAllPurchaseOrders({ search: searchTerm, status: statusFilter });
  }, [searchTerm, statusFilter, fetchAllPurchaseOrders]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex gap-2 w-full md:w-1/2">
          <Input
            placeholder="ค้นหาใบสั่งซื้อ หรือชื่อ Supplier"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="pending">รอดำเนินการ</SelectItem>
              <SelectItem value="completed">เสร็จสิ้น</SelectItem>
              <SelectItem value="cancelled">ยกเลิก</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <StandardActionButtons
          showCreate
          onAdd={() => navigate('/pos/purchases/orders/create')}
        />
      </div>

      <div>
        <PurchaseOrderTable purchaseOrders={Array.isArray(purchaseOrders) ? purchaseOrders : []} loading={loading} />
      </div>
    </div>
  );
};

export default PurchaseOrderListPage;
