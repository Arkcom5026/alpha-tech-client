import {
  formatTaxDateTime,
  formatTaxMoney,
  getTaxStatusBadgeClass,
} from '../../presentation/taxPresentation';

export const formatTaxIntakeDateTime = formatTaxDateTime;
export const formatTaxIntakeMoney = formatTaxMoney;
export const getTaxIntakeBadgeClass = getTaxStatusBadgeClass;

export const taxDocumentLifecycleActions = Object.freeze({
  DRAFT: [{ status: 'REGISTERED', label: 'ลงทะเบียนเอกสาร' }],
  REGISTERED: [{ status: 'UNDER_REVIEW', label: 'ส่งตรวจสอบ' }],
  UNDER_REVIEW: [
    { status: 'APPROVED', label: 'อนุมัติ', primary: true },
    { status: 'REJECTED', label: 'ส่งกลับแก้ไข' },
  ],
  REJECTED: [{ status: 'UNDER_REVIEW', label: 'ส่งตรวจสอบอีกครั้ง' }],
});
