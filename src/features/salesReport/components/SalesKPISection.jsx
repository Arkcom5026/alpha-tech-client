

/* =========================
   SalesKPISection.jsx
========================= */

export const salesKpiSectionMock = {
    cards: [
      {
        key: 'totalSales',
        label: 'ยอดขายรวม',
        value: 150500.75,
        valueType: 'currency',
        helper: '+12.4% จากช่วงก่อนหน้า',
        tone: 'blue',
      },
      {
        key: 'totalBills',
        label: 'จำนวนบิล',
        value: 128,
        valueType: 'number',
        helper: 'จำนวนรายการขายทั้งหมด',
        tone: 'emerald',
      },
      {
        key: 'avgPerBill',
        label: 'เฉลี่ยต่อบิล',
        value: 1175.79,
        valueType: 'currency',
        helper: 'ช่วยดูคุณภาพยอดขายต่อธุรกรรม',
        tone: 'violet',
      },
      {
        key: 'totalUnits',
        label: 'จำนวนชิ้นที่ขาย',
        value: 245,
        valueType: 'number',
        helper: 'รวมจำนวนสินค้าที่ขายออกทั้งหมด',
        tone: 'amber',
      },
    ],
  };
  
  const salesKpiToneClassMap = {
    blue: {
      badge: 'bg-blue-50 text-blue-700',
      accent: 'text-blue-600',
    },
    emerald: {
      badge: 'bg-emerald-50 text-emerald-700',
      accent: 'text-emerald-600',
    },
    violet: {
      badge: 'bg-violet-50 text-violet-700',
      accent: 'text-violet-600',
    },
    amber: {
      badge: 'bg-amber-50 text-amber-700',
      accent: 'text-amber-600',
    },
    orange: {
      badge: 'bg-orange-50 text-orange-700',
      accent: 'text-orange-600',
    },
    slate: {
      badge: 'bg-slate-100 text-slate-700',
      accent: 'text-slate-600',
    },
  };
  
  const formatKpiValue = (value, valueType) => {
    if (valueType === 'currency') return formatCurrency(value);
    if (valueType === 'percent') return `${formatNumber(value)}%`;
    return formatNumber(value);
  };
  
  export const SalesKPISection = ({
    cards = salesKpiSectionMock.cards,
    className = '',
  }) => {
    const safeCards = Array.isArray(cards) ? cards : [];
  
    if (safeCards.length === 0) {
      return (
        <section className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`.trim()}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">ยังไม่มีข้อมูล KPI สำหรับช่วงเวลานี้</p>
          </div>
        </section>
      );
    }
  
    return (
      <section className={className}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {safeCards.map((card) => {
            const tone = salesKpiToneClassMap[card?.tone] || salesKpiToneClassMap.slate;
  
            return (
              <article key={card?.key || card?.label} className={KPI_CARD_CLASS}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-500">{card?.label || '-'}</p>
                    <h2 className="mt-2 truncate text-2xl font-bold text-slate-900">
                      {formatKpiValue(card?.value || 0, card?.valueType)}
                    </h2>
                    <p className={`mt-2 text-sm font-medium ${tone.accent}`}>
                      {card?.helper || '-'}
                    </p>
                  </div>
  
                  <div className={`rounded-2xl px-3 py-2 text-xs font-semibold ${tone.badge}`}>
                    KPI
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };
  

  