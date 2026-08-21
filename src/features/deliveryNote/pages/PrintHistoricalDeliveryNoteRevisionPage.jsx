import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import StoreDocumentHeaderScope from '@/features/branch/documentHeader/StoreDocumentHeaderScope';
import { loadSaleDocument } from '@/features/sales/documents/workspace';
import { loadDeliveryNoteRevisionPrint } from '../api/deliveryNoteListLifecycleApi';
import DeliveryNotePresentationFooter from '../components/DeliveryNotePresentationFooter';
import DeliveryNoteDocumentState from '../components/workspace/DeliveryNoteDocumentState';
import {
  applyDeliveryNoteHeaderPresentation,
  deliveryNoteTypographyPx,
  resolveDeliveryNoteFooterContent,
  resolveDeliveryNotePresentation,
} from '../presentation/deliveryNotePresentation';
import DeliveryNotePrintShell from '../print/workspace/components/DeliveryNotePrintShell';
import { buildDeliveryNoteBranchConfig } from '../print/workspace/policies/deliveryNotePrintPolicy';
import {
  applyPersistedDeliveryNoteRevisionToSale,
  buildPersistedDeliveryNoteRevisionItems,
  hasPersistedDeliveryNoteRevision,
} from '../print/workspace/policies/deliveryNoteRevisionPresentation';

const stateLabel = (state) => {
  const normalized = String(state || '').toUpperCase();
  if (normalized === 'CURRENT') return 'ฉบับปัจจุบัน';
  if (normalized === 'SUPERSEDED') return 'มีฉบับใหม่แทนแล้ว';
  if (normalized === 'CANCELLED') return 'ยกเลิก';
  if (normalized === 'CONSOLIDATED') return 'นำไปรวมเอกสารแล้ว';
  return normalized || 'เอกสารย้อนหลัง';
};

const PrintHistoricalDeliveryNoteRevisionPage = () => {
  const { saleId, revisionId } = useParams();
  const [sale, setSale] = useState(null);
  const [authority, setAuthority] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hideDate, setHideDate] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!saleId || !revisionId) {
        if (active) {
          setError('ไม่พบรหัสเอกสารย้อนหลังที่ต้องการพิมพ์');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError('');
      try {
        const [sourceSale, historicalAuthority] = await Promise.all([
          loadSaleDocument({ saleId }),
          loadDeliveryNoteRevisionPrint({ saleId, revisionId }),
        ]);

        if (!hasPersistedDeliveryNoteRevision(historicalAuthority)
          || historicalAuthority?.document?.historicalPrint !== true) {
          throw new Error('ข้อมูลที่ได้รับไม่ใช่สำเนาประวัติใบส่งของที่บันทึกไว้');
        }

        if (active) {
          setSale(sourceSale ? { ...sourceSale, deliveryNoteAuthority: historicalAuthority } : null);
          setAuthority(historicalAuthority);
        }
      } catch (requestError) {
        if (active) {
          setSale(null);
          setAuthority(null);
          setError(
            requestError?.response?.data?.message
              || requestError?.response?.data?.error
              || requestError?.message
              || 'ไม่สามารถโหลดสำเนาประวัติใบส่งของได้',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [revisionId, saleId]);

  const saleItems = useMemo(() => buildPersistedDeliveryNoteRevisionItems({
    sale,
    authority,
  }), [authority, sale]);

  const printableSale = useMemo(() => applyPersistedDeliveryNoteRevisionToSale({
    sale,
    authority,
  }), [authority, sale]);

  const presentation = useMemo(() => resolveDeliveryNotePresentation({
    authority,
    branch: sale?.branch,
  }), [authority, sale?.branch]);

  const config = useMemo(() => applyDeliveryNoteHeaderPresentation({
    config: buildDeliveryNoteBranchConfig(sale),
    presentation,
  }), [presentation, sale]);

  const footerContent = useMemo(
    () => resolveDeliveryNoteFooterContent(presentation),
    [presentation],
  );
  const footerFontSize = useMemo(
    () => deliveryNoteTypographyPx(presentation, 'footer', 'md'),
    [presentation],
  );

  const historicalPrintMeta = useMemo(() => {
    if (!authority) return null;
    const document = authority.document || {};
    const revision = document.revision || {};
    return {
      revisionId: revision.id ?? authority?.deliveryNoteReadAuthority?.revisionId ?? null,
      revisionNumber: revision.revisionNumber ?? authority?.deliveryNoteReadAuthority?.revisionNumber ?? null,
      state: revision.state ?? document.lifecycleState ?? authority?.deliveryNoteReadAuthority?.state ?? null,
      currentAuthority: document.currentAuthority === true
        || authority?.deliveryNoteReadAuthority?.currentAuthority === true,
      documentNumber: document.documentNumber || authority?.deliveryNoteReadAuthority?.documentNumber || null,
    };
  }, [authority]);

  if (loading) {
    return <DeliveryNoteDocumentState status="loading" message="กำลังโหลดสำเนาประวัติใบส่งของสำหรับพิมพ์" />;
  }

  if (error) {
    return <DeliveryNoteDocumentState status="error" message={error} />;
  }

  if (!sale || !authority) {
    return <DeliveryNoteDocumentState status="empty" message="ไม่พบสำเนาประวัติใบส่งของที่ต้องการพิมพ์" />;
  }

  return (
    <StoreDocumentHeaderScope config={config}>
      <div className="mx-auto mb-4 w-full max-w-[980px] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm print:hidden">
        <div className="font-semibold">
          สำเนาประวัติ R{historicalPrintMeta?.revisionNumber || '-'} · {historicalPrintMeta?.documentNumber || '-'}
        </div>
        <div className="mt-1 text-amber-800">
          {stateLabel(historicalPrintMeta?.state)} · เอกสารนี้ใช้เป็นหลักฐานย้อนหลังเท่านั้น และไม่สามารถแก้ไขหรือคืนอำนาจทางธุรกิจให้ revision นี้ได้
        </div>
      </div>

      <DeliveryNotePrintShell
        sale={printableSale}
        hideDate={hideDate}
        setHideDate={setHideDate}
        saleItems={saleItems}
        config={config}
        historicalPrintMeta={historicalPrintMeta}
        presentationFooter={(
          <DeliveryNotePresentationFooter
            content={footerContent}
            fontSizePx={footerFontSize}
          />
        )}
        editableDocumentLines={false}
      />
    </StoreDocumentHeaderScope>
  );
};

export default PrintHistoricalDeliveryNoteRevisionPage;
