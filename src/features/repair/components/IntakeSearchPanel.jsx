import React, { useCallback, useState } from 'react';
import MobileDeviceScanner from './MobileDeviceScanner';

const customerName = (customer) =>
  customer.companyName || customer.name || `ลูกค้า #${customer.id}`;

const deviceName = (device) =>
  [device.product?.brand?.name || device.brand, device.product?.name || device.model]
    .filter(Boolean)
    .join(' ') ||
  device.serialNumber ||
  device.imei ||
  device.barcode ||
  `อุปกรณ์ #${device.id}`;

const deviceIdentifiers = (device) =>
  [
    device.barcode ? `Barcode: ${device.barcode}` : '',
    device.serialNumber ? `SN: ${device.serialNumber}` : '',
    device.imei ? `IMEI: ${device.imei}` : '',
    device.serviceTag ? `Service Tag: ${device.serviceTag}` : '',
  ].filter(Boolean).join(' • ');

const IntakeSearchPanel = ({
  value,
  loading,
  results,
  onChange,
  onSearch,
  onReset,
  onSelectDevice,
  onSelectCustomer,
}) => {
  const submit = (event) => {
    event.preventDefault();
    onSearch(value);
  };
  const [scannerOpen, setScannerOpen] = useState(false);
  const handleDetected = useCallback(
    (detectedValue) => {
      setScannerOpen(false);
      onChange(detectedValue);
      onSearch(detectedValue);
    },
    [onChange, onSearch]
  );

  const devices = results?.devices || [];
  const customers = results?.customers || [];
  const hasResults = devices.length > 0 || customers.length > 0;

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-black text-slate-800">ค้นหาลูกค้าหรืออุปกรณ์</p>
        <p className="mt-1 text-xs text-slate-500">
          ชื่อ เบอร์โทร บริษัท รุ่น ยี่ห้อ Barcode, Serial Number หรือ Service Tag
        </p>

        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 font-black text-blue-700 sm:hidden"
        >
          <span aria-hidden="true">▣</span>
          เปิดกล้องสแกน Barcode / QR
        </button>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            autoFocus
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="พิมพ์หรือสแกนข้อมูลที่มี"
            className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 rounded-xl bg-blue-700 px-6 font-black text-white disabled:opacity-50"
          >
            {loading ? 'กำลังค้นหา' : 'ค้นหา'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="min-h-12 rounded-xl border border-slate-300 px-4 font-black text-slate-700"
          >
            ล้าง
          </button>
        </div>
      </form>

      {hasResults ? (
        <div className="space-y-3">
          {devices.length > 0 ? (
            <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-3">
              <p className="text-xs font-black text-blue-800">อุปกรณ์ที่พบ {devices.length} รายการ</p>
              <div className="mt-2 space-y-2">
                {devices.map((device) => (
                  <button
                    key={`${device.sourceType || 'STOCK_ITEM'}-${device.id}`}
                    type="button"
                    onClick={() => onSelectDevice(device)}
                    className="w-full rounded-xl border border-blue-100 bg-white p-3 text-left hover:border-blue-400"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-900">{deviceName(device)}</p>
                        <p className="mt-1 truncate text-xs font-bold text-slate-500">
                          {deviceIdentifiers(device) || 'ยังไม่มีรหัสประจำอุปกรณ์'}
                        </p>
                        {device.latestCustomer ? (
                          <p className="mt-1 truncate text-xs text-emerald-700">
                            ลูกค้าล่าสุด: {customerName(device.latestCustomer)}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {device.sourceType === 'REGISTERED_DEVICE' ? (
                          <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-black text-violet-700">
                            อุปกรณ์ลงทะเบียน
                          </span>
                        ) : null}
                        {device.exactIdentifierMatch ? (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-black text-blue-700">
                            รหัสตรงกัน
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {customers.length > 0 ? (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3">
              <p className="text-xs font-black text-emerald-800">ลูกค้าที่พบ {customers.length} รายการ</p>
              <div className="mt-2 space-y-2">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => onSelectCustomer(customer)}
                    className="w-full rounded-xl border border-emerald-100 bg-white p-3 text-left hover:border-emerald-400"
                  >
                    <p className="truncate font-black text-slate-900">{customerName(customer)}</p>
                    <p className="mt-1 truncate text-xs font-bold text-slate-500">
                      {customer.phone || customer.email || 'ไม่มีข้อมูลติดต่อ'}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
      <MobileDeviceScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleDetected}
      />
    </div>
  );
};

export default IntakeSearchPanel;
