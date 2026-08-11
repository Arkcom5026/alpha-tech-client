export const INPUT_TAX_ERROR_MESSAGES_TH = Object.freeze({
  INPUT_TAX_RECONCILIATION_REQUIRED: 'ไม่สามารถดำเนินการได้ เนื่องจากยอดใบรับสินค้ายังไม่ตรงกับใบกำกับภาษี',
  INPUT_TAX_FILING_RECONCILIATION_REQUIRED: 'ยังเลือกเอกสารเข้าชุดภาษีซื้อไม่ได้ เนื่องจากการกระทบยอดยังไม่ครบถ้วน',
  INPUT_TAX_FILING_ELIGIBILITY_REQUIRED: 'เอกสารนี้ยังไม่ผ่านเงื่อนไขสำหรับการนำเข้าชุดภาษีซื้อ',
  INPUT_TAX_FILING_VAT_AUTHORITY_REQUIRED: 'ยังเลือกเอกสารเข้าชุดไม่ได้ เนื่องจากยังไม่มีรายการภาษีซื้อที่อนุมัติเป็นข้อมูลอ้างอิง',
  INPUT_TAX_FILING_VAT_AUTHORITY_CONFLICT: 'ยอดภาษีซื้อที่อนุมัติไม่ตรงกับเอกสาร กรุณาตรวจสอบข้อมูลก่อนดำเนินการต่อ',
  INPUT_TAX_DOCUMENT_ALREADY_IN_FILING: 'เอกสารนี้อยู่ในชุดภาษีซื้ออื่นแล้ว',
  INPUT_TAX_STALE_VERSION: 'ข้อมูลถูกเปลี่ยนจากอีกหน้าจอ กรุณารีเฟรชแล้วลองใหม่',
  INPUT_TAX_FILING_STALE: 'สถานะชุดภาษีซื้อมีการเปลี่ยนแปลง กรุณารีเฟรชข้อมูลก่อนดำเนินการต่อ',
  TAX_PERIOD_STALE_VERSION: 'สถานะรอบภาษีมีการเปลี่ยนแปลง กรุณารีเฟรชข้อมูลก่อนดำเนินการต่อ',
  TAX_PERIOD_INPUT_FILING_INCOMPLETE: 'ยังล็อกรอบไม่ได้ เนื่องจากรายการภาษีซื้อยังถูกเลือกเข้าชุดไม่ครบ',
  TAX_PERIOD_INPUT_FILING_NOT_SUBMITTED: 'ยังยืนยันรอบภาษีไม่ได้ เนื่องจากขั้นตอนการยื่นภาษีซื้อของรอบนี้ยังไม่เสร็จ',
  INPUT_TAX_REASON_REQUIRED: 'กรุณาระบุเหตุผลก่อนดำเนินการ',
  INPUT_TAX_DECISION_REASON_REQUIRED: 'กรุณาระบุเหตุผลประกอบการตัดสินใจ',
  INPUT_TAX_PERIOD_MUTATION_BLOCKED: 'ไม่สามารถแก้ไขรายการได้ เนื่องจากรอบภาษีถูกปิดหรือล็อกแล้ว',
  INPUT_TAX_FILING_BATCH_NOT_MUTABLE: 'ชุดภาษีซื้อนี้ไม่สามารถแก้ไขได้แล้ว',
  INPUT_TAX_FILING_BATCH_NOT_FOUND: 'ไม่พบชุดภาษีซื้อของรอบนี้ กรุณาเริ่มเตรียมชุดภาษีซื้อก่อน',
  INPUT_TAX_FILING_PERIOD_NOT_FOUND: 'ไม่พบรอบภาษีที่ต้องการ',
  INPUT_TAX_FILING_PERIOD_REQUIRED: 'กรุณาเลือกรอบภาษี',
  INPUT_TAX_FILING_INPUT_INVALID: 'ข้อมูลสำหรับจัดเตรียมชุดภาษีซื้อไม่ถูกต้อง',
  INPUT_TAX_FILING_CLIENT_VALIDATION_ERROR: 'ข้อมูลสำหรับจัดเตรียมชุดภาษีซื้อไม่ครบถ้วน',
  INPUT_TAX_REPORT_RANGE_TOO_LARGE: 'ช่วงวันที่ของรายงานกว้างเกินกำหนด กรุณาเลือกช่วงไม่เกิน 366 วัน',
  INPUT_TAX_REPORT_RESULT_TOO_LARGE: 'รายงานมีรายการมากเกินกำหนด กรุณาลดช่วงวันที่แล้วลองใหม่',
  INPUT_TAX_OVERVIEW_RANGE_TOO_LARGE: 'ช่วงวันที่ของภาพรวมภาษีซื้อกว้างเกินกำหนด กรุณาเลือกช่วงไม่เกิน 366 วัน',
  INPUT_TAX_LINK_ACCESS_FORBIDDEN: 'คุณไม่มีสิทธิ์จัดการการเชื่อมโยงใบรับสินค้ากับใบกำกับภาษี',
  INPUT_TAX_LINK_BRANCH_FORBIDDEN: 'ไม่สามารถจัดการข้อมูลภาษีซื้อของสาขาอื่นได้',
  INPUT_TAX_OVERVIEW_ACCESS_FORBIDDEN: 'คุณไม่มีสิทธิ์เข้าดูภาพรวมภาษีซื้อ',
  INPUT_TAX_OVERVIEW_BRANCH_FORBIDDEN: 'ไม่สามารถเข้าดูภาพรวมภาษีซื้อของสาขาอื่นได้',
  INPUT_TAX_FILING_ACCESS_FORBIDDEN: 'คุณไม่มีสิทธิ์จัดการชุดภาษีซื้อ',
  INPUT_TAX_FILING_BRANCH_FORBIDDEN: 'ไม่สามารถจัดการชุดภาษีซื้อของสาขาอื่นได้',
  INPUT_TAX_FILING_BATCH_BRANCH_MISMATCH: 'ชุดภาษีซื้อไม่อยู่ในสาขาที่คุณกำลังใช้งาน',
  INPUT_TAX_DECISION_ACCESS_FORBIDDEN: 'คุณไม่มีสิทธิ์ตัดสินรายการซ้ำหรือรายการทดแทน',
  INPUT_TAX_DECISION_BRANCH_FORBIDDEN: 'ไม่สามารถตัดสินเอกสารภาษีของสาขาอื่นได้',
  INPUT_TAX_DECISION_ACTOR_REQUIRED: 'ไม่พบตัวตนพนักงานสำหรับการดำเนินการนี้',
  INPUT_TAX_FILING_ACTOR_REQUIRED: 'ไม่พบตัวตนพนักงานสำหรับการจัดการชุดภาษีซื้อ',
  INPUT_TAX_REPLACEMENT_ALREADY_LINKED: 'เอกสารทดแทนนี้ถูกเชื่อมโยงกับเอกสารต้นทางอื่นแล้ว',
  INPUT_TAX_REPLACEMENT_CYCLE: 'ไม่สามารถเชื่อมโยงเอกสารทดแทนได้ เนื่องจากจะเกิดวงจรอ้างอิง',
  INPUT_TAX_REPLACEMENT_SELF_REFERENCE: 'เอกสารไม่สามารถใช้ตัวเองเป็นเอกสารที่ถูกแทนที่ได้',
  TAX_DOCUMENT_NOT_FOUND: 'ไม่พบเอกสารภาษีที่ต้องการ',
  TAX_DOCUMENT_LIFECYCLE_CONFLICT: 'สถานะเอกสารภาษีมีการเปลี่ยนแปลง กรุณารีเฟรชแล้วลองใหม่',
});

const extractErrorCode = (error) => error?.response?.data?.code
  || error?.response?.data?.error
  || error?.code
  || null;

export const getInputTaxErrorMessage = (error, fallback = 'ไม่สามารถดำเนินการเกี่ยวกับภาษีซื้อได้') => {
  const code = extractErrorCode(error);
  if (code && INPUT_TAX_ERROR_MESSAGES_TH[code]) return INPUT_TAX_ERROR_MESSAGES_TH[code];
  return fallback;
};

export const getInputTaxErrorCode = extractErrorCode;
