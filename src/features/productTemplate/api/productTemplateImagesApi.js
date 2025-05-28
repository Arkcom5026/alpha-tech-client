// ✅ src/features/productTemplate/api/productTemplateImagesApi.js

import apiClient from '@/utils/apiClient';



export const uploadImagesTemp = async (files = [], captions = [], coverIndex = 0) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  captions.forEach((caption) => formData.append('captions', caption));
  formData.append('coverIndex', coverIndex);

  try {
    const response = await apiClient.post('/product-templates/images/upload-temp', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.images || [];
  } catch (error) {
    console.error('❌ Upload (temp) failed:', error);
    return [];
  }
};



export const uploadImagesTempFull = async (templateId, files = []) => {
  console.log('📂 Files received for upload:', files);

  const results = [];

  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append('images', file); // ซ้ำได้หลายภาพ      
      const response = await apiClient.post(`/product-templates/${templateId}/images/upload-full`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('📸 รูปที่ได้:', response.data);

      const uploaded = response.data?.[0];

      if (uploaded && uploaded.url && uploaded.public_id) {
        results.push({
          url: uploaded.url,
          public_id: uploaded.public_id,
          secure_url: uploaded.secure_url || uploaded.url,
        });
      } else {
        console.warn('⚠️ รูปแบบข้อมูล response ผิดปกติ:', response.data);
      }
    } catch (error) {
      console.error('❌ Upload failed for file:', file.name, error);
      // ป้องกันลูปล้มทั้งหมด แค่ข้ามไฟล์นั้นไป
      continue;
    }
  }
  return results;
};






export const deleteImage = async (public_id) => {
  try {
    const response = await apiClient.post('/upload/delete', { public_id });
    return response.data;
  } catch (error) {
    console.error('❌ ลบภาพจากเซิร์ฟเวอร์ล้มเหลว:', error);
    throw error;
  }
};


