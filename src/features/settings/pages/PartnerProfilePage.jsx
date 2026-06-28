// 📁 FILE: src/features/settings/pages/PartnerProfilePage.jsx
// ✅ Production-grade (Partner Profile Management Engine)
// 🎨 Minimal Platinum Light Mode Edition (User Feedback Optimized — Clear Reading Text)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Store, Save, ShieldCheck, Mail, Phone, Globe, MessageSquare, Image, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/utils/apiClient'; // 🟢 เชื่อมต่อตัวรับส่งสัญญาณสิทธิ์พอร์ต 5000 ส่วนกลาง

const PartnerProfilePage = () => {
  const { shopSlug } = useParams(); // สแกนจับชื่อย่อแบรนด์บนเลน URL 
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // 📥 1. ท่อเรียกข้อมูลจริงจากฐานข้อมูลหลังบ้าน (Fetch Real Data Layer)
  useEffect(() => {
    if (!shopSlug) return;
    
    const fetchPartnerProfile = async () => {
      setLoading(true);
      try {
        // ยิงหา Endpoint โปรไฟล์สาขาของระบบ Multi-Tenant
        const res = await apiClient.get(`/branch-prices/profile-by-slug/${shopSlug}`);
        const profile = res?.data;

        if (profile) {
          setValue('shopName', profile.name || '');
          setValue('slogan', profile.slogan || '');
          setValue('email', profile.email || '');
          setValue('phone', profile.phone || '');
          setValue('website', profile.website || '');
          setValue('lineId', profile.lineId || '');
          setValue('taxId', profile.taxId || '');
          setValue('package', profile.package || 'SaaS Premium Enterprise');
        }
      } catch (err) {
        console.error('❌ [PartnerProfile] Fetching Data Failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerProfile();
  }, [setValue, shopSlug]);

  // 💾 2. ท่อส่งบันทึกข้อมูลชุดอัปเดตกลับฐานข้อมูลจริง (Submit Real Payload Layer)
  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);
    try {
      console.log('💾 Saving Partner Profile Payload:', data);
      
      // ยิงคำสั่ง PUT อัปเดตข้อมูลแบรนด์ตรงไปที่หลังบ้าน
      await apiClient.put(`/branch-prices/profile-by-slug/${shopSlug}`, {
        name: data.shopName.trim(),
        slogan: data.slogan?.trim(),
        phone: data.phone?.trim(),
        email: data.email?.trim().toLowerCase(),
        website: data.website?.trim(),
        lineId: data.lineId?.trim(),
      });

      setSuccess(true);
      alert('✅ บันทึกข้อมูลโปรไฟล์ร้านค้าเรียบร้อยแล้ว');
    } catch (err) {
      console.error('❌ [PartnerProfile] Saving Data Failed:', err);
      alert(err?.response?.data?.message || '❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !success) {
    return (
      <div className="w-full mt-4 p-12 text-center text-slate-400 font-bold italic bg-white border border-slate-200 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center gap-2 font-sans">
        <RefreshCw className="w-6 h-6 text-orange-600 animate-spin" />
        <span>กำลังติดต่อฐานข้อมูล เพื่อดึงโปรไฟล์แบรนด์พาร์ตเนอร์รายสาขา...</span>
      </div>
    );
  }

  return (
    <div className="w-full mt-4 animate-fadeIn space-y-6 font-sans text-slate-800">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-white border border-slate-200 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] overflow-hidden">
        
        {/* 💳 CARD HEADER BLOCK */}
        <div className="px-5 py-4 border-b border-slate-100 bg-white sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 border border-orange-100 text-orange-600 rounded-xl shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight">โปรไฟล์ข้อมูลพาร์ตเนอร์ร้านค้า</h1>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">จัดการโปรไฟล์แบรนด์ ข้อมูลติดต่อหน้าร้าน และเอกสารระเบียบสิทธิ์ Multi-Tenant</p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-b from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition border border-orange-400/10 active:scale-95 transform"
          >
            <Save className="w-3.5 h-3.5 text-orange-100" />
            {loading ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์ร้านค้า'}
          </Button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 📂 ฝั่งซ้าย: BRAND LOGO / SUBSCRIPTION CARD CONTAINER */}
          <div className="space-y-4">
            <div className="border border-slate-200/60 bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-1 hover:bg-slate-50 transition cursor-pointer relative group shadow-inner">
                <Image className="w-6 h-6 text-slate-300 group-hover:text-slate-400 transition-colors" />
                <span className="text-[10px] font-black px-2 text-slate-400">อัปโหลดโลโก้</span>
              </div>
              
              <div className="mt-4 select-none">
                <h3 className="text-sm font-black text-slate-900">แบรนด์พาร์ตเนอร์ส่วนกลาง</h3>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-orange-50 border border-orange-200/50 px-2.5 py-0.5 text-[11px] font-black text-orange-700">
                  <ShieldCheck className="w-3 h-3 text-orange-500" /> Slug Tenant ID: {shopSlug}
                </div>
              </div>
            </div>

            <div className="border border-slate-200/60 bg-slate-50/30 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider select-none">สถานะกรรมสิทธิ์ระบบ SaaS</h4>
              <div>
                <label className="block text-[11px] text-slate-400 font-bold select-none">แพ็คเกจบริการหลัก (SaaS Tier)</label>
                <input 
                  type="text" 
                  {...register('package')} 
                  disabled 
                  className="w-full mt-1 border border-slate-200 bg-slate-100/80 text-slate-500 font-bold rounded-lg px-3 py-1.5 text-xs focus:outline-none cursor-not-allowed shadow-inner" 
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 font-bold select-none">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                <input 
                  type="text" 
                  {...register('taxId')} 
                  disabled 
                  className="w-full mt-1 border border-slate-200 bg-slate-100/80 text-slate-500 font-mono font-black rounded-lg px-3 py-1.5 text-xs focus:outline-none cursor-not-allowed shadow-inner" 
                />
              </div>
            </div>
          </div>

          {/* 📝 ฝั่งขวา: PROFILE EDIT FORM FIELDS (ความคมชัดสูง อ่านง่ายกริบ) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1 select-none">ชื่อร้านค้า / แบรนด์หลัก (พาร์ตเนอร์พอร์ตสากล)</label>
                <input 
                  type="text" 
                  {...register('shopName', { required: 'กรุณากรอกชื่อร้านค้า' })} 
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl px-3 py-2 text-sm text-slate-900 font-black focus:border-orange-500/60 focus:outline-none transition-all shadow-inner" 
                />
                {errors.shopName && <p className="text-xs text-red-500 mt-1 font-bold">{errors.shopName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1 select-none">สโลแกนร้าน / ข้อความประดับคำอธิบายท้ายบิลใบเสร็จ</label>
                <textarea 
                  rows={2}
                  {...register('slogan')} 
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-800 font-bold leading-relaxed focus:border-orange-500/60 focus:outline-none transition-all shadow-inner resize-none" 
                  placeholder="ข้อความสโลแกนตรงนี้จะถูกนำไปพิมพ์แสดงที่ท้ายบิลใบเสร็จรับเงินประจำร้าน..."
                />
              </div>
            </div>

            <hr className="border-slate-100 my-2" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider select-none">ช่องทางการติดต่อและระบบสื่อสารองค์กร (Contact Specification)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 mb-1 flex items-center gap-1.5 select-none">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> เบอร์โทรศัพท์ฝ่ายสนับสนุน
                </label>
                <input 
                  type="text" 
                  {...register('phone')} 
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-black focus:border-orange-500/60 focus:outline-none transition-all shadow-inner" 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 mb-1 flex items-center gap-1.5 select-none">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> อีเมลกลางแบรนด์พาร์ตเนอร์
                </label>
                <input 
                  type="email" 
                  {...register('email')} 
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-black focus:border-orange-500/60 focus:outline-none transition-all shadow-inner" 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 mb-1 flex items-center gap-1.5 select-none">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> เว็บไซต์หน้าร้านหลัก (URL)
                </label>
                <input 
                  type="text" 
                  {...register('website')} 
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-black focus:border-orange-500/60 focus:outline-none transition-all shadow-inner" 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 mb-1 flex items-center gap-1.5 select-none">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> LINE ID / ช่องทางติดต่อโซเชียล
                </label>
                <input 
                  type="text" 
                  {...register('lineId')} 
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:border-orange-500/60 focus:outline-none transition-all shadow-inner" 
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