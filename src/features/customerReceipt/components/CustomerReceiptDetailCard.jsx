


// src/features/customerReceipt/components/CustomerReceiptDetailCard.jsx

const formatMoney = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'FULLY_ALLOCATED':
      return {
        label: 'ตัดครบแล้ว',
        className: 'border-green-200 bg-green-50 text-green-700',
      };
    case 'CANCELLED':
      return {
        label: 'ยกเลิกแล้ว',
        className: 'border-red-200 bg-red-50 text-red-700',
      };
    case 'ACTIVE':
    default:
      return {
        label: 'ใช้งานอยู่',
        className: 'border-blue-200 bg-blue-50 text-blue-700',
      };
  }
};

const resolveCustomerName = (item) => {
  const customer = item?.customer;
  if (!customer) return '-';

  return (
    customer.companyName ||
    customer.name ||
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
    '-'
  );
};

const DetailRow = ({ label, value, valueClassName = 'text-gray-900' }) => {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-sm font-medium ${valueClassName}`}>{value || '-'}</p>
    </div>
  );
};

const CustomerReceiptDetailCard = ({ item }) => {
  if (!item) return null;

  const statusConfig = getStatusConfig(item?.status);
  const customerName = resolveCustomerName(item);
  const allocationCount = Array.isArray(item?.allocations) ? item.allocations.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">{item?.code || '-'}</h2>
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            ใบรับเงินสำหรับใช้ตัดชำระบิลขายของลูกค้า/หน่วยงาน โดยอ้างอิงสาขาปัจจุบันจาก session และแยกจาก payment ปกติ
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">ยอดรับ</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{formatMoney(item?.totalAmount)}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">ตัดแล้ว</p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">
              {formatMoney(item?.allocatedAmount)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">คงเหลือ</p>
            <p className="mt-1 text-xl font-semibold text-blue-700">
              {formatMoney(item?.remainingAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DetailRow label="ลูกค้า / หน่วยงาน" value={customerName} />
        <DetailRow label="รหัสลูกค้า" value={item?.customerId ? String(item.customerId) : '-'} />
        <DetailRow label="เลขอ้างอิง" value={item?.referenceNo || '-'} />
        <DetailRow label="วันที่รับเงิน" value={formatDateTime(item?.receivedAt)} />
        <DetailRow label="วิธีชำระ" value={item?.paymentMethod || '-'} />
        <DetailRow label="จำนวน allocation" value={`${allocationCount} รายการ`} />
        <DetailRow
          label="ผู้สร้างรายการ"
          value={
            item?.createdByEmployeeProfile?.name ||
            item?.createdByEmployeeProfile?.fullName ||
            item?.createdByEmployeeProfile?.employeeCode ||
            '-'
          }
        />
        <DetailRow
          label="วันเวลายกเลิก"
          value={formatDateTime(item?.cancelledAt)}
          valueClassName={item?.status === 'CANCELLED' ? 'text-red-700' : 'text-gray-900'}
        />
        <DetailRow
          label="ผู้ยกเลิกรายการ"
          value={
            item?.cancelledByEmployeeProfile?.name ||
            item?.cancelledByEmployeeProfile?.fullName ||
            item?.cancelledByEmployeeProfile?.employeeCode ||
            '-'
          }
          valueClassName={item?.status === 'CANCELLED' ? 'text-red-700' : 'text-gray-900'}
        />
        <DetailRow
          label="เหตุผลการยกเลิก"
          value={item?.cancelReason || '-'}
          valueClassName={item?.cancelReason ? 'text-red-700' : 'text-gray-900'}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-700">หมายเหตุ</p>
        <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {item?.note || 'ไม่มีหมายเหตุเพิ่มเติม'}
        </div>
      </div>
    </div>
  );
};

export default CustomerReceiptDetailCard;


