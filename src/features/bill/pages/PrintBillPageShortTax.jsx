// src/features/bill/pages/PrintBillPageShortTax.jsx
// 🏛️ Premium Next-Gen POS Print Page: (Short Thermal Receipt Core Logic Restored)

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import BillLayoutShortTax from '../components/BillLayoutShortTax'
import { useBillStore } from '@/features/bill/store/billStore'
import useSalesStore from '@/features/sales/store/salesStore'

const normalizeDocumentText = (value) => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const nullableDocumentText = (value) => {
  const normalized = normalizeDocumentText(value)
  return normalized || null
}

const PrintBillPageShortTax = () => {
  const params = useParams()
  const saleId = params.id || params.saleId
  const printedRef = useRef(false)
  const printRootRef = useRef(null)

  const [searchParams] = useSearchParams()

  const paymentId = useMemo(() => {
    const v = searchParams.get('paymentId')
    return v ? String(v) : null
  }, [searchParams])

  const autoPrint = useMemo(() => {
    const v = String(searchParams.get('autoPrint') || '').toLowerCase()
    return v === '1' || v === 'true' || v === 'yes'
  }, [searchParams])

  const {
    sale,
    payment,
    saleItems,
    config,
    loading,
    error,
    loadSaleByIdAction,
    resetAction,
  } = useBillStore()

  const { updateSaleDocumentLinesAction } = useSalesStore()

  const [pageError, setPageError] = useState('')
  const [editingLineKey, setEditingLineKey] = useState(null)
  const [lineDrafts, setLineDrafts] = useState({})
  const [savingLineKey, setSavingLineKey] = useState(null)

  const reloadSaleForPrint = async () => {
    if (!saleId) return

    await loadSaleByIdAction(
      saleId,
      paymentId
        ? {
            paymentId,
            params: { paymentId },
          }
        : undefined
    )
  }

  useEffect(() => {
    const run = async () => {
      try {
        setPageError('')
        await reloadSaleForPrint()
      } catch {
        // error handled in store
      }
    }

    run()

    return () => {
      resetAction()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleId, paymentId])

  useEffect(() => {
    printedRef.current = false
  }, [saleId, autoPrint])

  useEffect(() => {
    const updatePrintHeight = () => {
      const element = printRootRef.current
      if (!element || typeof document === 'undefined') return

      const rect = element.getBoundingClientRect()
      const measuredHeight = Math.max(
        Math.ceil(rect.height || 0),
        element.scrollHeight || 0,
        element.offsetHeight || 0
      )

      if (measuredHeight > 0) {
        document.documentElement.style.setProperty(
          '--short-tax-receipt-height',
          `${measuredHeight}px`
        )
      }
    }

    updatePrintHeight()

    const frameId = window.requestAnimationFrame(updatePrintHeight)
    const timerId = window.setTimeout(updatePrintHeight, 150)

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updatePrintHeight)
        : null

    if (printRootRef.current && resizeObserver) {
      resizeObserver.observe(printRootRef.current)
    }

    window.addEventListener('beforeprint', updatePrintHeight)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timerId)
      window.removeEventListener('beforeprint', updatePrintHeight)
      resizeObserver?.disconnect()
      document.documentElement.style.removeProperty('--short-tax-receipt-height')
    }
  }, [sale?.id, saleItems?.length, payment?.id, config])

  useEffect(() => {
    if (!autoPrint) return
    if (printedRef.current) return
    if (!sale?.id) return
    if (!config) return
    if (!saleItems?.length) return
    if (!payment) return

    printedRef.current = true

    const t = setTimeout(() => {
      try {
        window.focus?.()
        window.print?.()
      } catch {
        // ignore
      }
    }, 300)

    return () => clearTimeout(t)
  }, [autoPrint, sale?.id, config, saleItems?.length, payment?.id])

  const handlePrint = () => {
    try {
      window.focus?.()
      window.print?.()
    } catch {
      // ignore
    }
  }

  const handleToggleDocumentLineEdit = (item) => {
    const key = item?.documentLineKey || item?.id
    if (!key) return

    setEditingLineKey((current) => {
      if (current === key) return null

      setLineDrafts((prev) => ({
        ...prev,
        [key]: {
          documentPrefix: item?.documentPrefix || '',
          documentDescriptionRaw: item?.documentDescriptionRaw || '',
          documentSuffix: item?.documentSuffix || '',
        },
      }))

      return key
    })
  }

  const handleChangeDocumentLineDraft = (item, field, value) => {
    const key = item?.documentLineKey || item?.id
    if (!key) return

    setLineDrafts((prev) => ({
      ...prev,
      [key]: {
        documentPrefix: item?.documentPrefix || '',
        documentDescriptionRaw: item?.documentDescriptionRaw || '',
        documentSuffix: item?.documentSuffix || '',
        ...(prev?.[key] || {}),
        [field]: value,
      },
    }))
  }

  const handleSaveDocumentLine = async (item) => {
    const key = item?.documentLineKey || item?.id
    if (!key || !saleId) return

    if (typeof updateSaleDocumentLinesAction !== 'function') {
      setPageError('ไม่พบ action สำหรับบันทึกข้อความก่อน/หลังสินค้า')
      return
    }

    const draft = {
      documentPrefix: item?.documentPrefix || '',
      documentDescriptionRaw: item?.documentDescriptionRaw || '',
      documentSuffix: item?.documentSuffix || '',
      ...(lineDrafts?.[key] || {}),
    }

    const saleItemIds = Array.isArray(item?.saleItemIds) ? item.saleItemIds : []
    const simpleItemIds = Array.isArray(item?.simpleItemIds) ? item.simpleItemIds : []

    const makePayloadLine = (id) => ({
      id,
      documentPrefix: nullableDocumentText(draft.documentPrefix),
      documentDescription: nullableDocumentText(draft.documentDescriptionRaw),
      documentSuffix: nullableDocumentText(draft.documentSuffix),
    })

    setSavingLineKey(key)
    setPageError('')

    try {
      const result = await updateSaleDocumentLinesAction(
        saleId,
        {
          items: saleItemIds.map(makePayloadLine),
          simpleItems: simpleItemIds.map(makePayloadLine),
        },
        { refresh: false }
      )

      if (!result?.ok) {
        setPageError(result?.error || 'บันทึกข้อความก่อน/หลังสินค้าไม่สำเร็จ')
        return
      }

      // ✅ Clear same-sale cache before reloading updated document lines.
      resetAction()
      await reloadSaleForPrint()

      setEditingLineKey(null)
      setLineDrafts((prev) => {
        const next = { ...(prev || {}) }
        delete next[key]
        return next
      })
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'บันทึกข้อความก่อน/หลังสินค้าไม่สำเร็จ'

      setPageError(msg)
    } finally {
      setSavingLineKey(null)
    }
  }

  // 🟢 FIXED: สับเปลี่ยนกล่องสถานะขณะประมวลผลให้อ่านชัดเจน ไม่จมหายในเลเยอร์โหมดมืด
  if (loading) {
    return <div className="text-center p-8 text-zinc-400 font-bold bg-slate-900 min-h-screen">⏳ กำลังโหลดข้อมูลใบเสร็จรับเงิน...</div>
  }

  if (error || pageError) {
    return <div className="text-center p-8 text-rose-400 font-bold bg-slate-900 min-h-screen">เกิดข้อผิดพลาด: {error || pageError}</div>
  }

  if (!sale || !saleItems?.length || !config) {
    return <div className="text-center p-8 text-zinc-400 font-bold bg-slate-900 min-h-screen">ไม่พบข้อมูลใบเสร็จตามรหัสอ้างอิง</div>
  }

  if (!payment) {
    return (
      <div className="text-center p-8 text-amber-400 font-bold bg-slate-900 min-h-screen">
        ใบขายนี้ยังไม่มีการรับชำระ จึงยังไม่สามารถพิมพ์ใบเสร็จได้
      </div>
    )
  }

  const customerType = sale.customer?.type || 'PERSON'
  const hideContactName = customerType === 'ORGANIZATION' || customerType === 'GOVERNMENT'

  return (
    <>
      <style>{`
        .bill-print-root {
          font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif;
        }

        @page {
          size: 80mm auto;
          margin: 0;
        }

        @media print {
          html,
          body,
          #root {
            width: 80mm !important;
            height: var(--short-tax-receipt-height, auto) !important;
            min-height: var(--short-tax-receipt-height, 0) !important;
            max-height: var(--short-tax-receipt-height, none) !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #fff !important;
          }

          html,
          body {
            position: relative !important;
          }

          body * {
            visibility: hidden !important;
          }

          .bill-print-root,
          .bill-print-root * {
            visibility: visible !important;
          }

          .bill-print-root {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            display: block !important;
            width: 80mm !important;
            max-width: 80mm !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }
        }
      `}</style>

      {/* เครื่องมือควบคุมเฉพาะหน้าใบเสร็จย่อ — ไม่พึ่ง Shared DocumentToolbar */}
      <div className="w-full bg-slate-900 px-4 py-4 print:hidden">
        <div className="mx-auto flex max-w-[80mm] items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            พิมพ์ใบเสร็จ
          </button>

          {autoPrint ? (
            <span className="text-xs font-medium text-emerald-300">
              Auto print เปิดอยู่
            </span>
          ) : null}
        </div>
      </div>

      {/* 🟢 FIXED: สลักคลาส CSS ตัดสิทธิ์ควบคุมความมืด บังคับให้หน้ากระดาษเป็นสีขาว ตัวหนังสือสีดำสนิท 100% */}
      {/* เติมคลาส bg-white text-black dark:bg-white dark:text-black คลุมหมดจดทั่วทั้งแผ่นม้วนกระดาษ */}
      <div className="w-full bg-white text-black dark:bg-white dark:text-black py-6 px-4 print:w-auto print:p-0 print:m-0 print:min-h-0 print:h-auto print:bg-white">
        <div
          ref={printRootRef}
          className="bill-print-root mx-auto w-[80mm] max-w-[80mm] bg-white text-black dark:bg-white dark:text-black p-4 rounded-xl border border-zinc-200 shadow-sm print:p-0 print:border-none print:shadow-none"
        >
          <BillLayoutShortTax
            sale={sale}
            saleItems={saleItems}
            payments={payment ? [payment] : []}
            config={{ ...config, hideDate: false }}
            hideContactName={hideContactName}
            editableDocumentLines
            editingLineKey={editingLineKey}
            lineDrafts={lineDrafts}
            savingLineKey={savingLineKey}
            onToggleDocumentLineEdit={handleToggleDocumentLineEdit}
            onChangeDocumentLineDraft={handleChangeDocumentLineDraft}
            onSaveDocumentLine={handleSaveDocumentLine}
          />
        </div>
      </div>
    </>
  )
}

export default PrintBillPageShortTax