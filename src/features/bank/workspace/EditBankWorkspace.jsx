// src/features/bank/pages/EditBankPage.jsx
// 🏛️ Premium Next-Gen POS Bank Settings Hub: (Edit Bank Form Hardened Edition)

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useBankStore from '@/features/bank/store/bankStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EditBankPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const bankId = Number(id);

  const { bankSaving, bankError, fetchBankByIdAction, updateBankAction } = useBankStore();

  const [form, setForm] = useState({ name: '', active: true });
  const [loading, setLoading] = useState(true);

  // 🟢 [DYNAMIC RELATIVE PATH]: คืนความสมบูรณ์ให้ปุ่มถอยกลับ ดึงจากวินโดว์ปัจจุบัน เพื่อสยบอาการลิงก์หลุดเลนหน้าร้าน
  const getListUrl = () => {
    const currentPath = window.location.pathname;
    return currentPath.substring(0, currentPath.indexOf(`/${id}/edit`));
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = await fetchBankByIdAction(bankId);
      if (mounted && data) {
        setForm({
          name: data.name || '',
          active: typeof data.active === 'boolean' ? data.active : true,
        });
      }
      if (mounted) setLoading(false);
    };
    if (bankId) load();
    return () => { mounted = false; };
  }, [bankId, fetchBankByIdAction]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.name.trim() === '') {
      return alert('กรุณาระบุชื่อธนาคาร');
    }
    try {
      await updateBankAction(bankId, form);
      navigate(getListUrl());
    } catch (err) {
      const msg = err?.response?.data?.message || 'บันทึกไม่สำเร็จ';
      alert(msg);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-xl mx-auto text-slate-800 antialiased font-semibold animate-fadeIn">
      
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-1">
            <Link to={getListUrl()} className="transition hover:text-slate-700">รายการธนาคาร</Link>
            <span>/</span>
            <span className="text-slate-700">แก้ไขข้อมูลสถาบัน</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">🏢 แก้ไขข้อมูลสถาบันธนาคาร</h1>
        </div>

        {loading ? (
          <div className="text-xs font-bold text-slate-400 p-6 text-center animate-pulse">⏳ กำลังสตรีมเรียกฐานข้อมูลเดิมของสถาบัน...</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="name" className="text-xs font-black text-slate-700">ชื่อสถาบันธนาคาร / รหัสเรียกย่อ *</Label>
                <Input 
                  id="name" 
                  value={form.name} 
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
                  className="h-9 text-xs font-bold rounded-xl bg-slate-50 focus:bg-white focus:border-slate-900 border-slate-200 shadow-inner"
                  required 
                />
              </div>
              
              <div className="flex items-center gap-2 h-9 border border-slate-100 bg-slate-50/50 rounded-xl px-3 select-none">
                <input 
                  id="active" 
                  type="checkbox" 
                  checked={!!form.active} 
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="rounded text-slate-900 cursor-pointer w-4 h-4"
                />
                <Label htmlFor="active" className="text-xs font-bold text-slate-600 cursor-pointer">เปิดระบบใช้งานปกติ</Label>
              </div>
            </div>

            {bankError && (
              <div className="bg-rose-50 border border-rose-100 p-2 rounded-lg text-xs font-bold text-rose-600">⚠️ {bankError}</div>
            )}

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 select-none">
              <Button type="button" variant="outline" onClick={() => navigate(getListUrl())} className="h-9 px-4 rounded-xl text-xs font-bold border-slate-200">
                ยกเลิกคำสั่ง
              </Button>
              <Button type="submit" disabled={bankSaving} className="h-9 px-5 rounded-xl text-xs font-black bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50">
                {bankSaving ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันอัปเดต'}
              </Button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}