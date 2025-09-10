
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

import React from 'react';
import AddressCascader from '@/features/address/components/AddressCascader';

// Helper: derive Thai region (ภาค) from DOPA province code (display-only)

const AddressForm = ({ value, onChange, disabled = false, required = false, className = '', provinceFilter, layout, hideAddressLine = false }) => {
  const address = (value && value.addressDetail != null) ? value.addressDetail : ((value && value.address) || '');
  const provinceCode = (value && value.provinceCode) || '';
  const districtCode = (value && value.districtCode) || '';
  
  const subdistrictCode = (value && value.subdistrictCode) || '';
  
  const postalCode = (value && value.postalCode) || '';

  const handleAddressChange = (e) => {
    if (onChange) {
      onChange({ ...(value || {}), addressDetail: e.target.value, address: e.target.value });
    }
  };

  const handleCascadeChange = (next) => {
    const nextPostal = (next && next.postalCode != null)
      ? next.postalCode
      : ((value && value.postalCode) || '');
    if (onChange) {
      onChange({
        ...(value || {}),
        provinceCode: next ? next.provinceCode : '',
        districtCode: next ? next.districtCode : '',
        subdistrictCode: next ? next.subdistrictCode : '',
        postalCode: nextPostal,
      });
    }
  };

  const handlePostalChange = (e) => {
    const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    if (onChange) {
      onChange({ ...(value || {}), postalCode: v });
    }
  };

  // Derived region (display only, not saved)
  
  return (
    <div className={`address-form-sm grid grid-cols-1 gap-4 ${className}`}>
      <style>{`
          .address-form-sm select,
          .address-form-sm input[type="text"] { font-size: 0.875rem; line-height: 1.25rem; }
        `}</style>
      {/* Address line */}
      {!hideAddressLine && (
        <div className="flex flex-col">
          <input
            type="text"
            className="border rounded-md px-3 py-2 text-sm"
            placeholder="เลขที่บ้าน ถนน ซอย หมู่บ้าน"
            value={address}
            onChange={handleAddressChange}
            disabled={disabled}
            required={required}
            autoComplete="address-line1"
          />
        </div>
      )}

      {/* Cascader + Postal layout */}
      {layout === 'subdistrict-with-postcode' ? (
        <div className="grid grid-cols-1 gap-4">
          {/* แถวบน: จังหวัด + อำเภอ */}
          <AddressCascader
            value={{ provinceCode, districtCode, subdistrictCode }}
            onChange={handleCascadeChange}
            disabled={disabled}
            required={required}
            provinceFilter={provinceFilter}
            showProvince={true}
            showDistrict={true}
            showSubdistrict={false}
            className="md:grid-cols-2"
          />

          {/* แถวล่าง: ตำบล + ไปรษณีย์ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <AddressCascader
              value={{ provinceCode, districtCode, subdistrictCode }}
              onChange={handleCascadeChange}
              disabled={disabled}
              required={required}
              provinceFilter={provinceFilter}
              showProvince={false}
              showDistrict={false}
              showSubdistrict={true}
              className="md:grid-cols-1"
            />
            <div className="flex flex-col md:w-full">              
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="border rounded-md px-3 py-2 text-left text-sm"
                placeholder="รหัสไปรษณีย์"
                value={postalCode}
                onChange={handlePostalChange}
                disabled={disabled}
                required={required}
                autoComplete="postal-code"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <AddressCascader
            value={{ provinceCode, districtCode, subdistrictCode }}
            onChange={handleCascadeChange}
            disabled={disabled}
            required={required}
            provinceFilter={provinceFilter}
          />

          {/* Postal code */}
          <div className="flex flex-col md:w-48">            
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="border rounded-md px-3 py-2 text-left text-sm"
                placeholder="รหัสไปรษณีย์"
              value={postalCode}
              onChange={handlePostalChange}
              disabled={disabled}
              required={required}
              autoComplete="postal-code"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AddressForm;


