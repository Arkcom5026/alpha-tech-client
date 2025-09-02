
// =============================================================
// File: src/features/address/components/AddressDisplay.jsx
// Desc: Compact read-only address renderer
// Props:
//  - addressString?: string  (preferred; e.g., backend-provided customerAddress)
//  - fallback?: { address, subdistrictName, districtName, provinceName, postalCode }
// =============================================================

const joinParts = (arr) => arr.filter(Boolean).join(' ');

const AddressDisplay = ({ addressString = '', fallback }) => {
  const text = addressString || (fallback ? joinParts([
    fallback.address,
    fallback.subdistrictName,
    fallback.districtName,
    fallback.provinceName,
    fallback.postalCode,
  ]) : '');
  return <span>{text || '-'}</span>;
};

export default AddressDisplay;
