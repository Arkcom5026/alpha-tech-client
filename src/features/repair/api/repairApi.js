import apiClient from '@/utils/apiClient';
import { dedupeRepairRead } from './repairRequestCoordinator';

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

const stableParamsKey = (params = {}) =>
  Object.entries(params || {})
    .filter(([, value]) => value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&');

const read = (key, work, fallback) =>
  dedupeRepairRead(key, () => request(work, fallback));

export const repairApi = {
  searchIntake: (query) => {
    const q = String(query).trim();
    return read(`repair:intake-search:${q}`, () => apiClient.get('/repairs/intake-search', { params: { q } }), 'ไม่สามารถค้นหาลูกค้าหรืออุปกรณ์ได้');
  },
  getIntakeContext: (lookup) => {
    const normalizedLookup = encodeURIComponent(String(lookup).trim());
    return read(`repair:intake-context:${normalizedLookup}`, () => apiClient.get(`/repairs/intake-context/${normalizedLookup}`), 'ไม่สามารถค้นหาข้อมูลรับซ่อมได้');
  },
  getCustomerWarrantyAssets: (customerId) => read(`repair:customer-warranty-assets:${customerId}`, () => apiClient.get(`/repairs/customers/${customerId}/warranty-assets`), 'ไม่สามารถโหลดสินค้าที่มีประกันของลูกค้าได้'),
  searchPartProducts: (search) => request(() => apiClient.get('/products/pos/search', { params: { search: String(search || '').trim(), limit: 20, _ts: Date.now() } }), 'ไม่สามารถค้นหาอะไหล่ในสาขาได้'),
  getPartStockOptions: (id, productId, query = '') => {
    const q = String(query || '').trim();
    return read(
      `repair:part-stock-options:${id}:${productId}:${q}`,
      () => apiClient.get(`/repairs/jobs/${id}/part-stock-options`, { params: { productId, q } }),
      'ไม่สามารถโหลด Serial/StockItem ที่พร้อมใช้งานได้'
    );
  },
  listJobs: (params = {}) => read(`repair:list-jobs:${stableParamsKey(params)}`, () => apiClient.get('/repairs/jobs', { params }), 'ไม่สามารถโหลดคิวงานซ่อมได้'),
  getJob: (id) => read(`repair:job:${id}`, () => apiClient.get(`/repairs/jobs/${id}`), 'ไม่สามารถโหลดรายละเอียดงานซ่อมได้'),
  createJob: (payload) => request(() => apiClient.post('/repairs/jobs', payload), 'ไม่สามารถเปิดใบรับซ่อมได้'),
  createManualIntake: (payload) => request(() => apiClient.post('/repairs/intakes/manual', payload), 'ไม่สามารถเปิดงานรับซ่อมได้'),
  createExternalIntake: (payload) => request(() => apiClient.post('/repairs/intakes/external-device', payload), 'ไม่สามารถรับอุปกรณ์ภายนอกได้'),
  getIntakeEvidence: (id) => read(`repair:intake-evidence:${id}`, () => apiClient.get(`/repairs/jobs/${id}/intake-evidence`), 'ไม่สามารถโหลดหลักฐานการรับเครื่องได้'),
  saveIntakeEvidence: (id, evidence = {}) => {
    const form = new FormData();
    (evidence.photos || []).forEach((photo) => form.append('photos', photo));
    ['confirmed', 'customerSignature', 'allowDataErase', 'allowFactoryReset', 'allowDisassembly', 'allowOutsourceRepair'].forEach((field) => form.append(field, String(evidence[field] ?? '')));
    return request(() => apiClient.post(`/repairs/jobs/${id}/intake-evidence`, form, { headers: { 'Content-Type': undefined } }), 'ไม่สามารถบันทึกหลักฐานการรับเครื่องได้');
  },
  createTrackingAccess: (id, payload = {}) => request(() => apiClient.post(`/repairs/jobs/${id}/tracking-access`, payload), 'ไม่สามารถสร้างลิงก์ติดตามงานได้'),
  rotateTrackingAccess: (id, payload = {}) => request(() => apiClient.post(`/repairs/jobs/${id}/tracking-access/rotate`, payload), 'ไม่สามารถออกลิงก์ติดตามงานใหม่ได้'),
  revokeTrackingAccess: (id) => request(() => apiClient.delete(`/repairs/jobs/${id}/tracking-access`), 'ไม่สามารถยกเลิกลิงก์ติดตามงานได้'),
  getEstimateApproval: (id) => read(`repair:estimate-approval:${id}`, () => apiClient.get(`/repairs/jobs/${id}/estimate-approval`), 'ไม่สามารถโหลดสถานะการอนุมัติราคาได้'),
  publishEstimateApproval: (id, payload = {}) => request(() => apiClient.post(`/repairs/jobs/${id}/estimate-approval`, payload), 'ไม่สามารถส่งราคาประเมินให้ลูกค้าได้'),
  getHandover: (id) => read(`repair:handover:${id}`, () => apiClient.get(`/repairs/jobs/${id}/handover`), 'ไม่สามารถโหลดสถานะส่งมอบได้'),
  finalizeHandover: (id, payload) => request(() => apiClient.post(`/repairs/jobs/${id}/handover/finalize`, payload), 'ไม่สามารถยืนยันการส่งมอบได้'),
  transitionWorkflow: (id, payload) => request(() => apiClient.post(`/repairs/jobs/${id}/workflow/commands`, payload), 'ไม่สามารถดำเนินขั้นตอนงานซ่อมได้'),
  addPart: (id, payload) => request(() => apiClient.post(`/repairs/jobs/${id}/parts`, payload), 'ไม่สามารถบันทึกอะไหล่ได้'),
  getSubcontractContext: (id) => read(`repair:subcontract-context:${id}`, () => apiClient.get(`/repairs/jobs/${id}/subcontracts`), 'ไม่สามารถโหลดข้อมูลส่งซ่อมภายนอกได้'),
  sendSubcontract: (id, payload) => request(() => apiClient.post(`/repairs/jobs/${id}/subcontracts`, payload), 'ไม่สามารถยืนยันการส่งซ่อมภายนอกได้'),
  updateSubcontract: (id, subcontractId, payload) => request(() => apiClient.patch(`/repairs/jobs/${id}/subcontracts/${subcontractId}`, payload), 'ไม่สามารถอัปเดตข้อมูลส่งซ่อมภายนอกได้'),
  commandSubcontract: (id, subcontractId, payload) => request(() => apiClient.post(`/repairs/jobs/${id}/subcontracts/${subcontractId}/commands`, payload), 'ไม่สามารถดำเนินรายการส่งซ่อมภายนอกได้'),
  getClaimOptions: (id) => read(`repair:claim-options:${id}`, () => apiClient.get(`/repairs/jobs/${id}/warranty-claim-options`), 'ไม่สามารถโหลดข้อมูลสำหรับเปิดรายการเคลมได้'),
  openClaim: (id, payload) => request(() => apiClient.post(`/repairs/jobs/${id}/warranty-claims`, payload), 'ไม่สามารถเปิดรายการเคลมได้'),
  listClaims: (params = {}) => read(`repair:list-claims:${stableParamsKey(params)}`, () => apiClient.get('/repairs/warranty-claims', { params }), 'ไม่สามารถโหลดคิวงานเคลมได้'),
  getClaim: (id) => read(`repair:claim:${id}`, () => apiClient.get(`/repairs/warranty-claims/${id}`), 'ไม่สามารถโหลดรายละเอียดเคลมได้'),
  getReplacementOptions: (id, query = '') => {
    const q = String(query || '').trim();
    return read(
      `repair:replacement-options:${id}:${q}`,
      () => apiClient.get(`/repairs/warranty-claims/${id}/replacement-options`, { params: { q } }),
      'ไม่สามารถค้นหาสินค้าทดแทนได้'
    );
  },
  transitionClaim: (id, payload) => request(() => apiClient.patch(`/repairs/warranty-claims/${id}/status`, payload), 'ไม่สามารถอัปเดตสถานะเคลมได้'),
};

export default repairApi;
