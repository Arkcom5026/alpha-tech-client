// refund/pages/PrintRefundReceiptPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSaleReturnStore from '@/features/saleReturn/store/saleReturnStore';
import useEmployeeStore from '@/features/employee/store/employeeStore';
import RefundReceiptPrintState from '@/features/refund/print/workspace/components/RefundReceiptPrintState';
import RefundReceiptPrintToolbar from '@/features/refund/print/workspace/components/RefundReceiptPrintToolbar';
import RefundReceiptPrintShell from '@/features/refund/print/workspace/components/RefundReceiptPrintShell';
import { prepareRefundReceiptPrintProjection } from '@/features/refund/print/workspace/policies/refundReceiptPrintPolicy';

const PrintRefundReceiptPage = () => {
  const { saleReturnId } = useParams();
  const { getSaleReturnByIdAction } = useSaleReturnStore();
  const { branch } = useEmployeeStore();
  const [saleReturn, setSaleReturn] = useState(null);

  useEffect(() => {
    const load = async () => {
      const result = await getSaleReturnByIdAction(saleReturnId);
      setSaleReturn(result);
    };
    load();
  }, [saleReturnId, getSaleReturnByIdAction]);

  if (!saleReturn) return <RefundReceiptPrintState />;

  const projection = prepareRefundReceiptPrintProjection(saleReturn, branch);
  const handlePrint = () => window.print();

  return (
    <RefundReceiptPrintShell
      projection={projection}
      toolbar={<RefundReceiptPrintToolbar onPrint={handlePrint} />}
    />
  );
};

export default PrintRefundReceiptPage;
