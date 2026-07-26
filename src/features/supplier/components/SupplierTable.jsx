// src/features/supplier/components/SupplierTable.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CrudTableAction, CrudTableActions } from '@/design-system';

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const SupplierTable = ({ suppliers = [], startIndex = 0, disabled = false }) => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const targetSlug = shopSlug || 'advancetech';

  const openSupplier = (supplier) => {
    if (disabled) return;
    navigate(`/${targetSlug}/pos/purchases/suppliers/view/${supplier.id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-[hsl(var(--ads-border-default))] bg-[hsl(var(--ads-surface-subtle))] text-left text-[hsl(var(--ads-text-muted))]">
          <tr>
            <th className="w-16 px-4 py-3 text-center font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">ชื่อผู้ขาย / บริษัทคู่ค้า</th>
            <th className="w-40 px-4 py-3 font-semibold">เบอร์โทรศัพท์</th>
            <th className="w-56 px-4 py-3 font-semibold">อีเมล</th>
            <th className="w-40 px-4 py-3 text-right font-semibold">วงเงินเครดิต</th>
            <th className="w-40 px-4 py-3 text-right font-semibold">ยอดหนี้ปัจจุบัน</th>
            <th className="w-28 px-4 py-3 text-center font-semibold">เครดิต</th>
            <th className="w-32 px-4 py-3 text-right font-semibold">การจัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--ads-border-default))]">
          {suppliers.map((supplier, index) => (
            <tr key={supplier.id} className="hover:bg-[hsl(var(--ads-surface-subtle))]">
              <td className="px-4 py-3 text-center text-[hsl(var(--ads-text-muted))]">
                {startIndex + index + 1}
              </td>
              <td className="px-4 py-3 font-semibold text-[hsl(var(--ads-text-strong))]">
                {supplier.name || '—'}
              </td>
              <td className="px-4 py-3">{supplier.phone || '—'}</td>
              <td className="max-w-56 truncate px-4 py-3" title={supplier.email || undefined}>
                {supplier.email || '—'}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">฿{formatMoney(supplier.creditLimit)}</td>
              <td className="px-4 py-3 text-right tabular-nums">฿{formatMoney(supplier.creditBalance)}</td>
              <td className="px-4 py-3 text-center">{Number(supplier.paymentTerms || 0)} วัน</td>
              <td className="px-4 py-3">
                <CrudTableActions>
                  <CrudTableAction action="view" onClick={() => openSupplier(supplier)} disabled={disabled}>
                    ดูข้อมูล
                  </CrudTableAction>
                </CrudTableActions>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;
