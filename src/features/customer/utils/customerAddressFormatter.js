// src/features/customers/utils/customerAddressFormatter.js

export const buildCustomerFullAddress = (customer) => {
    if (!customer) {
      return '-';
    }
  
    const subdistrict = customer?.subdistrict || null;
    const district = subdistrict?.district || null;
    const province = district?.province || null;
  
    const parts = [
      customer?.addressDetail,
  
      subdistrict?.nameTh
        ? `ต.${subdistrict.nameTh}`
        : '',
  
      district?.nameTh
        ? `อ.${district.nameTh}`
        : '',
  
      province?.nameTh
        ? `จ.${province.nameTh}`
        : '',
  
      subdistrict?.postcode,
    ];
  
    const fullAddress = parts
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .join(' ');
  
    // Legacy compatibility
    const legacyAddress =
      typeof customer?.address === 'string'
        ? customer.address.trim()
        : '';
  
    return fullAddress || legacyAddress || '-';
  };
  
  export default buildCustomerFullAddress;
  