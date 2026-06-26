// src/features/brand/pages/CreateBrandPage.jsx
import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom"; // 🟢 [DYNAMIC PARAM FIX] นำเข้า useParams มาร่วมควบคุมเลนวิ่ง
import { useForm } from "react-hook-form";
import PageHeader from "@/components/shared/layout/PageHeader";
import ProcessingDialog from "@/components/shared/dialogs/ProcessingDialog";
import useBrandStore from "../store/brandStore"; 

const CreateBrandPage = () => {
  // 🟢 [LINK BINDING] แกะรหัสชื่อร้านค้าจาก URL สแตนด์บายเพื่อคุมระบบทางวิ่ง Multi-Tenant ไม่ให้ดีดหลุดไปหน้าแรก
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const { createBrandAction } = useBrandStore();

  // 🟢 [DYNAMIC PATH FIX] ปรับแต่งพาธขากลับให้ตรงล็อกโครงสร้างเดี่ยวแบนราบ ล้างสแลชตัวท้ายออก
  const LIST_PATH = `/${shopSlug}/pos/stock/brands`;

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const onSubmitForm = async (formData) => {
    try {
      setSaving(true);
      setErrorMessage("");
      
      await createBrandAction({
        name: formData.name?.trim(),
        description: formData.description?.trim()
      });
      
      // 🟢 นำทางพาร์ตเนอร์กลับสู่หน้ารวมแบรนด์สินค้าภายใต้พิกัดร้านตัวเองอย่างแม่นยำ
      navigate(LIST_PATH);
    } catch (err) {
      console.error("❌ createBrandAction error", err);
      setErrorMessage("ไม่สามารถบันทึกแบรนด์สินค้าใหม่ได้ กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  // 🟢 [BUG FIX SUCCESS] เรียงลำดับบล็อกฟังก์ชัน คลีน Syntax และครอบวงเล็บคำสั่ง return ครบถ้วน ไร้อาการแหว่งค้าง
  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-xl space-y-4">
        <PageHeader title="➕ เพิ่มแบรนด์สินค้าใหม่" />

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
                placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับแบรนด์สินค้าใหม่"
                {...register('description')}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link to={LIST_PATH} className="btn btn-outline">
                ยกเลิก
              </Link>
              <button type="submit" className="btn btn-primary px-6">
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      </div>
      <ProcessingDialog open={saving} />
    </div>
  );
};

export default CreateBrandPage;