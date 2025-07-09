import React from 'react';
import CustomerSelectorDeposit from './CustomerSelectorDeposit';
import PaymentSectionDeposit from './PaymentSectionDeposit';

/**
 * Component: CustomerDepositForm
 * วัตถุประสงค์: รวบรวม Component ย่อยๆ ที่ใช้ในการรับเงินมัดจำมาไว้ด้วยกัน
 * เพื่อจัดระเบียบและโครงสร้างของฟอร์ม
 */
const CustomerDepositForm = () => {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <CustomerSelectorDeposit />
      <PaymentSectionDeposit />
    </div>
  );
};

export default CustomerDepositForm;
