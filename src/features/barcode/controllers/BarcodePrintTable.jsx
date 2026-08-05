import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Calendar, FileText, Printer, Sparkles, User } from 'lucide-react';

import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const formatDateTh = (value) => {
  try {
    if (!value) return '-';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return '-';
  }
};

const getErrorMessage = (error) => {
  if (!error) return 'เกิดข้อผิดพลาด';
  if (typeof error === 'string') return error;
  return error?.response?.data?.message || error?.message || 'เกิดข้อผิดพลาด';
};

const printButtonClass =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto';

export default function BarcodePrintTable({ mode = 'UNPRINTED', receipts }) {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const { generateBarcodesAction, reprintBarcodesAction } = useBarcodeStore();

  const [selectedIds, setSelectedIds] = useState([]);
  const [uiError, setUiError] = useState('');
  const [printingId, setPrintingId] = useState(null);

  const normalizedReceipts = useMemo(
    () =>
      (Array.isArray(receipts) ? receipts : []).map((receipt) => ({
        id: receipt.id,
        purchaseOrderCode:
          receipt.purchaseOrderCode ?? receipt.orderCode ?? receipt.poCode ?? receipt.purchaseOrder?.code ?? '-',
        code: receipt.code ?? receipt.receiptCode ?? receipt.purchaseOrderReceiptCode ?? receipt.poReceiptCode ?? '-',
        supplier:
          typeof receipt.supplier === 'object'
            ? receipt.supplier?.name ?? '-'
            : receipt.supplier ?? receipt.supplierName ?? '-',
        receivedAt: receipt.receivedAt ?? receipt.createdAt ?? receipt.date ?? null,
        printed: Boolean(receipt.printed ?? receipt.isPrinted ?? false),
      })),
    [receipts]
  );

  const visibleReceipts = useMemo(() => {
    if (mode === 'UNPRINTED') return normalizedReceipts.filter((receipt) => !receipt.printed);
    return normalizedReceipts;
  }, [normalizedReceipts, mode]);

  const isAllSelected =
    mode === 'UNPRINTED' &&
    visibleReceipts.length > 0 &&
    visibleReceipts.every((receipt) => selectedIds.includes(receipt.id));

  const toggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : visibleReceipts.map((receipt) => receipt.id));
  };

  useEffect(() => {
    setSelectedIds([]);
    setUiError('');
  }, [mode, receipts]);

  const openPreview = (receiptId) => {
    const targetSlug = shopSlug || 'advancetech';
    navigate(`/${targetSlug}/pos/purchases/barcodes/preview/${receiptId}`);
  };

  const handlePrintClick = async (receiptId) => {
    if (!receiptId) return;
    setUiError('');
    try {
      setPrintingId(receiptId);
      await generateBarcodesAction(receiptId);
      openPreview(receiptId);
    } catch (error) {
      if (import.meta?.env?.DEV) console.error('[handlePrintClick]', error);
      setUiError(getErrorMessage(error));
    } finally {
      setPrintingId(null);
    }
  };

  const handleReprintClick = async (receiptId) => {
    if (!receiptId) return;
    setUiError('');
    try {
      setPrintingId(receiptId);
      await reprintBarcodesAction(receiptId);
      openPreview(receiptId);
    } catch (error) {
      if (import.meta?.env?.DEV) console.error('[handleReprintClick]', error);
      setUiError(getErrorMessage(error));
    } finally {
      setPrintingId(null);
    }
  };

  const renderPrintAction = (receipt) => {
    const isPrinting = printingId === receipt.id;
    if (mode === 'UNPRINTED') {
      return (
        <button
          type="button"
          onClick={() => handlePrintClick(receipt.id)}
          disabled={isPrinting}
          className={`${printButtonClass} border-teal-700 bg-teal-700 text-white hover:bg-teal-800`}
        >
          <Printer className="h-4 w-4" />
          {isPrinting ? 'กำลังสร้างฉลาก...' : 'พิมพ์ฉลาก'}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => handleReprintClick(receipt.id)}
        disabled={isPrinting}
        className={`${printButtonClass} border-slate-300 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800`}
      >
        <Printer className="h-4 w-4" />
        {isPrinting ? 'กำลังเตรียมงาน...' : 'พิมพ์ซ้ำ'}
      </button>
    );
  };

  if (visibleReceipts.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
        <FileText className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-3 text-base font-semibold text-slate-900">
          {mode === 'UNPRINTED' ? 'ไม่มีรายการค้างพิมพ์บาร์โค้ด' : 'ไม่พบรายการพิมพ์ซ้ำ'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">ลองเปลี่ยนคำค้นหาหรือตัวกรอง Supplier</p>
      </section>
    );
  }

  return (
    <div className="space-y-4 text-slate-800">
      {uiError && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="font-semibold">{uiError}</span>
          </div>
          <button type="button" onClick={() => setUiError('')} className="min-h-11 shrink-0 px-2 font-semibold underline">
            ปิด
          </button>
        </div>
      )}

      {mode === 'UNPRINTED' && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 md:hidden">
          <label className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="h-5 w-5 accent-teal-700" />
            เลือกทั้งหมด
          </label>
          <span className="text-sm text-slate-500">{selectedIds.length} รายการ</span>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="รายการใบรับสำหรับพิมพ์บาร์โค้ด">
        <div className="space-y-3 p-3 md:hidden">
          {visibleReceipts.map((receipt, index) => (
            <article key={receipt.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                {mode === 'UNPRINTED' && (
                  <input
                    type="checkbox"
                    aria-label={`เลือก ${receipt.code}`}
                    checked={selectedIds.includes(receipt.id)}
                    onChange={() => toggleSelect(receipt.id)}
                    className="mt-1 h-5 w-5 shrink-0 accent-teal-700"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500">ใบตรวจรับลำดับ {index + 1}</p>
                  <h2 className="mt-1 break-all text-base font-bold text-slate-950">{receipt.code}</h2>
                  <p className="mt-1 break-all text-xs font-medium text-slate-500">PO {receipt.purchaseOrderCode}</p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2 flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-500">Supplier</dt>
                    <dd className="break-words font-semibold text-slate-800">{receipt.supplier}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs text-slate-500">วันที่รับของ</dt>
                    <dd className="font-semibold text-slate-800">{formatDateTh(receipt.receivedAt)}</dd>
                  </div>
                </div>
              </dl>

              <div className="mt-4 border-t border-slate-200 pt-4">{renderPrintAction(receipt)}</div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500">
                <th className="w-14 px-4 py-4 text-center">
                  {mode === 'UNPRINTED' && (
                    <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="h-4 w-4 accent-teal-700" />
                  )}
                </th>
                <th className="w-16 px-4 py-4 text-center">ลำดับ</th>
                <th className="px-4 py-4">เลขใบสั่งซื้อ PO</th>
                <th className="px-4 py-4">เลขใบตรวจรับ RC</th>
                <th className="px-4 py-4">Supplier</th>
                <th className="px-4 py-4">วันที่รับของ</th>
                <th className="px-4 py-4 text-right">การจัดพิมพ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleReceipts.map((receipt, index) => (
                <tr key={receipt.id} className="transition hover:bg-teal-50/40">
                  <td className="px-4 py-4 text-center">
                    {mode === 'UNPRINTED' && (
                      <input
                        type="checkbox"
                        aria-label={`เลือก ${receipt.code}`}
                        checked={selectedIds.includes(receipt.id)}
                        onChange={() => toggleSelect(receipt.id)}
                        className="h-4 w-4 accent-teal-700"
                      />
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-xs font-semibold text-slate-400">{index + 1}</td>
                  <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-500">{receipt.purchaseOrderCode}</td>
                  <td className="px-4 py-4 font-mono font-bold text-slate-950">{receipt.code}</td>
                  <td className="px-4 py-4 font-semibold text-slate-800">{receipt.supplier}</td>
                  <td className="px-4 py-4 font-medium text-slate-500">{formatDateTh(receipt.receivedAt)}</td>
                  <td className="px-4 py-4 text-right">{renderPrintAction(receipt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {mode === 'UNPRINTED' && selectedIds.length > 0 && (
        <aside className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between" aria-label="คำสั่งพิมพ์รายการที่เลือก">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-teal-300" />
            เลือกแล้ว {selectedIds.length} ใบตรวจรับ
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="min-h-11 rounded-xl border border-slate-600 bg-slate-800 px-4 text-sm font-semibold text-slate-100 hover:bg-slate-700"
            >
              ยกเลิกการเลือก
            </button>
            <button
              type="button"
              onClick={() => {
                const targetSlug = shopSlug || 'advancetech';
                navigate(`/${targetSlug}/pos/purchases/barcodes/print?ids=${selectedIds.join(',')}`);
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-bold text-white hover:bg-teal-500"
            >
              <Printer className="h-4 w-4" />
              พิมพ์ที่เลือก ({selectedIds.length})
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
