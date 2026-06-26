// src/features/supplier/components/SupplierForm.jsx
// 🏛️ Enterprise Supplier Onboarding Center: (Clean Visual Hierarchy & Seamless Context Edition)

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { getAllBanks } from '@/features/bank/api/bankApi';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { Building2, User, Phone, Mail, FileText, MapPin, Landmark, CreditCard, AlertCircle } from 'lucide-react';

const SupplierForm = ({ defaultValues = {}, onSubmit, isEdit = false, showCreditFields = false }) => {
  const [banks, setBanks] = useState([]);
  const [internalDefaults, setInternalDefaults] = useState(defaultValues || null);
  const [formSynced, setFormSynced] = useState(false);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: {} });

  useEffect(() => {
    if (internalDefaults && Object.keys(internalDefaults).length > 0 && banks.length > 0 && !formSynced) {
      reset({ ...internalDefaults });
      setFormSynced(true);
    }
  }, [internalDefaults, banks, reset, formSynced]);

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const data = await getAllBanks();
        setBanks(data);
        setInternalDefaults(defaultValues || null);
        setFormSynced(false);
      } catch (err) {
        console.error('❌ โหลดธนาคารล้มเหลว', err);
      }
    };
    loadBanks();
  }, [defaultValues]);

  return (
    <div className="w-full bg-white p-5 md:p-6 rounded-xl animate-fadeIn text-xs md:text-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" value={selectedBranchId || ''} {...register('branchId')} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          
          {/* 🟦 หมวดหมู่ที่ 1: ข้อมูลบริษัทและการติดต่อหลัก */}
          <div className="md:col-span-2 pb-1 border-b border-slate-100 flex items-center gap-1.5 text-slate-400 select-none">
            <Building2 className="w-4 h-4 text-slate-900" />
            <span className="font-black tracking-wide uppercase text-[10px]">ข้อมูลระบุตัวตนและรายละเอียดคู่ค้า</span>
          </div>

          <div className="space-y-1">
            <label className="block font-black text-slate-700">
              ชื่อผู้ขาย / บริษัทคู่ค้า <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ระบุชื่อร้านค้าหรือชื่อบริษัท..."
                {...register('name', { required: 'กรุณาระบุชื่อผู้ขายเพื่อบันทึกคลัง' })}
                className="h-8 pl-8 pr-3 font-semibold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all"
              />
            </div>
            {errors.name && (
              <p className="text-rose-600 text-[10px] font-black flex items-center gap-0.5 animate-fadeIn">
                <AlertCircle className="w-3 h-3" /> {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block font-black text-slate-700">ชื่อผู้ติดต่อประสานงาน</label>
            <div className="relative">
              <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="เช่น ผู้จัดการฝ่ายขาย, คุณสมชาย..."
                {...register('contactPerson')}
                className="h-8 pl-8 pr-3 font-semibold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-black text-slate-700">
              เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="เช่น 02-XXX-XXXX หรือ 081-XXX-XXXX"
                {...register('phone', { required: 'กรุณาระบุเบอร์โทรศัพท์ติดต่อ' })}
                className="h-8 pl-8 pr-3 font-mono font-semibold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all"
              />
            </div>
            {errors.phone && (
              <p className="text-rose-600 text-[10px] font-black flex items-center gap-0.5 animate-fadeIn">
                <AlertCircle className="w-3 h-3" /> {errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block font-black text-slate-700">อีเมล (Email)</label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                placeholder="example@supplier.com"
                {...register('email')}
                className="h-8 pl-8 pr-3 font-semibold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-black text-slate-700">เลขประจำตัวผู้เสียภาษี</label>
            <div className="relative">
              <FileText className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ระบุเลขผู้เสียภาษี 13 หลัก..."
                {...register('taxId')}
                className="h-8 pl-8 pr-3 font-mono font-semibold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-black text-slate-700">จังหวัด</label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ระบุจังหวัด..."
                {...register('province')}
                className="h-8 pl-8 pr-3 font-semibold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-black text-slate-700">รหัสไปรษณีย์</label>
            <input
              type="text"
              placeholder="เช่น 10000"
              {...register('postalCode')}
              className="h-8 px-2.5 font-mono font-semibold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-black text-slate-700">ประเทศ</label>
            <input
              type="text"
              {...register('country')}
              className="h-8 px-2.5 font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg outline-none w-full select-none"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="block font-black text-slate-700">ที่อยู่สำนักงาน / โรงงานผู้ผลิต</label>
            <textarea
              rows={2}
              placeholder="ระบุที่อยู่ เลขที่ อาคาร ถนน ตำบล อำเภอ..."
              {...register('address')}
              className="p-2 text-xs font-semibold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all resize-none font-sans"
            />
          </div>

          {/* 🟦 หมวดหมู่ที่ 2: ข้อมูลบัญชีธนาคารเพื่อการชำระเงิน */}
          <div className="md:col-span-2 pb-1 border-b border-slate-100 pt-2 flex items-center gap-1.5 text-slate-400 select-none">
            <Landmark className="w-4 h-4 text-slate-900" />
            <span className="font-black tracking-wide uppercase text-[10px]">รายละเอียดบัญชีธนาคารเพื่อธุรกรรมการเงิน</span>
          </div>

          <div className="space-y-1">
            <label className="block font-black text-slate-700">ธนาคารพาณิชย์</label>
            <div className="relative">
              <Landmark className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <select
                {...register('bankId')}
                className="h-8 pl-8 pr-8 text-xs font-black bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all appearance-none cursor-pointer"
              >
                <option value="">-- เลือกธนาคารผู้โอน --</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id.toString()}>{bank.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                ▼
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-black text-slate-700">เลขที่บัญชีธนาคาร</label>
            <input
              type="text"
              placeholder="ระบุเลขบัญชีรับเงินโอน..."
              {...register('accountNumber')}
              className="h-8 px-2.5 font-mono font-semibold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-black text-slate-700">ประเภทบัญชีเงินฝาก</label>
            <input
              type="text"
              placeholder="เช่น ออมทรัพย์, กระแสรายวัน..."
              {...register('accountType')}
              className="h-8 px-2.5 font-semibold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all"
            />
          </div>

          <div className="hidden md:block"></div>

          {/* 🟦 หมวดหมู่ที่ 3: วงเงินเครดิตทางการค้า */}
          {showCreditFields && (
            <>
              <div className="md:col-span-2 pb-1 border-b border-slate-100 pt-2 flex items-center gap-1.5 text-slate-400 select-none">
                <CreditCard className="w-4 h-4 text-slate-900" />
                <span className="font-black tracking-wide uppercase text-[10px]">การควบคุมวงเงินเครดิตและข้อตกลงรอบดิว</span>
              </div>

              <div className="space-y-1">
                <label className="block font-black text-slate-700">วงเงินเครดิตสูงสุด (บาท)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  {...register('creditLimit', { valueAsNumber: true, min: 0 })}
                  className="h-8 px-2.5 font-mono font-bold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-black text-slate-400 select-none">ยอดหนี้ผูกพันปัจจุบัน (บาท)</label>
                <input
                  type="number"
                  disabled
                  {...register('creditBalance')}
                  className="h-8 px-2.5 font-mono font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg outline-none w-full select-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-black text-slate-700">ระยะเวลาผ่อนชำระเครดิตดิว (วัน)</label>
                <input
                  type="number"
                  placeholder="เช่น 30, 45, 60 วัน"
                  {...register('paymentTerms', { valueAsNumber: true, min: 0 })}
                  className="h-8 px-2.5 font-mono font-bold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all"
                />
              </div>

              <div className="hidden md:block"></div>

              <div className="md:col-span-2 space-y-1">
                <label className="block font-black text-slate-700">หมายเหตุและเงื่อนไขพิเศษทางการค้า</label>
                <textarea
                  rows={2}
                  placeholder="ระบุข้อตกลงเพิ่มเติม..."
                  {...register('notes')}
                  className="p-2 text-xs font-semibold text-slate-900 bg-slate-50/50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none w-full transition-all resize-none font-sans"
                />
              </div>
            </>
          )}

        </div>

        <Button 
          type="submit" 
          className="h-9 w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-lg active:scale-[0.99] transition-all shadow-md select-none mt-6"
        >
          {isEdit ? 'บันทึกปรับปรุงข้อมูลผู้ขาย' : 'ยืนยันลงทะเบียนเพิ่มผู้ขาย'}
        </Button>
      </form>
    </div>
  );
};

export default SupplierForm;