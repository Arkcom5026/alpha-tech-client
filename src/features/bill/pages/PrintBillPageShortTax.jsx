// src/features/bill/pages/PrintBillPageShortTax.jsx
// 🏛️ Premium Next-Gen POS Print Page: (Short Thermal Receipt Core Logic Restored)

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import BillLayoutShortTax from '../components/BillLayoutShortTax'
import { useBillStore } from '@/features/bill/store/billStore'
import useSalesStore from '@/features/sales/store/salesStore'
import DocumentToolbar from '@/features/documents/components/DocumentToolbar'

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
        .bill-print-root { font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif; }
      `}</style>

      {/* 🎛️ เครื่องมือควบคุมด้านบนของเอกสารพิมพ์ */}
      <DocumentToolbar
        actions={[
          {
            key: 'print-receipt-short',
            label: 'พิมพ์ใบเสร็จ',
            onClick: handlePrint,
            variant: 'primary',
          },
        ]}
        note={autoPrint ? 'Auto print เปิดอยู่' : undefined}
      />

      {/* 🟢 FIXED: สลักคลาส CSS ตัดสิทธิ์ควบคุมความมืด บังคับให้หน้ากระดาษเป็นสีขาว ตัวหนังสือสีดำสนิท 100% */}
      {/* เติมคลาส bg-white text-black dark:bg-white dark:text-black คลุมหมดจดทั่วทั้งแผ่นม้วนกระดาษ */}
      <div className="w-full min-h-screen bg-white text-black dark:bg-white dark:text-black py-6 px-4 print:p-0 print:bg-white">
        <div className="bill-print-root mx-auto max-w-[80mm] bg-white text-black dark:bg-white dark:text-black p-4 rounded-xl border border-zinc-200 shadow-sm print:p-0 print:border-none print:shadow-none">
          <BillLayoutShortTax
            sale={sale}
            saleItems={saleItems}
            payments={payment ? [payment] : []}
            config={{ ...config, hideDate: true }}
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