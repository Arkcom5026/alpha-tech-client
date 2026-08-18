import React from 'react'

const clampLogoSize = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 56
  return Math.min(180, Math.max(24, Math.round(parsed)))
}

const getHeaderScopeClassName = (style = {}) => [
  'store-document-header-scope',
  style.showLogo !== false && style.logoUrl ? 'store-document-header-has-logo' : '',
  `store-document-header-logo-${style.logoPosition || 'left'}`,
  `store-document-header-text-${style.textAlign || 'left'}`,
  `store-document-header-name-${style.storeNameSize || 'md'}`,
  style.showAddress === false ? 'store-document-header-hide-address' : '',
  style.showPhone === false ? 'store-document-header-hide-phone' : '',
  style.showTaxId === false ? 'store-document-header-hide-tax-id' : '',
].filter(Boolean).join(' ')

const StoreDocumentHeaderScope = ({ config, children }) => {
  const headerStyle = config?.headerStyle || {}
  const headerNote = String(headerStyle?.headerNote || '').trim()
  const headerNoteCss = JSON.stringify(headerNote)
  const logoSize = clampLogoSize(headerStyle?.logoSize)
  const logoImage = headerStyle?.showLogo !== false && headerStyle?.logoUrl
    ? `url(${JSON.stringify(String(headerStyle.logoUrl))})`
    : 'none'

  return (
    <div
      className={getHeaderScopeClassName(headerStyle)}
      style={{
        '--store-document-header-note': headerNoteCss,
        '--store-document-header-logo-size': `${logoSize}px`,
        '--store-document-header-logo-image': logoImage,
      }}
    >
      <style>{`
        .store-document-header-scope .print-a4 > div:first-child > div:first-child { align-items: center; }
        .store-document-header-scope .print-a4 > div:first-child > div:first-child > div { text-align: left; }
        .store-document-header-text-center .print-a4 > div:first-child > div:first-child > div { text-align: center; }
        .store-document-header-text-right .print-a4 > div:first-child > div:first-child > div { text-align: right; }
        .store-document-header-logo-center .print-a4 > div:first-child > div:first-child { flex-direction: column; align-items: center; }
        .store-document-header-logo-right .print-a4 > div:first-child > div:first-child { flex-direction: row-reverse; }
        .store-document-header-scope .print-a4 > div:first-child > div:first-child > img {
          width: var(--store-document-header-logo-size) !important;
          height: var(--store-document-header-logo-size) !important;
          max-width: var(--store-document-header-logo-size) !important;
          max-height: var(--store-document-header-logo-size) !important;
          object-fit: contain;
        }
        .store-document-header-name-sm .print-a4 > div:first-child h2 { font-size: 13px !important; }
        .store-document-header-name-md .print-a4 > div:first-child h2 { font-size: 16px !important; }
        .store-document-header-name-lg .print-a4 > div:first-child h2 { font-size: 20px !important; }
        .store-document-header-name-xl .print-a4 > div:first-child h2 { font-size: 24px !important; }
        .store-document-header-hide-address .print-a4 > div:first-child > div:first-child > div > p:nth-of-type(1) { display: none; }
        .store-document-header-hide-phone .print-a4 > div:first-child > div:first-child > div > p:nth-of-type(2) { display: none; }
        .store-document-header-hide-tax-id .print-a4 > div:first-child > div:first-child > div > p:nth-of-type(3) { display: none; }
        .store-document-header-scope .print-a4 > div:first-child > div:first-child > div::after {
          content: var(--store-document-header-note);
          display: ${headerNote ? 'block' : 'none'};
          margin-top: 2px;
          white-space: pre-wrap;
        }

        /* Delivery Note A4 adapter. */
        .store-document-header-scope .dn-print-page > div:first-child > div:first-child { box-sizing: border-box; position: relative; text-align: left; }
        .store-document-header-has-logo .dn-print-page > div:first-child > div:first-child::before {
          content: ''; position: absolute; top: 0;
          width: var(--store-document-header-logo-size); height: var(--store-document-header-logo-size);
          background-image: var(--store-document-header-logo-image); background-position: center; background-repeat: no-repeat; background-size: contain;
        }
        .store-document-header-has-logo.store-document-header-logo-left .dn-print-page > div:first-child > div:first-child {
          display: flex; flex-direction: column; justify-content: center;
          min-height: var(--store-document-header-logo-size);
          padding-left: calc(var(--store-document-header-logo-size) + 10px);
        }
        .store-document-header-has-logo.store-document-header-logo-left .dn-print-page > div:first-child > div:first-child::before { left: 0; top: 50%; transform: translateY(-50%); }
        .store-document-header-has-logo.store-document-header-logo-right .dn-print-page > div:first-child > div:first-child {
          display: flex; flex-direction: column; justify-content: center;
          min-height: var(--store-document-header-logo-size);
          padding-right: calc(var(--store-document-header-logo-size) + 10px);
        }
        .store-document-header-has-logo.store-document-header-logo-right .dn-print-page > div:first-child > div:first-child::before { right: 0; top: 50%; transform: translateY(-50%); }
        .store-document-header-has-logo.store-document-header-logo-center .dn-print-page > div:first-child > div:first-child { padding-top: calc(var(--store-document-header-logo-size) + 6px); }
        .store-document-header-has-logo.store-document-header-logo-center .dn-print-page > div:first-child > div:first-child::before { left: 50%; transform: translateX(-50%); }
        .store-document-header-text-center .dn-print-page > div:first-child > div:first-child { text-align: center; }
        .store-document-header-text-right .dn-print-page > div:first-child > div:first-child { text-align: right; }
        .store-document-header-name-sm .dn-print-page > div:first-child h2 { font-size: 13px !important; }
        .store-document-header-name-md .dn-print-page > div:first-child h2 { font-size: 16px !important; }
        .store-document-header-name-lg .dn-print-page > div:first-child h2 { font-size: 20px !important; }
        .store-document-header-name-xl .dn-print-page > div:first-child h2 { font-size: 24px !important; }
        .store-document-header-hide-address .dn-print-page > div:first-child > div:first-child > p:nth-of-type(1) { display: none; }
        .store-document-header-hide-phone .dn-print-page > div:first-child > div:first-child > p:nth-of-type(2) { display: none; }
        .store-document-header-hide-tax-id .dn-print-page > div:first-child > div:first-child > p:nth-of-type(3) { display: none; }
        .store-document-header-scope .dn-print-page > div:first-child > div:first-child::after {
          content: var(--store-document-header-note); display: ${headerNote ? 'block' : 'none'}; margin-top: 2px; white-space: pre-wrap;
        }

        /* Credit collection A4 adapter. Thermal modes never receive this class/scope. */
        .store-document-header-scope .credit-collection-a4 .credit-collection-store-header { text-align: left; align-items: center; }
        .store-document-header-scope .credit-collection-a4 .credit-collection-store-logo {
          width: var(--store-document-header-logo-size) !important;
          height: var(--store-document-header-logo-size) !important;
          max-width: var(--store-document-header-logo-size) !important;
          max-height: var(--store-document-header-logo-size) !important;
          object-fit: contain;
        }
        .store-document-header-logo-center .credit-collection-a4 .credit-collection-store-header { flex-direction: column; align-items: center; }
        .store-document-header-logo-right .credit-collection-a4 .credit-collection-store-header { flex-direction: row-reverse; }
        .store-document-header-text-center .credit-collection-a4 .credit-collection-store-copy { text-align: center; }
        .store-document-header-text-right .credit-collection-a4 .credit-collection-store-copy { text-align: right; }
        .store-document-header-name-sm .credit-collection-a4 .credit-collection-store-name { font-size: 13px !important; }
        .store-document-header-name-md .credit-collection-a4 .credit-collection-store-name { font-size: 16px !important; }
        .store-document-header-name-lg .credit-collection-a4 .credit-collection-store-name { font-size: 20px !important; }
        .store-document-header-name-xl .credit-collection-a4 .credit-collection-store-name { font-size: 24px !important; }
        .store-document-header-hide-address .credit-collection-a4 .credit-collection-store-address { display: none; }
        .store-document-header-hide-phone .credit-collection-a4 .credit-collection-store-phone { display: none; }
        .store-document-header-hide-tax-id .credit-collection-a4 .credit-collection-store-tax { display: none; }
        .store-document-header-scope .credit-collection-a4 .credit-collection-store-copy::after {
          content: var(--store-document-header-note);
          display: ${headerNote ? 'block' : 'none'};
          margin-top: 2px;
          white-space: pre-wrap;
        }
      `}</style>
      {children}
      <style>{`
        /* Full Tax / Customer Receipt A4 shell normalization.
           This style is intentionally rendered after the document so it wins over
           legacy page-shell rules without changing the pagination implementation. */
        @media print {
          @page { size: A4; margin: 0; }
          .store-document-header-scope .print-a4 {
            box-sizing: border-box !important;
            width: 210mm !important;
            min-height: 297mm !important;
            height: auto !important;
            padding: 6mm !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  )
}

export default React.memo(StoreDocumentHeaderScope)
