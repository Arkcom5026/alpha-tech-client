import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useBranchStore } from '@/features/branch/store/branchStore';
import BillLayoutShortTax from '@/features/bill/components/BillLayoutShortTax';
import FullTaxA4Document from '../bill/components/FullTaxA4Document';
import {
  getOutputTaxPrintable,
  getTaxDocumentPresentation,
} from '@/features/tax/intake/api/taxIntakeApi';
import {
  resolveStatutoryPresentation,
  visibleStatutoryBlockContent,
} from '@/features/printing/presentation/statutoryPresentation';
import StatutoryTaxPresentationFooter from '@/features/printing/presentation/StatutoryTaxPresentationFooter';

const DOCUMENT_TYPE_LABELS = {
  SHORT_TAX_INVOICE: 'ใบกำกับภาษีอย่างย่อ',
  FULL_TAX_INVOICE: 'ใบกำกับภาษีเต็มรูป',
};

const TaxPrintToolbar = ({ documentType, onBack, onPrint }) => (
  <div className="w-full border-b border-slate-200 bg-white px-4 py-3 print:hidden">
    <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-slate-800">{DOCUMENT_TYPE_LABELS[documentType] || 'เอกสารภาษี'}</div>
        <div className="text-xs text-slate-500">รูปแบบการพิมพ์ยึดตามชนิดเอกสารภาษีที่ออกจริง</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          <Printer className="h-4 w-4" />
          พิมพ์
        </button>
      </div>
    </div>
  </div>
);

const TaxReplacementNotice = ({ replacement }) => {
  if (!replacement) return null;
  return (
    <div className="mx-auto mt-3 max-w-[1100px] px-4 print:hidden">
      <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
        <div className="font-semibold">กำลังแสดงรายการเอกสารฉบับทดแทน #{replacement.replacementNumber || '-'}</div>
        <div className="mt-1 text-xs text-teal-800">
          ระบบเปลี่ยนเฉพาะรายการสำหรับการพิมพ์ ยอดก่อนภาษี ภาษีมูลค่าเพิ่ม ยอดรวม ชนิดใบกำกับ เลขที่เอกสาร และรอบภาษียังคงยึดตามใบกำกับภาษีที่ออกจริง
        </div>
        {replacement.reason ? (
          <div className="mt-1 text-xs text-teal-700">เหตุผล: {replacement.reason}</div>
        ) : null}
      </div>
    </div>
  );
};

const PrintConsolidatedTaxPage = ({ expectedDocumentType = null }) => {
  const { taxDocumentId } = useParams();
  const [query] = useSearchParams();
  const navigate = useNavigate();
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
        unit: line.unitName || 'ชิ้น',
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
        // issuer snapshot. Replacement projection may change printable lines only.
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
      presentationFooter: {
        notes: visibleStatutoryBlockContent(presentation, 'NOTES'),
        customFooter: visibleStatutoryBlockContent(presentation, 'CUSTOM_FOOTER'),
      },
    };
  }, [data, presentation]);

  const handleBack = () => navigate(-1);
  const handlePrint = () => window.print();

  if (error) return <main className="p-6 text-red-700">{error}</main>;
  if (!view) return <main className="p-6">กำลังเตรียมเอกสาร...</main>;

  const actualDocumentType = data.document?.type;
  const isSupportedDocumentType = actualDocumentType === 'SHORT_TAX_INVOICE'
    || actualDocumentType === 'FULL_TAX_INVOICE';

  if (!isSupportedDocumentType) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <TaxPrintToolbar documentType={actualDocumentType} onBack={handleBack} onPrint={handlePrint} />
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          ไม่สามารถพิมพ์เอกสารนี้ได้ เนื่องจากชนิดเอกสารภาษีไม่รองรับการพิมพ์จากหน้านี้
        </div>
      </main>
    );
  }

  if (expectedDocumentType && actualDocumentType !== expectedDocumentType) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="print:hidden">
          <TaxPrintToolbar documentType={actualDocumentType} onBack={handleBack} onPrint={handlePrint} />
        </div>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <div className="font-semibold">ชนิดเอกสารไม่ตรงกับรูปแบบที่เลือก</div>
          <div className="mt-1">
            เอกสารเลขที่ {data.document?.number || '-'} เป็น {DOCUMENT_TYPE_LABELS[actualDocumentType] || actualDocumentType}
            {' '}จึงไม่สามารถแสดงเป็น {DOCUMENT_TYPE_LABELS[expectedDocumentType] || expectedDocumentType} ได้
          </div>
          <div className="mt-2 text-xs text-amber-800">
            ระบบจะไม่เปลี่ยนชนิดเอกสารภาษีด้วยการเปลี่ยนรูปแบบหน้าพิมพ์ เพื่อรักษาความถูกต้องของเอกสารที่ออกจริง
          </div>
        </div>
      </main>
    );
  }

  if (actualDocumentType === 'SHORT_TAX_INVOICE') {
    return (
      <>
        <TaxPrintToolbar documentType={actualDocumentType} onBack={handleBack} onPrint={handlePrint} />
        <TaxReplacementNotice replacement={data.replacementProjection} />
        <div className="bill-print-root mx-auto w-[80mm] bg-white p-4 print:p-0">
          <BillLayoutShortTax
            sale={view.sale}
            saleItems={view.items}
            payments={[view.payment]}
            config={view.config}
            hideContactName
          />
          <div className="px-2 pb-3 print:px-0">
            <StatutoryTaxPresentationFooter
              customFooter={view.presentationFooter.customFooter}
              compact
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TaxPrintToolbar documentType={actualDocumentType} onBack={handleBack} onPrint={handlePrint} />
      <TaxReplacementNotice replacement={data.replacementProjection} />
      <FullTaxA4Document
        sale={view.sale}
        saleItems={view.items}
        payments={[view.payment]}
        config={view.config}
        presentationFooter={view.presentationFooter}
      />
    </>
  );
};

export default PrintConsolidatedTaxPage;
