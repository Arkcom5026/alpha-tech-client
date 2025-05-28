//src/components/shared/media/utils/uploadAllImages.js

import apiClient from '@/utils/apiClient';

/**
 * อัปโหลดภาพทั้งหมดไปยัง backend
 * @param {File[]} files - รายการไฟล์ที่เลือก
 * @param {string} endpoint - path ของ backend ที่ใช้รับภาพ (default = '/product-images')
 * @returns {Promise<Array>} - อาเรย์ของรูปภาพที่อัปโหลดสำเร็จ (มี public_id, url, secure_url)
 */
export async function uploadAllImages(files, endpoint = '/product-images') {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  try {
    const res = await apiClient.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data; // ✅ ต้องเป็น array ของรูป เช่น [{ public_id, url, secure_url }]
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}


