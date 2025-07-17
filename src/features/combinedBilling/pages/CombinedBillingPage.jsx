import React from 'react';
import CustomerFilter from '../components/CustomerFilter';
import PendingDeliveryNoteTable from '../components/PendingDeliveryNoteTable';
import useCombinedBillingStore from '../store/combinedBillingStore';

const CombinedBillingPage = () => {
  const { customer } = useCombinedBillingStore();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">รวมใบส่งของเพื่อสร้างบิล</h1>
      <CustomerFilter />
      <PendingDeliveryNoteTable sales={customer?.sales || []} />
    </div>
  );
};

export default CombinedBillingPage;
