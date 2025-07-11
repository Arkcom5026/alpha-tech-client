import React, { useState, useMemo, useEffect } from 'react';
import useSalesTaxReportStore from '../store/salesTaxReportStore';

// ในโปรเจกต์จริงของคุณ ให้ใช้ import นี้
// import useSalesTaxReportStore from '../store/salesTaxReportStore';

// --- ไอคอน (ใช้ SVG แบบ inline เพื่อความสะดวก) ---
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
    <line x1="16" x2="16" y1="2" y2="6"></line>
    <line x1="8" x2="8" y1="2" y2="6"></line>
    <line x1="3" x2="21" y1="10" y2="10"></line>
  </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
    </svg>
);


// --- ฟังก์ชันช่วยเหลือ ---
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0.00';
  return new Intl.NumberFormat('th-TH', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


// --- คอมโพเนนต์หลักสำหรับรายงานภาษีขาย ---
export default function SalesTaxReportPage() {
  const { data, loading, error, getReport, clearReport } = useSalesTaxReportStore();
  
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    return () => {
      clearReport();
    }
  }, [clearReport]);

  const handleFetchReport = () => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    getReport(startDate, endDate, token);
  };

  const { totalSalesValue, totalSalesVat, totalReturnsValue, totalReturnsVat, netValue, netVat } = useMemo(() => {
    if (!data) return { totalSalesValue: 0, totalSalesVat: 0, totalReturnsValue: 0, totalReturnsVat: 0, netValue: 0, netVat: 0 };
    
    const totalSalesValue = data.sales?.reduce((sum, item) => sum + item.value, 0) || 0;
    const totalSalesVat = data.sales?.reduce((sum, item) => sum + item.vat, 0) || 0;
    const totalReturnsValue = data.returns?.reduce((sum, item) => sum + item.value, 0) || 0;
    const totalReturnsVat = data.returns?.reduce((sum, item) => sum + item.vat, 0) || 0;
    
    return {
        totalSalesValue,
        totalSalesVat,
        totalReturnsValue,
        totalReturnsVat,
        netValue: totalSalesValue + totalReturnsValue,
        netVat: totalSalesVat + totalReturnsVat,
    };
  }, [data]);

  const renderTable = (title, headers, items, type) => (
    <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {headers.map(header => (
                            <th key={header.key} className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${header.align === 'right' ? 'text-right' : 'text-left'}`}>
                                {header.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items && items.length > 0 ? items.map((item, index) => (
                        <tr key={`${type}-${index}`} className={`hover:${type === 'sales' ? 'bg-gray-50' : 'bg-red-50'}`}>
                            {headers.map(header => (
                                <td key={`${header.key}-${index}`} className={`px-4 py-3 whitespace-nowrap text-sm ${header.align === 'right' ? 'text-right' : 'text-left'} ${header.isCurrency ? 'font-mono' : ''} ${type === 'returns' ? 'text-red-600' : 'text-gray-700'}`}>
                                    {header.isCurrency ? formatCurrency(item[header.key]) : header.isDate ? formatDate(item[header.key]) : item[header.key]}
                                </td>
                            ))}
                        </tr>
                    )) : (
                        <tr><td colSpan={headers.length} className="text-center py-4 text-gray-500">ไม่พบข้อมูล</td></tr>
                    )}
                </tbody>
                 {items && items.length > 0 && (
                    <tfoot className="bg-gray-100 font-semibold">
                        <tr>
                            <td colSpan={headers.findIndex(h => h.key === 'value')} className="px-4 py-3 text-right text-sm text-gray-800">ยอดรวม</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-800 font-mono">{formatCurrency(type === 'sales' ? totalSalesValue : totalReturnsValue)}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-800 font-mono">{formatCurrency(type === 'sales' ? totalSalesVat : totalReturnsVat)}</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    </div>
  );
  
  const salesHeaders = [
      { key: 'date', label: 'วันที่', isDate: true },
      { key: 'invoiceNumber', label: 'เลขที่เอกสาร' },
      { key: 'customerName', label: 'ชื่อผู้ซื้อ' },
      { key: 'customerTaxId', label: 'เลขประจำตัวผู้เสียภาษี' },
      { key: 'value', label: 'มูลค่า', align: 'right', isCurrency: true },
      { key: 'vat', label: 'ภาษี (VAT)', align: 'right', isCurrency: true },
  ];

  const returnsHeaders = [
      { key: 'date', label: 'วันที่', isDate: true },
      { key: 'creditNoteNumber', label: 'เลขที่ใบลดหนี้' },
      { key: 'originalInvoiceNumber', label: 'อ้างอิงใบกำกับ' },
      { key: 'value', label: 'มูลค่า', align: 'right', isCurrency: true },
      { key: 'vat', label: 'ภาษี (VAT)', align: 'right', isCurrency: true },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">รายงานภาษีขาย</h1>
          <p className="mt-1 text-sm text-gray-600">
            แสดงรายการใบกำกับภาษีและใบลดหนี้ตามช่วงวันที่ที่เลือก
          </p>
        </header>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
                    <div className="relative">
                        <CalendarIcon />
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="pl-8 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                     <div className="relative">
                        <CalendarIcon />
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="pl-8 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10"/>
                    </div>
                </div>
                
                <div className="md:col-start-3">
                    <button
                        onClick={handleFetchReport}
                        disabled={loading}
                        className="w-full h-10 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
                    >
                        {loading ? 'กำลังโหลด...' : <><SearchIcon /><span>ค้นหารายงาน</span></>}
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            {loading && <div className="text-center py-10 text-gray-500">กำลังดึงข้อมูลรายงาน...</div>}
            {error && <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">{`เกิดข้อผิดพลาด: ${error}`}</div>}
            
            {data && !loading && !error && (
                <>
                    {renderTable('รายการขาย (ใบกำกับภาษี)', salesHeaders, data.sales, 'sales')}
                    {renderTable('รายการคืน (ใบลดหนี้)', returnsHeaders, data.returns, 'returns')}

                    <div className="mt-8 pt-6 border-t-2 border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">สรุปยอดสุทธิ</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-600">มูลค่ารวม (สุทธิ)</p>
                                <p className="text-2xl font-semibold text-gray-800 font-mono">{formatCurrency(netValue)}</p>
                            </div>
                             <div className="bg-indigo-50 p-4 rounded-lg text-center">
                                <p className="text-sm text-indigo-800">ภาษีขายรวม (สุทธิ)</p>
                                <p className="text-2xl font-semibold text-indigo-600 font-mono">{formatCurrency(netVat)}</p>
                            </div>
                             <div className="bg-green-50 p-4 rounded-lg text-center">
                                <p className="text-sm text-green-800">ยอดรวมทั้งสิ้น</p>
                                <p className="text-2xl font-bold text-green-700 font-mono">{formatCurrency(netValue + netVat)}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            {!loading && !data && !error && (
                <div className="text-center py-10 text-gray-500">
                    <p>กรุณาเลือกช่วงวันที่และกด "ค้นหารายงาน" เพื่อแสดงข้อมูล</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}