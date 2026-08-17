import React from 'react'

const getHeaderScopeClassName = (style = {}) => [
  'store-document-header-scope',
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

  return (
    <div
      className={getHeaderScopeClassName(headerStyle)}
      style={{ '--store-document-header-note': headerNoteCss }}
    >
      <style>{`
        .store-document-header-scope .print-a4 > div:first-child > div:first-child > div {
          text-align: left;
        }
        .store-document-header-text-center .print-a4 > div:first-child > div:first-child > div {
          text-align: center;
        }
        .store-document-header-text-right .print-a4 > div:first-child > div:first-child > div {
          text-align: right;
        }
        .store-document-header-logo-center .print-a4 > div:first-child > div:first-child {
          flex-direction: column;
          align-items: center;
        }
        .store-document-header-logo-right .print-a4 > div:first-child > div:first-child {
          flex-direction: row-reverse;
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
      `}</style>
      {children}
    </div>
  )
}

export default React.memo(StoreDocumentHeaderScope)
