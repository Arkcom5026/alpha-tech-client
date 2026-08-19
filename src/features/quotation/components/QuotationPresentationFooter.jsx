import React from 'react'

const TextRow = ({ label, value }) => {
  if (!value) return null
  return (
    <div className="quotation-presentation-row whitespace-pre-wrap">
      {label ? <span className="font-semibold">{label}: </span> : null}
      <span>{value}</span>
    </div>
  )
}

const QuotationPresentationFooter = ({
  terms = {},
  paymentAccounts = [],
  paymentDisplay = {},
  fontSizePx = 11,
}) => {
  const hasTerms = Boolean(
    terms.closingNote
    || terms.commercialTerms
    || terms.paymentTerms
    || terms.deliveryTerms
    || terms.notes
    || terms.customFooter,
  )
  const hasAccounts = Array.isArray(paymentAccounts) && paymentAccounts.length > 0

  return (
    <section
      className="quotation-presentation-footer border-x border-b border-slate-500 px-2.5 py-1.5 leading-[1.45]"
      style={{ '--quotation-footer-font-size': `${fontSizePx}px` }}
    >
      <p className="font-semibold">เงื่อนไข / หมายเหตุ</p>
      <div className="mt-0.5 space-y-0.5">
        <TextRow value={terms.closingNote} />
        <TextRow label="เงื่อนไขการเสนอราคา" value={terms.commercialTerms} />
        <TextRow label="เงื่อนไขการชำระเงิน" value={terms.paymentTerms} />
        <TextRow label="เงื่อนไขการจัดส่ง" value={terms.deliveryTerms} />
        <TextRow label="หมายเหตุ" value={terms.notes} />
      </div>

      {hasAccounts ? (
        <div className="quotation-payment-accounts mt-1 border-t border-dashed border-slate-300 pt-1">
          <p className="font-semibold">บัญชีรับโอน</p>
          <div className="mt-0.5 space-y-0.5">
            {paymentAccounts.map((account) => (
              <div key={account.id || account.code || account.accountNumber} className="flex flex-wrap gap-x-1.5">
                {account.displayName ? <span className="font-semibold">{account.displayName}</span> : null}
                {paymentDisplay.showBankName !== false && account.bankName ? <span>{account.bankName}</span> : null}
                {paymentDisplay.showAccountName !== false && account.accountName ? <span>ชื่อบัญชี {account.accountName}</span> : null}
                {paymentDisplay.showAccountNumber !== false && account.accountNumber ? <span>เลขที่ {account.accountNumber}</span> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {terms.customFooter ? (
        <div className="quotation-custom-footer mt-1 border-t border-dashed border-slate-300 pt-1 whitespace-pre-wrap">
          {terms.customFooter}
        </div>
      ) : null}

      {!hasTerms && !hasAccounts ? <p className="mt-0.5">-</p> : null}
    </section>
  )
}

export default QuotationPresentationFooter
