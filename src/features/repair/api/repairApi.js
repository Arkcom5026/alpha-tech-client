import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

const normalizeError = (error, fallback) => {
  const payload = error?.response?.data;
  const normalized = new Error(
    payload?.message || payload?.error?.message || error?.message || fallback
  );
  normalized.code = payload?.code || payload?.error?.code || (typeof payload?.error === 'string' ? payload.error : null) || error?.code || 'REPAIR_REQUEST_FAILED';
  normalized.details = payload?.error?.details || payload?.details || null;
  normalized.status = error?.response?.status || null;
  return normalized;
};

const request = async (work, fallback) => {
  try { return unwrap(await work()); } catch (error) { throw normalizeError(error, fallback); }
};

export const repairApi = {
  searchIntake: (query) => request(() => apiClient.get('/repairs/intake-search', { params: { q: String(query).trim() } }), 'ไม่สามารถค้นหาลูกค้าหรืออุปกรณ์ได้'),
  getIntakeContext: (lookup) => request(() => apiClient.get(`/repairs/intake-context/${encodeURIComponent(String(lookup).trim())}`), 'ไม่สามารถค้นหาข้อมูลรับซ่อมได้'),
  getCustomerWarrantyAssets: (customerId) => request(() => apiClient.get(`/repairs/customers/${customerId}/warranty-assets`), 'ไม่สามารถโหลดสินค้าที่มีประกันของลูกค้าได้'),
  searchPartProducts: (search) => request(() => apiClient.get('/products/pos/search', { params: { search: String(search || '').trim(), limit: 20, _ts: Date.now() } }), 'ไม่สามารถค้นหาอะไหล่ในสาขาได้'),
  listJobs: (params = {}) => request(() => apiClient.get('/repairs/jobs', { params }), 'ไม่สามารถโหลดคิวงานซ่อมได้'),
  getJob: (id) => request(() => apiClient.get(`/repairs/jobs/${id}`), 'ไม่สามารถโหลดรายละเอียดงานซ่อมได้'),
  createJob: (payload) => request(() => apiClient.post('/repairs/jobs', payload), 'ไม่สามารถเปิดใบรับซ่อมได้'),
  createExternalIntake: (payload) => request(() => apiClient.post('/repairs/intakes/external-device', payload), 'ไม่สามารถรับอุปกรณ์ภายนอกได้'),
  getIntakeEvidence: (id) => request(() => apiClient.get(`/repairs/jobs/${id}/intake-evidence`), 'ไม่สามารถโหลดหลักฐานการรับเครื่องได้'),
  saveIntakeEvidence: (id, evidence = {}) => {
    const form = new FormData();
    (evidence.photos || []).forEach((photo) => form.append('photos', photo));
    ['confirmed', 'customerSignature', 'allowDataErase', 'allowFactoryReset', 'allowDisassembly', 'allowOutsourceRepair'].forEach((field) => form.append(field, String(evidence[field] ?? '')));
    return request(() => apiClient.post(`/repairs/jobs/${id}/intake-evidence`, form, { headers: { 'Content-Type': undefined } }), 'ไม่สามารถบันทึกหลักฐานการรับเครื่องได้');
  },
  createTrackingAccess: (id, payload = {}) => request(() => apiClient.post(`/repairs/jobs/${id}/tracking-access`, payload), 'ไม่สามารถสร้างลิงก์ติดตามงานได้'),
  rotateTrackingAccess: (id, payload = {}) => request(() => apiClient.post(`/repairs/jobs/${id}/tracking-access/rotate`, payload), 'ไม่สามารถออกลิงก์ติดตามงานใหม่ได้'),
  revokeTrackingAccess: (id) => request(() => apiClient.delete(`/repairs/jobs/${id}/tracking-access`), 'ไม่สามารถยกเลิกลิงก์ติดตามงานได้'),
  getEstimateApproval: (id) => request(() => apiClient.get(`/repairs/jobs/${id}/estimate-approval`), 'ไม่สามารถโหลดสถานะการอนุมัติราคาได้'),
  publishEstimateApproval: (id, payload = {}) => request(() => apiClient.post(`/repairs/jobs/${id}/estimate-approval`, payload), 'ไม่สามารถส่งราคาประเมินให้ลูกค้าได้'),
  getHandover: (id) => request(() => apiClient.get(`/repairs/jobs/${id}/handover`), 'ไม่สามารถโหลดสถานะส่งมอบได้'),
  finalizeHandover: (id, payload) => request(() => apiClient.post(`/repairs/jobs/${id}/handover/finalize`, payload), 'ไม่สามารถยืนยันการส่งมอบได้'),
  transitionWorkflow: (id, payload) => request(() => apiClient.post(`/repairs/jobs/${id}/workflow/commands`, payload), 'ไม่สามารถดำเนินขั้นตอนงานซ่อมได้'),
  transitionJob: (id, payload) => request(() => apiClient.patch(`/repairs/jobs/${id}/status`, payload), 'ไม่สามารถอัปเดตสถานะงานซ่อมได้'),
  addPart: (id, payload) => request(() => apiClient.post(`/repairs/jobs/${id}/parts`, payload), 'ไม่สามารถบันทึกอะไหล่ได้'),
  getClaimOptions: (id) => request(() => apiClient.get(`/repairs/jobs/${id}/warranty-claim-options`), 'ไม่สามารถโหลดข้อมูลสำหรับเปิดรายการเคลมได้'),
  openClaim: (id, payload) => request(() => apiClient.post(`/repairs/jobs/${id}/warranty-claims`, payload), 'ไม่สามารถเปิดรายการเคลมได้'),
  listClaims: (params = {}) => request(() => apiClient.get('/repairs/warranty-claims', { params }), 'ไม่สามารถโหลดคิวงานเคลมได้'),
  getClaim: (id) => request(() => apiClient.get(`/repairs/warranty-claims/${id}`), 'ไม่สามารถโหลดรายละเอียดเคลมได้'),
  getReplacementOptions: (id, query = '') => request(
    () => apiClient.get(`/repairs/warranty-claims/${id}/replacement-options`, { params: { q: String(query || '').trim() } }),
    'ไม่สามารถค้นหาสินค้าทดแทนได้'
  ),
  transitionClaim: (id, payload) => request(() => apiClient.patch(`/repairs/warranty-claims/${id}/status`, payload), 'ไม่สามารถอัปเดตสถานะเคลมได้'),
};

export default repairApi;
