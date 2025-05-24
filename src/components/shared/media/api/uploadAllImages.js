// ✅ src/components/shared/media/api/uploadAllImages.js
import apiClient from '@/utils/apiClient';

export const uploadAllImages = async (files = []) => {
  console.log('📂 Files received for upload:', files);

  const results = [];

  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append('images', file);

      const response = await apiClient.post('/upload', formData);
      const uploaded = response.data[0];

      results.push({
        url: uploaded.url,
        public_id: uploaded.public_id,
        secure_url: uploaded.secure_url,
      });
    } catch (error) {
      console.error('❌ Upload failed for file:', file.name, error);
      // อาจเลือกจะ push error log ลง results หรือหยุด loop
    }
  }
  return results;
};

export const deleteImageFromServer = async (public_id) => {
  try {
    const response = await apiClient.post('/upload/delete', { public_id });
    return response.data;
  } catch (error) {
    console.error('❌ ลบภาพจากเซิร์ฟเวอร์ล้มเหลว:', error);
    throw error; // ส่งต่อ error ไปให้ caller handle ต่อ เช่น alert
  }
};
