

// src/features/customerReceipt/components/CustomerReceiptStatusBadge.jsx

const STATUS_CONFIG = {
    ACTIVE: {
      label: 'ใช้งานอยู่',
      className: 'border-blue-200 bg-blue-50 text-blue-700',
    },
    FULLY_ALLOCATED: {
      label: 'ตัดครบแล้ว',
      className: 'border-green-200 bg-green-50 text-green-700',
    },
    CANCELLED: {
      label: 'ยกเลิกแล้ว',
      className: 'border-red-200 bg-red-50 text-red-700',
    },
  };
  
  const CustomerReceiptStatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
  
    return (
      <span
        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };
  
  export default CustomerReceiptStatusBadge;



