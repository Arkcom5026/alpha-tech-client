import React from 'react'

const row = (label, value) => value ? (
  <div className="flex gap-2 leading-tight">
    <span className="shrink-0 font-semibold">{label}</span>
    <span className="whitespace-pre-line">{value}</span>
  </div>
) : null

const CombinedBillingPresentationFooter = ({ content = {}, fontSizePx = 11 }) => {
  if (!content?.commercialTerms && !content?.paymentTerms && !content?.deliveryTerms && !content?.notes && !content?.customFooter) return null
  return (
    <section
      data-testid="combined-billing-presentation-footer"
      className="mt-5 max-h-[34mm] overflow-hidden rounded-lg border border-gray-200 p-3 text-gray-700"
      style={{ fontSize: `${fontSizePx}px` }}
    >
      {row('เงื่อนไข:', content.commercialTerms)}
      {row('การชำระเงิน:', content.paymentTerms)}
      {row('การส่งมอบ:', content.deliveryTerms)}
      {row('หมายเหตุ:', content.notes)}
      {content.customFooter ? <div className="mt-2 whitespace-pre-line border-t border-gray-200 pt-2">{content.customFooter}</div> : null}
    </section>
  )
}

export default React.memo(CombinedBillingPresentationFooter)
