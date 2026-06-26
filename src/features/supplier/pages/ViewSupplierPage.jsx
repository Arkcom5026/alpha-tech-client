// src/features/supplier/pages/ViewSupplierPage.jsx
// 🏛️ Enterprise Supplier Insight Terminal: (Pure Content Lens Hub)

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSupplierById } from '../api/supplierApi';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { ArrowLeft, Edit2, Shield, Landmark, CreditCard, Building2, User, Phone, Mail, FileText, MapPin } from 'lucide-react';

const ViewSupplierPage = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const targetSlug = shopSlug || 'advancetech';

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplierById(id);
        setSupplier(data);
      } catch (err) {
        console.error('❌ ไม่สามารถโหลดข้อมูลผู้ขายได้', err);
        setError('ไม่สามารถเรียกข้อมูลบริษัทคู่ค้าจากเซิร์ฟเวอร์ส่วนกลางได้');
      } finally {
        setLoading(false);
      }
    };

    if (id && selectedBranchId) fetchSupplier();
  }, [id, selectedBranchId]);

  if (!selectedBranchId) {
    return (
      <div className="text-center py-10 text-slate-400 font-black italic">
        📭 กรุณาทำเลือกสาขาของระบบผู้ดำเนินงานก่อนครับ
      </div>
    );
  }

  if (loading) return <div className="text-center py-12 font-bold text-slate-400 italic">⏳ กำลังเรียกถอดสลักข้อมูลพาร์ตเนอร์คู่ค้า...</div>;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 animate-fadeIn">
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-xs font-black flex items-center gap-1.5">
          <strong className="font-sans">เกิดข้อผิดพลาด:</strong> {error}
        </div>
      </div>
    );
  }

  if (!supplier || !supplier.name) {
    return <p className="text-center text-rose-600 font-bold py-10">❌ ข้อมูลไม่ครบถ้วน หรือไม่พบผู้ขายในทะเบียนคลัง</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 space-y-3 animate-fadeIn text-xs md:text-sm">
      
      {/* ส่วนหัวคุมสิทธิ์กะทัดรัด (Compact Control Header) */}
      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-900/5 rounded-lg text-slate-800">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black text-slate-900">{supplier.name}</h1>
            <p className="text-[11px] text-slate-400 font-medium">รหัสพาร์ตเนอร์ระบุตัวตนในคลังระบบ: #{id}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/${targetSlug}/pos/purchases/suppliers/edit/${id}`)}
            className="flex items-center gap-1 h-7 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-black transition-all shadow-sm"
          >
            <Edit2 className="w-3 h-3" />
            <span>แก้ไขข้อมูล</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/${targetSlug}/pos/purchases/suppliers`)}
            className="flex items-center gap-1 h-7 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-black transition-all shadow-sm"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>กลับหน้าทะเบียน</span>
          </button>
        </div>
      </div>

      {/* แผงเนื้อหารายละเอียดเชิงลึกแบบปราศจากปุ่มระเกะระกะ (Pure Visual Data Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* บล็อกข้อมูลทั่วไป */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <div className="pb-1 border-b border-slate-100 font-black text-slate-400 tracking-wider text-[10px] uppercase flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-800" /> ข้อมูลองค์กรพาร์ตเนอร์และการติดต่อ
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1"><User className="w-3 h-3" /> ชื่อผู้ติดต่อประสานงาน</span>
              <p className="text-slate-900 font-black pl-4">{supplier.contactPerson || '—'}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1"><Phone className="w-3 h-3" /> เบอร์โทรศัพท์ติดต่อ</span>
              <p className="text-slate-900 font-mono font-black pl-4">{supplier.phone}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1"><Mail className="w-3 h-3" /> อีเมลติดต่อ (Email)</span>
              <p className="text-slate-900 font-semibold pl-4">{supplier.email || '—'}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1"><FileText className="w-3 h-3" /> เลขประจำตัวผู้เสียภาษี</span>
              <p className="text-slate-900 font-mono font-black pl-4">{supplier.taxId || '—'}</p>
            </div>
            <div className="sm:col-span-2 space-y-0.5">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1"><MapPin className="w-3 h-3" /> ที่อยู่สำนักงานและโรงงานผลิต</span>
              <p className="text-slate-800 font-semibold pl-4 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-2 border border-slate-100 rounded-lg">{supplier.address || '—'}</p>
            </div>
          </div>
        </div>

        {/* บล็อกข้อมูลเครดิตและการเงิน */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="pb-1 border-b border-slate-100 font-black text-slate-400 tracking-wider text-[10px] uppercase flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-800" /> ข้อตกลงเครดิตและการชำระเงิน
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50/60 border border-slate-200/50 p-2 rounded-lg">
                <span className="block text-[10px] font-bold text-slate-400 mb-0.5">วงเงินเครดิตสูงสุด:</span>
                <span className="font-mono font-black text-slate-900 text-sm">{supplier.creditLimit ? supplier.creditLimit.toLocaleString() : '0'} <span className="text-xs font-sans text-slate-400">฿</span></span>
              </div>
              <div className="bg-slate-50/60 border border-slate-200/50 p-2 rounded-lg">
                <span className="block text-[10px] font-bold text-slate-400 mb-0.5">ระยะเวลาเครดิตรอบดิว:</span>
                <span className="font-mono font-black text-orange-600 text-sm">{supplier.paymentTerms || 0} <span className="text-xs font-sans text-slate-400">วัน</span></span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="pb-1 border-b border-slate-100 font-black text-slate-400 tracking-wider text-[10px] uppercase flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-slate-800" /> ข้อมูลธุรกรรมธนาคาร
              </div>
              <div className="text-[11px] font-bold text-slate-500 space-y-1 pl-1">
                <p>เลขที่บัญชี: <span className="font-mono font-black text-slate-900">{supplier.accountNumber || '—'}</span></p>
                <p>ประเภทบัญชี: <span className="text-slate-800">{supplier.accountType || '—'}</span></p>
              </div>
            </div>
          </div>

          <div className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5 opacity-80 pt-2 border-t border-slate-100 select-none">
            <Shield className="w-3 h-3 text-slate-400" /> ข้อมูลได้รับการคุ้มครองสิทธิ์ระดับองค์กรส่วนกลาง
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewSupplierPage;