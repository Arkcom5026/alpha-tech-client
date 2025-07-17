import React, { useState, useEffect } from 'react';
import useCombinedBillingStore from '@/features/combinedBilling/store/combinedBillingStore';

const CustomerFilter = ({ onSelect }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [error, setError] = useState('');

  const {
    customersWithPendingSales,
    loadCustomersWithPendingSalesAction,
    setCustomer,
    customer,
  } = useCombinedBillingStore();

  const handleSelect = (cust) => {
    setCustomer(cust);
    if (onSelect) onSelect(cust);
  };

  const handleSearch = async () => {
    try {
      await loadCustomersWithPendingSalesAction();

      const filtered = customersWithPendingSales.filter((c) => {
        const lower = searchText.toLowerCase();
        return (
          (c.name && c.name.toLowerCase().includes(lower)) ||
          (c.phone && c.phone.includes(lower)) ||
          (c.companyName && c.companyName.toLowerCase().includes(lower))
        );
      });

      setFilteredCustomers(filtered);

      if (filtered.length === 1) {
        handleSelect(filtered[0]);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการค้นหาข้อมูลลูกค้า');
    }
  };

  const handleClear = () => {
    setCustomer(null);
    setSearchText('');
    setFilteredCustomers([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border w-full">
      <h2 className="text-2xl font-bold text-black mb-4">ข้อมูลลูกค้าที่มีใบส่งของค้าง</h2>
      <div className="flex gap-3 items-center mb-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อลูกค้า เบอร์โทร หรือหน่วยงาน"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border rounded-md px-4 py-2 w-full text-lg"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-lg"
        >
          ค้นหา
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-black text-lg"
        >
          ล้าง
        </button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="space-y-2">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            onClick={() => handleSelect(cust)}
            className="border border-gray-300 rounded p-3 cursor-pointer hover:bg-blue-50"
          >
            <p><strong>หน่วยงาน:</strong> {cust.companyName}</p>
            <p><strong>ชื่อ:</strong> {cust.name}</p>
            <p><strong>เบอร์:</strong> {cust.phone}</p>
            <p><strong>ประเภท:</strong> {cust.customerType}</p>
            <p><strong>อีเมล:</strong> {cust.email || '-'}</p>
            <p><strong>ที่อยู่:</strong> {cust.address || '-'}</p>
          </div>
        ))}
        {filteredCustomers.length === 0 && <p className="text-gray-600">ไม่พบลูกค้าที่ตรงกับคำค้น</p>}
      </div>
    </div>
  );
};

export default CustomerFilter;
