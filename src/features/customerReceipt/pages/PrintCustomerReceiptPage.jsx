import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import useCustomerReceiptStore from '../store/customerReceiptStore'
import CustomerReceiptPrintToolbar from '../print/workspace/components/CustomerReceiptPrintToolbar'
import CustomerReceiptPrintState from '../print/workspace/components/CustomerReceiptPrintState'
import CustomerReceiptPrintShell from '../print/workspace/components/CustomerReceiptPrintShell'

const PrintCustomerReceiptPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const printedRef = useRef(false)
  const printRootRef = useRef(null)
  const [printMode, setPrintMode] = useState('FULL')

  const autoPrint = useMemo(() => {
    const value = String(searchParams.get('autoPrint') || '').toLowerCase()
    return value === '1' || value === 'true' || value === 'yes'
  }, [searchParams])

  const requestedMode = useMemo(() => {
    const value = String(searchParams.get('mode') || '').toUpperCase()
    return value === 'SHORT' ? 'SHORT' : 'FULL'
  }, [searchParams])

  const selectedItem = useCustomerReceiptStore((state) => state.selectedItem)
  const detailLoading = useCustomerReceiptStore((state) => state.detailLoading)
  const printLoading = useCustomerReceiptStore((state) => state.printLoading)
  const error = useCustomerReceiptStore((state) => state.error)
  const loadCustomerReceiptForPrintAction = useCustomerReceiptStore(
    (state) => state.loadCustomerReceiptForPrintAction
  )
  const clearCustomerReceiptMessagesAction = useCustomerReceiptStore(
    (state) => state.clearCustomerReceiptMessagesAction
  )
  const clearSelectedCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.clearSelectedCustomerReceiptAction
  )

  useEffect(() => {
    setPrintMode(requestedMode)
  }, [requestedMode])

  useEffect(() => {
    printedRef.current = false
    clearCustomerReceiptMessagesAction()

    if (!id) return undefined

    loadCustomerReceiptForPrintAction(Number(id)).catch(() => null)

    return () => {
      clearCustomerReceiptMessagesAction()
      clearSelectedCustomerReceiptAction()
    }
  }, [
    id,
    loadCustomerReceiptForPrintAction,
    clearCustomerReceiptMessagesAction,
    clearSelectedCustomerReceiptAction,
  ])

  useEffect(() => {
    const updatePrintHeight = () => {
      if (printMode !== 'SHORT') return
      if (typeof document === 'undefined') return

      const element = printRootRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const measuredHeight = Math.max(
        Math.ceil(rect.height || 0),
        element.scrollHeight || 0,
        element.offsetHeight || 0
      )

      if (measuredHeight > 0) {
        document.documentElement.style.setProperty(
          '--customer-receipt-short-height',
          `${measuredHeight}px`
        )
      }
    }

    updatePrintHeight()
    const frameId = window.requestAnimationFrame(updatePrintHeight)
    const timerId = window.setTimeout(updatePrintHeight, 150)
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePrintHeight) : null

    if (printRootRef.current && resizeObserver) {
      resizeObserver.observe(printRootRef.current)
    }

    window.addEventListener('beforeprint', updatePrintHeight)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timerId)
      window.removeEventListener('beforeprint', updatePrintHeight)
      resizeObserver?.disconnect()
      document.documentElement.style.removeProperty('--customer-receipt-short-height')
    }
  }, [printMode, selectedItem?.id, selectedItem?.allocations?.length])

  const handleBack = useCallback(() => {
    const currentPath = window.location.pathname
    const printIndex = currentPath.indexOf('/print')

    if (printIndex >= 0) {
      navigate(currentPath.substring(0, printIndex))
      return
    }

    const listIndex = currentPath.indexOf('/customer-receipts')
    if (listIndex >= 0) {
      navigate(`${currentPath.substring(0, listIndex)}/customer-receipts`)
      return
    }

    navigate(-1)
  }, [navigate])

  const handlePrint = useCallback(() => {
    try {
      window.focus?.()
      window.print?.()
    } catch {
      // Ignore browser print failures; the document remains available for retry.
    }
  }, [])

  useEffect(() => {
    if (!autoPrint) return
    if (detailLoading || printLoading) return
    if (error) return
    if (!selectedItem?.id) return
    if (Number(selectedItem.id) !== Number(id)) return
    if (printedRef.current) return

    printedRef.current = true
    const timer = window.setTimeout(handlePrint, 300)
    return () => window.clearTimeout(timer)
  }, [autoPrint, detailLoading, printLoading, error, id, selectedItem?.id, handlePrint])

  const hasReceipt = Boolean(selectedItem?.id)
  const stateView = (
    <CustomerReceiptPrintState
      id={id}
      detailLoading={detailLoading}
      printLoading={printLoading}
      error={error}
      hasReceipt={hasReceipt}
    />
  )

  if (!id || detailLoading || printLoading || error || !hasReceipt) {
    return stateView
  }

  return (
    <>
      <CustomerReceiptPrintToolbar
        receiptCode={selectedItem?.code || '-'}
        autoPrint={autoPrint}
        printMode={printMode}
        onBack={handleBack}
        onPrint={handlePrint}
        onChangeMode={setPrintMode}
      />

      <CustomerReceiptPrintShell
        receipt={selectedItem}
        printMode={printMode}
        printRootRef={printRootRef}
      />
    </>
  )
}

export default PrintCustomerReceiptPage
