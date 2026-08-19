import React from 'react'

const line = (label, value) => value ? (
  <div className="flex gap-2 leading-tight">
    <span className="shrink-0 font-bold">{label}</span>
    <span className="whitespace-pre-line">{value}</span>
  </div>
) : null

const PurchaseOrderPresentationFooter = ({ content = {}, fontSizePx = 11 }) => {
  if (!content?.commercialTerms && !content?.paymentTerms && !content?.deliveryTerms && !content?.notes && !content?.customFooter) return null
  return (
    <div
      data-testid="purchase-order-presentation-footer"
      className="mt-2 max-h-[34mm] overflow-hidden rounded-[2mm] border border-slate-300 p-2"
      style={{ fontSize: `${fontSizePx}px` }}
    >
      {line('เงื่อนไข:', content.commercialTerms)}
      {line('การชำระเงิน:', content.paymentTerms)}
      {line('การส่งมอบ:', content.deliveryTerms)}
      {line('หมายเหตุเพิ่มเติม:', content.notes)}
      {content.customFooter ? <div className="mt-1 whitespace-pre-line border-t border-slate-200 pt-1">{content.customFooter}</div> : null}
    </div>
  )
}

export default React.memo(PurchaseOrderPresentationFooter)
