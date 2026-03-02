



// 📁 FILE: src/features/finance/components/AccountsReceivableTable.jsx
// ✅ Production-grade table (minimal disruption)
// - Pure component (no API calls)
// - Defensive rendering
// - Default export (fix import issue)

import React, { useMemo } from 'react';

const parseMoney = (val) => {
  if (val == null) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (typeof val === 'string') {
    const s = val.replace(/,/g, '').trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  try {
    if (typeof val === 'object' && typeof val.toNumber === 'function') {
      const n = val.toNumber();
      return Number.isFinite(n) ? n : 0;
    }
  } catch (_) {
    // ignore
  }
  return 0;
};

const fmtMoney = (n) => {
  const x = parseMoney(n);
  return x.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const safeStr = (v) => {
  if (v == null) return '';
  return String(v);
};

const fmtDateTime = (v) => {
  try {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('th-TH');
  } catch (_) {
    return '';
  }
};

const getCustomerDisplay = (row) => {
  const c = row?.customer || null;
  const name = c?.name || row?.customerName || '';
  const company = c?.companyName || row?.companyName || '';

  // Preference: companyName first if exists
  const primary = company || name || '-';
  const secondary = company && name ? name : (c?.phone || row?.customerPhone || '');

  return { primary, secondary };
};

const getSaleCode = (row) => row?.saleCode || row?.code || row?.sale?.code || row?.sale?.documentCode || '-';

const getPaymentStatus = (row) => {
  // Support multiple naming conventions
  const s = row?.statusPayment || row?.paymentStatus || row?.sale?.statusPayment || row?.sale?.paymentStatus || '';
  const normalized = safeStr(s).toUpperCase();

  if (normalized === 'PAID' || normalized === 'FULLY_PAID') return { key: 'PAID', label: 'ชำระครบ', tone: 'green' };
  if (normalized === 'PARTIALLY_PAID' || normalized === 'PARTIAL') return { key: 'PARTIALLY_PAID', label: 'ค้างบางส่วน', tone: 'orange' };
  if (normalized === 'UNPAID' || normalized === 'OPEN') return { key: 'UNPAID', label: 'ค้างชำระ', tone: 'red' };

  // Fallback: infer from amounts
  const total = parseMoney(row?.totalAmount ?? row?.total ?? row?.sale?.totalAmount);
  const paid = parseMoney(row?.paidAmount ?? row?.paid ?? row?.sale?.paidAmount);
  const outstanding = Math.max(0, Number((total - paid).toFixed(2)));

  if (total > 0 && outstanding <= 0.000001) return { key: 'PAID', label: 'ชำระครบ', tone: 'green' };
  if (paid > 0 && outstanding > 0) return { key: 'PARTIALLY_PAID', label: 'ค้างบางส่วน', tone: 'orange' };
  if (outstanding > 0) return { key: 'UNPAID', label: 'ค้างชำระ', tone: 'red' };

  return { key: 'UNKNOWN', label: 'ไม่ทราบ', tone: 'gray' };
};

const ToneBadge = ({ tone, children }) => {
  const cls =
    tone === 'green'
      ? 'bg-green-50 text-green-700 border-green-200'
      : tone === 'orange'
        ? 'bg-orange-50 text-orange-700 border-orange-200'
        : tone === 'red'
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${cls}`}>
      {children}
    </span>
  );
};

const AccountsReceivableTable = ({ rows = [], loading = false }) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  const normalized = useMemo(() => {
    return safeRows.map((r, idx) => {
      const total = parseMoney(r?.totalAmount ?? r?.total ?? r?.sale?.totalAmount);
      const paid = parseMoney(r?.paidAmount ?? r?.paid ?? r?.sale?.paidAmount);
      const outstanding = Math.max(0, Number((total - paid).toFixed(2)));
      const { primary, secondary } = getCustomerDisplay(r);
      const st = getPaymentStatus(r);

      return {
        _key: r?.id ?? r?.saleId ?? `${idx}`,
        _row: r,
        saleCode: getSaleCode(r),
        customerPrimary: primary,
        customerSecondary: secondary,
        total,
        paid,
        outstanding,
        status: st,
        createdAt: r?.createdAt ?? r?.sale?.createdAt ?? null,
        updatedAt: r?.updatedAt ?? r?.sale?.updatedAt ?? null,
      };
    });
  }, [safeRows]);

  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 text-sm text-gray-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (!normalized.length) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="p-6 text-sm text-gray-600">ไม่พบรายการบิลค้าง</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-700">
              <th className="px-3 py-2 whitespace-nowrap">เลขบิล</th>
              <th className="px-3 py-2 whitespace-nowrap">ลูกค้า</th>
              <th className="px-3 py-2 whitespace-nowrap text-right">ยอดสุทธิ</th>
              <th className="px-3 py-2 whitespace-nowrap text-right">จ่ายแล้ว</th>
              <th className="px-3 py-2 whitespace-nowrap text-right">ยอดค้าง</th>
              <th className="px-3 py-2 whitespace-nowrap">สถานะ</th>
              <th className="px-3 py-2 whitespace-nowrap">อัปเดตล่าสุด</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {normalized.map((r) => (
              <tr key={String(r._key)} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs text-gray-800 whitespace-nowrap">
                  {safeStr(r.saleCode) || '-'}
                </td>

                <td className="px-3 py-2">
                  <div className="font-semibold text-gray-900">{safeStr(r.customerPrimary) || '-'}</div>
                  {r.customerSecondary ? (
                    <div className="text-xs text-gray-500">{safeStr(r.customerSecondary)}</div>
                  ) : null}
                </td>

                <td className="px-3 py-2 text-right font-semibold">{fmtMoney(r.total)}</td>
                <td className="px-3 py-2 text-right">{fmtMoney(r.paid)}</td>
                <td className="px-3 py-2 text-right font-extrabold text-red-700">{fmtMoney(r.outstanding)}</td>

                <td className="px-3 py-2 whitespace-nowrap">
                  <ToneBadge tone={r.status.tone}>{r.status.label}</ToneBadge>
                </td>

                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                  {fmtDateTime(r.updatedAt || r.createdAt) || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600 flex items-center justify-between">
        <div>ทั้งหมด {normalized.length.toLocaleString('th-TH')} รายการ</div>
        <div className="font-semibold">
          ยอดค้างรวม {fmtMoney(normalized.reduce((sum, r) => sum + (r.outstanding || 0), 0))} ฿
        </div>
      </div>
    </div>
  );
};

export default AccountsReceivableTable;





