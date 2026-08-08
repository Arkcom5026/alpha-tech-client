import { useCallback, useEffect, useRef } from 'react'

const PRINT_RETURN_FALLBACK_MS = 60_000

const useBillShortTaxPrintRuntime = ({
  autoPrint,
  saleId,
  saleItemsCount,
  paymentId,
  config,
  returnToSale,
}) => {
  const printedRef = useRef(false)
  const printRootRef = useRef(null)

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
  }, [saleId, saleItemsCount, paymentId, config])

  const printAndReturnToSale = useCallback(() => {
    let returned = false
    let fallbackTimerId = null

    const cleanup = () => {
      window.removeEventListener('afterprint', returnOnce)
      if (fallbackTimerId !== null) {
        window.clearTimeout(fallbackTimerId)
        fallbackTimerId = null
      }
    }

    const returnOnce = () => {
      if (returned) return
      returned = true
      cleanup()
      returnToSale()
    }

    window.addEventListener('afterprint', returnOnce, { once: true })

    try {
      window.focus?.()
      window.print?.()
      fallbackTimerId = window.setTimeout(returnOnce, PRINT_RETURN_FALLBACK_MS)
    } catch {
      cleanup()
      returnOnce()
    }
  }, [returnToSale])

  useEffect(() => {
    if (!autoPrint) return
    if (printedRef.current) return
    if (!saleId) return
    if (!config) return
    if (!saleItemsCount) return
    if (!paymentId) return

    printedRef.current = true

    const timerId = window.setTimeout(() => {
      printAndReturnToSale()
    }, 300)

    return () => window.clearTimeout(timerId)
  }, [autoPrint, saleId, config, saleItemsCount, paymentId, printAndReturnToSale])

  return Object.freeze({
    printRootRef,
    printAndReturnToSale,
  })
}

export { PRINT_RETURN_FALLBACK_MS, useBillShortTaxPrintRuntime }
export default useBillShortTaxPrintRuntime
