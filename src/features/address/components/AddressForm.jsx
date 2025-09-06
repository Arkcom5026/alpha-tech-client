
// =============================================================
// File: src/features/address/components/AddressForm.jsx
// Desc: Full address block for forms (address line + cascader + postal code)
// Props:
//  - value: { address, provinceCode, districtCode, subdistrictCode, postalCode }
//  - onChange: (nextValue) => void
//  - disabled, required, className
// Notes:
//  - Postal code auto-fills from selected subdistrict but stays editable
// =============================================================

import React, { useMemo } from 'react';
import AddressCascader from '@/features/address/components/AddressCascader';

// Helper: derive Thai region (ภาค) from DOPA province code (display-only)
const deriveRegionFromDopa = (pcode) => {
  const code = Number(pcode);
  if (!Number.isFinite(code)) return '';
  const NORTH = new Set([50,51,52,53,54,55,56,57,58,60,61,62,63,64,65,66,67]);
  const NORTHEAST = new Set([30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49]);
  const EAST = new Set([20,21,22,23,24,25,27]);
  const SOUTH = new Set([80,81,82,83,84,85,86,90,91,92,93,94,95,96]);
  const WEST = new Set([70,71,76,77]);
  const CENTRAL = new Set([10,11,12,13,14,15,16,17,18,19,26,72,73,74,75]);
  if (NORTH.has(code)) return 'เหนือ';
  if (NORTHEAST.has(code)) return 'อีสาน';
  if (EAST.has(code)) return 'ตะวันออก';
  if (SOUTH.has(code)) return 'ใต้';
  if (WEST.has(code)) return 'ตะวันตก';
  if (CENTRAL.has(code)) return 'กลาง';
  return '';
};

const AddressForm = ({ value, onChange, disabled = false, required = false, className = '', provinceFilter }) => {
  const address = value?.address ?? '';
  const provinceCode = value?.provinceCode ?? '';
  const districtCode = value?.districtCode ?? '';
  
  const subdistrictCode = value?.subdistrictCode ?? '';
  
  const postalCode = value?.postalCode ?? '';

  const handleAddressChange = (e) => {
    onChange?.({ ...value, address: e.target.value });
  };

  const handleCascadeChange = (next) => {
    onChange?.({
      ...value,
      provinceCode: next.provinceCode,
      districtCode: next.districtCode,
      subdistrictCode: next.subdistrictCode,
      postalCode: next.postalCode ?? value?.postalCode ?? '',
    });
  };

  const handlePostalChange = (e) => {
    const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    onChange?.({ ...value, postalCode: v });
  };

  // Derived region (display only, not saved)
  const regionText = useMemo(() => deriveRegionFromDopa(provinceCode), [provinceCode]);

  return (
    <div className={`grid grid-cols-1 gap-4 ${className}`}>
      {/* Address line */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">ที่อยู่ (บ้าน/ถนน/หมู่บ้าน)</label>
        <input
          type="text"
          className="border rounded-xl px-3 py-2"
          placeholder="เลขที่บ้าน ถนน ซอย หมู่บ้าน"
          value={address}
          onChange={handleAddressChange}
          disabled={disabled}
          required={required}
          autoComplete="address-line1"
        />
      </div>

      {/* Cascader */}
      <AddressCascader
        value={{ provinceCode, districtCode, subdistrictCode }}
        onChange={handleCascadeChange}
        disabled={disabled}
        required={required}
        provinceFilter={provinceFilter}
      />

      {/* Region (display only) */}
      <div className="flex flex-col md:w-48">
        <label className="text-sm font-medium mb-1">ภาค (แสดงอัตโนมัติ ไม่บันทึก)</label>
        <input
          type="text"
          value={regionText}
          readOnly
          placeholder="เลือกจังหวัดก่อน"
          className="border rounded-xl px-3 py-2 bg-gray-50"
        />
      </div>

      {/* Postal code */}
      <div className="flex flex-col md:w-48">
        <label className="text-sm font-medium mb-1">รหัสไปรษณีย์</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="border rounded-xl px-3 py-2 text-left"
          placeholder="เช่น 10210"
          value={postalCode}
          onChange={handlePostalChange}
          disabled={disabled}
          required={required}
          autoComplete="postal-code"
        />
      </div>
    </div>
  );
};

export default AddressForm;


