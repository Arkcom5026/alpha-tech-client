import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CustomerDetailWorkspace from '../components/workspace/CustomerDetailWorkspace';

const CustomerDetailPage = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();

  return (
    <CustomerDetailWorkspace
      customerId={customerId}
      onBack={() => navigate('..')}
    />
  );
};

export default CustomerDetailPage;
