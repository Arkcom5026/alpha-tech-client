// ✅ src/features/productTemplate/components/ProductTemplateForm.jsx

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormFields from './FormFields';

import { getAllProductProfiles } from '@/features/productProfile/api/productProfileApi';
import { fetchUnits } from '@/features/unit/api/unitApi';

const ProductTemplateForm = ({ defaultValues = {}, onSubmit, mode }) => {
  const [profiles, setProfiles] = useState([]);
  const [units, setUnits] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formMethods = useForm({
    defaultValues: {
      name: '',
      description: '',
      unit: '',
      spec: '',
      productProfileId: '',
      warranty: '',
      noSN: false,
      codeType: 'D',
      ...defaultValues,
    },
  });

  useEffect(() => {
    const fetchProfilesAndUnits = async () => {
      try {
        const dataProfiles = await getAllProductProfiles();
        const dataUnits = await fetchUnits();
        setProfiles(dataProfiles);
        setUnits(dataUnits);
      } catch (err) {
        console.error('โหลดข้อมูลล้มเหลว:', err);
      }
    };

    fetchProfilesAndUnits();
  }, []);

  useEffect(() => {
    if (units.length > 0 && profiles.length > 0) {
      formMethods.reset({
        ...formMethods.getValues(),
        ...defaultValues,
      });
    }
  }, [units, profiles]);

  const handleFormSubmit = async (formData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      delete formData.unit;
      console.log('📋 formData เตรียมส่ง:', formData);
      onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (units.length === 0 || profiles.length === 0) {
    return <p className="text-gray-500">⏳ กำลังโหลดข้อมูล...</p>;
  }

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={formMethods.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <FormFields
          profiles={profiles}
          units={units}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="font-medium md:col-span-1">รับประกัน (วัน)</label>
          <input {...formMethods.register('warranty')} className="input md:col-span-3 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="จำนวนวัน เช่น 365" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          {mode === 'edit' ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกรูปแบบสินค้า'}
        </button>
      </form>
    </FormProvider>
  );
};

export default ProductTemplateForm;
