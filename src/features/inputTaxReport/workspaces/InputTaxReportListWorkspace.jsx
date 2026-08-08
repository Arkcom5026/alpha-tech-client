


// ListInputTaxReportPage.jsx

import { useEffect, useMemo, useState } from 'react';
import { format, isValid } from 'date-fns';

import { useBranchStore } from '@/features/branch/store/branchStore';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import InputTaxReportTable from '../components/InputTaxReportTable';
import { useInputTaxReportStore } from '../store/inputTaxReporStore';

const parseLocalDateInput = (value) => {
  // value: 'YYYY-MM-DD'
  if (!value) return null;
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return new Date(y, mo - 1, d);
};

const ListInputTaxReportPage = () => {
  const { branchId, currentBranch } = useBranchStore();
  const branchIdSafe = branchId ?? currentBranch?.id ?? null;
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

  const rangeParams = useMemo(() => {
    if (!isValid(startDate) || !isValid(endDate)) return null;
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    };
  }, [startDate, endDate]);

  useEffect(() => {
    if (branchIdSafe == null) {
      console.warn('[InputTaxReport] missing branchId', { branchId, currentBranch });
      return;
    }
    if (!rangeParams) return;

    console.log('[InputTaxReport] fetch', { branchId: branchIdSafe, ...rangeParams });
    fetchInputTaxReportAction(branchIdSafe, rangeParams);
  }, [branchIdSafe, rangeParams, fetchInputTaxReportAction, branchId, currentBranch]);

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-[1000px]">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">รายงานภาษีซื้อ</h1>
          <Button
            onClick={() => {
              if (!rangeParams) return;
              const qs = new URLSearchParams(rangeParams).toString();
              navigate(`/pos/reports/inputtax/print?${qs}`);
            }}
          >
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
                const next = parseLocalDateInput(e.target.value);
                if (next) setStartDate(next);
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
                const next = parseLocalDateInput(e.target.value);
                if (next) setEndDate(next);
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





