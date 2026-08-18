import React from 'react';
import { useParams } from 'react-router-dom';
import QuotationDocumentLineagePanel from '../components/QuotationDocumentLineagePanel';
import QuotationDraftProductAssistantPanel from '../components/QuotationDraftProductAssistantPanel';
import QuotationPrintPage from './QuotationPrintPage';

const QuotationPrintLineagePage = () => {
  const { shopSlug, quotationId } = useParams();
  return (
    <>
      <QuotationPrintPage />
      <QuotationDraftProductAssistantPanel quotationId={quotationId} />
      <QuotationDocumentLineagePanel quotationId={quotationId} shopSlug={shopSlug} />
    </>
  );
};

export default QuotationPrintLineagePage;
