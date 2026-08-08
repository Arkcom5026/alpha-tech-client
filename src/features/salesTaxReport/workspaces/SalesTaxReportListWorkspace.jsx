// ListSalesTaxReportPage.jsx

import { useEffect, useState } from 'react';
import { format, isValid } from 'date-fns';
import SalesTaxTable from '../components/SalesTaxTable';
import { Button } from '@/components/ui/button';
import { useSalesTaxReportStore } from '../store/salesTaxReportStore';
import { Link } from 'react-router-dom';

const ListSalesTaxReportPage = () => {
  const { salesTaxData, loadSalesTaxDataAction } = useSalesTaxReportStore();
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (isValid(startDate) && isValid(endDate)) {
      loadSalesTaxDataAction(startDate, endDate);
    }
  }, [startDate, endDate, loadSalesTaxDataAction]);

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-[1000px]">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">รายงานภาษีขาย</h1>
          <Link
            to={`/pos/reports/sales-tax/print?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`}
          >
            <Button>พิมพ์รายงาน</Button>
          </Link>
        </div>

        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">วันที่เริ่มต้น</label>
            <input
              type="date"
              value={isValid(startDate) ? format(startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value) setStartDate(new Date(value));
              }}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={isValid(endDate) ? format(endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value) setEndDate(new Date(value));
              }}
              className="border px-2 py-1 rounded"
            />
          </div>
        </div>

        <div className="mb-4 text-gray-700">
          ช่วงวันที่: {isValid(startDate) ? format(startDate, 'dd/MM/yyyy') : '-'} - {isValid(endDate) ? format(endDate, 'dd/MM/yyyy') : '-'}
        </div>

        

        <SalesTaxTable
          title="รายการขาย (ใบกำกับภาษี)"
          items={salesTaxData?.sales || []}
          type="sales"
        />

        {salesTaxData?.returns?.length > 0 && (
          <SalesTaxTable
            title="รายการคืน (ใบลดหนี้)"
            items={salesTaxData.returns}
            type="returns"
          />
        )}
      </div>
    </div>
  );
};

export default ListSalesTaxReportPage;
