// ✅ src/features/product/api/productImagesApi.js

import apiClient from '@/utils/apiClient';

export const uploadImagesProduct = async (files = [], captions = [], coverIndex = 0) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  captions.forEach((caption) => formData.append('captions', caption));
  formData.append('coverIndex', coverIndex);

  try {
    const response = await apiClient.post('/product-images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.images || [];
  } catch (error) {
    console.error('❌ Upload (temp) failed:', error);
    return [];
  }
};

export const uploadImagesProductFull = async (productId, files = [], captions = [], coverIndex = 0) => {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      const formData = new FormData();
      formData.append('files', file); // ✅ ต้องตรงกับ backend middleware
      formData.append('captions', captions[i] || '');
      formData.append('coverIndex', coverIndex);

      const response = await apiClient.post(
        `/products/${productId}/images/upload-full`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      console.log('📸 รูปที่ได้:', response.data);

      const uploadedArray = response.data?.images;
      if (Array.isArray(uploadedArray)) {
        for (const img of uploadedArray) {
          if (img?.url && img?.public_id) {
            results.push({
              url: img.url,
              public_id: img.public_id,
              secure_url: img.secure_url || img.url,
              caption: img.caption || '',
              isCover: !!img.isCover,
            });
          }
        }
      } else {
        console.warn('⚠️ รูปแบบข้อมูล response ผิดปกติ:', response.data);
      }
    } catch (error) {
      console.error('❌ Upload failed for file:', file.name, error);
      continue;
    }
  }

  return results;
};

export const deleteImageProduct = async (public_id) => {
  try {
    const response = await apiClient.post('/upload/delete', { public_id });
    return response.data;
  } catch (error) {
    console.error('❌ ลบภาพจากเซิร์ฟเวอร์ล้มเหลว:', error);
    throw error;
  }
};
