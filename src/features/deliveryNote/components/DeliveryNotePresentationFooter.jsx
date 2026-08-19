import React from 'react'

const DeliveryNotePresentationFooter = ({ content, fontSizePx = 11 }) => {
  const deliveryTerms = String(content?.deliveryTerms || '').trim()
  const notes = String(content?.notes || '').trim()
  const customFooter = String(content?.customFooter || '').trim()
  if (!deliveryTerms && !notes && !customFooter) return null

  return (
    <div
      data-testid="delivery-note-presentation-footer"
      className="dn-presentation-footer rounded border border-slate-300 bg-white px-3 py-2 text-slate-700"
      style={{ '--delivery-note-footer-font-size': `${fontSizePx}px` }}
    >
      <div className="space-y-1" style={{ fontSize: 'var(--delivery-note-footer-font-size)', lineHeight: 1.35 }}>
        {deliveryTerms ? (
          <p><span className="font-bold">เงื่อนไขการส่งมอบ:</span> {deliveryTerms}</p>
        ) : null}
        {notes ? (
          <p><span className="font-bold">หมายเหตุ:</span> {notes}</p>
        ) : null}
        {customFooter ? <p className="font-semibold">{customFooter}</p> : null}
      </div>
    </div>
  )
}

export default DeliveryNotePresentationFooter
