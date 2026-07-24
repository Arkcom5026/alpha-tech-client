export const validateRepairJobDraft = (draft) => {
  const errors = {};
  if (!Number(draft.customerId)) errors.customerId = 'กรุณาระบุลูกค้า';
  if (!String(draft.deviceModel || '').trim()) errors.deviceModel = 'กรุณาระบุรุ่นหรือรายละเอียดอุปกรณ์';
  if (!String(draft.reportedSymptoms || '').trim()) errors.reportedSymptoms = 'กรุณาระบุอาการที่ลูกค้าแจ้ง';
  if (Number(draft.depositPaid || 0) < 0) errors.depositPaid = 'ยอดมัดจำต้องไม่ติดลบ';
  if (Number(draft.estimatedCost || 0) < 0) errors.estimatedCost = 'ราคาประเมินต้องไม่ติดลบ';
  return errors;
};

export const validateClaimDraft = (draft) => {
  const errors = {};
  if (!String(draft.reason || '').trim()) errors.reason = 'กรุณาระบุเหตุผลในการส่งเคลม';
  return errors;
};
