import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CombinedDocumentInvoiceShell from '../detail/workspace/components/CombinedDocumentInvoiceShell';
import CombinedDocumentState from '../detail/workspace/components/CombinedDocumentState';
import CombinedDocumentToolbar from '../detail/workspace/components/CombinedDocumentToolbar';
import { useCombinedBillingStore } from '../store/combinedBillingStore';

const CombinedDocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    documentDetail,
    isLoadingDetail,
    errorDetail,
    fetchDocumentById,
  } = useCombinedBillingStore();

  useEffect(() => {
    if (id) {
      fetchDocumentById(id);
    }
  }, [id, fetchDocumentById]);

  const handleBack = () => {
    navigate('/billing/combine');
  };

  const handlePrint = () => {
    console.log('Printing document...');
    window.print();
  };

  if (isLoadingDetail) {
    return <CombinedDocumentState status="loading" />;
  }

  if (errorDetail) {
    return <CombinedDocumentState status="error" message={errorDetail.message} />;
  }

  if (!documentDetail) {
    return <CombinedDocumentState status="empty" />;
  }

  const customer = documentDetail.sales?.[0]?.customer;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <CombinedDocumentToolbar onBack={handleBack} onPrint={handlePrint} />
      <CombinedDocumentInvoiceShell documentDetail={documentDetail} customer={customer} />
    </div>
  );
};

export default CombinedDocumentDetailPage;
