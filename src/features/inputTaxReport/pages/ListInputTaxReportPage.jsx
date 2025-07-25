// ListInputTaxReportPage.jsx

import { useEffect, useState } from 'react';
import { format, isValid } from 'date-fns';
import { useInputTaxReportStore } from '../store/inputTaxReporStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import InputTaxReportTable from '../components/InputTaxReportTable';

const ListInputTaxReportPage = () => {
  const { branchId } = useBranchStore();
  const navigate = useNavigate();
  const {
    reportData,
    isLoading,
    fetchInputTaxReportAction,
  } = useInputTaxReportStore();

  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (isValid(startDate) && isValid(endDate)) {
      fetchInputTaxReportAction(branchId, {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
    }
  }, [startDate, endDate, branchId, fetchInputTaxReportAction]);

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-[1000px]">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">รายงานภาษีซื้อ</h1>
          <Button onClick={() => navigate(`/pos/reports/inputtax/print?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`)}>
            พิมพ์ รายงาน
          </Button>
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

        <InputTaxReportTable          
          items={reportData}
          type="normal"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ListInputTaxReportPage;
