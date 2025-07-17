import React from 'react';
import CustomerFilter from '../components/CustomerFilter';
import PendingDeliveryNoteTable from '../components/PendingDeliveryNoteTable';

const CombinedBillingPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">รวมใบส่งของเพื่อสร้างบิล</h1>
      <CustomerFilter />
      <PendingDeliveryNoteTable />
    </div>
  );
};

export default CombinedBillingPage;
