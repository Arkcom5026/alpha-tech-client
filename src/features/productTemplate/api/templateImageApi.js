import apiClient from '@/utils/apiClient';

const unwrap = (payload) => payload?.data ?? payload?.item ?? payload;

export const uploadTemplateImage = async (templateId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post(`/products/${templateId}/images/upload-full`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap(res.data);
};

export const deleteTemplateImage = async (templateId, image) => {
  const imageId = image?.id || image?.imageId;
  const res = await apiClient.post(`/products/${templateId}/images/delete`, {
    imageId,
    publicId: image?.public_id || image?.publicId,
  });
  return unwrap(res.data);
};

export const setTemplateCoverImage = async (templateId, imageId) => {
  const res = await apiClient.patch(`/products/${templateId}/images/${imageId}/cover`);
  return unwrap(res.data);
};
