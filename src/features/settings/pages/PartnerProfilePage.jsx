// 📁 FILE: src/features/settings/pages/PartnerProfilePage.jsx
// ✅ Production-grade (Partner Profile Management Engine)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Store, Save, ShieldCheck, Mail, Phone, Globe, MessageSquare, Image, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PartnerProfilePage = () => {
  const { shopSlug } = useParams(); // สแกนจับชื่อย่อแบรนด์บนเลน URL
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // 📥 ม็อคอัพสถานีโหลดข้อมูลพาร์ตเนอร์ (ในเฟสจริงกัปตันเชื่อมเปลี่ยนเป็นดึงจาก custom hook หรือ store ได้เลยครับ)
  useEffect(() => {
    setLoading(true);
    // แสร้งดึงข้อมูลจำลองจาก API มิติคู่ขนานตามรหัสร้านค้า
    setTimeout(() => {
      setValue('shopName', 'บริษัท แอดวานซ์ เทค บรรพต จำกัด');
      setValue('slogan', 'Saduaksabuy SaaS Engine • ระบบจัดการหลังร้านภาพรวม');
      setValue('email', 'contact@advancetech.co.th');
      setValue('phone', '056350035');
      setValue('website', 'www.advancetech.co.th');
      setValue('lineId', '@advancetech');
      setValue('taxId', '0105563000123');
      setValue('package', 'SaaS Premium Enterprise');
      setValue('logoUrl', '');
      setLoading(false);
    }, 600);
  }, [setValue, shopSlug]);

  // 💾 บันทึกการอัปเดตข้อมูลติดต่อหน้าร้าน
  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);
    try {
      console.log('💾 Saving Partner Profile Payload:', data);
      // ยิงท่อส่งข้อมูลอัปเดตไปหลังบ้าน...
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
      alert('✅ บันทึกข้อมูลโปรไฟล์ร้านค้าเรียบร้อยแล้ว');
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !success) {
    return (
      <div className="w-full mt-4 p-12 text-center text-zinc-500 font-medium bg-white dark:bg-zinc-900 border rounded-xl shadow-sm flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
        <span>กำลังดึงข้อมูลโปรไฟล์แบรนด์พาร์ตเนอร์จาก Cloud Storage...</span>
      </div>
    );
  }

  return (
    <div className="w-full mt-4 animate-fadeIn space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
        
        {/* 💳 HEADER BLOCK */}
        <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">โปรไฟล์ข้อมูลพาร์ตเนอร์ร้านค้า</h1>
              <p className="text-[11px] text-zinc-400 font-medium">จัดการโปรไฟล์แบรนด์ ข้อมูลติดต่อหน้าร้าน และเอกสารระบุพิกัดสิทธิ์ Multi-Tenant</p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
          </Button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/*  왼쪽: BRAND LOGO / SUBSCRIPTION CARD */}
          <div className="space-y-4">
            <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20 rounded-2xl p-5 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 gap-1 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition cursor-pointer relative group">
                <Image className="w-6 h-6 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                <span className="text-[10px] font-medium px-2">อัปโหลดโลโก้</span>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">แบรนด์พาร์ตเนอร์ส่วนกลาง</h3>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20">
                  <ShieldCheck className="w-3 h-3" /> Slug ID: {shopSlug}
                </div>
              </div>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-800/10 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">สถานะกรรมสิทธิ์ SaaS</h4>
              <div>
                <label className="block text-[11px] text-zinc-400">แพ็คเกจบริการ (SaaS Tier)</label>
                <input 
                  type="text" 
                  {...register('package')} 
                  disabled 
                  className="w-full mt-1 border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 text-zinc-500 rounded px-3 py-1.5 text-xs font-semibold focus:outline-none cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                <input 
                  type="text" 
                  {...register('taxId')} 
                  disabled 
                  className="w-full mt-1 border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 text-zinc-500 rounded px-3 py-1.5 text-xs font-mono focus:outline-none cursor-not-allowed" 
                />
              </div>
            </div>
          </div>

          {/* 오른쪽: PROFILE EDIT FORM FIELDS */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">ชื่อร้านค้า / พาร์ตเนอร์ (แบรนด์หลัก)</label>
                <input 
                  type="text" 
                  {...register('shopName', { required: 'กรุณากรอกชื่อร้านค้า' })} 
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none" 
                />
                {errors.shopName && <p className="text-xs text-red-500 mt-1">{errors.shopName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">สโลแกนร้าน / คำอธิบายบิลใบเสร็จย่อย</label>
                <textarea 
                  rows={2}
                  {...register('slogan')} 
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 font-medium leading-relaxed focus:ring-1 focus:ring-blue-500 focus:outline-none" 
                  placeholder="คำอธิบายสโลแกนจะนำไปประดับท้ายบิลใบเสร็จหน้าร้าน..."
                />
              </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800 my-2" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">ช่องทางการติดต่อหน้าร้านและการสื่อสาร (Contact Specification)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" /> เบอร์โทรศัพท์ซัพพอร์ต
                </label>
                <input 
                  type="text" 
                  {...register('phone')} 
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" /> อีเมลกลางพาร์ตเนอร์
                </label>
                <input 
                  type="email" 
                  {...register('email')} 
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" /> เว็บไซต์ร้านค้า (ถ้ามี)
                </label>
                <input 
                  type="text" 
                  {...register('website')} 
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> LINE ID / ช่องทางติดต่อโซเชียล
                </label>
                <input 
                  type="text" 
                  {...register('lineId')} 
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
};

export default PartnerProfilePage;