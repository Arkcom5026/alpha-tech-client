import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useBranchStore } from '@/features/branch/store/branchStore';
import BillLayoutShortTax from '@/features/bill/components/BillLayoutShortTax';
import FullTaxA4Document from '../bill/components/FullTaxA4Document';
import {
  getOutputTaxPrintable,
  getTaxDocumentPresentation,
} from '@/features/tax/intake/api/taxIntakeApi';
import { resolveStatutoryPresentation } from '@/features/printing/presentation/statutoryPresentation';

const PrintConsolidatedTaxPage = () => {
  const { taxDocumentId } = useParams();
  const [query] = useSearchParams();
  const selectedBranchId = useBranchStore((state) => Number(state.selectedBranchId || state.currentBranch?.id || 0));
  const branchId = Number(query.get('branchId') || selectedBranchId);
  const [data, setData] = useState(null);
  const [presentationAuthority, setPresentationAuthority] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setData(null);
    setPresentationAuthority(null);
    setError('');

    Promise.all([
      getOutputTaxPrintable({ branchId, taxDocumentId }),
      getTaxDocumentPresentation({ branchId, taxDocumentId }),
    ])
      .then(([printable, presentation]) => {
        if (!alive) return;
        setData(printable);
        setPresentationAuthority(presentation);
      })
      .catch((e) => {
        if (alive) setError(e.response?.data?.message || e.message);
      });

    return () => {
      alive = false;
    };
  }, [branchId, taxDocumentId]);

  const presentation = useMemo(() => {
    if (!data) return null;
    return resolveStatutoryPresentation({
      documentPurpose: data.document?.type,
      presentationSnapshot: presentationAuthority?.presentationSnapshot,
      issuer: data.issuer,
    });
  }, [data, presentationAuthority?.presentationSnapshot]);

  const view = useMemo(() => {
    if (!data || !presentation) return null;
    const legalHeader = presentation.legalHeader || {};
    const issuer = data.issuer || {};
    const recipient = data.recipient || null;

    return {
      sale: {
        id: `tax-${data.document.id}`,
        code: data.document.number,
        createdAt: data.document.issuedAt,
        soldAt: data.document.issuedAt,
        totalAmount: data.document.totalAmount,
        vat: data.document.taxAmount,
        customer: {
          name: recipient?.legalName || data.sale?.customerName,
          companyName: recipient?.legalName || data.sale?.customerName,
          taxId: recipient?.taxId || data.sale?.customerTaxId,
          address: recipient?.registeredAddress,
        },
        branch: {
          companyName: issuer.legalName,
          name: issuer.legalName,
          address: issuer.registeredAddress,
          phone: issuer.phone,
          taxId: issuer.taxId,
        },
      },
      items: data.lines.map((line) => ({
        id: line.id,
        productName: line.description,
        documentDescription: line.description,
        quantity: line.quantity,
        unit: 'ชิ้น',
        unitPrice: line.unitAmount,
        amount: line.lineAmount,
      })),
      payment: {
        id: `tax-payment-${data.document.id}`,
        method: 'TRANSFER',
        amount: data.document.totalAmount,
      },
      config: {
        // Statutory legal identity always comes from the immutable TaxDocument
        // issuer snapshot. Presentation may decorate it but may never replace it.
        branchName: issuer.legalName || '-',
        address: issuer.registeredAddress || '-',
        phone: issuer.phone || '-',
        taxId: issuer.taxId || '-',
        logoUrl: legalHeader.showLogo === false ? null : (legalHeader.logoUrl || null),
        logoPosition: legalHeader.logoPosition,
        logoSize: legalHeader.logoSize,
        textAlign: legalHeader.textAlign,
        storeNameSize: legalHeader.storeNameSize,
        vatRate: 7,
      },
    };
  }, [data, presentation]);

  if (error) return <main className="p-6 text-red-700">{error}</main>;
  if (!view) return <main className="p-6">กำลังเตรียมเอกสาร...</main>;

  if (data.document.type === 'SHORT_TAX_INVOICE') {
    return (
      <div className="bill-print-root mx-auto w-[80mm] bg-white p-4 print:p-0">
        <BillLayoutShortTax
          sale={view.sale}
          saleItems={view.items}
          payments={[view.payment]}
          config={view.config}
          hideContactName
        />
      </div>
    );
  }

  return (
    <FullTaxA4Document
      sale={view.sale}
      saleItems={view.items}
      payments={[view.payment]}
      config={view.config}
    />
  );
};

export default PrintConsolidatedTaxPage;
