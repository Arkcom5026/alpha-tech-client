

/* =========================
   SalesChartSection.jsx
========================= */

export const salesChartSectionMock = {
    title: 'แนวโน้มยอดขาย 7 วันล่าสุด',
    subtitle: 'ใช้ดูทิศทางยอดขายแบบเร็ว และเป็นฐานสำหรับเชื่อม chart จริงในขั้นถัดไป',
    points: [
      { label: 'จ.', amount: 12450 },
      { label: 'อ.', amount: 15800 },
      { label: 'พ.', amount: 11990 },
      { label: 'พฤ.', amount: 17650 },
      { label: 'ศ.', amount: 18900 },
      { label: 'ส.', amount: 22100 },
      { label: 'อา.', amount: 16480 },
    ],
  };
  
  export const SalesChartSection = ({
    title = salesChartSectionMock.title,
    subtitle = salesChartSectionMock.subtitle,
    points = salesChartSectionMock.points,
    onViewMore,
  }) => {
    const safePoints = Array.isArray(points) ? points : [];
    const maxAmount = Math.max(...safePoints.map((item) => Number(item?.amount || 0)), 1);
    const totalAmount = safePoints.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
    const averageAmount = safePoints.length > 0 ? totalAmount / safePoints.length : 0;
    const highestPoint =
      safePoints.length > 0
        ? safePoints.reduce((best, current) =>
            Number(current?.amount || 0) > Number(best?.amount || 0) ? current : best
          )
        : null;
    const lowestPoint =
      safePoints.length > 0
        ? safePoints.reduce((best, current) =>
            Number(current?.amount || 0) < Number(best?.amount || 0) ? current : best
          )
        : null;
  
    if (safePoints.length === 0) {
      return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>
  
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">ยังไม่มีข้อมูลกราฟในช่วงเวลานี้</p>
          </div>
        </section>
      );
    }
  
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
  
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ยอดรวม</p>
              <p className="mt-1 text-base font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">เฉลี่ย</p>
              <p className="mt-1 text-base font-bold text-slate-900">{formatCurrency(averageAmount)}</p>
            </div>
            {typeof onViewMore === 'function' ? (
              <button
                type="button"
                onClick={onViewMore}
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ดูเพิ่ม
              </button>
            ) : null}
          </div>
        </div>
  
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_320px]">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex h-80 items-end gap-3">
              {safePoints.map((item) => {
                const amount = Number(item?.amount || 0);
                const heightPercent = Math.max((amount / maxAmount) * 100, 8);
  
                return (
                  <div key={`${item.label}-${amount}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className="text-xs font-medium text-slate-500">{formatNumber(amount)}</div>
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-2xl bg-blue-600 transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                        title={`${item.label}: ${formatCurrency(amount)}`}
                      />
                    </div>
                    <div className="text-xs font-semibold text-slate-600">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
  
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">วันที่ยอดขายสูงสุด</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{highestPoint?.label || '-'}</p>
              <p className="mt-1 text-sm text-emerald-600">{formatCurrency(highestPoint?.amount || 0)}</p>
            </div>
  
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">วันที่ยอดขายต่ำสุด</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{lowestPoint?.label || '-'}</p>
              <p className="mt-1 text-sm text-amber-600">{formatCurrency(lowestPoint?.amount || 0)}</p>
            </div>
  
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">สรุปเชิงใช้งาน</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• ใช้ดูแนวโน้มยอดขายขึ้นหรือลงในช่วงสั้น</li>
                <li>• ใช้เทียบกับสินค้า top sellers และใบสั่งซื้อค้างรับ</li>
                <li>• เหมาะสำหรับต่อยอดเป็น daily / hourly / monthly chart จริง</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  