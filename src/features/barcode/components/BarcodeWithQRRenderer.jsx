import React from 'react';
import QRCode from 'react-qr-code';

const BarcodeWithQRRenderer = ({
  barcodeValue,
  qrValue,
  productName,
  showProductName = true,
  layout = 'grid',
  fontSizePx,
  fontScaleX = 1.0,
  barcodeHeight = 20,
}) => {
  if (!barcodeValue && !qrValue) return null;

  const resolvedFontSizePx = Number.isFinite(Number(fontSizePx))
    ? Number(fontSizePx)
    : Math.max(18, Math.round(Number(barcodeHeight) * 2.2));

  const safeScaleX = Math.max(0.6, Math.min(1.8, Number(fontScaleX) || 1.0));
  const nameText = (productName ?? '').toString().trim();
  const shouldShowName = Boolean(showProductName) && nameText.length > 0;

  return (
    <div
      className="inline-flex flex-col items-center justify-center"
      style={{ width: 'fit-content', maxWidth: '100%' }}
      data-layout={layout}
    >
      {shouldShowName ? (
        <div className="barcode-product-name" style={{ width: '100%' }}>
          {nameText}
        </div>
      ) : null}

      {barcodeValue ? (
        <div className="m-0 p-0">
          <div
            className="c39-barcode text-center leading-none"
            style={{
              fontSize: `${resolvedFontSizePx}px`,
              lineHeight: 1,
              transform: `scaleX(${safeScaleX})`,
              transformOrigin: 'center top',
              display: 'inline-block',
              marginTop: '1px',
              letterSpacing: '0px',
              whiteSpace: 'nowrap',
            }}
          >
            *{barcodeValue}*
          </div>
        </div>
      ) : null}

      {qrValue ? (
        <div className="mt-1">
          <QRCode value={qrValue} size={60} />
        </div>
      ) : null}
    </div>
  );
};

export default BarcodeWithQRRenderer;
