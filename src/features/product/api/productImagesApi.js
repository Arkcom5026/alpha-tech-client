




// ✅ src/features/product/api/productImagesApi.js

import apiClient from '@/utils/apiClient';

export const uploadImagesProduct = async (productIdOrFiles, payloadOrCaptions = [], coverIndexArg = 0) => {
  // ✅ รองรับ 2 รูปแบบการเรียก เพื่อกัน TypeError: files.forEach is not a function
  // 1) แบบใหม่ (จาก store): uploadImagesProduct(productId, { files, captions, coverIndex })
  // 2) แบบเดิม: uploadImagesProduct(files, captions, coverIndex)

  const normalizeFiles = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (typeof FileList !== 'undefined' && input instanceof FileList) return Array.from(input);
    return [input];
  };

  const normalizeCaptions = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    return [String(input)];
  };

  const isProductIdCall = (typeof productIdOrFiles === 'number' || typeof productIdOrFiles === 'string') && payloadOrCaptions && typeof payloadOrCaptions === 'object' && !Array.isArray(payloadOrCaptions);

  // ✅ Extract params
  const productId = isProductIdCall ? productIdOrFiles : null;
  const filesRaw = isProductIdCall ? payloadOrCaptions?.files : productIdOrFiles;
  const captionsRaw = isProductIdCall ? payloadOrCaptions?.captions : payloadOrCaptions;
  const coverIndex = isProductIdCall ? (payloadOrCaptions?.coverIndex ?? 0) : (coverIndexArg ?? 0);

  const files = normalizeFiles(filesRaw);
  const captions = normalizeCaptions(captionsRaw);

  if (!files.length) return [];

  // ✅ ถ้ามี productId ให้ยิง endpoint แบบผูกสินค้า (Production-safe)
  if (productId) {
    return await uploadImagesProductFull(productId, files, captions, coverIndex);
  }

  // ✅ fallback: endpoint แบบ temp (ถ้ายังมีการใช้งานอยู่)
  const formData = new FormData();
  files.forEach((file) => {
    if (file) formData.append('files', file);
  });
  captions.forEach((caption) => formData.append('captions', String(caption ?? '')));

  // ✅ temp upload (หลายไฟล์พร้อมกัน) ยังไม่รองรับ cover แบบต่อไฟล์
  // ใช้ค่า coverIndex เดิมตรง ๆ เพื่อไม่ให้ eslint error และไม่เพี้ยน logic
  formData.append('coverIndex', String(coverIndex ?? 0));

  try {
    const response = await apiClient.post('/products/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data?.images || [];
  } catch (error) {
    console.error('❌ Upload (temp) failed:', error);
    return [];
  }
};

export const uploadImagesProductFull = async (productId, files = [], captions = [], coverIndex = 0) => {
  const results = [];

  // ✅ กันค่าที่ไม่ใช่ไฟล์จริง (undefined/null/ค่าประหลาด)
  const safeFiles = Array.isArray(files)
    ? files.filter((f) => f && (f instanceof File || f instanceof Blob))
    : [];

  for (let i = 0; i < safeFiles.length; i++) {
    const file = safeFiles[i];

    try {
      const formData = new FormData();

      // ✅ สำคัญ: endpoint upload-full ส่วนใหญ่ใช้ multer.single('file')
      // ถ้าส่งเป็น 'files' จะทำให้ req.file เป็น undefined แล้วโดน 400
      formData.append('file', file);

      formData.append('caption', String(captions?.[i] ?? ''));
      formData.append('coverIndex', String(coverIndex ?? 0));

      const response = await apiClient.post(`/products/${productId}/images/upload-full`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

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
      const fileName = (file && 'name' in file && file.name) ? file.name : 'unknown-file';
      console.error('❌ Upload failed for file:', fileName, error);
      continue;
    }
  }

  return results;
};



export const setProductCoverImage = async (productId, imageId) => {
  try {
    if (!productId) throw new Error('❌ productId is required');
    if (!imageId) throw new Error('❌ imageId is required');

    // ✅ อย่าส่ง body เป็น null เพราะ body-parser (strict) จะ error: "null" is not valid JSON
    // ส่ง object เปล่าแทนเพื่อให้ parse ผ่านทุก environment
    const response = await apiClient.patch(
      `/products/${productId}/images/${imageId}/cover`,
      {}
    );

    return response.data;
  } catch (error) {
    console.error('❌ ตั้งรูปหน้าปกล้มเหลว:', error);
    throw error;
  }
};

export const deleteImageProduct = async (productId, payload) => {
  try {
    if (!productId) throw new Error('❌ productId is required');

    let body = {};

    // ✅ payload เป็น object: { imageId } หรือ { public_id }
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      if (payload.imageId != null) body.imageId = payload.imageId;
      if (payload.public_id) body.public_id = payload.public_id;
      if (payload.publicId) body.public_id = payload.publicId;
    }
    // ✅ payload เป็น number: imageId
    else if (typeof payload === 'number') {
      body.imageId = payload;
    }
    // ✅ payload เป็น string: public_id
    else if (typeof payload === 'string') {
      body.public_id = payload;
    }

    if (!body.imageId && !body.public_id) {
      throw new Error('❌ imageId/public_id is required');
    }

    const response = await apiClient.post(`/products/${productId}/images/delete`, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data;
  } catch (error) {
    console.error('❌ ลบภาพล้มเหลว:', error);
    throw error;
  }
};





