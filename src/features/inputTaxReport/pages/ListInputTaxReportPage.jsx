// src/features/inputTaxReport/pages/ListInputTaxReportPage.jsx

import React, { useEffect } from 'react';

import { useBranchStore } from '@/features/branch/store/branchStore';
import { useInputTaxReportStore } from '../store/inputTaxReporStore';

import { useNavigate } from 'react-router-dom';
import { InputTaxReportFilters } from '../components/InputTaxReportFilters';
import { InputTaxReportTable } from '../components/InputTaxReportTable';

const ListInputTaxReportPage = () => {
    const navigate = useNavigate();
    const { branchId } = useBranchStore();

    const {
        filters,
        setFilters,
        reportData,
        summary,
        isLoading,
        fetchInputTaxReportAction,
    } = useInputTaxReportStore();

    useEffect(() => {
        fetchInputTaxReportAction(branchId);
    }, [branchId, fetchInputTaxReportAction]);

    return (
        <div className="p-4 space-y-4">


            {/* Filters Section */}
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold">รายงานภาษีซื้อ</h1>
                <div className='py-6'>
                <InputTaxReportFilters
                    filters={{ taxMonth: filters.month, taxYear: filters.year }}
                    onFiltersChange={(newFilters) => setFilters({ ...filters, month: newFilters.taxMonth, year: newFilters.taxYear })}
                    onGenerateReport={() => fetchInputTaxReportAction(branchId)}
                    isGenerating={isLoading}
                />
                </div>

            </div>

            <div className="flex justify-end max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/pos/reports/taxprint')}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                    พิมพ์รายงาน
                </button>
            </div>

            <InputTaxReportTable
                data={reportData}
                summary={summary}
                isLoading={isLoading}
            />
        </div>
    );
};

export default ListInputTaxReportPage;




