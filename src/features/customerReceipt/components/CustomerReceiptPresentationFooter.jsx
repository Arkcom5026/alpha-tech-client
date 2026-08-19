import React from 'react'

const CustomerReceiptPresentationFooter = ({ content, fontSizePx = 11 }) => {
  const notes = String(content?.notes || '').trim()
  const customFooter = String(content?.customFooter || '').trim()
  if (!notes && !customFooter) return null

  return (
    <div
      data-testid="customer-receipt-presentation-footer"
      className="mt-1 max-h-[11mm] overflow-hidden text-left text-slate-700"
      style={{ '--customer-receipt-footer-font-size': `${fontSizePx}px` }}
    >
      <div className="space-y-0.5" style={{ fontSize: 'var(--customer-receipt-footer-font-size)', lineHeight: 1.2 }}>
        {notes ? <p><span className="font-bold">หมายเหตุ:</span> {notes}</p> : null}
        {customFooter ? <p className="font-semibold">{customFooter}</p> : null}
      </div>
    </div>
  )
}

export default CustomerReceiptPresentationFooter
