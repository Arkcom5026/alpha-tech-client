const SALE_COMPLETION_ERROR_MESSAGES = {
  SALE_CUSTOMER_NOT_ACCESSIBLE_IN_BRANCH:
    'ไม่พบลูกค้ารายนี้ในร้านปัจจุบัน กรุณาค้นหาและเลือกลูกค้าของร้านอีกครั้ง',
};

export const projectSaleCompletionErrorMessage = ({ code, message }) =>
  SALE_COMPLETION_ERROR_MESSAGES[code] || message || 'ยืนยันการขายล้มเหลว';

export default projectSaleCompletionErrorMessage;
