const money = (value) =>
  Number(value || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const customerTypeLabel = (type) => {
  if (type === 'ORGANIZATION') return 'นิติบุคคล';
  if (type === 'GOVERNMENT') return 'หน่วยงานรัฐ';
  return 'บุคคลทั่วไป';
};

const CustomerResultTable = ({
  customers,
  loading,
  scope,
  claimingId,
  onOpen,
  onClaim,
}) => {
  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-500">กำลังโหลดข้อมูลลูกค้า...</div>;
  }

  if (customers.length === 0) {
    return (
      <div className="m-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
        <p className="font-semibold text-slate-800">ไม่พบข้อมูลลูกค้า</p>
        <p className="mt-1 text-sm text-slate-500">
          {scope === 'UNASSIGNED'
            ? 'ขณะนี้ไม่มีลูกค้ากลางที่รอรับเข้าร้านตามเงื่อนไขค้นหา'
            : 'ลองเปลี่ยนคำค้นหา หรือเพิ่มลูกค้าใหม่จากหน้าขายสินค้า'}
        </p>
      </div>
    );
  }

  return (
    <div className="m-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-[900px] w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
          <tr>
            <th className="px-4 py-3">ลูกค้า</th>
            <th className="px-4 py-3">การติดต่อ</th>
            <th className="px-4 py-3">ประเภท</th>
            <th className="px-4 py-3 text-right">ยอดมัดจำ</th>
            <th className="px-4 py-3 text-right">หนี้คงค้าง</th>
            <th className="px-4 py-3 text-right">การจัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="font-semibold text-slate-900">
                  {customer.name || customer.companyName || `ลูกค้า #${customer.id}`}
                </div>
                {customer.companyName && customer.name ? (
                  <div className="text-xs text-slate-500">{customer.companyName}</div>
                ) : null}
                {customer.departmentName ? <div className="text-xs font-semibold text-teal-700">{customer.departmentName}</div> : null}
                {customer.taxId ? (
                  <div className="text-xs text-slate-500">เลขภาษี {customer.taxId}</div>
                ) : null}
              </td>
              <td className="px-4 py-3 text-slate-700">
                <div>{customer.phone || '-'}</div>
                <div className="text-xs text-slate-500">{customer.email || '-'}</div>
              </td>
              <td className="px-4 py-3 text-slate-700">{customerTypeLabel(customer.type)}</td>
              <td className="px-4 py-3 text-right font-medium text-slate-700">
                {money(customer.depositBalance)}
              </td>
              <td className="px-4 py-3 text-right font-medium text-slate-700">
                {money(customer.outstandingDebt)}
              </td>
              <td className="px-4 py-3 text-right">
                {scope === 'STORE' ? (
                  <button
                    type="button"
                    onClick={() => onOpen(customer)}
                    className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 font-semibold text-teal-900 hover:bg-teal-100"
                  >
                    ดูรายละเอียด
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={claimingId === customer.id}
                    onClick={() => onClaim(customer)}
                    className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-2 font-semibold text-emerald-900 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {claimingId === customer.id ? 'กำลังรับ...' : 'รับเป็นลูกค้าของร้าน'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerResultTable;
