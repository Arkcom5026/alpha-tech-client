import React from 'react'

const formatDate = (value) => {
  if (!value) return '-'

  try {
    return new Date(value).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Bangkok',
    })
  } catch {
    return '-'
  }
}

const formatCurrency = (value) =>
  (Number(value) || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const buildCustomerName = (customer) => {
  if (!customer) return '-'
  return customer.companyName || customer.name || '-'
}

const buildLineItems = (allocations = []) => {
  const lines = []

  allocations.forEach((allocation, allocationIndex) => {
    const saleItems = Array.isArray(allocation?.sale?.saleItems)
      ? allocation.sale.saleItems
      : []

    if (saleItems.length) {
      saleItems.forEach((saleItem, saleItemIndex) => {
        const quantity = Number(
          saleItem?.quantity ?? saleItem?.qty ?? saleItem?.count ?? saleItem?.itemQty ?? 1
        )
        const unitPrice = Number(
          saleItem?.unitPriceIncVat ??
            saleItem?.unitPrice ??
            saleItem?.price ??
            saleItem?.sellingPrice ??
            saleItem?.salePrice ??
            0
        )
        const amount = Number(
          saleItem?.amount ??
            saleItem?.totalAmount ??
            saleItem?.total ??
            saleItem?.lineTotal ??
            saleItem?.subtotal ??
            unitPrice * quantity
        )

        lines.push({
          key: `${allocation?.id || allocationIndex}-${saleItem?.id || saleItemIndex}`,
          name:
            saleItem?.productName ||
            saleItem?.name ||
            saleItem?.description ||
            saleItem?.title ||
            saleItem?.itemName ||
            saleItem?.stockItem?.product?.name ||
            saleItem?.product?.name ||
            '-',
          quantity,
          unit:
            saleItem?.unit ||
            saleItem?.unitName ||
            saleItem?.stockItem?.product?.unit?.name ||
            saleItem?.product?.unit?.name ||
            '-',
          amount,
        })
      })
      return
    }

    lines.push({
      key: `${allocation?.id || allocationIndex}-fallback`,
      name: `ชำระตามบิล ${allocation?.sale?.code || allocation?.saleCode || '-'}`,
      quantity: 1,
      unit: 'งวด',
      amount: Number(allocation?.amount || 0),
    })
  })

  return lines
}

const CustomerReceiptShortPrintLayout = ({ receipt }) => {
  const customer = receipt?.customer || null
  const branch = receipt?.branch || null
  const allocations = Array.isArray(receipt?.allocations) ? receipt.allocations : []
  const lineItems = buildLineItems(allocations)
  const total = Number(receipt?.totalAmount || 0)

  return (
    <div className="w-[80mm] max-w-[80mm] bg-white px-3 py-3 text-black">
      <div className="text-center leading-tight">
        <div className="text-[15px] font-black">{branch?.name || branch?.branchName || '-'}</div>
        <div className="mt-1 text-[10px]">{branch?.address || '-'}</div>
        <div className="text-[10px]">โทร {branch?.phone || '-'}</div>
        <div className="text-[10px]">เลขประจำตัวผู้เสียภาษี {branch?.taxId || '-'}</div>
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="text-center">
        <div className="text-[15px] font-black">ใบเสร็จรับเงินลูกหนี้</div>
        <div className="text-[10px]">CUSTOMER RECEIPT</div>
      </div>

      <div className="mt-2 space-y-0.5 text-[11px] leading-snug">
        <div className="flex justify-between gap-2">
          <span>เลขที่</span>
          <span className="font-bold">{receipt?.code || '-'}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>วันที่</span>
          <span>{formatDate(receipt?.receivedAt)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>ลูกค้า</span>
          <span className="max-w-[52mm] text-right font-bold">{buildCustomerName(customer)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>วิธีรับชำระ</span>
          <span>{receipt?.paymentMethod || '-'}</span>
        </div>
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="space-y-1.5 text-[11px]">
        {lineItems.map((item, index) => (
          <div key={item.key || index} className="break-inside-avoid">
            <div className="font-bold leading-snug">
              {index + 1}. {item.name}
            </div>
            <div className="flex justify-between gap-2 pl-3 text-[10px]">
              <span>
                {item.quantity} {item.unit}
              </span>
              <span>{formatCurrency(item.amount)} บาท</span>
            </div>
          </div>
        ))}
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="flex items-end justify-between gap-3">
        <span className="text-[12px] font-black">รวมสุทธิ</span>
        <span className="text-[17px] font-black">{formatCurrency(total)} บาท</span>
      </div>

      <div className="mt-6 text-center text-[10px] leading-snug">
        <div className="mx-auto w-[52mm] border-t border-dashed border-black pt-1">
          เจ้าหน้าที่ผู้รับชำระเงิน
        </div>
        <div className="mt-3">ขอบคุณที่ใช้บริการ</div>
      </div>
    </div>
  )
}

export default React.memo(CustomerReceiptShortPrintLayout)
