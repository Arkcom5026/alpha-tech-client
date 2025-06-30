// CustomerDepositForm.jsx

import React from 'react';
import CustomerSelectorDeposit from './CustomerSelectorDeposit';
import PaymentSectionDeposit from './PaymentSectionDeposit';

const CustomerDepositForm = () => {
  return (
    <div className="space-y-6 ">
      <div className='flex justify-center'> 
        <CustomerSelectorDeposit />
      </div>
      <br />
      <div className='flex justify-center'>
        <PaymentSectionDeposit />
      </div>
    </div>
  );
};

export default CustomerDepositForm;
