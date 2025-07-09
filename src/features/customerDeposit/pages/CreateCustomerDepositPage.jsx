import React from 'react';
import CustomerDepositForm from '../components/CustomerDepositForm';

/**
 * Component: CreateCustomerDepositPage
 * วัตถุประสงค์: เป็นหน้าหลัก (Page) สำหรับแสดงฟอร์มการรับเงินมัดจำ
 * มีหน้าที่หลักในการจัด Layout ของหน้า
 */
const CreateCustomerDepositPage = () => {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">รับเงินมัดจำลูกค้า</h1>
      <CustomerDepositForm />
    </div>
  );
};

export default CreateCustomerDepositPage;
