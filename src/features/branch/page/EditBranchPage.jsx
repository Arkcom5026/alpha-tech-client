// src/features/brand/pages/EditBrandPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PageHeader from '@/components/shared/layout/PageHeader';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

// สมมติว่าโปรเจกต์ใช้โครงสร้าง Store หรือ Action ประมาณนี้ (กัปตันปรับให้ตรงกับแอปจริงได้เลยครับ)
import useBrandStore from '../store/brandStore'; 

const EditBrandPage = () => {
  // 🟢 แกะรหัส shopSlug ร่วมกับ id จาก useParams เพื่อรองรับระบบราง Multi-Tenant
  const { shopSlug, id } = useParams();
  const navigate = useNavigate();
  
  const LIST_PATH = `/${shopSlug}/pos/stock/brands`;

  const { 
    getBrandByIdAction, 
    updateBrandAction, 
    toggleBrandActiveAction,
    clearErrorAction 
  } = useBrandStore();

  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const loadBrand = async () => {
      try {
        setLoading(true);
        const data = await getBrandByIdAction(Number(id));
        if (!data) {
          navigate(LIST_PATH);
          return;
        }
        setExisting(data);
        reset({
          name: data.name || '',
          description: data.description || ''
        });
      } catch (err) {
        console.error('❌ โหลดข้อมูลแบรนด์ล้มเหลว:', err);
        setErrorMessage('ไม่สามารถโหลดข้อมูลแบรนด์สินค้าได้');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadBrand();
  }, [id, getBrandByIdAction, reset]);

  const onSubmitForm = async (formData) => {
    try {
      setSaving(true);
      setErrorMessage('');
      await updateBrandAction(Number(id), {
        name: formData.name?.trim(),
        description: formData.description?.trim()
      });
      navigate(LIST_PATH);
    } catch (err) {
      console.error('❌ updateBrandAction error', err);
      setErrorMessage('บันทึกการเปลี่ยนแปลงไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  // 🟢 [BUG FIX RETURNED] เสียบฟังก์ชันสลับสถานะเปิด/ปิดที่ล้าง Syntax แหว่งออก เรียบเนียน 100%
  const onToggle = async () => {
    if (!existing?.id) return;

    try {
      setSaving(true);
      setErrorMessage('');
      clearErrorAction?.();
      
      await toggleBrandActiveAction({ 
        id: existing.id, 
        isActive: !existing.isActive 
      });
      
      setExisting(prev => ({ ...prev, isActive: !prev.isActive }));
    } catch (err) {
      console.error('❌ toggleBrandActiveAction error', err);
      setErrorMessage('ไม่สามารถสลับสถานะเปิด/ปิดใช้งานได้');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-center">กำลังโหลดข้อมูลแบรนด์...</div>;

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-xl space-y-4">
        <PageHeader title={`✏️ แก้ไขแบรนด์สินค้า #${id}`} />

        {errorMessage && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 text-center">
            {errorMessage}
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 border shadow-sm rounded-xl p-6">
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                ชื่อแบรนด์ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                placeholder="เช่น Apple, Samsung, Logitech"
                {...register('name', { required: 'กรุณากรอกชื่อแบรนด์' })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                รายละเอียดแบรนด์
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24"
                placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับแบรนด์สินค้า"
                {...register('description')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed">
              <div>
                <span className="text-sm font-semibold block text-zinc-800 dark:text-zinc-200">สถานะการใช้งาน</span>
                <span className="text-xs text-zinc-400">เปิดหรือปิดการแสดงผลแบรนด์นี้ในระบบ</span>
              </div>
              <button
                type="button"
                onClick={onToggle}
                className={`btn btn-sm px-4 ${existing?.isActive ? 'btn-success text-white' : 'btn-ghost border-zinc-300'}`}
              >
                {existing?.isActive ? '🟢 เปิดใช้งานอยู่' : '🔴 ปิดใช้งาน'}
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link to={LIST_PATH} className="btn btn-outline">
                ยกเลิก
              </Link>
              <button type="submit" className="btn btn-primary px-6">
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </form>
        </div>
      </div>
      <ProcessingDialog open={saving} />
    </div>
  );
};

export default EditBrandPage;