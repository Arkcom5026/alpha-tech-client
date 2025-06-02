// ✅ PreviewBarcodePage.jsx — หน้าตัวอย่างก่อนพิมพ์บาร์โค้ด

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import BarcodeRenderer from '@/components/shared/barcode/BarcodeRenderer';
import { Button } from '@/components/ui/button';

const PreviewBarcodePage = () => {
  const location = useLocation();
  const snList = location.state?.snList || [];

  const [barcodeSize, setBarcodeSize] = useState('md');
  const [columnCount, setColumnCount] = useState(3); // 🆕 จำนวนคอลัมน์

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 print:p-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">ตัวอย่างก่อนพิมพ์บาร์โค้ด</h1>
        <Button onClick={handlePrint}>พิมพ์ทั้งหมด</Button>
      </div>

      <div className="mb-4 flex gap-4 text-sm">
        <label>
          <input
            type="radio"
            name="barcodeSize"
            value="sm"
            checked={barcodeSize === 'sm'}
            onChange={() => setBarcodeSize('sm')}
          />{' '}
          ขนาดเล็ก
        </label>
        <label>
          <input
            type="radio"
            name="barcodeSize"
            value="md"
            checked={barcodeSize === 'md'}
            onChange={() => setBarcodeSize('md')}
          />{' '}
          ขนาดกลาง
        </label>
        <label>
          <input
            type="radio"
            name="barcodeSize"
            value="lg"
            checked={barcodeSize === 'lg'}
            onChange={() => setBarcodeSize('lg')}
          />{' '}
          ขนาดใหญ่
        </label>

        <div className="ml-8">
          จำนวนคอลัมน์:{' '}
          <select
            className="border px-2 py-1 rounded text-sm"
            value={columnCount}
            onChange={(e) => setColumnCount(Number(e.target.value))}
          >
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
          </select>
        </div>
      </div>

      <div
        className={`grid gap-6 print:grid-cols-${columnCount}`}
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      >
        {snList.map((sn) => (
          <div
            key={sn.id}
            className="border rounded p-2 flex flex-col items-center text-xs bg-white shadow print:shadow-none"
          >
            <BarcodeRenderer value={sn.sn} size={barcodeSize} />
            {/* <div className="mt-1 font-mono">{sn.sn}</div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewBarcodePage;
