// refund/pages/PrintRefundReceiptPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSaleReturnStore from '@/features/saleReturn/store/saleReturnStore';
import useEmployeeStore from '@/features/employee/store/employeeStore';
import RefundReceiptPrintState from '@/features/refund/print/workspace/components/RefundReceiptPrintState';
import RefundReceiptPrintToolbar from '@/features/refund/print/workspace/components/RefundReceiptPrintToolbar';
import RefundReceiptPrintShell from '@/features/refund/print/workspace/components/RefundReceiptPrintShell';
import { prepareRefundReceiptPrintProjection } from '@/features/refund/print/workspace/policies/refundReceiptPrintPolicy';
import {
  buildRefundReceiptHeader,
  resolveRefundReceiptPresentation,
} from '@/features/refund/presentation/refundReceiptPresentation';

const PrintRefundReceiptPage = () => {
  const { saleReturnId } = useParams();
  const { getSaleReturnByIdAction } = useSaleReturnStore();
  const { branch } = useEmployeeStore();
  const [saleReturn, setSaleReturn] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const result = await getSaleReturnByIdAction(saleReturnId);
      if (active) setSaleReturn(result);
    };
    load();
    return () => { active = false; };
  }, [saleReturnId, getSaleReturnByIdAction]);

  const presentation = useMemo(() => (
    saleReturn ? resolveRefundReceiptPresentation({ saleReturn, branch }) : null
  ), [branch, saleReturn]);

  const headerConfig = useMemo(() => (
    saleReturn && presentation ? buildRefundReceiptHeader({
      branch,
      presentation,
      presentationSnapshot: presentation.presentationSnapshot,
    }) : null
  ), [branch, presentation, saleReturn]);

  if (!saleReturn) return <RefundReceiptPrintState />;

  const projection = prepareRefundReceiptPrintProjection(saleReturn, branch, {
    headerConfig,
    presentation,
  });
  const handlePrint = () => window.print();

  return (
    <RefundReceiptPrintShell
      projection={projection}
      toolbar={<RefundReceiptPrintToolbar onPrint={handlePrint} />}
    />
  );
};

export default PrintRefundReceiptPage;
