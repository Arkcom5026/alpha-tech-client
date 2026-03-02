



// 📁 FILE: src/features/finance/components/CustomerCreditTable.jsx
// ✅ Production-grade table (minimal disruption)
// - Pure component (no API calls)
// - Defensive rendering
// - Default export

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

  // Prisma ล่าสุด: CustomerProfile ไม่มี phone แล้ว (global customer)
  // ✅ ใช้ taxId เป็น secondary/tertiary แทน และยังรองรับ legacy field จาก API ได้
  const taxId = c?.taxId || row?.taxId || '';
  const phoneLegacy = row?.customerPhone || '';

  // Prefer company if present
  const primary = company || name || '-';

  // Secondary priority: name (when company exists) else taxId else legacy phone
  const secondary = company && name ? name : (taxId || phoneLegacy || '');

  // Tertiary: show taxId/phone when we already show company + name
  const tertiary = company && name ? (taxId || phoneLegacy || '') : '';

  return { primary, secondary, tertiary };
};

const getCreditAmount = (row) => {
  // support multiple naming (BE may use different keys)
  // ✅ Primary for this module: outstandingCredit / outstandingAmount
  return parseMoney(
    row?.outstandingCredit ??
      row?.outstandingAmount ??
      row?.creditAmount ??
      row?.creditBalance ??
      row?.balance ??
      row?.outstandingCredit ??
      row?.outstanding ??
      row?.outstandingTotal ??
      row?.totalOutstanding ??
      row?.amountDue ??
      row?.debtAmount ??
      row?.arOutstanding ??
      row?.receivableAmount ??
      row?.customer?.outstandingCredit ??
      row?.customer?.outstandingAmount ??
      row?.customer?.creditAmount ??
      row?.customer?.creditBalance ??
      row?.customer?.outstandingCredit ??
      row?.customer?.outstandingAmount
  );
};

const getCreditLimit = (row) => {
  return parseMoney(
    row?.creditLimit ??
      row?.limit ??
      row?.customer?.creditLimit
  );
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

const getUtilTone = (used, limit) => {
  if (limit <= 0) return { tone: 'gray', label: 'ไม่จำกัด' };
  const pct = (used / limit) * 100;
  if (pct >= 90) return { tone: 'red', label: `ใช้ไป ${pct.toFixed(0)}%` };
  if (pct >= 70) return { tone: 'orange', label: `ใช้ไป ${pct.toFixed(0)}%` };
  return { tone: 'green', label: `ใช้ไป ${pct.toFixed(0)}%` };
};

const CustomerCreditTable = ({ rows = [], loading = false }) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  const normalized = useMemo(() => {
    return safeRows.map((r, idx) => {
      const { primary, secondary, tertiary } = getCustomerDisplay(r);
      const credit = getCreditAmount(r);
      const limit = getCreditLimit(r);
      const available = limit > 0 ? Math.max(0, Number((limit - credit).toFixed(2))) : null;
      const util = getUtilTone(credit, limit);

      return {
        _key: r?.customerId ?? r?.id ?? `${idx}`,
        customerPrimary: primary,
        customerSecondary: secondary,
        customerTertiary: tertiary,
        credit,
        limit,
        available,
        util,
        updatedAt: r?.updatedAt ?? r?.customer?.updatedAt ?? null,
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
        <div className="p-6 text-sm text-gray-600">ยังไม่มีข้อมูลเครดิตลูกค้า</div>
      </div>
    );
  }

  const totalCredit = normalized.reduce((sum, r) => sum + (r.credit || 0), 0);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-700">
              <th className="px-3 py-2 whitespace-nowrap">ลูกค้า</th>
              <th className="px-3 py-2 whitespace-nowrap text-right">ยอดเครดิตคงค้าง</th>
              <th className="px-3 py-2 whitespace-nowrap text-right">วงเงิน</th>
              <th className="px-3 py-2 whitespace-nowrap text-right">วงเงินคงเหลือ</th>
              <th className="px-3 py-2 whitespace-nowrap">สถานะวงเงิน</th>
              <th className="px-3 py-2 whitespace-nowrap">อัปเดตล่าสุด</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {normalized.map((r) => (
              <tr key={String(r._key)} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="font-semibold text-gray-900">{safeStr(r.customerPrimary) || '-'}</div>
                  {r.customerSecondary ? (
                    <div className="text-xs text-gray-500">{safeStr(r.customerSecondary)}</div>
                  ) : null}
                  {r.customerTertiary ? (
                    <div className="text-xs text-gray-500">{safeStr(r.customerTertiary)}</div>
                  ) : null}
                </td>

                <td className="px-3 py-2 text-right font-extrabold text-red-700">{fmtMoney(r.credit)}</td>

                <td className="px-3 py-2 text-right">
                  {r.limit > 0 ? fmtMoney(r.limit) : <span className="text-xs text-gray-500">ไม่จำกัด</span>}
                </td>

                <td className="px-3 py-2 text-right">
                  {r.limit > 0 ? fmtMoney(r.available) : <span className="text-xs text-gray-500">-</span>}
                </td>

                <td className="px-3 py-2 whitespace-nowrap">
                  <ToneBadge tone={r.util.tone}>{r.util.label}</ToneBadge>
                </td>

                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                  {fmtDateTime(r.updatedAt) || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600 flex items-center justify-between">
        <div>ทั้งหมด {normalized.length.toLocaleString('th-TH')} ราย</div>
        <div className="font-semibold">ยอดเครดิตคงค้างรวม {fmtMoney(totalCredit)} ฿</div>
      </div>
    </div>
  );
};

export default CustomerCreditTable;










