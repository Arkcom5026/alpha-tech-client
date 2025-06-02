
// ✅ src/features/product/api/productImagesApi.js

import apiClient from '@/utils/apiClient';

export const uploadImagesProduct = async (files = [], captions = [], coverIndex = 0) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  captions.forEach((caption) => formData.append('captions', caption));
  formData.append('coverIndex', coverIndex);

  try {
    const response = await apiClient.post('/product/upload', formData, {
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
      formData.append('files', file);
      formData.append('captions', captions[i] || '');
      formData.append('coverIndex', coverIndex);

      const response = await apiClient.post(
        `/products/${productId}/images/upload-full`,
         
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );



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



export const deleteImageProduct = async (productId, public_id) => {
  try {
    if (!public_id) throw new Error("❌ public_id is undefined");



    const response = await apiClient.post(
      `/products/${productId}/images/delete`,
      { public_id }, // ✅ ส่ง JSON body
      {
        headers: {
          "Content-Type": "application/json", // ✅ สำคัญมาก
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ ลบภาพแบบ POST ล้มเหลว:", error);
    throw error;
  }
};








