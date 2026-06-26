// ListCustomerDepositPage.jsx
// 🏛️ Premium Finance Influx: (Fixed Tenant Navigation, Glassmorphic Headers & Spring Physics Buttons)
import React, { useEffect } from 'react';
// 🟢 [IMPORT FIXED] เรียกใช้งาน useParams คุมรหัสพิกัดบริษัทคั่น URL
import { useNavigate, useParams } from 'react-router-dom';
import useCustomerDepositStore from '../store/customerDepositStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import { Plus, Banknote, Calendar, User, Phone, Wallet, Layers } from 'lucide-react';

const ListCustomerDepositPage = () => {
  // 🟢 [SLUG ACTIVATED] แกะคีย์ Dynamic Shop Slug ประจำหน้างานปัจจุบัน
  const { shopSlug } = useParams();
  const { deposits, fetchCustomerDepositsAction, cancelCustomerDepositAction } = useCustomerDepositStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerDepositsAction();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('คุณต้องการยกเลิกรายการนี้หรือไม่?')) {
      await cancelCustomerDepositAction(id);
    }
  };

  return (
    <div className="w-full h-full p-6 space-y-6 text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn">
      
      {/* 🟦 1. ส่วนหัวแผงควบคุมสไตล์ Glassmorphism ผสานปุ่ม Action เรืองแสง */}
      <div className="bg-white/80 border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 transition-all duration-300">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="w-5 h-5 text-orange-500" /> รายการเงินมัดจำของลูกค้า
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-bold tracking-wide">
            Customer Deposit Management • ตรวจสอบความถูกต้องสมดุลยอดเงินสด เงินโอน และบัญชีมัดจำกลางประจำสาขา
          </p>
        </div>

        {/* 🚀 BUTTON: ปุ่มกดรับเงินมัดจำแบบเด้งสู้เมาส์ Spring Physics หล่อล้ำยุค */}
        <button
          onClick={() => {
            const targetSlug = shopSlug || 'advancetech';
            navigate(`/${targetSlug}/pos/finance/deposit/create`);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm rounded-xl border border-orange-400/10 shadow-[0_4px_15px_rgba(249,115,22,0.2)] transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-orange-100" />
          <span>รับเงินมัดจำ</span>
        </button>
      </div>

      {/* 📊 2. แผงตารางประมวลผลโมเดิร์น ยกระดับจากขอบเทาแบนๆ สู่ความเนี๊ยบระดับสากล */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] p-3 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-black uppercase tracking-wider select-none">
                <th className="p-4 w-16 text-center">ลำดับ</th>
                <th className="p-4"><User className="w-3.5 h-3.5 inline mr-1" /> ลูกค้า</th>
                <th className="p-4"><Phone className="w-3.5 h-3.5 inline mr-1" /> เบอร์โทร</th>
                <th className="p-4 text-right">เงินสด</th>
                <th className="p-4 text-right">เงินโอน</th>
                <th className="p-4 text-right">บัตรเครดิต</th>
                <th className="p-4 text-right text-orange-600 font-black"><Wallet className="w-3.5 h-3.5 inline mr-1" /> รวมสุทธิ</th>
                <th className="p-4 text-center"><Calendar className="w-3.5 h-3.5 inline mr-1" /> วันที่</th>
                <th className="p-4 text-center"><Layers className="w-3.5 h-3.5 inline mr-1" /> จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-10 text-center text-slate-400 font-bold italic text-sm">
                    ยังไม่มีรายการบันทึกเงินมัดจำในระบบขณะนี้
                  </td>
                </tr>
              ) : (
                deposits.map((d, i) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                    <td className="p-4 text-center font-bold text-slate-400 text-xs">{i + 1}</td>
                    <td className="p-4 font-black text-slate-900 group-hover:text-orange-500 transition-colors">
                      {d.customer?.name || '-'}
                    </td>
                    <td className="p-4 font-bold text-slate-600">{d.customer?.phone || '-'}</td>
                    <td className="p-4 text-right font-medium text-slate-600 font-sans">{d.cashAmount.toLocaleString()}</td>
                    <td className="p-4 text-right font-medium text-slate-600 font-sans">{d.transferAmount.toLocaleString()}</td>
                    <td className="p-4 text-right font-medium text-slate-600 font-sans">{d.cardAmount.toLocaleString()}</td>
                    <td className="p-4 text-right font-black text-orange-600 font-sans text-base">
                      ฿{d.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center font-semibold text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex transform scale-90 origin-center">
                        <StandardActionButtons
                          onDelete={() => handleCancel(d.id)}
                          disableEdit
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ListCustomerDepositPage;