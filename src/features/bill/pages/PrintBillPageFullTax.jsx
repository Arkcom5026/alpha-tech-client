// src/features/bill/pages/PrintBillPageFullTax.jsx

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax'
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

const PrintBillPageFullTax = () => {
  const params = useParams()
  const saleId = params.saleId || params.id
  const printedRef = useRef(false)

  const [searchParams] = useSearchParams()

  const paymentId = useMemo(() => {
    const v = searchParams.get('paymentId')
    return v ? String(v) : null
  }, [searchParams])

  // ✅ Document Workspace baseline:
  // - default: ไม่ auto print เพื่อให้ผู้ใช้ตรวจ/แก้ Document Line ก่อน
  // - ถ้าต้องการ behavior เดิม ให้เปิดด้วย ?autoPrint=1
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
        resetAction()
        await reloadSaleForPrint()
      } catch {
        // store handles error
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

  // ✅ Auto-print is now opt-in only via ?autoPrint=1
  useEffect(() => {
    if (!autoPrint) return
    if (printedRef.current) return
    if (!sale?.id) return
    if (!config) return
    if (!Array.isArray(saleItems) || saleItems.length === 0) return
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
  }, [autoPrint, sale?.id, config, saleItems, payment?.id])

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
      
      // ✅ Force reload: clear billStore cache before loading same saleId again
      resetAction()
      await reloadSaleForPrint()
      
      setEditingLineKey(null)
      setLineDrafts((prev) => {
        const next = { ...(prev || {}) }
        delete next[key]
        return next
      })

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

  if (loading) {
    return <div className="text-center p-6 text-gray-700">⏳ กำลังโหลดข้อมูลใบเสร็จ...</div>
  }

  if (error || pageError) {
    return <div className="text-center p-6 text-red-600">เกิดข้อผิดพลาด: {error || pageError}</div>
  }

  if (!sale || !Array.isArray(saleItems) || saleItems.length === 0 || !payment || !config) {
    return <div className="text-center p-6 text-gray-700">ไม่พบข้อมูลใบเสร็จ</div>
  }

  return (
    <>
      <style>{`
        .bill-print-root { font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif; }
      `}</style>

      <div className="bill-print-root">
        <BillLayoutFullTax
          sale={sale}
          saleItems={saleItems}
          payments={[payment]}
          config={config}
          mode="full"
          taxMode="full"
          editableDocumentLines
          editingLineKey={editingLineKey}
          lineDrafts={lineDrafts}
          savingLineKey={savingLineKey}
          onToggleDocumentLineEdit={handleToggleDocumentLineEdit}
          onChangeDocumentLineDraft={handleChangeDocumentLineDraft}
          onSaveDocumentLine={handleSaveDocumentLine}
        />
      </div>
    </>
  )
}

export default PrintBillPageFullTax
