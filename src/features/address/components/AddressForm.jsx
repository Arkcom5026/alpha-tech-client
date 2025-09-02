
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

import AddressCascader from '@/features/address/components/AddressCascader';

const AddressForm = ({ value, onChange, disabled = false, required = false, className = '' }) => {
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
      />

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
